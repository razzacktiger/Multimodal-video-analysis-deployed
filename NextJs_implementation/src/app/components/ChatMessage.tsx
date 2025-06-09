import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { parseTimestamp } from "@/utils/timestampUtils";
import type { ChatMessage as ChatMessageType } from "@/utils/apiService";

interface ChatMessageProps {
  message: ChatMessageType;
  onTimestampClick: (seconds: number) => void;
}

/**
 * ChatMessage Component - Individual chat message with markdown support and clickable timestamps
 */
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onTimestampClick,
}) => {
  const { type, content, timestamps = [] } = message;
  const contentRef = useRef<HTMLDivElement>(null);

  // Custom renderer for markdown components
  const components = {
    // Handle paragraphs
    p: ({ children }: any) => (
      <div className="message-paragraph">{children}</div>
    ),

    // Handle lists
    ul: ({ children }: any) => <ul className="message-list">{children}</ul>,
    li: ({ children }: any) => (
      <li className="message-list-item">{children}</li>
    ),

    // Handle emphasis and strong
    em: ({ children }: any) => <em className="message-emphasis">{children}</em>,
    strong: ({ children }: any) => (
      <strong className="message-strong">{children}</strong>
    ),

    // Handle regular links only
    a: ({ href, children, ...props }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
  };

  // Clean up the content without converting timestamps to links
  const cleanContent = (text: string): string => {
    return (
      text
        // Remove malformed bold markers like "** **"
        .replace(/\*\*\s*\*\*/g, "")
        // Fix trailing asterisks after timestamps like "0:00**" -> "0:00"
        .replace(/(\d{1,2}:\d{2}(?::\d{2})?)\*\*/g, "$1")
        // Fix trailing asterisks after numbers like "1:00**" -> "1:00"
        .replace(/(\d+)\*\*/g, "$1")
        // Fix trailing asterisks after text/colons like "Text**:" -> "Text:"
        .replace(/\*\*([:\.,;!?])/g, "$1")
        // Fix leading asterisks before text like "**Text" -> "Text" (only if not proper bold)
        .replace(/\*\*([^*\s][^*]*?)(?!\*\*)/g, "$1")
        // Remove orphaned double asterisks at end of lines
        .replace(/\*\*$/gm, "")
        // Remove orphaned double asterisks at start of lines
        .replace(/^\*\*/gm, "")
        // Fix bullet points that got mangled
        .replace(/\*\s+\*\*/g, "* ")
        // Clean up extra asterisks (3 or more)
        .replace(/\*{3,}/g, "**")
        // Remove empty bullet points
        .replace(/^\*\s*$/gm, "")
        // Clean up multiple newlines
        .replace(/\n{3,}/g, "\n\n")
        // Trim whitespace
        .trim()
    );
  };

  // Post-process the rendered content to make timestamps clickable
  useEffect(() => {
    if (!contentRef.current || !onTimestampClick) {
      console.log("ChatMessage: useEffect skipped - missing ref or callback");
      return;
    }

    console.log("ChatMessage: Processing timestamps in content");

    const handleTimestampClick = (timestampText: string, seconds: number) => {
      console.log(
        `ChatMessage: Timestamp clicked: ${timestampText} (${seconds} seconds)`
      );
      onTimestampClick(seconds);
    };

    // Find and replace timestamps in text nodes
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";

        // Enhanced timestamp detection - handles all formats including ranges with spaces
        const hasTimestamps = /\d{1,2}:\d{2}(?::\d{2})?/.test(text);

        if (hasTimestamps) {
          console.log(`Found timestamps in text: "${text}"`);

          // Simple but effective regex to match individual timestamps:
          // - Matches 0:00, 1:23, 12:34:56 anywhere in text
          // - Will find all timestamps in "(0:00 - 0:16, 1:22 - 2:05)" individually
          // - Handles timestamps in any context (parentheses, ranges, standalone)
          const timestampRegex = /\d{1,2}:\d{2}(?::\d{2})?/g;

          // Create wrapper span
          const wrapper = document.createElement("span");
          let lastIndex = 0;
          let match;

          // Process all matches with null check
          while ((match = timestampRegex.exec(text)) !== null) {
            if (!match || !match[0]) {
              console.warn("Invalid match found, skipping");
              break;
            }

            // Add text before timestamp
            if (match.index > lastIndex) {
              wrapper.appendChild(
                document.createTextNode(text.slice(lastIndex, match.index))
              );
            }

            // Create timestamp span
            const timestampSpan = document.createElement("span");
            timestampSpan.className = "chat-timestamp-link";
            timestampSpan.textContent = match[0];
            timestampSpan.title = `Jump to ${match[0]}`;
            timestampSpan.setAttribute("role", "button");
            timestampSpan.setAttribute("tabindex", "0");

            const seconds = parseTimestamp(match[0]);
            console.log(
              `Creating timestamp link: ${match[0]} -> ${seconds} seconds`
            );

            // Create closure to capture the current match values
            ((timestampText: string, timestampSeconds: number) => {
              // Add event listeners
              timestampSpan.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Timestamp span clicked: ${timestampText}`);
                handleTimestampClick(timestampText, timestampSeconds);
              });

              timestampSpan.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTimestampClick(timestampText, timestampSeconds);
                }
              });
            })(match[0], seconds);

            wrapper.appendChild(timestampSpan);
            lastIndex = match.index + match[0].length;

            // Prevent infinite loops
            if (timestampRegex.lastIndex === match.index) {
              console.warn("Regex not advancing, breaking loop");
              break;
            }
          }

          // Add remaining text
          if (lastIndex < text.length) {
            wrapper.appendChild(document.createTextNode(text.slice(lastIndex)));
          }

          // Replace the text node
          if (node.parentNode && wrapper.hasChildNodes()) {
            node.parentNode.replaceChild(wrapper, node);
            console.log("Replaced text node with timestamp links");
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Process child nodes
        Array.from(node.childNodes).forEach(child => processNode(child));
      }
    };

    // Process the entire content
    processNode(contentRef.current);
    console.log("ChatMessage: Finished processing timestamps");
  }, [content, onTimestampClick]);

  const processedContent = cleanContent(content);

  return (
    <div
      className={`chat-message ${type === "user" ? "user-message" : "ai-message"}`}
    >
      <div ref={contentRef} className="message-content">
        <ReactMarkdown components={components}>
          {processedContent}
        </ReactMarkdown>
      </div>

      {/* Render additional timestamps if provided */}
      {timestamps.length > 0 && (
        <div className="message-timestamps">
          <div className="timestamps-header">Related timestamps:</div>
          {timestamps.map((timestamp, index) => {
            const handleRelatedTimestampClick = () => {
              console.log(
                `ChatMessage: Related timestamp clicked: ${timestamp}`
              );
              if (onTimestampClick && typeof onTimestampClick === "function") {
                // Assuming timestamp is a string like "0:00 - Description"
                const timestampSeconds = parseTimestamp(timestamp);
                onTimestampClick(timestampSeconds);
              }
            };

            return (
              <button
                key={index}
                className="chat-timestamp-button"
                onClick={handleRelatedTimestampClick}
                title={`Jump to timestamp`}
                type="button"
              >
                {timestamp}
              </button>
            );
          })}
        </div>
      )}

      <div className="message-time">
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

export default ChatMessage;
