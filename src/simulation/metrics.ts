import type { AccessEvent, SimulationMetrics } from "./types";

export function computeMetrics(
  events: AccessEvent[],
  capacity: number,
  executionTimeMs: number,
): SimulationMetrics {
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  for (const event of events) {
    if (event.result === "hit") {
      hits++;
    } else {
      misses++;
    }
    if (event.victim !== null) {
      evictions++;
    }
  }

  const total = events.length;

  return {
    hits,
    misses,
    evictions,
    hitRate: total > 0 ? (hits / total) * 100 : 0,
    missRate: total > 0 ? (misses / total) * 100 : 0,
    executionTimeMs,
    totalAccesses: total,
    cacheCapacity: capacity,
  };
}
