import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Copy,
  Sparkles,
  Palette,
  Briefcase,
  TrendingUp,
  Headphones,
  Building2
} from "lucide-react";
import { UserData } from "@/types/user";

// Creative Color Palette - Updated with pastel tones
const creativeColors = {
  // Primary pastel colors
  mint: "#98d8c6",      // Pastel mint
  coral: "#ff9a8b",     // Pastel coral
  lavender: "#d4bbff",  // Pastel lavender
  lemon: "#fff0a8",     // Pastel lemon
  peach: "#fdcb9e",     // Pastel peach
  skyBlue: "#a8e1ff",   // Pastel sky blue
  
  // Background colors
  cream: "#fdfaf5",
  charcoal: "#2d3436",
  
  // Text colors
  darkText: "#2d3436",
  lightText: "#f9f9f9",
  
  // Accent colors
  magenta: "#f7a8d8",   // Soft magenta
  violet: "#c4b5fd",    // Soft violet
  teal: "#5eead4",      // Soft teal
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
      creativeColors.lavender, 
      creativeColors.peach, 
      creativeColors.skyBlue,
      creativeColors.magenta,
      creativeColors.violet,
      creativeColors.lemon,
      creativeColors.teal
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
  
  // Track mouse movement for 3D effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div 
      className="creative-card relative w-full h-full select-none" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
    >
      {/* Main Card Container */}
      <div 
        className="w-full h-full relative transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) 
                     rotateY(${mousePosition.x * 10}deg) 
                     rotateX(${-mousePosition.y * 10}deg)
                     translateZ(10px)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Card */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backgroundColor: creativeColors.cream,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transform: "translateZ(0)",
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
              {/* Profile Image with Watercolor Splash Border */}
              <div className="relative mb-2">
                {/* Paint splash background - outer glow */}
                <div 
                  className="absolute -top-2 -left-2 w-[90px] h-[90px] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${creativeColors.lavender}90, ${creativeColors.skyBlue}40)`,
                    filter: "blur(8px)",
                    opacity: 0.8,
                    transform: "scale(1.1)",
                    animation: "pulse 6s infinite alternate ease-in-out"
                  }}
                />
                
                {/* Watercolor border - SVG-based painted circle */}
                <div 
                  className="absolute -top-1 -left-1 w-[80px] h-[80px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Cpath fill='none' stroke='%23${creativeColors.coral.replace('#', '')}' stroke-width='8' stroke-linecap='round' d='M27.8,99.4c0-39.7,32.1-72.1,71.6-72.1c17.2,0,33.3,6.3,45.6,16.7c12.6,10.6,22.6,25.7,23,43c0.2,8.6-1.6,17.1-5.3,24.9c-3.7,7.8-9.1,14.9-16.1,20.2c-13.9,10.6-32.4,15.6-50.6,12.7c-18.5-2.9-35.7-14.2-45.6-30.4C41.5,99.9,36.3,80,41,61.5' opacity='0.6' filter='blur(0.5px)' transform='rotate(76, 100, 100) translate(3, 0)'/%3E%3C/svg%3E")`,
                    backgroundSize: "cover",
                    transform: "rotate(23deg)",
                    animation: "spin 20s infinite linear",
                    opacity: 0.85
                  }}
                />
                
                {/* Profile image with circular frame */}
                <div 
                  className="relative w-[70px] h-[70px] rounded-full overflow-hidden"
                  style={{
                    padding: "0px",
                    background: "white",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    animation: hoveredSection === 'profile' ? 'float 3s infinite alternate ease-in-out' : 'none',
                    transition: "all 0.3s ease",
                    border: `3px solid white`
                  }}
                  onMouseEnter={() => setHoveredSection('profile')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.name || "Profile"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=e6e6e6&color=5a5a5a";
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e6e6e6&color=5a5a5a`}
                      alt={userData.name || "Profile"} 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
              
              {/* Name & Title with Artistic Styling */}
              <div className="relative ml-1 mt-2">
                {/* Watercolor background for name */}
                <div 
                  className="absolute top-[3px] left-[-10px] right-[20%] h-[28px] z-0"
                  style={{
                    background: `linear-gradient(90deg, ${creativeColors.lemon}80, ${creativeColors.peach}60)`,
                    borderRadius: "4px",
                    transform: "rotate(-1deg)",
                    opacity: 0.7,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                />
                
                <h2 
                  className="text-xl font-bold z-10 relative mb-1.5 pl-2"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: creativeColors.darkText,
                    transform: "translateY(0)",
                    textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)",
                    letterSpacing: "0.02em"
                  }}
                >
                  {userData.name || "Your Name"}
                </h2>
                
                {/* Artistic Badge for Job Title */}
                <div 
                  className="relative inline-block px-2 py-1 mt-1 ml-4 overflow-visible"
                  style={{
                    transform: "rotate(-1deg)",
                  }}
                >
                  {/* Paint splatter behind title */}
                  <div 
                    className="absolute -left-1 -top-1 -right-1 -bottom-1 rounded-lg"
                    style={{
                      background: `radial-gradient(circle at 30% 50%, ${creativeColors.mint}95, ${creativeColors.skyBlue}50)`,
                      opacity: 0.7,
                      transform: "scale(1.1) rotate(2deg)",
                      filter: "blur(2px)"
                    }}
                  />
                  
                  <p 
                    className="text-sm relative z-10 font-medium"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      color: "#444",
                      textShadow: "0.5px 0.5px 0 rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    {userData.title || "Add your designation"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* INDUSTRY TAGS - Illustrated Icon Badge Style */}
            {industryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 mt-1">
                {industryTags.map((tag, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium"
                    style={{
                      backgroundColor: getRandomColor(index),
                      borderRadius: "16px",
                      transform: `rotate(${Math.random() * 2 - 1}deg)`,
                      color: "white",
                      boxShadow: `0 2px 5px ${getRandomColor(index)}50, inset 0 1px 2px rgba(255,255,255,0.3)`,
                      opacity: hoveredSection === `tag-${index}` ? 1 : 0.9,
                      transition: "all 0.2s ease-in-out",
                      border: "1px solid rgba(255,255,255,0.4)"
                    }}
                    onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="mr-1 p-1 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                      {getIndustryIcon(tag)}
                    </div>
                    <span className="tracking-wide">{tag.trim()}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* DOMAIN - Chip Style Tag with Glow */}
            {userData.domain && (
              <div className="mb-3">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: creativeColors.teal,
                    color: "white",
                    boxShadow: `0 2px 8px ${creativeColors.teal}80`,
                    transform: hoveredSection === 'domain' ? 'translateY(-2px)' : 'translateY(0)',
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}
                  onMouseEnter={() => setHoveredSection('domain')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width="14" 
                    height="14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  
                  <span>{userData.domain}</span>
                </div>
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
                        backgroundColor: creativeColors.violet,
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
          
          @keyframes float {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.02); }
            100% { transform: translateY(0) scale(1); }
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