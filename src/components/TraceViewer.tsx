import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import type { AccessEvent } from "../simulation/types";

interface TraceViewerProps {
  trace: number[];
  events: AccessEvent[];
  playbackIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkipToEnd: () => void;
  onScrub: (index: number) => void;
}

const WINDOW_RADIUS = 30;

export function TraceViewer({
  trace,
  events,
  playbackIndex,
  isPlaying,
  onPlay,
  onPause,
  onSkipToEnd,
  onScrub,
}: TraceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const isLongTrace = trace.length > 200;

  const visibleRange = useMemo(() => {
    if (!isLongTrace) return { start: 0, end: trace.length };
    const start = Math.max(0, playbackIndex - WINDOW_RADIUS);
    const end = Math.min(trace.length, playbackIndex + WINDOW_RADIUS + 1);
    return { start, end };
  }, [isLongTrace, playbackIndex, trace.length]);

  useEffect(() => {
    if (containerRef.current && playbackIndex >= 0 && !isLongTrace) {
      const items = containerRef.current.children;
      const current = items[playbackIndex] as HTMLElement | undefined;
      current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [playbackIndex, isLongTrace]);

  const getScrubIndex = useCallback((clientX: number) => {
    if (!scrubberRef.current || trace.length === 0) return 0;
    const rect = scrubberRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (trace.length - 1));
  }, [trace.length]);

  const handleScrubStart = useCallback((clientX: number) => {
    setIsDragging(true);
    onScrub(getScrubIndex(clientX));
  }, [getScrubIndex, onScrub]);

  const handleScrubMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    onScrub(getScrubIndex(clientX));
  }, [isDragging, getScrubIndex, onScrub]);

  const handleScrubEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => handleScrubMove(e.clientX);
    const onUp = () => handleScrubEnd();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, handleScrubMove, handleScrubEnd]);

  const progress = trace.length > 0 ? ((playbackIndex + 1) / trace.length) * 100 : 0;
  const thumbLeft = trace.length > 1
    ? (Math.max(playbackIndex, 0) / (trace.length - 1)) * 100
    : 0;

  const clickedEvent = selectedEvent !== null && events[selectedEvent]
    ? events[selectedEvent]
    : null;

  return (
    <div className="panel trace-container">
      <div className="panel-header">
        <span className="panel-title">Access Trace</span>
        <span className="panel-note">
          {isLongTrace
            ? `${visibleRange.start + 1}–${visibleRange.end} of ${trace.length}`
            : `${trace.length} accesses`}
        </span>
      </div>

      <div
        className="trace-window"
        ref={containerRef}
        role="list"
        aria-label="Access trace sequence"
      >
        {trace.slice(visibleRange.start, visibleRange.end).map((item, offsetI) => {
          const i = visibleRange.start + offsetI;
          const distance = Math.abs(i - playbackIndex);
          let cls = "trace-item";
          if (i === playbackIndex) {
            cls += " current";
          } else if (i < playbackIndex && events[i]) {
            cls += events[i].result === "hit" ? " past-hit" : " past-miss";
          }
          if (distance <= 3) cls += " near";
          else if (distance > 10) cls += " far";
          if (i === selectedEvent) cls += " selected";

          return (
            <div
              key={i}
              className={cls}
              role="listitem"
              aria-label={
                i === playbackIndex
                  ? `Current access: ${item}`
                  : i < playbackIndex && events[i]
                    ? `Access ${item}: ${events[i].result}`
                    : `Upcoming: ${item}`
              }
              onClick={() => {
                setSelectedEvent(selectedEvent === i ? null : i);
                onScrub(i);
              }}
            >
              {String(item).padStart(2, " ")}
            </div>
          );
        })}
      </div>

      <div
        className={`trace-scrubber${isDragging ? " dragging" : ""}`}
        ref={scrubberRef}
        onPointerDown={(e) => {
          e.preventDefault();
          handleScrubStart(e.clientX);
        }}
        role="slider"
        aria-label="Trace position"
        aria-valuenow={playbackIndex + 1}
        aria-valuemin={1}
        aria-valuemax={trace.length}
        tabIndex={0}
      >
        <div className="trace-scrubber-track">
          <div
            className="trace-scrubber-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className="trace-scrubber-thumb"
          style={{ left: `${thumbLeft}%` }}
        />
      </div>

      <div className="trace-playback">
        <button
          className="btn-playback"
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? "Pause playback" : "Play trace"}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="btn-playback"
          onClick={onSkipToEnd}
          aria-label="Skip to end of trace"
        >
          End
        </button>
        <span className="trace-counter">
          {playbackIndex >= 0 ? playbackIndex + 1 : 0}/{trace.length}
        </span>
      </div>

      {clickedEvent && (
        <div className="event-detail" role="region" aria-label="Event detail">
          <span className="event-detail-label">Access</span>
          <span className="event-detail-value">#{clickedEvent.index + 1}</span>
          <span className="event-detail-label">Requested</span>
          <span className="event-detail-value">{String(clickedEvent.requestedItem).padStart(2, "0")}</span>
          <span className="event-detail-label">Result</span>
          <span className={`event-detail-value ${clickedEvent.result === "hit" ? "result-hit" : "result-miss"}`}>
            {clickedEvent.result.toUpperCase()}
          </span>
          <span className="event-detail-label">Victim</span>
          <span className="event-detail-value" style={clickedEvent.victim !== null ? { color: "var(--miss)" } : undefined}>
            {clickedEvent.victim !== null ? String(clickedEvent.victim).padStart(2, "0") : "—"}
          </span>
          <div className="event-detail-cache">
            {clickedEvent.cacheState.map((item, idx) => (
              <span key={idx} className="event-detail-cache-item">
                {String(item).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
