import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

interface FloatingElementProps {
  /** Primary content of the floating element */
  children: React.ReactNode;
  
  /** How much the element should float (1-10 scale) */
  floatLevel?: number;
  
  /** Whether to add glow effect */
  glowEffect?: boolean;
  
  /** Whether the element should respond to cursor/gaze movement */
  interactive?: boolean;
  
  /** Initial z-index position */
  zIndex?: number;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * FloatingElement Component
 * 
 * Creates UI elements that appear to float above the background with subtle
 * parallax movement. Optimized for Vision Pro spatial interfaces with
 * appropriate depth effects that respond to user interaction.
 */
const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  floatLevel = 3,
  glowEffect = true,
  interactive = true,
  zIndex = 10,
  className,
}) => {
  const capabilities = useVisionProCapabilities();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Normalize float level (1-10) to actual pixel values
  const normalizedFloat = Math.min(Math.max(floatLevel, 1), 10);
  const floatHeight = normalizedFloat * 4;
  const parallaxStrength = normalizedFloat * 0.5;
  
  // Handle mouse/gaze interaction
  useEffect(() => {
    if (!interactive || !elementRef.current) return;
    
    const element = elementRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return;
      
      // Calculate element center point
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse distance from center as a percentage of the window
      const distanceX = (e.clientX - centerX) / window.innerWidth;
      const distanceY = (e.clientY - centerY) / window.innerHeight;
      
      // Set position with parallax effect scaled by the normalized float level
      setPosition({
        x: distanceX * 10 * parallaxStrength,
        y: distanceY * 10 * parallaxStrength,
      });
    };
    
    if (capabilities.hasVisionProFeatures) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive, capabilities.hasVisionProFeatures, parallaxStrength]);
  
  // Handle hover state
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };
  
  // Enhanced glow effects for Vision Pro
  const glowClasses = glowEffect && capabilities.hasVisionProFeatures
    ? isHovered
      ? 'shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)]'
      : 'shadow-[0_8px_15px_-8px_rgba(var(--primary-rgb),0.3)]'
    : '';
  
  // Default elevation shadow regardless of glow effect
  const shadowClasses = 'shadow-lg';
  
  // Calculate transform with both floating and parallax effects
  const transform = capabilities.hasVisionProFeatures
    ? `translateZ(${floatHeight}px) translate(${position.x}px, ${position.y}px) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`
    : '';
  
  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-300 ease-out rounded-xl relative',
        'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'border border-gray-200 dark:border-gray-700',
        capabilities.hasVisionProFeatures && 'visionpro-trackable',
        glowClasses,
        shadowClasses,
        className
      )}
      style={{
        transform,
        zIndex: isHovered ? zIndex + 5 : zIndex,
        willChange: 'transform',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default FloatingElement;