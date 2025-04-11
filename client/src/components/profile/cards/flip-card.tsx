import React, { useState } from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2, Moon, Sun, User } from "lucide-react";

interface FlipCardProps {
  userData: UserData;
}

const FlipCard: React.FC<FlipCardProps> = ({ userData }) => {
  // State for card flip and theme
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Toggle flip animation
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Toggle theme between light and dark
  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking theme toggle
    setIsDarkMode(!isDarkMode);
  };
  
  // Apply styles based on current theme
  const frontStyles = isDarkMode 
    ? "bg-gray-900 text-white" 
    : "bg-white text-gray-800";
  
  const backStyles = isDarkMode 
    ? "bg-gray-800 text-white" 
    : "bg-gray-100 text-gray-800";
    
  const headerStyles = isDarkMode 
    ? "bg-gradient-to-r from-slate-800 to-slate-700" 
    : "bg-gradient-to-r from-blue-50 to-indigo-50";
    
  const iconColor = isDarkMode 
    ? "text-indigo-400" 
    : "text-indigo-600";
    
  const iconBgColor = isDarkMode 
    ? "bg-gray-800" 
    : "bg-gray-100";
  
  const textColor = isDarkMode 
    ? "text-gray-200" 
    : "text-gray-700";
    
  const linkColor = isDarkMode 
    ? "text-indigo-400 hover:text-indigo-300" 
    : "text-indigo-600 hover:text-indigo-700";
    
  const footerStyles = isDarkMode 
    ? "bg-gray-800 text-gray-300" 
    : "bg-gray-100 text-gray-600";
    
  const toggleBtnStyles = isDarkMode 
    ? "bg-gray-700 border-gray-600" 
    : "bg-white border-gray-300";
  
  return (
    <div className="w-full aspect-[2/3.5] relative">
      <div 
        className={`flip-card cursor-pointer ${isFlipped ? 'flipped' : ''}`}
        onClick={toggleFlip}
      >
        {/* Front side of card */}
        <div className={`flip-card-front rounded-lg shadow-lg ${frontStyles}`}>
          {/* Theme toggle button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              className={`p-2 rounded-full ${toggleBtnStyles} border transition-colors duration-300`}
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          </div>
          
          {/* Card header */}
          <div className={`h-24 ${headerStyles} relative`}>
            {/* Profile picture */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 z-10">
              <div className={`h-20 w-20 rounded-full border-4 ${isDarkMode ? 'border-gray-800' : 'border-white'} overflow-hidden bg-white flex items-center justify-center shadow-lg`}>
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
            {/* Name and title */}
            <div className="text-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {userData.name || "Your Name"}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            <div className="flex-1 space-y-3 text-sm">
              {/* Company */}
              {userData.company && (
                <div className="flex items-center gap-3 relative">
                  <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <Briefcase className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <span className={textColor}>
                    {userData.company}
                  </span>
                </div>
              )}
              
              {/* Domain */}
              {userData.domain && (
                <div className="flex items-center gap-3 relative">
                  <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <Code className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <span className={textColor}>
                    {userData.domain}
                  </span>
                </div>
              )}
              
              {/* Industry */}
              {userData.industry && (
                <div className="flex items-center gap-3 relative">
                  <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <Building2 className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <span className={textColor}>
                    {userData.industry}
                  </span>
                </div>
              )}
              
              {/* Location */}
              {userData.location && (
                <div className="flex items-center gap-3 relative">
                  <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <MapPin className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <span className={textColor}>
                    {userData.location}
                  </span>
                </div>
              )}
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-2 text-xs opacity-70">
              <p className={textColor}>Tap to flip card</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`h-6 ${footerStyles} flex items-center justify-center`}>
            <span className="text-xs font-light">Quantum Card</span>
          </div>
        </div>
        
        {/* Back side of card */}
        <div className={`flip-card-back rounded-lg shadow-lg ${backStyles}`}>
          {/* Theme toggle button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              className={`p-2 rounded-full ${toggleBtnStyles} border transition-colors duration-300`}
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          </div>
          
          {/* Header */}
          <div className={`h-16 ${headerStyles} flex items-center justify-center relative`}>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Contact Information</h2>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-center">
            {/* Email */}
            <div className="flex items-center gap-3 relative">
              <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                <Mail className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className={`text-xs opacity-70 ${textColor}`}>Email</p>
                <p className={`text-sm ${textColor}`}>{userData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 relative">
              <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                <Phone className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className={`text-xs opacity-70 ${textColor}`}>Phone</p>
                <p className={`text-sm ${textColor}`}>{userData.phoneNumber || "Add phone number"}</p>
              </div>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-3 relative">
              <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                <Globe className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className={`text-xs opacity-70 ${textColor}`}>Profile</p>
                <a 
                  href={`/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`}
                  className={`text-sm ${linkColor}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {profileLink}
                </a>
              </div>
            </div>
            
            {/* Professional Summary */}
            {(userData.aboutMe || userData.lookingFor) && (
              <div className="flex items-start gap-3 relative mt-2">
                <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                  <User className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                  <p className={`text-xs opacity-70 ${textColor}`}>About Me</p>
                  <p className={`text-sm ${textColor} leading-tight`}>
                    {userData.aboutMe || userData.lookingFor || 
                      `Professional with experience in ${userData.industry || 'various industries'}. Let's connect!`}
                  </p>
                </div>
              </div>
            )}
            
            {/* Hint text */}
            <div className="text-center mt-4 text-xs opacity-70">
              <p className={textColor}>Tap to flip back</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`h-6 ${footerStyles} flex items-center justify-center`}>
            <span className="text-xs font-light">Quantum Card</span>
          </div>
        </div>
      </div>
      
      {/* CSS for the flip card effect */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .flip-card {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s;
            transform-style: preserve-3d;
            perspective: 1000px;
          }
          
          .flip-card.flipped {
            transform: rotateY(180deg);
          }
          
          .flip-card-front,
          .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
          }
          
          .flip-card-front {
            transform: rotateY(0deg);
          }
          
          .flip-card-back {
            transform: rotateY(180deg);
          }
        `
      }} />
    </div>
  );
};

export default FlipCard;