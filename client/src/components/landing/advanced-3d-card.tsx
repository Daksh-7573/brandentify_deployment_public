import React, { useRef, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface Advanced3DCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  glowColor: string;
  delay?: number;
  mousePosition: { x: number; y: number };
  onHover?: (isHovered: boolean) => void;
}

export default function Advanced3DCard({
  icon: Icon,
  title,
  description,
  color,
  glowColor,
  delay = 0,
  mousePosition,
  onHover
}: Advanced3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });

  // Get card position on mount and window resize
  useEffect(() => {
    const updateCardPosition = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setCardPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    updateCardPosition();
    window.addEventListener('resize', updateCardPosition);
    return () => window.removeEventListener('resize', updateCardPosition);
  }, []);

  // Calculate local mouse position relative to card
  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const localX = ((mousePosition.x - rect.left) / rect.width - 0.5) * 2;
      const localY = ((mousePosition.y - rect.top) / rect.height - 0.5) * 2;
      setLocalMousePos({ x: localX, y: localY });
    }
  }, [mousePosition]);

  // Calculate 3D transforms based on mouse position
  const getCardTransform = () => {
    if (!isHovered) {
      return `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)`;
    }

    const intensity = 15;
    const rotateX = -localMousePos.y * intensity;
    const rotateY = localMousePos.x * intensity;
    const translateZ = 50;
    const scale = 1.08;

    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
  };

  // Calculate magnetic attraction effect
  const getMagneticOffset = () => {
    if (!isHovered) return { x: 0, y: 0 };
    
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - cardPosition.x, 2) +
      Math.pow(mousePosition.y - cardPosition.y, 2)
    );
    
    if (distance < 200) {
      const force = (200 - distance) / 200 * 8;
      const angle = Math.atan2(
        mousePosition.y - cardPosition.y,
        mousePosition.x - cardPosition.x
      );
      
      return {
        x: Math.cos(angle) * force,
        y: Math.sin(angle) * force
      };
    }
    
    return { x: 0, y: 0 };
  };

  const magneticOffset = getMagneticOffset();

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer"
      style={{
        transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animationDelay: `${delay}ms`
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Glow Effect */}
      <div 
        className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-500 ${
          isHovered ? 'opacity-80' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle at ${(localMousePos.x + 1) * 50}% ${(localMousePos.y + 1) * 50}%, ${glowColor} 0%, transparent 70%)`,
          transform: 'scale(1.2)',
        }}
      />

      {/* Card Shadow */}
      <div 
        className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
          isHovered ? 'opacity-60' : 'opacity-20'
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          transform: `translateY(${isHovered ? '20px' : '8px'}) scale(${isHovered ? '0.95' : '0.98'})`,
          filter: `blur(${isHovered ? '20px' : '10px'})`,
        }}
      />

      {/* Main Card */}
      <div
        className="relative neo-glass-card p-8 rounded-2xl transition-all duration-500 transform-gpu overflow-hidden border border-white/20"
        style={{
          transform: getCardTransform(),
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          background: isHovered 
            ? `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 100%)`,
        }}
      >
        {/* Animated Background Pattern */}
        <div 
          className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${
            isHovered ? 'opacity-40' : 'opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle at ${(localMousePos.x + 1) * 50}% ${(localMousePos.y + 1) * 50}%, ${color} 0%, transparent 60%)`,
          }}
        />

        {/* Holographic Shine Effect */}
        <div 
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(
              ${45 + localMousePos.x * 30}deg,
              transparent 30%,
              rgba(255,255,255,0.1) 50%,
              transparent 70%
            )`,
            transform: `translateX(${localMousePos.x * 20}px) translateY(${localMousePos.y * 20}px)`,
          }}
        />

        {/* Content Container */}
        <div className="relative z-10">
          {/* Icon with 3D Effect */}
          <div 
            className="flex items-center mb-6 transition-all duration-500"
            style={{
              transform: `translateZ(${isHovered ? '30px' : '0px'}) rotateX(${isHovered ? localMousePos.y * -10 : 0}deg) rotateY(${isHovered ? localMousePos.x * 10 : 0}deg)`,
            }}
          >
            <div 
              className={`relative p-3 rounded-xl transition-all duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
              style={{
                background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
                filter: `drop-shadow(0 10px 20px ${glowColor})`,
              }}
            >
              <Icon 
                className="h-8 w-8 text-white transition-all duration-500" 
                style={{
                  transform: `rotate(${isHovered ? localMousePos.x * 15 : 0}deg)`,
                  filter: `drop-shadow(0 0 10px ${glowColor})`,
                }}
              />
              
              {/* Icon Glow Ring */}
              <div 
                className={`absolute inset-0 rounded-xl border-2 transition-all duration-500 ${
                  isHovered ? 'opacity-60 scale-125' : 'opacity-0 scale-100'
                }`}
                style={{
                  borderColor: color,
                  boxShadow: `0 0 20px ${glowColor}`,
                }}
              />
            </div>

            <h3 
              className="text-xl font-bold text-white ml-4 transition-all duration-500"
              style={{
                transform: `translateZ(${isHovered ? '20px' : '0px'})`,
                textShadow: isHovered ? `0 0 20px ${glowColor}` : 'none',
              }}
            >
              {title}
            </h3>
          </div>

          {/* Description */}
          <p 
            className="text-gray-300 leading-relaxed transition-all duration-500"
            style={{
              transform: `translateZ(${isHovered ? '15px' : '0px'})`,
              opacity: isHovered ? 1 : 0.8,
            }}
          >
            {description}
          </p>

          {/* Interactive Elements */}
          <div 
            className={`absolute bottom-4 right-4 flex space-x-2 transition-all duration-500 ${
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              transform: `translateZ(${isHovered ? '25px' : '0px'})`,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color, animationDelay: '0s' }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color, animationDelay: '0.3s' }}
            />
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color, animationDelay: '0.6s' }}
            />
          </div>
        </div>

        {/* Ripple Effect */}
        {isHovered && (
          <div 
            className="absolute rounded-full border animate-ping"
            style={{
              left: `${(localMousePos.x + 1) * 50}%`,
              top: `${(localMousePos.y + 1) * 50}%`,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              borderColor: color,
              animationDuration: '1s',
            }}
          />
        )}
      </div>

      {/* Floating Particles around Card */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              top: '10%',
              left: '10%',
              animationDelay: '0s',
              animationDuration: '2s',
            }}
          />
          <div 
            className="absolute w-1.5 h-1.5 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              top: '20%',
              right: '15%',
              animationDelay: '0.5s',
              animationDuration: '2s',
            }}
          />
          <div 
            className="absolute w-1 h-1 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              bottom: '15%',
              left: '20%',
              animationDelay: '1s',
              animationDuration: '2s',
            }}
          />
          <div 
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              bottom: '10%',
              right: '10%',
              animationDelay: '1.5s',
              animationDuration: '2s',
            }}
          />
        </div>
      )}
    </div>
  );
}