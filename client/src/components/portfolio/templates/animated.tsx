import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import '../../../styles/animated-template.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  MessageCircle,
  Star,
  MapPin,
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
  Send,
  X
} from 'lucide-react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { Service, Project, Skill, WorkExperience, Education } from '@shared/schema';
import { Progress } from '@/components/ui/progress';
import Lottie from 'react-lottie-player';

// Import animation libraries
import { useLumosAnimations } from '@/hooks/use-lumos-animations';

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

export default function AnimatedTemplate({
  name,
  title,
  industry,
  domain,
  location,
  organization,
  photoURL,
  skills,
  projects,
  experiences,
  educations,
  services,
  lookingFor,
  email
}: AnimatedTemplateProps) {
  // Get animation utilities
  const {
    initAmbientAuras,
    animateCardStack,
    animateParallaxSlide
  } = useLumosAnimations();
  
  // Component state
  const [isShowing, setIsShowing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('projects');
  const [messageText, setMessageText] = useState('');
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Section refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  
  // For typewriter effect on title
  const [text] = useTypewriter({
    words: [title || 'Creative Professional', 'Motion Designer', 'VFX Specialist', 'Interactive Developer'],
    loop: true,
    delaySpeed: 2000
  });
  
  // Timeline refs and animations
  const timelineRef = useRef(null);
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.2 });
  const timelineAnimation = useAnimation();
  
  // Refs for scroll animations
  const projectsRef = useRef(null);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const educationRef = useRef(null);
  
  // Corresponding useInView hooks
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.2 });
  const isAboutInView = useInView(aboutRef, { once: false, amount: 0.2 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.2 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.2 });
  
  // Handler for scroll navigation
  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Suggested message options
  const messageOptions = [
    "Exciting job opportunities are available, and I believe you'd be a great fit.",
    "Would you be open to teaming up on innovative projects?",
    "Let's connect — I admire your work and would love to stay in touch.",
    "I'd like to explore a potential partnership opportunity with you.",
    "I have some exciting freelance projects you might be interested in."
  ];
  
  // Category filter for skills - using skill names since category is not in schema
  const skillCategories = {
    creative: skills.filter(skill => 
      ['design', 'animation', '3d', 'motion', 'video', 'creative', 'art', 'illustration'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      )
    ),
    technical: skills.filter(skill => 
      ['programming', 'development', 'code', 'software', 'technical', 'engineering'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      )
    ),
    tools: skills.filter(skill => 
      ['adobe', 'figma', 'sketch', 'blender', 'cinema', 'tool', 'suite', 'editor'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      )
    ),
    other: skills.filter(skill => 
      !['design', 'animation', '3d', 'motion', 'video', 'creative', 'art', 'illustration'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      ) && 
      !['programming', 'development', 'code', 'software', 'technical', 'engineering'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      ) && 
      !['adobe', 'figma', 'sketch', 'blender', 'cinema', 'tool', 'suite', 'editor'].some(keyword => 
        skill.name.toLowerCase().includes(keyword)
      )
    )
  };
  
  const handleLetsTalkClick = () => {
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  const handleSendMessage = () => {
    // Logic for sending message would go here
    alert('Message sent: ' + messageText);
    setMessageText('');
    setShowModal(false);
  };
  
  const handleSelectMessage = (msg: string) => {
    setMessageText(msg);
  };
  
  // Initialize animations when component mounts
  useEffect(() => {
    // Staggered animation sequence
    const timeout = setTimeout(() => {
      setIsShowing(true);
    }, 100);
    
    // Initialize Lumos animations
    setTimeout(() => {
      // Create ambient auras in the hero section
      initAmbientAuras('.animated-hero', 5);
      
      // Animate card stacks for projects and skills
      animateCardStack('.animated-projects');
      animateCardStack('.animated-skills');
      
      // Set up parallax slide animations for section transitions
      document.querySelectorAll('.section-title').forEach((title, index) => {
        title.classList.add('sparkle-trigger');
      });
      
      // Add tilt effect to appropriate cards
      document.querySelectorAll('.project-card, .skill-card').forEach((card) => {
        card.classList.add('tilt-card');
      });
      
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [initAmbientAuras, animateCardStack]);
  
  // Animate timeline when it comes into view
  useEffect(() => {
    if (isTimelineInView) {
      timelineAnimation.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, delay: 0.2 }
      });
    } else {
      timelineAnimation.start({ opacity: 0, x: -100 });
    }
  }, [isTimelineInView, timelineAnimation]);
  
  // Animate sections when they come into view
  useEffect(() => {
    if (isProjectsInView) {
      animateParallaxSlide('#projects', '.projects-content');
    }
  }, [isProjectsInView, animateParallaxSlide]);
  
  useEffect(() => {
    if (isSkillsInView) {
      animateParallaxSlide('#skills', '.skills-content');
    }
  }, [isSkillsInView, animateParallaxSlide]);
  
  useEffect(() => {
    if (isEducationInView) {
      animateParallaxSlide('#education', '.education-content');
    }
  }, [isEducationInView, animateParallaxSlide]);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-gray-900 min-h-screen font-sans overflow-x-hidden">
      {/* Floating CTA Button - Desktop */}
      <motion.div 
        className="fixed top-4 right-4 z-50 hidden md:flex space-x-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
          onClick={handleLetsTalkClick}
          onMouseEnter={() => setIsHoveringCTA(true)}
          onMouseLeave={() => setIsHoveringCTA(false)}
        >
          <span>Let's Talk</span>
          <motion.span
            animate={{ 
              x: isHoveringCTA ? [0, 5, 0] : 0,
              opacity: isHoveringCTA ? [1, 0.8, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: isHoveringCTA ? Infinity : 0 }}
          >
            <MessageCircle className="h-4 w-4" />
          </motion.span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
        >
          <span>Mentor</span>
          <motion.span 
            className="text-lg"
            animate={{ 
              rotate: isHoveringCTA ? [0, 15, -15, 0] : 0,
            }}
            transition={{ duration: 0.5, repeat: isHoveringCTA ? Infinity : 0 }}
          >
            🚀
          </motion.span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg"
        >
          <span>Grab My Resume</span>
          <motion.span 
            className="text-lg"
            animate={{ 
              y: isHoveringCTA ? [0, -3, 0] : 0,
            }}
            transition={{ duration: 0.4, repeat: isHoveringCTA ? Infinity : 0 }}
          >
            📄
          </motion.span>
        </motion.button>
      </motion.div>
      
      {/* Floating CTA Button - Mobile */}
      <motion.div 
        className="fixed bottom-4 right-4 z-50 md:hidden"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 rounded-full shadow-xl"
          onClick={handleLetsTalkClick}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-r from-yellow-400 to-pink-500 blur-sm"
          />
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      </motion.div>
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden animated-hero">
        {/* Background Animation */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{ 
            backgroundSize: "400% 400%",
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(138, 58, 185, 0.6) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.6) 0%, transparent 40%)" 
          }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            {/* Photo and Avatar Section */}
            <div className="md:col-span-2 flex justify-center">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
              >
                {/* Profile Image with Animation */}
                <motion.div
                  className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative bg-gradient-to-b from-violet-600 to-purple-700"
                  initial={{ y: 20 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                >
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name} 
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white font-bold">
                      {name.charAt(0)}
                    </div>
                  )}
                  
                  {/* Ripple Animation */}
                  <motion.div
                    className="absolute inset-0 border-4 border-purple-400 rounded-full"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                {/* Particles or Orbit Elements */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <motion.div 
                    key={index}
                    className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg flex items-center justify-center text-white"
                    style={{ 
                      top: `${45 + 30 * Math.sin(2 * Math.PI * index / 3)}%`,
                      left: `${45 + 30 * Math.cos(2 * Math.PI * index / 3)}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.2, duration: 0.5 }}
                  >
                    {index === 0 && <Sparkles className="h-6 w-6" />}
                    {index === 1 && <Code className="h-6 w-6" />}
                    {index === 2 && <Play className="h-6 w-6" />}
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Name and Information Section */}
            <div className="md:col-span-3 text-center md:text-left">
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {name}
              </motion.h1>
              
              <motion.div
                className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-bold mb-6 h-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span>I Am </span>
                <span className="relative">
                  <span className="text-teal-400">{text}</span>
                  <Cursor cursorStyle="_" cursorColor="#2dd4bf" />
                </span>
              </motion.div>
              
              {/* Industry & Domain Tags */}
              <motion.div 
                className="flex flex-wrap gap-3 justify-center md:justify-start mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {industry && (
                  <motion.div
                    whileHover={{ y: -4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-white text-base font-medium rounded-full">
                      #{industry}
                    </Badge>
                  </motion.div>
                )}
                {domain && (
                  <motion.div
                    whileHover={{ y: -4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className="bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-white text-base font-medium rounded-full">
                      #{domain}
                    </Badge>
                  </motion.div>
                )}
                {organization && (
                  <motion.div
                    whileHover={{ y: -4, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-white text-base font-medium rounded-full">
                      @{organization}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Location - Hidden by default, shows on hover */}
              {location && (
                <motion.div
                  className="inline-flex items-center text-gray-400 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  whileHover={{ 
                    scale: 1.05, 
                    color: "rgb(219, 39, 119)" // pink-600 
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                  </motion.div>
                  <span>{location}</span>
                </motion.div>
              )}
              
              {/* Looking For */}
              {lookingFor && (
                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-5 py-3 rounded-lg inline-flex items-center mb-8 relative overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                >
                  {/* Animated background elements */}
                  <motion.div 
                    className="absolute -inset-1 blur-lg opacity-30 rounded-lg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    style={{
                      background: "linear-gradient(45deg, #4f46e5, #7e22ce, #a21caf, #4f46e5)"
                    }}
                  />
                  
                  <span className="text-lg mr-2 text-white z-10">🎯</span>
                  <span className="font-medium z-10">
                    {lookingFor}
                  </span>
                </motion.div>
              )}
              
              {/* Section Navigation Links */}
              <motion.div 
                className="flex flex-wrap gap-4 justify-center md:justify-start mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {['projects', 'about', 'timeline', 'education', 'skills'].map((section, index) => (
                  <motion.button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 transition-all ${
                      activeSection === section 
                        ? 'border-purple-500 text-purple-500' 
                        : 'border-gray-700 text-gray-400 hover:text-white hover:border-white'
                    }`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <span className="capitalize">{section}</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Hero Scroll Indicator */}
              <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
              >
                <span className="text-sm mb-2">Scroll to Explore</span>
                <ChevronDown className="h-6 w-6" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="py-20 relative animated-projects" ref={projectsRef}>
        {/* Motion Background */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{ 
            backgroundSize: "200% 200%",
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(236, 72, 153, 0.6) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(124, 58, 237, 0.6) 0%, transparent 60%)" 
          }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isProjectsInView ? 1 : 0, y: isProjectsInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Featured Projects
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore my creative work and projects, featuring motion design, animation, and interactive experiences.
            </p>
          </motion.div>
          
          {/* Project Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  className="relative bg-gray-800/50 overflow-hidden rounded-xl border border-gray-700 group project-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: isProjectsInView ? 1 : 0, y: isProjectsInView ? 0 : 50 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Project Thumbnail with Hover Effects */}
                  <div className="relative h-64 overflow-hidden">
                    {project.thumbnailUrl ? (
                      <>
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-700 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{project.title}</span>
                      </div>
                    )}
                    
                    {/* Play/Pause Button Overlay */}
                    <motion.button
                      className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full backdrop-blur-sm hover:bg-white hover:text-black transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActiveProject(activeProject === project.id ? null : project.id);
                        setIsPlaying(!isPlaying);
                      }}
                    >
                      {activeProject === project.id && isPlaying ? (
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
                      {project.tags && Array.isArray(project.tags) && project.tags.map((tag: string, i: number) => (
                        <Badge key={i} className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                          {tag}
                        </Badge>
                      ))}
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
              My professional path through the creative and tech industries.
            </p>
          </motion.div>
          
          {/* Horizontal scrollable timeline */}
          <div className="relative pb-12 overflow-x-auto hide-scrollbar">
            <div className="absolute h-1 bg-gray-700 top-11 left-0 right-0" />
            
            <div className="relative flex space-x-12 min-w-max px-4">
              {experiences.length > 0 ? (
                experiences.map((experience, index) => (
                  <motion.div 
                    key={experience.id}
                    className="relative flex-none w-80"
                    initial={{ opacity: 0, y: 30 }}
                    animate={timelineAnimation}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  >
                    {/* Timeline Node */}
                    <motion.div 
                      className="absolute top-9 left-0 w-6 h-6 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 timeline-node"
                      initial={{ scale: 0 }}
                      animate={{ scale: isTimelineInView ? 1 : 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.2 }}
                    />
                    
                    {/* Date */}
                    <div className="mb-6 text-center">
                      <span className="text-sm bg-gray-800 text-orange-400 py-1 px-3 rounded-full inline-block">
                        {new Date(experience.startDate || '').getFullYear()} - 
                        {experience.endDate 
                          ? new Date(experience.endDate).getFullYear() 
                          : 'Present'}
                      </span>
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
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                      
                      {/* Skills Used */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {experience.skills?.split(',').map((skill, i) => (
                          <Badge key={i} className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
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
            {educations.length > 0 ? (
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
                        {education.fieldOfStudy && (
                          <p className="text-gray-400 text-sm">{education.fieldOfStudy}</p>
                        )}
                      </div>
                      <GraduationCap className="h-8 w-8 text-cyan-500 opacity-70" />
                    </div>
                    
                    <p className="text-gray-400 mb-4">{education.description}</p>
                    
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
                      
                      {education.grade && (
                        <div className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                          {education.grade}
                        </div>
                      )}
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
                
                {/* Tools */}
                {skillCategories.tools.length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)' }}
                  >
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                        <Briefcase className="h-4 w-4 text-purple-400" />
                      </div>
                      Tools & Software
                    </h4>
                    
                    <div className="space-y-3">
                      {skillCategories.tools.map((skill, index) => (
                        <motion.div 
                          key={skill.id}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
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
                                  className={`h-4 w-4 ${i < (skill.proficiency || 3) ? 'text-purple-500' : 'text-gray-600'}`}
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
                
                {/* Other Skills */}
                {skillCategories.other.length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)' }}
                  >
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center mr-2">
                        <Star className="h-4 w-4 text-pink-400" />
                      </div>
                      Other Skills
                    </h4>
                    
                    <div className="space-y-3">
                      {skillCategories.other.map((skill, index) => (
                        <motion.div 
                          key={skill.id}
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
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
                                  className={`h-4 w-4 ${i < (skill.proficiency || 3) ? 'text-pink-500' : 'text-gray-600'}`}
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
            <div className="space-y-8">
              <motion.h3 
                className="text-2xl font-bold text-white mb-6 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Plus className="h-6 w-6 mr-2 text-teal-500" />
                Services Offered
              </motion.h3>
              
              <div className="space-y-6">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 relative overflow-hidden group"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : 30 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      whileHover={{ 
                        y: -5,
                        boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)',
                        borderColor: 'rgba(45, 212, 191, 0.3)' 
                      }}
                    >
                      {/* Animated background element */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <h4 className="text-lg font-bold text-white mb-3">{service.name}</h4>
                      <p className="text-gray-400 mb-4">{service.description}</p>
                      
                      {/* Price Range */}
                      {service.priceRange && (
                        <div className="text-teal-400 text-sm font-medium mb-3">{service.priceRange}</div>
                      )}
                      
                      {/* Service Features/Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {service.features?.split(',').map((feature, i) => (
                          <Badge key={i} variant="secondary" className="bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {feature.trim()}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isSkillsInView ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <PlusCircle className="h-12 w-12 text-teal-500 mx-auto mb-4 opacity-60" />
                    <h3 className="text-white text-xl font-bold mb-2">No Services Listed Yet</h3>
                    <p className="text-gray-400">Services will be displayed here once added.</p>
                  </motion.div>
                )}
                
                {/* Example Services if none provided */}
                {services.length === 0 && (
                  <div className="space-y-6">
                    {[
                      { title: "Motion Design", desc: "Stunning animations for brands, products, and digital experiences." },
                      { title: "Interactive Development", desc: "Engaging web and app experiences with cutting-edge animations." },
                      { title: "3D Visualization", desc: "Immersive 3D models and environments for various applications." }
                    ].map((service, index) => (
                      <motion.div 
                        key={index}
                        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 relative overflow-hidden group"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: isSkillsInView ? 1 : 0, x: isSkillsInView ? 0 : 30 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        whileHover={{ 
                          y: -5,
                          boxShadow: '0 8px 30px rgba(45, 212, 191, 0.15)',
                          borderColor: 'rgba(45, 212, 191, 0.3)' 
                        }}
                      >
                        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-teal-500 to-transparent" />
                        <h4 className="text-lg font-bold text-white mb-3">{service.title}</h4>
                        <p className="text-gray-400">{service.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section & Footer */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">Let's Create Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Amazing</span></h2>
              <p className="text-gray-400 text-lg mb-8">
                Ready to collaborate on your next project? Let's connect and bring your vision to life with captivating animations and interactive experiences.
              </p>
              
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLetsTalkClick}
              >
                <span>Get in Touch</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </motion.button>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Animated graphic element */}
              <div className="aspect-square w-full max-w-md mx-auto relative">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                
                <motion.div 
                  className="absolute inset-10 rounded-full border-4 border-purple-500/30"
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div 
                  className="absolute inset-20 rounded-full border-4 border-pink-500/30"
                  animate={{ 
                    rotate: [360, 0],
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-5xl">🚀</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Footer */}
          <motion.div 
            className="border-t border-gray-800 mt-20 pt-8 text-center text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p className="mt-2">Designed with 💜 and motion</p>
          </motion.div>
        </div>
      </section>
      
      {/* Chat Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div 
              className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={handleCloseModal}
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-2">Let's Connect!</h3>
              <p className="text-gray-400 mb-6">Send me a message and I'll get back to you soon.</p>
              
              {/* Message Suggestions */}
              <div className="mb-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Select a message or write your own:</h4>
                {messageOptions.map((msg, idx) => (
                  <motion.button
                    key={idx}
                    className="block w-full text-left text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded border border-gray-700 transition-colors"
                    whileHover={{ x: 3 }}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    {msg}
                  </motion.button>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="mb-4">
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none transition"
                  rows={4}
                  placeholder="Write your message here... (350 char max)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value.slice(0, 350))}
                  maxLength={350}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {messageText.length}/350
                </div>
              </div>
              
              {/* Attachment */}
              <div className="flex items-center mb-6">
                <button className="text-gray-400 hover:text-purple-400 transition-colors">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </motion.div>
                </button>
                <span className="ml-2 text-gray-500 text-sm">Add attachment</span>
              </div>
              
              {/* Send Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <span>Send Message</span>
                <Send className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}