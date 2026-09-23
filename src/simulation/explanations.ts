import type { WorkloadType } from "./types";

const explanations: Record<WorkloadType, string> = {
  sequential:
    "The workload continually advances through new entries, creating scan-like pressure on the cache. No policy benefits from reuse since every access is unique.",
  random:
    "Weak locality makes historical access patterns less predictable. Policies that track recency or frequency gain little advantage over random eviction.",
  looping:
    "Repeated reuse of a small working set makes recent-access history important. Policies that retain recently used items can capture the entire loop.",
  bursty:
    "Short periods of concentrated reuse create temporary working sets. Policies sensitive to recent activity can exploit burst locality before the pattern shifts.",
  "frequency-skewed":
    "A few entries dominate accesses, making frequency history especially relevant. Policies that retain frequently used items achieve substantially higher hit rates.",
};

export function getExplanation(workload: WorkloadType): string {
  return explanations[workload];
}
