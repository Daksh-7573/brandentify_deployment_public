import React, { useState, useEffect, useRef } from 'react';

interface RobotCompanionProps {
  mousePosition: { x: number; y: number };
  currentSection?: string;
}

export default function AdvancedRobotCompanion({ mousePosition, currentSection }: RobotCompanionProps) {
  const [robotState, setRobotState] = useState<'idle' | 'curious' | 'excited' | 'pointing' | 'celebrating'>('idle');
  const [speechBubble, setSpeechBubble] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const robotRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Dynamic speech based on user interaction
  const speeches = {
    welcome: "Hey there! Ready to supercharge your career? 🚀",
    features: "Check out these amazing features! Each one is designed to boost your success! ✨",
    hovering: "That's a great choice! This feature will definitely help you! 👍",
    excited: "Wow! You're really exploring! I love your enthusiasm! 🎉",
    goodbye: "Thanks for visiting! Your career journey starts here! 💫"
  };

  // Robot entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setSpeechBubble(speeches.welcome);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cursor tracking for eyes
  useEffect(() => {
    if (robotRef.current) {
      const rect = robotRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height / 2;
      
      const deltaX = mousePosition.x - robotCenterX;
      const deltaY = mousePosition.y - robotCenterY;
      
      // Limit eye movement
      const maxMove = 8;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normalizedX = distance > 0 ? (deltaX / distance) * Math.min(distance / 100, maxMove) : 0;
      const normalizedY = distance > 0 ? (deltaY / distance) * Math.min(distance / 100, maxMove) : 0;
      
      setEyePosition({ x: normalizedX, y: normalizedY });
    }
  }, [mousePosition]);

  // Dynamic state changes based on user activity
  useEffect(() => {
    const activity = Math.abs(mousePosition.x) + Math.abs(mousePosition.y);
    
    if (activity > 1000) {
      setRobotState('excited');
      setSpeechBubble(speeches.excited);
    } else if (activity > 500) {
      setRobotState('curious');
      setSpeechBubble(speeches.hovering);
    } else {
      setRobotState('idle');
    }
  }, [mousePosition]);

  // Section-based responses
  useEffect(() => {
    if (currentSection === 'features') {
      setRobotState('pointing');
      setSpeechBubble(speeches.features);
    }
  }, [currentSection]);

  const getRobotAnimation = () => {
    switch (robotState) {
      case 'excited':
        return 'animate-bounce robot-excited';
      case 'curious':
        return 'robot-curious';
      case 'pointing':
        return 'robot-pointing';
      case 'celebrating':
        return 'animate-pulse robot-celebrating';
      default:
        return 'robot-idle';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 select-none">
      {/* Dynamic Speech Bubble */}
      <div className={`absolute bottom-full right-0 mb-6 mr-4 transition-all duration-500 ${
        speechBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="relative bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-3xl shadow-2xl max-w-xs border border-white/20">
          <p className="text-sm font-medium">{speechBubble}</p>
          {/* Speech bubble tail */}
          <div className="absolute bottom-0 right-8 transform translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500/90"></div>
          </div>
          
          {/* Animated typing indicator */}
          <div className="absolute bottom-2 right-3 flex space-x-1">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>
      </div>

      {/* Advanced 3D Robot */}
      <div 
        ref={robotRef}
        className={`relative transition-all duration-700 transform-gpu ${getRobotAnimation()}`}
        style={{ 
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.01}deg) rotateY(${mousePosition.x * 0.01}deg)`,
        }}
      >
        {/* Robot Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl animate-pulse"></div>
        
        {/* Robot Body Container */}
        <div className="relative w-28 h-32">
          {/* Robot Head */}
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 via-cyan-400 to-purple-500 rounded-3xl shadow-2xl border-2 border-white/30">
            {/* Face Panel */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-2xl border border-white/30"></div>
            
            {/* Dynamic Eyes */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 flex space-x-3">
              <div className="relative w-4 h-4 bg-white rounded-full shadow-inner">
                <div 
                  className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full transition-transform duration-200"
                  style={{ 
                    transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                    top: '50%',
                    left: '50%',
                    marginTop: '-5px',
                    marginLeft: '-5px'
                  }}
                >
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="relative w-4 h-4 bg-white rounded-full shadow-inner">
                <div 
                  className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full transition-transform duration-200"
                  style={{ 
                    transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                    top: '50%',
                    left: '50%',
                    marginTop: '-5px',
                    marginLeft: '-5px'
                  }}
                >
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Dynamic Mouth */}
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
              robotState === 'excited' ? 'w-8 h-2 bg-yellow-400' : 
              robotState === 'curious' ? 'w-6 h-1 bg-blue-300' :
              'w-7 h-1 bg-white'
            } rounded-full opacity-80`}></div>

            {/* Antenna with Activity Indicator */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gray-300 rounded-full">
              <div className={`absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full transition-all duration-300 ${
                robotState === 'excited' ? 'bg-red-500 animate-ping' :
                robotState === 'curious' ? 'bg-yellow-400 animate-pulse' :
                'bg-green-400'
              }`}></div>
            </div>

            {/* Side Panels */}
            <div className="absolute top-2 -left-1 w-2 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-l opacity-80"></div>
            <div className="absolute top-2 -right-1 w-2 h-4 bg-gradient-to-l from-gray-400 to-gray-500 rounded-r opacity-80"></div>
          </div>

          {/* Robot Body */}
          <div className="relative w-16 h-12 mx-auto mt-1 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-2xl shadow-lg border border-white/30">
            {/* Chest Panel */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-90 border border-white/20"></div>
            
            {/* Status Lights */}
            <div className="absolute bottom-2 left-3 flex space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Robot Arms (when pointing) */}
          {robotState === 'pointing' && (
            <div className="absolute top-8 -left-4 w-8 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transform rotate-45 origin-left animate-pulse"></div>
          )}

          {/* Floating Particles around Robot */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute -top-4 right-2 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-4 -right-3 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-2 -left-3 w-1 h-1 bg-yellow-400/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
      </div>

      {/* Robot Audio Visualization (optional) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2 flex space-x-1 opacity-60">
        <div className="w-1 h-8 bg-gradient-to-t from-blue-400 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-1 h-6 bg-gradient-to-t from-purple-400 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-10 bg-gradient-to-t from-cyan-400 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-7 bg-gradient-to-t from-blue-400 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-1 h-9 bg-gradient-to-t from-purple-400 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}