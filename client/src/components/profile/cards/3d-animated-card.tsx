import React, { useState, useRef } from 'react';
import { UserData } from '@/types/user';
import { 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Globe, 
  Building2, 
  Code,
  ChevronDown,
  Linkedin,
  ExternalLink,
  Copy,
  Download,
  Sun,
  Moon 
} from 'lucide-react';

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -10; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 10;
    
    // Update state
    setRotateX(rotX);
    setRotateY(rotY);
  };
  
  // Reset on mouse leave
  const handleMouseLeave = () => {
    if (isFlipped) return;
    setRotateX(0);
    setRotateY(0);
  };
  
  // Toggle card flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset transforms when flipping
    if (!isFlipped) {
      setRotateX(0);
      setRotateY(0);
    }
  };
  
  // Toggle dark/light mode
  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="w-full" style={{ perspective: '1000px' }}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped 
            ? 'rotateY(180deg)' 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.5s ease',
          boxShadow: isDarkMode
            ? '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 30px -5px rgba(79, 70, 229, 0.4)'
            : '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 20px -5px rgba(79, 70, 229, 0.2)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1f2937, #111827)' 
              : 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            color: isDarkMode ? 'white' : '#1f2937',
            border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`,
            borderRadius: '0.75rem'
          }}
        >
          {/* Mode switcher */}
          <div className="absolute top-3 right-3 z-30">
            <button 
              onClick={toggleTheme}
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs"
              style={{ 
                border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
                background: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)'
              }}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          
          {/* Background accent */}
          <div 
            className="absolute inset-x-0 top-0 h-40 opacity-70" 
            style={{ 
              background: isDarkMode 
                ? 'linear-gradient(to bottom, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.1))' 
                : 'linear-gradient(to bottom, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.05))'
            }} 
          />
          
          {/* Profile picture */}
          <div className="pt-12 flex justify-center" style={{ transform: 'translateZ(10px)' }}>
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                style={{
                  border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(79, 70, 229, 0.2)'}`,
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(4px)'
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
              
              {/* Subtle glow */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${
                    isDarkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(79, 70, 229, 0.3)'
                  } 0%, transparent 70%)`
                }}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="mt-4 px-6 flex-1 flex flex-col items-center">
            {/* Name and title */}
            <div className="text-center space-y-1 mb-4">
              <h2 
                className="text-xl font-bold"
                style={{ 
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {userData.name || "Your Name"}
              </h2>
              <p style={{ 
                color: isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(55, 65, 81, 0.9)',
                fontSize: '0.875rem'
              }}>
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            {/* Industry & Domain */}
            <div 
              className="rounded-lg py-3 px-4 w-full mb-4"
              style={{ 
                background: isDarkMode 
                  ? 'rgba(17, 24, 39, 0.4)' 
                  : 'rgba(243, 244, 246, 0.6)',
                border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
                backdropFilter: 'blur(4px)'
              }}
            >
              {userData.industry && (
                <div className="flex items-center gap-2 mb-2">
                  <Building2 style={{ 
                    height: '1rem', 
                    width: '1rem',
                    color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                  }} />
                  <span style={{ 
                    color: isDarkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}>
                    {userData.industry}
                  </span>
                </div>
              )}
              
              {userData.domain && (
                <div className="flex items-center gap-2">
                  <Code style={{ 
                    height: '1rem', 
                    width: '1rem',
                    color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                  }} />
                  <span style={{ 
                    color: isDarkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem'
                  }}>
                    {userData.domain}
                  </span>
                </div>
              )}
            </div>
            
            {/* Company name */}
            {userData.company && (
              <div className="w-full mb-4">
                <div 
                  className="text-center py-2 px-3 rounded-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))',
                    border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <p style={{ 
                    fontWeight: 500,
                    color: isDarkMode ? 'white' : '#1f2937' 
                  }}>
                    {userData.company}
                  </p>
                </div>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2 mb-3">
                <MapPin style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
                <span style={{ 
                  color: isDarkMode ? 'white' : '#1f2937',
                  fontSize: '0.875rem'
                }}>
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Social links */}
            <div className="mt-auto flex gap-4 mb-3">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))',
                  border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Linkedin style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
              </div>
              
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))',
                  border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Globe style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
              </div>
            </div>
            
            {/* Tap to flip hint */}
            <div 
              className="text-center text-xs mt-2 flex items-center justify-center"
              style={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)'
              }}
            >
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip for contact info</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div 
            className="h-8 mt-auto flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))',
              backdropFilter: 'blur(4px)'
            }}
          >
            <span className="text-xs font-light tracking-wider text-white">QUANTUM CARD</span>
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className="absolute inset-0 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1f2937, #111827)' 
              : 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            color: isDarkMode ? 'white' : '#1f2937',
            border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`,
            transform: 'rotateY(180deg)',
            borderRadius: '0.75rem'
          }}
        >
          {/* Card header */}
          <div 
            className="h-16 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))',
              backdropFilter: 'blur(4px)'
            }}
          >
            <h2 
              className="text-lg font-bold text-white"
              style={{ 
                background: 'linear-gradient(to right, #fff, #f3f4f6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Contact Details
            </h2>
          </div>
          
          {/* Main content */}
          <div className="px-5 py-6 flex-1 flex flex-col">
            {/* QR Code section */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 bg-white rounded-lg p-1 flex items-center justify-center shadow-lg">
                <div className="relative w-full h-full bg-gray-100 rounded">
                  {/* Simulated QR code */}
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-0.5 p-1.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="rounded-sm"
                        style={{ 
                          background: Math.random() > 0.3 ? '#111827' : '#f9fafb'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact details */}
            <div className="space-y-4">
              {/* Email */}
              <div 
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ 
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                  border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Mail style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
                <span style={{ 
                  color: isDarkMode ? 'white' : '#1f2937',
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {userData.email}
                </span>
                <Copy style={{ 
                  height: '0.875rem', 
                  width: '0.875rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                  cursor: 'pointer'
                }} />
              </div>
              
              {/* Phone */}
              <div 
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ 
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                  border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Phone style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
                <span style={{ 
                  color: isDarkMode ? 'white' : '#1f2937',
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {userData.phoneNumber || "Add phone number"}
                </span>
                <Copy style={{ 
                  height: '0.875rem', 
                  width: '0.875rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                  cursor: 'pointer'
                }} />
              </div>
              
              {/* Profile Link */}
              <div 
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ 
                  background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                  border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Globe style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
                <span style={{ 
                  color: isDarkMode ? 'white' : '#1f2937',
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {profileLink}
                </span>
                <ExternalLink style={{ 
                  height: '0.875rem', 
                  width: '0.875rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                  cursor: 'pointer'
                }} />
              </div>
              
              {/* Location if available */}
              {userData.location && (
                <div 
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ 
                    background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                    border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <MapPin style={{ 
                    height: '1rem', 
                    width: '1rem',
                    color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                  }} />
                  <span style={{ 
                    color: isDarkMode ? 'white' : '#1f2937',
                    fontSize: '0.875rem',
                    flex: 1
                  }}>
                    {userData.location}
                  </span>
                  <ExternalLink style={{ 
                    height: '0.875rem', 
                    width: '0.875rem',
                    color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                    cursor: 'pointer'
                  }} />
                </div>
              )}
            </div>
            
            {/* Personal tagline or quote */}
            <div 
              className="mt-4 p-3 rounded-lg text-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.15))',
                border: `1px solid ${isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'}`,
                backdropFilter: 'blur(4px)'
              }}
            >
              <p style={{ 
                fontSize: '0.875rem',
                fontStyle: 'italic',
                color: isDarkMode ? 'white' : '#1f2937'
              }}>
                {userData.lookingFor || "Passionate about innovation and technology"}
              </p>
            </div>
            
            {/* Save contact button */}
            <div className="mt-auto mb-2">
              <button 
                className="w-full py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ 
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed)'
                }}
              >
                <Download style={{ height: '1rem', width: '1rem' }} />
                <span>Save Contact</span>
              </button>
            </div>
            
            {/* Tap to flip hint */}
            <div 
              className="text-center text-xs mt-2 flex items-center justify-center"
              style={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)'
              }}
            >
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip card</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div 
            className="h-8 mt-auto flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))',
              backdropFilter: 'blur(4px)'
            }}
          >
            <span className="text-xs font-light tracking-wider text-white">QUANTUM CARD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDAnimatedCard;