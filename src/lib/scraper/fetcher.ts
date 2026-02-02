/**
 * URL Fetcher - Fetches HTML content from camp websites
 */

export interface FetchResult {
  success: boolean;
  html?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Fetch HTML content from a URL with appropriate headers
 */
export async function fetchUrl(url: string): Promise<FetchResult> {
  try {
    // Validate URL format
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: "Invalid URL protocol. Must be http or https.",
      };
    }

    // Fetch with browser-like headers to avoid bot detection
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      };
    }

    const html = await response.text();

    if (!html || html.length < 100) {
      return {
        success: false,
        error: "Page returned empty or minimal content",
      };
    }

    return {
      success: true,
      html,
      statusCode: response.status,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        error: "Network error - unable to reach the website",
      };
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        success: false,
        error: "Request timed out - website took too long to respond",
      };
    }
    return {
      success: false,
      error: `Failed to fetch: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
