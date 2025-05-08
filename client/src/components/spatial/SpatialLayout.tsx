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
      {/* Environment ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top light source - bluish ambient light */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[30vh] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(120, 160, 255, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(40px)'
          }}
        />
        
        {/* Bottom light reflection */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[20vh] opacity-10"
          style={{
            background: 'radial-gradient(ellipse, rgba(200, 225, 255, 0.5) 0%, rgba(0, 0, 0, 0) 80%)',
            filter: 'blur(30px)'
          }}
        />
        
        {/* Side ambient highlights */}
        <div
          className="absolute top-1/3 right-0 w-[20vw] h-[40vh] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(140, 100, 255, 0.3) 0%, rgba(0, 0, 0, 0) 80%)',
            filter: 'blur(50px)'
          }}
        />
        
        <div
          className="absolute bottom-1/4 left-0 w-[15vw] h-[30vh] opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(100, 210, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(45px)'
          }}
        />
      </div>
      
      {/* Particle effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Content wrapper */}
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
  const [isFocused, setIsFocused] = useState(false);
  
  // Motion values for dragging
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const z = useMotionValue(initialPosition.z);
  const scaleMotion = useMotionValue(initialScale);
  
  // Update motion values when state changes
  useEffect(() => {
    z.set(position.z);
    scaleMotion.set(scale);
  }, [position.z, scale, z, scaleMotion]);
  
  // Increase or decrease z-index (depth)
  const moveForward = () => {
    setPosition(prev => ({ ...prev, z: prev.z + 5 }));
    setIsFocused(true);
    
    // Auto-blur after a moment
    setTimeout(() => setIsFocused(false), 1500);
  };
  
  const moveBackward = () => {
    setPosition(prev => ({ ...prev, z: prev.z - 5 }));
    setIsFocused(true);
    
    // Auto-blur after a moment
    setTimeout(() => setIsFocused(false), 1500);
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
      onDragStart={() => {
        setIsDragging(true);
        setIsFocused(true);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        // Keep focus for a moment after drag ends
        setTimeout(() => setIsFocused(false), 1200);
      }}
      onClick={() => setIsFocused(true)}
      animate={{
        scale: scaleMotion.get(),
        z: z.get(),
        boxShadow: isFocused 
          ? '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(130, 130, 255, 0.3)' 
          : '0 5px 20px rgba(0, 0, 0, 0.3)',
        borderColor: isFocused ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8
      }}
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "rounded-xl overflow-hidden backdrop-blur-md", 
        "border bg-black/40",
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
    <motion.div 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.3
      }}
    >
      <motion.div 
        className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-full px-5 py-3 shadow-xl"
        whileHover={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(120, 120, 255, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.3)'
        }}
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7))'
        }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-blue-400/10 blur-md"
            style={{ borderRadius: '100%' }}
          />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-white/5"
            style={{ borderRadius: '100%' }}
          />
        </div>
        
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SpatialLayout;