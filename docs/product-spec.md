# Product Specification: Summer Camp Planner

---

## 1. Overview

### 1.1 Product Name
Summer Camp Planner

### 1.2 Version
v0.1 / Draft

### 1.3 Last Updated
February 1, 2026

### 1.4 Author(s)
[Your Name]

---

## 2. Problem Statement

### 2.1 The Problem
Parents face an overwhelming, time-consuming process each year to plan summer activities for their children. The challenge includes:
- Discovering camps that fit criteria (location, cost, schedule, age-appropriateness, topic)
- Tracking enrollment windows that open as early as January and sell out quickly
- Coordinating camp schedules around family vacations and work schedules
- Managing waitlists and backup options when preferred camps fill up
- Juggling multiple spreadsheets, calendars, and websites to stay organized

### 2.2 Current Alternatives
- **Spreadsheets**: Manual tracking of camp options, dates, costs, and signup deadlines across multiple tabs. Requires significant setup and ongoing maintenance.
- **Paper calendars/notes**: Prone to getting lost, difficult to update, no reminders.
- **Memory + browser bookmarks**: Unreliable; easy to miss signup windows.
- **Generic calendar apps**: Can track dates but don't capture camp-specific metadata or provide planning views.

### 2.3 Impact
Without a solution:
- Parents miss enrollment windows and lose access to preferred camps
- Children end up in suboptimal activities or with coverage gaps
- Parents experience stress and feel "obsessive" managing the complexity
- Work schedules get disrupted by last-minute childcare scrambles
- The same painful process repeats every year

---

## 3. Solution Statement

### 3.1 Proposed Solution
A personal planning app for the summer camp season that helps parents:
1. Find and catalog summer camps with relevant details
2. Build a visual summer schedule around family vacations
3. Track signup windows and get reminders
4. Manage waitlists and backup options
5. See at-a-glance views of the summer plan with pickup/dropoff logistics

### 3.2 Value Proposition
Replace months of spreadsheet wrangling and calendar juggling with a purpose-built tool that makes summer planning manageable, repeatable, and even enjoyable.

### 3.3 Key Differentiators
- **Purpose-built for summer camp planning**: Not a generic calendar or project tool
- **Signup deadline tracking**: First-class support for enrollment windows and waitlists
- **Family-first scheduling**: Vacations are the anchor; camps fill around them
- **Planned vs. Confirmed states**: Track tentative schedules before committing
- **Reusable year-over-year**: Camp data persists for future planning

---

## 4. Goals & Success Metrics

### 4.1 Business Goals
| Goal | Target | Timeframe |
|------|--------|-----------|
| Personal use | Successfully plan Summer 2026 | By February 2026 |
| Open source release | Share with community | By Spring 2026 |

### 4.2 User Goals
- Create a complete summer plan with minimal stress
- Never miss a camp signup deadline
- Have backup options ready when waitlisted
- Maintain work schedule predictability
- Give kids a fun, enriching summer

### 4.3 Key Performance Indicators (KPIs)
- [ ] Time to complete summer plan < 50% of previous year's effort
- [ ] Zero missed signup deadlines
- [ ] 100% of summer weeks have confirmed coverage or intentional free time
- [ ] User (me) feels in control, not overwhelmed

---

## 5. User Personas

### 5.1 Primary Persona: Planning Parent (Michelle)
| Attribute | Description |
|-----------|-------------|
| **Role** | Working parent, primary summer planner for the household |
| **Demographics** | 30-45, suburban, dual-income household, 1-3 school-age kids |
| **Goals** | Create a great summer for kids while maintaining work schedule; minimize planning stress |
| **Frustrations** | The planning process is just as exhausting as it is necessary — signup windows sneak up, camp info is scattered across dozens of websites, and the spreadsheet that worked in January feels outdated by March |
| **Tech Comfort** | Medium-High |
| **Quote** | "Summer was amazing — but getting there was all a little bit MUCH." |

### 5.2 Secondary Persona: Co-Parent Partner (Scot)
| Attribute | Description |
|-----------|-------------|
| **Role** | Working parent, needs visibility into the plan |
| **Demographics** | Same household as primary planner |
| **Goals** | Know what's happening, when; coordinate vacation time with work |
| **Frustrations** | The plan exists, but it's not really accessible to him — logistics surface at the last minute, and there's no easy way to stay in the loop without asking |
| **Tech Comfort** | Medium |
| **Quote** | "I don't need to be involved in every decision. I just need to not be surprised." |

