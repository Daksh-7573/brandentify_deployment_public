import { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Building2, Share2, Zap, Palette } from "lucide-react";

interface GraphicQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const colors = {
  electricMagenta: "#FF2BC2",
  cyanPop: "#00E5FF",
  deepYellow: "#F6E05E",
  richBlack: "#050505",
  graphite: "#1A1A1A",
  offWhite: "#F7F7F7",
  inkBlue: "#2D4FFF",
};

const keyframesStyle = `
  @keyframes gridMove {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
  
  @keyframes inkPulse {
    0% { transform: scale(0.98); opacity: 0.78; filter: blur(0.8px); }
    50% { transform: scale(1.05); opacity: 1; filter: blur(0.4px); }
    100% { transform: scale(0.98); opacity: 0.78; filter: blur(0.8px); }
  }
  
  @keyframes slowMorph {
    0% { border-radius: 40% 60% 48% 52% / 54% 40% 60% 46%; transform: translateY(0) rotate(0deg) scale(1); }
    33% { border-radius: 52% 48% 60% 40% / 46% 54% 40% 60%; transform: translateY(-3px) rotate(-0.4deg) scale(1.01); }
    66% { border-radius: 48% 52% 40% 60% / 60% 46% 54% 40%; transform: translateY(-2px) rotate(0.3deg) scale(1.02); }
    100% { border-radius: 40% 60% 48% 52% / 54% 40% 60% 46%; transform: translateY(0) rotate(0deg) scale(1); }
  }
  
  @keyframes underlineShimmer {
    0% { background-position: -120% 0; }
    100% { background-position: 120% 0; }
  }
  
  @keyframes stripSlide {
    0% { transform: translateX(-18px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes smallPing {
    0% { transform: scale(0.9); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0.6; }
  }
  
  @keyframes nameEntrance {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes staggeredFade {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes halftoneReveal {
    0% { opacity: 0; }
    100% { opacity: 0.08; }
  }
  
  @keyframes strokeDraw {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }
`;

const halftonePatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="1.5" fill="rgba(255,43,194,0.15)"/></svg>`;
const halftoneDataUrl = `url("data:image/svg+xml,${encodeURIComponent(halftonePatternSvg)}")`;

const gridPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M0 0h40v40H0z" fill="none"/><path d="M0 20h40M20 0v40" stroke="rgba(0,229,255,0.08)" stroke-width="1"/><path d="M0 0h40v40H0z" stroke="rgba(255,43,194,0.04)" stroke-width="0.5"/></svg>`;
const gridDataUrl = `url("data:image/svg+xml,${encodeURIComponent(gridPatternSvg)}")`;

