import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Download,
  FileText,
  Star,
  GraduationCap,
  MessageSquare,
  Globe,
  BookOpen,
  Award,
  Tag,
  Code,
  Building,
  Wrench as Tool,
  UserPlus,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Send,
  BookOpen as Book,
  School,
  Layers,
  Lightbulb,
  X,
  Sparkles,
  Target,
  Heart,
  Users
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useTypewriter } from "@/hooks/use-typewriter";
import PortfolioCtaButtons from "../portfolio-cta-buttons";

interface ScholarProps {
    userInfo: {
    id?: number;
    name: string;
    title: string | null;
    company: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills: {
    id: number;
    name: string;
    level: string;
    proficiency: number;
  }[];
  userServices: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    rate?: string | null;
    priceUsd?: string | null;
    priceInr?: string | null;
    isHourly?: boolean;
    isActive?: boolean;
  }[];
  userExperiences: {
    id: number;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    description: string;
    industry: string;
    domain: string;
    keyResponsibilities?: string[] | null;
  }[];
  userEducations: {
    id: number;
    degree: string;
    institution: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    description?: string | null;
    achievements?: string | null;
    industry?: string | null;
    domain?: string | null;
    fieldOfStudy?: string | null;
    skillsAcquired?: string[] | null;
  }[];
  userProjects: {
    id: number;
    title: string;
    description: string | null;
    startDate: string;
    projectUrl?: string | null;
    category?: string | null;
    industry?: string | null;
    thumbnailUrl?: string | null;
    mediaUrls?: string[];
    clientEndorsement?: string | null;
  }[];
}