### 5.3 Anti-Persona (Who This Is NOT For)
- **Camp administrators**: This is not a camp management or registration system
- **Parents who don't plan ahead**: If you're comfortable with last-minute arrangements, this may be overkill
- **Families without scheduling constraints**: If you have full flexibility, a simple list may suffice

---

## 6. Feature Capabilities

### 6.1 Prioritized Feature List

| Priority | Feature | Description | Persona | MVP? |
|----------|---------|-------------|---------|------|
| P0 | Camp catalog | Add/edit camps with name, dates, schedule, cost, location, URL, benefits | Michelle | Yes |
| P0 | Cost tracking | Display session cost in catalog; show "Estimated Total Cost" for planned/confirmed camps | Michelle | Yes |
| P0 | URL scraping | Paste a camp URL and auto-populate camp details | Michelle | Yes |
| P0 | Summer Plan | Visual month view showing family events and camp sessions | Michelle, Scot | Yes |
| P0 | Family events | Add vacations and blocked time as scheduling anchors | Michelle | Yes |
| P0 | Planned vs Confirmed status | Track tentative vs committed activities | Michelle | Yes |
| P0 | Signup deadline tracking | Record enrollment open dates; surface upcoming deadlines | Michelle | Yes |
| P1 | Priority tiers | Categorize camps as Must-Have, Nice-to-Have, or Backup | Michelle | No |
| P1 | Waitlist tracking | Mark camps as waitlisted; link backup options | Michelle | Yes |
| P1 | Calendar export | Push signup reminders to Google/Outlook calendar | Michelle | Yes |
| P1 | Camp categorization | Add topic/category to camps (STEM, Creative, Outdoor, etc.) | Michelle | No |
| P2 | Dashboard view | Upcoming signup deadlines + Summer Plan overview | Michelle | No |
| P2 | Logistics view | Daily pickup/dropoff times and locations at a glance | Michelle, Scot | No |
| P2 | Camp discovery/search | Find camps by criteria (location, age, topic, cost) | Michelle | No |
| P3 | AI recommendations | Suggest balanced schedules based on criteria | Michelle | No |

### 6.2 "I Can..." Statements

**As Michelle (Planning Parent):**
- [ ] I can add a summer camp with all its details so that I have a single source of truth
- [ ] I can paste a camp URL and have the app extract camp details so that I save time on data entry
- [ ] I can see my whole summer on a month view so that I can spot gaps and conflicts
- [ ] I can mark our family vacation so that camps are planned around it
- [ ] I can set a camp as "planned" or "confirmed" so that I know what's locked in
- [ ] I can record signup deadlines so that I never miss an enrollment window
- [ ] I can rank camps by preference so that I know which to prioritize
- [ ] I can track waitlists so that I have backups ready if a camp fills up
- [ ] I can export signup dates to my calendar so that I get reminders
- [ ] I can schedule a camp from my catalog onto the Summer Plan so that I build my summer from researched options
- [ ] I can click a date on the Summer Plan and pick a camp to fill that slot so that I can plan while viewing availability
- [ ] I can see which catalog camps are already scheduled so that I know what's placed vs. still considering
- [ ] I can quickly add a new camp directly to the Summer Plan so that I don't lose momentum when I find something
- [ ] I can edit or remove a scheduled session so that I can adjust my plan as things change
- [ ] I can see session costs in the catalog and an estimated total cost for my planned summer so that I can manage my budget

**As Scot (Co-Parent):**
- [ ] I can view the Summer Plan so that I know what's planned
- [ ] (P2) I can see pickup/dropoff details so that I can help with logistics

---

## 7. User Stories

### 7.1 Epic: Camp Catalog Management

> **Primary workflow:** User pastes a camp URL → app scrapes details → user reviews and saves. Manual entry is the fallback when scraping fails or for camps without websites.

#### Story 7.1.1: Add Camp via URL (Primary)
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | paste a camp website URL and have the app extract camp details |
| **So that** | I can quickly add camps without manual data entry |
| **Acceptance Criteria** | <ul><li>[ ] "Add Camp" flow prompts for URL as the first/primary input</li><li>[ ] App scrapes and extracts: name, location, address, dates/sessions, daily schedule, cost, age range, description</li><li>[ ] Extracted data displayed in editable form for user review</li><li>[ ] User can correct or enhance any scraped field before saving</li><li>[ ] Original URL saved and linked to camp record</li><li>[ ] "Can't find a URL? Enter manually" option visible but secondary</li><li>[ ] Progress indicator during scraping</li></ul> |
| **Priority** | P0 |
| **Estimate** | L |

