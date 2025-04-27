import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MessageSquare,
  MapPin,
  Mail,
  Linkedin,
  Instagram,
  Code,
  Download,
  Lightbulb,
  Briefcase,
  FileText,
  Plus,
  Image,
  Target,
  ChevronDown,
  BookOpen,
  Tag
} from "lucide-react";
import { ProfileImage } from "@/components/ui/profile-image";
import PortfolioCtaButtons from "@/components/portfolio/portfolio-cta-buttons";

interface Skill {
  id: number;
  userId: number;
  name: string;
  level: string;
  proficiency: number;
}

interface WorkExperience {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string;
  industry: string;
  domain: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  keyResponsibilities: string[];
}

interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate?: string | null;
  projectUrl?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  industry?: string | null;
  mediaUrls?: string[];
}

interface Education {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string;
  industry: string | null;
  domain: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  skillsAcquired: string[];
  academicAchievements?: string[];
}

interface Service {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  priceInr: string | null;
  priceUsd: string | null;
  isHourly: boolean;
  features: string[];
  imageUrl: string | null;
  order: number;
  isActive: boolean;
}

interface ImmersiveStorylineProps {
  userInfo: {
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
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

export default function ImmersiveStoryline({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
}: ImmersiveStorylineProps) {
  // State management
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contactPurpose, setContactPurpose] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Parallax effect references
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const experiencesRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);

  // Sorting data
  const sortedSkills = [...userSkills].sort((a, b) => b.proficiency - a.proficiency);
  const sortedExperiences = [...userExperiences].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const sortedProjects = [...userProjects].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const sortedEducations = [...userEducations].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const sortedServices = [...userServices].sort((a, b) => a.order - b.order);

  // Handle project detail view
  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // Handle contact form submission
  const handleContactSubmit = () => {
    console.log("Contact submitted:", { contactPurpose, contactMessage });
    setIsContactModalOpen(false);
    setContactPurpose("");
    setContactMessage("");
  };

