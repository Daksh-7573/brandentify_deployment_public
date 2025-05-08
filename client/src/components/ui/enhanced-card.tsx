import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
export const EnhancedCard = ({
  children,
  className,
  isFocused = false,
  onFocus,
  variant = 'default',
}: EnhancedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine blur amount based on card variant
  const getBlurAmount = () => {
    switch (variant) {
      case 'default': return '8px';
      case 'prominent': return '12px';
      case 'glassy': return '15px';
      default: return '8px';
    }
  };
  
  // Determine background opacity based on card variant
  const getBackgroundOpacity = () => {
    switch (variant) {
      case 'default': return '0.4';
      case 'prominent': return '0.5';
      case 'glassy': return '0.25';
      default: return '0.4';
    }
  };
  
  // If card is focused or hovered, apply stronger effects
  const isActive = isFocused || isHovered;
  
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl transition-all',
        isActive ? 'shadow-xl' : 'shadow-lg',
        className
      )}
      style={{
        backgroundColor: `rgba(0, 0, 30, ${getBackgroundOpacity()})`,
        backdropFilter: `blur(${getBlurAmount()})`,
        borderTop: variant === 'glassy' ? '1px solid rgba(255, 255, 255, 0.15)' : undefined,
        borderRight: variant === 'glassy' ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
        borderBottom: variant === 'glassy' ? '1px solid rgba(0, 0, 0, 0.1)' : undefined,
        borderLeft: variant === 'glassy' ? '1px solid rgba(0, 0, 0, 0.05)' : undefined,
        transformStyle: 'preserve-3d',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      }}
      animate={{
        y: isActive ? -5 : 0,
        boxShadow: isActive 
          ? '0 20px 40px rgba(0, 0, 0, 0.25), 0 0 20px rgba(100, 140, 255, 0.2)' 
          : '0 10px 30px rgba(0, 0, 0, 0.15)',
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onFocus}
    >
      {/* Inner lighting effect at the top of the card */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-500 z-0"
        style={{
          background: isActive 
            ? 'linear-gradient(to bottom, rgba(120, 150, 255, 0.2) 0%, transparent 50%)' 
            : 'linear-gradient(to bottom, rgba(120, 150, 255, 0.15) 0%, transparent 50%)',
          opacity: isActive ? 0.8 : 0.5,
        }}
      />
      
      {/* Content container with glass effect */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * EnhancedCardHeader - Header section for EnhancedCard
 */
export const EnhancedCardHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('p-5 pb-3', className)}>
      {children}
    </div>
  );
};

/**
 * EnhancedCardContent - Content section for EnhancedCard
 */
export const EnhancedCardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('p-5 pt-2', className)}>
      {children}
    </div>
  );
};

/**
 * EnhancedCardFooter - Footer section for EnhancedCard
 */
export const EnhancedCardFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('p-5 pt-2 flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
};