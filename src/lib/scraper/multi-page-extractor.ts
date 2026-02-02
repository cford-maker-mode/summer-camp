/**
 * Multi-page Camp Data Extractor
 * Aggregates data from multiple pages into a comprehensive camp profile
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedCampData, CampSession } from "@/types/camp";
import type { CrawlResult } from "./crawler";
import { cleanHtml, extractPatterns } from "./html-cleaner";

const MULTI_PAGE_PROMPT = `You are a data extraction assistant specializing in summer camp information.
You will receive content from MULTIPLE PAGES of a camp website. Your job is to synthesize all the information into ONE comprehensive camp profile.

Return a JSON object with the following fields (use null for fields you cannot determine):

{
  "name": "Camp name (string)",
  "location": "Facility/venue name (string)", 
  "address": "Full street address with city, state, zip (string)",
  "cost": "LOWEST cost option as numeric value only, no $ or commas (number)",
  "costMax": "HIGHEST cost option as numeric value only (number) - use null if single price",
  "costPer": "One of: week, day, session (string)",
  "ageMin": "Minimum age across all programs (number)",
  "ageMax": "Maximum age across all programs (number)",
  "gradeMin": "Minimum grade level if specified instead of/in addition to age (number, K=0)",
  "gradeMax": "Maximum grade level if specified (number)",
  "signupDate": "Registration/signup opening date in YYYY-MM-DD format (string)",
  "dailyStartTime": "Daily start time in HH:MM 24-hour format (string)",
  "dailyEndTime": "Daily end time in HH:MM 24-hour format (string)",
  "benefits": ["Array of camp features/benefits like 'Full Day', 'Lunch Included', 'Extended Care Available'"],
  "sessions": [
    {
      "label": "Session name like 'Week 1' or 'Session A'",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ],
  "notes": "Summary of key details about the camp - what makes it unique, what kids will learn/do (string)"
}

Guidelines:
- MERGE information from all pages - don't just use one page
- If different pages have conflicting information, prefer the more specific/detailed source
- For cost, capture the FULL RANGE across all programs (cost=minimum, costMax=maximum)
- For ages/grades, capture the FULL RANGE across all programs offered
- For grades, use numbers (Kindergarten=0, 1st=1, etc.)
- If the site lists grades AND ages, include both
- For dates, assume the current/upcoming year (2026) if year is not specified
- For times, convert to 24-hour format (e.g., 9:00 AM → 09:00, 4:00 PM → 16:00)
- List ALL available sessions if the site provides specific date options
- Benefits should be short phrases capturing key features

Return ONLY the JSON object, no additional text.`;

interface MultiPageExtractionResult {
  success: boolean;
  data?: ScrapedCampData;
  error?: string;
  confidence?: number;
  pagesUsed: number;
}

/**
 * Extract camp data from multiple crawled pages
 */
