import { useState } from "react";
import { 
  MapPin, 
  Mail, 
  Instagram, 
  Globe, 
  Eye,
  Camera,
  Star,
  Target,
  Check,
  Calendar,
  ExternalLink,
  X,
  Sparkles,
  Heart,
  Scissors,
  Award
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface FashionQuantumPortfolioProps {
  user: any;
  skills: any[];
  workExperiences: any[];
  educations: any[];
  projects: any[];
  services: any[];
  isPremium: boolean;
}

// Helper to safely convert values to string arrays
const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v));
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(v => String(v));
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function FashionQuantumPortfolio({
  user,
  skills,
  workExperiences,
  educations,
  projects,
  services,
  isPremium,
}: FashionQuantumPortfolioProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);

  // Sort data
  const sortedExperiences = [...workExperiences].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    const aYear = a.startDate ? new Date(a.startDate).getFullYear() : 0;
    const bYear = b.startDate ? new Date(b.startDate).getFullYear() : 0;
    return bYear - aYear;
  });

  const sortedEducations = [...educations].sort((a, b) => (b.endYear || 0) - (a.endYear || 0));
  const userServices = services.filter(s => s.isActive !== false);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // User display info
  const displayName = user.fullName || user.brandName || user.username || "Fashion Professional";
  const role = user.currentRole || user.industry || "Fashion Professional";
  const location = user.location || user.city || "";
  const avatarUrl = user.avatarUrl || user.profileImageUrl;
  const tagline = user.tagline || user.headline || "";

  // Get fashion-appropriate accent colors
  const accentColors = [colors.blushPink, colors.editorialNude, colors.champagneGlow, colors.warmSand];
  const getAccentColor = (index: number) => accentColors[index % accentColors.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
        
        @keyframes softSweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          10%  { opacity: 0.25; }
          50%  { transform: translateX(0%); opacity: 0.35; }
          90%  { opacity: 0; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        
        @keyframes underlineShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        @keyframes fashionFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fashion-portfolio {
          background: linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal});
          min-height: 100vh;
        }
        
        .fashion-card {
          background: rgba(17,17,24,0.72);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(245,243,238,0.18);
        }
        
        .fashion-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 48px rgba(0,0,0,0.5);
        }
        
        .name-underline {
          background: linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow}, ${colors.editorialNude});
          background-size: 200% 100%;
          animation: underlineShimmer 4s linear infinite;
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
        
        .cta-primary {
          background: linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow});
        }
        
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(253,243,217,0.28);
          filter: brightness(1.05);
        }
        
        .section-heading {
          font-family: 'Playfair Display', serif;
        }
        
        .body-text {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="fashion-portfolio relative">
        {/* Background Noise Texture */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* ==================== SECTION 1: HERO HEADER ==================== */}
          <section className="relative mb-20">
            {/* Spotlight Background */}
            <div 
              className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: colors.champagneGlow }}
            />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-12">
              {/* Hero Portrait */}
              <div 
                className="image-sweep relative w-72 lg:w-80 shrink-0"
                style={{
                  aspectRatio: "3/4",
                }}
              >
                {/* Outer Glow */}
                <div 
                  className="absolute -inset-3 rounded-2xl blur-xl opacity-30"
                  style={{ background: colors.champagneGlow }}
                />
                
                {/* Middle Ring */}
                <div 
                  className="absolute -inset-1 rounded-2xl"
                  style={{ border: `2px solid ${colors.warmSand}` }}
                />
                
                {/* Image Container */}
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden"
                  style={{
                    border: `1px solid ${colors.softBone}`,
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.runwayCharcoal }}
                    >
                      <Camera className="w-20 h-20" style={{ color: colors.softBone, opacity: 0.3 }} />
                    </div>
                  )}
                  
                  {/* Glass Reflection */}
                  <div 
                    className="absolute top-0 right-0 w-1/2 h-1/3"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.08), transparent)",
                    }}
                  />
                </div>
              </div>

              {/* Hero Text */}
              <div className="flex-1 text-center lg:text-left">
                <h1 
                  className="section-heading font-bold tracking-tight mb-2"
                  style={{
                    fontSize: "clamp(28px, 5vw, 42px)",
                    color: colors.white,
                    lineHeight: 1.1,
                  }}
                >
                  {displayName}
                </h1>
                
                {/* Underline */}
                <div 
                  className="name-underline mx-auto lg:mx-0 rounded-full mb-4"
                  style={{
                    width: "60px",
                    height: "2px",
                  }}
                />
                
                {/* Role */}
                <p 
                  className="uppercase tracking-widest mb-6"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: "0.18em",
                  }}
                >
                  {role}
                </p>

                {/* Tagline */}
                {tagline && (
                  <p 
                    className="body-text text-lg mb-6 max-w-lg mx-auto lg:mx-0"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {tagline}
                  </p>
                )}

                {/* Fashion Tags */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                  {location && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(245,243,238,0.06)",
                        border: "1px solid rgba(245,243,238,0.35)",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      {location}
                    </span>
                  )}
                  
                  {user.industry && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(245,243,238,0.06)",
                        border: `1px solid ${colors.blushPink}`,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      <Star className="w-3 h-3" style={{ color: colors.blushPink }} />
                      {user.industry}
                    </span>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <button
                    className="cta-primary px-6 py-2.5 rounded-full uppercase font-medium transition-all duration-200"
                    style={{
                      fontSize: "12px",
                      color: colors.noirBlack,
                      letterSpacing: "0.08em",
                    }}
                    data-testid="button-view-portfolio"
                  >
                    View Portfolio
                  </button>
                  
                  <button
                    className="px-6 py-2.5 rounded-full uppercase font-medium transition-all duration-200 hover:bg-white/5"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(245,243,238,0.45)",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: "0.08em",
                    }}
                    onClick={() => setIsMentorshipDialogOpen(true)}
                    data-testid="button-book-me"
                  >
                    Book Me
                  </button>
                  
                  {user.resumeUrl && (
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 rounded-full uppercase font-medium transition-all duration-200 hover:bg-white/5"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(245,243,238,0.45)",
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.9)",
                        letterSpacing: "0.08em",
                      }}
                      data-testid="link-download-comp-card"
                    >
                      Download Comp Card
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== SECTION 2: ABOUT / FASHION STORY ==================== */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Story & Identity */}
              <div className="space-y-6">
                {/* About Block */}
                {user.aboutMe && (
                  <div 
                    className="fashion-card p-6 rounded-xl transition-all duration-300"
                    style={{ animation: "fashionFadeIn 0.5s ease-out" }}
                  >
                    <h3 
                      className="section-heading text-xl font-semibold mb-1"
                      style={{ color: colors.white }}
                    >
                      My Story
                    </h3>
                    <div 
                      className="w-10 h-0.5 mb-4"
                      style={{ background: `linear-gradient(90deg, ${colors.editorialNude}, transparent)` }}
                    />
                    <p 
                      className="body-text leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {user.aboutMe}
                    </p>
                  </div>
                )}

                {/* Vision & Mission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.visionStatement && (
                    <div 
                      className="fashion-card p-5 rounded-xl"
                      style={{ borderLeft: `3px solid ${colors.blushPink}` }}
                    >
                      <h4 
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: colors.blushPink }}
                      >
                        Vision
                      </h4>
                      <p 
                        className="body-text text-sm"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {user.visionStatement}
                      </p>
                    </div>
                  )}
                  
                  {user.missionStatement && (
                    <div 
                      className="fashion-card p-5 rounded-xl"
                      style={{ borderLeft: `3px solid ${colors.editorialNude}` }}
                    >
                      <h4 
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: colors.editorialNude }}
                      >
                        Mission
                      </h4>
                      <p 
                        className="body-text text-sm"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {user.missionStatement}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Brand & Positioning */}
              <div className="space-y-6">
                {/* UVP - Who I Am On Set */}
                {user.uniqueValueProposition && (
                  <div 
                    className="fashion-card p-6 rounded-xl"
                    style={{ animation: "fashionFadeIn 0.5s ease-out 0.1s both" }}
                  >
                    <h3 
                      className="section-heading text-lg font-semibold mb-3 italic"
                      style={{ color: colors.white }}
                    >
                      "Who I Am On Set"
                    </h3>
                    <p 
                      className="body-text"
                      style={{ 
                        color: "rgba(255,255,255,0.85)",
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "18px",
                        fontStyle: "italic",
                      }}
                    >
                      {user.uniqueValueProposition}
                    </p>
                  </div>
                )}

                {/* Core Values */}
                {user.coreValues && toStringArray(user.coreValues).length > 0 && (
                  <div className="fashion-card p-5 rounded-xl">
                    <h4 
                      className="text-xs uppercase tracking-wider mb-3"
                      style={{ color: colors.inkGrey }}
                    >
                      Core Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {toStringArray(user.coreValues).map((value, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            background: `${getAccentColor(i)}20`,
                            border: `1px solid ${getAccentColor(i)}50`,
                            color: colors.white,
                          }}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Audience */}
                {user.primaryAudience && toStringArray(user.primaryAudience).length > 0 && (
                  <div className="fashion-card p-5 rounded-xl">
                    <h4 
                      className="text-xs uppercase tracking-wider mb-3"
                      style={{ color: colors.inkGrey }}
                    >
                      Ideal For
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {toStringArray(user.primaryAudience).map((audience, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            background: "rgba(245,243,238,0.06)",
                            border: "1px solid rgba(245,243,238,0.25)",
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Looking For & Email */}
                <div className="fashion-card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  {user.lookingFor && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: colors.blushPink }} />
                      <span 
                        className="text-sm"
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {user.lookingFor}
                      </span>
                    </div>
                  )}
                  
                  {user.email && (
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-sm underline transition-colors hover:opacity-80"
                      style={{ color: colors.editorialNude }}
                    >
                      {user.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ==================== SECTION 3: SKILLS / SPECIALTIES ==================== */}
          {skills.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 
                  className="section-heading text-2xl font-semibold mb-2"
                  style={{ color: colors.white }}
                >
                  Specialties
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.warmSand}, transparent)` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {skills.map((skill, index) => (
                  <div 
                    key={skill.id}
                    className="fashion-card p-4 rounded-xl text-center transition-all duration-300 hover:border-opacity-60"
                    style={{
                      borderTop: `2px solid ${getAccentColor(index)}`,
                      animation: `fashionFadeIn 0.4s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <h4 
                      className="font-medium mb-1"
                      style={{ color: colors.white, fontSize: "14px" }}
                    >
                      {skill.skillName || skill.name}
                    </h4>
                    {skill.category && (
                      <span 
                        className="text-xs uppercase tracking-wider"
                        style={{ color: colors.inkGrey }}
                      >
                        {skill.category}
                      </span>
                    )}
                    
                    {/* Subtle proficiency indicator */}
                    {skill.proficiencyLevel && (
                      <div className="flex justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: dot <= (skill.proficiencyLevel || 0) 
                                ? getAccentColor(index) 
                                : "rgba(255,255,255,0.15)",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== SECTION 4: EXPERIENCE / BRANDS & CLIENTS ==================== */}
          {sortedExperiences.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 
                  className="section-heading text-2xl font-semibold mb-2"
                  style={{ color: colors.white }}
                >
                  Brands & Clients
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.blushPink}, transparent)` }}
                />
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div 
                  className="absolute left-4 sm:left-8 top-0 bottom-0 w-px"
                  style={{ background: `linear-gradient(to bottom, ${colors.blushPink}, ${colors.editorialNude}, transparent)` }}
                />

                <div className="space-y-6 pl-12 sm:pl-20">
                  {sortedExperiences.map((exp, index) => {
                    const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : null;
                    const endYear = exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : null);
                    
                    return (
                      <div 
                        key={exp.id}
                        className="relative"
                        style={{ animation: `fashionFadeIn 0.5s ease-out ${index * 0.1}s both` }}
                      >
                        {/* Timeline Dot */}
                        <div 
                          className="absolute -left-12 sm:-left-20 top-2 w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: exp.isCurrent ? colors.blushPink : colors.editorialNude,
                            boxShadow: exp.isCurrent ? `0 0 12px ${colors.blushPink}` : "none",
                          }}
                        />
                        
                        {/* Year Label */}
                        <span 
                          className="absolute -left-10 sm:-left-16 top-0 text-xs uppercase tracking-wider"
                          style={{ 
                            color: colors.inkGrey,
                            writingMode: "vertical-lr",
                            transform: "rotate(180deg)",
                          }}
                        >
                          {startYear}
                        </span>

                        <div 
                          className={`fashion-card p-5 rounded-xl ${exp.isCurrent ? 'border-l-2' : ''}`}
                          style={{
                            borderLeftColor: exp.isCurrent ? colors.blushPink : undefined,
                          }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 
                                className="font-semibold"
                                style={{ color: colors.white, fontSize: "16px" }}
                              >
                                {exp.role}
                              </h3>
                              <p 
                                className="text-sm"
                                style={{ color: colors.editorialNude }}
                              >
                                {exp.company}
                              </p>
                            </div>
                            
                            {exp.isCurrent && (
                              <span 
                                className="px-2 py-0.5 rounded text-xs uppercase"
                                style={{
                                  background: `${colors.blushPink}20`,
                                  color: colors.blushPink,
                                }}
                              >
                                Current
                              </span>
                            )}
                          </div>

                          {exp.description && (
                            <p 
                              className="text-sm mt-2"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ==================== SECTION 5: EDUCATION / TRAINING ==================== */}
          {sortedEducations.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 
                  className="section-heading text-2xl font-semibold mb-2"
                  style={{ color: colors.white }}
                >
                  Training & Education
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.editorialNude}, transparent)` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedEducations.map((edu, index) => (
                  <div 
                    key={edu.id}
                    className="fashion-card p-5 rounded-xl flex items-start gap-4"
                    style={{ animation: `fashionFadeIn 0.4s ease-out ${index * 0.1}s both` }}
                  >
                    <Award className="w-5 h-5 mt-1 shrink-0" style={{ color: colors.editorialNude }} />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 
                            className="font-medium"
                            style={{ color: colors.white, fontSize: "15px" }}
                          >
                            {edu.degree || edu.fieldOfStudy || "Program"}
                          </h4>
                          <p 
                            className="text-sm"
                            style={{ color: colors.inkGrey }}
                          >
                            {edu.institution}
                          </p>
                        </div>
                        
                        <span 
                          className="text-xs shrink-0"
                          style={{ color: colors.inkGrey }}
                        >
                          {edu.startYear && edu.endYear 
                            ? `${edu.startYear}–${edu.endYear}`
                            : edu.endYear || edu.startYear
                          }
                        </span>
                      </div>

                      {edu.skills && toStringArray(edu.skills).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {toStringArray(edu.skills).slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                background: "rgba(245,243,238,0.06)",
                                color: "rgba(255,255,255,0.7)",
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== SECTION 6: PROJECTS / LOOKBOOK ==================== */}
          {projects.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 
                  className="section-heading text-2xl font-semibold mb-2"
                  style={{ color: colors.white }}
                >
                  Lookbook
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.champagneGlow}, transparent)` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <div 
                    key={project.id}
                    className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
                    style={{
                      aspectRatio: "4/5",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                      animation: `fashionFadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    {/* Image */}
                    {project.thumbnailUrl || (project.mediaUrls && project.mediaUrls[0]) ? (
                      <img 
                        src={project.thumbnailUrl || project.mediaUrls?.[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.runwayCharcoal }}
                      >
                        <Camera className="w-12 h-12" style={{ color: colors.softBone, opacity: 0.3 }} />
                      </div>
                    )}

                    {/* Dark Overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: "rgba(5,5,9,0.7)" }}
                    />

                    {/* Hover Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 
                        className="font-semibold mb-1"
                        style={{ color: colors.white, fontSize: "16px" }}
                      >
                        {project.title}
                      </h3>
                      
                      {project.category && (
                        <p 
                          className="text-sm mb-3"
                          style={{ color: colors.editorialNude }}
                        >
                          {project.category}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs" style={{ color: colors.softBone }}>
                        <Eye className="w-3 h-3" />
                        View Story
                      </div>
                    </div>

                    {/* Category Badge */}
                    {project.industry && (
                      <span 
                        className="absolute top-4 left-4 px-2 py-1 rounded text-xs uppercase"
                        style={{
                          background: "rgba(5,5,9,0.7)",
                          backdropFilter: "blur(8px)",
                          color: colors.softBone,
                          border: "1px solid rgba(245,243,238,0.2)",
                        }}
                      >
                        {project.industry}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== SECTION 7: SERVICES (PREMIUM) ==================== */}
          {isPremium && userServices.length > 0 && (
            <section className="mb-20">
              <div className="text-center mb-10">
                <h2 
                  className="section-heading text-2xl font-semibold mb-2"
                  style={{ color: colors.white }}
                >
                  Services & Rates
                </h2>
                <div 
                  className="w-16 h-0.5 mx-auto"
                  style={{ background: `linear-gradient(90deg, transparent, ${colors.blushPink}, transparent)` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userServices.map((service, index) => (
                  <div 
                    key={service.id}
                    className="fashion-card p-6 rounded-xl transition-all duration-300"
                    style={{
                      borderTop: `3px solid ${getAccentColor(index)}`,
                      animation: `fashionFadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Service Image */}
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-14 h-14 rounded-lg object-cover mb-4"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                        style={{ background: `${getAccentColor(index)}20` }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: getAccentColor(index) }} />
                      </div>
                    )}

                    <h3 
                      className="font-semibold mb-1"
                      style={{ color: colors.white, fontSize: "18px" }}
                    >
                      {service.title}
                    </h3>
                    
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs uppercase mb-3"
                      style={{
                        background: `${getAccentColor(index)}20`,
                        color: getAccentColor(index),
                      }}
                    >
                      {service.category}
                    </span>

                    {/* Pricing */}
                    <div className="mb-3">
                      {service.priceInr && (
                        <span 
                          className="text-xl font-bold"
                          style={{ color: colors.champagneGlow }}
                        >
                          ₹{service.priceInr.toLocaleString()}
                          {service.isHourly && (
                            <span className="text-sm font-normal" style={{ color: colors.inkGrey }}>/hr</span>
                          )}
                        </span>
                      )}
                      {service.priceUsd && (
                        <span className="text-sm ml-2" style={{ color: colors.inkGrey }}>
                          (${service.priceUsd}{service.isHourly ? '/hr' : ''})
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p 
                        className="text-sm mb-4"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {service.description}
                      </p>
                    )}

                    {/* Features */}
                    {(() => {
                      const features = toStringArray(service.features);
                      return features.length > 0 ? (
                        <ul className="space-y-2 mb-4">
                          {features.slice(0, 5).map((feature, i) => (
                            <li 
                              key={i} 
                              className="flex items-center gap-2 text-sm"
                              style={{ color: "rgba(255,255,255,0.8)" }}
                            >
                              <Check className="w-4 h-4 shrink-0" style={{ color: colors.champagneGlow }} />
                              <span>{String(feature)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null;
                    })()}

                    {/* CTA */}
                    <button 
                      onClick={() => setIsMentorshipDialogOpen(true)}
                      className="w-full py-2.5 rounded-full uppercase font-medium text-sm transition-all duration-200 cta-primary"
                      style={{
                        color: colors.noirBlack,
                        letterSpacing: "0.05em",
                      }}
                      data-testid={`button-enquire-${service.id}`}
                    >
                      Enquire
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Project Detail Modal */}
        <Dialog open={!!selectedProjectId} onOpenChange={() => setSelectedProjectId(null)}>
          <DialogContent 
            className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
            style={{
              background: colors.noirBlack,
              border: `1px solid rgba(245,243,238,0.18)`,
            }}
          >
            {selectedProject && (
              <div>
                {/* Hero Image */}
                <div className="relative w-full aspect-video">
                  {selectedProject.thumbnailUrl || (selectedProject.mediaUrls && selectedProject.mediaUrls[0]) ? (
                    <img 
                      src={selectedProject.thumbnailUrl || selectedProject.mediaUrls?.[0]}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.runwayCharcoal }}
                    >
                      <Camera className="w-16 h-16" style={{ color: colors.softBone, opacity: 0.3 }} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 
                    className="section-heading text-2xl font-semibold mb-2"
                    style={{ color: colors.white }}
                  >
                    {selectedProject.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProject.category && (
                      <span 
                        className="px-2 py-1 rounded text-xs uppercase"
                        style={{
                          background: `${colors.blushPink}20`,
                          color: colors.blushPink,
                        }}
                      >
                        {selectedProject.category}
                      </span>
                    )}
                    {selectedProject.industry && (
                      <span 
                        className="px-2 py-1 rounded text-xs uppercase"
                        style={{
                          background: `${colors.editorialNude}20`,
                          color: colors.editorialNude,
                        }}
                      >
                        {selectedProject.industry}
                      </span>
                    )}
                  </div>

                  {selectedProject.description && (
                    <p 
                      className="body-text mb-4"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {selectedProject.description}
                    </p>
                  )}

                  {selectedProject.projectUrl && (
                    <a
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm"
                      style={{ color: colors.editorialNude }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Project
                    </a>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Mentorship/Booking Dialog */}
        <Dialog open={isMentorshipDialogOpen} onOpenChange={setIsMentorshipDialogOpen}>
          <DialogContent 
            className="max-w-md"
            style={{
              background: colors.noirBlack,
              border: `1px solid rgba(245,243,238,0.18)`,
            }}
          >
            <DialogHeader>
              <DialogTitle 
                className="section-heading text-xl"
                style={{ color: colors.white }}
              >
                Get in Touch
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p 
                className="body-text mb-6"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Interested in working with {displayName}? Reach out directly to discuss availability and rates.
              </p>

              <div className="space-y-3">
                {user.email && (
                  <a 
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
                    style={{
                      border: "1px solid rgba(245,243,238,0.18)",
                    }}
                  >
                    <Mail className="w-5 h-5" style={{ color: colors.blushPink }} />
                    <span style={{ color: colors.white }}>{user.email}</span>
                  </a>
                )}

                {user.instagramHandle && (
                  <a 
                    href={`https://instagram.com/${user.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
                    style={{
                      border: "1px solid rgba(245,243,238,0.18)",
                    }}
                  >
                    <Instagram className="w-5 h-5" style={{ color: colors.blushPink }} />
                    <span style={{ color: colors.white }}>@{user.instagramHandle.replace('@', '')}</span>
                  </a>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
