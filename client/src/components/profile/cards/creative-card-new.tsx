import React, { useState, useEffect } from "react";
import { 
  Mail, 
  MapPin, 
  Building2, 
  Sparkles,
  Palette,
  Briefcase,
  TrendingUp,
  Headphones,
  FileBadge,
  GraduationCap,
  Link2
} from "lucide-react";
import { UserData } from "@/types/user";

// Creative Color Palette - New Duotone & Gradient Approach
const creativeColors = {
  // Primary duotone pairs
  primary: {
    coral: "#FF6888",
    lavender: "#B197FC",
    gradient: "linear-gradient(135deg, #FF6888 0%, #B197FC 100%)"
  },
  secondary: {
    turquoise: "#3EECAC",
    yellow: "#FFE551",
    gradient: "linear-gradient(135deg, #3EECAC 0%, #FFE551 100%)"
  },
  
  // Brushstroke colors
  brushstroke: {
    pink: "#FF8FA3",
    blue: "#9EB8FF",
    green: "#8CFFBA",
    orange: "#FFC08A"
  },
  
  // Background and text
  background: {
    light: "#FFFBF5",
    dark: "#332D41"
  },
  text: {
    primary: "#332D41",
    secondary: "#78758F",
    light: "#FFFFFF" 
  },
  
  // Action colors
  action: {
    primary: "#FF6D90",
    secondary: "#B197FC",
    tertiary: "#88E4FF",
    quaternary: "#FFD166"
  }
};

