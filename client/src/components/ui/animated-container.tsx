import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { TRANSITIONS, VARIANTS } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

export interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  animation?: keyof typeof VARIANTS;
  staggerChildren?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * AnimatedContainer - A wrapper component that adds animations to its children
 * 
 * This component uses Framer Motion to provide smooth animations based on the
 * predefined animation variants in the animation utilities.
 */
const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(({
  children,
  animation = "fade",
  staggerChildren = false,
  delay = 0,
  duration,
  className,
  ...props
}, ref) => {
  // Get the animation variants
  const baseVariant = VARIANTS[animation];
  const containerVariant = staggerChildren ? VARIANTS.staggerChildren : baseVariant;
  
  // Create a custom transition with the specified duration
  const customTransition = duration ? {
    ...TRANSITIONS.appear,
    duration,
  } : TRANSITIONS.appear;
  
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariant}
      transition={{
        ...customTransition,
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AnimatedContainer.displayName = "AnimatedContainer";

export { AnimatedContainer };

// Child item for staggered animations
export interface AnimatedItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  animation?: keyof typeof VARIANTS;
  delay?: number;
  className?: string;
}

export const AnimatedItem = forwardRef<HTMLDivElement, AnimatedItemProps>(({
  children,
  animation = "slideUp",
  delay = 0,
  className,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={VARIANTS[animation]}
      transition={{
        ...TRANSITIONS.appear,
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AnimatedItem.displayName = "AnimatedItem";