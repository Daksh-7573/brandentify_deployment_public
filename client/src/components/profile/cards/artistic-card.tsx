import React, { useState, useEffect } from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";
import { UserData } from "@/types/user";

interface ArtisticCardProps {
  userData: UserData;
}

// SVG Paths for Hand-Drawn Icons
const HandDrawnIcons = {
  mail: "M3,7c0,0,0,10,9,10s9-10,9-10 M3,7h18 M3,7c0,0,7,5,9,5s9-5,9-5",
  phone: "M7,3C5.5,3,4,4.5,4,6v12c0,1.5,1.5,3,3,3h10c1.5,0,3-1.5,3-3V6c0-1.5-1.5-3-3-3H7z M12,18c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S11.4,18,12,18z",
  location: "M12,2C8.1,2,5,5.1,5,9c0,5.2,7,13,7,13s7-7.8,7-13C19,5.1,15.9,2,12,2z M12,11.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S13.4,11.5,12,11.5z",
  briefcase: "M8,6V4c0-1.1,0.9-2,2-2h4c1.1,0,2,0.9,2,2v2 M20,8v12c0,1.1-0.9,2-2,2H6c-1.1,0-2-0.9-2-2V8 M4,8h16 M12,12v2",
  web: "M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M2,12h20 M12,2c-3.1,2-5,5.8-5,10s1.9,8,5,10 M12,2c3.1,2,5,5.8,5,10s-1.9,8-5,10",
  code: "M8,10L3,15l5,5 M16,10l5,5l-5,5 M10,8l4,16",
  building: "M3,21h18 M9,21V7l-5,2v12 M9,9h6 M15,21V3l5,2v16 M10,13h4 M10,17h4",
};

// SVG Brushstroke paths for decorative elements
const Brushstrokes = [
  "M25,10 C15,0 0,15 22,25 C35,30 40,18 25,10z",
  "M10,15 C0,5 15,0 25,12 C30,25 18,40 10,15z",
  "M5,20 C15,10 25,15 20,22 C18,35 10,30 5,20z",
  "M20,5 C10,15 5,25 12,20 C25,18 30,10 20,5z",
];

