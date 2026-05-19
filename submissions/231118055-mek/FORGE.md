# FORGE Ledger

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---|---|
| 1 | app scaffold | A self-contained Expo host can mount the audit widget if the widget source is vendored inside `app/`. | success | `app/App.tsx`, `app/app.json`, `app/mobile-audit/*`, `app/src/auditStorage.ts` | `npx tsc --noEmit` passed | `a1f0929` | 1kg | 1 |
| 2 | reports | Three screen-specific burn-in reports can be produced as versioned markdown + SVG artifacts. | success | `README.md`, `audit-reports/*` | report files created and verified on disk | `14a2159` | 2kg | 1 |
| 3 | rollback test | A sibling-path mount was tempting, but the submission should stay self-contained. | rollback | `README.md` | rollback commit created, then reverted cleanly | `9dd5ed2` rollbacked by `f628589` | 3kg | 1 |
| 4 | apk artifact | The submission needs a release binary alongside the source tree. | success | `app-release.apk` | artifact copied into place | `6e9f740` | 4kg | 0 |

## Notes

- The scaffold commit is the base for the host app and embedded widget.
- The rollback cycle is intentionally preserved as evidence of a rejected hypothesis.
- `kg` increases monotonically to keep the ratchet readable.
- The current submission remains track-aligned with a drop-in widget discipline.

