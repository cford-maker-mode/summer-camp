/**
 * API Route: Camp by ID operations
 * PATCH /api/camps/:id - Update camp fields
 * DELETE /api/camps/:id - Delete a camp
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { ScrapedCampData } from "@/types/camp";

interface PatchCampResponse {
  success: boolean;
  error?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PatchCampResponse>> {
  try {
    const { id } = await params;
    const body: Partial<ScrapedCampData> = await request.json();
    console.log('[PATCH] Incoming body:', JSON.stringify(body));

    // Find the camp file
    const campsDir = path.join(process.cwd(), "data", "2026", "camps");
    const files = await fs.readdir(campsDir);
    const campFile = files.find(f => f === `${id}.md`);

    if (!campFile) {
      return NextResponse.json(
        { success: false, error: "Camp not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(campsDir, campFile);
    const content = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter, content: markdownContent } = matter(content);

    // Update fields from body, allowing clearing by setting to null
    if ('name' in body) frontmatter.name = body.name ?? null;
    if ('location' in body) frontmatter.location = body.location ?? null;
    if ('address' in body) frontmatter.address = body.address ?? null;
    if ('cost' in body) frontmatter.cost = body.cost ?? null;
    if ('costMax' in body) frontmatter.costMax = body.costMax ?? null;
    if ('costPer' in body) frontmatter.costPer = body.costPer ?? "week";
    if ('url' in body) frontmatter.url = body.url ?? null;
    if ('ageMin' in body) frontmatter.ageMin = body.ageMin ?? null;
    if ('ageMax' in body) frontmatter.ageMax = body.ageMax ?? null;
    if ('gradeMin' in body) frontmatter.gradeMin = body.gradeMin ?? null;
    if ('gradeMax' in body) frontmatter.gradeMax = body.gradeMax ?? null;
    if ('signupDate' in body) frontmatter.signupDate = body.signupDate ?? null;
    if ('overnight' in body) frontmatter.overnight = body.overnight ?? null;
    if ('dailyStartTime' in body) frontmatter.dailyStartTime = body.dailyStartTime ?? null;
    if ('dailyEndTime' in body) frontmatter.dailyEndTime = body.dailyEndTime ?? null;
    if ('benefits' in body) frontmatter.benefits = body.benefits ?? [];

    // Update timestamp
    frontmatter.updatedAt = new Date().toISOString().split("T")[0];

    // Reconstruct the file
    const newContent = matter.stringify(markdownContent, frontmatter);
    await fs.writeFile(filePath, newContent, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Patch camp error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update camp" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PatchCampResponse>> {
  try {
    const { id } = await params;

    // Find the camp file
    const campsDir = path.join(process.cwd(), "data", "2026", "camps");
    const files = await fs.readdir(campsDir);
    const campFile = files.find(f => f === `${id}.md`);

    if (!campFile) {
      return NextResponse.json(
        { success: false, error: "Camp not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(campsDir, campFile);
    await fs.unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Delete camp error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete camp" },
      { status: 500 }
    );
  }
}
