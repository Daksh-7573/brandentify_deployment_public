import React, { useState } from "react";
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
  // Paper shades
  paperWhite: "#faf8f3",    // Pure paper background
  paperCream: "#f7f4ec",    // Cream paper
  
  // Clay tones  
  softGreen: "#e1e4df",     // Soft mossy clay
  softBrown: "#e7dfd4",     // Warm earthy clay
  softBlue: "#e6ecf0",      // Light blue clay
  softPink: "#f0e6e9",      // Rose clay
  
  // Accent colors
  sticky: "#f5df98",        // Post-it yellow
  coral: "#e89b8e",         // Terra cotta
  slate: "#3a3a3a",         // Dark text/ink
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // Interaction states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
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
    <div className="clay-paper-card w-full aspect-[2/3.5] relative select-none overflow-hidden">
      {/* Main background with subtle shadow and texture */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: clayColors.paperWhite,
          boxShadow: "0 10px 25px -10px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Subtle paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      {/* Background paper layer - top */}
      <div 
        className="absolute left-0 right-0 top-[12%] h-[35%]"
        style={{
          background: clayColors.softGreen, 
          transform: "translateX(4%) rotate(-1deg)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          zIndex: 1
        }}
      />
      
      {/* Background paper layer - bottom */}
      <div 
        className="absolute left-0 right-0 bottom-[12%] h-[35%]"
        style={{
          background: clayColors.softBrown, 
          transform: "translateX(2%) rotate(0.5deg)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          zIndex: 1
        }}
      />
      
      {/* Main content area with padding */}
      <div className="absolute inset-0 p-5 flex flex-col items-center z-10">
        {/* PROFILE PHOTO - Polaroid style with paperclip */}
        <div 
          className="relative mb-4 pt-3"
          style={{
            transform: hoveredSection === 'profile' ? 'translateY(-3px) rotate(1deg)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => setHoveredSection('profile')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Paperclip effect */}
          <div className="absolute -top-1 right-0 transform rotate-12">
            <Paperclip className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Polaroid frame */}
          <div 
            className="bg-white p-2 rounded-sm transform rotate(-1deg)"
            style={{
              boxShadow: "0 4px 10px -3px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Photo */}
            <div 
              className="w-24 h-24 overflow-hidden"
              style={{
                border: "1px solid #f0f0f0",
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
            
            {/* Polaroid bottom frame */}
            <div className="h-5 bg-white mt-1" />
          </div>
        </div>
        
        {/* NAME & TITLE - Letterpress style */}
        <div 
          className="mb-4 text-center"
          style={{
            transform: hoveredSection === 'name' ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => setHoveredSection('name')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <h2 
            className="text-xl font-bold mb-1 px-2"
            style={{
              color: clayColors.slate,
              textShadow: "0px 1px 0 white",
              letterSpacing: "0.01em"
            }}
          >
            {userData.name || "Your Name"}
          </h2>
          
          <p 
            className="text-sm text-gray-700 px-2"
            style={{
              letterSpacing: "0.02em"
            }}
          >
            {userData.title || "Add your designation"}
          </p>
          
          {/* Embossed underline */}
          <div 
            className="h-px w-32 mx-auto mt-2 bg-gray-300"
            style={{
              boxShadow: "0 1px 0 rgba(255, 255, 255, 0.8)"
            }}
          />
        </div>
        
        {/* TAGS - Clay ribbon style */}
        {industryTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-[90%]">
            {industryTags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center px-3 py-1 text-xs font-medium"
                style={{
                  background: 
                    index % 4 === 0 ? clayColors.softGreen : 
                    index % 4 === 1 ? clayColors.softBrown : 
                    index % 4 === 2 ? clayColors.softBlue : 
                    clayColors.softPink,
                  color: clayColors.slate,
                  borderRadius: "2px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
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
        
        {/* COMPANY - Sticky note style */}
        {userData.company && (
          <div 
            className="relative mb-3 max-w-[80%]"
            style={{
              transform: hoveredSection === 'company' ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={() => setHoveredSection('company')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Folded corner effect */}
            <div 
              className="absolute -top-2 -right-2 w-5 h-5"
              style={{
                background: "#e8d28d",
                transformOrigin: "bottom left",
                transform: "rotate(45deg)",
                boxShadow: "1px -1px 1px rgba(0,0,0,0.05)",
                zIndex: 1
              }}
            />
            
            {/* Note content */}
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-sm"
              style={{
                background: clayColors.sticky,
                boxShadow: "0 2px 5px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              <Building2 className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-800">
                {userData.company}
              </span>
            </div>
          </div>
        )}
        
        {/* LOCATION - Map badge style */}
        {userData.location && (
          <div 
            className="mb-3"
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
                background: clayColors.softBlue,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
              }}
            >
              <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white">
                <MapPin className="h-3 w-3 text-gray-700" />
              </div>
              <span className="text-xs text-gray-800 font-medium">
                {userData.location}
              </span>
            </div>
          </div>
        )}
        
        {/* Separator before contact section */}
        <div className="w-full h-px bg-gray-200 my-2" />
        
        {/* CONTACT DETAILS - Tear-off coupon style */}
        <div className="w-full space-y-2 mt-auto">
          {/* Perforated edge */}
          <div className="w-full relative mb-3">
            <div 
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                backgroundImage: "linear-gradient(90deg, transparent, #00000022 50%, transparent 50%)",
                backgroundSize: "6px 1px",
                backgroundRepeat: "repeat-x"
              }}
            />
          </div>
          
          {/* Contact elements */}
          <div className="space-y-2">
            {/* Email */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md bg-white"
              style={{
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'email' ? '0 3px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
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
                <Copy className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
            
            {/* Phone Number */}
            {userData.phoneNumber && (
              <div 
                className="flex items-center justify-between px-3 py-2 rounded-md bg-white"
                style={{
                  border: "1px dashed rgba(0,0,0,0.08)",
                  boxShadow: hoveredSection === 'phone' ? '0 3px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
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
                  <Copy className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            )}
            
            {/* Profile Link */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md bg-white"
              style={{
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'profile-link' ? '0 3px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
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
                <Copy className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-3 mt-4">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium"
              style={{
                background: clayColors.softBlue,
                color: clayColors.slate,
                boxShadow: hoveredSection === 'print' ? 
                  '0 3px 5px -1px rgba(0, 0, 0, 0.1)' : 
                  '0 1px 3px -1px rgba(0, 0, 0, 0.05)',
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
                boxShadow: hoveredSection === 'share' ? 
                  '0 3px 5px -1px rgba(0, 0, 0, 0.1)' : 
                  '0 1px 3px -1px rgba(0, 0, 0, 0.05)',
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
      
      {/* Copy success notification */}
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