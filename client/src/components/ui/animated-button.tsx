import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// We need to omit conflicting properties
type AnimatedButtonProps = ButtonProps & Omit<HTMLMotionProps<"button">, keyof ButtonProps> & {
  animation?: "pulse" | "scale" | "slide" | "glow" | "gradient" | "none";
  hoverScale?: number;
  disabled?: boolean;
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  animation = "scale",
  hoverScale = 1.05,
  disabled = false,
  ...props
}) => {
  // Animation variants based on the animation prop
  const getAnimationProps = () => {
    switch (animation) {
      case "pulse":
        return {
          whileHover: { scale: hoverScale },
          whileTap: { scale: 0.98 },
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { type: "spring", stiffness: 300, damping: 15 }
        };
      case "scale":
        return {
          whileHover: { scale: hoverScale },
          whileTap: { scale: 0.95 },
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.3 }
        };
      case "slide":
        return {
          whileHover: { x: 5 },
          whileTap: { x: 2, scale: 0.98 },
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.3 }
        };
      case "glow":
        return {
          whileHover: { boxShadow: "0 0 15px rgba(99, 102, 241, 0.6)" },
          whileTap: { boxShadow: "0 0 5px rgba(99, 102, 241, 0.4)", scale: 0.98 },
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        };
      case "gradient":
        return {
          whileHover: { 
            backgroundPosition: ["0% 50%", "100% 50%"],
            scale: hoverScale 
          },
          whileTap: { scale: 0.98 },
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { 
            duration: 0.3,
            backgroundPosition: {
              repeat: Infinity,
              duration: 3,
              ease: "linear"
            }
          }
        };
      case "none":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        };
    }
  };

  // Style for gradient animation
  const gradientStyle = animation === "gradient" ? {
    background: "linear-gradient(90deg, #6366F1 0%, #14B8A6 50%, #6366F1 100%)",
    backgroundSize: "200% 100%",
    color: "white",
    border: "none"
  } : {};

  return (
    <motion.div
      {...getAnimationProps()}
      className={cn("inline-block")}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Button
        className={cn("relative overflow-hidden", className)}
        disabled={disabled}
        style={gradientStyle}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};