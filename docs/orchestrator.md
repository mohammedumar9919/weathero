# Orchestrator reference

## Slice gates

| Slice | Command | Checks |
|-------|---------|--------|
| A | `.\scripts\phase_gate.ps1 -Slice A` | Docker :5435, pytest 12/12, npm build, contracts v1.2.0 |
| B | TBD | Weather route + cache |
| C | TBD | UI components |
| D | TBD | Golden fixtures replay |

## Worker return format

1. Files changed (grouped by area)
2. Test evidence (pytest snippet)
3. Build evidence (npm line)
4. Risks / council-review flags
5. **NOT** gate PASS

## Merge policy

- One card active at a time
- Gate PASS required before next slice unlocks
- Contract changes require version bump in `api-contracts.md`
