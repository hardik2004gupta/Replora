import type { SimulationMetrics } from "../simulation/types";
import { Tooltip } from "./Tooltip";

interface MetricStripProps {
  metrics: SimulationMetrics | null;
}

export function MetricStrip({ metrics }: MetricStripProps) {
  const hitRate = metrics ? metrics.hitRate.toFixed(1) : "—";
  const missRate = metrics ? metrics.missRate.toFixed(1) : "—";
  const evictions = metrics ? metrics.evictions.toString() : "—";
  const execTime = metrics ? metrics.executionTimeMs.toFixed(2) : "—";

  return (
    <div className="metric-strip" role="region" aria-label="Simulation metrics">
      <div className="metric-card">
        <Tooltip text="Percentage of accesses already present in the cache.">
          <div className="metric-label">Hit Rate</div>
        </Tooltip>
        <div className="metric-value hit">
          {hitRate}<span className="metric-unit">%</span>
        </div>
      </div>
      <div className="metric-card">
        <Tooltip text="Percentage of accesses that required fetching from memory.">
          <div className="metric-label">Miss Rate</div>
        </Tooltip>
        <div className="metric-value miss">
          {missRate}<span className="metric-unit">%</span>
        </div>
      </div>
      <div className="metric-card">
        <Tooltip text="Number of entries evicted to make room for new items.">
          <div className="metric-label">Evictions</div>
        </Tooltip>
        <div className="metric-value">{evictions}</div>
      </div>
      <div className="metric-card">
        <Tooltip text="Wall-clock time for the simulation in the browser.">
          <div className="metric-label">Execution</div>
        </Tooltip>
        <div className="metric-value">
          {execTime}<span className="metric-unit">ms</span>
        </div>
      </div>
    </div>
  );
}
