import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Button } from "@/components/ui/button";
import { MessageSquare, MapPin, Download, Code, Image, Target, Briefcase } from "lucide-react";

interface Skill {
  id: number;
  userId: number;
  name: string;
  level: string;
  proficiency: number;
}

interface WorkExperience {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string;
  industry: string;
  domain: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  keyResponsibilities: string[];
}

interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate?: string | null;
  projectUrl?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  industry?: string | null;
  mediaUrls?: string[];
}

interface Education {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  location: string;
  industry: string | null;
  domain: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  skillsAcquired: string[];
  academicAchievements?: string[];
}

interface Service {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  priceInr: string | null;
  priceUsd: string | null;
  isHourly: boolean;
  features: string[];
  imageUrl: string | null;
  order: number;
  isActive: boolean;
}

interface ImmersiveStorylineSimpleProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
    jobLevel?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

export default function ImmersiveStorylineSimple({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
}: ImmersiveStorylineSimpleProps) {
  // Add diagnostic logging
  console.log("ImmersiveStorylineSimple - Received props:", {
    userInfo,
    skillsCount: userSkills?.length || 0,
    experiencesCount: userExperiences?.length || 0,
    projectsCount: userProjects?.length || 0,
    educationsCount: userEducations?.length || 0,
    servicesCount: userServices?.length || 0
  });

  // Parallax effect references
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const experiencesRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  
  // Get skill icon helper function
  const getSkillIcon = (skillName: string) => {
    const lowerName = skillName.toLowerCase();
    if (lowerName.includes("react") || lowerName.includes("vue") || lowerName.includes("angular")) {
      return Code;
    } else if (lowerName.includes("design") || lowerName.includes("figma") || lowerName.includes("ui")) {
      return Image;
    } else if (lowerName.includes("management") || lowerName.includes("leadership")) {
      return Briefcase;
    } else {
      return Target;
    }
  };
  
  // Parallax effect
  useEffect(() => {
    // Add animations and scroll effects
    const style = document.createElement('style');
    style.innerHTML = `
      /* Custom Animation Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes floatAnimation {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes pulseAnimation {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .hero-gradient {
        background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
        background-size: 400% 400%;
        animation: gradientAnimation 15s ease infinite;
      }
      
      @keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .profile-image-animation {
        animation: floatAnimation 6s ease-in-out infinite;
      }
      
      .looking-for-badge {
        animation: pulseAnimation 2s ease-in-out infinite;
      }
      
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
      }
      
      .animate-on-scroll.revealed {
        opacity: 1;
        transform: translateY(0);
      }
      
      .hover-scale {
        transition: all 0.3s ease;
      }
      
      .hover-scale:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
    
    // Add scroll event listener for reveal animations
    const handleScroll = () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
        
        if (isVisible) {
          el.classList.add('revealed');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="immersive-storyline-simple bg-white font-sans max-w-full overflow-auto">
      {/* Header section with basic user info */}
      <div ref={heroRef} className="hero-gradient text-white p-8 md:p-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden profile-image-animation">
              <ProfileImage
                src={userInfo?.photoURL}
                alt={userInfo?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* User Details */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{userInfo?.name || "User Name"}</h1>
              <p className="text-xl md:text-2xl mb-4">{userInfo?.title || "Professional"}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                {userInfo?.industry && (
                  <Badge className="bg-white/20 py-1 px-3">
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo?.domain && (
                  <Badge className="bg-white/20 py-1 px-3">
                    {userInfo.domain}
                  </Badge>
                )}
                {userInfo?.lookingFor && (
                  <Badge className="bg-blue-500 py-1 px-3 looking-for-badge">
                    Looking for: {userInfo.lookingFor.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              
              <p className="text-white/80 flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> {userInfo?.location || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Me Section */}
      <div ref={aboutRef} className="bg-gray-50 p-8 md:p-16">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 animate-on-scroll">About Me</h2>
          <div className="bg-white p-6 rounded-lg shadow-md animate-on-scroll">
            {userInfo?.aboutMe ? (
              <div className="prose max-w-full">
                {userInfo.aboutMe.split('\\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {userInfo?.title ? `As a ${userInfo.title}` : "As a professional"} with a passion for {userInfo?.domain || "my field"}, 
                I bring creativity and expertise to every project.
              </p>
            )}
            
            {userInfo?.whatIOffer && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-3 text-gray-700">What I Offer</h3>
                <p className="text-gray-600">{userInfo.whatIOffer}</p>
              </div>
            )}
            
            {userInfo?.lookingFor && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 p-4 rounded-lg looking-for-badge">
                  <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center">
                    <Target className="h-5 w-5 mr-2" /> Currently Looking For
                  </h3>
                  <p className="text-blue-600">{userInfo.lookingFor.replace(/_/g, ' ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Skills Section */}
      <div ref={skillsRef} className="p-8 md:p-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 animate-on-scroll">Skills</h2>
          
          {userSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userSkills.map((skill, index) => {
                const Icon = getSkillIcon(skill.name);
                return (
                  <div 
                    key={skill.id} 
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover-scale animate-on-scroll"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{skill.name}</h3>
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{skill.level}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No skills listed yet.</p>
          )}
        </div>
      </div>
      
      {/* Work Experience Section */}
      <div ref={experiencesRef} className="p-8 md:p-16 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 animate-on-scroll">Work Experience</h2>
          
          {userExperiences.length > 0 ? (
            <div className="space-y-6">
              {userExperiences.map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="bg-white p-6 rounded-lg shadow-md hover-scale animate-on-scroll"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{exp.title}</h3>
                      <h4 className="text-lg font-medium text-gray-700 flex items-center">
                        <Briefcase className="h-4 w-4 mr-1 text-blue-600" /> {exp.company}
                      </h4>
                      <p className="text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {exp.location}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0 text-gray-500">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <div className="mt-4">
                      <p className="text-gray-600">{exp.description}</p>
                    </div>
                  )}
                  
                  {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Key Responsibilities:</h5>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {exp.keyResponsibilities.map((responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No work experience listed yet.</p>
          )}
        </div>
      </div>
      
      {/* Projects Section */}
      <div ref={projectsRef} className="p-8 md:p-16 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 animate-on-scroll">Projects</h2>
          
          {userProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md border border-gray-200 hover-scale animate-on-scroll"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {project.thumbnailUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" /> {project.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.category && (
                        <Badge className="bg-blue-100 text-blue-800 border-none">
                          {project.category}
                        </Badge>
                      )}
                      {project.industry && (
                        <Badge className="bg-purple-100 text-purple-800 border-none">
                          {project.industry}
                        </Badge>
                      )}
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    )}
                    
                    <div className="text-sm text-gray-500 flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      {new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : ' - Present'}
                    </div>
                    
                    {project.projectUrl && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 mr-2" /> View Project
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No projects listed yet.</p>
          )}
        </div>
      </div>
      
      {/* Education Section */}
      {userEducations && userEducations.length > 0 && (
        <div ref={educationRef} className="p-8 md:p-16 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 animate-on-scroll">Education</h2>
            
            <div className="space-y-6">
              {userEducations.map((edu, index) => (
                <div 
                  key={edu.id} 
                  className="bg-white p-6 rounded-lg shadow-md hover-scale animate-on-scroll"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-blue-600" /> {edu.degree}
                      </h3>
                      <h4 className="text-lg font-medium text-gray-700 flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-gray-500" /> {edu.institution}
                      </h4>
                      <p className="text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {edu.location}
                      </p>
                      {edu.fieldOfStudy && (
                        <p className="text-gray-600 mt-1 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-gray-500" /> 
                          Field of Study: {edu.fieldOfStudy}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0 text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      {' - '}
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                    </div>
                  </div>
                  
                  {edu.skillsAcquired && edu.skillsAcquired.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-1 text-blue-600" /> Skills Acquired:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {edu.skillsAcquired.map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 border-none">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Services Section */}
      {userServices && userServices.length > 0 && (
        <div className="p-8 md:p-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userServices.map((service) => (
                <div key={service.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <Badge className="bg-green-100 text-green-800 border-none">
                        {service.category}
                      </Badge>
                      <div className="text-lg font-semibold text-gray-800">
                        {service.priceUsd ? `$${service.priceUsd}` : ''}
                        {service.priceInr ? `₹${service.priceInr}` : ''}
                        {service.isHourly ? '/hour' : ''}
                      </div>
                    </div>
                    
                    {service.features && service.features.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Features:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {service.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}