/**
 * Animation utilities for Brandentifier
 * 
 * This file contains predefined animation variants and helper functions
 * for creating consistent animations across the application.
 */

// Animation timing and easing presets
export const EASING = {
  smooth: [0.4, 0.0, 0.2, 1],
  spring: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.175, 0.885, 0.32, 1.275],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1]
};

export const DURATIONS = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7
};

// Define animation variant types
export type AnimationVariant = 'subtle' | 'normal' | 'expressive';

// Predefined animation variants
export const VARIANTS = {
  // Card hover animation
  cardHover: {
    subtle: {
      hover: { scale: 1.01, y: -2 },
      tap: { scale: 0.99 }
    },
    normal: {
      hover: { scale: 1.03, y: -5 },
      tap: { scale: 0.97 }
    },
    expressive: {
      hover: { scale: 1.05, y: -10 },
      tap: { scale: 0.95 }
    }
  },
  
  // Button hover animation
  buttonHover: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },
  
  // Fade in/out animation
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  
  // Slide up animation
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  },
  
  // Scale animation
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  },
  
  // Flip animation
  flip: {
    initial: { rotateY: 0 },
    flipped: { rotateY: 180, transition: { duration: 0.6 } }
  },
  
  // Pulse animation for notifications
  pulse: {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }
    }
  }
};

/**
 * Get animation variant based on intensity
 * 
 * @param variant The animation intensity ('subtle', 'normal', 'expressive')
 * @param animationObj The animation object containing variants by intensity
 * @returns The appropriate animation variant
 */
export function getVariantByIntensity(
  variant: AnimationVariant,
  animationObj: {
    subtle: any;
    normal: any;
    expressive: any;
  }
) {
  return animationObj[variant] || animationObj.normal;
}

/**
 * Create stagger animation for list items
 * 
 * @param childAnimationVariant The animation variant for each child
 * @param staggerDelay The delay between each staggered item
 * @returns Container and item animation variants
 */
export function createStaggerAnimation(childAnimationVariant: any, staggerDelay = 0.1) {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: 0.1
        }
      }
    },
    item: childAnimationVariant
  };
}