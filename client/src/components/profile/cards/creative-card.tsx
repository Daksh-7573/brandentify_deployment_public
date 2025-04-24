import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Copy, 
  Share2,
  Sparkles,
  Palette,
  Briefcase,
  TrendingUp,
  Headphones
} from "lucide-react";
import { UserData } from "@/types/user";

// Creative Color Palette
const creativeColors = {
  // Primary colors
  coral: "#ff6b6b",
  mint: "#4ed8c0",
  indigo: "#6c5ce7",
  peach: "#fdcb6e",
  skyBlue: "#74b9ff",
  
  // Background colors
  cream: "#fdfaf1",
  charcoal: "#2d3436",
  
  // Text colors
  darkText: "#2d3436",
  lightText: "#f9f9f9",
  
  // Accent colors
  magenta: "#e84393",
  violet: "#a29bfe",
  amber: "#feca57",
};

interface CreativeCardProps {
  userData: UserData;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ userData }) => {
  // Interactive states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\\s+/g, '') : userData.username}`;
  
  // Define industry icons and tags
  const getIndustryIcon = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('tech') || lowerTag.includes('software') || lowerTag.includes('develop'))
      return <Sparkles className="w-3 h-3" />;
    if (lowerTag.includes('design') || lowerTag.includes('creative') || lowerTag.includes('art'))
      return <Palette className="w-3 h-3" />;
    if (lowerTag.includes('business') || lowerTag.includes('manage') || lowerTag.includes('admin'))
      return <Briefcase className="w-3 h-3" />;
    if (lowerTag.includes('market') || lowerTag.includes('growth') || lowerTag.includes('sales'))
      return <TrendingUp className="w-3 h-3" />;
    return <Headphones className="w-3 h-3" />;
  };
  
  const industryTags = userData.industry ? userData.industry.split(/,\\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Get random pastel color
  const getRandomColor = (index: number) => {
    const colors = [
      creativeColors.coral, 
      creativeColors.mint, 
      creativeColors.indigo, 
      creativeColors.peach, 
      creativeColors.skyBlue,
      creativeColors.magenta,
      creativeColors.violet,
      creativeColors.amber
    ];
    return colors[index % colors.length];
  };
  
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
  
  return (
    <div className="creative-card relative w-full h-full select-none">
      {/* Main Card Container */}
      <div className="w-full h-full relative">
        {/* Card */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backgroundColor: creativeColors.cream,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Background Paper Texture */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.2'/%3E%3C/svg%3E\")",
              mixBlendMode: "multiply"
            }}
          />
          
          {/* Asymmetric Background Layers */}
          <div 
            className="absolute right-0 top-0 w-[95%] h-[30%] rounded-bl-3xl"
            style={{
              background: `linear-gradient(135deg, ${creativeColors.mint}80, ${creativeColors.skyBlue}60)`,
              transform: "rotate(-2deg) translateY(-2%) translateX(2%)",
              zIndex: 1
            }}
          />
          
          <div 
            className="absolute left-0 bottom-[25%] w-[90%] h-[25%] rounded-tr-3xl"
            style={{
              background: `linear-gradient(135deg, ${creativeColors.coral}70, ${creativeColors.peach}60)`,
              transform: "rotate(1deg) translateY(3%) translateX(-2%)",
              zIndex: 1
            }}
          />
          
          {/* Content Container */}
          <div className="absolute inset-0 z-10 p-4 flex flex-col overflow-visible">
            {/* TOP SECTION - Visual Identity */}
            <div className="relative mb-4">
              {/* Profile Image with Paint Splash */}
              <div className="relative mb-2">
                {/* Paint splash background */}
                <div 
                  className="absolute -top-1 -left-3 w-24 h-24 rounded-full"
                  style={{
                    background: `linear-gradient(45deg, ${creativeColors.indigo}, ${creativeColors.violet})`,
                    filter: "blur(10px)",
                    opacity: 0.7,
                    transform: "rotate(-5deg) scale(1.1)",
                    animation: "pulse 5s infinite alternate ease-in-out"
                  }}
                />
                
                {/* Profile image with polaroid frame */}
                <div 
                  className="relative w-20 h-20 rounded-lg overflow-hidden"
                  style={{
                    padding: "3px",
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
                    transform: "rotate(-3deg)",
                    animation: hoveredSection === 'profile' ? 'tiltRight 3s infinite alternate ease-in-out' : 'none',
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={() => setHoveredSection('profile')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.name || "Profile"}
                      className="h-full w-full object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=e6e6e6&color=5a5a5a";
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e6e6e6&color=5a5a5a`}
                      alt={userData.name || "Profile"} 
                      className="h-full w-full object-cover rounded"
                    />
                  )}
                </div>
              </div>
              
              {/* Name & Title with Styled Underline */}
              <div className="relative">
                {/* Colored Tape for Name */}
                <div 
                  className="absolute top-[10px] left-[-4px] right-[40%] h-[18px] rounded-sm z-0"
                  style={{
                    background: creativeColors.amber,
                    transform: "rotate(-1deg) skewX(-5deg)",
                  }}
                />
                
                <h2 
                  className="text-xl font-bold z-10 relative mb-1 px-1"
                  style={{
                    fontFamily: "DM Serif Display, serif",
                    color: creativeColors.darkText,
                    transform: "translateY(0)",
                    textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {userData.name || "Your Name"}
                </h2>
                
                {/* Colored Label for Title */}
                <div 
                  className="relative inline-block px-1 py-1 mt-1"
                  style={{
                    transform: "rotate(-1deg) translateX(5px)",
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-opacity-30"
                    style={{
                      backgroundColor: creativeColors.indigo,
                      transform: "skewX(-5deg)",
                      borderRadius: "2px",
                    }}
                  />
                  <p 
                    className="text-xs relative z-10 font-medium px-1"
                    style={{
                      color: creativeColors.darkText,
                    }}
                  >
                    {userData.title || "Add your designation"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* INDUSTRY & DOMAIN TAGS - Paint Stroke Badges */}
            {industryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {industryTags.map((tag, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: getRandomColor(index),
                      borderRadius: "3px",
                      transform: `rotate(${Math.random() * 2 - 1}deg)`,
                      color: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      opacity: hoveredSection === `tag-${index}` ? 1 : 0.85,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <span className="mr-1">
                      {getIndustryIcon(tag)}
                    </span>
                    {tag.trim()}
                  </div>
                ))}
              </div>
            )}
            
            {/* COMPANY - Sticky Note Style */}
            {userData.company && (
              <div 
                className="relative mb-2 max-w-[75%]"
                style={{
                  transform: hoveredSection === 'company' 
                    ? 'translateY(-2px)' 
                    : 'translateY(0)',
                  transition: "transform 0.3s ease",
                  animation: hoveredSection === 'company' 
                    ? 'tiltLeft 3s infinite alternate ease-in-out' 
                    : 'none',
                }}
                onMouseEnter={() => setHoveredSection('company')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {/* Tape at top of sticky */}
                <div 
                  className="absolute top-[-4px] left-[20%] right-[20%] h-[5px] rounded opacity-50"
                  style={{
                    backgroundColor: creativeColors.peach,
                  }}
                />
                
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded"
                  style={{
                    backgroundColor: creativeColors.peach,
                    boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Building2 className="h-3 w-3 text-gray-700" />
                  <span 
                    className="text-xs font-medium"
                    style={{
                      color: creativeColors.darkText,
                    }}
                  >
                    Currently @ {userData.company}
                  </span>
                </div>
              </div>
            )}
            
            {/* LOCATION - Stamp Style */}
            {userData.location && (
              <div 
                className="relative mb-2"
                style={{
                  transform: hoveredSection === 'location' 
                    ? 'translateY(-2px) rotate(-1deg)' 
                    : 'translateY(0) rotate(-1deg)',
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('location')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div 
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px dashed rgba(0,0,0,0.2)",
                    boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div 
                    className="h-5 w-5 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: creativeColors.skyBlue,
                    }}
                  >
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span 
                    className="text-xs font-medium"
                    style={{
                      color: creativeColors.darkText,
                    }}
                  >
                    {userData.location}
                  </span>
                </div>
              </div>
            )}
            
            {/* Jagged torn paper edge before contact section */}
            <div className="relative py-3 mb-3">
              <div 
                className="absolute left-0 right-0 h-[10px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='10' viewBox='0 0 100 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L4 3 L7 1 L10 4 L13 2 L16 5 L20 0 L24 3 L28 1 L32 5 L36 3 L40 6 L43 2 L46 5 L50 1 L54 4 L57 2 L60 6 L63 0 L66 3 L69 1 L73 5 L77 2 L81 6 L85 3 L88 7 L92 2 L96 6 L100 3 L100 10 L0 10 Z' fill='${creativeColors.cream.replace('#', '%23')}' /%3E%3C/svg%3E")`,
                  top: 0
                }}
              />
            </div>
            
            {/* CONTACT SECTION - With animated icons */}
            <div className="space-y-2 mt-auto">
              <h3 
                className="text-xs font-bold tracking-wide mb-1 relative z-10 inline-block"
                style={{
                  color: creativeColors.darkText,
                  fontFamily: "DM Serif Display, serif",
                }}
              >
                <span className="relative">
                  GET IN TOUCH
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded"
                    style={{
                      backgroundColor: creativeColors.coral,
                    }}
                  />
                </span>
              </h3>
              
              {/* Email with envelope animation */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "white",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  transform: hoveredSection === 'email' ? 'translateX(3px)' : 'translateX(0)',
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('email')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: creativeColors.coral,
                      animation: hoveredSection === 'email' ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    <Mail className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs truncate max-w-[140px] font-medium">
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
                  <Copy className="h-3 w-3 text-gray-600" />
                </button>
              </div>
              
              {/* Phone with pulse animation */}
              {userData.phoneNumber && (
                <div 
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid rgba(0,0,0,0.05)",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    transform: hoveredSection === 'phone' ? 'translateX(3px)' : 'translateX(0)',
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={() => setHoveredSection('phone')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: creativeColors.indigo,
                        animation: hoveredSection === 'phone' ? 'buzz 0.3s infinite' : 'none'
                      }}
                    >
                      <Phone className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs truncate max-w-[140px] font-medium">
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
                    <Copy className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
              )}
              
              {/* Website/Profile Link */}
              <div 
                className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "white",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  transform: hoveredSection === 'website' ? 'translateX(3px)' : 'translateX(0)',
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('website')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: creativeColors.skyBlue,
                    }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-white"
                      style={{
                        animation: hoveredSection === 'website' ? 'spin 4s linear infinite' : 'none'
                      }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <span className="text-xs truncate max-w-[140px] font-medium">
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
                  <Copy className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Share Button */}
            <div className="mt-5 flex justify-center">
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: `linear-gradient(45deg, ${creativeColors.indigo}, ${creativeColors.violet})`,
                  color: "white",
                  boxShadow: hoveredSection === 'share' 
                    ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
                    : '0 2px.8px rgba(0, 0, 0, 0.15)',
                  transform: hoveredSection === 'share' ? 'translateY(-2px)' : 'translateY(0)',
                  transition: "all 0.2s ease"
                }}
                onClick={() => copyToClipboard(`https://${profileLink}`, "Profile link")}
                onMouseEnter={() => setHoveredSection('share')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <Share2 className="h-4 w-4" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copy Success Message */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-xs z-50"
          style={{
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            animation: "fadeInOut 2s forwards"
          }}
        >
          {copySuccess}
        </div>
      )}
      
      {/* Animations */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes buzz {
            0% { transform: translateX(0); }
            25% { transform: translateX(-1px); }
            50% { transform: translateX(0); }
            75% { transform: translateX(1px); }
            100% { transform: translateX(0); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes tiltRight {
            0% { transform: rotate(-3deg); }
            100% { transform: rotate(0deg); }
          }
          
          @keyframes tiltLeft {
            0% { transform: translateY(0); }
            100% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          /* Font imports */
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;700&display=swap');
          
          /* Print styles */
          @media print {
            body * {
              visibility: hidden;
            }
            .creative-card, .creative-card * {
              visibility: visible;
              transform: none !important;
              animation: none !important;
            }
            .creative-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CreativeCard;