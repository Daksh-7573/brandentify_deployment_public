import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project as ProjectSchema, Service, Skill, WorkExperience } from "@shared/schema";
import { MentorshipDialog } from "@/components/shared/mentorship-dialog";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, MapPin, Calendar, Download, Briefcase, GraduationCap, 
  Award, Target, Building, ExternalLink, Eye, Check, ArrowRight, 
  PenTool, Monitor, TrendingUp, Palette, Sparkles
} from "lucide-react";

interface Project extends Omit<ProjectSchema, 'mediaUrls'> {
  mediaUrls?: string[];
}

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  return [];
};

// Artistic Color Palette
const colors = {
  burgundy: "#a83838",
  teal: "#3a7b7b",
  navy: "#2c3e50",
  mint: "#4ed8c0",
  lilac: "#9f77d1",
  rust: "#d35400",
  sage: "#7f8c8d",
  clay: "#d7ccc8",
  wheat: "#f5deb3",
  sienna: "#a0522d",
  canvas: "#f9f7f0",
  parchment: "#f4f1e5",
  inkBlack: "#2d3436",
  darkGray: "#34495e",
  crimson: "#c0392b",
  emerald: "#27ae60",
  amber: "#f39c12",
};

const artisticPalette = [colors.burgundy, colors.teal, colors.navy, colors.mint, colors.lilac, colors.rust, colors.sage];

const getArtisticColor = (index: number) => artisticPalette[index % artisticPalette.length];

// Torn paper edge clip-paths for cards - ALL FOUR SIDES with organic edges
const tornEdgeClipPaths = {
  card1: "polygon(2% 3%, 4% 1%, 7% 2%, 10% 0%, 14% 1%, 18% 2%, 22% 0%, 26% 1%, 30% 2%, 35% 0%, 40% 2%, 45% 1%, 50% 0%, 55% 2%, 60% 1%, 65% 0%, 70% 2%, 75% 1%, 80% 0%, 85% 2%, 90% 1%, 94% 0%, 97% 2%, 99% 4%, 100% 8%, 99% 12%, 100% 18%, 99% 24%, 100% 30%, 99% 36%, 100% 42%, 99% 48%, 100% 54%, 99% 60%, 100% 66%, 99% 72%, 100% 78%, 99% 84%, 100% 90%, 99% 95%, 97% 98%, 94% 100%, 90% 99%, 85% 100%, 80% 98%, 75% 100%, 70% 99%, 65% 100%, 60% 98%, 55% 100%, 50% 99%, 45% 100%, 40% 98%, 35% 100%, 30% 99%, 25% 100%, 20% 98%, 15% 100%, 10% 99%, 6% 100%, 3% 98%, 1% 96%, 0% 92%, 1% 86%, 0% 80%, 1% 74%, 0% 68%, 1% 62%, 0% 56%, 1% 50%, 0% 44%, 1% 38%, 0% 32%, 1% 26%, 0% 20%, 1% 14%, 0% 8%)",
  card2: "polygon(3% 2%, 6% 0%, 10% 2%, 15% 0%, 20% 1%, 25% 0%, 30% 2%, 36% 0%, 42% 1%, 48% 0%, 54% 2%, 60% 0%, 66% 1%, 72% 0%, 78% 2%, 84% 0%, 90% 1%, 95% 0%, 98% 3%, 100% 7%, 99% 13%, 100% 20%, 99% 27%, 100% 34%, 99% 41%, 100% 48%, 99% 55%, 100% 62%, 99% 69%, 100% 76%, 99% 83%, 100% 90%, 98% 97%, 95% 100%, 90% 98%, 84% 100%, 78% 99%, 72% 100%, 66% 98%, 60% 100%, 54% 99%, 48% 100%, 42% 98%, 36% 100%, 30% 99%, 25% 100%, 20% 98%, 15% 100%, 10% 99%, 6% 100%, 3% 97%, 0% 93%, 1% 87%, 0% 80%, 1% 73%, 0% 66%, 1% 59%, 0% 52%, 1% 45%, 0% 38%, 1% 31%, 0% 24%, 1% 17%, 0% 10%)",
  card3: "polygon(1% 4%, 5% 1%, 9% 3%, 14% 0%, 19% 2%, 24% 0%, 29% 2%, 34% 0%, 40% 2%, 46% 0%, 52% 1%, 58% 0%, 64% 2%, 70% 0%, 76% 1%, 82% 0%, 88% 2%, 93% 0%, 97% 3%, 100% 6%, 99% 11%, 100% 17%, 99% 23%, 100% 29%, 99% 35%, 100% 41%, 99% 47%, 100% 53%, 99% 59%, 100% 65%, 99% 71%, 100% 77%, 99% 83%, 100% 89%, 99% 94%, 97% 98%, 93% 100%, 88% 98%, 82% 100%, 76% 99%, 70% 100%, 64% 98%, 58% 100%, 52% 99%, 46% 100%, 40% 98%, 34% 100%, 29% 99%, 24% 100%, 19% 98%, 14% 100%, 9% 99%, 5% 100%, 1% 97%, 0% 94%, 1% 89%, 0% 83%, 1% 77%, 0% 71%, 1% 65%, 0% 59%, 1% 53%, 0% 47%, 1% 41%, 0% 35%, 1% 29%, 0% 23%, 1% 17%, 0% 11%)",
};

