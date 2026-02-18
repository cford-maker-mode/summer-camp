// Types for user-owned data (favorites, signups, user profile, summer plan, sessions, events)

export interface UserFavorites {
  version: string;
  campIds: string[];
}

export interface UserSignups {
  version: string;
  signups: SignupTask[];
}

export interface UserProfile {
  version: string;
  name: string;
  email: string;
  settings?: Record<string, unknown>;
}

export interface UserSummerPlan {
  version: string;
  year: number;
  children: Summer[];
}

export interface UserSession {
  version: string;
  session: ScheduledSession;
}

export interface UserEvent {
  version: string;
  event: FamilyEvent;
}


// User data types (moved from types/summer.ts)

export type EventType = "vacation" | "blocked" | "other";

export type SessionStatus = "planned" | "confirmed" | "waitlisted";

export interface Summer {
  id: string;
  year: number;
  childId: string;
  childName: string;
  childBirthDate?: string; // YYYY-MM-DD format
  notes?: string;
  createdAt: string; // YYYY-MM-DD format
}

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

export type UrgencyLevel = "overdue" | "this-week" | "this-month" | "later";
