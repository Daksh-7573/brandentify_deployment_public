import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, MapPin, Camera, Aperture, Share2 } from "lucide-react";

interface PhotographyQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const PhotographyQuantumCard: React.FC<PhotographyQuantumCardProps> = ({ userData, isLoading = false }) => {
  const profileLink = `brandentifier.com/@${(userData.brandName || userData.username).toLowerCase().replace(/\s+/g, '-')}`;
  const profileHref = `/@${(userData.brandName || userData.username).toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <article className="w-full min-h-[600px] relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #FAFAF9 0%, #F2F2F2 100%)' }}>
      {/* Subtle paper texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(255,255,255,0.015), transparent 10%), radial-gradient(circle at 90% 90%, rgba(0,0,0,0.01), transparent 12%)'
      }}></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-6 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col lg:flex-row h-full gap-6 p-8">
        
        {/* Left: Blob Photo with light leak */}
        <figure className="flex-shrink-0 w-full lg:w-96 flex items-center justify-center" style={{
          aspectRatio: isLoading ? '1 / 1' : 'auto'
        }}>
          <div className="relative w-full h-80 lg:h-96 rounded-3xl overflow-hidden" style={{
            borderRadius: '48% 52% 49% 51% / 60% 42% 58% 46%',
            animation: 'prefers-reduced-motion: no-preference ? blobMorphLight 10s ease-in-out infinite : none',
            background: 'linear-gradient(135deg,#FFEAF4,#DFF8FF)'
          }}>
            {userData.photoURL ? (
              <img 
                src={userData.photoURL}
                alt={`${userData.name} — profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=F5E6C8&color=0D0D0D`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center">
                <Camera className="w-24 h-24 text-orange-200 opacity-40" />
              </div>
            )}

            {/* Light leak overlay */}
            <div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{
              background: 'linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.45) 50%, rgba(251,191,36,0) 100%)',
              animation: 'prefers-reduced-motion: no-preference ? lightLeak 8s ease-in-out infinite : none',
              opacity: 0.3
            }}></div>
          </div>
        </figure>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col justify-between py-4">
          
          {/* Header */}
          <header>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 animate-[nameReveal_0.55s_cubic-bezier(0.2,0.9,0.2,1)_both]" style={{
              background: 'linear-gradient(90deg, #0D0D0D, #3C3C3C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {isLoading ? (
                <span className="inline-block w-48 h-10 bg-gray-300/20 rounded animate-pulse"></span>
              ) : (
                userData.name || "Your Name"
              )}
            </h1>

            {/* Title with gradient background */}
            <div className="inline-flex gap-2 items-center mb-4">
              <div style={{
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
                color: 'rgba(0,0,0,0.72)',
                background: 'linear-gradient(90deg, rgba(96,165,250,0.08), rgba(255,63,174,0.06))',
                padding: '8px 12px',
                borderRadius: '999px',
                width: 'fit-content',
                display: 'inline-block'
              }}>
                {isLoading ? (
                  <span className="inline-block w-40 h-4 bg-gray-300/20 rounded animate-pulse"></span>
                ) : (
                  userData.title || "Photographer"
                )}
              </div>
            </div>

            {/* Tagline */}
            {(userData as any).bio && (
              <p style={{ color: 'rgba(0,0,0,0.66)', fontSize: '0.95rem', maxWidth: '42ch', marginTop: '8px' }}>
                {(userData as any).bio}
              </p>
            )}
          </header>

          {/* Info chips */}
          <div className="flex flex-wrap gap-3 my-6">
            {userData.location && (
              <div style={{
                display: 'inline-flex',
                gap: '8px',
                alignItems: 'center',
                padding: '6px 10px',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.04)',
                borderRadius: '999px',
                color: 'rgba(0,0,0,0.66)',
                fontSize: '0.82rem'
              }}>
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{userData.location}</span>
              </div>
            )}
            
            {userData.domain && (
              <div style={{
                display: 'inline-flex',
                gap: '8px',
                alignItems: 'center',
                padding: '6px 10px',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.04)',
                borderRadius: '999px',
                color: 'rgba(0,0,0,0.66)',
                fontSize: '0.82rem'
              }}>
                <Aperture className="w-4 h-4 text-blue-500" />
                <span>{userData.domain === 'all' ? 'Creative' : userData.domain}</span>
              </div>
            )}
          </div>

          {/* Skills as lens meters */}
          {(userData as any).skills && (userData as any).skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-500" />
                Core Skills
              </h3>
              <div className="space-y-4">
                {(userData as any).skills.slice(0, 3).map((skill: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-800">{skill.name || `Skill ${idx + 1}`}</span>
                      <span className="text-xs text-gray-500">Expert</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.random() * 40 + 60}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #FF3FAE, #60E6FF)',
                          borderRadius: '999px',
                          transition: 'width 0.6s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact section */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {userData.email && (
              <div className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a href={`mailto:${userData.email}`} className="truncate hover:underline">
                  {userData.email}
                </a>
              </div>
            )}
            
            {userData.phoneNumber && (
              <div className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a href={`tel:${userData.phoneNumber}`} className="hover:underline">
                  {userData.phoneNumber}
                </a>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition-colors">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <a href={profileHref} target="_blank" rel="noopener noreferrer" className="truncate hover:underline font-medium">
                {profileLink}
              </a>
            </div>
          </div>

          {/* Share button */}
          <div className="mt-6 flex justify-center pt-4">
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg,#FF3FAE,#60E6FF)',
              color: 'white',
              fontWeight: '500',
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 12px 36px rgba(96,165,250,0.12)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease'
            }} onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
            }} onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}>
              <Share2 className="w-4 h-4" />
              <span>Share Quantum Card</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blobMorphLight {
          0% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
          50% { border-radius: 50% 50% 45% 55% / 40% 60% 45% 55%; }
          100% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
        }

        @keyframes lightLeak {
          0% { transform: translateX(-120%); opacity: 0; }
          50% { transform: translateX(10%); opacity: 0.45; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes nameReveal {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .blobMorphLight, .lightLeak { animation: none !important; }
        }

        @media (max-width: 1024px) {
          [role="article"] { flex-direction: column; }
        }
      `}</style>
    </article>
  );
};

export default PhotographyQuantumCard;
