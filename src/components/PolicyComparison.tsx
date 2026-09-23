import type { PolicyResult, PolicyName } from "../simulation/types";
import { Tooltip } from "./Tooltip";

const POLICY_TOOLTIPS: Record<PolicyName, string> = {
  FIFO: "First In, First Out — evicts the oldest inserted entry.",
  LRU: "Least Recently Used — evicts the entry not accessed for the longest time.",
  LFU: "Least Frequently Used — evicts the entry with the fewest accesses.",
  RANDOM: "Random Replacement — evicts a random resident entry.",
};

interface PolicyComparisonProps {
  results: PolicyResult[];
  focusedPolicy: PolicyName | null;
  onFocusPolicy: (p: PolicyName | null) => void;
}

export function PolicyComparison({
  results,
  focusedPolicy,
  onFocusPolicy,
}: PolicyComparisonProps) {
  const maxHitRate = Math.max(...results.map((r) => r.metrics.hitRate), 1);
  const bestRate = maxHitRate;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Policy Comparison</span>
        <span className="panel-note">Observed under current workload</span>
      </div>

      {results.map((r) => {
        const isMuted = focusedPolicy !== null && focusedPolicy !== r.policy;
        const isFocused = focusedPolicy === r.policy;
        const delta = r.metrics.hitRate - bestRate;
        const deltaStr = delta === 0 ? "best" : `${delta.toFixed(1)} pts`;

        return (
          <div
            className={`policy-row${isMuted ? " muted" : ""}${isFocused ? " focused" : ""}`}
            key={r.policy}
            onClick={() => onFocusPolicy(focusedPolicy === r.policy ? null : r.policy)}
          >
            <Tooltip text={POLICY_TOOLTIPS[r.policy]}>
              <span className="policy-name">{r.policy}</span>
            </Tooltip>
            <div
              className="policy-bar-track"
              role="meter"
              aria-label={`${r.policy} hit rate`}
              aria-valuenow={r.metrics.hitRate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="policy-bar-fill"
                style={{ width: `${(r.metrics.hitRate / Math.max(maxHitRate, 1)) * 100}%` }}
                data-best={r.metrics.hitRate === maxHitRate ? "true" : "false"}
              />
            </div>
            <span className="policy-percent">{r.metrics.hitRate.toFixed(1)}%</span>
            <span className="policy-delta">{deltaStr}</span>
          </div>
        );
      })}

      {focusedPolicy && (
        <button
          className="policy-focus-btn"
          onClick={() => onFocusPolicy(null)}
        >
          Compare All
        </button>
      )}

      <table className="comparison-table" aria-label="Detailed policy comparison">
        <thead>
          <tr>
            <th scope="col">Policy</th>
            <th scope="col">Hit</th>
            <th scope="col">Miss</th>
            <th scope="col">Evict</th>
            <th scope="col">Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.policy}>
              <td>{r.policy}</td>
              <td>{r.metrics.hitRate.toFixed(1)}%</td>
              <td>{r.metrics.missRate.toFixed(1)}%</td>
              <td>{r.metrics.evictions}</td>
              <td>{r.metrics.executionTimeMs.toFixed(2)}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
