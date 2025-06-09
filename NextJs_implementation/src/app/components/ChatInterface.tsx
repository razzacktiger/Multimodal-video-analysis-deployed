import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import type { ChatMessage as ChatMessageType } from "@/utils/apiService";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  onTimestampClick: (seconds: number) => void;
  onCancelMessage?: () => void;
  videoId: string;
}

/**
 * ChatInterface Component - Modern chat interface with card design
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading,
  onSendMessage,
  onTimestampClick,
  onCancelMessage,
  videoId,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Smooth scroll to bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Scroll to bottom when a new message is being typed
  useEffect(() => {
    if (loading && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [loading]);

  // Handle scroll for showing/hiding scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollBottom(!isNearBottom && messages.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !videoId) return;
    onSendMessage(message);
    setInputMessage("");
  };

  // Suggested questions for users
  const suggestedQuestions = [
    "What is this video about?",
    "Summarize the main points",
    "When does the speaker mention [topic]?",
    "Show me the most important parts",
  ];

  return (
    <div className="chat-interface-container">
      <div className="chat-interface-card">
        <div className="chat-interface-header">
          <h4 className="chat-interface-title">💬 Video Chat</h4>
          <p className="chat-interface-subtitle">
            Ask questions about the video content
          </p>
        </div>

        <div className="chat-interface-body">
          <div className="chat-messages-container" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-content">
                  <div className="chat-welcome-icon">🤖</div>
                  <h5 className="chat-welcome-title">
                    Video analysis complete!
                  </h5>
                  <p className="chat-welcome-text">
                    Ask me anything about the content, or click on timestamps to
                    jump to specific sections.
                  </p>

                  <div className="chat-suggested-questions">
                    <p className="chat-suggested-title">Try asking:</p>
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        className="chat-suggested-question"
                        onClick={() => setInputMessage(question)}
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onTimestampClick={onTimestampClick}
                />
              ))
            )}

            {loading && (
              <div className="chat-typing-indicator">
                <div className="chat-typing-content">
                  <div className="chat-typing-dots">
                    <div className="chat-typing-dot"></div>
                    <div className="chat-typing-dot"></div>
                    <div className="chat-typing-dot"></div>
                  </div>
                  <span className="chat-typing-text">AI is thinking...</span>
                </div>
                {onCancelMessage && (
                  <button
                    onClick={onCancelMessage}
                    className="chat-cancel-button"
                    title="Cancel request"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* Scroll to bottom button */}
            {showScrollBottom && (
              <button
                onClick={scrollToBottom}
                className="chat-scroll-bottom"
                title="Scroll to bottom"
                aria-label="Scroll to bottom"
              >
                ↓
              </button>
            )}
          </div>

          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendMessage}
            disabled={loading || !videoId}
            placeholder={
              videoId ? "Ask about the video..." : "Please load a video first"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
