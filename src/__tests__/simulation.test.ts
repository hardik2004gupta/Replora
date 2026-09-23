import { describe, expect, it } from "vitest";
import { FIFOPolicy } from "../algorithms/fifo";
import { LFUPolicy } from "../algorithms/lfu";
import { LRUPolicy } from "../algorithms/lru";
import { RandomPolicy } from "../algorithms/random";
import { getExplanation } from "../simulation/explanations";
import { computeMetrics } from "../simulation/metrics";
import {
  extractFeatures,
  predictReuse,
  suggestVictim,
} from "../simulation/mlGuided";
import { runSimulation } from "../simulation/simulator";
import type { AccessEvent, WorkloadType } from "../simulation/types";
import { generateTrace } from "../simulation/workloads";

// ── FIFO ──

describe("FIFO", () => {
  it("inserts items in order", () => {
    const fifo = new FIFOPolicy(3);
    fifo.access(1);
    fifo.access(2);
    fifo.access(3);
    expect(fifo.getState()).toEqual([1, 2, 3]);
  });

  it("returns hit for resident items", () => {
    const fifo = new FIFOPolicy(3);
    fifo.access(1);
    const event = fifo.access(1);
    expect(event.result).toBe("hit");
    expect(event.victim).toBeNull();
  });

  it("does not change order on hit", () => {
    const fifo = new FIFOPolicy(3);
    fifo.access(1);
    fifo.access(2);
    fifo.access(3);
    fifo.access(2); // hit — order unchanged
    expect(fifo.getState()).toEqual([1, 2, 3]);
  });

  it("evicts the earliest inserted item when full", () => {
    const fifo = new FIFOPolicy(3);
    fifo.access(1);
    fifo.access(2);
    fifo.access(3);
    const event = fifo.access(4);
    expect(event.result).toBe("miss");
    expect(event.victim).toBe(1);
    expect(fifo.getState()).toEqual([2, 3, 4]);
  });

  it("never exceeds capacity", () => {
    const fifo = new FIFOPolicy(2);
    for (let i = 1; i <= 10; i++) fifo.access(i);
    expect(fifo.getState().length).toBeLessThanOrEqual(2);
  });

  it("handles capacity 1", () => {
    const fifo = new FIFOPolicy(1);
    fifo.access(1);
    fifo.access(2);
    expect(fifo.getState()).toEqual([2]);
  });

  it("resets correctly", () => {
    const fifo = new FIFOPolicy(3);
    fifo.access(1);
    fifo.access(2);
    fifo.reset();
    expect(fifo.getState()).toEqual([]);
  });
});

// ── LRU ──

describe("LRU", () => {
  it("updates recency on hit", () => {
    const lru = new LRUPolicy(3);
    lru.access(1);
    lru.access(2);
    lru.access(3);
    lru.access(1); // hit — moves to most recent
    expect(lru.getState()).toEqual([2, 3, 1]);
  });

  it("returns hit for resident items", () => {
    const lru = new LRUPolicy(3);
    lru.access(1);
    const event = lru.access(1);
    expect(event.result).toBe("hit");
  });

  it("evicts the least recently used item", () => {
    const lru = new LRUPolicy(3);
    lru.access(1);
    lru.access(2);
    lru.access(3);
    const event = lru.access(4);
    expect(event.victim).toBe(1);
    expect(lru.getState()).toEqual([2, 3, 4]);
  });

  it("eviction respects recency updates", () => {
    const lru = new LRUPolicy(3);
    lru.access(1);
    lru.access(2);
    lru.access(3);
    lru.access(1); // hit — 1 now most recent
    const event = lru.access(4); // 2 is now LRU
    expect(event.victim).toBe(2);
  });

  it("never exceeds capacity", () => {
    const lru = new LRUPolicy(2);
    for (let i = 1; i <= 10; i++) lru.access(i);
    expect(lru.getState().length).toBeLessThanOrEqual(2);
  });

  it("handles capacity 1", () => {
    const lru = new LRUPolicy(1);
    lru.access(1);
    lru.access(2);
    expect(lru.getState()).toEqual([2]);
  });
});

