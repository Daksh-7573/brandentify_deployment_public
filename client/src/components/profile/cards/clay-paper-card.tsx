import React, { useState, useEffect, useRef } from "react";
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
  Paperclip,
  Map
} from "lucide-react";
import { UserData } from "@/types/user";

// Define soft clay colors palette with artisanal feeling
const clayColors = {
  // Base colors
  canvas: "#fdfcfa",
  softWhite: "#f8f6f2",
  warmCream: "#f5f2ed",
  
  // Clay tones
  taupe: "#e6e2dd",      // Neutral base clay
  sage: "#e1e4df",       // Soft green-gray
  nude: "#ecdfd4",       // Warm skin tone clay
  mist: "#e6ecf0",       // Soft blue-gray
  blush: "#f0e6e9",      // Pale pink

  // Accent colors for interaction
  paperYellow: "#f5df98", // Warm paper yellow
  blushCoral: "#e89b8e",  // Warm reddish clay
  muttedLilac: "#c8c0e0", // Subtle purple
  graphiteBlack: "#3a3a3a", // Deep charcoal for text
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // State management for interactions
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Track mouse movement for tilt effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCursorPosition({
        x: (x / rect.width) * 2 - 1,  // -1 to 1 range
        y: (y / rect.height) * 2 - 1  // -1 to 1 range
      });
    };
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);
  
  // Copy to clipboard function with enhanced feedback
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

  // Calculate tilt transform based on cursor position
  const getTiltTransform = () => {
    const tiltAmount = 1.5; // Max tilt in degrees
    const rotateX = cursorPosition.y * -tiltAmount;
    const rotateY = cursorPosition.x * tiltAmount;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };
  
  return (
    <div 
      ref={cardRef}
      className="clay-paper-card w-full aspect-[2/3.5] relative select-none overflow-visible"
      style={{
        transform: hoveredSection ? getTiltTransform() : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.2s ease-out',
      }}
      onMouseEnter={() => setHoveredSection('card')}
      onMouseLeave={() => setHoveredSection(null)}
    >
      {/* Floating particles effect - adds dimension */}
      <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: clayColors.taupe,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Background canvas */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: clayColors.canvas,
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)",
          overflow: "hidden"
        }}
      >
        {/* Canvas texture */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Layered paper sheets */}
        <div className="absolute inset-0">
          {/* First layer */}
          <div 
            className="absolute right-0 top-[15%] w-[95%] h-[25%] rounded-l-lg"
            style={{
              background: clayColors.sage, 
              transform: "rotate(-1deg)",
              boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.1)"
            }}
          />
          
          {/* Second layer */}
          <div 
            className="absolute left-0 top-[45%] w-[92%] h-[25%] rounded-r-lg"
            style={{
              background: clayColors.nude, 
              transform: "rotate(1deg)",
              boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.1)"
            }}
          />
          
          {/* Paper line details */}
          <div className="absolute top-[32%] left-[5%] w-[90%] h-[1px] bg-black opacity-[0.03]" />
          <div className="absolute top-[62%] left-[5%] w-[90%] h-[1px] bg-black opacity-[0.03]" />
        </div>
      </div>
      
      {/* Content container */}
      <div className="absolute inset-0 p-6 flex flex-col items-center">
        {/* Profile Block - Polaroid Style */}
        <div 
          className="relative mb-6 pb-2 transform"
          style={{
            transform: hoveredSection === 'profile' ? 'rotate(1deg) translateY(-2px)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-out',
          }}
          onMouseEnter={() => setHoveredSection('profile')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Paper clip */}
          <div className="absolute -top-3 -right-2 transform rotate-12 z-30">
            <Paperclip className="w-6 h-6 text-gray-400" />
          </div>
          
          {/* Polaroid frame */}
          <div 
            className="relative bg-white p-1 rounded-sm transform rotate-[-2deg]"
            style={{
              boxShadow: "0 3px 10px -3px rgba(0, 0, 0, 0.15)",
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Profile image */}
            <div className="w-24 h-24 overflow-hidden border-2 border-gray-50">
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
            
            {/* Polaroid bottom margin */}
            <div className="h-5 bg-white mt-1" />
          </div>
        </div>
        
        {/* Name stamp */}
        <div 
          className="relative mb-4 text-center transform"
          style={{
            transform: hoveredSection === 'name' ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={() => setHoveredSection('name')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Name Stamp Background */}
          <div 
            className="absolute -inset-1 rounded opacity-20"
            style={{ 
              background: clayColors.paperYellow,
              transform: 'rotate(-0.5deg)'
            }}
          />
          
          <h2 
            className="text-2xl font-bold mb-1 relative"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: clayColors.graphiteBlack,
              letterSpacing: "0.02em",
              textShadow: "1px 1px 0 rgba(255, 255, 255, 0.8)"
            }}
          >
            {userData.name || "Your Name"}
          </h2>
          
          <p 
            className="text-sm font-medium relative"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: "rgba(58, 58, 58, 0.8)",
              letterSpacing: "0.05em"
            }}
          >
            {userData.title || "Add your designation"}
          </p>
        </div>
        
        {/* Industry Tags - Clay Fabric Ribbons */}
        {industryTags.length > 0 && (
          <div 
            className="flex flex-wrap justify-center gap-2 mb-5 max-w-[85%]"
            style={{
              transform: activeSection === 'tags' ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={() => setActiveSection('tags')}
            onMouseLeave={() => setActiveSection(null)}
          >
            {industryTags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center px-3 py-1 text-xs"
                style={{
                  background: 
                    index % 4 === 0 ? clayColors.sage : 
                    index % 4 === 1 ? clayColors.nude : 
                    index % 4 === 2 ? clayColors.mist : 
                    clayColors.blush,
                  color: clayColors.graphiteBlack,
                  fontFamily: "'Sora', sans-serif",
                  borderRadius: "0.25rem",
                  transform: hoveredSection === `tag-${index}` ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: hoveredSection === `tag-${index}` ? 
                    '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 
                    '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  // Custom ribbon clip path
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
        
        {/* Company - Folded Sticky Note */}
        {userData.company && (
          <div 
            className="relative mb-4 max-w-[80%]"
            style={{
              transform: hoveredSection === 'company' ? 'translateY(-2px) rotate(0.5deg)' : 'translateY(0) rotate(0deg)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={() => setHoveredSection('company')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Sticky note fold */}
            <div 
              className="absolute -top-2.5 -right-2.5 w-7 h-7"
              style={{
                background: clayColors.paperYellow,
                transformOrigin: "bottom left",
                transform: "rotate(135deg)",
                opacity: 0.5,
                zIndex: 1
              }}
            />
            
            {/* Sticky note base */}
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-sm"
              style={{
                background: clayColors.paperYellow,
                boxShadow: hoveredSection === 'company' ? 
                  '0 6px 12px -3px rgba(0, 0, 0, 0.15)' : 
                  '0 3px 6px -2px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Building2 className="h-4 w-4 text-gray-700" />
              <span 
                className="text-sm font-medium"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  color: clayColors.graphiteBlack
                }}
              >
                {userData.company}
              </span>
            </div>
          </div>
        )}
        
        {/* Location - Map Style */}
        {userData.location && (
          <div 
            className="relative mb-6"
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
                className="h-5 w-5 rounded-full flex items-center justify-center"
                style={{ background: "white" }}
              >
                <MapPin className="h-3 w-3 text-gray-700" />
              </div>
              <span 
                className="text-xs"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  color: clayColors.graphiteBlack
                }}
              >
                {userData.location}
              </span>
            </div>
          </div>
        )}
        
        {/* Contact Strip - Tear-Off Tab Section */}
        <div className="mt-auto w-full">
          <div 
            className="relative"
            style={{
              transform: hoveredSection && hoveredSection.startsWith('contact') ? 
                'translateY(-3px)' : 'translateY(0)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={() => setHoveredSection('contact-section')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Tear-off perforated edge */}
            <div 
              className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(90deg, transparent, #00000010 50%, transparent 50%)",
                backgroundSize: "10px 1px",
                backgroundRepeat: "repeat-x",
                opacity: 0.5
              }}
            />
            
            {/* Email Item - Perforated Coupon Style */}
            <div 
              className="flex items-center justify-between px-3 py-2 mb-2 rounded-md"
              style={{
                background: "white",
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'email' ? 
                  '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 
                  '0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                transform: hoveredSection === 'email' ? 'translateX(-2px)' : 'translateX(0)',
              }}
              onMouseEnter={() => setHoveredSection('email')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span 
                  className="text-sm truncate max-w-[150px]"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    color: clayColors.graphiteBlack,
                  }}
                >
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
                className="flex items-center justify-between px-3 py-2 mb-2 rounded-md"
                style={{
                  background: "white",
                  border: "1px dashed rgba(0,0,0,0.08)",
                  boxShadow: hoveredSection === 'phone' ? 
                    '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 
                    '0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  transform: hoveredSection === 'phone' ? 'translateX(-2px)' : 'translateX(0)',
                }}
                onMouseEnter={() => setHoveredSection('phone')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span 
                    className="text-sm truncate max-w-[150px]"
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      color: clayColors.graphiteBlack
                    }}
                  >
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
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                background: "white",
                border: "1px dashed rgba(0,0,0,0.08)",
                boxShadow: hoveredSection === 'profile-link' ? 
                  '0 4px 8px -2px rgba(0, 0, 0, 0.1)' : 
                  '0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                transform: hoveredSection === 'profile-link' ? 'translateX(-2px)' : 'translateX(0)',
              }}
              onMouseEnter={() => setHoveredSection('profile-link')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span 
                  className="text-sm truncate max-w-[150px]"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    color: clayColors.graphiteBlack,
                  }}
                >
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
          
          {/* Print and Share Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs"
              style={{
                background: clayColors.mist,
                color: clayColors.graphiteBlack,
                fontFamily: "'Sora', sans-serif",
                boxShadow: hoveredSection === 'print' ? 
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 
                  '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs"
              style={{
                background: clayColors.blushCoral,
                color: "white",
                fontFamily: "'Sora', sans-serif",
                boxShadow: hoveredSection === 'share' ? 
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 
                  '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          @keyframes float {
            0% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(5px); }
            50% { transform: translateY(0px) translateX(10px); }
            75% { transform: translateY(10px) translateX(5px); }
            100% { transform: translateY(0px) translateX(0px); }
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