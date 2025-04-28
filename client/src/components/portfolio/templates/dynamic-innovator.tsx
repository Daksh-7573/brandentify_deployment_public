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
  ExternalLink, 
  Download,
  FileText,
  Award,
  Briefcase,
  Folder,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Plus,
  Zap,
  Cpu,
  ChevronDown,
  Layout,
  BarChart,
  Server,
  Database,
  Globe,
  Image as ImageIcon,
  Layers,
  CircuitBoard,
  GitBranch,
  Terminal,
  X,
  Upload,
  LucideIcon,
  ChevronRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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
    whatIOffer: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

// For skill icons
const skillIconMap: Record<string, LucideIcon> = {
  "AI": Cpu,
  "Machine Learning": Server,
  "Data Science": Database,
  "Web Development": Globe,
  "Software Engineering": Code,
  "Cloud": Layers,
  "DevOps": GitBranch,
  "Architecture": CircuitBoard,
  "Analytics": BarChart,
  "UX": Layout,
  default: Award
};

// Helper function to get icon for skill
const getSkillIcon = (skillName: string): LucideIcon => {
  // Try to find by exact name first
  if (skillIconMap[skillName]) {
    return skillIconMap[skillName];
  }
  
  // Try to find by partial match
  const key = Object.keys(skillIconMap).find(k => 
    skillName.toLowerCase().includes(k.toLowerCase())
  );
  
  return key ? skillIconMap[key] : skillIconMap.default;
};

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
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // State for scanner animation
  const [scannerOn, setScannerOn] = useState(false);
  
  // States for modals
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("projects");
  
  // References to sections
  const sectionRefs = {
    projects: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    career: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null)
  };
  
  // Toast notifications
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
  
  // Helper for formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Function to scroll to a section
  const scrollToSection = (sectionKey: keyof typeof sectionRefs) => {
    setActiveTab(sectionKey);
    sectionRefs[sectionKey]?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // Open project detail modal
  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
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
  
  // Initialize animations, styles, and typewriter effect on component mount
  useEffect(() => {
    // Add web fonts
    const orbitronLink = document.createElement('link');
    orbitronLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap';
    orbitronLink.rel = 'stylesheet';
    
    const jetbrainsLink = document.createElement('link');
    jetbrainsLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;300;400;500;700&display=swap';
    jetbrainsLink.rel = 'stylesheet';
    
    document.head.appendChild(orbitronLink);
    document.head.appendChild(jetbrainsLink);
    
    // Add CSS for animations and styles
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      /* Dynamic Innovator Theme - Futuristic & High-Tech Styling */
      :root {
        --neon-blue: #08f7fe;
        --neon-pink: #fe53bb;
        --neon-purple: #7122FA;
        --neon-teal: #09fbd3;
        --dark-blue: #080E24;
        --medium-blue: #0c162d;
        --light-blue: #1f2b4e;
        --hologram-blue: rgba(8, 247, 254, 0.3);
        --hologram-pink: rgba(254, 83, 187, 0.3);
      }
      
      /* Animations */
      @keyframes scanAnimation {
        0% { height: 5%; opacity: 0.1; }
        50% { height: 98%; opacity: 0.95; }
        100% { height: 5%; opacity: 0.1; }
      }
      
      @keyframes terminalCursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      @keyframes neonGlow {
        0% { text-shadow: 0 0 5px var(--neon-blue), 0 0 8px var(--neon-blue); }
        50% { text-shadow: 0 0 15px var(--neon-blue), 0 0 20px var(--neon-blue); }
        100% { text-shadow: 0 0 5px var(--neon-blue), 0 0 8px var(--neon-blue); }
      }
      
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes pulseOutline {
        0% { outline-color: rgba(8, 247, 254, 0.4); }
        50% { outline-color: rgba(254, 83, 187, 0.4); }
        100% { outline-color: rgba(8, 247, 254, 0.4); }
      }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes digitalStreamBg {
        0% { background-position: 0% 0%; }
        100% { background-position: 100% 100%; }
      }
      
      @keyframes glitchEffect {
        0% { 
          text-shadow: 0.05em 0 0 var(--neon-blue), -0.05em -0.025em 0 var(--neon-pink);
          transform: skewX(10deg);
        }
        10% { 
          text-shadow: 0.05em 0 0 var(--neon-blue), -0.05em -0.025em 0 var(--neon-pink);
          transform: skewX(10deg);
        }
        11% { 
          text-shadow: -0.05em -0.025em 0 var(--neon-blue), 0.05em 0 0 var(--neon-pink);
          transform: skewX(0);
        }
        20% { 
          text-shadow: -0.05em -0.025em 0 var(--neon-blue), 0.05em 0 0 var(--neon-pink);
          transform: skewX(0);
        }
        21% { 
          text-shadow: 0.05em 0 0 var(--neon-blue), -0.05em -0.025em 0 var(--neon-pink);
          transform: skewX(-5deg);
        }
        40% { 
          text-shadow: 0.05em 0 0 var(--neon-blue), -0.05em -0.025em 0 var(--neon-pink);
          transform: skewX(-5deg);
        }
        41% { 
          text-shadow: -0.05em -0.025em 0 var(--neon-blue), 0.05em 0 0 var(--neon-pink);
          transform: skewX(0);
        }
        100% { 
          text-shadow: -0.05em -0.025em 0 var(--neon-blue), 0.05em 0 0 var(--neon-pink);
          transform: skewX(0);
        }
      }
      
      /* Base Styles */
      .dynamic-innovator-template {
        font-family: 'JetBrains Mono', monospace;
        background-color: var(--dark-blue);
        background-image: 
          radial-gradient(circle at 80% 20%, rgba(113, 34, 250, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(8, 247, 254, 0.1) 0%, transparent 50%);
        color: white;
        overflow-x: hidden;
      }
      
      .dynamic-innovator-template .section {
        position: relative;
      }
      
      .dynamic-innovator-template .section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2308f7fe' stroke-width='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        opacity: 0.05;
        z-index: -1;
      }
      
      .dynamic-innovator-template h1, 
      .dynamic-innovator-template h2, 
      .dynamic-innovator-template h3, 
      .dynamic-innovator-template .futuristic-heading {
        font-family: 'Orbitron', sans-serif;
      }
      
      /* Digital Scanner Frame */
      .dynamic-innovator-template .scanner-profile-frame {
        position: relative;
        overflow: hidden;
        border-radius: 50%;
        border: 2px solid var(--neon-blue);
        box-shadow: 0 0 15px rgba(8, 247, 254, 0.5);
      }
      
      .dynamic-innovator-template .scanner-line {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5%;
        background: linear-gradient(to bottom, 
          transparent, 
          rgba(8, 247, 254, 0.8), 
          transparent
        );
        animation: scanAnimation 3s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
      }
      
      /* Neon Text */
      .dynamic-innovator-template .neon-text {
        color: var(--neon-blue);
        text-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue);
        animation: neonGlow 3s ease-in-out infinite;
      }
      
      .dynamic-innovator-template .neon-pink-text {
        color: var(--neon-pink);
        text-shadow: 0 0 5px var(--neon-pink), 0 0 10px var(--neon-pink);
      }
      
      .dynamic-innovator-template .neon-gradient-text {
        background: linear-gradient(90deg, var(--neon-blue), var(--neon-pink));
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientFlow 4s linear infinite;
      }
      
      /* Micro Widgets */
      .dynamic-innovator-template .micro-widget {
        position: relative;
        border-radius: 8px;
        background: var(--medium-blue);
        border: 1px solid var(--neon-blue);
        padding: 0.5rem;
        font-size: 0.75rem;
        transition: all 0.3s ease;
      }
      
      .dynamic-innovator-template .micro-widget:hover {
        border-color: var(--neon-pink);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(254, 83, 187, 0.2);
      }
      
      /* Tech Card Styles */
      .dynamic-innovator-template .tech-card {
        position: relative;
        border-radius: 8px;
        background: rgba(12, 22, 45, 0.7);
        border: 1px solid rgba(8, 247, 254, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .dynamic-innovator-template .tech-card::after {
        content: '';
        position: absolute;
        top: -100%;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg, 
          rgba(8, 247, 254, 0.1) 0%, 
          rgba(8, 247, 254, 0) 50%, 
          rgba(8, 247, 254, 0) 100%
        );
        transition: all 0.5s ease;
      }
      
      .dynamic-innovator-template .tech-card:hover {
        border-color: var(--neon-blue);
        box-shadow: 0 5px 20px rgba(8, 247, 254, 0.3);
        transform: translateY(-5px);
      }
      
      .dynamic-innovator-template .tech-card:hover::after {
        top: 0;
        left: 0;
      }
      
      /* Timeline Style */
      .dynamic-innovator-template .timeline {
        position: relative;
        padding-left: 30px;
      }
      
      .dynamic-innovator-template .timeline::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 2px;
        background: linear-gradient(to bottom, var(--neon-blue), var(--neon-purple));
      }
      
      .dynamic-innovator-template .timeline-node {
        position: relative;
        margin-bottom: 2rem;
      }
      
      .dynamic-innovator-template .timeline-node::before {
        content: '';
        position: absolute;
        left: -39px;
        top: 8px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: linear-gradient(45deg, var(--neon-blue), var(--neon-pink));
        box-shadow: 0 0 10px rgba(8, 247, 254, 0.5);
        z-index: 1;
      }
      
      .dynamic-innovator-template .timeline-node:hover::before {
        transform: scale(1.2);
        transition: transform 0.3s ease;
      }
      
      /* Terminal Effect */
      .dynamic-innovator-template .terminal-text {
        font-family: 'JetBrains Mono', monospace;
        color: #08f7fe;
        background-color: rgba(8, 14, 36, 0.8);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid rgba(8, 247, 254, 0.3);
      }
      
      .dynamic-innovator-template .terminal-cursor {
        display: inline-block;
        width: 10px;
        height: 20px;
        background-color: var(--neon-blue);
        animation: terminalCursorBlink 1s step-end infinite;
        vertical-align: middle;
        margin-left: 3px;
      }
      
      /* Button Styles */
      .dynamic-innovator-template .neon-button {
        background: linear-gradient(45deg, rgba(8, 247, 254, 0.2), rgba(254, 83, 187, 0.2));
        border: 1px solid var(--neon-blue);
        color: white;
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        font-family: 'Orbitron', sans-serif;
      }
      
      .dynamic-innovator-template .neon-button::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          to right,
          rgba(8, 247, 254, 0),
          rgba(8, 247, 254, 0.3),
          rgba(8, 247, 254, 0)
        );
        transform: rotate(30deg);
        transition: all 0.8s ease;
      }
      
      .dynamic-innovator-template .neon-button:hover {
        border-color: var(--neon-pink);
        box-shadow: 0 0 15px rgba(8, 247, 254, 0.3);
      }
      
      .dynamic-innovator-template .neon-button:hover::after {
        left: 100%;
      }
      
      /* Holographic Badges */
      .dynamic-innovator-template .holographic-badge {
        background: linear-gradient(135deg, var(--hologram-blue), var(--hologram-pink));
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
      }
      
      .dynamic-innovator-template .holographic-badge:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(8, 247, 254, 0.2);
      }
      
      /* Skill Meter */
      .dynamic-innovator-template .skill-meter {
        height: 10px;
        background: rgba(8, 247, 254, 0.1);
        border-radius: 5px;
        overflow: hidden;
      }
      
      .dynamic-innovator-template .skill-progress {
        height: 100%;
        background: linear-gradient(to right, var(--neon-blue), var(--neon-purple));
      }
      
      /* Project Card */
      .dynamic-innovator-template .project-card {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.4s ease;
        background: rgba(12, 22, 45, 0.6);
        border: 1px solid rgba(8, 247, 254, 0.3);
        backdrop-filter: blur(10px);
      }
      
      .dynamic-innovator-template .project-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 15px 30px rgba(8, 247, 254, 0.2);
        border-color: var(--neon-blue);
      }
      
      .dynamic-innovator-template .project-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        background: linear-gradient(to top, rgba(8, 14, 36, 0.95), rgba(8, 14, 36, 0));
        opacity: 0;
        transition: all 0.4s ease;
      }
      
      .dynamic-innovator-template .project-card:hover .project-overlay {
        opacity: 1;
      }
      
      /* Floating CTA */
      .dynamic-innovator-template .floating-cta {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        animation: float 3s infinite ease-in-out;
        z-index: 999;
      }
      
      /* Navigation Tabs */
      .dynamic-innovator-template .nav-tab {
        position: relative;
        font-family: 'Orbitron', sans-serif;
        padding: 0.5rem 1rem;
        transition: all 0.3s ease;
        cursor: pointer;
        outline: 2px solid transparent;
      }
      
      .dynamic-innovator-template .nav-tab.active {
        color: var(--neon-blue);
        outline: 2px solid var(--neon-blue);
        animation: pulseOutline 3s infinite;
      }
      
      .dynamic-innovator-template .nav-tab:hover:not(.active) {
        color: var(--neon-blue);
      }
      
      /* Modal Styling */
      .dynamic-innovator-template .futuristic-modal {
        background: rgba(12, 22, 45, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid var(--neon-blue);
        border-radius: 8px;
      }
      
      .dynamic-innovator-template .modal-header {
        border-bottom: 1px solid var(--neon-blue);
      }
      
      .dynamic-innovator-template .glassmorphic-input {
        background: rgba(12, 22, 45, 0.8);
        border: 1px solid rgba(8, 247, 254, 0.3);
        color: white;
        transition: all 0.3s ease;
      }
      
      .dynamic-innovator-template .glassmorphic-input:focus {
        border-color: var(--neon-blue);
        box-shadow: 0 0 10px rgba(8, 247, 254, 0.2);
        outline: none;
      }
      
      /* Media Queries */
      @media (max-width: 768px) {
        .dynamic-innovator-template .timeline {
          padding-left: 20px;
        }
        
        .dynamic-innovator-template .timeline-node::before {
          left: -28px;
          width: 14px;
          height: 14px;
        }
      }
    `;
    
    document.head.appendChild(styleTag);
    
    // Terminal typing effect for title
    const titleToType = userInfo.title || "AI Systems Architect";
    let currentText = "";
    let i = 0;
    
    const typingInterval = setInterval(() => {
      if (i < titleToType.length) {
        currentText += titleToType.charAt(i);
        setTypedText(currentText);
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 100);
    
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    // Scanner animation
    setTimeout(() => {
      setScannerOn(true);
      
      setTimeout(() => {
        setScannerOn(false);
      }, 3000);
    }, 1000);
    
    // Cleanup
    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
      document.head.removeChild(styleTag);
      document.head.removeChild(orbitronLink);
      document.head.removeChild(jetbrainsLink);
    };
  }, [userInfo.title]);
  
  return (
    <div className="dynamic-innovator-template min-h-screen pb-20">
      {/* Floating Mobile CTA */}
      <div className="md:hidden floating-cta">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          className="rounded-full h-14 w-14 flex items-center justify-center bg-gradient-to-r from-[#08f7fe] to-[#fe53bb] text-white shadow-lg shadow-[#08f7fe]/30"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Sticky Navigation */}
      <header className="sticky top-0 bg-[#080E24]/80 backdrop-blur-lg border-b border-[#08f7fe]/20 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-[#08f7fe]" />
              <span className="font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {userInfo.name.split(' ')[0]}
              </span>
            </div>
            
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="neon-button rounded-md text-sm px-4 py-2"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Let's Talk
              </Button>
              
              <Button
                className="neon-button rounded-md text-sm px-4 py-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Grab My Resume
              </Button>
              
              <Button
                className="neon-button rounded-md text-sm px-4 py-2"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Mentor
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="section py-16 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Digital Profile Image with Scanner Effect */}
          <div className="flex justify-center md:justify-start">
            <div className="scanner-profile-frame w-64 h-64 relative">
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-full h-full object-cover"
              />
              {scannerOn && <div className="scanner-line"></div>}
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border-2 border-[#08f7fe]/20 rounded-full"></div>
              <div className="absolute -top-4 -left-4 -right-4 -bottom-4 border-2 border-[#08f7fe]/10 rounded-full"></div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="text-center md:text-left space-y-6">
            {/* Name with Glitch Effect */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-gradient-text" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {userInfo.name}
            </h1>
            
            {/* Role with Terminal Effect */}
            <div className="inline-block bg-[#080E24]/80 p-2 rounded border border-[#08f7fe]/30">
              <div className="flex items-center">
                <Terminal className="h-5 w-5 text-[#08f7fe] mr-2" />
                <span className="text-[#08f7fe] text-lg md:text-xl">
                  {typedText}
                </span>
                {cursorVisible && isTyping && <div className="terminal-cursor"></div>}
              </div>
            </div>
            
            {/* Industry & Domain as Holographic Chips */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {userInfo.industry && (
                <Badge className="holographic-badge py-1.5 px-4 rounded-full font-medium">
                  <Server className="h-3.5 w-3.5 mr-1.5 text-[#08f7fe]" />
                  <span>{userInfo.industry}</span>
                </Badge>
              )}
              
              {userInfo.domain && (
                <Badge className="holographic-badge py-1.5 px-4 rounded-full font-medium">
                  <Database className="h-3.5 w-3.5 mr-1.5 text-[#08f7fe]" />
                  <span>{userInfo.domain}</span>
                </Badge>
              )}
              
              {userInfo.lookingFor && (
                <Badge className="holographic-badge py-1.5 px-4 rounded-full font-medium">
                  <Cpu className="h-3.5 w-3.5 mr-1.5 text-[#08f7fe]" />
                  <span>Looking for {userInfo.lookingFor}</span>
                </Badge>
              )}
            </div>
            
            {/* Location as Digital Coordinates */}
            {userInfo.location && (
              <div className="flex items-center justify-center md:justify-start text-sm text-gray-300 bg-[#080E24]/60 py-1.5 px-3 rounded-lg border border-[#08f7fe]/20 inline-block">
                <Globe className="h-4 w-4 mr-2 text-[#08f7fe]" />
                <code className="font-mono">{`>> ${userInfo.location}`}</code>
              </div>
            )}
            
            {/* Mobile CTA Buttons */}
            <div className="md:hidden flex flex-col gap-3 mt-8">
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="neon-button w-full rounded-md py-2.5"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Let's Talk
              </Button>
              
              <Button
                className="neon-button w-full rounded-md py-2.5"
              >
                <Download className="h-5 w-5 mr-2" />
                Grab My Resume
              </Button>
              
              <Button
                className="neon-button w-full rounded-md py-2.5"
              >
                <Lightbulb className="h-5 w-5 mr-2" />
                Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Navigation Tabs */}
      <div className="bg-[#0c162d] border-y border-[#08f7fe]/20 mb-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 overflow-x-auto">
          <div className="flex space-x-1 py-2">
            {Object.keys(sectionRefs).map((section) => (
              <button
                key={section}
                className={`nav-tab ${activeTab === section ? 'active' : ''}`}
                onClick={() => scrollToSection(section as keyof typeof sectionRefs)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Projects Section */}
      <section 
        id="projects-section" 
        ref={sectionRefs.projects}
        className="section py-10 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <Zap className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            Projects & Innovations
          </h2>
          
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {sortedProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="project-card h-72"
                  onClick={() => openProjectDetail(project)}
                >
                  {/* Project thumbnail */}
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#08f7fe]/10 to-[#7122FA]/10 flex items-center justify-center">
                      <CircuitBoard className="w-12 h-12 text-[#08f7fe]/40" />
                    </div>
                  )}
                  
                  {/* Project overlay with details */}
                  <div className="project-overlay">
                    <h3 className="text-xl font-medium mb-2 text-white">{project.title}</h3>
                    
                    {project.category && (
                      <Badge className="holographic-badge mb-2 inline-flex">
                        {project.category}
                      </Badge>
                    )}
                    
                    <div className="flex items-center text-[#08f7fe] text-sm mb-3">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    
                    <Button 
                      size="sm" 
                      className="neon-button w-full text-xs"
                    >
                      <Cpu className="h-3.5 w-3.5 mr-1.5" />
                      Explore Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tech-card p-8 text-center">
              <CircuitBoard className="h-12 w-12 mx-auto mb-4 text-[#08f7fe]/50" />
              <h3 className="text-xl text-[#08f7fe]">Project Repository Empty</h3>
              <p className="text-gray-400 mt-2">Technical projects will be indexed and displayed here.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* About Section */}
      <section 
        id="about-section" 
        ref={sectionRefs.about}
        className="section py-10 px-4 md:px-8 bg-[#0c162d]/50"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <Cpu className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            About Me
          </h2>
          
          <div className="tech-card p-6 md:p-8 text-gray-300 leading-relaxed">
            <p className="mb-4">
              {userInfo.title ? `As a ${userInfo.title}` : "As a technology professional"} with expertise in {userInfo.domain || userInfo.industry || "advanced technologies"}, 
              I specialize in developing innovative solutions that push the boundaries of what's possible.
            </p>
            
            <p>
              My approach combines cutting-edge technical knowledge with strategic problem-solving, ensuring each project not only meets but exceeds expectations.
              {userInfo.lookingFor ? ` Currently, I'm looking for ${userInfo.lookingFor} opportunities that challenge me to grow and innovate in the ${userInfo.industry || "technology"} space.` : ""}
            </p>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section 
        id="skills-section" 
        ref={sectionRefs.skills}
        className="section py-10 px-4 md:px-8 bg-[#0c162d]/80"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <Zap className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            What I'm Good At
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {sortedSkills.length > 0 ? (
              sortedSkills.map((skill) => {
                const SkillIcon = getSkillIcon(skill.name);
                return (
                  <div key={skill.id} className="tech-card p-4">
                    <div className="flex items-center mb-3">
                      <SkillIcon className="h-5 w-5 mr-2 text-[#08f7fe]" />
                      <span className="text-white">{skill.name}</span>
                    </div>
                    
                    <div className="skill-meter">
                      <div 
                        className="skill-progress"
                        style={{ width: `${skill.proficiency || 70}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-right mt-1 text-xs text-[#08f7fe]">
                      {skill.proficiency || 70}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="tech-card p-6 text-center col-span-full">
                <CircuitBoard className="h-10 w-10 mx-auto mb-3 text-[#08f7fe]/50" />
                <p className="text-gray-400">Technical skills will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section 
        id="services-section" 
        ref={sectionRefs.services}
        className="section py-10 px-4 md:px-8 bg-[#0c162d]/50"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <Layers className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            What I Offer
          </h2>
          
          {userInfo.whatIOffer || userServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mt-6">
              {/* Display whatIOffer from userInfo as a primary service */}
              {userInfo.whatIOffer && (
                <div className="tech-card p-6">
                  <h3 className="text-lg font-medium text-[#08f7fe] mb-3">
                    Professional Services
                  </h3>
                  <p className="text-gray-300 mb-4 whitespace-pre-line">
                    {userInfo.whatIOffer}
                  </p>
                  
                  <Badge className="bg-[#080E24] border border-[#08f7fe]/20 text-[#08f7fe]">
                    {userInfo.domain || userInfo.industry || "Professional Services"}
                  </Badge>
                </div>
              )}
              
              {/* Display any additional services */}
              {userServices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {userServices.map((service) => (
                    <div key={service.id} className="tech-card p-6">
                      <h3 className="text-lg font-medium text-[#08f7fe] mb-3">{service.title}</h3>
                      <p className="text-gray-300 mb-4">{service.description}</p>
                      
                      <Badge className="bg-[#080E24] border border-[#08f7fe]/20 text-[#08f7fe]">
                        {service.category || "Technical Service"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="tech-card p-8 text-center">
              <Layers className="h-12 w-12 mx-auto mb-4 text-[#08f7fe]/50" />
              <h3 className="text-xl text-[#08f7fe]">Services & Offerings</h3>
              <p className="text-gray-400 mt-2">Professional services and offerings will be displayed here.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Career Path Section */}
      <section 
        id="career-section" 
        ref={sectionRefs.career}
        className="section py-10 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <GitBranch className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            Career Path
          </h2>
          
          <div className="timeline mt-8">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.map((experience) => (
                <div key={experience.id} className="timeline-node tech-card p-5 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 className="text-xl font-medium text-[#08f7fe]">{experience.title}</h3>
                    
                    <div className="flex items-center mt-2 md:mt-0 text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-[#fe53bb]" />
                      <span className="text-gray-300">
                        {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                      </span>
                    </div>
                  </div>
                  
                  {experience.company && (
                    <Badge className="holographic-badge mb-3 inline-flex">
                      <Server className="h-3.5 w-3.5 mr-1.5" />
                      {experience.company}
                    </Badge>
                  )}
                  
                  <p className="text-gray-300">{experience.description}</p>
                  
                  {/* Tech stack or achievements could be added here */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-[#080E24] border border-[#08f7fe]/20 text-[#08f7fe]">Technical Leadership</Badge>
                    <Badge className="bg-[#080E24] border border-[#08f7fe]/20 text-[#08f7fe]">Project Management</Badge>
                    <Badge className="bg-[#080E24] border border-[#08f7fe]/20 text-[#08f7fe]">System Architecture</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="tech-card p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-[#08f7fe]/50" />
                <h3 className="text-xl text-[#08f7fe]">Career History</h3>
                <p className="text-gray-400 mt-2">Professional experience will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Education Section */}
      <section 
        id="education-section" 
        ref={sectionRefs.education}
        className="section py-10 px-4 md:px-8 bg-[#0c162d]/50"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-8 text-white inline-block">
            <GraduationCap className="inline-block h-6 w-6 mr-2 text-[#08f7fe]" />
            Education & Certifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {sortedEducations.length > 0 ? (
              sortedEducations.map((education) => (
                <div key={education.id} className="tech-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">{education.degree}</h3>
                      <div className="text-[#fe53bb] mt-1">{education.institution}</div>
                    </div>
                    
                    <Badge className="holographic-badge">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(education.startDate)}
                    </Badge>
                  </div>
                  
                  {education.location && (
                    <div className="flex items-center text-gray-400 mt-2 text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-[#08f7fe]" />
                      <span>{education.location}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-[#08f7fe]/10">
                    <div className="flex items-center text-[#08f7fe] text-sm">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span>Technical Focus</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">
                      {education.degree?.includes("Computer") || education.degree?.includes("Tech") || education.degree?.includes("Engineering") 
                        ? "Computer Science & Algorithm Optimization" 
                        : "Advanced Research & Technical Analysis"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="tech-card p-8 text-center col-span-full">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-[#08f7fe]/50" />
                <h3 className="text-xl text-[#08f7fe]">Education Data</h3>
                <p className="text-gray-400 mt-2">Academic qualifications and certifications will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      

      
      {/* Call-to-Action Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-[#080E24] to-[#0c162d] border-t border-[#08f7fe]/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="futuristic-heading text-2xl md:text-3xl font-bold mb-4 neon-gradient-text">
            Ready to Innovate Together?
          </h2>
          
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Let's connect and explore opportunities for collaboration, innovation, or simply exchange ideas on {userInfo.industry || "technology"} trends.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="neon-button bg-gradient-to-r from-[#08f7fe]/20 to-[#fe53bb]/20 border-[#08f7fe] hover:border-[#fe53bb] text-white rounded-md px-8 py-2.5"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button
              className="neon-button bg-gradient-to-r from-[#7122FA]/20 to-[#08f7fe]/20 border-[#7122FA] hover:border-[#08f7fe] text-white rounded-md px-8 py-2.5"
            >
              <Download className="h-5 w-5 mr-2" />
              Grab My Resume
            </Button>
          </div>
        </div>
      </section>
      
      {/* Let's Talk Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-[#08f7fe] bg-[#0c162d] shadow-xl shadow-[#08f7fe]/20" aria-describedby="contact-form-description">
          <DialogHeader className="p-5 border-b border-[#08f7fe]/30 bg-gradient-to-r from-[#0c162d] to-[#14243E]">
            <DialogTitle className="text-xl text-center">
              <span className="font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <MessageSquare className="h-5 w-5 inline-block mr-2 text-[#08f7fe]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#08f7fe] to-[#7122FA] animate-pulse">
                  Let's Talk
                </span>
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-5" id="contact-form-description">
            {/* Purpose dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#08f7fe] mb-1">
                Connection Purpose:
              </label>
              <Select value={contactPurpose} onValueChange={setContactPurpose}>
                <SelectTrigger className="w-full bg-[#0D1D38] border border-[#08f7fe]/50 text-[#FFFFFF] focus:ring-1 focus:ring-[#08f7fe] focus:border-[#08f7fe]">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="!bg-[#14243E] border-2 border-[#08f7fe] !text-white !shadow-xl !shadow-[#08f7fe]/30">
                  <SelectItem value="job-opportunity" className="!bg-[#14243E] !text-white hover:!bg-[#08f7fe]/30 data-[highlighted]:!bg-[#08f7fe]/40 data-[highlighted]:!text-white focus:!bg-[#08f7fe]/50 focus:!text-white">Exciting job opportunities are available, and I believe you'd be a great fit.</SelectItem>
                  <SelectItem value="project-collaboration" className="!bg-[#14243E] !text-white hover:!bg-[#08f7fe]/30 data-[highlighted]:!bg-[#08f7fe]/40 data-[highlighted]:!text-white focus:!bg-[#08f7fe]/50 focus:!text-white">Would you be open to teaming up on innovative projects?</SelectItem>
                  <SelectItem value="networking" className="!bg-[#14243E] !text-white hover:!bg-[#08f7fe]/30 data-[highlighted]:!bg-[#08f7fe]/40 data-[highlighted]:!text-white focus:!bg-[#08f7fe]/50 focus:!text-white">Let's connect — I admire your work and would love to stay in touch.</SelectItem>
                  <SelectItem value="partnership" className="!bg-[#14243E] !text-white hover:!bg-[#08f7fe]/30 data-[highlighted]:!bg-[#08f7fe]/40 data-[highlighted]:!text-white focus:!bg-[#08f7fe]/50 focus:!text-white">I'd like to explore a potential partnership opportunity with you.</SelectItem>
                  <SelectItem value="freelance" className="!bg-[#14243E] !text-white hover:!bg-[#08f7fe]/30 data-[highlighted]:!bg-[#08f7fe]/40 data-[highlighted]:!text-white focus:!bg-[#08f7fe]/50 focus:!text-white">I have some exciting freelance projects you might be interested in.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Message box */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#08f7fe] mb-1">
                Message:
              </label>
              <div className="relative">
                <Textarea 
                  placeholder="Write a message to get the conversation started..."
                  className="min-h-[120px] resize-none !bg-[#14243E] border-2 border-[#08f7fe]/50 !text-[#FFFFFF] focus:ring-1 focus:ring-[#08f7fe] focus:border-[#08f7fe] placeholder:!text-[#FFFFFF]/50"
                  maxLength={350}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  style={{ color: 'white' }}
                />
                {/* Inline styles applied directly to textarea element */}
              </div>
              <div className="text-right text-xs text-[#08f7fe]">
                {contactMessage.length}/350 characters
              </div>
            </div>
            
            {/* File upload area */}
            <div className="mt-4 border-2 border-dashed border-[#08f7fe]/30 rounded-lg p-5 text-center hover:border-[#08f7fe]/60 transition-colors bg-[#0D1D38]/70">
              <label className="cursor-pointer block">
                <input type="file" className="hidden" />
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-[#08f7fe]/70 mb-2" />
                  <span className="text-sm text-[#FFFFFF]">Drag files here or click to upload</span>
                  <span className="text-xs text-[#FFFFFF]/70 mt-1">Maximum file size: 10MB</span>
                </div>
              </label>
            </div>
            
            {/* Submit button */}
            <div className="pt-5">
              <Button 
                className="w-full py-3 font-medium text-white rounded-md relative overflow-hidden border-0"
                style={{
                  background: 'linear-gradient(45deg, rgba(8, 247, 254, 0.9), rgba(113, 34, 250, 0.9))',
                  boxShadow: '0 0 15px rgba(8, 247, 254, 0.5)'
                }}
                onClick={handleContactSubmit}
              >
                <div className="relative z-10 flex items-center justify-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Request Connection
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#08f7fe] to-[#7122FA] opacity-50 hover:opacity-80 transition-opacity"></div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Project Detail Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 border-2 border-[#08f7fe] bg-[#0c162d] shadow-xl shadow-[#08f7fe]/20" aria-describedby="project-details-description">
          <DialogHeader className="p-5 border-b border-[#08f7fe]/30 bg-gradient-to-r from-[#0c162d] to-[#14243E] sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">
                <span className="font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <CircuitBoard className="h-5 w-5 inline-block mr-2 text-[#08f7fe]" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#08f7fe] to-[#7122FA]">
                    Project Details
                  </span>
                </span>
              </DialogTitle>
              
              <DialogClose className="h-8 w-8 rounded-full flex items-center justify-center border border-[#08f7fe]/50 text-[#08f7fe] hover:bg-[#08f7fe]/20 transition-colors">
                <X className="h-4 w-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          
          {selectedProject && (
            <div className="p-6" id="project-details-description">
              {/* Project media */}
              <div className="relative h-72 mb-6 overflow-hidden rounded-lg border-2 border-[#08f7fe]/30 shadow-lg shadow-[#08f7fe]/10">
                {selectedProject.thumbnailUrl ? (
                  <img 
                    src={selectedProject.thumbnailUrl} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#08f7fe]/10 to-[#7122FA]/20 flex items-center justify-center">
                    <CircuitBoard className="w-16 h-16 text-[#08f7fe]/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d]/80 via-transparent to-transparent pointer-events-none"></div>
              </div>
              
              {/* Project details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#08f7fe] to-[#7122FA] mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {selectedProject.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {selectedProject.category && (
                      <Badge className="bg-[#0D1D38] border border-[#08f7fe]/40 text-[#08f7fe] py-1.5 px-3">
                        <Folder className="h-3.5 w-3.5 mr-1.5" />
                        {selectedProject.category}
                      </Badge>
                    )}
                    
                    <span className="text-[#08f7fe] text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {formatDate(selectedProject.startDate)}
                    </span>
                  </div>
                </div>
                
                {/* Project description */}
                <div className="bg-[#14243E] border-2 border-[#08f7fe]/30 rounded-lg p-5 shadow-inner">
                  <h3 className="text-lg font-medium text-[#08f7fe] mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Project Overview
                  </h3>
                  <p className="text-[#FFFFFF] leading-relaxed">{selectedProject.description}</p>
                </div>
                
                {/* Tech stack - would be populated from project data in a full implementation */}
                <div className="bg-[#14243E] border-2 border-[#08f7fe]/30 rounded-lg p-5 shadow-inner">
                  <h3 className="text-lg font-medium text-[#08f7fe] mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#0D1D38] border border-[#08f7fe]/30 text-[#08f7fe] py-1.5 px-3">
                      <Code className="h-3.5 w-3.5 mr-1.5" />
                      React
                    </Badge>
                    <Badge className="bg-[#0D1D38] border border-[#08f7fe]/30 text-[#08f7fe] py-1.5 px-3">
                      <Code className="h-3.5 w-3.5 mr-1.5" />
                      TypeScript
                    </Badge>
                    <Badge className="bg-[#0D1D38] border border-[#08f7fe]/30 text-[#08f7fe] py-1.5 px-3">
                      <Server className="h-3.5 w-3.5 mr-1.5" />
                      Node.js
                    </Badge>
                    <Badge className="bg-[#0D1D38] border border-[#08f7fe]/30 text-[#08f7fe] py-1.5 px-3">
                      <Database className="h-3.5 w-3.5 mr-1.5" />
                      PostgreSQL
                    </Badge>
                    <Badge className="bg-[#0D1D38] border border-[#08f7fe]/30 text-[#08f7fe] py-1.5 px-3">
                      <Layout className="h-3.5 w-3.5 mr-1.5" />
                      Tailwind CSS
                    </Badge>
                  </div>
                </div>
                
                {/* Project links */}
                {selectedProject.projectUrl && (
                  <div className="flex items-center mt-6">
                    <Button 
                      className="py-2.5 px-6 font-medium text-white rounded-md relative overflow-hidden border-0"
                      style={{
                        background: 'linear-gradient(45deg, rgba(8, 247, 254, 0.9), rgba(113, 34, 250, 0.9))',
                        boxShadow: '0 0 15px rgba(8, 247, 254, 0.3)'
                      }}
                      onClick={() => window.open(selectedProject.projectUrl || '#', '_blank')}
                    >
                      <div className="relative z-10 flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Project
                      </div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#08f7fe] to-[#7122FA] opacity-50 hover:opacity-80 transition-opacity"></div>
                    </Button>
                  </div>
                )}
                
                {/* Project gallery - if available */}
                {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#08f7fe]/20">
                    <h3 className="text-lg font-medium text-[#08f7fe] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      Project Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.mediaUrls.map((url, index) => (
                        <div key={index} className="overflow-hidden rounded-lg border-2 border-[#08f7fe]/30 shadow-lg shadow-[#08f7fe]/10 relative group">
                          <img 
                            src={url}
                            alt={`${selectedProject.title} - visual ${index + 1}`}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3">
                            <span className="text-xs text-white font-medium flex items-center">
                              <ImageIcon className="h-3.5 w-3.5 mr-1 text-[#08f7fe]" />
                              Image {index + 1}
                            </span>
                          </div>
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

// Default export
export default DynamicInnovator;