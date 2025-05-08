import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

/**
 * VisionProNavItem - A glassmorphic nav item with Vision Pro-inspired effects
 */
export const VisionProNavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLAnchorElement>(null);
  
  // Track mouse position for lighting effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!itemRef.current) return;
      
      const rect = itemRef.current.getBoundingClientRect();
      // Calculate mouse position relative to the item (normalized from -1 to 1)
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      setMousePosition({ x, y });
    };
    
    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);
  
  // If active or hovered, apply stronger effects
  const isActive3D = isActive || isHovered;
  
  return (
    <Link href={href}>
      <motion.a
        ref={itemRef}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all vision-depth",
          "border border-transparent backdrop-blur-sm",
          isActive 
            ? "bg-white/15 text-white vision-luminous-text" 
            : "text-white/70 hover:text-white hover:bg-white/10",
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isActive3D ? 'scale(1.03) translateZ(1px)' : 'translateZ(0)',
          boxShadow: isActive3D 
            ? '0 5px 15px rgba(0, 0, 0, 0.1), 0 0 5px rgba(120, 150, 255, 0.2)' 
            : 'none',
          borderTopColor: isActive3D ? `rgba(255, 255, 255, ${0.2 + Math.abs(mousePosition.y) * 0.2})` : 'transparent',
          borderLeftColor: isActive3D ? `rgba(255, 255, 255, ${0.15 + Math.abs(mousePosition.x) * 0.15})` : 'transparent',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          y: isActive3D ? -2 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
      >
        {/* Subtle highlight overlay for active/hovered state */}
        {isActive3D && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden"
            style={{
              background: `radial-gradient(
                circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%, 
                rgba(180, 210, 255, 0.15) 0%, 
                transparent 70%
              )`,
              opacity: 0.7,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        
        {/* Icon with enhanced depth */}
        <div 
          className="text-current" 
          style={{ 
            transform: isActive3D ? 'translateZ(3px)' : 'none',
            filter: isActive ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))' : 'none',
          }}
        >
          {icon}
        </div>
        
        {/* Label with enhanced depth */}
        <span
          style={{ 
            transform: isActive3D ? 'translateZ(2px)' : 'none',
            textShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none',
          }}
        >
          {label}
        </span>
      </motion.a>
    </Link>
  );
};

interface VisionProNavigationProps {
  items: NavItemProps[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  variant?: 'default' | 'glassy' | 'frosted';
}

/**
 * VisionProNavigation - A glassmorphic navigation bar with Vision Pro-inspired effects
 * 
 * This component creates a tactile and visually engaging navigation element
 * that responds to user interaction with subtle 3D and lighting effects.
 */
export const VisionProNavigation: React.FC<VisionProNavigationProps> = ({
  items,
  orientation = 'horizontal',
  className,
  variant = 'default',
}) => {
  const [location] = useLocation();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Add spring physics for smoother movement
  const springConfig = { damping: 20, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  // Track mouse movement for background lighting effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!navRef.current) return;
      
      const rect = navRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      mouseX.set((e.clientX - rect.left - centerX) / centerX);
      mouseY.set((e.clientY - rect.top - centerY) / centerY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Get background style based on variant
  const getBackgroundStyle = () => {
    const x = springX.get();
    const y = springY.get();
    
    switch (variant) {
      case 'glassy':
        return {
          backgroundColor: 'rgba(20, 30, 50, 0.3)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 10px rgba(120, 150, 255, 0.1)',
        };
      case 'frosted':
        return {
          backgroundColor: 'rgba(30, 40, 60, 0.5)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(100, 140, 255, 0.1)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3), 0 0 15px rgba(100, 140, 255, 0.15)',
          background: `radial-gradient(
            circle at ${50 + x * 20}% ${50 + y * 20}%, 
            rgba(140, 180, 255, 0.25) 0%, 
            rgba(30, 40, 60, 0.5) 50%, 
            rgba(20, 30, 50, 0.6) 100%
          )`,
        };
      default:
        return {
          backgroundColor: 'rgba(15, 25, 40, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(100, 140, 255, 0.05)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15), 0 0 5px rgba(100, 140, 255, 0.1)',
        };
    }
  };
  
  return (
    <motion.div
      ref={navRef}
      className={cn(
        "vision-depth rounded-xl p-1.5",
        orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex items-center gap-1',
        className
      )}
      style={{
        ...getBackgroundStyle(),
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Subtle top highlight - characteristic of Vision Pro UI */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] rounded-t-xl"
        style={{
          background: `linear-gradient(to right, 
            transparent 5%, 
            rgba(255, 255, 255, 0.2) 30%, 
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.2) 70%,
            transparent 95%
          )`,
          opacity: 0.6,
        }}
      />
      
      {items.map((item) => (
        <VisionProNavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive || location === item.href}
        />
      ))}
    </motion.div>
  );
};

/**
 * VisionProMobileNav - A compact mobile navigation with Vision Pro effects
 */
export const VisionProMobileNav: React.FC<VisionProNavigationProps> = ({
  items,
  className,
}) => {
  const [location] = useLocation();
  
  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50",
      "px-4 py-2 rounded-full vision-depth backdrop-blur-xl",
      "bg-black/30 border border-white/10",
      "flex items-center gap-1",
      className
    )}>
      {items.map((item) => {
        const isActive = item.isActive || location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full transition-all",
                isActive 
                  ? "bg-white/20 text-white shadow-inner" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              style={{
                transform: isActive ? 'translateZ(2px)' : 'translateZ(0)',
              }}
            >
              {item.icon}
            </Button>
          </Link>
        );
      })}
      
      {/* Vision Pro inspired top rim lighting */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] rounded-t-full"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
          opacity: 0.5,
        }}
      />
    </div>
  );
};