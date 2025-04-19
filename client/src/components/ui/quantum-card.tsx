import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type VisualStyle = "holographic" | "clay" | "glassmorphic" | "neoglow" | "professional";

interface QuantumCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  glare?: boolean;
  perspective?: number;
  style?: React.CSSProperties;
  borderColor?: string;
  borderWidth?: number;
  glowColor?: string;
  glowStrength?: number;
  floating?: boolean;
  visualStyle?: VisualStyle;
  layeredContent?: boolean; // For layered content that pops at different depths
  backgroundColor?: string;
  interactive?: boolean; // Whether card responds to mouse movements
  rotationIntensity?: number; // How much the card rotates (0-1)
  layerDistance?: number; // Distance between content layers
  hoverScale?: number; // How much the card scales on hover
  badge?: React.ReactNode; // Optional badge to show at the top-right corner
  footer?: React.ReactNode; // Optional footer content
  clickable?: boolean; // If true, will show a subtle animation on click
  onClick?: () => void; // Click handler
}

export const QuantumCard: React.FC<QuantumCardProps> = ({
  children,
  className = "",
  depth = 40,
  glare = true,
  perspective = 1200,
  style = {},
  borderColor,
  borderWidth = 1,
  glowColor,
  glowStrength = 15,
  floating = false,
  visualStyle = "glassmorphic",
  layeredContent = false,
  backgroundColor,
  interactive = true,
  rotationIntensity = 0.5,
  layerDistance = 10,
  hoverScale = 1.02,
  badge,
  footer,
  clickable = false,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  // Determine styles based on the visual style prop
  const getVisualStyleProps = () => {
    switch (visualStyle) {
      case "holographic":
        return {
          borderColor: borderColor || "linear-gradient(135deg, #6366F1 0%, #14B8A6 50%, #FF6B6B 100%)",
          glowColor: glowColor || "rgba(99, 102, 241, 0.4)",
          backgroundStyle: "linear-gradient(120deg, rgba(255,255,255,0.8) 0%, rgba(220,220,255,0.6) 50%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px) saturate(180%)",
          hasRainbowEdge: true,
          hasHolographicSheen: true,
        };
      case "clay":
        return {
          borderColor: borderColor || "transparent",
          glowColor: glowColor || "rgba(0, 0, 0, 0.15)",
          backgroundStyle: backgroundColor || "rgb(245, 245, 245)",
          backdropFilter: "none",
          hasRainbowEdge: false,
          hasHolographicSheen: false,
          hasSoftShadow: true,
        };
      case "neoglow":
        return {
          borderColor: borderColor || "linear-gradient(135deg, #FF6B6B 0%, #6366F1 100%)",
          glowColor: glowColor || "rgba(255, 107, 107, 0.4)",
          backgroundStyle: "linear-gradient(145deg, rgba(30,30,40,0.9), rgba(15,15,25,0.8))",
          backdropFilter: "blur(15px)",
          hasRainbowEdge: true,
          hasNeonGlow: true,
        };
      case "professional":
        return {
          borderColor: borderColor || "rgba(210, 210, 210, 0.5)",
          glowColor: glowColor || "rgba(0, 0, 0, 0.1)",
          backgroundStyle: backgroundColor || "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,250,0.95))",
          backdropFilter: "blur(5px)",
          hasRainbowEdge: false,
          hasHolographicSheen: false,
          hasSoftShadow: true,
        };
      case "glassmorphic":
      default:
        return {
          borderColor: borderColor || "rgba(255, 255, 255, 0.2)",
          glowColor: glowColor || "rgba(99, 102, 241, 0.3)",
          backgroundStyle: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
          backdropFilter: "blur(10px)",
          hasRainbowEdge: false,
          hasHolographicSheen: false,
        };
    }
  };
  
  const visualStyleProps = getVisualStyleProps();
  
  // Card rotation values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics for the rotation with adjustable intensity
  const rotateX = useSpring(useTransform(y, [-150, 150], [15 * rotationIntensity, -15 * rotationIntensity]), {
    stiffness: 150,
    damping: 20,
  });
  
  const rotateY = useSpring(useTransform(x, [-150, 150], [-15 * rotationIntensity, 15 * rotationIntensity]), {
    stiffness: 150,
    damping: 20,
  });

  // Glare position values
  const glareX = useSpring(useTransform(x, [-150, 150], ["25%", "75%"]), {
    stiffness: 50,
    damping: 50,
  });
  
  const glareY = useSpring(useTransform(y, [-150, 150], ["25%", "75%"]), {
    stiffness: 50,
    damping: 50,
  });

  // Z-axis movement for depth effect
  const translateZ = useSpring(isHovered ? depth : 0, {
    stiffness: 150,
    damping: 20,
  });
  
  // Scale on hover
  const scale = useSpring(isHovered ? hoverScale : 1, {
    stiffness: 150,
    damping: 15,
  });
  
  // Click effect
  const clickScale = useSpring(isPressed ? 0.97 : 1, {
    stiffness: 300,
    damping: 15,
  });

  // Handle mouse move for 3D effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive) return;
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      x.set(mouseX);
      y.set(mouseY);
    }
  }

  // Handle mouse down for click animation
  function handleMouseDown() {
    if (clickable) {
      setIsPressed(true);
    }
  }
  
  function handleMouseUp() {
    if (clickable) {
      setIsPressed(false);
      if (onClick) onClick();
    }
  }

  // Handle floating animation
  const [floatY, setFloatY] = useState(0);
  
  useEffect(() => {
    if (floating) {
      let direction = 1;
      let position = 0;
      
      const interval = setInterval(() => {
        position += 0.2 * direction;
        
        if (position > 5) direction = -1;
        if (position < -5) direction = 1;
        
        setFloatY(position);
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [floating]);

  // Holographic rainbow effect for edge
  const rainbowAnimation = visualStyleProps.hasRainbowEdge ? {
    background: `linear-gradient(135deg, #6366F1 0%, #14B8A6 25%, #FF6B6B 50%, #F59E0B 75%, #6366F1 100%)`,
    backgroundSize: "300% 300%",
    animation: "gradient-shift 5s ease infinite"
  } : {};

  // For holographic sheen effect
  const [sheenPosition, setSheenPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (visualStyleProps.hasHolographicSheen && isHovered) {
      const interval = setInterval(() => {
        setSheenPosition({
          x: Math.random() * 100,
          y: Math.random() * 100,
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [visualStyleProps.hasHolographicSheen, isHovered]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        clickable && "cursor-pointer",
        className
      )}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        ...style,
      }}
      animate={{
        y: floating ? floatY : 0,
        scale: clickScale,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative rounded-xl"
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          z: interactive ? translateZ : 0,
          scale: scale,
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? `0 ${glowStrength}px ${glowStrength * 1.5}px ${visualStyleProps.glowColor}`
            : visualStyleProps.hasSoftShadow 
              ? "0 10px 30px rgba(0,0,0,0.08)"
              : "0 5px 15px rgba(0,0,0,0.1)",
          border: `${borderWidth}px solid ${typeof visualStyleProps.borderColor === 'string' ? visualStyleProps.borderColor : 'transparent'}`,
          backgroundClip: "padding-box",
          background: visualStyleProps.backgroundStyle,
          backdropFilter: visualStyleProps.backdropFilter,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          x.set(0);
          y.set(0);
        }}
      >
        {/* Colored border gradient if using gradient */}
        {typeof visualStyleProps.borderColor === 'string' && visualStyleProps.borderColor.includes('gradient') && (
          <div
            className="absolute inset-0 rounded-xl -z-10"
            style={{
              ...rainbowAnimation,
              padding: `${borderWidth}px`,
              borderRadius: "inherit",
              margin: `-${borderWidth}px`,
            }}
          />
        )}
        
        {/* Neon glow effect */}
        {visualStyleProps.hasNeonGlow && (
          <div 
            className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 20px 2px ${visualStyleProps.glowColor}, inset 0 0 10px 1px ${visualStyleProps.glowColor}`,
              opacity: isHovered ? 0.7 : 0,
              pointerEvents: "none",
            }}
          />
        )}
        
        {/* Holographic sheen effect */}
        {visualStyleProps.hasHolographicSheen && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
              opacity: isHovered ? 0.6 : 0,
              top: `${sheenPosition.y}%`,
              left: `${sheenPosition.x}%`,
              width: "100%",
              height: "100%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              transition: "opacity 0.3s",
            }}
          />
        )}
        
        {/* Glare effect */}
        {glare && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)",
              top: glareY,
              left: glareX,
              transform: "translate(-50%, -50%)",
              opacity: isHovered ? 0.7 : 0,
              width: "150%",
              height: "150%",
              pointerEvents: "none",
              transformStyle: "preserve-3d",
            }}
          />
        )}
        
        {/* Badge if provided */}
        {badge && (
          <div className="absolute top-2 right-2 z-20">
            {badge}
          </div>
        )}
        
        {/* Card content with optional layering */}
        <div className="relative z-10 h-full p-5">
          {layeredContent ? (
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;
                
                return React.cloneElement(child as React.ReactElement, {
                  style: {
                    ...((child as React.ReactElement).props.style || {}),
                    transform: `translateZ(${index * layerDistance}px)`,
                    position: "relative",
                    zIndex: index + 1,
                  },
                });
              })}
            </div>
          ) : (
            children
          )}
        </div>
        
        {/* Footer if provided */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20 border-t border-opacity-10 bg-opacity-50">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};