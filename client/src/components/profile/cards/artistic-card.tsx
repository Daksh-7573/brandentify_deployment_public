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
  Headphones,
  Brush,
  Image,
  Eye
} from "lucide-react";
import { UserData } from "@/types/user";

// Artistic Color Palette
const artisticColors = {
  // Primary colors
  burgundy: "#a83838",
  teal: "#3a7b7b",
  navy: "#2c3e50",
  mint: "#4ed8c0",
  lilac: "#9f77d1",
  
  // Earth tones
  rust: "#d35400",
  sage: "#7f8c8d",
  clay: "#d7ccc8",
  wheat: "#f5deb3",
  sienna: "#a0522d",
  
  // Background colors
  canvas: "#f9f7f0",
  parchment: "#f4f1e5",
  
  // Text colors
  inkBlack: "#2d3436",
  darkGray: "#34495e",
  
  // Accent colors
  crimson: "#c0392b",
  emerald: "#27ae60",
  amber: "#f39c12",
};

// Paper texture SVG for background
const paperTextureSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0.1" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" opacity="0.08" />
  </svg>
`;

interface ArtisticCardProps {
  userData: UserData;
}

const ArtisticCard: React.FC<ArtisticCardProps> = ({ userData }) => {
  // Interactive states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
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
  
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Get artistic color for tags
  const getArtisticColor = (index: number) => {
    const colors = [
      artisticColors.burgundy,
      artisticColors.teal,
      artisticColors.navy,
      artisticColors.mint,
      artisticColors.lilac,
      artisticColors.rust,
      artisticColors.sage
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
  
  // Generate a random offset for the scrapbook effect
  const randomOffset = (min = -5, max = 5) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  return (
    <div className="artistic-card relative w-full h-full select-none">
      {/* Main Card Container */}
      <div className="w-full h-full relative overflow-visible">
        {/* Organic shape card with paper texture */}
        <div 
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: artisticColors.parchment,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.07)",
            // Generate a subtle, organic "blob" shape for the card
            clipPath: "polygon(3% 0%, 7% 1%, 11% 0%, 16% 2%, 20% 0%, 24% 2%, 28% 2%, 32% 1%, 35% 1%, 39% 3%, 42% 3%, 47% 2%, 50% 2%, 53% 0%, 58% 2%, 60% 4%, 63% 5%, 65% 4%, 70% 4%, 73% 5%, 76% 4%, 79% 5%, 82% 5%, 86% 4%, 91% 3%, 95% 4%, 98% 6%, 100% 7%, 99% 11%, 100% 15%, 98% 18%, 100% 22%, 99% 26%, 100% 30%, 99% 35%, 99% 40%, 100% 43%, 99% 48%, 100% 53%, 99% 57%, 99% 63%, 100% 67%, 99% 71%, 100% 77%, 99% 83%, 100% 87%, 99% 91%, 100% 96%, 97% 97%, 93% 98%, 89% 99%, 85% 99%, 80% 100%, 74% 99%, 70% 99%, 65% 99%, 60% 98%, 55% 99%, 50% 98%, 45% 99%, 41% 100%, 38% 99%, 33% 99%, 29% 100%, 24% 99%, 19% 99%, 14% 100%, 10% 99%, 5% 99%, 1% 97%, 0% 95%, 0% 91%, 1% 87%, 0% 83%, 1% 79%, 0% 74%, 1% 69%, 0% 65%, 0% 60%, 0% 55%, 1% 50%, 0% 45%, 1% 40%, 0% 35%, 1% 30%, 0% 25%, 0% 21%, 0% 16%, 1% 10%, 0% 5%)",
          }}
        >
          {/* Paper texture overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(paperTextureSvg)}")`,
              backgroundRepeat: "repeat",
            }}
          />
          
          {/* Border detail - paint stroke effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 35% 20%, ${artisticColors.mint}40 0%, transparent 70%), 
                          radial-gradient(circle at 85% 70%, ${artisticColors.lilac}40 0%, transparent 70%)`,
              filter: "blur(25px)",
              opacity: 0.6,
              mixBlendMode: "multiply",
            }}
          />
          
          {/* Floating color palette dots behind content */}
          <div className="absolute top-[15%] right-[10%] w-2 h-2 rounded-full bg-red-400 opacity-40" 
               style={{ animation: "float 8s infinite ease-in-out" }} />
          <div className="absolute top-[75%] left-[15%] w-1.5 h-1.5 rounded-full bg-yellow-400 opacity-30" 
               style={{ animation: "float 7s 2s infinite ease-in-out" }} />
          <div className="absolute top-[45%] right-[20%] w-2.5 h-2.5 rounded-full bg-blue-400 opacity-30" 
               style={{ animation: "float 10s 1s infinite ease-in-out" }} />
          <div className="absolute top-[60%] left-[30%] w-2 h-2 rounded-full bg-green-400 opacity-25" 
               style={{ animation: "float 9s 3s infinite ease-in-out" }} />
          
          {/* Content Container */}
          <div className="absolute inset-0 z-10 p-5 flex flex-col overflow-visible">
            {/* TOP SECTION - Visual Identity */}
            <div className="relative mb-4">
              <div className="flex items-start">
                {/* Profile Image with artistic frame */}
                <div className="relative mb-3 mr-3">
                  {/* Artistic blob shape for photo */}
                  <div 
                    className="absolute inset-0 z-0"
                    style={{
                      backgroundColor: artisticColors.wheat,
                      borderRadius: "60% 40% 50% 50% / 40% 50% 60% 50%", 
                      transform: `rotate(${randomOffset(-10, 10)}deg)`,
                      opacity: 0.6,
                      filter: "blur(8px)",
                    }}
                  />
                  
                  {/* Profile photo with irregular outline */}
                  <div 
                    className="relative z-10 w-20 h-20 overflow-hidden"
                    style={{
                      borderRadius: "60% 40% 50% 50% / 40% 50% 60% 50%", 
                      padding: "0.2rem",
                      background: "linear-gradient(45deg, #e6e6e6, #ffffff)",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      transform: hoveredSection === 'profile' ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)',
                      transition: "transform 0.4s ease-out",
                    }}
                    onMouseEnter={() => setHoveredSection('profile')}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {userData.photoURL ? (
                      <img 
                        src={userData.photoURL} 
                        alt={userData.name || "Profile"}
                        className="h-full w-full object-cover"
                        style={{ borderRadius: "inherit" }}
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
                        style={{ borderRadius: "inherit" }}
                      />
                    )}
                    
                    {/* Sketch effect border */}
                    <div 
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        border: "1px dashed rgba(0,0,0,0.1)",
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.2)",
                      }}
                    />
                  </div>
                </div>
                
                {/* Name & Title Group */}
                <div className="flex-1 relative pt-1">
                  {/* Name with decorative paint label */}
                  <div 
                    className="relative mb-2"
                    style={{
                      transform: `rotate(${randomOffset(-2, 1)}deg)`,
                    }}
                  >
                    {/* Decorative paint label for name */}
                    <div 
                      className="absolute -inset-1 rounded"
                      style={{
                        background: artisticColors.wheat,
                        opacity: 0.6,
                        transform: "skewX(-3deg)",
                      }}
                    />
                    
                    <h2 
                      className="relative z-10 text-xl font-serif font-bold mb-1 pl-1"
                      style={{
                        color: artisticColors.inkBlack,
                        fontFamily: "'Playfair Display', 'DM Serif Display', serif",
                        textShadow: "1px 1px 0px rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      {userData.name || "Your Name"}
                    </h2>
                  </div>
                  
                  {/* Title with offset placement */}
                  <div 
                    className="relative ml-4"
                    style={{
                      transform: hoveredSection === 'title' 
                        ? 'translateY(0) rotate(0deg)' 
                        : 'translateY(-2px) rotate(-1deg)',
                      transition: "transform 0.3s ease-out",
                      opacity: hoveredSection === 'title' ? 1 : 0.9,
                    }}
                    onMouseEnter={() => setHoveredSection('title')}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {/* Brush stroke behind title */}
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: artisticColors.sage,
                        borderRadius: "0 10px 0 10px",
                        transform: "skew(-5deg, 1deg)",
                      }}
                    />
                    
                    <p 
                      className="relative z-10 text-sm font-medium pl-1 pr-2 py-0.5"
                      style={{
                        color: artisticColors.inkBlack,
                      }}
                    >
                      {userData.title || "Add your designation"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* PROFESSIONAL DETAILS SECTION */}
              <div className="space-y-3 mt-2">
                {/* Industry / Domain Tags - Paint chip labels */}
                {industryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {industryTags.map((tag, index) => (
                      <div 
                        key={index}
                        className="inline-flex items-center gap-1 py-0.5 pl-1 pr-1.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${getArtisticColor(index)}25`,
                          color: getArtisticColor(index),
                          borderLeft: `2px solid ${getArtisticColor(index)}`,
                          borderRadius: "0 4px 4px 0",
                          transform: `rotate(${randomOffset(-2, 2)}deg)`,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          opacity: hoveredSection === `tag-${index}` ? 1 : 0.9,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                        onMouseLeave={() => setHoveredSection(null)}
                      >
                        <span className="mr-0.5 opacity-80">
                          {getIndustryIcon(tag)}
                        </span>
                        <span 
                          style={{
                            fontFamily: "'Sriracha', 'Caveat', cursive",
                          }}
                        >
                          #{tag.trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Company/Organization - Exhibition label */}
                {userData.company && (
                  <div 
                    className="relative inline-block max-w-[85%] mt-1"
                    style={{
                      transform: hoveredSection === 'company' 
                        ? 'translateY(-2px) rotate(0deg)' 
                        : 'translateY(0) rotate(0deg)',
                      transition: "transform 0.3s ease-out",
                    }}
                    onMouseEnter={() => setHoveredSection('company')}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div 
                      className="px-3 py-2 rounded-sm"
                      style={{
                        backgroundColor: artisticColors.canvas,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-gray-700" />
                        <span 
                          className="text-xs font-medium"
                          style={{
                            color: artisticColors.inkBlack,
                          }}
                        >
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block -mb-0.5">
                            Current Exhibition
                          </span>
                          {userData.company}
                        </span>
                      </div>
                    </div>
                    
                    {/* Exhibition pushpin effect */}
                    <div 
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: artisticColors.amber,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                )}
                
                {/* Location - Mini map style */}
                {userData.location && (
                  <div 
                    className="relative inline-flex mt-1"
                    style={{
                      transform: hoveredSection === 'location' 
                        ? 'translateY(-1px)' 
                        : 'translateY(0)',
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={() => setHoveredSection('location')}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="flex items-start gap-1">
                      {/* Map pin */}
                      <div 
                        className="h-5 w-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          backgroundColor: artisticColors.burgundy,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                        }}
                      >
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      
                      <div className="relative">
                        {/* Subtle map sketch */}
                        <div 
                          className="absolute inset-0 opacity-8"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 5 L15 5 L25 10 L35 5 L45 15 L55 5' stroke='%23d3d3d3' fill='none' stroke-width='0.5' /%3E%3Cpath d='M5 15 L15 20 L25 15 L35 20 L45 10 L55 15' stroke='%23d3d3d3' fill='none' stroke-width='0.5' /%3E%3Cpath d='M5 25 L15 15 L25 25 L35 15 L45 25 L55 20' stroke='%23d3d3d3' fill='none' stroke-width='0.5' /%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                          }}
                        />
                        
                        <span 
                          className="relative z-10 text-xs font-medium ml-1"
                          style={{
                            color: artisticColors.darkGray,
                            fontFamily: "'Caveat', cursive",
                          }}
                        >
                          {userData.location}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Brush stroke separator */}
              <div className="relative my-4 h-[3px]">
                <svg 
                  viewBox="0 0 200 10" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full opacity-60"
                >
                  <path 
                    d="M0,5 Q30,9 60,5 T120,5 T180,5 T240,5" 
                    fill="none" 
                    stroke={artisticColors.teal} 
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            
            {/* CONTACT SECTION - Post-it notes & folded tabs */}
            <div className="space-y-2.5 mt-auto">
              <h3 
                className="text-sm font-bold tracking-wide mb-2 relative z-10 inline-block"
                style={{
                  color: artisticColors.navy,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                <span className="relative">
                  connect with artist
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded"
                    style={{
                      backgroundColor: artisticColors.amber,
                    }}
                  />
                </span>
              </h3>
              
              {/* Email - Folded paper tab */}
              <div 
                className="relative"
                style={{
                  transform: hoveredSection === 'email' 
                    ? 'rotate(1deg) translateX(2px)' 
                    : 'rotate(0) translateX(0)',
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('email')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div 
                  className="flex items-center justify-between px-3 py-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "2px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: artisticColors.mint,
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
                
                {/* Folded corner effect */}
                <div 
                  className="absolute top-0 right-0 w-4 h-4"
                  style={{
                    backgroundImage: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.03) 50%)",
                    borderBottomLeftRadius: "4px",
                  }}
                />
              </div>
              
              {/* Phone - Stamped label */}
              {userData.phoneNumber && (
                <div 
                  className="relative"
                  style={{
                    transform: hoveredSection === 'phone' 
                      ? 'rotate(-1deg) translateY(-1px)' 
                      : 'rotate(0) translateY(0)',
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() => setHoveredSection('phone')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div 
                    className="flex items-center justify-between px-3 py-2"
                    style={{
                      backgroundColor: artisticColors.clay,
                      borderRadius: "2px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: artisticColors.navy,
                          animation: hoveredSection === 'phone' ? 'pulse 0.8s infinite' : 'none'
                        }}
                      >
                        <Phone className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs truncate max-w-[140px] font-medium">
                        {userData.phoneNumber}
                      </span>
                    </div>
                    <button
                      className="p-1 rounded hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(userData.phoneNumber || "", "Phone");
                      }}
                    >
                      <Copy className="h-3 w-3 text-gray-600" />
                    </button>
                  </div>
                  
                  {/* Stamp texture */}
                  <div 
                    className="absolute -top-1 -right-1 -bottom-1 -left-1 pointer-events-none opacity-15"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,100 L0,100 L0,0 Z' fill='none' stroke='%23000' stroke-width='2' stroke-dasharray='5,5' /%3E%3C/svg%3E\")",
                      backgroundSize: "cover",
                      mixBlendMode: "multiply",
                    }}
                  />
                </div>
              )}
              
              {/* Website/Profile Link - Notebook paper */}
              <div 
                className="relative"
                style={{
                  transform: hoveredSection === 'website' 
                    ? 'rotate(1deg) translateY(-1px)' 
                    : 'rotate(0) translateY(0)',
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('website')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div 
                  className="flex items-center justify-between px-3 py-2"
                  style={{
                    backgroundColor: "#f8f8f8",
                    backgroundImage: "linear-gradient(#e5e5e5 1px, transparent 1px)",
                    backgroundSize: "100% 8px",
                    borderRadius: "2px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #e0e0e0",
                    borderLeft: `3px solid ${artisticColors.burgundy}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: artisticColors.rust,
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
                          animation: hoveredSection === 'website' ? 'spinSlow 6s linear infinite' : 'none'
                        }}
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <span 
                      className="text-xs truncate max-w-[140px] font-medium"
                      style={{
                        fontFamily: "'Sriracha', cursive",
                      }}
                    >
                      {profileLink}
                    </span>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
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
          
          @keyframes float {
            0% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-5px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0); }
          }
          
          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Font imports */
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Caveat:wght@400;600&family=Sriracha&display=swap');
          
          /* Print styles */
          @media print {
            body * {
              visibility: hidden;
            }
            .artistic-card, .artistic-card * {
              visibility: visible;
              transform: none !important;
              animation: none !important;
            }
            .artistic-card {
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

export default ArtisticCard;