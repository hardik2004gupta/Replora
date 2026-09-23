import { suggestVictim } from "../simulation/mlGuided";
import type { AccessEvent } from "../simulation/types";
import { MLFlowchart } from "./MLFlowchart";

interface MLPanelProps {
  currentEvent: AccessEvent | null;
  trace: number[];
  playbackIndex: number;
}

export function MLPanel({ currentEvent, trace, playbackIndex }: MLPanelProps) {
  const cacheState = currentEvent?.cacheState ?? [];
  const accessHistory = trace.slice(0, Math.max(playbackIndex + 1, 0));
  const prediction = suggestVictim(cacheState, accessHistory);

  return (
    <div className="panel ml-panel">
      <div className="panel-header">
        <span className="panel-title">
          ML-Guided
          <span className="ml-badge">Experimental</span>
        </span>
      </div>

      <div className="ml-flow" aria-label="ML prediction pipeline">
        <span className="ml-flow-step">Access History</span>
        <span className="ml-flow-arrow" aria-hidden="true">&rarr;</span>
        <span className="ml-flow-step">Features</span>
        <span className="ml-flow-arrow" aria-hidden="true">&rarr;</span>
        <span className="ml-flow-step">Prediction</span>
        <span className="ml-flow-arrow" aria-hidden="true">&rarr;</span>
        <span className="ml-flow-step">Victim</span>
      </div>

      <div className="ml-content">
        <div className="ml-features">
          <div className="ml-feature-row">
            <span className="ml-feature-name">Recency</span>
            <span className="ml-feature-value">tracked</span>
          </div>
          <div className="ml-feature-row">
            <span className="ml-feature-name">Lifetime Frequency</span>
            <span className="ml-feature-value">tracked</span>
          </div>
          <div className="ml-feature-row">
            <span className="ml-feature-name">Recent-window Frequency</span>
            <span className="ml-feature-value">tracked</span>
          </div>
          <div className="ml-feature-row">
            <span className="ml-feature-name">Reuse Behaviour</span>
            <span className="ml-feature-value">tracked</span>
          </div>
        </div>

        <div className="ml-prediction">
          <div className="ml-pred-item">
            <span className="ml-pred-label">Reuse Probability</span>
            <span className="ml-pred-value">
              {prediction.suggestedVictim !== null ? `${prediction.reuseProbability}%` : "—"}
            </span>
          </div>
          <div className="ml-pred-item">
            <span className="ml-pred-label">Suggested Victim</span>
            <span className="ml-pred-value">
              {prediction.suggestedVictim !== null ? prediction.suggestedVictim : "—"}
            </span>
          </div>
          <div className="ml-pred-item">
            <span className="ml-pred-label">Confidence</span>
            <span className="ml-pred-value">
              {prediction.suggestedVictim !== null ? prediction.predictionConfidence.toFixed(2) : "—"}
            </span>
          </div>
        </div>
      </div>

      <MLFlowchart
        prediction={prediction}
        cacheState={cacheState}
        accessHistory={accessHistory}
        playbackIndex={playbackIndex}
      />
    </div>
  );
}