const getTornEdge = (index: number) => {
  const edges = Object.values(tornEdgeClipPaths);
  return edges[index % edges.length];
};

// Card background colors - soft pastel versions of the artistic palette
const cardBackgrounds = [
  { bg: "#f5e6e6", accent: colors.burgundy },  // soft burgundy
  { bg: "#e6f2f2", accent: colors.teal },       // soft teal
  { bg: "#e8ecef", accent: colors.navy },       // soft navy
  { bg: "#e6f9f5", accent: colors.mint },       // soft mint
  { bg: "#f0eaf5", accent: colors.lilac },      // soft lilac
  { bg: "#f5ebe6", accent: colors.rust },       // soft rust
  { bg: "#eef0f0", accent: colors.sage },       // soft sage
];

const getCardStyle = (index: number) => {
  const style = cardBackgrounds[index % cardBackgrounds.length];
  return style;
};

// Paper texture SVG
const paperTextureSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0.1" /></filter><rect width="100%" height="100%" filter="url(#noise)" opacity="0.08" /></svg>`;

interface ArtisticPortfolioProps {
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

export default function ArtisticPortfolio({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId,
  isPremium = false
}: ArtisticPortfolioProps) {
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

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: colors.parchment }}
    >
      {/* Paper texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-50 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(paperTextureSvg)}")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Floating color palette dots */}
      <div className="fixed top-[15%] right-[10%] w-4 h-4 rounded-full opacity-30 z-0" 
        style={{ backgroundColor: colors.crimson, animation: "artisticFloat 8s infinite ease-in-out" }} />
      <div className="fixed top-[75%] left-[15%] w-3 h-3 rounded-full opacity-25 z-0" 
        style={{ backgroundColor: colors.amber, animation: "artisticFloat 7s 2s infinite ease-in-out" }} />
      <div className="fixed top-[45%] right-[20%] w-5 h-5 rounded-full opacity-20 z-0" 
        style={{ backgroundColor: colors.teal, animation: "artisticFloat 10s 1s infinite ease-in-out" }} />
      <div className="fixed top-[60%] left-[30%] w-4 h-4 rounded-full opacity-20 z-0" 
        style={{ backgroundColor: colors.lilac, animation: "artisticFloat 9s 3s infinite ease-in-out" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* ==================== SECTION 1: HERO HEADER ==================== */}
        <section className="min-h-[70vh] flex items-center justify-center py-16">
          <div 
            className="w-full max-w-2xl p-8 rounded-2xl relative overflow-hidden"
            style={{
              backgroundColor: colors.canvas,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              clipPath: "polygon(3% 0%, 7% 1%, 11% 0%, 16% 2%, 20% 0%, 24% 2%, 28% 2%, 32% 1%, 35% 1%, 39% 3%, 42% 3%, 47% 2%, 50% 2%, 53% 0%, 58% 2%, 60% 4%, 63% 5%, 65% 4%, 70% 4%, 73% 5%, 76% 4%, 79% 5%, 82% 5%, 86% 4%, 91% 3%, 95% 4%, 98% 6%, 100% 7%, 99% 11%, 100% 15%, 98% 18%, 100% 22%, 99% 26%, 100% 30%, 99% 35%, 99% 40%, 100% 43%, 99% 48%, 100% 53%, 99% 57%, 99% 63%, 100% 67%, 99% 71%, 100% 77%, 99% 83%, 100% 87%, 99% 91%, 100% 96%, 97% 97%, 93% 98%, 89% 99%, 85% 99%, 80% 100%, 74% 99%, 70% 99%, 65% 99%, 60% 98%, 55% 99%, 50% 98%, 45% 99%, 41% 100%, 38% 99%, 33% 99%, 29% 100%, 24% 99%, 19% 99%, 14% 100%, 10% 99%, 5% 99%, 1% 97%, 0% 95%, 0% 91%, 1% 87%, 0% 83%, 1% 79%, 0% 74%, 1% 69%, 0% 65%, 0% 60%, 0% 55%, 1% 50%, 0% 45%, 1% 40%, 0% 35%, 1% 30%, 0% 25%, 0% 21%, 0% 16%, 1% 10%, 0% 5%)",
            }}
          >
            {/* Paint blur background accents */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 35% 20%, ${colors.mint}40 0%, transparent 70%), 
                            radial-gradient(circle at 85% 70%, ${colors.lilac}40 0%, transparent 70%)`,
                filter: "blur(25px)",
                opacity: 0.5,
              }}
            />

            {/* Profile Section */}
            <div className="relative flex flex-col items-center text-center">
              {/* Profile Image with organic blob shape */}
              <div className="relative mb-6">
                {/* Blurred background blob */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundColor: colors.wheat,
                    borderRadius: "60% 40% 50% 50% / 40% 50% 60% 50%",
                    transform: "scale(1.3) rotate(-5deg)",
                    opacity: 0.5,
                    filter: "blur(12px)",
                  }}
                />
                {/* Profile image container */}
                <div 
                  className="relative w-32 h-32 overflow-hidden transition-transform duration-300 hover:scale-105 hover:rotate-2"
                  style={{
                    borderRadius: "60% 40% 50% 50% / 40% 50% 60% 50%",
                    padding: "4px",
                    background: `linear-gradient(45deg, ${colors.canvas}, white)`,
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.05)",
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
                        borderRadius: "inherit",
                        backgroundColor: colors.clay,
                      }}
                    >
                      <span className="text-4xl font-serif" style={{ color: colors.inkBlack }}>
                        {userInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name with decorative underline */}
              <div className="relative mb-3">
                <div 
                  className="absolute -inset-2 rounded opacity-50"
                  style={{
                    background: colors.wheat,
                    transform: "skewX(-3deg)",
                  }}
                />
                <h1 
                  className="relative text-3xl sm:text-4xl font-bold"
                  style={{
                    color: colors.inkBlack,
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    textShadow: "1px 1px 0px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {userInfo.name}
                </h1>
              </div>

              {/* Title with brush stroke background */}
              {userInfo.title && (
                <div className="relative mb-4">
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: colors.sage,
                      borderRadius: "0 10px 0 10px",
                      transform: "skew(-5deg, 1deg)",
                    }}
                  />
                  <p 
                    className="relative px-4 py-1 text-sm font-medium"
                    style={{ color: colors.inkBlack }}
                  >
                    {userInfo.title}
                  </p>
                </div>
              )}

              {/* Tagline */}
              {userInfo.tagline && (
                <p 
                  className="text-sm mb-6 max-w-md"
                  style={{ 
                    color: colors.darkGray,
                    fontFamily: "'Caveat', cursive, sans-serif",
                    fontSize: "1.1rem",
                  }}
                >
                  {userInfo.tagline}
                </p>
              )}

              {/* Info Chips Row - Paint chip style */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {userInfo.location && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-transform hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: `${colors.burgundy}20`,
                      color: colors.burgundy,
                      borderLeft: `3px solid ${colors.burgundy}`,
                      borderRadius: "0 6px 6px 0",
                    }}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{userInfo.location}</span>
                  </div>
                )}
                {userInfo.industry && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-transform hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: `${colors.teal}20`,
                      color: colors.teal,
                      borderLeft: `3px solid ${colors.teal}`,
                      borderRadius: "0 6px 6px 0",
                    }}
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>{userInfo.industry}</span>
                  </div>
                )}
                {userInfo.domain && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-transform hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: `${colors.lilac}20`,
                      color: colors.lilac,
                      borderLeft: `3px solid ${colors.lilac}`,
                      borderRadius: "0 6px 6px 0",
                    }}
                  >
                    <PenTool className="w-3 h-3" />
                    <span>{userInfo.domain}</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons - Artistic style */}
              <div className="flex flex-wrap justify-center gap-4">
                <PortfolioCtaButtons 
                  variant="creative"
                  userId={userInfo.id}
                  userName={userInfo.name}
                  userEmail={userInfo.email}
                />
              </div>
            </div>

            {/* Brush stroke separator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-3/4">
              <svg viewBox="0 0 200 10" className="w-full h-2 opacity-50">
                <path 
                  d="M0,5 Q30,9 60,5 T120,5 T180,5 T240,5" 
                  fill="none" 
                  stroke={colors.teal} 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: ABOUT / SNAPSHOT ==================== */}
        <section className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* About Me Card - Exhibition label style */}
              {userInfo.aboutMe && (
                <div 
                  className="p-6 relative"
                  style={{
                    backgroundColor: cardBackgrounds[1].bg,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    clipPath: tornEdgeClipPaths.card1,
                  }}
                >
                  <h3 
                    className="font-bold mb-3 flex items-center gap-2"
                    style={{ 
                      color: colors.navy,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    <Palette className="w-5 h-5" style={{ color: colors.teal }} />
                    Artist Statement
                  </h3>
                  <p 
                    className="leading-relaxed"
                    style={{ color: colors.darkGray }}
                  >
                    {userInfo.aboutMe}
                  </p>
                </div>
              )}

              {/* Vision Card */}
              {userInfo.visionStatement && (
                <div 
                  className="p-5 relative"
                  style={{
                    backgroundColor: cardBackgrounds[4].bg,
                    borderLeft: `4px solid ${colors.teal}`,
                    clipPath: tornEdgeClipPaths.card2,
                  }}
                >
                  <h4 
                    className="font-medium text-sm mb-2"
                    style={{ color: colors.teal }}
                  >
                    Vision
                  </h4>
                  <p style={{ color: colors.darkGray }}>{userInfo.visionStatement}</p>
                </div>
              )}

              {/* Mission Card */}
              {userInfo.missionStatement && (
                <div 
                  className="p-5 relative"
                  style={{
                    backgroundColor: cardBackgrounds[0].bg,
                    borderLeft: `4px solid ${colors.lilac}`,
                    clipPath: tornEdgeClipPaths.card3,
                  }}
                >
                  <h4 
                    className="font-medium text-sm mb-2"
                    style={{ color: colors.lilac }}
                  >
                    Mission
                  </h4>
                  <p style={{ color: colors.darkGray }}>{userInfo.missionStatement}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* What Makes Me Different */}
              {userInfo.uniqueValueProposition && (
                <div 
                  className="p-6"
                  style={{
                    backgroundColor: cardBackgrounds[3].bg,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    clipPath: tornEdgeClipPaths.card1,
                  }}
                >
                  <h3 
                    className="font-semibold mb-3"
                    style={{ color: colors.burgundy }}
                  >
                    What Makes Me Different
                  </h3>
                  <p 
                    className="text-lg font-medium"
                    style={{ 
                      color: colors.inkBlack,
                      fontFamily: "'Caveat', cursive",
                      fontSize: "1.3rem",
                    }}
                  >
                    "{userInfo.uniqueValueProposition}"
                  </p>
                </div>
              )}

              {/* Core Values - Paint chips */}
              {userInfo.coreValues && toStringArray(userInfo.coreValues).length > 0 && (
                <div 
                  className="p-5"
                  style={{ 
                    backgroundColor: cardBackgrounds[5].bg,
                    clipPath: tornEdgeClipPaths.card2,
                  }}
                >
                  <h4 
                    className="font-medium text-sm mb-3"
                    style={{ color: colors.darkGray }}
                  >
                    Core Values
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {toStringArray(userInfo.coreValues).map((value, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 text-xs font-medium transition-transform hover:translate-x-1"
                        style={{
                          backgroundColor: `${getArtisticColor(i)}20`,
                          color: getArtisticColor(i),
                          borderLeft: `3px solid ${getArtisticColor(i)}`,
                          borderRadius: "0 6px 6px 0",
                        }}
                      >
                        {String(value)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Audiences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userInfo.primaryAudience && toStringArray(userInfo.primaryAudience).length > 0 && (
                  <div 
                    className="p-4"
                    style={{ 
                      backgroundColor: cardBackgrounds[2].bg,
                      clipPath: tornEdgeClipPaths.card3,
                    }}
                  >
                    <h4 
                      className="font-medium text-xs mb-2"
                      style={{ color: colors.teal }}
                    >
                      Primary Audience
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {toStringArray(userInfo.primaryAudience).map((aud, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.teal}15`,
                            color: colors.teal,
                          }}
                        >
                          {String(aud)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {userInfo.secondaryAudience && toStringArray(userInfo.secondaryAudience).length > 0 && (
                  <div 
                    className="p-4"
                    style={{ 
                      backgroundColor: cardBackgrounds[6].bg,
                      clipPath: tornEdgeClipPaths.card1,
                    }}
                  >
                    <h4 
                      className="font-medium text-xs mb-2"
                      style={{ color: colors.lilac }}
                    >
                      Secondary Audience
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {toStringArray(userInfo.secondaryAudience).map((aud, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.lilac}15`,
                            color: colors.lilac,
                          }}
                        >
                          {String(aud)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Looking For & Email */}
              <div 
                className="p-4 flex flex-wrap gap-4 items-center justify-between"
                style={{ 
                  backgroundColor: cardBackgrounds[1].bg,
                  clipPath: tornEdgeClipPaths.card2,
                }}
              >
                {userInfo.lookingFor && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: colors.rust }} />
                    <span style={{ color: colors.darkGray }} className="text-sm">{userInfo.lookingFor}</span>
                  </div>
                )}
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`}
                    className="flex items-center gap-2 text-sm transition-colors hover:underline"
                    style={{ color: colors.teal }}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{userInfo.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 3: SKILLS ==================== */}
        {userSkills.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: colors.inkBlack,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Skills & Expertise
              </h2>
              <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: colors.teal }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userSkills.map((skill, index) => {
                const proficiency = getProficiencyLevel(skill);
                const color = getArtisticColor(index);
                const cardStyle = getCardStyle(index);
                return (
                  <div 
                    key={skill.id}
                    className="p-4 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
                    style={{
                      backgroundColor: cardStyle.bg,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      borderTop: `3px solid ${cardStyle.accent}`,
                      clipPath: getTornEdge(index),
                      animation: `artisticFadeIn 0.4s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <h4 
                      className="font-semibold mb-1"
                      style={{ color: colors.inkBlack }}
                    >
                      {skill.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {skill.level && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                          }}
                        >
                          {skill.level}
                        </span>
                      )}
                      {(skill as any).category && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.coral}20`,
                            color: colors.coral,
                          }}
                        >
                          {(skill as any).category}
                        </span>
                      )}
                      {(skill as any).yearsOfExperience && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.mustard}20`,
                            color: colors.mustard,
                          }}
                        >
                          {(skill as any).yearsOfExperience}y
                        </span>
                      )}
                    </div>
                    
                    {/* Proficiency Dots */}
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className="w-3 h-3 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: level <= proficiency ? color : `${color}30`,
                            boxShadow: level <= proficiency ? `0 0 6px ${color}60` : 'none',
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

        {/* ==================== SECTION 4: WORK EXPERIENCE ==================== */}
        {sortedExperiences.length > 0 && (
          <section className="py-16">
            <h2 
              className="text-2xl font-bold mb-10 text-center"
              style={{ 
                color: colors.inkBlack,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Professional Journey
            </h2>

            <div 
              className="p-8 relative"
              style={{
                backgroundColor: cardBackgrounds[1].bg,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                clipPath: tornEdgeClipPaths.card1,
              }}
            >
              {/* Timeline Line */}
              <div 
                className="absolute left-8 sm:left-12 top-8 bottom-8 w-0.5"
                style={{
                  background: `linear-gradient(to bottom, ${colors.teal}, ${colors.lilac})`,
                }}
              />

              <div className="space-y-8">
                {sortedExperiences.map((exp, index) => {
                  const isCurrent = !exp.endDate;
                  const color = getArtisticColor(index);
                  return (
                    <div 
                      key={exp.id}
                      className="relative pl-12 sm:pl-16 group"
                      style={{
                        animation: `artisticSlideIn 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      {/* Timeline Node */}
                      <div 
                        className="absolute left-6 sm:left-10 top-1 w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 0 4px ${colors.canvas}, 0 0 12px ${color}60`,
                        }}
                      />

                      {/* Experience Content */}
                      <div className="transition-all duration-300 hover:translate-x-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 
                              className="text-lg font-bold"
                              style={{ color: colors.inkBlack }}
                            >
                              {exp.title}
                            </h3>
                            <p style={{ color: color }} className="font-medium">{exp.company}</p>
                          </div>
                          <span 
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: `${colors.sage}30`,
                              color: colors.darkGray,
                            }}
                          >
                            {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                            {isCurrent && (
                              <span 
                                className="inline-block w-2 h-2 rounded-full ml-2 animate-pulse"
                                style={{ backgroundColor: colors.emerald }}
                              />
                            )}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exp.industry && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${colors.teal}15`,
                                color: colors.teal,
                              }}
                            >
                              {exp.industry}
                            </span>
                          )}
                          {exp.domain && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${colors.lilac}15`,
                                color: colors.lilac,
                              }}
                            >
                              {exp.domain}
                            </span>
                          )}
                          {exp.location && (
                            <span 
                              className="flex items-center gap-1 text-xs"
                              style={{ color: colors.sage }}
                            >
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          )}
                        </div>

                        {exp.description && (
                          <p 
                            className="text-sm mb-3"
                            style={{ color: colors.darkGray }}
                          >
                            {exp.description}
                          </p>
                        )}

                        {(() => {
                          const responsibilities = toStringArray(exp.keyResponsibilities);
                          return responsibilities.length > 0 ? (
                            <ul className="space-y-1">
                              {responsibilities.slice(0, 4).map((resp, i) => (
                                <li 
                                  key={i} 
                                  className="flex items-start gap-2 text-sm"
                                  style={{ color: colors.darkGray }}
                                >
                                  <span 
                                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span>{String(resp)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SECTION 5: EDUCATION ==================== */}
        {sortedEducations.length > 0 && (
          <section className="py-16">
            <h2 
              className="text-2xl font-bold mb-10 text-center"
              style={{ 
                color: colors.inkBlack,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Education & Learning
            </h2>

            <div className="space-y-5">
              {sortedEducations.map((edu, index) => {
                const color = getArtisticColor(index);
                const cardStyle = getCardStyle(index);
                return (
                  <div 
                    key={edu.id}
                    className="p-6 relative transition-all duration-300 hover:translate-x-1"
                    style={{
                      backgroundColor: cardStyle.bg,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      borderLeft: `4px solid ${cardStyle.accent}`,
                      clipPath: getTornEdge(index),
                      animation: `artisticFadeIn 0.4s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 
                          className="text-lg font-bold flex items-center gap-2"
                          style={{ color: colors.inkBlack }}
                        >
                          <GraduationCap className="w-5 h-5" style={{ color: color }} />
                          {edu.degree}
                        </h3>
                        <p style={{ color: color }} className="font-medium">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <span 
                            className="inline-block mt-1 px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                            }}
                          >
                            {edu.fieldOfStudy}
                          </span>
                        )}
                      </div>
                      <span 
                        className="text-sm"
                        style={{ color: colors.sage }}
                      >
                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                      </span>
                    </div>

                    {(() => {
                      const skills = toStringArray(edu.skillsAcquired);
                      return skills.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${colors.mint}20`,
                                color: colors.teal,
                              }}
                            >
                              {String(skill)}
                            </span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 6: PROJECTS ==================== */}
        {userProjects.length > 0 && (
          <section id="projects" className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: colors.inkBlack,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Gallery of Works
              </h2>
              <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: colors.lilac }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => {
                const color = getArtisticColor(index);
                const cardStyle = getCardStyle(index);
                return (
                  <div 
                    key={project.id}
                    className="overflow-hidden group cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                    style={{
                      backgroundColor: cardStyle.bg,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      clipPath: getTornEdge(index),
                      animation: `artisticFadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    {/* Image with overlay */}
                    <div className="relative h-48 overflow-hidden">
                      {project.thumbnailUrl || (project.mediaUrls && project.mediaUrls[0]) ? (
                        <img 
                          src={project.thumbnailUrl || project.mediaUrls![0]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{
                            background: `linear-gradient(135deg, ${color}30 0%, ${colors.sage}30 100%)`,
                          }}
                        />
                      )}
                      
                      {/* Gradient overlay */}
                      <div 
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to top, ${cardStyle.bg} 0%, transparent 60%)`,
                        }}
                      />

                      {/* Category badge */}
                      {project.category && (
                        <span 
                          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: color,
                            color: "white",
                          }}
                        >
                          {project.category}
                        </span>
                      )}

                      {/* Hover CTA */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: `${colors.inkBlack}40` }}
                      >
                        <span 
                          className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: colors.canvas,
                            color: colors.inkBlack,
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 
                        className="text-lg font-bold mb-2 transition-colors"
                        style={{ color: colors.inkBlack }}
                      >
                        {project.title}
                      </h3>
                      {project.description && (
                        <p 
                          className="text-sm line-clamp-2 mb-3"
                          style={{ color: colors.darkGray }}
                        >
                          {project.description}
                        </p>
                      )}

                      {project.industry && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${colors.teal}15`,
                            color: colors.teal,
                          }}
                        >
                          {project.industry}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 7: SERVICES (PREMIUM) ==================== */}
        {isPremium && userServices.length > 0 && (
          <section className="py-16">
            <div className="text-center mb-10">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: colors.inkBlack,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Services & Offerings
              </h2>
              <div className="w-24 h-1 mx-auto rounded" style={{ backgroundColor: colors.burgundy }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.filter(s => s.isActive !== false).map((service, index) => {
                const color = getArtisticColor(index);
                const cardStyle = getCardStyle(index);
                return (
                  <div 
                    key={service.id}
                    className="p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
                    style={{
                      backgroundColor: cardStyle.bg,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      borderTop: `4px solid ${cardStyle.accent}`,
                      clipPath: getTornEdge(index),
                      animation: `artisticFadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Service Image/Icon */}
                    <div className="mb-4">
                      {service.imageUrl ? (
                        <img 
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Sparkles className="w-8 h-8" style={{ color: color }} />
                        </div>
                      )}
                    </div>

                    <h3 
                      className="text-xl font-bold mb-1"
                      style={{ color: colors.inkBlack }}
                    >
                      {service.title}
                    </h3>
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-xs mb-3"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {service.category}
                    </span>

                    {/* Pricing */}
                    <div className="mb-3">
                      {service.priceInr && (
                        <span 
                          className="text-xl font-bold"
                          style={{ color: colors.burgundy }}
                        >
                          ₹{service.priceInr.toLocaleString()}
                          {service.isHourly && (
                            <span className="text-sm font-normal" style={{ color: colors.sage }}>/hr</span>
                          )}
                        </span>
                      )}
                      {service.priceUsd && (
                        <span className="text-sm ml-2" style={{ color: colors.sage }}>
                          (${service.priceUsd}{service.isHourly ? '/hr' : ''})
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p 
                        className="text-sm mb-4"
                        style={{ color: colors.darkGray }}
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
                              style={{ color: colors.darkGray }}
                            >
                              <Check 
                                className="w-4 h-4 flex-shrink-0" 
                                style={{ color: colors.emerald }} 
                              />
                              <span>{String(feature)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null;
                    })()}

                    {/* CTA */}
                    <button 
                      onClick={() => setIsMentorshipDialogOpen(true)}
                      className="w-full py-3 rounded-lg font-medium text-sm transition-all duration-300 hover:translate-y-[-2px]"
                      style={{
                        backgroundColor: color,
                        color: "white",
                        boxShadow: `0 4px 12px ${color}40`,
                      }}
                    >
                      Let's Collaborate
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer 
          className="py-12 text-center"
          style={{ borderTop: `1px solid ${colors.clay}` }}
        >
          <p 
            className="text-sm"
            style={{ color: colors.sage }}
          >
            © {new Date().getFullYear()} {userInfo.name}. Built with Brandentifier.
          </p>
        </footer>
      </div>

      {/* ==================== PROJECT MODAL ==================== */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: colors.canvas,
            border: `1px solid ${colors.clay}`,
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl font-bold"
                  style={{ 
                    color: colors.inkBlack,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {selectedProject.title}
                </DialogTitle>
                {selectedProject.category && (
                  <span 
                    className="inline-block w-fit px-3 py-1 rounded text-sm mt-2"
                    style={{
                      backgroundColor: `${colors.teal}20`,
                      color: colors.teal,
                    }}
                  >
                    {selectedProject.category}
                  </span>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Image */}
                {(selectedProject.thumbnailUrl || (selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0)) && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={selectedProject.thumbnailUrl || selectedProject.mediaUrls![0]}
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
                      style={{ color: colors.teal }}
                    >
                      Description
                    </h4>
                    <p style={{ color: colors.darkGray }}>{selectedProject.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.startDate && (
                    <div>
                      <h4 
                        className="font-medium text-sm mb-1"
                        style={{ color: colors.lilac }}
                      >
                        Timeline
                      </h4>
                      <p 
                        className="flex items-center gap-2"
                        style={{ color: colors.darkGray }}
                      >
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedProject.startDate)}
                      </p>
                    </div>
                  )}
                  {selectedProject.industry && (
                    <div>
                      <h4 
                        className="font-medium text-sm mb-1"
                        style={{ color: colors.lilac }}
                      >
                        Industry
                      </h4>
                      <p style={{ color: colors.darkGray }}>{selectedProject.industry}</p>
                    </div>
                  )}
                </div>

                {/* Project Link */}
                {selectedProject.projectUrl && (
                  <a 
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: colors.teal,
                      color: "white",
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
      {userInfo.id && (
        <MentorshipDialog
          isOpen={isMentorshipDialogOpen}
          onOpenChange={setIsMentorshipDialogOpen}
          mentorId={userInfo.id}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes artisticFloat {
          0%, 100% { 
            transform: translateY(0); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }

        @keyframes artisticFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes artisticSlideIn {
          from { 
            opacity: 0; 
            transform: translateX(-20px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
