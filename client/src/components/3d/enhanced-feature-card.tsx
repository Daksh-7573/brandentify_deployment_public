import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { LucideIcon } from 'lucide-react';

interface EnhancedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onHover?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}

export function EnhancedFeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  onHover, 
  onLeave,
  onClick 
}: EnhancedFeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    
    if (!card || !glow || !content) return;

    const handleMouseEnter = (e: MouseEvent) => {
      setIsHovered(true);
      onHover?.();

      // 3D lift effect
      gsap.to(card, {
        y: -50,
        rotationX: 10,
        rotationY: 5,
        scale: 1.05,
        duration: 0.6,
        ease: "back.out(1.7)"
      });

      // Glow expansion
      gsap.to(glow, {
        scale: 1.2,
        opacity: 0.6,
        duration: 0.4,
        ease: "power2.out"
      });

      // Content animation
      gsap.to(content, {
        y: -10,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = (e: MouseEvent) => {
      setIsHovered(false);
      onLeave?.();

      // Return to normal
      gsap.to(card, {
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });

      gsap.to(glow, {
        scale: 1,
        opacity: 0.3,
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.to(content, {
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Magnetic attraction effect
      gsap.to(card, {
        rotationY: deltaX * 15,
        rotationX: -deltaY * 15,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleClick = () => {
      // Celebration animation
      gsap.fromTo(card, 
        { scale: 1.05 },
        { 
          scale: 1.1, 
          duration: 0.1, 
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          onComplete: () => onClick?.()
        }
      );

      // Ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 rounded-lg bg-white opacity-20 animate-ping';
      card.appendChild(ripple);
      setTimeout(() => card.removeChild(ripple), 600);
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('click', handleClick);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('click', handleClick);
    };
  }, [isHovered, onHover, onLeave, onClick]);

  // Entrance animation
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(card,
      { 
        opacity: 0, 
        y: 100, 
        rotationX: -90,
        scale: 0.8
      },
      { 
        opacity: 1, 
        y: 0, 
        rotationX: 0,
        scale: 1,
        duration: 0.8, 
        ease: "back.out(1.7)",
        delay: Math.random() * 0.3
      }
    );
  }, []);

  return (
    <div className="relative perspective-1000">
      {/* Glow effect */}
      <div 
        ref={glowRef}
        className={`absolute inset-0 rounded-lg blur-xl opacity-30 transition-all duration-300`}
        style={{ 
          background: `radial-gradient(circle, ${color}40, transparent)`,
          transform: 'scale(1)'
        }}
      />
      
      {/* Main card */}
      <div
        ref={cardRef}
        className="relative neo-glass-card p-6 rounded-lg cursor-pointer overflow-hidden group"
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div ref={contentRef} className="relative z-10">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3`} style={{ backgroundColor: `${color}20` }}>
              <Icon 
                className="h-8 w-8" 
                style={{ color }} 
              />
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Floating particles on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}