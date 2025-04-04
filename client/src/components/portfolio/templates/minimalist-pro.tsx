import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Skill, WorkExperience } from "@shared/schema";
import { useEffect } from "react";

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
}

export default function MinimalistPro({ userInfo, userSkills, userExperiences, userProjects }: MinimalistProProps) {
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Initialize animations on component mount
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Minimalist Pro Template Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes skillBarFill {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes hoverPulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 68, 204, 0.1); }
        70% { box-shadow: 0 0 0 10px rgba(0, 68, 204, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 68, 204, 0); }
      }
      
      .minimalist-pro-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      .minimalist-pro-template .skill-bar {
        animation: skillBarFill 1s ease-out forwards;
      }
      
      .minimalist-pro-template .exp-card:hover {
        animation: hoverPulse 1.5s infinite;
      }
      
      /* Staggered animations */
      .minimalist-pro-template .fade-in:nth-child(1) { animation-delay: 0.1s; }
      .minimalist-pro-template .fade-in:nth-child(2) { animation-delay: 0.2s; }
      .minimalist-pro-template .fade-in:nth-child(3) { animation-delay: 0.3s; }
      .minimalist-pro-template .fade-in:nth-child(4) { animation-delay: 0.4s; }
      .minimalist-pro-template .fade-in:nth-child(5) { animation-delay: 0.5s; }
      .minimalist-pro-template .fade-in:nth-child(6) { animation-delay: 0.6s; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <Card className="overflow-hidden shadow-lg minimalist-pro-template" style={{ background: "#F5F7FA" }}>
      {/* Header with clean elegant styling */}
      <div className="h-24 bg-[#0044CC] flex items-center justify-between px-8 fade-in">
        <h1 className="text-white text-2xl font-light tracking-wide" style={{ fontFamily: "Montserrat, sans-serif" }}>
          {userInfo.name}
        </h1>
        <Badge className="bg-white text-[#0044CC] hover:bg-white">
          {userInfo.jobLevel || userInfo.title || "Professional"}
        </Badge>
      </div>
      
      <CardContent className="p-8">
        {/* Profile section with photo and intro */}
        <div className="flex gap-8 items-start mb-10 fade-in">
          <div className="w-32 h-32 rounded-lg overflow-hidden ring-4 ring-white shadow-md">
            <ProfileImage
              src={userInfo.photoURL}
              alt={userInfo.name || "User profile"}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[#333333] text-xl font-medium mb-2" style={{ fontFamily: "Open Sans, sans-serif" }}>
              {userInfo.title || "Professional"}
              {userInfo.industry ? ` in ${userInfo.industry}` : ''}
            </h2>
            <p className="text-[#333333]/80 mb-4" style={{ fontFamily: "Open Sans, sans-serif" }}>
              {userInfo.location ? `${userInfo.location} · ` : ''}
              {userInfo.domain || ''}
            </p>
            <p className="text-[#333333]/70 line-clamp-3">
              {userInfo.lookingFor || `Experienced ${userInfo.title || "professional"} with a focus on delivering high-quality results and driving innovation.`}
            </p>
          </div>
        </div>
        
        {/* Skills section with minimal bars */}
        {userSkills.length > 0 && (
          <div className="mb-10 fade-in">
            <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
              Key Skills
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {sortedSkills.slice(0, 6).map((skill) => (
                <div key={skill.id} className="fade-in">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-[#333333]">{skill.name}</span>
                    <span className="text-xs text-[#333333]/70">{skill.level}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EAEAEA] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0044CC] rounded-full skill-bar" 
                      style={{ width: `${skill.proficiency || Math.min(25 + Math.random() * 75, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience timeline */}
        {userExperiences.length > 0 && (
          <div className="mb-10 fade-in">
            <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
              Professional Experience
            </h3>
            <div className="space-y-6">
              {sortedExperiences.slice(0, 3).map((exp) => (
                <div key={exp.id} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4 fade-in exp-card">
                  <div className="min-w-12 text-center">
                    <div className="w-12 h-12 bg-[#0044CC]/10 rounded-full flex items-center justify-center mb-1">
                      <span className="text-[#0044CC] text-xl font-semibold">{exp.company.substring(0, 1)}</span>
                    </div>
                    <p className="text-xs text-[#333333]/70">
                      {exp.startDate.substring(0, 4)}
                      {exp.endDate ? `-${exp.endDate.substring(0, 4)}` : '-Now'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[#333333]">{exp.title}</h4>
                      <span className="text-xs px-2 py-0.5 bg-[#EAEAEA] text-[#333333] rounded-full">{exp.industry}</span>
                    </div>
                    <p className="text-sm mb-2">{exp.company} · {exp.location}</p>
                    {exp.description && (
                      <p className="text-sm text-[#333333]/80 line-clamp-3">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projects section */}
        {userProjects.length > 0 && (
          <div className="fade-in">
            <h3 className="text-[#0044CC] text-lg font-medium mb-4 flex items-center" style={{ fontFamily: "Montserrat, sans-serif" }}>
              <span className="w-1.5 h-6 bg-[#0044CC] mr-2 rounded-sm"></span>
              Featured Projects
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {userProjects.slice(0, 4).map((project) => (
                <div key={project.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 fade-in">
                  <h4 className="font-medium text-[#333333] mb-1">{project.title}</h4>
                  <p className="text-xs text-[#333333]/70 mb-2">{project.startDate ? project.startDate.substring(0, 10) : 'No date'}</p>
                  {project.description && (
                    <p className="text-sm text-[#333333]/80 line-clamp-3">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}