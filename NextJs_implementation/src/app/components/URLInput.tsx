import React from "react";
import { extractVideoId } from "../../utils/videoUtils";

/**
 * URLInput Component - Landing page for video URL input
 * Supports both modern and legacy APIs for backward compatibility
 * Migrated from React/Vite to Next.js with TypeScript
 */

interface URLInputProps {
  // Modern props
  videoUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  error: string;
  onEnterPress: (e: React.KeyboardEvent, handler: () => void) => void;
  // Legacy props
  onVideoLoad: (videoId: string) => void;
  onError: (error: string) => void;
}

const URLInput: React.FC<URLInputProps> = ({
  // Modern props
  videoUrl,
  onUrlChange,
  onSubmit,
  isProcessing,
  error,
  onEnterPress,
  // Legacy props
  onVideoLoad,
  onError,
}) => {
  // Handle form submission for legacy support
  const handleLegacySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const inputElement = form.elements.namedItem(
      "videoInput"
    ) as HTMLInputElement;
    const inputUrl = inputElement.value.trim();

    if (!inputUrl) {
      onError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractVideoId(inputUrl);
    if (videoId) {
      onVideoLoad(videoId);
      onError(""); // Clear any previous errors
    } else {
      onError("Please enter a valid YouTube URL");
    }
  };

  // For modern API, use controlled input
  if (onUrlChange && onSubmit) {
    return (
      <div className="url-input-container">
        <div className="url-input-card">
          <div className="url-input-header">
            <h3 className="url-input-title">🎬 Enter YouTube Video URL</h3>
          </div>

          <div className="url-input-body">
            <div className="url-input-field">
              <input
                type="url"
                className={`url-input ${error ? "url-input-error" : ""}`}
                placeholder="Paste YouTube URL here..."
                value={videoUrl}
                onChange={e => onUrlChange(e.target.value)}
                onKeyPress={e => onEnterPress && onEnterPress(e, onSubmit)}
              />
              {error && (
                <div className="url-input-error-message">❌ {error}</div>
              )}
            </div>

            <button
              onClick={onSubmit}
              disabled={isProcessing}
              className={`url-submit-button ${isProcessing ? "url-submit-button-disabled" : ""}`}
            >
              {isProcessing ? (
                <div className="url-submit-loading">
                  <div className="url-submit-spinner"></div>
                  Analyzing Magic...
                </div>
              ) : (
                <div className="url-submit-content">
                  <span className="url-submit-emoji">🚀</span>
                  Start Analysis
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Legacy API with uncontrolled input
  return (
    <div className="url-input-container">
      <div className="url-input-card">
        <div className="url-input-header">
          <h3 className="url-input-title">🎬 Enter YouTube Video URL</h3>
        </div>

        <div className="url-input-body">
          <form onSubmit={handleLegacySubmit}>
            <div className="url-input-field">
              <input
                type="url"
                name="videoInput"
                className="url-input"
                placeholder="Paste YouTube URL here..."
              />
              <div className="url-input-help-text">
                📝 Best results with: educational content, tutorials, lectures,
                or documentaries
              </div>
            </div>

            <button type="submit" className="url-submit-button">
              <div className="url-submit-content">
                <span className="url-submit-emoji">🚀</span>
                Load Video
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default URLInput;
