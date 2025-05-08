import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface SpatialLayoutProps {
  children: ReactNode;
  className?: string;
}

interface FloatingWindowProps {
  children: ReactNode;
  width?: string;
  height?: string;
  position?: 'center' | 'left' | 'right' | 'top' | 'bottom';
  zIndex?: number;
  glassEffect?: boolean;
  className?: string;
  motionProps?: MotionProps;
}

// Main spatial layout container
export default function SpatialLayout({ children, className }: SpatialLayoutProps) {
  return (
    <div className={`spatial-layout min-h-screen w-full perspective-1000 ${className || ''}`}>
      <div className="spatial-content relative w-full h-full">
        {children}
      </div>
    </div>
  );
}

// Floating window component for 3D spatial UI
export function FloatingWindow({ 
  children, 
  width = "auto", 
  height = "auto", 
  position = "center",
  zIndex = 0,
  glassEffect = true,
  className = "",
  motionProps = {}
}: FloatingWindowProps) {
  // Calculate position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return 'left-[10%] top-1/2 -translate-y-1/2 translate-z-[-50px]';
      case 'right':
        return 'right-[10%] top-1/2 -translate-y-1/2 translate-z-[-50px]';
      case 'top':
        return 'top-[10%] left-1/2 -translate-x-1/2 translate-z-[-30px]';
      case 'bottom':
        return 'bottom-[10%] left-1/2 -translate-x-1/2 translate-z-[-30px]';
      case 'center':
      default:
        return 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 translate-z-[0px]';
    }
  };

  // Glass effect styles
  const glassStyles = glassEffect 
    ? 'bg-opacity-80 backdrop-blur-md border border-white/20 shadow-lg' 
    : 'bg-opacity-95 shadow-md';
  
  // z-index adjustments for spatial layout
  const zIndexStyles = `z-[${10 + zIndex}]`;

  return (
    <motion.div
      className={`
        absolute ${getPositionStyles()} ${zIndexStyles}
        ${glassStyles}
        rounded-xl overflow-hidden
        transition-all duration-500
        ${className}
      `}
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)"
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        z: 0
      }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// Large centered content window
export function MainContentWindow({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <FloatingWindow
      position="center"
      width="65%"
      height="auto"
      zIndex={5}
      className={`bg-background main-content-window ${className}`}
    >
      {children}
    </FloatingWindow>
  );
}

// Sidebar/secondary content window
export function SideContentWindow({ 
  children, 
  position = "right",
  className = ""
}: { 
  children: ReactNode,
  position?: "left" | "right", 
  className?: string 
}) {
  return (
    <FloatingWindow
      position={position}
      width="25%"
      height="auto"
      zIndex={3}
      className={`bg-background/90 side-content-window ${className}`}
    >
      {children}
    </FloatingWindow>
  );
}

// Action button with enhanced visual contrast
export function SpatialActionButton({ 
  children, 
  onClick,
  variant = "primary",
  className = ""
}: { 
  children: ReactNode, 
  onClick?: () => void,
  variant?: "primary" | "secondary" | "accent",
  className?: string 
}) {
  // Define variant styles
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90"
  };

  return (
    <motion.button
      className={`
        px-6 py-3 rounded-full text-lg font-medium
        shadow-lg ${variantStyles[variant]}
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// Navigation icon button for minimal nav
export function SpatialIconButton({ 
  icon, 
  onClick,
  label,
  className = ""
}: { 
  icon: ReactNode, 
  onClick?: () => void,
  label?: string,
  className?: string 
}) {
  return (
    <motion.button
      className={`
        p-4 rounded-full bg-background/80 backdrop-blur-sm
        shadow-md hover:shadow-lg
        flex items-center justify-center
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={label}
      aria-label={label}
    >
      {icon}
      {label && <span className="sr-only">{label}</span>}
    </motion.button>
  );
}

// Add glassmorphism/soft UI styles to any component
export function GlassCard({ 
  children, 
  className = "" 
}: { 
  children: ReactNode, 
  className?: string 
}) {
  return (
    <div className={`
      bg-background/60 backdrop-blur-lg 
      border border-white/10 dark:border-gray-800/50
      rounded-xl shadow-lg
      p-4
      ${className}
    `}>
      {children}
    </div>
  );
}