import React, { useState, useRef } from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2, 
  Hash,
  Copy,
  Printer,
  Share2,
  Paperclip
} from "lucide-react";
import { UserData } from "@/types/user";

// Clay & Paper Colors - refined artisanal palette
const clayColors = {
  // Base colors
  canvas: "#fdfcfa",       // Main card background
  warmCream: "#f5f2ed",    // Secondary paper color
  
  // Clay tones
  taupe: "#e6e2dd",        // Neutral clay
  sage: "#e1e4df",         // Soft green-gray clay
  nude: "#ecdfd4",         // Warm skin tone clay
  mist: "#e6ecf0",         // Soft blue-gray clay
  blush: "#f0e6e9",        // Soft pink clay
  
  // Accent colors 
  paperYellow: "#f5df98",  // Warm paper yellow
  coral: "#e89b8e",        // Warm reddish clay
  ink: "#3a3a3a",          // Dark text color
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // Interaction states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Print card function
  const printCard = () => {
    window.print();
  };
  
  return (
    <div 
      ref={cardRef}
      className="clay-paper-card w-full aspect-[2/3.5] relative select-none"
    >
      {/* Main background with shadow */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: clayColors.canvas,
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Canvas texture */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      {/* Horizontal paper layer - top section */}
      <div 
        className="absolute top-[10%] left-0 right-0 h-[30%] rounded-r-lg"
        style={{
          background: clayColors.sage, 
          boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.1)",
          transformOrigin: "left center",
          transform: "translateX(5%) rotate(-1deg)",
          zIndex: 1
        }}
      />
      
      {/* Horizontal paper layer - bottom section */}
      <div 
        className="absolute bottom-[15%] left-0 right-0 h-[30%] rounded-r-lg"
        style={{
          background: clayColors.nude, 
          boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.1)",
          transformOrigin: "left center",
          transform: "translateX(3%) rotate(1deg)",
          zIndex: 1
        }}
      />
      
      {/* Content container */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col items-center">
        {/* Profile Picture with Polaroid & Paperclip */}
        <div 
          className="relative mb-6"
          style={{
            transform: hoveredSection === 'profile' ? 'translateY(-5px) rotate(1deg)' : 'translateY(0) rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => setHoveredSection('profile')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Paperclip */}
          <div className="absolute -top-3 -right-1 transform rotate-12 z-20">
            <Paperclip className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Polaroid frame */}
          <div 
            className="relative bg-white p-2 rounded-sm shadow-md"
            style={{
              boxShadow: "0 3px 10px -2px rgba(0, 0, 0, 0.15)",
              transform: "rotate(-2deg)"
            }}
          >
            {/* Image container */}
            <div 
              className="w-24 h-24 overflow-hidden"
              style={{
                borderTop: "1px solid #f0f0f0",
                borderLeft: "1px solid #f0f0f0",
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0"
              }}
            >
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=f1f5f9&color=334155";
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=f1f5f9&color=334155`}
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            
            {/* Polaroid bottom */}
            <div className="h-6 bg-white mt-1" />
          </div>
        </div>
        
        {/* Name & Title - Stamp Style */}
        <div 
          className="relative mb-5 text-center w-full"
          style={{
            transform: hoveredSection === 'name' ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => setHoveredSection('name')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Name stamp background */}
          <div 
            className="absolute -inset-2 rounded-md opacity-10"
            style={{ 
              background: clayColors.paperYellow,
              transform: 'rotate(-0.5deg)'
            }}
          />
          
          <h2 
            className="text-2xl font-bold mb-1"
            style={{
              color: clayColors.ink,
              letterSpacing: "0.01em",
              textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)"
            }}
          >
            {userData.name || "Your Name"}
          </h2>
          
          <p 
            className="text-sm"
            style={{
              color: "rgba(58, 58, 58, 0.8)",
              letterSpacing: "0.03em"
            }}
          >
            {userData.title || "Add your designation"}
          </p>
        </div>
        
        {/* Industry Tags - Clay Ribbon Style */}
        {industryTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-5 max-w-[90%]">
            {industryTags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center px-3 py-1 text-xs font-medium"
                style={{
                  background: 
                    index % 4 === 0 ? clayColors.sage : 
                    index % 4 === 1 ? clayColors.nude : 
                    index % 4 === 2 ? clayColors.mist : 
                    clayColors.blush,
                  color: clayColors.ink,
                  borderRadius: "2px",
                  boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  transform: hoveredSection === `tag-${index}` ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  clipPath: "polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)"
                }}
                onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Hash className="h-3 w-3 mr-1 opacity-70" />
                {tag.trim()}
              </div>
            ))}
          </div>
        )}
        
        {/* Company - Sticky Note Style */}
        {userData.company && (
          <div 
            className="relative mb-3 max-w-[80%]"
            style={{
              transform: hoveredSection === 'company' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s ease-out',
            }}
            onMouseEnter={() => setHoveredSection('company')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Sticky note corner fold */}
            <div 
              className="absolute -top-2 -right-2 w-5 h-5"
              style={{
                background: "#e8d28d",
                transformOrigin: "bottom left",
                transform: "rotate(45deg)",
                boxShadow: "1px -1px 1px rgba(0,0,0,0.05)"
              }}
            />
            
            {/* Main sticky note */}
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-sm"
              style={{
                background: clayColors.paperYellow,
                boxShadow: "0 3px 6px -2px rgba(0, 0, 0, 0.1)"
              }}
            >
              <Building2 className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-800">
                {userData.company}
              </span>
            </div>
          </div>
        )}
        
        {/* Location - Map Style */}
        {userData.location && (
          <div 
            className="mb-5"
            style={{
              transform: hoveredSection === 'location' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={() => setHoveredSection('location')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: clayColors.mist,
                boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              }}
            >
              <div 
                className="h-5 w-5 rounded-full flex items-center justify-center bg-white"
              >
                <MapPin className="h-3 w-3 text-gray-700" />
              </div>
              <span className="text-xs text-gray-800">
                {userData.location}
              </span>
            </div>
          </div>
        )}
        
        {/* Contact Section - Tear-off Style */}
        <div className="mt-auto w-full space-y-2">
          <div className="relative pb-4">
            {/* Perforated line */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                backgroundImage: "linear-gradient(90deg, transparent, #00000022 50%, transparent 50%)",
                backgroundSize: "8px 1px",
                backgroundRepeat: "repeat-x"
              }}
            />
            
            {/* Email */}
            <div 
              className="flex items-center justify-between px-3 py-2 mt-2 bg-white rounded-md"
              style={{
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'email' ? '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 'none',
                transform: hoveredSection === 'email' ? 'translateX(-2px)' : 'translateX(0)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={() => setHoveredSection('email')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm truncate max-w-[150px] text-gray-800">
                  {userData.email}
                </span>
              </div>
              <button
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(userData.email, "Email");
                }}
              >
                <Copy className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
            
            {/* Phone Number */}
            {userData.phoneNumber && (
              <div 
                className="flex items-center justify-between px-3 py-2 mt-2 bg-white rounded-md"
                style={{
                  border: "1px dashed rgba(0,0,0,0.08)",
                  boxShadow: hoveredSection === 'phone' ? '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 'none',
                  transform: hoveredSection === 'phone' ? 'translateX(-2px)' : 'translateX(0)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={() => setHoveredSection('phone')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm truncate max-w-[150px] text-gray-800">
                    {userData.phoneNumber}
                  </span>
                </div>
                <button
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(userData.phoneNumber || "", "Phone");
                  }}
                >
                  <Copy className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            )}
            
            {/* Profile Link */}
            <div 
              className="flex items-center justify-between px-3 py-2 mt-2 bg-white rounded-md"
              style={{
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'profile-link' ? '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 'none',
                transform: hoveredSection === 'profile-link' ? 'translateX(-2px)' : 'translateX(0)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={() => setHoveredSection('profile-link')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm truncate max-w-[150px] text-gray-800">
                  {profileLink}
                </span>
              </div>
              <button
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(`https://${profileLink}`, "Link");
                }}
              >
                <Copy className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-2">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                background: clayColors.mist,
                color: clayColors.ink,
                boxShadow: hoveredSection === 'print' 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: hoveredSection === 'print' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease'
              }}
              onClick={printCard}
              onMouseEnter={() => setHoveredSection('print')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                background: clayColors.coral,
                color: "white",
                boxShadow: hoveredSection === 'share' 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transform: hoveredSection === 'share' ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => copyToClipboard(`https://${profileLink}`, "Card link")}
              onMouseEnter={() => setHoveredSection('share')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Copy success message */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs z-50"
          style={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            animation: "fadeInOut 2s forwards"
          }}
        >
          {copySuccess}
        </div>
      )}
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          @media print {
            body * {
              visibility: hidden;
            }
            .clay-paper-card, .clay-paper-card * {
              visibility: visible;
              transform: none !important;
            }
            .clay-paper-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ClayPaperCard;