#### Story 7.1.2: Add Camp Manually (Fallback)
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | manually enter camp details when URL scraping isn't available |
| **So that** | I can still add camps that don't have scrapable websites |
| **Acceptance Criteria** | <ul><li>[ ] Accessible via "Enter manually" link from URL input screen</li><li>[ ] Also triggered automatically when scraping fails with option to retry or continue manually</li><li>[ ] Can enter: name (required), location, address, cost, URL (optional)</li><li>[ ] Can enter: session dates, daily schedule (start/end times)</li><li>[ ] Can enter: signup open date, age range</li><li>[ ] Can add custom benefits/tags</li><li>[ ] Camp appears in catalog list</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.1.3: Edit/Delete a Camp
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | edit or remove a camp from my catalog |
| **So that** | I can keep information accurate or remove camps I'm no longer considering |
| **Acceptance Criteria** | <ul><li>[ ] Can edit any field (same form as manual entry)</li><li>[ ] Can re-scrape from URL to refresh data (with merge/overwrite options)</li><li>[ ] Can delete a camp with confirmation dialog showing impact</li><li>[ ] Deleting a camp removes associated scheduled sessions from Summer Plan</li><li>[ ] Edit history or "last updated" timestamp visible</li></ul> |
| **Priority** | P0 |
| **Estimate** | S |

#### Story 7.1.4: Priority Tiers (Post-MVP)
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | categorize camps by priority tier |
| **So that** | I know which camps to pursue first and which are backups |
| **Acceptance Criteria** | <ul><li>[ ] Can assign priority: Must-Have, Nice-to-Have, or Backup</li><li>[ ] Catalog can sort/group by priority tier</li><li>[ ] Priority displayed on camp cards with visual distinction</li></ul> |
| **Priority** | P1 (Post-MVP) |
| **Estimate** | S |

### 7.2 Epic: Summer Plan

#### Story 7.2.1: View Summer Plan
| Field | Value |
|-------|-------|
| **As a** | Planning Parent or Co-Parent |
| **I want to** | see a visual month view of the summer |
| **So that** | I understand the overall plan at a glance |
| **Acceptance Criteria** | <ul><li>[ ] Summer Plan defaults to month view, showing late May through August</li><li>[ ] Family events displayed distinctly from camps</li><li>[ ] Planned vs Confirmed visually differentiated</li><li>[ ] Clicking an item shows details</li></ul> |
| **Priority** | P0 |
| **Estimate** | L |

#### Story 7.2.2: Add Family Event
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | add a family vacation or blocked time |
| **So that** | camps are scheduled around our priorities |
| **Acceptance Criteria** | <ul><li>[ ] Can enter: name, dates, optional notes</li><li>[ ] Event appears on Summer Plan</li><li>[ ] Blocked time prevents camp scheduling conflicts (warning)</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.2.3: Schedule a Camp Session
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | add a camp session to the Summer Plan |
| **So that** | I can build my summer schedule |
| **Acceptance Criteria** | <ul><li>[ ] Can select camp from catalog and assign dates</li><li>[ ] Can set status: Planned or Confirmed</li><li>[ ] Session appears on Summer Plan</li><li>[ ] Warning if overlaps with family event or another session</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

### 7.3 Epic: Signup & Waitlist Tracking

#### Story 7.3.1: View Upcoming Signup Deadlines
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | see which camps have signup windows opening soon |
| **So that** | I can act immediately when enrollment opens |
| **Acceptance Criteria** | <ul><li>[ ] Dashboard or list shows camps sorted by signup date</li><li>[ ] Highlights deadlines in next 7/14/30 days</li><li>[ ] Can filter to only show non-confirmed camps</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.3.2: Export Signup Dates to Calendar
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | push signup deadlines to my Google/Outlook calendar |
| **So that** | I get reminders on my phone |
| **Acceptance Criteria** | <ul><li>[ ] Can export selected camps' signup dates as .ics</li><li>[ ] Or: direct integration with Google Calendar API</li><li>[ ] Events include camp name and link</li></ul> |
| **Priority** | P1 |
| **Estimate** | M |

#### Story 7.3.3: Track Waitlist Status
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | mark a camp as waitlisted and link a backup |
| **So that** | I know my contingency plan |
| **Acceptance Criteria** | <ul><li>[ ] Can set camp session status to "Waitlisted"</li><li>[ ] Can link backup camp to a waitlisted session</li><li>[ ] Backup camp shown in Summer Plan view</li></ul> |
| **Priority** | P1 |
| **Estimate** | S |

### 7.4 Epic: Logistics View (Phase 2)

