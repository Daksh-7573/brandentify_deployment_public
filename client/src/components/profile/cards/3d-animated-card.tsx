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
  QrCode,
  Copy,
  Download
} from 'lucide-react';

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);
  const [perspective, setPerspective] = useState(1000);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -10; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 10;
    
    // Calculate glow position (0-100%)
    const glowPosX = ((e.clientX - rect.left) / rect.width) * 100;
    const glowPosY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Update state
    setRotateX(rotX);
    setRotateY(rotY);
    setGlowX(glowPosX);
    setGlowY(glowPosY);
  };
  
  // Reset on mouse leave
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  // Toggle card flip
  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  
  // Simulate device tilt on mobile
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma || isFlipped) return;
      
      // Use beta (front-to-back tilt) for X rotation (max ±10 degrees)
      // Use gamma (left-to-right tilt) for Y rotation (max ±10 degrees)
      const tiltX = (e.beta - 45) * -0.2; // Normalize from ~0-90 to ±10 degrees
      const tiltY = e.gamma * 0.2; // Normalize from ~±45 to ±10 degrees
      
      // Apply constraints
      const constrainedX = Math.max(-10, Math.min(10, tiltX));
      const constrainedY = Math.max(-10, Math.min(10, tiltY));
      
      setRotateX(constrainedX);
      setRotateY(constrainedY);
    };
    
    // Add device orientation event listener if supported
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
      .perspective-card { perspective: 1000px; }
      .preserve-3d { transform-style: preserve-3d; }
      .backface-hidden { backface-visibility: hidden; }
      
      /* Holographic Text Effect */
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
      
      @keyframes holographicShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* Glow Animation */
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      /* Bounce In Animation */
      @keyframes bounceIn {
        0% { transform: translateY(10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      /* Card flip animation */
      .card-flip-enter {
        transform: rotateY(0deg);
      }
      .card-flip-enter-active {
        transform: rotateY(180deg);
        transition: transform 500ms;
      }
      .card-flip-exit {
        transform: rotateY(180deg);
      }
      .card-flip-exit-active {
        transform: rotateY(0deg);
        transition: transform 500ms;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Base color scheme based on dark/light mode
  const colors = isDarkMode
    ? {
        bg: 'from-gray-900 to-slate-800',
        accentBg: 'from-indigo-900/40 to-purple-900/40',
        glow: 'from-indigo-500 via-purple-500 to-pink-500',
        text: 'text-white',
        subtext: 'text-gray-300',
        border: 'border-gray-700',
        icon: 'text-indigo-400',
        glassBg: 'bg-black/10',
      }
    : {
        bg: 'from-white to-gray-100',
        accentBg: 'from-indigo-100/40 to-purple-100/40',
        glow: 'from-indigo-400 via-purple-400 to-pink-400',
        text: 'text-gray-900',
        subtext: 'text-gray-600',
        border: 'border-gray-200',
        icon: 'text-indigo-600',
        glassBg: 'bg-white/30',
      };
  
  return (
    <div className="w-full perspective-card">
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative preserve-3d cursor-pointer transition-all duration-300"
        style={{
          transform: isFlipped 
            ? `rotateY(180deg)` 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: isDarkMode
            ? `0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 30px -5px rgba(79, 70, 229, 0.4)`
            : `0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 20px -5px rgba(79, 70, 229, 0.2)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
      >
        {/* Interactive glow effect that follows cursor */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${
              isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)'
            } 0%, transparent 50%)`,
            opacity: isFlipped ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        />
        
        {/* Front of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${colors.text} backface-hidden flex flex-col border overflow-hidden`}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0.1px)', // Slight depth for better 3D effect
            borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
          }}
        >
          {/* Mode switcher and hint */}
          <div className="absolute top-3 right-3 z-30 flex gap-2">
            <button 
              onClick={toggleTheme}
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs border backdrop-blur-sm ${colors.text}`}
              style={{ borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)', 
                       background: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          {/* Background accents - metallic/neon elements */}
          <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b opacity-70 ${colors.accentBg}`} />
          
          {/* Decorative shapes for metallic accents */}
          <div className="absolute -left-12 -top-12 w-44 h-44 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl" />
          <div className="absolute -right-12 top-40 w-44 h-44 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          
          {/* Profile picture in glass sphere */}
          <div className="pt-12 flex justify-center" style={{ transform: 'translateZ(20px)' }}>
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-sm border-2 border-white/20 shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
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
                  background: `radial-gradient(circle, ${isDarkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)'} 0%, transparent 70%)`,
                  animation: 'pulseGlow 3s infinite',
                }}
              />
            </div>
          </div>
          
          {/* Main content with name and details */}
          <div className="mt-4 px-6 flex-1 flex flex-col items-center" style={{ transform: 'translateZ(15px)' }}>
            {/* Name and designation with holographic effect */}
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-bold holographic-text" style={{ animationDelay: '0.1s' }}>
                {userData.name || "Your Name"}
              </h2>
              <p className={`${colors.subtext} opacity-90 text-sm`} style={{ animationDelay: '0.2s' }}>
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            {/* Industry & Domain with depth shadow */}
            <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50' : 'bg-gradient-to-r from-gray-50/70 to-white/70'} backdrop-blur-sm rounded-lg py-3 px-4 w-full mb-4 border`} 
                 style={{ borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)' }}>
              {userData.industry && (
                <div className="flex items-center gap-2 mb-2 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.3s', opacity: 0}}>
                  <Building2 className={`h-4 w-4 ${colors.icon}`} />
                  <span className={`${colors.text} text-sm`}>{userData.industry}</span>
                </div>
              )}
              
              {userData.domain && (
                <div className="flex items-center gap-2 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.4s', opacity: 0}}>
                  <Code className={`h-4 w-4 ${colors.icon}`} />
                  <span className={`${colors.text} text-sm`}>{userData.domain}</span>
                </div>
              )}
            </div>
            
            {/* Company name with metallic/neon effect */}
            {userData.company && (
              <div className="w-full mb-4 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.5s', opacity: 0}}>
                <div className="text-center py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-sm border" 
                     style={{ borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)' }}>
                  <p className={`font-medium ${colors.text}`}>
                    {userData.company}
                  </p>
                </div>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2 mb-3 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.6s', opacity: 0}}>
                <MapPin className={`h-4 w-4 ${colors.icon}`} />
                <span className={`${colors.text} text-sm`}>{userData.location}</span>
              </div>
            )}
            
            {/* Social links with glow effect */}
            <div className="mt-auto flex gap-4 mb-3 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.7s', opacity: 0}}>
              {/* LinkedIn */}
              <div className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm border hover:scale-110 transition-transform"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2))',
                     borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                   }}>
                <Linkedin className={`h-4 w-4 ${colors.icon}`} />
              </div>
              
              {/* Website */}
              <div className="h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-sm border hover:scale-110 transition-transform"
                   style={{ 
                     background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(147, 51, 234, 0.2))',
                     borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                   }}>
                <Globe className={`h-4 w-4 ${colors.icon}`} />
              </div>
            </div>
            
            {/* Tap to flip hint */}
            <div className={`text-center text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'} mt-2 flex items-center justify-center animate-[bounceIn_0.5s_ease_forwards]`} style={{animationDelay: '0.8s', opacity: 0}}>
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip for contact info</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div className="h-8 mt-auto flex items-center justify-center bg-gradient-to-r from-indigo-500/40 to-purple-500/40 backdrop-blur-sm">
            <span className="text-xs font-light tracking-wider">QUANTUM CARD</span>
          </div>
        </div>
        
        {/* Back of card with contact details */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${colors.bg} ${colors.text} backface-hidden flex flex-col border overflow-hidden`}
          style={{
            transform: 'rotateY(180deg) translateZ(0.1px)', // Slight depth for better 3D effect
            transformStyle: 'preserve-3d',
            borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
          }}
        >
          {/* Background accents */}
          <div className="absolute inset-0">
            <div className="absolute -left-16 -top-16 w-44 h-44 bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-full blur-xl" />
            <div className="absolute -right-16 bottom-20 w-44 h-44 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-xl" />
          </div>
          
          {/* Card header */}
          <div className="h-16 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 backdrop-blur-sm flex items-center justify-center">
            <h2 className="text-lg font-bold holographic-text">Contact Details</h2>
          </div>
          
          {/* Main content */}
          <div className="px-5 py-6 flex-1 flex flex-col" style={{ transform: 'translateZ(15px)' }}>
            {/* QR Code section */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 bg-white rounded-lg p-1 flex items-center justify-center drop-shadow-lg animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.1s', opacity: 0}}>
                <div className="relative w-full h-full bg-gray-100 rounded">
                  {/* We're simulating a QR code here since we don't have a QR code generator */}
                  <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-0.5 p-1.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-sm ${Math.random() > 0.3 ? 'bg-gray-900' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                  
                  {/* Glow effect on QR code */}
                  <div 
                    className="absolute inset-0 rounded opacity-70"
                    style={{
                      background: `radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)`,
                      animation: 'pulseGlow 3s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Contact details with glow-in animation */}
            <div className="space-y-4">
              {/* Email */}
              <div className={`flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border animate-[bounceIn_0.5s_ease_forwards]`} 
                   style={{
                     animationDelay: '0.2s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(243, 244, 246, 0.5)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
                <Mail className={`h-4 w-4 ${colors.icon}`} />
                <span className={`${colors.text} text-sm flex-1`}>{userData.email}</span>
                <Copy className={`h-3.5 w-3.5 ${colors.icon} cursor-pointer hover:text-indigo-300`} />
              </div>
              
              {/* Phone */}
              <div className={`flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border animate-[bounceIn_0.5s_ease_forwards]`} 
                   style={{
                     animationDelay: '0.3s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(243, 244, 246, 0.5)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
                <Phone className={`h-4 w-4 ${colors.icon}`} />
                <span className={`${colors.text} text-sm flex-1`}>{userData.phoneNumber || "Add phone number"}</span>
                <Copy className={`h-3.5 w-3.5 ${colors.icon} cursor-pointer hover:text-indigo-300`} />
              </div>
              
              {/* Profile Link */}
              <div className={`flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border animate-[bounceIn_0.5s_ease_forwards]`} 
                   style={{
                     animationDelay: '0.4s', 
                     opacity: 0,
                     background: isDarkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(243, 244, 246, 0.5)',
                     borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                   }}>
                <Globe className={`h-4 w-4 ${colors.icon}`} />
                <span className={`${colors.text} text-sm flex-1`}>{profileLink}</span>
                <ExternalLink className={`h-3.5 w-3.5 ${colors.icon} cursor-pointer hover:text-indigo-300`} />
              </div>
              
              {/* Location if available */}
              {userData.location && (
                <div className={`flex items-center gap-2 backdrop-blur-sm p-2 rounded-lg border animate-[bounceIn_0.5s_ease_forwards]`} 
                     style={{
                       animationDelay: '0.5s', 
                       opacity: 0,
                       background: isDarkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(243, 244, 246, 0.5)',
                       borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'
                     }}>
                  <MapPin className={`h-4 w-4 ${colors.icon}`} />
                  <span className={`${colors.text} text-sm flex-1`}>{userData.location}</span>
                  <ExternalLink className={`h-3.5 w-3.5 ${colors.icon} cursor-pointer hover:text-indigo-300`} />
                </div>
              )}
            </div>
            
            {/* Personal tagline or quote with floating animation */}
            <div className={`mt-4 backdrop-blur-sm p-3 rounded-lg border text-center animate-[bounceIn_0.5s_ease_forwards]`} 
                 style={{
                   animationDelay: '0.6s', 
                   opacity: 0,
                   background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(147, 51, 234, 0.15))',
                   borderColor: isDarkMode ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)'
                 }}>
              <p className={`text-sm italic ${colors.text}`}>
                {userData.lookingFor || "Passionate about innovation and technology"}
              </p>
            </div>
            
            {/* Save contact button */}
            <div className="mt-auto mb-2 animate-[bounceIn_0.5s_ease_forwards]" style={{animationDelay: '0.7s', opacity: 0}}>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <Download className="h-4 w-4" />
                <span>Save Contact</span>
              </button>
            </div>
            
            {/* Tap to flip hint */}
            <div className={`text-center text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'} mt-2 flex items-center justify-center animate-[bounceIn_0.5s_ease_forwards]`} style={{animationDelay: '0.8s', opacity: 0}}>
              <ChevronDown className="h-3 w-3 mr-1 animate-bounce" />
              <span>Tap to flip card</span>
            </div>
          </div>
          
          {/* Card footer */}
          <div className="h-8 mt-auto flex items-center justify-center bg-gradient-to-r from-indigo-500/40 to-purple-500/40 backdrop-blur-sm">
            <span className="text-xs font-light tracking-wider">QUANTUM CARD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDAnimatedCard;