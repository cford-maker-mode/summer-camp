
# Project Reference (Updated Feb 2026)

## Overview
- Purpose: Summer camp catalog and planning platform for families and organizers.
- Target users: Parents, camp organizers, and site admins.
- Main features: Camp browsing, event/session management, user signup, data scraping, admin tools.


## Architecture
- Tech stack: Next.js (15+), TypeScript, Material UI, custom hooks, modular React components.
- Folder structure:
	- `src/app/`: Next.js pages and routing.
	- `src/components/`: Reusable UI components.
	- `src/hooks/`: Custom hooks for data/state logic.
	- `src/lib/`: Utility libraries and feature flags.
	- `src/public-catalog/`: Data access logic for public catalog.
	- `src/user-data/`: Data access logic for user data.
	- `data/`: Markdown-based storage for camps, events, sessions, user data.
	- `docs/`: Documentation and specs.
- Key dependencies: @mui/material, @mui/icons-material, next, react, typescript.


## Data Flow
- APIs: Data loaded from markdown files in `data/` via custom loaders.
- Storage: Markdown files for camps/events/sessions; user data stored separately.
- Main logic: Custom hooks manage state; pages orchestrate UI; components render modular blocks.


## Coding Conventions
- Naming: Use descriptive, camelCase for variables and PascalCase for components.
- Formatting: Prettier and ESLint enforced; follow Material UI style.
- File organization: Pages in `src/app/`; components in `src/components/`; hooks in `src/hooks/`.


## Key Files & Components
- [src/app/camps/page.tsx]: Camps page (modular, refactored)
- [src/components/CampList.tsx]: Camp list rendering
- [src/components/CampDetails.tsx]: Camp detail view
- [src/components/CampForm.tsx]: Camp add/edit form
- [src/components/AddCampDialog.tsx]: Add camp dialog
- [src/components/DeleteConfirmDialog.tsx]: Delete confirmation dialog
- [src/components/ScrapeErrorDialog.tsx]: Scrape error dialog
- [src/hooks/useCamps.ts]: Camp data/state management
## Page vs. Component Building Guidance
- **Practice:** Pages should orchestrate UI and state, delegating all rendering to modular components.
- **Pattern:** Avoid monolithic page files. Instead, build reusable components for each UI block (lists, dialogs, forms, details).
- **Example:** The camps page was refactored from a monolithic file to use CampList, CampDetails, CampForm, and dialogs. All UI logic and handlers are managed in the page, but rendering is handled by components.
- **Benefits:** Improves maintainability, scalability, and testability. Enables incremental refactoring and feature preservation.
- **Protocol:** When building or refactoring a page, first break out UI blocks into components, then wire up handlers and state in the page. Update documentation after major refactors.


## Update Protocol
- Update this doc after any major feature, architectural change, or refactor.
- Reference: See docs/code-change-protocol.md for change process.


### Data Folder Structure
- `data/public-catalog/`: Stores camps, events, sessions, and other data visible to all users.
- `data/user-data/`: Stores user-specific data, preferences, signups, etc.
- `data/sample/`: Contains sample or test data for development.
- `data/archive/`: Holds legacy or archived data.

> Code and types for data access are in `src/public-catalog/` and `src/user-data/`. All data access logic should reference the correct storage folder.

**Migration & Maintenance:**
- Move existing data files to their appropriate folders.
- Update code and scripts to reference new locations.
- Document any changes here after structural updates.