#### Story 7.4.1: View Daily Logistics
| Field | Value |
|-------|-------|
| **As a** | Planning Parent or Co-Parent |
| **I want to** | see pickup/dropoff times and locations for each day |
| **So that** | I can plan my workday around kid logistics |
| **Acceptance Criteria** | <ul><li>[ ] Day view shows: camp name, location, dropoff time, pickup time</li><li>[ ] Can view a week at a glance</li><li>[ ] Location links to map</li></ul> |
| **Priority** | P2 |
| **Estimate** | M |

### 7.5 Epic: Catalog & Summer Plan Integration

#### Story 7.5.1: Schedule Camp from Catalog
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | select a camp from my catalog and add it to the Summer Plan |
| **So that** | I can build my summer schedule from camps I've researched |
| **Acceptance Criteria** | <ul><li>[ ] From camp detail view, "Add to Summer Plan" button opens scheduling dialog</li><li>[ ] Dialog shows camp's available date options (if defined) or allows custom date entry</li><li>[ ] User selects/enters session dates (start/end)</li><li>[ ] User sets initial status (Planned or Confirmed)</li><li>[ ] Session appears on Summer Plan linked to the catalog camp</li><li>[ ] Camp's signup date (if set) is automatically added to the Signup Task list</li><li>[ ] Can schedule same camp multiple times (multiple weeks)</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.5.2: Schedule Camp from Summer Plan
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | click on a Summer Plan date and add a camp session |
| **So that** | I can fill gaps while viewing my schedule |
| **Acceptance Criteria** | <ul><li>[ ] Click empty date or date range on Summer Plan opens "Add" menu</li><li>[ ] Can choose "Add Camp Session" or "Add Family Event"</li><li>[ ] Camp session option shows searchable list of catalog camps</li><li>[ ] Selected dates pre-fill from Summer Plan selection</li><li>[ ] Warning if selected camp doesn't offer sessions on those dates (when date options exist)</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.5.3: View Catalog Scheduling Status
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | see which catalog camps are already on my Summer Plan |
| **So that** | I know what's scheduled vs. still being considered |
| **Acceptance Criteria** | <ul><li>[ ] Catalog list shows badge/indicator: "Scheduled" with count (e.g., "2 sessions")</li><li>[ ] Can filter catalog to show only unscheduled camps</li><li>[ ] Camp detail view lists all scheduled sessions with dates and status</li></ul> |
| **Priority** | P1 |
| **Estimate** | S |

#### Story 7.5.4: Edit Scheduled Session
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | change the dates or status of a scheduled camp session |
| **So that** | I can adjust my plan as things change |
| **Acceptance Criteria** | <ul><li>[ ] Click session on Summer Plan opens detail/edit panel</li><li>[ ] Can change dates (drag on Summer Plan or edit in form)</li><li>[ ] Can change status (Planned → Confirmed → Waitlisted)</li><li>[ ] Can add/change backup session</li><li>[ ] Conflict warnings update in real-time</li></ul> |
| **Priority** | P0 |
| **Estimate** | M |

#### Story 7.5.5: Remove Session from Summer Plan
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | remove a camp session from the Summer Plan |
| **So that** | I can clear slots that didn't work out |
| **Acceptance Criteria** | <ul><li>[ ] Delete option in session detail view</li><li>[ ] Confirmation dialog with session details</li><li>[ ] Camp remains in catalog after session is deleted</li><li>[ ] If session had a backup linked, prompt to promote backup or remove both</li></ul> |
| **Priority** | P0 |
| **Estimate** | S |

#### Story 7.5.6: Quick Add Camp (Bypass Catalog)
| Field | Value |
|-------|-------|
| **As a** | Planning Parent |
| **I want to** | add a camp directly to the Summer Plan without first adding to catalog |
| **So that** | I can quickly capture a camp I just found |
| **Acceptance Criteria** | <ul><li>[ ] "Quick Add" option when adding from Summer Plan</li><li>[ ] Minimal required fields: name, dates</li><li>[ ] Camp is automatically added to catalog</li><li>[ ] Can enrich camp details later</li></ul> |
| **Priority** | P1 |
| **Estimate** | S |

---

## 8. Information Architecture & Data Model

