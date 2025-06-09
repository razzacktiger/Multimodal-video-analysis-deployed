import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Extract timestamp lines from AI response text
 */
function extractTimestampLines(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lines = text.split("\n");
  const timestampRegex = /^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]\s*(.+)/;

  const timestamps: string[] = [];

  for (const line of lines) {
    const match = line.match(timestampRegex);
    if (match) {
      const [, time, title] = match;
      timestamps.push(`${time.trim()} - ${title.trim()}`);
    }
  }

  return timestamps;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { videoId } = await request.json();

    // Validate input
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // Get API key from environment variables (server-side only)
    const API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!API_KEY) {
      console.error("GOOGLE_AI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
    });

    console.log(`Generating timestamps for video ID: ${videoId}`);

    // Generate timestamps
    const result = await model.generateContent([
      "Please create time-stamps for the video and make sure its in the format of 00:00 - title. Provide clear, descriptive titles for each section.",
      {
        fileData: {
          fileUri: `https://www.youtube.com/watch?v=${videoId}`,
          mimeType: "video/mp4",
        },
      },
    ]);

    // Check if response was blocked
    if (result.response.promptFeedback?.blockReason) {
      const blockReason = result.response.promptFeedback.blockReason;
      console.error("Response blocked due to:", blockReason);

      let errorMessage = `Content was blocked by safety filters (${blockReason}).`;

      // Provide specific guidance based on block reason
      switch (blockReason) {
        case "OTHER":
          errorMessage +=
            " This video may contain content that doesn't meet AI safety guidelines. Try educational videos like tutorials, documentaries, or lectures.";
          break;
        case "SAFETY":
          errorMessage +=
            " This video contains content flagged for safety concerns. Please try a different video.";
          break;

        default:
          errorMessage +=
            " Try with a different video - educational content works best.";
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Check if response has candidates
    if (
      !result.response.candidates ||
      result.response.candidates.length === 0
    ) {
      console.error("No response candidates available");
      return NextResponse.json(
        {
          error:
            "No response generated. The video might not be accessible or suitable for analysis.",
        },
        { status: 400 }
      );
    }

    // Check finish reason
    const finishReason = result.response.candidates[0].finishReason;
    if (finishReason === "SAFETY") {
      console.error("Response blocked due to safety concerns");
      return NextResponse.json(
        {
          error:
            "Content was blocked by safety filters. Try with a different video.",
        },
        { status: 400 }
      );
    }

    const text = result.response.text();
    const timestamps = extractTimestampLines(text);

    return NextResponse.json(
      {
        timestamps,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating timestamps:", error);

    // Handle specific Google AI errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Response was blocked")) {
      return NextResponse.json(
        {
          error:
            "This video content cannot be analyzed due to safety restrictions. Please try a different video.",
        },
        { status: 400 }
      );
    }
    if (errorMessage.includes("Text not available")) {
      return NextResponse.json(
        {
          error:
            "Unable to analyze this video. It may be private, restricted, or not accessible to the AI model.",
        },
        { status: 400 }
      );
    }
    if (errorMessage.includes("SAFETY")) {
      return NextResponse.json(
        {
          error:
            "Video content blocked by safety filters. Please try a different video.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to generate timestamps. Please try again with a different video.",
      },
      { status: 500 }
    );
  }
}
