import { useMemo } from "react";
import { extractFeatures, predictReuse } from "../simulation/mlGuided";
import type { MLPrediction } from "../simulation/mlGuided";

interface MLFlowchartProps {
  prediction: MLPrediction;
  cacheState: number[];
  accessHistory: number[];
  playbackIndex: number;
}

const WEIGHTS = [
  { label: "Recency", weight: 0.30 },
  { label: "Lifetime Freq", weight: 0.25 },
  { label: "Recent Freq", weight: 0.25 },
  { label: "Reuse Behaviour", weight: 0.20 },
] as const;

type Stage = "history" | "features" | "normalize" | "prediction" | "victim";

function getActiveStage(cacheState: number[], playbackIndex: number): Stage {
  if (playbackIndex < 0) return "history";
  if (cacheState.length === 0) return "history";
  return "victim";
}

export function MLFlowchart({
  prediction,
  cacheState,
  accessHistory,
  playbackIndex,
}: MLFlowchartProps) {
  const activeStage = getActiveStage(cacheState, playbackIndex);
  const hasData = cacheState.length > 0 && accessHistory.length > 0;

  const featureData = useMemo(() => {
    if (!hasData || prediction.suggestedVictim === null) return null;
    const victim = prediction.suggestedVictim;
    const features = extractFeatures(victim, cacheState, accessHistory);
    const scores = {
      recency: features.recency === Infinity ? 0 : 1 / (1 + features.recency),
      freq: Math.min(features.lifetimeFrequency / 10, 1),
      recent: Math.min(features.recentWindowFrequency / 5, 1),
      reuse: features.reuseBehaviour,
    };
    const probability = predictReuse(features);
    return { features, scores, probability };
  }, [hasData, prediction.suggestedVictim, cacheState, accessHistory]);

  const stages: { id: Stage; label: string }[] = [
    { id: "history", label: "Access History" },
    { id: "features", label: "Feature Extraction" },
    { id: "normalize", label: "Normalize" },
    { id: "prediction", label: "Weighted Heuristic" },
    { id: "victim", label: "Suggested Victim" },
  ];

  return (
    <div className="mlfc" aria-label="ML pipeline flowchart">
      <div className="mlfc-pipeline">
        {stages.map((stage, i) => (
          <div key={stage.id} className="mlfc-stage-group">
            <div
              className={`mlfc-node${activeStage === stage.id && hasData ? " mlfc-node--active" : ""}`}
              style={{ animationDelay: `${400 + i * 80}ms` }}
            >
              <span className="mlfc-node-label">{stage.label}</span>

              {stage.id === "features" && (
                <div className="mlfc-features">
                  {WEIGHTS.map((w) => (
                    <div className="mlfc-feature-item" key={w.label}>
                      <span className="mlfc-feature-name">{w.label}</span>
                      {featureData && (
                        <span className="mlfc-feature-score">
                          {w.label === "Recency" && featureData.scores.recency.toFixed(2)}
                          {w.label === "Lifetime Freq" && featureData.scores.freq.toFixed(2)}
                          {w.label === "Recent Freq" && featureData.scores.recent.toFixed(2)}
                          {w.label === "Reuse Behaviour" && featureData.scores.reuse.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {stage.id === "prediction" && (
                <div className="mlfc-weights">
                  {WEIGHTS.map((w) => (
                    <div className="mlfc-weight-row" key={w.label}>
                      <span className="mlfc-weight-val">{w.weight.toFixed(2)}</span>
                      <span className="mlfc-weight-mul">&times;</span>
                      <span className="mlfc-weight-name">{w.label}</span>
                    </div>
                  ))}
                  {featureData && (
                    <div className="mlfc-weight-result">
                      = {(featureData.probability * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              )}

              {stage.id === "history" && (
                <span className="mlfc-node-sub">
                  {accessHistory.length > 0
                    ? `${accessHistory.length} accesses`
                    : "Awaiting trace"}
                </span>
              )}

              {stage.id === "victim" && (
                <span className="mlfc-node-result">
                  {prediction.suggestedVictim !== null
                    ? String(prediction.suggestedVictim)
                    : "—"}
                </span>
              )}
            </div>

            {i < stages.length - 1 && (
              <span
                className="mlfc-arrow"
                aria-hidden="true"
                style={{ animationDelay: `${440 + i * 80}ms` }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mlfc-divider" />

      <div className="mlfc-distinction">
        <div className="mlfc-dist-row">
          <span className="mlfc-dist-label">ML Guidance</span>
          <span className="mlfc-dist-arrow" aria-hidden="true">&darr;</span>
          <span className="mlfc-dist-value">
            Suggested Victim{prediction.suggestedVictim !== null ? `: ${prediction.suggestedVictim}` : ""}
          </span>
        </div>
        <span className="mlfc-dist-neq" aria-label="does not equal">&ne;</span>
        <div className="mlfc-dist-row">
          <span className="mlfc-dist-label">Actual Eviction</span>
          <span className="mlfc-dist-note">FIFO / LRU / LFU / Random</span>
        </div>
      </div>

      <div className="mlfc-footer">
        <span className="mlfc-footer-badge">Experimental</span>
        <span className="mlfc-footer-badge">Read-Only</span>
      </div>
      <p className="mlfc-footnote">
        Classical policies remain the source of truth.
      </p>
    </div>
  );
}
