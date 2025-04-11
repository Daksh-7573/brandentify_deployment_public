import React from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  Building2, 
  Code
} from "lucide-react";
import { UserData } from "@/types/user";
import { useCurrentCompany } from "@/hooks/use-current-company";

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // Get the latest company from work experience or use fallback
  const { company } = useCurrentCompany(userData.id, userData.company || "Brandentifier");
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  return (
    <div className="clay-paper-card w-full aspect-[2/3.5] p-4 relative">
      {/* Main card div with paper cutout effect */}
      <div className="clay-card-main h-full w-full rounded-2xl bg-amber-50 shadow-[10px_10px_0px_rgba(0,0,0,0.1)] border-4 border-amber-100 overflow-hidden flex flex-col relative">
        {/* Wavy top edge paper cut effect */}
        <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden">
          <div className="paper-wave h-12 w-full bg-amber-100"></div>
        </div>
        
        {/* Card header with clay photo effect */}
        <div className="relative pt-12 pb-4 px-4 flex justify-center z-10">
          {/* Clay molded photo frame */}
          <div className="clay-photo-frame h-28 w-28 rounded-full bg-amber-200 p-2 shadow-clay transform hover:rotate-2 transition-transform duration-300">
            <div className="h-full w-full rounded-full bg-white p-1 overflow-hidden shadow-inner">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User");
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                  alt={userData.name || "Profile"}
                  className="h-full w-full object-cover rounded-full"
                />
              )}
            </div>
            
            {/* Clay dots decoration */}
            <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-amber-300 shadow-clay"></div>
            <div className="absolute -left-2 bottom-5 h-4 w-4 rounded-full bg-amber-300 shadow-clay"></div>
          </div>
        </div>
        
        {/* Name and title area */}
        <div className="text-center px-4 paper-label relative z-10">
          <div className="relative py-3 px-4 bg-amber-100 rounded-lg shadow-clay mb-4 transform hover:-rotate-1 transition-transform duration-300">
            <h2 className="text-xl font-bold text-amber-800">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-sm text-amber-700">
              {userData.title || "Add your job title"}
            </p>
            
            {/* Paper cut corner */}
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-50 transform rotate-45"></div>
          </div>
        </div>
        
        {/* Contact details with paper cutout effect */}
        <div className="flex-1 space-y-3 px-4 relative z-10">
          {/* About Me / Brief Professional Summary */}
          {userData.aboutMe && (
            <div className="paper-cutout-item flex flex-col gap-1 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200 mb-3">
              <p className="text-sm text-amber-900 font-medium italic">
                "{userData.aboutMe}"
              </p>
            </div>
          )}
          
          {/* Company from Work Experience */}
          {company && (
            <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
              <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
                <Briefcase className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-sm text-amber-900 font-medium">
                {company}
              </span>
            </div>
          )}
          
          {/* Industry */}
          {userData.industry && (
            <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
              <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
                <Building2 className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-sm text-amber-900 font-medium">
                {userData.industry}
              </span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
              <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
                <MapPin className="h-4 w-4 text-amber-700" />
              </div>
              <span className="text-sm text-amber-900 font-medium">
                {userData.location}
              </span>
            </div>
          )}
          
          {/* Email */}
          <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
            <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
              <Mail className="h-4 w-4 text-amber-700" />
            </div>
            <span className="text-sm text-amber-900 font-medium">
              {userData.email}
            </span>
          </div>
          
          {/* Phone */}
          <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
            <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
              <Phone className="h-4 w-4 text-amber-700" />
            </div>
            <span className="text-sm text-amber-900 font-medium">
              {userData.phoneNumber || "Add phone number"}
            </span>
          </div>
          
          {/* Profile Link */}
          <div className="paper-cutout-item flex items-center gap-2 bg-white p-2 rounded-lg shadow-clay-sm transform hover:translate-y-[-2px] hover:rotate-1 transition-all duration-200">
            <div className="paper-icon-container bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shadow-clay-sm">
              <Globe className="h-4 w-4 text-amber-700" />
            </div>
            <span className="text-sm text-amber-900 font-medium">
              {profileLink}
            </span>
          </div>
        </div>
        
        {/* Footer with clay effect */}
        <div className="py-3 px-4 mt-4 text-center bg-amber-100 relative z-10">
          <span className="text-xs text-amber-800 font-medium">Quantum Card</span>
          
          {/* Clay deco elements */}
          <div className="absolute -right-2 bottom-4 h-5 w-5 rounded-full bg-amber-200 shadow-clay"></div>
          <div className="absolute -left-2 bottom-2 h-3 w-3 rounded-full bg-amber-300 shadow-clay"></div>
        </div>
      </div>
      
      {/* Style for clay and paper card */}
      <style dangerouslySetInnerHTML={{ __html: `
        .clay-card-main {
          box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.1), 
                      inset -3px -3px 10px rgba(0, 0, 0, 0.05),
                      inset 3px 3px 10px rgba(255, 255, 255, 0.7);
        }
        
        .shadow-clay {
          box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.1),
                      inset -2px -2px 5px rgba(0, 0, 0, 0.05),
                      inset 2px 2px 5px rgba(255, 255, 255, 0.7);
        }
        
        .shadow-clay-sm {
          box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.07),
                      inset -1px -1px 3px rgba(0, 0, 0, 0.03),
                      inset 1px 1px 3px rgba(255, 255, 255, 0.5);
        }
        
        .paper-wave {
          background: 
            radial-gradient(circle at 20% 50%, transparent 0, transparent 14px, #FBBF24 15px),
            radial-gradient(circle at 40% 50%, transparent 0, transparent 14px, #FBBF24 15px),
            radial-gradient(circle at 60% 50%, transparent 0, transparent 14px, #FBBF24 15px),
            radial-gradient(circle at 80% 50%, transparent 0, transparent 14px, #FBBF24 15px),
            radial-gradient(circle at 100% 50%, transparent 0, transparent 14px, #FBBF24 15px),
            #FEF3C7;
          background-size: 20% 100%;
          background-repeat: repeat-x;
        }
        
        .paper-cutout-item {
          transform-origin: center left;
        }
        
        @keyframes paperFloat {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
        
        .clay-photo-frame:hover {
          animation: paperFloat 2s ease-in-out infinite;
        }
        
        .paper-label {
          transform-origin: center;
        }
      `}} />
    </div>
  );
};

export default ClayPaperCard;