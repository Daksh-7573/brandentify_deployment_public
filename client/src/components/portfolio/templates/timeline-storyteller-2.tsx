import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import PortfolioCtaButtons from "@/components/portfolio/portfolio-cta-buttons";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { 
  MapPin, 
  Calendar, 
  Building, 
  GraduationCap, 
  Briefcase, 
  Award, 
  ExternalLink, 
  ChevronDown,
  Search,
  Download,
  MessageCircle,
  Play,
  Pause,
  Eye,
  Globe,
  Mail,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// TypeScript interface for component props
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
  currentUserId?: number;
}

// Main Timeline Storyteller Component
export default function TimelineStoryteller2({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: TimelineStoryteller2Props) {
  
  // State management
  const [scrollY, setScrollY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeTimelineNode, setActiveTimelineNode] = useState<string | null>(null);
  
  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Handle scroll effects for parallax
  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      
      // Activate timeline nodes based on scroll position
      const timelineNodes = document.querySelectorAll('.timeline-node');
      timelineNodes.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
        
        if (isVisible) {
          setActiveTimelineNode(node.getAttribute('data-id') || '');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sort data for timeline
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );

  const sortedSkills = [...userSkills].sort((a, b) => 
    (b.proficiency || 0) - (a.proficiency || 0)
  );

  // Helper function to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };

  // Create timeline data combining all entries
  const timelineData = [
    ...sortedExperiences.map(exp => ({
      id: `exp-${exp.id}`,
      type: 'experience',
      date: exp.startDate,
      title: exp.title,
      subtitle: exp.company,
      description: exp.description,
      location: exp.location,
      industry: exp.industry,
      domain: exp.domain,
      icon: Briefcase,
      data: exp
    })),
    ...sortedEducations.map(edu => ({
      id: `edu-${edu.id}`,
      type: 'education',
      date: edu.startDate,
      title: edu.degree,
      subtitle: edu.institution,
      description: edu.fieldOfStudy,
      location: edu.location,
      industry: edu.industry,
      domain: edu.domain,
      icon: GraduationCap,
      data: edu
    })),
    ...sortedProjects.map(proj => ({
      id: `proj-${proj.id}`,
      type: 'project',
      date: proj.startDate,
      title: proj.title,
      subtitle: proj.category,
      description: proj.description,
      location: null,
      industry: proj.industry,
      domain: null,
      icon: Award,
      data: proj
    }))
  ].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

  // Skill level colors
  const getSkillColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'from-blue-400 to-blue-600';
      case 'intermediate': return 'from-purple-400 to-purple-600';
      case 'advanced': return 'from-pink-400 to-pink-600';
      default: return 'from-indigo-400 to-indigo-600';
    }
  };

  return (
    <div className="timeline-storyteller bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden">
      
      {/* Hero Section - All About Me */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center px-4 md:px-8 py-20"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`
        }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            
            {/* Large Circular Profile Picture - Left Side */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-30 animate-pulse scale-110" />
                <div className="relative hover:scale-105 transition-transform duration-500">
                  <ProfileImage
                    src={userInfo.photoURL || ""}
                    alt={userInfo.name}
                    className="w-48 h-48 lg:w-64 lg:h-64 border-4 border-white rounded-full shadow-2xl object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Profile Information - Right Side */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              
              {/* Looking For Badge */}
              {userInfo.lookingFor && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <Search className="w-4 h-4" />
                  <span className="font-medium">{userInfo.lookingFor}</span>
                </div>
              )}

              {/* Name and Title */}
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                  I am: {userInfo.name}
                </h1>
                <h2 className="text-xl lg:text-2xl text-gray-700 font-medium mb-4">
                  {userInfo.title}
                </h2>
              </div>

              {/* Location, Industry, Domain */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-600">
                {userInfo.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userInfo.location}</span>
                  </div>
                )}
                {userInfo.industry && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {userInfo.domain}
                  </Badge>
                )}
              </div>

              {/* About Me - Parallax Text Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-500 hover:scale-105">
                <h3 className="text-lg font-bold text-gray-800 mb-3">About Me</h3>
                <p className="text-gray-600 leading-relaxed">
                  {userInfo.aboutMe || "Add your professional story and what makes you unique in your field."}
                </p>
              </div>

              {/* CTA Buttons */}
              <PortfolioCtaButtons
                variant="creative"
                userEmail={userInfo.email}
                userName={userInfo.name}
                userId={userInfo.id}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* Interactive Timeline Story Path */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Timeline Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              My Journey Story
            </h2>
            <p className="text-gray-600 text-lg">
              Follow the timeline to explore my professional journey
            </p>
          </div>

          {/* Central Timeline Spine */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 h-full opacity-30" />
            
            {/* Animated Year Markers and Nodes */}
            <div className="space-y-12">
              {timelineData.map((item, index) => (
                <div 
                  key={item.id}
                  className={`timeline-node relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  data-id={item.id}
                >
                  {/* Timeline Node Circle */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div 
                      className={`w-6 h-6 rounded-full transition-all duration-500 ${
                        activeTimelineNode === item.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-150 shadow-lg' 
                          : 'bg-white border-4 border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Year Marker */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
                    <div className="bg-white px-3 py-1 rounded-full shadow-md border text-sm font-medium text-gray-700">
                      {new Date(item.date || '').getFullYear()}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'mr-auto pr-8' : 'ml-auto pl-8'}`}>
                    <Card 
                      className={`transform transition-all duration-500 hover:scale-105 hover:shadow-xl cursor-pointer ${
                        activeTimelineNode === item.id ? 'shadow-xl scale-105' : 'shadow-md'
                      }`}
                      onClick={() => {
                        if (item.type === 'project') {
                          setSelectedProject(item.data as Project);
                          setIsProjectModalOpen(true);
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100">
                            <item.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-gray-600 text-sm font-medium">{item.subtitle}</p>
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                          )}
                          {item.industry && (
                            <Badge variant="outline" className="text-xs">
                              {item.industry}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section - Side Orbit Style */}
      <section 
        ref={skillsRef}
        className="py-20 px-4 md:px-8 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Skills & Expertise
            </h2>
            <p className="text-gray-600">
              Circular progress rings showing my proficiency levels
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sortedSkills.slice(0, 8).map((skill) => (
              <div key={skill.id} className="text-center group">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {/* Background Circle */}
                  <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                  
                  {/* Progress Circle */}
                  <div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r opacity-90 transition-all duration-1000 group-hover:scale-110"
                    style={{
                      background: `conic-gradient(from 0deg, 
                        ${skill.level === 'beginner' ? '#3B82F6' : skill.level === 'intermediate' ? '#8B5CF6' : '#EC4899'} 0deg,
                        ${skill.level === 'beginner' ? '#3B82F6' : skill.level === 'intermediate' ? '#8B5CF6' : '#EC4899'} ${(skill.proficiency || 0) * 3.6}deg,
                        transparent ${(skill.proficiency || 0) * 3.6}deg,
                        transparent 360deg
                      )`
                    }}
                  />
                  
                  {/* Inner Circle with Percentage */}
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-gray-800">
                      {skill.proficiency || 0}%
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">{skill.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{skill.level || 'Advanced'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Colorful Cards */}
      {userServices.length > 0 && (
        <section 
          ref={servicesRef}
          className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Services I Offer
              </h2>
              <p className="text-gray-600">
                Professional services with transparent pricing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="group hover:scale-105 transition-all duration-500 hover:shadow-2xl border-0 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                          {service.category}
                        </Badge>
                      </div>
                      {service.isHourly && (
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Hourly
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>

                    {/* Pricing Toggle */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">INR</div>
                          <div className="text-lg font-bold text-gray-900">₹{service.priceInr || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600">USD</div>
                          <div className="text-lg font-bold text-gray-900">${service.priceUsd || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 text-sm">
                        Hire Me
                      </Button>
                      <Button variant="outline" className="text-sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Call-to-Action Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 p-2">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full px-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            Let's Talk
          </Button>
          <Button variant="outline" className="rounded-full px-6">
            <Download className="w-4 h-4 mr-2" />
            Resume
          </Button>
          <Button variant="outline" className="rounded-full px-6">
            <Users className="w-4 h-4 mr-2" />
            Mentor
          </Button>
        </div>
      </div>

      {/* Project Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedProject.title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedProject.category} • {formatDate(selectedProject.startDate)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedProject.thumbnailUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <img 
                      src={selectedProject.thumbnailUrl} 
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedProject.description || 'No description available'}
                  </p>
                </div>
                
                {selectedProject.projectUrl && (
                  <div className="flex gap-2">
                    <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Project
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .timeline-node {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .timeline-node:nth-child(odd) {
          animation-delay: 0.1s;
        }
        
        .timeline-node:nth-child(even) {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}