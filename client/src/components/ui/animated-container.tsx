import { forwardRef, ReactNode, HTMLAttributes } from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VARIANTS, AnimationVariant } from '@/lib/animation-utils';

export type AnimationType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';

interface AnimatedBaseProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  children: ReactNode;
  animation: AnimationType;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  className?: string;
}

/**
 * AnimatedContainer - A wrapper component that adds entrance/exit animations to its children
 * 
 * This component uses Framer Motion to animate its children with various animation types,
 * such as fade, slide, scale, and rotate.
 */
export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedBaseProps>(({
  children,
  animation = 'fade',
  variant = 'normal',
  delay = 0,
  duration,
  staggerChildren = false,
  staggerDelay = 0.1,
  className,
  ...props
}, ref) => {
  // Get the base animation variants
  const baseVariants = getAnimationVariants(animation, variant);
  
  // Add staggering if needed
  const containerVariants: Variants = {
    hidden: {
      ...baseVariants.hidden
    },
    visible: {
      ...baseVariants.visible,
      transition: {
        ...baseVariants.visible.transition,
        delay: delay,
        ...(duration && { duration }),
        ...(staggerChildren && {
          staggerChildren: staggerDelay,
          delayChildren: 0.1
        })
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedContainer.displayName = "AnimatedContainer";

/**
 * AnimatedItem - Used within AnimatedContainer for staggered animations
 * 
 * This component is meant to be used as a child of AnimatedContainer when using
 * staggered animations.
 */
export const AnimatedItem = forwardRef<HTMLDivElement, Omit<AnimatedBaseProps, 'staggerChildren' | 'staggerDelay'>>(({
  children,
  animation = 'fade',
  variant = 'normal',
  delay = 0,
  duration,
  className,
  ...props
}, ref) => {
  const variants = getAnimationVariants(animation, variant);
  
  // Add specific delay for this item
  if (delay) {
    variants.visible.transition = {
      ...variants.visible.transition,
      delay
    };
  }
  
  // Add specific duration for this item
  if (duration) {
    variants.visible.transition = {
      ...variants.visible.transition,
      duration
    };
  }
  
  return (
    <motion.div
      ref={ref}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedItem.displayName = "AnimatedItem";

/**
 * Get animation variants based on the animation type and variant
 */
function getAnimationVariants(animation: AnimationType, variant: AnimationVariant): Variants {
  let variants: Variants;
  
  // Get the animation strength based on the variant
  const strength = variant === 'subtle' ? 0.5 : variant === 'expressive' ? 1.5 : 1;
  
  switch (animation) {
    case 'fade':
      variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
      };
      break;
    case 'slideUp':
      variants = {
        hidden: { opacity: 0, y: 20 * strength },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    case 'slideDown':
      variants = {
        hidden: { opacity: 0, y: -20 * strength },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    case 'slideLeft':
      variants = {
        hidden: { opacity: 0, x: 20 * strength },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    case 'slideRight':
      variants = {
        hidden: { opacity: 0, x: -20 * strength },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    case 'scale':
      variants = {
        hidden: { opacity: 0, scale: 0.9 - (0.1 * (strength - 1)) },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    case 'rotate':
      variants = {
        hidden: { opacity: 0, rotate: -5 * strength },
        visible: { opacity: 1, rotate: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      };
      break;
    default:
      variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
      };
  }
  
  return variants;
}