# REPLORA
## Cache Replacement Intelligence Lab

A visually polished, responsive, one-page interactive dashboard for exploring and comparing classical cache replacement algorithms under controlled workloads.

> **Core idea:** Run the same access trace through FIFO, LRU, LFU, and Random Replacement, then make the differences visible through a compact, highly visual interface.

---

## 1. Project Vision

REPLORA turns the project synopsis into a small interactive simulation laboratory rather than a conventional academic CRUD application.

The dashboard should be:

- Extremely concise and easy to explain.
- Visually premium with an ultra-light theme.
- Responsive across desktop, tablet, and mobile.
- Animated, but never visually noisy.
- Fully runnable locally with no API keys.
- Deployable to Vercel as a static/client-side application.
- Simple enough for a DSA lab project while still looking like a real engineering tool.

The academic basis is the comparative study of FIFO, LRU, LFU, and Random Replacement across sequential, random, looping, bursty, and frequency-skewed workloads, using hit rate, miss rate, eviction count, execution time, memory overhead, and operation complexity as evaluation dimensions. The synopsis also defines an ML-guided replacement policy as a later experimental extension. fileciteturn0file0L20-L46 fileciteturn0file0L61-L80

---

# 2. Product Name

## REPLORA

### Cache Replacement Intelligence Lab

Suggested positioning line:

> **See how replacement decisions behave.**

Alternative microcopy:

> **One trace. Four policies. One clear comparison.**

---

# 3. Primary User Experience

The entire application is a single dashboard page.

The user should be able to:

1. Choose a workload.
2. Set cache capacity.
3. Run the simulation.
4. Watch the access trace progress.
5. Compare FIFO, LRU, LFU, and Random.
6. Inspect hit/miss/eviction behavior.
7. Understand *why* the policies behave differently.
8. Glimpse the ML-guided extension without requiring a complex ML platform.

No authentication, database, user accounts, external API, or multi-page navigation is required.

---

# 4. One-Page Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ REPLORA                                      LOCAL SIMULATION   RUN  │
│ Cache Replacement Intelligence Lab                                 │
├───────────────┬───────────────┬───────────────┬─────────────────────┤
│ HIT RATE      │ MISS RATE     │ EVICTIONS     │ EXECUTION           │
│ 78.4%         │ 21.6%         │ 108           │ 1.4 ms              │
├──────────────────────────────────────────────┬──────────────────────┤
│                                              │ WORKLOAD             │
│ POLICY COMPARISON                            │ Sequential           │
│                                              │ Looping              │
│ FIFO   ███████████████  73.2%                │ Random               │
│ LRU    █████████████████ 82.6%               │ Bursty               │
│ LFU    ██████████████████ 86.1%              │ Frequency-skewed     │
│ RANDOM ████████████ 61.8%                   │                      │
│                                              │ ACCESS TRACE         │
│                                              │ 04 07 02 04 07 ...  │
├──────────────────────────────────────────────┴──────────────────────┤
│ WHY THIS HAPPENED                                                   │
│ The selected workload repeatedly revisits a small working set.      │
│ FIFO → insertion   LRU → recency   LFU → frequency   Random → none │
├───────────────────────────────────────────┬─────────────────────────┤
│ COMPLEXITY                                │ ML-GUIDED  EXPERIMENTAL  │
│ Lookup  O(1)                              │ Reuse probability  18%   │
│ Insert  O(1)                              │ History features → model│
│ Evict   policy-dependent                  │ Potential victim → ...  │
└───────────────────────────────────────────┴─────────────────────────┘
```

Desktop should fit comfortably within a normal 16:9 viewport with minimal page scrolling.

Mobile can stack cards vertically, but the information hierarchy should remain the same.

---

# 5. Visual Design Direction

## Aesthetic

Ultra-light, high-end technical dashboard.

Visual references in spirit:

- Linear
- Vercel
- Raycast
- modern hardware/performance observability tools

Avoid:

- Generic admin-dashboard styling.
- Dark hacker aesthetics.
- Neon cyberpunk visuals.
- Excessive gradients.
- Large illustrations.
- Decorative AI imagery.
- Heavy glassmorphism.
- Excessive shadows.

## Palette

Primary:

- Background: `#F6F7F9`
- Surface: `#FFFFFF`
- Primary text: `#111111`
- Secondary text: `#6B7280`
- Border: `#E7E9EE`

