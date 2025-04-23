import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FluidLoaderProps {
  isLoading: boolean;
  message?: string;
  userName?: string;
  duration?: number; // in seconds
  onComplete?: () => void;
}

// Keywords that will float within the liquid
const dataKeywords = [
  'Skills',
  'Projects',
  'Experience',
  'Services',
  'Connections',
  'Expertise',
  'Portfolio',
  'Branding'
];

// Generates a random delay for staggered animation
const getRandomDelay = () => Math.random() * 0.8;

export function FluidLoader({
  isLoading,
  message = 'Building your portfolio...',
  userName = '',
  duration = 5,
  onComplete
}: FluidLoaderProps) {
  const [fillPercentage, setFillPercentage] = useState(0);
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keywordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start filling the liquid
      const stepTime = (duration * 1000) / 100;
      animationIntervalRef.current = setInterval(() => {
        setFillPercentage(prev => {
          if (prev >= 100) {
            if (animationIntervalRef.current) {
              clearInterval(animationIntervalRef.current);
            }
            setIsComplete(true);
            return 100;
          }
          return prev + 1;
        });
      }, stepTime);

      // Add keywords at random intervals
      keywordIntervalRef.current = setInterval(() => {
        if (visibleKeywords.length < dataKeywords.length) {
          const usedKeywords = new Set(visibleKeywords);
          const availableKeywords = dataKeywords.filter(k => !usedKeywords.has(k));
          
          if (availableKeywords.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableKeywords.length);
            const newKeyword = availableKeywords[randomIndex];
            setVisibleKeywords(prev => [...prev, newKeyword]);
          }
        }
      }, 400); // Add a new keyword roughly every 400ms
      
      return () => {
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        if (keywordIntervalRef.current) clearInterval(keywordIntervalRef.current);
      };
    }
  }, [isLoading, duration]);

  // When animation completes
  useEffect(() => {
    if (isComplete && onComplete) {
      const completionTimer = setTimeout(() => {
        onComplete();
      }, 800); // Small delay for the completion animation
      
      return () => clearTimeout(completionTimer);
    }
  }, [isComplete, onComplete]);

  if (!isLoading && !isComplete) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Container for the orb */}
        <div className="relative w-60 h-60 mb-8">
          {/* Outer orb with glow */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 shadow-[0_0_15px_5px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center">
            {/* Inner glow effect */}
            <div className="absolute inset-4 rounded-full bg-primary/5 blur-sm"></div>
            
            {/* Liquid fill container */}
            <div className="absolute inset-1 rounded-full overflow-hidden">
              {/* Liquid fill animation */}
              <motion.div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-primary/90 to-primary/60"
                style={{ 
                  height: `${fillPercentage}%`,
                  filter: 'url(#wavy)',
                  boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.5)'
                }}
                animate={{
                  height: `${fillPercentage}%`
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Wave effect at the top of the liquid */}
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-4 bg-primary/30"
                  animate={{ 
                    y: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* Floating keywords inside the liquid */}
              <AnimatePresence>
                {visibleKeywords.map((keyword, i) => (
                  <motion.div
                    key={keyword}
                    className="absolute text-white/90 font-medium px-2 py-1 text-sm rounded-md bg-white/10 backdrop-blur-sm"
                    initial={{ 
                      opacity: 0, 
                      y: 150,
                      x: 10 + (i % 3) * 30,
                      scale: 0.5
                    }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      y: -20,
                      scale: 1,
                      x: 10 + Math.sin(i) * 40
                    }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ 
                      duration: 3.5, 
                      delay: getRandomDelay(),
                      ease: "easeOut"
                    }}
                  >
                    {keyword}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* User name appears when mostly filled */}
              {fillPercentage > 75 && userName && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className="text-white font-bold text-xl z-10">{userName}</div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Completion flash effect */}
          {isComplete && (
            <motion.div 
              className="absolute inset-0 bg-primary rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.8 }}
            />
          )}
        </div>
        
        {/* Loading message */}
        <motion.p 
          className="text-white font-medium text-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isComplete ? "Brand calibrated. Welcome back!" : message}
        </motion.p>
        
        {/* Progress percentage */}
        <p className="text-white/70 mt-2 text-sm">{Math.floor(fillPercentage)}%</p>
        
        {/* Skip option for power users */}
        {!isComplete && (
          <button 
            onClick={onComplete} 
            className="mt-6 text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Tap to skip
          </button>
        )}
      </div>
      
      {/* SVG filter for wavy liquid effect */}
      <svg width="0" height="0">
        <filter id="wavy">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.01" 
            numOctaves="3" 
            result="noise" 
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale="5" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>
    </div>
  );
}