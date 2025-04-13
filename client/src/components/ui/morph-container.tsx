import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { EASING, DURATIONS } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

export interface MorphContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  from?: {
    borderRadius?: string | number;
    width?: string | number;
    height?: string | number;
    opacity?: number;
    scale?: number;
    rotate?: number;
    [key: string]: any;
  };
  to?: {
    borderRadius?: string | number;
    width?: string | number;
    height?: string | number;
    opacity?: number;
    scale?: number;
    rotate?: number;
    [key: string]: any;
  };
  duration?: number;
  delay?: number;
}

/**
 * MorphContainer - A container that morphs between different shapes
 * 
 * This component uses Framer Motion to smoothly transition between different
 * visual states, creating morphing animations.
 */
const MorphContainer = forwardRef<HTMLDivElement, MorphContainerProps>(({
  children,
  className,
  from = {},
  to = {},
  duration = DURATIONS.normal,
  delay = 0,
  ...props
}, ref) => {
  // Default from/to states if not provided
  const defaultFrom = {
    borderRadius: "4px",
    opacity: 1,
    scale: 1,
    ...from
  };
  
  const defaultTo = {
    borderRadius: "16px",
    opacity: 1,
    scale: 1,
    ...to
  };
  
  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={defaultFrom}
      animate={defaultTo}
      exit={defaultFrom}
      transition={{
        type: "tween",
        ease: EASING.easeInOut,
        duration,
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
MorphContainer.displayName = "MorphContainer";

export { MorphContainer };