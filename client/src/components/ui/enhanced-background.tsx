import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface EnhancedBackgroundProps {
  variant?: 'default' | 'dramatic' | 'subtle';
  className?: string;
}

/**
 * EnhancedBackground - A full-page background component with Vision Pro-inspired effects
 * 
 * This component adds dynamic lighting effects that follow mouse movements,
 * giving standard pages a spatial computing feel without requiring a 3D environment.
 */
export const EnhancedBackground: React.FC<EnhancedBackgroundProps> = ({
  variant = 'default',
  className,
}) => {
  // Mouse position motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Add spring physics for smoother, more natural movement
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Create transforms for the light position based on mouse movement
  // Map the mouse coordinates to percentage positions for the lights
  const light1X = useTransform(springX, [-500, 500], ['0%', '100%']);
  const light1Y = useTransform(springY, [-500, 500], ['0%', '100%']);
  const light2X = useTransform(springX, [-500, 500], ['100%', '0%']);
  const light2Y = useTransform(springY, [-500, 500], ['100%', '0%']);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Determine light intensity based on variant
  const getLightIntensity = () => {
    switch (variant) {
      case 'dramatic': return { primary: 0.6, secondary: 0.4, third: 0.3 };
      case 'subtle': return { primary: 0.25, secondary: 0.15, third: 0.1 };
      default: return { primary: 0.4, secondary: 0.25, third: 0.2 };
    }
  };
  
  const intensity = getLightIntensity();
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* Base background color/gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black to-gray-900/80"
        style={{ opacity: 0.7 }}
      />
      
      {/* Primary light source - follows mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(120, 150, 255, ${intensity.primary}) 0%, transparent 70%)`,
          left: light1X,
          top: light1Y,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(80px)',
          opacity: 0.8,
        }}
      />
      
      {/* Secondary light source - inverse movement */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(100, 120, 200, ${intensity.secondary}) 0%, transparent 70%)`,
          left: light2X,
          top: light2Y,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(70px)',
          opacity: 0.6,
        }}
      />
      
      {/* Third accent light */}
      <div
        className="absolute right-[10%] bottom-[10%] w-[300px] h-[300px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(70, 90, 180, ${intensity.third}) 0%, transparent 70%)`,
          filter: 'blur(60px)',
          opacity: 0.4,
        }}
      />
      
      {/* Depth/vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.4) 100%)',
          opacity: 0.5,
        }}
      />
      
      {/* Grain effect for texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
          backgroundSize: 'cover',
        }}
      />
    </div>
  );
};