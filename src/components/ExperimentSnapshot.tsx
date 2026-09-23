import type { WorkloadType } from "../simulation/types";

const WORKLOAD_LABELS: Record<WorkloadType, string> = {
  sequential: "Sequential",
  random: "Random",
  looping: "Looping",
  bursty: "Bursty",
  "frequency-skewed": "Freq-skewed",
};

interface ExperimentSnapshotProps {
  workload: WorkloadType;
  capacity: number;
  traceLength: number;
  seed: number;
}

export function ExperimentSnapshot({
  workload,
  capacity,
  traceLength,
  seed,
}: ExperimentSnapshotProps) {
  return (
    <div className="experiment-snapshot" aria-label="Current experiment configuration">
      <span className="snapshot-item">
        <span className="snapshot-label">Workload</span>
        <span className="snapshot-value">{WORKLOAD_LABELS[workload]}</span>
      </span>
      <span className="snapshot-sep" aria-hidden="true">/</span>
      <span className="snapshot-item">
        <span className="snapshot-label">Capacity</span>
        <span className="snapshot-value">{capacity}</span>
      </span>
      <span className="snapshot-sep" aria-hidden="true">/</span>
      <span className="snapshot-item">
        <span className="snapshot-label">Accesses</span>
        <span className="snapshot-value">{traceLength}</span>
      </span>
      <span className="snapshot-sep" aria-hidden="true">/</span>
      <span className="snapshot-item">
        <span className="snapshot-label">Seed</span>
        <span className="snapshot-value">{seed}</span>
      </span>
    </div>
  );
}
