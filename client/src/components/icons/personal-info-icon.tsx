import React from "react";

const PersonalInfoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 288 180" 
      fill="currentColor"
      className={className}
      stroke="currentColor"
      strokeWidth="6"
    >
      <rect
        x="3"
        y="3"
        width="282"
        height="174"
        rx="20"
        ry="20"
        fill="none"
      />
      <path
        d="M65 90 a25 25 0 1 1 0 -50 a25 25 0 0 1 0 50 z"
        fill="currentColor"
      />
      <path
        d="M65 100 c-25 0 -45 15 -45 45 h90 c0 -30 -20 -45 -45 -45 z"
        fill="currentColor"
      />
      <path
        d="M120 65 h100 a5 5 0 0 1 0 10 h-100 a5 5 0 0 1 0 -10 z"
        fill="currentColor"
      />
      <path
        d="M120 85 h100 a5 5 0 0 1 0 10 h-100 a5 5 0 0 1 0 -10 z"
        fill="currentColor"
      />
      <path
        d="M120 105 h100 a5 5 0 0 1 0 10 h-100 a5 5 0 0 1 0 -10 z"
        fill="currentColor"
      />
    </svg>
  );
};

export default PersonalInfoIcon;