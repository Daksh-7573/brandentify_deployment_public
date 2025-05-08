import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

interface EnhancedBackgroundProps {
  variant?: 'default' | 'dramatic' | 'subtle' | 'immersive';
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
  
  // State for scroll-based effects
  const [scrollY, setScrollY] = useState(0);
  
  // Track current cursor velocity for more dynamic effects
  const [cursorVelocity, setCursorVelocity] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  // Add spring physics for smoother, more natural movement
  const springConfig = variant === 'dramatic' 
    ? { damping: 15, stiffness: 180 } 
    : { damping: 25, stiffness: 150 };
    
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Create transforms for the light position based on mouse movement
  // Map the mouse coordinates to percentage positions for the lights
  const light1X = useTransform(springX, [-800, 800], ['10%', '90%']);
  const light1Y = useTransform(springY, [-600, 600], ['10%', '90%']);
  const light2X = useTransform(springX, [-800, 800], ['90%', '10%']);
  const light2Y = useTransform(springY, [-600, 600], ['90%', '10%']);
  
  // Dynamic transforms for accent lights based on cursor velocity
  const light3X = useTransform(
    springX, 
    [-800, 800], 
    ['60%', '40%']
  );
  const light3Y = useTransform(
    springY, 
    [-600, 600], 
    ['40%', '60%']
  );
  
  // Track mouse movement for enhanced lighting effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      
      mouseX.set(x);
      mouseY.set(y);
      
      // Calculate velocity for more dynamic effects
      const now = Date.now();
      const timeDelta = now - lastUpdateTime;
      
