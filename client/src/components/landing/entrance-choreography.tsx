import React, { useEffect, useState, useRef } from 'react';

interface EntranceChoreographyProps {
  onComplete?: () => void;
}

export default function EntranceChoreography({ onComplete }: EntranceChoreographyProps) {
  const [stage, setStage] = useState<'intro' | 'robot-entrance' | 'elements-cascade' | 'complete'>('intro');
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Intro effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 2: Robot flies in
      setStage('robot-entrance');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 3: Elements cascade into place
      setStage('elements-cascade');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 4: Complete
      setStage('complete');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsVisible(false);
      onComplete?.();
    };

    sequence();
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${
        stage === 'complete' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Stage 1: Intro particle burst */}
      {stage === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Central particle burst */}
          <div className="relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{
                  animation: `particleBurst 1.5s ease-out forwards`,
                  animationDelay: `${i * 0.05}s`,
                  transform: `rotate(${i * 18}deg) translateX(0px)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: Robot entrance */}
      {stage === 'robot-entrance' && (
        <div className="absolute bottom-8 right-8">
          <div 
            className="transform-gpu"
            style={{
              animation: 'robotFlyIn 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
            }}
          >
            {/* Robot preview */}
            <div className="relative w-28 h-32">
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl shadow-2xl animate-bounce">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Rocket trail effect */}
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-t from-orange-400 to-transparent rounded-full"
              style={{
                height: '100px',
                animation: 'rocketTrail 1.5s ease-out forwards'
              }}
            />
          </div>
        </div>
      )}

      {/* Stage 3: Elements cascade */}
      {stage === 'elements-cascade' && (
        <div className="absolute inset-0">
          {/* Hero text cascade */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              className="text-6xl font-bold text-white opacity-0"
              style={{
                animation: 'cascadeIn 0.8s ease-out 0.2s forwards'
              }}
            >
              Welcome!
            </div>
          </div>

          {/* Feature cards cascade */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute opacity-0"
              style={{
                top: `${30 + i * 8}%`,
                left: `${20 + (i % 3) * 20}%`,
                animation: `cascadeIn 0.6s ease-out ${0.5 + i * 0.1}s forwards`
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="w-6 h-6 bg-white/60 rounded"></div>
              </div>
            </div>
          ))}

          {/* Sparkle effects */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl opacity-0"
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                animation: `sparkleIn 1s ease-out ${1 + i * 0.1}s forwards`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}


    </div>
  );
}