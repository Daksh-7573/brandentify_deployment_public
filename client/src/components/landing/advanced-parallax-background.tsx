import React, { useEffect, useRef } from 'react';

interface AdvancedParallaxBackgroundProps {
  mousePosition: { x: number; y: number };
}

export default function AdvancedParallaxBackground({ mousePosition }: AdvancedParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate parallax offset based on mouse position
  const getParallaxTransform = (depth: number, mouseX: number, mouseY: number) => {
    const offsetX = (mouseX - window.innerWidth / 2) * depth * 0.01;
    const offsetY = (mouseY - window.innerHeight / 2) * depth * 0.01;
    const rotateX = (mouseY - window.innerHeight / 2) * depth * 0.002;
    const rotateY = (mouseX - window.innerWidth / 2) * depth * 0.002;
    
    return `translate3d(${offsetX}px, ${offsetY}px, ${depth * -10}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* Layer 1 - Deepest Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          transform: getParallaxTransform(5, mousePosition.x, mousePosition.y),
          background: 'linear-gradient(135deg, hsl(220, 70%, 8%) 0%, hsl(250, 80%, 6%) 50%, hsl(200, 75%, 4%) 100%)'
        }}
      >
        {/* Deep space stars */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300 rounded-full opacity-80 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-70 animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-300 rounded-full opacity-60 animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Layer 2 - Mid Background with Geometric Shapes */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          transform: getParallaxTransform(4, mousePosition.x, mousePosition.y),
        }}
      >
        {/* Floating geometric shapes */}
        <div className="absolute top-32 left-1/4 w-24 h-24 border border-blue-400/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 border border-blue-400/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="absolute bottom-40 right-1/3 w-16 h-16 border border-purple-400/20 rotate-45 animate-pulse" style={{ animationDuration: '8s' }}>
          <div className="absolute inset-2 border border-purple-400/30 rotate-45"></div>
        </div>
        
        <div className="absolute top-1/3 right-20 w-20 h-20 border border-cyan-400/20 rounded-lg animate-bounce" style={{ animationDuration: '10s' }}>
          <div className="absolute inset-3 border border-cyan-400/30 rounded"></div>
        </div>
      </div>

      {/* Layer 3 - Glowing Orbs */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          transform: getParallaxTransform(3, mousePosition.x, mousePosition.y),
        }}
      >
        <div className="absolute top-20 left-1/3 w-32 h-32 bg-gradient-to-br from-blue-500/15 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-20 w-28 h-28 bg-gradient-to-br from-cyan-500/15 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '11s', animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-36 h-36 bg-gradient-to-br from-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '13s', animationDelay: '1s' }}></div>
      </div>

      {/* Layer 4 - Floating Elements */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          transform: getParallaxTransform(2, mousePosition.x, mousePosition.y),
        }}
      >
        {/* Code-like floating elements */}
        <div className="absolute top-24 left-40 text-blue-400/40 font-mono text-sm animate-pulse" style={{ animationDuration: '5s' }}>
          {'{ career: "success" }'}
        </div>
        <div className="absolute bottom-32 right-40 text-purple-400/40 font-mono text-sm animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>
          {'function elevateCareer()'}
        </div>
        <div className="absolute top-1/2 right-32 text-cyan-400/40 font-mono text-sm animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}>
          {'const growth = infinite'}
        </div>
        
        {/* Abstract UI elements */}
        <div className="absolute top-40 left-20 w-16 h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 right-20 w-1 h-16 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      {/* Layer 5 - Interactive Elements (Closest) */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          transform: getParallaxTransform(1, mousePosition.x, mousePosition.y),
        }}
      >
        {/* Cursor-reactive elements */}
        <div 
          className="absolute w-6 h-6 border border-blue-400/50 rounded-full transition-all duration-300"
          style={{
            left: mousePosition.x * 0.1 + 50,
            top: mousePosition.y * 0.1 + 50,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px rgba(59, 130, 246, 0.3)`
          }}
        >
          <div className="absolute inset-1 border border-blue-400/30 rounded-full animate-ping"></div>
        </div>
        
        <div 
          className="absolute w-4 h-4 bg-purple-400/30 rounded-full transition-all duration-500"
          style={{
            right: (window.innerWidth - mousePosition.x) * 0.08 + 100,
            bottom: (window.innerHeight - mousePosition.y) * 0.08 + 100,
            transform: 'translate(50%, 50%)',
            filter: 'blur(1px)'
          }}
        ></div>
        
        <div 
          className="absolute w-8 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent transition-all duration-700"
          style={{
            left: mousePosition.x * 0.15 + 200,
            top: mousePosition.y * 0.15 + 150,
            transform: `translate(-50%, -50%) rotate(${mousePosition.x * 0.1}deg)`,
          }}
        ></div>
      </div>

      {/* Dynamic Spotlight Effect */}
      <div 
        className="absolute w-96 h-96 pointer-events-none transition-all duration-500"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      ></div>

      {/* Mesh Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 90%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 10%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `,
          transform: getParallaxTransform(0.5, mousePosition.x, mousePosition.y),
        }}
      ></div>
    </div>
  );
}