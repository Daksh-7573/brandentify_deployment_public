import React, { useEffect, useRef, useState } from 'react';

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
  type: 'orb' | 'triangle' | 'square' | 'star' | 'sparkle';
}

interface AdvancedParticleSystemProps {
  mousePosition: { x: number; y: number };
  isActive?: boolean;
}

export default function AdvancedParticleSystem({ mousePosition, isActive = true }: AdvancedParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cursorTrail, setCursorTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);
  const trailIdRef = useRef(0);

  // Colors for different particle types
  const colors = [
    'rgba(59, 130, 246, 0.8)',    // Blue
    'rgba(147, 51, 234, 0.8)',    // Purple
    'rgba(236, 72, 153, 0.8)',    // Pink
    'rgba(34, 197, 94, 0.8)',     // Green
    'rgba(251, 191, 36, 0.8)',    // Yellow
    'rgba(6, 182, 212, 0.8)',     // Cyan
  ];

  // Create new particle
  const createParticle = (x?: number, y?: number): Particle => {
    const particleTypes: Particle['type'][] = ['orb', 'triangle', 'square', 'star', 'sparkle'];
    
    return {
      id: particleIdRef.current++,
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: Math.random() * 200 + 100,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)]
    };
  };

  // Initialize particles
  useEffect(() => {
    if (!isActive) return;

    const initialParticles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      initialParticles.push(createParticle());
    }
    setParticles(initialParticles);
  }, [isActive]);

  // Cursor trail effect
  useEffect(() => {
    if (!isActive) return;

    const newTrailPoint = {
      x: mousePosition.x,
      y: mousePosition.y,
      id: trailIdRef.current++
    };

    setCursorTrail(prev => {
      const newTrail = [newTrailPoint, ...prev].slice(0, 8);
      return newTrail;
    });

    // Create sparkle particles at cursor
    if (Math.random() < 0.3) {
      setParticles(prev => [
        ...prev,
        createParticle(
          mousePosition.x + (Math.random() - 0.5) * 50,
          mousePosition.y + (Math.random() - 0.5) * 50
        )
      ].slice(-50)); // Limit total particles
    }
  }, [mousePosition, isActive]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      setParticles(prev => {
        return prev
          .map(particle => {
            // Update position
            const newX = particle.x + particle.vx;
            const newY = particle.y + particle.vy;
            
            // Bounce off edges
            let vx = particle.vx;
            let vy = particle.vy;
            
            if (newX <= 0 || newX >= window.innerWidth) vx *= -0.8;
            if (newY <= 0 || newY >= window.innerHeight) vy *= -0.8;

            // Mouse attraction
            const dx = mousePosition.x - newX;
            const dy = mousePosition.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              const force = (150 - distance) / 150 * 0.01;
              vx += dx * force;
              vy += dy * force;
            }

            // Add some randomness
            vx += (Math.random() - 0.5) * 0.02;
            vy += (Math.random() - 0.5) * 0.02;

            // Damping
            vx *= 0.99;
            vy *= 0.99;

            return {
              ...particle,
              x: Math.max(0, Math.min(window.innerWidth, newX)),
              y: Math.max(0, Math.min(window.innerHeight, newY)),
              vx,
              vy,
              life: particle.life + 1,
              opacity: particle.opacity * (1 - particle.life / particle.maxLife)
            };
          })
          .filter(particle => particle.life < particle.maxLife && particle.opacity > 0.01);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition, isActive]);

  // Get particle shape
  const getParticleShape = (particle: Particle) => {
    const style = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      pointerEvents: 'none' as const,
      transform: `translate(-50%, -50%) rotate(${particle.life * 2}deg)`,
      transition: 'opacity 0.1s ease',
    };

    switch (particle.type) {
      case 'orb':
        return (
          <div
            key={particle.id}
            style={{
              ...style,
              background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(1px)',
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        );
      
      case 'triangle':
        return (
          <div
            key={particle.id}
            style={{
              ...style,
              width: 0,
              height: 0,
              borderLeft: `${particle.size/2}px solid transparent`,
              borderRight: `${particle.size/2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          />
        );
      
      case 'square':
        return (
          <div
            key={particle.id}
            style={{
              ...style,
              backgroundColor: particle.color,
              borderRadius: '2px',
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          />
        );
      
      case 'star':
        return (
          <div
            key={particle.id}
            style={{
              ...style,
              fontSize: particle.size,
              color: particle.color,
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          >
            ✦
          </div>
        );
      
      case 'sparkle':
        return (
          <div
            key={particle.id}
            style={{
              ...style,
              fontSize: particle.size,
              color: particle.color,
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
            }}
          >
            ✨
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Cursor Trail */}
      {cursorTrail.map((point, index) => (
        <div
          key={point.id}
          className="absolute w-4 h-4 rounded-full"
          style={{
            left: point.x,
            top: point.y,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, rgba(59, 130, 246, ${(8 - index) / 8 * 0.6}) 0%, transparent 70%)`,
            width: `${16 - index * 2}px`,
            height: `${16 - index * 2}px`,
            transition: 'all 0.1s ease',
          }}
        />
      ))}

      {/* Dynamic Particles */}
      {particles.map(particle => getParticleShape(particle))}

      {/* Ambient Floating Elements */}
      <div className="absolute top-20 left-20 w-6 h-6">
        <div className="w-full h-full border-2 border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="absolute top-40 right-32 w-8 h-8">
        <div className="w-full h-full border border-purple-400/40 rotate-45 animate-pulse">
          <div className="absolute inset-1 bg-gradient-to-br from-purple-400/30 to-transparent"></div>
        </div>
      </div>

      <div className="absolute bottom-32 left-1/3 w-4 h-4">
        <div className="w-full h-full bg-gradient-to-r from-cyan-400/40 to-pink-400/40 rounded-full animate-ping"></div>
      </div>

      <div className="absolute top-1/2 right-20 w-5 h-5">
        <div className="w-full h-full border-2 border-yellow-400/30 rounded-lg animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="absolute inset-1 bg-yellow-400/20 rounded"></div>
        </div>
      </div>

      {/* Dynamic Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
    </div>
  );
}