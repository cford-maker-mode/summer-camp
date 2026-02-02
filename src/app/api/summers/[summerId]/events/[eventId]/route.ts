/**
 * API Route: Single event operations
 * DELETE /api/summers/[summerId]/events/[eventId] - Delete event
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

function getEventsDir(summerId: string): string {
  const parts = summerId.split("-");
  const year = parts[1] || "2026";
  return path.join(process.cwd(), "data", year, "summer", "events");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ summerId: string; eventId: string }> }
) {
  try {
    const { summerId, eventId } = await params;
    const eventsDir = getEventsDir(summerId);
    const filePath = path.join(eventsDir, `${eventId}.md`);
    
    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("[API] Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
