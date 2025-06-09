/**
 * Client-side API service for secure communication with server-side AI endpoints
 * This replaces the direct Google AI client calls with secure server-side API calls
 */

export interface ChatMessage {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamps?: string[];
}

export interface TimestampResponse {
  timestamps: string[];
  success: boolean;
}

export interface ChatResponse {
  content: string;
  timestamps: string[];
  success: boolean;
}

export interface ApiError {
  error: string;
}

/**
 * Generate timestamps for a YouTube video using secure server-side API
 * @param videoId - YouTube video ID
 * @returns Promise with timestamps array
 */
export const generateTimestamps = async (
  videoId: string
): Promise<string[]> => {
  try {
    console.log(`ApiService: Generating timestamps for video ID: ${videoId}`);

    const response = await fetch("/api/generate-timestamps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data: TimestampResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to generate timestamps");
    }

    console.log(`ApiService: Generated ${data.timestamps.length} timestamps`);
    return data.timestamps;
  } catch (error) {
    console.error("Error generating timestamps:", error);

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to generate timestamps. Please try again.");
  }
};

/**
 * Chat with video content using secure server-side API
 * @param message - User message
 * @param videoId - YouTube video ID
 * @param context - Previous conversation context
 * @param existingTimestamps - Previously generated timestamps for context
 * @param signal - Optional abort signal for cancellation
 * @returns Promise with AI response
 */
export const chatWithVideo = async (
  message: string,
  videoId: string,
  context: ChatMessage[] = [],
  existingTimestamps: string[] = [],
  signal?: AbortSignal
): Promise<{ content: string; timestamps: string[] }> => {
  try {
    console.log(`ApiService: Processing chat message for video ID: ${videoId}`);

    // Check if already cancelled
    if (signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    const response = await fetch("/api/chat-with-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        videoId,
        context: context.slice(-6), // Limit context to last 6 messages
        existingTimestamps: existingTimestamps.slice(0, 10), // Limit timestamps
      }),
      signal, // Pass abort signal to fetch
    });

    // Check if request was cancelled
    if (signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data: ChatResponse = await response.json();

    if (!data.success) {
      throw new Error("Failed to process chat message");
    }

    console.log(
      `ApiService: Received chat response with ${data.timestamps.length} timestamps`
    );

    return {
      content: data.content,
      timestamps: data.timestamps,
    };
  } catch (error) {
    console.error("Error in chat:", error);

    // Handle cancellation
    if (error instanceof Error && error.message === "Request was cancelled") {
      throw error;
    }

    // Handle abort errors
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request was cancelled");
    }

    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to process chat message. Please try again.");
  }
};

/**
 * Search video content (placeholder for future implementation)
 * @param query - Search query
 * @param videoId - YouTube video ID
 * @returns Promise with search results
 */
export const searchVideoContent = async (
  query: string,
  videoId: string
): Promise<any[]> => {
  // TODO: Implement when frame search API is ready
  console.log(
    `ApiService: Frame search not yet implemented for query: ${query}, video: ${videoId}`
  );
  return [];
};
