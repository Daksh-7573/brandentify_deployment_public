import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Copy,
  Check,
  ExternalLink,
  Zap,
  Hash,
  BadgeCheck
} from "lucide-react";
import { UserData } from "@/types/user";
import { cn } from "@/lib/utils";

interface ProfessionalCardRenewedProps {
  userData: UserData;
  isIndustryLeader?: boolean;
}

const ProfessionalCardRenewed: React.FC<ProfessionalCardRenewedProps> = ({ 
  userData,
  isIndustryLeader = false
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Handle copying to clipboard
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(fieldName);
        setToastMessage(`${fieldName} copied to clipboard`);
        setShowToast(true);
        
        // Add ripple effect to the button
        const button = document.getElementById(`copy-${fieldName}`);
        if (button) {
          button.classList.add('ripple-effect');
          setTimeout(() => button.classList.remove('ripple-effect'), 600);
        }
        
        // Reset copy status after 2 seconds
        setTimeout(() => {
          setCopiedField(null);
          setShowToast(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
      });
  };
  
  // Format profile URL
  const profileURL = `brandentifier.com/@${userData.username || userData.name?.replace(/\s+/g, '').toLowerCase() || 'user'}`;
  
  // Handle email click for mailto
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${userData.email}`;
  };
  
  // Handle phone click for tel
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userData.phoneNumber) {
      window.location.href = `tel:${userData.phoneNumber}`;
    }
  };
  
  return (
    <div 
      className="professional-card w-full aspect-[2/3.5] relative rounded-[16px] overflow-hidden shadow-lg"
      style={{
        maxWidth: "360px",
        margin: "0 auto",
        backgroundColor: "var(--card-bg, white)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "var(--card-bg, white)",
          backgroundImage: "var(--card-bg-pattern, none)",
        }}
      />
      
      {/* Card Content Wrapper */}
      <div className="relative z-10 h-full flex flex-col p-6 animate-fadeIn">
        {/* Top Visual Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-6">
            {/* Profile Picture with Verification */}
            <div className="relative">
              {/* Profile Image Container */}
              <div 
                className="w-24 h-24 rounded-full overflow-hidden border-2 transition-transform duration-300 hover:scale-105"
                style={{
                  borderColor: "var(--accent-color, #3b82f6)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                {userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Profile"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e2e8f0&color=475569`;
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e2e8f0&color=475569`}
                    alt={userData.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              
              {/* Verification Badge for Industry Leaders */}
              {isIndustryLeader && (
                <div 
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-md"
                  style={{
                    animation: "pulse 2s infinite"
                  }}
                >
                  <BadgeCheck className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div className="text-center space-y-1">
            <h2 
              className="text-2xl font-bold text-slate-900 dark:text-white"
              style={{
                fontFamily: "var(--font-primary, 'Inter', sans-serif)",
              }}
            >
              {userData.name || "Your Name"}
            </h2>
            <p 
              className="text-base text-slate-600 dark:text-slate-300"
              style={{
                fontFamily: "var(--font-secondary, 'Work Sans', sans-serif)",
              }}
            >
              {userData.title || "Professional"}
            </p>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-5" />
        
        {/* Professional Info Section */}
        <div className="space-y-5">
          {/* Industry Tags */}
          {industryTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {industryTags.slice(0, 3).map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center px-3 py-1 rounded-full text-xs font-medium transition-transform hover:scale-105"
                  style={{
                    backgroundColor: "var(--tag-bg, #f1f5f9)",
                    color: "var(--accent-color, #3b82f6)",
                    border: "1px solid",
                    borderColor: "var(--accent-color-light, #bfdbfe)",
                  }}
                >
                  <Hash className="h-3 w-3 mr-1 opacity-70" />
                  {tag.trim()}
                </div>
              ))}
              
              {industryTags.length > 3 && (
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  +{industryTags.length - 3} more
                </div>
              )}
            </div>
          )}
          
          {/* Company */}
          {userData.company && (
            <div 
              className="flex items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--company-bg, #f8fafc)",
                  border: "1px solid",
                  borderColor: "var(--border-color, #e2e8f0)",
                }}
              >
                <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span>{userData.company}</span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div 
              className="flex items-center justify-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--location-bg, #f8fafc)",
                  border: "1px solid",
                  borderColor: "var(--border-color, #e2e8f0)",
                }}
              >
                <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span>{userData.location}</span>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-5" />
        
        {/* Contact Info Section */}
        <div className="space-y-4">
          <h3 
            className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center uppercase tracking-wide"
            style={{
              fontFamily: "var(--font-primary, 'Inter', sans-serif)",
            }}
          >
            Contact Information
          </h3>
          
          {/* Email */}
          <div 
            className="flex items-center justify-between p-2 rounded-md group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={handleEmailClick}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: "var(--email-bg, #eff6ff)",
                  color: "var(--email-color, #3b82f6)",
                }}
              >
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
                {userData.email}
              </span>
            </div>
            <button
              id="copy-email"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(userData.email, "Email");
              }}
              aria-label="Copy email"
            >
              {copiedField === "Email" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
          
          {/* Phone */}
          {userData.phoneNumber && (
            <div 
              className="flex items-center justify-between p-2 rounded-md group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={handlePhoneClick}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--phone-bg, #f0fdf4)",
                    color: "var(--phone-color, #22c55e)",
                  }}
                >
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
                  {/* Show only partial number if not needed to be fully visible */}
                  {userData.phoneNumber}
                </span>
              </div>
              <button
                id="copy-phone"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 relative overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(userData.phoneNumber, "Phone");
                }}
                aria-label="Copy phone"
              >
                {copiedField === "Phone" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Card footer with profile URL */}
        <div className="mt-auto">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profileURL}
            </p>
          </div>
        </div>
      </div>
      
      {/* Toast Notification for Copy Success */}
      <div 
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500 text-white transition-opacity shadow-lg ${showToast ? 'opacity-100' : 'opacity-0'}`}
        style={{
          zIndex: 50,
          transition: "opacity 0.3s ease"
        }}
      >
        {toastMessage}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
          background-repeat: no-repeat;
          background-position: 50%;
          transform: scale(10, 10);
          opacity: 0;
          transition: transform .5s, opacity .5s;
        }
        
        .ripple-effect:active:after {
          transform: scale(0, 0);
          opacity: .3;
          transition: 0s;
        }
        
        /* Light mode variables */
        :root {
          --card-bg: white;
          --card-bg-pattern: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          --accent-color: #3b82f6;
          --accent-color-light: #bfdbfe;
          --border-color: #e2e8f0;
          --tag-bg: #f1f5f9;
          --company-bg: #f8fafc;
          --location-bg: #f8fafc;
          --email-bg: #eff6ff;
          --email-color: #3b82f6;
          --phone-bg: #f0fdf4;
          --phone-color: #22c55e;
          --font-primary: 'Inter', sans-serif;
          --font-secondary: 'Work Sans', sans-serif;
        }
        
        /* Dark mode variables */
        .dark {
          --card-bg: #1e293b;
          --card-bg-pattern: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          --accent-color: #60a5fa;
          --accent-color-light: #1e40af;
          --border-color: #334155;
          --tag-bg: #334155;
          --company-bg: #1e293b;
          --location-bg: #1e293b;
          --email-bg: #1e3a8a;
          --email-color: #93c5fd;
          --phone-bg: #14532d;
          --phone-color: #86efac;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalCardRenewed;