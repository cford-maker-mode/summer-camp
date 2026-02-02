# Tech Stack

The app is a frontend-only single-page application built with React. There is no backend or infrastructure required — the app runs entirely in the browser, making it simple to set up and easy for others to replicate locally or host for free.

**Navigation and pages** are handled with React Router, a lightweight routing library that enables multiple distinct pages — such as camp discovery, schedule planning, and sign-up tracking — with smooth navigation between them. All routing stays client-side, so no backend is needed to support it.

**Data** is stored locally, structured in markdown and JSON files. Markdown is used for human-readable camp and preference data, making it easy to customize and contribute to. JSON handles the structured data the app reads and writes at runtime.

**Calendar integration** is handled through `.ics` file generation and download. The `.ics` format is the standard for calendar files and is supported by Google Calendar, Outlook, Apple Calendar, and others. Users can export sign-up reminders and camp schedules directly into their calendar app of choice.

**Development tooling** includes GitHub Copilot and AI assistance throughout the build process. The project is developed with the intent to be open source and community-friendly — minimal dependencies, clear data structures, and no proprietary tooling required to contribute.
