import { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Building2, Zap, Palette } from "lucide-react";

interface GraphicQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const colors = {
  softMagenta: "#FF3FAE",
  pastelCyan: "#60E6FF",
  warmYellow: "#FCD34D",
  artisticCoral: "#FF8BA0",
  porcelainWhite: "#FAFAF9",
  softGrey: "#F2F2F2",
  aluminium: "#D4D4D4",
  deepInk: "#1A1A1A",
  graphite: "#3C3C3C",
};

const keyframesStyle = `
  @keyframes blobMorphLight {
    0% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
    50% { border-radius: 50% 50% 45% 55% / 40% 60% 45% 55%; }
    100% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
  }
  
  @keyframes pastelPulse {
    0% { opacity: 0.3; transform: scale(0.98); }
    50% { opacity: 0.45; transform: scale(1); }
    100% { opacity: 0.3; transform: scale(0.98); }
  }
  
  @keyframes strokeSlideIn {
    from { width: 0; opacity: 0; }
    to { width: 80px; opacity: 1; }
  }
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes stripSlide {
    0% { transform: translateX(-18px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes staggeredFade {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes halftoneReveal {
    0% { opacity: 0; }
    100% { opacity: 0.04; }
  }
  
  @keyframes strokeDraw {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const halftonePatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="1.2" fill="rgba(255,63,174,0.08)"/></svg>`;
const halftoneDataUrl = `url("data:image/svg+xml,${encodeURIComponent(halftonePatternSvg)}")`;

