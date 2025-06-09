import React from "react";

interface TimestampItemProps {
  time: string;
  description: string;
  onClick: () => void;
}

/**
 * TimestampItem Component - Modern clickable timestamp entry with card design
 */
const TimestampItem: React.FC<TimestampItemProps> = ({
  time,
  description,
  onClick,
}) => {
  return (
    <div className="timestamp-item">
      <button
        className="timestamp-time-button"
        onClick={onClick}
        title={`Jump to ${time}`}
      >
        {time}
      </button>
      <div className="timestamp-description">{description}</div>
    </div>
  );
};

export default TimestampItem;
