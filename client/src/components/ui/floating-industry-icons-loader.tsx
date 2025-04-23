import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Bot, FolderOpen, Code, Mic, Rocket, Star, Database, Zap, PenTool } from 'lucide-react';

interface FloatingIconsLoaderProps {
  isLoading: boolean;
  loadingMessage?: string;
  onComplete?: () => void;
}

type Icon = {
  id: number;
  component: React.ReactNode;
  initialPosition: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  color: string;
  delay: number;
}

export function FloatingIndustryIconsLoader({ 
  isLoading, 
  loadingMessage = "All pieces of your professional universe are aligning...",
  onComplete 
}: FloatingIconsLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessage);
  const [icons, setIcons] = useState<Icon[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Messages to cycle through during loading
  const messages = [
    "All pieces of your professional universe are aligning...",
    "Musk is mapping your ecosystem...",
    "You are now entering your personalized Brandentifier space..."
  ];
  
  // Generate initial icons with random positions
  useEffect(() => {
    if (isLoading) {
      // Define the icons to use in our animation
      const industryIcons: Icon[] = [
        {
          id: 1,
          component: <GraduationCap className="h-8 w-8" />,
          initialPosition: { x: -120, y: -80, z: -10 },
          rotation: { x: 5, y: 10, z: 0 },
          scale: 1.2,
          color: 'rgba(129, 140, 248, 0.8)', // indigo
          delay: 0.2
        },
        {
          id: 2,
          component: <Briefcase className="h-8 w-8" />,
          initialPosition: { x: 150, y: 60, z: 20 },
          rotation: { x: -5, y: -10, z: 5 },
          scale: 1.3,
          color: 'rgba(147, 197, 253, 0.8)', // blue
          delay: 0.5
        },
        {
          id: 3,
          component: <Bot className="h-10 w-10" />,
          initialPosition: { x: 20, y: -120, z: 15 },
          rotation: { x: 10, y: 5, z: -5 },
          scale: 1.5,
          color: 'rgba(167, 139, 250, 0.8)', // purple
          delay: 0.1
        },
        {
          id: 4,
          component: <FolderOpen className="h-8 w-8" />,
          initialPosition: { x: -80, y: 100, z: -5 },
          rotation: { x: -8, y: 12, z: 3 },
          scale: 1.1,
          color: 'rgba(252, 165, 165, 0.8)', // red
          delay: 0.7
        },
        {
          id: 5,
          component: <Code className="h-8 w-8" />,
          initialPosition: { x: -180, y: -30, z: 10 },
          rotation: { x: 12, y: -8, z: -3 },
          scale: 1.2,
          color: 'rgba(134, 239, 172, 0.8)', // green
          delay: 0.4
        },
        {
          id: 6,
          component: <Mic className="h-7 w-7" />,
          initialPosition: { x: 100, y: -90, z: -15 },
          rotation: { x: -10, y: -5, z: 8 },
          scale: 1.0,
          color: 'rgba(253, 186, 116, 0.8)', // orange
          delay: 0.3
        },
        {
          id: 7,
          component: <Rocket className="h-9 w-9" />,
          initialPosition: { x: 200, y: 10, z: 5 },
          rotation: { x: 5, y: 15, z: -5 },
          scale: 1.4,
          color: 'rgba(252, 211, 77, 0.8)', // yellow
          delay: 0.6
        },
        {
          id: 8,
          component: <Database className="h-7 w-7" />,
          initialPosition: { x: 40, y: 130, z: -20 },
          rotation: { x: -12, y: 5, z: 10 },
          scale: 1.1,
          color: 'rgba(125, 211, 252, 0.8)', // sky blue
          delay: 0.35
        },
        {
          id: 9,
          component: <PenTool className="h-8 w-8" />,
          initialPosition: { x: -120, y: 50, z: 15 },
          rotation: { x: 8, y: -12, z: -8 },
          scale: 1.2,
          color: 'rgba(216, 180, 254, 0.8)', // violet
          delay: 0.55
        },
        {
          id: 10,
          component: <Zap className="h-8 w-8" />,
          initialPosition: { x: 160, y: -50, z: -10 },
          rotation: { x: -5, y: 8, z: 12 },
          scale: 1.3,
          color: 'rgba(165, 243, 252, 0.8)', // cyan
          delay: 0.25
        }
      ];
      
      setIcons(industryIcons);
      
      // Simulate loading progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 2;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Call onComplete after a short delay for the final animation
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1000);
        }
        setProgress(currentProgress);
      }, 100);
      
      // Cycle through messages
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setCurrentMessage(messages[messageIndex]);
      }, 3000);
      
      // Clean up intervals
      return () => {
        clearInterval(interval);
        clearInterval(messageInterval);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isLoading, onComplete]);
  
  // Calculate final positions for the snap effect
  const getFinalPosition = (index: number, totalIcons: number) => {
    const angleStep = (2 * Math.PI) / totalIcons;
    const angle = index * angleStep;
    const radius = 60;
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: 0
    };
  };
  
  // Different stages of animation based on progress
  const getIconVariants = (icon: Icon, index: number) => {
    // Random floating for initial stage (0-30%)
    if (progress < 30) {
      return {
        initial: {
          x: icon.initialPosition.x,
          y: icon.initialPosition.y,
          scale: icon.scale,
          opacity: 0
        },
        animate: {
          x: icon.initialPosition.x + Math.sin(Date.now() * 0.001 + index) * 20,
          y: icon.initialPosition.y + Math.cos(Date.now() * 0.002 + index) * 20,
          rotateX: icon.rotation.x + Math.sin(Date.now() * 0.0015) * 10,
          rotateY: icon.rotation.y + Math.cos(Date.now() * 0.001) * 10,
          scale: icon.scale,
          opacity: 0.8,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 15,
            delay: icon.delay
          }
        }
      };
    }
    // Middle stage - drifting toward center (30-90%)
    else if (progress < 90) {
      const finalPosition = getFinalPosition(index, icons.length);
      const mix = (progress - 30) / 60; // 0 to 1 as we progress from 30% to 90%
      
      return {
        initial: {
          x: icon.initialPosition.x,
          y: icon.initialPosition.y,
          scale: icon.scale,
          opacity: 0.8
        },
        animate: {
          x: icon.initialPosition.x * (1 - mix) + finalPosition.x * mix,
          y: icon.initialPosition.y * (1 - mix) + finalPosition.y * mix,
          rotateX: icon.rotation.x * (1 - mix),
          rotateY: icon.rotation.y * (1 - mix),
          scale: icon.scale,
          opacity: 0.8,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
          }
        }
      };
    }
    // Final snap animation (90-100%)
    else {
      const finalPosition = getFinalPosition(index, icons.length);
      
      return {
        initial: {
          opacity: 0.8
        },
        animate: {
          x: finalPosition.x,
          y: finalPosition.y,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
          opacity: progress === 100 ? [0.8, 1, 0] : 0.8,
          transition: {
            type: "spring",
            stiffness: 200,
            damping: 15,
            opacity: {
              duration: 0.5,
              times: [0, 0.7, 1]
            }
          }
        }
      };
    }
  };
  
  // When progress reaches 100%, show a final pulse effect
  const pulseVariants = {
    initial: {
      scale: 0,
      opacity: 0
    },
    animate: {
      scale: [0, 1.5, 0],
      opacity: [0, 0.8, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };
  
  // Only render when loading
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div 
        ref={containerRef}
        className="relative w-80 h-80 flex items-center justify-center"
      >
        {/* Floating icons */}
        {icons.map((icon, index) => {
          const variants = getIconVariants(icon, index);
          
          return (
            <motion.div
              key={icon.id}
              className="absolute transform-gpu"
              style={{ 
                color: icon.color,
                filter: `drop-shadow(0 0 8px ${icon.color})`,
                perspective: "1000px"
              }}
              initial="initial"
              animate="animate"
              variants={variants}
            >
              {icon.component}
            </motion.div>
          );
        })}
        
        {/* Center pulse effect when completed */}
        {progress >= 100 && (
          <motion.div
            className="absolute rounded-full bg-white opacity-30"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
          />
        )}
        
        {/* Loading message */}
        <div className="absolute bottom-0 translate-y-full pt-12 text-center">
          <motion.p 
            className="text-white/90 text-lg font-medium mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {currentMessage}
          </motion.p>
          
          {/* Progress bar */}
          <motion.div 
            className="w-full h-1 bg-white/20 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}