const GraphicQuantumCard: React.FC<GraphicQuantumCardProps> = ({ userData, isLoading = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const profileLink = `brandentify.com/@${(userData.brandName || userData.username || 'user').toLowerCase().replace(/\s+/g, '-')}`;
  const profileHref = `/@${(userData.brandName || userData.username || 'user').toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        });
      }
    };
    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      className="gq-card relative w-full max-w-[380px] min-h-[520px] overflow-hidden transition-all duration-300"
      style={{
        background: colors.porcelainWhite,
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: isHovered 
          ? '0 12px 50px rgba(0,0,0,0.12)' 
          : '0 8px 32px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="graphic-quantum-card"
    >
      <style>{keyframesStyle}</style>

      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: halftoneDataUrl,
          backgroundSize: '20px 20px',
          opacity: 0.04,
          animation: 'halftoneReveal 1s ease-out forwards',
        }}
      />

      <div 
        className="absolute pointer-events-none z-5"
        style={{
          top: '-20%',
          right: '-15%',
          width: '50%',
          height: '50%',
          background: `radial-gradient(circle, rgba(255,63,174,0.08), transparent 70%)`,
          filter: 'blur(30px)',
          animation: 'pastelPulse 8s ease-in-out infinite',
        }}
      />

      <div 
        className="absolute pointer-events-none z-5"
        style={{
          bottom: '-15%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: `radial-gradient(circle, rgba(96,230,255,0.06), transparent 70%)`,
          filter: 'blur(25px)',
          animation: 'pastelPulse 10s ease-in-out infinite',
          animationDelay: '-3s',
        }}
      />

      <svg className="absolute top-0 right-0 w-20 h-20 pointer-events-none z-30 opacity-40" viewBox="0 0 100 100">
        <path 
          d="M85 15 L85 40 M85 15 L60 15" 
          stroke={colors.pastelCyan} 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="200"
          style={{ animation: 'strokeDraw 0.6s ease-out forwards' }}
        />
        <circle cx="85" cy="15" r="3" fill={colors.softMagenta} />
      </svg>

      <svg className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none z-30 opacity-40" viewBox="0 0 100 100">
        <path 
          d="M15 85 L15 60 M15 85 L40 85" 
          stroke={colors.artisticCoral} 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="200"
          style={{ animation: 'strokeDraw 0.6s ease-out 0.2s forwards' }}
        />
        <circle cx="15" cy="85" r="3" fill={colors.pastelCyan} />
      </svg>

      <div className="relative z-20 p-5 sm:p-6 flex flex-col h-full">
        
        {isLoading && (
          <div className="absolute top-3 right-3 z-50 px-3 py-1.5 rounded-full border"
            style={{ 
              background: 'rgba(255,63,174,0.08)', 
              borderColor: 'rgba(255,63,174,0.2)' 
            }}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colors.softMagenta, animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colors.pastelCyan, animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colors.warmYellow, animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 mb-5">
          <div 
            className="relative flex-shrink-0"
            style={{
              transform: isHovered ? `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)` : 'none',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div
              className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden relative"
              style={{
                borderRadius: '40% 60% 55% 45% / 60% 40% 55% 45%',
                animation: 'blobMorphLight 10s ease-in-out infinite',
                background: `linear-gradient(135deg, #FFEAF4, #DFF8FF)`,
                padding: '3px',
              }}
            >
              <div 
                className="w-full h-full overflow-hidden"
                style={{
                  borderRadius: 'inherit',
                  border: `3px solid rgba(255,63,174,0.25)`,
                  boxShadow: `0 4px 16px rgba(255,63,174,0.15)`,
                }}
              >
                {userData.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: 'brightness(1.05) contrast(1.05)',
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=FAFAF9&color=FF3FAE`;
                    }}
                  />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=FAFAF9&color=FF3FAE`}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 pt-1">
            <h2 
              className="text-xl sm:text-2xl font-bold tracking-tight leading-tight mb-2"
              style={{ 
                color: colors.deepInk,
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: '-0.5px',
                animation: 'fadeUp 0.5s ease-out forwards',
              }}
              data-testid="text-user-name"
            >
              {isLoading ? (
                <span className="inline-block w-28 h-6 rounded animate-pulse" style={{ background: colors.softGrey }} />
              ) : (
                userData.name || "Your Name"
              )}
            </h2>

            <div 
              className="h-[3px] rounded-full mb-3 overflow-hidden"
              style={{
                width: '80px',
                background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.pastelCyan})`,
                animation: 'strokeSlideIn 0.4s ease-out forwards',
              }}
            />

            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{
                background: colors.softGrey,
                border: `1px solid ${colors.aluminium}`,
                animation: 'stripSlide 450ms cubic-bezier(.2,.9,.2,1) forwards',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <Zap className="w-3 h-3" style={{ color: colors.softMagenta }} />
              {isLoading ? (
                <span className="inline-block w-20 h-3 rounded animate-pulse" style={{ background: colors.aluminium }} />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.graphite }}>
                  {userData.title || "Your Role"}
                </span>
              )}
            </div>
          </div>
        </div>

        {userData.tagline && !isLoading && (
          <p 
            className="text-xs tracking-[0.12em] uppercase mb-4 pl-1"
            style={{ 
              color: colors.graphite,
              opacity: 0.7,
              animation: 'staggeredFade 0.4s ease-out 0.1s forwards',
            }}
          >
            {userData.tagline}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {userData.industry && !isLoading && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: 'rgba(96,230,255,0.15)',
                border: `1px solid rgba(96,230,255,0.4)`,
                color: '#0891B2',
                animation: 'staggeredFade 0.4s ease-out 0.15s forwards',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.12)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Palette className="w-3 h-3" />
              #{userData.industry}
            </div>
          )}
          
          {userData.domain && !isLoading && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: 'rgba(96,230,255,0.15)',
                border: `1px solid rgba(96,230,255,0.4)`,
                color: '#0891B2',
                animation: 'staggeredFade 0.4s ease-out 0.15s forwards',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.12)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Palette className="w-3 h-3" />
              #{userData.domain === "all" ? "Creative" : userData.domain}
            </div>
          )}
        </div>

        <div className="space-y-2.5 text-xs flex-1">
          {(userData.company || isLoading) && (
            <div className="flex items-center gap-2.5 group">
              <div 
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(255,63,174,0.1)',
                  border: `1px solid rgba(255,63,174,0.25)`,
                }}
              >
                <Briefcase className="w-3.5 h-3.5" style={{ color: colors.softMagenta }} />
              </div>
              {isLoading ? (
                <span className="w-28 h-3 rounded animate-pulse" style={{ background: colors.softGrey }} />
              ) : (
                <span style={{ color: colors.deepInk }}>{userData.company}</span>
              )}
            </div>
          )}
          
          {(userData.location || isLoading) && (
            <div className="flex items-center gap-2.5 group">
              <div 
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(255,139,160,0.15)',
                  border: `1px solid rgba(255,139,160,0.4)`,
                }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: '#DB2777' }} />
              </div>
              {isLoading ? (
                <span className="w-24 h-3 rounded animate-pulse" style={{ background: colors.softGrey }} />
              ) : (
                <span style={{ color: colors.deepInk }}>{userData.location}</span>
              )}
            </div>
          )}
        </div>

        <div 
          className="mt-4 pt-4"
          style={{ borderTop: `1px solid ${colors.aluminium}` }}
        >
          <div className="flex items-center gap-2.5 mb-2 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                background: 'rgba(252,211,77,0.15)',
                border: `1px solid rgba(252,211,77,0.4)`,
              }}
            >
              <Mail className="w-3.5 h-3.5" style={{ color: '#D97706' }} />
            </div>
            {isLoading ? (
              <span className="w-32 h-3 rounded animate-pulse" style={{ background: colors.softGrey }} />
            ) : (
              <span className="text-xs truncate" style={{ color: colors.deepInk }}>
                {userData.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 mb-2 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                background: 'rgba(96,230,255,0.12)',
                border: `1px solid rgba(96,230,255,0.3)`,
              }}
            >
              <Phone className="w-3.5 h-3.5" style={{ color: '#0891B2' }} />
            </div>
            {isLoading ? (
              <span className="w-24 h-3 rounded animate-pulse" style={{ background: colors.softGrey }} />
            ) : (
              <span className="text-xs" style={{ color: colors.deepInk }}>
                {userData.phoneNumber || "Add phone"}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-7 h-7 flex items-center justify-center rounded-lg"
              style={{
                background: 'rgba(255,63,174,0.1)',
                border: `1px solid rgba(255,63,174,0.25)`,
              }}
            >
              <Globe className="w-3.5 h-3.5" style={{ color: colors.softMagenta }} />
            </div>
            {isLoading ? (
              <span className="w-28 h-3 rounded animate-pulse" style={{ background: colors.softGrey }} />
            ) : (
              <a 
                href={profileHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium truncate transition-colors hover:opacity-80"
                style={{ color: colors.softMagenta }}
                data-testid="link-profile-url"
              >
                {profileLink}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicQuantumCard;

