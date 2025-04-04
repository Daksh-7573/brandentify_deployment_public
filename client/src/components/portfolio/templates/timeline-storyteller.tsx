import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Skill, WorkExperience } from "@shared/schema";
import { useEffect } from "react";
import { Calendar, Compass, Mail, Linkedin, Instagram, Code, ChevronRight, MapPin, BriefcaseBusiness } from "lucide-react";

interface TimelineStorytellerProps {
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
}

export default function TimelineStoryteller({ userInfo, userSkills, userExperiences, userProjects }: TimelineStorytellerProps) {
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
  
  // Initialize animations on component mount
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Timeline Storyteller Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes glowPulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(255, 107, 107, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
      }
      
      @keyframes pathAnimation {
        0% { stroke-dashoffset: 1000; }
        100% { stroke-dashoffset: 0; }
      }
      
      .timeline-storyteller-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .milestone {
        animation: glowPulse 2s infinite;
      }
      
      .timeline-storyteller-template .timeline-path {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: pathAnimation 3s ease-out forwards;
      }
      
      /* Timeline sticky header effect */
      .timeline-storyteller-template .timeline-header {
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(5px);
      }
      
      /* Staggered animations */
      .timeline-storyteller-template .fade-in:nth-child(1) { animation-delay: 0.1s; }
      .timeline-storyteller-template .fade-in:nth-child(2) { animation-delay: 0.3s; }
      .timeline-storyteller-template .fade-in:nth-child(3) { animation-delay: 0.5s; }
      .timeline-storyteller-template .fade-in:nth-child(4) { animation-delay: 0.7s; }
      .timeline-storyteller-template .fade-in:nth-child(5) { animation-delay: 0.9s; }
      
      /* Horizontal scrolling effect */
      .timeline-storyteller-template .horizontal-scroll {
        overflow-x: auto;
        white-space: nowrap;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      .timeline-storyteller-template .horizontal-scroll::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <Card className="timeline-storyteller-template overflow-hidden" style={{ background: "#FAFAFA" }}>
      {/* Hero section with vibrant intro */}
      <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FFD166] h-40 relative flex items-center justify-start px-8 timeline-header">
        <div className="flex items-center gap-6 fade-in">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden milestone" style={{ background: "white" }}>
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "User profile"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
              {userInfo.name}
            </h1>
            <p className="text-white/90 text-lg">
              {userInfo.title || userInfo.jobLevel || 'Professional'} {userInfo.industry ? `in ${userInfo.industry}` : ''}
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-8">
        {/* Professional journey section with timeline */}
        <div className="mb-12 fade-in">
          <h2 className="text-[#333333] text-2xl font-semibold mb-6 flex items-center" style={{ fontFamily: "Lora, serif" }}>
            <span className="w-2 h-8 bg-[#FF6B6B] mr-3 rounded-sm"></span>
            Professional Journey
          </h2>
          
          {/* Timeline visualization */}
          <div className="relative pt-4">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-1 bg-gray-200"></div>
            
            {sortedExperiences.length > 0 ? (
              <div className="space-y-10">
                {sortedExperiences.map((exp, index) => (
                  <div key={exp.id} className="relative pl-16 fade-in">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-[#FF6B6B] border-4 border-white milestone"></div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {exp.title}
                        </h3>
                        <Badge className="bg-[#FFD166] text-[#333333] hover:bg-[#FFD166]/80">
                          {exp.startDate.substring(0, 4)} - {exp.endDate ? exp.endDate.substring(0, 4) : 'Present'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mt-2 mb-3">
                        <BriefcaseBusiness className="h-4 w-4 text-[#FF6B6B]" />
                        <span className="font-medium">{exp.company}</span>
                        {exp.location && (
                          <>
                            <span className="mx-1">&middot;</span>
                            <MapPin className="h-4 w-4 text-[#FF6B6B]" />
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                      
                      {exp.description && (
                        <p className="text-gray-700">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="relative pl-16 py-8 fade-in">
                <div className="absolute left-4 top-10 w-5 h-5 rounded-full bg-[#FF6B6B] border-4 border-white milestone"></div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">Your professional journey will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Skills progress dots */}
        <div className="mb-12 fade-in">
          <h2 className="text-[#333333] text-2xl font-semibold mb-6 flex items-center" style={{ fontFamily: "Lora, serif" }}>
            <span className="w-2 h-8 bg-[#FF6B6B] mr-3 rounded-sm"></span>
            Skills & Expertise
          </h2>
          
          <div className="horizontal-scroll py-4 pb-6">
            <div className="inline-flex gap-6 pl-4">
              {sortedSkills.length > 0 ? (
                sortedSkills.map((skill) => (
                  <div key={skill.id} className="w-48 min-w-48 bg-white rounded-lg shadow-md p-5 fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[#333333]">{skill.name}</h3>
                    </div>
                    
                    {/* Skill progress dots */}
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div 
                          key={dot} 
                          className={`h-2 w-2 rounded-full ${
                            dot <= (skill.proficiency || 0) / 20 
                              ? 'bg-[#FF6B6B]' 
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600">{skill.level}</p>
                  </div>
                ))
              ) : (
                // Empty state for skills
                <div className="w-48 min-w-48 bg-white rounded-lg shadow-md p-5 text-center">
                  <p className="text-gray-500">Your skills will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Featured projects */}
        {userProjects.length > 0 && (
          <div className="fade-in">
            <h2 className="text-[#333333] text-2xl font-semibold mb-6 flex items-center" style={{ fontFamily: "Lora, serif" }}>
              <span className="w-2 h-8 bg-[#FF6B6B] mr-3 rounded-sm"></span>
              Featured Projects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedProjects.slice(0, 4).map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden fade-in">
                  <div className="h-3 bg-gradient-to-r from-[#FF6B6B] to-[#FFD166]"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {project.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-1 text-[#FF6B6B]" />
                      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'No date'}</span>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="flex justify-end">
                      <button className="text-[#FF6B6B] flex items-center text-sm font-medium hover:text-[#FF6B6B]/80">
                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Contact section */}
        <div className="mt-12 bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFD166]/10 p-6 rounded-lg fade-in">
          <h3 className="text-[#333333] text-lg font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Connect With Me
          </h3>
          
          <div className="flex gap-4">
            <a href={`mailto:${userInfo.email}`} className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF6B6B]/80 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#FFD166] text-[#333333] flex items-center justify-center hover:bg-[#FFD166]/80 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center hover:bg-[#FF6B6B]/80 transition-colors">
              <Code className="h-5 w-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#FFD166] text-[#333333] flex items-center justify-center hover:bg-[#FFD166]/80 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}