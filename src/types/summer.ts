/**
 * Summer plan data types for the Summer Camp Planner
 * Represents the summer overview, family events, and scheduled camp sessions
 */

/**
 * Event type for family events
 */
export type EventType = "vacation" | "blocked" | "other";

/**
 * Session status for camp sessions
 */
export type SessionStatus = "planned" | "confirmed" | "waitlisted";

/**
 * Summer overview - represents a child's summer plan
 */
export interface Summer {
  id: string;
  year: number;
  childId: string;
  childName: string;
  childBirthDate?: string; // YYYY-MM-DD format
  notes?: string;
  createdAt: string; // YYYY-MM-DD format
}

/**
 * Family event - vacation, blocked time, or other event
 */
export interface FamilyEvent {
  id: string;
  summerId: string;
  name: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  eventType: EventType;
  notes?: string;
  createdAt: string; // YYYY-MM-DD format
}

/**
 * Scheduled camp session - a camp on the summer plan
 */
export interface ScheduledSession {
  id: string;
  campId: string;
  summerId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  status: SessionStatus;
  childName?: string; // Optional child name for the session
  backupSessionId?: string;
  signupTaskComplete: boolean;
  notes?: string;
  createdAt: string; // YYYY-MM-DD format
  updatedAt: string; // YYYY-MM-DD format
}

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
  eventType?: EventType;
  // For sessions
  campId?: string;
  status?: SessionStatus;
}

/**
 * Signup task - derived from scheduled sessions with signup dates
 */
export interface SignupTask {
  id: string;
  campId: string;
  campName: string;
  sessionId: string;
  signupDate: string; // YYYY-MM-DD format
  sessionStartDate: string;
  sessionEndDate: string;
  sessionStatus: SessionStatus;
  complete: boolean;
  url?: string;
  notes?: string;
}

/**
 * Urgency level for signup tasks
 */
export type UrgencyLevel = "overdue" | "this-week" | "this-month" | "later";
