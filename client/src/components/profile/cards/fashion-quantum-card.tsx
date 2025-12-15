import { useState } from "react";
import { UserData } from "@/types/user";
import { Mail, MapPin, Globe, Instagram, Eye, Phone, Camera, Scissors, Star } from "lucide-react";

interface FashionQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const colors = {
  noirBlack: "#050509",
  runwayCharcoal: "#111118",
  softBone: "#F5F3EE",
  warmSand: "#E2D4C5",
  blushPink: "#F9C5D5",
  editorialNude: "#D9B99B",
  champagneGlow: "#FDF3D9",
  deepBurgundy: "#7A1F3D",
  inkGrey: "#9CA3AF",
  white: "#FFFFFF",
};

const keyframesStyle = `
  @keyframes fashionSoftSweep {
    0% { transform: translateX(-120%); opacity: 0; }
    10% { opacity: 0.25; }
    50% { transform: translateX(0%); opacity: 0.35; }
    90% { opacity: 0; }
    100% { transform: translateX(120%); opacity: 0; }
  }
  
  @keyframes fashionSoftGlow {
    0% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
    50% { box-shadow: 0 28px 72px rgba(0,0,0,0.7); }
    100% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
  }
  
  @keyframes fashionUnderlineShimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  @keyframes fashionSpotlightPulse {
    0% { opacity: 0.15; }
    50% { opacity: 0.25; }
    100% { opacity: 0.15; }
  }
`;

