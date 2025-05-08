import React from 'react';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

interface DepthGradientProps {
  /** Primary content of the component */
  children: React.ReactNode;
  
  /** Depth level (1-10 scale, where 10 is the closest to the user) */
  depth?: number;
  
  /** Color theme for the gradient */
  colorTheme?: 'primary' | 'secondary' | 'accent' | 'neutral';
  
  /** Whether to use glass morphism effect */
  glassEffect?: boolean;
  
  /** Gradient direction */
  direction?: 'horizontal' | 'vertical' | 'radial';
  
  /** Whether to adjust for dark mode automatically */
  adaptToDarkMode?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * DepthGradient Component
 * 
 * Uses subtle color gradients, shadows, and blur effects to create
 * the illusion of depth in UI elements. Enhances spatial awareness
 * in Vision Pro interfaces with appropriate visual cues.
 */
const DepthGradient: React.FC<DepthGradientProps> = ({
  children,
  depth = 5,
  colorTheme = 'primary',
  glassEffect = true,
  direction = 'vertical',
  adaptToDarkMode = true,
  className,
}) => {
  const capabilities = useVisionProCapabilities();
  
  // Normalize depth to a 0-1 range
  const normalizedDepth = Math.min(Math.max(depth, 1), 10) / 10;
  
  // Calculate blur amount based on depth
  // Further elements (lower depth) get more blur
  const blurAmount = glassEffect ? `blur(${Math.max(10 - depth, 2)}px)` : 'none';
  
  // Calculate opacity based on depth
  // Closer elements (higher depth) have higher opacity
  const bgOpacity = glassEffect ? 0.5 + (normalizedDepth * 0.4) : 0.8 + (normalizedDepth * 0.2);
  
  // Calculate shadow size and intensity based on depth
  // Closer elements cast stronger shadows
  const shadowSize = Math.round(depth * 5);
  const shadowOpacity = normalizedDepth * 0.2;
  
  // Color values for different themes
  const getColorValues = (theme: string) => {
    switch (theme) {
      case 'primary':
        return {
          light: 'var(--primary-rgb)',
          dark: 'var(--primary-rgb)',
        };
      case 'secondary':
        return {
          light: '79, 70, 229', // indigo
          dark: '129, 140, 248', // indigo lighter
        };
      case 'accent':
        return {
          light: '147, 51, 234', // purple
          dark: '192, 132, 252', // purple lighter
        };
      case 'neutral':
      default:
        return {
          light: '107, 114, 128', // gray
          dark: '209, 213, 219', // gray lighter
        };
    }
  };
  
  const colorValues = getColorValues(colorTheme);
  const colorValue = adaptToDarkMode ? 
    `rgb(var(--color-${colorTheme}))` : 
    `rgb(${colorValues.light})`;
  
  // Generate gradient based on direction
  const getGradientStyle = () => {
    const opacity1 = bgOpacity;
    const opacity2 = bgOpacity - 0.2;
    
    if (!capabilities.hasVisionProFeatures) {
      // Subtle gradient for non-Vision Pro devices
      switch (direction) {
        case 'horizontal':
          return `linear-gradient(to right, rgba(${colorValues.light}, ${opacity1}), rgba(${colorValues.light}, ${opacity2}))`;
        case 'radial':
          return `radial-gradient(circle, rgba(${colorValues.light}, ${opacity1}) 0%, rgba(${colorValues.light}, ${opacity2}) 100%)`;
        case 'vertical':
        default:
          return `linear-gradient(to bottom, rgba(${colorValues.light}, ${opacity1}), rgba(${colorValues.light}, ${opacity2}))`;
      }
    } else {
      // Enhanced gradients for Vision Pro
      switch (direction) {
        case 'horizontal':
          return `linear-gradient(to right, 
            rgba(${colorValues.light}, ${opacity1}) 0%, 
            rgba(${colorValues.light}, ${opacity1 - 0.05}) 50%,
            rgba(${colorValues.light}, ${opacity2}) 100%)`;
        case 'radial':
          return `radial-gradient(circle, 
            rgba(${colorValues.light}, ${opacity1}) 0%, 
            rgba(${colorValues.light}, ${opacity1 - 0.1}) 50%,
            rgba(${colorValues.light}, ${opacity2}) 100%)`;
        case 'vertical':
        default:
          return `linear-gradient(to bottom, 
            rgba(${colorValues.light}, ${opacity1}) 0%, 
            rgba(${colorValues.light}, ${opacity1 - 0.05}) 50%,
            rgba(${colorValues.light}, ${opacity2}) 100%)`;
      }
    }
  };
  
  // Generate shadow based on depth
  const getShadowStyle = () => {
    if (capabilities.hasVisionProFeatures) {
      const x = Math.round(depth / 2);
      const y = Math.round(depth * 1.5);
      const spread = Math.round(depth);
      
      return `0 ${y}px ${shadowSize}px -${x}px rgba(${colorValues.light}, ${shadowOpacity})`;
    } else {
      return `0 ${Math.round(depth / 2)}px ${shadowSize}px rgba(0, 0, 0, ${shadowOpacity})`;
    }
  };
  
  // Different styles for Vision Pro vs standard devices
  const style = capabilities.hasVisionProFeatures
    ? {
        background: getGradientStyle(),
        backdropFilter: glassEffect ? blurAmount : 'none',
        WebkitBackdropFilter: glassEffect ? blurAmount : 'none',
        boxShadow: getShadowStyle(),
        transform: `translateZ(${depth * 5}px)`,
        zIndex: depth,
      }
    : {
        background: getGradientStyle(),
        boxShadow: getShadowStyle(),
      };
    
  // Classes for border based on depth
  const borderClasses = normalizedDepth > 0.7
    ? 'border-2'
    : normalizedDepth > 0.4
      ? 'border'
      : 'border border-opacity-50';
  
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        'transition-all duration-300',
        borderClasses,
        'border-gray-200 dark:border-gray-700',
        capabilities.hasVisionProFeatures && 'transform-style-3d',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default DepthGradient;