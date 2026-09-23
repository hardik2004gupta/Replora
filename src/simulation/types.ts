export type WorkloadType =
  | "sequential"
  | "random"
  | "looping"
  | "bursty"
  | "frequency-skewed";

export type PolicyName = "FIFO" | "LRU" | "LFU" | "RANDOM";

export interface SimulationConfig {
  workload: WorkloadType;
  capacity: number;
  traceLength: number;
  seed?: number;
}

export interface AccessEvent {
  index: number;
  requestedItem: number;
  result: "hit" | "miss";
  victim: number | null;
  cacheState: number[];
}

export interface SimulationMetrics {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  missRate: number;
  executionTimeMs: number;
  totalAccesses: number;
  cacheCapacity: number;
}

export interface PolicyResult {
  policy: PolicyName;
  metrics: SimulationMetrics;
  events: AccessEvent[];
}

export interface SimulationResult {
  config: SimulationConfig;
  trace: number[];
  results: PolicyResult[];
}

export interface CachePolicy {
  readonly name: PolicyName;
  readonly capacity: number;
  access(item: number): AccessEvent;
  getState(): number[];
  reset(): void;
}
