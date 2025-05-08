import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue } from 'framer-motion';

/**
 * SpatialLayout - The main container for the 3D spatial UI
 * Creates a perspective environment for 3D positioning of content
 */
interface SpatialLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

export const SpatialLayout: React.FC<SpatialLayoutProps> = ({ 
  children,
  backgroundImage = 'linear-gradient(to bottom, #0f172a, #1e293b)'
}) => {
  return (
    <div 
      className="min-h-screen overflow-hidden relative"
      style={{ 
        perspective: '1500px',
        background: backgroundImage
      }}
    >
      <div className="w-full h-full min-h-screen relative">
        {children}
      </div>
    </div>
  );
};

/**
 * FloatingWindow - A draggable, 3D positioned window component with glassmorphism
 * Used for panels, cards and other UI elements in the spatial layout
 */
interface FloatingWindowProps {
  children: ReactNode;
  title: string;
  onClose?: () => void;
  initialPosition?: { x: number; y: number; z: number };
  initialScale?: number;
  width?: string;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  children,
  title,
  onClose,
  initialPosition = { x: 0, y: 0, z: 0 },
  initialScale = 1,
  width = '600px',
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Motion values for dragging
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  
  // Increase or decrease z-index (depth)
  const moveForward = () => {
    setPosition(prev => ({ ...prev, z: prev.z + 5 }));
  };
  
  const moveBackward = () => {
    setPosition(prev => ({ ...prev, z: prev.z - 5 }));
  };
  
  // Increase or decrease scale
  const scaleUp = () => {
    setScale(prev => Math.min(prev + 0.05, 1.2));
  };
  
  const scaleDown = () => {
    setScale(prev => Math.max(prev - 0.05, 0.7));
  };
  
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ top: -300, left: -500, right: 500, bottom: 300 }}
      whileDrag={{ cursor: 'grabbing' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "rounded-xl overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300",
        "border border-white/20 bg-black/40",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        width,
        x,
        y,
        zIndex: 100 + position.z,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${position.z}px) scale(${scale})`,
      }}
    >
      {/* Window Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md px-4 py-2 flex items-center justify-between">
        <div className="text-white font-medium">{title}</div>
        <div className="flex items-center gap-1">
          {/* Z-index (depth) controls */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
            onClick={moveForward}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
            onClick={moveBackward}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
          
          {/* Scale controls */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
            onClick={scaleUp}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
            onClick={scaleDown}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          
          {/* Minimize control */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          
          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Window Content */}
      <div className={cn(
        "p-4 transition-all duration-300 ease-in-out overflow-auto",
        isMinimized ? "max-h-0 p-0" : "max-h-[80vh]"
      )}>
        {children}
      </div>
    </motion.div>
  );
};

/**
 * ControlPanel - A fixed bottom control panel for navigation and global controls
 */
interface ControlPanelProps {
  children: ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ children }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-full px-4 py-2 shadow-xl">
        {children}
      </div>
    </div>
  );
};

export default SpatialLayout;