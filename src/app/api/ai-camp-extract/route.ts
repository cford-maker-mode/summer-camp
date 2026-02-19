/**
 * API Route: AI-Powered Camp Extraction (Claude)
 * POST /api/ai-camp-extract
 *
 * Body: { url: string }
 * Response: { success: boolean, data?: ScrapedCampData, error?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { extractCampWithClaude } from "@/lib/aiCampExtractor";
import type { ScrapedCampData } from "@/public-catalog/types";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }
    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format" }, { status: 400 });
    }
    // Call Claude-based extractor
    const result = await extractCampWithClaude(url);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error during AI extraction" }, { status: 500 });
  }
}
