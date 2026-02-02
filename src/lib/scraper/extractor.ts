/**
 * Claude-based Camp Data Extractor
 * Uses Anthropic's Claude API to intelligently extract structured camp data
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedCampData, CampSession } from "@/types/camp";
import type { CleanedContent } from "./html-cleaner";

const EXTRACTION_PROMPT = `You are a data extraction assistant specializing in summer camp information. 
Extract structured data from the provided camp website content.

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
  "notes": "Any other relevant details about the camp (string)"
}

Guidelines:
- Only extract information explicitly stated in the content
- For dates, assume the current/upcoming year (2026) if year is not specified
- For times, convert to 24-hour format (e.g., 9:00 AM → 09:00, 4:00 PM → 16:00)
- For cost, extract the RANGE if multiple programs have different prices (cost=min, costMax=max)
- For grades, use numbers (Kindergarten=0, 1st=1, etc.)
- If the site lists grades AND ages, include both
- Benefits should be short phrases, not full sentences
- Sessions should list available camp date options offered
- If the page lists multiple camps/programs, capture the full RANGE of ages/grades/costs

Return ONLY the JSON object, no additional text.`;

interface ExtractionResult {
  success: boolean;
  data?: ScrapedCampData;
  error?: string;
  confidence?: number;
}

/**
 * Extract camp data using Claude API
 */
export async function extractWithClaude(
  content: CleanedContent,
  url: string,
  patterns: Record<string, string[]>
): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "ANTHROPIC_API_KEY environment variable is not set",
    };
  }

  const client = new Anthropic({ apiKey });

  // Build context for Claude
  const contextParts = [
    `## Page Title\n${content.title}`,
    content.metaDescription ? `## Meta Description\n${content.metaDescription}` : "",
    `## Main Content\n${content.mainText}`,
    content.structuredData
      ? `## Structured Data (JSON-LD)\n${JSON.stringify(content.structuredData, null, 2)}`
      : "",
    Object.keys(patterns).some((k) => patterns[k].length > 0)
      ? `## Extracted Patterns\n${formatPatterns(patterns)}`
      : "",
  ].filter(Boolean);

  const pageContext = contextParts.join("\n\n").slice(0, 100000); // Limit context size

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\n---\n\nWebsite URL: ${url}\n\n${pageContext}`,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block: { type: string }) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return {
        success: false,
        error: "No text response from Claude",
      };
    }

    // Parse JSON response
    const jsonText = textContent.text.trim();
    let parsed: Record<string, unknown>;

    try {
      // Try to extract JSON from response (handle markdown code blocks)
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;
      parsed = JSON.parse(cleanJson);
    } catch {
      return {
        success: false,
        error: "Failed to parse Claude response as JSON",
      };
    }

    // Transform to ScrapedCampData
    const data: ScrapedCampData = {
      url,
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
      dailyStartTime:
        typeof parsed.dailyStartTime === "string" ? parsed.dailyStartTime : undefined,
      dailyEndTime:
        typeof parsed.dailyEndTime === "string" ? parsed.dailyEndTime : undefined,
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

    // Calculate confidence based on how many fields were extracted
    const fieldCount = Object.values(data).filter(
      (v) => v !== undefined && v !== null && v !== ""
    ).length;
    const maxFields = 12; // Approximate number of fields
    const confidence = Math.min(fieldCount / maxFields, 1);

    return {
      success: true,
      data,
      confidence,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: `Anthropic API error: ${(error as Error).message}`,
      };
    }
    return {
      success: false,
      error: `Extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Format extracted patterns for Claude context
 */
function formatPatterns(patterns: Record<string, string[]>): string {
  const parts: string[] = [];

  if (patterns.prices.length > 0) {
    parts.push(`Prices found: ${patterns.prices.join(", ")}`);
  }
  if (patterns.dates.length > 0) {
    parts.push(`Dates found: ${patterns.dates.join(", ")}`);
  }
  if (patterns.times.length > 0) {
    parts.push(`Times found: ${patterns.times.join(", ")}`);
  }
  if (patterns.ages.length > 0) {
    parts.push(`Ages found: ${patterns.ages.join(", ")}`);
  }

  return parts.join("\n");
}