Use one restrained accent for active states and simulation highlights.

The overall impression should remain almost monochrome.

## Typography

Use a modern system or geometric sans-serif.

Suggested stack:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Use:

- Large, tightly spaced numerical metrics.
- Medium-weight section titles.
- Small uppercase labels for metadata.
- Monospace only for traces, operation logs, complexity notation, and technical data.

---

# 6. Animation Philosophy

Animation should communicate state and causality.

Do not animate everything.

## Recommended animations

### Page entrance

On first load:

- Header fades/slides upward.
- Metric cards reveal sequentially.
- Main comparison appears after the header.
- Lower explanatory panels softly enter.

Duration: approximately 400–700 ms.

### Simulation start

When RUN is pressed:

- Button changes to an active state.
- Trace cursor advances.
- Cache cells update.
- Hit/miss indicator pulses.
- Current algorithm state changes.
- Metrics count upward.

### Cache events

For an access:

```text
TRACE → CACHE → RESULT
```

A hit can produce a brief glow/pulse.

A miss can briefly emphasize the incoming item.

An eviction can animate:

```text
victim leaves → new item enters
```

### Algorithm comparison

Bars should animate from 0 to their current values.

Numeric metrics can use a short count-up transition.

### Reduced-motion support

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When enabled, remove non-essential motion and preserve only state changes.

---

# 7. Core Algorithms

The simulator implements four classical policies.

## FIFO — First In, First Out

Evicts the entry that was inserted first.

Recommended structure:

- Hash table for membership lookup.
- Queue for insertion order.

## LRU — Least Recently Used

Evicts the entry that has not been accessed for the longest time.

Recommended structure:

- Hash table for O(1)-style lookup.
- Doubly linked list for recency ordering.

## LFU — Least Frequently Used

Evicts the entry with the lowest access count.

Required:

- Frequency tracking.
- Explicit tie-breaking rule.

## Random Replacement

Selects a resident cache entry without using recency or frequency information.

The source synopsis defines all four policies and the underlying DSA concepts used by the simulator. fileciteturn0file0L48-L60

---

# 8. Workload Generator

The dashboard should support five workload presets:

### Sequential

```text
1 2 3 4 5 6 7 8 9 10 ...
```

Useful for demonstrating scan-like behavior.

### Random

```text
4 9 2 7 1 8 3 6 ...
```

No deliberate locality.

### Looping

```text
1 2 3 4 1 2 3 4 1 2 3 4 ...
```

Repeated working set.

### Bursty

Short periods of concentrated reuse separated by changes.

### Frequency-Skewed

Some entries occur much more often than others.

These five workload families are directly specified in the project synopsis. fileciteturn0file0L61-L67

---

# 9. Simulation Controls

Keep controls minimal.

```text
Workload       [ Looping ▾ ]

Cache Size     [ 4 ]

Trace Length   [ 500 ]

[ RUN SIMULATION ]
```

Optional:

```text
Animation      [ ON ]
Speed          [ 1× ]
```

Do not expose unnecessary configuration.

The default state should work immediately after page load.

---

# 10. Metrics

The primary dashboard metrics should be:

### Hit Rate

```text
hits / total accesses
```

### Miss Rate

```text
misses / total accesses
```

### Evictions

Number of resident entries removed because the cache was full.

### Execution Time

Local simulation runtime measured by the browser.

Additional secondary metrics can include:

- Memory overhead estimate.
- Average lookup cost.
- Average insertion cost.
- Eviction operation count.

