import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase, Palette, Instagram, Twitter, Linkedin, MapPin } from "lucide-react";
import { UserData } from "@/types/user";
import { useCurrentCompany } from "@/hooks/use-current-company";

interface ArtisticCardProps {
  userData: UserData;
}

const ArtisticCard: React.FC<ArtisticCardProps> = ({ userData }) => {
  // State to track hover and animations
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredContact, setHoveredContact] = useState<string | null>(null);
  
  // Get current company from latest work experience or use fallback
  const { company } = useCurrentCompany(userData.id, userData.company || "Brandentifier");
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle contact actions
  const handleContactClick = (type: string) => {
    switch (type) {
      case "email":
        window.location.href = `mailto:${userData.email}`;
        break;
      case "phone":
        if (userData.phoneNumber) {
          window.location.href = `tel:${userData.phoneNumber}`;
        }
        break;
      case "linkedin":
        window.open("https://linkedin.com", "_blank");
        break;
      case "instagram":
        window.open("https://instagram.com", "_blank");
        break;
      case "twitter":
        window.open("https://twitter.com", "_blank");
        break;
    }
  };
  
  return (
    <div 
      className="artistic-card w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredContact(null);
      }}
    >
      {/* Animated watercolor background effect */}
      <div className="absolute inset-0 bg-white overflow-hidden">
        {/* Dynamic watercolor animation */}
        <div className="absolute inset-0 watercolor-animate">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_30%,#ffddd2_0%,transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_70%_60%,#e29578_0%,transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_40%_80%,#83c5be_0%,transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_20%,#006d77_0%,transparent_70%)]"></div>
        </div>
        
        {/* SVG watercolor pattern with animation */}
        <svg className="w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <filter id="watercolorAnimate" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" seed="5">
                <animate 
                  attributeName="baseFrequency" 
                  from="0.01" 
                  to="0.02" 
                  dur="30s" 
                  repeatCount="indefinite" 
                  values="0.01;0.02;0.01" 
                  keyTimes="0;0.5;1"
                />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" result="displacement" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#ffffff" filter="url(#watercolorAnimate)" />
          
          {/* Animated paint strokes */}
          <path className="paint-stroke stroke-1" d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50" stroke="#83c5be" strokeWidth="60" fill="none" opacity="0.3" />
          <path className="paint-stroke stroke-2" d="M0,150 Q50,130 100,150 T200,150 T300,150 T400,150" stroke="#e29578" strokeWidth="40" fill="none" opacity="0.3" />
        </svg>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Artistic header with brushstroke animation */}
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4">
            {/* Ink splash around photo - appears with brushstroke animation */}
            <svg className="absolute -inset-4 w-36 h-36 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <path 
                className="ink-splash" 
                d="M100,20 C130,10 150,30 150,60 C150,90 130,120 100,130 C70,140 40,130 30,100 C20,70 30,40 50,30 C70,20 90,20 100,20 Z" 
                fill="none" 
                stroke="#006d77" 
                strokeWidth="2" 
                opacity="0.7" 
              />
            </svg>
            
            {/* Profile photo */}
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#006d77]/70 mx-auto relative z-10">
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
            
            {/* Animated brushstroke under photo */}
            <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-8">
              <path 
                className="brush-stroke" 
                d="M0,4 Q20,8 40,4 T80,4 T120,4 T160,4" 
                stroke="#006d77" 
                strokeWidth="2" 
                fill="none" 
              />
            </svg>
          </div>
          
          {/* Name with brushstroke reveal */}
          <h2 
            className="text-2xl font-bold text-[#006d77] brush-reveal" 
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {userData.name || "Your Name"}
          </h2>
          
          {/* Title with brushstroke reveal */}
          <p 
            className="text-md text-[#e29578] italic mt-1 brush-reveal" 
            style={{ fontFamily: "'Georgia', serif", animationDelay: "0.2s" }}
          >
            {userData.title || "Professional"}
          </p>
          
          {/* Industry with animated underline */}
          {userData.industry && (
            <div className="relative mt-2 inline-block brush-reveal" style={{ animationDelay: "0.3s" }}>
              <div className="text-sm text-[#006d77]/80">
                {userData.industry.includes(': ') ? (
                  <>
                    <span>{userData.industry.split(': ')[0]}</span>
                    <span className="mx-1">•</span>
                    <span>{userData.industry.split(': ')[1]}</span>
                  </>
                ) : (
                  <span>{userData.industry}</span>
                )}
              </div>
              <svg className="absolute -bottom-2 left-0 w-full h-4">
                <path 
                  className="brush-underline" 
                  d="M0,2 Q10,4 20,2 T40,2 T60,2 T80,2 T100,2" 
                  stroke="#e29578" 
                  strokeWidth="1" 
                  fill="none" 
                />
              </svg>
            </div>
          )}
        </div>
        
        {/* Contact details with painterly hover effects */}
        <div className="flex-1 space-y-4">
          {/* Organic shape container with brushstroke animation */}
          <div 
            className="contact-container bg-white/80 p-5 space-y-4 relative overflow-hidden brush-reveal" 
            style={{ 
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              animationDelay: "0.5s" 
            }}
          >
            {/* Animated background wash */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <path 
                className="wash-animate" 
                d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50" 
                stroke="#83c5be" 
                strokeWidth="60" 
                fill="none" 
              />
            </svg>
            
            {/* Company with ink effect */}
            {company && (
              <div 
                className="flex items-center gap-3 ink-item"
                onMouseEnter={() => setHoveredContact("company")}
                onMouseLeave={() => setHoveredContact(null)}
              >
                <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center ink-icon">
                  <Briefcase className="h-5 w-5 text-[#006d77]" />
                </div>
                <span 
                  className="text-sm text-[#006d77]" 
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {company}
                </span>
              </div>
            )}
            
            {/* Email with ink effect */}
            <div 
              className="flex items-center gap-3 ink-item"
              onClick={() => handleContactClick("email")}
              onMouseEnter={() => setHoveredContact("email")}
              onMouseLeave={() => setHoveredContact(null)}
            >
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center ink-icon">
                <Mail className="h-5 w-5 text-[#006d77]" />
              </div>
              <span 
                className="text-sm text-[#006d77]" 
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {userData.email}
              </span>
              {hoveredContact === "email" && (
                <div className="absolute left-0 right-0 h-full bg-[#83c5be]/10 brush-reveal-fast"></div>
              )}
            </div>
            
            {/* Phone with ink effect */}
            <div 
              className="flex items-center gap-3 ink-item"
              onClick={() => handleContactClick("phone")}
              onMouseEnter={() => setHoveredContact("phone")}
              onMouseLeave={() => setHoveredContact(null)}
            >
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center ink-icon">
                <Phone className="h-5 w-5 text-[#006d77]" />
              </div>
              <span 
                className="text-sm text-[#006d77]" 
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {userData.phoneNumber || "Add phone number"}
              </span>
              {hoveredContact === "phone" && (
                <div className="absolute left-0 right-0 h-full bg-[#83c5be]/10 brush-reveal-fast"></div>
              )}
            </div>
            
            {/* Profile link with ink effect */}
            <div 
              className="flex items-center gap-3 ink-item"
              onMouseEnter={() => setHoveredContact("profile")}
              onMouseLeave={() => setHoveredContact(null)}
            >
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center ink-icon">
                <Globe className="h-5 w-5 text-[#006d77]" />
              </div>
              <span 
                className="text-sm text-[#006d77]" 
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {profileLink}
              </span>
              {hoveredContact === "profile" && (
                <div className="absolute left-0 right-0 h-full bg-[#83c5be]/10 brush-reveal-fast"></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional info revealed on hover with brushstroke animation */}
        <div 
          className={`absolute inset-0 bg-white/80 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Palette className="h-16 w-16 text-[#83c5be] mb-4 brush-reveal-icon" />
          
          <h3 
            className="text-xl font-bold text-[#006d77] mb-3 brush-reveal" 
            style={{ fontFamily: "'Georgia', serif", animationDelay: "0.1s" }}
          >
            About Me
          </h3>
          
          <p 
            className="text-center text-[#006d77]/80 mb-6 max-w-xs brush-reveal" 
            style={{ fontFamily: "'Georgia', serif", animationDelay: "0.2s" }}
          >
            {userData.lookingFor || `Professional with experience in ${userData.industry || 'various industries'}. Let's connect and explore opportunities together.`}
          </p>
          
          {/* Social media icons with brush effect */}
          <div className="flex space-x-4 mt-4 brush-reveal" style={{ animationDelay: "0.4s" }}>
            <button 
              className="h-12 w-12 rounded-full bg-[#e29578]/20 flex items-center justify-center hover:bg-[#e29578]/30 transition-colors duration-300 ink-icon"
              onClick={() => handleContactClick("linkedin")}
            >
              <Linkedin className="h-6 w-6 text-[#006d77]" />
            </button>
            
            <button 
              className="h-12 w-12 rounded-full bg-[#e29578]/20 flex items-center justify-center hover:bg-[#e29578]/30 transition-colors duration-300 ink-icon"
              onClick={() => handleContactClick("instagram")}
            >
              <Instagram className="h-6 w-6 text-[#006d77]" />
            </button>
            
            <button 
              className="h-12 w-12 rounded-full bg-[#e29578]/20 flex items-center justify-center hover:bg-[#e29578]/30 transition-colors duration-300 ink-icon"
              onClick={() => handleContactClick("twitter")}
            >
              <Twitter className="h-6 w-6 text-[#006d77]" />
            </button>
          </div>
        </div>
        
        {/* Artistic footer with animated brushstrokes */}
        <div className="mt-6 text-center relative">
          <svg className="absolute -top-6 left-0 w-full h-6 opacity-70">
            <path 
              className="brush-stroke-top" 
              d="M0,4 Q40,0 80,4 T160,4 T240,4 T320,4" 
              stroke="#e29578" 
              strokeWidth="2" 
              fill="none" 
            />
          </svg>
          <div className="relative inline-block px-6 py-1 bg-[#006d77]/10 brush-reveal" style={{ animationDelay: "0.7s" }}>
            <p className="text-xs text-[#006d77] tracking-widest" style={{ fontFamily: "'Georgia', serif" }}>
              QUANTUM CARD
            </p>
          </div>
          <svg className="absolute -bottom-6 left-0 w-full h-6 opacity-70">
            <path 
              className="brush-stroke-bottom" 
              d="M0,2 Q40,6 80,2 T160,2 T240,2 T320,2" 
              stroke="#e29578" 
              strokeWidth="2" 
              fill="none" 
            />
          </svg>
        </div>
      </div>
      
      {/* Animation effects are defined in global CSS */}
    </div>
  );
};

export default ArtisticCard;