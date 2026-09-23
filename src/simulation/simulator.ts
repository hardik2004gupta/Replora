import { FIFOPolicy } from "../algorithms/fifo";
import { LFUPolicy } from "../algorithms/lfu";
import { LRUPolicy } from "../algorithms/lru";
import { RandomPolicy } from "../algorithms/random";
import { computeMetrics } from "./metrics";
import type {
  AccessEvent,
  CachePolicy,
  PolicyName,
  PolicyResult,
  SimulationConfig,
  SimulationResult,
} from "./types";
import { generateTrace } from "./workloads";

function createPolicy(name: PolicyName, capacity: number, seed: number): CachePolicy {
  switch (name) {
    case "FIFO":
      return new FIFOPolicy(capacity);
    case "LRU":
      return new LRUPolicy(capacity);
    case "LFU":
      return new LFUPolicy(capacity);
    case "RANDOM":
      return new RandomPolicy(capacity, seed);
  }
}

function runPolicy(policy: CachePolicy, trace: number[]): { events: AccessEvent[]; timeMs: number } {
  const start = performance.now();
  const events: AccessEvent[] = [];

  for (const item of trace) {
    events.push(policy.access(item));
  }

  const timeMs = performance.now() - start;
  return { events, timeMs };
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const seed = config.seed ?? 42;
  const trace = generateTrace(config.workload, config.traceLength, seed);

  const policyNames: PolicyName[] = ["FIFO", "LRU", "LFU", "RANDOM"];
  const results: PolicyResult[] = [];

  for (const name of policyNames) {
    const policy = createPolicy(name, config.capacity, seed);
    const { events, timeMs } = runPolicy(policy, trace);
    const metrics = computeMetrics(events, config.capacity, timeMs);

    results.push({ policy: name, metrics, events });
  }

  return { config, trace, results };
}
