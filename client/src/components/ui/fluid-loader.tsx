import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FluidLoaderProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  smallText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'primary' | 'white' | 'dark';
}

export function FluidLoader({
  isLoading,
  text = 'Loading',
  className,
  smallText = false,
  size = 'md',
  theme = 'primary',
}: FluidLoaderProps) {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-40',
    lg: 'h-56',
  };

  const themeClasses = {
    primary: 'text-primary',
    white: 'text-white',
    dark: 'text-slate-800',
  };

  const bubbleColors = {
    primary: ['bg-primary/30', 'bg-primary/50', 'bg-primary/70'],
    white: ['bg-white/30', 'bg-white/50', 'bg-white/70'],
    dark: ['bg-slate-700/30', 'bg-slate-700/50', 'bg-slate-700/70'],
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <div className={cn("flex flex-col items-center justify-center", sizeClasses[size], className)}>
          <div className="relative h-20 w-20">
            {/* Fluid bubbles animation */}
            <div className="absolute inset-0">
              {/* Multiple animated bubbles with staggered animation */}
              <AnimatePresence>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`bubble-${i}`}
                    className={cn(
                      "absolute rounded-full",
                      bubbleColors[theme][i % bubbleColors[theme].length]
                    )}
                    initial={{ 
                      scale: 0.5, 
                      x: (i % 2 === 0) ? -10 : 10,
                      y: 0,
                      opacity: 0.3
                    }}
                    animate={{ 
                      scale: [0.5, 0.8, 0.5],
                      x: [
                        (i % 2 === 0) ? -10 : 10, 
                        (i % 2 === 0) ? 10 : -10, 
                        (i % 2 === 0) ? -10 : 10
                      ],
                      y: [0, -20, 0],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{ 
                      duration: 2.5, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    style={{
                      width: `${20 + i * 5}px`,
                      height: `${20 + i * 5}px`,
                      left: `${40 + (i % 3) * 5}%`,
                      top: `${40 + (i % 2) * 10}%`,
                      filter: 'blur(1px)',
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Main fluid circle that pulses */}
            <motion.div
              className={cn(
                "absolute rounded-full inset-0",
                bubbleColors[theme][1],
                "flex items-center justify-center"
              )}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: [0.8, 1, 0.8],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
              style={{ filter: 'blur(1px)' }}
            />

            {/* Center solid circle */}
            <motion.div
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full", 
                `bg-${theme === 'white' ? 'white' : theme}`
              )}
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ 
                scale: [0.6, 0.8, 0.6],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
              style={{
                width: '50%',
                height: '50%',
              }}
            />
          </div>

          {/* Loading text */}
          {text && (
            <motion.div 
              className={cn(
                smallText ? "text-sm mt-1" : "text-lg font-medium mt-4", 
                themeClasses[theme]
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {text}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}