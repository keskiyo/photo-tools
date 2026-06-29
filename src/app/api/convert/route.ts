import sharp from "sharp";

import { createGeneratedFileName, saveGeneratedFile } from "@/lib/files";
import {
  isSupportedImage,
  jsonError,
  parseOptionalInt,
  parseQuality,
} from "@/lib/image-validation";
import { createProcessedImage } from "@/lib/processed-images";
import { rateLimiter, resolveRateKey } from "@/lib/rate-limit";
import { requestLimits, requestLimitWindowMs } from "@/setting/settings";

const OUTPUT_FORMATS = ["jpeg", "png", "webp"] as const;
type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export async function POST(request: Request) {
  try {
    const rateKey = resolveRateKey("convert", request.headers);
    const gate = rateLimiter.peek(
      rateKey,
      requestLimits.resize,
      requestLimitWindowMs,
    );
    if (!gate.ok) {
      return jsonError("Too many requests. Please try again later.", 429);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || !isSupportedImage(file)) {
      return jsonError("Upload a PNG, JPEG, or WebP image under 10MB.");
    }

    const formatValue = formData.get("format");
    const format: OutputFormat = OUTPUT_FORMATS.includes(formatValue as OutputFormat)
      ? (formatValue as OutputFormat)
      : "webp";
    const width = parseOptionalInt(formData.get("width"));
    const height = parseOptionalInt(formData.get("height"));
    const quality = parseQuality(formData.get("quality"));
    const preserveAspectRatio = formData.get("preserveAspectRatio") !== "false";

    const input = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(input).rotate();
    if (width || height) {
      pipeline = pipeline.resize({
        width,
        height,
        fit: preserveAspectRatio ? "inside" : "fill",
        withoutEnlargement: true,
      });
    }

    const output =
      format === "jpeg"
        ? await pipeline.jpeg({ quality }).toBuffer()
        : format === "png"
          ? await pipeline.png({ quality }).toBuffer()
          : await pipeline.webp({ quality }).toBuffer();

    const resultFileName = createGeneratedFileName("convert", format === "jpeg" ? "jpg" : format);
    const resultUrl = await saveGeneratedFile(resultFileName, output);
    rateLimiter.record(rateKey, requestLimitWindowMs);

    await createProcessedImage({
      type: "convert",
      fileName: file.name,
      resultUrl,
    });

    return Response.json({ resultUrl });
  } catch (error) {
    console.error("Convert route failed", error);
    return jsonError("Could not convert image.", 500);
  }
}
