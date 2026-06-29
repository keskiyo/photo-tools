import sharp from "sharp";

import { createGeneratedFileName, saveGeneratedFile } from "@/lib/files";
import { isSupportedImage, jsonError } from "@/lib/image-validation";
import { removeBackgroundWithPhotoRoom } from "@/lib/photoroom";
import { createProcessedImage } from "@/lib/processed-images";
import { rateLimiter, resolveRateKey } from "@/lib/rate-limit";
import { requestLimits, requestLimitWindowMs } from "@/setting/settings";

export async function POST(request: Request) {
  try {
    const rateKey = resolveRateKey("bg-remove", request.headers);
    const gate = rateLimiter.peek(
      rateKey,
      requestLimits.backgroundRemoval,
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

    const input = Buffer.from(await file.arrayBuffer());

    // Prefer PhotoRoom (real, high-quality removal). Falls back to the local
    // sharp pipeline when no API key is set or the call fails.
    const output =
      (await removeBackgroundWithPhotoRoom(file)) ??
      (await removeBackgroundLocally(input));

    const resultFileName = createGeneratedFileName("bg_remove", "png");
    const resultUrl = await saveGeneratedFile(resultFileName, output);
    rateLimiter.record(rateKey, requestLimitWindowMs);

    await createProcessedImage({
      type: "bg_remove",
      fileName: file.name,
      resultUrl,
    });

    return Response.json({ resultUrl });
  } catch (error) {
    console.error("Background remover route failed", error);
    return jsonError("Could not process background removal.", 500);
  }
}

/**
 * Local fallback when PhotoRoom is unavailable. Does not truly segment the
 * subject — it just normalizes the image onto a transparent canvas.
 */
async function removeBackgroundLocally(input: Buffer): Promise<Buffer> {
  const metadata = await sharp(input).metadata();
  const width = Math.min(metadata.width ?? 1200, 1600);
  const height = Math.min(metadata.height ?? 900, 1600);

  const normalized = await sharp(input)
    .rotate()
    .resize({ width, height, fit: "inside" })
    .ensureAlpha()
    .png()
    .toBuffer();

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: normalized, gravity: "center" }])
    .png()
    .toBuffer();
}
