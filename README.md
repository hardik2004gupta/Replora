# REPLORA

### Cache Replacement Intelligence Lab

A one-page interactive simulation laboratory that runs identical memory-access workloads through four classical cache replacement policies and makes the behavioral differences observable in real time.

> Same workload. Different replacement decisions. Observable cache behavior.

---

## What Is REPLORA?

When a cache is full and a new item arrives, something must be evicted. Which item gets removed depends entirely on the replacement policy, and different policies produce different outcomes from the same input.

REPLORA generates a single access trace and feeds it to FIFO, LRU, LFU, and Random Replacement simultaneously. Because every policy processes the exact same sequence, every difference in hit rate, eviction count, or cache state is caused by the policy's decision rule alone.

## Why It Exists

Cache replacement is a foundational concept in systems design, but textbook descriptions rarely make the behavioral differences tangible. REPLORA turns the comparison into a controlled experiment: configure a workload, run the simulation, and watch each policy make different eviction decisions on the same data.

It is designed as a focused DSA/systems experiment, not a generic dashboard.

---

## Features

- Four classical replacement policies running on the same generated trace
- Five configurable workload patterns with distinct access characteristics
- Animated trace playback with scrubber, step controls, and adaptive speed
- Live cache state visualization showing hits, misses, and evictions per step
- Policy comparison with hit-rate bars, delta indicators, and focus mode
- Decision reveal showing the Request &rarr; Miss &rarr; Evict &rarr; Insert sequence
- Policy difference signal highlighting divergent eviction choices across policies
- "Why This Happened" explanations for each workload type
- Algorithm complexity reference panel
- Experimental ML-guided replacement concept (read-only, clearly separated)
- Keyboard shortcuts: Space (play/pause), R (run), Esc (reset), arrow keys (step)
- Responsive layout from 375px mobile to 1920px ultra-wide
- Deterministic seeded workload generation (default seed: 42)
- 70 tests covering algorithms, workloads, metrics, and edge cases

---

## Supported Policies

| Policy | Decision Rule | Evict Complexity | Key Idea |
|--------|--------------|-----------------|----------|
| FIFO | Evict the oldest inserted item | O(1) | Insertion order; no usage tracking |
| LRU | Evict the least recently accessed item | O(1) | Recency as a proxy for future use |
| LFU | Evict the least frequently accessed item | O(n) | Frequency history; tie-break by insertion order |
| RANDOM | Evict a uniformly random item | O(1) | No history; baseline comparator |

All policies implement a common `CachePolicy` interface and are fully isolated from the UI layer.

---

## Workload Types

| Workload | Pattern | What It Demonstrates |
|----------|---------|---------------------|
| Sequential | 1, 2, 3, 4, 5, ... | Scan pressure; no reuse, so no policy benefits from history |
| Random | Uniform random from range 1-20 | Weak locality; historical tracking provides little advantage |
| Looping | Repeating cycle [1, 2, 3, 4] | Strong temporal locality; recency-aware policies capture the loop |
| Bursty | Concentrated bursts with noise | Temporary working sets; recent-access sensitivity matters |
| Frequency-skewed | 70% hot items, 30% cold items | Frequency dominance; LFU-style tracking excels |

All workloads use a seeded pseudorandom number generator for reproducible results.

---

## How It Works

```
User Configuration
  workload type, cache capacity, trace length
        |
        v
Workload Generation
  deterministic seeded trace
        |
        v
   Same Trace ──────────────────────────────
   |          |          |          |
   v          v          v          v
  FIFO       LRU       LFU      RANDOM
   |          |          |          |
   v          v          v          v
  Metrics    Metrics    Metrics    Metrics
   |          |          |          |
   v          v          v          v
   └──────── Visualization ────────┘
```

Every policy receives the identical access sequence. The simulator is the single source of truth; the UI only renders its output.

---

## Dashboard Sections

**Metric Strip** — Hit rate, miss rate, eviction count, and execution time for the selected policy.

**Policy Comparison** — Horizontal bars showing hit rates across all four policies with delta indicators. Click a policy row to focus; "Compare All" to reset.

**Access Trace** — Scrollable trace items color-coded by hit/miss. Supports animated playback, a draggable scrubber, and click-to-inspect. Long traces (>200 items) use windowed rendering.

**Cache State** — Live slot visualization with hit/miss/evict coloring and a decision reveal sequence for eviction events. Shows when policies make different eviction choices for the same miss.

**Why This Happened** — Natural-language explanation of why the current workload produces the observed policy differences.

**Algorithm Complexity** — Lookup, insert, and evict complexity for each policy.

**ML-Guided (Experimental)** — Read-only prediction panel with a pipeline flowchart. See below.

---

## ML-Guided Experimental Extension

REPLORA includes a lightweight, deterministic heuristic that demonstrates the concept of ML-guided cache replacement. It is clearly labeled "Experimental" and operates as a read-only observer.

**Pipeline:**

```
Access History  →  Feature Extraction  →  Normalize  →  Weighted Heuristic  →  Suggested Victim
```

**Extracted features** (per cache item):

