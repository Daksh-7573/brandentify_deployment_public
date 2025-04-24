import React, { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Hash,
  ExternalLink,
  Copy,
  ScanLine,
  Globe
} from "lucide-react";

interface HolographicCardProps {
  userData: UserData;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ userData }) => {
  // State for animation and interactivity
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScanAnimation, setShowScanAnimation] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }

  // Handle entrance animation
  useEffect(() => {
    // Trigger card load animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    // Trigger scan animation periodically
    const scanInterval = setInterval(() => {
      if (!isHovered) {
        setShowScanAnimation(true);
        setTimeout(() => {
          setShowScanAnimation(false);
        }, 1500);
      }
    }, 8000);

    return () => {
      clearInterval(scanInterval);
    };
  }, [isHovered]);

  // Update holographic effects based on mouse position
  const updateHolographicEffect = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
    setIsHovered(true);
  };

  // Reset effects when mouse leaves
  const resetHolographicEffect = () => {
    setIsHovered(false);
    // Keep a subtle animation by slowly resetting position
    setTimeout(() => {
      setMousePosition({ x: 0.5, y: 0.5 });
    }, 500);
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

  return (
    <div 
      ref={cardRef}
      className="w-full aspect-[2/3.5] relative cursor-pointer rounded-2xl overflow-hidden shadow-xl"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(76, 29, 149, 0.5)"
          : "0 15px 35px rgba(0, 0, 0, 0.3), 0 0 20px rgba(76, 29, 149, 0.4)",
      }}
      onMouseMove={updateHolographicEffect}
      onMouseLeave={resetHolographicEffect}
    >
      {/* Holographic Base with iridescent effect */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(
            ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(192, 132, 252, 0.4), 
            rgba(56, 189, 248, 0.4), 
            rgba(14, 165, 233, 0.4), 
            rgba(147, 51, 234, 0.4)
          )`,
          opacity: isLoaded ? 1 : 0,
          filter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Holographic glass base */}
      <div 
        className="absolute inset-0 z-10 transition-all duration-500"
        style={{
          background: "rgba(10, 10, 30, 0.8)",
          backdropFilter: "blur(10px)",
          opacity: isLoaded ? 0.8 : 0,
          transform: isLoaded ? "translateY(0)" : "translateY(10px)",
          borderRadius: "inherit",
        }}
      />

      {/* Grid overlay pattern */}
      <div 
        className="absolute inset-0 z-20 overflow-hidden mix-blend-overlay opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          transform: `scale(${isHovered ? 1.05 : 1}) rotate(${mousePosition.x * 1 - 0.5}deg)`,
          transition: "transform 0.2s ease",
        }}
      />

      {/* Holographic effect - dynamic light reflection */}
      <div 
        className="absolute inset-0 z-30 opacity-60 transition-opacity duration-300"
        style={{
          background: `
            linear-gradient(
              135deg,
              transparent,
              rgba(255, 255, 255, ${isHovered ? 0.2 : 0.1}) ${mousePosition.x * 100}%,
              transparent
            )
          `,
          opacity: isLoaded ? (isHovered ? 0.7 : 0.4) : 0,
        }}
      />

      {/* Scanline animation */}
      <div 
        className={`absolute inset-0 z-40 overflow-hidden pointer-events-none ${showScanAnimation ? "opacity-100" : "opacity-0"}`}
        style={{
          transition: "opacity 0.5s ease"
        }}
      >
        <div 
          className="h-10 w-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent absolute pointer-events-none"
          style={{
            animation: showScanAnimation ? "scanline 1.5s ease-in-out" : "none"
          }}
        />
      </div>

      {/* Card content */}
      <div className={`relative h-full w-full flex flex-col text-white z-50 p-5 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        {/* Top Identity Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Profile picture with pulsing edge */}
          <div className="relative mb-4 mt-2">
            <div 
              className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 z-10 relative"
              style={{
                boxShadow: isHovered 
                  ? "0 0 15px rgba(56, 189, 248, 0.6), 0 0 30px rgba(168, 85, 247, 0.4)"
                  : "0 0 10px rgba(56, 189, 248, 0.4), 0 0 20px rgba(168, 85, 247, 0.2)",
                transition: "box-shadow 0.3s ease"
              }}
            >
              {/* Edge pulse */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    from ${isHovered ? mousePosition.x * 360 : 0}deg,
                    #67e8f9,
                    #a78bfa,
                    #67e8f9
                  )`,
                  animation: "rotate 3s linear infinite",
                  opacity: isHovered ? 0.8 : 0.5,
                  transform: "scale(1.07)",
                  filter: "blur(3px)",
                  transition: "opacity 0.3s ease"
                }}
              />
              
              {/* Profile image */}
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover relative z-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=22d3ee&color=fff";
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=22d3ee&color=fff`}
                  alt={userData.name || "Profile"}
                  className="h-full w-full object-cover relative z-10"
                />
              )}
              
              {/* Reflective effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent z-20 pointer-events-none"
                style={{
                  opacity: isHovered ? 0.6 : 0.3,
                  transition: "opacity 0.3s ease"
                }}
              />
            </div>
          </div>
          
          {/* Name with neon text effect */}
          <h2 
            className="text-2xl font-bold text-center"
            style={{
              color: "white",
              textShadow: isHovered 
                ? "0 0 5px rgba(56, 189, 248, 0.8), 0 0 10px rgba(56, 189, 248, 0.5)"
                : "0 0 5px rgba(56, 189, 248, 0.5)",
              fontFamily: "'Sora', sans-serif",
              letterSpacing: "0.5px",
              transition: "text-shadow 0.3s ease"
            }}
          >
            {userData.name || "Your Name"}
          </h2>
          
          {/* Job title with neon underline */}
          <div className="text-center relative mt-1">
            <p 
              className="text-cyan-200/90 text-sm font-light"
              style={{
                textShadow: "0 0 2px rgba(56, 189, 248, 0.3)",
              }}
            >
              {userData.title || "Add your designation"}
            </p>
            {/* Animated neon underline */}
            <div 
              className="h-px w-16 mx-auto mt-1 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
                opacity: isHovered ? 0.8 : 0.5,
                boxShadow: "0 0 5px rgba(56, 189, 248, 0.6)",
                transition: "opacity 0.3s ease"
              }}
            />
          </div>
        </div>
        
        {/* Career Snapshot Section with industry tags */}
        <div className="mb-4">
          {/* Industry/Domain tags */}
          {industryTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {industryTags.map((tag, index) => (
                <div 
                  key={index}
                  className="flex items-center px-3 py-1 rounded-full text-xs"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(56, 189, 248, 0.2) ${mousePosition.x * 100}%, 
                      rgba(168, 85, 247, 0.2))`,
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    boxShadow: "0 0 10px rgba(56, 189, 248, 0.2)",
                    color: "#a5f3fc",
                    transition: "transform 0.2s ease",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    textShadow: "0 0 2px rgba(56, 189, 248, 0.5)"
                  }}
                >
                  <Hash className="h-3 w-3 mr-1 text-cyan-400" />
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}
          
          {/* Company with glowing building icon */}
          {userData.company && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden"
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  boxShadow: isHovered ? "0 0 10px rgba(56, 189, 248, 0.3)" : "none",
                  transition: "box-shadow 0.3s ease"
                }}
              >
                <Building2 className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm text-white">
                {userData.company}
              </span>
            </div>
          )}
          
          {/* Domain with glowing icon */}
          {userData.domain && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden"
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  boxShadow: isHovered ? "0 0 10px rgba(56, 189, 248, 0.3)" : "none",
                  transition: "box-shadow 0.3s ease"
                }}
              >
                <Globe className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm text-white capitalize">
                {userData.domain}
              </span>
            </div>
          )}
          
          {/* Location with grid line effect */}
          {userData.location && (
            <div className="flex items-center justify-center gap-3">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden"
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  boxShadow: isHovered ? "0 0 10px rgba(56, 189, 248, 0.3)" : "none",
                  transition: "box-shadow 0.3s ease"
                }}
              >
                <MapPin className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm text-white">
                {userData.location}
              </span>
            </div>
          )}
        </div>
        
        {/* Contact Details Section */}
        <div className="mt-auto space-y-3">
          {/* Email */}
          <div 
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-md group"
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              transition: "transform 0.2s, background 0.2s",
              transform: isHovered ? "translateX(0)" : "translateX(-100%)",
              opacity: isHovered ? 1 : 0,
            }}
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-100 truncate max-w-[150px]">
                {userData.email}
              </span>
            </div>
            <button 
              className="p-1 rounded-full hover:bg-cyan-500/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(userData.email, "Email");
              }}
            >
              <Copy className="h-3 w-3 text-cyan-400" />
            </button>
          </div>
          
          {/* Phone Number */}
          {userData.phoneNumber && (
            <div 
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-md group"
              style={{
                background: "rgba(56, 189, 248, 0.1)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                transition: "transform 0.2s, background 0.2s",
                transform: isHovered ? "translateX(0)" : "translateX(-100%)",
                opacity: isHovered ? 1 : 0,
                transitionDelay: "0.05s"
              }}
            >
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-cyan-100 truncate max-w-[150px]">
                  {userData.phoneNumber}
                </span>
              </div>
              <button 
                className="p-1 rounded-full hover:bg-cyan-500/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(userData.phoneNumber || "", "Phone");
                }}
              >
                <Copy className="h-3 w-3 text-cyan-400" />
              </button>
            </div>
          )}
          
          {/* Profile Link */}
          <div 
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-md group"
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              transition: "transform 0.2s, background 0.2s",
              transform: isHovered ? "translateX(0)" : "translateX(-100%)",
              opacity: isHovered ? 1 : 0,
              transitionDelay: "0.1s"
            }}
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-100 truncate max-w-[150px]">
                {profileLink}
              </span>
            </div>
            <button 
              className="p-1 rounded-full hover:bg-cyan-500/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(`https://${profileLink}`, "Link");
              }}
            >
              <Copy className="h-3 w-3 text-cyan-400" />
            </button>
          </div>
          
          {/* Copy success message */}
          {copySuccess && (
            <div 
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs"
              style={{
                animation: "fadeInOut 2s forwards",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.6)"
              }}
            >
              {copySuccess}
            </div>
          )}
        </div>
        
        {/* Hover instruction for contact info */}
        <div 
          className="absolute inset-x-0 bottom-2 text-center text-xs text-cyan-200/70"
          style={{
            textShadow: "0 0 5px rgba(56, 189, 248, 0.5)",
            opacity: isHovered ? 0 : 0.7,
            transition: "opacity 0.3s ease"
          }}
        >
          <div className="flex items-center justify-center gap-1">
            <ScanLine className="h-3 w-3" />
            <span>Hover to view contact details</span>
          </div>
        </div>
      </div>
      
      {/* Subtle floating particles */}
      <div className="absolute inset-0 z-60 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? "rgba(56, 189, 248, 0.6)" : "rgba(168, 85, 247, 0.6)",
              boxShadow: i % 2 === 0 
                ? "0 0 3px rgba(56, 189, 248, 0.8)" 
                : "0 0 3px rgba(168, 85, 247, 0.8)",
              animation: `float ${Math.random() * 5 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: isHovered ? 0.8 : 0.5,
              transition: "opacity 0.3s ease"
            }}
          />
        ))}
      </div>
      
      {/* Holographic edge glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none z-70"
        style={{
          boxShadow: isHovered 
            ? `inset 0 0 0 1px rgba(56, 189, 248, 0.6), 
               0 0 20px 2px rgba(56, 189, 248, 0.4)`
            : `inset 0 0 0 1px rgba(56, 189, 248, 0.3), 
               0 0 10px 1px rgba(56, 189, 248, 0.2)`,
          transition: "box-shadow 0.3s ease"
        }}
      />
      
      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg) scale(1.07); }
          to { transform: rotate(360deg) scale(1.07); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
      `}</style>
    </div>
  );
};

export default HolographicCard;