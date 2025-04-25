import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Education, Project as ProjectSchema, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, Linkedin, MapPin, Calendar, Download, FileText, ChevronRight,
  Briefcase, GraduationCap, Award, Target, ChartBar, Presentation,
  TrendingUp, Globe, BarChart2, Star, Database, UserCheck, Building,
  ExternalLink, Play, Image, Info, Link, Eye, Tag
} from "lucide-react";

// Extended Project interface with mediaUrls property
interface Project extends Omit<ProjectSchema, 'mediaUrls'> {
  mediaUrls?: string[];
}

interface CorporateExecutiveProps {
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
    aboutMe?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

// Enhanced Education type for the Corporate Executive template
interface EnhancedEducation {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string | null;
  industry: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  skillsAcquired: string[];
}

// Enhanced Service type for the Corporate Executive template
interface EnhancedService {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: "consulting" | "development" | "design" | "marketing" | "writing" | "coaching" | "teaching" | "other" | "advisory";
  createdAt: Date | null;
  updatedAt: Date | null;
  priceInr: number | null;
  priceUsd: number | null;
  isHourly: boolean | null;
  features: string[] | null;
  imageUrl: string | null;
  order: number | null;
  isActive: boolean | null;
  pricing: string;
}

export default function CorporateExecutive({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: CorporateExecutiveProps) {
  const [activeSection, setActiveSection] = useState<string>('about');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  // Function to handle opening project details - sets the selected project ID
  const openProjectDetails = (projectId: number) => {
    setSelectedProjectId(projectId);
  };
  
  // Function to close the project details modal
  const closeProjectDetails = () => {
    setSelectedProjectId(null);
  };
  
  // Find the selected project
  const selectedProject = selectedProjectId 
    ? userProjects.find(project => project.id === selectedProjectId) 
    : null;
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Define mock services for when no services are available
  const mockServices = [
    {
      id: 101,
      userId: 1,
      title: "Strategic Advisory",
      description: "Expert guidance on business strategy, growth initiatives, and market positioning to help your organization achieve its full potential.",
      category: "consulting",
      createdAt: new Date(),
      updatedAt: null,
      priceInr: null,
      priceUsd: null,
      isHourly: false,
      features: [],
      imageUrl: null,
      order: 1,
      isActive: true
    },
    {
      id: 102,
      userId: 1,
      title: "Executive Coaching",
      description: "Personalized coaching for senior leaders and executives focused on leadership development, decision-making, and organizational effectiveness.",
      category: "coaching",
      createdAt: new Date(),
      updatedAt: null,
      priceInr: null,
      priceUsd: null,
      isHourly: false,
      features: [],
      imageUrl: null,
      order: 2,
      isActive: true
    },
    {
      id: 103,
      userId: 1,
      title: "Board Directorship",
      description: "Experienced board member bringing strategic oversight, governance expertise, and industry knowledge to drive corporate success.",
      category: "consulting",
      createdAt: new Date(),
      updatedAt: null,
      priceInr: null,
      priceUsd: null,
      isHourly: false,
      features: [],
      imageUrl: null,
      order: 3,
      isActive: true
    }
  ];
  
  // Create enhanced services with pricing information
  const enhancedServices: EnhancedService[] = (userServices.length > 0 ? userServices : mockServices)
    .map(service => {
      const serviceWithPricing = {
        ...service,
        pricing: service.category === 'coaching' 
          ? 'Starting at $5,000' 
          : service.category === 'consulting' 
            ? 'Custom engagement' 
            : service.category === 'advisory' 
              ? 'Retainer basis'
              : ''
      };
      
      // Force the type to be EnhancedService
      return serviceWithPricing as unknown as EnhancedService;
    });
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort projects by date (most recent first)
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first) and enhance them
  const sortedEducations = [...userEducations].map(edu => {
    // Make sure skillsAcquired is an array of strings
    const skillsAcquired = Array.isArray(edu.skillsAcquired) 
      ? edu.skillsAcquired as string[]
      : [];
      
    // Return with enhanced type
    return {
      ...edu,
      skillsAcquired
    } as EnhancedEducation;
  }).sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  

  
  // Maps skill names to appropriate icons
  const getSkillIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('strateg')) return <Target className="h-5 w-5" />;
    if (nameLower.includes('lead')) return <UserCheck className="h-5 w-5" />;
    if (nameLower.includes('finance') || nameLower.includes('invest')) return <TrendingUp className="h-5 w-5" />;
    if (nameLower.includes('global') || nameLower.includes('international')) return <Globe className="h-5 w-5" />;
    if (nameLower.includes('analy')) return <BarChart2 className="h-5 w-5" />;
    if (nameLower.includes('present') || nameLower.includes('public')) return <Presentation className="h-5 w-5" />;
    if (nameLower.includes('management')) return <Briefcase className="h-5 w-5" />;
    if (nameLower.includes('data')) return <Database className="h-5 w-5" />;
    return <Award className="h-5 w-5" />;
  };
  
  // Initialize animations and styles on component mount
  useEffect(() => {
    // Add premium web fonts - Playfair Display (headings) and Inter (body)
    const playfairLink = document.createElement('link');
    playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap';
    playfairLink.rel = 'stylesheet';
    
    const interLink = document.createElement('link');
    interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    interLink.rel = 'stylesheet';
    
    document.head.appendChild(playfairLink);
    document.head.appendChild(interLink);
    
    // Add CSS for animations and custom styling
    const style = document.createElement('style');
    style.textContent = `
      /* Corporate Executive Template - Enhanced Premium Styling */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes shimmer {
        0% { background-position: -100% 0; }
        100% { background-position: 100% 0; }
      }
      
      .corporate-executive-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      .corporate-executive-template .fade-in-delay-1 {
        animation-delay: 0.2s;
      }
      
      .corporate-executive-template .fade-in-delay-2 {
        animation-delay: 0.4s;
      }
      
      .corporate-executive-template .fade-in-delay-3 {
        animation-delay: 0.6s;
      }
      
      .corporate-executive-template .accent-border {
        position: relative;
      }
      
      .corporate-executive-template .accent-border::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 40px;
        height: 2px;
        background: #6a0dad; /* Modern purple accent color */
      }
      
      .corporate-executive-template .timeline-item {
        position: relative;
        padding-left: 1.5rem;
        padding-bottom: 2rem;
      }
      
      .corporate-executive-template .timeline-item::before {
        content: '';
        position: absolute;
        top: 0.5rem;
        left: 0;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        background: #6a0dad; /* Modern purple accent color */
        z-index: 1;
      }
      
      .corporate-executive-template .timeline-item::after {
        content: '';
        position: absolute;
        top: 1rem;
        bottom: 0;
        left: 0.375rem;
        width: 1px;
        background: #e5e7eb;
      }
      
      .corporate-executive-template .timeline-item:last-child::after {
        display: none;
      }
      
      .corporate-executive-template .skill-tag {
        transition: all 0.3s ease;
        border: 1px solid #e5e7eb;
      }
      
      .corporate-executive-template .skill-tag:hover {
        border-color: #6a0dad;
        background: linear-gradient(120deg, rgba(106, 13, 173, 0.05) 0%, rgba(106, 13, 173, 0.1) 100%);
        box-shadow: 0 2px 10px rgba(106, 13, 173, 0.1);
        transform: translateY(-2px);
      }
      
      .corporate-executive-template .profile-image-frame {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      .corporate-executive-template .profile-image-frame::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid rgba(106, 13, 173, 0.3);
        border-radius: 12px;
        opacity: 0.8;
      }
      
      .corporate-executive-template .nav-item {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .corporate-executive-template .nav-item.active {
        color: #1a202c;
        font-weight: 500;
      }
      
      .corporate-executive-template .nav-item.active::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #6a0dad; /* Modern purple accent color */
      }
      
      .corporate-executive-template .project-card {
        transition: all 0.3s ease;
        border: 1px solid #f3f4f6;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .corporate-executive-template .project-card:hover {
        border-color: #6a0dad;
        box-shadow: 0 4px 20px rgba(106, 13, 173, 0.1);
        transform: translateY(-3px);
      }

      .corporate-executive-template .project-card-img {
        position: relative;
        overflow: hidden;
        height: 180px;
      }

      .corporate-executive-template .project-card-img img {
        transition: transform 0.6s ease;
      }

      .corporate-executive-template .project-card:hover .project-card-img img {
        transform: scale(1.05);
      }
      
      .corporate-executive-template .service-card {
        transition: all 0.3s ease;
        border-radius: 12px;
        border-left: 3px solid transparent;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      }
      
      .corporate-executive-template .service-card:hover {
        border-left-color: #6a0dad;
        background: linear-gradient(to right, rgba(106, 13, 173, 0.03), transparent);
        box-shadow: 0 8px 30px rgba(106, 13, 173, 0.1);
      }

      .corporate-executive-template .service-card-icon {
        background: linear-gradient(135deg, #7b1fa2, #6a0dad);
        color: white;
        border-radius: 12px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(106, 13, 173, 0.2);
      }
      
      .corporate-executive-template .btn-primary {
        background: linear-gradient(135deg, #6a0dad, #9c27b0);
        background-size: 200% 200%;
        animation: gradientShift 4s ease infinite;
        transition: all 0.3s ease;
        color: white;
        font-weight: 500;
        border-radius: 8px;
      }
      
      .corporate-executive-template .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(106, 13, 173, 0.3);
      }
      
      .corporate-executive-template .btn-outline {
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
        border-radius: 8px;
      }
      
      .corporate-executive-template .btn-outline:hover {
        border-color: #6a0dad;
        color: #6a0dad;
        box-shadow: 0 2px 8px rgba(106, 13, 173, 0.1);
      }

      .corporate-executive-template .highlight-badge {
        background: linear-gradient(90deg, rgba(106, 13, 173, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%);
        border: 1px solid rgba(106, 13, 173, 0.2);
        color: #6a0dad;
        font-weight: 500;
      }

      .corporate-executive-template .achievement-card {
        border-radius: 12px;
        background: linear-gradient(135deg, #f9f9f9, #ffffff);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
      }

      .corporate-executive-template .achievement-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        border-color: rgba(106, 13, 173, 0.2);
      }

      .corporate-executive-template .premium-gradient-text {
        background: linear-gradient(90deg, #6a0dad, #9c27b0);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
      }

      .corporate-executive-template .testimonial-card {
        background: linear-gradient(135deg, #ffffff, #f9f9f9);
        border-radius: 12px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
      }

      .corporate-executive-template .testimonial-card:hover {
        box-shadow: 0 8px 40px rgba(106, 13, 173, 0.1);
      }

      .corporate-executive-template .testimonial-quote {
        position: relative;
      }

      .corporate-executive-template .testimonial-quote::before {
        content: """;
        position: absolute;
        top: -20px;
        left: -10px;
        font-size: 80px;
        color: rgba(106, 13, 173, 0.1);
        font-family: "Georgia", serif;
      }
    `;
    
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(playfairLink);
      document.head.removeChild(interLink);
    };
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };
  
  const formatDate = (dateString: string | null, showMonthName = true) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (showMonthName) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    
    return date.getFullYear().toString();
  };
  
  return (
    <div className="corporate-executive-template bg-white">
      {/* Project Details Modal */}
      <Dialog open={!!selectedProjectId} onOpenChange={closeProjectDetails}>
        {selectedProject && (
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedProject.title}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedProject.startDate)}</span>
                  
                  {selectedProject.category && (
                    <>
                      <span className="mx-1">•</span>
                      <Badge variant="outline">{selectedProject.category}</Badge>
                    </>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="md:col-span-2 space-y-4">
                {selectedProject.thumbnailUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={selectedProject.thumbnailUrl} 
                      alt={selectedProject.title} 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                {selectedProject.description && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Overview</h3>
                    <p className="text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {selectedProject.description}
                    </p>
                  </div>
                )}
                
                {/* Project media gallery */}
                {selectedProject && selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedProject.mediaUrls.map((url: string, index: number) => (
                        <div key={index} className="rounded-lg overflow-hidden h-40">
                          <img 
                            src={url} 
                            alt={`${selectedProject.title} - Image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {selectedProject.projectUrl && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>External Link</h3>
                    <a 
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#6a0dad] hover:underline"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <span>Visit Project</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
                
                {/* Additional project information */}
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Project Details</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Date</span>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDate(selectedProject.startDate, true)}
                        </p>
                      </div>
                    </li>
                    
                    {selectedProject.category && (
                      <li className="flex items-start gap-2">
                        <Tag className="h-4 w-4 mt-1 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Category</span>
                          <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {selectedProject.category}
                          </p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      {/* Fixed Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            {/* Logo - Removed name as requested */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Portfolio
              </h3>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('about')}
                className={`nav-item text-sm ${activeSection === 'about' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('skills')}
                className={`nav-item text-sm ${activeSection === 'skills' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Expertise
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className={`nav-item text-sm ${activeSection === 'services' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('projects')}
                className={`nav-item text-sm ${activeSection === 'projects' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Showcase
              </button>
              <button 
                onClick={() => scrollToSection('experience')}
                className={`nav-item text-sm ${activeSection === 'experience' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Career
              </button>
              <button 
                onClick={() => scrollToSection('education')}
                className={`nav-item text-sm ${activeSection === 'education' ? 'active' : 'text-gray-500 hover:text-gray-700'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Education
              </button>
            </nav>
            
            {/* CTA Buttons */}
            <div className="hidden sm:block">
              <PortfolioCtaButtons 
                variant="corporate"
                resumeUrl={null} 
                mentorUrl={null}
                connectUrl={null}
                userEmail={userInfo.email}
                userName={userInfo.name}
                className="flex-row"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section id="about" className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-14">
            {/* Profile Image */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start fade-in">
              <div className="profile-image-frame w-60 h-60 rounded-lg shadow-lg overflow-hidden border-4 border-white">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Intro Content */}
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {userInfo.name}
                </h1>
                
                <h2 className="text-2xl md:text-3xl text-gray-700 mb-8 pl-1 border-l-4 border-[#6a0dad] pl-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  I am a <span className="text-[#6a0dad]">{userInfo.title || "Strategic Growth Advisor"}</span>
                </h2>
              </div>
              
              <div className="flex items-center text-gray-600 mb-8 fade-in fade-in-delay-1">
                <MapPin className="h-5 w-5 mr-2 text-[#6a0dad]" />
                <span className="text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {userInfo.location || "New York, United States"}
                </span>
              </div>
              
              {/* Industry / Domain Badges */}
              <div className="flex flex-wrap gap-4 mb-8 fade-in fade-in-delay-1">
                {userInfo.industry && (
                  <Badge className="bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 shadow-sm border border-gray-200">
                    <Briefcase className="h-4 w-4 mr-2 text-[#6a0dad]" />
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.industry}</span>
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge className="bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 shadow-sm border border-gray-200">
                    <Globe className="h-4 w-4 mr-2 text-[#6a0dad]" />
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.domain}</span>
                  </Badge>
                )}
              </div>
              
              {/* Looking For */}
              {userInfo.lookingFor && (
                <div className="mb-8 fade-in fade-in-delay-2">
                  <Badge className="bg-[#6a0dad]/5 text-[#6a0dad] hover:bg-[#6a0dad]/10 border border-[#6a0dad]/20 font-medium rounded-md px-5 py-2.5">
                    <Target className="h-5 w-5 mr-2" />
                    <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.lookingFor.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </Badge>
                </div>
              )}
              
              {/* Executive Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-8 shadow-sm mb-8 fade-in fade-in-delay-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Info className="h-5 w-5 mr-2 text-[#6a0dad]" />
                  What I'm All About
                </h3>
                <div className="flex">
                  <div className="text-[#6a0dad] mr-3 flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                  </div>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {userInfo.aboutMe || 
                    `I'm passionate about delivering value and achieving results through collaborative work and innovative approaches.`}
                  </p>
                </div>
              </div>
              
              {/* Contact/Connect section removed as requested */}
            </div>
          </div>
        </div>
      </section>
      
      {/* Expertise (Skills) Section */}
      <section id="skills" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            What I'm Good At
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedSkills.length > 0 ? (
              sortedSkills.slice(0, 8).map((skill, index) => (
                <div 
                  key={skill.id} 
                  className="skill-tag bg-white rounded-lg p-5 shadow-sm fade-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-50 rounded-md text-[#6a0dad]">
                      {getSkillIcon(skill.name)}
                    </div>
                    <h3 className="text-gray-900 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {skill.name}
                    </h3>
                  </div>
                  
                  {/* Proficiency Level - Enhanced with percentage progress bar */}
                  <div className="space-y-2">
                    {/* Progress bar with percentage */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6a0dad] to-[#9c27b0]" 
                        style={{ 
                          width: `${skill.proficiency ? skill.proficiency : 0}%`,
                          transition: 'width 1s ease-in-out'
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#6a0dad] font-medium">
                        {skill.proficiency ? `${skill.proficiency}%` : '0%'}
                      </span>
                      <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {skill.level || ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 border border-gray-100 rounded-lg">
                <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your expertise will be showcased here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            What I <span className="premium-gradient-text">Offer</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {enhancedServices.map((service, index) => (
              <div 
                key={service.id} 
                className="service-card bg-white rounded-lg p-6 shadow-sm fade-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="service-card-icon mr-4 flex-shrink-0">
                    {service.category === "consulting" ? (
                      <Briefcase className="h-5 w-5" />
                    ) : service.category === "coaching" ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <Star className="h-5 w-5" />
                    )}
                  </div>
                
                  <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {service.description || "Comprehensive service designed to meet your specific business needs and challenges."}
                </p>
                
                <div className="flex flex-col gap-3">
                  {/* Pricing and Active Status details */}
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    {service.pricing && service.pricing.length > 0 && (
                      <div className="text-sm font-medium text-[#6a0dad] highlight-badge px-3 py-1 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {service.pricing}
                      </div>
                    )}
                    
                    {service.priceUsd && (
                      <div className="text-sm font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ${service.priceUsd}{service.isHourly ? "/hr" : ""}
                      </div>
                    )}
                    
                    {service.priceInr && (
                      <div className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ₹{service.priceInr}{service.isHourly ? "/hr" : ""}
                      </div>
                    )}
                    
                    {service.isActive !== undefined && (
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${service.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </div>
                    )}
                  </div>
                  
                  {/* Inquiry button */}
                  <div className="flex justify-end">
                    <Button 
                      variant="outline"
                      className="text-sm px-4 py-2 rounded-md flex items-center hover:bg-[#f9f0ff]"
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>Inquire</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Showcase (Projects) Section */}
      <section id="projects" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            Showcase
          </h2>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            {sortedProjects.length > 0 ? (
              sortedProjects.slice(0, 6).map((project, index) => (
                <div 
                  key={project.id} 
                  className="project-card bg-white rounded-lg overflow-hidden shadow-sm fade-in flex flex-col"
                  style={{ animationDelay: `${0.1 + index * 0.1}s`, width: '280px', aspectRatio: '2/3.5' }}
                >
                  {/* Project Thumbnail */}
                  {project.thumbnailUrl && (
                    <div className="w-full" style={{ aspectRatio: '1/1', height: '280px' }}>
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {project.title}
                      </h3>
                      
                      {project.category && (
                        <Badge className="bg-gray-100 text-gray-600 text-xs">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {project.description}
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      {/* Date information */}
                      <div className="text-xs text-gray-500 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(project.startDate, true)}
                      </div>
                      
                      {/* Project URL */}
                      {project.projectUrl && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Link className="h-3.5 w-3.5 mr-1 text-[#6a0dad]" />
                            <span className="text-xs text-gray-500 truncate max-w-[150px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {new URL(project.projectUrl).hostname}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => openProjectDetails(project.id)}
                            className="text-[#6a0dad] text-sm flex items-center hover:underline"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <span>View Details</span>
                            <Eye className="h-3.5 w-3.5 ml-1" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 border border-gray-100 rounded-lg">
                <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your showcase projects will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Career Path (Experience) Section */}
      <section id="experience" className="py-20 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 relative pl-6 border-l-4 border-[#6a0dad]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Career Path
          </h2>
          
          <div className="mb-16">
            {sortedExperiences.length > 0 ? (
              <div className="space-y-8">
                {/* Timeline vertical line */}
                <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#6a0dad] to-gray-100 hidden md:block"></div>
                
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id} 
                    className="timeline-item fade-in relative"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 top-10 w-4 h-4 rounded-full bg-[#6a0dad] transform -translate-x-1/2 hidden md:block"></div>
                    
                    <div className="bg-white rounded-lg p-8 shadow-sm ml-0 md:ml-16 border border-gray-100 hover:border-[#6a0dad]/30 transition-colors duration-300">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {exp.title}
                          </h3>
                          <p className="text-[#6a0dad] font-medium text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {exp.company}
                          </p>
                        </div>
                        
                        <div className="text-base text-gray-700 flex items-center whitespace-nowrap bg-gray-50 px-4 py-2 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Calendar className="h-5 w-5 mr-2 text-[#6a0dad]" />
                          <span>
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        {exp.location && (
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <MapPin className="h-4 w-4 mr-1.5 text-[#6a0dad]" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                        
                        {exp.industry && (
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Briefcase className="h-4 w-4 mr-1.5 text-[#6a0dad]" />
                            <span>{exp.industry}</span>
                          </div>
                        )}
                        
                        {exp.domain && (
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Tag className="h-4 w-4 mr-1.5 text-[#6a0dad]" />
                            <span>{exp.domain}</span>
                          </div>
                        )}
                      </div>
                      
                      {exp.description && (
                        <p className="text-gray-700 mb-6 leading-relaxed border-l-2 border-[#6a0dad]/20 pl-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {exp.description}
                        </p>
                      )}
                      
                      {exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-base font-semibold mb-3 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Award className="h-4 w-4 mr-2 text-[#6a0dad]" />
                            Key Responsibilities & Achievements
                          </h4>
                          <ul className="list-none space-y-2 text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {exp.keyResponsibilities.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="text-[#6a0dad] mr-2 mt-1">•</div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-gray-100 rounded-lg bg-white">
                <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your career experience will appear here
                </p>
              </div>
            )}
          </div>
          
          {/* Academic Background */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 relative pl-6 border-l-4 border-[#6a0dad]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Academic Background
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedEducations.length > 0 ? (
              sortedEducations.map((edu, index) => (
                <div 
                  key={edu.id} 
                  className="bg-white rounded-lg p-8 shadow-sm fade-in border border-gray-100 hover:border-[#6a0dad]/30 transition-colors duration-300"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex flex-col justify-between mb-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {edu.degree}
                      </h3>
                      <p className="text-[#6a0dad] font-medium text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {edu.institution}
                      </p>
                    </div>
                    
                    <div className="text-base text-gray-700 flex items-center bg-gray-50 px-4 py-2 rounded-full w-fit" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <Calendar className="h-5 w-5 mr-2 text-[#6a0dad]" />
                      <span>
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {edu.location && (
                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <MapPin className="h-4 w-4 mr-1.5 text-[#6a0dad]" />
                        <span>{edu.location}</span>
                      </div>
                    )}
                    
                    {edu.industry && (
                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Briefcase className="h-4 w-4 mr-1.5 text-[#6a0dad]" />
                        <span>{edu.industry}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Field of Study */}
                  {edu.fieldOfStudy && (
                    <div className="mb-6 bg-[#6a0dad]/5 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-[#6a0dad] mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Field of Study
                          </p>
                          <p className="text-base text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {edu.fieldOfStudy}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Skills Acquired */}
                  {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                    <div>
                      <h4 className="text-base font-semibold mb-3 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Award className="h-4 w-4 mr-2 text-[#6a0dad]" />
                        Skills Acquired & Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(edu.skillsAcquired as string[]).map((skill: string, i: number) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center bg-[#6a0dad]/5 text-[#6a0dad] text-sm px-3 py-1.5 rounded-full border border-[#6a0dad]/10"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 border border-gray-100 rounded-lg bg-white shadow-sm">
                <p className="text-gray-400 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your academic background will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      

      
      {/* Footer CTA */}
      <section className="py-20 px-8 bg-gradient-to-b from-gray-900 to-[#200028] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-gradient-to-r from-[#3a0d50]/50 to-[#6a0dad]/50 p-10 rounded-xl border border-[#6a0dad]/20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Connect?
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Let's discuss how I can bring value to your organization.
                <br />Reach out today to explore potential collaborations.
              </p>
            </div>
            
            <div>
              <PortfolioCtaButtons 
                variant="corporate"
                resumeUrl={null} 
                mentorUrl={null}
                connectUrl={null}
                userEmail={userInfo.email}
                userName={userInfo.name}
                className="sm:justify-end"
              />
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              © {new Date().getFullYear()} {userInfo.name} • All Rights Reserved
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}