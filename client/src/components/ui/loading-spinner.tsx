import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  text?: string;
  variant?: "circle" | "dots" | "gradient" | "pulse";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "currentColor",
  className,
  text,
  variant = "circle",
}) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Circle spinner (classic spinner)
  if (variant === "circle") {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <motion.div
          className={cn("border-t-2 border-b-2 rounded-full", sizeMap[size])}
          style={{ 
            borderTopColor: color,
            borderBottomColor: "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  // Dots spinner (three dots)
  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn("rounded-full", 
                size === "sm" ? "w-1.5 h-1.5" : 
                size === "md" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"
              )}
              style={{ backgroundColor: color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  // Gradient spinner (rotating gradient)
  if (variant === "gradient") {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <div className="relative">
          <motion.div
            className={cn("rounded-full absolute", sizeMap[size])}
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #14B8A6 50%, #F59E0B 100%)",
              opacity: 0.7,
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div 
            className={cn(
              "rounded-full flex items-center justify-center", 
              sizeMap[size],
              "bg-white dark:bg-gray-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-4 h-4" : "w-6 h-6"
            )}
          />
        </div>
        {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  // Pulse spinner (growing and shrinking circle)
  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <motion.div
          className={cn("rounded-full", sizeMap[size])}
          style={{ backgroundColor: color, opacity: 0.6 }}
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  return null;
};