const FashionQuantumCard: React.FC<FashionQuantumCardProps> = ({
  userData,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'contact'>('card');
  const profileLink = userData.randomProfileLink 
    ? `brandentifier.com/r/${userData.randomProfileLink}` 
    : `brandentifier.com/@${userData.brandName || userData.username}`;

  const fashionTags = userData.domain 
    ? userData.domain.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    : ['Fashion', 'Editorial'];

  const quickStats = [
    userData.company && { label: 'Company', value: userData.company },
    userData.location && { label: 'Location', value: userData.location },
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div 
        className="w-full rounded-2xl p-6 animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
          minHeight: '480px',
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-[4/5] rounded-xl bg-white/5" />
          <div className="h-6 w-32 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
        border: `1px solid rgba(245,243,238,0.18)`,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        animation: 'fashionSoftGlow 8s linear infinite',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      data-testid="fashion-quantum-card"
    >
      <style>{keyframesStyle}</style>

      {/* Spotlight Effect */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 10%, rgba(253,243,217,0.18), transparent 60%)`,
          animation: 'fashionSpotlightPulse 8s ease-in-out infinite',
        }}
      />

      {/* Film Grain Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Card Content */}
      <div className="relative flex flex-col gap-3 p-5 sm:p-6">
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-3 border-b" style={{ borderColor: 'rgba(245,243,238,0.15)' }}>
          <button
            onClick={() => setActiveTab('card')}
            className="px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide"
            style={{
              color: activeTab === 'card' ? colors.blushPink : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === 'card' ? `2px solid ${colors.blushPink}` : 'none',
              paddingBottom: activeTab === 'card' ? '6px' : '10px',
            }}
          >
            Card
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="px-3 py-2 text-xs font-medium transition-colors uppercase tracking-wide"
            style={{
              color: activeTab === 'contact' ? colors.blushPink : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === 'contact' ? `2px solid ${colors.blushPink}` : 'none',
              paddingBottom: activeTab === 'contact' ? '6px' : '10px',
            }}
          >
            Contact
          </button>
        </div>

        {activeTab === 'card' && (
        <>
        
        {/* Hero Image Block */}
        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
          <div 
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 18px 40px rgba(0,0,0,0.7)',
            }}
          >
            {userData.photoURL ? (
              <img 
                src={userData.photoURL}
                alt={userData.name || 'Profile'}
                className="w-full h-full object-cover"
                data-testid="fashion-card-image"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: colors.runwayCharcoal }}
              >
                <Camera className="w-16 h-16" style={{ color: colors.softBone, opacity: 0.3 }} />
              </div>
            )}

            {/* Dark gradient overlay at bottom */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(5,5,9,0.55), transparent 60%)',
              }}
            />

            {/* Inner border */}
            <div 
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                border: `1px solid rgba(245,243,238,0.25)`,
              }}
            />

            {/* Soft Sweep Animation */}
            <div 
              className="absolute top-0 bottom-0 w-7 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(253,243,217,0.16), transparent)`,
                animation: 'fashionSoftSweep 7s ease-in-out infinite',
                animationDelay: '2s',
              }}
            />
          </div>

          {/* Champagne Glow Behind Image */}
          <div 
            className="absolute -inset-3 -z-10 rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at center, rgba(253,243,217,0.1), transparent 70%)`,
              filter: 'blur(16px)',
            }}
          />
        </div>

        {/* Name & Title Block */}
        <div className="mt-1">
          <h2 
            className="text-xl sm:text-2xl font-bold leading-tight tracking-tight"
            style={{ 
              color: colors.white,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
            data-testid="fashion-card-name"
          >
            {userData.name || 'Your Name'}
          </h2>
          
          {/* Under-Name Underline */}
          <div 
            className="h-[2px] w-12 mt-1 mb-2"
            style={{
              background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow}, ${colors.editorialNude})`,
              backgroundSize: '200% 100%',
              animation: 'fashionUnderlineShimmer 3s linear infinite',
            }}
          />

          {/* Role / Tagline */}
          {userData.title && (
            <p 
              className="text-[11px] sm:text-xs uppercase tracking-[0.18em]"
              style={{ color: 'rgba(255,255,255,0.75)' }}
              data-testid="fashion-card-title"
            >
              {userData.title}
            </p>
          )}
        </div>

        {/* Fashion Tags (Chips Line) */}
        <div className="flex flex-wrap gap-1.5">
          {userData.industry && (
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(249,197,213,0.12)',
                border: `1px solid ${colors.blushPink}`,
                color: 'rgba(255,255,255,0.8)',
              }}
              data-testid="fashion-tag-industry"
            >
              <span 
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: colors.blushPink }}
              />
              {userData.industry}
            </span>
          )}
          {fashionTags.map((tag, i) => (
            <span 
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(245,243,238,0.06)',
                border: `1px solid rgba(245,243,238,0.35)`,
                color: 'rgba(255,255,255,0.8)',
              }}
              data-testid={`fashion-tag-${i}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Quick Stats Row */}
        {quickStats.length > 0 && (
          <div 
            className="flex gap-6 pt-3"
            style={{ borderTop: `1px solid rgba(245,243,238,0.08)` }}
          >
            {quickStats.map((stat: any, i) => (
              <div key={i}>
                <p 
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {stat.label}
                </p>
                <p 
                  className="text-[13px]"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Contact / Social Row */}
        <div className="flex flex-col gap-2 mt-1">
          {userData.email && (
            <a 
              href={`mailto:${userData.email}`}
              className="flex items-center gap-2.5 group transition-all duration-200"
              data-testid="fashion-card-email"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(245,243,238,0.06)',
                  border: `1px solid rgba(245,243,238,0.25)`,
                }}
              >
                <Mail className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <span 
                className="text-xs truncate transition-colors duration-200 group-hover:underline"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {userData.email}
              </span>
            </a>
          )}
          
          {userData.phoneNumber && (
            <a 
              href={`tel:${userData.phoneNumber}`}
              className="flex items-center gap-2.5 group transition-all duration-200"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(245,243,238,0.06)',
                  border: `1px solid rgba(245,243,238,0.25)`,
                }}
              >
                <Phone className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <span 
                className="text-xs transition-colors duration-200 group-hover:underline"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {userData.phoneNumber}
              </span>
            </a>
          )}

          <a 
            href={`/@${userData.brandName || userData.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group transition-all duration-200"
            data-testid="fashion-card-link"
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
              style={{
                background: 'rgba(245,243,238,0.06)',
                border: `1px solid rgba(245,243,238,0.25)`,
              }}
            >
              <Globe className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>
            <span 
              className="text-xs truncate transition-colors duration-200 group-hover:underline"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {profileLink}
            </span>
          </a>
        </div>
        </>
        )}

        {activeTab === 'contact' && (
        <div className="flex flex-col gap-2">
          {userData.email && (
            <a 
              href={`mailto:${userData.email}`}
              className="flex items-center gap-2.5 group transition-all duration-200"
              data-testid="fashion-card-email"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(245,243,238,0.06)',
                  border: `1px solid rgba(245,243,238,0.25)`,
                }}
              >
                <Mail className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <span 
                className="text-xs truncate transition-colors duration-200 group-hover:underline"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {userData.email}
              </span>
            </a>
          )}
          
          {userData.phoneNumber && (
            <a 
              href={`tel:${userData.phoneNumber}`}
              className="flex items-center gap-2.5 group transition-all duration-200"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'rgba(245,243,238,0.06)',
                  border: `1px solid rgba(245,243,238,0.25)`,
                }}
              >
                <Phone className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <span 
                className="text-xs transition-colors duration-200 group-hover:underline"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {userData.phoneNumber}
              </span>
            </a>
          )}

          <a 
            href={`/@${userData.brandName || userData.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group transition-all duration-200"
            data-testid="fashion-card-link"
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
              style={{
                background: 'rgba(245,243,238,0.06)',
                border: `1px solid rgba(245,243,238,0.25)`,
              }}
            >
              <Globe className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>
            <span 
              className="text-xs truncate transition-colors duration-200 group-hover:underline"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {profileLink}
            </span>
          </a>
        </div>
        )}
      </div>
    </div>
  );
};

export default FashionQuantumCard;
