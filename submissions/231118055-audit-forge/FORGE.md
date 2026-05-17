# FORGE Ledger

Time-box target: 15 minutes per cycle.

| Cycle | Report | Hypothesis | Result | Changed files | Test result | Commit hash | kg | Human touch points |
|---|---|---|---|---|---|---|---|---|
| 01 | home.md | Bottom CTA and FAB compete for the same safe-area lane on the home route. | success | `app/app/index.tsx`, `audit-reports/home.md`, `audit-reports/assets/home-burnin.svg` | `typecheck + lint passed after scaffold` | `dd3fbca` | 1 | 1 |
| 02 | inspect.md | The inspect route needs denser evidence cards so the agent can anchor on one issue at a time. | success | `app/app/inspect.tsx`, `audit-reports/inspect.md`, `audit-reports/assets/inspect-burnin.svg` | `typecheck + lint passed after screenshot metadata pass` | `16d0539` | 2 | 1 |
| 03 | ledger.md | The forge route should show ratchet progress and rollback semantics explicitly. | success | `app/app/ledger.tsx`, `FORGE.md` | `ledger rollback callout verified in code` | `f26ba1e` | 3 | 1 |
| 04 | rollback-check.md | A temporary track mislabel was introduced to verify the rollback path, then reverted. | rollback | `README.md` | `git revert succeeded and restored Track A` | `0b76679` | 3 | 1 |

## Rollback note

The rollback cycle is retained in the ledger on purpose. The failed hypothesis is part of the learning trail and should not be deleted.
