import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Calendar, 
  MapPin, 
  Mail, 
  Linkedin, 
  Instagram, 
  Code, 
  ChevronRight, 
  ChevronDown,
  BriefcaseBusiness,
  Building,
  BookOpen, 
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  Wallet, 
  ExternalLink, 
  User, 
  Clock, 
  Download,
  Lightbulb,
  MessageSquare,
  Volume2, 
  VolumeX, 
  LucideIcon
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TimelineStorytellerProps {
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

// For skill icons
const skillIconMap: Record<string, LucideIcon> = {
  default: Award
};

export default function TimelineStoryteller({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: TimelineStorytellerProps) {
  // State for audio narration feature
  const [isNarrating, setIsNarrating] = useState(false);
  
  // State for chapter navigation
  const [activeChapter, setActiveChapter] = useState("intro");
  const chapterRefs = {
    intro: useRef<HTMLDivElement>(null),
    career: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    certifications: useRef<HTMLDivElement>(null)
  };
  
  // State for Let's Talk modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const { toast } = useToast();
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort projects by date
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services
  const sortedServices = [...userServices];
  
  // Helper for formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Scroll to chapter
  const scrollToChapter = (chapter: keyof typeof chapterRefs) => {
    setActiveChapter(chapter);
    if (chapterRefs[chapter]?.current) {
      chapterRefs[chapter]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Toggle narration
  const toggleNarration = () => {
    setIsNarrating(!isNarrating);
    // This would connect to a real audio system in a full implementation
  };
  
  // Auto-scroll story view
  const viewMyStory = () => {
    // Set a delay between each scroll
    const chapters = Object.keys(chapterRefs) as Array<keyof typeof chapterRefs>;
    chapters.forEach((chapter, index) => {
      setTimeout(() => {
        scrollToChapter(chapter);
      }, index * 2000); // 2 second intervals between chapters
    });
  };
  
  // Handle contact form submission
  const handleContactSubmit = () => {
    if (!contactPurpose) {
      toast({
        title: "Please select a purpose",
        description: "Please select a reason for connecting",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would send the message
    toast({
      title: "Message sent!",
      description: "Your message has been sent successfully",
    });
    
    setIsContactModalOpen(false);
    setContactPurpose("");
    setContactMessage("");
  };
  
  // Initialize animations and scroll tracking
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Timeline Storyteller Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes blinkCursor {
        from, to { border-right-color: transparent; }
        50% { border-right-color: currentColor; }
      }
      
      @keyframes glowPulse {
        0% { box-shadow: 0 0 0 0 rgba(203, 213, 255, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(203, 213, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(203, 213, 255, 0); }
      }
      
      @keyframes drawPath {
        0% { stroke-dashoffset: 2000; }
        100% { stroke-dashoffset: 0; }
      }
      
      @keyframes nodeGlow {
        0% { filter: drop-shadow(0 0 2px rgba(255, 159, 178, 0.8)); }
        50% { filter: drop-shadow(0 0 8px rgba(255, 159, 178, 0.8)); }
        100% { filter: drop-shadow(0 0 2px rgba(255, 159, 178, 0.8)); }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes expand {
        0% { transform: scale(0.9); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes lineAnimation {
        0% { height: 0; opacity: 0; }
        100% { height: 100%; opacity: 1; }
      }
      
      /* Base animations */
      .timeline-storyteller-template .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-fade-in-left {
        opacity: 0;
        animation: fadeInLeft 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-fade-in-right {
        opacity: 0;
        animation: fadeInRight 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-typewriter {
        overflow: hidden;
        white-space: nowrap;
        display: inline-block;
        border-right: 2px solid;
        width: 0;
        animation: 
          typewriter 3.5s steps(40, end) forwards,
          blinkCursor 0.8s step-end infinite;
      }
      
      /* Timeline specific styles */
      .timeline-storyteller-template .timeline-dot {
        position: relative;
        z-index: 2;
        animation: glowPulse 3s infinite, float 6s ease-in-out infinite;
        transition: all 0.5s ease;
      }
      
      .timeline-storyteller-template .timeline-node {
        position: relative;
        animation: nodeGlow 3s infinite;
        transition: all 0.3s ease;
      }
      
      .timeline-storyteller-template .timeline-node:hover {
        transform: scale(1.1);
      }
      
      .timeline-storyteller-template .timeline-path {
        stroke-dasharray: 2000;
        stroke-dashoffset: 2000;
        animation: drawPath 5s ease-out forwards;
        stroke-width: 2px;
      }
      
      .timeline-storyteller-template .timeline-vertical-line {
        position: absolute;
        left: 50%;
        width: 3px;
        background: linear-gradient(to bottom, #E2E8F8, #CAD2FE);
        transform: translateX(-50%);
        animation: lineAnimation 1.5s ease-out forwards;
        z-index: 1;
      }
      
      /* Staggered animations */
      .timeline-storyteller-template .animate-fade-in:nth-child(1) { animation-delay: 0.1s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(2) { animation-delay: 0.3s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(3) { animation-delay: 0.5s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(4) { animation-delay: 0.7s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(5) { animation-delay: 0.9s; }
      
      /* Hero animations */
      .timeline-storyteller-template .hero-bg-shape {
        position: absolute;
        opacity: 0.5;
        filter: blur(40px);
        z-index: 0;
        animation: float 8s ease-in-out infinite;
      }
      
      /* Card animations */
      .timeline-storyteller-template .card-animated {
        transform-origin: center bottom;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      }
      
      .timeline-storyteller-template .card-animated:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      
      .timeline-storyteller-template .timeline-entry {
        opacity: 0.7;
        transform: scale(0.95);
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .timeline-storyteller-template .timeline-entry.active,
      .timeline-storyteller-template .timeline-entry:hover {
        opacity: 1;
        transform: scale(1);
      }
      
      .timeline-storyteller-template .timeline-entry.active {
        animation: expand 0.5s forwards;
      }
      
      /* Navigation elements */
      .timeline-storyteller-template .chapter-nav {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        right: 30px;
        z-index: 50;
      }
      
      .timeline-storyteller-template .chapter-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #e0e0e0;
        margin: 12px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
      
      .timeline-storyteller-template .chapter-indicator.active {
        background-color: #FF9FB2;
        transform: scale(1.3);
        box-shadow: 0 0 10px rgba(255, 159, 178, 0.5);
      }
      
      .timeline-storyteller-template .progress-line {
        position: absolute;
        width: 2px;
        background: linear-gradient(to bottom, #E2E8F8, #CAD2FE);
        left: 50%;
        transform: translateX(-50%);
        transition: height 0.5s ease;
      }
      
      /* CTA buttons */
      .timeline-storyteller-template .cta-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .timeline-storyteller-template .cta-btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
      }
      
      .timeline-storyteller-template .cta-btn:hover::after {
        transform: translateX(100%);
        transition: transform 0.6s ease;
      }
      
      /* Modal animations */
      .timeline-storyteller-template .modal-animation {
        animation: fadeIn 0.3s ease-out;
      }
      
      /* Drag handle */
      .timeline-storyteller-template .drag-handle {
        width: 50px;
        height: 5px;
        border-radius: 10px;
        background-color: rgba(0, 0, 0, 0.1);
        margin: 0 auto;
        cursor: grab;
      }
      
      .timeline-storyteller-template .drag-handle:active {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(style);
    
    // Intersection observer for chapter detection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find the id of the intersecting chapter
          const id = entry.target.id.replace('chapter-', '');
          if (id && Object.keys(chapterRefs).includes(id)) {
            setActiveChapter(id as keyof typeof chapterRefs);
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all chapter sections
    Object.keys(chapterRefs).forEach(key => {
      const element = chapterRefs[key as keyof typeof chapterRefs].current;
      if (element) observer.observe(element);
    });
    
    return () => {
      document.head.removeChild(style);
      Object.keys(chapterRefs).forEach(key => {
        const element = chapterRefs[key as keyof typeof chapterRefs].current;
        if (element) observer.unobserve(element);
      });
    };
  }, []);
  
  return (
    <div className="timeline-storyteller-template overflow-x-hidden font-sans" style={{ background: "#FAFAFA" }}>
      {/* Chapter navigation dots */}
      <div className="chapter-nav hidden lg:block">
        <div className="relative flex flex-col items-center h-52">
          <div className="progress-line" style={{ height: `${Object.keys(chapterRefs).indexOf(activeChapter) * 100 / (Object.keys(chapterRefs).length - 1)}%` }}></div>
          {Object.keys(chapterRefs).map((chapter, index) => (
            <div 
              key={chapter}
              className={`chapter-indicator ${activeChapter === chapter ? 'active' : ''}`}
              onClick={() => scrollToChapter(chapter as keyof typeof chapterRefs)}
              title={chapter.charAt(0).toUpperCase() + chapter.slice(1)}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Audio narration control - on mobile only */}
      <div className="fixed bottom-4 left-4 z-50 md:hidden">
        <Button 
          onClick={toggleNarration} 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-md h-10 w-10"
        >
          {isNarrating ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Hero Section */}
      <section 
        id="chapter-intro"
        ref={chapterRefs.intro}
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-indigo-50 via-pink-50 to-purple-50 relative overflow-hidden px-4 md:px-8"
      >
        {/* Background shapes */}
        <div className="hero-bg-shape absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-pink-200 opacity-30"></div>
        <div className="hero-bg-shape absolute bottom-1/3 right-0 w-80 h-80 rounded-full bg-indigo-200 opacity-25" style={{ animationDelay: '1s' }}></div>
        <div className="hero-bg-shape absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-purple-200 opacity-20" style={{ animationDelay: '2s' }}></div>
        
        <div className="mx-auto max-w-4xl z-10 text-center relative">
          {/* Dynamic line animation */}
          <div className="mb-8 relative">
            <svg className="w-full h-8 absolute -top-12" viewBox="0 0 400 40">
              <path 
                d="M 0,20 C 100,10 300,30 400,20" 
                stroke="#e0e7ff" 
                strokeWidth="2" 
                fill="none"
                className="timeline-path"
              />
            </svg>
          </div>
          
          {/* Profile picture centered on timeline */}
          <div className="relative flex justify-center items-center mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg timeline-dot bg-white">
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name || "User profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-pink-300 blur-xl opacity-30"></div>
          </div>
          
          {/* Name with prominent styling */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            {userInfo.name}
          </h1>
          
          {/* Job Title in dynamic headline */}
          <div className="text-xl md:text-2xl text-gray-700 mb-6 overflow-hidden animate-typewriter">
            I'm a {userInfo.title || "Professional"} shaping the future of {userInfo.industry || "industry"}
          </div>
          
          {/* Location subtly placed */}
          <div className="flex items-center justify-center mt-2 mb-6 text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{userInfo.location || "Location"}</span>
          </div>
          
          {/* Industry & Domain as pastel tags */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {userInfo.industry && (
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200 py-1.5 px-4 rounded-full flex items-center">
                <Building className="h-3.5 w-3.5 mr-1.5" />
                {userInfo.industry}
              </Badge>
            )}
            {userInfo.domain && (
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 py-1.5 px-4 rounded-full flex items-center">
                <Code className="h-3.5 w-3.5 mr-1.5" />
                {userInfo.domain}
              </Badge>
            )}
            {userInfo.lookingFor && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 py-1.5 px-4 rounded-full flex items-center">
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                Looking for {userInfo.lookingFor}
              </Badge>
            )}
          </div>
          
          {/* Call to Actions - Always Visible */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-md shadow-md cta-btn"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              variant="outline" 
              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 px-6 py-3 rounded-md shadow-sm cta-btn"
            >
              <Download className="h-5 w-5 mr-2" />
              Grab My Resume
            </Button>
            
            <Button 
              variant="outline" 
              className="text-purple-600 border-purple-300 hover:bg-purple-50 px-6 py-3 rounded-md shadow-sm cta-btn"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Mentor
            </Button>
          </div>
        </div>
      </section>
      
      {/* Career Path (Timeline Navigation) */}
      <section 
        id="chapter-career" 
        ref={chapterRefs.career}
        className="py-24 px-8 bg-gradient-to-b from-white to-pink-50 min-h-screen"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-pink-100 px-3 py-1 rounded-full text-pink-800 text-sm font-medium mb-3 animate-fade-in">
              My Career Journey
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Career Path</h2>
          </div>
          
          {/* Vertical timeline with nodes */}
          <div className="relative mt-12 animate-fade-in">
            {/* Timeline vertical line */}
            <div className="timeline-vertical-line absolute top-0 bottom-0 h-full"></div>
            
            {/* Work experiences */}
            <div className="relative z-10">
              {sortedExperiences.length > 0 ? (
                <div className="space-y-16">
                  {sortedExperiences.map((exp, index) => (
                    <div key={exp.id} 
                      className={`timeline-entry flex items-start ${index === 0 ? 'active' : ''}`}
                      onClick={() => {
                        // Expand this entry when clicked
                        const entries = document.querySelectorAll('.timeline-entry');
                        entries.forEach(e => e.classList.remove('active'));
                        document.getElementById(`exp-${exp.id}`)?.classList.add('active');
                      }}
                      id={`exp-${exp.id}`}
                    >
                      {/* Timeline node */}
                      <div className="mr-8 pt-2 relative">
                        <div className="timeline-node w-8 h-8 rounded-full bg-white border-2 border-pink-300 shadow-md flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-pink-500" />
                        </div>
                        {/* Date tag */}
                        <div className="absolute top-12 -left-2 transform -rotate-90 origin-top-left whitespace-nowrap">
                          <span className="text-xs font-medium bg-pink-100 text-pink-800 py-1 px-2 rounded-md">
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Experience card */}
                      <div className="card-animated bg-white rounded-lg shadow-md p-6 border border-pink-100 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">{exp.title}</h3>
                          {exp.company && (
                            <Badge className="bg-pink-100 text-pink-700 font-normal">
                              {exp.company}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{exp.description}</p>
                        
                        {/* Key achievement */}
                        <div className="bg-pink-50 rounded-md p-3 border border-pink-100">
                          <h4 className="text-sm font-medium text-pink-800 mb-1">Key Achievement</h4>
                          <p className="text-sm text-gray-700">
                            {exp.description ? `${exp.description.substring(0, 100)}...` : "Led cross-functional teams to deliver projects on time and within budget."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-pink-400" />
                  </div>
                  <p className="text-gray-500">Your work experiences will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Education Journey */}
      <section 
        id="chapter-education" 
        ref={chapterRefs.education}
        className="py-24 px-8 bg-gradient-to-b from-pink-50 to-indigo-50 min-h-screen"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              My Learning Path
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Education</h2>
          </div>
          
          {/* Education timeline */}
          <div className="relative mt-12 animate-fade-in">
            {/* Timeline vertical line */}
            <div className="timeline-vertical-line absolute top-0 bottom-0 h-full"></div>
            
            {/* Education experiences */}
            <div className="relative z-10">
              {sortedEducations.length > 0 ? (
                <div className="space-y-16">
                  {sortedEducations.map((edu, index) => (
                    <div key={edu.id} 
                      className={`timeline-entry flex items-start ${index === 0 ? 'active' : ''}`}
                      onClick={() => {
                        // Expand this entry when clicked
                        const entries = document.querySelectorAll('.timeline-entry');
                        entries.forEach(e => e.classList.remove('active'));
                        document.getElementById(`edu-${edu.id}`)?.classList.add('active');
                      }}
                      id={`edu-${edu.id}`}
                    >
                      {/* Timeline node */}
                      <div className="mr-8 pt-2 relative">
                        <div className="timeline-node w-8 h-8 rounded-full bg-white border-2 border-indigo-300 shadow-md flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-indigo-500" />
                        </div>
                        {/* Date tag */}
                        <div className="absolute top-12 -left-2 transform -rotate-90 origin-top-left whitespace-nowrap">
                          <span className="text-xs font-medium bg-indigo-100 text-indigo-800 py-1 px-2 rounded-md">
                            {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Education card */}
                      <div className="card-animated bg-white rounded-lg shadow-md p-6 border border-indigo-100 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">{edu.degree}</h3>
                          {edu.institution && (
                            <Badge className="bg-indigo-100 text-indigo-700 font-normal">
                              {edu.institution}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Location if available */}
                        {edu.location && (
                          <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{edu.location}</span>
                          </div>
                        )}
                        
                        {/* Highlights */}
                        <div className="bg-indigo-50 rounded-md p-3 border border-indigo-100">
                          <h4 className="text-sm font-medium text-indigo-800 mb-1">Highlight</h4>
                          <p className="text-sm text-gray-700">
                            Focused on academic excellence and practical application of concepts.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-indigo-400" />
                  </div>
                  <p className="text-gray-500">Your education history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Showcase */}
      <section 
        id="chapter-projects" 
        ref={chapterRefs.projects}
        className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-purple-100 px-3 py-1 rounded-full text-purple-800 text-sm font-medium mb-3 animate-fade-in">
              My Projects
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Featured Work</h2>
          </div>
          
          {/* Project Gallery */}
          <div className="grid grid-cols-1 gap-8 animate-fade-in">
            {sortedProjects.length > 0 ? (
              sortedProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className="card-animated bg-white rounded-lg shadow-lg overflow-hidden border border-purple-100"
                >
                  {/* Project media header */}
                  <div className="relative h-56 overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Timeline indicator */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-full py-1 px-3 shadow-md text-xs font-medium text-purple-700 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(project.startDate)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{project.title}</h3>
                    
                    <p className="text-gray-600 mb-6">{project.description}</p>
                    
                    {/* Project links and additional info */}
                    <div className="flex justify-between items-center">
                      <div className="space-x-2">
                        {project.category && (
                          <Badge className="bg-purple-100 text-purple-700">
                            {project.category}
                          </Badge>
                        )}
                      </div>
                      
                      {project.projectUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => window.open(project.projectUrl || '#', '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Project
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-gray-500">Your projects will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Certifications & Highlights Section */}
      <section 
        id="chapter-certifications" 
        ref={chapterRefs.certifications}
        className="py-24 px-8 bg-gradient-to-b from-purple-50 to-white min-h-screen"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-pink-100 px-3 py-1 rounded-full text-pink-800 text-sm font-medium mb-3 animate-fade-in">
              My Achievements
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Certifications & Highlights</h2>
          </div>
          
          {/* If there are skills, display them as certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {sortedSkills.length > 0 ? (
              sortedSkills.slice(0, 6).map((skill) => (
                <div key={skill.id} className="card-animated bg-white rounded-lg shadow-md overflow-hidden border border-pink-100">
                  <div className="h-2 bg-gradient-to-r from-pink-400 to-purple-400"></div>
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="mr-4 mt-1">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-pink-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{skill.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {skill.level || `${skill.proficiency || 0}% Proficiency`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="h-2 w-full bg-gray-100 rounded-full mt-2">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" 
                        style={{ width: `${skill.proficiency || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-pink-400" />
                </div>
                <p className="text-gray-500">Your certifications and key achievements will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Let's Talk Modal Dialog */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md modal-animation">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-800">Let's Talk</DialogTitle>
            <div className="drag-handle mt-1 mb-2"></div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-6">
              {/* Purpose dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Purpose to connect:</label>
                <Select value={contactPurpose} onValueChange={setContactPurpose}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job-opportunity">Exciting job opportunities are available, and I believe you'd be a great fit.</SelectItem>
                    <SelectItem value="project-collaboration">Would you be open to teaming up on innovative projects?</SelectItem>
                    <SelectItem value="networking">Let's connect — I admire your work and would love to stay in touch.</SelectItem>
                    <SelectItem value="partnership">I'd like to explore a potential partnership opportunity with you.</SelectItem>
                    <SelectItem value="freelance">I have some exciting freelance projects you might be interested in.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Message box */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Write a note to start the conversation (Optional):</label>
                <Textarea 
                  placeholder="Write a note to start the conversation..."
                  className="min-h-[100px]"
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  onClick={handleContactSubmit}
                >
                  Request Connection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}