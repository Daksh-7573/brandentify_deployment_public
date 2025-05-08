import React, { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { PageLayout } from './page-layout';

interface EnhancedPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  subtitle?: string;
  showGradientBackground?: boolean;
  showDepthEffects?: boolean;
  variant?: 'default' | 'dramatic' | 'subtle';
}

/**
 * EnhancedPageLayout - A page layout component with Vision Pro-inspired visual effects
 * 
 * This layout adds dramatic lighting effects, glassmorphism, and depth-based visuals
 * inspired by Vision Pro's spatial UI but within the standard page structure.
 */
const EnhancedPageLayout = ({
  children,
  title,
  description,
  icon,
  actions,
  subtitle,
  showGradientBackground = true,
  showDepthEffects = true,
  variant = 'default',
}: EnhancedPageLayoutProps) => {
  // Motion values for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth springs for more natural motion
  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Transform mouse position to light position
  const light1X = useTransform(springX, [-500, 500], ['-10%', '110%']);
  const light1Y = useTransform(springY, [-500, 500], ['-10%', '110%']);
  const light2X = useTransform(springX, [-500, 500], ['110%', '-10%']);
  const light2Y = useTransform(springY, [-500, 500], ['110%', '-10%']);
  
  // Mouse movement handler
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
      case 'dramatic': return { primary: 0.5, secondary: 0.35 };
      case 'subtle': return { primary: 0.2, secondary: 0.15 };
      default: return { primary: 0.35, secondary: 0.25 };
    }
  };
  
  const intensity = getLightIntensity();
  
  return (
    <PageLayout 
      title={title}
      description={description || subtitle || ""}
      icon={icon}
      actions={actions}
    >
      <div className="relative overflow-hidden min-h-[calc(100vh-64px)]">
        {/* Background gradient effects */}
        {showGradientBackground && (
          <>
            {/* Primary light source - follows mouse movement */}
            <motion.div 
              className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(100, 140, 255, ${intensity.primary}) 0%, transparent 70%)`,
                filter: 'blur(70px)',
                zIndex: 0,
                left: light1X,
                top: light1Y,
                opacity: 0.4,
              }}
            />
            
            {/* Secondary light source - inverse of primary movement */}
            <motion.div 
              className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(130, 180, 255, ${intensity.secondary}) 0%, transparent 70%)`,
                filter: 'blur(60px)',
                zIndex: 0,
                left: light2X,
                top: light2Y,
                opacity: 0.3,
              }}
            />
            
            {/* Ambient glow */}
            <div 
              className="fixed inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(10, 10, 40, 0) 0%, rgba(10, 10, 40, 0.3) 100%)',
                zIndex: 0,
              }}
            />
            
            {/* Depth fog effect */}
            {showDepthEffects && (
              <div 
                className="fixed inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(10, 10, 40, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)',
                  zIndex: 0,
                  backdropFilter: 'blur(40px)',
                  opacity: 0.2,
                }}
              />
            )}
          </>
        )}
        
        {/* Subtitle section with parallax effects */}
        {subtitle && (
          <motion.div 
            className="mb-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.1,
            }}
          >
            <motion.p 
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
            
            {/* Accent line */}
            <motion.div 
              className="w-16 h-1 bg-primary mt-3"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.div>
        )}
        
        {/* Page content with staggered children */}
        <motion.div
          className="w-full relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export { EnhancedPageLayout };