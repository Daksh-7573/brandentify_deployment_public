import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Skill, WorkExperience, Education, Service } from '@shared/schema';
import { ProjectFull } from '@/types';
import { ProfileImage } from '@/components/ui/profile-image';
import { Button } from '@/components/ui/button';
import { 
  Send, Download, ArrowRight, MapPin, Briefcase, GraduationCap, 
  Link as LinkIcon, ExternalLink, Play, Sparkles, Star, Award,
  MessageSquare, FileText, Code, Brush, Video, User, Gift
} from 'lucide-react';
import useTypewriter from '@/hooks/use-typewriter';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

const staggerScaleIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const drawLinePath = {
  hidden: { pathLength: 0 },
  visible: { 
    pathLength: 1,
    transition: { 
      duration: 2,
      ease: "easeInOut"
    }
  }
};

interface UserInfo {
  name: string | null;
  title: string | null;
  industry: string | null;
  domain: string | null;
  location: string | null;
  email: string | null;
  photoURL: string | null;
  lookingFor: string | null;
  jobLevel?: string | null;
}

interface AnimatedProps {
  userInfo: UserInfo;
  userSkills: Skill[];
  userServices: Service[];
  userExperiences: WorkExperience[];
  userEducations: Education[];
  userProjects: ProjectFull[];
}

