
// ...existing code...

/**
 * Combined calendar item for display
 */
export type CalendarItemType = "event" | "session";

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  name: string;
  startDate: string;
  endDate: string;
  // For events
  eventType?: import("@/user-data/types").EventType;
  // For sessions
  campId?: string;
  status?: import("@/user-data/types").SessionStatus;
}
