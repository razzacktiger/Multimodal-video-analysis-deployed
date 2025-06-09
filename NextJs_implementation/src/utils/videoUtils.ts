/**
 * Utility functions for video processing and URL handling
 */

/**
 * Extracts video ID from various YouTube URL formats
 * @param url - YouTube URL
 * @returns Video ID or null if invalid
 */
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param url - URL to validate
 * @returns Video ID if valid, false if invalid
 */
export const validateYouTubeUrl = (url: string): string | false => {
  const videoId = extractVideoId(url);
  return videoId || false;
};

/**
 * Creates YouTube embed URL from video ID
 * @param videoId - YouTube video ID
 * @returns YouTube embed URL
 */
export const createEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
};

/**
 * Create embed URL with timestamp
 * @param videoId - YouTube video ID
 * @param startTime - Start time in seconds
 * @returns Embed URL with timestamp
 */
export const createEmbedUrlWithTimestamp = (
  videoId: string,
  startTime: number
): string => {
  return `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`;
};

/**
 * Validate YouTube URL
 * @param url - URL to validate
 * @returns True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractVideoId(url);
  return videoId !== null && videoId.length > 0;
};
