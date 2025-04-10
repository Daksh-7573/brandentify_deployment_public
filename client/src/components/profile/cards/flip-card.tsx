import React, { useState, useRef, useEffect } from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2, Moon, Sun } from "lucide-react";

interface FlipCardProps {
  userData: UserData;
}

const FlipCard: React.FC<FlipCardProps> = ({ userData }) => {
  // State for card flip and theme
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const cardRef = useRef<HTMLDivElement>(null);
  
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
  const themeStyles = {
    card: isDarkMode 
      ? "bg-gray-900 text-white shadow-lg shadow-purple-900/30"
      : "bg-white text-gray-800 shadow-lg shadow-gray-300/50",
    header: isDarkMode 
      ? "bg-gradient-to-r from-slate-800 to-slate-700"
      : "bg-gradient-to-r from-blue-50 to-indigo-50",
    name: isDarkMode 
      ? "text-white"
      : "text-gray-800",
    title: isDarkMode 
      ? "text-gray-300"
      : "text-gray-600",
    icon: isDarkMode 
      ? "text-indigo-400"
      : "text-indigo-600",
    iconBg: isDarkMode 
      ? "bg-gray-800"
      : "bg-gray-100",
    text: isDarkMode 
      ? "text-gray-200"
      : "text-gray-700",
    link: isDarkMode 
      ? "text-indigo-400 hover:text-indigo-300"
      : "text-indigo-600 hover:text-indigo-700",
    footer: isDarkMode 
      ? "bg-gray-800 text-gray-300"
      : "bg-gray-100 text-gray-600",
    toggle: isDarkMode
      ? "bg-gray-700 border-gray-600"
      : "bg-white border-gray-300",
    glowEffect: isDarkMode
      ? "after:absolute after:inset-0 after:rounded-lg after:opacity-0 hover:after:opacity-100 after:transition-opacity after:bg-gradient-to-r after:from-indigo-500/10 after:to-purple-500/10 after:z-0"
      : "hover:shadow-md hover:shadow-indigo-100 transition-shadow"
  };
  
  return (
    <div className="flip-card-container w-full h-full perspective-1000 cursor-pointer" onClick={toggleFlip}>
      <div 
        ref={cardRef}
        className={`relative w-full h-full rounded-lg overflow-hidden transform-style-3d transition-transform duration-700 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front side of card */}
        <div 
          className={`absolute inset-0 rounded-lg ${themeStyles.card} backface-hidden flex flex-col`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Theme toggle button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              className={`p-2 rounded-full ${themeStyles.toggle} border transition-colors duration-300`}
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
          <div className={`h-24 ${themeStyles.header} relative`}>
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
              <h2 className={`text-xl font-bold ${themeStyles.name}`}>
                {userData.name || "Your Name"}
              </h2>
              <p className={`text-sm ${themeStyles.title}`}>
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            <div className="flex-1 space-y-3 text-sm">
              {/* Company */}
              {userData.company && (
                <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
                  <div className={`h-8 w-8 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                    <Briefcase className={`h-4 w-4 ${themeStyles.icon}`} />
                  </div>
                  <span className={`${themeStyles.text} relative z-10`}>
                    {userData.company}
                  </span>
                </div>
              )}
              
              {/* Domain */}
              {userData.domain && (
                <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
                  <div className={`h-8 w-8 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                    <Code className={`h-4 w-4 ${themeStyles.icon}`} />
                  </div>
                  <span className={`${themeStyles.text} relative z-10`}>
                    {userData.domain}
                  </span>
                </div>
              )}
              
              {/* Industry */}
              {userData.industry && (
                <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
                  <div className={`h-8 w-8 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                    <Building2 className={`h-4 w-4 ${themeStyles.icon}`} />
                  </div>
                  <span className={`${themeStyles.text} relative z-10`}>
                    {userData.industry}
                  </span>
                </div>
              )}
              
              {/* Location */}
              {userData.location && (
                <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
                  <div className={`h-8 w-8 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                    <MapPin className={`h-4 w-4 ${themeStyles.icon}`} />
                  </div>
                  <span className={`${themeStyles.text} relative z-10`}>
                    {userData.location}
                  </span>
                </div>
              )}
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-2 text-xs opacity-70">
              <p className={themeStyles.text}>Tap to flip card</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`h-6 ${themeStyles.footer} flex items-center justify-center`}>
            <span className="text-xs font-light">Digital Visiting Card</span>
          </div>
        </div>
        
        {/* Back side of card */}
        <div 
          className={`absolute inset-0 rounded-lg ${themeStyles.card} backface-hidden rotate-y-180 flex flex-col`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Theme toggle button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              className={`p-2 rounded-full ${themeStyles.toggle} border transition-colors duration-300`}
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
          <div className={`h-16 ${themeStyles.header} flex items-center justify-center relative`}>
            <h2 className={`text-lg font-bold ${themeStyles.name}`}>Contact Information</h2>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-center">
            {/* Email */}
            <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
              <div className={`h-10 w-10 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                <Mail className={`h-5 w-5 ${themeStyles.icon}`} />
              </div>
              <div className="relative z-10">
                <p className={`text-xs opacity-70 ${themeStyles.text}`}>Email</p>
                <p className={`text-sm ${themeStyles.text}`}>{userData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
              <div className={`h-10 w-10 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                <Phone className={`h-5 w-5 ${themeStyles.icon}`} />
              </div>
              <div className="relative z-10">
                <p className={`text-xs opacity-70 ${themeStyles.text}`}>Phone</p>
                <p className={`text-sm ${themeStyles.text}`}>{userData.phoneNumber || "Add phone number"}</p>
              </div>
            </div>
            
            {/* Profile Link */}
            <div className={`flex items-center gap-3 ${themeStyles.glowEffect} relative`}>
              <div className={`h-10 w-10 rounded-full ${themeStyles.iconBg} flex items-center justify-center`}>
                <Globe className={`h-5 w-5 ${themeStyles.icon}`} />
              </div>
              <div className="relative z-10">
                <p className={`text-xs opacity-70 ${themeStyles.text}`}>Profile</p>
                <a 
                  href={`/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`}
                  className={`text-sm ${themeStyles.link}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {profileLink}
                </a>
              </div>
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-2 text-xs opacity-70">
              <p className={themeStyles.text}>Tap to flip back</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`h-6 ${themeStyles.footer} flex items-center justify-center`}>
            <span className="text-xs font-light">Digital Visiting Card</span>
          </div>
        </div>
      </div>
      
      {/* Add CSS for 3D transformations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `
      }} />
    </div>
  );
};

export default FlipCard;