---
**Note:** This protocol is intended for use by the project owner and AI assistants. It serves as a reference for generating, reviewing, and maintaining high-quality code changes in this project.
---
# Code Change Protocol

## Change Request Process
- Submit a pull request or issue for proposed changes.

## Review Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Change is scoped and clear

## Commit Guidelines
- Use descriptive commit messages.
- Link to related issues.

## Rollback/Revert Instructions
- Use `git revert` or reset as needed.

## Automated Checks
- CI/CD runs build, test, lint.

## Documentation Update
- After every code change, update docs/project-reference.md if features, architecture, or conventions are affected.

## Enhanced Code Change Protocol (2026)

- All code changes must:
  - Use TypeScript types for all new/modified code.
  - Include error handling (try/catch, user feedback) in APIs and UI.
  - Refactor large components into smaller, focused units.
  - Update docs/project-reference.md for architecture, data flow, and features.
  - Add unit and integration tests for critical logic and API routes.
  - Perform accessibility and security checks for new UI and APIs.
  - Pass automated linting, formatting, and CI checks before merging.
  - Use clear commit messages and scoped PRs.

- Review checklist:
  - [ ] Types present
  - [ ] Error handling
  - [ ] Tests added/updated
  - [ ] Docs updated
  - [ ] Accessibility/security checked
  - [ ] CI passes
