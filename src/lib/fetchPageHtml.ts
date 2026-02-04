/**
 * Fetches HTML content from a URL (basic server-side fetch, no JS rendering)
 */
import fetch from "node-fetch";

export async function fetchPageHtml(url: string): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SummerCampBot/1.0)"
      },
      timeout: 15000
    });
    if (!res.ok) {
      return { success: false, error: `HTTP error: ${res.status}` };
    }
    const html = await res.text();
    return { success: true, html };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
