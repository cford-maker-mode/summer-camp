/**
 * API Route: List all summers and get/create events/sessions
 * GET /api/summers - List all summer plans
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Summer } from "@/types/summer";

// Helper to convert Date objects to YYYY-MM-DD strings
function toDateString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "string") return val;
  return undefined;
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data", "2026");
    
    try {
      await fs.access(dataDir);
    } catch {
      return NextResponse.json({ summers: [] });
    }

    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    const summerDirs = entries.filter(
      (e) => e.isDirectory() && e.name.startsWith("summer-")
    );

    const summers: Summer[] = [];

    for (const dir of summerDirs) {
      const summerPath = path.join(dataDir, dir.name, "summer.md");
      try {
        const content = await fs.readFile(summerPath, "utf-8");
        const { data, content: body } = matter(content);
        
        summers.push({
          id: data.id || dir.name,
          year: data.year || 2026,
          childId: data.childId || dir.name.replace("summer-", ""),
          childName: data.childName || "Unknown",
          childBirthDate: toDateString(data.childBirthDate),
          notes: body.trim() || undefined,
          createdAt: toDateString(data.createdAt) || "",
        });
      } catch {
        // Skip directories without summer.md
        continue;
      }
    }

    return NextResponse.json({ summers });
  } catch (error) {
    console.error("[API] Error listing summers:", error);
    return NextResponse.json(
      { error: "Failed to load summers" },
      { status: 500 }
    );
  }
}
