/**
 * Animation utilities and constants for the Brandentifier platform
 * This file provides standardized animations that can be used throughout the application
 */

export type AnimationVariant = 'subtle' | 'normal' | 'expressive';

// Standard durations in seconds
export const DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  veryFast: 0.1,
  verySlow: 0.8,
};

// Standard easing functions
export const EASING = {
  // Standard easing curves
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Special easing curves
  bounce: [0.175, 0.885, 0.32, 1.275],
  gentle: [0.5, 0, 0, 1],
  elastic: [0.68, -0.55, 0.265, 1.55],
};

// Transition presets (for Framer Motion)
export const TRANSITIONS = {
  hover: {
    type: 'tween',
    duration: DURATIONS.fast,
    ease: EASING.easeOut,
  },
  click: {
    type: 'spring',
    duration: DURATIONS.veryFast,
    bounce: 0.3,
  },
  page: {
    type: 'tween',
    duration: DURATIONS.slow,
    ease: EASING.easeInOut,
  },
  modal: {
    type: 'spring',
    duration: DURATIONS.normal,
    bounce: 0.2,
  },
  appear: {
    type: 'spring',
    duration: DURATIONS.normal,
    bounce: 0.4,
  },
};

// Animation variants (for Framer Motion)
export const VARIANTS = {
  // Fade animations
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  
  // Scale animations
  scale: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  
  // Slide animations
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  
  slideDown: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  
  slideLeft: {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  
  slideRight: {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  
  // Card hover effects
  cardHover: {
    initial: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
    hover: { 
      scale: 1.03, 
      boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }
    },
    tap: { scale: 0.98 }
  },
  
  // Button hover effects
  buttonHover: {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },
  
  // Glow animations
  glow: {
    initial: { boxShadow: '0 0 0 rgba(0, 0, 0, 0)' },
    hover: { 
      boxShadow: '0 0 20px rgba(var(--primary), 0.6)', 
      transition: { duration: 0.3 } 
    }
  },
  
  // Staggered children animations (for lists)
  staggerChildren: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  },
  
  // Morphing animations
  morphFrom: {
    initial: (custom: any) => ({ ...custom }),
    animate: { 
      borderRadius: '8px',
      width: '100%',
      height: 'auto',
      transition: { 
        duration: 0.5,
        ease: EASING.easeInOut 
      }
    }
  },
  
  // Border animations
  pulseBorder: {
    initial: { 
      boxShadow: '0 0 0 0px rgba(var(--primary), 0.4)',
      scale: 1 
    },
    animate: { 
      boxShadow: [
        '0 0 0 0px rgba(var(--primary), 0.4)',
        '0 0 0 4px rgba(var(--primary), 0.2)',
        '0 0 0 0px rgba(var(--primary), 0)',
      ],
      scale: [1, 1.01, 1],
    }
  },
  
  // Interactive animations for form inputs
  formInput: {
    initial: { borderColor: 'rgba(0,0,0,0.1)' },
    focus: { 
      borderColor: 'rgba(var(--primary), 1)',
      boxShadow: '0 0 0 2px rgba(var(--primary), 0.2)',
      transition: { duration: 0.2 }
    },
    error: {
      borderColor: '#ff5555',
      boxShadow: '0 0 0 2px rgba(255,85,85,0.2)',
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.4 }
    }
  },
};

// Utility function to adjust animation intensity based on user preference
export function getAnimationIntensity(variant: AnimationVariant = 'normal') {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Return minimal animations for accessibility
    return {
      scale: 1,
      duration: DURATIONS.fast,
      distance: 0,
      intensity: 0,
    };
  }
  
  // Return animation values based on the requested variant
  switch (variant) {
    case 'subtle':
      return {
        scale: 1.02,
        duration: DURATIONS.fast,
        distance: 5,
        intensity: 0.5,
      };
    case 'expressive':
      return {
        scale: 1.08,
        duration: DURATIONS.slow,
        distance: 15,
        intensity: 1.5,
      };
    case 'normal':
    default:
      return {
        scale: 1.05,
        duration: DURATIONS.normal,
        distance: 10,
        intensity: 1,
      };
  }
}