export default function Scholar({
  userInfo,
  userSkills,
  userServices,
  userExperiences,
  userEducations,
  userProjects
}: ScholarProps) {
  // State for project modal
  const [selectedProject, setSelectedProject] = useState<(typeof userProjects)[0] | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [displayedImageUrl, setDisplayedImageUrl] = useState<string | null>(null);
  
  // Fetch team members when project modal opens
  useEffect(() => {
    if (isProjectModalOpen && selectedProject?.id) {
      fetch(`/api/projects/${selectedProject.id}/collaborators`)
        .then(res => res.json())
        .then(data => setTeamMembers(Array.isArray(data) ? data : []))
        .catch(err => {
          console.log('Could not fetch team members:', err);
          setTeamMembers([]);
        });
    }
  }, [isProjectModalOpen, selectedProject?.id]);
  
  // Open project modal with selected project
  const openProjectModal = (project: (typeof userProjects)[0]) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };
  
  // Add notebook-style background and effects on component mount
  useEffect(() => {
    // Add premium web fonts - Lora (serif, headers) and Nunito Sans (body)
    const loraFont = document.createElement('link');
    loraFont.href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap';
    loraFont.rel = 'stylesheet';
    
    const nunitoFont = document.createElement('link');
    nunitoFont.href = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700&display=swap';
    nunitoFont.rel = 'stylesheet';
    
    document.head.appendChild(loraFont);
    document.head.appendChild(nunitoFont);
    
    // Add CSS for notebook-style theme and animations
    const style = document.createElement('style');
    style.textContent = `
      /* Scholar Template - Academic Notebook Theme */
      .scholar-template {
        --notebook-blue: #4A69BD;
        --notebook-light-blue: #D6E4FF;
        --notebook-navy: #1E3A8A;
        --notebook-red: #E55039;
        --notebook-green: #009432;
        --notebook-yellow: #FFC312;
        --notebook-purple: #5F27CD;
        --pastel-blue: #D6E4FF;
        --pastel-green: #DCFFE4;
        --pastel-yellow: #FFF5C3;
        --pastel-red: #FFE2DD;
        --pastel-purple: #F0E7FF;
        font-family: 'Nunito Sans', sans-serif;
      }

      .scholar-template h1, 
      .scholar-template h2, 
      .scholar-template h3, 
      .scholar-template h4 {
        font-family: 'Lora', serif;
      }
      
      .scholar-template .notebook-card {
        background-color: white;
        background-image: 
          linear-gradient(#F1F5F9 1px, transparent 1px),
          linear-gradient(90deg, #F1F5F9 1px, transparent 1px);
        background-size: 20px 20px;
        background-position: -1px -1px;
        border-left: 2px solid var(--notebook-navy);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03);
      }
      
      .scholar-template .notebook-paper {
        background-color: white;
        background-image: linear-gradient(#F1F5F9 1px, transparent 1px);
        background-size: 100% 20px;
        background-position: 0 -1px;
        padding: 20px;
        border-radius: 8px;
        border-left: 3px solid var(--notebook-blue);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      }
      
      .scholar-template .graph-paper {
        background-color: white;
        background-image: 
          linear-gradient(rgba(74, 105, 189, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74, 105, 189, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        border-radius: 8px;
        border: 1px solid rgba(74, 105, 189, 0.2);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      }
      
      .scholar-template .skill-badge {
        border-radius: 16px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .scholar-template .skill-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .scholar-template .timeline-entry {
        position: relative;
        padding-left: 30px;
        padding-bottom: 24px;
        border-left: 2px dashed #D1D5DB;
      }
      
      .scholar-template .timeline-entry:last-child {
        border-left: 2px dashed transparent;
      }
      
      .scholar-template .timeline-entry::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: var(--notebook-blue);
      }
      
      .scholar-template .project-card {
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .scholar-template .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }
      
      .scholar-template .project-card img {
        transition: all 0.5s ease;
      }
      
      .scholar-template .project-card:hover img {
        transform: scale(1.05);
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
      
      .scholar-template .fade-in-up {
        animation: fadeInUp 0.8s ease forwards;
        opacity: 0;
      }
      
      .scholar-template .delay-100 {
        animation-delay: 0.1s;
      }
      
      .scholar-template .delay-200 {
        animation-delay: 0.2s;
      }
      
      .scholar-template .delay-300 {
        animation-delay: 0.3s;
      }
      
      .scholar-template .delay-400 {
        animation-delay: 0.4s;
      }
      
      .scholar-template .progress-bar {
        height: 8px;
        border-radius: 4px;
        background-color: #E2E8F0;
        overflow: hidden;
      }
      
      .scholar-template .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--notebook-blue), var(--notebook-purple));
        border-radius: 4px;
        transition: width 1s ease;
      }
      
      .scholar-template .tag-badge {
        border-radius: 12px;
        padding: 3px 10px;
        font-size: 0.8rem;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }
      
      .scholar-template .tag-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    `;
    
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(loraFont);
      document.head.removeChild(nunitoFont);
    };
  }, []);
  // Set up animated typewriter text based on user info
  const phrases = [
    userInfo && userInfo.title ? userInfo.title : "Student & Lifelong Learner",
    userInfo && userInfo.industry ? `Specializing in ${userInfo.industry}` : "Knowledge Seeker",
    userInfo && userInfo.domain ? `Focused on ${userInfo.domain}` : "Passionate about Learning",
    userInfo && userInfo.lookingFor ? `Looking for ${userInfo.lookingFor}` : "Open to Opportunities"
  ];

  const [text] = useTypewriter({
    words: phrases,
    loop: 0,
    typeSpeed: 80,
    deleteSpeed: 50,
    delayBetween: 2000
  });

  // Function to choose a color for skills based on skill name
  const getSkillColor = (name: string) => {
    const nameToLower = name.toLowerCase();
    
    if (nameToLower.includes('communication') || nameToLower.includes('speaking')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (nameToLower.includes('leadership') || nameToLower.includes('management')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (nameToLower.includes('teamwork') || nameToLower.includes('collaboration')) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (nameToLower.includes('problem') || nameToLower.includes('analytical')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    } else if (nameToLower.includes('creative') || nameToLower.includes('design')) {
      return 'bg-pink-50 text-pink-700 border-pink-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to get icon for project categories
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('research') || categoryLower.includes('academic')) {
      return <BookOpen className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('web') || categoryLower.includes('software')) {
      return <Code className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('volunteer') || categoryLower.includes('community')) {
      return <Globe className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('design') || categoryLower.includes('creative')) {
      return <Briefcase className="h-3.5 w-3.5" />;
    } else {
      return <FileText className="h-3.5 w-3.5" />;
    }
  };

  // Group skills by category with safety checks - simplified to show all skills
  const safeSkills = userSkills || [];
  
  // Separate technical and tools skills logically, but randomize soft/other skills distribution
  const technicalSkills = safeSkills.filter(skill => 
    skill && skill.name && (
      skill.name.toLowerCase().includes('programming') || 
      skill.name.toLowerCase().includes('technical') ||
      skill.name.toLowerCase().includes('coding') ||
      skill.name.toLowerCase().includes('development') ||
      skill.name.toLowerCase().includes('javascript') ||
      skill.name.toLowerCase().includes('python') ||
      skill.name.toLowerCase().includes('java') ||
      skill.name.toLowerCase().includes('react') ||
      skill.name.toLowerCase().includes('node') ||
      skill.name.toLowerCase().includes('sql') ||
      skill.name.toLowerCase().includes('html') ||
      skill.name.toLowerCase().includes('css')
    )
  );
  
  const toolsSkills = safeSkills.filter(skill => 
    skill && skill.name && (
      skill.name.toLowerCase().includes('tool') || 
      skill.name.toLowerCase().includes('software') ||
      skill.name.toLowerCase().includes('platform') ||
      skill.name.toLowerCase().includes('adobe') ||
      skill.name.toLowerCase().includes('figma') ||
      skill.name.toLowerCase().includes('sketch')
    )
  );
  
  // Get remaining skills (non-technical and non-tools) - combine as one stable list
  const remainingSkills = safeSkills.filter(skill => 
    skill && skill.name && 
    !technicalSkills.includes(skill) && 
    !toolsSkills.includes(skill)
  );
  
  // Sort remaining skills alphabetically for stable ordering
  const sortedRemaining = [...remainingSkills].sort((a, b) => a.name.localeCompare(b.name));
  
  const skillCategories = {
    technical: technicalSkills,
    soft: sortedRemaining, // All non-technical/non-tools skills go here
    tools: toolsSkills,
    other: [] as typeof safeSkills // Keep empty since we removed the headings and combined everything
  };

  // If no skills fit into categories, put them all in 'other'
  if (skillCategories.technical.length === 0 && skillCategories.soft.length === 0 && skillCategories.tools.length === 0 && skillCategories.other.length === 0 && safeSkills.length > 0) {
    skillCategories.other = safeSkills;
  }

  // Sort educations by date (most recent first) with safety check
  const sortedEducations = userEducations && userEducations.length > 0 
    ? [...userEducations].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    : [];

  // Check if we have any data sections to display
  const hasSkills = userSkills && userSkills.length > 0;
  const hasExperiences = userExperiences && userExperiences.length > 0;
  const hasEducation = userEducations && userEducations.length > 0;
  const hasProjects = userProjects && userProjects.length > 0;
  const hasServices = userServices && userServices.length > 0;
  
  return (
    <div className="min-h-screen bg-white scholar-template">
      {/* Removing the top sticky header as we're moving the buttons into the personal details card */}
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Left side with profile picture */}
            <div className="relative md:w-auto">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md transition-transform hover:scale-105 relative">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 z-10 opacity-50"></div>
                <Avatar className="w-full h-full">
                  <AvatarImage src={userInfo && userInfo.photoURL ? userInfo.photoURL : ''} alt={userInfo && userInfo.name ? userInfo.name : 'User'} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                    {userInfo && userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {userInfo && userInfo.lookingFor && (
                <Badge className="absolute -bottom-2 right-0 bg-blue-600 hover:bg-blue-700">
                  {userInfo.lookingFor}
                </Badge>
              )}
            </div>

            {/* Middle section with name and info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-1 fade-in-up">
                {userInfo && userInfo.name ? userInfo.name : "Scholar"}
              </h1>
              
              <div className="mb-2 text-blue-700 font-serif text-lg fade-in-up delay-100">
                <span className="font-medium typewriter-cursor">
                  {text || (userInfo && userInfo.title) || "Academic Scholar"}
                </span>
              </div>

              {(userInfo && userInfo.title && userInfo.company) && (
                <div className="flex items-center justify-center md:justify-start text-gray-600 mb-1 fade-in-up delay-200">
                  <Briefcase className="h-4 w-4 mr-1" />
                  <span>{userInfo.title} at {userInfo.company}</span>
                </div>
              )}

              {userInfo && userInfo.location && (
                <div className="flex items-center justify-center md:justify-start text-gray-600 mb-3 fade-in-up delay-200">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{userInfo.location}</span>
                </div>
              )}

              {/* Domain/Industry/Institution Pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4 fade-in-up delay-300">
                {userInfo && userInfo.industry && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 py-1 px-3">
                    <School className="w-3.5 h-3.5 mr-1.5" />
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo && userInfo.domain && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 py-1 px-3">
                    <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                    {userInfo.domain}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Right side with CTA buttons aligned with profile picture */}
            <div className="md:self-center flex items-center justify-center md:justify-end fade-in-up delay-400">
              <div className="flex flex-row gap-2">
                <PortfolioCtaButtons 
                  userId={userInfo?.id}
                  userEmail={userInfo?.email}
                  userName={userInfo?.name}
                  variant="technical"
                  size="sm"
                  className="space-x-2 flex flex-row"
                  buttonStyle={{
                    background: "linear-gradient(to right, #4A69BD, #3B5998)",
                    color: "white",
                    border: "none"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Brand Section - No header label */}
      {userInfo && (userInfo.tagline || userInfo.visionStatement || userInfo.missionStatement || 
        (userInfo.coreValues && userInfo.coreValues.length > 0) || 
        userInfo.uniqueValueProposition) && (
        <section className="py-6 bg-gray-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="space-y-6">
              {userInfo.tagline && (
                <div className="notebook-paper p-6 fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-serif font-semibold text-blue-800">Tagline</h3>
                  </div>
                  <p className="text-gray-800 italic text-lg break-words">"{userInfo.tagline}"</p>
                </div>
              )}

              {(userInfo.visionStatement || userInfo.missionStatement) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userInfo.visionStatement && (
                    <div className="notebook-card p-6 rounded-lg fade-in-up overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                        <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-serif font-semibold text-blue-800">Vision</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{userInfo.visionStatement}</p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div className="notebook-card p-6 rounded-lg fade-in-up overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <h3 className="text-lg font-serif font-semibold text-blue-800">Mission</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">{userInfo.missionStatement}</p>
                    </div>
                  )}
                </div>
              )}

              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div className="notebook-paper p-6 fade-in-up">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-serif font-semibold text-blue-800">Core Values</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {userInfo.coreValues.map((value: string, index: number) => (
                      <Badge 
                        key={index}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userInfo.uniqueValueProposition && (
                <div className="notebook-paper p-6 fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-serif font-semibold text-blue-800">What Sets Me Apart</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{userInfo.uniqueValueProposition}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* What I Offer Section - Services */}
      {hasServices && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
              <Lightbulb className="h-6 w-6 mr-3 text-blue-600" />
              What I Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service, index) => (
                <div key={service.id} className="notebook-card p-6 rounded-lg fade-in-up flex flex-col" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-semibold text-blue-800 mb-2">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{service.description}</p>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between">
                      <Badge className={service.isActive ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-700 border border-gray-200"}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {(service.priceUsd || service.priceInr) && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-800">
                            {service.priceUsd ? `$${service.priceUsd}` : service.priceInr ? `₹${service.priceInr}` : ''}
                            {service.isHourly && <span className="text-sm font-normal text-gray-600">/hr</span>}
                          </div>
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

      {/* Skills Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <Star className="h-6 w-6 mr-3 text-blue-600" />
            What I'm Good At
          </h2>
          
          {!hasSkills && (
            <div className="notebook-paper mb-6 border-dashed border-blue-200 text-center">
              <p className="text-gray-500 italic">Add skills to showcase your strengths and abilities to potential employers or collaborators.</p>
              <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                Add Skills
              </Button>
            </div>
          )}
          
          {hasSkills && safeSkills.length > 0 && (
            <div className="notebook-card fade-in-up p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safeSkills.map((skill) => (
                  <div key={skill.id} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        {(skill as any).category && (
                          <span className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700">
                            {(skill as any).category}
                          </span>
                        )}
                        {(skill as any).yearsOfExperience && (
                          <span className="text-xs px-2 py-1 rounded-md bg-purple-50 text-purple-700">
                            {(skill as any).yearsOfExperience}y
                          </span>
                        )}
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                          {skill.level} - {skill.proficiency}%
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.round(skill.proficiency / 20) ? 'text-blue-600 fill-blue-600' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Projects & Portfolio Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <Layers className="h-6 w-6 mr-3 text-indigo-600" /> 
            Projects & Portfolio
          </h2>
          
          {!hasProjects && (
            <div className="notebook-paper mb-6 border-dashed border-blue-200 text-center">
              <p className="text-gray-500 italic">Add projects to showcase your academic work, research, and accomplishments.</p>
              <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                Add Projects
              </Button>
            </div>
          )}
          
          {hasProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`project-card fade-in-up delay-${index * 100} overflow-hidden rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => openProjectModal(project)}
                >
                  {project.thumbnailUrl && (
                    <div className="w-full aspect-square overflow-hidden">
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 graph-paper">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-serif font-semibold text-blue-800">{project.title}</h3>
                      {project.category && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center">
                          {getCategoryIcon(project.category)}
                          <span className="ml-1 text-xs">{project.category}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {/* Display industry badge - added this section */}
                    {project.industry && (
                      <div className="mb-3">
                        <Badge variant="outline" className="tag-badge bg-purple-50 text-purple-700 border-purple-200">
                          # {project.industry}
                        </Badge>
                      </div>
                    )}
                    
                    {project.startDate && (
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(project.startDate).toLocaleDateString(undefined, { 
                          year: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    )}
                    
                    {project.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    )}
                    
                    {/* Made Project URL more prominent - improved this section */}
                    {project.projectUrl && (
                      <div className="mt-4 border-t pt-3 border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 mr-2 truncate">
                            <Globe className="h-4 w-4 inline mr-2 text-gray-500" />
                            <span className="text-xs text-gray-500 truncate">{project.projectUrl}</span>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              openProjectModal(project);
                            }}
                            className="whitespace-nowrap inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-md transition-colors hover:bg-blue-100"
                          >
                            View Project <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Career Path Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <Briefcase className="h-6 w-6 mr-3 text-indigo-600" /> 
            Career Path
          </h2>
          
          {!hasExperiences && (
            <div className="notebook-paper mb-6 border-dashed border-blue-200 text-center">
              <p className="text-gray-500 italic">Add work experience to showcase your professional journey and achievements.</p>
              <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                Add Work Experience
              </Button>
            </div>
          )}
            
          {hasExperiences && (
            <div className="relative">
              {/* Timeline visualization */}
              <div className="absolute left-0 md:left-3 top-0 bottom-0 w-0.5 bg-indigo-200 dashed"></div>
              
              <div className="space-y-8 pl-8 md:pl-12">
                {userExperiences.map((experience, index) => (
                  <div key={experience.id} className="relative fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-3 -translate-x-1/2 md:-translate-x-3 top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-sm"></div>
                    
                    <div className="notebook-card p-6 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-serif font-semibold text-indigo-800 mb-1">{experience.title}</h3>
                          <div className="flex items-center text-gray-700 mb-2">
                            <Building className="h-4 w-4 mr-2 text-indigo-600" />
                            <span className="font-medium">{experience.company}</span>
                            {experience.location && (
                              <>
                                <span className="mx-2">•</span>
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{experience.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-indigo-700 font-semibold mt-1 md:mt-0 md:ml-4 md:text-right whitespace-nowrap">
                          {experience.startDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(experience.startDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}
                                {experience.endDate ? ` - ${new Date(experience.endDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}` : ' - Present'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-indigo-100 py-2 mb-4">
                        {experience.description && <p className="text-gray-700 mb-3">{experience.description}</p>}
                        
                        {/* Key Responsibilities Section */}
                        {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-semibold text-indigo-800 mb-2">Key Responsibilities:</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {Array.isArray(experience.keyResponsibilities) && experience.keyResponsibilities.map((responsibility: string, idx: number) => (
                                <li key={idx} className="ml-1">{responsibility}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {(experience.industry || experience.domain) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {experience.industry && (
                            <Badge variant="outline" className="tag-badge bg-blue-50 text-blue-700 border-blue-200">
                              # {experience.industry}
                            </Badge>
                          )}
                          {experience.domain && (
                            <Badge variant="outline" className="tag-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                              # {experience.domain}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Academic Journey Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <GraduationCap className="h-6 w-6 mr-3 text-blue-600" /> 
            Academic Journey
          </h2>
          
          {!hasEducation && (
            <div className="notebook-paper mb-6 border-dashed border-blue-200 text-center">
              <p className="text-gray-500 italic">Add education details to showcase your academic background and achievements.</p>
              <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                Add Education
              </Button>
            </div>
          )}
          
          {hasEducation && (
            <div className="space-y-6">
              {sortedEducations.map((education, index) => (
                <div key={education.id} className="timeline-entry fade-in-up delay-100">
                  <div className="notebook-paper rounded-lg p-6 mb-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif font-semibold text-blue-800 mb-1">{education.degree}</h3>
                        <div className="flex items-center text-gray-700 mb-2">
                          <School className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="font-medium">{education.institution}</span>
                          {education.location && (
                            <>
                              <span className="mx-2">•</span>
                              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                              <span>{education.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-blue-700 font-semibold whitespace-nowrap">
                        {education.startDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(education.startDate).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short' 
                              })}
                              {education.endDate ? ` - ${new Date(education.endDate).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short' 
                              })}` : ' - Present'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {education.description && (
                      <div className="pl-4 border-l-2 border-blue-100 py-2 mb-4">
                        <p className="text-gray-700">{education.description}</p>
                      </div>
                    )}
                    
                    {/* Field of Study, Domain, and Industry Section */}
                    {(education.fieldOfStudy || education.industry || education.domain) && (
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {education.fieldOfStudy && (
                          <Badge variant="outline" className="tag-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                            {education.fieldOfStudy}
                          </Badge>
                        )}
                        {education.domain && (
                          <Badge variant="outline" className="tag-badge bg-blue-50 text-blue-700 border-blue-200">
                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                            {education.domain}
                          </Badge>
                        )}
                        {education.industry && (
                          <Badge variant="outline" className="tag-badge bg-purple-50 text-purple-700 border-purple-200">
                            # {education.industry}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Skills Acquired Section */}
                    {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Code className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800">Skills Acquired</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(education.skillsAcquired) && education.skillsAcquired.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Achievements Section */}
                    {education.achievements && (
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Award className="h-5 w-5 text-indigo-600 mr-2" />
                          <span className="font-medium text-indigo-800">Key Achievements</span>
                        </div>
                        <p className="text-gray-700">{education.achievements}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section / CTA */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <Send className="h-6 w-6 mr-3 text-indigo-600" /> 
            Let's Connect
          </h2>
          
          <div className="max-w-3xl mx-auto fade-in-up">
            <div className="notebook-paper mb-6 p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Interested in discussing academic opportunities, collaborations, mentorship, or just want to chat about shared research interests? Feel free to reach out!
              </p>
              
              <div>
                <PortfolioCtaButtons 
                  userEmail={userInfo?.email}
                  userName={userInfo?.name}
                  variant="creative"
                  className="space-x-3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        {selectedProject && (
          <>
            <DialogContent className="max-w-3xl p-0 overflow-visible rounded-lg border-0 max-h-[95vh] h-auto my-6 mx-auto">
              <div className="scholar-template overflow-y-auto max-h-[95vh] flex flex-col">
                {/* Modal Header with Title Bar */}
                <div className="bg-indigo-50 border-b border-indigo-100 flex-shrink-0 p-4 pl-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-serif font-bold text-indigo-800">
                      {selectedProject.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>
                
                {/* Project Thumbnail Image - displays selected gallery image or default thumbnail */}
                <div className="bg-white border-b border-gray-100 flex-shrink-0">
                  {displayedImageUrl ? (
                    <div className="w-full h-64 md:h-80 overflow-hidden flex items-center justify-center bg-gray-100">
                      <img
                        src={displayedImageUrl}
                        alt="Selected gallery image"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : selectedProject.thumbnailUrl ? (
                    <div className="w-full h-64 md:h-80 overflow-hidden flex items-center justify-center bg-gray-100">
                      <img
                        src={selectedProject.thumbnailUrl}
                        alt={selectedProject.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 md:h-80 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                      <div className="rounded-full bg-indigo-100 p-6 w-24 h-24 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-indigo-300" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="notebook-paper p-5 flex-grow overflow-y-auto">
                  {/* Media Gallery */}
                  {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-base font-serif font-semibold text-indigo-800 mb-3 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Project Gallery
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {selectedProject.mediaUrls.map((url, index) => (
                          <div 
                            key={index}
                            onClick={() => setDisplayedImageUrl(url)}
                            className={`aspect-square rounded-md overflow-hidden border-2 shadow-sm hover:shadow-lg transition-shadow cursor-pointer group ${displayedImageUrl === url ? 'border-indigo-600' : 'border-indigo-100'}`}
                          >
                            <img 
                              src={url} 
                              alt={`Project media ${index + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Project Description */}
                  {selectedProject.description && (
                    <div className="mb-6">
                      <h3 className="text-base font-serif font-semibold text-indigo-800 mb-2">
                        About This Project
                      </h3>
                      <div className="pl-3 border-l-2 border-indigo-100 py-2 bg-white rounded-r-lg shadow-sm">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {selectedProject.description}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Project Details */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="graph-paper p-4 rounded-lg">
                      <h3 className="text-base font-serif font-semibold text-indigo-800 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </h3>
                      
                      <div className="space-y-3">
                        {selectedProject.category && (
                          <div className="flex items-start border-b border-indigo-50 pb-2">
                            <div className="w-20 text-gray-500 font-medium text-sm">Category:</div>
                            <div className="flex-1">
                              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center">
                                {getCategoryIcon(selectedProject.category)}
                                <span className="ml-1.5">{selectedProject.category}</span>
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {selectedProject.industry && (
                          <div className="flex items-start border-b border-indigo-50 pb-2">
                            <div className="w-20 text-gray-500 font-medium text-sm">Industry:</div>
                            <div className="flex-1">
                              <Badge variant="outline" className="tag-badge bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
                                # {selectedProject.industry}
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {selectedProject.startDate && (
                          <div className="flex items-start border-b border-indigo-50 pb-2">
                            <div className="w-20 text-gray-500 font-medium text-sm">Date:</div>
                            <div className="flex-1 flex items-center text-gray-700">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                              <span className="text-sm">
                                {new Date(selectedProject.startDate).toLocaleDateString(undefined, { 
                                  year: 'numeric',
                                  month: 'long'
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {selectedProject.projectUrl && (
                          <div className="flex items-start pt-1">
                            <div className="w-20 text-gray-500 font-medium text-sm">Website:</div>
                            <div className="flex-1 break-all text-blue-600 hover:text-blue-800">
                              <a 
                                href={selectedProject.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center hover:underline"
                              >
                                <Globe className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                                <span className="text-xs">{selectedProject.projectUrl}</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Client Endorsement and Team Members */}
                    <div>
                      {selectedProject.clientEndorsement && (
                        <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <h4 className="text-sm font-serif font-semibold text-indigo-800 mb-2 flex items-center">
                            <Star className="h-4 w-4 mr-2 text-yellow-500" />
                            Client Endorsement
                          </h4>
                          <p className="text-sm text-gray-700 italic">"{selectedProject.clientEndorsement}"</p>
                        </div>
                      )}
                      
                      {teamMembers.length > 0 && (
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <h4 className="text-sm font-serif font-semibold text-indigo-800 mb-2 flex items-center">
                            <Award className="h-4 w-4 mr-2" />
                            Team Members
                          </h4>
                          <div className="space-y-2">
                            {teamMembers.map((member: any) => (
                              <div key={member.id} className="text-xs">
                                <p className="font-semibold text-indigo-900">{member.name}</p>
                                <p className="text-indigo-700">{member.role}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer - View Project button */}
                <DialogFooter className="p-3 bg-indigo-50 border-t border-indigo-100 flex-shrink-0">
                  <div className="w-full flex justify-end">
                    {selectedProject.projectUrl ? (
                      <a 
                        href={selectedProject.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-9 rounded-md px-4 py-2 text-sm"
                      >
                        View Project <ExternalLink className="h-4 w-4 ml-1.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-500">No project URL available</span>
                    )}
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}