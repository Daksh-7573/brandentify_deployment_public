import React, { useState, useEffect, useRef } from 'react';
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
  Moon,
  Sun
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
  
  // Device orientation for mobile
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma || isFlipped) return;
      
      // Use beta (front-to-back tilt) for X rotation
      // Use gamma (left-to-right tilt) for Y rotation
      const tiltX = (e.beta - 45) * -0.2; 
      const tiltY = e.gamma * 0.2;
      
      // Apply constraints
      const constrainedX = Math.max(-10, Math.min(10, tiltX));
      const constrainedY = Math.max(-10, Math.min(10, tiltY));
      
      setRotateX(constrainedX);
      setRotateY(constrainedY);
    };
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [isFlipped]);
  
  // Add styles for 3D perspective
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes holographicShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      @keyframes bounceIn {
        0% { transform: translateY(10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .holographic-text {
        background-image: linear-gradient(
          -45deg,
          rgba(238, 119, 82, 0.8),
          rgba(231, 60, 126, 0.8),
          rgba(35, 166, 213, 0.8),
          rgba(35, 213, 171, 0.8)
        );
        background-size: 200% 200%;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: holographicShift 5s ease infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="w-full" style={{ perspective: '1000px' }}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative transition-transform duration-300 cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped 
            ? 'rotateY(180deg)' 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
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
          className="absolute inset-0 flex flex-col border"
          style={{
            backfaceVisibility: 'hidden',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1f2937, #111827)' 
              : 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            color: isDarkMode ? 'white' : '#1f2937',
            borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0.1px)',
          }}
        >
          {/* Mode switcher */}
          <div className="absolute top-3 right-3 z-30">
            <button 
              onClick={toggleTheme}
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs border backdrop-blur-sm"
              style={{ 
                borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)',
                background: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
          
          {/* Background accents */}
          <div className="absolute inset-x-0 top-0 h-40 opacity-70" 
               style={{ 
                 background: isDarkMode 
                   ? 'linear-gradient(to bottom, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.1))' 
                   : 'linear-gradient(to bottom, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.05))'
               }} />
          
          {/* Decorative shapes */}
          <div className="absolute -left-12 -top-12 w-44 h-44 rounded-full blur-xl"
               style={{ background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2))' }} />
          <div className="absolute -right-12 top-40 w-44 h-44 rounded-full blur-xl"
               style={{ background: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2))' }} />
          
          {/* Profile picture in glass sphere */}
          <div className="pt-12 flex justify-center" style={{ transform: 'translateZ(20px)' }}>
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm border-2 shadow-lg"
                style={{
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
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
              
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${
                    isDarkMode ? 'rgba(79, 70, 229, 0.5)' : 'rgba(79, 70, 229, 0.3)'
                  } 0%, transparent 70%)`,
                  animation: 'pulseGlow 3s infinite',
                }}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="mt-4 px-6 flex-1 flex flex-col items-center" style={{ transform: 'translateZ(15px)' }}>
            {/* Name and designation with holographic effect */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold holographic-text">
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
            <div className="backdrop-blur-sm rounded-lg py-3 px-4 w-full mb-4 border" 
                 style={{ 
                   background: isDarkMode 
                     ? 'rgba(17, 24, 39, 0.4)' 
                     : 'rgba(243, 244, 246, 0.6)',
                   borderColor: isDarkMode 
                     ? 'rgba(75, 85, 99, 0.2)' 
                     : 'rgba(229, 231, 235, 0.5)'
                 }}>
              {userData.industry && (
                <div className="flex items-center gap-2 mb-2"
                     style={{ 
                       animation: 'bounceIn 0.5s ease forwards',
                       animationDelay: '0.3s', 
                       opacity: 0 
                     }}>
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
                <div className="flex items-center gap-2"
                     style={{ 
                       animation: 'bounceIn 0.5s ease forwards',
                       animationDelay: '0.4s', 
                       opacity: 0 
                     }}>
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
              <div className="w-full mb-4" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.5s', 
                     opacity: 0 
                   }}>
                <div className="text-center py-2 px-3 rounded-lg backdrop-blur-sm border" 
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))',
                       borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                     }}>
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
              <div className="flex items-center gap-2 mb-3" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.6s', 
                     opacity: 0 
                   }}>
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
            <div className="mt-auto flex gap-4 mb-3" 
                 style={{ 
                   animation: 'bounceIn 0.5s ease forwards',
                   animationDelay: '0.7s', 
                   opacity: 0 
                 }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm border hover:scale-110 transition-transform"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))',
                     borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                   }}>
                <Linkedin style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
              </div>
              
              <div className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm border hover:scale-110 transition-transform"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.2))',
                     borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                   }}>
                <Globe style={{ 
                  height: '1rem', 
                  width: '1rem',
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5' 
                }} />
              </div>
            </div>
            
            {/* Tap to flip hint */}
            <div className="text-center text-xs mt-2 flex items-center justify-center" 
                 style={{ 
                   animation: 'bounceIn 0.5s ease forwards',
                   animationDelay: '0.8s', 
                   opacity: 0,
                   color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)'
                 }}>
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip for contact info</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div className="h-8 mt-auto flex items-center justify-center backdrop-blur-sm"
               style={{ 
                 background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))'
               }}>
            <span className="text-xs font-light tracking-wider text-white">QUANTUM CARD</span>
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className="absolute inset-0 flex flex-col border"
          style={{
            backfaceVisibility: 'hidden',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1f2937, #111827)' 
              : 'linear-gradient(135deg, #ffffff, #f3f4f6)',
            color: isDarkMode ? 'white' : '#1f2937',
            borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            transformStyle: 'preserve-3d',
            transform: 'rotateY(180deg) translateZ(0.1px)',
          }}
        >
          {/* Background accents */}
          <div className="absolute inset-0">
            <div className="absolute -left-16 -top-16 w-44 h-44 rounded-full blur-xl"
                 style={{ background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(79, 70, 229, 0.2))' }} />
            <div className="absolute -right-16 bottom-20 w-44 h-44 rounded-full blur-xl"
                 style={{ background: 'linear-gradient(to bottom right, rgba(79, 70, 229, 0.2), rgba(168, 85, 247, 0.2))' }} />
          </div>
          
          {/* Card header */}
          <div className="h-16 flex items-center justify-center backdrop-blur-sm"
               style={{ 
                 background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))'
               }}>
            <h2 className="text-lg font-bold holographic-text">Contact Details</h2>
          </div>
          
          {/* Main content */}
          <div className="px-5 py-6 flex-1 flex flex-col" style={{ transform: 'translateZ(15px)' }}>
            {/* QR Code section */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 bg-white rounded-lg p-1 flex items-center justify-center shadow-lg" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.1s', 
                     opacity: 0 
                   }}>
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
                  
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded opacity-70"
                    style={{
                      background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
                      animation: 'pulseGlow 3s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Contact details */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.2s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
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
              <div className="flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.3s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
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
              <div className="flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border" 
                   style={{ 
                     animation: 'bounceIn 0.5s ease forwards',
                     animationDelay: '0.4s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
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
                <div className="flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border" 
                     style={{ 
                       animation: 'bounceIn 0.5s ease forwards',
                       animationDelay: '0.5s', 
                       opacity: 0,
                       background: isDarkMode ? 'rgba(17, 24, 39, 0.4)' : 'rgba(243, 244, 246, 0.6)',
                       borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                     }}>
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
            <div className="mt-4 backdrop-blur-sm p-3 rounded-lg border text-center" 
                 style={{ 
                   animation: 'bounceIn 0.5s ease forwards',
                   animationDelay: '0.6s', 
                   opacity: 0,
                   background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.15))',
                   borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                 }}>
              <p style={{ 
                fontSize: '0.875rem',
                fontStyle: 'italic',
                color: isDarkMode ? 'white' : '#1f2937'
              }}>
                {userData.lookingFor || "Passionate about innovation and technology"}
              </p>
            </div>
            
            {/* Save contact button */}
            <div className="mt-auto mb-2" style={{ 
              animation: 'bounceIn 0.5s ease forwards',
              animationDelay: '0.7s', 
              opacity: 0
            }}>
              <button className="w-full py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                     style={{ 
                       background: 'linear-gradient(to right, #4f46e5, #7c3aed)'
                     }}>
                <Download style={{ height: '1rem', width: '1rem' }} />
                <span>Save Contact</span>
              </button>
            </div>
            
            {/* Tap to flip hint */}
            <div className="text-center text-xs mt-2 flex items-center justify-center" 
                 style={{ 
                   animation: 'bounceIn 0.5s ease forwards',
                   animationDelay: '0.8s', 
                   opacity: 0,
                   color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(107, 114, 128, 0.8)'
                 }}>
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip card</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div className="h-8 mt-auto flex items-center justify-center backdrop-blur-sm"
               style={{ 
                 background: 'linear-gradient(to right, rgba(79, 70, 229, 0.4), rgba(124, 58, 237, 0.4))'
               }}>
            <span className="text-xs font-light tracking-wider text-white">QUANTUM CARD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDAnimatedCard;