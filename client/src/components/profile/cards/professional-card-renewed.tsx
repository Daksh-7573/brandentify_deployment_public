import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Copy,
  Check,
  ExternalLink,
  Zap
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
  const [showContactInfo, setShowContactInfo] = useState(true);
  
  // Format names with first name emphasized
  const formatName = (name: string | null) => {
    if (!name) return "Your Name";
    
    const parts = name.split(' ');
    if (parts.length === 1) return name;
    
    const firstName = parts[0];
    const restName = parts.slice(1).join(' ');
    
    return (
      <>
        <span className="font-bold">{firstName}</span> {restName}
      </>
    );
  };

  // Handle copying to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    
    // Reset copy status after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };
  
  // Get domain-specific icon
  const getDomainIcon = () => {
    const domain = userData.domain?.toLowerCase();
    
    if (!domain) return null;
    
    // This could be expanded with more domain-specific icons
    if (domain.includes('tech') || domain.includes('software') || domain.includes('development')) {
      return '💻';
    } else if (domain.includes('design') || domain.includes('creative')) {
      return '🎨';
    } else if (domain.includes('finance') || domain.includes('accounting')) {
      return '📈';
    } else if (domain.includes('marketing')) {
      return '📱';
    } else if (domain.includes('health') || domain.includes('medical')) {
      return '⚕️';
    } else if (domain.includes('education') || domain.includes('teaching')) {
      return '📚';
    }
    
    return null;
  };
  
  return (
    <div className={cn(
      "quantum-card w-full max-w-md aspect-[2/3.5] rounded-2xl overflow-hidden shadow-xl relative group",
      "bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800",
      "border border-slate-200 dark:border-slate-700",
      "transition-all duration-300 hover:shadow-2xl hover:translate-y-[-5px]",
      isIndustryLeader && "ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-slate-900"
    )}>
      {/* Frosted glass effect */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"></div>
      
      {/* Industry leader indicator */}
      {isIndustryLeader && (
        <div className="absolute -top-3 -right-3 h-16 w-16 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30"></div>
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      )}
      
      {/* Card content container */}
      <div className="relative h-full p-6 flex flex-col">
        {/* Top Section: Identity */}
        <div className="flex items-start space-x-4">
          {/* Profile picture */}
          <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex-shrink-0">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=random`;
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=random`}
                alt={userData.name || "Profile"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          
          {/* Name and title */}
          <div className="flex-1">
            <h2 className="text-2xl font-medium text-slate-900 dark:text-white">
              {formatName(userData.name)}
            </h2>
            <div className="flex items-center text-slate-600 dark:text-slate-300 mt-1">
              <span>{userData.title || "Professional"}</span>
              {getDomainIcon() && (
                <span className="ml-2 text-lg">{getDomainIcon()}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="my-5 border-t border-slate-200 dark:border-slate-700"></div>
        
        {/* Middle Section: Career Snapshot */}
        <div className="space-y-3">
          {/* Industry/Domain tags */}
          {(userData.industry || userData.domain) && (
            <div className="flex flex-wrap gap-2">
              {userData.industry && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {userData.industry}
                </span>
              )}
              {userData.domain && (
                <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-300">
                  {userData.domain}
                </span>
              )}
            </div>
          )}
          
          {/* Company with building icon */}
          {userData.company && (
            <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <Building2 className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
              <span>{userData.company}</span>
            </div>
          )}
          
          {/* Location with pin icon */}
          {userData.location && (
            <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
              <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
              <span>{userData.location}</span>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="my-5 border-t border-slate-200 dark:border-slate-700"></div>
        
        {/* Bottom Section: Contact Information */}
        {showContactInfo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Contact Information</h3>
              <button 
                onClick={() => setShowContactInfo(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Hide
              </button>
            </div>
            
            {/* Email with copy functionality */}
            <div className="flex items-center justify-between group/email">
              <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                <Mail className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
                <span>{userData.email}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(userData.email || "", "email")}
                className="opacity-0 group-hover/email:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copiedField === "email" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                )}
              </button>
            </div>
            
            {/* Phone number with copy functionality */}
            {userData.phoneNumber && (
              <div className="flex items-center justify-between group/phone">
                <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 mr-2 text-green-500 dark:text-green-400" />
                  <span>{userData.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => window.location.href = `tel:${userData.phoneNumber}`}
                    className="opacity-0 group-hover/phone:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(userData.phoneNumber || "", "phone")}
                    className="opacity-0 group-hover/phone:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copiedField === "phone" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-20">
            <button 
              onClick={() => setShowContactInfo(true)}
              className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-sm font-medium transition-colors"
            >
              Show Contact Information
            </button>
          </div>
        )}
        
        {/* Card footer */}
        <div className="mt-auto pt-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {`brandentifier.com/@${userData.username || userData.name?.replace(/\s+/g, '').toLowerCase() || 'user'}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCardRenewed;