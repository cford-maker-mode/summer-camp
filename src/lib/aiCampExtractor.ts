/**
 * Claude-based Camp Data Extractor (AI-powered)
 * Uses Anthropic's Claude API to extract structured camp data from a URL
 */



import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedCampData } from "@/public-catalog/types";


export async function extractCampWithClaude(url: string): Promise<{ success: boolean; data?: ScrapedCampData; error?: string }> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { success: false, error: "ANTHROPIC_API_KEY environment variable is not set" };
    }

    // Compose prompt instructing Claude to use the web fetch tool

    const prompt = `You are a data extraction assistant specializing in summer camp information.\nUse the web fetch tool to read the camp website at: ${url}\nExtract ALL available details relevant to a parent considering this camp, including:\n- Camp name\n- Location (venue, address if available)\n- Cost (all options, min/max, deposit, per week/session, hot lunch, etc.)\n- Grade and age ranges for each program\n- Session schedule (all available weeks/dates, start/end times, overnight vs day camp)\n- Groupings (cabin groups, age/grade group names)\n- Registration dates and deadlines (for all groups/types, even if the date is in MM/DD or M/D format; convert all dates to YYYY-MM-DD)\n- Any special options or add-ons (e.g., hot lunch, store credit)\n- Any other relevant notes\n\nFor registrationDates, extract ALL labeled registration/signup dates, even if the date is not in standard format. Convert all dates to YYYY-MM-DD. Include the group/type label as shown on the site. Example: \"1/3\" should be returned as \"2026-01-03\".\n\nFor address, if a full address is not present, return any partial address or venue/city info available, but do not guess or hallucinate.\n\nReturn a JSON object with the following fields (use null for fields you cannot determine):\n{\n  \"name\": \"Camp name (string)\",\n  \"location\": \"Facility/venue name (string)\",\n  \"address\": \"Full or partial address, venue, or city (string, or null if not present; do not guess or hallucinate)\",\n  \"cost\": \"LOWEST cost option as numeric value only, no $ or commas (number)\",\n  \"costMax\": \"HIGHEST cost option as numeric value only (number) - use null if single price\",\n  \"costPer\": \"One of: week, day, session (string)\",\n  \"ageMin\": \"Minimum age across all programs (number)\",\n  \"ageMax\": \"Maximum age (number)\",\n  \"gradeMin\": \"Minimum grade (number)\",\n  \"gradeMax\": \"Maximum grade (number)\",\n  \"registrationDates\": [{label: string, date: YYYY-MM-DD}],\n  \"overnight\": \"true if overnight camp, false otherwise\",\n  \"dailyStartTime\": \"Start time (HH:MM, 24-hour)\",\n  \"dailyEndTime\": \"End time (HH:MM, 24-hour)\",\n  \"benefits\": [\"Short phrases\"],\n  \"notes\": \"Free-form notes/description\",\n  \"sessions\": [\"Session date ranges or descriptions\"]\n}\n\nExample output:\n{\n  \"name\": \"Beach Camp MMA\",\n  \"location\": \"Sunset Bay Wharf\",\n  \"address\": \"Sunset Bay Wharf\",\n  \"cost\": 575,\n  \"costMax\": 1625,\n  \"costPer\": \"week\",\n  \"ageMin\": null,\n  \"ageMax\": null,\n  \"gradeMin\": 2,\n  \"gradeMax\": 9,\n  \"registrationDates\": [\n    {\"label\": \"Prior Year Parent Helper Reg.\", \"date\": \"2026-01-03\"},\n    {\"label\": \"New Parent Helper Applications\", \"date\": \"2026-01-06\"},\n    {\"label\": \"Returning Students (Overnight)\", \"date\": \"2026-03-02\"},\n    {\"label\": \"Returning Student Friends\", \"date\": \"2026-03-05\"},\n    {\"label\": \"New Students (Overnight)\", \"date\": \"2026-03-09\"},\n    {\"label\": \"Returning Students (Daycamp)\", \"date\": \"2026-03-16\"},\n    {\"label\": \"New Students (Daycamp)\", \"date\": \"2026-03-20\"}\n  ],\n  \"overnight\": true,\n  \"dailyStartTime\": \"09:30\",\n  \"dailyEndTime\": \"16:30\",\n  \"benefits\": [\"Hot lunch available\", \"Cabin groups by grade\", \"Store credit option\"],\n  \"notes\": \"Deposit required, see FAQ for refund policy. Welcome pack sent before camp.\",\n  \"sessions\": [\"Week 1: July 5-11\", \"Week 2: July 12-18\", \"Week 3: July 19-25\", \"Week 4: July 26-August 1\", \"Week 5: August 2-8\", \"Week 6: August 9-15\", \"Week 7: August 16-22\", \"Week 8: August 23-29\"]\n}`;

    const anthropic = new Anthropic({
      apiKey,
      defaultHeaders: {
        'anthropic-beta': 'web-fetch-2025-09-10',
      },
    });
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block: { type: string }) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { success: false, error: "No text response from Claude" };
    }

    // Parse JSON response
    const jsonText = textContent.text.trim();
    let parsed: Record<string, unknown>;
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;
      // If Claude returns a refusal or non-JSON, catch and report
      if (!cleanJson.trim().startsWith('{')) {
        return { success: false, error: "Claude could not extract data from this site. The site may block AI access or lacks extractable camp info." };
      }
      parsed = JSON.parse(cleanJson);
    } catch (err: any) {
      return { success: false, error: "Failed to parse Claude JSON: " + err.message + (jsonText ? `\nClaude response: ${jsonText}` : "") };
    }
    return { success: true, data: parsed as ScrapedCampData };
  } catch (error: any) {
    return { success: false, error: error.message || "Claude extraction failed" };
  }
}