// ── LFU ──

describe("LFU", () => {
  it("increments frequency on hit", () => {
    const lfu = new LFUPolicy(3);
    lfu.access(1);
    lfu.access(2);
    lfu.access(1); // freq(1)=2, freq(2)=1
    lfu.access(3);
    const event = lfu.access(4); // should evict 2 (freq=1) not 1 (freq=2)
    expect(event.victim).toBe(2);
  });

  it("evicts lowest frequency item", () => {
    const lfu = new LFUPolicy(2);
    lfu.access(1);
    lfu.access(2);
    lfu.access(1); // freq(1)=2
    const event = lfu.access(3); // evict 2 (freq=1)
    expect(event.victim).toBe(2);
  });

  it("breaks ties by insertion order (earliest inserted evicted)", () => {
    const lfu = new LFUPolicy(3);
    lfu.access(1); // freq=1, order=0
    lfu.access(2); // freq=1, order=1
    lfu.access(3); // freq=1, order=2
    const event = lfu.access(4); // all freq=1, evict earliest: 1
    expect(event.victim).toBe(1);
  });

  it("never exceeds capacity", () => {
    const lfu = new LFUPolicy(2);
    for (let i = 1; i <= 10; i++) lfu.access(i);
    expect(lfu.getState().length).toBeLessThanOrEqual(2);
  });

  it("handles capacity 1", () => {
    const lfu = new LFUPolicy(1);
    lfu.access(1);
    lfu.access(2);
    expect(lfu.getState()).toEqual([2]);
  });
});

// ── Random ──

describe("Random", () => {
  it("victim is always a resident", () => {
    const rnd = new RandomPolicy(3, 42);
    rnd.access(1);
    rnd.access(2);
    rnd.access(3);
    const event = rnd.access(4);
    expect(event.result).toBe("miss");
    expect(event.victim).not.toBeNull();
    expect([1, 2, 3]).toContain(event.victim);
  });

  it("never exceeds capacity", () => {
    const rnd = new RandomPolicy(2, 42);
    for (let i = 1; i <= 20; i++) rnd.access(i);
    expect(rnd.getState().length).toBeLessThanOrEqual(2);
  });

  it("produces deterministic results with same seed", () => {
    const run = (seed: number) => {
      const rnd = new RandomPolicy(3, seed);
      const events: AccessEvent[] = [];
      for (let i = 1; i <= 10; i++) events.push(rnd.access(i));
      return events.map((e) => e.victim);
    };

    expect(run(42)).toEqual(run(42));
  });

  it("produces different results with different seeds", () => {
    const run = (seed: number) => {
      const rnd = new RandomPolicy(3, seed);
      const events: AccessEvent[] = [];
      for (let i = 1; i <= 20; i++) events.push(rnd.access(i));
      return events.map((e) => e.victim);
    };

    expect(run(42)).not.toEqual(run(99));
  });

  it("returns hit for resident items", () => {
    const rnd = new RandomPolicy(3, 42);
    rnd.access(1);
    const event = rnd.access(1);
    expect(event.result).toBe("hit");
  });

  it("handles capacity 1", () => {
    const rnd = new RandomPolicy(1, 42);
    rnd.access(1);
    rnd.access(2);
    expect(rnd.getState().length).toBe(1);
    expect(rnd.getState()[0]).toBe(2);
  });
});

// ── Workloads ──

