const PHOTOROOM_ENDPOINT = "https://sdk.photoroom.com/v1/segment";
const PHOTOROOM_TIMEOUT_MS = 30_000;

/**
 * Removes the background via the PhotoRoom API. Returns a PNG buffer with a
 * transparent background, or null when the API key is missing or the call
 * fails — so callers can fall back to local processing without throwing.
 */
export async function removeBackgroundWithPhotoRoom(
  file: Blob,
): Promise<Buffer | null> {
  const apiKey = process.env.PHOTOROOM_REMOVE_BG_API;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHOTOROOM_TIMEOUT_MS);

  try {
    const form = new FormData();
    form.append("image_file", file, "upload");
    form.append("format", "png");

    const response = await fetch(PHOTOROOM_ENDPOINT, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("PhotoRoom remove-bg failed", { status: response.status });
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("PhotoRoom remove-bg error", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
