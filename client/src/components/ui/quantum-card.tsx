import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

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
}

export const QuantumCard: React.FC<QuantumCardProps> = ({
  children,
  className = "",
  depth = 40,
  glare = true,
  perspective = 1200,
  style = {},
  borderColor = "linear-gradient(135deg, #6366F1 0%, #14B8A6 50%, #F59E0B 100%)",
  borderWidth = 1,
  glowColor = "rgba(99, 102, 241, 0.3)",
  glowStrength = 15,
  floating = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Card rotation values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics for the rotation
  const rotateX = useSpring(useTransform(y, [-150, 150], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  
  const rotateY = useSpring(useTransform(x, [-150, 150], [-15, 15]), {
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

  // Handle mouse move for 3D effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
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

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        className
      )}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        ...style,
      }}
      animate={{
        y: floating ? floatY : 0,
      }}
    >
      <motion.div
        className="w-full h-full relative p-5 rounded-xl"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          z: translateZ,
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? `0 ${glowStrength}px ${glowStrength * 1.5}px ${glowColor}`
            : "0 5px 15px rgba(0,0,0,0.1)",
          border: `${borderWidth}px solid transparent`,
          backgroundClip: "padding-box",
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.6))`,
          backdropFilter: "blur(10px)",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          x.set(0);
          y.set(0);
        }}
      >
        {/* Colored border gradient */}
        <div
          className="absolute inset-0 rounded-xl -z-10"
          style={{
            background: borderColor,
            padding: `${borderWidth}px`,
            borderRadius: "inherit",
            margin: `-${borderWidth}px`,
          }}
        />
        
        {/* Glare effect */}
        {glare && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-70"
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
        
        {/* Card content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};