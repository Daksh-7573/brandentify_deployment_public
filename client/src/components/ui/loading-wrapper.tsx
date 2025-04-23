import React, { ReactNode } from "react";
import ProfileLoadingAnimation from "@/components/ui/profile-loading-animation";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  text?: string; 
  size?: "small" | "medium" | "large";
  className?: string;
  showContentWhileLoading?: boolean;
}

export function LoadingWrapper({
  isLoading,
  children,
  text = "Loading data...",
  size = "medium",
  className = "",
  showContentWhileLoading = false
}: LoadingWrapperProps) {
  if (!isLoading) {
    return <>{children}</>;
  }
  
  return (
    <div className={`relative ${className}`}>
      {showContentWhileLoading && (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      
      <div className={`${!showContentWhileLoading ? 'min-h-[200px]' : ''} flex items-center justify-center`}>
        <div className={`${showContentWhileLoading ? 'absolute inset-0 flex items-center justify-center backdrop-blur-sm' : ''}`}>
          <ProfileLoadingAnimation size={size} text={text} />
        </div>
      </div>
    </div>
  );
}

export default LoadingWrapper;