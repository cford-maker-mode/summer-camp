/**
 * API Route: List and create events for a summer
 * GET /api/summers/[summerId]/events - List events
 * POST /api/summers/[summerId]/events - Create event
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import slugify from "slugify";
import type { FamilyEvent, EventType } from "@/types/summer";

// Helper to convert Date objects to YYYY-MM-DD strings
function toDateString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "string") return val;
  return undefined;
}

function getEventsDir(summerId: string): string {
  // summerId format: summer-2026-emma -> folder: summer-emma
  const parts = summerId.split("-");
  const year = parts[1] || "2026";
  const childId = parts.slice(2).join("-");
  return path.join(process.cwd(), "data", year, `summer-${childId}`, "events");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string }> }
) {
  try {
    const { summerId } = await params;
    const eventsDir = getEventsDir(summerId);
    
    try {
      await fs.access(eventsDir);
    } catch {
      return NextResponse.json({ events: [] });
    }

    const files = await fs.readdir(eventsDir);
    const eventFiles = files.filter((f) => f.startsWith("event-") && f.endsWith(".md"));

    const events: FamilyEvent[] = [];

    for (const file of eventFiles) {
      const filePath = path.join(eventsDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const { data, content: body } = matter(content);
      
      events.push({
        id: data.id || file.replace(".md", ""),
        summerId: data.summerId || summerId,
        name: data.name || "Unknown Event",
        startDate: toDateString(data.startDate) || "",
        endDate: toDateString(data.endDate) || "",
        eventType: (data.eventType as EventType) || "other",
        notes: body.trim() || undefined,
        createdAt: toDateString(data.createdAt) || "",
      });
    }

    // Sort by start date
    events.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[API] Error listing events:", error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string }> }
) {
  try {
    const { summerId } = await params;
    const body = await request.json();
    
    const { name, startDate, endDate, eventType, notes } = body;
    
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "name, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const eventsDir = getEventsDir(summerId);
    
    // Ensure directory exists
    await fs.mkdir(eventsDir, { recursive: true });
    
    const slug = slugify(name, { lower: true, strict: true });
    const eventId = `event-${slug}`;
    const today = new Date().toISOString().split("T")[0];
    
    const frontmatter = {
      id: eventId,
      summerId,
      name,
      startDate,
      endDate,
      eventType: eventType || "other",
      createdAt: today,
    };
    
    const content = `---
id: ${frontmatter.id}
summerId: ${frontmatter.summerId}
name: "${frontmatter.name}"
startDate: ${frontmatter.startDate}
endDate: ${frontmatter.endDate}
eventType: ${frontmatter.eventType}
createdAt: ${frontmatter.createdAt}
---

## Notes

${notes || ""}
`;

    const filePath = path.join(eventsDir, `${eventId}.md`);
    await fs.writeFile(filePath, content, "utf-8");
    
    const event: FamilyEvent = {
      ...frontmatter,
      notes,
    };

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("[API] Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
