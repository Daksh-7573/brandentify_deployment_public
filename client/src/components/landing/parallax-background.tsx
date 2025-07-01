import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ParallaxBackgroundProps {
  mousePosition: { x: number; y: number };
}

export default function ParallaxBackground({ mousePosition }: ParallaxBackgroundProps) {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { x, y } = mousePosition;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Multi-layer parallax effect
    if (layer1Ref.current) {
      gsap.to(layer1Ref.current, {
        x: deltaX * 30,
        y: deltaY * 30,
        duration: 0.5,
        ease: "power2.out"
      });
    }

    if (layer2Ref.current) {
      gsap.to(layer2Ref.current, {
        x: deltaX * 20,
        y: deltaY * 20,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    if (layer3Ref.current) {
      gsap.to(layer3Ref.current, {
        x: deltaX * 10,
        y: deltaY * 10,
        duration: 0.7,
        ease: "power2.out"
      });
    }

    // Dynamic gradient shift
    if (gradientRef.current) {
      const hue = Math.floor(220 + (deltaX * 40));
      const saturation = Math.floor(50 + Math.abs(deltaY * 30));
      
      gsap.to(gradientRef.current, {
        background: `linear-gradient(135deg, 
          hsl(${hue}, ${saturation}%, 15%) 0%, 
          hsl(${hue + 30}, ${saturation + 10}%, 10%) 50%, 
          hsl(${hue - 20}, ${saturation + 5}%, 8%) 100%)`,
        duration: 1,
        ease: "power2.out"
      });
    }
  }, [mousePosition]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Dynamic gradient background */}
      <div 
        ref={gradientRef}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(220, 50%, 15%) 0%, hsl(250, 60%, 10%) 50%, hsl(200, 55%, 8%) 100%)'
        }}
      />

      {/* Layer 3 - Furthest back */}
      <div 
        ref={layer3Ref}
        className="absolute inset-0 opacity-20"
      >
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Layer 2 - Middle */}
      <div 
        ref={layer2Ref}
        className="absolute inset-0 opacity-30"
      >
        <div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-xl" />
        <div className="absolute top-2/3 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-transparent rounded-full blur-lg" />
      </div>

      {/* Layer 1 - Closest */}
      <div 
        ref={layer1Ref}
        className="absolute inset-0 opacity-40"
      >
        <div className="absolute top-40 left-10 w-20 h-20 bg-gradient-to-br from-blue-300/30 to-transparent rounded-full blur-md" />
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-br from-purple-300/30 to-transparent rounded-full blur-md" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-cyan-300/30 to-transparent rounded-full blur-sm" />
      </div>

      {/* Animated geometric shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-4 h-4 border border-white rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-20 right-20 w-6 h-6 border border-blue-300 rotate-12 animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 right-1/3 w-5 h-5 border border-cyan-300 animate-ping" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}