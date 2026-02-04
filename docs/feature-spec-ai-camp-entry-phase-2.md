# AI Camp Entry Feature Spec — Phase 2

## Goals
- Ensure robust, accurate, and rich camp data extraction across a wide variety of camp websites.
- Support sophisticated, multi-field extraction for registration dates, session dates, and all relevant camp details.
- Enhance user experience with progressive disclosure, summarized card views, and detailed edit screens.
- Enable users to create and store a personal data layer on top of the public camp catalog.

## Next Steps

### 1. Extraction Robustness & Data Shape Testing
- Test the AI extraction workflow with a diverse set of camp websites (static, dynamic, protected, various formats).
- Document edge cases and variations in data shape (e.g., multiple registration dates, session structures, partial addresses).
- Refine prompt and schema to accommodate all real-world data shapes.
- Add logging and error reporting for extraction failures or ambiguous results.

### 2. Rich, Sophisticated Data Extraction
- Continue prompt engineering to maximize extraction of all relevant fields (costs, dates, age/grade, options, notes).
- Support extraction of session dates as an array of labeled date ranges (e.g., [{label, startDate, endDate}]).
- Normalize and validate extracted data for consistency and completeness.
- Add support for additional fields as needed (e.g., program types, special requirements).

### 3. Session Dates Extraction
- Update backend and UI to support multiple session date ranges per camp.
- Allow editing, adding, and removing session dates in the camp entry/edit dialog.
- Display session dates on camp cards and in markdown output.

### 4. Progressive Disclosure & UX Improvements
- Redesign camp card view to show a simplified summary (name, location, key dates, cost, tags).
- Add a "See More" or expandable section for full details (all registration/session dates, notes, options).
- Edit screen to show all changeable fields in a clear, organized layout (grouped by type, collapsible sections).
- Use progressive disclosure to avoid overwhelming users with too much data at once.
- Consider mobile-friendly layouts and accessibility.

### 5. Personal Data Layer
- Allow users to add personal notes, preferences, and custom fields to any camp entry.
- Store personal data layer separately from the public catalog (e.g., in user profile or private DB table).
- Ensure personal data is only visible/editable by the user, not shared publicly.
- Provide UI for viewing, editing, and managing personal data layer (e.g., "My Notes", "My Preferences").
- Enable merging or overlaying personal data with public camp data in the UI.

## Conceptual UI/UX Solutions
- **Camp Card:**
  - Summary: Name, location, cost, next registration/session date, tags.
  - Expandable: "See More" for full details (all dates, notes, options).
- **Camp Edit Dialog:**
  - Tabs or collapsible sections for: General Info, Registration Dates, Session Dates, Options, Notes.
  - Inline add/remove for arrays (dates, benefits, sessions).
- **Personal Data Layer:**
  - "My Notes" section on camp card and edit dialog.
  - Toggle to show/hide personal data overlay.
  - Backend API for saving/retrieving personal data per user/camp.
- **Testing & Validation:**
  - Test extraction and UI with 10+ real camp sites.
  - Document and address all edge cases.
  - Gather user feedback on new UX flows.

## Deliverables
- Updated backend and UI supporting all above features.
- Documentation of edge cases and extraction results.
- UX wireframes for new card, edit, and personal data flows.
- API endpoints for personal data layer.
- User testing plan and feedback loop.

---
*Drafted: 2026-02-04*
