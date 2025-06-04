import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2, Share2, Zap } from "lucide-react";

interface QuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const QuantumCard: React.FC<QuantumCardProps> = ({ userData, isLoading = false }) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;

  return (
    <div className="quantum-card w-full h-full aspect-[2/3.5] relative overflow-hidden rounded-xl">
      {/* Background gradient with tech-inspired dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F2C] to-[#1F1B44] z-0">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJBMkE0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Glassmorphism card container with angled edges */}
      <div className="absolute inset-0 m-2 bg-white/5 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 z-10 overflow-hidden transform" style={{clipPath: "polygon(0 0, 100% 0, 97% 100%, 3% 100%)"}}>
        {/* Glowing border effect */}
        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-lg z-20 pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
      
        {/* Card content */}
        <div className="relative flex flex-col h-full w-full z-30 p-4">
          
          {/* Subtle loading indicator instead of full overlay */}
          {isLoading && (
            <div className="absolute top-2 right-2 z-50 p-2 backdrop-blur-md bg-blue-500/10 rounded-lg border border-blue-400/30">
              <div className="liquid-loading" style={{ height: "20px" }}>
                <div className="liquid-loading-bar"></div>
                <div className="liquid-loading-bar"></div>
                <div className="liquid-loading-bar"></div>
              </div>
            </div>
          )}
          
          {/* Header section with holographic profile picture */}
          <div className="flex flex-col items-center mb-6 mt-4">
            {/* Hexagonal profile picture frame with glow */}
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-md rounded-full opacity-70"></div>
              <div className="absolute inset-0 animate-pulse-slow opacity-60 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-md rounded-full"></div>
              <div className="h-24 w-24 rounded-full p-1 bg-gradient-to-r from-cyan-400 to-purple-500 relative">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-[#0A1A3F] to-[#1F1B44] flex items-center justify-center overflow-hidden border border-white/20">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.name || "Profile"} 
                      className={`h-full w-full object-cover ${isLoading ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=0D1117&color=60A5FA";
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0D1117&color=60A5FA`}
                      alt={userData.name || "Profile"}
                      className={`h-full w-full object-cover ${isLoading ? 'opacity-50' : ''}`}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Name and title */}
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white text-center">
              {isLoading ? (
                <span className="inline-block w-32 h-6 bg-blue-300/20 rounded animate-pulse"></span>
              ) : (
                userData.name || "Your Name"
              )}
            </h2>
            
            {/* Job title as a glowing neon chip */}
            <div className="mt-1 px-3 py-1 rounded-full bg-blue-900/50 backdrop-blur-sm border border-blue-500/30 text-cyan-400 text-xs font-medium inline-flex items-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
              <Zap className="h-3 w-3 mr-1 text-cyan-400" />
              {isLoading ? (
                <span className="inline-block w-24 h-3 bg-blue-300/20 rounded animate-pulse"></span>
              ) : (
                <span>{userData.title || "Add your designation"}</span>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 space-y-3 text-sm">
            {/* Domain tag with animated pulse */}
            {(userData.domain || isLoading) && (
              <div className="flex items-center gap-2 mb-2">
                {isLoading ? (
                  <div className="w-28 h-6 bg-purple-900/20 border border-purple-500/30 rounded-md animate-pulse"></div>
                ) : (
                  <div className="flex items-center gap-2 py-1 px-3 bg-purple-900/30 backdrop-blur-sm border border-purple-500/40 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                    </span>
                    <span className="text-purple-300 text-xs font-medium">
                      #{userData.domain === "all" ? "General" : userData.domain}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Industry with holographic chip */}
            {(userData.industry || isLoading) && (
              <div className="flex items-center gap-2 py-1.5 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">
                  <Building2 className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-24 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-white/90 font-light tracking-wide">{userData.industry}</span>
                )}
              </div>
            )}
            
            {/* Company */}
            {(userData.company || isLoading) && (
              <div className="flex items-center gap-2 py-1.5 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">
                  <Briefcase className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-28 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-white/90 font-light tracking-wide">{userData.company}</span>
                )}
              </div>
            )}
            
            {/* Location with pin */}
            {(userData.location || isLoading) && (
              <div className="flex items-center gap-2 py-1.5 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">
                  <MapPin className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-32 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-white/90 font-light tracking-wide">{userData.location}</span>
                )}
              </div>
            )}

            {/* Contact section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              {/* Email */}
              <div className="flex items-center gap-2 py-1.5 transition-all duration-300 hover:translate-x-1 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  <Mail className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-36 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-white/90 text-xs tracking-wide">{userData.email}</span>
                )}
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-2 py-1.5 transition-all duration-300 hover:translate-x-1 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  <Phone className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-28 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-white/90 text-xs tracking-wide">{userData.phoneNumber || "Add phone number"}</span>
                )}
              </div>
              
              {/* Profile Link with barcode-style */}
              <div className="flex items-center gap-2 py-1.5 transition-all duration-300 hover:translate-x-1 group">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  <Globe className="h-3 w-3 text-blue-400" />
                </div>
                {isLoading ? (
                  <span className="w-32 h-3 bg-blue-300/20 rounded animate-pulse"></span>
                ) : (
                  <span className="text-cyan-400 text-xs tracking-wide font-medium">{profileLink}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer with share button */}
          <div className="mt-4 mb-2 flex justify-center">
            <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-md text-cyan-400 text-xs font-medium inline-flex items-center border border-blue-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] ${isLoading ? 'opacity-50' : 'hover:bg-blue-800/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer'}`}>
              <Share2 className="h-3 w-3 mr-2 text-cyan-400" />
              <span>Share Quantum Card</span>
            </div>
          </div>
          
          {/* Decorative tech elements */}
          <div className="absolute top-0 right-0 h-16 w-16 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="44" stroke="url(#circuitGradient)" strokeWidth="2" />
              <path d="M45 1C45 1 35 15 35 45C35 75 45 89 45 89" stroke="url(#circuitGradient)" strokeWidth="2" />
              <path d="M45 1C45 1 55 15 55 45C55 75 45 89 45 89" stroke="url(#circuitGradient)" strokeWidth="2" />
              <path d="M1 45C1 45 15 35 45 35C75 35 89 45 89 45" stroke="url(#circuitGradient)" strokeWidth="2" />
              <path d="M1 45C1 45 15 55 45 55C75 55 89 45 89 45" stroke="url(#circuitGradient)" strokeWidth="2" />
              <defs>
                <linearGradient id="circuitGradient" x1="0" y1="0" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4F46E5" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="absolute bottom-0 left-0 h-16 w-16 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
              <rect x="1" y="1" width="78" height="78" rx="4" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M20 1V80" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M40 1V80" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M60 1V80" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M1 20H80" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M1 40H80" stroke="url(#chipGradient)" strokeWidth="2" />
              <path d="M1 60H80" stroke="url(#chipGradient)" strokeWidth="2" />
              <defs>
                <linearGradient id="chipGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06B6D4" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumCard;