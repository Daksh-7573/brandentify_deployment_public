import { useState } from "react";
import { 
  MapPin, 
  Mail, 
  Instagram, 
  Globe, 
  Eye,
  Camera,
  Star,
  Ruler,
  Calendar
} from "lucide-react";
// Fashion Editorial Color Palette
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

interface FashionQuantumCardProps {
  user: any;
  skills?: any[];
  compact?: boolean;
}

export default function FashionQuantumCard({ user, skills = [], compact = false }: FashionQuantumCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get top skills/specialties for tags
  const topSkills = skills.slice(0, 4);
  
  // Format display data
  const displayName = user.fullName || user.brandName || user.username || "Fashion Professional";
  const role = user.currentRole || user.industry || "Fashion Model";
  const location = user.location || user.city || "";
  const avatarUrl = user.avatarUrl || user.profileImageUrl;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        @keyframes softSweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          10%  { opacity: 0.25; }
          50%  { transform: translateX(0%); opacity: 0.35; }
          90%  { opacity: 0; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        
        @keyframes softGlow {
          0%   { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
          50%  { box-shadow: 0 28px 72px rgba(0,0,0,0.7); }
          100% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
        }
        
        @keyframes underlineShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        .fashion-card {
          animation: softGlow 8s linear infinite;
        }
        
        .fashion-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.75);
        }
        
        .image-sweep::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 32px;
          background: linear-gradient(90deg, transparent, rgba(253,243,217,0.16), transparent);
          animation: softSweep 7s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .name-underline {
          background: linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow}, ${colors.editorialNude});
          background-size: 200% 100%;
          animation: underlineShimmer 4s linear infinite;
        }
        
        .fashion-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(249,197,213,0.18);
        }
        
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(253,243,217,0.28);
          filter: brightness(1.05);
        }
        
        .contact-row:hover .contact-icon {
          transform: translateX(2px);
        }
        
        .contact-row:hover .contact-text {
          text-decoration: underline;
          color: rgba(255,255,255,0.95);
        }
      `}</style>

      <div 
        className="fashion-card relative flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width: compact ? "320px" : "380px",
          background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
          borderRadius: "1.25rem",
          border: `1px solid rgba(245,243,238,0.18)`,
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          padding: compact ? "16px" : "20px",
          gap: compact ? "12px" : "16px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Spotlight Background Accent */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 10%, rgba(253,243,217,0.18), transparent 60%)",
          }}
        />

        {/* Editorial Edge Accent */}
        <div 
          className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
          style={{
            background: `linear-gradient(180deg, ${colors.blushPink}, ${colors.champagneGlow})`,
          }}
        />

        {/* Hero Image Block */}
        <div 
          className="image-sweep relative w-full overflow-hidden"
          style={{
            aspectRatio: "4/5",
            borderRadius: "0.75rem",
            border: `1px solid rgba(245,243,238,0.25)`,
            boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
          }}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{
                transform: isHovered ? "scale(1.03)" : "scale(1)",
              }}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: colors.runwayCharcoal }}
            >
              <Camera className="w-16 h-16" style={{ color: colors.softBone, opacity: 0.3 }} />
            </div>
          )}
          
          {/* Bottom Gradient Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(5,5,9,0.55), transparent 60%)",
            }}
          />
        </div>

        {/* Name & Title Block */}
        <div className="relative z-10 pl-2">
          <h2 
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: compact ? "20px" : "24px",
              color: colors.white,
              lineHeight: 1.1,
            }}
          >
            {displayName}
          </h2>
          
          {/* Underline */}
          <div 
            className="name-underline mt-1 rounded-full"
            style={{
              width: "50px",
              height: "2px",
            }}
          />
          
          {/* Role Tagline */}
          <p 
            className="mt-2 uppercase tracking-widest"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.18em",
            }}
          >
            {role}
          </p>
        </div>

        {/* Fashion Tags */}
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-2">
            {topSkills.map((skill, index) => (
              <span
                key={skill.id || index}
                className="fashion-tag inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition-all duration-200"
                style={{
                  background: "rgba(245,243,238,0.06)",
                  border: index === 0 
                    ? `1px solid ${colors.blushPink}` 
                    : "1px solid rgba(245,243,238,0.35)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {index === 0 && (
                  <span 
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: colors.blushPink }}
                  />
                )}
                {skill.skillName || skill.name}
              </span>
            ))}
          </div>
        )}

        {/* Quick Stats Row */}
        <div 
          className="flex items-center gap-6 pl-2 pt-3"
          style={{
            borderTop: "1px solid rgba(245,243,238,0.08)",
          }}
        >
          {user.height && (
            <div className="flex flex-col">
              <span 
                className="uppercase"
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Height
              </span>
              <span 
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {user.height}
              </span>
            </div>
          )}
          
          {location && (
            <div className="flex flex-col">
              <span 
                className="uppercase"
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Based In
              </span>
              <span 
                className="flex items-center gap-1"
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            </div>
          )}

          {user.yearsOfExperience && (
            <div className="flex flex-col">
              <span 
                className="uppercase"
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Experience
              </span>
              <span 
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {user.yearsOfExperience}+ yrs
              </span>
            </div>
          )}
        </div>

        {/* Contact Row */}
        <div className="flex flex-col gap-1.5 pl-2">
          {user.email && (
            <a 
              href={`mailto:${user.email}`}
              className="contact-row flex items-center gap-2 group"
            >
              <span 
                className="contact-icon flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200"
                style={{
                  background: "rgba(245,243,238,0.06)",
                  border: "1px solid rgba(245,243,238,0.25)",
                }}
              >
                <Mail className="w-2.5 h-2.5" style={{ color: colors.softBone }} />
              </span>
              <span 
                className="contact-text truncate transition-colors duration-200"
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  maxWidth: "200px",
                }}
              >
                {user.email}
              </span>
            </a>
          )}
          
          {user.instagramHandle && (
            <a 
              href={`https://instagram.com/${user.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-row flex items-center gap-2 group"
            >
              <span 
                className="contact-icon flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200"
                style={{
                  background: "rgba(245,243,238,0.06)",
                  border: "1px solid rgba(245,243,238,0.25)",
                }}
              >
                <Instagram className="w-2.5 h-2.5" style={{ color: colors.softBone }} />
              </span>
              <span 
                className="contact-text transition-colors duration-200"
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                @{user.instagramHandle.replace('@', '')}
              </span>
            </a>
          )}

          {user.websiteUrl && (
            <a 
              href={user.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-row flex items-center gap-2 group"
            >
              <span 
                className="contact-icon flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200"
                style={{
                  background: "rgba(245,243,238,0.06)",
                  border: "1px solid rgba(245,243,238,0.25)",
                }}
              >
                <Globe className="w-2.5 h-2.5" style={{ color: colors.softBone }} />
              </span>
              <span 
                className="contact-text truncate transition-colors duration-200"
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  maxWidth: "200px",
                }}
              >
                {user.websiteUrl.replace(/^https?:\/\//, '')}
              </span>
            </a>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-auto pl-2">
          <button
            className="cta-primary flex-1 py-2 rounded-full uppercase font-medium transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
              fontSize: "12px",
              color: colors.noirBlack,
              letterSpacing: "0.05em",
            }}
            data-testid="button-book-me"
          >
            Book Me
          </button>
          
          <button
            className="flex-1 py-2 rounded-full uppercase font-medium transition-all duration-200 hover:bg-white/5"
            style={{
              background: "transparent",
              border: "1px solid rgba(245,243,238,0.45)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.05em",
            }}
            data-testid="button-view-portfolio"
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Portfolio
          </button>
        </div>
      </div>
    </>
  );
}
