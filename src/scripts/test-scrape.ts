/**
 * Test Script for Camp URL Scraping
 *
 * Usage: npm run test:scrape
 *
 * Set ANTHROPIC_API_KEY in .env or environment before running.
 * 
 * Examples:
 *   npx tsx src/scripts/test-scrape.ts https://example-camp.com           # Single page
 *   npx tsx src/scripts/test-scrape.ts https://example-camp.com --deep    # Multi-page crawl
 *   npx tsx src/scripts/test-scrape.ts https://example-camp.com --save    # Save result
 */

import "dotenv/config";
import { scrapeCampUrl, scrapeCampSite } from "../lib/scraper";
import { generateCampMarkdown, getCampFilePath } from "../lib/markdown";
import { promises as fs } from "fs";
import path from "path";

// Test URLs - replace with real camp URLs for actual testing
const TEST_URLS: string[] = [
  // Add real camp URLs here for testing
  // "https://example-summer-camp.com/programs/robotics",
];

async function testScraping(url: string, deep: boolean = false): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log(`Testing URL: ${url}`);
  console.log(`Mode: ${deep ? "Deep crawl (multiple pages)" : "Single page"}`);
  console.log("=".repeat(60));

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n❌ Error: ANTHROPIC_API_KEY environment variable is not set");
    console.log("   Create a .env file with: ANTHROPIC_API_KEY=your-key-here");
    process.exit(1);
  }

  const startTime = Date.now();
  const result = deep 
    ? await scrapeCampSite(url, { maxPages: 6, minScore: 2 })
    : await scrapeCampUrl(url);
  const elapsed = Date.now() - startTime;

  console.log(`\nCompleted in ${elapsed}ms`);

  if (!result.success) {
    console.error(`\n❌ Scraping failed: ${result.error}`);
    return;
  }

  console.log("\n✅ Scraping successful!");
  console.log(`   Confidence: ${((result.extractionConfidence || 0) * 100).toFixed(1)}%`);
  if ("pagesScraped" in result && result.pagesScraped) {
    console.log(`   Pages scraped: ${result.pagesScraped}`);
  }

  if (result.data) {
    console.log("\n📋 Extracted Data:");
    console.log(JSON.stringify(result.data, null, 2));

    // Generate markdown preview
    console.log("\n📄 Generated Markdown:");
    const markdown = generateCampMarkdown(result.data);
    console.log(markdown);

    // Show where file would be saved
    if (result.data.name) {
      const filePath = getCampFilePath(result.data.name);
      console.log(`\n💾 Would save to: ${filePath}`);
    }
  }
}

async function saveTestResult(url: string, deep: boolean = false): Promise<void> {
  console.log(`\nScraping and saving: ${url}`);
  console.log(`Mode: ${deep ? "Deep crawl" : "Single page"}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  const result = deep
    ? await scrapeCampSite(url, { maxPages: 6, minScore: 2 })
    : await scrapeCampUrl(url);

  if (!result.success || !result.data) {
    console.error(`❌ Failed: ${result.error}`);
    return;
  }

  if (!result.data.name) {
    console.error("❌ No camp name extracted");
    return;
  }

  const markdown = generateCampMarkdown(result.data);
  const relativePath = getCampFilePath(result.data.name);
  const absolutePath = path.join(process.cwd(), relativePath);

  // Ensure directory exists
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });

  // Write file
  await fs.writeFile(absolutePath, markdown, "utf-8");
  console.log(`✅ Saved to: ${relativePath}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  console.log("🏕️  Summer Camp URL Scraper Test\n");

  // If URL provided as argument, use that
  if (args.length > 0 && !args[0].startsWith("--")) {
    const url = args[0];
    const saveFlag = args.includes("--save");
    const deepFlag = args.includes("--deep");

    if (saveFlag) {
      await saveTestResult(url, deepFlag);
    } else {
      await testScraping(url, deepFlag);
    }
    return;
  }

  // Otherwise, run test URLs or show usage
  if (TEST_URLS.length === 0) {
    console.log("Usage:");
    console.log("  npx tsx src/scripts/test-scrape.ts <url>                 # Single page scrape");
    console.log("  npx tsx src/scripts/test-scrape.ts <url> --deep          # Crawl multiple pages");
    console.log("  npx tsx src/scripts/test-scrape.ts <url> --save          # Scrape and save");
    console.log("  npx tsx src/scripts/test-scrape.ts <url> --deep --save   # Deep scrape and save");
    console.log("\nThe --deep flag crawls the site to find pricing, schedule, and registration pages.");
    console.log("\nExample:");
    console.log("  npx tsx src/scripts/test-scrape.ts https://www.idtech.com --deep");
    return;
  }

  for (const url of TEST_URLS) {
    await testScraping(url);
  }
}

main().catch(console.error);
