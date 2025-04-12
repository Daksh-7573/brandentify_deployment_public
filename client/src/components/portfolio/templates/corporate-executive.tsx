import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState } from "react";
import { 
  Mail, Linkedin, MapPin, Calendar, Download, FileText, ChevronRight,
  Briefcase, GraduationCap, Award, Target, ChartBar, Presentation,
  TrendingUp, Globe, BarChart2, Star, Database, UserCheck
} from "lucide-react";

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
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
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
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
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
  
  // Sort services by title
  const sortedServices = [...userServices].sort((a, b) => 
    (a.title || '').localeCompare(b.title || '')
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
      /* Corporate Executive Template - Premium Styling */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
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
        background: #b8860b; /* Gold accent color */
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
        background: #b8860b; /* Gold accent color */
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
        border-color: #b8860b;
        box-shadow: 0 2px 10px rgba(184, 134, 11, 0.1);
        transform: translateY(-2px);
      }
      
      .corporate-executive-template .profile-image-frame {
        position: relative;
        border-radius: 50%;
        overflow: hidden;
      }
      
      .corporate-executive-template .profile-image-frame::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid #b8860b; /* Gold accent color */
        border-radius: 50%;
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
        background: #b8860b; /* Gold accent color */
      }
      
      .corporate-executive-template .project-card {
        transition: all 0.3s ease;
        border: 1px solid #f3f4f6;
      }
      
      .corporate-executive-template .project-card:hover {
        border-color: #b8860b;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        transform: translateY(-3px);
      }
      
      .corporate-executive-template .service-card {
        transition: all 0.3s ease;
        border-top: 3px solid transparent;
      }
      
      .corporate-executive-template .service-card:hover {
        border-top-color: #b8860b;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      }
      
      .corporate-executive-template .btn-primary {
        background: linear-gradient(135deg, #b8860b, #daa520);
        background-size: 200% 200%;
        animation: gradientShift 4s ease infinite;
        transition: all 0.3s ease;
        color: white;
        font-weight: 500;
      }
      
      .corporate-executive-template .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.2);
      }
      
      .corporate-executive-template .btn-outline {
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
      }
      
      .corporate-executive-template .btn-outline:hover {
        border-color: #b8860b;
        color: #b8860b;
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
  
  const formatDate = (dateString: string, showMonthName = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (showMonthName) {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    
    return date.getFullYear().toString();
  };
  
  return (
    <div className="corporate-executive-template bg-white">
      {/* Fixed Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between">
            {/* Name/Logo */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                {userInfo.name}
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
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                className="btn-primary text-white text-sm px-4 py-2 rounded-md flex items-center"
                onClick={() => userInfo.email ? window.location.href = `mailto:${userInfo.email}` : null}
              >
                <Mail className="h-4 w-4 mr-2" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Schedule</span>
              </Button>
              <Button 
                variant="outline"
                className="btn-outline text-sm px-4 py-2 rounded-md flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Resume</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section id="about" className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Profile Image */}
            <div className="w-full md:w-1/4 flex justify-center md:justify-start fade-in">
              <div className="profile-image-frame w-48 h-48">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Intro Content */}
            <div className="w-full md:w-3/4 flex flex-col">
              <div className="fade-in">
                <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {userInfo.name}
                </h1>
                
                <h2 className="text-2xl text-gray-700 mb-6 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
                  I am a {userInfo.title || "Strategic Growth Advisor"}
                </h2>
              </div>
              
              <div className="flex items-center text-gray-500 mb-6 fade-in fade-in-delay-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {userInfo.location || "New York, United States"}
                </span>
              </div>
              
              {/* Industry / Domain Badges */}
              <div className="flex flex-wrap gap-3 mb-6 fade-in fade-in-delay-1">
                {userInfo.industry && (
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md px-3 py-1.5">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.industry}</span>
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md px-3 py-1.5">
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.domain}</span>
                  </Badge>
                )}
              </div>
              
              {/* Looking For */}
              {userInfo.lookingFor && (
                <div className="mb-8 fade-in fade-in-delay-2">
                  <Badge className="bg-[#1e3a8a]/5 text-[#1e3a8a] hover:bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 font-medium rounded-md px-4 py-2">
                    <Target className="h-4 w-4 mr-2" />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{userInfo.lookingFor}</span>
                  </Badge>
                </div>
              )}
              
              {/* Executive Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm mb-8 fade-in fade-in-delay-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What I'm All About
                </h3>
                <div className="flex">
                  <div className="text-[#b8860b] mr-3 flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                  </div>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {userInfo.lookingFor || 
                    `Backed by 20+ years of global leadership experience in driving strategic growth and transformation. 
                    I combine analytical rigor with innovative thinking to deliver exceptional results for organizations 
                    navigating complex business challenges and market opportunities.`}
                  </p>
                </div>
              </div>
              
              {/* Contact/Connect */}
              <div className="flex items-center gap-4 fade-in fade-in-delay-3">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`} 
                    className="text-gray-500 hover:text-[#b8860b] transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-[#b8860b] transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
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
                    <div className="p-2 bg-gray-50 rounded-md text-[#b8860b]">
                      {getSkillIcon(skill.name)}
                    </div>
                    <h3 className="text-gray-900 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {skill.name}
                    </h3>
                  </div>
                  
                  {/* Proficiency Level */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full ${i < (skill.proficiency || 3) ? 'bg-[#b8860b]' : 'bg-gray-200'}`} 
                        style={{ width: '12px' }}
                      ></div>
                    ))}
                    <span className="ml-2 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {skill.proficiency ? `${skill.proficiency}/5` : ''}
                    </span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            What I Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedServices.length > 0 ? (
              sortedServices.slice(0, 3).map((service, index) => (
                <div 
                  key={service.id} 
                  className="service-card bg-white rounded-lg p-6 shadow-sm fade-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    {service.pricing && (
                      <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {service.pricing}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline"
                      className="text-sm px-4 py-2 rounded-md flex items-center"
                    >
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>Inquire</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Default services when none are provided
              <>
                {[
                  {
                    title: "Strategic Advisory",
                    description: "Expert guidance on business strategy, growth initiatives, and market positioning to help your organization achieve its full potential.",
                    pricing: "Custom engagement"
                  },
                  {
                    title: "Executive Coaching",
                    description: "Personalized coaching for senior leaders and executives focused on leadership development, decision-making, and organizational effectiveness.",
                    pricing: "Starting at $5,000"
                  },
                  {
                    title: "Board Directorship",
                    description: "Experienced board member bringing strategic oversight, governance expertise, and industry knowledge to drive corporate success.",
                    pricing: "On Request"
                  }
                ].map((service, index) => (
                  <div 
                    key={index} 
                    className="service-card bg-white rounded-lg p-6 shadow-sm fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {service.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {service.pricing}
                      </div>
                      
                      <Button 
                        variant="outline"
                        className="text-sm px-4 py-2 rounded-md flex items-center"
                      >
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Inquire</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Showcase (Projects) Section */}
      <section id="projects" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            Showcase
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.length > 0 ? (
              sortedProjects.slice(0, 6).map((project, index) => (
                <div 
                  key={project.id} 
                  className="project-card bg-white rounded-lg overflow-hidden shadow-sm fade-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
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
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(project.startDate, true)}
                      </div>
                      
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#b8860b] text-sm flex items-center hover:underline"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <span>View Details</span>
                          <ChevronRight className="h-4 w-4" />
                        </a>
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
      <section id="experience" className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            Career Path
          </h2>
          
          <div className="mb-16">
            {sortedExperiences.length > 0 ? (
              <div className="space-y-3">
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id} 
                    className="timeline-item fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                  >
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {exp.title}
                          </h3>
                          <p className="text-[#b8860b] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {exp.company}
                          </p>
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                          </span>
                        </div>
                      </div>
                      
                      {exp.location && (
                        <div className="flex items-center text-sm text-gray-500 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                      
                      {exp.description && (
                        <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {exp.description}
                        </p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-10 accent-border" style={{ fontFamily: 'Playfair Display, serif' }}>
            Academic Background
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedEducations.length > 0 ? (
              sortedEducations.map((edu, index) => (
                <div 
                  key={edu.id} 
                  className="bg-white rounded-lg p-6 shadow-sm fade-in"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {edu.degree}
                      </h3>
                      <p className="text-[#b8860b] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {edu.institution}
                      </p>
                    </div>
                    
                    <Badge className="bg-gray-100 text-gray-600 h-fit whitespace-nowrap">
                      {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                    </Badge>
                  </div>
                  
                  {edu.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{edu.location}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 border border-gray-100 rounded-lg bg-white">
                <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your academic background will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="py-16 px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Connect?
              </h2>
              <p className="text-gray-300 mb-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                Let's discuss how I can bring value to your organization
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                className="btn-primary text-white px-6 py-3 rounded-md flex items-center"
                onClick={() => userInfo.email ? window.location.href = `mailto:${userInfo.email}` : null}
              >
                <Mail className="h-4 w-4 mr-2" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Schedule a Call</span>
              </Button>
              
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-6 py-3 rounded-md flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Download Resume</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              © {new Date().getFullYear()} {userInfo.name} • All Rights Reserved
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}