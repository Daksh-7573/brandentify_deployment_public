import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "gradient" | "subtle";
  text?: string;
  className?: string;
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  text,
  className,
  centered = false,
}) => {
  // Size mappings
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };
  
  // Variant mappings
  const variantMap = {
    default: "border-gray-300 border-t-primary",
    primary: "border-primary/30 border-t-primary",
    gradient: "border-transparent border-t-transparent gradient-border-spinner",
    subtle: "border-gray-200 border-t-gray-500",
  };
  
  // Text size mapping
  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };
  
  // Get spinner circle based on gradient variant
  const getSpinnerCircle = () => {
    if (variant === "gradient") {
      return (
        <motion.div
          className={cn(
            "rounded-full absolute inset-0",
            "bg-gradient-to-r from-purple-600 via-teal-500 to-amber-500"
          )}
          style={{ 
            clipPath: "polygon(50% 0%, 50% 50%, 100% 50%, 100% 0%)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      );
    }
    return null;
  };
  
  const spinner = (
    <div className={cn(
      "relative",
      centered && "flex flex-col items-center justify-center",
      className
    )}>
      <div
        className={cn(
          "rounded-full border animate-spin-slow",
          sizeMap[size],
          variantMap[variant]
        )}
      >
        {getSpinnerCircle()}
      </div>
      
      {text && (
        <p className={cn(
          "mt-3 text-gray-600",
          textSizeMap[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
  
  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};