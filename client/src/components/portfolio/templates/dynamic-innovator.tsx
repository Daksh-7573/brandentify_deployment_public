import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { 
  Code, Zap, Cpu, Bot, Brain, Database, Terminal, 
  Linkedin, Github, Mail, ExternalLink, Download, 
  GraduationCap, Briefcase, MapPin, Calendar, ChevronRightCircle,
  Rocket, CircuitBoard, Server, Laptop, Globe, Layers, Check,
  LucideIcon, MessageCircle
} from "lucide-react";

interface DynamicInnovatorProps {
  userInfo: {
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

export function DynamicInnovator({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: DynamicInnovatorProps) {
  // State for terminal typing animation
  const [typedText, setTypedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // State for tilt effect
  const [tiltPosition, setTiltPosition] = useState({ x: 0, y: 0 });
  
  // State for active section
  const [activeSection, setActiveSection] = useState("about");
  
  // References to sections for scrolling
  const sectionRefs = {
    about: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null)
  };
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Group skills by category
  const groupedSkills = {
    technical: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('python') || 
      s.name.toLowerCase().includes('java') || 
      s.name.toLowerCase().includes('c++') || 
      s.name.toLowerCase().includes('javascript') ||
      s.name.toLowerCase().includes('programming') ||
      s.name.toLowerCase().includes('coding') ||
      s.name.toLowerCase().includes('development')
    ),
    data: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('data') || 
      s.name.toLowerCase().includes('analytics') || 
      s.name.toLowerCase().includes('analysis') ||
      s.name.toLowerCase().includes('sql') ||
      s.name.toLowerCase().includes('database')
    ),
    ai: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('ai') || 
      s.name.toLowerCase().includes('machine learning') || 
      s.name.toLowerCase().includes('deep learning') ||
      s.name.toLowerCase().includes('nlp') ||
      s.name.toLowerCase().includes('computer vision')
    ),
    soft: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('leadership') || 
      s.name.toLowerCase().includes('communication') || 
      s.name.toLowerCase().includes('teamwork') ||
      s.name.toLowerCase().includes('problem solving') ||
      s.name.toLowerCase().includes('critical thinking')
    ),
    other: sortedSkills.filter(s => 
      !s.name.toLowerCase().includes('python') && 
      !s.name.toLowerCase().includes('java') && 
      !s.name.toLowerCase().includes('c++') && 
      !s.name.toLowerCase().includes('javascript') &&
      !s.name.toLowerCase().includes('programming') &&
      !s.name.toLowerCase().includes('coding') &&
      !s.name.toLowerCase().includes('development') &&
      !s.name.toLowerCase().includes('data') && 
      !s.name.toLowerCase().includes('analytics') && 
      !s.name.toLowerCase().includes('analysis') &&
      !s.name.toLowerCase().includes('sql') &&
      !s.name.toLowerCase().includes('database') &&
      !s.name.toLowerCase().includes('ai') && 
      !s.name.toLowerCase().includes('machine learning') && 
      !s.name.toLowerCase().includes('deep learning') &&
      !s.name.toLowerCase().includes('nlp') &&
      !s.name.toLowerCase().includes('computer vision') &&
      !s.name.toLowerCase().includes('leadership') && 
      !s.name.toLowerCase().includes('communication') && 
      !s.name.toLowerCase().includes('teamwork') &&
      !s.name.toLowerCase().includes('problem solving') &&
      !s.name.toLowerCase().includes('critical thinking')
    )
  };
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort projects by date (most recent first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services by title
  const sortedServices = [...userServices].sort((a, b) => 
    (a.title || '').localeCompare(b.title || '')
  );
  
  // Function to get icon based on skill name
  const getSkillIcon = (name: string): React.ReactNode => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('python') || nameLower.includes('java') || nameLower.includes('c++') || nameLower.includes('javascript')) 
      return <Code className="w-4 h-4" />;
    if (nameLower.includes('machine learning') || nameLower.includes('ai') || nameLower.includes('artificial intelligence')) 
      return <Brain className="w-4 h-4" />;
    if (nameLower.includes('data')) 
      return <Database className="w-4 h-4" />;
    if (nameLower.includes('cloud') || nameLower.includes('aws') || nameLower.includes('azure')) 
      return <Server className="w-4 h-4" />;
    if (nameLower.includes('web') || nameLower.includes('frontend') || nameLower.includes('backend')) 
      return <Globe className="w-4 h-4" />;
    if (nameLower.includes('design') || nameLower.includes('ui') || nameLower.includes('ux')) 
      return <Layers className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };
  
  // Function to get service icon
  const getServiceIcon = (title: string): React.ReactNode => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('development') || titleLower.includes('programming')) 
      return <Code className="w-5 h-5" />;
    if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('data science')) 
      return <Brain className="w-5 h-5" />;
    if (titleLower.includes('consulting') || titleLower.includes('advisory')) 
      return <Briefcase className="w-5 h-5" />;
    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) 
      return <Layers className="w-5 h-5" />;
    if (titleLower.includes('training') || titleLower.includes('workshop') || titleLower.includes('teaching')) 
      return <GraduationCap className="w-5 h-5" />;
    return <Rocket className="w-5 h-5" />;
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Terminal typing animation
  useEffect(() => {
    const texts = [
      userInfo.title || "AI Engineer",
      "Tech Innovator",
      "Problem Solver",
      "Future Builder"
    ];
    
    const currentText = texts[currentTextIndex];

    // Typing effect
    if (isTyping && typedText.length < currentText.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentText.substring(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } 
    
    // Pause at the end of typing
    if (isTyping && typedText.length === currentText.length) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
    
    // Deleting effect
    if (!isTyping && typedText.length > 0) {
      const timeout = setTimeout(() => {
        setTypedText(typedText.substring(0, typedText.length - 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
    
    // Move to next text
    if (!isTyping && typedText.length === 0) {
      const timeout = setTimeout(() => {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [typedText, isTyping, currentTextIndex, userInfo.title]);
  
  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Intersection Observer for section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    Object.keys(sectionRefs).forEach((key) => {
      const ref = sectionRefs[key as keyof typeof sectionRefs];
      if (ref.current) {
        observer.observe(ref.current);
      }
    });
    
    return () => {
      Object.keys(sectionRefs).forEach((key) => {
        const ref = sectionRefs[key as keyof typeof sectionRefs];
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);
  
  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Initialize animations and styles
  useEffect(() => {
    // Add fonts: Space Grotesk (futuristic, tech-looking font)
    const spaceGroteskLink = document.createElement('link');
    spaceGroteskLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    spaceGroteskLink.rel = 'stylesheet';
    document.head.appendChild(spaceGroteskLink);
    
    // Add Orbitron (sci-fi font for headings)
    const orbitronLink = document.createElement('link');
    orbitronLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap';
    orbitronLink.rel = 'stylesheet';
    document.head.appendChild(orbitronLink);
    
    // Add cyberspace styling
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      /* Dynamic Innovator Theme - Cyberspace Styling */
      @keyframes glowPulse {
        0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.2); }
        50% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3); }
        100% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.2); }
      }
      
      @keyframes neonBorder {
        0% { border-color: rgba(0, 255, 255, 0.5); }
        50% { border-color: rgba(255, 0, 255, 0.5); }
        100% { border-color: rgba(0, 255, 255, 0.5); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes borderGlow {
        0% { 
          box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
          border-color: rgba(0, 255, 255, 0.5);
        }
        50% { 
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
          border-color: rgba(0, 255, 255, 0.8);
        }
        100% { 
          box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
          border-color: rgba(0, 255, 255, 0.5);
        }
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      @keyframes dataFlow {
        0% { 
          background-position: 0% 0%;
          opacity: 0.1;
        }
        50% { 
          background-position: 100% 100%;
          opacity: 0.2;
        }
        100% { 
          background-position: 0% 0%;
          opacity: 0.1;
        }
      }
      
      .dynamic-innovator-template {
        --neon-blue: #00ffff;
        --neon-pink: #ff00ff;
        --cyber-purple: #9900ff;
        --tech-green: #00ff99;
        --dark-bg: #0a0e17;
        --dark-card: #121824;
        --card-highlight: #1a2030;
      }
      
      .dynamic-innovator-template .neo-section {
        position: relative;
        z-index: 1;
      }
      
      .dynamic-innovator-template .neo-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: linear-gradient(to right, rgba(0, 255, 255, 0.05) 1px, transparent 1px), 
                          linear-gradient(to bottom, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
        background-size: 30px 30px;
        pointer-events: none;
        z-index: -1;
      }
      
      .dynamic-innovator-template .data-background {
        position: relative;
      }
      
      .dynamic-innovator-template .data-background::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        animation: dataFlow 20s linear infinite;
        z-index: -1;
      }
      
      .dynamic-innovator-template .profile-frame {
        position: relative;
        border-radius: 50%;
        overflow: hidden;
        animation: glowPulse 4s infinite;
      }
      
      .dynamic-innovator-template .profile-frame::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid rgba(0, 255, 255, 0.5);
        border-radius: 50%;
        animation: neonBorder 6s infinite;
      }
      
      .dynamic-innovator-template .neon-heading {
        font-family: 'Orbitron', sans-serif;
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        background: linear-gradient(90deg, var(--neon-blue), var(--neon-pink));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 200% 200%;
        animation: gradientShift 4s ease infinite;
      }
      
      .dynamic-innovator-template .tech-card {
        background: rgba(18, 24, 36, 0.8);
        border: 1px solid rgba(0, 255, 255, 0.1);
        border-radius: 0.5rem;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
      }
      
      .dynamic-innovator-template .tech-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
        border-color: rgba(0, 255, 255, 0.3);
      }
      
      .dynamic-innovator-template .project-card {
        position: relative;
        perspective: 1000px;
        transition: all 0.3s ease;
        transform-style: preserve-3d;
      }
      
      .dynamic-innovator-template .project-card:hover {
        transform: scale(1.03) rotateY(3deg);
      }
      
      .dynamic-innovator-template .project-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px solid rgba(0, 255, 255, 0.2);
        border-radius: 0.5rem;
        pointer-events: none;
        transition: all 0.3s ease;
      }
      
      .dynamic-innovator-template .project-card:hover::after {
        border-color: rgba(0, 255, 255, 0.5);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      }
      
      .dynamic-innovator-template .skill-meter {
        background: rgba(0, 255, 255, 0.1);
        border-radius: 99px;
        height: 8px;
        overflow: hidden;
      }
      
      .dynamic-innovator-template .skill-progress {
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, var(--neon-blue), var(--cyber-purple));
        background-size: 200% 200%;
        animation: gradientShift 4s ease infinite;
      }
      
      .dynamic-innovator-template .timeline-node {
        position: relative;
      }
      
      .dynamic-innovator-template .timeline-node::before {
        content: '';
        position: absolute;
        top: 16px;
        left: -10px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--neon-blue);
        z-index: 10;
        box-shadow: 0 0 8px var(--neon-blue);
      }
      
      .dynamic-innovator-template .timeline-node::after {
        content: '';
        position: absolute;
        top: 21px;
        bottom: -10px;
        left: -5.5px;
        width: 1px;
        background: linear-gradient(to bottom, var(--neon-blue), transparent);
      }
      
      .dynamic-innovator-template .timeline-node:last-child::after {
        display: none;
      }
      
      .dynamic-innovator-template .terminal-cursor {
        display: inline-block;
        width: 8px;
        height: 24px;
        background-color: var(--neon-blue);
        animation: blink 1s step-end infinite;
        margin-left: 2px;
        margin-bottom: -5px;
      }
      
      .dynamic-innovator-template .glass-card {
        background: rgba(18, 24, 36, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 255, 255, 0.1);
        border-radius: 0.5rem;
      }
      
      .dynamic-innovator-template .service-card {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .dynamic-innovator-template .service-card:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 255, 255, 0.6);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 255, 255, 0.3);
      }
      
      .dynamic-innovator-template .service-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, rgba(0, 255, 255, 0.05), rgba(153, 0, 255, 0.05));
        z-index: -1;
      }
      
      .dynamic-innovator-template .chat-bot-button {
        animation: float 3s ease-in-out infinite;
      }
      
      .dynamic-innovator-template .hexagon-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.3 20.5l12.5-7.2c.6-.4 1.4-.4 2 0l12.5 7.2c.6.4 1 1 1 1.7v14.4c0 .7-.4 1.4-1 1.7L31.8 45.5c-.6.4-1.4.4-2 0l-12.5-7.2c-.6-.4-1-1-1-1.7V22.2c0-.7.4-1.4 1-1.7z' stroke='%230ff' stroke-opacity='.1' fill='none'/%3E%3C/svg%3E");
        opacity: 0.05;
        z-index: -1;
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(spaceGroteskLink);
      document.head.removeChild(orbitronLink);
      document.head.removeChild(styleTag);
    };
  }, []);
  
  // Handle mouse movement for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    setTiltPosition({ x, y });
  };
  
  return (
    <div className="dynamic-innovator-template text-white min-h-screen bg-[#0a0e17]">
      {/* Fixed Navigation */}
      <div className="sticky top-0 bg-[#0a0e17]/80 backdrop-blur-lg border-b border-teal-400/10 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CircuitBoard className="w-5 h-5 text-[#00ffff]" />
              <span className="font-bold text-lg" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {userInfo.name.split(' ')[0]}
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              {Object.keys(sectionRefs).map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm py-1 ${
                    activeSection === section
                      ? "text-[#00ffff] border-b border-[#00ffff]"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                className="bg-transparent hover:bg-[#00ffff]/10 border border-[#00ffff]/50 text-[#00ffff] rounded-md text-sm px-4 py-2 flex items-center gap-2"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <Download className="w-4 h-4" />
                <span>Resume</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section id="about" ref={sectionRefs.about} className="neo-section min-h-[90vh] pt-16 pb-24 relative overflow-hidden">
        <div className="hexagon-bg"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            {/* Profile Image */}
            <div className="w-full lg:w-1/3">
              <div className="relative flex justify-center lg:justify-start">
                <div className="profile-frame w-48 h-48">
                  <ProfileImage
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Contact/Info */}
              <div className="mt-8 text-center lg:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  {userInfo.name}
                </h1>
                
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 text-gray-300">
                  <MapPin className="w-4 h-4 text-[#00ffff]" />
                  <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {userInfo.location || "San Francisco, CA"} • 🌐 Remote Ready
                  </span>
                </div>
                
                {/* Social links */}
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-6">
                  {userInfo.email && (
                    <a
                      href={`mailto:${userInfo.email}`}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <a
                    href="#"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  
                  <Button
                    className="bg-gradient-to-r from-[#00ffff] to-[#9900ff] text-[#0a0e17] hover:from-[#00ffff]/90 hover:to-[#9900ff]/90 ml-3 px-4 py-2 rounded-md text-sm font-medium"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Let's Talk
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="w-full lg:w-2/3 flex flex-col">
              {/* Terminal-style title */}
              <div className="bg-[#0a0e17] border border-[#00ffff]/20 rounded-md p-6 mb-8 tech-card">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                <div className="font-mono text-gray-300 text-sm">
                  <span className="text-[#00ffff]">~ $</span> I am a{" "}
                  <span className="text-[#ff00ff] font-semibold">
                    {typedText}
                    {cursorVisible && <span className="terminal-cursor"></span>}
                  </span>
                </div>
              </div>
              
              {/* Domain/Industry Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {userInfo.industry && (
                  <div className="bg-[#1a2030] border border-[#00ffff]/30 rounded-full px-4 py-1.5 text-sm text-[#00ffff] flex items-center">
                    <span className="mr-1 text-xs">#</span>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>{userInfo.industry}</span>
                  </div>
                )}
                {userInfo.domain && (
                  <div className="bg-[#1a2030] border border-[#9900ff]/30 rounded-full px-4 py-1.5 text-sm text-[#9900ff] flex items-center">
                    <span className="mr-1 text-xs">#</span>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>{userInfo.domain}</span>
                  </div>
                )}
                <div className="bg-[#1a2030] border border-[#00ff99]/30 rounded-full px-4 py-1.5 text-sm text-[#00ff99] flex items-center">
                  <span className="mr-1 text-xs">#</span>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>Tech</span>
                </div>
              </div>
              
              {/* Looking For */}
              {userInfo.lookingFor && (
                <div className="bg-[#0f172a] border border-[#00ffff]/20 rounded-lg p-5 mb-8 flex items-center">
                  <div className="mr-4 p-2 bg-[#00ffff]/10 rounded-full">
                    <Rocket className="w-5 h-5 text-[#00ffff]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Currently looking for:</span>
                    <h3 className="text-lg font-bold text-[#00ffff]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {userInfo.lookingFor}
                    </h3>
                  </div>
                </div>
              )}
              
              {/* About Me */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4 neon-heading">What I'm All About</h2>
                <div className="text-gray-300 leading-relaxed" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {userInfo.lookingFor || `
                  I'm a forward-thinking technologist passionate about leveraging cutting-edge solutions to solve complex problems.
                  With expertise in AI, machine learning, and software development, I build innovative systems that push the boundaries of what's possible.
                  My approach combines technical excellence with strategic thinking to create solutions that deliver real impact.
                  `}
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => scrollToSection('skills')}
                  className="bg-transparent hover:bg-[#00ffff]/10 border border-[#00ffff]/50 text-[#00ffff] rounded-md text-sm px-5 py-2.5 flex items-center gap-2"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  <span>Explore Skills</span>
                  <ChevronRightCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section id="skills" ref={sectionRefs.skills} className="neo-section py-20 bg-[#0c1119]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 neon-heading" style={{ fontFamily: "Orbitron, sans-serif" }}>
            What I'm Good At
          </h2>
          
          <div className="space-y-10">
            {/* Technical Skills */}
            {groupedSkills.technical.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-5 flex items-center" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Code className="w-5 h-5 mr-2 text-[#00ffff]" />
                  <span>Technical Skills</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedSkills.technical.map((skill) => (
                    <div key={skill.id} className="tech-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getSkillIcon(skill.name)}
                          <span className="ml-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {skill.name}
                          </span>
                        </div>
                        <Badge className="bg-[#1a2030] text-[#00ffff] border border-[#00ffff]/30">
                          {skill.level || "Advanced"}
                        </Badge>
                      </div>
                      
                      <div className="skill-meter">
                        <div 
                          className="skill-progress" 
                          style={{ width: `${skill.proficiency ? skill.proficiency * 20 : 80}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI & Data Skills */}
            {(groupedSkills.ai.length > 0 || groupedSkills.data.length > 0) && (
              <div>
                <h3 className="text-xl font-medium mb-5 flex items-center" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Brain className="w-5 h-5 mr-2 text-[#ff00ff]" />
                  <span>AI & Data Skills</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...groupedSkills.ai, ...groupedSkills.data].map((skill) => (
                    <div key={skill.id} className="tech-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getSkillIcon(skill.name)}
                          <span className="ml-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {skill.name}
                          </span>
                        </div>
                        <Badge className="bg-[#1a2030] text-[#ff00ff] border border-[#ff00ff]/30">
                          {skill.level || "Advanced"}
                        </Badge>
                      </div>
                      
                      <div className="skill-meter">
                        <div 
                          className="skill-progress" 
                          style={{ 
                            width: `${skill.proficiency ? skill.proficiency * 20 : 80}%`,
                            background: 'linear-gradient(90deg, #ff00ff, #9900ff)'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Skills */}
            {groupedSkills.other.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-5 flex items-center" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Cpu className="w-5 h-5 mr-2 text-[#00ff99]" />
                  <span>Other Technical Skills</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedSkills.other.map((skill) => (
                    <div key={skill.id} className="tech-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getSkillIcon(skill.name)}
                          <span className="ml-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {skill.name}
                          </span>
                        </div>
                        <Badge className="bg-[#1a2030] text-[#00ff99] border border-[#00ff99]/30">
                          {skill.level || "Intermediate"}
                        </Badge>
                      </div>
                      
                      <div className="skill-meter">
                        <div 
                          className="skill-progress" 
                          style={{ 
                            width: `${skill.proficiency ? skill.proficiency * 20 : 60}%`,
                            background: 'linear-gradient(90deg, #00ff99, #00ffff)'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft Skills */}
            {groupedSkills.soft.length > 0 && (
              <div>
                <h3 className="text-xl font-medium mb-5 flex items-center" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  <Bot className="w-5 h-5 mr-2 text-[#ff00ff]" />
                  <span>Soft Skills</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedSkills.soft.map((skill) => (
                    <div key={skill.id} className="tech-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {getSkillIcon(skill.name)}
                          <span className="ml-2 font-medium" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {skill.name}
                          </span>
                        </div>
                        <Badge className="bg-[#1a2030] text-[#ff00ff] border border-[#ff00ff]/30">
                          {skill.level || "Expert"}
                        </Badge>
                      </div>
                      
                      <div className="skill-meter">
                        <div 
                          className="skill-progress" 
                          style={{ 
                            width: `${skill.proficiency ? skill.proficiency * 20 : 90}%`,
                            background: 'linear-gradient(90deg, #ff00ff, #9900ff)'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {userSkills.length === 0 && (
              <div className="glass-card p-10 text-center">
                <Terminal className="w-10 h-10 text-[#00ffff] mx-auto mb-4" />
                <p className="text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Your technical skills will be showcased here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" ref={sectionRefs.services} className="neo-section py-20 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 neon-heading" style={{ fontFamily: "Orbitron, sans-serif" }}>
            What I Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.length > 0 ? (
              sortedServices.map((service) => (
                <div 
                  key={service.id} 
                  className="service-card bg-[#0a0e17] rounded-lg overflow-hidden"
                  onMouseMove={handleMouseMove}
                  style={{
                    transform: `perspective(1000px) rotateX(${tiltPosition.y * 5}deg) rotateY(${tiltPosition.x * 5}deg)`,
                    transition: 'transform 0.1s'
                  }}
                >
                  <div className="p-6">
                    <div className="p-3 bg-[#00ffff]/10 rounded-full inline-block mb-4">
                      {getServiceIcon(service.title)}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {((service.priceInr && Number(service.priceInr) > 0) || 
                        (service.priceUsd && Number(service.priceUsd) > 0)) && (
                        <Badge className="bg-[#1a2030] text-[#00ffff] border border-[#00ffff]/30">
                          {service.isHourly ? (
                            `${service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}/hour`
                          ) : (
                            `${service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}`
                          )}
                        </Badge>
                      )}
                      
                      <Button
                        className="bg-[#00ffff] text-[#0a0e17] hover:bg-[#00ffff]/90 px-4 py-2 rounded-md text-sm font-medium"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        Let's Build
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default example services
              [
                {
                  title: "AI Consulting",
                  description: "Expert guidance on implementing AI solutions for your business needs, from strategy to deployment.",
                  price: "$150/hour",
                  icon: <Brain className="w-5 h-5 text-[#00ffff]" />
                },
                {
                  title: "Full-Stack Development",
                  description: "End-to-end development using the latest technologies to build robust, scalable applications.",
                  price: "From $5,000",
                  icon: <Code className="w-5 h-5 text-[#00ffff]" />
                },
                {
                  title: "Data Engineering",
                  description: "Design and implementation of data pipelines, infrastructure, and analytics solutions.",
                  price: "$125/hour",
                  icon: <Database className="w-5 h-5 text-[#00ffff]" />
                }
              ].map((service, i) => (
                <div 
                  key={i} 
                  className="service-card bg-[#0a0e17] rounded-lg overflow-hidden"
                  onMouseMove={handleMouseMove}
                  style={{
                    transform: `perspective(1000px) rotateX(${tiltPosition.y * 5}deg) rotateY(${tiltPosition.x * 5}deg)`,
                    transition: 'transform 0.1s'
                  }}
                >
                  <div className="p-6">
                    <div className="p-3 bg-[#00ffff]/10 rounded-full inline-block mb-4">
                      {service.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#1a2030] text-[#00ffff] border border-[#00ffff]/30">
                        {service.price}
                      </Badge>
                      
                      <Button
                        className="bg-[#00ffff] text-[#0a0e17] hover:bg-[#00ffff]/90 px-4 py-2 rounded-md text-sm font-medium"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        Let's Build
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" ref={sectionRefs.projects} className="neo-section py-20 bg-[#0c1119]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 neon-heading" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Showcase
          </h2>
          
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="project-card bg-[#0a0e17] rounded-lg overflow-hidden"
                  onMouseMove={handleMouseMove}
                >
                  {/* Project Image */}
                  <div className="h-48 bg-gradient-to-r from-[#121824] to-[#1a2030] flex items-center justify-center overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-[#00ffff]">
                        <Terminal className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {project.title}
                      </h3>
                      
                      {project.category && (
                        <Badge className="bg-[#1a2030] text-[#00ffff] border border-[#00ffff]/30">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      {project.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {formatDate(project.startDate)}
                      </div>
                      
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#00ffff] hover:text-[#00ffff]/80 text-sm flex items-center gap-1"
                          style={{ fontFamily: "Space Grotesk, sans-serif" }}
                        >
                          View Project
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <p className="text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Your showcase projects will appear here
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Experience / Career Path */}
      <section id="experience" ref={sectionRefs.experience} className="neo-section py-20 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 neon-heading" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Career Path
          </h2>
          
          <div className="pl-6 lg:pl-12 border-l border-[#00ffff]/20">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.map((exp) => (
                <div key={exp.id} className="timeline-node mb-12">
                  <div className="tech-card p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {exp.title}
                        </h3>
                        <p className="text-[#00ffff] mb-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {exp.company}
                        </p>
                      </div>
                      
                      <div className="text-sm bg-[#1a2030] px-3 py-1 rounded-md text-gray-300 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-[#00ffff]" />
                        <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    {exp.location && (
                      <div className="flex items-center mb-4 text-sm text-gray-300">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-[#00ffff]" />
                        <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {exp.location}
                        </span>
                      </div>
                    )}
                    
                    {exp.description && (
                      <p className="text-gray-300" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-10 text-center ml-[-24px] border-l-0">
                <Briefcase className="w-10 h-10 text-[#00ffff] mx-auto mb-4" />
                <p className="text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Your career experience will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Education */}
      <section id="education" ref={sectionRefs.education} className="neo-section py-20 bg-[#0c1119]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 neon-heading" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Academic Background
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEducations.length > 0 ? (
              sortedEducations.map((edu) => (
                <div 
                  key={edu.id} 
                  className="tech-card p-6"
                  onMouseMove={handleMouseMove}
                  style={{
                    transform: `perspective(1000px) rotateX(${tiltPosition.y * 2}deg) rotateY(${tiltPosition.x * 2}deg)`,
                    transition: 'transform 0.1s'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {edu.degree}
                      </h3>
                      <p className="text-[#00ffff] mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {edu.institution}
                      </p>
                    </div>
                    
                    <div className="text-sm bg-[#1a2030] px-3 py-1 rounded-md text-gray-300 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-[#00ffff]" />
                      <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                  </div>
                  
                  {edu.location && (
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-[#00ffff]" />
                      <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {edu.location}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-card p-10 text-center col-span-full">
                <GraduationCap className="w-10 h-10 text-[#00ffff] mx-auto mb-4" />
                <p className="text-gray-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Your academic background will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-[#00ffff]/20 py-12 bg-[#0a0e17]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-xl font-bold neon-heading mb-2">Ready to innovate together?</h3>
              <p className="text-gray-300 mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Let's build something amazing
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                {userInfo.email && (
                  <a
                    href={`mailto:${userInfo.email}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0e17] border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                className="bg-gradient-to-r from-[#00ffff] to-[#9900ff] text-[#0a0e17] hover:from-[#00ffff]/90 hover:to-[#9900ff]/90 px-6 py-2.5 rounded-md text-sm font-medium"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ping Me
              </Button>
              
              <Button
                className="bg-transparent hover:bg-[#00ffff]/10 border border-[#00ffff]/50 text-[#00ffff] rounded-md text-sm px-6 py-2.5 flex items-center gap-2"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <Download className="w-4 h-4" />
                Grab My Resume
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-12 text-gray-400 text-sm">
            <p style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              © {new Date().getFullYear()} {userInfo.name} • Made with Brandentifier
            </p>
          </div>
        </div>
      </footer>
      
      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="chat-bot-button p-4 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9900ff] text-white shadow-lg">
          <Bot className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}