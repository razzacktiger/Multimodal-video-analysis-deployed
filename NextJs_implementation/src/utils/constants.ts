/**
 * Application constants
 */

// Processing delays (for simulation)
export const PROCESSING_DELAYS = {
  VIDEO_ANALYSIS: 3000,
  CHAT_RESPONSE: 2000,
  FRAME_SEARCH: 3000,
} as const;

// Application steps
export const APP_STEPS = {
  LANDING: "landing",
  PROCESSING: "processing",
  LOADED: "loaded",
} as const;

// Chat interface constants
export const CHAT_CONFIG = {
  MAX_HISTORY_LENGTH: 10,
  TYPING_DELAY: 1500,
  MAX_MESSAGE_LENGTH: 1000,
} as const;

// Video player constants
export const VIDEO_CONFIG = {
  DEFAULT_VIDEO_ID: "bFGXQypBf_I", // Ottoman History (educational content)
  EMBED_OPTIONS: "enablejsapi=1",
  SEEK_THRESHOLD: 2, // seconds
} as const;

// Type definitions for constants
export type AppStep = (typeof APP_STEPS)[keyof typeof APP_STEPS];
export type ProcessingDelay =
  (typeof PROCESSING_DELAYS)[keyof typeof PROCESSING_DELAYS];
