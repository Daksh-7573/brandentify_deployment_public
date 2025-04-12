import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState } from "react";
import { 
  Mail, Linkedin, MapPin, Camera, Film, Calendar, CheckCircle,
  Download, Sparkles, Github, MessagesSquare, ExternalLink, 
  Instagram, Zap, Palette, ArrowUpRight, Compass
} from "lucide-react";

interface VisualExpertProps {
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

export default function VisualExpert({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: VisualExpertProps) {
  const [typedText, setTypedText] = useState("");
  const titleText = userInfo.title || "Visual Brand Architect";
  
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
  
  // Initialize animations, styles, and typewriter effect on component mount
  useEffect(() => {
    // Add web fonts - Playfair Display (heading), Poppins (body)
    const playfairLink = document.createElement('link');
    playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap';
    playfairLink.rel = 'stylesheet';
    
    const poppinsLink = document.createElement('link');
    poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    poppinsLink.rel = 'stylesheet';
    
    document.head.appendChild(playfairLink);
    document.head.appendChild(poppinsLink);
    
    // Add CSS for animations and styles
    const style = document.createElement('style');
    style.textContent = `
      /* Visual Expert Template Animations & Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes zoomIn {
        from { transform: scale(1); }
        to { transform: scale(1.05); }
      }
      
      @keyframes floatAnimation {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(125, 211, 252, 0.5); }
        70% { box-shadow: 0 0 0 15px rgba(125, 211, 252, 0); }
        100% { box-shadow: 0 0 0 0 rgba(125, 211, 252, 0); }
      }
      
      .visual-expert-template .section-heading {
        font-family: 'Playfair Display', serif;
        position: relative;
        display: inline-block;
        margin-bottom: 2rem;
      }
      
      .visual-expert-template .section-heading::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 40%;
        height: 3px;
        background: linear-gradient(90deg, #7dd3fc, #818cf8);
        border-radius: 8px;
      }
      
      .visual-expert-template .hero-container {
        position: relative;
        overflow: hidden;
      }
      
      .visual-expert-template .hero-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, #111827, #1e293b);
        z-index: -1;
      }
      
      .visual-expert-template .hero-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237dd3fc' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
        opacity: 0.3;
        z-index: -1;
      }
      
      .visual-expert-template .profile-frame {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        transform-style: preserve-3d;
        transition: transform 0.5s ease;
      }
      
      .visual-expert-template .profile-frame:hover {
        transform: translateY(-10px) rotateY(5deg);
      }
      
      .visual-expert-template .profile-frame::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #7dd3fc, #818cf8, #c084fc, #7dd3fc);
        z-index: -1;
        border-radius: 10px;
        animation: pulseGlow 2s infinite;
      }
      
      .visual-expert-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .visual-expert-template .fade-in-right {
        opacity: 0;
        animation: fadeInRight 0.8s ease-out forwards;
      }
      
      .visual-expert-template .project-card {
        position: relative;
        overflow: hidden;
        border-radius: 12px;
        transition: all 0.4s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .visual-expert-template .project-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }
      
      .visual-expert-template .project-card:hover .project-image {
        transform: scale(1.1);
      }
      
      .visual-expert-template .project-card:hover .project-overlay {
        opacity: 1;
      }
      
      .visual-expert-template .project-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
      }
      
      .visual-expert-template .project-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.3));
        padding: 1.5rem;
        opacity: 0;
        transition: opacity 0.4s ease;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      
      .visual-expert-template .skill-card {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        border-radius: 12px;
      }
      
      .visual-expert-template .skill-card:hover {
        transform: translateY(-5px);
      }
      
      .visual-expert-template .skill-card:hover .skill-icon {
        transform: scale(1.1);
      }
      
      .visual-expert-template .skill-icon {
        transition: transform 0.3s ease;
      }
      
      .visual-expert-template .service-card {
        position: relative;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
      
      .visual-expert-template .service-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
      }
      
      .visual-expert-template .service-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 6px;
        background: linear-gradient(to right, #7dd3fc, #818cf8);
      }
      
      .visual-expert-template .timeline {
        position: relative;
        padding-left: 2rem;
      }
      
      .visual-expert-template .timeline::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 2px;
        background: linear-gradient(to bottom, #7dd3fc, #818cf8);
      }
      
      .visual-expert-template .timeline-node {
        position: relative;
      }
      
      .visual-expert-template .timeline-node::before {
        content: '';
        position: absolute;
        top: 0.75rem;
        left: -2rem;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background: #7dd3fc;
        border: 2px solid white;
        z-index: 1;
      }
      
      .visual-expert-template .sticky-cta {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 50;
        animation: floatAnimation 3s ease-in-out infinite;
      }
      
      /* Staggered animations */
      .visual-expert-template .fade-in:nth-child(1) { animation-delay: 0.1s; }
      .visual-expert-template .fade-in:nth-child(2) { animation-delay: 0.2s; }
      .visual-expert-template .fade-in:nth-child(3) { animation-delay: 0.3s; }
      .visual-expert-template .fade-in:nth-child(4) { animation-delay: 0.4s; }
      .visual-expert-template .fade-in:nth-child(5) { animation-delay: 0.5s; }
      
      /* Masonry Grid layout */
      .visual-expert-template .masonry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        grid-auto-rows: 280px;
        grid-gap: 20px;
      }
      
      .visual-expert-template .masonry-item-tall {
        grid-row: span 2;
      }
      
      .visual-expert-template .masonry-item-wide {
        grid-column: span 2;
      }
      
      @media (max-width: 768px) {
        .visual-expert-template .masonry-item-wide,
        .visual-expert-template .masonry-item-tall {
          grid-column: span 1;
          grid-row: span 1;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Typewriter effect for title
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < titleText.length) {
        setTypedText(titleText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);
    
    return () => {
      clearInterval(typeInterval);
      document.head.removeChild(style);
      document.head.removeChild(playfairLink);
      document.head.removeChild(poppinsLink);
    };
  }, [titleText]);
  
  return (
    <div className="visual-expert-template w-full bg-white">
      {/* Hero Section */}
      <section className="hero-container relative py-16 md:py-24 px-6 md:px-12 overflow-hidden bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Profile Picture */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start">
              <div className="profile-frame w-64 h-80">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            
            {/* Intro Content */}
            <div className="w-full md:w-2/3 text-center md:text-left">
              <div className="fade-in">
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-gradient-to-r from-sky-300 to-indigo-400 bg-opacity-20 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {userInfo.lookingFor || "Available for Projects"}
                  </span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-4 fade-in" style={{ fontFamily: "Playfair Display, serif" }}>
                I'm a <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">{typedText}</span>
                <span className="animate-pulse">|</span>
              </h1>
              
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 mb-6 fade-in">
                <MapPin className="h-5 w-5 text-sky-300" />
                <span className="text-gray-300 font-light" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {userInfo.location || "San Francisco, California"}
                </span>
              </div>
              
              {/* Domain/Industry Tags */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8 fade-in">
                {userInfo.domain && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 px-3 py-1.5">
                    #{userInfo.domain}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge className="bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 px-3 py-1.5">
                    #{userInfo.industry}
                  </Badge>
                )}
                <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-3 py-1.5">
                  #Creative
                </Badge>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-4 justify-center md:justify-start fade-in">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`} 
                    className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Email me"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Github Profile"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What I'm All About Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            What I'm All About
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12 relative">
              {/* Background texture */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-30"></div>
              
              <div className="relative z-10">
                <p className="text-lg text-gray-700 leading-relaxed mb-6 fade-in" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {userInfo.lookingFor || `As a ${userInfo.title || "creative professional"}, I bridge the gap between imagination and execution. 
                  My approach combines strategic thinking with creative problem-solving to deliver work that doesn't just look good but achieves real results.
                  I believe that great design tells a story and creates meaningful connections with audiences.`}
                </p>
                
                <div className="flex items-center gap-4 fade-in">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-8 w-8 text-sky-500" />
                  </div>
                  <p className="text-gray-600 italic" style={{ fontFamily: "Poppins, sans-serif" }}>
                    "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What I'm Good At (Skills) Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            What I'm Good At
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sortedSkills.length > 0 ? (
              sortedSkills.slice(0, 8).map((skill, index) => (
                <div 
                  key={skill.id} 
                  className="skill-card bg-gradient-to-br from-gray-50 to-white p-6 border border-gray-100 shadow-md fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="skill-icon mb-4 p-3 rounded-full bg-sky-100 text-sky-500">
                      {index % 4 === 0 ? <Palette className="h-6 w-6" /> : 
                       index % 4 === 1 ? <Sparkles className="h-6 w-6" /> : 
                       index % 4 === 2 ? <Compass className="h-6 w-6" /> : 
                       <Zap className="h-6 w-6" />}
                    </div>
                    
                    <h3 className="text-gray-900 font-medium mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {skill.name}
                    </h3>
                    
                    <div className="flex">
                      {Array.from({length: 5}).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full mx-0.5 ${i < (skill.proficiency || 3) ? 'bg-sky-500' : 'bg-gray-200'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state with default skills
              <>
                {["Creative Direction", "Visual Design", "Brand Strategy", "UI/UX Design"].map((skill, index) => (
                  <div 
                    key={index} 
                    className="skill-card bg-gradient-to-br from-gray-50 to-white p-6 border border-gray-100 shadow-md fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="skill-icon mb-4 p-3 rounded-full bg-sky-100 text-sky-500">
                        {index % 4 === 0 ? <Palette className="h-6 w-6" /> : 
                         index % 4 === 1 ? <Sparkles className="h-6 w-6" /> : 
                         index % 4 === 2 ? <Compass className="h-6 w-6" /> : 
                         <Zap className="h-6 w-6" />}
                      </div>
                      
                      <h3 className="text-gray-900 font-medium mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {skill}
                      </h3>
                      
                      <div className="flex">
                        {Array.from({length: 5}).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full mx-0.5 ${i < 4 ? 'bg-sky-500' : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* What I Offer (Services) Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            What I Offer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedServices.length > 0 ? (
              sortedServices.slice(0, 3).map((service, index) => (
                <div 
                  key={service.id} 
                  className="service-card bg-white fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="p-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "Playfair Display, serif" }}>
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {service.description}
                    </p>
                    
                    {service.pricing && (
                      <div className="bg-sky-50 p-4 rounded-lg mb-6">
                        <p className="text-sky-800 font-medium" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {service.pricing}
                        </p>
                      </div>
                    )}
                    
                    <Button className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white">
                      Hire Me
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Empty state with default services
              <>
                {[
                  { title: "Brand Design", description: "Strategic brand identity development and visual design systems that help businesses stand out in crowded markets.", price: "Starting at $2,000" },
                  { title: "UI/UX Design", description: "User-centered digital experiences that balance beautiful interfaces with practical usability and conversion optimization.", price: "Starting at $3,500" },
                  { title: "Art Direction", description: "Creative leadership for campaigns and projects, ensuring visual consistency and impact across all deliverables.", price: "Custom Quote" }
                ].map((service, index) => (
                  <div 
                    key={index} 
                    className="service-card bg-white fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="p-8">
                      <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "Playfair Display, serif" }}>
                        {service.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {service.description}
                      </p>
                      
                      <div className="bg-sky-50 p-4 rounded-lg mb-6">
                        <p className="text-sky-800 font-medium" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {service.price}
                        </p>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white">
                        Hire Me
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
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            Showcase
          </h2>
          
          <div className="masonry-grid">
            {sortedProjects.length > 0 ? (
              sortedProjects.slice(0, 6).map((project, index) => {
                // Determine if item should be wide or tall based on index
                const isWide = index % 3 === 0;
                const isTall = index % 4 === 1;
                
                return (
                  <div 
                    key={project.id} 
                    className={`project-card fade-in 
                      ${isWide ? 'masonry-item-wide' : ''} 
                      ${isTall ? 'masonry-item-tall' : ''}
                    `}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {/* Project thumbnail */}
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="project-image" 
                      />
                    ) : (
                      <div 
                        className="project-image flex items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-500" 
                      >
                        <Camera className="h-16 w-16 text-white opacity-70" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="project-overlay">
                      {project.category && (
                        <Badge className="absolute top-4 left-4 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                          {project.category}
                        </Badge>
                      )}
                      
                      <h3 className="text-white text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                        {project.title}
                      </h3>
                      
                      {project.description && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex gap-3">
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-white/90">
                          View Details
                        </Button>
                        
                        {project.projectUrl && (
                          <a 
                            href={project.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-white bg-white/20 hover:bg-white/30 rounded-md px-3 py-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="text-sm">Visit</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty state for projects
              <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Your showcase projects will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Career Path (Experience) Section */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            Career Path
          </h2>
          
          <div className="timeline pb-8">
            {sortedExperiences.length > 0 ? (
              sortedExperiences.slice(0, 4).map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="timeline-node pb-12 fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
                          {exp.title}
                        </h3>
                        <p className="text-indigo-600 font-medium mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {exp.company}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} — 
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    {exp.location && (
                      <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                          {exp.location}
                        </span>
                      </div>
                    )}
                    
                    {exp.description && (
                      <p className="text-gray-600 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {exp.description}
                      </p>
                    )}
                    
                    {exp.industry && (
                      <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                        {exp.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Empty state for experiences
              <div className="timeline-node pb-12 fade-in">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Your career experience will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Academic Background Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-3xl font-bold text-gray-900 fade-in">
            Academic Background
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedEducations.length > 0 ? (
              sortedEducations.slice(0, 2).map((edu, index) => (
                <div 
                  key={edu.id} 
                  className="fade-in bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-6 border border-gray-100"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                    {edu.degree}
                  </h3>
                  
                  <p className="text-indigo-600 font-medium mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {edu.institution}
                  </p>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {new Date(edu.startDate).getFullYear()} — {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </span>
                  </div>
                  
                  {edu.location && (
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {edu.location}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Empty state for education
              <div className="col-span-full flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="text-center">
                  <p className="text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Your academic background will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer / Contact */}
      <section className="py-16 px-6 md:px-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
                Get in Touch
              </h2>
              <p className="text-gray-300 mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                Let's connect and create something amazing together
              </p>
              
              <div className="flex gap-4">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`} 
                    className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <MessagesSquare className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white">
                <Mail className="h-4 w-4 mr-2" />
                Contact Me
              </Button>
              
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Grab My Resume
              </Button>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
              © {new Date().getFullYear()} {userInfo.name} • Made with Brandentifier
            </p>
          </div>
        </div>
      </section>
      
      {/* Sticky "Talk" CTA Button */}
      <div className="sticky-cta">
        <Button className="rounded-full w-14 h-14 flex items-center justify-center p-0 bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg">
          <MessagesSquare className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}