      if (timeDelta > 0) {
        const dx = x - lastPosition.x;
        const dy = y - lastPosition.y;
        
        // Smooth the velocity values
        setCursorVelocity({
          x: 0.8 * cursorVelocity.x + 0.2 * (dx / timeDelta) * 100,
          y: 0.8 * cursorVelocity.y + 0.2 * (dy / timeDelta) * 100
        });
        
        setLastPosition({ x, y });
        setLastUpdateTime(now);
      }
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mouseX, mouseY, lastPosition, lastUpdateTime, cursorVelocity]);
  
  // Determine light intensity and colors based on variant
  const getLightSettings = () => {
    switch (variant) {
      case 'dramatic':
        return {
          primary: { intensity: 0.75, color: [130, 160, 255] },
          secondary: { intensity: 0.55, color: [100, 130, 220] },
          third: { intensity: 0.4, color: [80, 100, 200] },
          accent: { intensity: 0.35, color: [160, 130, 255] }
        };
      case 'subtle':
        return {
          primary: { intensity: 0.25, color: [120, 150, 230] },
          secondary: { intensity: 0.15, color: [90, 110, 180] },
          third: { intensity: 0.1, color: [70, 90, 160] },
          accent: { intensity: 0.1, color: [140, 120, 200] }
        };
      case 'immersive':
        return {
          primary: { intensity: 0.85, color: [140, 170, 255] },
          secondary: { intensity: 0.65, color: [110, 140, 230] },
          third: { intensity: 0.5, color: [90, 110, 210] },
          accent: { intensity: 0.45, color: [170, 140, 255] }
        };
      default:
        return {
          primary: { intensity: 0.45, color: [120, 150, 255] },
          secondary: { intensity: 0.3, color: [100, 120, 200] },
          third: { intensity: 0.25, color: [80, 100, 180] },
          accent: { intensity: 0.2, color: [150, 130, 220] }
        };
    }
  };
  
  const lights = getLightSettings();
  
  // Calculate dynamic modifiers based on cursor velocity and scroll
  const getVelocityModifier = () => {
    // Normalize velocity to a value between 0 and 1
    const speed = Math.min(Math.sqrt(cursorVelocity.x ** 2 + cursorVelocity.y ** 2) / 500, 1);
    return speed * 0.4; // Cap the effect
  };
  
  const getScrollModifier = () => {
    // Create a subtle effect based on scroll position
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(scrollY / (maxScroll || 1), 1);
    return scrollPercent * 0.3; // Cap the effect
  };
  
  // Combine modifiers for dynamic effects
  const velocityMod = getVelocityModifier();
  const scrollMod = getScrollModifier();
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* Base background color/gradient - Vision Pro-inspired dark gradient */}
      <div 
        className="absolute inset-0 vision-bg"
        style={{ 
          background: variant === 'immersive' 
            ? 'radial-gradient(circle at center, rgba(25, 35, 60, 0.9) 0%, rgba(10, 15, 30, 0.95) 70%, rgba(5, 10, 20, 1) 100%)'
            : 'radial-gradient(circle at center, rgba(20, 30, 50, 0.8) 0%, rgba(10, 15, 30, 0.9) 70%, rgba(5, 10, 20, 1) 100%)',
          opacity: 0.85,
        }}
      />
      
      {/* Primary light source - follows mouse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: variant === 'dramatic' || variant === 'immersive' ? '800px' : '600px',
          height: variant === 'dramatic' || variant === 'immersive' ? '800px' : '600px',
          background: `radial-gradient(circle, rgba(${lights.primary.color.join(',')}, ${lights.primary.intensity + velocityMod}) 0%, transparent 75%)`,
          left: light1X,
          top: light1Y,
          transform: 'translate(-50%, -50%)',
          filter: `blur(${variant === 'dramatic' ? 100 : 80}px)`,
          opacity: 0.9,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Secondary light source - inverse movement */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: variant === 'immersive' ? '700px' : '500px',
          height: variant === 'immersive' ? '700px' : '500px',
          background: `radial-gradient(circle, rgba(${lights.secondary.color.join(',')}, ${lights.secondary.intensity + velocityMod * 0.7}) 0%, transparent 75%)`,
          left: light2X,
          top: light2Y,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(85px)',
          opacity: 0.7,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Third accent light - moves with additional dynamism */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '450px',
          height: '450px',
          background: `radial-gradient(circle, rgba(${lights.third.color.join(',')}, ${lights.third.intensity + scrollMod}) 0%, transparent 70%)`,
          left: light3X,
          top: light3Y,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(65px)',
          opacity: 0.6,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Fourth ambient light - fixed position */}
      <div
        className="absolute rounded-full"
        style={{
          width: '350px',
          height: '350px',
          background: `radial-gradient(circle, rgba(${lights.accent.color.join(',')}, ${lights.accent.intensity + scrollMod * 0.8}) 0%, transparent 70%)`,
          right: '15%',
          bottom: '20%',
          filter: 'blur(60px)',
          opacity: 0.5,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Subtle top highlight/rim light - Vision Pro hallmark */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(to right, 
            transparent 5%, 
            rgba(${lights.primary.color.join(',')}, ${0.15 + scrollMod * 0.5}) 30%, 
            rgba(255, 255, 255, ${0.2 + velocityMod * 0.5}) 50%,
            rgba(${lights.primary.color.join(',')}, ${0.15 + scrollMod * 0.5}) 70%,
            transparent 95%
          )`,
          opacity: variant === 'subtle' ? 0.4 : 0.7,
          filter: 'blur(1px)',
        }}
      />
      
      {/* Depth/vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.5) 100%)',
          opacity: variant === 'immersive' ? 0.7 : 0.5,
        }}
      />
      
      {/* Grain effect for texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\'/%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          opacity: variant === 'subtle' ? 0.02 : 0.03,
          mixBlendMode: 'overlay',
        }}
      />
      
      {/* Particle effect for dramatic/immersive variants */}
      {(variant === 'dramatic' || variant === 'immersive') && (
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence>
            {Array.from({ length: variant === 'immersive' ? 30 : 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                initial={{ 
                  opacity: 0,
                  scale: 0.1,
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                }}
                animate={{ 
                  opacity: [0, Math.random() * 0.2 + 0.1, 0],
                  scale: [0.1, Math.random() * 0.4 + 0.2, 0.1],
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                }}
                transition={{
                  duration: Math.random() * 5 + 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  background: `rgba(${lights.primary.color.join(',')}, 1)`,
                  filter: 'blur(1px)',
                  boxShadow: `0 0 ${Math.random() * 8 + 4}px rgba(${lights.primary.color.join(',')}, 0.8)`,
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};