const ArtisticCard: React.FC<ArtisticCardProps> = ({ userData }) => {
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  
  // Handle animations on mount
  useEffect(() => {
    setIsLoaded(true);
    
    // Animate in sequence
    const interval = setInterval(() => {
      setAnimationIndex(prev => {
        if (prev < 7) return prev + 1;
        return prev;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate random rotation for brush strokes
  const getRandomRotation = (index: number) => {
    const rotations = [15, -20, 10, -15, 25, -10];
    return rotations[index % rotations.length];
  };
  
  // Custom hand-drawn icon component
  const HandDrawnIcon = ({ type, className }: { type: keyof typeof HandDrawnIcons, className?: string }) => (
    <svg viewBox="0 0 24 24" className={`w-5 h-5 ${className || 'text-amber-700'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={HandDrawnIcons[type]} />
    </svg>
  );
  
  return (
    <div className="artistic-card-container w-full aspect-[2/3.5] relative overflow-hidden rounded-lg">
      <div className="w-full h-full relative bg-[#f8f5e6] p-6 text-amber-900 shadow-xl border-4 border-amber-100">
        {/* Brushstroke decorative elements */}
        {Brushstrokes.map((stroke, index) => (
          <div 
            key={index}
            className="absolute opacity-10"
            style={{
              top: `${15 + (index * 20)}%`,
              left: `${10 + (index * 15) % 50}%`,
              transform: `rotate(${getRandomRotation(index)}deg)`,
              opacity: isLoaded ? 0.1 : 0,
              transition: 'opacity 0.5s ease',
              transitionDelay: `${0.3 + index * 0.1}s`,
              zIndex: 1,
            }}
          >
            <svg width="100" height="80" viewBox="0 0 40 40" fill="currentColor" className="text-amber-700">
              <path d={stroke}></path>
            </svg>
          </div>
        ))}
        
        {/* Corner decorative elements - sketched corners */}
        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,0 C30,10 10,30 0,100" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M100,0 C70,10 90,30 100,100" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,100 C30,90 10,70 0,0" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M100,100 C70,90 90,70 100,0" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Sketched photo frame */}
          <div className="relative mb-5">
            <div className="absolute inset-0 border-[3px] border-amber-700 rounded-full opacity-30 transform -rotate-3"></div>
            <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-amber-600/70 mb-4 shadow-md bg-amber-50 z-10">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                  style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
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
                  style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
                />
              )}
            </div>
            {/* Hand-drawn circle around photo */}
            <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -z-10 opacity-30">
              <circle cx="50%" cy="46%" r="37%" fill="none" stroke="#7c2d12" strokeWidth="1" strokeDasharray="6,3">
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  from="0 50% 46%" 
                  to="360 50% 46%" 
                  dur="20s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </svg>
          </div>
          
          {/* Name and title with handwritten style */}
          <h2 className="text-2xl font-bold mb-1 text-center text-amber-900"
            style={{ 
              fontFamily: "'Segoe UI', 'Roboto', 'sans-serif'",
              opacity: animationIndex >= 1 ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}>
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm mb-6 text-center text-amber-700"
            style={{ 
              fontFamily: "'Segoe UI', 'Roboto', 'sans-serif'",
              opacity: animationIndex >= 2 ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}>
            {userData.title || "Add your designation"}
          </p>
          
          {/* Divider with hand-drawn style */}
          <div className="w-24 h-1 mb-5 relative"
            style={{ 
              opacity: animationIndex >= 3 ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}>
            <svg width="100%" height="100%" viewBox="0 0 100 5">
              <path d="M0,2.5 C15,0 30,5 50,2.5 C70,0 85,5 100,2.5" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          
          {/* Details with hand-drawn icons */}
          <div className="space-y-4 w-full">
            {userData.company && (
              <div className="flex items-center gap-3"
                style={{ 
                  opacity: animationIndex >= 4 ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}>
                <HandDrawnIcon type="briefcase" />
                <span className="text-sm">
                  {userData.company}
                </span>
              </div>
            )}
            
            {userData.location && (
              <div className="flex items-center gap-3"
                style={{ 
                  opacity: animationIndex >= 4 ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}>
                <HandDrawnIcon type="location" />
                <span className="text-sm">
                  {userData.location}
                </span>
              </div>
            )}
            
            {userData.industry && (
              <div className="flex items-center gap-3"
                style={{ 
                  opacity: animationIndex >= 5 ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}>
                <HandDrawnIcon type="building" />
                <span className="text-sm">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {userData.domain && (
              <div className="flex items-center gap-3"
                style={{ 
                  opacity: animationIndex >= 5 ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}>
                <HandDrawnIcon type="code" />
                <span className="text-sm">
                  {userData.domain}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-3"
              style={{ 
                opacity: animationIndex >= 6 ? 1 : 0,
                transition: 'opacity 0.5s ease'
              }}>
              <HandDrawnIcon type="mail" />
              <span className="text-sm">
                {userData.email}
              </span>
            </div>
            
            <div className="flex items-center gap-3"
              style={{ 
                opacity: animationIndex >= 6 ? 1 : 0,
                transition: 'opacity 0.5s ease'
              }}>
              <HandDrawnIcon type="phone" />
              <span className="text-sm">
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            <div className="flex items-center gap-3"
              style={{ 
                opacity: animationIndex >= 7 ? 1 : 0,
                transition: 'opacity 0.5s ease'
              }}>
              <HandDrawnIcon type="web" />
              <span className="text-sm">
                {profileLink}
              </span>
            </div>
          </div>
        </div>
        
        {/* Hand-drawn footer */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <div className="text-xs text-amber-700/70"
            style={{ 
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease',
              transitionDelay: '1.5s'
            }}>
            Digital Visiting Card
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisticCard;