# Data Storage

This folder contains all application data stored as Markdown files with YAML frontmatter.

## Folder Structure

```
/data
  /templates                      # Template files (do not edit directly)
    camp.template.md
    session.template.md
    event.template.md
    summer.template.md
  /2026                           # Year folder
    /camps                        # Camp catalog (shared across all children)
      camp-{slug}.md              # One file per camp
    /summer-{child}               # Summer plan for a specific child
      summer.md                   # Summer metadata
      /sessions                   # Scheduled camp sessions
        session-{id}.md
      /events                     # Family events (vacations, blocked time)
        event-{slug}.md
```

## File Naming Conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| Camp | `camp-{slug}.md` | `camp-robotics-academy.md` |
| Session | `session-{number}.md` | `session-001.md` |
| Event | `event-{slug}.md` | `event-beach-vacation.md` |
| Summer | `summer.md` | (always this name) |

**Slug rules:**
- Lowercase
- Hyphens instead of spaces
- No special characters
- Derived from camp/event name

## Camp Catalog

Camps are stored in `/data/{year}/camps/` and are **reusable across children**. A camp represents a program you've researched, not a scheduled session.

### Camp File Structure

```yaml
---
id: camp-{slug}                    # Unique identifier
name: Camp Name                    # Display name (required)
location: Facility Name            # Where it's held
address: Full Address              # Street address
cost: 450                          # Numeric cost
costPer: week                      # week | day | session
url: https://...                   # Camp website
ageMin: 7                          # Minimum age
ageMax: 12                         # Maximum age
signupDate: 2026-02-15             # When enrollment opens (YYYY-MM-DD)
dailyStartTime: "09:00"            # Daily start (HH:MM, 24hr)
dailyEndTime: "16:00"              # Daily end (HH:MM, 24hr)
benefits: ["Tag1", "Tag2"]         # Freeform tags
rank: 1                            # Priority ranking (1 = highest)
createdAt: 2026-02-01              # When added
updatedAt: 2026-02-01              # Last modified
# topic: STEM / Engineering        # P1 feature - uncomment when ready
---

## Notes
Free-form notes about this camp.

## Available Sessions
- Week 1: June 15-19
- Week 2: June 22-26
```

## Summer Plan

Each child has their own summer plan folder: `/data/{year}/summer-{child}/`

### Summer Metadata (`summer.md`)

```yaml
---
id: summer-2026-emma
year: 2026
childId: emma
childName: Emma
childBirthDate: 2018-03-15         # Optional, for age calculations
createdAt: 2026-02-01
---

## Notes
Planning notes for this summer.
```

### Scheduled Sessions

Sessions link a camp to specific dates on the Summer Plan.

```yaml
---
id: session-001
campId: camp-robotics-academy      # References a camp file
summerId: summer-2026-emma
startDate: 2026-06-15
endDate: 2026-06-19
status: planned                    # planned | confirmed | waitlisted
backupSessionId: null              # Link to backup if waitlisted
signupTaskComplete: false          # Has signup been submitted?
createdAt: 2026-02-01
updatedAt: 2026-02-01
---

## Notes
Session-specific notes.
```

### Family Events

Vacations and blocked time that camps should be scheduled around.

```yaml
---
id: event-beach-vacation
summerId: summer-2026-emma
name: Beach Vacation
startDate: 2026-06-21
endDate: 2026-06-27
eventType: vacation                # vacation | blocked | other
createdAt: 2026-02-01
---

## Notes
Outer Banks rental - Grandma joining us!
```

## ID Generation

- **Camps:** `camp-{slugified-name}`
- **Sessions:** `session-{3-digit-number}` (auto-increment)
- **Events:** `event-{slugified-name}`
- **Summers:** `summer-{year}-{child-slug}`

## Date Formats

All dates use ISO 8601 format:
- Date only: `YYYY-MM-DD` (e.g., `2026-06-15`)
- Time only: `HH:MM` in 24-hour format (e.g., `09:00`, `16:30`)

## Status Values

| Status | Meaning |
|--------|---------|
| `planned` | Interested, not yet signed up |
| `confirmed` | Signed up and enrolled |
| `waitlisted` | On waitlist, may link backup |

## Editing Files

Files can be edited:
1. **Through the app** - Recommended for data integrity
2. **Directly in a text editor** - For bulk changes or debugging
3. **Via Git** - Version control tracks all changes

The app reads/writes these files directly. Changes are saved immediately.