  // Date formatter
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short' });
  };

  // Skill icon helper function
  const getSkillIcon = (skillName: string) => {
    const lowerName = skillName.toLowerCase();
    if (lowerName.includes("react") || lowerName.includes("vue") || lowerName.includes("angular")) {
      return Code;
    } else if (lowerName.includes("design") || lowerName.includes("figma") || lowerName.includes("ui")) {
      return Image;
    } else if (lowerName.includes("management") || lowerName.includes("leadership")) {
      return Briefcase;
    } else {
      return Target;
    }
  };

  // Parallax effect
  useEffect(() => {
    // Add custom scrolling effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Apply parallax to hero section
      if (heroRef.current) {
        const heroElements = heroRef.current.querySelectorAll('.parallax');
        heroElements.forEach((el, index) => {
          const speed = 0.2 + (index * 0.1);
          (el as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
        });
      }
      
      // Apply effects to other sections
      const sections = [
        { ref: aboutRef, class: '.about-parallax', baseSpeed: 0.15 },
        { ref: skillsRef, class: '.skills-parallax', baseSpeed: 0.1 },
        { ref: servicesRef, class: '.services-parallax', baseSpeed: 0.08 },
        { ref: projectsRef, class: '.projects-parallax', baseSpeed: 0.12 },
        { ref: experiencesRef, class: '.experiences-parallax', baseSpeed: 0.05 },
        { ref: educationRef, class: '.education-parallax', baseSpeed: 0.07 }
      ];
      
      sections.forEach(section => {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const elements = section.ref.current.querySelectorAll(section.class);
            const offsetY = (window.innerHeight - rect.top) * section.baseSpeed;
            
            elements.forEach((el, index) => {
              const speed = section.baseSpeed + (index * 0.03);
              (el as HTMLElement).style.transform = `translateY(${offsetY * speed}px)`;
              (el as HTMLElement).style.opacity = Math.min(1, (window.innerHeight - rect.top) / 500);
            });
          }
        }
      });

      // Reveal elements when scrolled into view
      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
        
        if (isVisible) {
          el.classList.add('revealed');
        }
      });
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    // Add custom styles
    const style = document.createElement('style');
    style.innerHTML = `
      /* Custom Animation Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes floatAnimation {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes pulseAnimation {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .scroll-reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      
      .scroll-reveal.revealed {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hero-gradient {
        background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
        background-size: 400% 400%;
        animation: gradientAnimation 15s ease infinite;
      }
      
      @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .profile-image-animation {
        animation: floatAnimation 6s ease-in-out infinite;
      }
      
      .looking-for-badge {
        animation: pulseAnimation 2s ease-in-out infinite;
      }
      
      .skill-bubble {
        transition: all 0.3s ease;
      }
      
      .skill-bubble:hover {
        transform: scale(1.1);
      }
      
      .service-card {
        transition: all 0.3s ease;
        transform-style: preserve-3d;
      }
      
      .service-card:hover {
        transform: rotateY(5deg) scale(1.02);
      }
      
      .project-card {
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .project-card:hover img {
        transform: scale(1.1);
      }
      
      .project-card img {
        transition: transform 0.5s ease;
      }
      
      .experience-dot {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .experience-dot:hover {
        transform: scale(1.2);
      }
      
      .timeline-connector {
        height: 100%;
        width: 2px;
        background: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,1), rgba(255,255,255,0.2));
      }
      
      .education-badge {
        transition: all 0.3s ease;
      }
      
      .education-badge:hover {
        transform: translateY(-5px);
      }
    `;
    document.head.appendChild(style);
    
    // Add Google fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
      document.head.removeChild(fontLink);
    };
  }, []);

  // Title for the page
  const titleText = userInfo.title || "Professional";

  return (
    <div className="immersive-storyline-template font-['Plus_Jakarta_Sans']">
      {/* Floating CTA button for mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          size="icon"
          className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Hero Section with Parallax Background */}
      <section 
        ref={heroRef}
        className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 hero-gradient opacity-90 parallax"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjUiIGN5PSI1IiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMjUiIGN5PSIxNSIgcj0iMC41IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMC43NSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iMTAiIHI9IjEuMjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIwLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjIiLz48Y2lyY2xlIGN4PSI5MCIgY3k9IjkwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4yNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdGFycykiLz48L3N2Zz4=')] opacity-20 parallax"></div>
        
        {/* Content Container */}
        <div className="container relative z-10 mx-auto text-center px-4 sm:px-6 md:px-8">
          {/* Profile Image with Animation */}
          <div className="profile-image-container mb-8 parallax">
            <div className="profile-image-animation mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-lg opacity-70 -z-10 transform scale-110"></div>
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Name and Title - Slide in from sides */}
          <div className="mb-6 parallax" style={{animationDelay: "0.5s"}}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {userInfo.name}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-indigo-200">
              {titleText}
            </h2>
          </div>
          
          {/* Industry & Domain Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 parallax" style={{animationDelay: "0.8s"}}>
            {userInfo.industry && (
              <Badge className="bg-indigo-500/30 text-white border border-indigo-400/30 py-1.5 px-4 rounded-full">
                {userInfo.industry}
              </Badge>
            )}
            
            {userInfo.domain && (
              <Badge className="bg-purple-500/30 text-white border border-purple-400/30 py-1.5 px-4 rounded-full">
                {userInfo.domain}
              </Badge>
            )}
          </div>
          
          {/* Location and Looking For */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12 parallax" style={{animationDelay: "1s"}}>
            {userInfo.location && (
              <div className="flex items-center text-white/90">
                <MapPin className="w-5 h-5 mr-2 text-indigo-300" />
                <span>{userInfo.location}</span>
              </div>
            )}
            
            {userInfo.lookingFor && (
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-1.5 px-4 rounded-full looking-for-badge">
                Looking for {userInfo.lookingFor}
              </Badge>
            )}
          </div>
          
          {/* CTA buttons */}
          <div className="hidden md:flex gap-4 justify-center mt-6 parallax" style={{animationDelay: "1.2s"}}>
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-6 rounded-full shadow-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              className="bg-indigo-700/20 text-white border border-indigo-500/40 hover:bg-indigo-700/30 px-8 py-6 rounded-full shadow-md"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Me Section */}
      <section 
        ref={aboutRef}
        className="py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-gray-900 to-indigo-900 text-white relative overflow-hidden"
      >
        {/* Dynamic Background Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl about-parallax"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl about-parallax"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative">
          <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
            About Me
          </h2>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 shadow-xl scroll-reveal about-parallax">
            {userInfo.aboutMe ? (
              <div className="text-lg leading-relaxed space-y-4 about-parallax">
                {userInfo.aboutMe.split('\\n').map((paragraph, index) => (
                  <p key={index} className="fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-lg leading-relaxed space-y-4 about-parallax">
                <p>
                  {userInfo.title ? `As a ${userInfo.title}` : "As a professional"} with a passion for {userInfo.domain || "my field"}, 
                  I merge creative thinking with technical expertise to deliver exceptional results.
                </p>
                <p>
                  My approach combines analytical problem-solving with innovative solutions, ensuring that every project exceeds expectations.
                  {userInfo.lookingFor ? ` Currently, I'm looking for ${userInfo.lookingFor} opportunities that challenge me to grow and innovate.` : ""}
                </p>
              </div>
            )}
            
            {userInfo.whatIOffer && (
              <div className="mt-8 pt-8 border-t border-white/10 about-parallax">
                <h3 className="text-xl font-semibold mb-4 text-indigo-300">What I Offer</h3>
                <p className="text-white/90">{userInfo.whatIOffer}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section 
        ref={skillsRef}
        className="py-24 px-4 sm:px-6 md:px-8 bg-gray-900 text-white relative overflow-hidden"
      >
        {/* Tech Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAxMCBMIDQwIDEwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuMiIvPjxwYXRoIGQ9Ik0gMTAgMCBMIDEwIDQwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20 skills-parallax"></div>
        
        <div className="container mx-auto max-w-6xl relative">
          <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
            What I'm Good At
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 skills-parallax">
            {sortedSkills.length > 0 ? (
              sortedSkills.map((skill, index) => {
                const SkillIcon = getSkillIcon(skill.name);
                return (
                  <div 
                    key={skill.id} 
                    className="skill-bubble scroll-reveal" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="bg-indigo-900/50 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-6 h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center mb-4">
                        <SkillIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-white">{skill.name}</h3>
                      <div className="text-sm text-indigo-300 mb-4">{skill.level}</div>
                      
                      {/* Circular progress indicator */}
                      <div className="relative h-24 w-24 mt-auto">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#4338ca20"
                            strokeWidth="8"
                            fill="none"
                          />
                          {/* Progress circle - strokeDasharray is the circumference of the circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#skillGradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * (skill.proficiency || 0)) / 100}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                          <defs>
                            <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                          {skill.proficiency}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-indigo-900/30 backdrop-blur-sm rounded-3xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-700/50 flex items-center justify-center">
                  <Target className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-xl font-medium text-indigo-300 mb-2">Skills Coming Soon</h3>
                <p className="text-indigo-200/70">Skills will appear here once added.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      {sortedServices.length > 0 && (
        <section 
          ref={servicesRef}
          className="py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-indigo-900 to-purple-900 text-white relative overflow-hidden"
        >
          {/* Paper texture background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzNSkiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-10 services-parallax"></div>
          
          <div className="container mx-auto max-w-6xl relative">
            <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
              What I Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 services-parallax">
              {sortedServices.map((service, index) => (
                <div 
                  key={service.id} 
                  className="service-card scroll-reveal"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="bg-white/10 backdrop-blur-md h-full rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                    {/* Service image or gradient header */}
                    {service.imageUrl ? (
                      <div className="h-36 overflow-hidden">
                        <img 
                          src={service.imageUrl} 
                          alt={service.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                        <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                          <Lightbulb className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Category badge */}
                      {service.category && (
                        <div className="mb-3">
                          <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300">
                            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Title and description */}
                      <h3 className="text-xl font-bold mb-3 text-white">{service.title}</h3>
                      <p className="text-white/80 mb-5">{service.description}</p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-5">
                        <div className="font-bold text-lg text-white">
                          {service.priceUsd && (
                            <span>${parseFloat(service.priceUsd).toFixed(2)}</span>
                          )}
                          {service.priceInr && !service.priceUsd && (
                            <span>₹{parseFloat(service.priceInr).toFixed(2)}</span>
                          )}
                          {service.isHourly && <span className="text-white/70 text-sm ml-1">/hr</span>}
                        </div>
                      </div>
                      
                      {/* Features list */}
                      {service.features && service.features.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-white/10">
                          <div className="text-sm font-medium text-indigo-300 mb-3">Includes:</div>
                          <ul className="space-y-2 text-sm text-white/80">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Projects Section */}
      <section 
        ref={projectsRef}
        className="py-24 px-4 sm:px-6 md:px-8 bg-gray-900 text-white relative overflow-hidden"
      >
        {/* Dark gallery wall */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJnYWxsZXJ5IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjYwIiB4PSIwIiB5PSIwIiBmaWxsPSIjMjAyMDMwIiBzdHJva2U9IiMzMDMwNDAiIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSIzMCIgeD0iNTAiIHk9IjAiIGZpbGw9IiMyMDIwMzAiIHN0cm9rZT0iIzMwMzA0MCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4PSI1MCIgeT0iNDAiIGZpbGw9IiMyMDIwMzAiIHN0cm9rZT0iIzMwMzA0MCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiB4PSIwIiB5PSI3MCIgZmlsbD0iIzIwMjAzMCIgc3Ryb2tlPSIjMzAzMDQwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ2FsbGVyeSkiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-30 projects-parallax"></div>
        
        <div className="container mx-auto max-w-6xl relative">
          <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
            Project Showcase
          </h2>
          
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 projects-parallax">
              {sortedProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="project-card scroll-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => openProjectDetail(project)}
                >
                  <div className="bg-indigo-900/30 backdrop-blur-sm rounded-xl overflow-hidden border border-indigo-500/20 shadow-lg h-full cursor-pointer">
                    {/* Project thumbnail */}
                    <div className="h-48 overflow-hidden relative">
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      
                      {/* Overlay info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5">
                        <Badge className="self-start mb-2 bg-indigo-600/70 text-white border-0">
                          {project.category || 'Project'}
                        </Badge>
                        <h3 className="text-xl font-bold text-white">{project.title}</h3>
                        <div className="flex items-center mt-2 text-white/80 text-sm">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {formatDate(project.startDate)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Project description */}
                    <div className="p-5">
                      <p className="text-white/80 line-clamp-3">
                        {project.description || 'Click to learn more about this project.'}
                      </p>
                      
                      {/* View details button */}
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="ghost" 
                          className="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-700/30 pl-0 pr-0"
                        >
                          View Details 
                          <ChevronDown className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-indigo-900/30 backdrop-blur-sm rounded-3xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-700/50 flex items-center justify-center">
                <Image className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-medium text-indigo-300 mb-2">Projects Coming Soon</h3>
              <p className="text-indigo-200/70">Visual projects will appear here once added.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Career Path Section */}
      <section 
        ref={experiencesRef}
        className="py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-gray-900 to-indigo-950 text-white relative overflow-hidden"
      >
        {/* Star constellation background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJjb25zdGVsbGF0aW9uIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEiIGZpbGw9IndoaXRlIi8+PGNpcmNsZSBjeD0iMTc1IiBjeT0iMTI1IiByPSIxIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMTI1IiByPSIxIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjEyNSIgY3k9IjE3NSIgcj0iMSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSI3NSIgY3k9IjE3NSIgcj0iMSIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMTAwIDEwMCBMIDE1MCA1MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjIiLz48cGF0aCBkPSJNMTAwIDEwMCBMIDUwIDUwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjAuMiIvPjxwYXRoIGQ9Ik0xMDAgMTAwIEwgMTc1IDEyNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjIiLz48cGF0aCBkPSJNMTAwIDEwMCBMIDI1IDEyNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjIiLz48cGF0aCBkPSJNMTAwIDEwMCBMIDEyNSAxNzUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIi8+PHBhdGggZD0iTTEwMCAxMDAgTCA3NSAxNzUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NvbnN0ZWxsYXRpb24pIiBvcGFjaXR5PSIwLjE1Ii8+PC9zdmc+')] opacity-30 experiences-parallax"></div>
        
        <div className="container mx-auto max-w-5xl relative">
          <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
            Career Path
          </h2>
          
          {sortedExperiences.length > 0 ? (
            <div className="relative experiences-parallax">
              {/* Timeline connector */}
              <div className="absolute top-0 bottom-0 left-0 md:left-1/2 w-px md:-ml-px timeline-connector"></div>
              
              {sortedExperiences.map((experience, index) => (
                <div 
                  key={experience.id} 
                  className="mb-12 last:mb-0 relative scroll-reveal"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute top-0 left-1/2 -ml-3.5 experience-dot">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border-2 border-gray-800 shadow-lg shadow-indigo-900/50">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  {/* Experience card - alternating sides for larger screens */}
                  <div className={`relative md:w-1/2 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                    <div className={`md:${index % 2 === 0 ? 'ml-8' : 'mr-8'}`}>
                      <div className="bg-indigo-900/30 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
                        {/* Position and timeline */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
                          <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                          
                          <div className="flex items-center text-indigo-300">
                            <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
                            <span>
                              {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Company and location */}
                        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
                          <div className="text-lg font-medium text-white">{experience.company}</div>
                          
                          {experience.location && (
                            <div className="flex items-center text-indigo-300 text-sm">
                              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                              <span>{experience.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Industry and domain */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {experience.industry && (
                            <Badge className="bg-indigo-700/50 text-indigo-200 border-indigo-500/30">
                              {experience.industry}
                            </Badge>
                          )}
                          
                          {experience.domain && (
                            <Badge className="bg-purple-700/50 text-purple-200 border-purple-500/30">
                              {experience.domain}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Description */}
                        {experience.description && (
                          <div className="mb-5">
                            <p className="text-white/80">{experience.description}</p>
                          </div>
                        )}
                        
                        {/* Key responsibilities */}
                        {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-indigo-300 mb-3">Key Responsibilities:</h4>
                            <ul className="list-disc pl-5 space-y-1 text-white/80">
                              {experience.keyResponsibilities.map((responsibility, index) => (
                                <li key={index}>{responsibility}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-indigo-900/30 backdrop-blur-sm rounded-3xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-700/50 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-medium text-indigo-300 mb-2">Career Journey Coming Soon</h3>
              <p className="text-indigo-200/70">Your work experience will appear here.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Education Section */}
      {sortedEducations.length > 0 && (
        <section 
          ref={educationRef}
          className="py-24 px-4 sm:px-6 md:px-8 bg-indigo-950 text-white relative overflow-hidden"
        >
          {/* Knowledge waves background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlcyIgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgxMCkiPjxwYXRoIGQ9Ik0wIDI1IGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAwKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0wIDUwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAwKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik0wIDc1IGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAwKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0wIDEwMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgMCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ29sZCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjMiLz48cGF0aCBkPSJNMCAxMjUgYyA1MCAtMjUgNTAgMjUgMTAwIDAgYyA1MCAtMjUgNTAgMjUgMTAwIDAgYyA1MCAtMjUgNTAgMjUgMTAwIDAgYyA1MCAtMjUgNTAgMjUgMTAwIDAgYyA1MCAtMjUgNTAgMjUgMTAwIDAgYyA1MCAtMjUgNTAgMjUgMTAwIDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDApIiBmaWxsPSJub25lIiBzdHJva2U9ImdvbGQiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4yIi8+PHBhdGggZD0iTTAgMTUwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIGMgNTAgLTI1IDUwIDI1IDEwMCAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAwKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJnb2xkIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik0wIDE3NSBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCBjIDUwIC0yNSA1MCAyNSAxMDAgMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgMCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ29sZCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZXMpIi8+PC9zdmc+')] opacity-20 education-parallax"></div>
          
          <div className="container mx-auto max-w-6xl relative">
            <h2 className="section-heading text-3xl md:text-5xl font-bold mb-16 text-center scroll-reveal">
              Academic Background
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 education-parallax">
              {sortedEducations.map((education, index) => (
                <div 
                  key={education.id} 
                  className="education-badge scroll-reveal"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="bg-indigo-900/30 backdrop-blur-sm border border-amber-500/20 rounded-2xl overflow-hidden shadow-lg shadow-amber-900/10 h-full">
                    {/* Degree header */}
                    <div className="bg-gradient-to-r from-amber-700 to-amber-500 py-4 px-5">
                      <h3 className="font-bold text-xl text-white">{education.degree}</h3>
                    </div>
                    
                    <div className="p-6">
                      {/* Institution and location */}
                      <div className="mb-4">
                        <div className="font-medium text-xl text-white mb-2">{education.institution}</div>
                        
                        {education.location && (
                          <div className="flex items-center text-indigo-300 text-sm">
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            <span>{education.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex items-center text-amber-300 mb-4 text-sm">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span>
                          {formatDate(education.startDate)} — {education.endDate ? formatDate(education.endDate) : 'Present'}
                        </span>
                      </div>
                      
                      {/* Field of study */}
                      {education.fieldOfStudy && (
                        <div className="flex items-start mb-4 text-white/80">
                          <BookOpen className="w-4 h-4 mr-2 mt-0.5 text-amber-400" />
                          <div>
                            <span className="text-amber-300 font-medium">Field of Study:</span> {education.fieldOfStudy}
                          </div>
                        </div>
                      )}
                      
                      {/* Industry and domain */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {education.industry && (
                          <Badge className="bg-indigo-700/50 text-indigo-200 border-indigo-500/30">
                            {education.industry}
                          </Badge>
                        )}
                        
                        {education.domain && (
                          <Badge className="bg-purple-700/50 text-purple-200 border-purple-500/30">
                            {education.domain}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Skills acquired */}
                      {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                        <div className="mt-5">
                          <div className="text-sm font-medium text-amber-300 mb-2">Skills Acquired:</div>
                          <div className="flex flex-wrap gap-2">
                            {education.skillsAcquired.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-amber-900/30 text-amber-200 border-amber-500/30 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Academic achievements */}
                      {education.academicAchievements && education.academicAchievements.length > 0 && (
                        <div className="mt-5">
                          <div className="text-sm font-medium text-amber-300 mb-2">Achievements:</div>
                          <ul className="list-disc pl-5 space-y-1 text-white/80">
                            {education.academicAchievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 lg:px-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white sticky-footer">
        <div className="container mx-auto max-w-4xl text-center scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Connect?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-indigo-100">Let's create something amazing together. Reach out for collaborations, inquiries, or just to say hello.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 text-lg rounded-full shadow-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              className="bg-indigo-700 text-white hover:bg-indigo-800 border border-indigo-400 px-8 py-3 text-lg rounded-full shadow-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
            
            <Button 
              className="bg-purple-700 text-white hover:bg-purple-800 border border-purple-400 px-8 py-3 text-lg rounded-full shadow-lg"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Mentor Me
            </Button>
          </div>
        </div>
      </section>
      
      {/* Let's Talk Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Let's Talk</DialogTitle>
            <div className="w-16 h-1 bg-indigo-500 rounded-full mx-auto my-2"></div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-6">
              {/* Purpose dropdown */}
              <div className="space-y-2">
                <label className="font-medium text-white">Purpose to connect:</label>
                <Select value={contactPurpose} onValueChange={setContactPurpose}>
                  <SelectTrigger className="w-full bg-gray-800 border-indigo-500/30 text-white">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-indigo-500/30 text-white">
                    <SelectItem value="job-opportunity">Exciting job opportunities</SelectItem>
                    <SelectItem value="project-collaboration">Project collaboration</SelectItem>
                    <SelectItem value="networking">Professional networking</SelectItem>
                    <SelectItem value="partnership">Partnership opportunity</SelectItem>
                    <SelectItem value="freelance">Freelance work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Message box */}
              <div className="space-y-2">
                <label className="font-medium text-white">Write a note to start the conversation:</label>
                <Textarea 
                  placeholder="Write a message to get the conversation started..."
                  className="min-h-[120px] bg-gray-800 border-indigo-500/30 text-white"
                  maxLength={350}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
                <div className="text-xs text-right text-gray-400">
                  {contactMessage.length}/350 characters
                </div>
              </div>
              
              {/* Submit button */}
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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
        <DialogContent className="sm:max-w-4xl overflow-auto max-h-[90vh] bg-gray-900 border border-indigo-500/30 text-white">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 text-white hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:pointer-events-none">
            <ChevronDown className="h-4 w-4" />
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
                  <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-purple-700 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-white/50" />
                  </div>
                )}
              </div>
              
              {/* Project title and metadata */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-white">{selectedProject.title}</h2>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {selectedProject.category && (
                    <Badge className="bg-indigo-700/50 text-indigo-200 border-indigo-500/30">
                      {selectedProject.category}
                    </Badge>
                  )}
                  
                  {selectedProject.industry && (
                    <Badge className="bg-purple-700/50 text-purple-200 border-purple-500/30">
                      {selectedProject.industry}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center text-indigo-300">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>{formatDate(selectedProject.startDate)}</span>
                    {selectedProject.endDate && (
                      <span> — {formatDate(selectedProject.endDate)}</span>
                    )}
                  </div>
                  
                  {selectedProject.projectUrl && (
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
                    >
                      Visit Project
                    </a>
                  )}
                </div>
                
                {/* Project description */}
                <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-lg p-6 mb-8">
                  <p className="text-white/80 whitespace-pre-line">
                    {selectedProject.description || 'No detailed description available for this project.'}
                  </p>
                </div>
                
                {/* Additional media gallery */}
                {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">Project Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProject.mediaUrls.map((url, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-indigo-500/20">
                          <img 
                            src={url} 
                            alt={`${selectedProject.title} - image ${index + 1}`} 
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}