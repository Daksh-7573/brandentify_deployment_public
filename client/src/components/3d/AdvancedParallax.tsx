import React, { useRef, useEffect, useState } from 'react';
import { Brain, Target, Users, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface AdvancedParallaxProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
}

export default function AdvancedParallax({ containerRef, mousePosition }: AdvancedParallaxProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate dynamic camera and perspective values
  const getCameraTransform = () => {
    if (!containerRef.current || windowSize.width === 0) return {};
    
    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    
    const deltaX = (mousePosition.x - centerX) / centerX;
    const deltaY = (mousePosition.y - centerY) / centerY;
    
    // Perspective shifting - entire scene tilts based on cursor
    const perspectiveX = deltaX * 15; // degrees
    const perspectiveY = -deltaY * 10; // degrees
    const translateZ = deltaY * 50; // depth movement
    
    return {
      transform: `
        perspective(2000px) 
        rotateY(${perspectiveX}deg) 
        rotateX(${perspectiveY}deg) 
        translateZ(${translateZ}px)
      `,
      transformStyle: 'preserve-3d' as const
    };
  };

  // Calculate parallax offset for different layers
  const getLayerTransform = (depth: number, speed: number = 1) => {
    if (windowSize.width === 0) return {};
    
    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    
    const deltaX = (mousePosition.x - centerX) / centerX;
    const deltaY = (mousePosition.y - centerY) / centerY;
    
    // Multi-layer parallax with different speeds
    const parallaxX = deltaX * speed * depth;
    const parallaxY = deltaY * speed * depth;
    const parallaxZ = depth * 10 + (deltaY * depth * 2);
    const scrollOffset = scrollY * speed * 0.5;
    
    return {
      transform: `
        translate3d(${parallaxX}px, ${parallaxY - scrollOffset}px, ${parallaxZ}px)
        rotateY(${deltaX * speed * 2}deg)
        rotateX(${deltaY * speed * 1.5}deg)
      `,
      transformStyle: 'preserve-3d' as const
    };
  };

  const floatingElements = [
    { icon: Brain, depth: -200, speed: 0.8, color: 'text-blue-400', delay: 0 },
    { icon: Target, depth: -150, speed: 0.6, color: 'text-purple-400', delay: 0.5 },
    { icon: Users, depth: -100, speed: 0.4, color: 'text-green-400', delay: 1 },
    { icon: Zap, depth: -250, speed: 1.0, color: 'text-yellow-400', delay: 1.5 },
    { icon: Sparkles, depth: -180, speed: 0.7, color: 'text-pink-400', delay: 2 },
    { icon: ArrowRight, depth: -120, speed: 0.5, color: 'text-cyan-400', delay: 2.5 },
  ];

  return (
    <div 
      ref={parallaxRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={getCameraTransform()}
    >
      {/* Layer 1: Far Background (Slowest) */}
      <div 
        className="absolute inset-0 opacity-20"
        style={getLayerTransform(-400, 0.2)}
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-cyan-900/30"></div>
        {/* Large floating orbs */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`bg-orb-${i}`}
            className="absolute w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
              animation: `float 8s ease-in-out infinite ${i * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Layer 2: Mid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={getLayerTransform(-250, 0.4)}
      >
        {/* Geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`geo-${i}`}
            className="absolute w-8 h-8 border border-white/20 rotate-45"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animation: `spin 12s linear infinite ${i * 1.5}s`,
              transform: `rotateZ(45deg) scale(${0.5 + Math.random() * 0.5})`
            }}
          ></div>
        ))}
      </div>

      {/* Layer 3: Floating Icons */}
      <div 
        className="absolute inset-0 opacity-40"
        style={getLayerTransform(-150, 0.6)}
      >
        {floatingElements.map((element, i) => {
          const Icon = element.icon;
          return (
            <div
              key={`floating-icon-${i}`}
              className={`absolute ${element.color}`}
              style={{
                top: `${15 + (i * 15)}%`,
                left: `${20 + (i * 12)}%`,
                animation: `float 6s ease-in-out infinite ${element.delay}s`,
                ...getLayerTransform(element.depth, element.speed)
              }}
            >
              <Icon className="w-12 h-12 drop-shadow-lg" />
            </div>
          );
        })}
      </div>

      {/* Layer 4: Text Elements */}
      <div 
        className="absolute inset-0 opacity-25"
        style={getLayerTransform(-100, 0.8)}
      >
        {['AI', 'CAREER', 'GROWTH', 'SUCCESS', '3D'].map((text, i) => (
          <div
            key={`floating-text-${i}`}
            className="absolute text-6xl font-bold text-white/20 select-none"
            style={{
              top: `${10 + i * 18}%`,
              left: `${5 + i * 18}%`,
              animation: `float 10s ease-in-out infinite ${i * 2}s`,
              transform: `rotateY(${i * 15}deg) rotateZ(${i * 5}deg)`
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Layer 5: Near Foreground (Fastest) */}
      <div 
        className="absolute inset-0 opacity-60"
        style={getLayerTransform(-50, 1.2)}
      >
        {/* Particle trails */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-trail-${i}`}
            className="absolute w-1 h-20 bg-gradient-to-b from-cyan-400/50 to-transparent"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `particleTrail 4s linear infinite ${i * 0.3}s`,
              transform: `rotateZ(${Math.random() * 360}deg)`
            }}
          ></div>
        ))}
      </div>

      {/* Dynamic Depth Indicators */}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs font-mono pointer-events-none">
        <div>Depth Layers: 5</div>
        <div>Camera X: {mousePosition.x.toFixed(0)}</div>
        <div>Camera Y: {mousePosition.y.toFixed(0)}</div>
        <div>Scroll: {scrollY.toFixed(0)}</div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes particleTrail {
          0% { 
            opacity: 0; 
            transform: translateY(100vh) scale(0); 
          }
          10% { 
            opacity: 1; 
            transform: translateY(90vh) scale(1); 
          }
          90% { 
            opacity: 1; 
            transform: translateY(-10vh) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-20vh) scale(0); 
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotateZ(0deg); 
          }
          25% { 
            transform: translateY(-20px) rotateZ(5deg); 
          }
          50% { 
            transform: translateY(-10px) rotateZ(0deg); 
          }
          75% { 
            transform: translateY(-30px) rotateZ(-5deg); 
          }
        }
        
        @keyframes spin {
          0% { transform: rotateZ(45deg) rotateY(0deg); }
          100% { transform: rotateZ(45deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}