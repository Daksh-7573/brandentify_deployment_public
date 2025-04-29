import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Skill, WorkExperience, Education, Service } from "@shared/schema";
import { useEffect, useState } from "react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, Linkedin, ExternalLink, Calendar, GraduationCap, 
  MapPin, Star, Package, Briefcase, ChevronRight, ArrowUpRight
} from "lucide-react";

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
  const [projectInLightbox, setProjectInLightbox] = useState<Project | null>(null);
  
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
  
  // Function to format dates in MMM YYYY format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Initialize animations on component mount
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      .minimalist-pro-template .animate-fade-in {
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .minimalist-pro-template .animate-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .minimalist-pro-template .animate-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .minimalist-pro-template .skill-tag {
        transition: all 0.3s ease;
      }
      
      .minimalist-pro-template .skill-tag:hover {
        transform: scale(1.05);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .minimalist-pro-template .timeline-dot::before {
        content: '';
        position: absolute;
        left: -36px;
        top: 12px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--accent-color, #3B82F6);
        border: 2px solid #F9FAFB;
        z-index: 1;
      }
      
      .minimalist-pro-template .timeline-line::before {
        content: '';
        position: absolute;
        left: -30px;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #E5E7EB;
        z-index: 0;
      }
      
      .minimalist-pro-template .section-header {
        position: relative;
        padding-top: 0.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.05em;
        font-size: 0.875rem;
        color: var(--accent-color, #3B82F6);
      }
      
      .minimalist-pro-template .section-header::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 2rem;
        height: 2px;
        background-color: var(--accent-color, #3B82F6);
      }
    `;
    document.head.appendChild(style);
    
    // Set accent color CSS variable based on primary color
    document.documentElement.style.setProperty('--accent-color', '#3B82F6');
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="font-sans minimalist-pro-template bg-[#F9FAFB] min-h-screen">
      <div className="max-w-screen-lg mx-auto px-4 md:px-6">
      
        {/* Header Section (Top Banner) */}
        <header className="py-10 md:py-14 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0 transition-all duration-300 hover:scale-105">
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name || "User profile"}
                className="h-full w-full object-cover transition-all filter hover:grayscale-0"
              />
            </div>
            
            {/* Identity Section */}
            <div className="flex-1 text-center md:text-left">
              {/* I am - Bold identity label */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-sans">
                I am a {userInfo.title || "Professional"}
              </h1>
              
              {/* From - Location tag */}
              {userInfo.location && (
                <div className="flex items-center justify-center md:justify-start text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  <span>{userInfo.location}</span>
                </div>
              )}
              
              {/* Industry & Domain */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {userInfo.industry && (
                  <Badge variant="outline" className="bg-primary/10 text-primary/90 py-1">
                    Industry: {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge variant="outline" className="bg-secondary/10 py-1">
                    Domain: {userInfo.domain}
                  </Badge>
                )}
              </div>
              
              {/* Looking for */}
              {userInfo.lookingFor && (
                <Badge className="bg-primary text-white hover:bg-primary/90 py-1.5 px-3 text-sm rounded-full">
                  Looking for {userInfo.lookingFor}
                </Badge>
              )}
            </div>
          </div>
        </header>
        
        {/* What I'm All About Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">What I'm All About</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {userInfo.aboutMe ? (
              <p className="text-gray-800 leading-relaxed font-serif text-lg">
                {userInfo.aboutMe}
              </p>
            ) : (
              <p className="text-gray-500 text-center py-4">Personal description will appear here</p>
            )}
          </div>
        </section>
        
        {/* What I'm Good At (Skills Section) */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">What I'm Good At</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {sortedSkills.length > 0 ? (
                sortedSkills.map((skill) => (
                  <div 
                    key={skill.id}
                    className="skill-tag inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-2 rounded-full"
                  >
                    <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${skill.proficiency || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{skill.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center w-full py-4">Skills will appear here</p>
              )}
            </div>
          </div>
        </section>
        
        {/* What I Offer (Services Section) */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">What I Offer</h2>
          {sortedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedServices.slice(0, 3).map((service) => (
                <div 
                  key={service.id}
                  className="animate-lift bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                >
                  <h3 className="font-medium text-lg text-gray-900 mb-2">{service.title}</h3>
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                  )}
                  {(service.priceUsd || service.priceInr) && (
                    <div className="flex justify-between items-center">
                      <div className="text-primary font-medium">
                        {service.priceUsd && `$${service.priceUsd}`}
                        {service.priceUsd && service.priceInr && ' / '}
                        {service.priceInr && `₹${service.priceInr}`}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        Hire Me
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-center py-4">Services will appear here</p>
            </div>
          )}
        </section>
        
        {/* Showcase (Projects Section) */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">Showcase</h2>
          {userProjects.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="animate-lift bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                    onClick={() => setProjectInLightbox(project)}
                  >
                    {/* Project thumbnail - square ratio */}
                    <div className="aspect-square relative overflow-hidden cursor-pointer">
                      <img 
                        src={project.thumbnailUrl || "/images/placeholder-project.jpg"} 
                        alt={project.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        
                        {/* Category tag as a pill */}
                        {project.category && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            {project.category}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Project date in subtle font */}
                      {project.startDate && (
                        <p className="text-xs text-gray-500 mt-1 mb-2">
                          {formatDate(project.startDate)}
                        </p>
                      )}
                      
                      {/* Project URL as button with icon */}
                      {project.projectUrl && (
                        <div className="mt-3">
                          <a 
                            href={project.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Project Lightbox */}
              {projectInLightbox && (
                <div 
                  className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                  onClick={() => setProjectInLightbox(null)}
                >
                  <div 
                    className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Project Media Carousel */}
                    {projectInLightbox.mediaUrls && projectInLightbox.mediaUrls.length > 0 && (
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img 
                          src={projectInLightbox.mediaUrls[0]} 
                          alt={projectInLightbox.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{projectInLightbox.title}</h3>
                      
                      <div className="flex items-center gap-3 mb-4">
                        {projectInLightbox.category && (
                          <Badge className="bg-primary/10 text-primary">
                            {projectInLightbox.category}
                          </Badge>
                        )}
                        
                        {projectInLightbox.startDate && (
                          <span className="text-sm text-gray-500">
                            {formatDate(projectInLightbox.startDate)}
                          </span>
                        )}
                      </div>
                      
                      {projectInLightbox.description && (
                        <p className="text-gray-700 mb-4">{projectInLightbox.description}</p>
                      )}
                      
                      {projectInLightbox.projectUrl && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(projectInLightbox.projectUrl, '_blank')}
                        >
                          Visit Project
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-center py-4">Showcase projects will appear here</p>
            </div>
          )}
        </section>
        
        {/* Career Path (Experience Timeline) */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">Career Path</h2>
          {sortedExperiences.length > 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="relative pl-10">
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id}
                    className={`timeline-dot timeline-line relative pb-8 ${
                      index === sortedExperiences.length - 1 ? 'pb-0' : ''
                    }`}
                  >
                    <div className="animate-lift bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-1">
                        {exp.company}
                        {exp.location && (
                          <span className="text-gray-500"> • {exp.location}</span>
                        )}
                      </p>
                      
                      {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-gray-600">
                          {exp.keyResponsibilities.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-start">
                              <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-center py-4">Career experience will appear here</p>
            </div>
          )}
        </section>
        
        {/* Academic Background (Education Section) */}
        <section className="mb-12 animate-fade-in">
          <h2 className="section-header">Academic Background</h2>
          {sortedEducations.length > 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="relative pl-10">
                {sortedEducations.map((edu, index) => (
                  <div 
                    key={edu.id}
                    className={`timeline-dot timeline-line relative pb-8 ${
                      index === sortedEducations.length - 1 ? 'pb-0' : ''
                    }`}
                  >
                    <div className="animate-lift bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(edu.startDate)} - {edu.currentlyEnrolled ? 'Present' : formatDate(edu.endDate)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mt-1">{edu.institution}</p>
                      
                      {edu.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {edu.location}
                        </p>
                      )}
                      
                      {edu.industry && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {edu.industry}
                        </Badge>
                      )}
                      
                      {edu.skillsAcquired && edu.skillsAcquired.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Skills & Achievements:</p>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {edu.skillsAcquired.slice(0, 4).map((skill, i) => (
                              <li key={i} className="flex items-start">
                                <GraduationCap className="h-3 w-3 text-primary mt-0.5 mr-1 flex-shrink-0" />
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-center py-4">Academic background will appear here</p>
            </div>
          )}
        </section>
        
        {/* Sticky CTA Buttons */}
        <div className="fixed bottom-4 right-4 z-40">
          <PortfolioCtaButtons 
            variant="minimal"
            resumeUrl={null} 
            mentorUrl={null}
            connectUrl={null}
            userEmail={userInfo.email}
            userName={userInfo.name}
            className="flex-row" 
          />
        </div>
        
        {/* Footer */}
        <footer className="py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {userInfo.name} • Made with Brandentifier</p>
        </footer>
      </div>
    </div>
  );
}