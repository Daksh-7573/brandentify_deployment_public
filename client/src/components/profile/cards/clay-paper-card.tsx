import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase, Building2, MapPin, Code, Scissors, PenTool } from "lucide-react";
import { UserData } from "@/types/user";

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // State for pressed elements
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle contact clicks
  const handleContactClick = (type: string) => {
    setPressedItem(type);
    
    // Reset the pressed state after animation
    setTimeout(() => {
      setPressedItem(null);
    }, 500);
    
    // Handle the actual action
    switch (type) {
      case "email":
        window.location.href = `mailto:${userData.email}`;
        break;
      case "phone":
        if (userData.phoneNumber) {
          window.location.href = `tel:${userData.phoneNumber}`;
        }
        break;
      case "profile":
        // Just visual effect for profile link
        break;
    }
  };
  
  return (
    <div className="clay-paper-card w-full aspect-[2/3.5] rounded-xl shadow-lg overflow-hidden relative">
      {/* Textured paper background */}
      <div className="absolute inset-0 bg-[#f9f7f4]">
        <div className="absolute inset-0 bg-texture-paper opacity-15"></div>
      </div>
      
      {/* Content container with paper texture */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Decorative paper cuts at the top */}
        <div className="absolute -top-1 left-0 right-0 h-6 flex justify-center">
          {[...Array(8)].map((_, index) => (
            <div 
              key={index} 
              className="h-6 w-8 mx-1 bg-[#f9f7f4] border-t-0 rounded-b-lg shadow-sm transform rotate-180"
              style={{ 
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                transform: `rotate(180deg) translateY(${Math.sin(index) * 2}px)`
              }}
            />
          ))}
        </div>
        
        {/* Clay scissors decorative element */}
        <div className="absolute top-4 right-4 transform rotate-45 scale-75 opacity-60">
          <div className="relative">
            <Scissors className="text-[#e76f51] drop-shadow-md" size={24} />
            <div className="absolute inset-0 blur-sm bg-[#e76f51] opacity-20 rounded-full"></div>
          </div>
        </div>
        
        {/* Clay pen tool decorative element */}
        <div className="absolute top-4 left-4 transform -rotate-12 scale-75 opacity-60">
          <div className="relative">
            <PenTool className="text-[#2a9d8f] drop-shadow-md" size={24} />
            <div className="absolute inset-0 blur-sm bg-[#2a9d8f] opacity-20 rounded-full"></div>
          </div>
        </div>
        
        {/* Profile picture in clay mold */}
        <div className="mb-6 flex justify-center">
          <div className="clay-mold rounded-full w-32 h-32 flex items-center justify-center relative p-2">
            <div className="absolute inset-0 rounded-full bg-[#e4d5c5] shadow-inner"></div>
            <div className="absolute inset-1 rounded-full bg-[#e4d5c5] shadow-inner clay-impression"></div>
            <div className="relative z-10 h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
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
        
        {/* Name and title on paper cutout */}
        <div className="paper-cutout mb-4 bg-white py-3 px-4 rounded-lg text-center relative">
          <div className="paper-edge absolute inset-0 rounded-lg"></div>
          <h2 className="text-xl font-bold text-[#264653] relative z-10">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm text-[#2a9d8f] relative z-10">
            {userData.title || "Professional"}
          </p>
        </div>
        
        {/* Contact details as paper strips */}
        <div className="flex-1 space-y-3">
          {/* Each contact item as paper cutout */}
          
          {/* Domain */}
          {userData.domain && (
            <div 
              className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative ${
                pressedItem === "domain" ? "paper-pressed" : ""
              }`}
              onClick={() => handleContactClick("domain")}
            >
              <div className="paper-edge absolute inset-0 rounded-md"></div>
              <div className="icon-cutout h-8 w-8 bg-[#e9c46a]/10 rounded-full flex items-center justify-center relative">
                <Code className="h-4 w-4 text-[#e9c46a]" />
                <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
              </div>
              <span className="text-sm text-[#264653] relative z-10">{userData.domain}</span>
            </div>
          )}
          
          {/* Industry */}
          {userData.industry && (
            <div 
              className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative ${
                pressedItem === "industry" ? "paper-pressed" : ""
              }`}
              onClick={() => handleContactClick("industry")}
            >
              <div className="paper-edge absolute inset-0 rounded-md"></div>
              <div className="icon-cutout h-8 w-8 bg-[#f4a261]/10 rounded-full flex items-center justify-center relative">
                <Building2 className="h-4 w-4 text-[#f4a261]" />
                <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
              </div>
              <span className="text-sm text-[#264653] relative z-10">{userData.industry}</span>
            </div>
          )}
          
          {/* Company */}
          {userData.company && (
            <div 
              className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative ${
                pressedItem === "company" ? "paper-pressed" : ""
              }`}
              onClick={() => handleContactClick("company")}
            >
              <div className="paper-edge absolute inset-0 rounded-md"></div>
              <div className="icon-cutout h-8 w-8 bg-[#2a9d8f]/10 rounded-full flex items-center justify-center relative">
                <Briefcase className="h-4 w-4 text-[#2a9d8f]" />
                <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
              </div>
              <span className="text-sm text-[#264653] relative z-10">{userData.company}</span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div 
              className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative ${
                pressedItem === "location" ? "paper-pressed" : ""
              }`}
              onClick={() => handleContactClick("location")}
            >
              <div className="paper-edge absolute inset-0 rounded-md"></div>
              <div className="icon-cutout h-8 w-8 bg-[#e76f51]/10 rounded-full flex items-center justify-center relative">
                <MapPin className="h-4 w-4 text-[#e76f51]" />
                <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
              </div>
              <span className="text-sm text-[#264653] relative z-10">{userData.location}</span>
            </div>
          )}
          
          {/* Email - interactive */}
          <div 
            className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative cursor-pointer ${
              pressedItem === "email" ? "paper-pressed" : ""
            }`}
            onClick={() => handleContactClick("email")}
          >
            <div className="paper-edge absolute inset-0 rounded-md"></div>
            <div className="icon-cutout h-8 w-8 bg-[#2a9d8f]/10 rounded-full flex items-center justify-center relative">
              <Mail className="h-4 w-4 text-[#2a9d8f]" />
              <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
            </div>
            <span className="text-sm text-[#264653] relative z-10">{userData.email}</span>
          </div>
          
          {/* Phone - interactive */}
          <div 
            className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative cursor-pointer ${
              pressedItem === "phone" ? "paper-pressed" : ""
            }`}
            onClick={() => handleContactClick("phone")}
          >
            <div className="paper-edge absolute inset-0 rounded-md"></div>
            <div className="icon-cutout h-8 w-8 bg-[#e9c46a]/10 rounded-full flex items-center justify-center relative">
              <Phone className="h-4 w-4 text-[#e9c46a]" />
              <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
            </div>
            <span className="text-sm text-[#264653] relative z-10">
              {userData.phoneNumber || "Add phone number"}
            </span>
          </div>
          
          {/* Profile link - interactive */}
          <div 
            className={`paper-strip flex items-center gap-3 py-2 px-3 bg-white rounded-md relative cursor-pointer ${
              pressedItem === "profile" ? "paper-pressed" : ""
            }`}
            onClick={() => handleContactClick("profile")}
          >
            <div className="paper-edge absolute inset-0 rounded-md"></div>
            <div className="icon-cutout h-8 w-8 bg-[#f4a261]/10 rounded-full flex items-center justify-center relative">
              <Globe className="h-4 w-4 text-[#f4a261]" />
              <div className="absolute inset-0 rounded-full shadow-inner opacity-50"></div>
            </div>
            <span className="text-sm text-[#264653] relative z-10">{profileLink}</span>
          </div>
        </div>
        
        {/* Clay stamp at the bottom */}
        <div className="flex justify-center mt-4">
          <div className="clay-stamp h-8 w-32 rounded-sm bg-[#e4d5c5] flex items-center justify-center shadow-inner">
            <p className="text-xs text-[#264653] font-medium relative z-10">
              DIGITAL CLAY CARD
            </p>
          </div>
        </div>
      </div>
      
      {/* Clay and paper effects styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Paper texture background */
        .bg-texture-paper {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Clay mold effect */
        .clay-mold {
          box-shadow: 
            inset 0 2px 10px rgba(0, 0, 0, 0.1),
            0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .clay-impression {
          box-shadow: 
            inset 0 2px 15px rgba(0, 0, 0, 0.2),
            inset 0 -2px 5px rgba(255, 255, 255, 0.5);
        }
        
        /* Paper cutout effects */
        .paper-edge {
          box-shadow: 
            inset 0 0 0 1px rgba(0, 0, 0, 0.05),
            0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        
        .paper-cutout {
          transform: translateY(0);
          transition: transform 0.2s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .paper-strip {
          transform: translateY(0);
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }
        
        .paper-strip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        }
        
        .paper-pressed {
          transform: translateY(2px) !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06) !important;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        
        /* Clay stamp effect */
        .clay-stamp {
          transform: translateY(0);
          transition: transform 0.3s;
          box-shadow: 
            inset 0 1px 5px rgba(0, 0, 0, 0.15),
            0 1px 2px rgba(255, 255, 255, 0.5);
        }
        
        .icon-cutout {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s;
        }
        
        .paper-strip:hover .icon-cutout {
          transform: scale(1.05);
        }
      `}} />
    </div>
  );
};

export default ClayPaperCard;