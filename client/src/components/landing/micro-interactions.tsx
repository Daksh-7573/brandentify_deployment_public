import React, { useEffect, useRef, useState } from 'react';

interface MicroInteractionsProps {
  mousePosition: { x: number; y: number };
  isActive?: boolean;
}

interface InteractionEffect {
  id: number;
  x: number;
  y: number;
  type: 'click' | 'hover' | 'celebration';
  timestamp: number;
}

export default function MicroInteractions({ mousePosition, isActive = true }: MicroInteractionsProps) {
  const [effects, setEffects] = useState<InteractionEffect[]>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const effectIdRef = useRef(0);

  // Add click effect
  const addEffect = (x: number, y: number, type: InteractionEffect['type']) => {
    const newEffect: InteractionEffect = {
      id: effectIdRef.current++,
      x,
      y,
      type,
      timestamp: Date.now()
    };
    
    setEffects(prev => [...prev, newEffect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 2000);
  };

  // Mouse event handlers
  useEffect(() => {
    if (!isActive) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      addEffect(e.clientX, e.clientY, 'click');
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        addEffect(mousePosition.x, mousePosition.y, 'celebration');
      }
    };

    // Random celebration effects
    const celebrationInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        addEffect(x, y, 'celebration');
      }
    }, 5000);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(celebrationInterval);
    };
  }, [mousePosition, isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Cursor effects */}
      <div 
        className="absolute w-8 h-8 transition-all duration-100 ease-out"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: `scale(${isMouseDown ? 1.5 : 1})`,
        }}
      >
        {/* Custom cursor ring */}
        <div className="w-full h-full border-2 border-blue-400/50 rounded-full animate-pulse">
          <div className="w-full h-full border border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Cursor trail dots */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
            style={{
              left: `${8 + Math.cos(Date.now() * 0.01 + i) * 12}px`,
              top: `${8 + Math.sin(Date.now() * 0.01 + i) * 12}px`,
              animationDelay: `${i * 0.1}s`,
              opacity: 1 - i * 0.2
            }}
          />
        ))}
      </div>

      {/* Interaction effects */}
      {effects.map(effect => (
        <div
          key={effect.id}
          className="absolute pointer-events-none"
          style={{
            left: effect.x,
            top: effect.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {effect.type === 'click' && (
            <div className="animate-ping">
              <div className="w-8 h-8 border-2 border-blue-400/80 rounded-full">
                <div className="w-full h-full border border-purple-400/60 rounded-full">
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
          
          {effect.type === 'hover' && (
            <div className="animate-pulse">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400/60 to-blue-400/60 rounded-full blur-sm"></div>
            </div>
          )}
          
          {effect.type === 'celebration' && (
            <div className="relative">
              {/* Confetti burst */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#3b82f6', '#9333ea', '#ec4899', '#06b6d4'][i % 4],
                    animation: `confetti 1.5s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                    transform: `rotate(${i * 45}deg)`
                  }}
                />
              ))}
              
              {/* Central sparkle */}
              <div className="text-2xl animate-spin" style={{ animationDuration: '0.5s' }}>
                ✨
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Screen shake effect for celebrations */}
      {effects.some(e => e.type === 'celebration') && (
        <div className="animate-pulse fixed inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      )}

      {/* Ambient micro-particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Hidden easter eggs */}
      <div 
        className="absolute opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        style={{ top: '10px', right: '10px' }}
        onClick={() => addEffect(mousePosition.x, mousePosition.y, 'celebration')}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
          🎉
        </div>
      </div>
    </div>
  );
}