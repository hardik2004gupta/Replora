import { useState, useCallback, useRef, useEffect } from "react";
import { runSimulation } from "./simulation/simulator";
import type {
  WorkloadType,
  PolicyName,
  SimulationResult,
} from "./simulation/types";
import { Header } from "./components/Header";
import { ExperimentSnapshot } from "./components/ExperimentSnapshot";
import { MetricStrip } from "./components/MetricStrip";
import { PolicyComparison } from "./components/PolicyComparison";
import { WorkloadPanel } from "./components/WorkloadPanel";
import { TraceViewer } from "./components/TraceViewer";
import { CacheState } from "./components/CacheState";
import { Explanation } from "./components/Explanation";
import { ComplexityPanel } from "./components/ComplexityPanel";
import { MLPanel } from "./components/MLPanel";

const DEFAULTS = {
  workload: "looping" as WorkloadType,
  capacity: 4,
  traceLength: 100,
  seed: 42,
};

function App() {
  const [workload, setWorkload] = useState<WorkloadType>(DEFAULTS.workload);
  const [capacity, setCapacity] = useState(DEFAULTS.capacity);
  const [traceLength, setTraceLength] = useState(DEFAULTS.traceLength);
  const [animationOn, setAnimationOn] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyName>("FIFO");
  const [focusedPolicy, setFocusedPolicy] = useState<PolicyName | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    runSimulation({ ...DEFAULTS })
  );

  const [playbackIndex, setPlaybackIndex] = useState(
    DEFAULTS.traceLength - 1
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback((result: SimulationResult, fromIndex: number) => {
    stopPlayback();
    let idx = fromIndex;
    const len = result.trace.length;
    const speed = len > 1000 ? 5 : len > 500 ? 10 : len > 200 ? 20 : len > 50 ? 50 : 80;
    const interval = setInterval(() => {
      setPlaybackIndex(idx);
      idx++;
      if (idx >= len) {
        clearInterval(interval);
        playIntervalRef.current = null;
        setIsPlaying(false);
      }
    }, speed);
    playIntervalRef.current = interval;
    setIsPlaying(true);
  }, [stopPlayback]);

  const handleRun = useCallback(() => {
    stopPlayback();
    setIsRunning(true);

    requestAnimationFrame(() => {
      const result = runSimulation({
        workload,
        capacity,
        traceLength,
        seed: DEFAULTS.seed,
      });
      setSimResult(result);
      setIsRunning(false);

      if (animationOn && traceLength <= 2000) {
        setPlaybackIndex(-1);
        requestAnimationFrame(() => startPlayback(result, 0));
      } else {
        setPlaybackIndex(result.trace.length - 1);
      }
    });
  }, [workload, capacity, traceLength, animationOn, stopPlayback, startPlayback]);

  const handleReset = useCallback(() => {
    stopPlayback();
    setWorkload(DEFAULTS.workload);
    setCapacity(DEFAULTS.capacity);
    setTraceLength(DEFAULTS.traceLength);
    setSelectedPolicy("FIFO");
    setFocusedPolicy(null);

    const result = runSimulation({ ...DEFAULTS });
    setSimResult(result);
    setPlaybackIndex(result.trace.length - 1);
  }, [stopPlayback]);

  const handlePlay = useCallback(() => {
    const startIdx = playbackIndex >= simResult.trace.length - 1 ? 0 : Math.max(playbackIndex, 0);
    startPlayback(simResult, startIdx);
  }, [playbackIndex, simResult, startPlayback]);

  const handlePause = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  const handleSkipToEnd = useCallback(() => {
    stopPlayback();
    setPlaybackIndex(simResult.trace.length - 1);
  }, [stopPlayback, simResult.trace.length]);

  const handleScrub = useCallback((index: number) => {
    stopPlayback();
    setPlaybackIndex(Math.max(0, Math.min(index, simResult.trace.length - 1)));
  }, [stopPlayback, simResult.trace.length]);

  const handleFocusPolicy = useCallback((p: PolicyName | null) => {
    setFocusedPolicy(p);
    if (p) setSelectedPolicy(p);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (isPlaying) handlePause();
          else handlePlay();
          break;
        case "r":
        case "R":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleRun();
          }
          break;
        case "Escape":
          e.preventDefault();
          handleReset();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stopPlayback();
          setPlaybackIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          stopPlayback();
          setPlaybackIndex((prev) => Math.min(simResult.trace.length - 1, prev + 1));
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, handlePause, handlePlay, handleRun, handleReset, stopPlayback, simResult.trace.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  const policyResult = simResult.results.find(
    (r) => r.policy === selectedPolicy
  );
  const currentEvent =
    policyResult && playbackIndex >= 0
      ? policyResult.events[playbackIndex] ?? null
      : null;

  const selectedMetrics = policyResult?.metrics ?? null;

  return (
    <div className="dashboard">
      <Header onRun={handleRun} isRunning={isRunning} isPlaying={isPlaying} />

      <ExperimentSnapshot
        workload={workload}
        capacity={capacity}
        traceLength={traceLength}
        seed={DEFAULTS.seed}
      />

      <MetricStrip metrics={selectedMetrics} />

      <div className="main-grid">
        <PolicyComparison
          results={simResult.results}
          focusedPolicy={focusedPolicy}
          onFocusPolicy={handleFocusPolicy}
        />
        <WorkloadPanel
          workload={workload}
          capacity={capacity}
          traceLength={traceLength}
          animationOn={animationOn}
          onWorkloadChange={setWorkload}
          onCapacityChange={setCapacity}
          onTraceLengthChange={setTraceLength}
          onAnimationToggle={() => setAnimationOn((v) => !v)}
          onReset={handleReset}
          onRun={handleRun}
          isRunning={isRunning}
        />
      </div>

      <div className="trace-cache-row">
        <TraceViewer
          trace={simResult.trace}
          events={policyResult?.events ?? []}
          playbackIndex={playbackIndex}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onSkipToEnd={handleSkipToEnd}
          onScrub={handleScrub}
        />
        <CacheState
          capacity={capacity}
          currentEvent={currentEvent}
          selectedPolicy={selectedPolicy}
          onPolicyChange={setSelectedPolicy}
          allResults={simResult.results}
          playbackIndex={playbackIndex}
        />
      </div>

      <div className="bottom-grid">
        <Explanation workload={workload} />
        <ComplexityPanel />
      </div>

      <MLPanel
        currentEvent={currentEvent}
        trace={simResult.trace}
        playbackIndex={playbackIndex}
      />

      <div className="keyboard-hints" aria-label="Keyboard shortcuts">
        <span><span className="kbd">Space</span> Play/Pause</span>
        <span><span className="kbd">&larr;</span><span className="kbd">&rarr;</span> Step</span>
        <span><span className="kbd">R</span> Run</span>
        <span><span className="kbd">Esc</span> Reset</span>
      </div>

      <footer className="footer" aria-label="Application info">
        <span>REPLORA</span>
        <span className="footer-sep" aria-hidden="true">&middot;</span>
        <span>Local Experiment</span>
        <span className="footer-sep" aria-hidden="true">&middot;</span>
        <span>v0.1</span>
      </footer>

      <div className="mobile-sticky-run">
        <button
          className={`btn-run ${isRunning ? "running" : ""}`}
          onClick={handleRun}
          disabled={isRunning}
          aria-label="Run simulation"
        >
          {isRunning ? "Running..." : "Run Simulation"}
        </button>
      </div>
    </div>
  );
}

export default App;
