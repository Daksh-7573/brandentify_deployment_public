import React, { useRef, useEffect, useState } from 'react';

interface CSSParticleSystemProps {
  containerRef: React.RefObject<HTMLDivElement>;
  mousePosition: { x: number; y: number };
  particleCount?: number;
  colorScheme?: 'blue' | 'purple' | 'multi' | 'rainbow';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function CSSParticleSystem({ 
  containerRef, 
  mousePosition, 
  particleCount = 150, 
  colorScheme = 'multi' 
}: CSSParticleSystemProps) {
  const particlesRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const particlesArray = useRef<Particle[]>([]);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  
  // Color schemes
  const getParticleColor = (scheme: string, index: number) => {
    switch (scheme) {
      case 'blue':
        return `hsl(${200 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%)`;
      case 'purple':
        return `hsl(${280 + Math.random() * 40}, 80%, ${60 + Math.random() * 20}%)`;
      case 'rainbow':
        return `hsl(${(index * 137.5) % 360}, 80%, 60%)`;
      default: // multi
        const colors = [220, 260, 300, 200, 180];
        const baseHue = colors[Math.floor(Math.random() * colors.length)];
        return `hsl(${baseHue + Math.random() * 20}, 80%, ${60 + Math.random() * 20}%)`;
    }
  };

  // Initialize particles
  const initializeParticles = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    particlesArray.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 4,
      color: getParticleColor(colorScheme, i),
      opacity: 0.3 + Math.random() * 0.7,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 200
    }));
  };

  // Update particle positions and interactions
  const updateParticles = () => {
    if (!containerRef.current || !particlesRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = mousePosition.x - rect.left;
    const mouseY = mousePosition.y - rect.top;
    
    // Check if mouse moved significantly
    const mouseMoved = Math.abs(mouseX - lastMousePosition.current.x) > 5 || 
                      Math.abs(mouseY - lastMousePosition.current.y) > 5;
    
    if (mouseMoved) {
      lastMousePosition.current = { x: mouseX, y: mouseY };
    }
    
    particlesArray.current.forEach((particle, index) => {
      // Mouse interaction
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        const angle = Math.atan2(dy, dx);
        
        // Repulsion effect
        particle.vx -= Math.cos(angle) * force * 0.5;
        particle.vy -= Math.sin(angle) * force * 0.5;
        
        // Increase opacity when near mouse
        particle.opacity = Math.min(1, particle.opacity + force * 0.02);
      } else {
        // Fade back to normal opacity
        particle.opacity = Math.max(0.3, particle.opacity - 0.01);
      }
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Add random movement
      particle.vx += (Math.random() - 0.5) * 0.1;
      particle.vy += (Math.random() - 0.5) * 0.1;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = rect.width;
      if (particle.x > rect.width) particle.x = 0;
      if (particle.y < 0) particle.y = rect.height;
      if (particle.y > rect.height) particle.y = 0;
      
      // Update life
      particle.life++;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        particle.x = Math.random() * rect.width;
        particle.y = Math.random() * rect.height;
        particle.color = getParticleColor(colorScheme, index);
      }
      
      // Create/update DOM element
      const particleElement = particlesRef.current?.children[index] as HTMLDivElement;
      if (particleElement) {
        particleElement.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
        particleElement.style.opacity = particle.opacity.toString();
        particleElement.style.backgroundColor = particle.color;
        particleElement.style.width = `${particle.size}px`;
        particleElement.style.height = `${particle.size}px`;
      }
    });
    
    animationRef.current = requestAnimationFrame(updateParticles);
  };

  // Initialize on mount
  useEffect(() => {
    initializeParticles();
    updateParticles();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, colorScheme]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      initializeParticles();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div 
        ref={particlesRef}
        className="relative w-full h-full"
        style={{
          filter: 'blur(0.5px)',
          mixBlendMode: 'screen'
        }}
      >
        {Array.from({ length: particleCount }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full transform-gpu"
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              transition: 'background-color 0.3s ease',
              boxShadow: '0 0 6px currentColor'
            }}
          />
        ))}
      </div>
      
      {/* Particle trails effect */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: Math.floor(particleCount / 3) }, (_, i) => (
          <div
            key={`trail-${i}`}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Connecting lines between nearby particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`connection-${i}`}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="url(#gradient)"
            strokeWidth="0.5"
            opacity="0.3"
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS animations for particle effects */}
      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-2px) rotate(120deg); }
          66% { transform: translateY(2px) rotate(240deg); }
        }
        
        @keyframes particleGlow {
          0%, 100% { filter: brightness(1) blur(0.5px); }
          50% { filter: brightness(1.5) blur(1px); }
        }
        
        @keyframes connectionPulse {
          0%, 100% { stroke-opacity: 0.1; }
          50% { stroke-opacity: 0.6; }
        }
        
        .transform-gpu {
          transform: translateZ(0);
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}