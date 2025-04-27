import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Calendar, ChevronDown, Code, Download, ExternalLink, FileText, Image, Instagram, Lightbulb, Linkedin, Mail, MapPin, MessageSquare, Plus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import ProfileImage from '../../../components/profile-image';
import PortfolioCtaButtons from '@/components/portfolio/portfolio-cta-buttons';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type UserInfo = {
  id?: number;
  name: string;
  email: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  photoURL: string | null;
  jobLevel?: string | null;
};

type Skill = {
  id: number;
  userId: number;
  name: string;
  level: string;
  proficiency: number;
};

type WorkExperience = {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string;
  industry: string | null;
  domain: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  keyResponsibilities: string[] | null;
};

type Project = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  url: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  industry: string | null;
  mediaUrls: string[] | null;
};

type Education = {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string | null;
  industry: string | null;
  domain: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  skillsAcquired: string[] | null;
  academicAchievements: string[] | null;
};

type Service = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: string | null;
  priceInr: string | null;
  priceUsd: string | null;
  isHourly: boolean | null;
  features: string[] | null;
  imageUrl: string | null;
  order: number | null;
  isActive: boolean | null;
};

interface ImmersiveStorylineProps {
  userInfo: UserInfo;
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

export default function ImmersiveStoryline({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = []
}: ImmersiveStorylineProps) {
  // Refs for sections
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const educationRef = useRef<HTMLElement>(null);
  
  // State for modal dialogs
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contactPurpose, setContactPurpose] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Handle project detail view
  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };
  
  // Handle contact form submit
  const handleContactSubmit = () => {
    console.log('Contact form submitted with purpose:', contactPurpose, 'and message:', contactMessage);
    setIsContactModalOpen(false);
    // Reset form
    setContactPurpose('');
    setContactMessage('');
  };
  
  // Toggle experience card expansion
  const toggleExperienceExpansion = (experienceId: number) => {
    if (expandedExperience === experienceId) {
      setExpandedExperience(null);
    } else {
      setExpandedExperience(experienceId);
    }
  };
  
  // Sort the data for display
  const sortedSkills = [...userSkills].sort((a, b) => b.proficiency - a.proficiency);
  const sortedExperiences = [...userExperiences].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const sortedProjects = [...userProjects].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const sortedEducations = [...userEducations].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const sortedServices = [...userServices].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Get skill icon
  const getSkillIcon = (skillName: string) => {
    // Default to Code icon
    return Code;
  };
  
  // Project layout for masonry grid
  const getProjectLayout = (index: number) => {
    const layouts = [
      "col-span-1 row-span-1",  // Small square
      "col-span-2 row-span-1",  // Wide rectangle
      "col-span-1 row-span-2",  // Tall rectangle
      "col-span-2 row-span-2",  // Large square
    ];
    return layouts[index % layouts.length];
  };

  // Initialize smooth scrolling and animations
  useEffect(() => {
    // Initialize smooth scrolling with Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    // Skip animation setup on server
    if (typeof window === 'undefined') return;
    
    // Hero section parallax and animations
    if (heroRef.current) {
      // Background parallax effect
      gsap.to('.hero-bg', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: 200,
        ease: 'none'
      });
      
      // Profile image float effect
      gsap.to('.profile-image-container', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        y: 30,
        ease: 'none'
      });
      
      // Name and title slide-in
      gsap.from('.hero-title', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        x: -100,
        opacity: 0,
        duration: 1
      });
      
      gsap.from('.hero-subtitle', {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        x: 100,
        opacity: 0,
        duration: 1
      });
    }
    
    // About section animations
    if (aboutRef.current) {
      gsap.from('.about-bg', {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top bottom',
          end: 'center center',
          scrub: true
        },
        scale: 1.1,
        opacity: 0.7,
        ease: 'power1.out'
      });
      
      // Typing effect with GSAP
      const aboutTextElement = document.querySelector('.about-text');
      if (aboutTextElement && aboutTextElement.textContent) {
        const text = aboutTextElement.textContent;
        aboutTextElement.textContent = '';
        
        // Create a typing timeline
        const typingTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top center',
            onEnter: () => typingTimeline.play()
          }
        });
        
        let charIndex = 0;
        const typeSpeed = 0.02;
        
        // Add each character one at a time
        for (let i = 0; i < text.length; i++) {
          typingTimeline.add(() => {
            aboutTextElement.textContent = text.substring(0, charIndex + 1);
            charIndex++;
          }, i * typeSpeed);
        }
        
        typingTimeline.pause();
      }
    }
    
    // Skills animations
    if (skillsRef.current) {
      gsap.from('.skill-bubble', {
        scrollTrigger: {
          trigger: skillsRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        ease: 'elastic.out(1, 0.4)'
      });
      
      // Random floating animation for skill bubbles
      document.querySelectorAll('.skill-bubble').forEach((bubble) => {
        gsap.to(bubble, {
          y: gsap.utils.random(-15, 15),
          x: gsap.utils.random(-10, 10),
          rotation: gsap.utils.random(-5, 5),
          duration: gsap.utils.random(3, 5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });
    }
    
    // Services animations
    if (servicesRef.current) {
      gsap.from('.service-card', {
        scrollTrigger: {
          trigger: servicesRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
      });
      
      // Subtle shake on scroll
      document.querySelectorAll('.service-card').forEach((card) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            if (self.getVelocity() > 30) {
              gsap.to(card, {
                rotation: gsap.utils.random(-1, 1),
                duration: 0.2,
                onComplete: () => {
                  gsap.to(card, {
                    rotation: 0,
                    duration: 0.3,
                    ease: 'elastic.out(1, 0.3)'
                  });
                }
              });
            }
          }
        });
      });
    }
    
    // Projects animations
    if (projectsRef.current) {
      gsap.from('.project-item', {
        scrollTrigger: {
          trigger: projectsRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        y: 80,
        opacity: 0,
        stagger: 0.15,
        ease: 'power2.out'
      });
      
      // Gallery wall parallax effect
      gsap.to('.projects-bg', {
        scrollTrigger: {
          trigger: projectsRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: 100,
        ease: 'none'
      });
    }
    
    // Experience timeline animations
    if (experienceRef.current) {
      // Constellation background parallax
      gsap.to('.experience-bg', {
        scrollTrigger: {
          trigger: experienceRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: 150,
        ease: 'none'
      });
      
      // Timeline dots animation
      gsap.from('.timeline-dot', {
        scrollTrigger: {
          trigger: experienceRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        scale: 0,
        opacity: 0,
        stagger: 0.2,
        ease: 'back.out(1.7)'
      });
    }
    
    // Education animations
    if (educationRef.current) {
      // Knowledge waves background
      gsap.to('.education-bg', {
        scrollTrigger: {
          trigger: educationRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: 120,
        ease: 'none'
      });
      
      // Education cards animation
      gsap.from('.education-card', {
        scrollTrigger: {
          trigger: educationRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true
        },
        y: 60,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out'
      });
    }

    // Cleanup
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="immersive-storyline font-sans min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950 text-gray-100 overflow-hidden">
      {/* Floating CTA button for mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          size="icon"
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl shadow-indigo-500/30"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Hero Section (Parallax) */}
      <section 
        ref={heroRef} 
        className="hero-section relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background with parallax */}
        <div className="hero-bg absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-900/40 to-slate-950/80"></div>
          
          {/* Animated stars/particles */}
          <div className="stars absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={i}
                className="star absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3}px`,
                  height: `${Math.random() * 3}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${Math.random() * 5 + 2}s infinite ease-in-out ${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 flex flex-col items-center">
          {/* Profile Image */}
          <div className="profile-image-container mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-md opacity-70 scale-110 animate-pulse"></div>
            <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Name and Title */}
          <h1 className="hero-title text-4xl md:text-6xl font-bold text-white mb-4 text-center">
            {userInfo.name}
          </h1>
          
          {userInfo.title && (
            <h2 className="hero-subtitle text-xl md:text-2xl font-medium text-indigo-300 mb-6 text-center">
              {userInfo.title}
            </h2>
          )}
          
          {/* Tags with subtle animation */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {userInfo.industry && (
              <Badge className="bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 py-1.5 px-4 rounded-full">
                {userInfo.industry}
              </Badge>
            )}
            
            {userInfo.domain && (
              <Badge className="bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 border border-purple-400/30 py-1.5 px-4 rounded-full">
                {userInfo.domain}
              </Badge>
            )}
            
            {userInfo.lookingFor && (
              <Badge className="looking-for-badge bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30 py-1.5 px-4 rounded-full animate-pulse">
                Looking for {userInfo.lookingFor}
              </Badge>
            )}
          </div>
          
          {/* Location info */}
          {userInfo.location && (
            <div className="flex items-center mb-8 text-gray-300">
              <MapPin className="w-5 h-5 mr-2 text-indigo-400" />
              <span>{userInfo.location}</span>
            </div>
          )}
          
          {/* What I Offer section in hero */}
          {userInfo.whatIOffer && (
            <div className="max-w-2xl mx-auto bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 mb-10 border border-indigo-500/20">
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">What I Offer</h3>
              <p className="text-gray-300">{userInfo.whatIOffer}</p>
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="hidden md:flex gap-4 mt-6">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-6 rounded-md shadow-lg shadow-indigo-500/30 transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30 px-8 py-6 rounded-md shadow-md"
            >
              <Download className="w-5 h-5 mr-2" />
              Resume
            </Button>
            
            <Button 
              className="bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 px-8 py-6 rounded-md shadow-md"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Mentor
            </Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
            <div className="w-5 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section with Parallax */}
      <section 
        ref={aboutRef}
        className="about-section relative py-20 md:py-32 overflow-hidden"
      >
        {/* Background with parallax */}
        <div className="about-bg absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-900/70"></div>
          
          {/* Subtle shapes */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
            What I'm All About
          </h2>
          
          <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-indigo-500/20">
            {userInfo.aboutMe ? (
              <p className="about-text text-lg text-gray-300 leading-relaxed">
                {userInfo.aboutMe}
              </p>
            ) : (
              <p className="about-text text-lg text-gray-300 leading-relaxed">
                {userInfo.title ? `As a ${userInfo.title}` : "As a creative professional"} with a passion for {userInfo.domain || "my field"}, 
                I specialize in crafting innovative solutions that make a real impact. My approach combines technical expertise with creative vision,
                ensuring each project not only meets but exceeds expectations.
                {userInfo.lookingFor ? ` Currently, I'm looking for ${userInfo.lookingFor} opportunities that challenge me to grow and innovate.` : ""}
              </p>
            )}
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section 
        ref={skillsRef}
        className="skills-section relative py-20 md:py-32 overflow-hidden"
      >
        {/* Background with parallax */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900"></div>
          
          {/* Tech grid background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTI1MjkiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0xMCAxMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6TTEwIDI4aDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHpNMTAgMTZoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00ek0xMCAzNGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6TTEwIDIyaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHptNiAwaDJ2NGgtMnYtNHpNMTAgNDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00em02IDBoMnY0aC0ydi00ek0xMCA0NmgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6bTYgMGgydjRoLTJ2LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
            What I'm Good At
          </h2>
          
          {sortedSkills.length > 0 ? (
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
              {sortedSkills.map((skill) => {
                const SkillIcon = getSkillIcon(skill.name);
                return (
                  <HoverCard key={skill.id}>
                    <HoverCardTrigger asChild>
                      <div className="skill-bubble group cursor-pointer">
                        <div className="relative w-32 h-32 flex flex-col items-center justify-center bg-slate-800/60 hover:bg-slate-800/90 backdrop-blur-sm rounded-full border border-indigo-500/30 hover:border-indigo-500/50 shadow-lg transition-all duration-300">
                          <SkillIcon className="w-8 h-8 text-indigo-400 mb-1" />
                          <span className="text-gray-200 font-medium text-center px-2 leading-tight">{skill.name}</span>
                          
                          {/* Circular progress */}
                          <div className="absolute -inset-1 rounded-full">
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full rotate-90">
                              <circle 
                                cx="50" cy="50" r="48" 
                                fill="none" 
                                stroke="#1e293b" 
                                strokeWidth="3"
                              />
                              <circle 
                                cx="50" cy="50" r="48" 
                                fill="none" 
                                stroke={`rgba(99, 102, 241, ${skill.proficiency / 100})`}
                                strokeWidth="3"
                                strokeDasharray={`${skill.proficiency * 3}px ${300 - skill.proficiency * 3}px`}
                                strokeLinecap="round"
                                className="transform transition-all duration-1000 ease-out-expo"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-slate-900/90 backdrop-blur-sm border border-indigo-500/30">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <SkillIcon className="w-6 h-6 text-indigo-400" />
                          <h4 className="text-lg font-semibold">{skill.name}</h4>
                        </div>
                        <span className="text-sm text-gray-400">Proficiency: {skill.level}</span>
                        <Progress value={skill.proficiency} className="h-2 bg-slate-700">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </Progress>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-800/40 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-indigo-500/20">
              <p className="text-gray-400">Skills will appear here once added.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Services Section */}
      {sortedServices.length > 0 && (
        <section 
          ref={servicesRef}
          className="services-section relative py-20 md:py-32 overflow-hidden"
        >
          {/* Background with parallax */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 to-slate-900"></div>
            
            {/* Paper texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
              What I Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sortedServices.map((service) => (
                <Card key={service.id} className="service-card bg-slate-800/60 backdrop-blur-sm border border-indigo-500/30 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-xl mb-2 text-white">{service.title}</h4>
                    
                    {service.category && (
                      <div className="mb-4">
                        <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </Badge>
                      </div>
                    )}
                    
                    {service.description && (
                      <p className="text-gray-300 mb-4">{service.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 mb-2">
                      <div className="flex items-center">
                        {service.priceUsd && (
                          <span className="font-semibold text-lg text-indigo-300">
                            ${parseFloat(service.priceUsd).toFixed(2)} {service.isHourly ? '/hr' : ''}
                          </span>
                        )}
                        {service.priceInr && !service.priceUsd && (
                          <span className="font-semibold text-lg text-indigo-300">
                            ₹{parseFloat(service.priceInr).toFixed(2)} {service.isHourly ? '/hr' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-indigo-500/30">
                        <div className="text-sm font-medium text-indigo-300 mb-2">Includes:</div>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Projects Showcase */}
      {sortedProjects.length > 0 && (
        <section 
          ref={projectsRef}
          className="projects-section relative py-20 md:py-32 overflow-hidden"
        >
          {/* Background with parallax */}
          <div className="projects-bg absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-950"></div>
            
            {/* Gallery wall texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAyMDYxNyI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iNDIuNDIiIGhlaWdodD0iNDIuNDIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMwLDApIHJvdGF0ZSg0NSkiIGZpbGw9IiMwNDBhMWQiPjwvcmVjdD4KPC9zdmc+')]"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
              Visual Showcase
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {sortedProjects.map((project, index) => (
                <div key={project.id} className={`project-item ${getProjectLayout(index)}`}>
                  <div 
                    onClick={() => openProjectDetail(project)}
                    className="group h-full cursor-pointer rounded-xl overflow-hidden relative shadow-2xl shadow-indigo-900/30"
                  >
                    {/* Project thumbnail */}
                    {project.thumbnailUrl ? (
                      <div className="h-full">
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-full bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center p-6">
                        <FileText className="w-12 h-12 text-indigo-400" />
                      </div>
                    )}
                    
                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{project.title}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {project.category && (
                          <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                            {project.category}
                          </Badge>
                        )}
                        
                        {project.industry && (
                          <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/30">
                            {project.industry}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>{formatDate(project.startDate)}</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="mt-4 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Career Path (Experience Timeline) */}
      <section 
        ref={experienceRef}
        className="experience-section relative py-20 md:py-32 overflow-hidden"
      >
        {/* Background with parallax */}
        <div className="experience-bg absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-900/70"></div>
          
          {/* Constellation background */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-indigo-500"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
            Career Path
          </h2>
          
          {sortedExperiences.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-indigo-500/30 transform md:translate-x-px"></div>
                
                {/* Timeline items */}
                <div className="space-y-12">
                  {sortedExperiences.map((experience) => (
                    <div key={experience.id} className="relative">
                      {/* Timeline dot */}
                      <div className="timeline-dot absolute left-0 md:left-1/2 top-7 w-5 h-5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 transform -translate-x-1/2 z-10"></div>
                      
                      {/* Content card */}
                      <div 
                        className={`ml-8 md:ml-0 md:w-5/12 ${
                          sortedExperiences.indexOf(experience) % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                        }`}
                      >
                        <Card className={`bg-slate-800/60 backdrop-blur-sm border border-indigo-500/30 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                          expandedExperience === experience.id ? 'shadow-xl shadow-indigo-500/20' : ''
                        }`}
                        onClick={() => toggleExperienceExpansion(experience.id)}
                        >
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                              {experience.title}
                              <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${
                                expandedExperience === experience.id ? 'rotate-180' : ''
                              }`} />
                            </h3>
                            
                            <div className="text-lg font-medium text-indigo-300 mb-3">
                              {experience.company}
                            </div>
                            
                            <div className="flex items-center text-gray-400 mb-3 text-sm">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              <span>
                                {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                              </span>
                            </div>
                            
                            {/* Conditional content that expands */}
                            {expandedExperience === experience.id && (
                              <div className="mt-4 pt-4 border-t border-indigo-500/30 space-y-4 animate-fadeIn">
                                {experience.location && (
                                  <div className="flex items-center text-gray-400 text-sm">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    <span>{experience.location}</span>
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                  {experience.industry && (
                                    <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                      Industry: {experience.industry}
                                    </Badge>
                                  )}
                                  
                                  {experience.domain && (
                                    <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/30">
                                      Domain: {experience.domain}
                                    </Badge>
                                  )}
                                </div>
                                
                                {experience.description && (
                                  <p className="text-gray-300">{experience.description}</p>
                                )}
                                
                                {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-indigo-300 mb-2">Key Responsibilities:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                                      {experience.keyResponsibilities.map((responsibility, index) => (
                                        <li key={index}>{responsibility}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-slate-800/40 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-indigo-500/20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-700/70 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-2">No Experience Yet</h3>
              <p className="text-gray-400">Your work experience will appear here.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Education Section */}
      {sortedEducations.length > 0 && (
        <section 
          ref={educationRef}
          className="education-section relative py-20 md:py-32 overflow-hidden"
        >
          {/* Background with parallax */}
          <div className="education-bg absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 to-slate-900"></div>
            
            {/* Knowledge waves background */}
            <div className="absolute inset-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-full h-40 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 rounded-full"
                  style={{
                    top: `${10 + i * 20}%`,
                    left: '0',
                    transform: `scaleY(0.5) translateY(${Math.sin(i) * 50}px)`,
                    filter: 'blur(40px)',
                    opacity: 0.3
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="container relative z-10 mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center">
              Academic Background
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sortedEducations.map((education) => (
                <Card key={education.id} className="education-card bg-slate-800/60 backdrop-blur-sm border border-amber-500/30 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                  <CardContent className="pt-6">
                    <h4 className="font-bold text-xl mb-2 text-amber-300">{education.degree}</h4>
                    <div className="font-medium text-gray-200 mb-4">{education.institution}</div>
                    
                    <div className="flex items-center text-gray-400 mb-3 text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>
                        {formatDate(education.startDate)} — {education.endDate ? formatDate(education.endDate) : 'Present'}
                      </span>
                    </div>
                    
                    {education.location && (
                      <div className="flex items-center text-gray-400 mb-3 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span>{education.location}</span>
                      </div>
                    )}
                    
                    {education.fieldOfStudy && (
                      <div className="mb-3 mt-4">
                        <Badge className="bg-amber-500/20 text-amber-200 border border-amber-400/30">
                          Field: {education.fieldOfStudy}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {education.industry && (
                        <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                          Industry: {education.industry}
                        </Badge>
                      )}
                      
                      {education.domain && (
                        <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30">
                          Domain: {education.domain}
                        </Badge>
                      )}
                    </div>
                    
                    {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-amber-500/20">
                        <div className="text-sm font-medium text-amber-300 mb-2">Skills Acquired:</div>
                        <div className="flex flex-wrap gap-1">
                          {education.skillsAcquired.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-amber-950/40 text-amber-200 border-amber-500/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {education.academicAchievements && education.academicAchievements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-amber-500/20">
                        <div className="text-sm font-medium text-amber-300 mb-2">Academic Achievements:</div>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300 text-sm">
                          {education.academicAchievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact CTA Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 lg:px-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${30 * i}%`,
                  left: `${25 * i}%`,
                  width: '60%',
                  height: '60%',
                  background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%)',
                  transform: `scale(${1 + i * 0.2})`,
                  animation: `pulse ${5 + i}s infinite ease-in-out ${i}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Connect?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Let's create something amazing together. Reach out for collaborations, inquiries, or just to say hello.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-md shadow-lg shadow-indigo-600/20"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              className="bg-indigo-700 text-white hover:bg-indigo-800 border border-indigo-400 px-8 py-3 text-lg rounded-md shadow-lg shadow-indigo-700/30"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Mentor
            </Button>
          </div>
        </div>
      </section>
      
      {/* Let's Talk Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">Let's Talk</DialogTitle>
            <div className="w-16 h-1 bg-indigo-500/50 rounded-full mx-auto my-2"></div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-6">
              {/* Purpose dropdown */}
              <div className="space-y-2">
                <label className="font-medium text-indigo-300">Purpose to connect:</label>
                <Select value={contactPurpose} onValueChange={setContactPurpose}>
                  <SelectTrigger className="w-full bg-slate-800 border-indigo-500/30 text-gray-300">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-indigo-500/30">
                    <SelectItem value="job-opportunity" className="text-gray-300">Exciting job opportunities are available, and I believe you'd be a great fit.</SelectItem>
                    <SelectItem value="project-collaboration" className="text-gray-300">Would you be open to teaming up on innovative projects?</SelectItem>
                    <SelectItem value="networking" className="text-gray-300">Let's connect — I admire your work and would love to stay in touch.</SelectItem>
                    <SelectItem value="partnership" className="text-gray-300">I'd like to explore a potential partnership opportunity with you.</SelectItem>
                    <SelectItem value="freelance" className="text-gray-300">I have some exciting freelance projects you might be interested in.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Message box */}
              <div className="space-y-2">
                <label className="font-medium text-indigo-300">Write a note to start the conversation:</label>
                <Textarea 
                  placeholder="Write a message to get the conversation started..."
                  className="min-h-[120px] bg-slate-800 border-indigo-500/30 text-gray-300 placeholder:text-gray-500"
                  maxLength={350}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
                <div className="text-xs text-right text-gray-500">
                  {contactMessage.length}/350 characters
                </div>
              </div>
              
              {/* Submit button */}
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  onClick={handleContactSubmit}
                >
                  Request Connection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Project Detail Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-4xl overflow-auto max-h-[90vh] bg-slate-900 border border-indigo-500/30">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500">
            <ChevronDown className="h-4 w-4 text-gray-400" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          {selectedProject && (
            <div className="py-4">
              {/* Project media */}
              <div className="relative h-64 sm:h-96 mb-6 overflow-hidden rounded-lg">
                {selectedProject.thumbnailUrl ? (
                  <img 
                    src={selectedProject.thumbnailUrl} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-indigo-400" />
                  </div>
                )}
              </div>
              
              {/* Project title and category */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProject.category && (
                    <Badge className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      {selectedProject.category}
                    </Badge>
                  )}
                  
                  {selectedProject.industry && (
                    <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/30">
                      {selectedProject.industry}
                    </Badge>
                  )}
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {formatDate(selectedProject.startDate)}
                      {selectedProject.endDate && ` — ${formatDate(selectedProject.endDate)}`}
                    </span>
                  </div>
                </div>
                
                {selectedProject.description && (
                  <div className="bg-slate-800/60 rounded-lg p-4 backdrop-blur-sm border border-indigo-500/20 mb-6">
                    <p className="text-gray-300">{selectedProject.description}</p>
                  </div>
                )}
                
                {selectedProject.url && (
                  <Button 
                    className="mb-6 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hover:bg-indigo-500/30"
                    onClick={() => window.open(selectedProject.url || '', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Project
                  </Button>
                )}
              </div>
              
              {/* Additional media */}
              {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-indigo-300 mb-4">Project Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedProject.mediaUrls.map((url, index) => (
                      <div key={index} className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Project media ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }
        
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          grid-auto-rows: 250px;
          grid-auto-flow: dense;
          gap: 1.5rem;
        }
        
        .project-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          cursor: pointer;
        }
        
        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        
        .project-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.5) 70%, transparent);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s;
        }
        
        .project-card:hover .project-image {
          transform: scale(1.05);
        }
        
        .project-card:hover .project-overlay {
          opacity: 1;
          transform: translateY(0);
        }
        
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
        }
        
        .skill-badge {
          transition: all 0.3s;
        }
        
        .skill-badge:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}