import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 15;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute pointer-events-none';
      
      // Random particle type
      const type = Math.random();
      if (type < 0.3) {
        // Geometric shapes
        particle.className += ' w-3 h-3 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full';
      } else if (type < 0.6) {
        // Squares
        particle.className += ' w-2 h-2 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rotate-45';
      } else {
        // Triangles
        particle.className += ' w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-purple-400/30';
      }

      // Random position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';

      container.appendChild(particle);
      particlesRef.current.push(particle);

      // Animate particle
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2
      });

      // Floating animation
      gsap.to(particle, {
        y: "-=50",
        duration: Math.random() * 3 + 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2
      });

      // Rotation animation
      gsap.to(particle, {
        rotation: 360,
        duration: Math.random() * 10 + 5,
        ease: "none",
        repeat: -1
      });

      // Opacity pulse
      gsap.to(particle, {
        opacity: "+=0.3",
        duration: Math.random() * 2 + 1,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: Math.random()
      });
    }

    return () => {
      particlesRef.current.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particlesRef.current = [];
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}