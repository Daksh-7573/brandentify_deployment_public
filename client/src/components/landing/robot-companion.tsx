import { useEffect, useRef, useState } from 'react';

interface RobotCompanionProps {
  mousePosition: { x: number; y: number };
  isHovering: boolean;
  currentSection: string;
}

export default function RobotCompanion({ mousePosition, isHovering, currentSection }: RobotCompanionProps) {
  const robotRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const [currentMessage, setCurrentMessage] = useState("Hi there! Ready to boost your career? 🚀");
  const [isVisible, setIsVisible] = useState(false);

  const messages = {
    default: "Hi there! Ready to boost your career? 🚀",
    features: "These features are pretty cool, right? 😎",
    career: "I love helping with career advice! 💡",
    mentorship: "AI mentorship is my specialty! 🤖",
    networking: "Let's build your professional network! 🤝",
    cta: "Come on, let's get started together! ⭐"
  };

  useEffect(() => {
    // Robot entrance animation
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (!robotRef.current || !eyesRef.current) return;

    // Follow cursor with eyes and slight body tilt
    const robot = robotRef.current;
    const eyes = eyesRef.current;
    const body = bodyRef.current;

    const rect = robot.getBoundingClientRect();
    const robotCenterX = rect.left + rect.width / 2;
    const robotCenterY = rect.top + rect.height / 2;

    const deltaX = mousePosition.x - robotCenterX;
    const deltaY = mousePosition.y - robotCenterY;

    // Eyes follow cursor
    const eyeMovementX = Math.max(-8, Math.min(8, deltaX * 0.02));
    const eyeMovementY = Math.max(-6, Math.min(6, deltaY * 0.02));

    // Body tilts slightly toward cursor
    const bodyTilt = Math.max(-5, Math.min(5, deltaX * 0.01));

    // Use CSS transforms instead of GSAP
    if (eyes) {
      eyes.style.transform = `translate(${eyeMovementX}px, ${eyeMovementY}px)`;
      eyes.style.transition = 'transform 0.3s ease-out';
    }

    if (body) {
      body.style.transform = `rotate(${bodyTilt}deg)`;
      body.style.transition = 'transform 0.5s ease-out';
    }
  }, [mousePosition]);

  useEffect(() => {
    // Change message based on current section
    const newMessage = messages[currentSection as keyof typeof messages] || messages.default;
    if (newMessage !== currentMessage) {
      setCurrentMessage(newMessage);
      
      // Animate speech bubble with CSS
      if (speechBubbleRef.current) {
        speechBubbleRef.current.style.transform = 'scale(1.05)';
        speechBubbleRef.current.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
          if (speechBubbleRef.current) {
            speechBubbleRef.current.style.transform = 'scale(1)';
          }
        }, 500);
      }
    }
  }, [currentSection]);

  useEffect(() => {
    // Hover animations
    if (robotRef.current && bodyRef.current) {
      if (isHovering) {
        bodyRef.current.style.transform = 'scale(1.1) translateY(-10px)';
        bodyRef.current.style.transition = 'transform 0.3s ease';
      } else {
        bodyRef.current.style.transform = 'scale(1) translateY(0px)';
        bodyRef.current.style.transition = 'transform 0.3s ease';
      }
    }
  }, [isHovering]);

  if (!isVisible) return null;

  return (
    <div 
      ref={robotRef}
      className="fixed bottom-8 right-8 z-50 pointer-events-none select-none"
      style={{ 
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Speech Bubble */}
      <div 
        ref={speechBubbleRef}
        className="absolute bottom-full right-0 mb-4 mr-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-2xl shadow-lg max-w-xs text-sm font-medium border border-white/20"
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 85% 75%, 85% 100%, 75% 75%, 0% 75%)'
        }}
      >
        {currentMessage}
      </div>

      {/* Robot Body */}
      <div 
        ref={bodyRef}
        className="relative w-20 h-24 transform-gpu"
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}
      >
        {/* Robot Head */}
        <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg">
          {/* Eyes Container */}
          <div 
            ref={eyesRef}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
          >
            {/* Left Eye */}
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
            {/* Right Eye */}
            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* Mouth */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full opacity-80"></div>

          {/* Antenna */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300 rounded-full">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Robot Body */}
        <div className="relative w-12 h-8 mx-auto mt-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg">
          {/* Chest Panel */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-500 rounded opacity-80"></div>
          {/* Status Lights */}
          <div className="absolute bottom-1 left-2 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    </div>
  );
}