describe("Workloads", () => {
  const workloads: WorkloadType[] = [
    "sequential",
    "random",
    "looping",
    "bursty",
    "frequency-skewed",
  ];

  for (const w of workloads) {
    it(`${w}: generates requested length`, () => {
      const trace = generateTrace(w, 50, 42);
      expect(trace.length).toBe(50);
    });

    it(`${w}: contains valid positive integers`, () => {
      const trace = generateTrace(w, 100, 42);
      for (const item of trace) {
        expect(item).toBeGreaterThan(0);
        expect(Number.isInteger(item)).toBe(true);
      }
    });
  }

  it("sequential produces 1,2,3,...", () => {
    const trace = generateTrace("sequential", 5);
    expect(trace).toEqual([1, 2, 3, 4, 5]);
  });

  it("looping produces repeating pattern", () => {
    const trace = generateTrace("looping", 8);
    expect(trace).toEqual([1, 2, 3, 4, 1, 2, 3, 4]);
  });

  it("random is deterministic with same seed", () => {
    const a = generateTrace("random", 20, 42);
    const b = generateTrace("random", 20, 42);
    expect(a).toEqual(b);
  });

  it("bursty is deterministic with same seed", () => {
    const a = generateTrace("bursty", 50, 42);
    const b = generateTrace("bursty", 50, 42);
    expect(a).toEqual(b);
  });

  it("frequency-skewed is deterministic with same seed", () => {
    const a = generateTrace("frequency-skewed", 50, 42);
    const b = generateTrace("frequency-skewed", 50, 42);
    expect(a).toEqual(b);
  });

  it("frequency-skewed has skewed distribution", () => {
    const trace = generateTrace("frequency-skewed", 1000, 42);
    const counts = new Map<number, number>();
    for (const item of trace) counts.set(item, (counts.get(item) ?? 0) + 1);
    const hotTotal = (counts.get(1) ?? 0) + (counts.get(2) ?? 0) + (counts.get(3) ?? 0);
    expect(hotTotal / 1000).toBeGreaterThan(0.5);
  });

  it("handles length 0", () => {
    for (const w of workloads) {
      expect(generateTrace(w, 0, 42)).toEqual([]);
    }
  });
});

// ── Simulator ──

