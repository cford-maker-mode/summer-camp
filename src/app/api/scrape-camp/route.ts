/**
 * API Route: Scrape Camp from URL
 * POST /api/scrape-camp
 *
 * Body: { url: string, deep?: boolean }
 * Response: { success: boolean, data?: ScrapedCampData, error?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { scrapeCampUrl, scrapeCampSite } from "@/lib/scraper";
import type { ScrapeRequest, ScrapeResponse } from "@/types/camp";

interface ExtendedScrapeRequest extends ScrapeRequest {
  deep?: boolean;
}

export async function POST(request: NextRequest): Promise<NextResponse<ScrapeResponse>> {
  try {
    // Parse request body
    const body: ExtendedScrapeRequest = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Perform scraping (deep or single page)
    const result = body.deep
      ? await scrapeCampSite(body.url, { maxPages: 6, minScore: 2 })
      : await scrapeCampUrl(body.url);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    // Check if extraction yielded useful data
    const data = result.data;
    const hasContent = data && (data.name || data.location || data.cost);
    
    if (!hasContent) {
      console.warn("[API] Low confidence extraction - site may use JavaScript rendering");
      return NextResponse.json({
        success: true,
        data: data,
        warning: "Limited data extracted. This site may use JavaScript to load content. Try a different URL or enter details manually.",
        confidence: result.extractionConfidence,
      });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.extractionConfidence,
    });
  } catch (error) {
    console.error("[API] Scrape error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during scraping",
      },
      { status: 500 }
    );
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
