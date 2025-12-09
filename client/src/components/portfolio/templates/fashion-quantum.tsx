import { useState, useEffect } from "react";
import { 
  MapPin, Mail, Eye, Calendar, Check, Star, Camera, Scissors, 
  Target, Sparkles, ExternalLink, Heart, Award, Building2, 
  GraduationCap, Briefcase, User, X, ChevronRight, Instagram,
  Globe, Phone
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Fashion Quantum Color Palette
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

// Helper to safely convert to string array
const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(v => String(v)).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v)).filter(Boolean);
      }
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// Film grain noise SVG for texture overlay
const filmGrainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#noise)" opacity="0.07" /></svg>`;
const filmGrainDataUrl = `url("data:image/svg+xml,${encodeURIComponent(filmGrainSvg)}")`;

// CSS Keyframes as inline styles
const keyframesStyle = `
  @keyframes softSweep {
    0% { transform: translateX(-120%); opacity: 0; }
    10% { opacity: 0.25; }
    50% { transform: translateX(0%); opacity: 0.35; }
    90% { opacity: 0; }
    100% { transform: translateX(120%); opacity: 0; }
  }
  
  @keyframes softGlow {
    0% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
    50% { box-shadow: 0 28px 72px rgba(0,0,0,0.7); }
    100% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
  }
  
  @keyframes underlineShimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  @keyframes fashionFadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spotlightPulse {
    0% { opacity: 0.15; }
    50% { opacity: 0.25; }
    100% { opacity: 0.15; }
  }
`;

interface FashionQuantumProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    email: string | null;
    photoURL: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    jobLevel: string | null;
    tagline: string | null;
    visionStatement: string | null;
    missionStatement: string | null;
    coreValues: string[] | string;
    uniqueValueProposition: string | null;
    brandName: string | null;
    primaryAudience: string[] | string;
    secondaryAudience: string[] | string;
  };
  userSkills?: Array<{
    id: number;
    skillName?: string;
    name?: string;
    proficiencyLevel?: string | number | null;
    category?: string | null;
    yearsOfExperience?: number | null;
  }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    employmentType?: string | null;
    isCurrent?: boolean;
    achievements?: string[] | string;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description?: string | null;
    projectUrl?: string | null;
    thumbnailUrl?: string | null;
    mediaUrls?: string[] | null;
    category?: string | null;
    industry?: string | null;
    startDate?: string | null;
  }>;
  userEducations?: Array<{
    id: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    startYear?: number | null;
    endYear?: number | null;
    description?: string | null;
    skills?: string[] | string;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    priceInr?: number | null;
    priceUsd?: number | null;
    isHourly?: boolean;
    features?: string[] | string;
    imageUrl?: string | null;
    isActive?: boolean;
  }>;
  currentUserId?: number;
  isPremium?: boolean;
}

