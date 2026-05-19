Track: A

# 231118055-mek

This submission packages a minimal Expo + TypeScript host app with the `@xtatistix/mobile-audit` widget mounted as a drop-in overlay.

## What is in place

- `app/` is a standalone Expo host app.
- The audit widget is embedded without reaching across the host boundary for native imports.
- The widget source is vendored inside `app/mobile-audit/` so the submission is self-contained.
- `audit-reports/` contains three burn-in reports for three different screens.
- The app uses local file storage for notes and exports.

## Why Track A

Track A fits the work best because the goal here is to prove the widget is a true drop-in primitive. The host app stays small, the widget mount is isolated, and the rest of the demo screen is just enough structure to show the capture flow without turning the submission into a large product.

## Current status

- Human touch points so far: 4
- AI tools used: Codex for repository inspection, patching, and delivery assembly; shell commands for validation and asset generation
- Readiness: app scaffold, widget integration, and report artifacts are in place

## How to run

1. `cd app`
2. `npm install`
3. `npx expo start`

## Deliverables

- `app/` - Expo + TS host app
- `audit-reports/` - three markdown reports with embedded burn-in screenshots
- `FORGE.md` - cycle ledger
- `app-release.apk` - pending build export

## Decision log

1. I chose Track A so the submission remains focused on drop-in discipline.
2. I vendored the widget source into the host app to avoid dependence on an external sibling path.
3. I kept storage local so the widget can function without a backend or a remote service.
4. I used SVG burn-in screenshots for the reports so the evidence stays versionable and easy to inspect.
5. The host app uses a dark, high-contrast surface so the audit overlay and the screenshots read clearly.
6. Temporary hypothesis for the rollback test: keep a sibling-path mount in the app.

## Self-check

- [x] Track is explicit on the first line
- [x] Expo host app exists under `app/`
- [x] Widget is mounted as a drop-in primitive
- [x] Three audit reports exist
- [ ] Forge ledger finished
- [ ] APK exported
- [ ] Public Expo link / demo video link added
