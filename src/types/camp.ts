/**
 * Camp data types for the Summer Camp Planner
 * Based on the data model from product-spec.md
 */

/**
 * Cost period for camp pricing
 */
export type CostPer = "week" | "day" | "session";

/**
 * Core camp entity - represents a summer camp in the catalog
 */
export interface Camp {
  id: string;
  name: string;
  location?: string;
  address?: string;
  cost?: number;      // Minimum/single cost
  costMax?: number;   // Maximum cost (for ranges)
  costPer?: CostPer;
  url?: string;
  ageMin?: number;
  ageMax?: number;
  gradeMin?: number;  // Grade level (alternative to age)
  gradeMax?: number;
  signupDate?: string; // YYYY-MM-DD format
  overnight?: boolean;  // true = overnight camp (no daily times)
  dailyStartTime?: string; // HH:MM format (24-hour)
  dailyEndTime?: string; // HH:MM format (24-hour)
  benefits?: string[];
  rank?: number;
  notes?: string;
  createdAt: string; // YYYY-MM-DD format
  updatedAt: string; // YYYY-MM-DD format
  // topic?: string; // P1 feature - uncomment when ready
}

/**
 * Available session dates offered by a camp
 */
export interface CampSession {
  label: string; // e.g., "Week 1", "Session A"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Raw scraped data before normalization
 */
export interface ScrapedCampData {
  name?: string;
  location?: string;
  address?: string;
  cost?: number | string;      // Minimum/single cost
  costMax?: number | string;   // Maximum cost (for ranges)
  costPer?: string;
  url: string;
  ageMin?: number | string;
  ageMax?: number | string;
  gradeMin?: number | string;  // Grade level (alternative to age)
  gradeMax?: number | string;
  signupDate?: string;
  overnight?: boolean;  // true = overnight camp (no daily times)
  dailyStartTime?: string;
  dailyEndTime?: string;
  benefits?: string[];
  sessions?: CampSession[];
  notes?: string;
  rawContent?: string; // Original HTML content for debugging
}

/**
 * Result from the scraping operation
 */
export interface ScrapeResult {
  success: boolean;
  data?: ScrapedCampData;
  error?: string;
  extractionConfidence?: number; // 0-1 confidence score from LLM
}

/**
 * Request body for the scrape API endpoint
 */
export interface ScrapeRequest {
  url: string;
}

/**
 * Response from the scrape API endpoint
 */
export interface ScrapeResponse {
  success: boolean;
  data?: ScrapedCampData;
  error?: string;
}