const GraphicQuantumCard: React.FC<GraphicQuantumCardProps> = ({ userData, isLoading = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const profileLink = `brandentifier.com/@${(userData.brandName || userData.username || 'user').toLowerCase().replace(/\s+/g, '-')}`;
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
      className="gq-card relative w-full max-w-[380px] min-h-[520px] rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: `linear-gradient(180deg, ${colors.richBlack}, ${colors.graphite})`,
        boxShadow: isHovered 
          ? '0 32px 90px rgba(0,0,0,0.7), 0 0 40px rgba(0,229,255,0.1)' 
          : '0 20px 60px rgba(0,0,0,0.6)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="graphic-quantum-card"
    >
      <style>{keyframesStyle}</style>

      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: gridDataUrl,
          backgroundSize: '40px 40px',
          opacity: 0.1,
          animation: 'gridMove 40s linear infinite',
        }}
      />

      <div 
        className="absolute pointer-events-none z-5"
        style={{
          top: '-15%',
          left: '-10%',
          width: '140%',
          height: '60%',
          background: `radial-gradient(circle at 25% 35%, rgba(255,43,194,0.18), rgba(0,229,255,0.08) 50%, transparent 70%)`,
          filter: 'blur(24px)',
          animation: 'inkPulse 7s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />

      <div 
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          backgroundImage: halftoneDataUrl,
          backgroundSize: '20px 20px',
          opacity: 0.06,
          animation: 'halftoneReveal 1s ease-out forwards',
        }}
      />

      <svg className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-30 opacity-30" viewBox="0 0 100 100">
        <path 
          d="M90 10 L90 40 M90 10 L60 10" 
          stroke={colors.cyanPop} 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="200"
          style={{ animation: 'strokeDraw 0.6s ease-out forwards' }}
        />
        <circle cx="90" cy="10" r="3" fill={colors.electricMagenta} />
      </svg>

      <svg className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none z-30 opacity-30" viewBox="0 0 100 100">
        <path 
          d="M10 90 L10 60 M10 90 L40 90" 
          stroke={colors.electricMagenta} 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="200"
          style={{ animation: 'strokeDraw 0.6s ease-out 0.2s forwards' }}
        />
        <circle cx="10" cy="90" r="3" fill={colors.cyanPop} />
      </svg>

      <div className="relative z-20 p-5 sm:p-6 flex flex-col h-full">
        
        {isLoading && (
          <div className="absolute top-3 right-3 z-50 px-3 py-1.5 rounded-full backdrop-blur-md border"
            style={{ 
              background: 'rgba(255,43,194,0.1)', 
              borderColor: 'rgba(255,43,194,0.3)' 
            }}>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF2BC2] animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#F6E05E] animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 mb-5">
          <div 
            className="relative flex-shrink-0"
            style={{
              transform: isHovered ? `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)` : 'none',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div
              className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden relative"
              style={{
                borderRadius: '40% 60% 48% 52% / 54% 40% 60% 46%',
                animation: 'slowMorph 10s ease-in-out infinite',
                border: `2px solid rgba(255,43,194,0.25)`,
                boxShadow: isHovered 
                  ? `0 0 30px rgba(0,229,255,0.3), inset 0 0 20px rgba(0,0,0,0.4)`
                  : `inset 0 0 20px rgba(0,0,0,0.4)`,
              }}
            >
              {userData.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={userData.name || "Profile"}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{
                    filter: isHovered ? 'none' : 'saturate(0.7)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=1A1A1A&color=FF2BC2`;
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=1A1A1A&color=FF2BC2`}
                  alt={userData.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              )}

              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, rgba(0,229,255,0.2), rgba(255,43,194,0.2))`,
                  mixBlendMode: 'overlay',
                  opacity: isHovered ? 0 : 0.4,
                }}
              />
            </div>
          </div>

          <div className="flex-1 pt-1">
            <h2 
              className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-1"
              style={{ 
                color: colors.offWhite,
                fontFamily: "'Inter', system-ui, sans-serif",
                animation: 'nameEntrance 420ms ease-out forwards',
              }}
              data-testid="text-user-name"
            >
              {isLoading ? (
                <span className="inline-block w-28 h-6 rounded animate-pulse" style={{ background: 'rgba(255,43,194,0.2)' }} />
              ) : (
                userData.name || "Your Name"
              )}
            </h2>

            <div 
              className="inline-block relative"
              style={{ animation: 'underlineShimmer 3s linear infinite' }}
            >
              <div 
                className="h-[3px] w-16 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.cyanPop}, ${colors.electricMagenta}, ${colors.deepYellow})`,
                  backgroundSize: '200% 100%',
                  animation: 'underlineShimmer 3s linear infinite',
                }}
              />
            </div>

            <div 
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm"
              style={{
                background: `linear-gradient(90deg, rgba(255,43,194,0.15), rgba(0,229,255,0.1))`,
                borderLeft: `3px solid ${colors.electricMagenta}`,
                animation: 'stripSlide 450ms cubic-bezier(.2,.9,.2,1) forwards',
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <Zap className="w-3 h-3" style={{ color: colors.cyanPop }} />
              {isLoading ? (
                <span className="inline-block w-20 h-3 rounded animate-pulse" style={{ background: 'rgba(0,229,255,0.2)' }} />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.offWhite }}>
                  {userData.title || "Your Role"}
                </span>
              )}
            </div>
          </div>
        </div>

        {userData.tagline && !isLoading && (
          <p 
            className="text-xs tracking-[0.15em] uppercase mb-4 pl-1"
            style={{ 
              color: 'rgba(247,247,247,0.6)',
              animation: 'staggeredFade 0.4s ease-out 0.1s forwards',
              opacity: 0,
            }}
          >
            {userData.tagline}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {userData.domain && !isLoading && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wide transition-all duration-200"
              style={{
                background: 'rgba(0,229,255,0.1)',
                border: `1px solid ${colors.cyanPop}`,
                color: colors.cyanPop,
                animation: 'staggeredFade 0.4s ease-out 0.15s forwards',
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,229,255,0.2)`;
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
          
          {userData.location && !isLoading && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-medium uppercase tracking-wide transition-all duration-200"
              style={{
                background: 'rgba(255,43,194,0.1)',
                border: `1px solid ${colors.electricMagenta}`,
                color: colors.electricMagenta,
                animation: 'staggeredFade 0.4s ease-out 0.2s forwards',
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 20px rgba(255,43,194,0.2)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <MapPin className="w-3 h-3" />
              {userData.location}
            </div>
          )}
        </div>

        <div className="space-y-2.5 text-xs flex-1">
          {(userData.industry || isLoading) && (
            <div className="flex items-center gap-2.5 group">
              <div 
                className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, rgba(0,229,255,0.15), rgba(255,43,194,0.1))`,
                  border: '1px solid rgba(0,229,255,0.3)',
                }}
              >
                <Building2 className="w-3 h-3" style={{ color: colors.cyanPop }} />
              </div>
              {isLoading ? (
                <span className="w-24 h-3 rounded animate-pulse" style={{ background: 'rgba(0,229,255,0.2)' }} />
              ) : (
                <span style={{ color: 'rgba(247,247,247,0.9)' }}>{userData.industry}</span>
              )}
            </div>
          )}
          
          {(userData.company || isLoading) && (
            <div className="flex items-center gap-2.5 group">
              <div 
                className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, rgba(255,43,194,0.15), rgba(0,229,255,0.1))`,
                  border: '1px solid rgba(255,43,194,0.3)',
                }}
              >
                <Briefcase className="w-3 h-3" style={{ color: colors.electricMagenta }} />
              </div>
              {isLoading ? (
                <span className="w-28 h-3 rounded animate-pulse" style={{ background: 'rgba(255,43,194,0.2)' }} />
              ) : (
                <span style={{ color: 'rgba(247,247,247,0.9)' }}>{userData.company}</span>
              )}
            </div>
          )}
        </div>

        <div 
          className="mt-4 pt-4"
          style={{ borderTop: `1px solid rgba(247,247,247,0.1)` }}
        >
          <div className="flex items-center gap-2.5 mb-2 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-6 h-6 flex items-center justify-center rounded-sm"
              style={{
                background: 'rgba(246,224,94,0.1)',
                border: '1px solid rgba(246,224,94,0.3)',
              }}
            >
              <Mail className="w-3 h-3" style={{ color: colors.deepYellow }} />
            </div>
            {isLoading ? (
              <span className="w-32 h-3 rounded animate-pulse" style={{ background: 'rgba(246,224,94,0.2)' }} />
            ) : (
              <span className="text-xs truncate" style={{ color: 'rgba(247,247,247,0.9)' }}>
                {userData.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 mb-2 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-6 h-6 flex items-center justify-center rounded-sm"
              style={{
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid rgba(0,229,255,0.3)',
              }}
            >
              <Phone className="w-3 h-3" style={{ color: colors.cyanPop }} />
            </div>
            {isLoading ? (
              <span className="w-24 h-3 rounded animate-pulse" style={{ background: 'rgba(0,229,255,0.2)' }} />
            ) : (
              <span className="text-xs" style={{ color: 'rgba(247,247,247,0.9)' }}>
                {userData.phoneNumber || "Add phone"}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 group cursor-pointer transition-all duration-200 hover:translate-x-1">
            <div 
              className="w-6 h-6 flex items-center justify-center rounded-sm"
              style={{
                background: 'rgba(255,43,194,0.1)',
                border: '1px solid rgba(255,43,194,0.3)',
              }}
            >
              <Globe className="w-3 h-3" style={{ color: colors.electricMagenta }} />
            </div>
            {isLoading ? (
              <span className="w-28 h-3 rounded animate-pulse" style={{ background: 'rgba(255,43,194,0.2)' }} />
            ) : (
              <a 
                href={profileHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium truncate transition-colors"
                style={{ color: colors.cyanPop }}
                data-testid="link-profile-url"
              >
                {profileLink}
              </a>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${colors.electricMagenta}, ${colors.cyanPop})`,
              color: colors.richBlack,
              boxShadow: isHovered ? `0 12px 30px rgba(0,229,255,0.3)` : '0 8px 20px rgba(0,0,0,0.3)',
            }}
            disabled={isLoading}
            data-testid="button-share-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 18px 36px rgba(0,229,255,0.25)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5" />
              Share Card
            </span>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.cyanPop}, ${colors.electricMagenta})`,
              }}
            />
          </button>
        </div>

        <div 
          className="mt-4 text-center text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'rgba(247,247,247,0.3)' }}
        >
          Graphic Quantum • Brandentifier
        </div>
      </div>
    </div>
  );
};

export default GraphicQuantumCard;