### 8.1 Core Entities
| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Camp | A summer camp program in the user's catalog | id, name, location, address, cost, costPer (week/day/session), url, ageMin, ageMax, signupDate, dailyStartTime, dailyEndTime, benefits[], notes, topic (P1), priority (P1 post-MVP: must/nice/backup) |
| CampDateOption | An available date range offered by a camp (optional) | id, campId, startDate, endDate, label (e.g., "Week 1", "Session A") |
| ScheduledSession | A camp session placed on the user's Summer Plan | id, campId, summerId, startDate, endDate, status (planned/confirmed/waitlisted), backupSessionId, notes |
| FamilyEvent | Vacation or blocked time on the Summer Plan | id, summerId, name, startDate, endDate, eventType (vacation/blocked/other), notes |
| Child | A child in the family | id, name, birthDate, notes |
| Summer | A planning year container | id, year, childId, name (e.g., "Summer 2026 - Emma") |

### 8.2 Catalog vs. Summer Plan Relationship

**Camp Catalog** (global, reusable):
- Contains all camps the user has researched or added
- Camps persist across years for reuse
- Each camp can optionally have predefined CampDateOptions (the dates the camp offers)
- Camps exist independently of whether they're scheduled

**Summer Plan** (per-child, per-year):
- Contains ScheduledSessions and FamilyEvents for a specific summer
- ScheduledSessions reference camps from the catalog
- User can schedule custom dates even if camp has predefined options
- Multiple sessions from the same camp are allowed (e.g., Week 2 and Week 5)

**Workflow:**
```
[Camp Catalog]                    [Summer Plan]
     |                                   |
     |  (1) Browse/search camps          |
     |                                   |
     +--- "Add to Summer Plan" --------> + Creates ScheduledSession
     |                                   |   - Links to Camp via campId
     |                                   |   - User picks dates
     |                                   |   - Sets status
     |                                   |
     |  (2) Or from Summer Plan:         |
     |                                   |
     | <--- "Pick from Catalog" ---------+ User clicks date
     |                                   |   - Selects camp
     +--- Selected camp ---------------> + Creates ScheduledSession
     |                                   |
     |  (3) Quick Add (bypass):          |
     |                                   |
     | <--- Auto-create Camp ------------+ User enters minimal info
     +--- Camp added to catalog          + Creates ScheduledSession
```

### 8.3 Entity Relationships
```
Child (1) --- (*) Summer
Summer (1) --- (*) ScheduledSession
Summer (1) --- (*) FamilyEvent
Camp (1) --- (*) CampDateOption [optional predefined dates]
Camp (1) --- (*) ScheduledSession
ScheduledSession (0..1) --- (0..1) ScheduledSession [backup]
```

### 8.4 Data Flow
1. User creates a Summer for a specific year/child
2. User adds FamilyEvents (vacations) to the Summer - these are scheduling anchors
3. User adds Camps to the global catalog (via URL scrape or manual entry)
4. Optionally, user adds CampDateOptions to camps that have specific session dates
5. User schedules ScheduledSessions from the catalog onto the Summer Plan
   - Can select from predefined CampDateOptions or enter custom dates
   - System warns of conflicts with FamilyEvents or other sessions
6. User updates session status as signups are completed (Planned → Confirmed)
7. User manages waitlists by linking backup sessions
8. User exports signup dates to external calendar for reminders

---

## 9. Tech Stack

### 9.1 Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React + Next.js | Popular, great DX, easy deployment |
| Design System | Material UI (MUI) | Comprehensive component library, built-in accessibility, responsive design support |
| State Management | React Context + hooks | Simple; no heavy state needs |
| Calendar | MUI Date Pickers + custom calendar grid | Consistent with design system |

### 9.2 Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | Node.js | Matches frontend; simple full-stack |
| Framework | Next.js API routes | Unified codebase |
| Storage | Markdown files in Git repo | Zero infrastructure; version controlled; human-readable; portable |
| Auth | None for MVP (single user) | Personal app; add later if shared |

### 9.3 Data Storage Structure
```
/data
  /2026                          # Year folder
    /camps                        # Camp catalog
      camp-robotics-academy.md    # One file per camp
      camp-art-explorers.md
    /summer-emma                  # Summer plan for a child
      summer.md                   # Summer metadata
      /sessions                   # Scheduled sessions
        session-001.md
        session-002.md
      /events                     # Family events
        vacation-beach.md
    /summer-jack                  # Another child's summer
      ...
```

**Camp File Format (example):**
```markdown
---
id: camp-robotics-academy
name: Robotics Academy
# topic: STEM / Engineering  # P1 feature - uncomment when categorization is added
location: Tech Center
address: 123 Innovation Dr, Seattle WA
cost: 450
costPer: week
url: https://example.com/robotics
ageMin: 7
ageMax: 12
signupDate: 2026-02-15
dailyStartTime: "09:00"
dailyEndTime: "16:00"
benefits: ["Full Day", "STEM Focus", "Kid's Choice"]
# priority: must                   # P1 post-MVP - uncomment when ready (must/nice/backup)
createdAt: 2026-02-01
updatedAt: 2026-02-01
---

## Notes
Emma loved their open house. Good instructor ratio.

## Available Sessions
- Week 1: June 15-19
- Week 2: June 22-26
- Week 5: July 13-17
```

