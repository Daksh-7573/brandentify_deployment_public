import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type SpatialPosition = 
  | 'top-left' 
  | 'top' 
  | 'top-right' 
  | 'center-left' 
  | 'center' 
  | 'center-right'
  | 'bottom-left' 
  | 'bottom' 
  | 'bottom-right';

export interface SpatialInfoPanelProps {
  /**
   * Panel title
   */
  title: string;
  
  /**
   * Panel content as an array of string items or React nodes
   */
  items: React.ReactNode[];
  
  /**
   * Spatial position in the viewport
   */
  position?: SpatialPosition;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional z-index depth (1-10, higher numbers appear closer)
   */
  zDepth?: number;
  
  /**
   * Optional icon to display in the panel header
   */
  icon?: React.ReactNode;
  
  /**
   * Whether to use glass morphism effect for Vision Pro
   */
  glassEffect?: boolean;
}

/**
 * SpatialInfoPanel - A component that anchors information to specific spatial positions
 * 
 * Designed for Vision Pro's spatial computing paradigm, this component creates
 * the illusion of information panels floating at different depths in 3D space.
 */
const SpatialInfoPanel: React.FC<SpatialInfoPanelProps> = ({
  title,
  items,
  position = 'center',
  className = '',
  zDepth = 5,
  icon,
  glassEffect = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Position mapping for spatial anchoring
  const positionClasses: Record<SpatialPosition, string> = {
    'top-left': 'top-4 left-4',
    'top': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'center-left': 'top-1/2 left-4 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 right-4 -translate-y-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };
  
  // Z-index calculation for visual depth (Vision Pro optimization)
  const zIndexValue = 10 + zDepth;
  
  // Visual styles based on z-depth (closer elements appear more vibrant)
  const depthStyles = {
    backgroundColor: glassEffect 
      ? `rgba(255, 255, 255, ${0.7 + (zDepth * 0.03)})`
      : 'white',
    boxShadow: `0 ${4 + zDepth}px ${10 + zDepth * 2}px rgba(0, 0, 0, ${0.05 + (zDepth * 0.01)})`,
    transform: isHovered 
      ? `scale(1.05) translateZ(${zDepth * 2}px)` 
      : `translateZ(${zDepth * 2}px)`,
  };
  
  return (
    <div
      className={cn(
        'absolute',
        positionClasses[position],
        'z-10',
        'rounded-2xl p-5',
        'w-[300px]',
        'transition-all duration-500',
        glassEffect ? 'backdrop-blur-md backdrop-saturate-150 dark:bg-gray-800/80' : 'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'visionpro-spatial-element',
        className
      )}
      style={{
        ...depthStyles,
        zIndex: zIndexValue,
      }}
      data-position={position}
      data-zdepth={zDepth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Panel header with title and optional icon */}
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="text-xl font-bold text-primary">{title}</h3>
      </div>
      
      {/* Panel content */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-start gap-2 transition-all",
              isHovered ? 'translate-x-1' : '',
              typeof item === 'string' ? 'text-gray-800 dark:text-gray-200' : ''
            )}
            style={{ 
              transitionDelay: `${index * 50}ms`, 
              transitionDuration: '300ms' 
            }}
          >
            <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
            <div>{item}</div>
          </div>
        ))}
      </div>
      
      {/* Depth indicator - purely visual for Vision Pro */}
      <div 
        className="absolute -z-10 inset-0 rounded-2xl opacity-0 bg-primary/10"
        style={{ 
          opacity: isHovered ? 0.2 : 0,
          transition: 'opacity 500ms ease-in-out',
        }}
      />
    </div>
  );
};

export default SpatialInfoPanel;