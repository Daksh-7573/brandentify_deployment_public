import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  isFocused?: boolean;
  onFocus?: () => void;
  variant?: 'default' | 'prominent' | 'glassy' | 'dramatic' | 'spatial';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track mouse position for lighting effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      // Calculate mouse position relative to the card (normalized from -1 to 1)
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      setMousePosition({ x, y });
    };
    
    // Only add mouse tracking when card is active
    if (isHovered || isFocused) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, isFocused]);
  
  // Determine blur amount based on card variant
  const getBlurAmount = () => {
    switch (variant) {
      case 'default': return '8px';
      case 'prominent': return '12px';
      case 'glassy': return '15px';
      case 'dramatic': return '18px';
      case 'spatial': return '20px';
      default: return '8px';
    }
  };
  
  // Determine background opacity based on card variant
  const getBackgroundOpacity = () => {
    switch (variant) {
      case 'default': return '0.4';
      case 'prominent': return '0.5';
      case 'glassy': return '0.25';
      case 'dramatic': return '0.3';
      case 'spatial': return '0.2';
      default: return '0.4';
    }
  };
  
  // If card is focused or hovered, apply stronger effects
  const isActive = isFocused || isHovered;
  
  // Calculate dynamic lighting effect based on mouse position
  const getDynamicLighting = () => {
    if (!isActive) return {};
    
    // Adjust the angle of the gradient based on mouse position
    const gradientX = 50 + mousePosition.x * 20; // Range: 30% to 70%
    const gradientY = 30 + mousePosition.y * 20; // Range: 10% to 50%
    
    return {
      background: `
        radial-gradient(
          circle at ${gradientX}% ${gradientY}%, 
          rgba(140, 180, 255, 0.08) 0%, 
          rgba(80, 110, 180, 0.03) 40%, 
          transparent 70%
        ), 
        linear-gradient(
          to bottom, 
          rgba(30, 40, 80, ${getBackgroundOpacity()}), 
          rgba(15, 20, 40, ${Number(getBackgroundOpacity()) + 0.1})
        )
      `,
    };
  };
  
  // Calculate border highlight effects based on mouse position
  const getBorderHighlight = () => {
    if (!isActive || variant !== 'spatial') return {};
    
    const { x, y } = mousePosition;
    
    return {
      borderTopColor: `rgba(255, 255, 255, ${0.15 + (1 - y) * 0.2})`,
      borderLeftColor: `rgba(255, 255, 255, ${0.1 + (1 - x) * 0.2})`,
      borderRightColor: `rgba(100, 140, 255, ${0.05 + (1 + x) * 0.1})`,
      borderBottomColor: `rgba(100, 140, 255, ${0.05 + (1 + y) * 0.05})`,
    };
  };
  
  // Get transform effects based on variant and mouse position
  const getTransformEffects = () => {
    if (variant === 'spatial' || variant === 'dramatic') {
      return {
        rotateX: isActive ? mousePosition.y * 2 : 0,
        rotateY: isActive ? mousePosition.x * -2 : 0,
        scale: isActive ? 1.03 : 1,
        y: isActive ? -8 : 0,
      };
    }
    
    return {
      scale: isActive ? 1.02 : 1,
      y: isActive ? -5 : 0,
    };
  };
  
  // Get border styling based on variant
  const getBorderStyle = () => {
    if (variant === 'glassy' || variant === 'spatial') {
      return {
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        ...getBorderHighlight(),
      };
    }
    
    return {
      border: variant === 'dramatic' 
        ? '1px solid rgba(100, 140, 255, 0.15)' 
        : '1px solid rgba(120, 140, 180, 0.1)',
    };
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-xl transition-all vision-card',
        isActive ? 'shadow-xl' : 'shadow-lg',
        className
      )}
      style={{
        backdropFilter: `blur(${getBlurAmount()})`,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        ...getDynamicLighting(),
        ...getBorderStyle(),
      }}
      animate={getTransformEffects()}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onFocus}
    >
      {/* Dynamic lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Vision Pro inspired rim lighting */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1px] opacity-60"
          style={{ 
            background: `linear-gradient(to right, 
              transparent,
              rgba(255, 255, 255, ${0.2 + Math.abs(mousePosition.x) * 0.3}), 
              transparent
            )`,
            filter: 'blur(0.5px)',
            opacity: isActive ? 0.8 : 0.4,
            transform: 'translateZ(0.5px)',
          }}
        />
        
        {/* Left highlight */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[1px] opacity-30"
          style={{ 
            background: `linear-gradient(to bottom, 
              rgba(140, 180, 255, ${0.1 + Math.abs(mousePosition.x) * 0.15}), 
              rgba(255, 255, 255, ${0.15 + Math.abs(mousePosition.y) * 0.15}), 
              rgba(140, 180, 255, 0.05)
            )`,
            filter: 'blur(0.5px)',
            opacity: isActive ? 0.7 : 0.3,
          }}
        />
        
        {/* Subtle inner glow that follows mouse */}
        <div 
          className="absolute inset-0 opacity-30 rounded-xl"
          style={{
            background: `radial-gradient(
              circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%, 
              rgba(180, 210, 255, ${0.15 + Math.abs(mousePosition.x * mousePosition.y) * 0.1}) 0%, 
              transparent 70%
            )`,
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
            opacity: isActive ? 0.8 : 0.3,
          }}
        />
      </div>
      
      {/* Content container with depth effect */}
      <div className={cn(
        "relative z-10 vision-depth",
        (variant === 'spatial' || variant === 'dramatic') && "transform-gpu"
      )}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * EnhancedCardHeader - Header section for EnhancedCard with Vision Pro styling
 */
export const EnhancedCardHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'p-5 pb-3 vision-luminous-text relative border-b border-gray-700/30',
      className
    )}>
      {/* Subtle highlight on border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-blue-400/10"></div>
      
      {/* Content with depth effect */}
      <div className="transform-gpu" style={{ transform: 'translateZ(5px)' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * EnhancedCardContent - Content section for EnhancedCard with Vision Pro depth
 */
export const EnhancedCardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'p-5 pt-2 relative',
      className
    )}>
      {/* Content with depth effect */}
      <div className="transform-gpu" style={{ transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * EnhancedCardFooter - Footer section for EnhancedCard with Vision Pro styling
 */
export const EnhancedCardFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(
      'p-5 pt-2 flex items-center justify-end gap-2 relative border-t border-gray-700/30',
      className
    )}>
      {/* Subtle highlight on border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-400/10"></div>
      
      {/* Content with depth effect */}
      <div className="transform-gpu" style={{ transform: 'translateZ(5px)' }}>
        {children}
      </div>
    </div>
  );
};