import React, { useState, useMemo } from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  Building2, 
  Hash,
  Copy,
  Printer,
  Share2
} from "lucide-react";
import { UserData } from "@/types/user";

// Define soft clay colors palette
const clayColors = {
  pastelBlue: "#d4e3f6",
  blush: "#f0e6e9",
  taupe: "#e6e2dd",
  offWhite: "#fdfcfa",
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // State for hover and copy feedback
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
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

  // Get element style based on whether it's hovered
  const getElementStyle = (sectionId: string, defaultShadow: string, hoverShadow: string) => {
    const isHovered = hoveredSection === sectionId;
    return {
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHovered ? hoverShadow : defaultShadow
    };
  };
  
  return (
    <div className="clay-paper-card w-full aspect-[2/3.5] relative">
      {/* Background layer with clay effect - soft clay colors */}
      <div 
        className="absolute inset-0 rounded-3xl"
        style={{
          transform: "translate(10px, 10px)",
          background: `linear-gradient(135deg, ${clayColors.taupe} 0%, ${clayColors.pastelBlue} 50%, ${clayColors.blush} 100%)`,
          boxShadow: "-3px -3px 6px rgba(255, 255, 255, 0.8), 3px 3px 8px rgba(174, 164, 164, 0.3)"
        }}
      />
      
      {/* Main card with enhanced paper effect and inner shadows */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#fdfcfa", // Off-white paper color
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.05)",
          borderTop: "1px solid rgba(255, 255, 255, 0.8)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.8)",
          borderRight: "1px solid rgba(200, 200, 200, 0.5)",
          borderBottom: "1px solid rgba(200, 200, 200, 0.5)"
        }}
      >
        {/* Japanese Washi paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "multiply"
          }}
        />
        
        {/* Additional subtle fiber texture - simulates handmade paper */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L200,200 M40,0 L200,160 M80,0 L200,120 M120,0 L200,80 M160,0 L200,40 M0,40 L160,200 M0,80 L120,200 M0,120 L80,200 M0,160 L40,200 M0,200 L200,0 M0,160 L160,0 M0,120 L120,0 M0,80 L80,0 M0,40 L40,0' stroke='%23c9c7c3' stroke-width='0.5' fill='none' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        />
        
        {/* Content container */}
        <div className="h-full w-full p-6 flex flex-col">
          {/* Profile Identity Section */}
          <div className="flex flex-col items-center mb-6">
            {/* Profile picture with elevation */}
            <div 
              className="relative mb-4"
              onMouseEnter={() => setHoveredSection('profile')}
              onMouseLeave={() => setHoveredSection(null)}
              style={{
                transition: "transform 0.3s ease",
                transform: hoveredSection === 'profile' ? 'translateY(-3px)' : 'translateY(0)'
              }}
            >
              {/* Shadow layer for depth effect */}
              <div 
                className="absolute rounded-full bg-slate-200" 
                style={{
                  height: "104px",
                  width: "104px",
                  top: "4px",
                  left: "4px",
                  zIndex: 0
                }}
              />
              
              {/* Profile image container */}
              <div 
                className="w-26 h-26 rounded-full relative z-10 bg-white p-1"
                style={{
                  boxShadow: "0 2px 10px -2px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
                }}
              >
                <div className="h-24 w-24 rounded-full overflow-hidden border border-slate-100">
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
              </div>
            </div>
            
            {/* Name and Job Title */}
            <div 
              className="text-center mb-4 relative"
              style={{
                textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)"
              }}
            >
              <h2 
                className="text-2xl font-bold text-slate-800 mb-1"
                style={{
                  fontFamily: "'Poppins', sans-serif", 
                  letterSpacing: "0.01em",
                  textShadow: "1px 1px 0 white"
                }}
              >
                {userData.name || "Your Name"}
              </h2>
              <p 
                className="text-sm text-slate-600"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  letterSpacing: "0.03em"
                }}
              >
                {userData.title || "Add your designation"}
              </p>
              
              {/* Embossed underline */}
              <div 
                className="h-px w-40 mx-auto mt-3"
                style={{
                  background: "linear-gradient(to right, transparent, rgba(203, 213, 225, 0.8), transparent)",
                  boxShadow: "0 1px 0 rgba(255, 255, 255, 0.8)"
                }}
              />
            </div>
          </div>
          
          {/* Professional Details Section */}
          <div className="mb-6">
            {/* Industry tags displayed as paper chips */}
            {industryTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {industryTags.map((tag, index) => (
                  <div 
                    key={index}
                    className="flex items-center px-3 py-1 rounded-full text-xs"
                    style={{
                      background: index % 3 === 0 ? clayColors.pastelBlue : 
                                index % 3 === 1 ? clayColors.blush : 
                                clayColors.taupe,
                      fontFamily: "'Nunito', sans-serif",
                      letterSpacing: "0.03em",
                      ...getElementStyle(
                        `tag-${index}`, 
                        "0 1px 2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
                      )
                    }}
                    onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <Hash className="h-3 w-3 mr-1 text-blue-500" />
                    {tag.trim()}
                  </div>
                ))}
              </div>
            )}
            
            {/* Company in a clay-toned box */}
            {userData.company && (
              <div 
                className="flex items-center justify-center gap-2 mb-3 mx-auto px-4 py-2 rounded-lg max-w-[85%]"
                style={{
                  background: `linear-gradient(to bottom, ${clayColors.offWhite}, ${clayColors.taupe})`,
                  fontFamily: "'Nunito', sans-serif",
                  letterSpacing: "0.02em",
                  ...getElementStyle(
                    'company',
                    "0 1px 3px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                    "0 4px 6px -1px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
                  )
                }}
                onMouseEnter={() => setHoveredSection('company')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span className="text-sm text-slate-700">{userData.company}</span>
              </div>
            )}
            
            {/* Location with paper fold line */}
            {userData.location && (
              <div className="flex flex-col items-center">
                <div 
                  className="flex items-center justify-center gap-2 mb-2"
                  style={{
                    transition: "transform 0.2s ease",
                    transform: hoveredSection === 'location' ? 'translateY(-2px)' : 'translateY(0)',
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: "0.02em"
                  }}
                  onMouseEnter={() => setHoveredSection('location')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 shadow-sm">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <span className="text-sm text-slate-700">{userData.location}</span>
                </div>
                
                {/* Dashed fold line */}
                <div 
                  className="w-40 h-px mb-4 mt-2"
                  style={{
                    backgroundImage: "linear-gradient(to right, #cbd5e1 50%, transparent 50%)",
                    backgroundSize: "8px 1px",
                    backgroundRepeat: "repeat-x",
                    boxShadow: "0 1px 0 rgba(255, 255, 255, 0.8)"
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Contact Section */}
          <div className="mt-auto space-y-3">
            {/* Email Address */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-100"
              style={{
                background: clayColors.offWhite,
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: "0.02em",
                ...getElementStyle(
                  'email',
                  "inset 0 1px 0 white, 0 1px 3px rgba(0, 0, 0, 0.05)",
                  "inset 0 1px 0 white, 0 4px 6px -1px rgba(0, 0, 0, 0.08)"
                )
              }}
              onMouseEnter={() => setHoveredSection('email')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-700 truncate max-w-[150px]">
                  {userData.email}
                </span>
              </div>
              <button
                className="p-1 rounded hover:bg-slate-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(userData.email, "Email");
                }}
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
            
            {/* Phone Number */}
            {userData.phoneNumber && (
              <div 
                className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-100"
                style={{
                  background: clayColors.offWhite,
                  fontFamily: "'Nunito', sans-serif",
                  letterSpacing: "0.02em",
                  ...getElementStyle(
                    'phone',
                    "inset 0 1px 0 white, 0 1px 3px rgba(0, 0, 0, 0.05)",
                    "inset 0 1px 0 white, 0 4px 6px -1px rgba(0, 0, 0, 0.08)"
                  )
                }}
                onMouseEnter={() => setHoveredSection('phone')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-slate-700 truncate max-w-[150px]">
                    {userData.phoneNumber}
                  </span>
                </div>
                <button
                  className="p-1 rounded hover:bg-slate-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(userData.phoneNumber || "", "Phone");
                  }}
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            )}
            
            {/* Profile Link */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-50 border border-slate-100"
              style={getElementStyle(
                'profile-link',
                "inset 0 1px 0 white, 0 1px 3px rgba(0, 0, 0, 0.05)",
                "inset 0 1px 0 white, 0 4px 6px -1px rgba(0, 0, 0, 0.08)"
              )}
              onMouseEnter={() => setHoveredSection('profile-link')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-700 truncate max-w-[150px]">
                  {profileLink}
                </span>
              </div>
              <button
                className="p-1 rounded hover:bg-slate-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(`https://${profileLink}`, "Link");
                }}
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
            
            {/* Copy success message */}
            {copySuccess && (
              <div 
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-1 rounded-full text-xs"
                style={{
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  animation: "fadeInOut 2s forwards"
                }}
              >
                {copySuccess}
              </div>
            )}
          </div>
          
          {/* Special features - print and share */}
          <div className="flex justify-center gap-3 mt-4">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-xs text-slate-600"
              style={getElementStyle(
                'print',
                "0 1px 2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
                "0 4px 6px -1px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
              )}
              onClick={printCard}
              onMouseEnter={() => setHoveredSection('print')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-xs text-slate-600"
              style={getElementStyle(
                'share',
                "0 1px 2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
                "0 4px 6px -1px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
              )}
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
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, 10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .clay-paper-card, .clay-paper-card * {
            visibility: visible;
          }
          .clay-paper-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ClayPaperCard;