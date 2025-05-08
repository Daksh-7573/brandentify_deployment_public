import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

type TransitionType = 'fade' | 'slide' | 'scale' | 'spatial';
type TransitionDirection = 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward';

interface SmartTransitionProps {
  children: React.ReactNode;
  secondaryContent?: React.ReactNode;
  type?: TransitionType;
  direction?: TransitionDirection;
  duration?: number;
  transitionOnHover?: boolean;
  isActive?: boolean;
  onTransitionChange?: (state: boolean) => void;
  className?: string;
}

/**
 * SmartTransition Component
 * 
 * Implements smooth, spatial-aware transitions between UI states.
 * Optimized for Vision Pro to utilize depth and spatial positioning
 * for more intuitive state changes.
 */
const SmartTransition: React.FC<SmartTransitionProps> = ({
  children,
  secondaryContent,
  type = 'fade',
  direction = 'forward',
  duration = 300,
  transitionOnHover = true,
  isActive: externalIsActive,
  onTransitionChange,
  className,
}) => {
  const capabilities = useVisionProCapabilities();
  const [internalIsActive, setInternalIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use external state if provided, otherwise use internal state
  const isActive = externalIsActive !== undefined ? externalIsActive : internalIsActive;
  
  // Handle hover state changes
  const handleMouseEnter = () => {
    if (transitionOnHover) {
      setInternalIsActive(true);
      if (onTransitionChange) onTransitionChange(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (transitionOnHover) {
      setInternalIsActive(false);
      if (onTransitionChange) onTransitionChange(false);
    }
  };
  
  // Helper function to get styles based on transition type and device capabilities
  const getStyles = () => {
    const baseClasses = {
      primary: 'transition-all ease-in-out absolute inset-0',
      secondary: 'transition-all ease-in-out absolute inset-0',
    };
    
    const durationClass = `duration-${duration}`;
    
    // Create slide map with proper typing
    const createSlideMap = () => {
      const map: Record<TransitionDirection, { out: string; in: string }> = {
        up: { out: 'translate-y-full', in: '-translate-y-full' },
        down: { out: '-translate-y-full', in: 'translate-y-full' },
        left: { out: 'translate-x-full', in: '-translate-x-full' },
        right: { out: '-translate-x-full', in: 'translate-x-full' },
        forward: { out: 'translate-y-full', in: '-translate-y-full' },
        backward: { out: '-translate-y-full', in: 'translate-y-full' },
      };
      return map;
    };
    
    // Create spatial map with proper typing
    const createSpatialMap = () => {
      const map: Record<TransitionDirection, { out: string; in: string }> = {
        forward: { 
          out: 'translateZ(-100px) scale(0.9) opacity-0', 
          in: 'translateZ(-30px) scale(1.1) opacity-0' 
        },
        backward: { 
          out: 'translateZ(100px) scale(1.1) opacity-0', 
          in: 'translateZ(30px) scale(0.9) opacity-0' 
        },
        up: { 
          out: 'translateY(-50px) translateZ(30px) opacity-0', 
          in: 'translateY(50px) translateZ(-30px) opacity-0' 
        },
        down: { 
          out: 'translateY(50px) translateZ(30px) opacity-0', 
          in: 'translateY(-50px) translateZ(-30px) opacity-0' 
        },
        left: { 
          out: 'translateX(-50px) translateZ(30px) opacity-0', 
          in: 'translateX(50px) translateZ(-30px) opacity-0' 
        },
        right: { 
          out: 'translateX(50px) translateZ(30px) opacity-0', 
          in: 'translateX(-50px) translateZ(-30px) opacity-0' 
        },
      };
      return map;
    };
    
    // Enhanced Vision Pro transitions
    if (capabilities.hasVisionProFeatures) {
      switch (type) {
        case 'fade':
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'opacity-0'),
          };
          
        case 'slide': {
          const slideMap = createSlideMap();
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && slideMap[direction].out),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && slideMap[direction].in),
          };
        }
          
        case 'scale':
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'scale-90 opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'scale-110 opacity-0'),
          };
          
        case 'spatial': {
          const spatialMap = createSpatialMap();
          return {
            primary: cn(baseClasses.primary, durationClass, 'transform-style-3d'),
            secondary: cn(baseClasses.secondary, durationClass, 'transform-style-3d'),
            primaryStyle: isActive ? spatialMap[direction].out : '',
            secondaryStyle: !isActive ? spatialMap[direction].in : '',
          };
        }
          
        default:
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'opacity-0'),
          };
      }
    } 
    // Standard transitions for non-Vision Pro devices
    else {
      switch (type) {
        case 'fade':
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'opacity-0'),
          };
          
        case 'slide': {
          const slideMap = createSlideMap();
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && slideMap[direction].out),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && slideMap[direction].in),
          };
        }
          
        case 'scale':
        case 'spatial': // fallback to scale for spatial
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'scale-95 opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'scale-105 opacity-0'),
          };
          
        default:
          return {
            primary: cn(baseClasses.primary, durationClass, isActive && 'opacity-0'),
            secondary: cn(baseClasses.secondary, durationClass, !isActive && 'opacity-0'),
          };
      }
    }
  };
  
  const styles = getStyles();
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        capabilities.hasVisionProFeatures && 'perspective-1000',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary content */}
      <div 
        className={styles.primary}
        style={styles.primaryStyle ? { transform: styles.primaryStyle } : undefined}
      >
        {children}
      </div>
      
      {/* Secondary content (if provided) */}
      {secondaryContent && (
        <div 
          className={styles.secondary}
          style={styles.secondaryStyle ? { transform: styles.secondaryStyle } : undefined}
        >
          {secondaryContent}
        </div>
      )}
    </div>
  );
};

export default SmartTransition;