| Feature | Calculation |
|---------|-------------|
| Recency | Steps since last access |
| Lifetime Frequency | Total appearances in history |
| Recent-Window Frequency | Appearances in last 10 accesses |
| Reuse Behaviour | Ratio of re-accesses to appearances |

**Prediction:**

Each feature is normalized to [0, 1] and combined with fixed weights:

```
reuse = 0.30 * recency + 0.25 * lifetime_freq + 0.25 * recent_freq + 0.20 * reuse_behaviour
```

The cache item with the lowest predicted reuse probability is suggested as the eviction victim. This is a hand-tuned linear heuristic, not a trained model.

**Important:** The ML module observes the simulation but does not control eviction decisions. Classical policies remain the source of truth for all measured results.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 |
| Language | TypeScript 6 |
| Build | Vite 8 |
| Testing | Vitest 5 |
| Styling | CSS custom properties, no UI framework |

Zero runtime dependencies beyond React. No backend, no database, no API keys.

---

## Getting Started

```bash
git clone https://github.com/hardik2004gupta/Replora.git
cd Replora
npm install
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Production build:

```bash
npm run build
npm run preview
```

---

## Deployment

The project builds to a static `dist/` directory and can be deployed to any static hosting provider.

**Vercel:**

1. Import the repository in Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`

No environment variables or server configuration required.

---

## Project Structure

```
src/
  algorithms/
    fifo.ts             # FIFO replacement policy
    lru.ts              # LRU replacement policy
    lfu.ts              # LFU replacement policy
    random.ts           # Random replacement policy
  simulation/
    types.ts            # Shared interfaces (CachePolicy, AccessEvent, etc.)
    simulator.ts        # Simulation runner (trace → all policies → results)
    workloads.ts        # Workload generators with seeded RNG
    metrics.ts          # Metrics computation from access events
    explanations.ts     # Per-workload explanation text
    mlGuided.ts         # Experimental ML feature extraction and prediction
  components/
    Header.tsx          # App header with status indicator
    MetricStrip.tsx     # Four-metric summary cards
    PolicyComparison.tsx # Hit-rate bars with focus mode and deltas
    WorkloadPanel.tsx   # Workload/capacity/trace-length configuration
    TraceViewer.tsx     # Trace display, scrubber, playback controls
    CacheState.tsx      # Live cache slots, decision reveal, policy diffs
    Explanation.tsx     # "Why This Happened" panel
    ComplexityPanel.tsx # Algorithm complexity reference
    MLPanel.tsx         # ML-guided prediction readout
    MLFlowchart.tsx     # ML pipeline visualization
    ExperimentSnapshot.tsx # Compact config summary strip
    Tooltip.tsx         # Lightweight tooltip component
  __tests__/
    simulation.test.ts  # 70 tests
  App.tsx               # Root component with state management and keyboard shortcuts
  index.css             # Design system and responsive styles
  main.tsx              # React entry point
public/
  favicon.svg           # Cache-grid favicon
index.html              # HTML shell with meta/OG tags
```

---

## Testing

70 tests covering:

- Each replacement policy (insertion, eviction, hit detection, ordering)
- All five workload generators (output length, value types)
- Metrics computation (hit rate, miss rate, eviction count, edge cases)
- Simulation integration (full pipeline, cross-policy result structure)
- Edge cases (capacity 1, trace length 1, repeated single value)
- ML-guided module (feature extraction, prediction bounds, victim selection)
- Phase 3 features (adaptive speed, trace windowing, deterministic seeds, policy divergence)

```bash
npm test          # Single run
npm run test:watch  # Watch mode
```

---

## Design Philosophy

- **Ultra-light visual language.** White surfaces, near-black text, subtle borders, restrained accent color. No gradients, no decoration.
- **Information hierarchy through typography and spacing.** Size and weight convey importance, not color.
- **Animation communicates state.** Cache hit pulses, miss entries, eviction exits, and a pulsing status dot during playback. All animations respect `prefers-reduced-motion`.
- **Responsive without breakage.** Fluid `clamp()` values for typography, padding, and gaps. Tested from 375px to 1920px. Mobile sticky action bar with safe-area padding.
- **No unnecessary infrastructure.** The entire application is a single static page.

---

## Engineering Principles

- The simulator is the source of truth. The UI renders its output.
- Algorithm logic is isolated from UI and independently testable.
- Every policy comparison uses the exact same generated trace.
- Metrics are derived from actual simulation events, never fabricated.
- Deterministic seeds make experiments reproducible.
- Animations never affect simulation behavior or results.
- The ML-guided module is read-only and clearly distinguished from classical measurements.

---

## Limitations

- This is a software simulation, not a hardware cache model. It does not model cache lines, associativity, or memory hierarchy.
- Execution time measurements are browser-local `performance.now()` and reflect JavaScript overhead, not algorithmic cost.
- The LFU implementation uses a linear scan for eviction (O(n)), not a min-heap. This is intentional for clarity at the scale of this simulation.
- The ML-guided module is a deterministic heuristic, not a trained model.
- Random policy results are deterministic within a seed but vary across seeds.

---

## License

No license is currently specified for this repository.
