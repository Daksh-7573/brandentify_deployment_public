import { forwardRef, ReactNode, HTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimationVariant, getVariantByIntensity, VARIANTS } from '@/lib/animation-utils';

export type HoverEffect = 'scale' | 'lift' | 'glow' | 'border' | 'tilt';

interface HoverCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  effect?: HoverEffect;
  disabled?: boolean;
}

/**
 * HoverCard - A card component with hover effects
 * 
 * This component provides various hover animations for card-like elements,
 * such as scaling, lifting, glowing, etc.
 */
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(({
  children,
  className,
  variant = 'normal',
  effect = 'scale',
  disabled = false,
  ...props
}, ref) => {
  // Get hover animation based on the variant and effect
  const getHoverAnimation = () => {
    if (disabled) return {};
    
    // Get the animation intensity based on the variant
    const cardVariants = getVariantByIntensity(variant, VARIANTS.cardHover);
    
    switch (effect) {
      case 'scale':
        return {
          whileHover: cardVariants.hover,
          whileTap: cardVariants.tap
        };
      case 'lift':
        return {
          whileHover: { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
          whileTap: { y: -2 }
        };
      case 'glow':
        return {
          whileHover: { 
            boxShadow: '0 0 15px rgba(var(--primary), 0.5)',
            scale: 1.02
          },
          whileTap: { scale: 0.98 }
        };
      case 'border':
        return {
          whileHover: { 
            boxShadow: 'inset 0 0 0 2px rgba(var(--primary), 0.7)',
            scale: 1.01
          },
          whileTap: { scale: 0.99 }
        };
      case 'tilt':
        return {
          whileHover: (info) => {
            const rect = info.target.getBoundingClientRect();
            const x = info.clientX - rect.left;
            const y = info.clientY - rect.top;
            
            // Calculate rotation angles based on cursor position
            const rotateX = 10 * ((y - rect.height / 2) / rect.height);
            const rotateY = -10 * ((x - rect.width / 2) / rect.width);
            
            return { 
              rotateX, 
              rotateY, 
              scale: 1.05,
              z: 10
            };
          },
          whileTap: { scale: 0.98, rotateX: 0, rotateY: 0 },
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        };
      default:
        return {
          whileHover: cardVariants.hover,
          whileTap: cardVariants.tap
        };
    }
  };
  
  const hoverAnimation = getHoverAnimation();
  
  return (
    <motion.div
      ref={ref}
      className={cn(className, 
        effect === 'tilt' && 'transform-style-preserve-3d',
        disabled && 'opacity-70 cursor-not-allowed'
      )}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
});

HoverCard.displayName = "HoverCard";