export default function Animated({
  userInfo,
  userSkills,
  userServices,
  userExperiences,
  userEducations,
  userProjects
}: AnimatedProps) {
  // For type writer effect
  const nameText = useTypewriter({
    text: `I am ${userInfo.name || 'a Motion Designer'}`,
    loop: false,
    speed: 80,
    delay: 1000,
  });
  
  const titleText = useTypewriter({
    text: userInfo.title || 'Motion Interface Artist',
    loop: false,
    speed: 80,
    delay: 2500,
  });

  // For scroll progress animation
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Skills randomization for animated bubbles effect
  const [randomizedSkills, setRandomizedSkills] = useState<Skill[]>([]);
  
  // For project modal/lightbox
  const [selectedProject, setSelectedProject] = useState<ProjectFull | null>(null);
  
  // Setup randomized positions for skill bubbles
  useEffect(() => {
    if (userSkills && userSkills.length > 0) {
      const skills = [...userSkills];
      setRandomizedSkills(skills);
    }
  }, [userSkills]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white overflow-hidden">
      {/* Animated cursor or particle effect (simplified implementation) */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <motion.path
            d="M0,100 Q150,150 300,100 T600,100"
            stroke="rgba(0, 255, 200, 0.2)"
            strokeWidth="3"
            fill="transparent"
            initial="hidden"
            animate="visible"
            variants={drawLinePath}
          />
        </svg>
      </div>

      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 z-50"
        style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
      />

      {/* Header/Hero Section */}
      <section className="relative pt-20 pb-16 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Profile image with animated mask */}
            <motion.div 
              className="md:col-span-4 flex justify-center"
              initial="hidden"
              animate="visible"
              variants={scaleIn}
            >
              <motion.div
                className="relative w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shadow-cyan-500/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <ProfileImage 
                  src={userInfo.photoURL || ''} 
                  alt={userInfo.name || 'Profile'} 
                  className="w-full h-full object-cover"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-violet-500/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </motion.div>
            </motion.div>

            {/* User info */}
            <motion.div 
              className="md:col-span-8 text-center md:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerItems}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500"
                variants={itemFadeIn}
              >
                {nameText}
              </motion.h1>
              
              <motion.div 
                className="mt-2 text-xl md:text-2xl text-cyan-300 font-medium"
                variants={itemFadeIn}
              >
                {titleText}
              </motion.div>

              {userInfo.location && (
                <motion.div 
                  className="flex items-center justify-center md:justify-start mt-3"
                  variants={itemFadeIn}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.8, type: "spring" }}
                  >
                    <MapPin className="h-4 w-4 text-pink-500 mr-1" />
                  </motion.span>
                  <span className="text-gray-300 text-sm">
                    {userInfo.location}
                  </span>
                </motion.div>
              )}

              {/* Industry/Domain chips */}
              <motion.div 
                className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start"
                variants={staggerScaleIn}
                initial="hidden"
                animate="visible"
              >
                {userInfo.industry && (
                  <motion.span
                    className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-cyan-800 to-cyan-600 text-white"
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(6, 182, 212, 0.8)" }}
                  >
                    {userInfo.industry}
                  </motion.span>
                )}
                
                {userInfo.domain && (
                  <motion.span
                    className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-violet-800 to-violet-600 text-white"
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(139, 92, 246, 0.8)" }}
                  >
                    {userInfo.domain}
                  </motion.span>
                )}
                
                {userInfo.jobLevel && (
                  <motion.span
                    className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-fuchsia-800 to-fuchsia-600 text-white"
                    variants={scaleIn}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(217, 70, 239, 0.8)" }}
                  >
                    {userInfo.jobLevel}
                  </motion.span>
                )}
              </motion.div>

              {/* Looking for badge */}
              {userInfo.lookingFor && (
                <motion.div 
                  className="mt-6 inline-block"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: 3, duration: 0.5 }
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center gap-2 border border-pink-400/30"
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(236, 72, 153, 0.3)", "0 0 20px rgba(236, 72, 153, 0.7)", "0 0 0px rgba(236, 72, 153, 0.3)"],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-pink-300" />
                    <span className="font-medium">Looking for: {userInfo.lookingFor}</span>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About section */}
      <motion.section 
        id="about"
        className="py-16 px-6 md:px-12 lg:px-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            What I'm All About
          </motion.h2>
          
          <motion.div 
            className="prose prose-lg prose-invert max-w-none"
            initial="hidden"
            animate="visible"
            variants={staggerItems}
          >
            <motion.p variants={itemFadeIn} className="text-gray-300">
              {userInfo.title ? 
                `As a ${userInfo.title}${userInfo.industry ? ` in the ${userInfo.industry} industry` : ''}, I specialize in creating immersive digital experiences that blend technical precision with artistic expression.` : 
                'I specialize in creating immersive digital experiences that blend technical precision with artistic expression.'}
            </motion.p>
            <motion.p variants={itemFadeIn} className="text-gray-300">
              My work focuses on motion-driven interfaces, interactive animations, and visual storytelling that captures attention and creates memorable user experiences.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Skills section - Animated bubbles */}
      <motion.section 
        id="skills"
        className="py-16 px-6 md:px-12 lg:px-24 relative bg-black/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            What I'm Good At
          </motion.h2>

          {randomizedSkills.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 relative min-h-[300px]"
              variants={staggerScaleIn}
            >
              {randomizedSkills.map((skill, index) => (
                <motion.div
                  key={skill.id || index}
                  className="flex justify-center"
                  variants={scaleIn}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  <motion.div 
                    className="relative h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600 p-0.5 shadow-lg cursor-pointer"
                    animate={{ 
                      y: [0, -10, 0],
                      scale: [1, 1.02, 1],
                      rotate: [0, skill.id % 2 === 0 ? 5 : -5, 0]
                    }}
                    transition={{ 
                      duration: 3 + (index % 3), 
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: index * 0.2 % 2
                    }}
                  >
                    <div className="absolute inset-0.5 rounded-full bg-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-medium text-white">{skill.name}</p>
                        <div className="mt-1 flex justify-center">
                          {Array.from({ length: Math.min(5, Math.max(1, skill.proficiency)) }).map((_, i) => (
                            <motion.span 
                              key={i}
                              className="text-cyan-400 text-xs"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + (i * 0.1) }}
                            >
                              ★
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-10 text-gray-500"
              variants={fadeIn}
            >
              <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No skills added yet. Add your top skills to showcase your expertise.</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        id="services"
        className="py-16 px-6 md:px-12 lg:px-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-teal-500 to-green-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            What I Offer
          </motion.h2>

          {userServices && userServices.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerItems}
            >
              {userServices.map((service, index) => (
                <motion.div
                  key={service.id || index}
                  className="relative overflow-hidden group"
                  variants={itemFadeIn}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    className="rounded-xl p-0.5 bg-gradient-to-br from-teal-400 to-indigo-400"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 * index, duration: 0.5 }}
                  >
                    <div className="bg-gray-900 rounded-xl p-6 h-full flex flex-col">
                      <motion.div 
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center mb-4"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: index * 0.3 % 2
                        }}
                      >
                        <Gift className="h-6 w-6 text-white" />
                      </motion.div>
                      
                      <motion.h3 
                        className="text-xl font-bold text-white mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + (0.1 * index) }}
                      >
                        {service.title}
                      </motion.h3>
                      
                      <motion.div 
                        className="text-gray-400 flex-grow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + (0.1 * index) }}
                      >
                        {service.description}
                      </motion.div>
                      
                      <motion.div 
                        className="mt-4 flex flex-wrap gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + (0.1 * index) }}
                      >
                        {service.category && (
                          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                            {service.category}
                          </Badge>
                        )}
                        {service.rate && (
                          <Badge variant="outline" className="border-teal-500 text-teal-400">
                            {service.rate}
                          </Badge>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-10 text-gray-500"
              variants={fadeIn}
            >
              <Gift className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No services added yet. Showcase what you can offer to potential clients.</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section 
        id="projects"
        className="py-16 px-6 md:px-12 lg:px-24 relative bg-black/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-pink-500 to-orange-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Showcase
          </motion.h2>

          {userProjects && userProjects.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerItems}
            >
              {userProjects.map((project, index) => (
                <motion.div
                  key={project.id || index}
                  className="relative group cursor-pointer"
                  variants={itemFadeIn}
                  onClick={() => setSelectedProject(project)}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="rounded-xl overflow-hidden aspect-video relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    {/* Project thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 z-10"></div>
                    
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-700 to-purple-900 flex items-center justify-center">
                        <Video className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                    
                    {/* Overlay with details */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 flex flex-col justify-end p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 * index }}
                    >
                      <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                      
                      <div className="flex items-center mt-2 gap-2">
                        {project.category && (
                          <Badge className="bg-pink-600 hover:bg-pink-700">
                            {project.category}
                          </Badge>
                        )}
                        
                        <motion.div 
                          className="ml-auto bg-white/10 rounded-full p-1"
                          whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          <ArrowRight className="h-4 w-4 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-10 text-gray-500"
              variants={fadeIn}
            >
              <Brush className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No projects added yet. Showcase your best work to attract opportunities.</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Experience Section with animated timeline */}
      <motion.section 
        id="experience"
        className="py-16 px-6 md:px-12 lg:px-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Career Path
          </motion.h2>

          {userExperiences && userExperiences.length > 0 ? (
            <div className="relative">
              {/* Animated timeline line */}
              <motion.div 
                className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "100%", opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5 }}
              />
              
              <motion.div 
                className="space-y-12 relative"
                variants={staggerItems}
              >
                {userExperiences.map((experience, index) => (
                  <motion.div
                    key={experience.id || index}
                    className={`flex flex-col md:flex-row gap-4 md:gap-8 relative ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                    variants={itemFadeIn}
                  >
                    {/* Timeline dot */}
                    <motion.div 
                      className="absolute left-0 md:left-1/2 h-5 w-5 rounded-full bg-blue-500 transform -translate-x-1/2 z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + (index * 0.2) }}
                    >
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-blue-400 opacity-50"
                        animate={{ 
                          scale: [1, 1.6, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>
                    
                    {/* Content card */}
                    <motion.div 
                      className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (index * 0.2) }}
                    >
                      <Card className="overflow-hidden bg-gray-900 border-0 shadow-xl">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                            <motion.div 
                              className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              <Briefcase className="h-4 w-4 text-white" />
                            </motion.div>
                          </div>
                          
                          <div className="text-gray-400 mb-2">
                            {experience.company}
                            {experience.location && <span> • {experience.location}</span>}
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            {experience.startDate && (
                              <>
                                {new Date(experience.startDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}
                                {experience.endDate ? ` - ${new Date(experience.endDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}` : ' - Present'}
                              </>
                            )}
                          </div>
                          
                          <p className="text-gray-300">{experience.description}</p>
                          
                          {(experience.industry || experience.domain) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {experience.industry && (
                                <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                                  {experience.industry}
                                </Badge>
                              )}
                              {experience.domain && (
                                <Badge variant="secondary" className="bg-indigo-900/50 text-indigo-300">
                                  {experience.domain}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            <motion.div 
              className="text-center py-10 text-gray-500"
              variants={fadeIn}
            >
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No work experience added yet. Share your professional journey to showcase your career path.</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section 
        id="education"
        className="py-16 px-6 md:px-12 lg:px-24 relative bg-black/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ delay: 0.3, duration: 1 }}
            className="h-1 bg-gradient-to-r from-yellow-500 to-amber-500 mb-8"
          ></motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Academic Background
          </motion.h2>

          {userEducations && userEducations.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerItems}
            >
              {userEducations.map((education, index) => (
                <motion.div
                  key={education.id || index}
                  className="relative"
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div 
                    className="rounded-xl p-0.5 bg-gradient-to-br from-yellow-400 to-amber-600"
                    initial={{ x: index % 2 === 0 ? -30 : 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    <Card className="bg-gray-900 border-0 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{education.degree}</h3>
                          <motion.div 
                            className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 10, 0]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut"
                            }}
                          >
                            <GraduationCap className="h-5 w-5 text-white" />
                          </motion.div>
                        </div>
                        
                        <div className="text-gray-300 mb-2">
                          {education.institution}
                          {education.location && <span> • {education.location}</span>}
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-4">
                          {education.startDate && (
                            <>
                              {new Date(education.startDate).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short' 
                              })}
                              {education.endDate ? ` - ${new Date(education.endDate).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short' 
                              })}` : ' - Present'}
                            </>
                          )}
                        </div>
                        
                        {education.description && (
                          <p className="text-gray-400 mt-2">{education.description}</p>
                        )}
                        
                        {education.achievements && (
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <Award className="h-4 w-4 text-yellow-500 mr-2" />
                              <span className="text-sm font-medium text-yellow-400">Achievements</span>
                            </div>
                            <p className="text-gray-400 pl-6">{education.achievements}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-10 text-gray-500"
              variants={fadeIn}
            >
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No education details added yet. Share your academic achievements.</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-6 md:px-12 lg:px-24 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerItems}
          >
            {/* Contact button */}
            <motion.div
              className="relative"
              variants={itemFadeIn}
            >
              <motion.div 
                className="rounded-xl p-0.5 bg-gradient-to-br from-cyan-400 to-blue-600"
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-900 border-0 h-full">
                  <div className="p-8 flex flex-col items-center text-center h-full">
                    <motion.div 
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6"
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <MessageSquare className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">Let's Talk</h3>
                    <p className="text-gray-400 mb-6">Have a project in mind? Let's discuss your ideas and create something amazing together.</p>
                    
                    <motion.div 
                      className="mt-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 text-white font-medium"
                      >
                        <motion.span 
                          className="flex items-center"
                          animate={{ 
                            x: [0, 5, 0]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          Say Hello <Send className="h-4 w-4 ml-2" />
                        </motion.span>
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
            
            {/* Resume button */}
            <motion.div
              className="relative"
              variants={itemFadeIn}
            >
              <motion.div 
                className="rounded-xl p-0.5 bg-gradient-to-br from-purple-400 to-pink-600"
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-900 border-0 h-full">
                  <div className="p-8 flex flex-col items-center text-center h-full">
                    <motion.div 
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6"
                      animate={{ 
                        rotate: [0, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 0.5
                      }}
                    >
                      <FileText className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">Grab My Resume</h3>
                    <p className="text-gray-400 mb-6">Download my full resume to learn more about my skills, experience, and qualifications.</p>
                    
                    <motion.div 
                      className="mt-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-purple-500 text-purple-400 hover:bg-purple-950/30 font-medium"
                      >
                        <motion.span 
                          className="flex items-center"
                          animate={{ 
                            y: [0, -5, 0]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: 0.2
                          }}
                        >
                          Download CV <Download className="h-4 w-4 ml-2" />
                        </motion.span>
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Project Modal/Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-gray-900 border-0 overflow-hidden">
                {/* Gallery/Image */}
                <div className="aspect-video relative overflow-hidden">
                  {selectedProject.thumbnailUrl ? (
                    <img 
                      src={selectedProject.thumbnailUrl} 
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center">
                      <Video className="h-16 w-16 text-white/60" />
                    </div>
                  )}
                  
                  {/* Close button */}
                  <button 
                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                    onClick={() => setSelectedProject(null)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
                      
                      <div className="text-sm text-gray-400 mt-1">
                        {selectedProject.startDate && (
                          <span>{new Date(selectedProject.startDate).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long'
                          })}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {selectedProject.category && (
                        <Badge className="bg-purple-600 hover:bg-purple-700">
                          {selectedProject.category}
                        </Badge>
                      )}
                      
                      {selectedProject.projectUrl && (
                        <a 
                          href={selectedProject.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" /> View Project
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{selectedProject.description}</p>
                  
                  {/* Media gallery */}
                  {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-white mb-3">Project Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedProject.mediaUrls.map((url, idx) => (
                          <motion.div 
                            key={idx}
                            className="aspect-video rounded-md overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                          >
                            <img 
                              src={url} 
                              alt={`${selectedProject.title} gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}