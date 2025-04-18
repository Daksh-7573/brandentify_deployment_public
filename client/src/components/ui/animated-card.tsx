import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "gradient" | "quantum";
  depth?: "flat" | "subtle" | "medium" | "deep";
  interactive?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    depth = "medium", 
    interactive = true, 
    ...props 
  }, ref) => {
    // Card appearance variants
    const variantClasses = {
      default: "bg-white dark:bg-gray-800",
      outline: "bg-white dark:bg-gray-800 border border-border",
      ghost: "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800",
      gradient: "bg-gradient-to-br from-purple-400 via-purple-500 to-teal-400 text-white",
      quantum: "relative bg-white dark:bg-gray-800 before:absolute before:inset-0 before:rounded-xl before:p-[1.5px] before:bg-gradient-to-r before:from-purple-500 before:via-teal-400 before:to-amber-400 before:-z-10",
    };
    
    // Card depth (shadow) variants
    const depthClasses = {
      flat: "shadow-none",
      subtle: "shadow-sm",
      medium: "shadow-md",
      deep: "shadow-lg",
    };
    
    // Card entrance animation variants
    const enterAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        y: -20,
        transition: {
          duration: 0.2,
          ease: "easeIn"
        }
      }
    };

    // Card hover animation (if interactive)
    const hoverAnimation = interactive ? {
      whileHover: { 
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)"
      },
      whileTap: { scale: 0.98 },
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl overflow-hidden p-5",
          variantClasses[variant],
          depthClasses[depth],
          interactive ? "cursor-pointer" : "",
          className
        )}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={enterAnimation}
        {...hoverAnimation}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";