/**
 * HTML Cleaner - Extracts relevant text content from HTML
 * Uses Cheerio for HTML parsing
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";

export interface CleanedContent {
  title: string;
  mainText: string;
  structuredData: Record<string, unknown> | null;
  metaDescription: string;
}

/**
 * Extract and clean text content from HTML
 * Removes scripts, styles, nav, and other non-content elements
 */
export function cleanHtml(html: string): CleanedContent {
  const $ = cheerio.load(html);

  // Extract title
  const title = $("title").text().trim() || $("h1").first().text().trim() || "";

  // Extract meta description
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  // Try to extract JSON-LD structured data (many camp sites use this)
  let structuredData: Record<string, unknown> | null = null;
  $('script[type="application/ld+json"]').each((_: number, el: Element) => {
    try {
      const jsonText = $(el).text();
      const parsed = JSON.parse(jsonText);
      // Look for relevant schema types
      if (
        parsed["@type"] === "Event" ||
        parsed["@type"] === "SummerCamp" ||
        parsed["@type"] === "Organization" ||
        parsed["@type"] === "LocalBusiness" ||
        parsed["@type"] === "ChildCare" ||
        Array.isArray(parsed["@graph"])
      ) {
        structuredData = parsed;
      }
    } catch {
      // Ignore invalid JSON
    }
  });

  // Remove non-content elements
  $(
    "script, style, nav, header, footer, aside, iframe, noscript, svg, form"
  ).remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  $(".nav, .navbar, .header, .footer, .sidebar, .menu, .ad, .advertisement").remove();

  // Extract main content area if identifiable
  let mainContent = $("main, article, [role='main'], .main-content, #main-content, .content");
  if (mainContent.length === 0) {
    mainContent = $("body");
  }

  // Get text from relevant elements, preserving some structure
  const textParts: string[] = [];

  // Extract headings with hierarchy
  mainContent.find("h1, h2, h3, h4, h5, h6").each((_: number, el: Element) => {
    const text = $(el).text().trim();
    if (text) {
      textParts.push(`## ${text}`);
    }
  });

  // Extract paragraphs
  mainContent.find("p").each((_: number, el: Element) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      // Skip very short paragraphs
      textParts.push(text);
    }
  });

  // Extract list items (often contain camp details)
  mainContent.find("li").each((_: number, el: Element) => {
    const text = $(el).text().trim();
    if (text && text.length > 5) {
      textParts.push(`- ${text}`);
    }
  });

  // Extract table content (dates, pricing often in tables)
  mainContent.find("table").each((_: number, table: Element) => {
    const rows: string[] = [];
    $(table)
      .find("tr")
      .each((_: number, row: Element) => {
        const cells: string[] = [];
        $(row)
          .find("th, td")
          .each((_: number, cell: Element) => {
            cells.push($(cell).text().trim());
          });
        if (cells.length > 0) {
          rows.push(cells.join(" | "));
        }
      });
    if (rows.length > 0) {
      textParts.push("TABLE:\n" + rows.join("\n"));
    }
  });

  // Extract definition lists (dl/dt/dd - often used for camp info)
  mainContent.find("dl").each((_: number, dl: Element) => {
    $(dl)
      .find("dt")
      .each((i: number, dt: Element) => {
        const term = $(dt).text().trim();
        const definition = $(dl).find("dd").eq(i).text().trim();
        if (term && definition) {
          textParts.push(`${term}: ${definition}`);
        }
      });
  });

  // Deduplicate and join
  const uniqueParts = [...new Set(textParts)];
  const mainText = uniqueParts.join("\n\n").slice(0, 50000); // Limit to ~50k chars

  return {
    title,
    mainText,
    structuredData,
    metaDescription,
  };
}

/**
 * Extract specific patterns commonly found in camp websites
 */
export function extractPatterns(text: string): Record<string, string[]> {
  const patterns: Record<string, string[]> = {
    prices: [],
    dates: [],
    times: [],
    ages: [],
    emails: [],
    phones: [],
    addresses: [],
  };

  // Price patterns ($XXX, $X,XXX)
  const priceMatches = text.match(/\$[\d,]+(?:\.\d{2})?(?:\s*(?:\/|per)\s*(?:week|day|session))?/gi);
  if (priceMatches) {
    patterns.prices = [...new Set(priceMatches)];
  }

  // Date patterns (Month Day, Month Day-Day, etc.)
  const dateMatches = text.match(
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:\s*[-–]\s*(?:\d{1,2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}))?(?:,?\s*\d{4})?/gi
  );
  if (dateMatches) {
    patterns.dates = [...new Set(dateMatches)];
  }

  // Time patterns (9:00 AM, 9am, etc.)
  const timeMatches = text.match(/\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)/gi);
  if (timeMatches) {
    patterns.times = [...new Set(timeMatches)];
  }

  // Age patterns (ages 5-12, 5-12 years, etc.)
  const ageMatches = text.match(/(?:ages?\s*)?\d{1,2}\s*[-–to]\s*\d{1,2}(?:\s*(?:years?|yrs?))?/gi);
  if (ageMatches) {
    patterns.ages = [...new Set(ageMatches)];
  }

  // Email patterns
  const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatches) {
    patterns.emails = [...new Set(emailMatches)];
  }

  // Phone patterns
  const phoneMatches = text.match(/(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g);
  if (phoneMatches) {
    patterns.phones = [...new Set(phoneMatches)];
  }

  return patterns;
}
