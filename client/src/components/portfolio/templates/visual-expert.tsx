import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import { 
  Mail, LinkedIn, MapPin, Camera, Film, Calendar, CheckCircle,
  Download, Sparkles, GitHub, MessageSquare, ExternalLink, 
  Instagram, Zap, Palette, ArrowUpRight, Compass, Image, Play, 
  FileImage, Plus, Paperclip, Send, X
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

export default function VisualExpert({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: VisualExpertProps) {
  // For animated text
  const [nameRevealComplete, setNameRevealComplete] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  
  // For modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const { toast } = useToast();
  
  // For sound effect
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
  
  // Sort services by title
  const sortedServices = [...userServices].sort((a, b) => 
    (a.title || '').localeCompare(b.title || '')
  );

  // Handle contact form submission
  const handleContactSubmit = () => {
    if (!contactPurpose) {
      toast({
        title: "Please select a purpose",
        description: "Please select a reason for connecting.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would send the message
    toast({
      title: "Message sent!",
      description: "Your message has been sent successfully.",
    });
    
    setIsContactModalOpen(false);
    setContactPurpose("");
    setContactMessage("");
  };
  
  // Handle project card click for full-screen preview
  const handleProjectClick = (project: Project) => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // In a full implementation, this would open a full-screen preview
  };
  
  // Helper to determine masonry grid item size
  const getMasonryItemClass = (index: number) => {
    // Create a pattern for visual variety
    if (index % 7 === 0) return "masonry-item-wide masonry-item-tall"; // Extra large
    if (index % 5 === 0) return "masonry-item-wide"; // Wide
    if (index % 3 === 0) return "masonry-item-tall"; // Tall
    return ""; // Regular
  };
  
  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Initialize animations and styles
  useEffect(() => {
    // Add web fonts for design sophistication
    const montserratLink = document.createElement('link');
    montserratLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&display=swap';
    montserratLink.rel = 'stylesheet';
    
    const sourceCodeProLink = document.createElement('link');
    sourceCodeProLink.href = 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap';
    sourceCodeProLink.rel = 'stylesheet';
    
    document.head.appendChild(montserratLink);
    document.head.appendChild(sourceCodeProLink);
    
    // Create audio element for UI sound
    const audio = new Audio("data:audio/mp3;base64,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");
    audioRef.current = audio;
    
    // Add CSS for animations and styles
    const style = document.createElement('style');
    style.textContent = `
      /* Visual Expert Template Animations & Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes letterReveal {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes tiltHover {
        0% { transform: perspective(1000px) rotateX(0) rotateY(0); }
        100% { transform: perspective(1000px) rotateX(5deg) rotateY(5deg); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
      
      @keyframes glowPulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 214, 192, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(255, 214, 192, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 214, 192, 0); }
      }
      
      /* Base layout styling */
      .visual-expert-template {
        font-family: 'Montserrat', sans-serif;
        overflow-x: hidden;
        background-color: #f7f9fc;
        color: #2B2E33;
      }
      
      /* Hero section styling */
      .visual-expert-template .hero-section {
        position: relative;
        min-height: 90vh;
        display: flex;
        align-items: center;
        background-color: #f7f9fc;
        overflow: hidden;
      }
      
      /* Profile image effects */
      .visual-expert-template .profile-circle {
        position: relative;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        transform-style: preserve-3d;
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .visual-expert-template .profile-circle:hover {
        transform: translateY(-10px) rotateY(5deg);
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
      }
      
      .visual-expert-template .profile-circle::before {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: linear-gradient(45deg, #FFD6C0, #E4D7FA, #AEE6E6, #FFD6C0);
        background-size: 400% 400%;
        animation: glowPulse 3s ease infinite;
        z-index: -1;
      }
      
      /* Animated name letters */
      .visual-expert-template .letter {
        display: inline-block;
        opacity: 0;
        animation: letterReveal 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      
      /* Masonry grid layout */
      .visual-expert-template .masonry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        grid-auto-rows: 280px;
        grid-gap: 16px;
      }
      
      .visual-expert-template .masonry-item-tall {
        grid-row: span 2;
      }
      
      .visual-expert-template .masonry-item-wide {
        grid-column: span 2;
      }
      
      /* Project card animations */
      .visual-expert-template .project-card {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        cursor: pointer;
        height: 100%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform-style: preserve-3d;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .visual-expert-template .project-card:hover {
        transform: translateY(-8px) scale(1.01);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      }
      
      .visual-expert-template .project-card:hover .project-image {
        transform: scale(1.08);
      }
      
      .visual-expert-template .project-card:hover .project-overlay {
        opacity: 1;
      }
      
      .visual-expert-template .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.7s ease;
      }
      
      .visual-expert-template .project-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.2));
        padding: 1.5rem;
        opacity: 0;
        transition: opacity 0.5s ease;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      
      /* CTA buttons styling */
      .visual-expert-template .cta-fixed-top {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 100;
      }
      
      .visual-expert-template .cta-fixed-bottom {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        z-index: 100;
      }
      
      .visual-expert-template .cta-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      
      .visual-expert-template .cta-btn::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
      }
      
      .visual-expert-template .cta-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .visual-expert-template .cta-btn:hover::after {
        transform: translateX(100%);
      }
      
      /* Tag cloud */
      .visual-expert-template .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      
      .visual-expert-template .skill-tag {
        padding: 0.5rem 1rem;
        border-radius: 100px;
        font-weight: 500;
        font-size: 0.875rem;
        transition: all 0.3s ease;
        animation: pulse 3s infinite;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .visual-expert-template .skill-tag:hover {
        transform: translateY(-5px);
        animation: none;
      }
      
      /* Timeline styles */
      .visual-expert-template .timeline-wrap {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: #FFD6C0 #f1f1f1;
      }
      
      .visual-expert-template .timeline-wrap::-webkit-scrollbar {
        height: 8px;
      }
      
      .visual-expert-template .timeline-wrap::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .visual-expert-template .timeline-wrap::-webkit-scrollbar-thumb {
        background: #FFD6C0;
        border-radius: 10px;
      }
      
      .visual-expert-template .timeline {
        display: flex;
        min-width: max-content;
        padding: 2rem 0;
      }
      
      .visual-expert-template .timeline-item {
        flex: 0 0 250px;
        margin-right: 2rem;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }
      
      .visual-expert-template .timeline-item:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .visual-expert-template .masonry-item-wide,
        .visual-expert-template .masonry-item-tall {
          grid-column: span 1;
          grid-row: span 1;
        }
        
        .visual-expert-template .cta-fixed-top {
          display: none;
        }
      }
      
      /* Staggered animations */
      .visual-expert-template .letter:nth-child(1) { animation-delay: 0.1s; }
      .visual-expert-template .letter:nth-child(2) { animation-delay: 0.15s; }
      .visual-expert-template .letter:nth-child(3) { animation-delay: 0.2s; }
      .visual-expert-template .letter:nth-child(4) { animation-delay: 0.25s; }
      .visual-expert-template .letter:nth-child(5) { animation-delay: 0.3s; }
      .visual-expert-template .letter:nth-child(6) { animation-delay: 0.35s; }
      .visual-expert-template .letter:nth-child(7) { animation-delay: 0.4s; }
      .visual-expert-template .letter:nth-child(8) { animation-delay: 0.45s; }
      .visual-expert-template .letter:nth-child(9) { animation-delay: 0.5s; }
      .visual-expert-template .letter:nth-child(10) { animation-delay: 0.55s; }
      .visual-expert-template .letter:nth-child(11) { animation-delay: 0.6s; }
      .visual-expert-template .letter:nth-child(12) { animation-delay: 0.65s; }
      .visual-expert-template .letter:nth-child(13) { animation-delay: 0.7s; }
      .visual-expert-template .letter:nth-child(14) { animation-delay: 0.75s; }
      .visual-expert-template .letter:nth-child(15) { animation-delay: 0.8s; }
    `;
    
    document.head.appendChild(style);
    
    // Letter reveal animation for name
    const name = userInfo.name || '';
    if (nameRef.current) {
      nameRef.current.innerHTML = name.split('').map((letter, i) => 
        `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
      ).join('');
      
      // Set name reveal complete after all letters are animated
      setTimeout(() => {
        setNameRevealComplete(true);
      }, 100 * name.length + 800);
    }
    
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(montserratLink);
      document.head.removeChild(sourceCodeProLink);
    };
  }, [userInfo.name]);
  
  return (
    <div className="visual-expert-template">
      {/* Audio element for UI sounds */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* CTA Buttons - Top Right (Desktop Only) */}
      <div className="cta-fixed-top hidden md:block">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="cta-btn bg-gradient-to-r from-[#AEE6E6] to-[#E4D7FA] hover:from-[#9DD9D9] hover:to-[#D3C6E9] text-gray-800"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Let's Talk
          </Button>
          
          <Button
            variant="outline"
            className="cta-btn border-[#FFD6C0] text-gray-800 hover:bg-[#FFD6C0]/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Resume
          </Button>
          
          <Button
            variant="outline"
            className="cta-btn border-[#E4D7FA] text-gray-800 hover:bg-[#E4D7FA]/10"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Mentor
          </Button>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="hero-section py-12 md:py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            {/* Profile Picture */}
            <div className="w-full md:w-2/5">
              <div className="profile-circle w-64 h-64 md:w-80 md:h-80 mx-auto">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name || "User's profile picture"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="w-full md:w-3/5 text-center md:text-left">
              {/* Name with animated reveal */}
              <h1 
                ref={nameRef}
                className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4"
                aria-label={userInfo.name || "Name"}
              >
                {/* Letters will be dynamically inserted here by useEffect */}
              </h1>
              
              {/* Job Title */}
              <div className="relative overflow-hidden mb-6">
                <div 
                  className="text-xl md:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#2B2E33] to-[#70757B]"
                  style={{ opacity: nameRevealComplete ? 1 : 0, transition: 'opacity 0.5s ease' }}
                >
                  {userInfo.title || "Visual Creative"}
                </div>
              </div>
              
              {/* Location */}
              <div 
                className="flex items-center justify-center md:justify-start gap-2 mb-6 font-light italic text-gray-600"
                style={{ opacity: nameRevealComplete ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}
              >
                <MapPin className="h-4 w-4 text-[#FFB3AB]" />
                <span>{userInfo.location || "Location"}</span>
              </div>
              
              {/* Industry & Domain Tags */}
              <div 
                className="flex flex-wrap gap-2 justify-center md:justify-start mb-8"
                style={{ opacity: nameRevealComplete ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}
              >
                {userInfo.industry && (
                  <Badge className="bg-[#F2EDF8] text-gray-800 hover:bg-[#E4D7FA] px-3 py-1.5 flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge className="bg-[#FFD6C0] text-gray-800 hover:bg-[#FFCAB0] px-3 py-1.5 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" />
                    {userInfo.domain}
                  </Badge>
                )}
                {userInfo.lookingFor && (
                  <Badge className="bg-[#AEE6E6] text-gray-800 hover:bg-[#9DD9D9] px-3 py-1.5 flex items-center gap-1">
                    <Compass className="h-3.5 w-3.5" />
                    {userInfo.lookingFor}
                  </Badge>
                )}
              </div>
              
              {/* CTA Buttons - Mobile Only */}
              <div 
                className="flex flex-wrap gap-3 justify-center md:hidden mt-8"
                style={{ opacity: nameRevealComplete ? 1 : 0, transition: 'opacity 0.5s ease 0.6s' }}
              >
                <Button
                  onClick={() => setIsContactModalOpen(true)}
                  className="cta-btn bg-gradient-to-r from-[#AEE6E6] to-[#E4D7FA] hover:from-[#9DD9D9] hover:to-[#D3C6E9] text-gray-800"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Let's Talk
                </Button>
                
                <Button
                  variant="outline"
                  className="cta-btn border-[#FFD6C0] text-gray-800 hover:bg-[#FFD6C0]/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                
                <Button
                  variant="outline"
                  className="cta-btn border-[#E4D7FA] text-gray-800 hover:bg-[#E4D7FA]/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Mentor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Visual Showcase Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Visual Showcase</h2>
          <p className="text-gray-600 mb-8">Selected projects and creative work</p>
          
          {/* Masonry Grid */}
          <div className="masonry-grid">
            {sortedProjects.length > 0 ? (
              sortedProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`${getMasonryItemClass(index)}`}
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="project-card h-full">
                    {/* Project thumbnail */}
                    <img 
                      src={project.thumbnailUrl || '/images/placeholder-project.svg'} 
                      alt={project.title} 
                      className="project-image"
                    />
                    
                    {/* Overlay with project details */}
                    <div className="project-overlay">
                      <span className="text-gray-400 text-sm mb-1 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2" />
                        {formatDate(project.startDate)}
                      </span>
                      
                      <h3 className="text-white text-xl font-bold mb-2">{project.title}</h3>
                      
                      {project.category && (
                        <Badge className="bg-white/20 text-white hover:bg-white/30 self-start mb-3">
                          {project.category}
                        </Badge>
                      )}
                      
                      <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
                      
                      {project.projectUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 text-white border-white/30 hover:bg-white/10 self-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(project.projectUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          View Project
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state for no projects
              <div className="col-span-full py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#F2EDF8] flex items-center justify-center mb-4">
                  <FileImage className="h-8 w-8 text-[#E4D7FA]" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No projects yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your visual portfolio will appear here once you add some projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* What I'm Good At (Skills) Section */}
      <section className="py-16 px-6 md:px-12 bg-[#F7F9FC]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">What I'm Good At</h2>
          <p className="text-gray-600 mb-8">My professional skills & expertise</p>
          
          {/* Interactive Tag Cloud */}
          <div className="tag-cloud">
            {sortedSkills.length > 0 ? (
              sortedSkills.map((skill, index) => {
                // Assign different colors based on skill proficiency
                let bgColor = '#FFD6C0';
                let textColor = '#2B2E33';
                let animationDelay = `${(index % 5) * 0.2}s`;
                
                if (skill.proficiency && skill.proficiency > 80) {
                  bgColor = '#AEE6E6';
                } else if (skill.proficiency && skill.proficiency > 60) {
                  bgColor = '#E4D7FA';
                }
                
                return (
                  <div 
                    key={skill.id} 
                    className="skill-tag" 
                    style={{ 
                      backgroundColor: bgColor, 
                      color: textColor,
                      animationDelay,
                      transform: `scale(${Math.min(1.2, Math.max(0.85, skill.proficiency ? skill.proficiency / 80 : 1))})`,
                    }}
                  >
                    {skill.name}
                    {skill.proficiency && (
                      <span className="ml-2 opacity-70">{skill.proficiency}%</span>
                    )}
                  </div>
                );
              })
            ) : (
              // Empty state for no skills
              <div className="w-full py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#F2EDF8] flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-[#E4D7FA]" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No skills added yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your skills and expertise will appear here once you add them to your profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Career Path (Timeline) Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Career Path</h2>
          <p className="text-gray-600 mb-8">Professional journey & experience</p>
          
          {/* Horizontal Scrollable Timeline */}
          <div className="timeline-wrap">
            <div className="timeline">
              {sortedExperiences.length > 0 ? (
                sortedExperiences.map((exp) => (
                  <div key={exp.id} className="timeline-item bg-white">
                    {/* Visual snippet at top */}
                    <div className="h-24 bg-gradient-to-r from-[#E4D7FA] to-[#AEE6E6] relative">
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full py-1 px-3 text-xs font-medium text-white">
                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-800 mb-1">{exp.title}</h3>
                      {exp.company && (
                        <p className="text-gray-600 text-sm mb-3">{exp.company}</p>
                      )}
                      <p className="text-gray-500 text-sm line-clamp-3">{exp.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="w-full py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-[#F2EDF8] flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-[#E4D7FA]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No experience added yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Your professional experience will appear here once you add it to your profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Academic Background Section */}
      <section className="py-16 px-6 md:px-12 bg-[#F7F9FC]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Academic Background</h2>
          <p className="text-gray-600 mb-8">Education and credentials</p>
          
          {/* Grid of Education Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEducations.length > 0 ? (
              sortedEducations.map((edu) => (
                <Card key={edu.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <div className="h-2 bg-[#FFD6C0]"></div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-800 mb-1">{edu.degree}</h3>
                    {edu.institution && (
                      <p className="text-gray-600 text-sm mb-3">{edu.institution}</p>
                    )}
                    
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                    
                    {edu.location && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-2" />
                        <span>{edu.location}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <div className="col-span-full py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#F2EDF8] flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-[#E4D7FA]" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No education history yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your education details will appear here once you add them to your profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Buttons - Bottom Right (Mobile Only) */}
      <div className="cta-fixed-bottom md:hidden">
        <Button
          onClick={() => setIsContactModalOpen(true)}
          size="lg"
          className="cta-btn rounded-full shadow-xl w-14 h-14 flex items-center justify-center p-0 bg-gradient-to-r from-[#AEE6E6] to-[#E4D7FA] text-gray-800"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Let's Talk Modal Dialog */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-2">Let's Talk</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-6">
              {/* Purpose Dropdown */}
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
              
              {/* Message Box */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Write a note to start the conversation (Optional):</label>
                <Textarea 
                  placeholder="Write a note to start the conversation..."
                  className="min-h-[120px]"
                  maxLength={350}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
                <div className="text-xs text-right text-gray-500">
                  {contactMessage.length}/350 characters
                </div>
              </div>
              
              {/* File Attachment Option */}
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Paperclip className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG (max 5MB)</p>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-[#AEE6E6] to-[#E4D7FA] hover:from-[#9DD9D9] hover:to-[#D3C6E9] text-gray-800"
                >
                  Request Connection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Sound Toggle (hidden but functional) */}
      <div className="hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="fixed bottom-4 left-4 z-50"
        >
          {audioEnabled ? "Sound On" : "Sound Off"}
        </Button>
      </div>
    </div>
  );
}