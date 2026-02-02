/**
 * Site Crawler - Discovers and fetches relevant subpages from a camp website
 */

import * as cheerio from "cheerio";
import { fetchUrl } from "./fetcher";

export interface CrawlResult {
  url: string;
  html: string;
  relevanceScore: number;
}

/**
 * Keywords that indicate a page likely has camp-relevant information
 */
const RELEVANT_KEYWORDS = [
  // Pricing
  "price", "pricing", "cost", "tuition", "fee", "rate", "payment",
  // Schedule
  "schedule", "calendar", "date", "session", "week", "summer",
  // Programs
  "program", "course", "class", "camp", "activity", "curriculum",
  // Registration
  "register", "registration", "enroll", "signup", "sign-up",
  // Location
  "location", "campus", "site", "venue", "address", "where",
  // Details
  "about", "info", "detail", "faq", "overview",
  // Age/eligibility
  "age", "grade", "eligibility", "requirement",
];

/**
 * Patterns to exclude (not camp content)
 */
const EXCLUDE_PATTERNS = [
  /\/(blog|news|press|career|job|login|account|cart|checkout)/i,
  /\.(pdf|jpg|jpeg|png|gif|svg|css|js)$/i,
  /^mailto:/i,
  /^tel:/i,
  /^#/,
  /(facebook|twitter|instagram|linkedin|youtube)\.com/i,
];

/**
 * Extract and score links from HTML
 */
export function discoverLinks(html: string, baseUrl: string): { url: string; score: number }[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links: Map<string, number> = new Map();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // Resolve relative URLs
    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).href;
    } catch {
      return; // Invalid URL
    }

    // Must be same domain
    const parsed = new URL(fullUrl);
    if (parsed.hostname !== base.hostname) return;

    // Remove hash and normalize
    parsed.hash = "";
    const normalized = parsed.href;

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(normalized))) return;

    // Skip if same as base
    if (normalized === baseUrl || normalized === baseUrl + "/") return;

    // Calculate relevance score based on URL and link text
    const linkText = $(el).text().toLowerCase();
    const urlLower = normalized.toLowerCase();

    let score = 0;
    for (const keyword of RELEVANT_KEYWORDS) {
      if (urlLower.includes(keyword)) score += 2;
      if (linkText.includes(keyword)) score += 1;
    }

    // Boost for shorter paths (likely main sections, not deep pages)
    const pathDepth = parsed.pathname.split("/").filter(Boolean).length;
    if (pathDepth <= 2) score += 1;

    // Only keep if some relevance
    if (score > 0) {
      const existing = links.get(normalized) || 0;
      links.set(normalized, Math.max(existing, score));
    }
  });

  // Sort by score descending
  return Array.from(links.entries())
    .map(([url, score]) => ({ url, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Crawl a camp website starting from an entry URL
 */
export async function crawlCampSite(
  entryUrl: string,
  options: {
    maxPages?: number;
    minScore?: number;
  } = {}
): Promise<{ results: CrawlResult[]; error?: string; blocked?: boolean }> {
  const { maxPages = 5, minScore = 2 } = options;
  const results: CrawlResult[] = [];

  // Fetch entry page
  console.log(`[Crawler] Fetching entry page: ${entryUrl}`);
  const entryResult = await fetchUrl(entryUrl);

  if (!entryResult.success || !entryResult.html) {
    console.log(`[Crawler] Failed to fetch entry page: ${entryResult.error}`);
    return { 
      results, 
      error: entryResult.error || "Failed to fetch entry page",
      blocked: entryResult.blocked 
    };
  }

  results.push({
    url: entryUrl,
    html: entryResult.html,
    relevanceScore: 10, // Entry page gets highest score
  });

  // Discover relevant links
  const links = discoverLinks(entryResult.html, entryUrl);
  console.log(`[Crawler] Found ${links.length} potentially relevant links`);

  // Filter by minimum score and limit
  const toFetch = links
    .filter((l) => l.score >= minScore)
    .slice(0, maxPages - 1); // -1 because we already have entry page

  console.log(`[Crawler] Fetching ${toFetch.length} additional pages...`);
  if (toFetch.length > 0) {
    console.log(`[Crawler] Pages: ${toFetch.map((l) => `${l.url} (score: ${l.score})`).join(", ")}`);
  }

  // Fetch pages in parallel (with some concurrency limit)
  const fetchPromises = toFetch.map(async ({ url, score }) => {
    const result = await fetchUrl(url);
    if (result.success && result.html) {
      return { url, html: result.html, relevanceScore: score };
    }
    return null;
  });

  const fetched = await Promise.all(fetchPromises);
  for (const result of fetched) {
    if (result) {
      results.push(result);
    }
  }

  console.log(`[Crawler] Successfully fetched ${results.length} pages total`);
  return { results };
}
