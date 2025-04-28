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
  DialogFooter,
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

// Custom Project type to ensure proper typing
interface EnhancedProject {
  id: number;
  title: string;
  description: string;
  startDate: string;
  projectUrl: string;
  category: string;
  industry: string;
  thumbnailUrl: string;
  mediaUrls: string[];
}

export default function FreelancerHub({ 
  userInfo, 
  userSkills, 
  userProjects, 
  userServices, 
  userExperiences = [], 
  userEducations = [],
  publicUrl 
}: FreelancerHubProps): JSX.Element {
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
  
  // Set showing state on mount
  useEffect(() => {
    setIsShowing(true);
  }, []);
  
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
    console.log("Selected project details:", project);
    
    // Make sure mediaUrls is treated as an array
    let mediaUrlsArray: string[] = [];
    
    // Handle various ways mediaUrls might be stored
    if (project.mediaUrls) {
      // If it's already an array, use it directly
      if (Array.isArray(project.mediaUrls)) {
        mediaUrlsArray = project.mediaUrls;
      } 
      // Otherwise, try to parse it if it's a JSON string
      else if (typeof project.mediaUrls === 'string') {
        try {
          const parsed = JSON.parse(project.mediaUrls);
          if (Array.isArray(parsed)) {
            mediaUrlsArray = parsed;
          }
        } catch (e) {
          console.error("Failed to parse mediaUrls:", e);
        }
      }
    }
    
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
  
  // Current status text based on energy level
  const statusText = energyLevel > 80 
    ? "Highly creative and productive today! 🚀" 
    : energyLevel > 60 
      ? "Ready to collaborate! 🤝" 
      : "Taking it easy today 😌";
  
  // Modal for project details
  const renderProjectDetailsModal = () => {
    if (!selectedProject) return null;
    
    // Get image URL with error handling
    const getThumbnailUrl = () => {
      if (!selectedProject.thumbnailUrl) return '';
      return selectedProject.thumbnailUrl.startsWith('http') 
        ? selectedProject.thumbnailUrl 
        : `${window.location.origin}${selectedProject.thumbnailUrl}`;
    };
    
    // Extract media URLs if they exist
    const getMediaUrls = () => {
      if (!selectedProject.mediaUrls) return [];
      if (Array.isArray(selectedProject.mediaUrls)) {
        return selectedProject.mediaUrls;
      }
      try {
        if (typeof selectedProject.mediaUrls === 'string') {
          const parsed = JSON.parse(selectedProject.mediaUrls);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Could not parse media URLs:", e);
      }
      return [];
    };
    
    return (
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject.title}</DialogTitle>
          </DialogHeader>
          
          {/* Thumbnail if available */}
          {selectedProject.thumbnailUrl && (
            <div className="w-full h-40 mb-4 overflow-hidden rounded-md bg-gray-100">
              <img
                src={getThumbnailUrl()}
                alt={selectedProject.title || 'Project thumbnail'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="py-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProject.category && (
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedProject.category}
                </Badge>
              )}
              
              {selectedProject.industry && (
                <Badge className="bg-purple-100 text-purple-800">
                  {selectedProject.industry}
                </Badge>
              )}
              
              {selectedProject.startDate && (
                <Badge className="bg-amber-100 text-amber-800">
                  {formatDate(selectedProject.startDate, true)}
                </Badge>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-gray-600">
                {selectedProject.description || 'No description provided'}
              </p>
            </div>
            
            {/* URL */}
            {selectedProject.projectUrl && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-1">Project URL</h3>
                <a 
                  href={selectedProject.projectUrl} 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 text-sm hover:underline flex items-center"
                >
                  {selectedProject.projectUrl}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
            
            {/* Media Gallery */}
            {getMediaUrls().length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Gallery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {getMediaUrls().map((url, index) => (
                    <div key={index} className="h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={url.startsWith('http') ? url : `${window.location.origin}${url}`}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Modal for contact
  const renderContactModal = () => {
    if (!isContactModalOpen) return null;
    
    return (
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center font-bold text-xl">Let's Talk!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">What can I help you with?</label>
              <Select value={contactPurpose} onValueChange={setContactPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a purpose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Discuss a project</SelectItem>
                  <SelectItem value="collaboration">Explore collaboration</SelectItem>
                  <SelectItem value="services">Inquire about services</SelectItem>
                  <SelectItem value="other">Something else</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Your message</label>
              <Textarea 
                placeholder="Tell me about your project, ideas, or questions..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Here you would handle the message sending logic
                console.log("Sending message from", userInfo.email, "Purpose:", contactPurpose, "Message:", contactMessage);
                setIsContactModalOpen(false);
                // Reset form
                setContactMessage("");
                setContactPurpose("");
              }}
            >
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Main template return
  return (
    <div className="freelancer-hub w-full overflow-x-hidden bg-white">
      {/* Profile Header */}
      <header className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 z-0" />
        
        {/* Decorative shapes */}
        <motion.div 
          className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full opacity-50 blur-2xl z-0"
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, 10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute bottom-20 right-10 w-60 h-60 bg-gradient-to-r from-purple-200 to-pink-100 rounded-full opacity-40 blur-2xl z-0"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Content container */}
        <div className="relative z-10 text-center">
          {/* Profile image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-5 md:mb-6"
          >
            <ProfileImage
              url={userInfo.photoURL || ''}
              name={userInfo.name}
              size={180}
              className="border-4 border-white shadow-xl"
            />
          </motion.div>
          
          {/* Name and title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-800"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            {userInfo.name}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-xl md:text-2xl font-medium text-gray-600 block mb-4">
              {userInfo.title || 'Creative Professional'} {getTitleEmoji(userInfo.title)}
            </span>
            
            {(userInfo.industry || userInfo.location) && (
              <div className="flex justify-center items-center gap-4 text-gray-500 mb-6">
                {userInfo.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {userInfo.industry}
                  </span>
                )}
                
                {userInfo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userInfo.location}
                  </span>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="inline-flex relative">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </span>
              <span className="text-gray-600">{statusText}</span>
            </div>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleLetsTalkClick}
                className="shadow-lg font-bold px-6 py-5"
                style={{
                  background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                  fontFamily: 'Fredoka, sans-serif'
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Let's Talk
              </Button>
            </motion.div>
            
            {userInfo.email && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${userInfo.email}`}
                  className="shadow font-bold px-6 py-5 border-2 border-gray-300"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Me
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Floating Stickers */}
        <motion.div 
          className="absolute top-24 md:top-32 right-6 md:right-12 z-10"
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: -15, scale: isShowing ? 1 : 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 300, damping: 10 }}
        >
          <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded shadow flex items-center gap-1">
            <Smile className="h-4 w-4" />
            New!
          </span>
        </motion.div>
      </header>
    
      {/* Skills Section */}
      <section className="py-16 px-6 md:px-10 relative">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            What I'm Good At
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A selection of my top skills across creative, technical, and professional domains.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid gap-8">
          {/* Creative Skills */}
          {skillCategories.creative.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center text-lg font-semibold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Palette className="h-5 w-5 mr-2 text-pink-500" />
                Creative Skills
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {skillCategories.creative.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 border-rose-200 text-rose-700 border shadow"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      {getSkillIcon(skill.name)}
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.level}
                        </span>
                      )}
                      {typeof skill.proficiency === 'number' && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.proficiency}%
                        </span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Technical Skills */}
          {skillCategories.technical.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center text-lg font-semibold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Code className="h-5 w-5 mr-2 text-blue-500" />
                Technical Skills
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {skillCategories.technical.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200 text-blue-700 border shadow"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      {getSkillIcon(skill.name)}
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.level}
                        </span>
                      )}
                      {typeof skill.proficiency === 'number' && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.proficiency}%
                        </span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Soft Skills */}
          {skillCategories.soft.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center text-lg font-semibold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Zap className="h-5 w-5 mr-2 text-amber-500" />
                Professional Skills
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {skillCategories.soft.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200 text-amber-700 border shadow"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      {getSkillIcon(skill.name)}
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.level}
                        </span>
                      )}
                      {typeof skill.proficiency === 'number' && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.proficiency}%
                        </span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tools Skills */}
          {skillCategories.tools.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center text-lg font-semibold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <Layers className="h-5 w-5 mr-2 text-purple-500" />
                Tools & Software
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {skillCategories.tools.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-purple-100 to-violet-100 border-purple-200 text-purple-700 border shadow"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      {getSkillIcon(skill.name)}
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.level}
                        </span>
                      )}
                      {typeof skill.proficiency === 'number' && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.proficiency}%
                        </span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Other Skills */}
          {skillCategories.other.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-3">
                {skillCategories.other.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-tag"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200 text-gray-700 border shadow"
                      style={{ borderRadius: '0.5rem' }}
                    >
                      {getSkillIcon(skill.name)}
                      <span className="font-medium">{skill.name}</span>
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.level}
                        </span>
                      )}
                      {typeof skill.proficiency === 'number' && (
                        <span className="ml-1 text-xs opacity-80">
                          {skill.proficiency}%
                        </span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-blue-50 to-white relative">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-100 to-pink-50 rounded-full opacity-50 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100 to-cyan-50 rounded-full opacity-40 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 20, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
        />
        
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            What I Offer
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional services tailored to meet your creative and technical needs.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {sortedServices.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No services listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="service-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-gray-100">
                    {/* Service Header */}
                    <div className="relative h-32 overflow-hidden">
                      {/* Gradient background as default */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${
                            index % 3 === 0 ? '#f472b6, #ec4899' : 
                            index % 3 === 1 ? '#a78bfa, #8b5cf6' : 
                            '#60a5fa, #3b82f6'
                          })`,
                        }}
                      />
                      
                      {/* Category Badge */}
                      {service.category && (
                        <div className="absolute top-3 right-3 z-20">
                          <Badge className="bg-white/80 backdrop-blur-sm font-medium text-xs">
                            {service.category}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Title */}
                      <div className="absolute bottom-0 left-0 p-4 w-full z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md">
                          <h3 className="font-bold text-gray-800 line-clamp-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Content */}
                    <div className="p-4">
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                        {service.description || 'Professional service offered by ' + userInfo.name}
                      </p>
                      
                      {/* Features */}
                      {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                        <div className="mb-4">
                          <ul className="space-y-1">
                            {service.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div 
                        className="text-center font-bold py-2 mb-4 rounded-xl"
                        style={{
                          background: index % 3 === 0 ? '#fce7f3' : 
                                      index % 3 === 1 ? '#ede9fe' : 
                                      '#dbeafe',
                          color: index % 3 === 0 ? '#be185d' : 
                                 index % 3 === 1 ? '#6d28d9' : 
                                 '#1e40af',
                          fontFamily: 'Poppins, sans-serif',
                          borderRadius: '0.75rem'
                        }}
                      >
                        {service.price && (
                          <>{service.price} {service.isHourly ? '/hr' : ''}</>
                        )}
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
              ))}
            </div>
          )}
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
          }}
        />
        
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            My Creative Showcase
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A collection of my latest projects and creative works.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {sortedProjects.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No projects to showcase yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => handleProjectClick(project)}
                >
                  <div 
                    className="bg-white rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300 h-full border border-gray-100 relative"
                    style={{ aspectRatio: '1/1' }}
                  >
                    {/* Project image */}
                    <div className="h-full w-full relative overflow-hidden">
                      {/* Gradient background as fallback */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-purple-50"
                      />
                      
                      {/* Actual project image */}
                      {project.thumbnailUrl && (
                        <img
                          src={project.thumbnailUrl.startsWith('http') ? project.thumbnailUrl : `${window.location.origin}${project.thumbnailUrl}`}
                          alt={project.title || 'Project thumbnail'}
                          className="h-full w-full object-cover project-image"
                          onError={(e) => {
                            console.log('Error loading project image, hiding element');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Gradient overlay for text */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Project info */}
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h3 className="font-bold text-white text-lg mb-1 line-clamp-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                          {project.title}
                        </h3>
                        
                        {project.startDate && (
                          <div className="flex items-center text-white/80 text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(project.startDate, true)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Work Experience Timeline */}
      {sortedExperiences.length > 0 && (
        <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-rose-50 to-white relative">
          {/* Decorative elements */}
          <motion.div 
            className="absolute top-20 right-20 w-60 h-60 bg-gradient-to-br from-pink-100 to-rose-50 rounded-full opacity-40 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              My Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional experiences that have shaped my career.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Timeline */}
            <div className="border-l-2 border-rose-200 ml-4 md:ml-6 pl-8 md:pl-12 space-y-10">
              {sortedExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  className="milestone-node"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    className="absolute left-[-43px] w-6 h-6 flex items-center justify-center rounded-full border-2"
                    style={{ 
                      borderColor: '#f43f5e',
                      backgroundColor: index === 0 ? '#f43f5e' : 'white', 
                      top: '24px'
                    }}
                  >
                    {index === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                        {exp.title || 'Professional Role'}
                      </h3>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(exp.startDate, true)} - {formatDate(exp.endDate, true)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2 text-rose-600 font-medium">
                      {exp.company || exp.domain}
                      {exp.location && (
                        <span className="text-gray-500 ml-2 text-sm">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-600 text-sm mt-2">
                        {exp.description}
                      </p>
                    )}
                    
                    {/* Domain/industry tags */}
                    {(exp.domain || exp.industry) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exp.domain && (
                          <Badge className="bg-rose-100 text-rose-700 text-xs font-normal">
                            {exp.domain}
                          </Badge>
                        )}
                        
                        {exp.industry && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs font-normal">
                            {exp.industry}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Key responsibilities */}
                    {exp.keyResponsibilities && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Key Responsibilities:</span>
                        <p className="text-gray-600 text-sm">
                          {exp.keyResponsibilities}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Education Section */}
      {sortedEducations.length > 0 && (
        <section className="py-16 px-6 md:px-10 relative">
          {/* Decorative elements */}
          <motion.div 
            className="absolute bottom-20 left-20 w-60 h-60 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full opacity-30 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, 10, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
          />
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Education & Certifications
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Academic achievements and professional certifications.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="space-y-6">
              {sortedEducations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-md border-gray-100 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* Left date panel */}
                        <div 
                          className="md:col-span-2 p-4 flex flex-col items-center justify-center"
                          style={{
                            background: 'linear-gradient(to bottom right, #e0f2fe, #dbeafe)',
                            color: '#1e40af'
                          }}
                        >
                          <span className="text-sm font-semibold">
                            {formatDate(edu.startDate, false)}
                          </span>
                          {edu.endDate && (
                            <span className="text-xs">
                              - {formatDate(edu.endDate, false)}
                            </span>
                          )}
                        </div>
                        
                        {/* Main content */}
                        <div className="md:col-span-10 p-4">
                          <div className="mb-1 flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                              {edu.degree}
                            </h3>
                            
                            {edu.location && (
                              <span className="text-sm text-gray-500 flex items-center ml-2 shrink-0">
                                <MapPin className="h-3 w-3 mr-1" />
                                {edu.location}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-blue-600 font-medium">
                            {edu.institution}
                          </p>
                          
                          {edu.fieldOfStudy && (
                            <p className="text-gray-600 text-sm mt-1">
                              Field: {edu.fieldOfStudy}
                            </p>
                          )}
                          
                          {/* Domain/industry tags */}
                          {(edu.domain || edu.industry) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {edu.domain && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs font-normal">
                                  {edu.domain}
                                </Badge>
                              )}
                              
                              {edu.industry && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs font-normal">
                                  {edu.industry}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Contact section */}
      <section className="py-16 px-6 md:px-10 bg-gradient-to-b from-blue-50 via-white to-blue-50 relative">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-50 rounded-full opacity-50 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        
        <motion.div 
          className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-full opacity-40 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Let's Create Something Amazing
            </h2>
            <p className="text-gray-600 mx-auto">
              Have a project in mind? I'd love to hear about it.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact methods */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Contact Me</h3>
              
              <div className="space-y-4">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`}
                    className="flex items-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{userInfo.email}</p>
                    </div>
                  </a>
                )}
                
                {/* Mock social links - replace with actual social links when available */}
                <a 
                  href="#linkedin"
                  className="flex items-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLetsTalkClick();
                  }}
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Linkedin className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LinkedIn</p>
                    <p className="font-medium text-gray-800">Connect with me</p>
                  </div>
                </a>
                
                <a 
                  href="#instagram"
                  className="flex items-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLetsTalkClick();
                  }}
                >
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center mr-4">
                    <Instagram className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <p className="font-medium text-gray-800">Follow my work</p>
                  </div>
                </a>
              </div>
            </motion.div>
            
            {/* Quick contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              
              <h3 className="text-xl font-bold mb-4 relative z-10" style={{ fontFamily: 'Fredoka, sans-serif' }}>Quick Message</h3>
              
              <div className="space-y-4 relative z-10">
                <p className="text-white/90 mb-4">
                  Need a quick response? Send me a message and I'll get back to you as soon as possible.
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={handleLetsTalkClick}
                    className="w-full bg-white hover:bg-white/90 text-purple-600 font-bold py-6"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Start a Conversation
                  </Button>
                </motion.div>
                
                <p className="text-center text-white/70 text-sm mt-4">
                  Usually responds within 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-gray-700" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {userInfo.name} • {userInfo.title || 'Creative Professional'}
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} • All rights reserved
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <a 
                href="#top" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Render modals */}
      {renderProjectDetailsModal()}
      {renderContactModal()}
    </div>
  );
}