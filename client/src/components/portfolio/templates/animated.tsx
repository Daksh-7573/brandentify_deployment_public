import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import '../../../styles/animated-template.css';
import { useLumosAnimations } from '@/hooks/use-lumos-animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Star,
  Calendar,
  Briefcase,
  Sparkles,
  Code,
  Play,
  Pause,
  Book,
  GraduationCap,
  TrendingUp,
  Plus,
  PlusCircle,
  X
} from 'lucide-react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { Service, Project, Skill, WorkExperience, Education } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import Lottie from 'react-lottie-player';

// Define component props
interface AnimatedTemplateProps {
  name: string;
  title: string;
  industry: string;
  domain: string;
  location: string;
  organization?: string;
  photoURL?: string | null;
  skills: Skill[];
  projects: Project[];
  experiences: WorkExperience[];
  educations: Education[];
  services: Service[];
  lookingFor?: string;
  email?: string;
}

// Animated Template Component
export default function AnimatedTemplate({
  name,
  title,
  industry,
  domain,
  location,
  organization,
  photoURL,
  skills = [], // Provide empty array fallbacks for all collections
  projects = [],
  experiences = [],
  educations = [],
  services = [],
  lookingFor,
  email
}: AnimatedTemplateProps) {
  // Use Lumos Animation hook
  const { initAmbientAuras, animateCardStack, addSparkleEffect, addTypingEffect } = useLumosAnimations();
  
  // Refs for sections for scroll animations
  const heroRef = useRef(null);
  const projectsRef = useRef(null);
  const timelineRef = useRef(null);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const educationRef = useRef(null);
  
  // Check if sections are in view to trigger animations
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.1 });
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.1 });
  const isAboutInView = useInView(aboutRef, { once: false, amount: 0.1 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.1 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.1 });
  
  // Typewriter effect for hero section
  const [typewriterText] = useTypewriter({
    words: [
      title || 'Creative Professional',
      `${industry || 'Digital'} Specialist`,
      `${domain || 'Design'} Expert`,
      'Portfolio',
    ],
    loop: true,
    typeSpeed: 80,
    deleteSpeed: 50,
    delaySpeed: 2000,
  });
  
  // Video states for projects
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  
  // Animation states
  const controls = useAnimation();
  
  // Organize skills into categories based on the skill name
  // This is a fallback mechanism since the schema might not have categories
  const categorizeSkills = (allSkills: Skill[]) => {
    const skillList = allSkills || [];
    const categories = {
      creative: [] as Skill[],
      technical: [] as Skill[],
      tools: [] as Skill[],
      other: [] as Skill[]
    };
    
    skillList.forEach(skill => {
      const name = skill.name.toLowerCase();
      
      if (name.includes('design') || name.includes('art') || name.includes('creat') || name.includes('ui') || name.includes('ux')) {
        categories.creative.push(skill);
      } else if (name.includes('develop') || name.includes('code') || name.includes('program') || name.includes('architecture')) {
        categories.technical.push(skill);
      } else if (name.includes('tool') || name.includes('software') || name.includes('framework') || name.includes('platform')) {
        categories.tools.push(skill);
      } else {
        categories.other.push(skill);
      }
    });
    
    return categories;
  };
  
  const skillCategories = categorizeSkills(skills);
  
  // Handle video toggle for projects
  const toggleProjectVideo = (index: number) => {
    if (activeVideoIndex === index) {
      setActiveVideoIndex(null);
    } else {
      setActiveVideoIndex(index);
    }
  };
  
  // Initialize animations when component mounts
  useEffect(() => {
    // Initialize all the Lumos animations
    initAmbientAuras('.hero-section');
    animateCardStack('.animated-project');
    addSparkleEffect('.skill-bar');
    addTypingEffect('.animated-title');
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Animation sequence
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
    
    // No cleanup needed as the animation hooks handle their own cleanup
  }, []);
  
  return (
    <div className="animated-template bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative hero-section" ref={heroRef}>
        <div className="hero-particle-container absolute inset-0 pointer-events-none" />
        
        {/* Animated background auras */}
        <div className="ambient-aura ambient-aura-1" />
        <div className="ambient-aura ambient-aura-2" />
        <div className="ambient-aura ambient-aura-3" />
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content */}
            <motion.div 
              className="lg:col-span-7 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 30 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Hello, I'm{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  {name || 'Creative Professional'}
                </span>
              </motion.h1>
              
              <motion.div 
                className="text-3xl md:text-5xl font-bold text-gray-300 h-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                  {typewriterText}
                </span>
                <Cursor cursorStyle="|" cursorColor="#0EA5E9" />
              </motion.div>
              
              <motion.p 
                className="text-xl text-gray-400 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Based in {location || 'a creative space'}, specializing in {domain || 'digital design'} 
                with expertise in interactive experiences and creative solutions.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 rounded-full text-lg font-medium flex items-center transition-all transform hover:scale-105 shadow-lg">
                  <span>View My Work</span>
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
                
                <Button variant="outline" className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-950/30 px-8 py-6 rounded-full text-lg font-medium flex items-center transition-all hover:text-purple-300">
                  <Download className="mr-2 h-5 w-5" />
                  <span>Download Resume</span>
                </Button>
              </motion.div>
              
              {/* Resume or skills teaser */}
              <motion.div 
                className="mt-8 pt-8 border-t border-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHeroInView ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <h3 className="text-lg font-medium text-gray-300 mb-4">Featured Skills</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skills && skills.slice(0, 6).map((skill, index) => (
                    <motion.div 
                      key={skill.id || index} 
                      className="bg-gray-800/40 rounded-lg p-3 border border-gray-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 10 }}
                      transition={{ duration: 0.4, delay: 1 + (index * 0.1) }}
                      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(139, 92, 246, 0.15)' }}
                    >
                      <div className="text-sm text-gray-400">{skill.name}</div>
                      <Progress 
                        value={skill.proficiency || 75} 
                        className="h-1.5 mt-2" 
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500" 
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
            
            {/* Hero Image/Profile */}
            <motion.div 
              className="lg:col-span-5 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isHeroInView ? 1 : 0, scale: isHeroInView ? 1 : 0.9 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative overflow-visible hero-profile">
                {/* Glowing background behind profile image */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-full filter blur-3xl opacity-70" />
                
                {/* Animated circles around profile */}
                <div className="profile-orbit profile-orbit-1">
                  <div className="profile-satellite bg-cyan-500"></div>
                </div>
                <div className="profile-orbit profile-orbit-2">
                  <div className="profile-satellite bg-purple-500"></div>
                </div>
                <div className="profile-orbit profile-orbit-3">
                  <div className="profile-satellite bg-pink-500"></div>
                </div>
                
                {/* Profile image */}
                <div className="w-64 h-64 sm:w-80 sm:h-80 relative z-10 rounded-full overflow-hidden border-4 border-purple-500/40 shadow-lg shadow-purple-500/30">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name} 
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        {name ? name.charAt(0) : '?'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Profile badges/cards */}
                <motion.div 
                  className="absolute -bottom-5 -right-5 bg-gray-800/90 backdrop-blur-sm p-3 rounded-xl border border-purple-500/30 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-sm font-medium text-gray-300">{industry || "Industry"}</div>
                  <div className="text-xs text-purple-400">{domain || "Domain"}</div>
                </motion.div>
                
                <motion.div 
                  className="absolute -top-5 -left-5 bg-gray-800/90 backdrop-blur-sm p-3 rounded-xl border border-blue-500/30 shadow-lg"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : -20 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  whileHover={{ y: 5 }}
                >
                  <div className="text-sm font-medium text-gray-300">{title || "Professional Title"}</div>
                  <div className="text-xs text-blue-400">{lookingFor || "Available for work"}</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: isHeroInView ? [0.4, 1, 0.4] : 0, 
              y: isHeroInView ? [0, 10, 0] : -10 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <ChevronDown className="h-8 w-8 text-purple-400" />
          </motion.div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="py-20 relative" ref={projectsRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isProjectsInView ? 1 : 0, y: isProjectsInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Featured Projects
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore my latest work and creative implementations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animated-projects">
            {projects && projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  className="animated-project bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: isProjectsInView ? 1 : 0, 
                    y: isProjectsInView ? 0 : 50
                  }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)' }}
                >
                  {/* Project Image */}
                  <div className="aspect-video overflow-hidden relative group">
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-purple-400 opacity-40" />
                      </div>
                    )}
                    
                    {/* Play/Pause Button if there's a video */}
                    <motion.button
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-purple-600/80 backdrop-blur-sm flex items-center justify-center text-white"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleProjectVideo(index)}
                    >
                      {activeVideoIndex === index ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </motion.button>
                    
                    {/* Project Category Badge */}
                    {project.category && (
                      <div className="absolute top-4 left-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="bg-purple-600/80 text-white text-sm py-1 px-3 rounded-full backdrop-blur-sm"
                        >
                          {project.category}
                        </motion.div>
                      </div>
                    )}
                  </div>
                  
                  {/* Project Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{project.title}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                    
                    {/* Project Tags/Technology */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* Using project.category as a fallback tag since tags field may not exist in schema */}
                      {project.category && (
                        <Badge className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Project Links */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.startDate || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      
                      <div className="flex gap-2">
                        {project.projectUrl && (
                          <motion.a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 p-1"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ExternalLink className="h-5 w-5" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: isProjectsInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4 opacity-60" />
                <h3 className="text-white text-xl font-bold mb-2">No Projects Yet</h3>
                <p className="text-gray-400">Projects will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* About Me Section */}
      <section id="about" className="py-20 relative animated-about" ref={aboutRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isAboutInView ? 1 : 0, y: isAboutInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                About Me
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              My journey, passion, and creative approach to making impactful digital experiences.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            {/* About Text */}
            <motion.div 
              className="md:col-span-3 bg-gray-800/30 rounded-xl p-8 border border-gray-700 shadow-lg relative overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isAboutInView ? 1 : 0, x: isAboutInView ? 0 : -50 }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated background shapes */}
              <motion.div 
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 backdrop-blur-3xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-500/10 backdrop-blur-3xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative">
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  I'm a passionate motion designer and creative developer with a focus on crafting immersive digital experiences. 
                  My work combines artistic vision with technical expertise to build products that engage and inspire.
                </p>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  With a background in {domain || 'digital arts'} and an eye for detail, I specialize in creating animations, 
                  interactive interfaces, and visual storytelling that connects with audiences on a deeper level.
                </p>
                
                <blockquote className="relative border-l-4 border-purple-500 pl-6 italic text-gray-300 my-8">
                  <motion.span 
                    className="absolute -left-3 text-4xl text-purple-500 opacity-50"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  >
                    "
                  </motion.span>
                  I believe that great design brings together art, technology, and human experience to create something memorable.
                  <motion.span 
                    className="absolute text-4xl text-purple-500 opacity-50"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
                  >
                    "
                  </motion.span>
                </blockquote>
                
                <p className="text-gray-300 text-lg leading-relaxed">
                  When I'm not designing or coding, you can find me exploring new creative tools, collaborating with other artists, 
                  or seeking inspiration through travel and experiences.
                </p>
              </div>
            </motion.div>
            
            {/* Stats and Expertise */}
            <motion.div 
              className="md:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: isAboutInView ? 1 : 0, x: isAboutInView ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Expertise Areas */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                  Areas of Expertise
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: "Motion Design", value: 90 },
                    { name: "Interactive Development", value: 85 },
                    { name: "UI Animation", value: 92 },
                    { name: "3D Visualization", value: 80 },
                  ].map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{skill.name}</span>
                        <span className="text-purple-400">{skill.value}%</span>
                      </div>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isAboutInView ? `${skill.value}%` : 0 }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        className="h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full skill-bar"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Work Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center"
                  whileHover={{ y: -5 }}
                >
                  <motion.span 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isAboutInView ? 1 : 0.8, 
                      opacity: isAboutInView ? 1 : 0 
                    }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    {projects.length}+
                  </motion.span>
                  <span className="text-gray-400 text-center">Projects Completed</span>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center"
                  whileHover={{ y: -5 }}
                >
                  <motion.span 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isAboutInView ? 1 : 0.8, 
                      opacity: isAboutInView ? 1 : 0 
                    }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    {experiences.length}+
                  </motion.span>
                  <span className="text-gray-400 text-center">Years Experience</span>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex flex-col items-center justify-center col-span-2"
                  whileHover={{ y: -5 }}
                >
                  <motion.span 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isAboutInView ? 1 : 0.8, 
                      opacity: isAboutInView ? 1 : 0 
                    }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    {services.length > 0 ? services.length : 3}+
                  </motion.span>
                  <span className="text-gray-400 text-center">Creative Services</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Career Timeline Section */}
      <section id="timeline" className="py-20 relative animated-timeline" ref={timelineRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isTimelineInView ? 1 : 0, y: isTimelineInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Career Journey
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              My professional path and significant milestones.
            </p>
          </motion.div>
          
          {/* Timeline Content */}
          <div className="relative timeline-container">
            {/* Timeline vertical line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500/80 via-orange-500/50 to-orange-500/20 transform md:-translate-x-1/2"></div>
            
            <div className="space-y-12">
              {experiences && experiences.length > 0 ? (
                experiences.map((experience, index) => (
                  <motion.div 
                    key={experience.id}
                    className="relative flex flex-col md:flex-row"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: isTimelineInView ? 1 : 0, y: isTimelineInView ? 0 : 50 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {/* Timeline node */}
                    <div className="timeline-node">
                      <motion.div 
                        className="absolute left-0 md:left-1/2 w-6 h-6 bg-orange-500 rounded-full shadow-lg shadow-orange-500/30 transform -translate-x-1/2 z-10"
                        initial={{ scale: 0 }}
                        animate={{ scale: isTimelineInView ? 1 : 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      >
                        <motion.div 
                          className="absolute inset-1 bg-orange-300 rounded-full"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Date */}
                    <div className="md:w-1/2 pr-8 pb-10 md:pb-0 md:text-right flex flex-col items-start md:items-end">
                      <motion.div 
                        className="bg-gray-800/40 px-4 py-2 rounded-lg inline-block"
                        whileHover={{ y: -3 }}
                      >
                        <span className="text-orange-400 font-medium">
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
                    
                    {/* Experience Card */}
                    <motion.div 
                      className="bg-gray-800/30 p-6 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-colors"
                      whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(251, 146, 60, 0.15)' }}
                    >
                      <h3 className="text-lg font-bold text-white mb-2">{experience.title}</h3>
                      <h4 className="text-orange-400 mb-3">{experience.company}</h4>
                      <p className="text-gray-400 mb-4 line-clamp-3">{experience.description}</p>
                      
                      {/* Location */}
                      {experience.location && (
                        <div className="flex items-center text-gray-500 text-sm mb-3">

                          <span>{experience.location}</span>
                        </div>
                      )}
                      
                      {/* Skills Used - Using industry or domain as a fallback skill */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {experience.industry && (
                          <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs">
                            {experience.industry}
                          </Badge>
                        )}
                        {experience.domain && (
                          <Badge className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs">
                            {experience.domain}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="w-full text-center py-12 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTimelineInView ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Briefcase className="h-12 w-12 text-orange-500 mx-auto mb-4 opacity-60" />
                  <h3 className="text-white text-xl font-bold mb-2">No Experience Entries Yet</h3>
                  <p className="text-gray-400">Career timeline will be displayed here once experience is added.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Education Section */}
      <section id="education" className="py-20 relative animated-education" ref={educationRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isEducationInView ? 1 : 0, y: isEducationInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Education
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              My academic background and professional certifications.
            </p>
          </motion.div>
          
          {/* Education Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {educations && educations.length > 0 ? (
              educations.map((education, index) => (
                <motion.div 
                  key={education.id}
                  className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden education-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: isEducationInView ? 1 : 0, y: isEducationInView ? 0 : 30 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: '0 10px 30px rgba(56, 189, 248, 0.2)',
                    borderColor: 'rgba(56, 189, 248, 0.3)' 
                  }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{education.institution}</h3>
                        <h4 className="text-cyan-400 mb-1">{education.degree}</h4>
                      </div>
                      <GraduationCap className="h-8 w-8 text-cyan-500 opacity-70" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 text-sm">
                      <div className="text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(education.startDate || '').getFullYear()} - 
                          {education.endDate 
                            ? new Date(education.endDate).getFullYear() 
                            : 'Present'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: isEducationInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Book className="h-12 w-12 text-cyan-500 mx-auto mb-4 opacity-60" />
                <h3 className="text-white text-xl font-bold mb-2">No Education Entries Yet</h3>
                <p className="text-gray-400">Education history will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Skills & Services Section */}
      <section id="skills" className="py-20 relative animated-skills" ref={skillsRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                Skills & Services
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Specialized tools, technologies, and creative services I offer.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Skills Column */}
            <div className="md:col-span-2 space-y-8">
              <motion.h3 
                className="text-2xl font-bold text-white mb-6 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-6 w-6 mr-2 text-teal-500" />
                Professional Skills
              </motion.h3>
              
              {/* Skill Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Creative Skills */}
                {skillCategories.creative.length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 skill-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)' }}
                  >
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center mr-2">
                        <TrendingUp className="h-4 w-4 text-teal-400" />
                      </div>
                      Creative Skills
                    </h4>
                    
                    <div className="space-y-3">
                      {skillCategories.creative.map((skill, index) => (
                        <motion.div 
                          key={skill.id}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                          transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                        >
                          <span className="text-gray-300">{skill.name}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <motion.div 
                                key={i}
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Star
                                  className={`h-4 w-4 ${i < (skill.proficiency || 3) ? 'text-teal-500' : 'text-gray-600'}`}
                                  fill={i < (skill.proficiency || 3) ? 'currentColor' : 'none'}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Technical Skills */}
                {skillCategories.technical.length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 skill-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)' }}
                  >
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                        <Code className="h-4 w-4 text-blue-400" />
                      </div>
                      Technical Skills
                    </h4>
                    
                    <div className="space-y-3">
                      {skillCategories.technical.map((skill, index) => (
                        <motion.div 
                          key={skill.id}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        >
                          <span className="text-gray-300">{skill.name}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <motion.div 
                                key={i}
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Star
                                  className={`h-4 w-4 ${i < (skill.proficiency || 3) ? 'text-blue-500' : 'text-gray-600'}`}
                                  fill={i < (skill.proficiency || 3) ? 'currentColor' : 'none'}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Services Column */}
            <div className="md:col-span-1">
              <motion.h3 
                className="text-2xl font-bold text-white mb-6 flex items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : 20 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-6 w-6 mr-2 text-green-500" />
                Services
              </motion.h3>
              
              <div className="space-y-4">
                {services && services.length > 0 ? (
                  services.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 service-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 20 }}
                      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                      whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)' }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-white">{service.title}</h4>
                        <div className="text-green-400 text-sm">
                          {service.category}
                        </div>
                      </div>
                      
                      <p className="text-gray-400 mt-2 mb-4 text-sm line-clamp-2">{service.description}</p>
                      
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                          Learn More
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="bg-gray-800/30 rounded-xl p-8 border border-gray-700 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <PlusCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-60" />
                    <h3 className="text-white text-xl font-bold mb-2">No Services Yet</h3>
                    <p className="text-gray-400 mb-4">Services will be displayed here once added.</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Footer */}
      <footer className="py-12 bg-gray-900/80 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {name}
              </h3>
              <p className="text-gray-500 mt-1">{title}</p>
            </div>
            
            <div className="text-gray-500 text-sm text-center">
              <p>© {new Date().getFullYear()} All rights reserved.</p>
              <p>Made with ✨ using React, Tailwind & Framer Motion</p>
            </div>
            
            <div className="mt-6 md:mt-0">
              <Button variant="outline" className="bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white">
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Back to top</span>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}