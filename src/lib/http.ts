// Fetch with a timeout and automatic retries on abort, since upstream
// Project Gutenberg services are sometimes slow and time out intermittently.
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && error instanceof Error && error.name === 'AbortError') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1, timeout);
    }
    throw error;
  }
}

export const GUTENBERG_USER_AGENT =
  'Mozilla/5.0 (compatible; NovelAI/1.0; +https://github.com/your-repo)';

// Gutendex sits behind Cloudflare's baseline bot protection, which scores
// requests missing standard browser headers (Accept, Accept-Language) or
// carrying a self-declared bot User-Agent as suspicious - especially from
// datacenter/serverless IPs. A real browser header set avoids that.
export const BROWSER_REQUEST_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};
