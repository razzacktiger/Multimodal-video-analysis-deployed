"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";

// Components (will be migrated step by step)
import URLInput from "./components/URLInput";
import ProcessingState from "./components/ProcessingState";
import VideoPlayer from "./components/VideoPlayer";
import TimestampList from "./components/TimestampList";
import ChatInterface from "./components/ChatInterface";

// Utils and Services
import { validateYouTubeUrl } from "../utils/videoUtils";
import { APP_STEPS, VIDEO_CONFIG } from "../utils/constants";
import { generateTimestamps, chatWithVideo } from "../utils/apiService";
import {
  extractTimestampLines,
  ParsedTimestamp,
} from "../utils/timestampUtils";
import type { ChatMessage } from "../utils/apiService";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

/**
 * Main App Component - Multimodal Video Analysis Tool
 * Migrated from React/Vite to Next.js with secure API routes
 */
export default function VideoAnalysisApp() {
  // State management
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string>(VIDEO_CONFIG.DEFAULT_VIDEO_ID);
  const [currentStep, setCurrentStep] = useState<string>(APP_STEPS.LANDING); // Start with landing page to test URL input
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Video analysis state
  const [timestamps, setTimestamps] = useState<ParsedTimestamp[]>([]);
  const [timestampProcessingTime, setTimestampProcessingTime] = useState<
    number | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Cancellation state
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Refs
  const videoPlayerRef = useRef<any>(null);

  /**
   * Handle video URL submission and processing
   */
  const handleVideoSubmit = async () => {
    const extractedId = validateYouTubeUrl(videoUrl);
    if (!extractedId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    // Cancel any ongoing chat request when changing videos
    if (abortController) {
      abortController.abort();
      setChatLoading(false);
      setAbortController(null);
    }

    setError("");
    setIsProcessing(true);
    setCurrentStep(APP_STEPS.PROCESSING);
    setVideoId(extractedId);
    setTimestamps([]); // Clear previous timestamps
    setChatMessages([]); // Clear chat history

    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentStep(APP_STEPS.LOADED);

      // Add welcome message to chat
      setChatMessages([
        {
          id: Date.now(),
          type: "ai",
          content:
            "✨ Video loaded! I can help you analyze this video content. Ask me questions, or generate timestamps to get started.",
          timestamps: [],
        },
      ]);
    } catch (error) {
      console.error("Error processing video:", error);
      setError("Failed to process video. Please try again.");
      setCurrentStep(APP_STEPS.LANDING);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle video loading from URL input (legacy method)
   */
  const handleVideoLoad = (newVideoId: string) => {
    // Cancel any ongoing chat request when changing videos
    if (abortController) {
      abortController.abort();
      setChatLoading(false);
      setAbortController(null);
    }

    setVideoId(newVideoId);
    setCurrentStep(APP_STEPS.LOADED);
    setTimestamps([]); // Clear previous timestamps
    setChatMessages([]); // Clear chat history
    setError(""); // Clear any previous errors
  };

  /**
   * Handle timestamp generation using secure API
   */
  const handleGenerateTimestamps = async () => {
    setLoading(true);
    setError("");

    // Track timing for timestamp generation
    const startTime = Date.now();

    try {
      const rawTimestamps = await generateTimestamps(videoId);

      // Parse the raw timestamp strings into structured objects
      const parsedTimestamps = rawTimestamps.flatMap(timestampText =>
        extractTimestampLines(timestampText)
      );

      // Calculate processing time
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      setTimestamps(parsedTimestamps);
      setTimestampProcessingTime(processingTime);

      // Show success message with timing
      console.log(
        `Timestamps generated in ${processingTime.toFixed(1)} seconds`
      );
    } catch (err) {
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      console.log(
        `Timestamp generation failed after ${processingTime.toFixed(1)} seconds`
      );
      setTimestampProcessingTime(undefined);
      setError(
        err instanceof Error ? err.message : "Failed to generate timestamps"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle timestamp clicks for video seeking
   */
  const handleTimestampClick = (timeInSeconds: number) => {
    console.log(`App: Received timestamp click for ${timeInSeconds} seconds`);

    if (videoPlayerRef.current) {
      console.log("App: Video player ref found, calling seekTo");
      videoPlayerRef.current.seekTo(timeInSeconds);
    } else {
      console.error("App: Video player ref not found");
    }
  };

  /**
   * Handle chat message sending using secure API
   */
  const handleSendMessage = async (message: string) => {
    // Add user message to chat immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamps: [],
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Set up cancellation
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // Track timing for chat response
    const startTime = Date.now();
    setChatLoading(true);

    try {
      // Get AI response with cancellation support using secure API
      // Convert ParsedTimestamp[] back to string[] format for API
      const timestampStrings = timestamps.map(
        ts => `${ts.time} - ${ts.description}`
      );
      const response = await chatWithVideo(
        message,
        videoId,
        chatMessages,
        timestampStrings,
        newAbortController.signal
      );

      // Check if request was cancelled
      if (newAbortController.signal.aborted) {
        return;
      }

      // Calculate processing time
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // Convert to seconds

      // Add AI response to chat with timing
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.content,
        timestamps: response.timestamps || [],
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      // Don't show error message if request was cancelled
      if (err instanceof Error && err.message === "Request was cancelled") {
        console.log("Chat request was cancelled by user");
        return;
      }

      // Calculate processing time for error case too
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      // Add error message to chat with timing
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamps: [],
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setAbortController(null);
    }
  };

  /**
   * Handle chat message cancellation
   */
  const handleCancelMessage = () => {
    if (abortController) {
      console.log("App: Cancelling chat request");
      abortController.abort();
      setChatLoading(false);
      setAbortController(null);
    }
  };

  /**
   * Handle enter key press for URL input
   */
  const handleEnterPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };

  /**
   * Reset to landing page
   */
  const handleReset = () => {
    setVideoUrl("");
    setVideoId(VIDEO_CONFIG.DEFAULT_VIDEO_ID);
    setCurrentStep(APP_STEPS.LANDING);
    setError("");
    setTimestamps([]);
    setChatMessages([]);
    setAbortController(null);
  };

  /**
   * Handle errors from components
   */
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">🎥 Multimodal Video Analysis ✨</h1>
          <p className="app-subtitle">
            Chat with your YouTube videos, get insights, and explore content.
          </p>
          {currentStep === APP_STEPS.LOADED && (
            <button className="app-reset-button" onClick={handleReset}>
              🔄 Analyze New Video
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="app-main">
        {/* Landing Page */}
        {currentStep === APP_STEPS.LANDING && (
          <div className="app-landing-container">
            <URLInput
              videoUrl={videoUrl}
              onUrlChange={setVideoUrl}
              onSubmit={handleVideoSubmit}
              isProcessing={isProcessing}
              error={error}
              onEnterPress={handleEnterPress}
              // Legacy support
              onVideoLoad={handleVideoLoad}
              onError={handleError}
            />
          </div>
        )}

        {/* Processing State */}
        {currentStep === APP_STEPS.PROCESSING && (
          <div className="app-processing-container">
            <ProcessingState />
          </div>
        )}

        {/* Video Analysis Interface */}
        {currentStep === APP_STEPS.LOADED && (
          <Container fluid className="h-100 px-0">
            <Row className="g-4 h-100 mx-0 video-analysis-layout">
              {/* Left Column - Video and Timestamps */}
              <Col xs={12} lg={6} className="video-analysis-column px-3">
                <div className="video-section">
                  {/* Video Player */}
                  <div className="video-player-section">
                    <VideoPlayer ref={videoPlayerRef} videoId={videoId} />
                  </div>

                  {/* Timestamps */}
                  <div className="timestamps-section">
                    <TimestampList
                      timestamps={timestamps}
                      loading={loading}
                      error={error}
                      onGenerateTimestamps={handleGenerateTimestamps}
                      onTimestampClick={handleTimestampClick}
                      processingTime={timestampProcessingTime}
                    />
                  </div>
                </div>
              </Col>

              {/* Right Column - Chat Interface */}
              <Col xs={12} lg={6} className="video-analysis-column px-3">
                <div className="chat-section">
                  <div className="chat-container-wrapper">
                    <ChatInterface
                      messages={chatMessages}
                      loading={chatLoading}
                      onSendMessage={handleSendMessage}
                      onTimestampClick={handleTimestampClick}
                      videoId={videoId}
                      onCancelMessage={handleCancelMessage}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        )}
      </div>
    </div>
  );
}
