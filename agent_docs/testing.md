# Testing Strategy
- **Unit Tests:** Jest or Vitest for utility functions and hooks.
- **E2E Tests:** Playwright or Cypress for core user flows (Lesson reading -> Reflection submission -> Peer reveal).
- **Manual Checks:** Verify guest mode local storage limits, test responsive design on mobile viewports, verify < 2s load times.
- **Pre-commit Hooks:** Husky + lint-staged to run ESLint and Prettier before commit.
- **Verification Loop:** Run checks after each feature and fix failures before opening PRs.
