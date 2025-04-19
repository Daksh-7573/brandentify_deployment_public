import React, { useState } from "react";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// We need to omit conflicting properties
type AnimatedButtonProps = ButtonProps & Omit<HTMLMotionProps<"button">, keyof ButtonProps> & {
  animation?: "pulse" | "scale" | "slide" | "glow" | "gradient" | "ripple" | "float" | "3d" | "none";
  hoverScale?: number;
  disabled?: boolean;
  glowColor?: string;
  gradientColors?: string[];
  withIcon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  animation = "scale",
  hoverScale = 1.05,
  disabled = false,
  glowColor = "rgba(99, 102, 241, 0.6)",
  gradientColors = ["#6366F1", "#14B8A6", "#6366F1"],
  withIcon,
  iconPosition = "left",
  ...props
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  
  // Handle ripple effect
  const handleRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (animation !== "ripple") return;
    
    const button = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - button.left;
    const y = e.clientY - button.top;
    
    setRipplePosition({ x, y });
    setIsRippling(true);
    
    setTimeout(() => {
      setIsRippling(false);
    }, 700);
  };

  // Animation variants based on the animation prop
  const getAnimationProps = () => {
    switch (animation) {
      case "pulse":
        return {
          whileHover: { scale: hoverScale },
          whileTap: { scale: 0.98 },
          initial: { opacity: 0, scale: 0.9 },
          animate: { 
            opacity: 1, 
            scale: 1,
            boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 15px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0.4)"]
          },
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 15,
            boxShadow: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          }
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
          whileHover: { boxShadow: `0 0 20px ${glowColor}` },
          whileTap: { boxShadow: `0 0 10px ${glowColor}`, scale: 0.98 },
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
      case "float":
        return {
          whileHover: { y: -5 },
          whileTap: { y: -2, scale: 0.98 },
          initial: { opacity: 0, y: 10 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: { 
              y: { type: "spring", stiffness: 400, damping: 17 }
            }
          }
        };
      case "3d":
        return {
          whileHover: { 
            scale: hoverScale,
            rotateX: 5,
            rotateY: 10,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          },
          whileTap: { 
            scale: 0.98,
            rotateX: 0,
            rotateY: 0,
            boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          },
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0 },
          transition: { 
            type: "spring", 
            stiffness: 500, 
            damping: 15 
          }
        };
      case "ripple":
        return {
          whileHover: { scale: hoverScale },
          whileTap: { scale: 0.98 },
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
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
    background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
    backgroundSize: "200% 100%",
    color: "white",
    border: "none"
  } : {};

  return (
    <motion.div
      {...getAnimationProps()}
      className={cn("inline-block", animation === "3d" && "perspective-1000")}
      style={{ 
        opacity: disabled ? 0.6 : 1,
        perspective: animation === "3d" ? 1000 : undefined
      }}
      onClick={handleRipple}
    >
      <Button
        className={cn(
          "relative overflow-hidden", 
          animation === "float" && "shadow-lg",
          animation === "3d" && "transform-style-3d",
          className
        )}
        disabled={disabled}
        style={gradientStyle}
        {...props}
      >
        {withIcon && iconPosition === "left" && (
          <span className="mr-2 inline-flex items-center">{withIcon}</span>
        )}
        
        {children}
        
        {withIcon && iconPosition === "right" && (
          <span className="ml-2 inline-flex items-center">{withIcon}</span>
        )}
        
        {animation === "ripple" && isRippling && (
          <AnimatePresence>
            <motion.span
              key="ripple"
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              style={{
                top: ripplePosition.y,
                left: ripplePosition.x,
                width: 20,
                height: 20,
                transform: "translate(-50%, -50%)",
              }}
            />
          </AnimatePresence>
        )}
      </Button>
    </motion.div>
  );
};