The synopsis explicitly calls for hit rate, miss rate, eviction count, execution time, memory overhead, and operation complexity. fileciteturn0file0L61-L67

---

# 11. Main Visualization

## Policy Comparison

The primary visual should compare hit rates:

```text
FIFO       ███████████████░░░░  73%
LRU        █████████████████░░  83%
LFU        ██████████████████░  86%
Random     ████████████░░░░░░░  62%
```

Beside or underneath it, show:

```text
           HIT    MISS    EVICT
FIFO       73%    27%     134
LRU        83%    17%      87
LFU        86%    14%      69
Random     62%    38%     191
```

Do not label any policy as the universal winner.

Instead, display:

> **Observed under current workload**

This preserves the project's experimental framing: workload structure matters.

The synopsis explicitly says results should be related to workload structure rather than treated as a single overall ranking. fileciteturn0file0L61-L67

---

# 12. Live Cache Visualization

A compact cache strip makes the DSA implementation visually understandable.

Example:

```text
CACHE / CAPACITY 4

┌────┬────┬────┬────┐
│ 07 │ 02 │ 04 │ 11 │
└────┴────┴────┴────┘
```

Underneath:

```text
CURRENT ACCESS      07
RESULT              HIT
VICTIM               —
```

For an eviction:

```text
CURRENT ACCESS      19
RESULT              MISS
VICTIM              02
```

This is one of the most important visuals because it turns the underlying data structures and algorithms into something observable.

---

# 13. “Why This Happened” Explanation

Every simulation should generate a short explanation.

Example:

> **Looping workload detected:** repeated reuse of a small working set makes recent-access history important.

Or:

> **Frequency-skewed workload:** a few entries dominate accesses, making frequency history especially relevant.

Keep this to one or two lines.

The objective is explanation, not an AI-generated essay.

---

# 14. ML-Guided Extension

The ML section should be visually secondary.

Label it clearly:

```text
ML-GUIDED
EXPERIMENTAL
```

Concept:

```text
Access history
     │
     ├── Recency
     ├── Lifetime frequency
     ├── Recent-window frequency
     └── Reuse behaviour
              ↓
       Reuse prediction
              ↓
      Eviction candidate
```

Possible local demo output:

```text
Reuse probability     18%
Suggested victim      07
Prediction confidence 0.82
```

The source synopsis defines these history features and the idea of predicting whether an entry is likely to be reused soon. It also states that ML is an extension to the classical simulator rather than a replacement for it. fileciteturn0file0L68-L80

For the first release, the ML feature should be optional and lightweight.

---

# 15. Technical Architecture

Keep the codebase intentionally small.

```text
src/
├── algorithms/
│   ├── fifo.ts
│   ├── lru.ts
│   ├── lfu.ts
│   └── random.ts
│
├── simulation/
│   ├── simulator.ts
│   ├── workloads.ts
│   ├── metrics.ts
│   └── types.ts
│
├── components/
│   ├── Header.tsx
│   ├── MetricStrip.tsx
│   ├── PolicyComparison.tsx
│   ├── WorkloadPanel.tsx
│   ├── CacheState.tsx
│   ├── TraceViewer.tsx
│   ├── Explanation.tsx
│   └── MLPanel.tsx
│
├── App.tsx
├── main.tsx
└── styles.css
```

No backend is required for the core dashboard.

---

# 16. Recommended Stack

## Frontend

- React
- TypeScript
- Vite

## Styling

- CSS Modules or a single well-structured CSS file.
- CSS transitions/keyframes.
- CSS Grid + Flexbox.

## Animation

Prefer lightweight CSS transitions.

Optional:

- Framer Motion for page and component transitions.

Do not add an animation library merely to animate simple bars and counters.

## Charts

For this project, avoid a heavyweight visualization framework unless needed.

CSS/SVG can handle:

- Progress bars.
- Cache slots.
- Trace visualization.
- Small sparkline-like histories.

This keeps deployment simple.

---

# 17. State Model

A minimal state model is enough.

