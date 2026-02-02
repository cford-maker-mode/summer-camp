---
# Camp Template
# Copy this file to /data/{year}/camps/camp-{slug}.md
# Replace all {placeholders} with actual values

id: camp-{slug}
name: {Camp Name}
location: {Facility Name}
address: {Street Address, City ST ZIP}
cost: {numeric-cost}               # Minimum or single cost
costMax:                           # Maximum cost if range (leave blank if single price)
costPer: week                      # week | day | session
url: {https://camp-website.com}
ageMin: {min-age}                  # Use age OR grade, not both
ageMax: {max-age}
gradeMin:                          # Grade level alternative to age
gradeMax:
signupDate: {YYYY-MM-DD}           # When enrollment opens
overnight:                         # true for overnight camps (no daily times)
dailyStartTime: \"{HH:MM}\"          # 24-hour format, quoted (leave blank if overnight)
dailyEndTime: \"{HH:MM}\"            # 24-hour format, quoted (leave blank if overnight)
benefits: []                       # e.g., ["Full Day", "Lunch Included"]
rank:                              # 1 = top choice, leave blank if unranked
createdAt: {YYYY-MM-DD}
updatedAt: {YYYY-MM-DD}
# topic:                           # P1 feature - uncomment when ready
---

## Notes

{Add notes about this camp - impressions from open house, what your child said, etc.}

## Available Sessions

{List the session dates this camp offers, if known}

- {Session label}: {Month Day}-{Day}
- {Session label}: {Month Day}-{Day}
