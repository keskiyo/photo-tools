const PHOTOROOM_ENDPOINT = "https://sdk.photoroom.com/v1/segment";
const PHOTOROOM_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

// Transient network failures worth retrying. The most common one here is a
// reset of a pooled keep-alive TLS socket that the remote (Cloudflare) already
// closed — the request never reaches the server, so a fresh retry is safe.
const TRANSIENT_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
]);

function isTransientNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = (error as { cause?: { code?: string } }).cause;
  if (cause?.code && TRANSIENT_CODES.has(cause.code)) return true;
  return error.message === "fetch failed";
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Removes the background via the PhotoRoom API. Returns a PNG buffer with a
 * transparent background, or null when the API key is missing or the call
 * fails — so callers can fall back to local processing without throwing.
 *
 * Transient network errors are retried on a fresh connection; HTTP-level
 * errors are treated as final and return null.
 */
export async function removeBackgroundWithPhotoRoom(
  file: Blob,
): Promise<Buffer | null> {
  const apiKey = process.env.PHOTOROOM_REMOVE_BG_API;
  if (!apiKey) return null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
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
      const transient = isTransientNetworkError(error);
      console.error("PhotoRoom remove-bg error", {
        attempt,
        transient,
        message: error instanceof Error ? error.message : "unknown error",
      });
      if (!transient || attempt === MAX_ATTEMPTS) return null;
      await delay(300 * attempt);
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}
