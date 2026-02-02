/**
 * API Route: List and create sessions for a summer
 * GET /api/summers/[summerId]/sessions - List sessions
 * POST /api/summers/[summerId]/sessions - Create session
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { ScheduledSession, SessionStatus } from "@/types/summer";

// Helper to convert Date objects to YYYY-MM-DD strings
function toDateString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "string") return val;
  return undefined;
}

function getSessionsDir(summerId: string): string {
  const parts = summerId.split("-");
  const year = parts[1] || "2026";
  const childId = parts.slice(2).join("-");
  return path.join(process.cwd(), "data", year, `summer-${childId}`, "sessions");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string }> }
) {
  try {
    const { summerId } = await params;
    const sessionsDir = getSessionsDir(summerId);
    
    try {
      await fs.access(sessionsDir);
    } catch {
      return NextResponse.json({ sessions: [] });
    }

    const files = await fs.readdir(sessionsDir);
    const sessionFiles = files.filter((f) => f.startsWith("session-") && f.endsWith(".md"));

    const sessions: ScheduledSession[] = [];

    for (const file of sessionFiles) {
      const filePath = path.join(sessionsDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const { data, content: body } = matter(content);
      
      sessions.push({
        id: data.id || file.replace(".md", ""),
        campId: data.campId || "",
        summerId: data.summerId || summerId,
        startDate: toDateString(data.startDate) || "",
        endDate: toDateString(data.endDate) || "",
        status: (data.status as SessionStatus) || "planned",
        backupSessionId: data.backupSessionId,
        signupTaskComplete: data.signupTaskComplete === true,
        notes: body.trim() || undefined,
        createdAt: toDateString(data.createdAt) || "",
        updatedAt: toDateString(data.updatedAt) || "",
      });
    }

    // Sort by start date
    sessions.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[API] Error listing sessions:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

async function getNextSessionId(sessionsDir: string): Promise<string> {
  try {
    await fs.access(sessionsDir);
    const files = await fs.readdir(sessionsDir);
    const sessionFiles = files.filter((f) => f.startsWith("session-") && f.endsWith(".md"));
    
    let maxNum = 0;
    for (const file of sessionFiles) {
      const match = file.match(/session-(\d+)\.md/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    
    return `session-${String(maxNum + 1).padStart(3, "0")}`;
  } catch {
    return "session-001";
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string }> }
) {
  try {
    const { summerId } = await params;
    const body = await request.json();
    
    const { campId, startDate, endDate, status, notes } = body;
    
    if (!campId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "campId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const sessionsDir = getSessionsDir(summerId);
    
    // Ensure directory exists
    await fs.mkdir(sessionsDir, { recursive: true });
    
    const sessionId = await getNextSessionId(sessionsDir);
    const today = new Date().toISOString().split("T")[0];
    
    const frontmatter = {
      id: sessionId,
      campId,
      summerId,
      startDate,
      endDate,
      status: status || "planned",
      signupTaskComplete: false,
      createdAt: today,
      updatedAt: today,
    };
    
    const content = `---
id: ${frontmatter.id}
campId: ${frontmatter.campId}
summerId: ${frontmatter.summerId}
startDate: ${frontmatter.startDate}
endDate: ${frontmatter.endDate}
status: ${frontmatter.status}
signupTaskComplete: ${frontmatter.signupTaskComplete}
createdAt: ${frontmatter.createdAt}
updatedAt: ${frontmatter.updatedAt}
---

## Notes

${notes || ""}
`;

    const filePath = path.join(sessionsDir, `${sessionId}.md`);
    await fs.writeFile(filePath, content, "utf-8");
    
    const session: ScheduledSession = {
      ...frontmatter,
      notes,
    };

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[API] Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
