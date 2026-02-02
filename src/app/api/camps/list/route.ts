/**
 * API Route: List all camps
 * GET /api/camps
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { Camp } from "@/types/camp";

export async function GET() {
  try {
    const campsDir = path.join(process.cwd(), "data", "2026", "camps");
    
    // Check if directory exists
    try {
      await fs.access(campsDir);
    } catch {
      return NextResponse.json({ camps: [] });
    }

    const files = await fs.readdir(campsDir);
    const campFiles = files.filter((f) => f.startsWith("camp-") && f.endsWith(".md"));

    const camps: Camp[] = [];

    for (const file of campFiles) {
      const filePath = path.join(campsDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const { data } = matter(content);
      
      // Helper to convert Date objects back to YYYY-MM-DD strings
      const toDateString = (val: unknown): string | undefined => {
        if (!val) return undefined;
        if (val instanceof Date) return val.toISOString().split("T")[0];
        if (typeof val === "string") return val;
        return undefined;
      };

      camps.push({
        id: data.id || file.replace(".md", ""),
        name: data.name || "Unknown Camp",
        location: data.location,
        address: data.address,
        cost: data.cost,
        costMax: data.costMax,
        costPer: data.costPer,
        url: data.url,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        gradeMin: data.gradeMin,
        gradeMax: data.gradeMax,
        signupDate: toDateString(data.signupDate),
        overnight: data.overnight,
        dailyStartTime: data.dailyStartTime,
        dailyEndTime: data.dailyEndTime,
        benefits: data.benefits || [],
        createdAt: toDateString(data.createdAt) || "",
        updatedAt: toDateString(data.updatedAt) || "",
      });
    }

    // Sort by name
    camps.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ camps });
  } catch (error) {
    console.error("[API] Error listing camps:", error);
    return NextResponse.json(
      { error: "Failed to load camps" },
      { status: 500 }
    );
  }
}
