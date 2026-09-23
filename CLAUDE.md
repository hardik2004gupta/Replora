# REPLORA — Cache Replacement Intelligence Lab

> Same workload → different eviction decisions → different cache outcomes.

## Source of Truth

`REPLORA_Project_Documentation.md` is the primary product/architecture specification unless a later explicit project decision supersedes it.

## Architecture Rules

- The simulator is the source of truth — UI renders its output
- Algorithms are isolated from UI; all conform to a common `CachePolicy` interface
- All comparison runs use the exact same generated trace
- Metrics are derived from actual simulation, never fabricated
- Deterministic seeds are supported (default: 42)
- Animation must never affect simulation behavior
- No backend, no API keys, no database required

## Scope Rules — Do NOT Introduce

- Authentication or user accounts
- Database or backend server
- Chatbot or conversational AI
- Unnecessary APIs or cloud infrastructure
- Complex ML training or model hosting
- Real CPU cache integration
- Unnecessary pages, libraries, or abstractions

## Development Rules

- Inspect existing code before modifying
- Preserve working functionality
- Prefer simple TypeScript
- Keep algorithm logic independent and testable
- Write tests for behavior and invariants
- Never fabricate measurements
- Run `npm test` after substantial changes
- Run `npm run build` before declaring completion
- Avoid over-engineering

## Stack

- React + TypeScript + Vite
- Vitest for testing
- Minimal dependencies

## Phase Plan

- **Phase 1** = Simulation engine (algorithms, workloads, metrics, tests)
- **Phase 2** = Dashboard UI (components, visualization, animation)
- **Phase 3** = Polish, audit, deployment

Do not implement later phases prematurely.

## Commands

```bash
npm run dev       # Dev server
npm test          # Run tests
npm run build     # Production build
```
