/**
 * API Route: Single session operations
 * PATCH /api/summers/[summerId]/sessions/[sessionId] - Update session
 * DELETE /api/summers/[summerId]/sessions/[sessionId] - Delete session
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { SessionStatus } from "@/types/summer";

function getSessionsDir(summerId: string): string {
  const parts = summerId.split("-");
  const year = parts[1] || "2026";
  return path.join(process.cwd(), "data", year, "summer", "sessions");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string; sessionId: string }> }
) {
  try {
    const { summerId, sessionId } = await params;
    const body = await request.json();
    
    const sessionsDir = getSessionsDir(summerId);
    const filePath = path.join(sessionsDir, `${sessionId}.md`);
    
    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    
    const { data, content: markdownBody } = matter(fileContent);
    const today = new Date().toISOString().split("T")[0];
    
    // Update allowed fields
    if (body.status !== undefined) {
      data.status = body.status as SessionStatus;
    }
    if (body.signupTaskComplete !== undefined) {
      data.signupTaskComplete = body.signupTaskComplete;
    }
    if (body.startDate !== undefined) {
      data.startDate = body.startDate;
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate;
    }
    if (body.backupSessionId !== undefined) {
      data.backupSessionId = body.backupSessionId;
    }
    
    data.updatedAt = today;
    
    // Rebuild file content
    const updatedContent = `---
id: ${data.id}
campId: ${data.campId}
summerId: ${data.summerId}
startDate: ${data.startDate}
endDate: ${data.endDate}
status: ${data.status}
${data.backupSessionId ? `backupSessionId: ${data.backupSessionId}\n` : ""}signupTaskComplete: ${data.signupTaskComplete}
createdAt: ${data.createdAt}
updatedAt: ${data.updatedAt}
---
${markdownBody}`;

    await fs.writeFile(filePath, updatedContent, "utf-8");
    
    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    console.error("[API] Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string; sessionId: string }> }
) {
  try {
    const { summerId, sessionId } = await params;
    const sessionsDir = getSessionsDir(summerId);
    const filePath = path.join(sessionsDir, `${sessionId}.md`);
    
    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("[API] Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
