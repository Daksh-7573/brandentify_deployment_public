import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PageLayout } from './page-layout';

interface EnhancedPageLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  showGradientBackground?: boolean;
  showDepthEffects?: boolean;
}

/**
 * EnhancedPageLayout - A page layout component with Vision Pro-inspired visual effects
 * 
 * This layout adds dramatic lighting effects, glassmorphism, and depth-based visuals
 * inspired by Vision Pro's spatial UI but within the standard page structure.
 */
const EnhancedPageLayout: React.FC<EnhancedPageLayoutProps> = ({
  children,
  className,
  title,
  subtitle,
  showGradientBackground = true,
  showDepthEffects = true,
}) => {
  return (
    <PageLayout className={cn(
      'relative overflow-x-hidden min-h-screen',
      className
    )}>
      {/* Background gradient effects */}
      {showGradientBackground && (
        <>
          {/* Primary light source - top right */}
          <div 
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(120, 150, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
              zIndex: -1,
            }}
          />
          
          {/* Secondary light source - bottom left */}
          <div 
            className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(130, 180, 255, 0.25) 0%, transparent 70%)',
              filter: 'blur(50px)',
              zIndex: -1,
            }}
          />
          
          {/* Dark gradient overlay for depth */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
              zIndex: -2,
            }}
          />
        </>
      )}
      
      {/* Title section with parallax effects */}
      {(title || subtitle) && (
        <motion.div 
          className="mb-6 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            delay: 0.1,
          }}
        >
          {title && (
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
              style={{
                textShadow: showDepthEffects ? '0 2px 10px rgba(0, 0, 0, 0.3)' : undefined,
              }}
            >
              {title}
            </motion.h1>
          )}
          
          {subtitle && (
            <motion.p 
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
          
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
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </PageLayout>
  );
};

export default EnhancedPageLayout;