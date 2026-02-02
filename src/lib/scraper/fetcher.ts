/**
 * URL Fetcher - Fetches HTML content from camp websites
 */

export interface FetchResult {
  success: boolean;
  html?: string;
  error?: string;
  statusCode?: number;
  blocked?: boolean; // True if site appears to be blocking automated requests
}

/**
 * Detect if HTML content looks like a bot protection page
 */
function detectBotProtection(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  const protectionPatterns = [
    "cloudflare",
    "captcha",
    "please verify you are human",
    "access denied",
    "bot detection",
    "ddos protection",
    "checking your browser",
    "please enable javascript",
    "ray id", // Cloudflare
    "attention required",
    "just a moment", // Cloudflare waiting page
    "security check",
  ];
  return protectionPatterns.some(pattern => lowerHtml.includes(pattern));
}

/**
 * Get user-friendly error message for blocked requests
 */
function getBlockedMessage(statusCode?: number, html?: string): string {
  if (statusCode === 403) {
    return "This site blocks automated fetching. Try entering the camp details manually.";
  }
  if (statusCode === 401) {
    return "This page requires login. Try entering the camp details manually.";
  }
  if (statusCode === 429) {
    return "Too many requests to this site. Please wait a moment and try again.";
  }
  if (html && detectBotProtection(html)) {
    return "This site has bot protection that prevents fetching. Try entering the camp details manually.";
  }
  return "This site does not allow automated fetching. Try entering the camp details manually.";
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

    // Check for blocking status codes
    if (response.status === 403 || response.status === 401 || response.status === 429) {
      return {
        success: false,
        error: getBlockedMessage(response.status),
        statusCode: response.status,
        blocked: true,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      };
    }

    const html = await response.text();

    // Check for bot protection pages even on 200 responses
    if (html && detectBotProtection(html)) {
      return {
        success: false,
        error: getBlockedMessage(response.status, html),
        statusCode: response.status,
        blocked: true,
      };
    }

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
    // Connection refused often means the site is blocking
    if (error instanceof TypeError) {
      const message = error.message.toLowerCase();
      if (message.includes("fetch failed") || message.includes("econnrefused")) {
        return {
          success: false,
          error: "Unable to connect to this site. It may be blocking automated requests or temporarily unavailable.",
          blocked: true,
        };
      }
      if (message.includes("fetch")) {
        return {
          success: false,
          error: "Network error - unable to reach the website",
        };
      }
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return {
        success: false,
        error: "Request timed out - website took too long to respond",
      };
    }
    // SSL/TLS errors can indicate blocking
    if (error instanceof Error && (error.message.includes("SSL") || error.message.includes("certificate"))) {
      return {
        success: false,
        error: "SSL connection failed. The site may have security restrictions.",
        blocked: true,
      };
    }
    return {
      success: false,
      error: `Failed to fetch: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
