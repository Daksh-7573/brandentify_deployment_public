import { useState, useEffect, useRef } from "react";
import { 
  MapPin, Eye, Calendar, Check, Star, Camera, Scissors, 
  Target, Sparkles, ExternalLink, Heart, Award, Building2, 
  GraduationCap, Briefcase, User, X, ChevronRight, Instagram,
  Globe, Phone, Download, Play, Pause, ArrowRight, Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PortfolioCtaButtons from "../portfolio-cta-buttons";

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

const filmGrainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#noise)" opacity="0.07" /></svg>`;
const filmGrainDataUrl = `url("data:image/svg+xml,${encodeURIComponent(filmGrainSvg)}")`;

const keyframesStyle = `
  @keyframes softSweep {
    0% { transform: translateX(-120%); opacity: 0; }
    10% { opacity: 0.3; }
    50% { transform: translateX(0%); opacity: 0.4; }
    90% { opacity: 0; }
    100% { transform: translateX(120%); opacity: 0; }
  }
  
  @keyframes softGlow {
    0% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
    50% { box-shadow: 0 32px 80px rgba(0,0,0,0.75); }
    100% { box-shadow: 0 24px 60px rgba(0,0,0,0.55); }
  }
  
  @keyframes underlineShimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  
  @keyframes fashionFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spotlightPulse {
    0% { opacity: 0.12; }
    50% { opacity: 0.22; }
    100% { opacity: 0.12; }
  }
  
  @keyframes pingCurrent {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
  }
  
  @keyframes floatIn {
    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  @keyframes uvpGlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes meterFill {
    from { width: 0%; }
    to { width: var(--fill-width); }
  }
  
  @keyframes cardLift {
    0% { transform: translateY(0) scale(1); }
    100% { transform: translateY(-8px) scale(1.02); }
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

const CircularMeter = ({ value, max = 5, size = 48, color = colors.blushPink }: { value: number; max?: number; size?: number; color?: string }) => {
  const percentage = Math.round((value / max) * 100);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(245,243,238,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-medium" style={{ color: colors.white }}>{percentage}%</span>
      </div>
    </div>
  );
};

const LinearMeter = ({ value, max = 5, color = colors.blushPink }: { value: number; max?: number; color?: string }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,243,238,0.1)' }}>
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${colors.champagneGlow})`,
        }}
      />
    </div>
  );
};

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sortedExperiences = [...userExperiences].sort((a, b) => {
    const dateA = new Date(a.startDate || 0).getTime();
    const dateB = new Date(b.startDate || 0).getTime();
    return dateB - dateA;
  });

  const sortedEducations = [...userEducations].sort((a, b) => {
    const yearA = a.endYear || a.startYear || 0;
    const yearB = b.endYear || b.startYear || 0;
    return yearB - yearA;
  });

  const selectedProject = userProjects.find(p => p.id === selectedProjectId);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getProficiencyLevel = (skill: any): number => {
    if (typeof skill.proficiencyLevel === 'number') return skill.proficiencyLevel;
    if (typeof skill.proficiencyLevel === 'string') {
      const map: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4, 'master': 5 };
      return map[skill.proficiencyLevel.toLowerCase()] || 3;
    }
    return 3;
  };

  const fashionCategories = userInfo.domain 
    ? userInfo.domain.split(',').map(s => s.trim()).filter(Boolean)
    : ['Fashion', 'Editorial'];

  const scrollToProjects = () => {
    document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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

      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: filmGrainDataUrl,
          opacity: 0.06,
        }}
      />

      <div 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 20% 10%, rgba(253,243,217,0.15), transparent 55%)`,
          animation: 'spotlightPulse 8s ease-in-out infinite',
        }}
      />

      <div 
        className="fixed bottom-0 right-0 w-1/2 h-1/2 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at 80% 90%, rgba(249,197,213,0.08), transparent 50%)`,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        <section className="mb-20" ref={heroRef}>
          <div 
            className="relative rounded-3xl overflow-hidden p-6 sm:p-8 lg:p-12"
            style={{
              background: `linear-gradient(145deg, rgba(17,17,24,0.85), rgba(5,5,9,0.95))`,
              border: `1px solid rgba(245,243,238,0.12)`,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              animation: 'softGlow 10s linear infinite',
            }}
            data-testid="hero-section"
          >
            <div 
              className="absolute left-0 top-8 bottom-8 w-1 rounded-full"
              style={{
                background: `linear-gradient(180deg, ${colors.blushPink}, ${colors.champagneGlow}, ${colors.editorialNude})`,
              }}
            />

            <div 
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, rgba(249,197,213,0.12), transparent 70%)`,
                filter: 'blur(40px)',
              }}
            />

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start">
              <div 
                className="relative w-64 sm:w-72 lg:w-80 flex-shrink-0"
                style={{
                  transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div 
                  className="relative overflow-hidden rounded-2xl group"
                  style={{
                    aspectRatio: '4/5',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
                  }}
                >
                  {userInfo.photoURL ? (
                    <img 
                      src={userInfo.photoURL}
                      alt={userInfo.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      data-testid="hero-image"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: colors.runwayCharcoal }}
                    >
                      <User className="w-28 h-28" style={{ color: colors.softBone, opacity: 0.2 }} />
                    </div>
                  )}

                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(5,5,9,0.6), transparent 50%)',
                    }}
                  />

                  <div 
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      border: `1px solid rgba(245,243,238,0.2)`,
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)',
                    }}
                  />

                  <div 
                    className="absolute top-0 bottom-0 w-12 pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(253,243,217,0.2), transparent)`,
                      animation: 'softSweep 8s ease-in-out infinite',
                    }}
                  />
                </div>

                <div 
                  className="absolute -inset-6 -z-10 rounded-3xl"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(253,243,217,0.1), transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />

                <div 
                  className="absolute -bottom-3 -right-3 w-20 h-20 rounded-2xl -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${colors.blushPink}20, ${colors.champagneGlow}20)`,
                    transform: `translate3d(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px, 0)`,
                    transition: 'transform 0.3s ease-out',
                  }}
                />
              </div>

              <div className="flex-1 text-center lg:text-left">
                <h1 
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3"
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

                <div 
                  className="h-[2px] w-20 lg:w-24 mx-auto lg:mx-0 mb-5"
                  style={{
                    background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow}, ${colors.blushPink}, ${colors.editorialNude})`,
                    backgroundSize: '200% 100%',
                    animation: 'underlineShimmer 4s linear infinite',
                  }}
                />

                {userInfo.title && (
                  <p 
                    className="text-xs sm:text-sm uppercase tracking-[0.2em] mb-5"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    data-testid="hero-title"
                  >
                    {userInfo.title}
                  </p>
                )}

                {userInfo.tagline && (
                  <p 
                    className="text-lg sm:text-xl lg:text-2xl mb-7 max-w-lg mx-auto lg:mx-0"
                    style={{ 
                      color: 'rgba(255,255,255,0.85)',
                      fontStyle: 'italic',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      lineHeight: 1.4,
                    }}
                  >
                    "{userInfo.tagline}"
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                  {userInfo.location && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      style={{
                        background: 'rgba(245,243,238,0.05)',
                        border: `1px solid rgba(245,243,238,0.25)`,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                      data-testid="tag-location"
                    >
                      <MapPin className="w-3.5 h-3.5" style={{ color: colors.blushPink }} />
                      {userInfo.location}
                    </span>
                  )}
                  {fashionCategories.slice(0, 4).map((cat, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: i === 0 ? 'rgba(249,197,213,0.12)' : 'rgba(245,243,238,0.05)',
                        border: i === 0 ? `1px solid ${colors.blushPink}` : `1px solid rgba(245,243,238,0.25)`,
                        color: 'rgba(255,255,255,0.85)',
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
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-wider"
                      style={{
                        background: 'rgba(245,243,238,0.05)',
                        border: `1px solid rgba(245,243,238,0.25)`,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {userInfo.industry}
                    </span>
                  )}
                </div>

                {userInfo.lookingFor && (
                  <div 
                    className="flex items-center gap-3 mb-6 px-4 py-2.5 rounded-full w-fit mx-auto lg:mx-0"
                    style={{ 
                      background: 'rgba(249,197,213,0.12)',
                      border: `1px solid ${colors.blushPink}40`,
                    }}
                  >
                    <Target className="w-4 h-4" style={{ color: colors.blushPink }} />
                    <span className="text-xs uppercase tracking-wider" style={{ color: colors.inkGrey }}>Looking For:</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{userInfo.lookingFor}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <PortfolioCtaButtons 
                    variant="fashion-quantum" 
                    userId={userInfo.id} 
                    userName={userInfo.name} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement || userInfo.uniqueValueProposition) && (
          <section 
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out' }}
            data-testid="about-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              About
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-12"
              style={{ background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                {userInfo.aboutMe && (
                  <div 
                    className="p-6 sm:p-8 rounded-2xl"
                    style={{
                      background: 'rgba(17,17,24,0.6)',
                      border: `1px solid rgba(245,243,238,0.1)`,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <h3 
                      className="text-xl font-semibold mb-4"
                      style={{ 
                        color: colors.white,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      My Story
                    </h3>
                    <div 
                      className="h-[1px] w-12 mb-5"
                      style={{ background: colors.warmSand }}
                    />
                    <p className="leading-relaxed text-[15px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {userInfo.aboutMe}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userInfo.visionStatement && (
                    <div 
                      className="p-5 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'rgba(17,17,24,0.5)',
                        borderLeft: `4px solid ${colors.warmSand}`,
                      }}
                    >
                      <div 
                        className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10"
                        style={{
                          background: `radial-gradient(circle, ${colors.warmSand}15, transparent 70%)`,
                        }}
                      />
                      <h4 
                        className="text-[11px] uppercase tracking-[0.15em] mb-2 flex items-center gap-2"
                        style={{ color: colors.warmSand }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Vision
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {userInfo.visionStatement}
                      </p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div 
                      className="p-5 rounded-xl relative overflow-hidden"
                      style={{
                        background: 'rgba(17,17,24,0.5)',
                        borderLeft: `4px solid ${colors.blushPink}`,
                      }}
                    >
                      <div 
                        className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10"
                        style={{
                          background: `radial-gradient(circle, ${colors.blushPink}15, transparent 70%)`,
                        }}
                      />
                      <h4 
                        className="text-[11px] uppercase tracking-[0.15em] mb-2 flex items-center gap-2"
                        style={{ color: colors.blushPink }}
                      >
                        <Target className="w-3.5 h-3.5" />
                        Mission
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                        {userInfo.missionStatement}
                      </p>
                    </div>
                  )}

                  {userInfo.coreValues && toStringArray(userInfo.coreValues).length > 0 && (
                    <div className="mt-4">
                      <h4 
                        className="text-xs uppercase tracking-[0.15em] mb-3"
                        style={{ color: colors.warmSand }}
                      >
                        Core Values
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {toStringArray(userInfo.coreValues).map((value, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1.5 rounded-full text-xs uppercase tracking-wide transition-all duration-300 hover:translate-x-1"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${colors.softBone}`,
                              color: 'rgba(255,255,255,0.9)',
                            }}
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {userInfo.uniqueValueProposition && (
                  <div 
                    className="p-6 rounded-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, rgba(253,243,217,0.08), rgba(249,197,213,0.05))`,
                      border: `1px solid rgba(253,243,217,0.2)`,
                    }}
                  >
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(90deg, transparent, rgba(253,243,217,0.1), transparent)`,
                        backgroundSize: '200% 100%',
                        animation: 'uvpGlow 6s ease-in-out infinite',
                      }}
                    />
                    <h3 
                      className="text-xs uppercase tracking-[0.15em] mb-3 flex items-center gap-2 relative z-10"
                      style={{ color: colors.champagneGlow }}
                    >
                      <Sparkles className="w-4 h-4" />
                      What Sets Me Apart
                    </h3>
                    <p 
                      className="text-lg lg:text-xl italic relative z-10"
                      style={{ 
                        color: colors.champagneGlow,
                        fontFamily: "'Playfair Display', Georgia, serif",
                        lineHeight: 1.5,
                      }}
                    >
                      "{userInfo.uniqueValueProposition}"
                    </p>
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {userSkills.length > 0 && (
          <section 
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out 0.1s both' }}
            data-testid="skills-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Specialties
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-12"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.champagneGlow})` }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {userSkills.map((skill, index) => {
                const level = getProficiencyLevel(skill);
                const skillName = skill.skillName || skill.name || '';
                const accentColors = [colors.blushPink, colors.editorialNude, colors.champagneGlow, colors.warmSand];
                const accent = accentColors[index % accentColors.length];
                
                return (
                  <div 
                    key={skill.id}
                    className="p-5 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid rgba(245,243,238,0.08)`,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      animation: `floatIn 0.5s ease-out ${index * 0.05}s both`,
                    }}
                    data-testid={`skill-card-${skill.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 
                        className="font-medium text-sm"
                        style={{ color: colors.white }}
                      >
                        {skillName}
                      </h4>
                      <CircularMeter value={level} color={accent} size={40} />
                    </div>
                    
                    {skill.category && (
                      <p 
                        className="text-[10px] uppercase tracking-widest mb-3"
                        style={{ color: colors.inkGrey }}
                      >
                        {skill.category}
                      </p>
                    )}
                    
                    <LinearMeter value={level} color={accent} />
                    
                    {skill.yearsOfExperience && (
                      <p className="text-[11px] mt-3" style={{ color: colors.inkGrey }}>
                        {skill.yearsOfExperience}+ years
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {sortedExperiences.length > 0 && (
          <section 
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out 0.2s both' }}
            data-testid="experience-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Experience
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-12"
              style={{ background: `linear-gradient(90deg, ${colors.editorialNude}, ${colors.champagneGlow})` }}
            />

            <div className="relative">
              <div 
                className="absolute left-4 sm:left-6 top-0 bottom-0 w-[2px]"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.blushPink}, ${colors.editorialNude} 50%, transparent)`,
                }}
              />

              <div className="space-y-8">
                {sortedExperiences.map((exp, index) => {
                  const isCurrent = exp.isCurrent || !exp.endDate;
                  return (
                    <div 
                      key={exp.id}
                      className="relative pl-12 sm:pl-16"
                      style={{ animation: `floatIn 0.5s ease-out ${index * 0.1}s both` }}
                      data-testid={`experience-${exp.id}`}
                    >
                      <div 
                        className="absolute left-[10px] sm:left-[18px] top-6 w-4 h-4 rounded-full z-10"
                        style={{
                          backgroundColor: isCurrent ? colors.blushPink : colors.editorialNude,
                          boxShadow: isCurrent ? `0 0 20px ${colors.blushPink}` : 'none',
                          animation: isCurrent ? 'pingCurrent 2s ease-in-out infinite' : 'none',
                        }}
                      />

                      {isCurrent && (
                        <div 
                          className="absolute left-[14px] sm:left-[22px] top-[28px] w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: colors.champagneGlow,
                          }}
                        />
                      )}

                      <div 
                        className="mt-2 p-6 rounded-2xl transition-all duration-300 hover:translate-x-2"
                        style={{
                          background: 'rgba(17,17,24,0.6)',
                          border: `1px solid rgba(245,243,238,0.1)`,
                          borderLeft: isCurrent ? `3px solid ${colors.blushPink}` : `1px solid rgba(245,243,238,0.1)`,
                          boxShadow: isCurrent ? `0 8px 32px rgba(249,197,213,0.1)` : '0 4px 20px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 
                              className="text-lg sm:text-xl font-semibold"
                              style={{ 
                                color: colors.white,
                                fontFamily: "'Playfair Display', Georgia, serif",
                              }}
                            >
                              {exp.title}{exp.company ? ` at ${exp.company}` : ''}
                            </h3>
                            {exp.domain && (
                              <p className="text-xs mt-1" style={{ color: colors.warmSand }}>
                                Domain: {exp.domain}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.inkGrey }}>
                              {formatDate(exp.startDate)}
                              {isCurrent ? (
                                <> – Present</>
                              ) : exp.endDate ? (
                                <> – {formatDate(exp.endDate)}</>
                              ) : null}
                            </div>
                            {exp.location && (
                              <p className="text-xs flex items-center gap-1 justify-end mt-1" style={{ color: colors.inkGrey }}>
                                <MapPin className="w-3 h-3" />
                                {exp.location}
                              </p>
                            )}
                            {exp.industry && (
                              <p className="text-xs flex items-center gap-1 justify-end mt-1 text-right w-full" style={{ color: colors.inkGrey, textAlign: 'right', justifyContent: 'flex-end' }}>
                                <Building2 className="w-3 h-3" />
                                {exp.industry}
                              </p>
                            )}
                          </div>
                        </div>

                        {exp.description && (
                          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {exp.description}
                          </p>
                        )}

                        {exp.achievements && toStringArray(exp.achievements).length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {toStringArray(exp.achievements).slice(0, 3).map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.blushPink }} />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        )}

                        {exp.keyResponsibilities && toStringArray(exp.keyResponsibilities).length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {toStringArray(exp.keyResponsibilities).slice(0, 3).map((resp, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: colors.editorialNude }} />
                                {resp}
                              </li>
                            ))}
                          </ul>
                        )}

                        {exp.employmentType && (
                          <span 
                            className="inline-block mt-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
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
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {sortedEducations.length > 0 && (
          <section 
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out 0.3s both' }}
            data-testid="education-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Training & Education
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-12"
              style={{ background: `linear-gradient(90deg, ${colors.warmSand}, ${colors.champagneGlow})` }}
            />

            <div className="relative pl-8 sm:pl-12">
              <div 
                className="absolute left-2 sm:left-4 top-0 bottom-0 w-[1px]"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.warmSand}, transparent)`,
                }}
              />

              <div className="space-y-6">
                {sortedEducations.map((edu, index) => (
                  <div 
                    key={edu.id}
                    className="relative"
                    style={{ animation: `floatIn 0.5s ease-out ${index * 0.1}s both` }}
                    data-testid={`education-${edu.id}`}
                  >
                    <div 
                      className="absolute -left-[22px] sm:-left-[30px] top-5 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colors.warmSand }}
                    />

                    <div 
                      className="p-5 rounded-xl transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: 'rgba(17,17,24,0.5)',
                        border: `1px solid rgba(245,243,238,0.08)`,
                      }}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{ background: `rgba(217,185,155,0.15)` }}
                            >
                              <GraduationCap className="w-4.5 h-4.5" style={{ color: colors.editorialNude }} />
                            </div>
                            <h3 
                              className="font-semibold text-base"
                              style={{ color: colors.white }}
                            >
                              {edu.institution}
                            </h3>
                          </div>
                          <p className="text-sm ml-12" style={{ color: colors.warmSand }}>
                            {edu.degree}
                            {edu.fieldOfStudy && <span className="opacity-80"> in {edu.fieldOfStudy}</span>}
                          </p>
                          {(edu.location || edu.industry || edu.domain) && (
                            <div className="flex flex-wrap gap-3 ml-12 mt-1 text-xs" style={{ color: colors.inkGrey }}>
                              {edu.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {edu.location}
                                </span>
                              )}
                              {edu.industry && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {edu.industry}
                                </span>
                              )}
                              {edu.domain && (
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {edu.domain}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span 
                          className="text-xs uppercase tracking-widest px-3 py-1 rounded-full"
                          style={{ 
                            color: colors.inkGrey,
                            background: 'rgba(245,243,238,0.05)',
                          }}
                        >
                          {edu.startDate ? formatDate(edu.startDate) : edu.startYear || ''}
                          {(edu.endDate || edu.endYear) && (
                            <> – {edu.endDate ? formatDate(edu.endDate) : edu.endYear}</>
                          )}
                        </span>
                      </div>

                      {(edu.skills || edu.skillsAcquired) && toStringArray(edu.skills || edu.skillsAcquired).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4 ml-12">
                          {toStringArray(edu.skills || edu.skillsAcquired).slice(0, 5).map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider"
                              style={{
                                background: 'rgba(245,243,238,0.06)',
                                border: `1px solid rgba(245,243,238,0.15)`,
                                color: 'rgba(255,255,255,0.7)',
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
            </div>
          </section>
        )}

        {userProjects.length > 0 && (
          <section 
            id="projects-section"
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out 0.4s both' }}
            data-testid="projects-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Portfolio
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-4"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.champagneGlow})` }}
            />
            <p className="text-center text-sm mb-12" style={{ color: colors.inkGrey }}>
              Click to view project details
            </p>

            <div 
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {userProjects.map((project, index) => {
                const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/4]'];
                const aspectClass = heights[index % heights.length];
                
                return (
                  <div 
                    key={project.id}
                    className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:-translate-y-3 ${aspectClass}`}
                    style={{
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      animation: `floatIn 0.6s ease-out ${index * 0.08}s both`,
                    }}
                    onClick={() => setSelectedProjectId(project.id)}
                    data-testid={`project-${project.id}`}
                  >
                    {project.thumbnailUrl || (project.mediaUrls && project.mediaUrls[0]) ? (
                      <img 
                        src={project.thumbnailUrl || project.mediaUrls?.[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.runwayCharcoal }}
                      >
                        <Camera className="w-16 h-16" style={{ color: colors.softBone, opacity: 0.2 }} />
                      </div>
                    )}

                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,9,0.4) 100%)',
                      }}
                    />

                    <div 
                      className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-400"
                      style={{
                        background: 'linear-gradient(to top, rgba(5,5,9,0.95), rgba(5,5,9,0.6) 50%, transparent)',
                      }}
                    >
                      <h3 
                        className="text-xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400"
                        style={{ 
                          color: colors.white,
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        {project.title}
                      </h3>
                      {project.category && (
                        <p 
                          className="text-xs uppercase tracking-widest mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400 delay-75"
                          style={{ color: colors.warmSand }}
                        >
                          {project.category}
                        </p>
                      )}
                      <div 
                        className="flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400 delay-100"
                      >
                        <span 
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-wider"
                          style={{
                            background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                            color: colors.noirBlack,
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Story
                        </span>
                      </div>
                    </div>

                    {project.category && (
                      <span 
                        className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-medium"
                        style={{
                          background: 'rgba(5,5,9,0.75)',
                          border: `1px solid rgba(245,243,238,0.2)`,
                          color: colors.softBone,
                          backdropFilter: 'blur(12px)',
                        }}
                      >
                        {project.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {isPremium && userServices.length > 0 && (
          <section 
            className="mb-20"
            style={{ animation: 'floatIn 0.8s ease-out 0.5s both' }}
            data-testid="services-section"
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-center"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Services & Rates
            </h2>
            <div 
              className="h-[2px] w-16 mx-auto mb-12"
              style={{ background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.editorialNude})` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.filter(s => s.isActive !== false).map((service, index) => (
                <div 
                  key={service.id}
                  className="p-6 rounded-2xl transition-all duration-400 hover:-translate-y-3 group relative overflow-hidden"
                  style={{
                    background: 'rgba(17,17,24,0.7)',
                    border: `1px solid rgba(245,243,238,0.12)`,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                    animation: `floatIn 0.6s ease-out ${index * 0.1}s both`,
                  }}
                  data-testid={`service-${service.id}`}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
                    style={{
                      background: `linear-gradient(90deg, ${colors.blushPink}, ${colors.editorialNude})`,
                    }}
                  />

                  <div className="mb-5">
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${colors.blushPink}20, ${colors.champagneGlow}20)` }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: colors.blushPink }} />
                      </div>
                    )}
                  </div>

                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ 
                      color: colors.white,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {service.title}
                  </h3>
                  
                  {service.category && (
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-4"
                      style={{
                        background: 'rgba(249,197,213,0.12)',
                        color: colors.blushPink,
                      }}
                    >
                      {service.category}
                    </span>
                  )}

                  <div 
                    className="py-4 px-5 rounded-xl mb-5 flex items-center gap-4"
                    style={{
                      background: `linear-gradient(135deg, ${colors.blushPink}15, ${colors.editorialNude}15)`,
                      border: `1px solid ${colors.blushPink}30`,
                    }}
                  >
                    {service.priceInr && (
                      <span 
                        className="text-4xl font-bold"
                        style={{ 
                          color: colors.champagneGlow,
                          fontFamily: "'Playfair Display', Georgia, serif",
                        }}
                      >
                        ₹{Number(service.priceInr).toLocaleString()}
                        {service.isHourly && (
                          <span className="text-base font-normal ml-1" style={{ color: colors.inkGrey }}>/hr</span>
                        )}
                      </span>
                    )}
                    {service.priceUsd && (
                      <span className="text-lg" style={{ color: colors.warmSand }}>
                        ${Number(service.priceUsd).toLocaleString()}{service.isHourly ? '/hr' : ''}
                      </span>
                    )}
                    <Sparkles className="w-6 h-6 ml-auto" style={{ color: colors.blushPink }} />
                  </div>

                  {service.description && (
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {service.description}
                    </p>
                  )}

                  {service.description && (
                    <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {service.description}
                    </p>
                  )}

                  {(() => {
                    const features = toStringArray(service.features);
                    return features.length > 0 ? (
                      <ul className="space-y-2.5">
                        {features.slice(0, 5).map((feature, i) => (
                          <li 
                            key={i} 
                            className="flex items-center gap-3 text-sm"
                            style={{ color: 'rgba(255,255,255,0.85)' }}
                          >
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${colors.blushPink}20` }}
                            >
                              <Check className="w-3 h-3" style={{ color: colors.blushPink }} />
                            </div>
                            <span>{String(feature)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer 
          className="text-center py-12"
          style={{ borderTop: `1px solid rgba(245,243,238,0.08)` }}
        >
          <p 
            className="text-lg mb-2"
            style={{ 
              color: colors.white,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {userInfo.name}
          </p>
          <p className="text-sm" style={{ color: colors.inkGrey }}>
            {userInfo.title || 'Creative Professional'}
          </p>
        </footer>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{
            background: `linear-gradient(145deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
            border: `1px solid rgba(245,243,238,0.12)`,
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl lg:text-3xl"
                  style={{ 
                    color: colors.white,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              
              {(selectedProject.thumbnailUrl || (selectedProject.mediaUrls && selectedProject.mediaUrls[0])) && (
                <div className="relative aspect-video rounded-xl overflow-hidden my-6">
                  <img 
                    src={selectedProject.thumbnailUrl || selectedProject.mediaUrls?.[0]}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 60%, rgba(5,5,9,0.3) 100%)',
                    }}
                  />
                </div>
              )}

              {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {selectedProject.mediaUrls.slice(1, 6).map((url, i) => (
                    <img 
                      key={i}
                      src={url}
                      alt={`${selectedProject.title} - ${i + 2}`}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              )}

              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  {selectedProject.category && (
                    <span 
                      className="px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
                      style={{
                        background: `${colors.blushPink}20`,
                        border: `1px solid ${colors.blushPink}50`,
                        color: colors.blushPink,
                      }}
                    >
                      {selectedProject.category}
                    </span>
                  )}
                  {selectedProject.industry && (
                    <span 
                      className="px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
                      style={{
                        background: 'rgba(245,243,238,0.08)',
                        color: colors.warmSand,
                      }}
                    >
                      {selectedProject.industry}
                    </span>
                  )}
                </div>

                {selectedProject.description && (
                  <div>
                    <span className="text-xs uppercase tracking-[0.15em] block mb-2" style={{ color: colors.inkGrey }}>
                      About This Project
                    </span>
                    <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                {selectedProject.projectUrl && (
                  <a
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${colors.blushPink}, ${colors.champagneGlow})`,
                      color: colors.noirBlack,
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Project
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMentorshipDialogOpen} onOpenChange={setIsMentorshipDialogOpen}>
        <DialogContent 
          className="max-w-md"
          style={{
            background: `linear-gradient(145deg, ${colors.noirBlack}, ${colors.runwayCharcoal})`,
            border: `1px solid rgba(245,243,238,0.12)`,
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-2xl"
              style={{ 
                color: colors.white,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Get in Touch
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>
              Interested in working with {userInfo.name}? Reach out directly:
            </p>
            
            
            <Button
              onClick={() => setIsMentorshipDialogOpen(false)}
              className="w-full h-12 rounded-full text-sm uppercase tracking-wider font-semibold"
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