```ts
type WorkloadType =
  | "sequential"
  | "random"
  | "looping"
  | "bursty"
  | "frequency-skewed";

type PolicyName =
  | "FIFO"
  | "LRU"
  | "LFU"
  | "RANDOM";

interface SimulationConfig {
  workload: WorkloadType;
  capacity: number;
  traceLength: number;
}

interface SimulationMetrics {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  missRate: number;
  executionTimeMs: number;
}
```

---

# 18. Simulation Pipeline

```text
User configuration
       ↓
Generate trace
       ↓
Run identical trace through:
       ├── FIFO
       ├── LRU
       ├── LFU
       └── Random
       ↓
Collect metrics
       ↓
Render comparison
       ↓
Animate selected trace
       ↓
Generate concise explanation
```

Every algorithm must receive the same generated trace during a comparison so that the experiment remains controlled and reproducible.

---

# 19. Responsive Design

## Desktop

Primary target:

```text
1440 × 900
```

Use a 12-column grid.

Example:

```text
Header          12 columns
Metric strip    3 + 3 + 3 + 3
Main comparison 8 + workload 4
Explanation     12
Bottom panels   6 + 6
```

## Tablet

Collapse to roughly:

```text
2-column cards
```

## Mobile

Stack sections:

```text
Header
Metrics
Controls
Comparison
Cache
Explanation
ML
```

The mobile experience can scroll naturally, while desktop stays compact.

---

# 20. Vercel Compatibility

REPLORA should behave as a static client-side application.

Recommended setup:

```text
Build Command:
npm run build

Output:
dist/
```

Vercel can deploy the Vite build directly.

No server environment variables should be required.

No API keys should be required.

No database should be required.

Because the simulation runs in the browser, the same codebase works locally and on Vercel.

---

# 21. Local Development

Requirements:

- Node.js
- npm

Commands:

```bash
git clone <repo>
cd replora
npm install
npm run dev
```

Production test:

```bash
npm run build
npm run preview
```

---

# 22. Deployment

## Vercel

1. Push repository to GitHub.
2. Import the repository into Vercel.
3. Select the Vite project.
4. Deploy.

Expected workflow:

```text
GitHub
   ↓
Vercel
   ↓
Build
   ↓
Static deployment
```

Every push to the selected production branch can trigger a new deployment.

---

# 23. Testing Strategy

The simulation engine should be testable independently of the UI.

Minimum tests:

### FIFO

- Correct insertion order.
- Correct victim selection.
- Correct hit behavior.

### LRU

- Access updates recency.
- Least recently used entry becomes victim.

### LFU

- Access counts increase correctly.
- Lowest frequency selected.
- Tie-breaking is deterministic.

### Random

- Victim always belongs to the resident cache.
- Cache size remains valid.

### Metrics

- Hits + misses = total accesses.
- Hit rate + miss rate = 100%.
- Evictions never exceed the number of misses that require replacement.

---

# 24. Engineering Rules

Keep the project small.

### Rule 1
The simulator is the source of truth.

### Rule 2
UI code must not implement algorithm logic.

### Rule 3
Every comparison uses the same trace.

### Rule 4
Metrics must be derived from actual simulation results.

### Rule 5
No fake performance numbers presented as measured values.

### Rule 6
Animations must never change simulation behavior.

### Rule 7
The ML panel must clearly distinguish experimental estimates from classical measured results.

---

# 25. Accessibility

Implement:

- Keyboard-accessible controls.
- Visible focus states.
- Semantic buttons.
- Sufficient contrast.
- Reduced-motion support.
- Text alternatives for important visual information.

Animation must not be necessary to understand the result.

---

# 26. Performance Goals

The dashboard should feel instant for normal demo-sized traces.

Target behavior:

```text
Page load       < 2 s on normal local machine
Simulation      effectively instant for small/medium traces
Interaction     no visible UI blocking
Animation       smooth and short
```

For very long traces, simulation can be executed without animating every single access. The UI may animate a representative subset while the full trace is computed immediately.