export async function extractFromMultiplePages(
  pages: CrawlResult[],
  entryUrl: string
): Promise<MultiPageExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ANTHROPIC_API_KEY environment variable is not set",
      pagesUsed: 0,
    };
  }

  const client = new Anthropic({ apiKey });

  // Process each page
  const pageContents: string[] = [];
  let allPatterns: Record<string, string[]> = {
    prices: [],
    dates: [],
    times: [],
    ages: [],
    emails: [],
    phones: [],
    addresses: [],
  };

  for (const page of pages) {
    const cleaned = cleanHtml(page.html);
    const patterns = extractPatterns(cleaned.mainText);

    // Merge patterns
    for (const key of Object.keys(allPatterns) as Array<keyof typeof allPatterns>) {
      allPatterns[key] = [...new Set([...allPatterns[key], ...patterns[key]])];
    }

    // Build page content section
    const pageSection = [
      `\n=== PAGE: ${page.url} (relevance: ${page.relevanceScore}) ===`,
      `Title: ${cleaned.title}`,
      cleaned.metaDescription ? `Description: ${cleaned.metaDescription}` : "",
      cleaned.structuredData ? `Structured Data: ${JSON.stringify(cleaned.structuredData)}` : "",
      `Content:\n${cleaned.mainText.slice(0, 15000)}`, // Limit per page
    ]
      .filter(Boolean)
      .join("\n");

    pageContents.push(pageSection);
  }

  // Build combined context
  const combinedContext = [
    `## Website: ${entryUrl}`,
    `## Pages Analyzed: ${pages.length}`,
    "",
    `## Extracted Patterns Across All Pages:`,
    `Prices: ${allPatterns.prices.slice(0, 20).join(", ")}`,
    `Dates: ${allPatterns.dates.slice(0, 30).join(", ")}`,
    `Times: ${allPatterns.times.slice(0, 15).join(", ")}`,
    `Ages: ${allPatterns.ages.slice(0, 10).join(", ")}`,
    "",
    `## Page Contents:`,
    ...pageContents,
  ].join("\n");

  // Truncate if too long (Claude has context limits)
  const context = combinedContext.slice(0, 150000);

  try {
    console.log(`[Extractor] Sending ${pages.length} pages to Claude for synthesis...`);
    
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `${MULTI_PAGE_PROMPT}\n\n---\n\n${context}`,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block: { type: string }) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return {
        success: false,
        error: "No text response from Claude",
        pagesUsed: pages.length,
      };
    }

    // Parse JSON response
    const jsonText = textContent.text.trim();
    let parsed: Record<string, unknown>;

    try {
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;
      parsed = JSON.parse(cleanJson);
    } catch {
      return {
        success: false,
        error: "Failed to parse Claude response as JSON",
        pagesUsed: pages.length,
      };
    }

    // Transform to ScrapedCampData
    const data: ScrapedCampData = {
      url: entryUrl,
      name: typeof parsed.name === "string" ? parsed.name : undefined,
      location: typeof parsed.location === "string" ? parsed.location : undefined,
      address: typeof parsed.address === "string" ? parsed.address : undefined,
      cost: typeof parsed.cost === "number" ? parsed.cost : undefined,
      costMax: typeof parsed.costMax === "number" ? parsed.costMax : undefined,
      costPer: typeof parsed.costPer === "string" ? parsed.costPer : undefined,
      ageMin: typeof parsed.ageMin === "number" ? parsed.ageMin : undefined,
      ageMax: typeof parsed.ageMax === "number" ? parsed.ageMax : undefined,
      gradeMin: typeof parsed.gradeMin === "number" ? parsed.gradeMin : undefined,
      gradeMax: typeof parsed.gradeMax === "number" ? parsed.gradeMax : undefined,
      signupDate: typeof parsed.signupDate === "string" ? parsed.signupDate : undefined,
      dailyStartTime: typeof parsed.dailyStartTime === "string" ? parsed.dailyStartTime : undefined,
      dailyEndTime: typeof parsed.dailyEndTime === "string" ? parsed.dailyEndTime : undefined,
      benefits: Array.isArray(parsed.benefits)
        ? parsed.benefits.filter((b): b is string => typeof b === "string")
        : undefined,
      sessions: Array.isArray(parsed.sessions)
        ? (parsed.sessions as CampSession[]).filter(
            (s) =>
              typeof s.label === "string" &&
              typeof s.startDate === "string" &&
              typeof s.endDate === "string"
          )
        : undefined,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };

    // Calculate confidence
    const fieldCount = Object.values(data).filter(
      (v) => v !== undefined && v !== null && v !== ""
    ).length;
    const maxFields = 12;
    const confidence = Math.min(fieldCount / maxFields, 1);

    return {
      success: true,
      data,
      confidence,
      pagesUsed: pages.length,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: `Anthropic API error: ${(error as Error).message}`,
        pagesUsed: pages.length,
      };
    }
    return {
      success: false,
      error: `Extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      pagesUsed: pages.length,
    };
  }
}
