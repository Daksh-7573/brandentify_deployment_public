import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  isFocused?: boolean;
  onFocus?: () => void;
  variant?: 'default' | 'prominent' | 'glassy';
}

/**
 * EnhancedCard - A card component with Vision Pro-inspired visual effects
 * 
 * This component adds dramatic lighting effects, glassmorphism, and subtle 
 * animations inspired by Vision Pro's spatial UI, but works within standard layouts.
 */
export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  isFocused = false,
  onFocus,
  variant = 'default',
}) => {
  // Define base styles for different variants
  const variantStyles = {
    default: {
      bg: 'bg-background/80',
      border: 'border-border',
      shadow: 'shadow-md',
    },
    prominent: {
      bg: 'bg-black/30',
      border: 'border-white/20',
      shadow: 'shadow-lg',
    },
    glassy: {
      bg: 'bg-black/20',
      border: 'border-white/25',
      shadow: 'shadow-xl',
    }
  };

  const currentVariant = variantStyles[variant];
  
  return (
    <motion.div
      onClick={() => onFocus?.()}
      whileHover={{ 
        scale: 1.01,
        y: -3, 
        transition: { type: 'spring', stiffness: 400, damping: 25 } 
      }}
      animate={{
        boxShadow: isFocused 
          ? '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(130, 150, 255, 0.25)' 
          : '0 8px 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(100, 130, 255, 0.15)',
        borderColor: isFocused ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)',
      }}
      className={cn(
        'rounded-xl overflow-hidden backdrop-blur-lg',
        'border transition-all duration-300',
        currentVariant.bg,
        currentVariant.border,
        currentVariant.shadow,
        className
      )}
      style={{
        backgroundImage: variant === 'glassy' 
          ? 'linear-gradient(to bottom, rgba(35, 40, 65, 0.65), rgba(20, 25, 45, 0.7))'
          : undefined,
      }}
    >
      {/* Inner glow effects for the glassy variant */}
      {variant === 'glassy' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {/* Top highlight */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[2px]"
            style={{ 
              borderRadius: '100%',
              filter: 'blur(1px)',
              background: 'linear-gradient(to right, transparent, rgba(140, 180, 255, 0.25), transparent)' 
            }}
          />
          
          {/* Center glow effect */}
          <div 
            className="absolute inset-2 opacity-5 rounded-xl"
            style={{
              background: 'radial-gradient(circle, rgba(160, 190, 255, 0.5) 0%, transparent 70%)',
              filter: 'blur(10px)'
            }}
          />
        </div>
      )}
      
      {children}
    </motion.div>
  );
};

/**
 * EnhancedCardHeader - Header section for EnhancedCard
 */
export const EnhancedCardHeader: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md px-4 py-3",
      "border-b border-white/10 text-white font-medium",
      className
    )}>
      {children}
    </div>
  );
};

/**
 * EnhancedCardContent - Content section for EnhancedCard
 */
export const EnhancedCardContent: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
};

/**
 * EnhancedCardFooter - Footer section for EnhancedCard
 */
export const EnhancedCardFooter: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-gradient-to-r from-gray-900/70 to-gray-800/70 backdrop-blur-md px-4 py-3",
      "border-t border-white/10 text-white",
      className
    )}>
      {children}
    </div>
  );
};

export default EnhancedCard;