---

# 27. Demo Mode

The application should have deterministic defaults so every evaluator sees a coherent first screen.

Recommended default:

```text
Workload:       Looping
Cache Size:     4
Trace Length:   100
Animation:      ON
```

A small `RESET` button should restore defaults.

Optional seed:

```ts
seed = 42
```

Using a deterministic random seed makes demo behavior reproducible.

---

# 28. Suggested Interaction Flow

### Initial state

Show a precomputed example.

### User clicks RUN

1. Generate trace.
2. Execute all four policies.
3. Compute metrics.
4. Animate metric changes.
5. Start trace playback.
6. Update cache visualization.
7. Show concise explanation.

### User changes workload

Immediately clear current transient animation state.

The user can run again.

---

# 29. Final Screen Hierarchy

The visual priority should be:

```text
1. What happened?
       ↓
2. How did the algorithms compare?
       ↓
3. Why did this workload produce that behavior?
       ↓
4. What is happening inside the cache?
       ↓
5. How could ML extend this?
```

This ensures the dashboard remains extremely concise while still telling a complete story.

---

# 30. What NOT to Build

Do not add:

- Login/authentication.
- Database.
- Admin panel.
- Chatbot.
- Cloud backend.
- Multi-page analytics suite.
- Complex ML training pipeline.
- Model hosting infrastructure.
- Real CPU cache integration.
- User-created accounts.
- Unnecessary settings.
- Dozens of charts.

The project should feel like a **focused interactive experiment**, not a large SaaS product.

---

# 31. Definition of Done

REPLORA is complete when:

- [ ] FIFO works.
- [ ] LRU works.
- [ ] LFU works.
- [ ] Random Replacement works.
- [ ] Five workload generators work.
- [ ] Same trace is used for all policies.
- [ ] Hit rate is calculated correctly.
- [ ] Miss rate is calculated correctly.
- [ ] Eviction count is calculated correctly.
- [ ] Execution time is measured locally.
- [ ] Cache state is visually represented.
- [ ] Comparison bars animate.
- [ ] Trace animation works.
- [ ] “Why this happened” updates with the workload.
- [ ] ML-guided section is clearly marked experimental.
- [ ] Responsive mobile layout works.
- [ ] Reduced-motion mode works.
- [ ] `npm run dev` works.
- [ ] `npm run build` works.
- [ ] Vercel deployment works.

---

# 32. One-Sentence Project Explanation

> **REPLORA is an interactive cache laboratory that runs identical memory-access workloads through FIFO, LRU, LFU, and Random replacement policies and visualizes how workload structure changes cache behavior.**

---

# 33. Presentation Pitch

### Problem
A cache is small, so something must be evicted when it becomes full.

### Idea
Different replacement policies make different eviction decisions.

### Demo
Give REPLORA the same workload and watch those decisions play out.

### Result
Compare hit rate, misses, evictions, and runtime.

### Extension
Use access-history features to experiment with ML-guided eviction.

---

# 34. Implementation Priority

## Phase 1 — Simulator

Implement:

```text
FIFO
LRU
LFU
Random
```

## Phase 2 — Workloads

Implement:

```text
Sequential
Random
Looping
Bursty
Frequency-skewed
```

## Phase 3 — Metrics

Implement:

```text
Hits
Misses
Evictions
Hit Rate
Miss Rate
Execution Time
```

## Phase 4 — UI

Build:

```text
Header
Metric strip
Comparison
Workload controls
Trace
Cache state
Explanation
ML panel
```

## Phase 5 — Motion

Add:

```text
Entrance animations
Metric count-up
Comparison bar animation
Trace playback
Cache transitions
```

## Phase 6 — Deployment

Verify:

```text
npm run build
Vercel deployment
Mobile responsiveness
Reduced motion
```

---

# 35. Final Design Principle

REPLORA should communicate the entire project in one glance:

> **Same workload → different eviction decisions → different cache outcomes.**

Everything on the screen should reinforce that idea.
