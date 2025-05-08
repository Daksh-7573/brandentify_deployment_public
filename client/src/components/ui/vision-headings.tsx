import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VisionHeadingProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glow' | 'highlight';
  scrollEffect?: boolean;
  id?: string;
}

/**
 * VisionHeading1 - An enhanced h1 heading with Vision Pro-inspired styling
 * 
 * This component applies advanced text treatments inspired by Apple's Vision Pro
 * interface, including subtle gradients, depth effects, and optional animations.
 */
export const VisionHeading1: React.FC<VisionHeadingProps> = ({
  children,
  className,
  variant = 'default',
  scrollEffect = false,
  id,
}) => {
  // Get variant specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-blue-200 to-indigo-300 vision-luminous-text';
      case 'glow':
        return 'text-white vision-luminous-text';
      case 'highlight':
        return 'text-white bg-clip-text vision-outlined-text';
      default:
        return 'text-white';
    }
  };
  
  return (
    <motion.h1
      id={id}
      className={cn(
        'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
        'vision-depth pb-2',
        getVariantStyles(),
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'translateZ(5px)',
        textShadow: variant === 'glow' ? '0 0 10px rgba(140, 180, 255, 0.5)' : undefined,
      }}
      initial={scrollEffect ? { opacity: 0, y: 20 } : undefined}
      whileInView={scrollEffect ? { opacity: 1, y: 0 } : undefined}
      viewport={scrollEffect ? { once: true, margin: '-100px' } : undefined}
      transition={scrollEffect ? { duration: 0.7, ease: 'easeOut' } : undefined}
    >
      {children}
      
      {/* Add subtle highlight underneath for certain variants */}
      {(variant === 'gradient' || variant === 'glow') && (
        <div 
          className="h-1 rounded-full mt-1 bg-gradient-to-r" 
          style={{ 
            background: 'linear-gradient(to right, transparent, rgba(140, 180, 255, 0.4), transparent)',
            width: '40%',
            marginTop: '8px',
            opacity: 0.7,
          }}
        />
      )}
    </motion.h1>
  );
};

/**
 * VisionHeading2 - An enhanced h2 heading with Vision Pro-inspired styling
 */
export const VisionHeading2: React.FC<VisionHeadingProps> = ({
  children,
  className,
  variant = 'default',
  scrollEffect = false,
  id,
}) => {
  // Get variant specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200 vision-luminous-text';
      case 'glow':
        return 'text-white vision-luminous-text';
      case 'highlight':
        return 'text-white bg-clip-text vision-outlined-text';
      default:
        return 'text-white';
    }
  };
  
  return (
    <motion.h2
      id={id}
      className={cn(
        'text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight',
        'vision-depth',
        getVariantStyles(),
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'translateZ(4px)',
        textShadow: variant === 'glow' ? '0 0 8px rgba(140, 180, 255, 0.4)' : undefined,
      }}
      initial={scrollEffect ? { opacity: 0, y: 15 } : undefined}
      whileInView={scrollEffect ? { opacity: 1, y: 0 } : undefined}
      viewport={scrollEffect ? { once: true, margin: '-100px' } : undefined}
      transition={scrollEffect ? { duration: 0.6, ease: 'easeOut' } : undefined}
    >
      {children}
    </motion.h2>
  );
};

/**
 * VisionHeading3 - An enhanced h3 heading with Vision Pro-inspired styling
 */
export const VisionHeading3: React.FC<VisionHeadingProps> = ({
  children,
  className,
  variant = 'default',
  scrollEffect = false,
  id,
}) => {
  // Get variant specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100 vision-luminous-text';
      case 'glow':
        return 'text-white vision-luminous-text';
      case 'highlight':
        return 'text-white bg-clip-text vision-outlined-text';
      default:
        return 'text-white/90';
    }
  };
  
  return (
    <motion.h3
      id={id}
      className={cn(
        'text-xl md:text-2xl font-semibold tracking-tight',
        'vision-depth',
        getVariantStyles(),
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: 'translateZ(3px)',
        textShadow: variant === 'glow' ? '0 0 6px rgba(140, 180, 255, 0.3)' : undefined,
      }}
      initial={scrollEffect ? { opacity: 0, y: 10 } : undefined}
      whileInView={scrollEffect ? { opacity: 1, y: 0 } : undefined}
      viewport={scrollEffect ? { once: true, margin: '-100px' } : undefined}
      transition={scrollEffect ? { duration: 0.5, ease: 'easeOut' } : undefined}
    >
      {children}
    </motion.h3>
  );
};

/**
 * VisionSectionHeading - A special section heading with Vision Pro styling
 */
export const VisionSectionHeading: React.FC<VisionHeadingProps> = ({
  children,
  className,
  variant = 'default',
  scrollEffect = false,
  id,
}) => {
  // Get variant specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-200';
      case 'glow':
        return 'text-white/90 vision-luminous-text';
      case 'highlight':
        return 'text-white/90 vision-outlined-text';
      default:
        return 'text-white/80';
    }
  };
  
  return (
    <motion.div
      id={id}
      className={cn(
        'vision-depth flex items-center gap-3 mb-4',
        className
      )}
      initial={scrollEffect ? { opacity: 0, y: 10 } : undefined}
      whileInView={scrollEffect ? { opacity: 1, y: 0 } : undefined}
      viewport={scrollEffect ? { once: true, margin: '-100px' } : undefined}
      transition={scrollEffect ? { duration: 0.5, ease: 'easeOut' } : undefined}
    >
      {/* Decorative line */}
      <div 
        className="h-[1px] w-6" 
        style={{ 
          background: 'linear-gradient(to right, rgba(140, 180, 255, 0.7), transparent)',
          boxShadow: '0 0 5px rgba(140, 180, 255, 0.3)',
        }}
      />
      
      {/* Heading text */}
      <h4 
        className={cn(
          'text-lg uppercase tracking-widest font-medium',
          getVariantStyles()
        )}
        style={{
          textShadow: variant === 'glow' ? '0 0 5px rgba(140, 180, 255, 0.3)' : undefined,
        }}
      >
        {children}
      </h4>
      
      {/* Decorative line (end) */}
      <div 
        className="h-[1px] flex-grow" 
        style={{ 
          background: 'linear-gradient(to right, rgba(140, 180, 255, 0.3), transparent)',
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
};