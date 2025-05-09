import React from 'react';
import { cn } from '@/lib/utils';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'blur';
}

/**
 * GlassContainer - A container with glassmorphic effect for the application
 */
export function GlassContainer({
  children,
  className,
  variant = 'default',
}: GlassContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full overflow-hidden',
        {
          'bg-background': variant === 'default',
          'bg-[#1C1C1E]': variant === 'dark',
          'backdrop-blur-xl': variant === 'blur',
        },
        className
      )}
      style={{
        backgroundImage: 
          variant === 'default'
            ? 'radial-gradient(circle at 50% 50%, rgba(79, 140, 255, 0.08), transparent 800px)'
            : 'radial-gradient(circle at 50% 50%, rgba(79, 140, 255, 0.05), transparent 800px)'
      }}
    >
      {/* Optional decorative elements for enhanced glassmorphic effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle gradient orb - top right */}
        <div 
          className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79, 140, 255, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
        
        {/* Subtle gradient orb - bottom left */}
        <div 
          className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(62, 215, 194, 0.05) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}