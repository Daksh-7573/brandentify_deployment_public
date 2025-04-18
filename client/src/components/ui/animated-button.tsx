import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface AnimatedButtonProps extends ButtonProps, MotionProps {
  children: React.ReactNode;
  animation?: "bounce" | "pulse" | "ripple" | "gradient" | "float" | "none";
  rippleColor?: string;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    children, 
    animation = "pulse", 
    rippleColor = "rgba(99, 102, 241, 0.3)",
    variant = "default", 
    ...props 
  }, ref) => {
    const [ripple, setRipple] = React.useState({
      x: 0,
      y: 0,
      show: false
    });
    
    // Define animation variants
    const animationVariants = {
      bounce: {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      pulse: {
        whileHover: { 
          scale: 1.02,
          boxShadow: "0 0 8px rgba(99, 102, 241, 0.5)"
        },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 10 }
      },
      float: {
        whileHover: { y: -5 },
        whileTap: { y: 0 },
        transition: { type: "spring", stiffness: 400 }
      },
      gradient: {
        whileHover: { 
          backgroundPosition: "right center" 
        },
        transition: { duration: 0.5, ease: "easeInOut" }
      },
      none: {}
    };
    
    // Handle ripple effect
    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        show: true
      });
      
      setTimeout(() => {
        setRipple(prev => ({ ...prev, show: false }));
      }, 700);
    };
    
    // Special class for gradient animation
    const gradientClass = animation === "gradient" ? 
      "bg-gradient-to-r from-purple-500 via-teal-400 to-purple-500 bg-[length:200%_100%] text-white border-none" : "";
    
    return (
      <motion.div
        className="relative inline-block"
        {...animationVariants[animation !== "ripple" ? animation : "none"]}
      >
        <Button
          ref={ref}
          variant={variant}
          className={cn(
            "relative overflow-hidden transition-all",
            gradientClass,
            className
          )}
          onClick={animation === "ripple" ? handleRipple : undefined}
          {...props}
        >
          {children}
          
          {/* Ripple effect */}
          {animation === "ripple" && ripple.show && (
            <motion.span 
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ 
                position: "absolute", 
                top: ripple.y, 
                left: ripple.x,
                width: "20px", 
                height: "20px", 
                borderRadius: "50%", 
                backgroundColor: rippleColor,
                transform: "translate(-50%, -50%)"
              }} 
            />
          )}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";