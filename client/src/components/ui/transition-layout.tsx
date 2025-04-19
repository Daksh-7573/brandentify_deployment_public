import React from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

type TransitionAnimation = "fade" | "slide" | "scale" | "flip" | "rotate";

interface TransitionLayoutProps {
  children: React.ReactNode;
  animation?: TransitionAnimation;
  duration?: number;
  delay?: number;
}

export const TransitionLayout: React.FC<TransitionLayoutProps> = ({
  children,
  animation = "fade",
  duration = 0.3,
  delay = 0,
}) => {
  const [location] = useLocation();
  
  // Define animation variants based on animation type
  const getVariants = () => {
    switch (animation) {
      case "slide":
        return {
          initial: { x: 20, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -20, opacity: 0 },
        };
      case "scale":
        return {
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.9, opacity: 0 },
        };
      case "flip":
        return {
          initial: { rotateY: 90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
        };
      case "rotate":
        return {
          initial: { rotate: 5, opacity: 0 },
          animate: { rotate: 0, opacity: 1 },
          exit: { rotate: -5, opacity: 0 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };
  
  const variants = getVariants();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ 
          duration, 
          delay,
          ease: "easeInOut" 
        }}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};