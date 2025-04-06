import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Skill, WorkExperience, Education, Service } from "@shared/schema";
import { useEffect } from "react";
import { Mail, Linkedin, ExternalLink, Calendar, GraduationCap, Star, Package } from "lucide-react";

interface MinimalistProProps {
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

export default function MinimalistPro({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [], 
  userServices = [] 
}: MinimalistProProps) {
  console.log("MinimalistPro received services data:", userServices);
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services by order field (for featured services)
  const sortedServices = [...userServices].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );
  
  console.log("MinimalistPro - sortedServices:", sortedServices);
  
  // Initialize animations on component mount
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      .minimalist-pro-template .skill-bar {
        animation: skillBarFill 1.2s ease-out forwards;
      }
      
      @keyframes skillBarFill {
        from { width: 0; }
        to { width: 100%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <Card className="overflow-hidden shadow-lg minimalist-pro-template" style={{ background: "#F5F7FA" }}>
      {/* Header with clean elegant styling */}
      <div className="bg-[#0044CC] py-6 px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-light tracking-wide">
            {userInfo.name}
          </h1>
          <div className="flex gap-3">
            {userInfo.email && (
              <a href={`mailto:${userInfo.email}`} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </a>
            )}
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <Linkedin className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2">
          <Badge className="bg-white text-[#0044CC] hover:bg-white/90">
            {userInfo.title || "Professional"}
          </Badge>
          
          {userInfo.industry && (
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              {userInfo.industry}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-8">
        {/* Profile section with photo and intro */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-md flex-shrink-0 mx-auto md:mx-0">
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "User profile"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[#333333] text-xl font-medium mb-3">
              Professional Overview
            </h2>
            <p className="text-[#333333]/80 mb-2">
              {userInfo.location && <span className="block mb-1">Location: {userInfo.location}</span>}
              {userInfo.jobLevel && <span className="block mb-1">Level: {userInfo.jobLevel}</span>}
            </p>
            <p className="text-[#333333] leading-relaxed">
              {userInfo.lookingFor || `Experienced ${userInfo.title || "professional"} with a focus on delivering high-quality results.`}
            </p>
          </div>
        </div>
        
        {/* Skills section with minimal bars */}
        <div className="mb-8">
          <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
            Key Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {sortedSkills.length > 0 ? (
              sortedSkills.slice(0, 6).map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#333333]">{skill.name}</span>
                    <span className="text-xs text-[#333333]/70">{skill.level}</span>
                  </div>
                  <div className="h-2 w-full bg-[#EAEAEA] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0044CC] rounded-full skill-bar" 
                      style={{ width: `${skill.proficiency || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state for skills
              <div className="col-span-2 text-center py-6 bg-white rounded-lg border border-[#EAEAEA]">
                <p className="text-[#333333]/50">Skills will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Experience timeline */}
        <div className="mb-8">
          <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
            Professional Experience
          </h3>
          <div className="space-y-5">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.slice(0, 3).map((exp) => (
                <div 
                  key={exp.id} 
                  className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#EAEAEA]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#0044CC]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0044CC] text-lg font-semibold">
                        {exp.company.substring(0, 1)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#333333]">{exp.title}</h4>
                      <p className="text-sm text-[#333333]/70">
                        {exp.company} {exp.location ? `• ${exp.location}` : ''}
                      </p>
                    </div>
                    <div className="ml-auto text-right flex items-center text-xs text-[#333333]/70">
                      <Calendar className="h-3 w-3 mr-1 text-[#0044CC]" />
                      <span>
                        {exp.startDate.substring(0, 4)}
                        {exp.endDate ? `-${exp.endDate.substring(0, 4)}` : '-Now'}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-[#333333]/80 mt-2 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              // Empty state for experiences
              <div className="text-center py-6 bg-white rounded-lg border border-[#EAEAEA]">
                <p className="text-[#333333]/50">Professional experience will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Projects section */}
        <div className="mb-8">
          <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
            Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userProjects.length > 0 ? (
              userProjects.slice(0, 4).map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#EAEAEA]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-[#333333]">{project.title}</h4>
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-[#0044CC] hover:text-[#0044CC]/80">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#333333]/70 mb-2">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No date'}
                  </p>
                  {project.description && (
                    <p className="text-sm text-[#333333]/80 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              // Empty state for projects
              <div className="col-span-2 text-center py-6 bg-white rounded-lg border border-[#EAEAEA]">
                <p className="text-[#333333]/50">Projects will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Education section */}
        <div className="mb-8">
          <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
            <GraduationCap className="h-5 w-5 mr-2 text-[#0044CC]" />
            Education
          </h3>
          <div className="space-y-5">
            {sortedEducations.length > 0 ? (
              sortedEducations.slice(0, 3).map((edu) => (
                <div 
                  key={edu.id} 
                  className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#EAEAEA]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-[#333333]">{edu.degree}</h4>
                      <p className="text-sm text-[#333333] font-medium mt-1">
                        {edu.institution}
                      </p>
                      {edu.location && (
                        <p className="text-sm text-[#333333]/70">
                          {edu.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center text-xs text-[#333333]/70">
                      <Calendar className="h-3 w-3 mr-1 text-[#0044CC]" />
                      <span>
                        {edu.startDate.substring(0, 4)}
                        {edu.endDate ? `-${edu.endDate.substring(0, 4)}` : '-Present'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state for education
              <div className="text-center py-6 bg-white rounded-lg border border-[#EAEAEA]">
                <p className="text-[#333333]/50">Education will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Services section */}
        <div className="mb-8">
          <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center">
            <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
            <Package className="h-5 w-5 mr-2 text-[#0044CC]" />
            Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedServices.length > 0 ? (
              sortedServices.slice(0, 4).map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-[#EAEAEA]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-[#333333]">{service.title}</h4>
                    <Badge 
                      className="bg-[#0044CC]/10 text-[#0044CC] hover:bg-[#0044CC]/20 border-none"
                    >
                      {service.category}
                    </Badge>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-[#333333]/80 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  {(service.priceUsd || service.priceInr) && (
                    <div className="flex items-center gap-1 text-sm font-medium text-[#0044CC]">
                      <Star className="h-4 w-4 fill-[#0044CC] text-[#0044CC]" />
                      {service.priceUsd && `$${service.priceUsd}`}
                      {service.priceUsd && service.priceInr && ' / '}
                      {service.priceInr && `₹${service.priceInr}`}
                      {service.isHourly && ' per hour'}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Empty state for services
              <div className="col-span-2 text-center py-6 bg-white rounded-lg border border-[#EAEAEA]">
                <p className="text-[#333333]/50">Services will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer section */}
        <div className="mt-8 border-t border-[#EAEAEA] pt-4 flex justify-between items-center">
          <p className="text-xs text-[#333333]/60">
            Created with <span className="text-[#0044CC]">Brandentifier</span>
          </p>
          <Badge className="bg-[#EAEAEA] text-[#333333] hover:bg-[#EAEAEA]/80">
            Minimalist Pro
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}