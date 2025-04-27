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
  GraduationCap,
  MessageSquare,
  Lightbulb,
  Plus,
  Camera,
  Palette,
  Eye,
  Star,
  Layers,
  Image,
  ChevronDown,
  Tag,
  BookOpen,
  LucideIcon,
  X
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
import { useToast } from "@/hooks/use-toast";

interface VisualExpertProps {
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

// For icon mappings
const skillIconMap: Record<string, LucideIcon> = {
  "Web Design": Palette,
  "UX Design": Eye,
  "Photography": Camera,
  "Graphic Design": Layers,
  "UI Design": Palette,
  "Branding": Star,
  "Visual Design": Image,
  default: Award
};

const getSkillIcon = (skillName: string) => {
  const icon = skillIconMap[skillName] || skillIconMap.default;
  return icon;
};

export default function VisualExpert({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: VisualExpertProps) {
  const [typedText, setTypedText] = useState("");
  const titleText = userInfo.title || "Visual Brand Architect";
  
  // States for modal dialogs
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
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
  
  // Sort services
  const sortedServices = [...userServices].sort((a, b) => 
    (a.title || '').localeCompare(b.title || '')
  );
  
  // Helper for formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
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
  
  // All project cards have the same size
  const getProjectLayout = (index: number) => {
    // Using a single consistent class for all items
    return "masonry-item";
  };
  
  // Initialize animations, styles, and typewriter effect on component mount
  useEffect(() => {
    // Add web fonts - Poppins for body text, Montserrat for headings
    const montserratLink = document.createElement('link');
    montserratLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
    montserratLink.rel = 'stylesheet';
    
    const poppinsLink = document.createElement('link');
    poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
    poppinsLink.rel = 'stylesheet';
    
    document.head.appendChild(montserratLink);
    document.head.appendChild(poppinsLink);
    
    // Add CSS for animations and styles
    const style = document.createElement('style');
    style.textContent = `
      /* Visual Expert Template Animations & Styles */
      .visual-expert-template {
        font-family: 'Poppins', sans-serif;
        overflow-x: hidden;
      }
      
      .visual-expert-template h1, 
      .visual-expert-template h2, 
      .visual-expert-template h3, 
      .visual-expert-template h4, 
      .visual-expert-template h5 {
        font-family: 'Montserrat', sans-serif;
      }
      
      /* Animations */
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
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }
      
      @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
      
      @keyframes rotateGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes blinkCursor {
        from, to { border-right-color: transparent; }
        50% { border-right-color: #fff; }
      }
      
      @keyframes backgroundHueShift {
        0% { filter: hue-rotate(0deg); }
        33% { filter: hue-rotate(5deg); }
        66% { filter: hue-rotate(-5deg); }
        100% { filter: hue-rotate(0deg); }
      }
      
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* Core Elements */
      .visual-expert-template .hero-section {
        position: relative;
        background: linear-gradient(135deg, #000A12, #263238);
      }
      
      .visual-expert-template .hero-section::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        z-index: 0;
        pointer-events: none;
      }
      
      .visual-expert-template .profile-image-container {
        position: relative;
        margin: 0 auto;
        width: 180px;
        height: 180px;
        z-index: 1;
      }
      
      .visual-expert-template .profile-image-border {
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: 50%;
        background: linear-gradient(45deg, #FF6B6B, #A533FF, #6BFFF0, #FF6B6B);
        background-size: 300% 300%;
        animation: rotateGradient 8s linear infinite;
        z-index: -1;
      }
      
      .visual-expert-template .profile-image-wrap {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }
      
      .visual-expert-template .title-animation {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        border-right: 3px solid;
        animation: 
          typewriter 3s steps(40, end),
          blinkCursor 0.75s step-end infinite;
      }
      
      .visual-expert-template .masonry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        grid-auto-rows: 280px;
        gap: 20px;
      }
      
      /* Standardized project item size */
      .visual-expert-template .masonry-item {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        aspect-ratio: 1/1; /* Ensure square aspect ratio */
        width: 280px;
        height: 280px;
        margin: 0 auto;
      }
      
      @media (max-width: 768px) {
        .visual-expert-template .masonry-grid {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        
        .visual-expert-template .masonry-item {
          width: 280px;
          height: 280px;
        }
      }
      
      .visual-expert-template .project-card {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
        cursor: pointer;
      }
      
      .visual-expert-template .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
      }
      
      .visual-expert-template .project-card:hover .project-image {
        transform: scale(1.1);
      }
      
      .visual-expert-template .project-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        padding: 24px;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      
      .visual-expert-template .project-card:hover .project-overlay {
        opacity: 1;
      }
      
      .visual-expert-template .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .visual-expert-template .skill-badge {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .visual-expert-template .skill-badge:hover {
        transform: translateY(-3px);
      }
      
      .visual-expert-template .experience-item {
        position: relative;
        padding: 1.5rem;
        margin-bottom: 2rem;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }
      
      .visual-expert-template .experience-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
      }
      
      .visual-expert-template .experience-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: linear-gradient(to bottom, #FF6B6B, #A533FF);
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      
      .visual-expert-template .about-section {
        position: relative;
        z-index: 1;
        overflow: hidden;
      }
      
      .visual-expert-template .about-section::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 107, 107, 0.05) 0%, rgba(165, 51, 255, 0.05) 50%, rgba(107, 255, 240, 0.05) 100%);
        z-index: -1;
        animation: backgroundHueShift 15s infinite;
      }
      
      .visual-expert-template .floating-cta {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 100;
        animation: float 3s infinite ease-in-out;
        border-radius: 50%;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }
      
      .visual-expert-template .gradient-text {
        background: linear-gradient(90deg, #FF6B6B, #A533FF, #6BFFF0);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientMove 3s linear infinite;
      }
      
      .visual-expert-template .section-heading {
        position: relative;
        margin-bottom: 2rem;
        font-weight: 800;
        display: inline-block;
      }
      
      .visual-expert-template .section-heading::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, #FF6B6B, #A533FF);
        border-radius: 2px;
      }
      
      /* Staggered animations */
      .visual-expert-template .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .visual-expert-template .animate-fade-in:nth-child(1) { animation-delay: 0.1s; }
      .visual-expert-template .animate-fade-in:nth-child(2) { animation-delay: 0.2s; }
      .visual-expert-template .animate-fade-in:nth-child(3) { animation-delay: 0.3s; }
      .visual-expert-template .animate-fade-in:nth-child(4) { animation-delay: 0.4s; }
      .visual-expert-template .animate-fade-in:nth-child(5) { animation-delay: 0.5s; }
      .visual-expert-template .animate-fade-in:nth-child(6) { animation-delay: 0.6s; }
      .visual-expert-template .animate-fade-in:nth-child(7) { animation-delay: 0.7s; }
      .visual-expert-template .animate-fade-in:nth-child(8) { animation-delay: 0.8s; }
      
      .visual-expert-template .glow-on-hover {
        position: relative;
        overflow: hidden;
      }
      
      .visual-expert-template .glow-on-hover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s;
      }
      
      .visual-expert-template .glow-on-hover:hover::after {
        transform: translateX(100%);
      }
    `;
    
    document.head.appendChild(style);
    
    // Typewriter effect for title text
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < titleText.length) {
        setTypedText(titleText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);
    
    // Setup scroll-based animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-reveal');
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible) {
          el.classList.add('animate-fade-in');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      clearInterval(typeInterval);
      document.head.removeChild(style);
      document.head.removeChild(montserratLink);
      document.head.removeChild(poppinsLink);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [titleText]);
  
  return (
    <div className="visual-expert-template bg-white min-h-screen font-sans">
      {/* Floating CTA button for mobile */}
      <div className="md:hidden floating-cta">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          size="icon"
          className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Hero Section with Profile */}
      <section className="hero-section py-20 px-4 sm:px-6 md:px-8 lg:px-16 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center relative">
            {/* Profile Image with animated border */}
            <div className="profile-image-container mb-8 animate-fade-in">
              <div className="profile-image-border"></div>
              <div className="profile-image-wrap">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Name and Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in">
              {userInfo.name}
            </h1>
            
            <div className="title-animation overflow-hidden mb-8">
              <h2 className="text-xl md:text-2xl font-medium text-gradient text-pink-300">
                {typedText}
              </h2>
            </div>
            
            {/* Industry & Domain Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {userInfo.industry && (
                <Badge className="bg-pink-600/20 text-pink-400 border border-pink-500/30 py-1.5 px-4 rounded-full animate-fade-in">
                  {userInfo.industry}
                </Badge>
              )}
              
              {userInfo.domain && (
                <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 py-1.5 px-4 rounded-full animate-fade-in">
                  {userInfo.domain}
                </Badge>
              )}
              
              {userInfo.lookingFor && (
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 py-1.5 px-4 rounded-full animate-fade-in">
                  Looking for {userInfo.lookingFor}
                </Badge>
              )}
            </div>
            
            {/* Location Info */}
            {userInfo.location && (
              <div className="flex items-center mb-6 text-gray-300 animate-fade-in">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{userInfo.location}</span>
              </div>
            )}
            
            {/* What I Offer */}
            {userInfo.whatIOffer && (
              <div className="mb-10 max-w-2xl mx-auto bg-gray-800/40 rounded-lg p-6 animate-fade-in">
                <h3 className="text-xl font-semibold mb-3 text-pink-300">What I Offer</h3>
                <p className="text-gray-200">{userInfo.whatIOffer}</p>
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="hidden md:flex gap-4 mt-6 animate-fade-in">
              <Button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 rounded-md shadow-lg glow-on-hover transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Let's Talk
              </Button>
              
              <Button 
                className="bg-pink-500/20 text-pink-300 border border-pink-400/30 hover:bg-pink-500/30 px-8 py-6 rounded-md shadow-md glow-on-hover"
              >
                <Download className="w-5 h-5 mr-2" />
                Grab My Resume
              </Button>
              
              <Button 
                className="bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 px-8 py-6 rounded-md shadow-md glow-on-hover"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="about-section py-20 px-4 sm:px-6 md:px-8 lg:px-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">
            What I'm All About
          </h2>
          
          <div className="bg-white rounded-xl shadow-xl p-8 scroll-reveal">
            {userInfo.aboutMe ? (
              <p className="text-lg text-gray-700 leading-relaxed">
                {userInfo.aboutMe}
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {userInfo.title ? `As a ${userInfo.title}` : "As a creative professional"} with a passion for {userInfo.domain || "visual storytelling"}, 
                  I specialize in crafting compelling visual narratives that resonate with audiences and drive results.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  My approach combines technical expertise with creative vision, ensuring each project not only meets but exceeds expectations.
                  {userInfo.lookingFor ? ` Currently, I'm looking for ${userInfo.lookingFor} opportunities that challenge me to grow and innovate.` : ""}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Skills & Services */}
      <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">
            Skills & Expertise
          </h2>
          
          <div className="skills-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16 scroll-reveal">
            {sortedSkills.length > 0 ? (
              sortedSkills.map((skill) => {
                const SkillIcon = getSkillIcon(skill.name);
                return (
                  <div key={skill.id} className="flex flex-col">
                    <Badge 
                      className="skill-badge bg-white text-gray-700 border-gray-200 shadow-sm px-4 py-3 text-base rounded-full"
                    >
                      <SkillIcon className="w-4 h-4 mr-2 text-pink-500" />
                      {skill.name}
                    </Badge>
                    
                    {skill.proficiency && (
                      <div className="mt-1 w-full px-2">
                        <div className="text-xs text-center text-gray-600 mb-1">Proficiency: <span className="font-medium text-pink-500">{skill.proficiency}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-purple-600 h-1.5 rounded-full" 
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="w-full bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">Skills will appear here once added.</p>
              </div>
            )}
          </div>
          
          {/* Services */}
          {sortedServices.length > 0 && (
            <>
              <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">Services I Offer</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal">
                {sortedServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                    <CardContent className="pt-6">
                      <h4 className="font-bold text-lg mb-2">{service.title}</h4>
                      
                      {service.category && service.category !== 'other' && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-sm bg-pink-50 text-pink-700 border-pink-200">
                            {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                          </Badge>
                        </div>
                      )}
                      
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      
                      <div className="flex items-center justify-between mt-4 mb-2">
                        <div className="flex items-center">
                          {service.priceUsd && (
                            <span className="font-semibold text-gray-800">
                              ${parseFloat(service.priceUsd).toFixed(2)} {service.isHourly ? '/hr' : ''}
                            </span>
                          )}
                          {service.priceInr && !service.priceUsd && (
                            <span className="font-semibold text-gray-800">
                              ₹{parseFloat(service.priceInr).toFixed(2)} {service.isHourly ? '/hr' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {service.features && service.features.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm font-medium text-gray-700 mb-2">Includes:</div>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-green-500">
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
            </>
          )}
        </div>
      </section>
      
      {/* Visual Projects Showcase - Masonry Grid */}
      <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-16 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">
            Visual Showcase
          </h2>
          
          {sortedProjects.length > 0 ? (
            <>
              <div className="masonry-grid scroll-reveal">
                {sortedProjects.map((project, index) => (
                  <div key={project.id} className={getProjectLayout(index)}>
                    <div 
                      className="project-card h-full"
                      onClick={() => openProjectDetail(project)}
                    >
                      {/* Project thumbnail */}
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="project-image"
                        />
                      ) : (
                        <div className="project-image bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Project overlay with only name and date */}
                      <div className="project-overlay">
                        <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                        
                        <div className="flex items-center text-gray-300 text-sm">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          <span>{formatDate(project.startDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {sortedProjects.length > 6 && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    View All Projects
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Projects Yet</h3>
              <p className="text-gray-500">Visual projects will appear here once added.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Career Journey */}
      <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">
            Career Path
          </h2>
          
          <div className="space-y-8 scroll-reveal">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.map((experience) => (
                <div key={experience.id} className="experience-item">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{experience.title}</h3>
                    
                    <div className="flex items-center text-gray-500 mt-1 md:mt-0">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>
                        {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                    {experience.company && (
                      <div className="text-lg font-medium text-gray-700">
                        {experience.company}
                      </div>
                    )}
                    
                    {experience.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span>{experience.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {experience.industry && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Industry: {experience.industry}
                      </Badge>
                    )}
                    
                    {experience.domain && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Domain: {experience.domain}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{experience.description}</p>
                  
                  {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Responsibilities:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        {experience.keyResponsibilities.map((responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Experience Yet</h3>
                <p className="text-gray-500">Your work experience will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Education */}
      {sortedEducations.length > 0 && (
        <section className="py-20 px-4 sm:px-6 md:px-8 lg:px-16 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="section-heading text-3xl md:text-4xl font-bold text-gray-900 mb-12 scroll-reveal">
              Academic Background
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal">
              {sortedEducations.map((education) => (
                <Card key={education.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-3 px-4 text-white">
                    <h3 className="font-bold text-lg">{education.degree}</h3>
                  </div>
                  
                  <CardContent className="pt-4">
                    <div className="font-medium text-gray-800 mb-2">{education.institution}</div>
                    
                    <div className="flex items-center text-gray-500 mb-3 text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>
                        {formatDate(education.startDate)} — {education.endDate ? formatDate(education.endDate) : 'Present'}
                      </span>
                    </div>
                    
                    {education.location && (
                      <div className="flex items-center text-gray-500 mb-3 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span>{education.location}</span>
                      </div>
                    )}
                    
                    {education.fieldOfStudy && (
                      <div className="flex items-center text-gray-500 mb-3 text-sm">
                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                        <span>Field: {education.fieldOfStudy}</span>
                      </div>
                    )}
                    
                    {education.industry && (
                      <div className="flex items-center text-gray-500 mb-3 text-sm">
                        <Briefcase className="w-3.5 h-3.5 mr-1" />
                        <span>Industry: {education.industry}</span>
                      </div>
                    )}
                    
                    {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Skills Acquired:</div>
                        <div className="flex flex-wrap gap-1">
                          {education.skillsAcquired.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
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
      <section className="py-16 px-4 sm:px-6 md:px-8 lg:px-16 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Connect?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Let's create something amazing together. Reach out for collaborations, inquiries, or just to say hello.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-md shadow-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
            
            <Button 
              className="bg-purple-700 text-white hover:bg-purple-800 border border-purple-400 px-8 py-3 text-lg rounded-md shadow-lg"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Mentor
            </Button>
          </div>
        </div>
      </section>
      
      {/* Let's Talk Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Let's Talk</DialogTitle>
            <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto my-2"></div>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-6">
              {/* Purpose dropdown */}
              <div className="space-y-2">
                <label className="font-medium text-gray-700">Purpose to connect:</label>
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
                <label className="font-medium text-gray-700">Write a note to start the conversation:</label>
                <Textarea 
                  placeholder="Write a message to get the conversation started..."
                  className="min-h-[120px]"
                  maxLength={350}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
                <div className="text-xs text-right text-gray-500">
                  {contactMessage.length}/350 characters
                </div>
              </div>
              
              {/* File attachment option */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <input type="file" className="hidden" />
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Drag files here or click to upload</span>
                  </div>
                </label>
              </div>
              
              {/* Submit button */}
              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
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
        <DialogContent className="sm:max-w-4xl overflow-auto max-h-[90vh] border-0 shadow-xl">
          <DialogTitle className="text-center text-3xl font-bold pb-4 mb-0 text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">
            Project Details
          </DialogTitle>
          
          <DialogClose className="absolute right-4 top-4 rounded-full p-2 opacity-70 bg-gray-100 transition-all hover:opacity-100 hover:bg-gray-200 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          {selectedProject && (
            <div className="py-2">
              {/* Project media */}
              <div className="relative h-64 sm:h-80 mb-8 overflow-hidden rounded-xl shadow-md">
                {selectedProject.thumbnailUrl ? (
                  <img 
                    src={selectedProject.thumbnailUrl} 
                    alt={selectedProject.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-pink-400/50" />
                  </div>
                )}
                
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Project title on image */}
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{selectedProject.title}</h2>
                  
                  <div className="flex items-center gap-3">
                    {selectedProject.category && (
                      <Badge className="bg-pink-600/40 text-pink-100 border-0 py-1 px-3">
                        {selectedProject.category}
                      </Badge>
                    )}
                    
                    <div className="flex items-center text-gray-200 text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{formatDate(selectedProject.startDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Project content in cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column - Project details */}
                <div className="md:col-span-2 space-y-6">
                  <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-xl mb-4 text-gray-800">About this Project</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Gallery of additional project images if available */}
                  {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                    <Card className="shadow-md overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                      <CardContent className="pt-6">
                        <h3 className="font-bold text-xl mb-4 text-gray-800">Project Gallery</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedProject.mediaUrls.map((url, index) => (
                            <div key={index} className="overflow-hidden rounded-lg aspect-square">
                              <img 
                                src={url}
                                alt={`${selectedProject.title} - image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Right column - Metadata */}
                <div className="space-y-6">
                  <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-xl mb-4 text-gray-800">Project Details</h3>
                      
                      <div className="space-y-4">
                        {selectedProject.industry && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Industry</div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2 text-pink-500" />
                              <span className="text-gray-800">{selectedProject.industry}</span>
                            </div>
                          </div>
                        )}
                        
                        {selectedProject.category && (
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-pink-500" />
                              <span className="text-gray-800">{selectedProject.category}</span>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Timeline</div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                            <span className="text-gray-800">
                              {formatDate(selectedProject.startDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Project URL if available */}
                      {selectedProject.projectUrl && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <Button 
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                            onClick={() => window.open(selectedProject.projectUrl || '#', '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Project
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}