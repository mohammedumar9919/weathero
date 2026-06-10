# Multi-Agent Workflow

## Roles

| Role | Chat | Responsibility |
|------|------|----------------|
| Lead | Orchestrator | Task cards, review, CURRENT_STATE |
| Worker | Per card | Scoped implementation |
| User | Terminal | Docker, pytest, phase_gate.ps1 |

## Flow

1. Lead issues one card (allowed + forbidden paths)
2. Worker implements; returns evidence
3. Lead runs council-review-slice
4. User runs gate
5. Lead updates queue + CURRENT_STATE

## Multitask

OFF by default. Max 2–3 workers only when cards have zero path overlap.
