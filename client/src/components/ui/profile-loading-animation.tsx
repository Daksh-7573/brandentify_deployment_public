import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, GraduationCap, Briefcase, Code, Settings, Star } from "lucide-react";

interface ProfileLoadingAnimationProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

const ProfileLoadingAnimation: React.FC<ProfileLoadingAnimationProps> = ({
  size = "medium",
  text = "",
  className = "",
}) => {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  // Reset animation state if the component stays mounted for a long time
  useEffect(() => {
    if (animationCompleted) {
      const timer = setTimeout(() => {
        setAnimationCompleted(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [animationCompleted]);
  
  // Map size prop to pixel dimensions
  const dimensions = {
    small: {
      container: 120,
      center: 36,
      icons: 24,
      orbit: 40,
      text: "text-xs",
    },
    medium: {
      container: 180,
      center: 48,
      icons: 28,
      orbit: 60,
      text: "text-sm",
    },
    large: {
      container: 240,
      center: 64,
      icons: 32,
      orbit: 80,
      text: "text-base",
    },
  }[size];
  
  const { container, center, icons, orbit, text: textSize } = dimensions;
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };
  
  const centerVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };
  
  const orbitIconVariants = {
    initial: { scale: 0, opacity: 0, rotate: -30 },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: { 
        duration: 0.4,
        type: "spring",
        stiffness: 200
      }
    }
  };
  
  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };
  
  // Orbit positions (adjusted for animation flow)
  const orbitPositions = [
    { icon: Star, label: "Skills", angle: 0 },
    { icon: GraduationCap, label: "Education", angle: 72 },
    { icon: Briefcase, label: "Experience", angle: 144 },
    { icon: Code, label: "Projects", angle: 216 },
    { icon: Settings, label: "Services", angle: 288 }
  ];
  
  const calculatePosition = (angle: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: orbit * Math.cos(radian),
      y: orbit * Math.sin(radian)
    };
  };
  
  const handleAnimationComplete = () => {
    setAnimationCompleted(true);
  };
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        style={{ width: container, height: container }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        onAnimationComplete={handleAnimationComplete}
      >
        {/* Center avatar */}
        <motion.div 
          className="absolute bg-primary rounded-full flex items-center justify-center text-primary-foreground"
          style={{ 
            width: center, 
            height: center, 
            left: container/2 - center/2, 
            top: container/2 - center/2,
          }}
          variants={centerVariants}
        >
          <motion.div
            variants={pulseAnimation}
            animate={animationCompleted ? "animate" : "initial"}
          >
            <User size={center * 0.65} />
          </motion.div>
        </motion.div>
        
        {/* Orbit items */}
        {orbitPositions.map((item, index) => {
          const { x, y } = calculatePosition(item.angle);
          const IconComponent = item.icon;
          
          return (
            <motion.div
              key={item.label}
              className="absolute bg-background border border-border shadow-md rounded-full flex items-center justify-center"
              style={{ 
                width: icons, 
                height: icons, 
                left: container/2 - icons/2 + x, 
                top: container/2 - icons/2 + y
              }}
              variants={orbitIconVariants}
              custom={index}
            >
              <IconComponent size={icons * 0.6} className="text-primary" />
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Loading text */}
      {text && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mt-4 ${textSize} text-center text-muted-foreground max-w-xs`}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

export default ProfileLoadingAnimation;