interface CreativeCardProps {
  userData: UserData;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ userData }) => {
  // Interactive states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Define industry icons and tags
  const getIndustryIcon = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('tech') || lowerTag.includes('software') || lowerTag.includes('develop'))
      return <Sparkles className="w-3 h-3" />;
    if (lowerTag.includes('design') || lowerTag.includes('creative') || lowerTag.includes('art'))
      return <Palette className="w-3 h-3" />;
    if (lowerTag.includes('business') || lowerTag.includes('manage') || lowerTag.includes('admin'))
      return <Briefcase className="w-3 h-3" />;
    if (lowerTag.includes('market') || lowerTag.includes('growth') || lowerTag.includes('sales'))
      return <TrendingUp className="w-3 h-3" />;
    return <Headphones className="w-3 h-3" />;
  };
  
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Get random brushstroke color
  const getRandomColor = (index: number) => {
    const colors = [
      creativeColors.brushstroke.pink,
      creativeColors.brushstroke.blue,
      creativeColors.brushstroke.green,
      creativeColors.brushstroke.orange,
      creativeColors.action.primary,
      creativeColors.action.secondary,
      creativeColors.action.tertiary,
      creativeColors.action.quaternary
    ];
    return colors[index % colors.length];
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Create animated particles for background
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, color: string, speed: number}>>([]);
  
  useEffect(() => {
    // Initialize particles only once
    if (particles.length === 0) {
      const newParticles = Array.from({ length: 15 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        color: [
          creativeColors.brushstroke.pink,
          creativeColors.brushstroke.blue,
          creativeColors.brushstroke.green,
          creativeColors.brushstroke.orange
        ][Math.floor(Math.random() * 4)],
        speed: Math.random() * 0.2 + 0.1
      }));
      setParticles(newParticles);
    }
  }, [particles.length]);
  
  // Custom animations
  const customAnimations = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    
    @keyframes float-particle {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes tiltRight {
      0% { transform: rotate(-3deg); }
      100% { transform: rotate(2deg); }
    }
    
    @keyframes tiltLeft {
      0% { transform: rotate(1deg); }
      100% { transform: rotate(-4deg); }
    }
  `;
  
  return (
    <div className="creative-card relative w-full h-full select-none">
      <style dangerouslySetInnerHTML={{ __html: customAnimations }} />
      
      <div className="w-full h-full relative">
        {/* Card Background */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backgroundColor: creativeColors.background.light,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Animated Gradient Background */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none"
            style={{
              background: creativeColors.primary.gradient,
              backgroundSize: "200% 200%",
              mixBlendMode: "soft-light",
              animation: "gradient-shift 15s ease infinite alternate"
            }}
          />
          
          {/* Brushstroke Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath d='M30,50 Q50,30 70,50 T110,50 T150,50' stroke='%23000' stroke-width='8' fill='none' stroke-linecap='round' /%3E%3Cpath d='M20,80 Q60,60 100,80 T180,80' stroke='%23000' stroke-width='12' fill='none' stroke-linecap='round' /%3E%3Cpath d='M40,110 Q80,90 120,110 T180,110' stroke='%23000' stroke-width='10' fill='none' stroke-linecap='round' /%3E%3Cpath d='M20,140 Q40,130 60,140 T100,140 T140,140' stroke='%23000' stroke-width='14' fill='none' stroke-linecap='round' /%3E%3Cpath d='M50,170 Q90,150 130,170 T190,170' stroke='%23000' stroke-width='9' fill='none' stroke-linecap='round' /%3E%3C/svg%3E\")",
              backgroundSize: "cover"
            }}
          />
          
          {/* Floating Particles */}
          {particles.map((particle, index) => (
            <div 
              key={index}
              className="absolute rounded-full opacity-40 pointer-events-none"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animation: `float-particle ${3 + particle.speed}s infinite alternate ease-in-out ${index * 0.2}s`,
                boxShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
                filter: "blur(1px)"
              }}
            />
          ))}
          
          {/* Content Container */}
          <div className="absolute inset-0 z-10 p-5 flex flex-col">
            {/* TOP SECTION - Visual Identity */}
            <div className="relative mb-5">
              {/* Polaroid Profile Image */}
              <div className="relative mb-4 flex justify-center">
                {/* Polaroid frame with shadow and rotation */}
                <div 
                  className="relative w-24 h-28 bg-white p-2 rounded-sm shadow-lg"
                  style={{
                    transform: "rotate(-3deg)",
                    transition: "all 0.3s ease",
                    animation: hoveredSection === 'profile' ? 'tiltRight 5s infinite alternate ease-in-out' : 'none',
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)"
                  }}
                  onMouseEnter={() => setHoveredSection('profile')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {/* Image container */}
                  <div className="h-[75%] w-full overflow-hidden mb-2 bg-gray-100">
                    {userData.photoURL ? (
                      <img 
                        src={userData.photoURL} 
                        alt={userData.name || "Profile"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=e6e6e6&color=5a5a5a";
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e6e6e6&color=5a5a5a`}
                        alt={userData.name || "Profile"} 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Polaroid caption - small dot */}
                  <div className="h-[15%] w-full flex justify-center items-center">
                    <div className="w-4 h-1 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                
                {/* Decorative tape on top */}
                <div 
                  className="absolute top-[-5px] left-[50%] w-10 h-5 opacity-60 transform -translate-x-1/2"
                  style={{
                    background: creativeColors.brushstroke.pink,
                    clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)",
                    zIndex: 2
                  }}
                />
              </div>
              
              {/* Name with Gradient Highlight */}
              <div className="text-center mb-2">
                <h2 
                  className="text-xl font-bold relative inline-block mb-1"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: creativeColors.text.primary,
                    textShadow: "1px 1px 0 rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <span className="relative z-10">
                    {userData.name || "Your Name"}
                    {/* Gradient underline */}
                    <div 
                      className="absolute h-[6px] -bottom-1 left-0 right-0 rounded-full"
                      style={{
                        background: creativeColors.secondary.gradient,
                        opacity: 0.7,
                        zIndex: -1
                      }}
                    />
                  </span>
                </h2>
                
                {/* Role/Title with styled container */}
                <div 
                  className="inline-flex px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(4px)"
                  }}
                >
                  <p 
                    className="text-sm font-medium"
                    style={{
                      color: creativeColors.text.secondary,
                      fontFamily: "'Quicksand', sans-serif"
                    }}
                  >
                    {userData.title || "Add your designation"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* DOMAIN & INDUSTRY SECTION - Creative Tags */}
            <div className="mb-4">
              {/* Domain */}
              {userData.domain && (
                <div className="text-center mb-2">
                  <div 
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: creativeColors.action.quaternary,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <Palette className="h-3 w-3 text-white" />
                    <span 
                      className="text-xs font-semibold"
                      style={{
                        color: "white",
                        fontFamily: "'Quicksand', sans-serif"
                      }}
                    >
                      {userData.domain}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Industry Tag */}
              {industryTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {industryTags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: getRandomColor(index),
                        transform: `rotate(${(Math.random() * 2 - 1)}deg)`,
                        color: "white",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <span className="mr-1">
                        {getIndustryIcon(tag)}
                      </span>
                      <span 
                        className="text-xs font-medium"
                        style={{
                          fontFamily: "'Quicksand', sans-serif"
                        }}
                      >
                        {tag.trim()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* COMPANY & LOCATION - Styled Info */}
            <div className="mb-5 text-center">
              {/* Company */}
              {userData.company && (
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1 mb-2 mx-auto"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    backdropFilter: "blur(4px)",
                    transition: "transform 0.3s ease",
                    transform: hoveredSection === 'company' ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                  onMouseEnter={() => setHoveredSection('company')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <Building2 
                    className="h-4 w-4"
                    style={{ color: creativeColors.text.primary }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{
                      color: creativeColors.text.primary,
                      fontFamily: "'Quicksand', sans-serif"
                    }}
                  >
                    Currently @ {userData.company}
                  </span>
                </div>
              )}
              
              {/* Location */}
              {userData.location && (
                <div 
                  className="inline-flex items-center gap-1 px-3 py-1 mx-auto"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    backdropFilter: "blur(4px)",
                    transition: "transform 0.3s ease",
                    transform: hoveredSection === 'location' ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                  onMouseEnter={() => setHoveredSection('location')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <MapPin 
                    className="h-4 w-4"
                    style={{ color: creativeColors.text.primary }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{
                      color: creativeColors.text.primary,
                      fontFamily: "'Quicksand', sans-serif"
                    }}
                  >
                    {userData.location}
                  </span>
                </div>
              )}
            </div>
            
            {/* ACTION BUTTONS - Creative Irregularly Shaped */}
            <div className="flex flex-wrap gap-3 justify-center mt-auto">
              {/* Let's Talk Button */}
              <button
                className="flex items-center gap-1 px-4 py-1.5"
                style={{
                  background: creativeColors.primary.gradient,
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  transform: hoveredSection === 'talk' ? 'translateY(-2px)' : 'translateY(0)',
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHoveredSection('talk')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Mail className="h-3.5 w-3.5" />
                Let's Talk
              </button>
              
              {/* Resume Button */}
              <button
                className="flex items-center gap-1 px-4 py-1.5"
                style={{
                  background: creativeColors.secondary.gradient,
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: creativeColors.text.primary,
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  transform: hoveredSection === 'resume' ? 'translateY(-2px)' : 'translateY(0)',
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHoveredSection('resume')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <FileBadge className="h-3.5 w-3.5" />
                Grab My Resume
              </button>
              
              {/* Mentor Button */}
              <button
                className="flex items-center gap-1 px-4 py-1.5"
                style={{
                  backgroundColor: creativeColors.brushstroke.blue,
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  transform: hoveredSection === 'mentor' ? 'translateY(-2px)' : 'translateY(0)',
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHoveredSection('mentor')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Mentor
              </button>
              
              {/* Portfolio Button */}
              <button
                className="flex items-center gap-1 px-4 py-1.5"
                style={{
                  backgroundColor: creativeColors.brushstroke.green,
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontFamily: "'Quicksand', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  transform: hoveredSection === 'portfolio' ? 'translateY(-2px)' : 'translateY(0)',
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHoveredSection('portfolio')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Link2 className="h-3.5 w-3.5" />
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copy Success Message */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-3 py-1.5 rounded-full text-xs z-50"
          style={{
            animation: "fadeInOut 2s forwards"
          }}
        >
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default CreativeCard;