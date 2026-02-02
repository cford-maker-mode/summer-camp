/**
 * API Route: Save Camp to Data File
 * POST /api/camps
 *
 * Body: ScrapedCampData
 * Response: { success: boolean, path?: string, error?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateCampMarkdown, getCampFilePath } from "@/lib/markdown";
import type { ScrapedCampData } from "@/types/camp";

interface SaveCampRequest extends ScrapedCampData {
  year?: number;
}

interface SaveCampResponse {
  success: boolean;
  path?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SaveCampResponse>> {
  try {
    const body: SaveCampRequest = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Camp name is required" },
        { status: 400 }
      );
    }

    // Generate markdown content
    const markdown = generateCampMarkdown(body, body.sessions);
    const relativePath = getCampFilePath(body.name, body.year || 2026);

    // Get absolute path from project root
    const projectRoot = process.cwd();
    const absolutePath = path.join(projectRoot, relativePath);

    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });

    // Check if file already exists
    try {
      await fs.access(absolutePath);
      return NextResponse.json(
        {
          success: false,
          error: `Camp file already exists: ${relativePath}`,
        },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, we can create it
    }

    // Write file
    await fs.writeFile(absolutePath, markdown, "utf-8");

    return NextResponse.json({
      success: true,
      path: relativePath,
    });
  } catch (error) {
    console.error("[API] Save camp error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save camp file",
      },
      { status: 500 }
    );
  }
}
