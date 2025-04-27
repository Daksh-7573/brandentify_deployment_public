import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
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
  Gift,
  Lightbulb,
  Search,
  MessageSquare,
  Volume2, 
  VolumeX, 
  Globe,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// TypeScript Types
interface TimelineStoryteller2Props {
  userInfo: {
    id?: number;
    name: string;
    email: string;
    title: string;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
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

export default function TimelineStoryteller2({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: TimelineStoryteller2Props) {
  // Refs for scrolling to different sections
  const chapterRefs = {
    hero: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    career: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null)
  };

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProjectImageIndex, setActiveProjectImageIndex] = useState(0);

  // Contact form state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
    purpose: 'collaboration'
  });
  const [isMuted, setIsMuted] = useState(true);

  // Scroll to a section
  const scrollToSection = (section: keyof typeof chapterRefs) => {
    chapterRefs[section]?.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Determine if the viewer is at a chapter during scrolling
  const [activeChapter, setActiveChapter] = useState<keyof typeof chapterRefs>('hero');
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for better UX
      
      // Find which section is currently in view
      let currentSection: keyof typeof chapterRefs = 'hero';
      
      Object.entries(chapterRefs).forEach(([key, ref]) => {
        if (ref.current && ref.current.offsetTop <= scrollPosition) {
          currentSection = key as keyof typeof chapterRefs;
        }
      });
      
      setActiveChapter(currentSection);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Sort user data for display
  // Sort skills by proficiency (highest first)
  const sortedSkills = [...userSkills].sort((a, b) => 
    (b.proficiency || 0) - (a.proficiency || 0)
  );
  
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
  const sortedServices = [...userServices];
  
  // Helper for formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the message
    console.log("Contact form submitted:", contactForm);
    
    // Reset form and close modal
    setContactForm({
      name: '',
      email: '',
      message: '',
      purpose: 'collaboration'
    });
    setIsContactModalOpen(false);
  };

  return (
    <div className="timeline-storyteller-2 relative bg-gray-50 pb-20">
      
      {/* Animated Dot Navigator (side navigation) */}
      <div className="fixed right-5 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col space-y-4 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg">
          {Object.keys(chapterRefs).map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section as keyof typeof chapterRefs)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeChapter === section 
                  ? 'bg-indigo-600 scale-125 shadow-md shadow-indigo-200' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Scroll to ${section} section`}
              title={section.charAt(0).toUpperCase() + section.slice(1)}
            />
          ))}
        </div>
      </div>

      {/* Sound toggle button */}
      <button 
        className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
        onClick={() => setIsMuted(!isMuted)}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-gray-700" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Hero Section with profile info */}
      <section 
        id="chapter-hero" 
        ref={chapterRefs.hero} 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 md:px-6 py-24"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,rgba(99,102,241,0)_50%)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(192,132,252,0.1)_0deg,rgba(192,132,252,0)_60deg,rgba(192,132,252,0)_300deg,rgba(192,132,252,0.1)_360deg)]"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center">
          {/* Profile photo with floating animation */}
          <div className="animate-float mb-8 inline-block relative">
            {/* Glow effect behind profile picture */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-25 animate-pulse scale-110 -z-10"></div>
            <div className="relative z-10">
              <ProfileImage
                src={userInfo.photoURL || ""}
                alt={userInfo.name}
                fallback={userInfo.name.charAt(0).toUpperCase()}
                className="w-36 h-36 border-4 border-white rounded-full shadow-lg"
              />
            </div>
          </div>
          
          {/* Looking For badge */}
          {userInfo.lookingFor && (
            <div className="mb-5 animate-fade-in">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none shadow-sm text-sm py-1.5 px-4">
                {userInfo.lookingFor}
              </Badge>
            </div>
          )}
          
          {/* Name and title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight animate-fade-in delay-100">
            {userInfo.name}
          </h1>
          
          <h2 className="text-xl text-indigo-700 mb-3 font-medium animate-fade-in delay-200">
            {userInfo.title}
          </h2>
          
          {/* Location, Industry and Domain */}
          <div className="flex flex-wrap items-center justify-center text-sm text-gray-600 mb-6 animate-fade-in delay-300 gap-2">
            {userInfo.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{userInfo.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {userInfo.industry && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {userInfo.industry}
                </Badge>
              )}
              
              {userInfo.domain && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {userInfo.domain}
                </Badge>
              )}
            </div>
          </div>
          
          {/* About Me */}
          {userInfo.aboutMe && (
            <div className="max-w-2xl mx-auto mb-4 animate-fade-in delay-400">
              <h3 className="text-md font-medium text-indigo-700 mb-2">About Me</h3>
              <p className="text-gray-600 text-lg">
                {userInfo.aboutMe}
              </p>
            </div>
          )}
          
          {/* What I Offer / What I'm All About */}
          {userInfo.whatIOffer && (
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in delay-450">
              <h3 className="text-md font-medium text-indigo-700 mb-2">What I'm All About</h3>
              <p className="text-gray-600 text-lg">
                {userInfo.whatIOffer}
              </p>
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              onClick={() => setIsContactModalOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Let's Talk
            </Button>
            
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2">
              <Download className="h-4 w-4" />
              Grab My Resume
            </Button>
            
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2">
              <User className="h-4 w-4" />
              Mentor
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-indigo-400" />
        </div>
      </section>

      {/* Skills Section */}
      <section 
        id="chapter-skills" 
        ref={chapterRefs.skills}
        className="py-24 px-4 md:px-6 bg-white min-h-[90vh] relative overflow-hidden"
      >
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="mb-12">
            <div className="inline-block bg-pink-100 px-3 py-1 rounded-full text-pink-800 text-sm font-medium mb-3 animate-fade-in">
              What I'm Good At
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Skills & Expertise</h2>
          </div>
          
          {/* Skills carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {sortedSkills.length > 0 ? (
              sortedSkills.map((skill) => (
                <div 
                  key={skill.id} 
                  className="card-animated bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 hover:shadow-lg hover:translate-y-[-2px] transition-all"
                >
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
                          <span className="font-medium">Proficiency Level:</span> {skill.level || 'Advanced'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Proficiency progress indicator */}
                    <div className="relative mt-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" 
                          style={{ width: `${skill.proficiency || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right mt-1">
                        {skill.proficiency || 0}%
                      </div>
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
                <p className="text-gray-500">Your skills will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section - only shown if services exist */}
      {userServices && userServices.length > 0 && (
        <section 
          id="chapter-services" 
          ref={chapterRefs.services}
          className="py-24 px-4 md:px-6 bg-gradient-to-b from-white to-blue-50 min-h-[90vh] relative"
        >
          <div className="mx-auto max-w-4xl relative z-10">
            <div className="mb-12">
              <div className="inline-block bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-medium mb-3 animate-fade-in">
                What I Offer
              </div>
              <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Services</h2>
            </div>
            
            {/* Services grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {sortedServices.map((service) => (
                <div 
                  key={service.id} 
                  className="card-animated bg-white rounded-lg shadow-md overflow-hidden border border-blue-100 hover:shadow-lg hover:translate-y-[-2px] transition-all"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                    
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700">
                        {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                      </Badge>
                      
                      {service.isHourly && (
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          Hourly Rate
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    {/* Price information */}
                    <div className="bg-blue-50 rounded-md p-3 mb-4 border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Price</h4>
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">INR:</span> ₹{service.priceInr || 0}
                        </div>
                        <div>
                          <span className="font-medium">USD:</span> ${service.priceUsd || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {service.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Showcase */}
      <section 
        id="chapter-projects" 
        ref={chapterRefs.projects}
        className="py-24 px-4 md:px-6 bg-gradient-to-b from-blue-50 to-purple-50 min-h-[90vh]"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-purple-100 px-3 py-1 rounded-full text-purple-800 text-sm font-medium mb-3 animate-fade-in">
              My Projects
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Project Showcase</h2>
          </div>
          
          {/* Project Gallery - 3 projects per row, square thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            {sortedProjects.length > 0 ? (
              sortedProjects.map((project) => (
                <div 
                  key={project.id}
                  className="card-animated bg-white rounded-lg shadow-md overflow-hidden border border-purple-100 cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => {
                    setSelectedProject(project);
                    setIsProjectModalOpen(true);
                  }}
                >
                  {/* Project thumbnail - square aspect ratio */}
                  <div className="relative aspect-square w-full overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Timeline indicator */}
                    <div className="absolute bottom-3 left-3 bg-white rounded-full py-1 px-2 shadow-md text-xs font-medium text-purple-700 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(project.startDate)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{project.title}</h3>
                    
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{project.description}</p>
                    
                    {/* Project category */}
                    <div className="flex flex-wrap gap-2">
                      {project.category && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          {project.category}
                        </Badge>
                      )}
                        
                      {project.industry && (
                        <Badge variant="outline" className="border-purple-200 text-purple-600 text-xs">
                          {project.industry}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          setSelectedProject(project);
                          setIsProjectModalOpen(true);
                        }}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                    
                    {/* Project URL if available */}
                    {project.projectUrl && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <a 
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline text-sm flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Project <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-gray-500">Your projects will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Career Journey */}
      <section 
        id="chapter-career" 
        ref={chapterRefs.career}
        className="py-24 px-4 md:px-6 bg-gradient-to-b from-purple-50 to-indigo-50 min-h-[90vh]"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              My Professional Journey
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Career Path</h2>
          </div>
          
          {/* Experience timeline */}
          <div className="relative mt-12 animate-fade-in">
            {/* Timeline vertical line */}
            <div className="timeline-vertical-line absolute top-0 bottom-0 h-full"></div>
            
            {/* Work experiences */}
            <div className="relative z-10">
              {sortedExperiences.length > 0 ? (
                <div className="space-y-16">
                  {sortedExperiences.map((experience, index) => (
                    <div key={experience.id} 
                      className={`timeline-entry flex items-start ${index === 0 ? 'active' : ''}`}
                      onClick={() => {
                        // Expand this entry when clicked
                        const entries = document.querySelectorAll('.timeline-entry');
                        entries.forEach(e => e.classList.remove('active'));
                        document.getElementById(`exp-${experience.id}`)?.classList.add('active');
                      }}
                      id={`exp-${experience.id}`}
                    >
                      {/* Timeline node */}
                      <div className="mr-6 relative">
                        <div className="timeline-node w-5 h-5 rounded-full bg-indigo-600 border-4 border-indigo-100 mt-1"></div>
                        <div className="timeline-date absolute top-0 left-0 transform -translate-x-full -translate-y-1/2 bg-indigo-600 text-white text-sm py-1 px-3 rounded-full -ml-2">
                          <span>{formatDate(experience.startDate)}</span>
                        </div>
                      </div>
                      
                      {/* Experience card */}
                      <div className="card-animated bg-white rounded-lg shadow-md p-6 border border-indigo-100 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">{experience.title}</h3>
                          <Badge className="bg-indigo-100 text-indigo-700 font-normal">
                            {experience.company}
                          </Badge>
                        </div>
                        
                        {/* Location if available */}
                        {experience.location && (
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                            <span>{experience.location}</span>
                          </div>
                        )}
                        
                        {/* Industry and Domain */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {experience.industry && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {experience.industry}
                            </Badge>
                          )}
                          
                          {experience.domain && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {experience.domain}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Date range */}
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                          <span>
                            {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                          </span>
                        </div>
                        
                        {/* Description if available */}
                        {experience.description && (
                          <p className="text-gray-600 mb-4 text-sm">
                            {experience.description}
                          </p>
                        )}
                        
                        {/* Key responsibilities */}
                        {experience.keyResponsibilities && 
                         Array.isArray(experience.keyResponsibilities) && 
                         experience.keyResponsibilities.length > 0 && (
                          <div className="bg-indigo-50 rounded-md p-3 border border-indigo-100">
                            <h4 className="text-sm font-medium text-indigo-800 mb-2">Key Responsibilities</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                              {experience.keyResponsibilities.map((responsibility, idx) => (
                                <li key={idx}>{responsibility}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-indigo-400" />
                  </div>
                  <p className="text-gray-500">Your work experience will appear here</p>
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
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-indigo-50 to-pink-50 min-h-[90vh]"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-pink-100 px-3 py-1 rounded-full text-pink-800 text-sm font-medium mb-3 animate-fade-in">
              My Learning Path
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Academic Background</h2>
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
                      <div className="mr-6 relative">
                        <div className="timeline-node w-5 h-5 rounded-full bg-pink-600 border-4 border-pink-100 mt-1"></div>
                        <div className="timeline-date absolute top-0 left-0 transform -translate-x-full -translate-y-1/2 bg-pink-600 text-white text-sm py-1 px-3 rounded-full -ml-2">
                          <span>{formatDate(edu.startDate)}</span>
                        </div>
                      </div>
                      
                      {/* Education card */}
                      <div className="card-animated bg-white rounded-lg shadow-md p-6 border border-pink-100 flex-grow">
                        {/* Title and Institution */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-medium text-gray-800">{edu.degree}</h3>
                          {edu.institution && (
                            <Badge className="bg-pink-100 text-pink-700 font-normal">
                              {edu.institution}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Location, Industry, Domain, Field of Study */}
                        <div className="flex flex-col gap-2 mb-4">
                          {/* Location */}
                          {edu.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                          
                          {/* Industry and Domain Badges */}
                          <div className="flex flex-wrap gap-2">
                            {edu.industry && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {edu.industry}
                              </Badge>
                            )}
                            
                            {edu.domain && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {edu.domain}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Field of Study */}
                          {edu.fieldOfStudy && (
                            <div className="flex items-center text-sm text-gray-600">
                              <BookOpen className="h-4 w-4 mr-2 text-pink-500" />
                              <span>Field: {edu.fieldOfStudy}</span>
                            </div>
                          )}
                          
                          {/* Date Range */}
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                            <span>{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</span>
                          </div>
                        </div>
                        
                        {/* Skills Acquired */}
                        {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                          <div className="bg-pink-50 rounded-md p-3 border border-pink-100 mb-3">
                            <h4 className="text-sm font-medium text-pink-800 mb-2">Skills Acquired</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                              {edu.skillsAcquired.map((skill, idx) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Academic Achievements */}
                        <div className="bg-pink-50 rounded-md p-3 border border-pink-100">
                          <h4 className="text-sm font-medium text-pink-800 mb-2">Academic Achievements</h4>
                          <p className="text-sm text-gray-700">
                            {Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 
                              ? "Successfully completed coursework with distinction"
                              : "Focused on academic excellence and practical application of concepts"}
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
                    <GraduationCap className="h-6 w-6 text-pink-400" />
                  </div>
                  <p className="text-gray-500">Your education history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">{userInfo.name}</h3>
              <p className="text-gray-400">{userInfo.title}</p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => scrollToSection('hero')}
              >
                Back to Top
              </Button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
            <p>&copy; {new Date().getFullYear()} {userInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Project details modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0 && (
            <div className="mt-4">
              {/* Main image */}
              <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden mb-2">
                <img 
                  src={selectedProject.mediaUrls[activeProjectImageIndex]} 
                  alt={`${selectedProject.title} - Image ${activeProjectImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Thumbnails */}
              {selectedProject.mediaUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {selectedProject.mediaUrls.map((url, index) => (
                    <button 
                      key={index}
                      className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                        index === activeProjectImageIndex ? 'border-indigo-600' : 'border-transparent'
                      }`}
                      onClick={() => setActiveProjectImageIndex(index)}
                    >
                      <img 
                        src={url} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Category</h4>
              <p>{selectedProject?.category || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Industry</h4>
              <p>{selectedProject?.industry || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">Date</h4>
              <p>{selectedProject?.startDate ? formatDate(selectedProject.startDate) : 'Not specified'}</p>
            </div>
            
            {selectedProject?.projectUrl && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">Project URL</h4>
                <a 
                  href={selectedProject.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center"
                >
                  Visit Project <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsProjectModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get in Touch</DialogTitle>
            <DialogDescription>
              Fill out this form to send me a message. I'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="modal-contact-name">Your Name</Label>
              <Input 
                id="modal-contact-name" 
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                placeholder="Enter your name" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modal-contact-email">Email Address</Label>
              <Input 
                id="modal-contact-email" 
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                placeholder="Enter your email" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modal-contact-purpose">Purpose</Label>
              <Select 
                value={contactForm.purpose}
                onValueChange={(value) => setContactForm({...contactForm, purpose: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="job">Job Opportunity</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modal-contact-message">Message</Label>
              <Textarea 
                id="modal-contact-message" 
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                placeholder="What would you like to discuss?" 
                rows={4}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContactModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSS for Timeline Animation */}
      <style jsx global>{`
        .timeline-storyteller-2 {
          --story-indigo: #4f46e5;
          --story-purple: #9333ea;
          --story-pink: #ec4899;
          --story-blue: #3b82f6;
          font-family: 'Inter', sans-serif;
        }
        
        .timeline-vertical-line {
          left: 2.5px;
          width: 2px;
          background: linear-gradient(to bottom, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2));
          z-index: 0;
        }
        
        .timeline-node {
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .timeline-entry {
          position: relative;
          transition: all 0.5s ease;
        }
        
        .timeline-entry:hover .timeline-node {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        
        .timeline-date {
          opacity: 0;
          transform: translateX(-10px) translateY(-50%);
          transition: all 0.3s ease;
        }
        
        .timeline-entry:hover .timeline-date,
        .timeline-entry.active .timeline-date {
          opacity: 1;
          transform: translateX(-100%) translateY(-50%);
        }
        
        .card-animated {
          transition: all 0.3s ease;
        }
        
        .timeline-entry:hover .card-animated,
        .timeline-entry.active .card-animated {
          transform: translateX(5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        
        /* Animation Utilities */
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}