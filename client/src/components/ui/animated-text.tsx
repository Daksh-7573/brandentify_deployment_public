import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  el?: keyof JSX.IntrinsicElements;
  className?: string;
  once?: boolean;
  animation?: "fade" | "typewriter" | "gradient" | "highlight" | "bounce";
  staggerChildren?: number;
  delay?: number;
  duration?: number;
  gradient?: {
    from: string;
    via?: string;
    to: string;
  };
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  el: Element = "p",
  className,
  once = true,
  animation = "fade",
  staggerChildren = 0.015,
  delay = 0,
  duration = 0.5,
  gradient = {
    from: "#6366F1", // Purple
    via: "#14B8A6", // Teal
    to: "#F59E0B", // Amber
  },
}) => {
  // Split text into characters for character-based animations
  const letters = Array.from(text);
  
  // Animation variants
  const animations = {
    fade: {
      initial: { opacity: 0, y: 15 },
      animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * staggerChildren + delay,
          duration: duration,
        },
      }),
    },
    typewriter: {
      initial: { opacity: 0, x: -10 },
      animate: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
          delay: i * staggerChildren + delay,
          duration: duration * 0.5,
        },
      }),
    },
    highlight: {
      initial: { opacity: 1, color: "#666" },
      animate: (i: number) => ({
        opacity: 1,
        color: "#000",
        textShadow: "0 0 8px rgba(99, 102, 241, 0.3)",
        transition: {
          delay: i * staggerChildren + delay,
          duration: duration,
        },
      }),
    },
    bounce: {
      initial: { opacity: 0, y: 20 },
      animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * staggerChildren + delay,
          duration: duration,
          type: "spring",
          stiffness: 200,
          damping: 10,
        },
      }),
    },
  };

  // Special case for gradient text which doesn't use staggered characters
  if (animation === "gradient") {
    return (
      <Element className={cn("overflow-hidden", className)}>
        <motion.span
          initial={{ backgroundPosition: "200% 0" }}
          animate={{ backgroundPosition: "0% 0" }}
          transition={{ delay, duration: duration * 2, ease: "easeOut" }}
          className="block"
          style={{
            backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.via || gradient.from}, ${gradient.to})`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textFillColor: "transparent",
          }}
        >
          {text}
        </motion.span>
      </Element>
    );
  }

  // For all other character-based animations
  return (
    <Element className={cn("overflow-hidden", className)}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="initial"
          animate="animate"
          exit="initial"
          variants={animations[animation]}
          viewport={{ once }}
          className="inline-block"
          style={{
            whiteSpace: letter === " " ? "pre" : "normal",
          }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </Element>
  );
};