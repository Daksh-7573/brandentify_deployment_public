import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface TransitionLayoutProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade" | "slide" | "scale" | "none";
  duration?: number;
}

export const TransitionLayout: React.FC<TransitionLayoutProps> = ({
  children,
  className = "",
  animation = "fade",
  duration = 0.3,
}) => {
  const [location] = useLocation();
  
  // Animation variants
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 15 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -15 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  const transition = {
    duration,
    ease: "easeInOut",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={animations[animation]}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};