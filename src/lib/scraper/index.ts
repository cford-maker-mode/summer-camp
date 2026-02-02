/**
 * Main Scraper Module
 * Orchestrates the URL fetching, HTML cleaning, and data extraction
 */

import { fetchUrl } from "./fetcher";
import { cleanHtml, extractPatterns } from "./html-cleaner";
import { extractWithClaude } from "./extractor";
import { crawlCampSite } from "./crawler";
import { extractFromMultiplePages } from "./multi-page-extractor";
import { enhanceWithAddress } from "../geocoder";
import type { ScrapeResult, ScrapedCampData } from "@/types/camp";

export interface ScrapeOptions {
  /** Enable multi-page crawling to gather more comprehensive data */
  deepCrawl?: boolean;
  /** Maximum number of pages to crawl (default: 5) */
  maxPages?: number;
  /** Minimum relevance score for subpages (default: 2) */
  minScore?: number;
  /** Auto-geocode location to get real address (default: true) */
  geocode?: boolean;
}

/**
 * Enhance scraped data by geocoding location to get real address
 */
async function enhanceScrapedData(data: ScrapedCampData): Promise<ScrapedCampData> {
  // If we have a location name but no proper address, try to geocode it
  if (data.location && (!data.address || data.address.length > 80 || !/\d+/.test(data.address))) {
    console.log(`[Scraper] Geocoding location: "${data.location}"`);
    const geocodedAddress = await enhanceWithAddress(data.location, data.address);
    if (geocodedAddress && geocodedAddress !== data.address) {
      console.log(`[Scraper] Found address: ${geocodedAddress}`);
      data.address = geocodedAddress;
    }
  }
  return data;
}

/**
 * Scrape camp data from a URL (single page)
 */
export async function scrapeCampUrl(url: string): Promise<ScrapeResult> {
  // Step 1: Validate URL
  try {
    new URL(url);
  } catch {
    return {
      success: false,
      error: "Invalid URL format",
    };
  }

  // Step 2: Fetch HTML
  console.log(`[Scraper] Fetching URL: ${url}`);
  const fetchResult = await fetchUrl(url);

  if (!fetchResult.success || !fetchResult.html) {
    return {
      success: false,
      error: fetchResult.error || "Failed to fetch URL",
    };
  }

  console.log(`[Scraper] Fetched ${fetchResult.html.length} bytes`);

  // Step 3: Clean HTML and extract patterns
  const cleanedContent = cleanHtml(fetchResult.html);
  const patterns = extractPatterns(cleanedContent.mainText);

  console.log(`[Scraper] Extracted title: "${cleanedContent.title}"`);
  console.log(`[Scraper] Found patterns:`, {
    prices: patterns.prices.length,
    dates: patterns.dates.length,
    times: patterns.times.length,
    ages: patterns.ages.length,
  });

  // Step 4: Extract structured data with Claude
  console.log(`[Scraper] Sending to Claude for extraction...`);
  const extractionResult = await extractWithClaude(cleanedContent, url, patterns);

  if (!extractionResult.success || !extractionResult.data) {
    return {
      success: false,
      error: extractionResult.error || "Failed to extract camp data",
    };
  }

  console.log(`[Scraper] Extraction complete. Confidence: ${extractionResult.confidence}`);

  // Step 5: Enhance with geocoding
  const enhancedData = await enhanceScrapedData(extractionResult.data);

  return {
    success: true,
    data: enhancedData,
    extractionConfidence: extractionResult.confidence,
  };
}

/**
 * Scrape camp data with deep crawling (multiple pages)
 */
export async function scrapeCampSite(
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResult & { pagesScraped?: number }> {
  const { maxPages = 5, minScore = 2 } = options;

  // Step 1: Validate URL
  try {
    new URL(url);
  } catch {
    return {
      success: false,
      error: "Invalid URL format",
    };
  }

  // Step 2: Crawl the site
  console.log(`[Scraper] Starting deep crawl of: ${url}`);
  const crawlResults = await crawlCampSite(url, { maxPages, minScore });

  if (crawlResults.length === 0) {
    return {
      success: false,
      error: "Failed to fetch any pages from the site",
    };
  }

  // Step 3: Extract and synthesize data from all pages
  const extractionResult = await extractFromMultiplePages(crawlResults, url);

  if (!extractionResult.success || !extractionResult.data) {
    return {
      success: false,
      error: extractionResult.error || "Failed to extract camp data",
    };
  }

  console.log(
    `[Scraper] Deep extraction complete. Confidence: ${extractionResult.confidence}, Pages: ${extractionResult.pagesUsed}`
  );

  // Step 4: Enhance with geocoding
  const enhancedData = await enhanceScrapedData(extractionResult.data);

  return {
    success: true,
    data: enhancedData,
    extractionConfidence: extractionResult.confidence,
    pagesScraped: extractionResult.pagesUsed,
  };
}

// Re-export types and utilities
export { fetchUrl } from "./fetcher";
export { cleanHtml, extractPatterns } from "./html-cleaner";
export { extractWithClaude } from "./extractor";
export { crawlCampSite, discoverLinks } from "./crawler";
export { extractFromMultiplePages } from "./multi-page-extractor";
