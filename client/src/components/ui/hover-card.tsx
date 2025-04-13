import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { VARIANTS, AnimationVariant, getAnimationIntensity } from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

export interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  effect?: 'scale' | 'lift' | 'glow' | 'border' | 'tilt';
  disabled?: boolean;
}

/**
 * HoverCard - A card component with hover animations
 * 
 * This component uses Framer Motion to provide a variety of hover effects
 * for card elements throughout the application.
 */
const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(({
  children,
  className,
  variant = 'normal',
  effect = 'scale',
  disabled = false,
  ...props
}, ref) => {
  const intensity = getAnimationIntensity(variant);
  
  // Set animation based on the requested effect
  let hoverAnimation = {};
  let initialAnimation = {};
  
  switch (effect) {
    case 'scale':
      initialAnimation = { scale: 1 };
      hoverAnimation = { scale: disabled ? 1 : intensity.scale };
      break;
    case 'lift':
      initialAnimation = { y: 0, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' };
      hoverAnimation = disabled ? {} : { 
        y: -intensity.distance,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      };
      break;
    case 'glow':
      initialAnimation = { boxShadow: '0 0 0 rgba(var(--primary), 0)' };
      hoverAnimation = disabled ? {} : { 
        boxShadow: `0 0 ${intensity.distance * 2}px rgba(var(--primary), 0.5)` 
      };
      break;
    case 'border':
      initialAnimation = { 
        boxShadow: 'inset 0 0 0 1px rgba(var(--primary), 0.1)' 
      };
      hoverAnimation = disabled ? {} : { 
        boxShadow: 'inset 0 0 0 2px rgba(var(--primary), 0.7)'
      };
      break;
    case 'tilt':
      initialAnimation = { 
        rotateX: 0,
        rotateY: 0,
        transformPerspective: '1000px' 
      };
      hoverAnimation = disabled ? {} : { 
        rotateX: -5,
        rotateY: 5
      };
      break;
    default:
      initialAnimation = { scale: 1 };
      hoverAnimation = disabled ? {} : { scale: intensity.scale };
  }
  
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative transition-all duration-300 rounded-lg overflow-hidden", 
        className
      )}
      initial={initialAnimation}
      whileHover={hoverAnimation}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17,
        duration: intensity.duration 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
});
HoverCard.displayName = "HoverCard";