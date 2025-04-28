import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import '@/styles/animated-odyssey.css'; // Adding the CSS import
import { MapPin, Briefcase, ExternalLink, Calendar, Award, GraduationCap, Mail, Code, Users, Shield } from 'lucide-react';
import { ProfileImage } from '@/components/ui/profile-image';

// Type definitions
interface AnimatedOdysseyProps {
  name: string;
  title: string;
  industry: string;
  domain: string;
  location: string;
  photoURL: string | null;
  skills: any[];
  projects: any[];
  experiences: any[];
  educations: any[];
  services: any[];
  lookingFor: string;
  email: string;
  aboutMe: string | null;
  whatIOffer: string | null;
}

const AnimatedOdyssey: React.FC<AnimatedOdysseyProps> = ({
  name,
  title,
  industry,
  domain,
  location,
  photoURL,
  skills,
  projects,
  experiences,
  educations,
  services,
  lookingFor,
  email,
  aboutMe,
  whatIOffer
}) => {
  // Section refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  
  // Check if sections are in view
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.3 });
  const isServicesInView = useInView(servicesRef, { once: false, amount: 0.3 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.3 });
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.3 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.3 });
  
  // Main scroll animation
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Parallax values based on mouse position
  const bgX = useTransform(
    () => mousePosition.x * 20,
    (value) => `${value}px`
  );
  
  const bgY = useTransform(
    () => mousePosition.y * 20,
    (value) => `${value}px`
  );
  
  const profileRotateX = useTransform(
    () => -mousePosition.y * 15,
    (value) => `${value}deg`
  );
  
  const profileRotateY = useTransform(
    () => mousePosition.x * 15,
    (value) => `${value}deg`
  );
  
  // Colors for the theme
  const colors = {
    background: "#050816",
    primary: "#915eff",
    secondary: "#00cea8",
    accent: "#ff5e69",
    text: "#f7f7f7",
    textSubtle: "#aaa6c3",
  };
  
  // Get content text for About section
  const aboutMeContent = whatIOffer || aboutMe || 
    `I am a passionate professional with a focus on innovation and creativity. My background combines technical expertise with a keen eye for design, allowing me to deliver comprehensive solutions that meet client needs.`;

  return (
    <div className="animated-odyssey bg-[#050816] text-white min-h-screen overflow-x-hidden">
      {/* Background Stars Effect */}
      <div className="fixed inset-0 z-0 opacity-80">
        <div className="stars-container absolute inset-0 overflow-hidden">
          <div 
            className="stars-bg absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(2px 2px at calc(50% + var(--x)) calc(50% + var(--y)), rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0))",
              backgroundSize: "120px 120px",
              transform: `translate3d(${bgX.get()}, ${bgY.get()}, 0)`,
              '--x': bgX.get(),
              '--y': bgY.get(),
            } as any}
          ></div>
          <div 
            className="aurora-bg absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, rgba(145, 94, 255, 0.1), rgba(0, 206, 168, 0.1))',
              filter: 'blur(80px)',
              transform: `translate3d(${bgX.get() * -1.5}, ${bgY.get() * -1.5}, 0)`,
            }}
          ></div>
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
      />
      
      {/* Hero Section */}
      <section 
        id="hero" 
        ref={heroRef} 
        className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 z-10"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 50 
              }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
              className="relative mb-8"
            >
              {/* Orbiting effect around profile */}
              <motion.div
                animate={{ 
                  rotateZ: [0, 360]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-purple-500/30 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                    className="w-3 h-3 rounded-full bg-purple-500"
                  />
                </div>
              </motion.div>
              
              {/* Profile Image */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHeroInView ? 1 : 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.6 
                }}
                style={{
                  rotateX: profileRotateX,
                  rotateY: profileRotateY
                }}
                className="relative z-10"
              >
                <ProfileImage 
                  src={photoURL} 
                  alt={name}
                  className="w-32 h-32 rounded-full border-4 border-purple-600 shadow-lg shadow-purple-500/30"
                />
              </motion.div>
            </motion.div>
            
            {/* Name & Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                scale: isHeroInView ? 1 : 0.8 
              }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400"
            >
              {name}
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="text-xl md:text-2xl font-medium mb-5 text-white/80"
            >
              {title}
            </motion.h2>
            
            {/* Location & Industry Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.7, delay: 1.2 }}
              className="flex flex-wrap gap-4 justify-center mb-8"
            >
              {location && (
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-teal-400" />
                  <span className="text-white/80">{location}</span>
                </div>
              )}
              
              {industry && (
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  <span className="text-white/80">{industry}</span>
                </div>
              )}
              
              {domain && (
                <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Code className="h-4 w-4 text-blue-400" />
                  <span className="text-white/80">{domain}</span>
                </div>
              )}
            </motion.div>
            
            {/* Looking For Badge */}
            {lookingFor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  scale: isHeroInView ? 1 : 0.8 
                }}
                transition={{ duration: 0.7, delay: 1.4 }}
                className="mb-10"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(145, 94, 255, 0.2)',
                      '0 0 0 10px rgba(145, 94, 255, 0)',
                      '0 0 0 0 rgba(145, 94, 255, 0.2)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-md px-5 py-2 rounded-lg border border-purple-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="text-white">Looking for: <span className="font-semibold">{lookingFor}</span></span>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {/* Scroll Down Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: isHeroInView ? [0.5, 1, 0.5] : 0, 
                y: isHeroInView ? [0, 10, 0] : 10 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 2 
              }}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 flex flex-col items-center"
            >
              <span className="text-sm mb-2">Scroll to Explore</span>
              <div className="w-5 h-10 rounded-full border-2 border-white/20 flex justify-center">
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                  className="w-2 h-2 rounded-full bg-white mt-1"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* About Me Section */}
      <section 
        id="about" 
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isHeroInView ? 1 : 0,
              y: isHeroInView ? 0 : 30
            }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              What I'm All About
            </h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHeroInView ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/80 text-lg leading-relaxed space-y-4"
            >
              {aboutMeContent}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section 
        id="skills" 
        ref={skillsRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isSkillsInView ? 1 : 0,
              y: isSkillsInView ? 0 : 30
            }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              What I'm Good At
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              My professional toolkit includes these skills and technologies
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {skills && skills.length > 0 ? skills.map((skill, index) => (
              <motion.div
                key={skill.id || index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: isSkillsInView ? 1 : 0,
                  scale: isSkillsInView ? 1 : 0.8,
                  y: isSkillsInView ? 0 : 20
                }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.1 * index,
                  type: "spring", 
                  stiffness: 100 
                }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: [-1, 1, -1, 0],
                  transition: { 
                    rotate: { 
                      duration: 0.3, 
                      repeat: 3, 
                      repeatType: "reverse" 
                    }
                  }
                }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center"
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* 3D Skill Bubble */}
                <div className="relative mb-5 h-20 w-20">
                  <motion.div
                    animate={{ 
                      rotateY: [0, 360],
                      boxShadow: [
                        '0 0 15px 0px rgba(145, 94, 255, 0.3)',
                        '0 0 20px 2px rgba(0, 206, 168, 0.3)',
                        '0 0 15px 0px rgba(145, 94, 255, 0.3)'
                      ]
                    }}
                    transition={{ 
                      rotateY: { 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear" 
                      },
                      boxShadow: {
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                    className="absolute inset-0 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center"
                    style={{ 
                      background: 'radial-gradient(circle at 30% 30%, rgba(145, 94, 255, 0.3) 0%, rgba(0, 206, 168, 0.3) 100%)'
                    }}
                  />
                  
                  {/* Energy Fill based on proficiency */}
                  <motion.div
                    initial={{ height: "0%" }}
                    animate={{ 
                      height: isSkillsInView ? `${skill.proficiency || 85}%` : "0%" 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.2 * index + 0.3,
                      ease: "easeOut" 
                    }}
                    className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-blue-500/80 to-purple-500/30 backdrop-blur-sm"
                    style={{ maxHeight: "100%" }}
                  />
                  
                  {/* Skill Name */}
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <span className="font-medium">{skill.name}</span>
                  </div>
                </div>
                
                {/* Skill Details */}
                <h3 className="text-xl font-semibold mb-1">{skill.name}</h3>
                
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                  className="text-teal-400 font-bold"
                >
                  {skill.proficiency || 85}%
                </motion.div>
                
                <div className="mt-3 text-sm text-white/60">
                  {skill.level || 'Advanced'}
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isSkillsInView ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="col-span-full text-center py-10"
              >
                <div className="text-white/60">No skills added yet</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section 
        id="services" 
        ref={servicesRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isServicesInView ? 1 : 0,
              y: isServicesInView ? 0 : 30
            }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-500">
              What I Offer
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Services I provide to help you achieve your goals
            </p>
          </motion.div>
          
          <div className="relative py-10">
            {/* Tilted Carousel */}
            <div 
              className="w-full overflow-hidden py-10" 
              style={{ 
                perspective: "1000px"
              }}
            >
              <motion.div 
                initial={{ rotateX: 45, opacity: 0 }}
                animate={{ 
                  rotateX: isServicesInView ? 10 : 45,
                  opacity: isServicesInView ? 1 : 0,
                  z: -100
                }}
                transition={{ 
                  duration: 1,
                  type: "spring",
                  damping: 15
                }}
                className="flex gap-6 px-4 py-10"
                style={{ 
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center"
                }}
              >
                {services && services.length > 0 ? services.map((service, index) => (
                  <motion.div
                    key={service.id || index}
                    initial={{ 
                      x: 100 * (index - 1),
                      opacity: 0,
                      scale: 0.8
                    }}
                    animate={{ 
                      x: isServicesInView ? 0 : 100 * (index - 1),
                      opacity: isServicesInView ? 1 : 0,
                      scale: isServicesInView ? 1 : 0.8
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.15 * index + 0.1,
                      type: "spring",
                      damping: 25
                    }}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 10px 30px -10px rgba(145, 94, 255, 0.4)",
                      transition: { duration: 0.3 }
                    }}
                    className="flex-shrink-0 w-full max-w-sm bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 relative"
                    style={{ 
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Service Card */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                      
                      <p className="text-white/70 line-clamp-3">{service.description}</p>
                      
                      {/* Price Badge */}
                      {service.price && (
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(145, 94, 255, 0.2)',
                              '0 0 0 5px rgba(145, 94, 255, 0)',
                              '0 0 0 0 rgba(145, 94, 255, 0.2)'
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            delay: index * 0.3
                          }}
                          className="inline-flex items-center bg-purple-500/20 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-500/30"
                        >
                          <span className="text-purple-300 font-semibold">
                            {service.isHourly ? 'From ' : ''}
                            ₹{service.price} {service.isHourly ? '/hr' : ''}
                            {service.price_usd ? ` ($${service.price_usd})` : ''}
                          </span>
                        </motion.div>
                      )}
                      
                      {/* Service Features */}
                      <ul className="space-y-2 mt-6">
                        {service.features && service.features.length > 0 ? 
                          service.features.map((feature: string, idx: number) => (
                            <motion.li 
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ 
                                opacity: isServicesInView ? 1 : 0,
                                x: isServicesInView ? 0 : -20
                              }}
                              transition={{ 
                                duration: 0.5, 
                                delay: 0.5 + (idx * 0.1)
                              }}
                              className="flex items-start gap-2"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.3, 1],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                  duration: 0.5,
                                  delay: 1 + (idx * 0.2),
                                  repeat: 1,
                                  repeatDelay: 5
                                }}
                                className="text-teal-400 mt-0.5"
                              >
                                <Shield className="h-4 w-4" />
                              </motion.div>
                              <span className="text-white/80 text-sm">{feature}</span>
                            </motion.li>
                          )) : (
                            <li className="text-white/60 text-sm">Features not specified</li>
                          )
                        }
                      </ul>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isServicesInView ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full text-center py-10"
                  >
                    <div className="text-white/60">No services added yet</div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section 
        id="projects" 
        ref={projectsRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isProjectsInView ? 1 : 0,
              y: isProjectsInView ? 0 : 30
            }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              Project Showcase
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Featured works and creative projects
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {projects && projects.length > 0 ? projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  x: (index % 3 - 1) * 30
                }}
                animate={{ 
                  opacity: isProjectsInView ? 1 : 0,
                  y: isProjectsInView ? 0 : 50,
                  x: isProjectsInView ? 0 : (index % 3 - 1) * 30
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1 * index,
                  type: "spring",
                  damping: 25 
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                {/* Project Thumbnail */}
                <div 
                  className="aspect-video overflow-hidden relative"
                  style={{ background: project.thumbnailUrl ? 'none' : 'linear-gradient(45deg, rgba(145, 94, 255, 0.2), rgba(255, 94, 105, 0.2))' }}
                >
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code className="w-10 h-10 text-white/40" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full">
                      <motion.h3 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300"
                      >
                        {project.title}
                      </motion.h3>
                      
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(project.startDate || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Project Details */}
                <div className="p-4 space-y-3">
                  <p className="text-white/70 text-sm line-clamp-3">
                    {project.description || 'No description available'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.industry && (
                      <Badge variant="outline" className="bg-white/5 text-white/80 hover:bg-white/10 border-white/10">
                        {project.industry}
                      </Badge>
                    )}
                    
                    {project.category && (
                      <Badge variant="outline" className="bg-white/5 text-white/80 hover:bg-white/10 border-white/10">
                        {project.category}
                      </Badge>
                    )}
                  </div>
                  
                  {project.projectUrl && (
                    <motion.a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300 mt-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Project</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isProjectsInView ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="col-span-full text-center py-10"
              >
                <div className="text-white/60">No projects added yet</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Timeline / Experience Section */}
      <section 
        id="experience" 
        ref={timelineRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isTimelineInView ? 1 : 0,
              y: isTimelineInView ? 0 : 30
            }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
              Career Path
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              My professional journey and key milestones
            </p>
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Vertical Line */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ 
                height: isTimelineInView ? "100%" : 0
              }}
              transition={{ duration: 1 }}
              className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/80 via-blue-500/50 to-blue-500/20 transform md:-translate-x-1/2"
            />
            
            {/* Timeline Items */}
            <div className="space-y-16">
              {experiences && experiences.length > 0 ? experiences.map((experience, index) => (
                <motion.div 
                  key={experience.id}
                  initial={{ 
                    opacity: 0, 
                    y: 50,
                    x: index % 2 === 0 ? -50 : 50 
                  }}
                  animate={{ 
                    opacity: isTimelineInView ? 1 : 0,
                    y: isTimelineInView ? 0 : 50,
                    x: isTimelineInView ? 0 : (index % 2 === 0 ? -50 : 50)
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.2 * index,
                    type: "spring",
                    damping: 25
                  }}
                  className="relative flex flex-col md:flex-row items-start"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-0 md:left-1/2 top-0 transform -translate-x-1/2 z-10 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: isTimelineInView ? 1 : 0
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 15,
                        delay: 0.3 + index * 0.1
                      }}
                      className="w-6 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center"
                    >
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: "loop" 
                        }}
                        className="w-3 h-3 rounded-full bg-blue-200"
                      />
                    </motion.div>
                  </div>
                  
                  {/* Date Badge - Left or Right */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:left-1/2'} pb-6 md:pb-0`}>
                    <motion.div 
                      whileHover={{ y: -3 }}
                      className="inline-block bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10"
                    >
                      <span className="text-blue-400 font-medium">
                        {new Date(experience.startDate || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })} - {' '}
                        {experience.endDate 
                          ? new Date(experience.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short'
                            })
                          : 'Present'}
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Experience Content - Left or Right */}
                  <motion.div 
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 30px -15px rgba(0, 206, 168, 0.5)"
                    }}
                    className={`bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 transition-all duration-300 hover:border-teal-500/30 md:w-1/2 ${index % 2 !== 0 ? 'md:pr-12' : 'md:pl-12 md:left-1/2'}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                        
                        <Badge className="bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border-teal-500/30">
                          {experience.company}
                        </Badge>
                      </div>
                      
                      {experience.description && (
                        <p className="text-white/70">
                          {experience.description}
                        </p>
                      )}
                      
                      {/* Key Responsibilities */}
                      {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-white/80 mb-2">Key Responsibilities:</h4>
                          <ul className="space-y-1">
                            {(experience.keyResponsibilities as string[]).map((item, idx) => (
                              <motion.li 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ 
                                  opacity: isTimelineInView ? 1 : 0,
                                  x: isTimelineInView ? 0 : -10
                                }}
                                transition={{ 
                                  duration: 0.5, 
                                  delay: 0.5 + (idx * 0.1)
                                }}
                                className="flex items-start gap-2"
                              >
                                <motion.div
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 5, -5, 0]
                                  }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 1 + (idx * 0.2),
                                    repeat: 1,
                                    repeatDelay: 5
                                  }}
                                  className="text-teal-400 mt-1.5"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                </motion.div>
                                <span className="text-white/80 text-sm">{item}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Location & Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {experience.location && (
                          <div className="flex items-center gap-1 text-sm text-white/60">
                            <MapPin className="h-3 w-3" />
                            <span>{experience.location}</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {experience.industry && (
                            <Badge variant="outline" className="bg-white/5 text-white/70 hover:bg-white/10 border-white/10 text-xs">
                              {experience.industry}
                            </Badge>
                          )}
                          
                          {experience.domain && (
                            <Badge variant="outline" className="bg-white/5 text-white/70 hover:bg-white/10 border-white/10 text-xs">
                              {experience.domain}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTimelineInView ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-10"
                >
                  <Briefcase className="h-12 w-12 text-blue-500/30 mx-auto mb-4" />
                  <div className="text-white/60">No work experience added yet</div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Education Section */}
      <section 
        id="education" 
        ref={educationRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isEducationInView ? 1 : 0,
              y: isEducationInView ? 0 : 30
            }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Academic Background
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Educational qualifications and learning journey
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto space-y-12">
            {educations && educations.length > 0 ? educations.map((education, index) => (
              <motion.div 
                key={education.id}
                initial={{ 
                  opacity: 0, 
                  y: 50,
                  rotate: -2
                }}
                animate={{ 
                  opacity: isEducationInView ? 1 : 0,
                  y: isEducationInView ? 0 : 50,
                  rotate: isEducationInView ? 0 : -2
                }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.2 * index,
                  type: "spring",
                  damping: 25
                }}
                whileHover={{ 
                  y: -10,
                  rotate: 1,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Left: Degree & Institution */}
                    <div className="md:w-2/5 space-y-2">
                      <motion.div
                        animate={{
                          rotateY: isEducationInView ? [0, 0, 0] : [90, 0, 0]
                        }}
                        transition={{
                          duration: 0.7,
                          delay: 0.3 + index * 0.2,
                          ease: "easeOut"
                        }}
                      >
                        <h3 className="text-xl font-bold text-white">{education.degree}</h3>
                        <h4 className="text-lg text-pink-400">{education.institution}</h4>
                      </motion.div>
                      
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(education.startDate || '').toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })} - {' '}
                          {education.endDate 
                            ? new Date(education.endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short'
                              })
                            : 'Present'}
                        </span>
                      </div>
                      
                      {education.location && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <MapPin className="h-4 w-4" />
                          <span>{education.location}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {education.fieldOfStudy && (
                          <Badge className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border-pink-500/30">
                            {education.fieldOfStudy}
                          </Badge>
                        )}
                        
                        {education.industry && (
                          <Badge variant="outline" className="bg-white/5 text-white/70 hover:bg-white/10 border-white/10">
                            {education.industry}
                          </Badge>
                        )}
                        
                        {education.domain && (
                          <Badge variant="outline" className="bg-white/5 text-white/70 hover:bg-white/10 border-white/10">
                            {education.domain}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Skills Acquired */}
                    <div className="md:w-3/5">
                      {education.skillsAcquired && (education.skillsAcquired as string[]).length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4 text-pink-400" />
                            <span>Skills Acquired</span>
                          </h4>
                          
                          <div className="flex flex-wrap gap-2">
                            {(education.skillsAcquired as string[]).map((skill, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{
                                  opacity: 0,
                                  y: -20,
                                  rotate: -5
                                }}
                                animate={{
                                  opacity: isEducationInView ? 1 : 0,
                                  y: isEducationInView ? 0 : -20,
                                  rotate: isEducationInView ? 0 : -5
                                }}
                                transition={{
                                  duration: 0.5,
                                  delay: 0.5 + (idx * 0.07),
                                  type: "spring",
                                  stiffness: 200
                                }}
                                whileHover={{
                                  y: -5,
                                  rotate: -3,
                                  scale: 1.05,
                                  transition: { duration: 0.2 }
                                }}
                                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-purple-500/20"
                              >
                                <span className="text-white/90 text-sm">{skill}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-white/50 text-sm italic">No skills information available</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isEducationInView ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10"
              >
                <GraduationCap className="h-12 w-12 text-pink-500/30 mx-auto mb-4" />
                <div className="text-white/60">No education entries added yet</div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer CTA Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1
        }}
        transition={{ 
          duration: 0.7,
          delay: 0.3,
          type: "spring",
          damping: 20
        }}
        className="fixed bottom-0 left-0 right-0 z-20"
      >
        <motion.div 
          animate={{
            y: [5, 0, 5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="max-w-2xl mx-auto mb-6 px-4"
        >
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl shadow-purple-500/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white">Like what you see?</h3>
                <p className="text-white/70 text-sm">Let's connect and explore opportunities</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <motion.a
                  href={`mailto:${email}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-colors duration-300"
                >
                  <Mail className="h-4 w-4" />
                  <span>Let's Talk</span>
                </motion.a>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 text-white py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white/15 transition-colors duration-300"
                >
                  <Award className="h-4 w-4" />
                  <span>Grab My Resume</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedOdyssey;