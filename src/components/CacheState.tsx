import type { AccessEvent, PolicyName, PolicyResult } from "../simulation/types";

const POLICY_NAMES: PolicyName[] = ["FIFO", "LRU", "LFU", "RANDOM"];

interface CacheStateProps {
  capacity: number;
  currentEvent: AccessEvent | null;
  selectedPolicy: PolicyName;
  onPolicyChange: (p: PolicyName) => void;
  allResults: PolicyResult[];
  playbackIndex: number;
}

export function CacheState({
  capacity,
  currentEvent,
  selectedPolicy,
  onPolicyChange,
  allResults,
  playbackIndex,
}: CacheStateProps) {
  const cacheState = currentEvent?.cacheState ?? [];
  const requestedItem = currentEvent?.requestedItem ?? null;
  const result = currentEvent?.result ?? null;
  const victim = currentEvent?.victim ?? null;

  const slots: (number | null)[] = [];
  for (let i = 0; i < capacity; i++) {
    slots.push(i < cacheState.length ? cacheState[i] : null);
  }

  const isEviction = result === "miss" && victim !== null;

  const policyDiffs = currentEvent && result === "miss"
    ? allResults
        .filter((r) => r.policy !== selectedPolicy)
        .map((r) => {
          const evt = r.events[playbackIndex];
          return {
            policy: r.policy,
            victim: evt?.victim ?? null,
          };
        })
        .filter((d) => d.victim !== null && d.victim !== victim)
    : [];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Cache State</span>
        <span className="panel-note">Capacity {capacity}</span>
      </div>

      <div className="policy-selector" role="tablist" aria-label="Select policy to view">
        {POLICY_NAMES.map((p) => (
          <button
            key={p}
            className={`policy-tab ${p === selectedPolicy ? "active" : ""}`}
            onClick={() => onPolicyChange(p)}
            role="tab"
            aria-selected={p === selectedPolicy}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="cache-slots" role="list" aria-label={`${selectedPolicy} cache contents`}>
        {slots.map((item, i) => {
          let cls = "cache-slot";
          if (item === null) {
            cls += " empty";
          } else if (currentEvent && item === requestedItem && result === "hit") {
            cls += " hit";
          } else if (currentEvent && item === requestedItem && result === "miss") {
            cls += " miss-new";
          } else if (currentEvent && item === victim && result === "miss") {
            cls += " evicted";
          }
          return (
            <div key={i} className={cls} role="listitem" aria-label={
              item === null ? "Empty slot" : `Slot ${i + 1}: item ${item}`
            }>
              {item !== null ? item : "—"}
            </div>
          );
        })}
      </div>

      <div className="cache-info" aria-live="polite">
        <span className="cache-info-label">Access</span>
        <span className="cache-info-value">
          {requestedItem !== null ? requestedItem : "—"}
        </span>
        <span className="cache-info-label">Result</span>
        <span className={`cache-info-value ${result === "hit" ? "result-hit" : result === "miss" ? "result-miss" : ""}`}>
          {result ? result.toUpperCase() : "—"}
        </span>
        <span className="cache-info-label">Victim</span>
        <span className="cache-info-value" style={victim !== null ? { color: "var(--miss)" } : undefined}>
          {victim !== null ? victim : "—"}
        </span>
      </div>

      {isEviction && (
        <div className="decision-reveal" aria-label="Eviction decision sequence">
          <span className="decision-step">
            Request <span className="decision-value incoming">{requestedItem}</span>
          </span>
          <span className="decision-arrow" aria-hidden="true">&rarr;</span>
          <span className="decision-step">
            Miss
          </span>
          <span className="decision-arrow" aria-hidden="true">&rarr;</span>
          <span className="decision-step">
            Evict <span className="decision-value victim">{victim}</span>
          </span>
          <span className="decision-arrow" aria-hidden="true">&rarr;</span>
          <span className="decision-step">
            Insert <span className="decision-value incoming">{requestedItem}</span>
          </span>
        </div>
      )}

      {policyDiffs.length > 0 && (
        <div className="policy-diff">
          <div className="policy-diff-title">Different eviction decisions</div>
          {policyDiffs.map((d) => (
            <div className="policy-diff-row" key={d.policy}>
              <span>{d.policy}</span>
              <span className="policy-diff-victim">evicts {d.victim}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
