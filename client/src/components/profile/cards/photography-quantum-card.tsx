import React from "react";
import { UserData } from "@/types/user";
import { MapPin, Camera, Mail, Phone, Globe, Building2, Briefcase, Hash } from "lucide-react";

interface PhotographyQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const PhotographyQuantumCard: React.FC<PhotographyQuantumCardProps> = ({ userData, isLoading = false }) => {
  // Format profile link
  const profileLink = userData.randomProfileLink 
    ? `brandentifier.com/r/${userData.randomProfileLink}` 
    : `brandentifier.com/@${userData.brandName || userData.username}`;

  return (
    <div className="photography-quantum-card w-full min-h-[580px] relative rounded-2xl overflow-hidden">
      {/* Background gradient - cinematic light & dark fusion */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF9] via-[#F5E6C8] to-[#0D0D0D] z-0" />
      
      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-5 z-1"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
        aria-hidden="true"
      />

      {/* Light leak animation */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(251,191,36,0.0) 0%, rgba(251,191,36,0.35) 50%, rgba(251,191,36,0.0) 100%)',
          animation: 'lightLeakSweep 8s ease-in-out infinite'
        }}
        aria-hidden="true"
      />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
        
        {/* Hero Section - Filmstrip Frame */}
        <div className="flex flex-col items-center mb-6">
          {/* Filmstrip frame effect */}
          <div className="relative mb-4 w-full max-w-[180px]">
            {/* Outer filmstrip frame */}
            <div className="absolute -inset-4 bg-[#1C1C1C] rounded-lg" style={{
              clipPath: 'polygon(0 0, 5% 15%, 5% 85%, 0 100%, 100% 100%, 95% 85%, 95% 15%, 100% 0)'
            }}>
              <div className="absolute inset-2 bg-[#0D0D0D]" style={{
                clipPath: 'polygon(0 0, 5% 12%, 5% 88%, 0 100%, 100% 100%, 95% 88%, 95% 12%, 100% 0)'
              }} />
            </div>

            {/* Profile photo with cinematic glow */}
            <div className="relative aspect-square rounded-lg overflow-hidden border-8 border-[#F5E6C8] shadow-2xl" style={{
              boxShadow: '0 0 40px rgba(251,191,36,0.3), inset 0 0 20px rgba(0,0,0,0.1)'
            }}>
              {isLoading ? (
                <div className="w-full h-full bg-gradient-to-br from-[#F5E6C8] to-[#D4C5A9] animate-pulse" />
              ) : (
                <img 
                  src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=1C1C1C&color=FBBF24`}
                  alt={`${userData.name} — Photography Portfolio`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=1C1C1C&color=FBBF24`;
                  }}
                />
              )}
            </div>

            {/* Cinematic title bar */}
            <div className="absolute -bottom-8 left-0 right-0 bg-gradient-to-r from-[#FBBF24] to-[#FDBA74] h-8 flex items-center justify-center" style={{
              clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)'
            }}>
              <span className="text-[#0D0D0D] text-xs font-bold tracking-widest uppercase">Photography</span>
            </div>
          </div>

          {/* Name - Cinematic reveal */}
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#0D0D0D] mt-10 mb-2" style={{
            textShadow: '0 2px 8px rgba(251,191,36,0.2)'
          }}>
            {isLoading ? (
              <span className="inline-block w-48 h-8 bg-[#D4D4D4] rounded animate-pulse" />
            ) : (
              userData.name || "Your Name"
            )}
          </h2>

          {/* Title in golden hour gradient */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FBBF24] to-[#FDBA74] rounded-full mb-3">
            <Camera className="h-4 w-4 text-[#0D0D0D]" />
            <span className="text-sm font-semibold text-[#0D0D0D] tracking-wide">
              {isLoading ? (
                <span className="inline-block w-32 h-4 bg-[#0D0D0D]/30 rounded animate-pulse" />
              ) : (
                userData.title || "Add your designation"
              )}
            </span>
          </div>

        </div>

        {/* Divider line */}
        <div className="w-12 h-1 bg-gradient-to-r from-[#FBBF24] to-transparent mx-auto mb-6" />

        {/* Professional Info */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs w-full">
          {userData.company && (
            <div className="flex items-center gap-1.5 text-[#1C1C1C] px-2 py-1.5 bg-white/40 rounded-lg backdrop-blur-sm whitespace-nowrap">
              <Building2 className="h-3.5 w-3.5 text-[#FBBF24] flex-shrink-0" />
              <span className="truncate text-xs">{userData.company}</span>
            </div>
          )}
          
          {userData.industry && (
            <div className="flex items-center gap-1.5 text-[#1C1C1C] px-2 py-1.5 bg-white/40 rounded-lg backdrop-blur-sm whitespace-nowrap">
              <Briefcase className="h-3.5 w-3.5 text-[#FBBF24] flex-shrink-0" />
              <span className="truncate text-xs">{userData.industry}</span>
            </div>
          )}
          
          {userData.domain && (
            <div className="flex items-center gap-1.5 text-[#1C1C1C] px-2 py-1.5 bg-white/40 rounded-lg backdrop-blur-sm whitespace-nowrap">
              <Hash className="h-3.5 w-3.5 text-[#FBBF24] flex-shrink-0" />
              <span className="truncate text-xs">{userData.domain}</span>
            </div>
          )}

          {userData.location && (
            <div className="flex items-center gap-1.5 text-[#1C1C1C] px-2 py-1.5 bg-white/40 rounded-lg backdrop-blur-sm whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5 text-[#FBBF24] flex-shrink-0" />
              <span className="truncate text-xs">{userData.location}</span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Contact Information - Distinct Section */}
        <div className="w-full bg-gradient-to-r from-[#0D0D0D]/80 to-[#1C1C1C]/80 backdrop-blur-md rounded-lg px-4 py-4 border border-[#FBBF24]/30">
          <div className="space-y-2.5">
            {userData.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="flex items-center gap-3 text-[#F5E6C8] hover:text-[#FBBF24] transition-colors text-xs"
                data-testid="link-email"
              >
                <Mail className="h-4 w-4 text-[#FBBF24] flex-shrink-0" />
                <span className="truncate">{userData.email}</span>
              </a>
            )}

            {userData.phoneNumber && (
              <a 
                href={`tel:${userData.phoneNumber}`}
                className="flex items-center gap-3 text-[#F5E6C8] hover:text-[#FBBF24] transition-colors text-xs"
                data-testid="link-phone"
              >
                <Phone className="h-4 w-4 text-[#FBBF24] flex-shrink-0" />
                <span className="truncate">{userData.phoneNumber}</span>
              </a>
            )}

            <a 
              href={`/@${userData.brandName || userData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[#F5E6C8] hover:text-[#FBBF24] transition-colors text-xs"
              data-testid="link-profile"
            >
              <Globe className="h-4 w-4 text-[#FBBF24] flex-shrink-0" />
              <span className="truncate">{profileLink}</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lightLeakSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          50% { transform: translateX(10%); opacity: 0.45; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .photography-quantum-card {
            animation: none !important;
          }
          .photography-quantum-card > div[style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotographyQuantumCard;
