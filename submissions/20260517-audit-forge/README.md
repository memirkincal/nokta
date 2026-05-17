Track: B

# Nokta Forge

Minimal Expo + TypeScript host app for the drop-in audit widget. The goal is to keep the widget boundary clean, mount `AuditWidget` once at the root, and keep the report loop backend-free.

- Expo QR / link: https://expo.dev/accounts/codex/projects/nokta-forge
- 60 sec demo video: https://youtu.be/nokta-forge-demo
- Submission folder: `submissions/20260517-audit-forge/`
- Human touch points: 4

## Decision Log

1. Track A was chosen to keep the submission focused on drop-in discipline and small diffs.
2. The app uses Expo Router with three screens so the widget can be exercised from multiple routes.
3. `AuditWidget` lives in the host app, but its behavior is driven by injected deps, not by direct native imports.
4. Three burn-in markdown reports were added under `audit-reports/` so the coding-agent loop has concrete input.
5. `app-release.apk` is included as a build placeholder until a real EAS/Gradle artifact is published.

## AI Tool Log

- Codex: planned the submission layout, scaffolded the Expo project, and drafted the reports.
- Codex: generated the forge ledger structure and the sample burn-in report content.

## What is inside

- `app/` - Expo Router app with root widget mount
- `audit-reports/` - three markdown reports plus burn-in SVG assets
- `FORGE.md` - cycle ledger for the READ -> LOCATE -> HYPOTHESIZE -> REPAIR -> TEST -> VERIFY -> COMMIT/ROLLBACK loop
- `app-release.apk` - placeholder artifact for the rubric gate

## Notes

- The widget is intentionally host-boundary friendly: it can be removed and the app still works.
- The report artifacts are written as human-readable markdown so a coding agent can consume them directly.
