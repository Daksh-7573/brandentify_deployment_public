import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import '../../../styles/animated-template.css';
import { useLumosAnimations } from '@/hooks/use-lumos-animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MentorshipButton } from '@/components/shared/mentorship-button';
import { MentorshipDialog } from '@/components/shared/mentorship-dialog';
import PortfolioCtaButtons from '../portfolio-cta-buttons';
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
  
  tagline?: string | null;
  visionStatement?: string | null;
  missionStatement?: string | null;
  coreValues?: string[] | null;
  uniqueValueProposition?: string | null;
  primaryAudience?: string[] | null;
  secondaryAudience?: string[] | null;
  id?: number;
  currentUserId?: number;
}

// Utility function to normalize unknown JSONB fields to string arrays
const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  if (Array.isArray((v as any)?.values)) return (v as any).values.map(String);
  return [];
};

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
  tagline,
  visionStatement,
  missionStatement,
  coreValues,
  uniqueValueProposition,
  primaryAudience,
  secondaryAudience,
  id,
  currentUserId
}) => {


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
  const brandRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);

  // Check if sections are in view to trigger animations
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isBrandInView = useInView(brandRef, { once: false, amount: 0.2 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.2 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.2 });
  const isServicesInView = useInView(servicesRef, { once: false, amount: 0.2 });
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.2 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.2 });

  // Animation controls for reactive animations
  const controls = useAnimation();

  // State for navigation and dialogs
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Track active section based on scroll position
  useEffect(() => {
    const sections = [
      { id: 'hero', ref: heroRef },
      { id: 'brand', ref: brandRef },
      { id: 'skills', ref: skillsRef },
      { id: 'projects', ref: projectsRef },
      { id: 'services', ref: servicesRef },
      { id: 'timeline', ref: timelineRef },
      { id: 'education', ref: educationRef }
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
    { id: 'brand', label: 'Brand', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Code className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'timeline', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> }
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
      <section id="hero" className="min-h-screen flex items-center relative pt-10 pb-20 animated-hero" ref={heroRef}>
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
                <p className="break-all mb-2">
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
                <PortfolioCtaButtons 
                  variant="technical"
                  userId={id}
                  userName={name}
                  
                />
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
                    repeatType: "loop"
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
                    repeatType: "loop"
                  }}
                />
                
                <div 
                  className="relative mx-auto w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/30 shadow-[0_0_40px_rgba(139,92,246,0.6)] z-10 bg-gray-800 flex items-center justify-center overflow-hidden mb-8"
                >
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.opacity = '1';
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-4xl md:text-6xl font-bold text-white bg-gradient-to-br from-purple-600 to-blue-600"
                    >
                      {name ? name.charAt(0).toUpperCase() : '?'}
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
      
      {/* My Professional Brand Section */}
      <section id="brand" className="py-12 relative" ref={brandRef}>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 section-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                My Professional Brand
              </span>
            </h2>
          </motion.div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-300">Tagline / Personal Motto</h3>
              </div>
              <p className="text-gray-300 italic text-lg whitespace-pre-wrap break-words">"{tagline || "Innovating the future through technical excellence and creative design."}"</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-blue-300">Vision Statement</h3>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{visionStatement || "To become a global leader in providing innovative solutions that empower individuals and organizations to reach their full potential."}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 backdrop-blur-md rounded-2xl p-6 border border-teal-500/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6 text-teal-400" />
                  <h3 className="text-xl font-semibold text-teal-300">Mission Statement</h3>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{missionStatement || "My mission is to deliver high-quality, impactful projects by combining technical expertise with a user-centric approach to problem-solving."}</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 backdrop-blur-md rounded-2xl p-6 border border-rose-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-rose-400" />
                <h3 className="text-xl font-semibold text-rose-300">Core Values</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {coreValues && coreValues.length > 0 ? (
                  coreValues.map((value: string, index: number) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-full text-rose-300 font-medium"
                    >
                      {value}
                    </span>
                  ))
                ) : (
                  ["Innovation", "Integrity", "Excellence", "Collaboration", "Customer-Centricity"].map((value, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-full text-rose-300 font-medium"
                    >
                      {value}
                    </span>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 backdrop-blur-md rounded-2xl p-6 border border-amber-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <h3 className="text-xl font-semibold text-amber-300">Unique Value Proposition</h3>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{uniqueValueProposition || "I bridge the gap between complex technology and intuitive user experiences, providing tailored solutions that drive real business growth."}</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section id="skills" className="py-12 relative animated-skills" ref={skillsRef}>
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
                    <h3 className="text-xl font-bold text-white mb-2 text-center">{skill.name}</h3>
                    
                    {((skill as any).category || (skill as any).yearsOfExperience) && (
                      <div className="flex flex-wrap gap-2 justify-center mb-3 text-xs">
                        {(skill as any).category && (
                          <span className="bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                            {(skill as any).category}
                          </span>
                        )}
                        {(skill as any).yearsOfExperience && (
                          <span className="bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded">
                            {(skill as any).yearsOfExperience}y
                          </span>
                        )}
                      </div>
                    )}
                    
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
      <section id="services" className="py-12 relative animated-services" ref={servicesRef}>
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
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                    
                    {service.description && (
                      <p className="text-gray-400 mb-6 flex-grow">
                        {service.description}
                      </p>
                    )}
                    
                    {(() => {
                      const features = toStringArray(service.features);
                      return features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {features.map((feature, i) => (
                            <li key={i} className="text-gray-300 flex items-start">
                              <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mr-2 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                    
                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                      <div className="bg-blue-500/10 rounded-lg py-2 px-4 inline-block">
                        <span className="text-blue-400 font-bold text-lg">
                          {service.priceUsd ? `$${service.priceUsd}` : 
                           (service.priceInr ? `₹${service.priceInr}` : 'Contact for pricing')}
                          {(service.priceUsd || service.priceInr) && service.isHourly ? '/hour' : ''}
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
                        {selectedService.description}
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
                      
                      {(() => {
                        const features = toStringArray(selectedService.features);
                        return features.length > 0 && (
                          <div>
                            <h4 className="text-lg font-bold text-white mb-3">What's Included</h4>
                            <ul className="space-y-3 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                              {features.map((feature, i) => (
                                <li key={i} className="text-gray-300 flex items-start">
                                  <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <ChevronRight className="w-4 h-4 text-blue-400" />
                                  </div>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      
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
      <section id="projects" className="py-12 relative animated-projects" ref={projectsRef}>
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 animated-projects">
            {projects && projects.length > 0 ? (
              projects.slice(0, 6).map((project, index) => (
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
                  {/* Project Image - Even Smaller Square format */}
                  <div className="aspect-square overflow-hidden relative group w-full max-w-[200px] mx-auto">
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
                          <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                            <div className="text-sm text-gray-400 mb-1">Category</div>
                            <div className="text-lg font-medium text-white">
                              {selectedProject.category || 'Not specified'}
                            </div>
                          </div>
                          
                          {/* Industry */}
                          <div className="bg-gray-700/50 rounded-lg py-2 px-4">
                            <div className="text-sm text-gray-400 mb-1">Industry</div>
                            <div className="text-lg font-medium text-white">
                              {selectedProject.industry || 'Not specified'}
                            </div>
                          </div>
                          
                        </div>
                        
                        {/* Project URL - Moved outside the grid for more space */}
                        <div className="mt-4 bg-gray-700/50 rounded-lg py-2 px-4">
                          <div className="text-sm text-gray-400 mb-1">Project URL</div>
                          <div className="text-base font-medium text-white break-all">
                            {selectedProject.projectUrl ? (
                              <a 
                                href={selectedProject.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                <span className="break-all">{selectedProject.projectUrl}</span>
                              </a>
                            ) : (
                              'Not specified'
                            )}
                          </div>
                        </div>
                        
                        {/* Media Gallery - if there are more images */}
                        {(() => {
                          const mediaUrls = toStringArray(selectedProject.mediaUrls);
                          return mediaUrls.length > 1 && (
                            <div className="pt-4">
                              <h4 className="text-lg font-bold text-white mb-3">Project Gallery</h4>
                              <div className="grid grid-cols-3 gap-2">
                                {mediaUrls.map((url, i) => (
                                  <div key={i} className="aspect-square rounded-md overflow-hidden">
                                    <img src={url} alt={`${selectedProject.title} - image ${i+1}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
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
      <section id="timeline" className="py-12 relative animated-timeline" ref={timelineRef}>
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
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-full opacity-30" />
            
            <div className="space-y-16">
              {experiences && experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <motion.div 
                    key={exp.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ 
                      opacity: isTimelineInView ? 1 : 0, 
                      x: isTimelineInView ? 0 : (index % 2 === 0 ? -50 : 50) 
                    }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gray-900 border-4 border-purple-500 z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                    
                    {/* Experience Card */}
                    <div className={`w-[45%] ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                        <span className="text-purple-400 font-bold mb-2 block">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          {' - '}
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{exp.title}</h3>
                        <p className={`text-gray-400 font-medium mb-3 flex items-center gap-2 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          {index % 2 !== 0 && <Briefcase className="h-4 w-4" />}
                          {exp.company}
                          {index % 2 === 0 && <Briefcase className="h-4 w-4" />}
                        </p>
                        
                        <div className={`flex flex-wrap gap-3 mb-4 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          {exp.location && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <MapPin className="h-4 w-4" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                          {exp.industry && (
                            <Badge className="bg-gray-800 text-gray-200 border border-gray-700">
                              {exp.industry}
                            </Badge>
                          )}
                          {exp.domain && (
                            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                              {exp.domain}
                            </Badge>
                          )}
                        </div>

                        <p className={`text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                          {exp.description}
                        </p>

                        {(() => {
                          const responsibilities = toStringArray(exp.keyResponsibilities);
                          return responsibilities.length > 0 && (
                            <div className={`mt-4 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                              <h5 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Key Responsibilities</h5>
                              <ul className="space-y-1">
                                {responsibilities.map((responsibility, i) => (
                                  <li key={i} className={`text-gray-300 text-xs flex items-start ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                    <ChevronRight className={`h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0 ${index % 2 === 0 ? 'ml-1 rotate-180' : 'mr-1'}`} />
                                    <span>{responsibility}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-400">No work experience available.</div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Education Section */}
      <section id="education" className="py-12 relative animated-education" ref={educationRef}>
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
                    
                    {(() => {
                      const skillsAcquired = toStringArray(education.skillsAcquired);
                      return skillsAcquired.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-400 mb-2">Skills Acquired</h5>
                          <div className="flex flex-wrap gap-2">
                            {skillsAcquired.map((skill, i) => (
                              <Badge key={i} className="bg-gray-700/50 text-gray-300 border border-gray-600/20">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
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