/**
 * Markdown Generator
 * Converts scraped camp data to markdown file format matching the template
 */

import slugify from "slugify";
import type { ScrapedCampData, Camp, CampSession } from "@/types/camp";

/**
 * Generate a slug from camp name for use in filename and ID
 */
export function generateCampSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true, // Remove special characters
    trim: true,
  });
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Format benefits array for YAML frontmatter
 */
function formatBenefits(benefits?: string[]): string {
  if (!benefits || benefits.length === 0) {
    return "[]";
  }
  return `[${benefits.map((b) => `"${b.replace(/"/g, '\\"')}"`).join(", ")}]`;
}

/**
 * Format session dates for the markdown body
 */
function formatSessions(sessions?: CampSession[]): string {
  if (!sessions || sessions.length === 0) {
    return "- No sessions specified yet";
  }

  return sessions
    .map((s) => {
      // Convert YYYY-MM-DD to readable format
      const start = formatDateReadable(s.startDate);
      const end = formatDateReadable(s.endDate);
      return `- ${s.label}: ${start} - ${end}`;
    })
    .join("\n");
}

/**
 * Convert YYYY-MM-DD to readable "Month Day" format
 */
function formatDateReadable(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Convert scraped data to a normalized Camp object
 */
export function normalizeCampData(scraped: ScrapedCampData): Camp {
  const slug = scraped.name ? generateCampSlug(scraped.name) : "unknown-camp";
  const today = getCurrentDate();

  return {
    id: `camp-${slug}`,
    name: scraped.name || "Unknown Camp",
    location: scraped.location,
    address: scraped.address,
    cost: typeof scraped.cost === "number" ? scraped.cost : undefined,
    costMax: typeof scraped.costMax === "number" ? scraped.costMax : undefined,
    costPer: normalizeCostPer(scraped.costPer),
    url: scraped.url,
    ageMin: typeof scraped.ageMin === "number" ? scraped.ageMin : undefined,
    ageMax: typeof scraped.ageMax === "number" ? scraped.ageMax : undefined,
    gradeMin: typeof scraped.gradeMin === "number" ? scraped.gradeMin : undefined,
    gradeMax: typeof scraped.gradeMax === "number" ? scraped.gradeMax : undefined,
    signupDate: scraped.signupDate,
    overnight: scraped.overnight,
    dailyStartTime: scraped.overnight ? undefined : scraped.dailyStartTime,
    dailyEndTime: scraped.overnight ? undefined : scraped.dailyEndTime,
    benefits: scraped.benefits,
    notes: scraped.notes,
    createdAt: today,
    updatedAt: today,
  };
}

/**
 * Normalize cost period to valid enum value
 */
function normalizeCostPer(value?: string): "week" | "day" | "session" | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("week")) return "week";
  if (lower.includes("day")) return "day";
  if (lower.includes("session")) return "session";
  return "week"; // Default to week if unclear
}

/**
 * Generate markdown content from scraped camp data
 */
export function generateCampMarkdown(
  scraped: ScrapedCampData,
  sessions?: CampSession[]
): string {
  const camp = normalizeCampData(scraped);
  const allSessions = sessions || scraped.sessions;

  // Build YAML frontmatter
  const frontmatter = [
    "---",
    `id: ${camp.id}`,
    `name: "${camp.name.replace(/"/g, '\\"')}"`,
    camp.location ? `location: "${camp.location.replace(/"/g, '\\"')}"` : "location:",
    camp.address ? `address: "${camp.address.replace(/"/g, '\\"')}"` : "address:",
    camp.cost !== undefined ? `cost: ${camp.cost}` : "cost:",
    camp.costMax !== undefined ? `costMax: ${camp.costMax}` : "costMax:",
    `costPer: ${camp.costPer || "week"}`,
    camp.url ? `url: ${camp.url}` : "url:",
    camp.ageMin !== undefined ? `ageMin: ${camp.ageMin}` : "ageMin:",
    camp.ageMax !== undefined ? `ageMax: ${camp.ageMax}` : "ageMax:",
    camp.gradeMin !== undefined ? `gradeMin: ${camp.gradeMin}` : "gradeMin:",
    camp.gradeMax !== undefined ? `gradeMax: ${camp.gradeMax}` : "gradeMax:",
    camp.signupDate ? `signupDate: ${camp.signupDate}` : "signupDate:",
    camp.overnight ? `overnight: true` : "overnight:",
    camp.dailyStartTime ? `dailyStartTime: "${camp.dailyStartTime}"` : 'dailyStartTime:',
    camp.dailyEndTime ? `dailyEndTime: "${camp.dailyEndTime}"` : 'dailyEndTime:',
    `benefits: ${formatBenefits(camp.benefits)}`,
    "rank:",
    `createdAt: ${camp.createdAt}`,
    `updatedAt: ${camp.updatedAt}`,
    "# topic:                           # P1 feature - uncomment when ready",
    "---",
  ].join("\n");

  // Build markdown body
  const body = [
    "",
    "## Notes",
    "",
    camp.notes || "{Add notes about this camp}",
    "",
    "## Available Sessions",
    "",
    formatSessions(allSessions),
    "",
  ].join("\n");

  return frontmatter + body;
}

/**
 * Generate the filename for a camp markdown file
 */
export function generateCampFilename(name: string): string {
  const slug = generateCampSlug(name);
  return `camp-${slug}.md`;
}

/**
 * Get the full path for a camp file
 */
export function getCampFilePath(name: string, year: number = 2026): string {
  const filename = generateCampFilename(name);
  return `data/${year}/camps/${filename}`;
}
