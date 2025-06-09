import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const {
      message,
      videoId,
      context = [],
      existingTimestamps = [],
    } = await request.json();

    // Validate input
    if (!message || !videoId) {
      return NextResponse.json(
        { error: "Message and video ID are required" },
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

    // Build context from previous messages
    const conversationHistory = context
      .slice(-6)
      .map(
        (msg: ChatMessage) =>
          `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // Build timestamp context
    const timestampContext =
      existingTimestamps.length > 0
        ? `\n\nExisting video timestamps:\n${existingTimestamps
            .slice(0, 10)
            .join("\n")}`
        : "";

    const prompt = `You are a helpful video analysis assistant. Analyze the video content and provide a clear, well-formatted response.
    IMPORTANT FORMATTING RULES:
      - Write naturally with clear paragraphs
      - When referencing specific moments, use exact timestamps like "At 2:34" or "Around 1:23:45"
      - Use **bold text** for important points
      - Use bullet points with standard format: "* Point one" or "- Point one"
      - Write conversationally - timestamps will automatically become clickable
      - Do NOT use any special link formatting - just write timestamps normally in text

      RESPONSE GUIDELINES:
      1. Be helpful and conversational
      2. Include specific timestamps when relevant (MM:SS or HH:MM:SS format)  
      3. Describe visual elements clearly when asked
      4. Provide structured information when helpful
      5. Reference specific moments with natural language like "At 2:34, you can see..." or "The key point at 1:23 shows..."
      6. Be concise and to the point. Do not overwhelm the user with too much information unless they ask for it. 

      Previous conversation:
      ${conversationHistory}

      ${timestampContext}

      User question: ${message}

      Provide a helpful response with natural language and relevant timestamps.`;

    console.log(`Processing chat message for video ID: ${videoId}`);

    // Generate response
    const result = await model.generateContent([
      prompt,
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
      return NextResponse.json(
        {
          error:
            "Response was blocked by safety filters. Please try a different question.",
        },
        { status: 400 }
      );
    }

    // Check if response has candidates
    if (
      !result.response.candidates ||
      result.response.candidates.length === 0
    ) {
      console.error("No response candidates available");
      return NextResponse.json(
        { error: "No response generated. Please try a different question." },
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
            "Response was blocked by safety filters. Please try a different question.",
        },
        { status: 400 }
      );
    }

    const responseText = result.response.text();

    // Extract timestamps from response
    const timestampRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
    const foundTimestamps: string[] = [];
    let match;

    while ((match = timestampRegex.exec(responseText)) !== null) {
      foundTimestamps.push(match[1]);
    }

    return NextResponse.json(
      {
        content: responseText,
        timestamps: foundTimestamps,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in chat:", error);

    // Handle specific Google AI errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Response was blocked")) {
      return NextResponse.json(
        {
          error:
            "Response was blocked by safety filters. Please try a different question.",
        },
        { status: 400 }
      );
    }
    if (errorMessage.includes("Text not available")) {
      return NextResponse.json(
        {
          error:
            "Unable to analyze this video. It may be private, restricted, or not accessible.",
        },
        { status: 400 }
      );
    }
    if (errorMessage.includes("SAFETY")) {
      return NextResponse.json(
        {
          error:
            "Response blocked by safety filters. Please try a different question.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat message. Please try again." },
      { status: 500 }
    );
  }
}