export default function FashionQuantum({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  currentUserId,
  isPremium = false,
}: FashionQuantumProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);

  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => {
    const dateA = new Date(a.startDate || 0).getTime();
    const dateB = new Date(b.startDate || 0).getTime();
    return dateB - dateA;
  });

  // Sort educations by year
  const sortedEducations = [...userEducations].sort((a, b) => {
    const yearA = a.endYear || a.startYear || 0;
    const yearB = b.endYear || b.startYear || 0;
    return yearB - yearA;
  });

  const selectedProject = userProjects.find(p => p.id === selectedProjectId);

  // Format date helper
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Get proficiency level
  const getProficiencyLevel = (skill: any): number => {
    if (typeof skill.proficiencyLevel === 'number') return skill.proficiencyLevel;
    if (typeof skill.proficiencyLevel === 'string') {
      const map: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4, 'master': 5 };
      return map[skill.proficiencyLevel.toLowerCase()] || 3;
    }
    return 3;
  };

  // Fashion category chips
  const fashionCategories = userInfo.domain 
    ? userInfo.domain.split(',').map(s => s.trim()).filter(Boolean)
    : ['Fashion', 'Editorial'];

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      data-testid="fashion-quantum-portfolio"
    >
      <style>{keyframesStyle}</style>

      {/* Film Grain Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: filmGrainDataUrl,
          opacity: 0.08,
        }}
      />

      {/* Spotlight Effect */}
      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 20% 10%, rgba(253,243,217,0.18), transparent 60%)`,
          animation: 'spotlightPulse 8s ease-in-out infinite',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ==================== SECTION 1: HERO HEADER ==================== */}
        <section className="mb-16">
          <div 
            className="relative rounded-2xl overflow-hidden p-6 sm:p-10"
            style={{
              background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
              border: `1px solid rgba(245,243,238,0.18)`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              animation: 'softGlow 8s linear infinite',
            }}
            data-testid="hero-section"
          >
            {/* Left Edge Accent Bar */}
            <div 
              className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
              style={{
                background: `linear-gradient(180deg, ${colors.blushPink}, ${colors.champagneGlow})`,
              }}
            />

            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Hero Image Container */}
              <div className="relative w-64 sm:w-72 lg:w-80 flex-shrink-0">
                <div 
                  className="relative overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: '4/5',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* Image */}
                  {userInfo.photoURL ? (
                    <img 
                      src={userInfo.photoURL}
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                      data-testid="hero-image"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.runwayCharcoal }}
                    >
                      <User className="w-24 h-24" style={{ color: colors.softBone, opacity: 0.3 }} />
                    </div>
                  )}

                  {/* Dark gradient overlay at bottom */}
                  <div 
                    className="absolute inset-0"
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
                    className="absolute top-0 bottom-0 w-8 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(253,243,217,0.16), transparent)`,
                      animation: 'softSweep 7s ease-in-out infinite',
                      animationDelay: '2s',
                    }}
                  />
                </div>

                {/* Champagne Glow Behind Image */}
                <div 
                  className="absolute -inset-4 -z-10 rounded-2xl"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(253,243,217,0.12), transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Name */}
                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
                  style={{ 
                    color: colors.white,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                  data-testid="hero-name"
                >
                  {userInfo.name}
                </h1>

                {/* Underline Shimmer */}
                <div 
                  className="h-[2px] w-16 lg:w-20 mx-auto lg:mx-0 mb-4"
                  style={{
                    background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow}, ${colors.editorialNude})`,
                    backgroundSize: '200% 100%',
                    animation: 'underlineShimmer 3s linear infinite',
                  }}
                />

                {/* Title / Role */}
                {userInfo.title && (
                  <p 
                    className="text-xs sm:text-sm uppercase tracking-[0.18em] mb-6"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                    data-testid="hero-title"
                  >
                    {userInfo.title}
                  </p>
                )}

                {/* Tagline */}
                {userInfo.tagline && (
                  <p 
                    className="text-base sm:text-lg mb-6 max-w-md mx-auto lg:mx-0"
                    style={{ 
                      color: 'rgba(255,255,255,0.85)',
                      fontStyle: 'italic',
                    }}
                  >
                    "{userInfo.tagline}"
                  </p>
                )}

                {/* Fashion Tags */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                  {userInfo.location && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wide"
                      style={{
                        background: 'rgba(245,243,238,0.06)',
                        border: `1px solid rgba(245,243,238,0.35)`,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                      data-testid="tag-location"
                    >
                      <MapPin className="w-3 h-3" />
                      {userInfo.location}
                    </span>
                  )}
                  {fashionCategories.slice(0, 4).map((cat, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: i === 0 ? 'rgba(249,197,213,0.12)' : 'rgba(245,243,238,0.06)',
                        border: i === 0 ? `1px solid ${colors.blushPink}` : `1px solid rgba(245,243,238,0.35)`,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                      data-testid={`tag-category-${i}`}
                    >
                      {i === 0 && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: colors.blushPink }}
                        />
                      )}
                      {cat}
                    </span>
                  ))}
                  {userInfo.industry && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-wide"
                      style={{
                        background: 'rgba(245,243,238,0.06)',
                        border: `1px solid rgba(245,243,238,0.35)`,
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {userInfo.industry}
                    </span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <button
                    className="px-5 py-2.5 rounded-full text-xs uppercase font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                      color: colors.noirBlack,
                      boxShadow: '0 8px 24px rgba(249,197,213,0.25)',
                    }}
                    data-testid="cta-view-portfolio"
                  >
                    View Portfolio
                  </button>
                  <button
                    onClick={() => setIsMentorshipDialogOpen(true)}
                    className="px-5 py-2.5 rounded-full text-xs uppercase font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                    style={{
                      background: 'transparent',
                      border: `1px solid rgba(245,243,238,0.45)`,
                      color: 'rgba(255,255,255,0.9)',
                    }}
                    data-testid="cta-book-me"
                  >
                    Book Me
                  </button>
                  {userInfo.email && (
                    <a
                      href={`mailto:${userInfo.email}`}
                      className="px-5 py-2.5 rounded-full text-xs uppercase font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                      style={{
                        background: 'transparent',
                        border: `1px solid rgba(245,243,238,0.45)`,
                        color: 'rgba(255,255,255,0.9)',
                      }}
                      data-testid="cta-contact"
                    >
                      <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: ABOUT / SNAPSHOT ==================== */}
        {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement || userInfo.uniqueValueProposition) && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out' }}
            data-testid="about-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              About
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Story */}
              <div className="space-y-6">
                {userInfo.aboutMe && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(17,17,24,0.6)',
                      border: `1px solid rgba(245,243,238,0.12)`,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-3"
                      style={{ 
                        color: colors.white,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      My Story
                    </h3>
                    <div 
                      className="h-[1px] w-10 mb-4"
                      style={{ background: colors.warmSand }}
                    />
                    <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                      {userInfo.aboutMe}
                    </p>
                  </div>
                )}

                {/* Vision & Mission */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userInfo.visionStatement && (
                    <div 
                      className="p-5 rounded-lg"
                      style={{
                        background: 'rgba(17,17,24,0.5)',
                        borderLeft: `3px solid ${colors.editorialNude}`,
                      }}
                    >
                      <h4 
                        className="text-xs uppercase tracking-widest mb-2"
                        style={{ color: colors.editorialNude }}
                      >
                        Vision
                      </h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {userInfo.visionStatement}
                      </p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div 
                      className="p-5 rounded-lg"
                      style={{
                        background: 'rgba(17,17,24,0.5)',
                        borderLeft: `3px solid ${colors.blushPink}`,
                      }}
                    >
                      <h4 
                        className="text-xs uppercase tracking-widest mb-2"
                        style={{ color: colors.blushPink }}
                      >
                        Mission
                      </h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {userInfo.missionStatement}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Brand & Positioning */}
              <div className="space-y-6">
                {userInfo.uniqueValueProposition && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(17,17,24,0.6)',
                      border: `1px solid rgba(245,243,238,0.12)`,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-3"
                      style={{ 
                        color: colors.white,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      What Sets Me Apart
                    </h3>
                    <p 
                      className="text-lg italic"
                      style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      "{userInfo.uniqueValueProposition}"
                    </p>
                  </div>
                )}

                {/* Core Values */}
                {userInfo.coreValues && toStringArray(userInfo.coreValues).length > 0 && (
                  <div>
                    <h4 
                      className="text-xs uppercase tracking-widest mb-3"
                      style={{ color: colors.warmSand }}
                    >
                      Core Values
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {toStringArray(userInfo.coreValues).map((value, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1.5 rounded-full text-xs"
                          style={{
                            background: i % 2 === 0 
                              ? `rgba(249,197,213,0.15)` 
                              : `rgba(217,185,155,0.15)`,
                            border: `1px solid ${i % 2 === 0 ? colors.blushPink : colors.editorialNude}`,
                            color: 'rgba(255,255,255,0.85)',
                          }}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audience */}
                {userInfo.primaryAudience && toStringArray(userInfo.primaryAudience).length > 0 && (
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      background: 'rgba(17,17,24,0.4)',
                      borderTop: `1px solid rgba(245,243,238,0.08)`,
                    }}
                  >
                    <h4 
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: colors.inkGrey }}
                    >
                      Ideal For
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                      {toStringArray(userInfo.primaryAudience).join(', ')}
                    </p>
                  </div>
                )}

                {/* Looking For */}
                {userInfo.lookingFor && (
                  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'rgba(17,17,24,0.4)' }}>
                    <Target className="w-5 h-5 flex-shrink-0" style={{ color: colors.blushPink }} />
                    <div>
                      <span className="text-xs uppercase tracking-widest" style={{ color: colors.inkGrey }}>
                        Looking For
                      </span>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                        {userInfo.lookingFor}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SECTION 3: SKILLS / SPECIALTIES ==================== */}
        {userSkills.length > 0 && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out 0.1s both' }}
            data-testid="skills-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Specialties
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {userSkills.map((skill, index) => {
                const level = getProficiencyLevel(skill);
                const skillName = skill.skillName || skill.name || '';
                return (
                  <div 
                    key={skill.id}
                    className="p-4 rounded-xl transition-all duration-200 hover:-translate-y-1 group"
                    style={{
                      background: 'rgba(17,17,24,0.6)',
                      borderTop: `2px solid ${index % 3 === 0 ? colors.blushPink : index % 3 === 1 ? colors.editorialNude : colors.champagneGlow}`,
                      border: `1px solid rgba(245,243,238,0.1)`,
                      animation: `fashionFadeIn 0.4s ease-out ${index * 0.05}s both`,
                    }}
                    data-testid={`skill-card-${skill.id}`}
                  >
                    <h4 
                      className="font-medium text-sm mb-2"
                      style={{ color: colors.white }}
                    >
                      {skillName}
                    </h4>
                    {skill.category && (
                      <p 
                        className="text-xs uppercase tracking-wide mb-3"
                        style={{ color: colors.inkGrey }}
                      >
                        {skill.category}
                      </p>
                    )}
                    {/* Dot rating system */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(dot => (
                        <span 
                          key={dot}
                          className="w-2 h-2 rounded-full transition-all duration-200"
                          style={{
                            backgroundColor: dot <= level 
                              ? colors.champagneGlow 
                              : 'rgba(245,243,238,0.15)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 4: EXPERIENCE (BRANDS & CLIENTS) ==================== */}
        {sortedExperiences.length > 0 && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out 0.2s both' }}
            data-testid="experience-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Experience
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow})` }}
            />

            <div className="relative pl-8 sm:pl-12">
              {/* Timeline Line */}
              <div 
                className="absolute left-3 sm:left-5 top-0 bottom-0 w-[1px]"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.blushPink}, ${colors.editorialNude}, transparent)` 
                }}
              />

              <div className="space-y-6">
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id}
                    className="relative pl-6 sm:pl-8"
                    style={{ animation: `fashionFadeIn 0.4s ease-out ${index * 0.1}s both` }}
                    data-testid={`experience-${exp.id}`}
                  >
                    {/* Timeline Dot */}
                    <div 
                      className="absolute -left-[5px] sm:-left-[7px] top-2 w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: exp.isCurrent ? colors.blushPink : colors.editorialNude,
                        boxShadow: exp.isCurrent ? `0 0 12px ${colors.blushPink}` : 'none',
                      }}
                    />

                    {/* Card */}
                    <div 
                      className="p-5 rounded-xl transition-all duration-200 hover:translate-x-1"
                      style={{
                        background: 'rgba(17,17,24,0.6)',
                        border: `1px solid rgba(245,243,238,0.1)`,
                        borderLeft: exp.isCurrent ? `3px solid ${colors.blushPink}` : `1px solid rgba(245,243,238,0.1)`,
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 
                            className="text-lg font-semibold"
                            style={{ 
                              color: colors.white,
                              fontFamily: "'Playfair Display', Georgia, serif",
                            }}
                          >
                            {exp.title}
                          </h3>
                          <p className="text-sm" style={{ color: colors.warmSand }}>
                            {exp.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <span 
                            className="text-xs uppercase tracking-wide"
                            style={{ color: colors.inkGrey }}
                          >
                            {formatDate(exp.startDate)} – {exp.isCurrent || !exp.endDate ? 'Present' : formatDate(exp.endDate)}
                          </span>
                          {exp.location && (
                            <p className="text-xs flex items-center gap-1 justify-end mt-1" style={{ color: colors.inkGrey }}>
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </p>
                          )}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {exp.description}
                        </p>
                      )}
                      {exp.employmentType && (
                        <span 
                          className="inline-block mt-3 px-2 py-0.5 rounded text-xs uppercase"
                          style={{
                            background: 'rgba(245,243,238,0.08)',
                            color: colors.inkGrey,
                          }}
                        >
                          {exp.employmentType}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SECTION 5: EDUCATION ==================== */}
        {sortedEducations.length > 0 && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out 0.3s both' }}
            data-testid="education-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Training & Education
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.warmSand}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedEducations.map((edu, index) => (
                <div 
                  key={edu.id}
                  className="p-5 rounded-xl transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'rgba(17,17,24,0.5)',
                    border: `1px solid rgba(245,243,238,0.1)`,
                    animation: `fashionFadeIn 0.4s ease-out ${index * 0.1}s both`,
                  }}
                  data-testid={`education-${edu.id}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 
                        className="font-semibold flex items-center gap-2"
                        style={{ color: colors.white }}
                      >
                        <GraduationCap className="w-4 h-4" style={{ color: colors.editorialNude }} />
                        {edu.institution}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: colors.warmSand }}>
                        {edu.degree}
                        {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                      </p>
                    </div>
                    <span 
                      className="text-xs uppercase tracking-wide flex-shrink-0"
                      style={{ color: colors.inkGrey }}
                    >
                      {edu.startYear || ''}{edu.endYear ? ` – ${edu.endYear}` : ''}
                    </span>
                  </div>
                  {edu.skills && toStringArray(edu.skills).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {toStringArray(edu.skills).slice(0, 4).map((skill, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: 'rgba(245,243,238,0.08)',
                            color: 'rgba(255,255,255,0.7)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== SECTION 6: PROJECTS / LOOKBOOK ==================== */}
        {userProjects.length > 0 && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out 0.4s both' }}
            data-testid="projects-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Portfolio
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-2"
                  style={{
                    aspectRatio: '4/5',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                    animation: `fashionFadeIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                  onClick={() => setSelectedProjectId(project.id)}
                  data-testid={`project-${project.id}`}
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

                  {/* Hover Overlay */}
                  <div 
                    className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to top, rgba(5,5,9,0.9), rgba(5,5,9,0.5) 50%, transparent)',
                    }}
                  >
                    <h3 
                      className="text-lg font-semibold mb-1"
                      style={{ 
                        color: colors.white,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      {project.title}
                    </h3>
                    {project.category && (
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: colors.warmSand }}>
                        {project.category}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: colors.blushPink }} />
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  {project.category && (
                    <span 
                      className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] uppercase tracking-wide"
                      style={{
                        background: 'rgba(5,5,9,0.7)',
                        border: `1px solid rgba(245,243,238,0.2)`,
                        color: colors.softBone,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {project.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== SECTION 7: SERVICES (PREMIUM) ==================== */}
        {isPremium && userServices.length > 0 && (
          <section 
            className="mb-16"
            style={{ animation: 'fashionFadeIn 0.6s ease-out 0.5s both' }}
            data-testid="services-section"
          >
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Services & Rates
            </h2>
            <div 
              className="h-[2px] w-12 mx-auto mb-10"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.editorialNude})` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.filter(s => s.isActive !== false).map((service, index) => (
                <div 
                  key={service.id}
                  className="p-6 rounded-xl transition-all duration-300 hover:-translate-y-2"
                  style={{
                    background: 'rgba(17,17,24,0.7)',
                    border: `1px solid rgba(245,243,238,0.15)`,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    animation: `fashionFadeIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                  data-testid={`service-${service.id}`}
                >
                  {/* Service Icon/Image */}
                  <div className="mb-4">
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ background: `rgba(249,197,213,0.15)` }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: colors.blushPink }} />
                      </div>
                    )}
                  </div>

                  <h3 
                    className="text-xl font-bold mb-1"
                    style={{ 
                      color: colors.white,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {service.title}
                  </h3>
                  {service.category && (
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs uppercase tracking-wide mb-3"
                      style={{
                        background: 'rgba(249,197,213,0.15)',
                        color: colors.blushPink,
                      }}
                    >
                      {service.category}
                    </span>
                  )}

                  {/* Pricing */}
                  <div className="mb-4">
                    {service.priceInr && (
                      <span 
                        className="text-2xl font-bold"
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
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {service.description}
                    </p>
                  )}

                  {/* Features */}
                  {(() => {
                    const features = toStringArray(service.features);
                    return features.length > 0 ? (
                      <ul className="space-y-2 mb-5">
                        {features.slice(0, 5).map((feature, i) => (
                          <li 
                            key={i} 
                            className="flex items-center gap-2 text-sm"
                            style={{ color: 'rgba(255,255,255,0.8)' }}
                          >
                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: colors.blushPink }} />
                            <span>{String(feature)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}

                  {/* CTA */}
                  <button 
                    onClick={() => setIsMentorshipDialogOpen(true)}
                    className="w-full py-3 rounded-full text-xs uppercase font-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                      color: colors.noirBlack,
                      boxShadow: '0 8px 24px rgba(249,197,213,0.2)',
                    }}
                    data-testid={`service-cta-${service.id}`}
                  >
                    Enquire Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer 
          className="text-center py-8 mt-8"
          style={{ borderTop: `1px solid rgba(245,243,238,0.08)` }}
        >
          <p className="text-sm" style={{ color: colors.inkGrey }}>
            Portfolio powered by <span style={{ color: colors.blushPink }}>Brandentifier</span>
          </p>
        </footer>
      </div>

      {/* ==================== PROJECT DETAIL MODAL ==================== */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{
            background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
            border: `1px solid rgba(245,243,238,0.15)`,
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl"
                  style={{ 
                    color: colors.white,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              
              {/* Hero Image */}
              {(selectedProject.thumbnailUrl || (selectedProject.mediaUrls && selectedProject.mediaUrls[0])) && (
                <div className="relative aspect-video rounded-lg overflow-hidden my-4">
                  <img 
                    src={selectedProject.thumbnailUrl || selectedProject.mediaUrls?.[0]}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                {selectedProject.category && (
                  <div>
                    <span className="text-xs uppercase tracking-widest" style={{ color: colors.inkGrey }}>
                      Category
                    </span>
                    <p style={{ color: colors.warmSand }}>{selectedProject.category}</p>
                  </div>
                )}
                {selectedProject.industry && (
                  <div>
                    <span className="text-xs uppercase tracking-widest" style={{ color: colors.inkGrey }}>
                      Industry
                    </span>
                    <p style={{ color: colors.warmSand }}>{selectedProject.industry}</p>
                  </div>
                )}
                {selectedProject.description && (
                  <div>
                    <span className="text-xs uppercase tracking-widest" style={{ color: colors.inkGrey }}>
                      About
                    </span>
                    <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                      {selectedProject.description}
                    </p>
                  </div>
                )}
                {selectedProject.projectUrl && (
                  <a
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                      color: colors.noirBlack,
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Project
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== MENTORSHIP/BOOKING DIALOG ==================== */}
      <Dialog open={isMentorshipDialogOpen} onOpenChange={setIsMentorshipDialogOpen}>
        <DialogContent 
          className="max-w-md"
          style={{
            background: `linear-gradient(135deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
            border: `1px solid rgba(245,243,238,0.15)`,
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-xl"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Get in Touch
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>
              Interested in working with {userInfo.name}? Reach out directly:
            </p>
            
            {userInfo.email && (
              <a
                href={`mailto:${userInfo.email}`}
                className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:bg-white/5"
                style={{ border: `1px solid rgba(245,243,238,0.15)` }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(249,197,213,0.15)' }}
                >
                  <Mail className="w-5 h-5" style={{ color: colors.blushPink }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: colors.inkGrey }}>Email</p>
                  <p style={{ color: colors.white }}>{userInfo.email}</p>
                </div>
              </a>
            )}
            
            <Button
              onClick={() => setIsMentorshipDialogOpen(false)}
              className="w-full"
              style={{
                background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                color: colors.noirBlack,
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
