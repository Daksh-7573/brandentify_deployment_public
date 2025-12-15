import React, { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { MapPin, Mail, Globe, Dumbbell, Phone, Building2, Briefcase, Hash, Target } from "lucide-react";

interface FitnessQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const FitnessQuantumCard: React.FC<FitnessQuantumCardProps> = ({ userData, isLoading = false }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const colors = {
    energeticLime: '#A3E635',
    vibrantOrange: '#FB923C',
    deepEmerald: '#065F46',
    skyBlue: '#38BDF8',
    offWhiteMist: '#F8F9FA',
    coolGrey: '#E5E7EB',
    deepCharcoal: '#1F2937',
  };

  const profileLink = userData.randomProfileLink 
    ? `brandentifier.com/r/${userData.randomProfileLink}` 
    : `brandentifier.com/@${userData.brandName || userData.username}`;

  return (
    <article 
      ref={cardRef}
      className="fitness-quantum-card w-full min-h-[620px] relative rounded-3xl overflow-hidden"
      role="region" 
      aria-labelledby="fitness-card-title"
      style={{
        background: `linear-gradient(180deg, ${colors.offWhiteMist} 0%, #FAFEFB 100%)`,
        boxShadow: `0 12px 40px rgba(6,95,70,0.08)`,
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
      }}
    >
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.energeticLime}, ${colors.vibrantOrange}, ${colors.skyBlue})`,
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(163,230,53,0.08) 50%, rgba(251,146,60,0) 100%)`,
          mixBlendMode: 'screen',
          opacity: 0.85,
          animation: prefersReducedMotion ? 'none' : 'lightSweep 9s ease-in-out infinite'
        }}
        aria-hidden="true"
      />

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${colors.energeticLime}40 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, ${colors.skyBlue}30 0%, transparent 40%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
        
        <header className="flex items-start gap-5 mb-6">
          <div 
            className="fcard-aura relative flex-shrink-0"
            style={{ width: '130px', height: '130px' }}
          >
            <div 
              className="absolute -inset-3 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${colors.energeticLime}, ${colors.vibrantOrange}, ${colors.skyBlue}, ${colors.energeticLime})`,
                opacity: 0.15,
                filter: 'blur(10px)',
                animation: prefersReducedMotion ? 'none' : 'breathFlow 6s ease-in-out infinite'
              }}
              aria-hidden="true"
            />
            
            <div 
              className="absolute inset-2 rounded-full"
              style={{
                border: `5px solid rgba(6,95,70,0.08)`,
                boxShadow: `0 6px 18px rgba(6,95,70,0.06) inset`,
                animation: prefersReducedMotion ? 'none' : 'trackerRotate 8s linear infinite'
              }}
              aria-hidden="true"
            />
            
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 20%, rgba(163,230,53,0.08), transparent 50%)`,
              }}
              aria-hidden="true"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              {isLoading ? (
                <div 
                  className="w-24 h-24 rounded-full animate-pulse"
                  style={{ background: `linear-gradient(135deg, ${colors.coolGrey}, ${colors.offWhiteMist})` }}
                />
              ) : (
                <img
                  src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=065F46&color=A3E635`}
                  alt={`${userData.name} — profile`}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{
                    border: '4px solid white',
                    boxShadow: `0 10px 30px rgba(6,95,70,0.1)`
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=065F46&color=A3E635`;
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <h1 
              id="fitness-card-title" 
              className="text-xl sm:text-2xl font-bold leading-tight mb-2"
              style={{ color: colors.deepCharcoal }}
            >
              {isLoading ? (
                <span className="inline-block w-40 h-7 rounded animate-pulse" style={{ background: colors.coolGrey }} />
              ) : (
                userData.name || "Your Name"
              )}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.vibrantOrange}, #FFD08A)`,
                  boxShadow: `0 8px 24px rgba(251,146,60,0.15)`
                }}
              >
                <Dumbbell className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-semibold text-white">
                  {isLoading ? (
                    <span className="inline-block w-24 h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.4)' }} />
                  ) : (
                    userData.title || "Fitness Coach"
                  )}
                </span>
              </div>

              {(userData as any).yearsOfExperience && (
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                  style={{
                    background: 'white',
                    border: `1px solid rgba(6,95,70,0.08)`,
                    color: colors.deepCharcoal
                  }}
                >
                  <Target className="h-3 w-3" style={{ color: colors.deepEmerald }} />
                  <span>{(userData as any).yearsOfExperience} yrs</span>
                </div>
              )}
            </div>

            <p 
              className="text-sm leading-relaxed"
              style={{ color: `${colors.deepCharcoal}cc` }}
            >
              {isLoading ? (
                <span className="inline-block w-48 h-4 rounded animate-pulse" style={{ background: colors.coolGrey }} />
              ) : (
                userData.tagline || "Strengthen the body. Calm the mind."
              )}
            </p>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 w-full mb-6">
          {userData.company && (
            <div 
              className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'white',
                border: `1px solid rgba(6,95,70,0.06)`,
                color: `${colors.deepCharcoal}cc`
              }}
              title="Company"
            >
              <Building2 className="h-3 w-3" style={{ color: colors.deepEmerald }} />
              <span>{userData.company}</span>
            </div>
          )}

          {userData.industry && (
            <div 
              className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'white',
                border: `1px solid rgba(6,95,70,0.06)`,
                color: `${colors.deepCharcoal}cc`
              }}
              title="Industry"
            >
              <Briefcase className="h-3 w-3" style={{ color: colors.vibrantOrange }} />
              <span>{userData.industry}</span>
            </div>
          )}

          {userData.domain && (
            <div 
              className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'white',
                border: `1px solid rgba(6,95,70,0.06)`,
                color: `${colors.deepCharcoal}cc`
              }}
              title="Domain"
            >
              <Hash className="h-3 w-3" style={{ color: colors.skyBlue }} />
              <span>{userData.domain}</span>
            </div>
          )}

          {userData.location && (
            <div 
              className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
              style={{
                background: 'white',
                border: `1px solid rgba(6,95,70,0.06)`,
                color: `${colors.deepCharcoal}cc`
              }}
              title="Location"
            >
              <MapPin className="h-3 w-3" style={{ color: colors.deepEmerald }} />
              <span>{userData.location}</span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Contact Information Section */}
        <div 
          className="contact-panel rounded-xl p-4"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,255,250,0.98))`,
            border: `1px solid rgba(6,95,70,0.08)`
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {userData.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Mail className="h-3.5 w-3.5" style={{ color: colors.deepEmerald }} />
                <span>{userData.email}</span>
              </a>
            )}

            {userData.phoneNumber && (
              <a 
                href={`tel:${userData.phoneNumber}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Phone className="h-3.5 w-3.5" style={{ color: colors.vibrantOrange }} />
                <span>{userData.phoneNumber}</span>
              </a>
            )}

            <a 
              href={`/@${userData.brandName || userData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 max-w-[200px]"
              style={{
                background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                color: colors.deepCharcoal,
                border: `1px solid rgba(6,95,70,0.08)`
              }}
              data-testid="link-profile-url"
            >
              <Globe className="h-3.5 w-3.5 flex-shrink-0" style={{ color: colors.skyBlue }} />
              <span className="truncate">{profileLink}</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breathFlow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes trackerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes lightSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          50% { transform: translateX(10%); opacity: 0.5; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        
        @keyframes chakraPulse {
          0% { box-shadow: 0 0 0 rgba(163,230,53,0.2); }
          50% { box-shadow: 0 0 20px rgba(251,146,60,0.3); }
          100% { box-shadow: 0 0 0 rgba(56,189,248,0.2); }
        }
        
        .fitness-quantum-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(163,230,53,0.12), 0 0 30px rgba(251,146,60,0.08);
        }
        
        .fitness-quantum-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .fitness-quantum-card,
          .fitness-quantum-card * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </article>
  );
};

export default FitnessQuantumCard;
