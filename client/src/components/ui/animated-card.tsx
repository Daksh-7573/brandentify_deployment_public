import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type AnimationStyle = 
  | "fade" 
  | "slide" 
  | "scale" 
  | "flip" 
  | "pulse" 
  | "bounce" 
  | "glow"
  | "none";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  hoverEffect?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  delay?: number;
  duration?: number;
  glowColor?: string;
  withBadge?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  animation = "fade",
  title,
  description,
  footer,
  hoverEffect = true,
  clickable = false,
  onClick,
  delay = 0,
  duration = 0.3,
  glowColor = "rgba(99, 102, 241, 0.5)",
  withBadge,
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Define initial animation states
  const getAnimationVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "slide":
        return {
          hidden: { x: 20, opacity: 0 },
          visible: { x: 0, opacity: 1 },
        };
      case "scale":
        return {
          hidden: { scale: 0.8, opacity: 0 },
          visible: { scale: 1, opacity: 1 },
        };
      case "flip":
        return {
          hidden: { rotateY: 90, opacity: 0 },
          visible: { rotateY: 0, opacity: 1 },
        };
      case "pulse":
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            scale: [1, 1.02, 1],
            transition: {
              scale: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
              }
            }
          },
        };
      case "bounce":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 15,
            }
          },
        };
      case "none":
      default:
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        };
    }
  };
  
  // Get hover effect styles
  const getHoverStyles = () => {
    if (!hoverEffect) return {};
    
    switch (animation) {
      case "glow":
        return {
          boxShadow: isHovered ? `0 0 15px ${glowColor}` : "none",
          transition: "box-shadow 0.3s ease",
        };
      case "scale":
        return {
          transform: isHovered ? "scale(1.02)" : "scale(1)",
          transition: "transform 0.3s ease",
        };
      case "slide":
        return {
          transform: isHovered ? "translateY(-5px)" : "translateY(0)",
          transition: "transform 0.3s ease",
        };
      default:
        return {
          transform: isHovered ? "translateY(-5px)" : "translateY(0)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          boxShadow: isHovered 
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        };
    }
  };
  
  const variants = getAnimationVariants();
  
  return (
    <motion.div
      className={cn(
        "relative",
        clickable && "cursor-pointer",
        className
      )}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ 
        duration: animation === "bounce" ? 0.5 : duration, 
        delay, 
        ease: "easeOut" 
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getHoverStyles()}
    >
      {withBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          {withBadge}
        </div>
      )}
      
      <Card className={cn(
        "overflow-hidden",
        animation === "glow" && isHovered && "border-primary",
        clickable && "cursor-pointer",
      )}>
        {(title || description) && (
          <CardHeader className={headerClassName}>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent className={cn("", contentClassName)}>
          {children}
        </CardContent>
        
        {footer && (
          <CardFooter className={cn("flex justify-between", footerClassName)}>
            {footer}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};