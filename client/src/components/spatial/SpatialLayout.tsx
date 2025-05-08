import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingWindowProps {
  title: string;
  children: ReactNode;
  width?: string;
  height?: string;
  initialPosition?: { x: number; y: number; z: number };
  initialScale?: number;
  onClose?: () => void;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  title,
  children,
  width = '400px',
  height = 'auto',
  initialPosition = { x: 0, y: 0, z: 0 },
  initialScale = 1,
  onClose,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      className="absolute"
      drag
      dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ 
        x: initialPosition.x,
        y: initialPosition.y,
        scale: initialScale,
      }}
      animate={{ 
        x: position.x,
        y: position.y,
        scale: initialScale,
        z: position.z 
      }}
      whileHover={{ scale: initialScale * 1.02 }}
      style={{ 
        width,
        height,
        zIndex: isDragging ? 100 : 10,
      }}
    >
      <div 
        className="flex flex-col rounded-xl overflow-hidden"
        style={{
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex justify-between items-center p-3 bg-black/10 cursor-move">
          <h3 className="text-white font-medium">{title}</h3>
          {onClose && (
            <button 
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="text-white">×</span>
            </button>
          )}
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

interface SpatialLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

export const SpatialLayout: React.FC<SpatialLayoutProps> = ({ 
  children,
  backgroundImage = 'linear-gradient(to bottom right, #1e293b, #0f172a)'
}) => {
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{
        perspective: '1000px',
        background: backgroundImage
      }}
    >
      <div className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 80%)'
        }}
      />
      {children}
    </div>
  );
};

interface ControlPanelProps {
  position?: { x: number; y: number; z: number };
  children: ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  position = { x: 0, y: 0, z: 0 },
  children 
}) => {
  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center p-4 rounded-full"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      style={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000
      }}
    >
      {children}
    </motion.div>
  );
};

export default SpatialLayout;