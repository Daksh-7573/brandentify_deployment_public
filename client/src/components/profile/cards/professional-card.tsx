import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  Building2, 
  Code, 
  Linkedin, 
  ChevronUp, 
  QrCode, 
  MessageSquare,
  Sun,
  Moon
} from "lucide-react";
import { UserData } from "@/types/user";

interface ProfessionalCardProps {
  userData: UserData;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ userData }) => {
  // State for card interaction
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle card reveal
  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };
  
  // Toggle dark/light mode
  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card reveal
    setIsDarkMode(!isDarkMode);
  };
  
  // Handle contact interactions
  const handleContact = (type: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card reveal
    
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
      case "company":
        if (userData.company) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(userData.company)}`, "_blank");
        }
        break;
      case "location":
        if (userData.location) {
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userData.location)}`, "_blank");
        }
        break;
    }
  };
  
  return (
    <div 
      className={`professional-card w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative cursor-pointer transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
      onClick={toggleReveal}
    >
      {/* Theme toggle button */}
      <button 
        className={`absolute top-4 right-4 z-50 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
          isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
        }`}
        onClick={toggleTheme}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
      
      {/* Front side (Default view) */}
      <div 
        className={`front-side absolute inset-0 p-6 flex flex-col items-center justify-between transition-transform duration-500 ease-in-out ${
          isRevealed ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
        } ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
      >
        {/* Glass card background effect */}
        <div 
          className={`absolute inset-0 ${
            isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-white'
          }`}
        >
          {/* Decorative elements */}
          <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 ${
            isDarkMode ? 'bg-blue-500' : 'bg-blue-300'
          } blur-3xl transform translate-x-20 -translate-y-20`}></div>
          <div className={`absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 ${
            isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'
          } blur-3xl transform -translate-x-20 translate-y-20`}></div>
        </div>
        
        {/* Profile photo */}
        <div className="relative z-10 mt-6">
          <div className={`h-32 w-32 rounded-full overflow-hidden border-4 ${
            isDarkMode ? 'border-slate-700 shadow-slate-700/50' : 'border-white shadow-slate-200/50'
          } shadow-lg mx-auto`}>
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
        
        {/* Name and title */}
        <div className="text-center relative z-10 mt-4">
          <h2 className={`text-2xl font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {userData.name || "Your Name"}
          </h2>
          <p className={`text-md ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {userData.title || "Professional"}
          </p>
          
          {/* Industry and domain */}
          {(userData.industry || userData.domain) && (
            <div className={`mt-1 text-sm ${
              isDarkMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              {userData.industry && <span>{userData.industry}</span>}
              {userData.industry && userData.domain && <span className="mx-1">•</span>}
              {userData.domain && <span>{userData.domain}</span>}
            </div>
          )}
        </div>
        
        {/* Company (clickable) */}
        {userData.company && (
          <div 
            className={`company-badge relative z-10 mt-4 px-4 py-2 rounded-full bg-opacity-10 cursor-pointer transition-all ${
              isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            } flex items-center gap-2`}
            onClick={(e) => handleContact("company", e)}
          >
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{userData.company}</span>
          </div>
        )}
        
        {/* LinkedIn & reveal button */}
        <div className="mt-auto w-full relative z-10 flex flex-col items-center space-y-4">
          {/* LinkedIn button */}
          <button 
            className={`linkedin-button w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isDarkMode ? 
              'bg-slate-800 text-blue-300 hover:bg-slate-700' : 
              'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
            onClick={(e) => handleContact("linkedin", e)}
          >
            <Linkedin className="h-4 w-4" />
            <span className="font-medium">Connect on LinkedIn</span>
          </button>
          
          {/* Reveal details button */}
          <button 
            className={`reveal-button w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isDarkMode ? 
              'bg-indigo-900 text-white hover:bg-indigo-800' : 
              'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <span className="font-medium">Tap to Reveal Details</span>
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Back side (Revealed view) */}
      <div 
        className={`back-side absolute inset-0 p-6 flex flex-col transition-transform duration-500 ease-in-out ${
          isRevealed ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'
        } ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
      >
        {/* Glass card background effect */}
        <div 
          className={`absolute inset-0 ${
            isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-white'
          }`}
        >
          {/* Decorative elements */}
          <div className={`absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-10 ${
            isDarkMode ? 'bg-indigo-500' : 'bg-indigo-300'
          } blur-3xl transform translate-x-20 translate-y-20`}></div>
          <div className={`absolute top-0 left-0 w-40 h-40 rounded-full opacity-10 ${
            isDarkMode ? 'bg-blue-500' : 'bg-blue-300'
          } blur-3xl transform -translate-x-20 -translate-y-20`}></div>
        </div>
        
        {/* Contact info section */}
        <div className="relative z-10 mt-4 space-y-3">
          <h3 className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            Contact Information
          </h3>
          
          {/* Email */}
          <div
            className={`contact-item flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'
            } shadow-sm`}
            onClick={(e) => handleContact("email", e)}
          >
            <div className={`icon-container h-10 w-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
            }`}>
              <Mail className={`h-5 w-5 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>{userData.email}</p>
            </div>
          </div>
          
          {/* Phone */}
          <div
            className={`contact-item flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'
            } shadow-sm`}
            onClick={(e) => handleContact("phone", e)}
          >
            <div className={`icon-container h-10 w-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
            }`}>
              <Phone className={`h-5 w-5 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>{userData.phoneNumber || "Add phone number"}</p>
            </div>
          </div>
          
          {/* Location */}
          {userData.location && (
            <div
              className={`contact-item flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100'
              } shadow-sm`}
              onClick={(e) => handleContact("location", e)}
            >
              <div className={`icon-container h-10 w-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
              }`}>
                <MapPin className={`h-5 w-5 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>{userData.location}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* QR Code section (simulated) */}
        <div className="flex-1 relative z-10 flex flex-col items-center justify-center">
          <div className={`qr-container p-2 rounded-xl ${
            isDarkMode ? 'bg-white' : 'bg-slate-100'
          }`}>
            <div className="h-32 w-32 flex items-center justify-center">
              <QrCode className={`h-24 w-24 ${
                isDarkMode ? 'text-slate-800' : 'text-slate-800'
              }`} />
            </div>
          </div>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>Scan to save contact</p>
        </div>
        
        {/* Custom message and back button */}
        <div className="relative z-10 mt-auto space-y-4">
          {/* Custom message */}
          <div className={`custom-message flex items-center gap-2 p-3 rounded-lg ${
            isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <MessageSquare className={`h-5 w-5 ${
              isDarkMode ? 'text-indigo-300' : 'text-indigo-500'
            }`} />
            <p className={`text-sm italic ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {userData.lookingFor || "Let's Connect & Grow Together"}
            </p>
          </div>
          
          {/* Back button */}
          <button 
            className={`back-button w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isDarkMode ? 
              'bg-slate-800 text-slate-200 hover:bg-slate-700' : 
              'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <span className="font-medium">Tap to Close</span>
          </button>
        </div>
      </div>
      
      {/* Glassmorphism overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDarkMode ? 'glass-overlay-dark' : 'glass-overlay-light'
      }`}></div>
      
      {/* Styles for glassmorphism and animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .professional-card {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .professional-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-5px);
        }
        
        .glass-overlay-light {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.1) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }
        
        .glass-overlay-dark {
          background: linear-gradient(
            135deg,
            rgba(30, 41, 59, 0.2) 0%,
            rgba(30, 41, 59, 0.1) 100%
          );
          border: 1px solid rgba(30, 41, 59, 0.2);
          backdrop-filter: blur(5px);
        }
        
        .contact-item {
          transform: translateY(0);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        
        .contact-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        /* Interactive effects */
        .contact-item:active, .linkedin-button:active, .reveal-button:active {
          transform: scale(0.98);
        }
        
        /* Animate items in sequence */
        .back-side .contact-item:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .back-side .contact-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .back-side .contact-item:nth-child(3) {
          animation-delay: 0.3s;
        }
      `}} />
    </div>
  );
};

export default ProfessionalCard;