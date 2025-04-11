import React, { useState, useEffect } from "react";
import { UserData } from "@/types/user";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";

interface HolographicCardProps {
  userData: UserData;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ userData }) => {
  // State for sequential animation
  const [isLoaded, setIsLoaded] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showDesignation, setShowDesignation] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // Get current company from latest work experience
  const { company } = useCurrentCompany(userData.id);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Element-by-element reveal animation on load
  useEffect(() => {
    const loadSequence = async () => {
      setIsLoaded(true);
      
      // Profile picture appears first
      setTimeout(() => {
        setShowProfilePic(true);
      }, 400);
      
      // Then name appears
      setTimeout(() => {
        setShowName(true);
      }, 800);
      
      // Then designation
      setTimeout(() => {
        setShowDesignation(true);
      }, 1200);
      
      // Icons start to glow
      setTimeout(() => {
        setShowIcons(true);
      }, 1600);
      
      // All content is fully visible
      setTimeout(() => {
        setShowContent(true);
      }, 2000);
    };
    
    loadSequence();
    
    return () => {
      // Clean up any timeouts if component unmounts
    };
  }, []);
  
  return (
    <div 
      className={`w-full aspect-[2/3.5] rounded-lg overflow-hidden shadow-xl transition-all duration-500 
        ${isLoaded ? 'opacity-100' : 'opacity-0 blur-sm'}`}
      style={{
        background: "linear-gradient(135deg, rgba(147, 51, 234, 0.6) 0%, rgba(192, 38, 211, 0.6) 50%, rgba(236, 72, 153, 0.6) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3), 0 0 15px rgba(192, 38, 211, 0.5) inset",
      }}
    >
      {/* Background animated pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg, 
              rgba(255, 255, 255, 0.1), 
              rgba(255, 255, 255, 0.1) 10px, 
              transparent 10px, 
              transparent 20px
            )
          `,
          backgroundSize: "cover",
          animation: "holo-pattern 8s linear infinite",
        }}
      />
      
      {/* Holographic overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
          backgroundSize: "200% 200%",
          animation: "holo-shine 3s ease-in-out infinite",
        }}
      />
      
      {/* Card content */}
      <div className="relative h-full w-full flex flex-col text-white z-10">
        {/* Card header */}
        <div className="h-24 relative">
          {/* Profile picture with fade-in animation */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 top-12 transition-all duration-700 ease-in-out
              ${showProfilePic ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            <div 
              className="h-20 w-20 rounded-full border-4 border-white/80 overflow-hidden bg-white flex items-center justify-center shadow-lg"
              style={{
                boxShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
              }}
            >
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User");
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                  alt={userData.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 px-4 pt-14 pb-4 flex flex-col">
          {/* Name and title with fade-in animation */}
          <div className="text-center mb-3">
            <h2 
              className={`text-xl font-bold text-white transition-all duration-700 ease-in-out 
                ${showName ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}
            >
              {userData.name || "Your Name"}
            </h2>
            <p 
              className={`text-sm text-white/80 transition-all duration-700 ease-in-out
                ${showDesignation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}
            >
              {userData.title || "Add your designation"}
            </p>
          </div>
          
          {/* Details with staggered reveal animation */}
          <div className={`flex-1 space-y-4 text-xs transition-all duration-1000 ease-in-out
            ${showContent ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Domain */}
            {userData.domain && (
              <div 
                className={`flex items-center gap-2 transition-all duration-300
                  ${showIcons ? 'opacity-100' : 'opacity-0'}
                  ${hoveredElement === 'domain' ? 'scale-105' : 'scale-100'}`}
                onMouseEnter={() => setHoveredElement('domain')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/10
                  ${hoveredElement === 'domain' ? 'bg-white/30' : 'bg-white/10'}
                  transition-all duration-300 ease-in-out`}
                >
                  <Code 
                    className={`h-4 w-4 transition-all duration-500
                      ${hoveredElement === 'domain' ? 'text-white' : 'text-white/70'}`} 
                  />
                </div>
                <span className="text-white">
                  {userData.domain}
                </span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div 
                className={`flex items-center gap-2 transition-all duration-300 delay-100
                  ${showIcons ? 'opacity-100' : 'opacity-0'}
                  ${hoveredElement === 'industry' ? 'scale-105' : 'scale-100'}`}
                onMouseEnter={() => setHoveredElement('industry')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                  ${hoveredElement === 'industry' ? 'bg-white/30' : 'bg-white/10'}
                  transition-all duration-300 ease-in-out`}
                >
                  <Building2 
                    className={`h-4 w-4 transition-all duration-500
                      ${hoveredElement === 'industry' ? 'text-white' : 'text-white/70'}`} 
                  />
                </div>
                <span className="text-white">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Company */}
            {company && (
              <div 
                className={`flex items-center gap-2 transition-all duration-300 delay-200
                  ${showIcons ? 'opacity-100' : 'opacity-0'}
                  ${hoveredElement === 'company' ? 'scale-105' : 'scale-100'}`}
                onMouseEnter={() => setHoveredElement('company')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                  ${hoveredElement === 'company' ? 'bg-white/30' : 'bg-white/10'}
                  transition-all duration-300 ease-in-out`}
                >
                  <Briefcase 
                    className={`h-4 w-4 transition-all duration-500
                      ${hoveredElement === 'company' ? 'text-white' : 'text-white/70'}`} 
                  />
                </div>
                <span className="text-white">
                  {company}
                </span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div 
                className={`flex items-center gap-2 transition-all duration-300 delay-300
                  ${showIcons ? 'opacity-100' : 'opacity-0'}
                  ${hoveredElement === 'location' ? 'scale-105' : 'scale-100'}`}
                onMouseEnter={() => setHoveredElement('location')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                  ${hoveredElement === 'location' ? 'bg-white/30' : 'bg-white/10'}
                  transition-all duration-300 ease-in-out`}
                >
                  <MapPin 
                    className={`h-4 w-4 transition-all duration-500
                      ${hoveredElement === 'location' ? 'text-white' : 'text-white/70'}`} 
                  />
                </div>
                <span className="text-white">
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div 
              className={`flex items-center gap-2 transition-all duration-300 delay-400
                ${showIcons ? 'opacity-100' : 'opacity-0'}
                ${hoveredElement === 'email' ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setHoveredElement('email')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                ${hoveredElement === 'email' ? 'bg-white/30' : 'bg-white/10'}
                transition-all duration-300 ease-in-out`}
              >
                <Mail 
                  className={`h-4 w-4 transition-all duration-500
                    ${hoveredElement === 'email' ? 'text-white' : 'text-white/70'}`} 
                />
              </div>
              <span className="text-white">
                {userData.email}
              </span>
            </div>
            
            {/* Phone */}
            <div 
              className={`flex items-center gap-2 transition-all duration-300 delay-500
                ${showIcons ? 'opacity-100' : 'opacity-0'}
                ${hoveredElement === 'phone' ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setHoveredElement('phone')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                ${hoveredElement === 'phone' ? 'bg-white/30' : 'bg-white/10'}
                transition-all duration-300 ease-in-out`}
              >
                <Phone 
                  className={`h-4 w-4 transition-all duration-500
                    ${hoveredElement === 'phone' ? 'text-white' : 'text-white/70'}`} 
                />
              </div>
              <span className="text-white">
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            {/* Profile Link - special glowing effect */}
            <div 
              className={`flex items-center gap-2 transition-all duration-300 delay-600
                ${showIcons ? 'opacity-100' : 'opacity-0'}
                ${hoveredElement === 'profile' ? 'scale-105' : 'scale-100'}`}
              onMouseEnter={() => setHoveredElement('profile')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                ${hoveredElement === 'profile' ? 'bg-white/30' : 'bg-white/10'}
                transition-all duration-300 ease-in-out`}
              >
                <Globe 
                  className={`h-4 w-4 transition-all duration-500
                    ${hoveredElement === 'profile' ? 'text-white' : 'text-white/70'}`} 
                />
              </div>
              <span 
                className={`text-white
                  ${hoveredElement === 'profile' ? 'text-white' : 'text-white/80'}`}
                style={{
                  textShadow: hoveredElement === 'profile' 
                    ? '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)' 
                    : 'none'
                }}
              >
                {profileLink}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div 
          className={`h-6 bg-white/10 flex items-center justify-center transition-all duration-1000
            ${showContent ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="text-xs text-white font-light tracking-widest">QUANTUM CARD</span>
        </div>
      </div>

      {/* Add CSS animations - inline style for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes holo-shine {
            0%, 100% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
          }
          
          @keyframes holo-pattern {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 100% 100%;
            }
          }
        `
      }} />
    </div>
  );
};

export default HolographicCard;