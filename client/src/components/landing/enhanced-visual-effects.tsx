import React, { useEffect, useRef } from 'react';

interface EnhancedVisualEffectsProps {
  mousePosition: { x: number; y: number };
  isActive?: boolean;
}

export default function EnhancedVisualEffects({ mousePosition, isActive = true }: EnhancedVisualEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Shader-like effects using canvas
    const renderEffects = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamic spotlight following cursor
      const gradient = ctx.createRadialGradient(
        mousePosition.x, mousePosition.y, 0,
        mousePosition.x, mousePosition.y, 300
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      gradient.addColorStop(0.3, 'rgba(147, 51, 234, 0.08)');
      gradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.04)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient rim lighting on elements
      const rimGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      rimGradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      rimGradient.addColorStop(0.5, 'transparent');
      rimGradient.addColorStop(1, 'rgba(147, 51, 234, 0.05)');

      ctx.fillStyle = rimGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Neon glow effects with color shifting
      const time = Date.now() * 0.001;
      const glowIntensity = Math.sin(time) * 0.5 + 0.5;
      
      // Create multiple glow points
      const glowPoints = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, color: [59, 130, 246] },
        { x: canvas.width * 0.8, y: canvas.height * 0.7, color: [147, 51, 234] },
        { x: canvas.width * 0.6, y: canvas.height * 0.2, color: [236, 72, 153] },
        { x: canvas.width * 0.3, y: canvas.height * 0.8, color: [6, 182, 212] },
      ];

      glowPoints.forEach((point, index) => {
        const phaseOffset = index * Math.PI * 0.5;
        const intensity = Math.sin(time + phaseOffset) * 0.3 + 0.4;
        
        const glowGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, 150
        );
        
        glowGradient.addColorStop(0, `rgba(${point.color.join(',')}, ${intensity * 0.2})`);
        glowGradient.addColorStop(0.5, `rgba(${point.color.join(',')}, ${intensity * 0.1})`);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Chromatic aberration effect near cursor
      const aberrationDistance = 150;
      const distanceFromCursor = Math.sqrt(
        Math.pow(mousePosition.x - canvas.width / 2, 2) +
        Math.pow(mousePosition.y - canvas.height / 2, 2)
      );

      if (distanceFromCursor < aberrationDistance) {
        const aberrationStrength = (aberrationDistance - distanceFromCursor) / aberrationDistance;
        
        // Red channel offset
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 0, ${aberrationStrength * 0.03})`;
        ctx.fillRect(mousePosition.x - 100, mousePosition.y - 100, 200, 200);
        
        // Blue channel offset
        ctx.fillStyle = `rgba(0, 0, 255, ${aberrationStrength * 0.03})`;
        ctx.fillRect(mousePosition.x - 98, mousePosition.y - 98, 200, 200);
        
        ctx.globalCompositeOperation = 'source-over';
      }

      animationRef.current = requestAnimationFrame(renderEffects);
    };

    renderEffects();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition, isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Canvas for shader effects */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-5"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Holographic distortion effects */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Ripple effects */}
        <div 
          className="absolute w-96 h-96 border-2 border-blue-400/20 rounded-full animate-ping"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            animationDuration: '3s',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute w-64 h-64 border border-purple-400/15 rounded-full animate-ping"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
            animationDuration: '2s',
            animationDelay: '0.5s'
          }}
        />
        <div 
          className="absolute w-32 h-32 border border-cyan-400/25 rounded-full animate-ping"
          style={{
            left: mousePosition.x - 64,
            top: mousePosition.y - 64,
            animationDuration: '1.5s',
            animationDelay: '1s'
          }}
        />

        {/* Holographic scan lines */}
        <div 
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
          style={{
            top: `${(mousePosition.y + Date.now() * 0.1) % window.innerHeight}px`,
            transform: 'translateY(-50%)',
            animation: 'scanline 4s linear infinite'
          }}
        />
        <div 
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-400/15 to-transparent"
          style={{
            top: `${(mousePosition.y + Date.now() * 0.08 + 100) % window.innerHeight}px`,
            transform: 'translateY(-50%)',
            animation: 'scanline 3s linear infinite reverse'
          }}
        />

        {/* Dynamic grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
      </div>

      {/* CSS for additional effects */}
      <style>{`
        @keyframes scanline {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}