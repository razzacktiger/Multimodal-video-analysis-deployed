import React, { useRef, useImperativeHandle, forwardRef } from "react";
import {
  createEmbedUrl,
  createEmbedUrlWithTimestamp,
} from "../../utils/videoUtils";

/**
 * VideoPlayer Component - Modern YouTube video player with card design
 * Migrated from React/Vite to Next.js with TypeScript
 */

interface VideoPlayerProps {
  videoId: string;
}

interface VideoPlayerMethods {
  seekTo: (timeInSeconds: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerMethods, VideoPlayerProps>(
  ({ videoId }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      seekTo: (timeInSeconds: number) => {
        console.log(`VideoPlayer: seekTo called with ${timeInSeconds} seconds`);

        if (iframeRef.current && videoId) {
          const newUrl = createEmbedUrlWithTimestamp(videoId, timeInSeconds);
          console.log(`VideoPlayer: Setting iframe src to: ${newUrl}`);
          iframeRef.current.src = newUrl;
        } else {
          console.error("VideoPlayer: iframe ref or videoId not available", {
            iframeRef: !!iframeRef.current,
            videoId: videoId,
          });
        }
      },
    }));

    const videoUrl = videoId ? createEmbedUrl(videoId) : "";

    return (
      <div className="video-player-container">
        <div className="video-player-card">
          <div className="video-player-header">
            <h4 className="video-player-title">🎥 Video Player</h4>
          </div>
          <div className="video-player-body">
            <div className="video-embed-container">
              <iframe
                ref={iframeRef}
                src={videoUrl}
                title="YouTube video"
                allowFullScreen
                className="video-embed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
