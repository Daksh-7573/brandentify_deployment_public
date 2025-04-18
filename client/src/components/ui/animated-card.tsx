import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// We need to omit conflicting properties
type AnimatedCardProps = Omit<HTMLMotionProps<"div">, "animate" | "initial" | "transition" | "whileHover"> & {
  animation?: "fade" | "slide" | "scale" | "tilt" | "border" | "none";
  className?: string;
  duration?: number;
  delay?: number;
  hoverEffect?: boolean;
  once?: boolean;
  cardStyle?: "shadow" | "outline" | "gradient" | "glass" | "minimal";
  borderColor?: string;
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animation = "fade",
  className = "",
  duration = 0.5,
  delay = 0,
  hoverEffect = true,
  once = true,
  cardStyle = "shadow",
  borderColor = "linear-gradient(135deg, #6366F1 0%, #14B8A6 100%)",
  ...props
}) => {
  // Animation variants based on the animation prop
  const getAnimationProps = () => {
    const baseTransition = {
      duration,
      delay,
      ease: "easeOut",
    };
    
    // Initial and animate states
    switch (animation) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: baseTransition,
        };
      case "slide":
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: baseTransition,
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: baseTransition,
        };
      case "tilt":
        return {
          initial: { opacity: 0, rotate: -2 },
          animate: { opacity: 1, rotate: 0 },
          transition: baseTransition,
        };
      case "border":
        return {
          initial: { opacity: 0, borderWidth: 0 },
          animate: { opacity: 1, borderWidth: 2 },
          transition: baseTransition,
        };
      case "none":
      default:
        return {
          initial: {},
          animate: {},
          transition: baseTransition,
        };
    }
  };

  // Hover effects
  const getHoverProps = () => {
    if (!hoverEffect) return {};
    
    switch (cardStyle) {
      case "shadow":
        return {
          whileHover: { 
            y: -5, 
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 }
          }
        };
      case "outline":
        return {
          whileHover: { 
            scale: 1.02,
            borderColor: "rgba(99, 102, 241, 0.8)",
            transition: { duration: 0.2 }
          }
        };
      case "gradient":
        return {
          whileHover: { 
            y: -5,
            boxShadow: "0 15px 30px rgba(99, 102, 241, 0.2)",
            transition: { duration: 0.2 }
          }
        };
      case "glass":
        return {
          whileHover: { 
            backdropFilter: "blur(12px)",
            scale: 1.02,
            transition: { duration: 0.2 }
          }
        };
      case "minimal":
      default:
        return {
          whileHover: { 
            y: -3,
            transition: { duration: 0.2 }
          }
        };
    }
  };

  // Card style classes
  const getCardStyleClasses = () => {
    switch (cardStyle) {
      case "shadow":
        return "bg-card shadow-md";
      case "outline":
        return "bg-card border border-border";
      case "gradient":
        return "bg-card border border-transparent";
      case "glass":
        return "glass-card backdrop-blur-sm bg-opacity-70";
      case "minimal":
      default:
        return "bg-card";
    }
  };

  // Gradient border style
  const gradientBorderStyle = cardStyle === "gradient" ? {
    position: "relative",
    backgroundClip: "padding-box",
    border: "1px solid transparent",
    "&::before": {
      content: "''",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      margin: "-1px",
      borderRadius: "inherit",
      background: borderColor,
      zIndex: -1,
    }
  } : {};

  return (
    <motion.div
      className={cn("rounded-xl p-4", getCardStyleClasses(), className)}
      style={gradientBorderStyle}
      {...getAnimationProps()}
      {...getHoverProps()}
      viewport={{ once }}
      {...props}
    >
      {children}
    </motion.div>
  );
};