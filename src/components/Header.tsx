interface HeaderProps {
  onRun: () => void;
  isRunning: boolean;
  isPlaying: boolean;
}

export function Header({ onRun, isRunning, isPlaying }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-title">REPLORA</div>
        <div className="header-subtitle">Cache Replacement Intelligence Lab</div>
      </div>
      <div className="header-right">
        <span className="header-status" aria-label="Local simulation mode active">
          <span
            className={`status-dot${isPlaying ? " pulsing" : ""}`}
            aria-hidden="true"
          />
          Local Simulation
        </span>
        <button
          className={`btn-run ${isRunning ? "running" : ""}`}
          onClick={onRun}
          disabled={isRunning}
          aria-label="Run simulation"
        >
          {isRunning ? "Running..." : "Run Simulation"}
        </button>
      </div>
    </header>
  );
}
