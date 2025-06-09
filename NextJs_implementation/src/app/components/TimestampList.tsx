import React, { useState, useEffect, useRef } from "react";
import TimestampItem from "./TimestampItem";
import { ParsedTimestamp } from "@/utils/timestampUtils";

interface TimestampListProps {
  timestamps: ParsedTimestamp[];
  loading: boolean;
  error: string | null;
  onGenerateTimestamps: () => void;
  onTimestampClick: (seconds: number) => void;
  processingTime?: number;
}

/**
 * TimestampList Component - Modern timestamp display with card design
 */
const TimestampList: React.FC<TimestampListProps> = ({
  timestamps,
  loading,
  error,
  onGenerateTimestamps,
  onTimestampClick,
  processingTime,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Timer for elapsed time during loading
  useEffect(() => {
    if (loading) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  // Handle scroll for showing/hiding scroll-to-top button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 200);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [timestamps]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="timestamp-list-container">
      <div className="timestamp-list-card">
        <div className="timestamp-list-header">
          <h4 className="timestamp-list-title">⏰ Smart Timestamps</h4>
        </div>

        <div className="timestamp-list-body">
          <button
            onClick={onGenerateTimestamps}
            disabled={loading}
            className={`timestamp-generate-button ${loading ? "timestamp-generate-button-loading" : ""}`}
          >
            {loading ? (
              <div className="timestamp-generate-loading">
                <div className="timestamp-generate-spinner"></div>
                <span>Generating... ({elapsedTime.toFixed(1)}s)</span>
              </div>
            ) : (
              <div className="timestamp-generate-content">
                <span className="timestamp-generate-emoji">✨</span>
                Generate Timestamps
              </div>
            )}
          </button>

          {error && <div className="timestamp-error">❌ {error}</div>}

          {timestamps.length > 0 ? (
            <div className="timestamp-content">
              {processingTime && (
                <div className="timestamp-success">
                  ✓ Generated in {processingTime.toFixed(1)}s
                </div>
              )}
              <div className="timestamp-items" ref={scrollContainerRef}>
                {timestamps.map((timestamp, index) => {
                  const timestampData =
                    typeof timestamp === "string"
                      ? { time: "N/A", description: timestamp, seconds: 0 }
                      : timestamp;

                  return (
                    <TimestampItem
                      key={index}
                      time={timestampData.time}
                      description={timestampData.description}
                      onClick={() => onTimestampClick(timestampData.seconds)}
                    />
                  );
                })}
              </div>

              {/* Scroll to top button */}
              {showScrollTop && (
                <button
                  onClick={scrollToTop}
                  className="timestamp-scroll-top"
                  title="Scroll to top"
                  aria-label="Scroll to top"
                >
                  ↑
                </button>
              )}
            </div>
          ) : !loading && !error ? (
            <div className="timestamp-empty">
              <div className="timestamp-empty-icon">🎬</div>
              <p className="timestamp-empty-text">
                No timestamps generated yet. Click the button to generate.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TimestampList;
