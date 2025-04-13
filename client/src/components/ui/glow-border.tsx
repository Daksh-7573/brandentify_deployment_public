import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlowBorderProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  borderWidth?: number;
  pulseAnimation?: boolean;
}

/**
 * GlowBorder - A container with a glowing border
 * 
 * This component adds a glowing border effect to its children. The border
 * can be static or pulsing based on the provided props.
 */
const GlowBorder = forwardRef<HTMLDivElement, GlowBorderProps>(({
  children,
  className,
  glowColor = "rgba(var(--primary), 0.8)",
  borderWidth = 2,
  pulseAnimation = false,
  ...props
}, ref) => {
  const pulseVariants = {
    initial: { 
      boxShadow: `0 0 0 ${borderWidth}px ${glowColor.replace("0.8", "0.4")}`,
    },
    animate: pulseAnimation ? { 
      boxShadow: [
        `0 0 0 ${borderWidth}px ${glowColor.replace("0.8", "0.2")}`,
        `0 0 0 ${borderWidth}px ${glowColor}`,
        `0 0 0 ${borderWidth}px ${glowColor.replace("0.8", "0.2")}`,
      ],
    } : {
      boxShadow: `0 0 0 ${borderWidth}px ${glowColor}`
    }
  };
  
  return (
    <motion.div
      ref={ref}
      className={cn("relative rounded-lg overflow-hidden", className)}
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      transition={pulseAnimation ? {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        times: [0, 0.5, 1],
        ease: "easeInOut"
      } : {
        duration: 0.3,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
GlowBorder.displayName = "GlowBorder";

export { GlowBorder };