import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ButtonAnimation = 
  | "pulse" 
  | "scale" 
  | "slide" 
  | "glow" 
  | "gradient" 
  | "ripple" 
  | "float"
  | "3d";

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof Button> {
  children: React.ReactNode;
  animation?: ButtonAnimation;
  className?: string;
  withIcon?: React.ReactNode;
  iconPosition?: "left" | "right";
  gradientColors?: string[];
  glowColor?: string;
  glowSize?: number;
  hoverScale?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animation = "scale",
  className = "",
  withIcon,
  iconPosition = "left",
  gradientColors = ["#6366F1", "#14B8A6", "#F59E0B"],
  glowColor = "rgba(99, 102, 241, 0.6)",
  glowSize = 15,
  hoverScale = 1.05,
  variant = "default",
  size = "default",
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const [rippleCount, setRippleCount] = useState(0);
  
  // For 3D animation
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // For float animation
  const [floatY, setFloatY] = useState(0);
  
  useEffect(() => {
    if (animation === "float" && isHovered) {
      const interval = setInterval(() => {
        setFloatY(prev => -prev);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [animation, isHovered]);
  
  // Handle ripple effect
  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animation === "ripple") {
      const buttonRect = buttonRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const size = Math.max(buttonRect.width, buttonRect.height) * 2;
      const x = e.clientX - buttonRect.left - size / 2;
      const y = e.clientY - buttonRect.top - size / 2;
      
      const newRipple = {
        x,
        y,
        size,
      };
      
      setRipples(prev => [...prev, newRipple]);
      setRippleCount(prev => prev + 1);
      
      // Remove the ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600);
    }
  };
  
  // Handle 3D effect on hover
  const handle3DEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animation === "3d" && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;
      
      const rotateY = ((e.clientX - buttonCenterX) / (buttonRect.width / 2)) * 10;
      const rotateX = ((buttonCenterY - e.clientY) / (buttonRect.height / 2)) * 5;
      
      setRotation({ x: rotateX, y: rotateY });
    }
  };
  
  // Reset position when not hovering for 3D animation
  useEffect(() => {
    if (animation === "3d" && !isHovered) {
      const timeout = setTimeout(() => {
        setRotation({ x: 0, y: 0 });
      }, 150);
      
      return () => clearTimeout(timeout);
    }
  }, [isHovered, animation]);
  
  // Get animation-specific styles
  const getAnimationStyles = (): React.CSSProperties => {
    switch (animation) {
      case "glow":
        return {
          boxShadow: isHovered ? `0 0 ${glowSize}px ${glowColor}` : "none",
          transition: "box-shadow 0.3s ease",
        };
      case "gradient":
        return {
          background: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
          backgroundSize: "200% 100%",
          animation: isHovered ? "gradient-shift 2s linear infinite" : "none",
          transition: "all 0.3s ease",
          color: "white",
        };
      case "3d":
        return {
          transform: isHovered ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : "perspective(1000px) rotateX(0) rotateY(0)",
          transition: "transform 0.1s ease",
        };
      case "float":
        return {
          transform: isHovered ? `translateY(${floatY * 3}px)` : "translateY(0)",
          transition: "transform 0.6s ease",
        };
      default:
        return {};
    }
  };
  
  // Get animation className
  const getAnimationClassName = (): string => {
    switch (animation) {
      case "pulse":
        return isHovered ? "animate-pulse" : "";
      case "scale":
        return isHovered ? "scale-105 transform-gpu transition-transform" : "transform-gpu transition-transform";
      case "slide":
        return isHovered ? "translate-x-1 transform-gpu transition-transform" : "transform-gpu transition-transform";
      default:
        return "";
    }
  };
  
  // Get content with icon
  const getContent = () => {
    if (!withIcon) return children;
    
    return (
      <div className="flex items-center gap-2">
        {iconPosition === "left" && withIcon}
        {children}
        {iconPosition === "right" && withIcon}
      </div>
    );
  };
  
  // Calculate the z-index for layered ripples
  const getRippleZIndex = (index: number) => {
    return rippleCount - index;
  };
  
  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={cn(
        "relative overflow-hidden transition-all",
        getAnimationClassName(),
        className
      )}
      style={{
        ...getAnimationStyles(),
        ...props.style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={animation === "3d" ? handle3DEffect : undefined}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={(e) => {
        addRipple(e);
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {animation === "ripple" && ripples.map((ripple, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          initial={{ opacity: 0.6, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            zIndex: getRippleZIndex(index),
          }}
        />
      ))}
      
      {getContent()}
    </Button>
  );
};