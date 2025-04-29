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
  User,
  X,
  Mail,
  Lightbulb,
  Maximize
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
  aboutMe?: string | null;
  whatIOffer?: string | null;
}

// Main animated portfolio component
const Animated: React.FC<AnimatedTemplateProps> = ({
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
  // For debugging purposes
  console.log("Animated template - whatIOffer:", whatIOffer);
  console.log("Animated template - aboutMe:", aboutMe);

  // Typewriter effect for the hero section
  const [typewriterText] = useTypewriter({
    words: [
      title || 'Creative Professional',
      industry ? `${industry} Specialist` : 'Industry Expert',
      domain ? `${domain} Expert` : 'Domain Expert',
    ],
    loop: true,
    delaySpeed: 2000,
    typeSpeed: 70,
    deleteSpeed: 50
  });

  // Refs for scrolling animations
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Check if sections are in view to trigger animations
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isAboutMeInView = useInView(aboutMeRef, { once: false, amount: 0.2 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.2 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.2 });
  const isServicesInView = useInView(servicesRef, { once: false, amount: 0.2 });
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.2 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.2 });
  const isContactInView = useInView(contactRef, { once: false, amount: 0.2 });

  // Animation controls for reactive animations
  const controls = useAnimation();

  // State for navigation
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // Track active section based on scroll position
  useEffect(() => {
    const sections = [
      { id: 'hero', ref: heroRef },
      { id: 'about', ref: aboutMeRef },
      { id: 'skills', ref: skillsRef },
      { id: 'projects', ref: projectsRef },
      { id: 'services', ref: servicesRef },
      { id: 'timeline', ref: timelineRef },
      { id: 'education', ref: educationRef },
      { id: 'contact', ref: contactRef }
    ];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      
      for (const section of sections) {
        const element = section.ref.current;
        if (!element) continue;
        
        const offsetTop = element.offsetTop;
        const height = element.offsetHeight;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get animations from a shared hook
  const animations = useLumosAnimations();

  // Service and Project interaction states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const toggleProjectVideo = (index: number) => {
    if (activeVideoIndex === index) {
      setActiveVideoIndex(null);
    } else {
      setActiveVideoIndex(index);
    }
  };

  // Navigation items
  const navItems = [
    { id: 'hero', label: 'Home', icon: <Star className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <User className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'timeline', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Send className="w-4 h-4" /> }
  ];

  return (
    <div className="animated-portfolio min-h-screen bg-gray-900 text-white font-sans">
      {/* Fixed Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-800/80 backdrop-blur-md rounded-full p-2 shadow-lg border border-gray-700/50">
          <div className="flex items-center space-x-1">
            {navItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`p-2 rounded-full transition-all duration-300 flex items-center ${
                  activeSection === item.id 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center relative pt-16 pb-32 animated-hero" ref={heroRef}>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Hero Content */}
            <motion.div 
              className="lg:w-3/5 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isHeroInView ? 1 : 0, y: isHeroInView ? 0 : 30 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Hi, I'm{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  {name}
                </span>
              </h1>
              
              <div className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 h-12 lg:h-16">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                  {typewriterText}
                </span>
                <Cursor cursorColor="#8B5CF6" />
              </div>
              
              <div className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                <p className="mb-2">
                  <span className="font-medium">Looking For: </span>
                  {lookingFor || "I create engaging digital experiences with innovation and technical expertise."}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {location && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  
                  {industry && (
                    <Badge className="bg-gray-800 text-gray-200 border border-gray-700">
                      {industry}
                    </Badge>
                  )}
                  
                  {domain && (
                    <Badge className="bg-gray-800 text-gray-200 border border-gray-700">
                      {domain}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a 
                  href="#contact" 
                  className="btn-primary px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1"
                >
                  Get in Touch
                </a>
                <a 
                  href="#projects" 
                  className="btn-secondary px-6 py-3 rounded-full bg-gray-800 border border-gray-700 text-white font-medium transition-all duration-300 hover:bg-gray-700 hover:-translate-y-1"
                >
                  Resume
                </a>
                <a 
                  href="#contact"
                  className="btn-secondary px-6 py-3 rounded-full bg-gray-800 border border-gray-700 text-white font-medium transition-all duration-300 hover:bg-gray-700 hover:-translate-y-1"
                >
                  Connect
                </a>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div 
              className="lg:w-2/5 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                scale: isHeroInView ? 1 : 0.9 
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Animated background elements */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-3xl"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-72 md:h-72 rounded-full border border-purple-500/30"
                  animate={{ 
                    rotate: 360,
                    borderWidth: [1, 2, 1],
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-56 md:h-56 rounded-full border border-blue-500/20"
                  animate={{ 
                    rotate: -360,
                  }}
                  transition={{ 
                    duration: 15, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Profile image */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-lg">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold">
                      {name ? name.charAt(0) : '?'}
                    </div>
                  )}
                </div>
                
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                    initial={{ 
                      x: Math.random() * 160 - 80, 
                      y: Math.random() * 160 - 80,
                      opacity: 0.5 + Math.random() * 0.5,
                      scale: 0.5 + Math.random() * 0.5,
                    }}
                    animate={{ 
                      x: Math.random() * 160 - 80, 
                      y: Math.random() * 160 - 80,
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ 
                      duration: 5 + Math.random() * 5, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-500 flex flex-col items-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </div>
        
        {/* Animated background */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden z-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-gray-900 z-10" />
          
          {/* Moving particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: Math.random() * 0.4 + 0.1,
                opacity: Math.random() * 0.5 + 0.1,
              }}
              animate={{ 
                y: [
                  Math.random() * 100 + "%", 
                  Math.random() * 100 + "%"
                ],
                opacity: [
                  Math.random() * 0.3 + 0.1,
                  Math.random() * 0.5 + 0.2,
                  Math.random() * 0.3 + 0.1
                ],
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{
                width: (Math.random() * 8 + 2) + "px",
                height: (Math.random() * 8 + 2) + "px",
                background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 100}, ${Math.random() * 255}, ${Math.random() * 0.5 + 0.1})`,
                borderRadius: "50%",
                position: "absolute",
              }}
            />
          ))}
        </div>
      </section>
      
      {/* About Me Section */}
      <section id="about" className="py-20 relative animated-about" ref={aboutMeRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isAboutMeInView ? 1 : 0, y: isAboutMeInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                What I'm All About
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get to know me beyond the resume
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isAboutMeInView ? 1 : 0, y: isAboutMeInView ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      Hello, I'm {name}
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">
                        {aboutMe || "I am passionate about creating exceptional digital experiences that combine aesthetic appeal with functional excellence. With a strong foundation in both design and development, I bring a unique perspective to every project I undertake."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-10 -right-5 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 backdrop-blur-sm"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 7, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
            </motion.div>
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl"></div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section id="skills" className="py-20 relative animated-skills" ref={skillsRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isSkillsInView ? 1 : 0, y: isSkillsInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                My Expertise
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A collection of skills I've mastered throughout my career.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <motion.div 
                  key={skill.id}
                  className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ 
                    opacity: isSkillsInView ? 1 : 0, 
                    y: isSkillsInView ? 0 : 40 
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)' }}
                >
                  <div className="p-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </div>
                      <motion.div 
                        className="absolute inset-0 rounded-full"
                        animate={{ 
                          boxShadow: ['0 0 0 0px rgba(139, 92, 246, 0.2)', '0 0 0 10px rgba(139, 92, 246, 0)'],
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: index * 0.1
                        }}
                      />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 text-center">{skill.name}</h3>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: isSkillsInView ? `${skill.proficiency || 70}%` : 0 }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                      
                      <div className="flex justify-between w-full">
                        <span className="text-xs text-gray-400 uppercase font-medium">
                          {skill.level || 'Intermediate'}
                        </span>
                        <span className="text-xs text-purple-400 font-bold">
                          {skill.proficiency || 70}%
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
                animate={{ opacity: isSkillsInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4 opacity-60" />
                <h3 className="text-white text-xl font-bold mb-2">No Skills Added Yet</h3>
                <p className="text-gray-400">Skills will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-20 relative animated-services" ref={servicesRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isServicesInView ? 1 : 0, y: isServicesInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                Services I Offer
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Expert solutions tailored to your specific needs.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services && services.length > 0 ? (
              services.map((service, index) => (
                <motion.div 
                  key={service.id}
                  className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ 
                    opacity: isServicesInView ? 1 : 0, 
                    y: isServicesInView ? 0 : 40 
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                      <PlusCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                    
                    <p className="text-gray-400 mb-6 min-h-[4rem]">
                      {service.description || 'Professional service with expert execution and attention to detail.'}
                    </p>
                    
                    <div className="bg-blue-500/10 rounded-lg py-2 px-4 inline-block mb-4">
                      <span className="text-blue-400 font-bold">
                        {service.priceUsd ? `$${service.priceUsd}` : 
                         (service.priceInr ? `₹${service.priceInr}` : 'Contact for pricing')}
                        {(service.priceUsd || service.priceInr) && service.isHourly ? '/hour' : ''}
                      </span>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, i) => (
                          <li key={i} className="text-gray-300 flex items-start">
                            <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mr-2 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <Button 
                      onClick={() => setSelectedService(service)}
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                    >
                      Order Now
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: isServicesInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4 opacity-60" />
                <h3 className="text-white text-xl font-bold mb-2">No Services Added Yet</h3>
                <p className="text-gray-400">Services will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
          
          {/* Service Modal */}
          <AnimatePresence>
            {selectedService && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedService(null)}
              >
                <motion.div 
                  className="bg-gray-800/90 max-w-2xl rounded-xl border border-gray-700 overflow-hidden backdrop-blur-xl"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold text-white">{selectedService.title}</h3>
                      <button 
                        onClick={() => setSelectedService(null)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-gray-300 leading-relaxed">
                        {selectedService.description || 'Professional service with expert execution and attention to detail.'}
                      </p>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-blue-500/10 rounded-lg py-2 px-4">
                          <div className="text-sm text-gray-400 mb-1">Price</div>
                          <div className="text-lg font-bold text-blue-400">
                            {selectedService.priceUsd ? `$${selectedService.priceUsd}` : 
                            (selectedService.priceInr ? `₹${selectedService.priceInr}` : 'Contact for pricing')}
                            {(selectedService.priceUsd || selectedService.priceInr) && selectedService.isHourly ? '/hour' : ''}
                          </div>
                        </div>
                        
                        <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                          <div className="text-sm text-gray-400 mb-1">Category</div>
                          <div className="text-lg font-bold text-white">
                            {selectedService.category || 'Professional Services'}
                          </div>
                        </div>
                      </div>
                      
                      {selectedService.features && selectedService.features.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-white mb-3">What's Included</h4>
                          <ul className="space-y-3 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            {selectedService.features.map((feature, i) => (
                              <li key={i} className="text-gray-300 flex items-start">
                                <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                  <ChevronRight className="w-4 h-4 text-blue-400" />
                                </div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <Button 
                          onClick={() => {
                            setSelectedService(null);
                            // Scroll to contact section
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white py-6"
                        >
                          Request This Service
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="py-20 relative animated-projects" ref={projectsRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isProjectsInView ? 1 : 0, y: isProjectsInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500">
                Featured Projects
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore my latest work and creative implementations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 animated-projects">
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
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Project Image - Smaller Square format */}
                  <div className="aspect-square overflow-hidden relative group">
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
                    
                    {/* Expand icon indicator for clicking */}
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 bg-purple-500/80 rounded-full">
                        <Maximize className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="p-4 bg-purple-900/20">
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight truncate">
                      {project.title}
                    </h3>
                    
                    {/* Project Date - with simpler formatting */}
                    <div className="text-xs text-white flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(project.startDate || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
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
          
          {/* Project Detail Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
              >
                <motion.div 
                  className="bg-gray-800/90 max-w-4xl rounded-xl border border-gray-700 overflow-hidden backdrop-blur-xl"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Project Image */}
                    <div className="aspect-square relative overflow-hidden bg-black">
                      {selectedProject.thumbnailUrl ? (
                        <img 
                          src={selectedProject.thumbnailUrl} 
                          alt={selectedProject.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <Sparkles className="h-16 w-16 text-purple-400 opacity-40" />
                        </div>
                      )}
                    </div>
                    
                    {/* Project Details */}
                    <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-white">{selectedProject.title}</h3>
                        <button 
                          onClick={() => setSelectedProject(null)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Description */}
                        <p className="text-gray-300 leading-relaxed">
                          {selectedProject.description || 'No description available for this project.'}
                        </p>
                        
                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Date */}
                          <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                            <div className="text-sm text-gray-400 mb-1">Date</div>
                            <div className="text-lg font-medium text-white">
                              {new Date(selectedProject.startDate || '').toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short'
                              })}
                            </div>
                          </div>
                          
                          {/* Category */}
                          {selectedProject.category && (
                            <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                              <div className="text-sm text-gray-400 mb-1">Category</div>
                              <div className="text-lg font-medium text-white">
                                {selectedProject.category}
                              </div>
                            </div>
                          )}
                          
                          {/* Industry */}
                          {selectedProject.industry && (
                            <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                              <div className="text-sm text-gray-400 mb-1">Industry</div>
                              <div className="text-lg font-medium text-white">
                                {selectedProject.industry}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Project URL */}
                        {selectedProject.projectUrl && (
                          <div className="pt-4">
                            <a 
                              href={selectedProject.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>View Project</span>
                            </a>
                          </div>
                        )}
                        
                        {/* Media Gallery - if there are more images */}
                        {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 1 && (
                          <div className="pt-4">
                            <h4 className="text-lg font-bold text-white mb-3">Project Gallery</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedProject.mediaUrls.map((url, i) => (
                                <div key={i} className="aspect-square rounded-md overflow-hidden">
                                  <img src={url} alt={`${selectedProject.title} - image ${i+1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
                        whileHover={{ y: -2 }}
                      >
                        <span className="text-orange-400 font-semibold">
                          {new Date(experience.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                          {' - '}
                          {experience.endDate ? new Date(experience.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          }) : 'Present'}
                        </span>
                      </motion.div>
                    </div>
                    
                    {/* Content */}
                    <motion.div 
                      className="md:w-1/2 pl-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700 shadow-lg"
                      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(234, 88, 12, 0.15)' }}
                    >
                      <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                      <h4 className="text-orange-400 font-medium mb-3">{experience.company}</h4>
                      
                      {experience.description && (
                        <p className="text-gray-300 mb-4">{experience.description}</p>
                      )}
                      
                      {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-gray-400 mb-2">Key Responsibilities</h5>
                          <ul className="space-y-1">
                            {experience.keyResponsibilities.map((responsibility, i) => (
                              <li key={i} className="text-gray-300 flex items-start">
                                <ChevronRight className="h-4 w-4 text-orange-400 mt-1 flex-shrink-0 mr-2" />
                                <span>{responsibility}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {experience.location && (
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                            {experience.location}
                          </div>
                        )}
                        
                        {experience.industry && (
                          <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {experience.industry}
                          </Badge>
                        )}
                        
                        {experience.domain && (
                          <Badge className="bg-gray-700 text-gray-300">
                            {experience.domain}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTimelineInView ? 1 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Briefcase className="h-12 w-12 text-orange-500 mx-auto mb-4 opacity-60" />
                  <h3 className="text-white text-xl font-bold mb-2">No Work Experience Yet</h3>
                  <p className="text-gray-400">Experience will be displayed here once added.</p>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
                Academic Background
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              My educational journey and qualifications.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {educations && educations.length > 0 ? (
              educations.map((education, index) => (
                <motion.div 
                  key={education.id}
                  className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500/50 shadow-lg transition-all duration-500"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: isEducationInView ? 1 : 0, y: isEducationInView ? 0 : 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(74, 222, 128, 0.1)' }}
                >
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-green-400" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{education.degree}</h3>
                        <h4 className="text-green-400 font-medium">{education.institution}</h4>
                      </div>
                    </div>
                    
                    <div className="mb-4 bg-gray-900/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(education.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                          {' - '}
                          {education.endDate ? new Date(education.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          }) : 'Present'}
                        </div>
                        
                        {education.location && (
                          <div className="text-sm text-gray-400 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {education.location}
                          </div>
                        )}
                      </div>
                      
                      {education.fieldOfStudy && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">Field of Study:</span>
                          <span className="ml-2 text-white">{education.fieldOfStudy}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {education.industry && (
                          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">
                            {education.industry}
                          </Badge>
                        )}
                        
                        {education.domain && (
                          <Badge className="bg-gray-700 text-gray-300">
                            {education.domain}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Skills Acquired</h5>
                        <div className="flex flex-wrap gap-2">
                          {education.skillsAcquired.map((skill, i) => (
                            <Badge key={i} className="bg-gray-700/50 text-gray-300 border border-gray-600/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
                <GraduationCap className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-60" />
                <h3 className="text-white text-xl font-bold mb-2">No Education Added Yet</h3>
                <p className="text-gray-400">Education will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 relative animated-contact" ref={contactRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isContactInView ? 1 : 0, y: isContactInView ? 0 : 30 }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Get In Touch
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Got a project in mind? Let's collaborate to create something amazing.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700 shadow-lg p-8 md:p-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isContactInView ? 1 : 0, y: isContactInView ? 0 : 30 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-white mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    {email && (
                      <a 
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40 hover:bg-gray-900/60 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Send className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Email</div>
                          <div className="text-white">{email}</div>
                        </div>
                      </a>
                    )}
                    
                    {location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/40">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Location</div>
                          <div className="text-white">{location}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Looking for:</h4>
                      <p className="text-gray-300">{lookingFor || "Exciting projects and collaborations with creative teams."}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold text-white mb-4">Send Message</h3>
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 py-6 text-lg"
                      onClick={() => {
                        if (email) {
                          window.location.href = `mailto:${email}`;
                        }
                      }}
                    >
                      <Mail className="w-5 h-5" />
                      Contact via Email
                    </Button>
                    
                    <p className="text-center text-gray-400">
                      I'll get back to you as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-white">{name}</h2>
              <p className="text-gray-400">{title}</p>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Animated;