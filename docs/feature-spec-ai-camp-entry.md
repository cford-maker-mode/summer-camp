# Feature Spec: AI-Powered Camp Entry (Alternative Approach)

## Goal
Make adding new camp entries as easy, accurate, and failproof as possible. Leverage AI APIs to extract and summarize camp details from a provided website URL, minimizing user effort and maximizing data quality, while keeping costs reasonable.

## Problem Statement
Current scraping methods are often blocked by anti-bot measures and require manual correction. Users want a seamless experience: paste a camp website URL, and have all relevant camp details auto-filled, ready for review and edit.

## Solution Overview
- User provides a camp website URL.
- The system uses the Claude API with the official web fetch tool (see https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool) to have Claude itself browse and summarize the site, extracting all relevant camp details.
- Extracted details are mapped to the camp entry fields and shown in an editable form for user review.
- This approach is robust against anti-bot protections, as Claude fetches and interprets the site as a human would, including JavaScript-rendered content (if supported by Claude's tool).
- The system should optimize API usage to control costs (e.g., only call AI when needed, cache results, allow user to confirm before incurring cost).

## Key Features
- **One-step camp entry:** User pastes a URL, clicks a button, and sees a pre-filled camp entry form.
- **AI-powered extraction:** Uses LLM with web browsing or retrieval capabilities to extract structured data from arbitrary camp websites.
- **Editable results:** All extracted fields are editable before saving.
- **Failproof fallback:** If extraction fails, user can still enter details manually.
- **Cost control (Engineering Alert):** API calls to Claude will incur cost. Engineering should monitor and optimize usage, and provide cost alerts to the product owner during development and testing. Cache results to avoid duplicate charges.
- **Transparency:** Show confidence level and allow user to see the raw summary if desired.

## Data Fields to Extract
- Camp Name
- Location (name, address)
- Website URL
- Cost (min, max, per)
- Age/Grade range
- Signup date
- Overnight (yes/no)
- Daily start/end times
- Benefits/highlights
- Notes/description
- Session dates (if available)

## User Flow
1. User clicks "+ Add Camp" and pastes a camp website URL.
2. User clicks "Fetch Details" (AI-powered).
3. System calls AI API to read and summarize the site, extracting relevant fields.
4. Extracted details are mapped to the camp entry form and shown to the user.
5. User reviews/edits fields as needed, then saves the camp entry.
6. If extraction fails, user is prompted to enter details manually.

## AI API Usage
- Use Claude API (with web browsing or retrieval plugin if available).
- Prompt should be optimized for extracting structured camp data.
- Cache results by URL to avoid duplicate API calls.
- Engineering should alert the product owner about API cost implications during the build process.

## Edge Cases & Error Handling
- If the website is inaccessible, show a clear error and allow manual entry.
- If some fields are missing, fill what is available and prompt user to complete the rest.
- If the AI returns low confidence, warn the user and allow manual correction.

## Success Criteria
- 90%+ of camp entries require minimal manual correction after AI extraction.
- User can always fall back to manual entry if needed.
- API costs are monitored and reported to the product owner during development.

---

## Engineering Implementation Plan (Claude API with Web Fetch Tool)

**Principles:**
- No UI changes unless required by new feature requirements.
- Use existing camp entry UI and workflow.

**Steps:**
1. **Claude API Web Fetch Tool Integration:**
	- Update the backend extraction logic to use Claude's web fetch tool (see https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool).
	- When calling Claude, use the tool-use/agent API to instruct Claude to fetch and read the provided camp website URL directly.
	- Prompt Claude to extract structured camp data from the fetched content, as before.
	- Parse and map the Claude response to the camp entry data structure.
	- Cache results by URL to minimize duplicate API calls and control costs.
	- Log and alert engineering/product owner about API usage and cost during development/testing.

2. **Claude API Access Requirements:**
	- Ensure your Claude API key/account has access to the web fetch tool/agent features (this may require enabling beta features or contacting Anthropic support).
	- Review the Claude API documentation for tool use and agent invocation.

3. **Feature Switch:**
	- Add or update the feature flag for the Claude web fetch-based extraction.
	- When enabled, the backend uses Claude with web fetch; otherwise, fallback to the current method.

4. **Frontend Integration:**
	- Reuse the existing "Fetch" button and camp entry form.
	- When the feature flag is enabled, the frontend calls the new backend endpoint as before.
	- No UI changes unless required for error handling or new data fields.

5. **Testing & Monitoring:**
	- Test with a variety of camp URLs, including JavaScript-heavy and protected sites, to ensure robust extraction and mapping.
	- Monitor API usage and cost, and provide regular alerts to the product owner.
	- Ensure fallback to manual entry is always available.

6. **Documentation:**
	- Document the new endpoint, feature flag, and any engineering alerts for cost.
	- Document any Claude API configuration steps required for web fetch tool use.

---

**Next Steps for Engineering:**
1. Confirm your Claude API account has access to the web fetch tool/agent features.
2. Update the backend extraction logic to use Claude's tool-use/agent API for web fetching.
3. Test with real camp URLs and monitor results.
4. Update documentation and alert the product owner about any cost or access issues.

---

*Drafted: 2026-02-04*
*Author: GitHub Copilot*
