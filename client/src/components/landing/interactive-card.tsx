import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface InteractiveCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  onHover?: (isHovering: boolean) => void;
}

export default function InteractiveCard({ icon, title, description, delay = 0, onHover }: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    // Initial entrance animation
    gsap.fromTo(cardRef.current, 
      {
        y: 50,
        opacity: 0,
        scale: 0.9,
        rotationX: -15
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: delay
      }
    );
  }, [delay]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !contentRef.current || !glowRef.current) return;

    setIsHovered(true);
    onHover?.(true);

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Enhanced 3D hover effect
    gsap.to(card, {
      y: -20,
      scale: 1.05,
      rotationX: 10,
      rotationY: 5,
      z: 100,
      duration: 0.4,
      ease: "power2.out",
      transformOrigin: "center center",
      transformStyle: "preserve-3d"
    });

    // Glow effect
    gsap.to(glowRef.current, {
      opacity: 0.6,
      scale: 1.1,
      duration: 0.3,
      ease: "power2.out"
    });

    // Content animation
    gsap.to(contentRef.current, {
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const rotateX = (deltaY / rect.height) * -20;
    const rotateY = (deltaX / rect.width) * 20;

    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.2,
      ease: "power2.out",
      transformStyle: "preserve-3d"
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !contentRef.current || !glowRef.current) return;

    setIsHovered(false);
    onHover?.(false);

    // Reset all transformations
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      z: 0,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(glowRef.current, {
      opacity: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(contentRef.current, {
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div className="relative group perspective-1000">
      {/* Glow effect */}
      <div 
        ref={glowRef}
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl opacity-0"
        style={{ transform: 'translateZ(-10px)' }}
      />
      
      {/* Main card */}
      <div
        ref={cardRef}
        className="relative neo-glass-card p-6 rounded-lg transition-all duration-300 cursor-pointer transform-gpu"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        <div ref={contentRef} className="relative z-10">
          {/* Icon with floating animation */}
          <div className="flex items-center mb-4">
            <div className="mr-3 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              {icon}
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          
          {/* Description */}
          <p className="text-gray-300 leading-relaxed">{description}</p>
          
          {/* Hover indicator */}
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        </div>

        {/* 3D depth layers */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: 'translateZ(5px)' }}
        />
      </div>
    </div>
  );
}