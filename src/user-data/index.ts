import type { UserFavorites, UserSignups, UserProfile, UserSummerPlan, UserSession, UserEvent } from "./types";

// Google Drive API base URL
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

// Helper: Get access token from session (client-side)
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const session = (window as any).nextAuthSession || null;
  return session?.accessToken || null;
}

// Helper: Fetch file from Google Drive with error handling
export async function fetchDriveFile(fileId: string, accessToken: string): Promise<any> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      // Token expired or permission lost
      throw new Error("Drive access lost. Please re-authenticate.");
    }
    if (res.status === 404) {
      throw new Error("Drive file not found. Please check your folder.");
    }
    if (res.status === 429) {
      throw new Error("Drive quota exceeded. Please try again later.");
    }
    throw new Error("Failed to fetch file from Drive: " + res.status);
  }
  return await res.json();
}

// Helper: Upload file to Google Drive with error handling
export async function uploadDriveFile(fileId: string, data: any, accessToken: string): Promise<void> {
  const res = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Drive access lost. Please re-authenticate.");
    }
    if (res.status === 429) {
      throw new Error("Drive quota exceeded. Please try again later.");
    }
    throw new Error("Failed to upload file to Drive: " + res.status);
  }
}

// Example: Load user favorites from Google Drive with schema version check
export async function loadUserFavorites(accessToken?: string): Promise<UserFavorites | null> {
  const token = accessToken || getAccessToken();
  if (!token) return null;
  // TODO: Lookup fileId for favorites.json in user's Drive folder
  const fileId = "FAVORITES_FILE_ID";
  try {
    const data = await fetchDriveFile(fileId, token);
    if (!data.version || data.version !== "1.0") {
      // Handle schema migration if needed
      // For now, return null and prompt user to migrate
      throw new Error("Favorites data schema version mismatch. Please migrate your data.");
    }
    return data;
  } catch (err) {
    // Optionally log or show error
    return null;
  }
}

// Example: Save user favorites to Google Drive with schema version and dependency injection
export async function saveUserFavorites(
  data: UserFavorites,
  accessToken?: string,
  uploadFn: typeof uploadDriveFile = uploadDriveFile
): Promise<void> {
  const token = accessToken || getAccessToken();
  if (!token) throw new Error("No access token");
  // TODO: Lookup fileId for favorites.json in user's Drive folder
  const fileId = "FAVORITES_FILE_ID";
  // Ensure version field is set
  const dataToSave = { ...data, version: "1.0" };
  await uploadFn(fileId, dataToSave, token);
}

// Add similar functions for signups, user profile, summer plan, sessions, events
