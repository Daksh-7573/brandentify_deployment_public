import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Brain, MessageCircle } from 'lucide-react';

interface RobotInteractions {
  onEnter: boolean;
  onHover: boolean;
  onFeaturePoint: boolean;
  onCelebrate: boolean;
}

interface CSSAdaptiveRobotProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  interactions: RobotInteractions;
}

export default function CSSAdaptiveRobot({ containerRef, mousePosition, interactions }: CSSAdaptiveRobotProps) {
  const robotRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<HTMLDivElement>(null);
  const rightArmRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  
  const [speechMessage, setSpeechMessage] = useState('');
  const [showSpeech, setShowSpeech] = useState(false);
  const [robotMood, setRobotMood] = useState<'normal' | 'happy' | 'excited' | 'curious'>('normal');

  const careerTips = [
    "Ready to boost your career? Let's explore!",
    "Your next opportunity awaits!",
    "Building your brand starts here!",
    "Success is just one step away!",
    "Let's unlock your potential together!",
    "Your career journey begins now!",
    "Excellence is a habit, not an act!",
    "Dream big, achieve bigger!"
  ];

  // Calculate mouse direction relative to robot
  const getMouseDirection = useCallback(() => {
    if (!containerRef.current || !robotRef.current) return { x: 0, y: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const robotRect = robotRef.current.getBoundingClientRect();
    
    const robotCenterX = robotRect.left + robotRect.width / 2;
    const robotCenterY = robotRect.top + robotRect.height / 2;
    
    const deltaX = mousePosition.x - robotCenterX;
    const deltaY = mousePosition.y - robotCenterY;
    
    // Normalize to range -1 to 1
    const normalizedX = Math.max(-1, Math.min(1, deltaX / 200));
    const normalizedY = Math.max(-1, Math.min(1, deltaY / 200));
    
    return { x: normalizedX, y: normalizedY };
  }, [mousePosition, containerRef]);

  // Handle speech messages based on interactions
  useEffect(() => {
    let message = '';
    let mood: typeof robotMood = 'normal';
    
    if (interactions.onEnter) {
      message = "Welcome to Brandentifier! 👋";
      mood = 'happy';
    } else if (interactions.onFeaturePoint) {
      message = "This feature will accelerate your growth!";
      mood = 'excited';
    } else if (interactions.onCelebrate) {
      message = "Excellent choice! Let's get started! 🎉";
      mood = 'excited';
    } else if (interactions.onHover) {
      message = careerTips[Math.floor(Math.random() * careerTips.length)];
      mood = 'curious';
    }
    
    setRobotMood(mood);
    
    if (message) {
      setSpeechMessage(message);
      setShowSpeech(true);
      
      const timer = setTimeout(() => {
        setShowSpeech(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [interactions]);

  // Update robot animations based on mouse position and interactions
  useEffect(() => {
    const mouseDir = getMouseDirection();
    
    // Head and eye tracking
    if (headRef.current) {
      const headRotationY = mouseDir.x * 15; // degrees
      const headRotationX = -mouseDir.y * 10;
      
      headRef.current.style.transform = `
        rotateY(${headRotationY}deg) 
        rotateX(${headRotationX}deg)
        ${interactions.onHover ? 'rotateZ(10deg)' : ''}
      `;
    }
    
    // Eye tracking
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeOffsetX = mouseDir.x * 3;
      const eyeOffsetY = mouseDir.y * 3;
      
      leftEyeRef.current.style.transform = `translate(${eyeOffsetX}px, ${eyeOffsetY}px)`;
      rightEyeRef.current.style.transform = `translate(${eyeOffsetX}px, ${eyeOffsetY}px)`;
    }
    
    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (interactions.onEnter) {
        // Waving gesture
        rightArmRef.current.style.transform = 'rotateZ(-60deg)';
        rightArmRef.current.style.animation = 'wave 0.5s ease-in-out infinite alternate';
      } else if (interactions.onFeaturePoint) {
        // Pointing gesture
        rightArmRef.current.style.transform = `rotateZ(-45deg) rotateX(${mouseDir.y * 20}deg)`;
        rightArmRef.current.style.animation = 'none';
      } else if (interactions.onCelebrate) {
        // Thumbs up
        rightArmRef.current.style.transform = 'rotateZ(-90deg)';
        leftArmRef.current.style.transform = 'rotateZ(90deg)';
        rightArmRef.current.style.animation = 'celebrate 0.3s ease-in-out infinite alternate';
        leftArmRef.current.style.animation = 'celebrate 0.3s ease-in-out infinite alternate';
      } else {
        // Resting position
        rightArmRef.current.style.transform = 'rotateZ(20deg)';
        leftArmRef.current.style.transform = 'rotateZ(-20deg)';
        rightArmRef.current.style.animation = 'none';
        leftArmRef.current.style.animation = 'none';
      }
    }
    
    // Robot mood-based body animation
    if (robotRef.current) {
      let bodyAnimation = 'float 3s ease-in-out infinite';
      
      if (interactions.onEnter) {
        bodyAnimation += ', bounce 0.5s ease-in-out infinite';
      } else if (interactions.onCelebrate) {
        bodyAnimation += ', spin 1s ease-in-out infinite';
      }
      
      robotRef.current.style.animation = bodyAnimation;
    }
  }, [mousePosition, interactions, getMouseDirection]);

  return (
    <div className="relative w-20 h-32">
      {/* Speech Bubble */}
      {showSpeech && (
        <div 
          ref={speechBubbleRef}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg max-w-xs text-center text-xs font-medium z-50 speech-bubble animate-fade-in"
          style={{ minWidth: '200px' }}
        >
          {speechMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}
      
      {/* Robot Container */}
      <div 
        ref={robotRef}
        className="robot-container relative transform-gpu"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Robot Body */}
        <div className="robot-body w-12 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg relative mx-auto transform-gpu shadow-lg border border-blue-400">
          {/* Chest Panel */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-blue-300 rounded opacity-80"></div>
          
          {/* Power Indicator */}
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${robotMood === 'excited' ? 'bg-green-400 animate-pulse' : 'bg-blue-300'}`}></div>
        </div>
        
        {/* Robot Head */}
        <div 
          ref={headRef}
          className="robot-head absolute -top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg transform-gpu shadow-lg border border-blue-300"
          style={{ 
            transformOrigin: 'center bottom',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Eyes Container */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="eye-socket w-2 h-2 bg-gray-800 rounded-full relative overflow-hidden">
              <div 
                ref={leftEyeRef}
                className="eye w-1.5 h-1.5 bg-cyan-400 rounded-full transform-gpu"
                style={{ 
                  transition: 'transform 0.1s ease-out',
                  boxShadow: '0 0 4px cyan',
                  animation: robotMood === 'excited' ? 'eyeGlow 0.5s ease-in-out infinite alternate' : 'none'
                }}
              ></div>
            </div>
            <div className="eye-socket w-2 h-2 bg-gray-800 rounded-full relative overflow-hidden">
              <div 
                ref={rightEyeRef}
                className="eye w-1.5 h-1.5 bg-cyan-400 rounded-full transform-gpu"
                style={{ 
                  transition: 'transform 0.1s ease-out',
                  boxShadow: '0 0 4px cyan',
                  animation: robotMood === 'excited' ? 'eyeGlow 0.5s ease-in-out infinite alternate' : 'none'
                }}
              ></div>
            </div>
          </div>
          
          {/* Mouth */}
          <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded ${
            robotMood === 'happy' || robotMood === 'excited' ? 'bg-green-400' : 'bg-gray-300'
          }`}></div>
          
          {/* Antenna */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-blue-300 rounded-t-full">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Left Arm */}
        <div 
          ref={leftArmRef}
          className="robot-arm absolute top-2 -left-3 w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded transform-gpu"
          style={{ 
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Hand */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full border border-blue-300"></div>
        </div>
        
        {/* Right Arm */}
        <div 
          ref={rightArmRef}
          className="robot-arm absolute top-2 -right-3 w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded transform-gpu"
          style={{ 
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Hand */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full border border-blue-300"></div>
        </div>
        
        {/* Legs */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded"></div>
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded"></div>
        </div>
        
        {/* Feet */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-3 h-2 bg-blue-400 rounded border border-blue-300"></div>
          <div className="w-3 h-2 bg-blue-400 rounded border border-blue-300"></div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateY(0deg); }
          50% { transform: translateY(-8px) rotateY(5deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes wave {
          0% { transform: rotateZ(-60deg) rotateX(0deg); }
          100% { transform: rotateZ(-60deg) rotateX(-20deg); }
        }
        
        @keyframes celebrate {
          0% { transform: rotateZ(-90deg) translateY(0px); }
          100% { transform: rotateZ(-90deg) translateY(-2px); }
        }
        
        @keyframes eyeGlow {
          0% { box-shadow: 0 0 4px cyan, 0 0 8px cyan; }
          100% { box-shadow: 0 0 8px cyan, 0 0 16px cyan, 0 0 24px cyan; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0px) scale(1); }
        }
        
        .speech-bubble {
          animation: fade-in 0.3s ease-out;
        }
        
        .robot-container {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
    </div>
  );
}