### 9.4 Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | Vercel or local | Free tier; easy Next.js deploy |
| CI/CD | GitHub Actions | Automate on push |
| Monitoring | None for MVP | Add if needed |

---

## 10. User Experience & Design

### 10.1 Design System

**Material UI (MUI)** is the chosen design system for this application.

| Aspect | Specification |
|--------|---------------|
| **Component Library** | MUI Core (@mui/material) |
| **Icons** | MUI Icons (@mui/icons-material) |
| **Theme** | Custom theme extending MUI defaults |
| **Typography** | Roboto font family (MUI default) |
| **Color Palette** | Primary: Blue (#1976d2), Secondary: Amber (#ffc107), Error: Red (#d32f2f), Success: Green (#2e7d32) |
| **Spacing** | 8px base unit (MUI default) |
| **Border Radius** | 4px default, 8px for cards |

### 10.2 Responsive Design

The app must work across devices. Use MUI's breakpoint system:

| Breakpoint | Width | Target Device | Layout Behavior |
|------------|-------|---------------|----------------|
| `xs` | 0-599px | Mobile phones | Single column, stacked navigation, bottom nav |
| `sm` | 600-899px | Tablets (portrait) | Single/two column hybrid, collapsible sidebar |
| `md` | 900-1199px | Tablets (landscape), small laptops | Two column, persistent sidebar |
| `lg` | 1200-1535px | Desktops | Full layout, expanded Summer Plan view |
| `xl` | 1536px+ | Large monitors | Maximum content width (1400px), centered |

**Layout Specifications:**

| Component | Mobile (xs-sm) | Tablet (md) | Desktop (lg+) |
|-----------|----------------|-------------|---------------|
| Navigation | Bottom navigation bar | Collapsible drawer | Persistent left sidebar (240px) |
| Summer Plan | Week view default, swipeable | Month view, scrollable | Month view with detail panel |
| Camp catalog | Card list, vertical scroll | Grid (2 columns) | Grid (3-4 columns) or table view toggle |
| Forms | Full-width, stacked fields | Two-column where logical | Two-column with preview |
| Modals/Dialogs | Full-screen on mobile | Centered dialog (max 600px) | Centered dialog (max 600px) |

### 10.3 Accessibility (a11y)

**WCAG 2.1 AA Compliance Target**

| Requirement | Implementation |
|-------------|----------------|
| **Color contrast** | Minimum 4.5:1 for normal text, 3:1 for large text; MUI defaults meet this |
| **Keyboard navigation** | All interactive elements focusable and operable via keyboard; visible focus indicators |
| **Screen reader support** | Semantic HTML, ARIA labels on icons and actions, live regions for dynamic updates |
| **Focus management** | Return focus to trigger after modal close; logical tab order |
| **Text sizing** | Support browser zoom up to 200% without horizontal scroll |
| **Motion** | Respect `prefers-reduced-motion`; provide option to disable animations |
| **Touch targets** | Minimum 44x44px for interactive elements on touch devices |

**Specific Accessibility Features:**
- Skip-to-content link at top of page
- Descriptive link text (no "click here")
- Form labels associated with inputs
- Error messages announced to screen readers
- Summer Plan navigation via arrow keys
- Status/confirmation messages use ARIA live regions

### 10.4 Human-Centered Design Principles

| Principle | Application in Summer Camp Planner |
|-----------|------------------------------------|
| **Reduce cognitive load** | Progressive disclosure: show essential info first, details on demand; limit choices per screen |
| **Support user control** | Undo for deletions; confirm destructive actions; easy escape from modals |
| **Provide feedback** | Loading indicators, success/error toasts, inline validation |
| **Prevent errors** | Disable invalid actions; pre-fill defaults; warn on conflicts (overlapping camp dates) |
| **Recognition over recall** | Show camp names in dropdowns, not IDs; visual Summer Plan instead of date lists |
| **Consistency** | Same patterns for similar actions; predictable component placement |
| **Flexibility** | Multiple ways to add camps (form, URL paste, quick add); sort/filter options |

### 10.5 Interaction Patterns

| Action | Pattern |
|--------|----------|
| **Add new item** | FAB (floating action button) on mobile; "+ Add" button in section header on desktop |
| **Edit item** | Click row/card to open detail view; inline edit where appropriate |
| **Delete item** | Icon button with confirmation dialog; include item name in confirmation |
| **View details** | Click to expand (accordion) or navigate to detail page; side panel on desktop |
| **Drag-and-drop** | For reordering camp ranks; with keyboard alternative (move up/down buttons) |
| **Date selection** | MUI DatePicker for single dates; DateRangePicker for camp sessions |
| **Status change** | Dropdown or segmented button (Planned → Confirmed → Waitlisted) |

### 10.6 Visual Hierarchy & Information Architecture

**Page Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  App Bar (logo, title, global actions)                  │
├───────────┬─────────────────────────────────────────────┤
│           │                                             │
│  Sidebar  │  Main Content Area                          │
│  (nav)    │  ┌───────────────────────────────────────┐  │
│           │  │ Page Header + Actions                 │  │
│  - Dash   │  ├───────────────────────────────────────┤  │
│  - Camps  │  │                                       │  │
│  - Cal    │  │  Primary Content                      │  │
│  - Signup │  │  (Summer Plan, list, form)            │  │
│  - Logist │  │                                       │  │
│           │  └───────────────────────────────────────┘  │
└───────────┴─────────────────────────────────────────────┘
```

**Visual Cues for Camp Status:**
| Status | Color | Icon | Badge |
|--------|-------|------|-------|
| Planned | Gray (#9e9e9e) | Outline calendar | Dashed border |
| Confirmed | Green (#2e7d32) | Check circle | Solid fill |
| Waitlisted | Amber (#ffc107) | Hourglass | Striped pattern |
| Signup Soon | Blue (#1976d2) | Notification bell | Pulsing dot |
| Missed | Red (#d32f2f) | Warning | Strikethrough |

**Family Events vs Camp Sessions:**
| Type | Summer Plan Color | Shape |
|------|----------------|-------|
| Family vacation | Purple (#7b1fa2) | Rounded, full-width bar |
| Camp session | Status-based (see above) | Rectangular block |
| Free/unplanned | Light gray dashed | Background highlight |

### 10.7 Loading & Empty States

| State | Design |
|-------|--------|
| **Loading** | Skeleton components matching content shape; MUI Skeleton |
| **Empty catalog** | Illustration + "Add your first camp" CTA; link to URL paste for quick start |
| **Empty Summer Plan** | Illustration + prompt to add family vacation first |
| **No signup deadlines** | Positive message: "No upcoming deadlines - you're all set!" |
| **Error state** | Error alert with retry action; preserve user input |

### 10.8 Notifications & Feedback

| Feedback Type | Component | Duration |
|---------------|-----------|----------|
| Success (save, add) | Snackbar (bottom-left) | 3 seconds, auto-dismiss |
| Error | Snackbar (bottom-left) with action | Persistent until dismissed |
| Warning (conflict) | Inline alert in context | Persistent |
| Info/tip | Tooltip on hover/focus | While hovering |
| Destructive confirm | Dialog with explicit action buttons | Until user responds |

---

## 11. Non-Functional Requirements

### 11.1 Performance
- [ ] Page load time: < 2 seconds
- [ ] Summer Plan renders smoothly with 50+ events
- [ ] Works on desktop and tablet

### 11.2 Security
- [ ] Data stored locally or in authenticated cloud
- [ ] No sensitive data beyond family names and schedules

### 11.3 Accessibility
See Section 10.3 for detailed accessibility requirements.

### 11.4 Scalability
Personal/family use; multi-user or sharing not required for MVP.

### 11.5 Reliability
- [ ] Data persists across sessions
- [ ] Can export/backup data

---

## 12. MVP Definition

### 12.1 What's IN the MVP (Phase 1: Planning)
- Camp catalog (add, edit, delete, rank)
- URL scraping to auto-populate camp details (with manual entry fallback)
- Summer Plan month view
- Family events (vacations)
- Camp session scheduling with planned/confirmed status
- Signup Task list (with auto-add when camps are scheduled)

### 12.2 Phase 2: Summer Execution
Delivered as summer begins, focused on day-to-day logistics:
- Dashboard view (signup deadlines + Summer Plan overview)
- Logistics view (daily pickup/dropoff schedule)
- Calendar API integration (Google/Outlook sync)
- Camp categorization (STEM, Creative, Outdoor, etc.)
- Multi-child support

### 12.3 Phase 3 & Beyond
| Feature | Target Phase | Rationale for Deferral |
|---------|--------------|------------------------|
| Camp discovery/search | Phase 3 | Requires external data sources |
| Budget modeling | Phase 3 | Stretch goal |
| AI recommendations | Phase 3+ | Stretch goal |
| Sharing/collaboration | Phase 3+ | Personal use first |

---

## 13. Constraints

### 13.1 Technical Constraints
- Must work on desktop browser (mobile-friendly nice-to-have)
- Should be buildable by one person with AI assistance
- Prefer simple stack to minimize maintenance

### 13.2 Business Constraints
- Zero budget for infrastructure (use free tiers)
- Must be usable for Summer 2026 planning (functional by March 2026)

### 13.3 Regulatory/Compliance
- No child data shared externally
- If open-sourced, no PII in repo

---

## 14. Out of Scope

- Camp registration/payment processing
- Communication with camps
- Social features (sharing with other families)
- Mobile native app
- Camp reviews or ratings from external sources
- Automated camp discovery (finding new camps without user-provided URLs)

---

## 15. Assumptions & Dependencies

### 15.1 Assumptions
| Assumption | Impact if Wrong |
|------------|-----------------|
| User has internet access for cloud version | Would need offline-first architecture |
| Camp websites have scrapable content | Manual entry fallback available |
| Single family/user for MVP | Would need auth and multi-tenancy |
| Camps have predictable signup dates | App value reduced if dates unpredictable |

### 15.2 Dependencies
| Dependency | Type | Owner | Risk Level |
|------------|------|-------|------------|
| Camp websites for information | External | Various | Low (manual fallback) |
| Calendar export compatibility | External | Google/Microsoft | Low (standard .ics) |
| Hosting platform | External | Vercel | Low (alternatives available) |

---

## 16. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Time to build exceeds available time | Medium | High | Ruthless MVP scoping; use AI assistance |
| URL scraping fails on some camp sites | Medium | Low | Manual entry fallback; user can edit extracted data |
| Summer Plan view complexity | Medium | Medium | Use existing library; keep simple |
| Scope creep | High | Medium | Strict MVP boundaries; track backlog |

---

## 17. Wireframes & Mockups

> Wireframes are stored in `/docs/wireframes/`

### 17.1 Key Screens
- [x] Camp Catalog: List/grid of all camps with key details → [add-camp-flow.md](wireframes/add-camp-flow.md)
- [x] Add Camp: URL input → scraping → review/edit form → [add-camp-flow.md](wireframes/add-camp-flow.md)
- [x] Summer Plan: Month view with events and sessions → [summer-plan-view.md](wireframes/summer-plan-view.md)
- [x] Signup Tasks: List of upcoming signup deadlines → [signup-tasks-view.md](wireframes/signup-tasks-view.md)
- [ ] (P2) Dashboard: Upcoming signup deadlines + Summer Plan overview
- [ ] (P2) Logistics View: Daily/weekly pickup-dropoff schedule

### 17.2 User Flows
- [x] Flow 1: Add a new camp to catalog → [add-camp-flow.md](wireframes/add-camp-flow.md)
- [x] Flow 2: Build summer schedule (add vacation → add camp sessions) → [summer-plan-view.md](wireframes/summer-plan-view.md)
- [x] Flow 3: Track signup and update status to confirmed → [signup-tasks-view.md](wireframes/signup-tasks-view.md)
- [ ] (P2) Flow 4: View daily logistics during summer

---

## 18. Glossary

| Term | Definition |
|------|------------|
| Camp | A summer program (day camp, overnight camp, sports camp, etc.) |
| Session | A specific date range when a child attends a camp |
| Signup Date | The date when enrollment opens for a camp |
| Planned | A tentative schedule entry, not yet registered |
| Confirmed | A schedule entry that has been registered/paid |
| Waitlisted | Signed up but not yet guaranteed a spot |
| Priority Tier | Categorization of camps: Must-Have, Nice-to-Have, or Backup |

---

## 19. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | Feb 1, 2026 | [Author] | Initial draft from press release |

---

## 20. Appendix

### 20.1 Research & References
- [Press Release](press-release.md) - Original vision document

### 20.2 Open Questions
- [x] ~~How to handle camps with multiple session options?~~ → Resolved: CampDateOption entity stores predefined dates; user can also enter custom dates (see Section 8.2)
- [x] ~~Include cost tracking in MVP or defer?~~ → Resolved: Yes, display session cost in catalog + "Estimated Total Cost" for planned/confirmed camps
- [x] ~~Local-only vs. cloud from the start?~~ → Resolved: Markdown files in folder structure (year/camps), no database infrastructure, Git-versioned
