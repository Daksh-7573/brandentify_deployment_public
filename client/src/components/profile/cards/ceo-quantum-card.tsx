import React, { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { Mail, Globe, MapPin, Briefcase, Copy, Check, Phone, Building2, Hash } from "lucide-react";

interface CEOQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const CEOQuantumCard: React.FC<CEOQuantumCardProps> = ({ userData, isLoading = false }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const colors = {
    executiveGold: '#7C3AED',
    royalBlack: '#0A0A0A',
    platinumSilver: '#C9CBCF',
    deepCharcoal: '#1A1A1A',
    richNavy: '#0F1A2E',
    pureWhite: '#FFFFFF',
    softWhite: 'rgba(255,255,255,0.9)',
    mutedSilver: 'rgba(255,255,255,0.7)',
    softGoldGlow: 'rgba(124,58,237,0.35)',
    platinumEdgeGlow: 'rgba(201,203,207,0.25)',
    navyShadow: 'rgba(15,26,46,0.5)',
  };

  const profileLink = userData.randomProfileLink 
    ? `brandentify.com/r/${userData.randomProfileLink}` 
    : `brandentify.com/@${userData.brandName || userData.username}`;

  const handleCopyEmail = async () => {
    if (userData.email) {
      await navigator.clipboard.writeText(userData.email);
      setCopySuccess('email');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileLink);
    setCopySuccess('link');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <article
      ref={cardRef}
      className="ceo-quantum-card w-full min-h-[720px] relative rounded-2xl overflow-hidden"
      role="region"
      aria-labelledby="ceo-card-title"
      style={{
        background: `linear-gradient(135deg, ${colors.royalBlack} 0%, ${colors.deepCharcoal} 100%)`,
        boxShadow: `0 20px 60px ${colors.navyShadow}, inset 0 1px 0 ${colors.platinumEdgeGlow}`,
        border: `1px solid ${colors.platinumEdgeGlow}`,
      }}
    >
      {/* Background texture with gold dust particles */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, ${colors.executiveGold} 1px, transparent 1px),
            radial-gradient(circle at 60% 80%, ${colors.platinumSilver} 1px, transparent 1px),
            radial-gradient(circle at 80% 30%, ${colors.executiveGold} 1px, transparent 1px)
          `,
          backgroundSize: '300px 300px',
          animation: prefersReducedMotion ? 'none' : 'subtleDrift 40s linear infinite',
        }}
      />

      {/* Geometric lines overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" style={{ animation: prefersReducedMotion ? 'none' : 'geometricPan 45s linear infinite' }}>
          <line x1="0" y1="0" x2="100%" y2="0" stroke={colors.executiveGold} strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke={colors.executiveGold} strokeWidth="0.5" opacity="0.2" />
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke={colors.executiveGold} strokeWidth="0.5" opacity="0.15" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full p-8 space-y-8">
        
        {/* 1️⃣ EXECUTIVE HERO SECTION */}
        <div className="flex flex-col items-center pt-4">
          {/* Profile image with dual metal ring */}
          <div className="relative mb-6">
            {/* Outer gold ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                width: '140px',
                height: '140px',
                border: `3px solid ${colors.executiveGold}`,
                boxShadow: `0 0 20px ${colors.softGoldGlow}, inset 0 0 15px ${colors.softGoldGlow}`,
                animation: prefersReducedMotion ? 'none' : 'shimmerSweep 3s ease-in-out infinite',
              }}
            />
            
            {/* Inner platinum ring */}
            <div
              className="absolute inset-1.5 rounded-full"
              style={{
                width: '136px',
                height: '136px',
                border: `2px solid ${colors.platinumSilver}`,
                animation: prefersReducedMotion ? 'none' : 'rotation 20s linear infinite reverse',
              }}
            />
            
            {/* Profile image */}
            <img
              src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name}&background=0A0A0A&color=7C3AED`}
              alt={userData.name}
              className="relative z-10 w-32 h-32 rounded-full object-cover border-2"
              style={{
                borderColor: colors.executiveGold,
                boxShadow: `0 8px 24px ${colors.navyShadow}`,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${userData.name}&background=0A0A0A&color=7C3AED`;
              }}
            />
          </div>

          {/* Name with gold underline */}
          <h1
            id="ceo-card-title"
            className="text-4xl font-serif font-bold text-center mb-2"
            style={{
              color: colors.pureWhite,
              textShadow: `0 2px 4px ${colors.navyShadow}`,
              borderBottom: `2px solid ${colors.executiveGold}`,
              paddingBottom: '8px',
              letterSpacing: '1px',
            }}
          >
            {userData.name}
          </h1>

          {/* Title capsule */}
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium my-3"
            style={{
              background: colors.richNavy,
              border: `1px solid ${colors.executiveGold}`,
              color: colors.executiveGold,
              boxShadow: `0 0 10px ${colors.softGoldGlow}`,
            }}
          >
            {userData.title || "Executive"}
          </div>

        </div>

        {/* Professional Info Section - Grid Layout */}
        <div className="space-y-2 mb-6 w-full">
          {/* Row 1: Company and Location */}
          <div className="flex gap-2 justify-center w-full">
            {userData.company && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                style={{
                  background: colors.richNavy,
                  border: `1px solid ${colors.platinumEdgeGlow}`,
                  color: colors.softWhite,
                }}
              >
                <Building2 size={14} style={{ color: colors.executiveGold }} />
                <span className="truncate">{userData.company}</span>
              </div>
            )}

            {userData.location && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                style={{
                  background: colors.richNavy,
                  border: `1px solid ${colors.platinumEdgeGlow}`,
                  color: colors.softWhite,
                }}
              >
                <MapPin size={14} style={{ color: colors.executiveGold }} />
                <span className="truncate">{userData.location}</span>
              </div>
            )}
          </div>

          {/* Row 2: Industry and Domain */}
          <div className="flex gap-2 justify-center w-full">
            {userData.industry && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                style={{
                  background: colors.richNavy,
                  border: `1px solid ${colors.platinumEdgeGlow}`,
                  color: colors.softWhite,
                }}
              >
                <Briefcase size={14} style={{ color: colors.executiveGold }} />
                <span className="truncate">{userData.industry}</span>
              </div>
            )}

            {userData.domain && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                style={{
                  background: colors.richNavy,
                  border: `1px solid ${colors.platinumEdgeGlow}`,
                  color: colors.softWhite,
                }}
              >
                <Hash size={14} style={{ color: colors.executiveGold }} />
                <span className="truncate">{userData.domain}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col gap-2 mt-auto pt-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          {userData.email && (
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-300"
              style={{
                background: copySuccess === 'email' ? `${colors.softGoldGlow}30` : 'transparent',
                border: `1px solid ${colors.platinumEdgeGlow}`,
                color: colors.softWhite,
              }}
            >
              {copySuccess === 'email' ? (
                <>
                  <Check size={14} style={{ color: colors.executiveGold }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="truncate">{userData.email}</span>
                </>
              )}
            </button>
          )}

          {userData.phoneNumber && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
              style={{
                border: `1px solid ${colors.platinumEdgeGlow}`,
                color: colors.softWhite,
              }}
            >
              <Phone size={14} style={{ color: colors.executiveGold }} />
              <span>{userData.phoneNumber}</span>
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-300"
            style={{
              background: copySuccess === 'link' ? `${colors.softGoldGlow}30` : 'transparent',
              border: `1px solid ${colors.platinumEdgeGlow}`,
              color: colors.softWhite,
            }}
          >
            {copySuccess === 'link' ? (
              <>
                <Check size={14} style={{ color: colors.executiveGold }} />
                <span>Link copied!</span>
              </>
            ) : (
              <>
                <Globe size={14} />
                <span className="truncate">{profileLink}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Platinum scanline (slow & thin) */}
      {!prefersReducedMotion && (
        <div
          className="absolute top-0 left-0 w-full h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.platinumSilver}, transparent)`,
            animation: 'scanline 12s ease-in-out infinite',
            opacity: 0.3,
          }}
        />
      )}

      <style>{`
        @keyframes shimmerSweep {
          0% { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.35)); }
          50% { filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.35)); }
          100% { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.35)); }
        }
        @keyframes rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes subtleDrift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes geometricPan {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .ceo-quantum-card {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
      `}</style>
    </article>
  );
};

export default CEOQuantumCard;

