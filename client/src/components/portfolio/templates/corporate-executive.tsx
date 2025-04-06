import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect } from "react";
import { Mail, Linkedin, Phone, Award, Briefcase, Building, User, ArrowRight, Quote, ChevronRight, Star } from "lucide-react";

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
  userServices: Service[];
}

export default function CorporateExecutive({ userInfo, userSkills, userExperiences, userProjects, userServices = [] }: CorporateExecutiveProps) {
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Initialize animations and styles on component mount
  useEffect(() => {
    // Add web fonts for IBM Plex Sans and Garamond
    const ibmPlexLink = document.createElement('link');
    ibmPlexLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap';
    ibmPlexLink.rel = 'stylesheet';
    
    const garamondLink = document.createElement('link');
    garamondLink.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap';
    garamondLink.rel = 'stylesheet';
    
    document.head.appendChild(ibmPlexLink);
    document.head.appendChild(garamondLink);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Corporate Executive Template Animations & Styles */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes goldGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .corporate-executive-template .section-title {
        font-family: 'EB Garamond', serif;
        position: relative;
        display: inline-block;
      }
      
      .corporate-executive-template .section-title::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        width: 60px;
        height: 2px;
        background: #DAA520;
      }
      
      .corporate-executive-template .fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .corporate-executive-template .slide-in {
        opacity: 0;
        animation: slideIn 0.8s ease-out forwards;
      }
      
      .corporate-executive-template .gold-gradient-btn {
        background: linear-gradient(90deg, #DAA520, #F5DEB3, #DAA520);
        background-size: 200% 200%;
        animation: goldGradient 5s ease infinite;
        color: #0C1C2D;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .corporate-executive-template .gold-gradient-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(218, 165, 32, 0.3);
      }
      
      .corporate-executive-template .business-card {
        perspective: 1000px;
        position: relative;
      }
      
      .corporate-executive-template .business-card-inner {
        transition: transform 0.6s;
        transform-style: preserve-3d;
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .corporate-executive-template .business-card:hover .business-card-inner {
        transform: rotateY(180deg);
      }
      
      .corporate-executive-template .business-card-front, 
      .corporate-executive-template .business-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 0.5rem;
      }
      
      .corporate-executive-template .business-card-back {
        transform: rotateY(180deg);
      }
      
      .corporate-executive-template .testimonial-slider {
        transition: transform 0.5s ease;
      }
      
      /* Staggered animations */
      .corporate-executive-template .fade-in:nth-child(1) { animation-delay: 0.1s; }
      .corporate-executive-template .fade-in:nth-child(2) { animation-delay: 0.2s; }
      .corporate-executive-template .fade-in:nth-child(3) { animation-delay: 0.3s; }
      .corporate-executive-template .fade-in:nth-child(4) { animation-delay: 0.4s; }
      .corporate-executive-template .fade-in:nth-child(5) { animation-delay: 0.5s; }
      .corporate-executive-template .fade-in:nth-child(6) { animation-delay: 0.6s; }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      document.head.removeChild(ibmPlexLink);
      document.head.removeChild(garamondLink);
    };
  }, []);
  
  // Executive testimonials (for demo purposes)
  const testimonials = [
    {
      quote: "An exceptional leader with strategic vision and excellent execution.",
      author: "Jane Smith, CEO",
      company: "Global Enterprises"
    },
    {
      quote: "Brings deep industry expertise and innovative thinking to every challenge.",
      author: "Michael Johnson, Board Member",
      company: "Strategic Partners"
    },
    {
      quote: "Transformed our organization with visionary leadership and integrity.",
      author: "Sarah Williams, CFO",
      company: "Innovation Group"
    }
  ];
  
  return (
    <Card className="overflow-hidden shadow-xl corporate-executive-template" style={{ background: "#0C1C2D" }}>
      {/* Executive header */}
      <div className="relative">
        {/* Background pattern - subtle grid */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: `linear-gradient(#DAA520 1px, transparent 1px), linear-gradient(to right, #DAA520 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative px-8 pt-12 pb-16 flex flex-col md:flex-row gap-10 z-10">
          {/* Profile column */}
          <div className="md:w-1/3 flex flex-col items-center md:items-start">
            {/* Business card effect */}
            <div className="business-card w-64 h-36 mb-8">
              <div className="business-card-inner">
                {/* Front of card */}
                <div className="business-card-front bg-[#0C1C2D] border border-[#DAA520] p-5 flex items-center">
                  <div className="mr-4">
                    <div className="overflow-hidden w-16 h-16 rounded-full border-2 border-[#DAA520]">
                      <ProfileImage
                        src={userInfo.photoURL}
                        alt={userInfo.name || "Executive"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-white font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                      {userInfo.name}
                    </h2>
                    <p className="text-[#EAEAEA] text-sm" style={{ fontFamily: "EB Garamond, serif" }}>
                      {userInfo.title || "Executive Leader"}
                    </p>
                    <div className="h-0.5 w-12 bg-[#DAA520] mt-1"></div>
                  </div>
                </div>
                
                {/* Back of card */}
                <div className="business-card-back bg-[#0C1C2D] border border-[#DAA520] p-5">
                  <p className="text-[#EAEAEA] text-xs mb-2" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>CONTACT DETAILS</p>
                  <div className="space-y-1">
                    {userInfo.email && (
                      <div className="flex items-center text-[#EAEAEA] text-xs">
                        <Mail className="h-3 w-3 mr-2 text-[#DAA520]" />
                        <span>{userInfo.email}</span>
                      </div>
                    )}
                    <div className="flex items-center text-[#EAEAEA] text-xs">
                      <Linkedin className="h-3 w-3 mr-2 text-[#DAA520]" />
                      <span>linkedin.com/in/{userInfo.name?.toLowerCase().replace(/\s/g, '')}</span>
                    </div>
                    {userInfo.location && (
                      <div className="flex items-center text-[#EAEAEA] text-xs">
                        <Building className="h-3 w-3 mr-2 text-[#DAA520]" />
                        <span>{userInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Areas of expertise */}
            <div className="w-full">
              <h3 className="text-[#DAA520] text-lg mb-4 fade-in" style={{ fontFamily: "EB Garamond, serif" }}>Areas of Expertise</h3>
              <div className="grid grid-cols-1 gap-3 fade-in">
                {sortedSkills.length > 0 ? (
                  sortedSkills.slice(0, 6).map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#DAA520] mr-3"></div>
                        <span className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>{skill.name}</span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < (skill.proficiency || 0) ? "text-[#DAA520]" : "text-[#EAEAEA]/20"}`} 
                            fill={i < (skill.proficiency || 0) ? "#DAA520" : "transparent"}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // Default skills if none are provided
                  <>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#DAA520] mr-3"></div>
                      <span className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>Strategic Leadership</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#DAA520] mr-3"></div>
                      <span className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>Executive Management</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#DAA520] mr-3"></div>
                      <span className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>Corporate Governance</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#DAA520] mr-3"></div>
                      <span className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>Business Development</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* CTA button with gold gradient */}
              <button className="gold-gradient-btn mt-6 py-2 px-4 rounded w-full flex items-center justify-center gap-2 fade-in">
                <span>Download Resume</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Content column */}
          <div className="md:w-2/3">
            {/* Professional summary */}
            <div className="mb-8 fade-in">
              <h1 className="text-3xl text-white mb-2 section-title" style={{ fontFamily: "EB Garamond, serif" }}>
                Professional Summary
              </h1>
              <p className="text-[#EAEAEA] leading-relaxed mt-6" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                {userInfo.lookingFor || 
                `Accomplished executive leader with a proven track record of driving organizational growth and innovation. 
                Strategic thinker with expertise in ${userInfo.industry || "business"} leadership, organizational transformation, 
                and stakeholder management. Committed to delivering exceptional results through team empowerment and operational excellence.`}
              </p>
            </div>
            
            {/* Career highlights */}
            <div className="mb-8 fade-in">
              <h2 className="text-xl text-white mb-6 section-title" style={{ fontFamily: "EB Garamond, serif" }}>
                Career Highlights
              </h2>
              
              <div className="space-y-6 mt-6">
                {sortedExperiences.length > 0 ? (
                  sortedExperiences.slice(0, 3).map((exp, index) => (
                    <div key={exp.id} className="slide-in" style={{ animationDelay: `${0.2 * index}s` }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-[#DAA520] font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                            {exp.title}
                          </h3>
                          <p className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                            {exp.company}
                          </p>
                        </div>
                        <Badge className="bg-[#DAA520]/10 text-[#DAA520] border-[#DAA520] hover:bg-[#DAA520]/20">
                          {exp.startDate?.substring(0, 4)} — {exp.endDate ? exp.endDate.substring(0, 4) : 'Present'}
                        </Badge>
                      </div>
                      <p className="text-[#EAEAEA]/80 text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                        {exp.description}
                      </p>
                      <div className="h-px w-full bg-[#EAEAEA]/10 mt-4"></div>
                    </div>
                  ))
                ) : (
                  // Default experience if none is provided
                  <div className="slide-in">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-[#DAA520] font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {userInfo.title || "Chief Executive Officer"}
                        </h3>
                        <p className="text-white text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {userInfo.industry ? `${userInfo.industry} Corporation` : "Global Corporation"}
                        </p>
                      </div>
                      <Badge className="bg-[#DAA520]/10 text-[#DAA520] border-[#DAA520] hover:bg-[#DAA520]/20">
                        2020 — Present
                      </Badge>
                    </div>
                    <p className="text-[#EAEAEA]/80 text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                      Leading strategic initiatives to drive organizational growth and innovation. Overseeing operations, 
                      cultivating key partnerships, and ensuring sustainable business performance.
                    </p>
                    <div className="h-px w-full bg-[#EAEAEA]/10 mt-4"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Services */}
            <div className="mb-8 fade-in">
              <h2 className="text-xl text-white mb-6 section-title" style={{ fontFamily: "EB Garamond, serif" }}>
                Professional Services
              </h2>
              
              <div className="grid grid-cols-1 gap-6 mt-6">
                {userServices.length > 0 ? (
                  userServices.map((service, index) => (
                    <div key={service.id} className="bg-[#0E223A] p-5 border border-[#EAEAEA]/10 rounded-lg slide-in" style={{ animationDelay: `${0.2 * index}s` }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[#DAA520] font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {service.title}
                        </h3>
                        <Badge className="bg-[#DAA520]/10 text-[#DAA520] border-[#DAA520] hover:bg-[#DAA520]/20">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-[#EAEAEA]/80 text-sm mb-3" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                        {service.description}
                      </p>
                      
                      {service.features && ((typeof service.features === 'string' && service.features.trim() !== '' && JSON.parse(service.features).length > 0) || (Array.isArray(service.features) && service.features.length > 0)) && (
                        <div className="mt-3">
                          <p className="text-white text-xs uppercase mb-2" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>Service Includes:</p>
                          <div className="grid grid-cols-1 gap-1">
                            {(typeof service.features === 'string' ? JSON.parse(service.features) : service.features).map((feature: string, featureIndex: number) => (
                              <div key={featureIndex} className="flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#DAA520] mr-2"></div>
                                <span className="text-[#EAEAEA]/80 text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(service.priceUsd || service.priceInr) && (
                        <div className="mt-3 pt-2 border-t border-[#EAEAEA]/10">
                          <p className="text-[#DAA520] text-sm font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                            {service.priceUsd && `$${service.priceUsd}`}
                            {service.priceUsd && service.priceInr && ' / '}
                            {service.priceInr && `₹${service.priceInr}`}
                            {service.isHourly && ' per hour'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-[#0E223A] p-5 border border-[#EAEAEA]/10 rounded-lg slide-in">
                    <h3 className="text-[#DAA520] font-medium mb-2" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                      Strategic Consulting
                    </h3>
                    <p className="text-[#EAEAEA]/80 text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                      Providing high-level strategic guidance to help businesses navigate complex challenges and capitalize on growth opportunities.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Testimonials slider */}
            <div className="mb-8 fade-in">
              <h2 className="text-xl text-white mb-6 section-title" style={{ fontFamily: "EB Garamond, serif" }}>
                Executive Endorsements
              </h2>
              
              <div className="bg-[#0E223A] p-6 border border-[#EAEAEA]/10 rounded-lg mt-6">
                <div className="flex items-start">
                  <Quote className="text-[#DAA520] h-8 w-8 -mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <p className="text-white italic mb-4" style={{ fontFamily: "EB Garamond, serif", fontSize: "18px" }}>
                      {testimonials[0].quote}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#DAA520] font-medium" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {testimonials[0].author}
                        </p>
                        <p className="text-[#EAEAEA]/70 text-sm" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
                          {testimonials[0].company}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button className="w-7 h-7 rounded-full border border-[#DAA520] flex items-center justify-center text-[#DAA520]">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="border-t border-[#EAEAEA]/10 py-4 px-8">
        <div className="flex justify-between items-center">
          <p className="text-[#EAEAEA]/40 text-xs" style={{ fontFamily: "IBM Plex Sans, sans-serif" }}>
            &copy; {new Date().getFullYear()} {userInfo.name} | Powered by <span className="text-[#DAA520]">Brandentifier</span>
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 rounded-full border border-[#EAEAEA]/20 flex items-center justify-center text-[#EAEAEA]/60 hover:border-[#DAA520] hover:text-[#DAA520] transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-[#EAEAEA]/20 flex items-center justify-center text-[#EAEAEA]/60 hover:border-[#DAA520] hover:text-[#DAA520] transition-colors">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}