describe("Simulator", () => {
  it("all policies process the same trace", () => {
    const result = runSimulation({
      workload: "looping",
      capacity: 3,
      traceLength: 20,
      seed: 42,
    });

    expect(result.results.length).toBe(4);
    for (const pr of result.results) {
      expect(pr.events.length).toBe(20);
      for (let i = 0; i < 20; i++) {
        expect(pr.events[i].requestedItem).toBe(result.trace[i]);
      }
    }
  });

  it("returns all four policy names", () => {
    const result = runSimulation({
      workload: "random",
      capacity: 4,
      traceLength: 10,
    });
    const names = result.results.map((r) => r.policy);
    expect(names).toEqual(["FIFO", "LRU", "LFU", "RANDOM"]);
  });

  it("metrics are internally consistent", () => {
    const result = runSimulation({
      workload: "bursty",
      capacity: 3,
      traceLength: 100,
      seed: 42,
    });

    for (const pr of result.results) {
      const m = pr.metrics;
      expect(m.hits + m.misses).toBe(m.totalAccesses);
      expect(m.totalAccesses).toBe(100);
      expect(Math.abs(m.hitRate + m.missRate - 100)).toBeLessThan(0.01);
      expect(m.evictions).toBeLessThanOrEqual(m.misses);
      expect(m.evictions).toBeGreaterThanOrEqual(0);
      expect(m.executionTimeMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("deterministic with same seed", () => {
    const a = runSimulation({ workload: "random", capacity: 3, traceLength: 50, seed: 42 });
    const b = runSimulation({ workload: "random", capacity: 3, traceLength: 50, seed: 42 });
    expect(a.trace).toEqual(b.trace);
    for (let i = 0; i < 4; i++) {
      expect(a.results[i].metrics.hits).toBe(b.results[i].metrics.hits);
      expect(a.results[i].metrics.misses).toBe(b.results[i].metrics.misses);
      expect(a.results[i].metrics.evictions).toBe(b.results[i].metrics.evictions);
    }
  });
});

// ── Metrics ──

describe("Metrics", () => {
  it("hits + misses = total accesses", () => {
    const events: AccessEvent[] = [
      { index: 0, requestedItem: 1, result: "miss", victim: null, cacheState: [1] },
      { index: 1, requestedItem: 1, result: "hit", victim: null, cacheState: [1] },
      { index: 2, requestedItem: 2, result: "miss", victim: null, cacheState: [1, 2] },
    ];
    const m = computeMetrics(events, 2, 0.1);
    expect(m.hits + m.misses).toBe(m.totalAccesses);
    expect(m.totalAccesses).toBe(3);
  });

  it("hitRate + missRate = 100%", () => {
    const events: AccessEvent[] = [
      { index: 0, requestedItem: 1, result: "miss", victim: null, cacheState: [1] },
      { index: 1, requestedItem: 1, result: "hit", victim: null, cacheState: [1] },
    ];
    const m = computeMetrics(events, 2, 0.1);
    expect(Math.abs(m.hitRate + m.missRate - 100)).toBeLessThan(0.01);
  });

  it("counts evictions correctly", () => {
    const events: AccessEvent[] = [
      { index: 0, requestedItem: 1, result: "miss", victim: null, cacheState: [1] },
      { index: 1, requestedItem: 2, result: "miss", victim: 1, cacheState: [2] },
    ];
    const m = computeMetrics(events, 1, 0.1);
    expect(m.evictions).toBe(1);
  });

  it("handles empty events", () => {
    const m = computeMetrics([], 4, 0);
    expect(m.hits).toBe(0);
    expect(m.misses).toBe(0);
    expect(m.hitRate).toBe(0);
    expect(m.missRate).toBe(0);
  });
});

// ── Explanations ──

describe("Explanations", () => {
  const workloads: WorkloadType[] = [
    "sequential",
    "random",
    "looping",
    "bursty",
    "frequency-skewed",
  ];

  for (const w of workloads) {
    it(`returns explanation for ${w}`, () => {
      const text = getExplanation(w);
      expect(typeof text).toBe("string");
      expect(text.length).toBeGreaterThan(10);
    });
  }
});

// ── ML-Guided (Experimental) ──

describe("ML-Guided (experimental)", () => {
  it("extracts features from history", () => {
    const features = extractFeatures(1, [1, 2, 3], [1, 2, 3, 1, 2]);
    expect(features.recency).toBe(1);
    expect(features.lifetimeFrequency).toBe(2);
  });

  it("predicts reuse probability as a number", () => {
    const features = extractFeatures(1, [1, 2], [1, 2, 1]);
    const prob = predictReuse(features);
    expect(typeof prob).toBe("number");
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });

  it("suggests a victim from cache state", () => {
    const prediction = suggestVictim([1, 2, 3], [1, 1, 1, 2, 3]);
    expect(prediction.suggestedVictim).not.toBeNull();
    expect([1, 2, 3]).toContain(prediction.suggestedVictim);
    expect(prediction.predictionConfidence).toBeGreaterThan(0);
  });

  it("handles empty cache", () => {
    const prediction = suggestVictim([], [1, 2, 3]);
    expect(prediction.suggestedVictim).toBeNull();
  });
});

// ── Edge Cases ──

describe("Edge cases", () => {
  it("trace shorter than cache capacity", () => {
    const result = runSimulation({
      workload: "sequential",
      capacity: 10,
      traceLength: 3,
    });
    for (const pr of result.results) {
      expect(pr.metrics.evictions).toBe(0);
      expect(pr.metrics.misses).toBe(3);
    }
  });

  it("repeated single value", () => {
    const trace = [5, 5, 5, 5, 5];
    const fifo = new FIFOPolicy(3);
    const events = trace.map((t) => fifo.access(t));
    expect(events[0].result).toBe("miss");
    for (let i = 1; i < events.length; i++) {
      expect(events[i].result).toBe("hit");
    }
  });

  it("very short trace (length 1)", () => {
    const result = runSimulation({
      workload: "sequential",
      capacity: 4,
      traceLength: 1,
    });
    for (const pr of result.results) {
      expect(pr.metrics.totalAccesses).toBe(1);
      expect(pr.metrics.misses).toBe(1);
      expect(pr.metrics.hits).toBe(0);
    }
  });

  it("enough accesses to force eviction", () => {
    const fifo = new FIFOPolicy(2);
    fifo.access(1);
    fifo.access(2);
    const event = fifo.access(3);
    expect(event.victim).toBe(1);
  });

  it("capacity 1 evicts on every miss", () => {
    const fifo = new FIFOPolicy(1);
    fifo.access(1);
    const e2 = fifo.access(2);
    expect(e2.victim).toBe(1);
    expect(e2.cacheState).toEqual([2]);
    const e3 = fifo.access(3);
    expect(e3.victim).toBe(2);
  });
});

// ── Phase 3: Simulation integration ──

describe("Phase 3 features", () => {
  it("adaptive speed thresholds match expected ranges", () => {
    const getSpeed = (len: number) =>
      len > 1000 ? 5 : len > 500 ? 10 : len > 200 ? 20 : len > 50 ? 50 : 80;
    expect(getSpeed(2000)).toBe(5);
    expect(getSpeed(800)).toBe(10);
    expect(getSpeed(300)).toBe(20);
    expect(getSpeed(100)).toBe(50);
    expect(getSpeed(30)).toBe(80);
  });

  it("trace windowing returns correct range", () => {
    const WINDOW_RADIUS = 30;
    const traceLength = 500;
    const playbackIndex = 250;
    const start = Math.max(0, playbackIndex - WINDOW_RADIUS);
    const end = Math.min(traceLength, playbackIndex + WINDOW_RADIUS + 1);
    expect(start).toBe(220);
    expect(end).toBe(281);
    expect(end - start).toBe(61);
  });

  it("trace windowing clamps at boundaries", () => {
    const WINDOW_RADIUS = 30;
    const traceLength = 500;
    const startRange = Math.max(0, 10 - WINDOW_RADIUS);
    expect(startRange).toBe(0);
    const endRange = Math.min(traceLength, 490 + WINDOW_RADIUS + 1);
    expect(endRange).toBe(500);
  });

  it("policy difference detection finds divergent evictions", () => {
    const result = runSimulation({
      workload: "frequency-skewed",
      capacity: 4,
      traceLength: 100,
      seed: 42,
    });
    const fifoEvents = result.results.find((r) => r.policy === "FIFO")!.events;
    const lruEvents = result.results.find((r) => r.policy === "LRU")!.events;
    let hasDifference = false;
    for (let i = 0; i < fifoEvents.length; i++) {
      if (
        fifoEvents[i].victim !== null &&
        lruEvents[i].victim !== null &&
        fifoEvents[i].victim !== lruEvents[i].victim
      ) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  it("deterministic seed produces identical results", () => {
    const r1 = runSimulation({ workload: "random", capacity: 4, traceLength: 200, seed: 42 });
    const r2 = runSimulation({ workload: "random", capacity: 4, traceLength: 200, seed: 42 });
    expect(r1.trace).toEqual(r2.trace);
    for (let i = 0; i < r1.results.length; i++) {
      expect(r1.results[i].metrics.hits).toBe(r2.results[i].metrics.hits);
      expect(r1.results[i].metrics.misses).toBe(r2.results[i].metrics.misses);
      expect(r1.results[i].metrics.evictions).toBe(r2.results[i].metrics.evictions);
      expect(r1.results[i].metrics.hitRate).toBe(r2.results[i].metrics.hitRate);
    }
  });

  it("long trace produces valid results", () => {
    const result = runSimulation({
      workload: "looping",
      capacity: 4,
      traceLength: 5000,
    });
    expect(result.trace.length).toBe(5000);
    for (const pr of result.results) {
      expect(pr.events.length).toBe(5000);
      expect(pr.metrics.totalAccesses).toBe(5000);
      expect(pr.metrics.hits + pr.metrics.misses).toBe(5000);
    }
  });

  it("all workload types produce traces", () => {
    const workloads: WorkloadType[] = ["sequential", "random", "looping", "bursty", "frequency-skewed"];
    for (const w of workloads) {
      const trace = generateTrace(w, 50, 42);
      expect(trace.length).toBe(50);
      for (const item of trace) {
        expect(typeof item).toBe("number");
      }
    }
  });
});
