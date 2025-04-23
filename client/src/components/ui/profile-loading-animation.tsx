import React from "react";
import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap, Award, Code, BookOpen } from "lucide-react";

interface ProfileLoadingAnimationProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

export function ProfileLoadingAnimation({ 
  size = "medium", 
  text = "Loading profile data..." 
}: ProfileLoadingAnimationProps) {
  // Size configurations
  const configBySize = {
    small: {
      avatarSize: 40,
      containerPadding: 4,
      fontSize: "text-xs",
      iconSize: 12,
      totalDuration: 1.8,
    },
    medium: {
      avatarSize: 60,
      containerPadding: 6,
      fontSize: "text-sm",
      iconSize: 16,
      totalDuration: 2.2,
    },
    large: {
      avatarSize: 80,
      containerPadding: 8,
      fontSize: "text-base",
      iconSize: 20,
      totalDuration: 2.6,
    },
  };
  
  const config = configBySize[size];
  
  // Animation variants for elements
  const profileCircleVariants = {
    initial: { 
      opacity: 0,
      scale: 0.3
    },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    }
  };
  
  const iconVariants = {
    initial: { 
      opacity: 0,
      y: 10,
      scale: 0 
    },
    animate: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        delay: 0.5 + (custom * 0.2),
        duration: 0.4,
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    })
  };
  
  const pulseVariants = {
    initial: { scale: 0.95, opacity: 0.7 },
    animate: { 
      scale: 1.05, 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 1.5
      }
    }
  };
  
  const textVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        delay: 1.2,
        duration: 0.5 
      }
    }
  };
  
  // Define the elements that build up around the profile
  const profileElements = [
    { icon: Briefcase, label: "Experience" },
    { icon: GraduationCap, label: "Education" },
    { icon: Award, label: "Skills" },
    { icon: Code, label: "Projects" },
    { icon: BookOpen, label: "About" }
  ];
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`relative p-${config.containerPadding} mb-4`}
        style={{ height: config.avatarSize * 2, width: config.avatarSize * 2 }}
      >
        {/* Profile Circle in the center */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden"
          style={{ width: config.avatarSize, height: config.avatarSize }}
          variants={profileCircleVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 bg-primary/10 rounded-full"
          />
          <User className="text-primary" size={config.avatarSize * 0.6} />
        </motion.div>
        
        {/* Profile Elements orbiting */}
        {profileElements.map((element, index) => {
          // Calculate position in a circle around the profile
          const angle = (index / profileElements.length) * Math.PI * 2;
          const radius = config.avatarSize * 1.2;
          const top = 50 + Math.sin(angle) * radius;
          const left = 50 + Math.cos(angle) * radius;
          
          const Icon = element.icon;
          
          return (
            <motion.div
              key={element.label}
              className="absolute bg-white rounded-full shadow-md p-1.5 flex items-center justify-center"
              style={{ 
                top: `${top}%`, 
                left: `${left}%`,
                width: config.iconSize * 2, 
                height: config.iconSize * 2,
                marginTop: -config.iconSize,
                marginLeft: -config.iconSize
              }}
              variants={iconVariants}
              initial="initial"
              animate="animate"
              custom={index}
            >
              <Icon size={config.iconSize} className="text-primary" />
            </motion.div>
          );
        })}
      </div>
      
      {/* Loading Text */}
      <motion.div
        variants={textVariants}
        initial="initial"
        animate="animate"
        className={`${config.fontSize} text-gray-500 mt-2`}
      >
        {text}
      </motion.div>
    </div>
  );
}

export default ProfileLoadingAnimation;