import React from "react";

interface PersonalInfoIconProps {
  className?: string;
}

const PersonalInfoIcon: React.FC<PersonalInfoIconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 250" 
      fill="currentColor"
      className={className}
    >
      {/* Outer rectangle (card) */}
      <rect x="10" y="10" width="380" height="230" rx="20" ry="20" fill="none" stroke="currentColor" strokeWidth="20" />
      
      {/* Person silhouette */}
      <path d="M90,70 C90,55 100,45 115,45 C130,45 140,55 140,70 C140,85 130,95 115,95 C100,95 90,85 90,70 M70,165 L70,165 C70,125 90,110 115,110 C140,110 160,125 160,165 L70,165 Z" />
      
      {/* Lines for text/info */}
      <rect x="200" y="65" width="140" height="15" rx="5" ry="5" />
      <rect x="200" y="110" width="140" height="15" rx="5" ry="5" />
      <rect x="200" y="155" width="140" height="15" rx="5" ry="5" />
    </svg>
  );
};

export default PersonalInfoIcon;