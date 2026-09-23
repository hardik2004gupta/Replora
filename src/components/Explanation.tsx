import type { WorkloadType } from "../simulation/types";
import { getExplanation } from "../simulation/explanations";

const WORKLOAD_DISPLAY: Record<WorkloadType, string> = {
  sequential: "Sequential workload",
  random: "Random workload",
  looping: "Looping workload",
  bursty: "Bursty workload",
  "frequency-skewed": "Frequency-skewed workload",
};

interface ExplanationProps {
  workload: WorkloadType;
}

export function Explanation({ workload }: ExplanationProps) {
  const text = getExplanation(workload);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Why This Happened</span>
      </div>
      <div className="explanation-text">
        <span className="explanation-workload">{WORKLOAD_DISPLAY[workload]}</span>
        <span className="explanation-body">{text}</span>
      </div>
    </div>
  );
}
