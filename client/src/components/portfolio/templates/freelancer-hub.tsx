import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Download, Palette, Heart, Music, Video, Film, 
  Briefcase, GraduationCap, Calendar, MapPin, 
  ChevronRight, Code, Layers,
  Mail, Instagram, Twitter, Linkedin, Youtube, Camera, 
  FileText, PenTool, Coffee, Star, Zap, Headphones,
  Radio, Sparkles, Scissors, Pencil, Book, Gift, 
  MessageCircle, Smile, Upload, X, ExternalLink,
  MessageSquare, PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Project, Skill, Service } from "@shared/schema";
import { UserExperience, UserEducation } from "@/types";

interface FreelancerHubProps {
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
  userProjects: Project[];
  userServices: Service[];
  userExperiences: UserExperience[];
  userEducations: UserEducation[];
  publicUrl?: string | null;
}

export default function FreelancerHub({ 
  userInfo, 
  userSkills, 
  userProjects, 
  userServices, 
  userExperiences = [], 
  userEducations = [],
  publicUrl 
}: FreelancerHubProps) {
  // State for animations and effects
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(85);
  const [isShowing, setIsShowing] = useState(false);
  
  // Let's Talk Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactPurpose, setContactPurpose] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  
  // Resume modal state
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  
  // Project detail modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Scroll state for horizontal section
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort education by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services (featured first, then alphabetically)
  const sortedServices = [...userServices].sort((a, b) => {
    // First sort by order (if available)
    if (a.order !== b.order) {
      return (a.order || 0) - (b.order || 0);
    }
    // Then sort alphabetically by title
    return (a.title || '').localeCompare(b.title || '');
  });
  
  // Sort projects by date (most recent first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Group skills by category
  const skillCategories = {
    creative: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('design') || 
      s.name.toLowerCase().includes('art') || 
      s.name.toLowerCase().includes('creative') ||
      s.name.toLowerCase().includes('photo') ||
      s.name.toLowerCase().includes('video') ||
      s.name.toLowerCase().includes('writing') ||
      s.name.toLowerCase().includes('content')
    ),
    technical: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('coding') || 
      s.name.toLowerCase().includes('programming') || 
      s.name.toLowerCase().includes('development') ||
      s.name.toLowerCase().includes('software') ||
      s.name.toLowerCase().includes('web') ||
      s.name.toLowerCase().includes('app')
    ),
    soft: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('communication') || 
      s.name.toLowerCase().includes('leadership') || 
      s.name.toLowerCase().includes('management') ||
      s.name.toLowerCase().includes('organization') ||
      s.name.toLowerCase().includes('strategy')
    ),
    tools: sortedSkills.filter(s => 
      s.name.toLowerCase().includes('adobe') || 
      s.name.toLowerCase().includes('figma') || 
      s.name.toLowerCase().includes('sketch') ||
      s.name.toLowerCase().includes('office') ||
      s.name.toLowerCase().includes('canva') ||
      s.name.toLowerCase().includes('studio') ||
      s.name.toLowerCase().includes('premiere') ||
      s.name.toLowerCase().includes('photoshop')
    ),
    other: sortedSkills.filter(s => 
      !s.name.toLowerCase().includes('design') && 
      !s.name.toLowerCase().includes('art') && 
      !s.name.toLowerCase().includes('creative') &&
      !s.name.toLowerCase().includes('photo') &&
      !s.name.toLowerCase().includes('video') &&
      !s.name.toLowerCase().includes('writing') &&
      !s.name.toLowerCase().includes('content') &&
      !s.name.toLowerCase().includes('coding') && 
      !s.name.toLowerCase().includes('programming') && 
      !s.name.toLowerCase().includes('development') &&
      !s.name.toLowerCase().includes('software') &&
      !s.name.toLowerCase().includes('web') &&
      !s.name.toLowerCase().includes('app') &&
      !s.name.toLowerCase().includes('communication') && 
      !s.name.toLowerCase().includes('leadership') && 
      !s.name.toLowerCase().includes('management') &&
      !s.name.toLowerCase().includes('organization') &&
      !s.name.toLowerCase().includes('strategy') &&
      !s.name.toLowerCase().includes('adobe') && 
      !s.name.toLowerCase().includes('figma') && 
      !s.name.toLowerCase().includes('sketch') &&
      !s.name.toLowerCase().includes('office') &&
      !s.name.toLowerCase().includes('canva') &&
      !s.name.toLowerCase().includes('studio') &&
      !s.name.toLowerCase().includes('premiere') &&
      !s.name.toLowerCase().includes('photoshop')
    )
  };
  
  // Format date function
  const formatDate = (dateString: string | null, includeMonth = true) => {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    if (includeMonth) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    return date.getFullYear().toString();
  };
  
  // Function to get appropriate emoji for title
  const getTitleEmoji = (title: string | null) => {
    if (!title) return '✨';
    
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('design')) return '🎨';
    if (lowercaseTitle.includes('develop')) return '💻';
    if (lowercaseTitle.includes('photo')) return '📸';
    if (lowercaseTitle.includes('video')) return '🎬';
    if (lowercaseTitle.includes('write') || lowercaseTitle.includes('content')) return '✍️';
    if (lowercaseTitle.includes('market')) return '📣';
    if (lowercaseTitle.includes('coach') || lowercaseTitle.includes('teach')) return '🧠';
    if (lowercaseTitle.includes('speak') || lowercaseTitle.includes('host')) return '🎤';
    if (lowercaseTitle.includes('social')) return '📱';
    if (lowercaseTitle.includes('consult')) return '💡';
    return '✨';
  };
  
  // Function to get skill icon based on name
  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase();
    
    if (name.includes('design') || name.includes('art')) return <Palette className="h-4 w-4" />;
    if (name.includes('photo')) return <Camera className="h-4 w-4" />;
    if (name.includes('video')) return <Film className="h-4 w-4" />;
    if (name.includes('write') || name.includes('content')) return <PenTool className="h-4 w-4" />;
    if (name.includes('music') || name.includes('audio')) return <Music className="h-4 w-4" />;
    if (name.includes('strategy') || name.includes('planning')) return <Zap className="h-4 w-4" />;
    if (name.includes('editing')) return <Scissors className="h-4 w-4" />;
    if (name.includes('illustration')) return <Pencil className="h-4 w-4" />;
    if (name.includes('social')) return <Heart className="h-4 w-4" />;
    
    return <Star className="h-4 w-4" />;
  };
  
  // Function to get appropriate gradient for category
  const getCategoryGradient = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'design':
        return 'from-purple-500 to-pink-500';
      case 'development':
      case 'web development':
        return 'from-blue-500 to-cyan-500';
      case 'marketing':
        return 'from-orange-400 to-pink-500';
      case 'photography':
        return 'from-indigo-500 to-purple-500';
      case 'video':
        return 'from-red-500 to-orange-500';
      case 'music':
        return 'from-green-400 to-blue-500';
      case 'writing':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-rose-400 to-orange-300';
    }
  };
  
  // Function to handle project selection and modal display
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };
  
  // Function to handle Let's Talk button click
  const handleLetsTalkClick = () => {
    setIsContactModalOpen(true);
  };
  
  // Function to handle scroll in horizontal sections
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 300; // adjust as needed
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };
  
  // Track scroll position for animations
  useEffect(() => {
    const handleScrollPosition = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', handleScrollPosition);
    };
  }, []);
  
  // Load fonts and styles on mount
  useEffect(() => {
    // Add playful fonts
    const poppinsFont = document.createElement('link');
    poppinsFont.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
    poppinsFont.rel = 'stylesheet';
    
    const fredokaFont = document.createElement('link');
    fredokaFont.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap';
    fredokaFont.rel = 'stylesheet';
    
    const rubikFont = document.createElement('link');
    rubikFont.href = 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap';
    rubikFont.rel = 'stylesheet';
    
    document.head.appendChild(poppinsFont);
    document.head.appendChild(fredokaFont);
    document.head.appendChild(rubikFont);
    
    // Add custom CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Freelancer Hub Template - Playful Animations & Styles */
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes wiggle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(3deg); }
        75% { transform: rotate(-3deg); }
        100% { transform: rotate(0deg); }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes rainbow-border {
        0% { border-color: #FF5757; }
        20% { border-color: #FF914D; }
        40% { border-color: #FFDE59; }
        60% { border-color: #7ED957; }
        80% { border-color: #4DB4FF; }
        100% { border-color: #C74DFF; }
      }
      
      @keyframes slide-in {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes confetti {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes heartbeat {
        0% { transform: scale(1); }
        25% { transform: scale(1.1); }
        40% { transform: scale(1); }
        60% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .freelancer-hub .profile-frame {
        position: relative;
        border-radius: 50%;
        padding: 4px;
        background: linear-gradient(45deg, #FF5757, #FF914D, #FFDE59, #7ED957, #4DB4FF, #C74DFF);
        background-size: 300% 300%;
        animation: confetti 5s ease infinite;
      }
      
      .freelancer-hub .skill-tag {
        transition: all 0.3s ease;
      }
      
      .freelancer-hub .skill-tag:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .freelancer-hub .service-card {
        transition: all 0.3s ease;
        transform-style: preserve-3d;
        perspective: 1000px;
      }
      
      .freelancer-hub .service-card:hover {
        transform: translateY(-10px) rotateX(5deg);
      }
      
      .freelancer-hub .project-card {
        transition: all 0.3s ease;
        overflow: hidden;
      }
      
      .freelancer-hub .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      }
      
      .freelancer-hub .project-card:hover .project-image {
        transform: scale(1.05);
      }
      
      .freelancer-hub .project-image {
        transition: transform 0.5s ease;
      }
      
      .freelancer-hub .milestone-node {
        position: relative;
      }
      
      .freelancer-hub .milestone-node::before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        top: 24px;
        left: -38px;
        border: 3px solid;
        z-index: 1;
      }
      
      .freelancer-hub .milestone-node::after {
        content: '';
        position: absolute;
        width: 2px;
        background: #e5e7eb;
        top: 40px;
        bottom: -20px;
        left: -31px;
      }
      
      .freelancer-hub .milestone-node:last-child::after {
        display: none;
      }
      
      .freelancer-hub .blob-button {
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;
      }
      
      .freelancer-hub .blob-button:hover {
        transform: scale(1.05);
      }
      
      .freelancer-hub .blob-button:active {
        transform: scale(0.95);
      }
      
      .freelancer-hub .emoji-bullet {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 8px;
        font-size: 14px;
      }
      
      .freelancer-hub .sticker {
        position: absolute;
        transform: rotate(-15deg);
        background: white;
        border-radius: 6px;
        padding: 5px 10px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        color: #000;
        z-index: 10;
      }
      
      .freelancer-hub .mood-bar {
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        background: #e5e7eb;
      }
      
      .freelancer-hub .mood-progress {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
        background: linear-gradient(to right, #4ade80, #fbbf24);
      }
      
      .freelancer-hub .highlight-text {
        position: relative;
        display: inline;
      }
      
      .freelancer-hub .highlight-text::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 30%;
        width: 100%;
        background: rgba(253, 186, 116, 0.3);
        z-index: -1;
      }
    `;
    
    document.head.appendChild(style);
    
    // Show content with delay for animations
    setTimeout(() => {
      setIsShowing(true);
    }, 100);
    
    // Clean up
    return () => {
      document.head.removeChild(poppinsFont);
      document.head.removeChild(fredokaFont);
      document.head.removeChild(rubikFont);
      document.head.removeChild(style);
    };
  }, []);
  
  // Determine if mood is good based on energy level
  const moodMessage = energyLevel > 80 
    ? "I'm feeling super creative today! ✨" 
    : energyLevel > 60 
      ? "Ready to collaborate! 🤝" 
      : "Taking it easy today 😌";
  
  // Project Details Modal
  const renderProjectDetailsModal = () => {
    if (!selectedProject) return null;
    
    return (
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {/* Floating decorative elements to match the template style */}
          <motion.div 
            className="absolute -top-10 -left-10 w-60 h-60 bg-gradient-to-br from-purple-200 to-purple-50 rounded-full opacity-20 blur-3xl z-0"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tr from-amber-200 to-amber-50 rounded-full opacity-20 blur-3xl z-0"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -15, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <div className="relative h-72 overflow-hidden">
            {/* Gradient background as fallback */}
            <div 
              className="absolute w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${getCategoryGradient(selectedProject.category || 'design')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Project image with error handling */}
            {selectedProject.thumbnailUrl && (
              <img
                src={selectedProject.thumbnailUrl.startsWith('http') ? selectedProject.thumbnailUrl : `${window.location.origin}${selectedProject.thumbnailUrl}`}
                alt={selectedProject.title}
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={(e) => {
                  console.log('Error loading project header image:', selectedProject.thumbnailUrl);
                  // Try to use the first media URL as fallback
                  if (selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0) {
                    const fallbackUrl = selectedProject.mediaUrls[0];
                    console.log('Trying fallback image from mediaUrls:', fallbackUrl);
                    e.currentTarget.src = fallbackUrl.startsWith('http') ? 
                      fallbackUrl : `${window.location.origin}${fallbackUrl}`;
                  } else {
                    e.currentTarget.style.opacity = '0';
                  }
                }}
              />
            )}
            
            {/* Try mediaUrls[0] as a fallback if thumbnailUrl is not available */}
            {!selectedProject.thumbnailUrl && selectedProject.mediaUrls && 
             Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0 && (
              <img
                src={selectedProject.mediaUrls[0].startsWith('http') ? 
                    selectedProject.mediaUrls[0] : 
                    `${window.location.origin}${selectedProject.mediaUrls[0]}`}
                alt={`${selectedProject.title} media`}
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={(e) => {
                  console.log('Error loading fallback media image:', selectedProject.mediaUrls[0]);
                  e.currentTarget.style.opacity = '0';
                }}
              />
            )}
            
            {/* Dark overlay with gradient for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-20" />
            
            {/* Close button */}
            <motion.button 
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/50 transition-colors z-30 shadow-md"
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
            
            {/* Title area */}
            <div className="absolute bottom-0 left-0 p-7 w-full z-30">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white mb-2" 
                style={{ fontFamily: 'Fredoka, sans-serif' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {selectedProject.title}
              </motion.h2>
              
              {selectedProject.category && (
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Badge className="bg-white/30 backdrop-blur-sm text-white border-none px-3 py-1">
                    {selectedProject.category}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="p-7 relative z-10 bg-white/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              {/* Project Title - Separate section to highlight importance */}
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-violet-700 mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {selectedProject.title}
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"></div>
              </motion.div>

              {/* Category and Industry - Horizontal badges layout */}
              <div className="flex flex-wrap gap-3 mb-5">
                {/* Category Badge */}
                {selectedProject.category && (
                  <motion.div 
                    className="flex items-center bg-violet-100 px-3 py-1.5 rounded-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <Layers className="h-4 w-4 mr-2 text-violet-600" />
                    <span className="text-sm font-medium text-violet-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedProject.category}
                    </span>
                  </motion.div>
                )}
                
                {/* Industry Badge */}
                {selectedProject.industry && (
                  <motion.div 
                    className="flex items-center bg-blue-100 px-3 py-1.5 rounded-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedProject.industry}
                    </span>
                  </motion.div>
                )}
                
                {/* Date Badge */}
                {selectedProject.startDate && (
                  <motion.div 
                    className="flex items-center bg-amber-100 px-3 py-1.5 rounded-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatDate(selectedProject.startDate, true)}
                    </span>
                  </motion.div>
                )}
              </div>
              
              {/* Description section */}
              {selectedProject.description && (
                <motion.div 
                  className="mb-6 bg-gradient-to-r from-amber-50 to-white p-5 rounded-xl border border-amber-100"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h4 className="text-sm font-bold mb-2 text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="text-amber-500 mr-2">✨</span> About this project
                  </h4>
                  <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {selectedProject.description}
                  </p>
                </motion.div>
              )}
              
              {/* Project URL section */}
              {selectedProject.projectUrl && (
                <motion.div 
                  className="mb-6 bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <h4 className="text-sm font-bold mb-2 text-gray-700 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="text-blue-500 mr-2">🔗</span> Project Link
                  </h4>
                  <a 
                    href={selectedProject.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 underline break-all inline-flex items-center"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {selectedProject.projectUrl}
                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                  </a>
                </motion.div>
              )}
              
              {/* Media Gallery */}
              {selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0 && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h4 className="text-sm font-bold mb-3 text-gray-700 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="text-pink-500 mr-2">🖼️</span> Project Gallery
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProject.mediaUrls.map((url: string, index: number) => {
                      // Skip the first image if it's being used as the header and there are multiple images
                      if (index === 0 && !selectedProject.thumbnailUrl && selectedProject.mediaUrls.length > 1) {
                        return null;
                      }
                      
                      return (
                        <motion.div 
                          key={index} 
                          className="rounded-xl overflow-hidden h-32 relative shadow-md"
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Gradient background as fallback */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(135deg, ${getCategoryGradient(selectedProject.category || 'design')})`,
                            }}
                          />
                          
                          <img 
                            src={url.startsWith('http') ? url : `${window.location.origin}${url}`}
                            alt={`Project image ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            onError={(e) => {
                              console.log('Error loading media image:', url);
                              e.currentTarget.style.opacity = '0';
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8">
                {selectedProject.projectUrl && (
                  <motion.a 
                    href={selectedProject.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    Visit Project
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Let's Talk Contact Modal
  const renderContactModal = () => {
    return (
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          {/* Floating decorative elements to match the template style */}
          <motion.div 
            className="absolute -top-10 -left-10 w-60 h-60 bg-gradient-to-br from-fuchsia-200 to-fuchsia-50 rounded-full opacity-20 blur-3xl z-0"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div 
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tr from-purple-200 to-purple-50 rounded-full opacity-20 blur-3xl z-0"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -15, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-7 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DialogTitle className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <span className="mr-2">✨</span> Let's Create Something Amazing!
              </DialogTitle>
              <p className="text-white/90" style={{ fontFamily: 'Poppins, sans-serif' }}>
                I'd love to hear about your project or opportunity.
              </p>
            </motion.div>
          </div>
          
          <div className="p-7 relative z-10 bg-white/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-bold mb-2 text-violet-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  What are you looking for?
                </label>
                <Select value={contactPurpose} onValueChange={setContactPurpose}>
                  <SelectTrigger className="w-full border-violet-200 focus:ring-violet-300">
                    <SelectValue placeholder="Select a purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project Collaboration</SelectItem>
                    <SelectItem value="job">Job Opportunity</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="networking">Professional Networking</SelectItem>
                    <SelectItem value="other">Something Else</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-bold mb-2 text-violet-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Your Message
                </label>
                <Textarea 
                  placeholder="Tell me a bit about what you have in mind..."
                  className="resize-none h-32 border-violet-200 focus:ring-violet-300"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
              </motion.div>
              
              <motion.div 
                className="flex justify-end gap-3 mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <motion.button 
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    // In a real app, this would send an email or message
                    window.open(`mailto:${userInfo.email || ''}?subject=Let's Talk: ${contactPurpose}&body=${contactMessage}`);
                    setIsContactModalOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </motion.button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="freelancer-hub bg-gradient-to-br from-fuchsia-50 via-amber-50 to-blue-50 min-h-screen pb-20">
      {/* Mood Bar (just for fun) */}
      <div className="sticky top-0 z-50 bg-white py-2 px-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs font-medium mr-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Creative Energy:</span>
          <div className="mood-bar w-32">
            <div className="mood-progress" style={{ width: `${energyLevel}%` }}></div>
          </div>
        </div>
        <div className="text-xs font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {moodMessage}
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-10 overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute -top-10 -left-10 w-60 h-60 bg-gradient-to-br from-purple-200 to-purple-50 rounded-full opacity-30 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tr from-amber-200 to-amber-50 rounded-full opacity-30 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
            {/* Profile Picture with animated border */}
            <motion.div 
              className="flex-shrink-0 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="profile-frame w-44 h-44 md:w-60 md:h-60">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              
              {/* Available badge sticker */}
              <motion.div 
                className="sticker -right-5 top-5"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: -15 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Available for Work!
                </span>
              </motion.div>
              
              {/* Experience badge */}
              <motion.div 
                className="sticker -left-8 bottom-10"
                initial={{ scale: 0, rotate: 15 }}
                animate={{ scale: 1, rotate: 15 }}
                transition={{ delay: 1, type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {userExperiences.length}+ Years Exp.
                </span>
              </motion.div>
            </motion.div>
            
            {/* Intro Content */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Name and Title */}
                <h1 className="text-4xl md:text-6xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  <span className="inline-block">
                    <AnimatePresence>
                      {isShowing && (
                        <motion.span
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {userInfo.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </h1>
                
                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  {getTitleEmoji(userInfo.title)} {userInfo.title || "Creative Professional"}
                </h2>
                
                {/* Location */}
                {userInfo.location && (
                  <motion.div 
                    className="flex items-center justify-center md:justify-start gap-1 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <MapPin className="h-4 w-4 text-pink-500" />
                    <span className="text-gray-600 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {userInfo.location}
                    </span>
                  </motion.div>
                )}
                
                {/* Industry/Domain Tags */}
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center md:justify-start mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {userInfo.industry && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-400 text-white text-sm py-1.5 px-3">
                        #{userInfo.industry}
                      </Badge>
                    </motion.div>
                  )}
                  {userInfo.domain && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm py-1.5 px-3">
                        #{userInfo.domain}
                      </Badge>
                    </motion.div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-sm py-1.5 px-3">
                      #Freelancer
                    </Badge>
                  </motion.div>
                </motion.div>
                
                {/* Looking For */}
                {userInfo.lookingFor && (
                  <motion.div 
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-full inline-flex items-center mb-8 relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <span className="absolute opacity-10 text-4xl right-3 transform -translate-y-1/2 top-1/2 z-0">
                      {userInfo.lookingFor.toLowerCase().includes("mentor") ? "🧠" : "🔍"}
                    </span>
                    <span className="text-lg mr-2 z-10">📢</span>
                    <span className="font-medium z-10 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {userInfo.lookingFor}
                    </span>
                  </motion.div>
                )}
                
                {/* Spacer to replace removed social links */}
                <div className="mb-6"></div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
                  {/* Connect Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <Button 
                      onClick={handleLetsTalkClick}
                      className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-lg px-6 py-6 rounded-full shadow-lg flex items-center gap-2 font-bold hover:shadow-xl transition-shadow w-full sm:w-auto"
                      style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                      <span>Let's Connect</span>
                      <motion.span
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 15, -15, 15, 0] }}
                        transition={{ 
                          duration: 0.5,
                          delay: 1.2,
                          repeat: 1,
                          repeatType: "reverse"
                        }}
                        className="text-xl"
                      >
                        👋
                      </motion.span>
                    </Button>
                  </motion.div>
                  
                  {/* Mentor Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    <Button 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-6 py-6 rounded-full shadow-lg flex items-center gap-2 font-bold hover:shadow-xl transition-shadow w-full sm:w-auto"
                      style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                      <span>Mentor</span>
                      <motion.span
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          duration: 1,
                          delay: 1.3,
                          repeat: 1,
                          repeatType: "reverse"
                        }}
                        className="text-xl"
                      >
                        🚀
                      </motion.span>
                    </Button>
                  </motion.div>
                  
                  {/* Grab My Resume Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, type: "spring" }}
                  >
                    <Button 
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-lg px-6 py-6 rounded-full shadow-lg flex items-center gap-2 font-bold hover:shadow-xl transition-shadow w-full sm:w-auto"
                      style={{ fontFamily: 'Fredoka, sans-serif' }}
                    >
                      <span>Grab My Resume</span>
                      <motion.span
                        initial={{ y: 0 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ 
                          duration: 0.5,
                          delay: 1.4,
                          repeat: 1,
                          repeatType: "reverse"
                        }}
                        className="text-xl"
                      >
                        📄
                      </motion.span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Me Section */}
      <section className="py-10 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="highlight-text">What I'm All About</span>
            </h2>
            
            <motion.p 
              className="text-lg leading-relaxed text-gray-700 mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isShowing ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {userInfo.aboutMe || 
                `I'm a passionate creative who loves to bring ideas to life through ${userInfo.domain || 'creative work'}. 
                With a blend of imagination and technical skills, I help brands and individuals express their unique stories.
                My approach focuses on collaboration, innovation, and delivering results that exceed expectations.`
              }
            </motion.p>
            
            {/* Fun elements */}
            <div className="flex items-center justify-center mt-6">
              <motion.div 
                className="flex gap-3"
                initial={{ scale: 0 }}
                animate={{ scale: isShowing ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <span className="text-sm px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Creative
                </span>
                <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Reliable
                </span>
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Innovative
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section className="py-10 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <span className="highlight-text">What I'm Good At</span>
          </motion.h2>
          
          <div className="space-y-8">
            {/* Creative Skills */}
            {skillCategories.creative.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Palette className="h-5 w-5 mr-2 text-pink-500" />
                  Creative Skills
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  {skillCategories.creative.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      className="skill-tag bg-gradient-to-r from-pink-500 to-rose-400 text-white px-4 py-2 rounded-full shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center">
                        {getSkillIcon(skill.name)}
                        <span className="ml-2 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {skill.name}
                        </span>
                        <div className="ml-2 flex items-center">
                          {/* Badge for proficiency level text */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md">
                            {skill.level || 'Intermediate'}
                          </span>
                          {/* Badge for proficiency percentage */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md ml-1">
                            {skill.proficiency ? `${skill.proficiency}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Technical Skills */}
            {skillCategories.technical.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Code className="h-5 w-5 mr-2 text-violet-500" />
                  Technical Skills
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  {skillCategories.technical.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      className="skill-tag bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {skill.name}
                        </span>
                        <div className="ml-2 flex items-center">
                          {/* Badge for proficiency level text */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md">
                            {skill.level || 'Intermediate'}
                          </span>
                          {/* Badge for proficiency percentage */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md ml-1">
                            {skill.proficiency ? `${skill.proficiency}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft Skills */}
            {skillCategories.soft.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Heart className="h-5 w-5 mr-2 text-rose-500" />
                  Soft Skills
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  {skillCategories.soft.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      className="skill-tag bg-gradient-to-r from-rose-400 to-red-400 text-white px-4 py-2 rounded-full shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {skill.name}
                        </span>
                        <div className="ml-2 flex items-center">
                          {/* Badge for proficiency level text */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md">
                            {skill.level || 'Intermediate'}
                          </span>
                          {/* Badge for proficiency percentage */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md ml-1">
                            {skill.proficiency ? `${skill.proficiency}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tools */}
            {skillCategories.tools.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Briefcase className="h-5 w-5 mr-2 text-amber-500" />
                  Tools & Software
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  {skillCategories.tools.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      className="skill-tag bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {skill.name}
                        </span>
                        <div className="ml-2 flex items-center">
                          {/* Badge for proficiency level text */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md">
                            {skill.level || 'Intermediate'}
                          </span>
                          {/* Badge for proficiency percentage */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md ml-1">
                            {skill.proficiency ? `${skill.proficiency}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Skills - removed "Other Skills" label as requested */}
            {skillCategories.other.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-3">
                  {skillCategories.other.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      className="skill-tag bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-full shadow-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="flex items-center">
                        <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {skill.name}
                        </span>
                        <div className="ml-2 flex items-center">
                          {/* Badge for proficiency level text */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md">
                            {skill.level || 'Intermediate'}
                          </span>
                          {/* Badge for proficiency percentage */}
                          <span className="text-xs px-1.5 py-0.5 bg-white/20 rounded-md ml-1">
                            {skill.proficiency ? `${skill.proficiency}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state for skills */}
            {userSkills.length === 0 && (
              <motion.div
                className="bg-white rounded-3xl p-8 text-center shadow"
                initial={{ opacity: 0 }}
                animate={{ opacity: isShowing ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Your skills will appear here!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 px-6 md:px-10 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-60 -right-20 w-80 h-80 bg-gradient-to-br from-fuchsia-100 to-pink-50 rounded-full opacity-30 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="highlight-text">My Services</span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Specialized offerings crafted with creativity and care
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedServices.length > 0 ? (
              sortedServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="service-card bg-white rounded-3xl shadow-xl overflow-hidden relative border-t-4 border-t-fuchsia-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ 
                    y: -15,
                    rotateZ: index % 2 === 0 ? 2 : -2 
                  }}
                  style={{
                    borderTopColor: index % 3 === 0 ? '#ec4899' : 
                                    index % 3 === 1 ? '#8b5cf6' : 
                                    '#3b82f6'
                  }}
                >
                  {/* Fun Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`service-pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          {index % 3 === 0 ? (
                            <path d="M0,20 L40,20 M20,0 L20,40" stroke="#000" strokeWidth="1" />
                          ) : index % 3 === 1 ? (
                            <circle cx="20" cy="20" r="3" fill="#000" />
                          ) : (
                            <path d="M0,0 L40,40 M0,40 L40,0" stroke="#000" strokeWidth="1" />
                          )}
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#service-pattern-${index})`} />
                    </svg>
                  </div>
                  
                  <div className="p-8 relative">
                    {/* Colorful Label */}
                    <div className="absolute -right-10 top-5 w-40 text-center transform rotate-45 text-xs font-bold py-1"
                         style={{
                           background: index % 3 === 0 ? 'linear-gradient(90deg, #ec4899, #f472b6)' : 
                                       index % 3 === 1 ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' : 
                                       'linear-gradient(90deg, #3b82f6, #60a5fa)',
                           color: 'white',
                           fontFamily: 'Poppins, sans-serif'
                         }}>
                      {index % 3 === 0 ? 'POPULAR!' : index % 3 === 1 ? 'BEST VALUE!' : 'FEATURED!'}
                    </div>
                    
                    {/* Service Icon with animation */}
                    <motion.div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                      style={{
                        background: index % 3 === 0 ? 'linear-gradient(135deg, #f472b6, #ec4899)' : 
                                  index % 3 === 1 ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 
                                  'linear-gradient(135deg, #60a5fa, #3b82f6)',
                      }}
                      animate={{ 
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-white text-2xl">
                        {getSkillIcon(service.title)}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {service.title}
                    </h3>
                    
                    <div className="h-24 overflow-hidden">
                      <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {service.description}
                      </p>
                    </div>
                    
                    {/* Features List */}
                    <ul className="mb-6 pl-1">
                      {(service.features && Array.isArray(service.features) && service.features.length > 0 ? service.features : []).map((feature, i) => (
                        <motion.li 
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700 mb-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <div className="text-xs w-5 h-5 rounded-full flex items-center justify-center"
                               style={{
                                 background: index % 3 === 0 ? '#fce7f3' : 
                                             index % 3 === 1 ? '#ede9fe' : 
                                             '#dbeafe',
                                 color: index % 3 === 0 ? '#ec4899' : 
                                        index % 3 === 1 ? '#8b5cf6' : 
                                        '#3b82f6'
                               }}>
                            ✓
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-col gap-3">
                      {/* Pricing */}
                      {((service.priceInr && Number(service.priceInr) > 0) || 
                       (service.priceUsd && Number(service.priceUsd) > 0)) && (
                        <div className="text-center py-2 font-bold text-lg"
                             style={{
                               background: index % 3 === 0 ? '#fce7f3' : 
                                           index % 3 === 1 ? '#ede9fe' : 
                                           '#dbeafe',
                               color: index % 3 === 0 ? '#be185d' : 
                                      index % 3 === 1 ? '#6d28d9' : 
                                      '#1e40af',
                               fontFamily: 'Poppins, sans-serif',
                               borderRadius: '0.75rem'
                             }}>
                          {service.isHourly ? (
                            `${service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}/hour`
                          ) : (
                            `${service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}`
                          )}
                        </div>
                      )}
                      
                      {/* CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={handleLetsTalkClick}
                          className="w-full shadow-lg font-bold py-3"
                          style={{
                            background: index % 3 === 0 ? 'linear-gradient(135deg, #f472b6, #ec4899)' : 
                                      index % 3 === 1 ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 
                                      'linear-gradient(135deg, #60a5fa, #3b82f6)',
                            color: 'white',
                            fontFamily: 'Fredoka, sans-serif'
                          }}
                        >
                          Book Now
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Default services
              [
                {
                  title: "Brand Design",
                  description: "Colorful, personality-filled branding that makes your business stand out in a crowd.",
                  price: "From $500",
                  icon: <Palette className="h-6 w-6 text-white" />
                },
                {
                  title: "Social Media",
                  description: "Engaging content strategy and creation to build your audience and boost engagement.",
                  price: "$300/month",
                  icon: <Heart className="h-6 w-6 text-white" />
                },
                {
                  title: "Creative Coaching",
                  description: "One-on-one sessions to help you unleash your creativity and level up your skills.",
                  price: "$100/hour",
                  icon: <Sparkles className="h-6 w-6 text-white" />
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="service-card bg-white rounded-3xl shadow-xl overflow-hidden relative border-t-4 border-t-fuchsia-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ 
                    y: -15,
                    rotateZ: index % 2 === 0 ? 2 : -2 
                  }}
                  style={{
                    borderTopColor: index % 3 === 0 ? '#ec4899' : 
                                    index % 3 === 1 ? '#8b5cf6' : 
                                    '#3b82f6'
                  }}
                >
                  {/* Fun Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          {index % 3 === 0 ? (
                            <path d="M0,20 L40,20 M20,0 L20,40" stroke="#000" strokeWidth="1" />
                          ) : index % 3 === 1 ? (
                            <circle cx="20" cy="20" r="3" fill="#000" />
                          ) : (
                            <path d="M0,0 L40,40 M0,40 L40,0" stroke="#000" strokeWidth="1" />
                          )}
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                    </svg>
                  </div>
                  
                  <div className="p-8 relative">
                    {/* Colorful Label */}
                    <div className="absolute -right-10 top-5 w-40 text-center transform rotate-45 text-xs font-bold py-1"
                         style={{
                           background: index % 3 === 0 ? 'linear-gradient(90deg, #ec4899, #f472b6)' : 
                                       index % 3 === 1 ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' : 
                                       'linear-gradient(90deg, #3b82f6, #60a5fa)',
                           color: 'white',
                           fontFamily: 'Poppins, sans-serif'
                         }}>
                      {index % 3 === 0 ? 'POPULAR!' : index % 3 === 1 ? 'BEST VALUE!' : 'FEATURED!'}
                    </div>
                    
                    {/* Service Icon with animation */}
                    <motion.div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                      style={{
                        background: index % 3 === 0 ? 'linear-gradient(135deg, #f472b6, #ec4899)' : 
                                  index % 3 === 1 ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 
                                  'linear-gradient(135deg, #60a5fa, #3b82f6)',
                      }}
                      animate={{ 
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-white text-2xl">
                        {service.icon}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {service.title}
                    </h3>
                    
                    <div className="h-24 overflow-hidden">
                      <p className="text-gray-600 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {service.description}
                      </p>
                    </div>
                    
                    {/* Features List */}
                    <ul className="mb-6 pl-1">
                      {(service.features && Array.isArray(service.features) && service.features.length > 0 ? service.features : []).map((feature, i) => (
                        <motion.li 
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700 mb-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <div className="text-xs w-5 h-5 rounded-full flex items-center justify-center"
                               style={{
                                 background: index % 3 === 0 ? '#fce7f3' : 
                                             index % 3 === 1 ? '#ede9fe' : 
                                             '#dbeafe',
                                 color: index % 3 === 0 ? '#ec4899' : 
                                        index % 3 === 1 ? '#8b5cf6' : 
                                        '#3b82f6'
                               }}>
                            ✓
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-col gap-3">
                      {/* Pricing */}
                      <div className="text-center py-2 font-bold text-lg"
                           style={{
                             background: index % 3 === 0 ? '#fce7f3' : 
                                         index % 3 === 1 ? '#ede9fe' : 
                                         '#dbeafe',
                             color: index % 3 === 0 ? '#be185d' : 
                                    index % 3 === 1 ? '#6d28d9' : 
                                    '#1e40af',
                             fontFamily: 'Poppins, sans-serif',
                             borderRadius: '0.75rem'
                           }}>
                        {service.price}
                      </div>
                      
                      {/* CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={handleLetsTalkClick}
                          className="w-full shadow-lg font-bold py-3"
                          style={{
                            background: index % 3 === 0 ? 'linear-gradient(135deg, #f472b6, #ec4899)' : 
                                      index % 3 === 1 ? 'linear-gradient(135deg, #a78bfa, #8b5cf6)' : 
                                      'linear-gradient(135deg, #60a5fa, #3b82f6)',
                            color: 'white',
                            fontFamily: 'Fredoka, sans-serif'
                          }}
                        >
                          Book Now
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section className="py-16 px-6 md:px-10 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute -top-40 right-40 w-80 h-80 bg-gradient-to-br from-purple-100 to-cyan-50 rounded-full opacity-20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="highlight-text">My Creative Showcase</span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Take a look at some of my recent work. Each project represents a unique challenge solved with creativity and expertise.
            </p>
          </motion.div>
          
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 30 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -10 }}
                >
                  <Card 
                    className="project-card h-full overflow-hidden border-none shadow-xl rounded-xl cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    {/* Square Project Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {/* Gradient background as fallback */}
                      <div 
                        className="project-image absolute w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${getCategoryGradient(project.category || 'design')})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      
                      {/* Direct display of the thumbnail image */}
                      {project.thumbnailUrl && (
                        <img
                          src={project.thumbnailUrl.startsWith('http') ? project.thumbnailUrl : `${window.location.origin}${project.thumbnailUrl}`}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => {
                            console.log('Error loading thumbnail:', project.thumbnailUrl);
                            // Try to get the first item from mediaUrls as fallback
                            if (project.mediaUrls && Array.isArray(project.mediaUrls) && project.mediaUrls.length > 0) {
                              const fallbackUrl = project.mediaUrls[0];
                              e.currentTarget.src = fallbackUrl.startsWith('http') ? 
                                fallbackUrl : `${window.location.origin}${fallbackUrl}`;
                            } else {
                              e.currentTarget.style.opacity = '0';
                            }
                          }}
                        />
                      )}
                      
                      {/* If no thumbnailUrl, try mediaUrls[0] */}
                      {!project.thumbnailUrl && project.mediaUrls && Array.isArray(project.mediaUrls) && project.mediaUrls.length > 0 && (
                        <img
                          src={project.mediaUrls[0].startsWith('http') ? project.mediaUrls[0] : `${window.location.origin}${project.mediaUrls[0]}`}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => {
                            console.log('Error loading media as thumbnail:', project.mediaUrls[0]);
                            e.currentTarget.style.opacity = '0';
                          }}
                        />
                      )}
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                        <div className="p-5 text-white">
                          <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                            {project.title}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Floating badge for date */}
                      {project.startDate && (
                        <motion.div 
                          className="absolute top-3 right-3 bg-white text-sm font-semibold px-2 py-1 rounded-full shadow-md"
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {formatDate(project.startDate, true)}
                        </motion.div>
                      )}
                    </div>
                    
                    <CardContent className="p-3">
                      {/* Empty content - only title and date are shown as requested */}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty state for projects
            <motion.div
              className="bg-white rounded-3xl p-10 text-center shadow-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: isShowing ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-100 rounded-full flex items-center justify-center">
                <Camera className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>No Projects Yet</h3>
              <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Your amazing projects will be showcased here soon!
              </p>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  repeatDelay: 1
                }}
                className="mt-6"
              >
                <span className="text-3xl">⬇️</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Experience Timeline */}
      <section className="py-16 px-6 md:px-10 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-40 -left-20 w-60 h-60 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full opacity-30 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="highlight-text">Career Journey</span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              A timeline of my professional adventures and growth through the years
            </p>
          </motion.div>
          
          {sortedExperiences.length > 0 ? (
            <div className="relative pl-10 md:pl-16 border-l-4 border-dashed border-violet-200">
              {sortedExperiences.map((exp, index) => (
                <motion.div 
                  key={exp.id}
                  className="milestone-node mb-16"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isShowing ? 1 : 0, x: isShowing ? 0 : -20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ x: 5 }}
                  style={{ borderColor: index % 6 === 0 ? '#ec4899' : 
                                      index % 6 === 1 ? '#8b5cf6' : 
                                      index % 6 === 2 ? '#3b82f6' : 
                                      index % 6 === 3 ? '#10b981' : 
                                      index % 6 === 4 ? '#f59e0b' :
                                      '#ef4444' }}
                >
                  <div className="bg-white rounded-2xl p-7 shadow-xl relative overflow-hidden">
                    {/* Colored corner accent */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full"
                      style={{ 
                        background: `linear-gradient(135deg, ${
                          index % 6 === 0 ? '#ec4899, #db2777' : 
                          index % 6 === 1 ? '#8b5cf6, #7c3aed' : 
                          index % 6 === 2 ? '#3b82f6, #2563eb' : 
                          index % 6 === 3 ? '#10b981, #059669' : 
                          index % 6 === 4 ? '#f59e0b, #d97706' :
                          '#ef4444, #dc2626'
                        })`,
                        opacity: 0.15
                      }}
                    />
                    
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                          {exp.title} 
                          <motion.span 
                            className="inline-block ml-2"
                            animate={{ rotate: [0, 15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                          >
                            {index % 6 === 0 ? '🚀' : 
                             index % 6 === 1 ? '✨' : 
                             index % 6 === 2 ? '💡' : 
                             index % 6 === 3 ? '🌟' : 
                             index % 6 === 4 ? '🔥' : '🎯'}
                          </motion.span>
                        </h3>
                        <p className="text-violet-600 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {exp.company}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-2 md:mt-0 text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4 mr-1 text-violet-500" />
                        <span className="text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    {exp.location && (
                      <div className="flex items-center text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mr-1 text-pink-500" />
                        <span className="text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {exp.location}
                        </span>
                      </div>
                    )}
                    
                    {exp.description && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-2">
                        <p className="text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {exp.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Skills used tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['Leadership', 'Teamwork', 'Strategy', 'Innovation'].slice(0, index % 3 + 2).map((skill, i) => (
                        <Badge key={i} className="bg-violet-100 text-violet-700 border-none">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timeline node decoration */}
                  <div 
                    className="absolute -left-[22px] top-7 w-8 h-8 rounded-full z-10 flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${
                        index % 6 === 0 ? '#ec4899, #db2777' : 
                        index % 6 === 1 ? '#8b5cf6, #7c3aed' : 
                        index % 6 === 2 ? '#3b82f6, #2563eb' : 
                        index % 6 === 3 ? '#10b981, #059669' : 
                        index % 6 === 4 ? '#f59e0b, #d97706' :
                        '#ef4444, #dc2626'
                      })`
                    }}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty state for experiences
            <motion.div
              className="bg-white rounded-3xl p-10 text-center shadow-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: isShowing ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-violet-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>No Experience Added Yet</h3>
              <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Your impressive career journey will be showcased here! 
              </p>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  repeatDelay: 1
                }}
                className="mt-6"
              >
                <span className="text-3xl">⬇️</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Education Section */}
      <section className="py-16 px-6 md:px-10 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute -bottom-20 right-0 w-80 h-80 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full opacity-30 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="highlight-text">Academic Journey</span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              The foundation of knowledge that powers my creative process
            </p>
          </motion.div>
          
          {sortedEducations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sortedEducations.map((edu, index) => (
                <motion.div 
                  key={edu.id}
                  className="bg-white rounded-2xl p-6 shadow-xl overflow-hidden relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -8, rotate: index % 2 === 0 ? 1 : -1 }}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <pattern id={`edu-pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        {index % 3 === 0 ? (
                          <circle cx="20" cy="20" r="3" fill="#000" />
                        ) : index % 3 === 1 ? (
                          <rect x="15" y="15" width="10" height="10" fill="#000" />
                        ) : (
                          <polygon points="20,10 10,30 30,30" fill="#000" />
                        )}
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#edu-pattern-${index})`} />
                    </svg>
                  </div>
                  
                  {/* Floating graduation cap icon */}
                  <motion.div 
                    className="absolute -right-6 -top-6 w-20 h-20 rounded-full"
                    animate={{ rotate: [0, 15, 0], y: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-300 rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {edu.degree}
                    </h3>
                    
                    <div className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg inline-block mb-4">
                      <p className="text-amber-700 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {edu.institution}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4 mr-1 text-amber-500" />
                        <span className="text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {formatDate(edu.startDate, false)} — {edu.endDate ? formatDate(edu.endDate, false) : 'Present'}
                        </span>
                      </div>
                      
                      {edu.location && (
                        <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4 mr-1 text-amber-500" />
                          <span className="text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {edu.location}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Random education fields */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Research', 'Coursework', 'Leadership', 'Projects'].slice(0, index % 3 + 2).map((field, i) => (
                        <Badge key={i} className="bg-amber-100 text-amber-700 border-none">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty state for education
            <motion.div
              className="bg-white rounded-3xl p-10 text-center shadow-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: isShowing ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-100 rounded-full flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>No Education Added Yet</h3>
              <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Your academic achievements will shine here soon!
              </p>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  repeatDelay: 1
                }}
                className="mt-6"
              >
                <span className="text-3xl">⬇️</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-6 md:px-10 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            Ready to Collaborate?
          </motion.h2>
          
          <motion.p 
            className="text-lg mb-8 text-purple-100"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isShowing ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Let's create something amazing together!
          </motion.p>
          
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isShowing ? 1 : 0, y: isShowing ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="blob-button bg-white text-violet-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg flex items-center gap-2 w-full md:w-auto"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
                onClick={handleLetsTalkClick}
              >
                <MessageCircle className="h-5 w-5" />
                Let's Connect 💬
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="blob-button bg-purple-700 text-white hover:bg-purple-800 text-lg px-8 py-6 rounded-full shadow-lg flex items-center gap-2 w-full md:w-auto"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                <Download className="h-5 w-5" />
                Grab My Resume 📄
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="pb-12 px-6 text-center">
        <p className="text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
          © {new Date().getFullYear()} {userInfo.name} • Made with Brandentifier 💖
        </p>
        
        {publicUrl && (
          <p className="mt-2 text-sm text-gray-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Public URL: <a href={publicUrl} className="text-violet-500 hover:underline">{publicUrl}</a>
          </p>
        )}
      </footer>
      
      {/* Floating Stickers */}
      <motion.div 
        className="sticker top-24 md:top-32 right-6 md:right-12 z-10"
        initial={{ rotate: -15, scale: 0 }}
        animate={{ rotate: -15, scale: isShowing ? 1 : 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 10 }}
      >
        <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded shadow flex items-center gap-1">
          <Smile className="h-4 w-4" />
          New!
        </span>
      </motion.div>
      
      {/* Floating action buttons for mobile */}
      <motion.div 
        className="fixed bottom-4 left-0 right-0 z-50 flex justify-center md:hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          bounce: 0.5,
          duration: 0.8,
          delay: 0.5
        }}
      >
        <div className="flex gap-4 p-3 bg-white/70 backdrop-blur-md rounded-full shadow-xl">
          {/* Let's Talk button */}
          <motion.button 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg"
            onClick={handleLetsTalkClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle className="h-6 w-6" />
            <motion.span 
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full text-xs flex items-center justify-center text-violet-600 font-bold border-2 border-violet-400"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              💬
            </motion.span>
          </motion.button>
          
          {/* Resume button */}
          <motion.button 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg"
            onClick={() => setIsResumeModalOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FileText className="h-6 w-6" />
          </motion.button>
          
          {/* Social media button */}
          <motion.button 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Linkedin className="h-6 w-6" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Render Modals */}
      {renderProjectDetailsModal()}
      {renderContactModal()}
    </div>
  );
}