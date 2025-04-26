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
  X
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
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
    aboutMe?: string | null;
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

  // Group skills by category with safety checks
  const safeSkills = userSkills || [];
  const skillCategories = {
    technical: safeSkills.filter(skill => 
      skill && skill.name && skill.name.toLowerCase().includes('programming') || 
      (skill && skill.name && skill.name.toLowerCase().includes('technical')) ||
      (skill && skill.name && skill.name.toLowerCase().includes('coding')) ||
      (skill && skill.name && skill.name.toLowerCase().includes('development'))
    ),
    soft: safeSkills.filter(skill => 
      skill && skill.name && skill.name.toLowerCase().includes('communication') || 
      (skill && skill.name && skill.name.toLowerCase().includes('leadership')) ||
      (skill && skill.name && skill.name.toLowerCase().includes('teamwork')) ||
      (skill && skill.name && skill.name.toLowerCase().includes('collaboration'))
    ),
    tools: safeSkills.filter(skill => 
      skill && skill.name && skill.name.toLowerCase().includes('tool') || 
      (skill && skill.name && skill.name.toLowerCase().includes('software')) ||
      (skill && skill.name && skill.name.toLowerCase().includes('platform'))
    ),
    other: safeSkills.filter(skill => 
      skill && skill.name && !skill.name.toLowerCase().includes('programming') && 
      !skill.name.toLowerCase().includes('technical') &&
      !skill.name.toLowerCase().includes('coding') &&
      !skill.name.toLowerCase().includes('development') &&
      !skill.name.toLowerCase().includes('communication') && 
      !skill.name.toLowerCase().includes('leadership') &&
      !skill.name.toLowerCase().includes('teamwork') &&
      !skill.name.toLowerCase().includes('collaboration') &&
      !skill.name.toLowerCase().includes('tool') && 
      !skill.name.toLowerCase().includes('software') &&
      !skill.name.toLowerCase().includes('platform')
    )
  };

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
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile picture with notebook motif */}
            <div className="relative">
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

            {/* Name and Academic Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-1 fade-in-up">
                {userInfo && userInfo.name ? userInfo.name : "Scholar"}
              </h1>
              
              <div className="mb-2 text-blue-700 font-serif text-lg fade-in-up delay-100">
                <span className="font-medium typewriter-cursor">
                  {text || (userInfo && userInfo.title) || "Academic Scholar"}
                </span>
              </div>

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
                {userInfo && userInfo.title && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 py-1 px-3">
                    <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                    {userInfo.title}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Notebook Style */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
            <Book className="h-6 w-6 mr-3 text-blue-600" />
            What I'm All About
          </h2>
          
          <div className="notebook-paper fade-in-up">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                {userInfo && userInfo.aboutMe ? (
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {userInfo.aboutMe}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {userInfo && (userInfo.title || userInfo.industry || userInfo.domain)
                        ? `As ${userInfo.title ? `a ${userInfo.title}` : ''}${userInfo.industry ? ` in the ${userInfo.industry} field` : ''}${userInfo.domain ? ` focusing on ${userInfo.domain}` : ''}, I'm passionate about continuous learning and applying my knowledge to real-world challenges.`
                        : "I'm passionate about continuous learning and applying my knowledge to real-world challenges. My academic journey has equipped me with both theoretical understanding and practical skills."}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {userInfo && userInfo.lookingFor 
                        ? `Currently seeking ${userInfo.lookingFor.toLowerCase()}. I bring a fresh perspective, strong work ethic, and eagerness to contribute to meaningful projects.`
                        : "I bring a fresh perspective, strong work ethic, and eagerness to contribute to meaningful projects. I'm constantly looking to expand my skills and take on new challenges."}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

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
          
          {hasSkills && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Skills */}
              {skillCategories.technical.length > 0 && (
                <div className="notebook-card fade-in-up p-6 rounded-lg">
                  <h3 className="text-lg font-serif font-semibold mb-4 flex items-center text-blue-800">
                    <Code className="h-5 w-5 mr-2 text-blue-600" /> Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillCategories.technical.map((skill) => (
                      <div key={skill.id} className="w-full mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
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
              
              {/* Soft Skills */}
              {skillCategories.soft.length > 0 && (
                <div className="graph-paper fade-in-up delay-100 p-6 rounded-lg">
                  <h3 className="text-lg font-serif font-semibold mb-4 flex items-center text-indigo-800">
                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" /> Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillCategories.soft.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline"
                        className={`text-sm py-2 px-3 skill-badge ${getSkillColor(skill.name)}`}
                      >
                        {skill.name} {skill.level && <span className="ml-1 text-xs bg-indigo-50 px-2 py-1 rounded-md text-indigo-700">{skill.level} - {skill.proficiency}%</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tools */}
              {skillCategories.tools.length > 0 && (
                <div className="notebook-paper fade-in-up delay-200 p-6 rounded-lg">
                  <h3 className="text-lg font-serif font-semibold mb-4 flex items-center text-purple-800">
                    <Tool className="h-5 w-5 mr-2 text-purple-600" /> Tools & Software
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillCategories.tools.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 skill-badge"
                      >
                        {skill.name} {skill.level && <span className="ml-1 text-xs bg-purple-100 px-2 py-1 rounded-md text-purple-700">{skill.level} - {skill.proficiency}%</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills categorized as "other" are still displayed but without a separate section header */}
              {skillCategories.other.length > 0 && (
                <div className="graph-paper fade-in-up delay-300 p-6 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {skillCategories.other.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline"
                        className={`text-sm py-2 px-3 skill-badge ${getSkillColor(skill.name)}`}
                      >
                        {skill.name} {skill.level && <span className="ml-1 text-xs bg-green-50 px-2 py-1 rounded-md text-green-700">{skill.level} - {skill.proficiency}%</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Services Section (if services exist) */}
      {hasServices && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
              What I Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userServices.slice(0, 3).map((service, index) => (
                <div key={service.id} className={`notebook-paper fade-in-up delay-${index * 100} rounded-lg border-l-[3px] border-l-blue-500 hover:shadow-md transition-shadow p-6`}>
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-serif font-semibold text-blue-800">{service.title}</h3>
                    {service.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {(service.priceUsd || service.priceInr) && (
                    <div className="text-blue-600 font-medium mb-4">
                      {service.priceUsd && (
                        <span className="mr-2">${service.priceUsd}{service.isHourly ? '/hr' : ''}</span>
                      )}
                      {service.priceInr && (
                        <span>₹{service.priceInr}{service.isHourly ? '/hr' : ''}</span>
                      )}
                    </div>
                  )}
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    Request Service
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                <div key={project.id} className={`project-card fade-in-up delay-${index * 100} overflow-hidden rounded-lg bg-white shadow-sm`}>
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
                              {Array.isArray(experience.keyResponsibilities) && experience.keyResponsibilities.map((responsibility, idx) => (
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
                    
                    {/* Field of Study and Industry Section */}
                    {(education.fieldOfStudy || education.industry) && (
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {education.fieldOfStudy && (
                          <Badge variant="outline" className="tag-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                            {education.fieldOfStudy}
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
                          {Array.isArray(education.skillsAcquired) && education.skillsAcquired.map((skill, idx) => (
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
          <DialogContent className="max-w-3xl p-0 overflow-visible rounded-lg border-0 max-h-[95vh] h-auto my-6 mx-auto">
            <div className="scholar-template overflow-y-auto max-h-[95vh] flex flex-col">
              {/* Modal Header with Title Bar */}
              <div className="relative bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
                <div className="p-4 pl-6 pr-12">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-serif font-bold text-indigo-800">
                      {selectedProject.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsProjectModalOpen(false)} 
                  className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 bg-white rounded-full p-1.5 shadow-sm transition-colors border border-indigo-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Project Image or Placeholder */}
              <div className="bg-white border-b border-gray-100 flex-shrink-0">
                {selectedProject.thumbnailUrl ? (
                  <div className="w-full h-48 md:h-56 overflow-hidden">
                    <img
                      src={selectedProject.thumbnailUrl}
                      alt={selectedProject.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 md:h-56 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
                    <div className="rounded-full bg-indigo-100 p-6 w-24 h-24 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-indigo-300" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="notebook-paper p-5 flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Project Details (now on the left) */}
                  <div className="graph-paper p-4 rounded-lg">
                    <h3 className="text-base font-serif font-semibold text-indigo-800 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Project Details
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
                  
                  {/* Main Content (now on the right) */}
                  <div className="md:col-span-2">
                    <h3 className="text-base font-serif font-semibold text-indigo-800 mb-2">
                      About This Project
                    </h3>
                    <div className="pl-3 border-l-2 border-indigo-100 py-2 mb-4 bg-white rounded-r-lg shadow-sm">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedProject.description || 'No description available for this project.'}
                      </p>
                    </div>
                    
                    {/* Media Gallery - Placeholder for future implementation */}
                    {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-base font-serif font-semibold text-indigo-800 mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Project Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedProject.mediaUrls.map((url, index) => (
                            <div key={index} className="aspect-square rounded-md overflow-hidden border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                              <img 
                                src={url} 
                                alt={`Project media ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <DialogFooter className="p-3 bg-indigo-50 border-t border-indigo-100 flex-shrink-0">
                <div className="w-full flex flex-row justify-between items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsProjectModalOpen(false)}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 h-8 text-sm"
                  >
                    Close
                  </Button>
                  
                  {selectedProject.projectUrl && (
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-700 h-8 rounded-md px-3 py-1 text-sm"
                    >
                      Visit Project <ExternalLink className="h-3 w-3 ml-1.5" />
                    </a>
                  )}
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}