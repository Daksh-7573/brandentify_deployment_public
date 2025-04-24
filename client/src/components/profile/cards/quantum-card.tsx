import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2, Share2, Zap } from "lucide-react";

interface QuantumCardProps {
  userData: UserData;
}

const QuantumCard: React.FC<QuantumCardProps> = ({ userData }) => {
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
      <div className="absolute inset-0 m-2 bg-white/5 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 z-10 overflow-hidden transform" style={{clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)"}}>
        {/* Glowing border effect */}
        <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-lg z-20 pointer-events-none glow-border"></div>
      
        {/* Card content */}
        <div className="relative flex flex-col h-full w-full z-30 p-4">
          
          {/* Header section with holographic profile picture */}
          <div className="flex flex-col items-center mb-6 mt-4">
            {/* Hexagonal profile picture frame with glow */}
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-md rounded-full"></div>
              <div className="h-24 w-24 rounded-full p-1 bg-gradient-to-r from-cyan-400 to-purple-500 relative">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center overflow-hidden">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.name || "Profile"} 
                      className="h-full w-full object-cover mix-blend-lighten"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=0D1117&color=60A5FA";
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0D1117&color=60A5FA`}
                      alt={userData.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Name and title */}
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 text-center">
              {userData.name || "Your Name"}
            </h2>
            
            {/* Job title as a glowing neon chip */}
            <div className="mt-1 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-cyan-400 text-xs font-medium inline-flex items-center">
              <Zap className="h-3 w-3 mr-1 text-cyan-400" />
              <span>{userData.title || "Add your designation"}</span>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 space-y-3 text-sm">
            {/* Domain tag with animated pulse */}
            {userData.domain && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 py-1 px-2 bg-purple-900/20 border border-purple-500/30 rounded-md">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                  </span>
                  <span className="text-purple-300 text-xs">
                    #{userData.domain === "all" ? "General" : userData.domain}
                  </span>
                </div>
              </div>
            )}
            
            {/* Industry with holographic chip */}
            {userData.industry && (
              <div className="flex items-center gap-2 py-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Building2 className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-white/80">
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Company */}
            {userData.company && (
              <div className="flex items-center gap-2 py-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Briefcase className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-white/80">
                  {userData.company}
                </span>
              </div>
            )}
            
            {/* Location with pin */}
            {userData.location && (
              <div className="flex items-center gap-2 py-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <MapPin className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-white/80">
                  {userData.location}
                </span>
              </div>
            )}

            {/* Contact section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              {/* Email */}
              <div className="flex items-center gap-2 py-1 transition-transform hover:translate-x-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Mail className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-white/80 text-xs">
                  {userData.email}
                </span>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-2 py-1 transition-transform hover:translate-x-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Phone className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-white/80 text-xs">
                  {userData.phoneNumber || "Add phone number"}
                </span>
              </div>
              
              {/* Profile Link with barcode-style */}
              <div className="flex items-center gap-2 py-1 transition-transform hover:translate-x-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <Globe className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-cyan-400 text-xs">
                  {profileLink}
                </span>
              </div>
            </div>
          </div>
          
          {/* Footer with share button */}
          <div className="mt-4 mb-2 flex justify-center">
            <div className="px-4 py-1 rounded-full bg-blue-900/30 text-cyan-400 text-xs font-medium inline-flex items-center border border-blue-500/20 hover:bg-blue-800/40 transition-colors cursor-pointer">
              <Share2 className="h-3 w-3 mr-1 text-cyan-400" />
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