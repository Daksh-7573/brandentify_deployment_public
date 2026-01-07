import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project as ProjectSchema, Service, Skill, WorkExperience } from "@shared/schema";
import { MentorshipDialog } from "@/components/shared/mentorship-dialog";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, MapPin, Calendar, Download, Briefcase, GraduationCap, 
  Award, Target, Building, ExternalLink, Eye, Check, ArrowRight, 
  PenTool, Monitor, TrendingUp, Palette, Sparkles, Star, Layers,
  Lightbulb, Zap, Heart
} from "lucide-react";

interface Project extends Omit<ProjectSchema, 'mediaUrls'> {
  mediaUrls?: string[];
}

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  return [];
};

const colors = {
  softMagenta: "#FF3FAE",
  pastelCyan: "#60E6FF",
  warmYellow: "#FCD34D",
  artisticCoral: "#FF8BA0",
  porcelainWhite: "#FAFAF9",
  softGrey: "#F2F2F2",
  aluminium: "#D4D4D4",
  deepInk: "#1A1A1A",
  graphite: "#3C3C3C",
  lavender: "#E6E0FF",
  mintGreen: "#B8F4E0",
  peachBlush: "#FFE5DC",
  skyBlue: "#DDF4FF",
};

const designerPalette = [colors.softMagenta, colors.pastelCyan, colors.warmYellow, colors.artisticCoral, colors.lavender];

const getDesignerColor = (index: number) => designerPalette[index % designerPalette.length];

const keyframesStyle = `
  @keyframes blobMorph {
    0% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
    50% { border-radius: 50% 50% 45% 55% / 40% 60% 45% 55%; }
    100% { border-radius: 40% 60% 55% 45% / 60% 40% 55% 45%; }
  }
  
  @keyframes softFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(2deg); }
  }
  
  @keyframes pastelPulse {
    0% { opacity: 0.3; transform: scale(0.98); }
    50% { opacity: 0.5; transform: scale(1.02); }
    100% { opacity: 0.3; transform: scale(0.98); }
  }
  
  @keyframes strokeDraw {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes brushReveal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0% 0 0); }
  }
  
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
  }
`;

const halftonePatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="1" fill="rgba(255,63,174,0.06)"/></svg>`;
const halftoneDataUrl = `url("data:image/svg+xml,${encodeURIComponent(halftonePatternSvg)}")`;

interface DesignerPortfolioProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel?: string | null;
    aboutMe?: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
    resumeUrl?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
  currentUserId?: number;
  isPremium?: boolean;
}

export default function DesignerPortfolio({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId,
  isPremium = false
}: DesignerPortfolioProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);

  const selectedProject = useMemo(() => 
    userProjects.find(p => p.id === selectedProjectId), 
    [userProjects, selectedProjectId]
  );

  const sortedExperiences = useMemo(() => 
    [...userExperiences].sort((a, b) => {
      if (!a.endDate && b.endDate) return -1;
      if (a.endDate && !b.endDate) return 1;
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    }), 
    [userExperiences]
  );

  const sortedEducations = useMemo(() => 
    [...userEducations].sort((a, b) => 
      new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
    ), 
    [userEducations]
  );

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Present';
    try {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch { return date; }
  };

  const getProficiencyLevel = (skill: Skill): number => {
    if (skill.proficiency) return Math.min(5, Math.max(1, skill.proficiency));
    const level = skill.level?.toLowerCase();
    if (level === 'expert' || level === 'advanced') return 5;
    if (level === 'proficient') return 4;
    if (level === 'intermediate') return 3;
    if (level === 'beginner') return 2;
    return 3;
  };

  const getProficiencyPercent = (skill: Skill): number => {
    return (getProficiencyLevel(skill) / 5) * 100;
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: colors.porcelainWhite }}
    >
      <style>{keyframesStyle}</style>

      {/* Halftone texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60 z-0"
        style={{
          backgroundImage: halftoneDataUrl,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating blob accents */}
      <div 
        className="fixed top-[10%] right-[5%] w-64 h-64 pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle, ${colors.pastelCyan}30, transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'pastelPulse 8s ease-in-out infinite',
        }} 
      />
      <div 
        className="fixed bottom-[20%] left-[5%] w-48 h-48 pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle, ${colors.softMagenta}25, transparent 70%)`,
          filter: 'blur(35px)',
          animation: 'pastelPulse 10s ease-in-out infinite',
          animationDelay: '-3s',
        }} 
      />
      <div 
        className="fixed top-[50%] left-[50%] w-32 h-32 pointer-events-none z-0"
        style={{ 
          background: `radial-gradient(circle, ${colors.warmYellow}20, transparent 70%)`,
          filter: 'blur(30px)',
          animation: 'pastelPulse 12s ease-in-out infinite',
          animationDelay: '-5s',
        }} 
      />

      {/* Decorative floating shapes */}
      <div 
        className="fixed top-[15%] left-[15%] w-4 h-4 rounded-full pointer-events-none z-0"
        style={{ 
          backgroundColor: colors.softMagenta,
          opacity: 0.4,
          animation: 'softFloat 6s ease-in-out infinite',
        }} 
      />
      <div 
        className="fixed top-[70%] right-[20%] w-3 h-3 rounded-full pointer-events-none z-0"
        style={{ 
          backgroundColor: colors.pastelCyan,
          opacity: 0.5,
          animation: 'softFloat 8s ease-in-out infinite',
          animationDelay: '-2s',
        }} 
      />
      <div 
        className="fixed top-[40%] right-[10%] w-5 h-5 pointer-events-none z-0"
        style={{ 
          backgroundColor: colors.warmYellow,
          opacity: 0.3,
          transform: 'rotate(45deg)',
          animation: 'softFloat 7s ease-in-out infinite',
          animationDelay: '-4s',
        }} 
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* ==================== SECTION 1: HERO HEADER ==================== */}
        <section className="min-h-[75vh] flex items-center justify-center py-16">
          <div 
            className="w-full max-w-3xl p-8 sm:p-12 relative overflow-hidden"
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            {/* Corner decorative brushstrokes */}
            <svg className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-60" viewBox="0 0 100 100">
              <path 
                d="M90 10 L90 45 M90 10 L55 10" 
                stroke={colors.pastelCyan} 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray="200"
                style={{ animation: 'strokeDraw 0.8s ease-out forwards' }}
              />
              <circle cx="90" cy="10" r="4" fill={colors.softMagenta} />
            </svg>

            <svg className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none opacity-60" viewBox="0 0 100 100">
              <path 
                d="M10 90 L10 55 M10 90 L45 90" 
                stroke={colors.artisticCoral} 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray="200"
                style={{ animation: 'strokeDraw 0.8s ease-out 0.2s forwards' }}
              />
              <circle cx="10" cy="90" r="4" fill={colors.warmYellow} />
            </svg>

            {/* Gradient background blobs */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 20% 30%, ${colors.pastelCyan}15 0%, transparent 50%), 
                            radial-gradient(circle at 80% 70%, ${colors.softMagenta}12 0%, transparent 50%)`,
              }}
            />

            {/* Profile Section */}
            <div className="relative flex flex-col items-center text-center">
              {/* Profile Image with blob shape */}
              <div className="relative mb-8">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.pastelCyan}40, ${colors.softMagenta}40)`,
                    borderRadius: '40% 60% 55% 45% / 60% 40% 55% 45%',
                    transform: 'scale(1.15) rotate(-3deg)',
                    filter: 'blur(15px)',
                    animation: 'blobMorph 12s ease-in-out infinite',
                  }}
                />
                <div 
                  className="relative w-36 h-36 overflow-hidden transition-all duration-500 hover:scale-105"
                  style={{
                    borderRadius: '40% 60% 55% 45% / 60% 40% 55% 45%',
                    padding: '4px',
                    background: `linear-gradient(135deg, ${colors.pastelCyan}, ${colors.softMagenta})`,
                    animation: 'blobMorph 12s ease-in-out infinite',
                    boxShadow: `0 12px 30px ${colors.softMagenta}25`,
                  }}
                >
                  {userInfo.photoURL ? (
                    <ProfileImage 
                      src={userInfo.photoURL} 
                      alt={userInfo.name}
                      className="w-full h-full object-cover rounded-[inherit]"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        borderRadius: 'inherit',
                        backgroundColor: colors.softGrey,
                      }}
                    >
                      <span className="text-5xl font-bold" style={{ color: colors.softMagenta }}>
                        {userInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name with gradient underline */}
              <div className="mb-4">
                <h1 
                  className="text-4xl sm:text-5xl font-bold mb-3"
                  style={{
                    color: colors.deepInk,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: '-1px',
                  }}
                >
                  {userInfo.name}
                </h1>
                <div 
                  className="h-1 w-24 mx-auto rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.pastelCyan})`,
                  }}
                />
              </div>

              {/* Title with pill style */}
              {userInfo.title && (
                <div 
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4"
                  style={{
                    background: colors.softGrey,
                    border: `1px solid ${colors.aluminium}`,
                  }}
                >
                  <Zap className="w-4 h-4" style={{ color: colors.softMagenta }} />
                  <span 
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: colors.graphite }}
                  >
                    {userInfo.title}
                  </span>
                </div>
              )}

              {/* Tagline */}
              {userInfo.tagline && (
                <p 
                  className="text-base mb-8 max-w-lg"
                  style={{ 
                    color: colors.graphite,
                    opacity: 0.8,
                  }}
                >
                  {userInfo.tagline}
                </p>
              )}

              {/* Info Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {userInfo.location && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:translate-y-[-2px] hover:shadow-md"
                    style={{
                      backgroundColor: `${colors.artisticCoral}15`,
                      border: `1px solid ${colors.artisticCoral}40`,
                      color: '#DB2777',
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{userInfo.location}</span>
                  </div>
                )}
                {userInfo.industry && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:translate-y-[-2px] hover:shadow-md"
                    style={{
                      backgroundColor: `${colors.pastelCyan}15`,
                      border: `1px solid ${colors.pastelCyan}50`,
                      color: '#0891B2',
                    }}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{userInfo.industry}</span>
                  </div>
                )}
                {userInfo.domain && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:translate-y-[-2px] hover:shadow-md"
                    style={{
                      backgroundColor: `${colors.softMagenta}12`,
                      border: `1px solid ${colors.softMagenta}35`,
                      color: colors.softMagenta,
                    }}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>{userInfo.domain}</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <PortfolioCtaButtons 
                  variant="creative"
                  userId={userInfo.id}
                  userName={userInfo.name}
                  userEmail={userInfo.email}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: ABOUT / CREATIVE PROFILE BOARD ==================== */}
        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* About Me Card */}
            {userInfo.aboutMe && (
              <div 
                className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl md:col-span-2"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${colors.pastelCyan}20` }}
                  >
                    <Palette className="w-5 h-5" style={{ color: '#0891B2' }} />
                  </div>
                  <h3 
                    className="font-bold text-lg"
                    style={{ color: colors.deepInk }}
                  >
                    About Me
                  </h3>
                </div>
                <p 
                  className="leading-relaxed"
                  style={{ color: colors.graphite }}
                >
                  {userInfo.aboutMe}
                </p>
              </div>
            )}

            {/* Vision Card */}
            {userInfo.visionStatement && (
              <div 
                className="p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                style={{
                  backgroundColor: `${colors.softMagenta}08`,
                  border: `1px solid ${colors.softMagenta}20`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4" style={{ color: colors.softMagenta }} />
                  <h4 
                    className="font-semibold text-sm uppercase tracking-wide"
                    style={{ color: colors.softMagenta }}
                  >
                    Vision
                  </h4>
                </div>
                <p className="text-sm" style={{ color: colors.graphite }}>{userInfo.visionStatement}</p>
              </div>
            )}

            {/* Mission Card */}
            {userInfo.missionStatement && (
              <div 
                className="p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                style={{
                  backgroundColor: `${colors.pastelCyan}10`,
                  border: `1px solid ${colors.pastelCyan}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: '#0891B2' }} />
                  <h4 
                    className="font-semibold text-sm uppercase tracking-wide"
                    style={{ color: '#0891B2' }}
                  >
                    Mission
                  </h4>
                </div>
                <p className="text-sm" style={{ color: colors.graphite }}>{userInfo.missionStatement}</p>
              </div>
            )}

            {/* What Makes Me Different */}
            {userInfo.uniqueValueProposition && (
              <div 
                className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.warmYellow}15, ${colors.artisticCoral}10)`,
                  border: `1px solid ${colors.warmYellow}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: '#D97706' }} />
                  <h4 
                    className="font-semibold text-sm uppercase tracking-wide"
                    style={{ color: '#D97706' }}
                  >
                    What Sets Me Apart
                  </h4>
                </div>
                <p 
                  className="text-lg font-medium italic"
                  style={{ color: colors.deepInk }}
                >
                  "{userInfo.uniqueValueProposition}"
                </p>
              </div>
            )}

            {/* Core Values */}
            {userInfo.coreValues && toStringArray(userInfo.coreValues).length > 0 && (
              <div 
                className="p-5 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4" style={{ color: colors.artisticCoral }} />
                  <h4 
                    className="font-semibold text-sm uppercase tracking-wide"
                    style={{ color: colors.graphite }}
                  >
                    Core Values
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {toStringArray(userInfo.coreValues).map((value, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getDesignerColor(i)}15`,
                        color: getDesignerColor(i),
                        border: `1px solid ${getDesignerColor(i)}30`,
                      }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== SECTION 3: SKILLS - CREATIVE BAR SPECTRUM ==================== */}
        {userSkills.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-3xl font-bold mb-3"
                style={{ color: colors.deepInk }}
              >
                Skills & Expertise
              </h2>
              <div 
                className="h-1 w-20 mx-auto rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.pastelCyan})` }}
              />
            </div>
            
            <div 
              className="p-8 rounded-3xl"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {userSkills.map((skill, index) => {
                  const percent = getProficiencyPercent(skill);
                  const gradientColor = getDesignerColor(index);
                  
                  return (
                    <div 
                      key={skill.id} 
                      className="group transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-medium text-sm"
                            style={{ color: colors.deepInk }}
                          >
                            {skill.name}
                          </span>
                          {(skill as any).category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                              {(skill as any).category}
                            </span>
                          )}
                          {(skill as any).yearsOfExperience && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                              {(skill as any).yearsOfExperience}y
                            </span>
                          )}
                        </div>
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${gradientColor}15`,
                            color: gradientColor,
                          }}
                        >
                          {skill.level || 'Intermediate'}
                        </span>
                      </div>
                      <div 
                        className="h-2.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.softGrey }}
                      >
                        <div 
                          className="h-full rounded-full transition-all duration-700 group-hover:shadow-lg"
                          style={{
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, ${gradientColor}, ${gradientColor}80)`,
                            boxShadow: `0 0 10px ${gradientColor}40`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SECTION 4: EXPERIENCE - EDITORIAL TIMELINE ==================== */}
        {sortedExperiences.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-3xl font-bold mb-3"
                style={{ color: colors.deepInk }}
              >
                Work Experience
              </h2>
              <div 
                className="h-1 w-20 mx-auto rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.pastelCyan}, ${colors.softMagenta})` }}
              />
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div 
                className="absolute left-6 top-0 bottom-0 w-0.5 hidden md:block"
                style={{ 
                  background: `linear-gradient(to bottom, ${colors.softMagenta}, ${colors.pastelCyan})`,
                }}
              />

              <div className="space-y-6">
                {sortedExperiences.map((exp, index) => {
                  const isCurrent = !exp.endDate;
                  const accentColor = getDesignerColor(index);
                  
                  return (
                    <div 
                      key={exp.id}
                      className="relative md:pl-16 transition-all duration-300 hover:translate-x-2"
                    >
                      {/* Timeline node */}
                      <div 
                        className="absolute left-4 w-4 h-4 rounded-full hidden md:flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'white',
                          border: `3px solid ${accentColor}`,
                          boxShadow: isCurrent ? `0 0 0 4px ${accentColor}30` : 'none',
                        }}
                      >
                        {isCurrent && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ 
                              backgroundColor: accentColor,
                              animation: 'dotPulse 2s ease-in-out infinite',
                            }}
                          />
                        )}
                      </div>

                      {/* Content card */}
                      <div 
                        className="p-6 rounded-2xl transition-all duration-300 hover:shadow-xl"
                        style={{
                          backgroundColor: 'white',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                          border: '1px solid rgba(0,0,0,0.04)',
                          borderLeft: `4px solid ${accentColor}`,
                        }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 
                              className="font-bold text-lg"
                              style={{ color: colors.deepInk }}
                            >
                              {exp.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="w-4 h-4" style={{ color: accentColor }} />
                              <span 
                                className="font-medium"
                                style={{ color: colors.graphite }}
                              >
                                {exp.company}
                              </span>
                            </div>
                          </div>
                          <div 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: isCurrent ? `${accentColor}15` : colors.softGrey,
                              color: isCurrent ? accentColor : colors.graphite,
                            }}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                          </div>
                        </div>
                        
                        {exp.description && (
                          <p 
                            className="text-sm leading-relaxed"
                            style={{ color: colors.graphite }}
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

        {/* ==================== SECTION 5: EDUCATION - MINIMAL CREDENTIAL STRIP ==================== */}
        {sortedEducations.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-3xl font-bold mb-3"
                style={{ color: colors.deepInk }}
              >
                Education
              </h2>
              <div 
                className="h-1 w-20 mx-auto rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.warmYellow}, ${colors.artisticCoral})` }}
              />
            </div>

            <div className="space-y-4">
              {sortedEducations.map((edu, index) => {
                const accentColor = getDesignerColor(index);
                
                return (
                  <div 
                    key={edu.id}
                    className="p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${accentColor}15` }}
                      >
                        <GraduationCap className="w-6 h-6" style={{ color: accentColor }} />
                      </div>
                      <div>
                        <h3 
                          className="font-bold"
                          style={{ color: colors.deepInk }}
                        >
                          {edu.degree}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: colors.graphite }}
                        >
                          {edu.institution}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {edu.fieldOfStudy && (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${accentColor}12`,
                            color: accentColor,
                          }}
                        >
                          {edu.fieldOfStudy}
                        </span>
                      )}
                      <span 
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: colors.softGrey,
                          color: colors.graphite,
                        }}
                      >
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 6: PROJECTS - GALLERY WITH UV FRAME HOVER ==================== */}
        {userProjects.length > 0 && (
          <section id="projects" className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-3xl font-bold mb-3"
                style={{ color: colors.deepInk }}
              >
                Featured Work
              </h2>
              <div 
                className="h-1 w-20 mx-auto rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.warmYellow})` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => {
                const accentColor = getDesignerColor(index);
                const thumbnail = project.mediaUrls?.[0] || project.thumbnailUrl;
                
                return (
                  <div 
                    key={project.id}
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-8px]"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    {/* UV glow effect on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                      style={{
                        boxShadow: `inset 0 0 30px ${accentColor}50, 0 0 40px ${accentColor}30`,
                      }}
                    />

                    {/* Image container */}
                    <div className="relative h-48 overflow-hidden">
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                          }}
                        >
                          <Layers className="w-12 h-12" style={{ color: accentColor, opacity: 0.5 }} />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{ backgroundColor: `${accentColor}90` }}
                      >
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm"
                          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 
                        className="font-bold mb-2 group-hover:text-transparent bg-clip-text transition-all duration-300"
                        style={{ 
                          color: colors.deepInk,
                          backgroundImage: `linear-gradient(90deg, ${accentColor}, ${colors.deepInk})`,
                          WebkitBackgroundClip: 'text',
                        }}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p 
                          className="text-sm line-clamp-2"
                          style={{ color: colors.graphite }}
                        >
                          {project.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {project.category && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: colors.softGrey,
                              color: colors.graphite,
                            }}
                          >
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 7: SERVICES - CREATIVE SERVICE TILES (PREMIUM) ==================== */}
        {isPremium && userServices.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: colors.warmYellow }} />
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.warmYellow}20, ${colors.artisticCoral}20)`,
                    color: '#D97706',
                  }}
                >
                  Premium Feature
                </span>
              </div>
              <h2 
                className="text-3xl font-bold mb-3"
                style={{ color: colors.deepInk }}
              >
                Services I Offer
              </h2>
              <div 
                className="h-1 w-20 mx-auto rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors.warmYellow}, ${colors.softMagenta})` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service, index) => {
                const accentColor = getDesignerColor(index);
                
                return (
                  <div 
                    key={service.id}
                    className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-6px] hover:shadow-2xl relative overflow-hidden group"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Gradient accent on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
                      }}
                    />

                    <div className="relative">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: `${accentColor}15` }}
                      >
                        <PenTool className="w-7 h-7" style={{ color: accentColor }} />
                      </div>

                      <h3 
                        className="font-bold text-lg mb-2"
                        style={{ color: colors.deepInk }}
                      >
                        {service.title}
                      </h3>

                      {service.description && (
                        <p 
                          className="text-sm mb-4"
                          style={{ color: colors.graphite }}
                        >
                          {service.description}
                        </p>
                      )}

                      {service.priceInr && (
                        <div 
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full font-bold"
                          style={{
                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                            color: 'white',
                          }}
                        >
                          ₹{service.priceInr.toLocaleString()}{service.isHourly ? '/hr' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== FOOTER - ARTIST SIGNATURE BLOCK ==================== */}
        <footer className="py-16 mt-8">
          <div 
            className="p-8 rounded-3xl text-center"
            style={{
              background: `linear-gradient(135deg, ${colors.deepInk}, ${colors.graphite})`,
            }}
          >
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ color: 'white' }}
            >
              Let's Create Something Amazing
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Ready to collaborate? I'd love to hear about your project.
            </p>
            
            <button 
              onClick={() => setIsMentorshipDialogOpen(true)}
              className="px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl"
              style={{
                background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.pastelCyan})`,
                color: 'white',
                boxShadow: `0 8px 25px ${colors.softMagenta}40`,
              }}
            >
              Get In Touch
            </button>

            <div 
              className="mt-8 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p 
                className="text-xs uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Designer Portfolio • Brandentifier
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <Dialog open={selectedProjectId !== null} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ 
            backgroundColor: colors.porcelainWhite,
            border: 'none',
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl font-bold"
                  style={{ color: colors.deepInk }}
                >
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Project image */}
                {(selectedProject.mediaUrls?.[0] || selectedProject.thumbnailUrl) && (
                  <div className="rounded-xl overflow-hidden">
                    <img 
                      src={selectedProject.mediaUrls?.[0] || selectedProject.thumbnailUrl || ''}
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                {selectedProject.description && (
                  <div>
                    <h4 
                      className="font-semibold mb-2"
                      style={{ color: colors.deepInk }}
                    >
                      About This Project
                    </h4>
                    <p style={{ color: colors.graphite }}>{selectedProject.description}</p>
                  </div>
                )}

                {/* Category */}
                {selectedProject.category && (
                  <div>
                    <h4 
                      className="font-semibold mb-2"
                      style={{ color: colors.deepInk }}
                    >
                      Category
                    </h4>
                    <span 
                      className="inline-block px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${colors.softMagenta}15`,
                        color: colors.softMagenta,
                      }}
                    >
                      {selectedProject.category}
                    </span>
                  </div>
                )}

                {/* Links */}
                {selectedProject.projectUrl && (
                  <a 
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:translate-y-[-2px]"
                    style={{
                      background: `linear-gradient(90deg, ${colors.softMagenta}, ${colors.pastelCyan})`,
                      color: 'white',
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Live Project
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mentorship Dialog */}
      <MentorshipDialog
        isOpen={isMentorshipDialogOpen}
        onOpenChange={setIsMentorshipDialogOpen}
        mentorId={userInfo.id}
        userId={currentUserId}
      />
    </div>
  );
}
