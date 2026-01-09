import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Education, Project as ProjectSchema, Service, Skill, WorkExperience } from "@shared/schema";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { MentorshipButton } from "@/components/shared/mentorship-button";
import { MentorshipDialog } from "@/components/shared/mentorship-dialog";
import { 
  Mail, MapPin, Calendar, Download, FileText, ChevronRight,
  Briefcase, GraduationCap, Award, Target, ChartBar,
  TrendingUp, Globe, Star, Building, ExternalLink, Play, 
  Image, Eye, Tag, Lightbulb, Heart, Sparkles, Users, Hash,
  Zap, Code, Layers, Clock, ArrowRight, X
} from "lucide-react";

interface Project extends Omit<ProjectSchema, 'mediaUrls'> {
  mediaUrls?: string[];
}

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  if (Array.isArray((v as any)?.values)) return (v as any).values.map(String);
  return [];
};

interface HolographicNeoProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    company?: string | null;
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

export default function HolographicNeo({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId,
  isPremium = false
}: HolographicNeoProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isDesktop, setIsDesktop] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDevice = () => {
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      const isWide = window.innerWidth >= 768;
      setIsDesktop(hasPointer && isWide);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    setTimeout(() => setIsLoaded(true), 300);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDesktop || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  }, [isDesktop]);

  const sortedSkills = useMemo(() => 
    [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0)), 
    [userSkills]
  );

  const sortedExperiences = useMemo(() => 
    [...userExperiences].sort((a, b) => 
      new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
    ), 
    [userExperiences]
  );

  const sortedProjects = useMemo(() => 
    [...userProjects].sort((a, b) => 
      new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
    ), 
    [userProjects]
  );

  const sortedEducations = useMemo(() => 
    [...userEducations].sort((a, b) => 
      new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
    ), 
    [userEducations]
  );

  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      isCyan: i % 2 === 0
    })), 
    []
  );

  const selectedProject = selectedProjectId 
    ? userProjects.find(p => p.id === selectedProjectId) 
    : null;

  const coreValues = toStringArray(userInfo.coreValues);
  const primaryAudience = toStringArray(userInfo.primaryAudience);
  const secondaryAudience = toStringArray(userInfo.secondaryAudience);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{
        background: 'linear-gradient(135deg, #080a16 0%, #0a0a1e 50%, #0d0d24 100%)',
      }}
    >
      {/* Holographic Background Gradient - Mouse Tracked */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
        style={{
          background: isDesktop 
            ? `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
                rgba(34, 211, 238, 0.15) 0%, 
                rgba(167, 139, 251, 0.1) 25%, 
                transparent 60%)`
            : 'radial-gradient(ellipse at 50% 30%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)',
          opacity: isLoaded ? 1 : 0,
        }}
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 211, 238, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Particle System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {particles.map(particle => (
          <div 
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: particle.isCyan 
                ? 'rgba(34, 211, 238, 0.6)' 
                : 'rgba(167, 139, 251, 0.6)',
              boxShadow: particle.isCyan
                ? '0 0 6px rgba(34, 211, 238, 0.8)'
                : '0 0 6px rgba(167, 139, 251, 0.8)',
              animation: `holographicFloat ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Scanline Animation */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div 
          className="absolute w-full h-24 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"
          style={{
            animation: 'holographicScanline 8s linear infinite',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================== SECTION 1: HERO HEADER ==================== */}
        <section className="min-h-screen flex items-center py-20">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left: Profile Column */}
            <div 
              className={`flex flex-col items-center lg:items-start space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {/* Profile Picture with Holographic Rings */}
              <div className="relative">
                {/* Outer Glow Ring */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #22d3ee, #a78bfa, #22d3ee)',
                    filter: 'blur(8px)',
                    transform: 'scale(1.15)',
                    animation: 'holographicRotate 6s linear infinite',
                    opacity: 0.6,
                  }}
                />
                {/* Inner Ring */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                  style={{
                    transform: 'scale(1.08)',
                    animation: 'holographicPulse 3s ease-in-out infinite',
                  }}
                />
                {/* Profile Image Container */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden border-2 border-white/20">
                  {userInfo.photoURL ? (
                    <img 
                      src={userInfo.photoURL} 
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=22d3ee&color=fff&size=256`;
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=22d3ee&color=fff&size=256`}
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Name */}
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center lg:text-left"
                style={{
                  fontFamily: "'Sora', sans-serif",
                  color: '#fff',
                  textShadow: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)',
                }}
              >
                {userInfo.name || "Your Name"}
              </h1>

              {/* Title & Company */}
              <p 
                className="text-xl sm:text-2xl text-cyan-200/90 font-light text-center lg:text-left"
                style={{
                  textShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                }}
              >
                {userInfo.title || "Your Designation"}
                {userInfo.company && (
                  <span className="text-purple-300/80"> at {userInfo.company}</span>
                )}
              </p>

              {/* Tagline */}
              {userInfo.tagline && (
                <p 
                  className="text-lg text-white/70 italic text-center lg:text-left max-w-md"
                  style={{
                    textShadow: '0 0 5px rgba(167, 139, 251, 0.3)',
                  }}
                >
                  "{userInfo.tagline}"
                </p>
              )}

              {/* Location & Industry Tags */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {userInfo.location && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                    style={{
                      background: 'rgba(34, 211, 238, 0.15)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)',
                    }}
                  >
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-100">{userInfo.location}</span>
                  </div>
                )}
                {userInfo.industry && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                    style={{
                      background: 'rgba(167, 139, 251, 0.15)',
                      border: '1px solid rgba(167, 139, 251, 0.3)',
                      boxShadow: '0 0 15px rgba(167, 139, 251, 0.2)',
                    }}
                  >
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-100">{userInfo.industry}</span>
                  </div>
                )}
                {userInfo.domain && (
                  <div 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                    style={{
                      background: 'rgba(167, 139, 251, 0.15)',
                      border: '1px solid rgba(167, 139, 251, 0.3)',
                      boxShadow: '0 0 15px rgba(167, 139, 251, 0.2)',
                    }}
                  >
                    <Hash className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-100">{userInfo.domain}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: CTA Panel */}
            <div 
              className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div 
                className="p-6 sm:p-8 rounded-2xl"
                style={{
                  background: 'rgba(10, 10, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(34, 211, 238, 0.15), inset 0 0 0 1px rgba(34, 211, 238, 0.1)',
                }}
              >
                <h3 
                  className="text-xl font-semibold text-white mb-6"
                  style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}
                >
                  Let's Connect
                </h3>

                <div className="space-y-4">
                  {/* Let's Talk CTA */}
                  <button 
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] group"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(167, 139, 251, 0.3) 100%)',
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
                    }}
                    onClick={() => setIsMentorshipDialogOpen(true)}
                    data-testid="button-lets-talk"
                  >
                    <Mail className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                    <span className="text-white">Let's Talk</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Download Resume CTA */}
                  {userInfo.resumeUrl && (
                    <a 
                      href={userInfo.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] group"
                      style={{
                        background: 'rgba(167, 139, 251, 0.15)',
                        border: '1px solid rgba(167, 139, 251, 0.3)',
                        boxShadow: '0 0 15px rgba(167, 139, 251, 0.15)',
                      }}
                    >
                      <Download className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                      <span className="text-white">Download Resume</span>
                    </a>
                  )}

                  {/* Connect Button */}
                  <button 
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] group"
                    style={{
                      background: 'rgba(34, 211, 238, 0.15)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      boxShadow: '0 0 15px rgba(34, 211, 238, 0.15)',
                    }}
                    onClick={() => setIsMentorshipDialogOpen(true)}
                  >
                    <Users className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                    <span className="text-white">Connect</span>
                  </button>
                </div>

                {/* Scanline Effect on Card */}
                <div 
                  className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20"
                  aria-hidden="true"
                >
                  <div 
                    className="absolute w-full h-8 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
                    style={{
                      animation: 'holographicScanline 4s linear infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: ABOUT ME ==================== */}
        {(userInfo.aboutMe || userInfo.uniqueValueProposition || coreValues.length > 0) && (
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
            >
              About Me
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: About, Vision, Mission */}
              <div className="space-y-6">
                {/* About Me Card */}
                {userInfo.aboutMe && (
                  <div 
                    className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                    style={{
                      background: 'rgba(10, 10, 30, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 5px 20px rgba(34, 211, 238, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Professional Summary
                    </h3>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {userInfo.aboutMe}
                    </p>
                  </div>
                )}

                {/* Vision Statement */}
                {userInfo.visionStatement && (
                  <div 
                    className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(10, 10, 30, 0.8) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(34, 211, 238, 0.2)',
                      boxShadow: '0 5px 20px rgba(34, 211, 238, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Vision
                    </h3>
                    <p className="break-all break-all text-white/90 italic">"{userInfo.visionStatement}"</p>
                  </div>
                )}

                {/* Mission Statement */}
                {userInfo.missionStatement && (
                  <div 
                    className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(167, 139, 251, 0.1) 0%, rgba(10, 10, 30, 0.8) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(167, 139, 251, 0.2)',
                      boxShadow: '0 5px 20px rgba(167, 139, 251, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Mission
                    </h3>
                    <p className="text-white/90 italic">"{userInfo.missionStatement}"</p>
                  </div>
                )}

                {/* Core Values - Now below Mission */}
                {coreValues.length > 0 && (
                  <div 
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(10, 10, 30, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Core Values
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {coreValues.map((value, i) => (
                        <span 
                          key={i}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(167, 139, 251, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                            border: '1px solid rgba(167, 139, 251, 0.3)',
                            color: '#e9d5ff',
                            boxShadow: '0 0 10px rgba(167, 139, 251, 0.2)',
                            animation: `holographicPulse ${3 + i * 0.5}s ease-in-out infinite`,
                          }}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: UVP & Audience */}
              <div className="space-y-6">
                {/* Unique Value Proposition */}
                {userInfo.uniqueValueProposition && (
                  <div 
                    className="p-8 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(167, 139, 251, 0.15) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)',
                    }}
                  >
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      What Sets Me Apart
                    </h3>
                    <p 
                      className="text-2xl sm:text-3xl font-bold text-white leading-snug"
                      style={{
                        textShadow: '0 0 20px rgba(34, 211, 238, 0.4)',
                      }}
                    >
                      {userInfo.uniqueValueProposition}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ==================== SECTION 3: SKILLS ==================== */}
        {sortedSkills.length > 0 && (
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
            >
              Skills & Expertise
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSkills.map((skill, index) => (
                <div 
                  key={skill.id}
                  className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] hover:scale-[1.02] group"
                  style={{
                    background: 'rgba(10, 10, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 5px 20px rgba(34, 211, 238, 0.1)',
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Circular Progress Ring */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="url(#skillGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${((skill.proficiency || 3) / 5) * 176} 176`}
                          className="transition-all duration-700"
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                          }}
                        />
                        <defs>
                          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#a78bfa" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{skill.proficiency || 3}</span>
                      </div>
                    </div>

                    {/* Skill Info */}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {skill.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skill.level && (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-xs"
                            style={{
                              background: 'rgba(167, 139, 251, 0.2)',
                              color: '#e9d5ff',
                            }}
                          >
                            {skill.level}
                          </span>
                        )}
                        {(skill as any).category && (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-xs"
                            style={{
                              background: 'rgba(34, 211, 238, 0.2)',
                              color: '#67e8f9',
                            }}
                          >
                            {(skill as any).category}
                          </span>
                        )}
                        {(skill as any).yearsOfExperience && (
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-xs"
                            style={{
                              background: 'rgba(74, 222, 128, 0.2)',
                              color: '#86efac',
                            }}
                          >
                            {(skill as any).yearsOfExperience}y
                          </span>
                        )}
                      </div>
                      {/* Stars */}
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${star <= (skill.proficiency || 3) ? 'text-cyan-400 fill-cyan-400' : 'text-white/20'}`}
                            style={{
                              filter: star <= (skill.proficiency || 3) ? 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.6))' : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== SECTION 4: EXPERIENCE ==================== */}
        {sortedExperiences.length > 0 && (
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
            >
              Professional Experience
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div 
                className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5"
                style={{
                  background: 'linear-gradient(to bottom, rgba(34, 211, 238, 0.5), rgba(167, 139, 251, 0.5))',
                  boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                }}
              />

              <div className="space-y-8">
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id}
                    className="relative pl-12 sm:pl-20"
                    style={{
                      animation: `holographicFadeIn 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Timeline Node */}
                    <div 
                      className="absolute left-2 sm:left-6 top-6 w-4 h-4 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                        boxShadow: '0 0 15px rgba(34, 211, 238, 0.6)',
                        animation: 'holographicPulse 2s ease-in-out infinite',
                      }}
                    />

                    {/* Experience Card */}
                    <div 
                      className="p-6 rounded-2xl transition-all duration-300 hover:translate-x-2"
                      style={{
                        background: 'rgba(10, 10, 30, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 5px 20px rgba(34, 211, 238, 0.1)',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                          <p className="text-cyan-400 font-medium flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {exp.company}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                            style={{
                              background: 'rgba(34, 211, 238, 0.15)',
                              border: '1px solid rgba(34, 211, 238, 0.3)',
                              color: '#a5f3fc',
                            }}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Industry/Domain/Location Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.industry && (
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              background: 'rgba(167, 139, 251, 0.15)',
                              color: '#e9d5ff',
                            }}
                          >
                            {String(exp.industry)}
                          </span>
                        )}
                        {exp.domain && (
                          <span 
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              background: 'rgba(167, 139, 251, 0.15)',
                              color: '#e9d5ff',
                            }}
                          >
                            {String(exp.domain)}
                          </span>
                        )}
                        {exp.location && (
                          <span 
                            className="px-2 py-1 rounded text-xs flex items-center gap-1"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#e2e8f0',
                            }}
                          >
                            <MapPin className="w-3 h-3" />
                            {String(exp.location)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {exp.description && (
                        <p className="text-white/70 text-sm mb-4">{String(exp.description)}</p>
                      )}

                      {/* Key Responsibilities */}
                      {exp.keyResponsibilities && toStringArray(exp.keyResponsibilities).length > 0 && (
                        <ul className="space-y-2">
                          {toStringArray(exp.keyResponsibilities).slice(0, 5).map((resp, i) => (
                            <li 
                              key={i}
                              className="flex items-start gap-2 text-white/80 text-sm"
                              style={{
                                animation: `holographicSlideIn 0.3s ease-out ${i * 0.1}s both`,
                              }}
                            >
                              <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                              <span>{String(resp)}</span>
                            </li>
                          ))}
                        </ul>
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
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 20px rgba(167, 139, 251, 0.4)' }}
            >
              Education
            </h2>

            <div className="relative">
              {/* Timeline Line */}
              <div 
                className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5"
                style={{
                  background: 'linear-gradient(to bottom, rgba(167, 139, 251, 0.5), rgba(34, 211, 238, 0.5))',
                  boxShadow: '0 0 10px rgba(167, 139, 251, 0.3)',
                }}
              />

              <div className="space-y-6">
                {sortedEducations.map((edu, index) => (
                  <div 
                    key={edu.id}
                    className="relative pl-12 sm:pl-20"
                  >
                    {/* Timeline Node */}
                    <div 
                      className="absolute left-2 sm:left-6 top-6 w-4 h-4 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                        boxShadow: '0 0 12px rgba(167, 139, 251, 0.5)',
                      }}
                    />

                    {/* Education Card */}
                    <div 
                      className="p-6 rounded-2xl transition-all duration-300 hover:translate-x-2"
                      style={{
                        background: 'rgba(10, 10, 30, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 5px 20px rgba(167, 139, 251, 0.1)',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-400" />
                            {edu.degree}
                          </h3>
                          <p className="text-purple-300 font-medium">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-white/60 text-sm mt-1">{edu.fieldOfStudy}</p>
                          )}
                        {edu.domain && (
                          <p className="text-purple-300/80 text-sm mt-1">{String(edu.domain)}</p>
                        )}
                        {/* Industry & Location */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {edu.industry && (
                            <span 
                              className="px-2 py-1 rounded text-xs flex items-center gap-1"
                              style={{
                                background: 'rgba(167, 139, 251, 0.15)',
                                color: '#e9d5ff',
                              }}
                            >
                              <Briefcase className="w-3 h-3" />
                              {String(edu.industry)}
                            </span>
                          )}
                          {edu.location && (
                            <span 
                              className="px-2 py-1 rounded text-xs flex items-center gap-1"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#e2e8f0',
                              }}
                            >
                              <MapPin className="w-3 h-3" />
                              {String(edu.location)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 self-start"
                        style={{
                          background: 'rgba(167, 139, 251, 0.15)',
                          border: '1px solid rgba(167, 139, 251, 0.3)',
                          color: '#e9d5ff',
                        }}
                      >
                        <Calendar className="w-3 h-3" />
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </span>
                    </div>

                      {/* Skills Acquired */}
                      {edu.skillsAcquired && toStringArray(edu.skillsAcquired).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {toStringArray(edu.skillsAcquired).map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                background: 'rgba(34, 211, 238, 0.1)',
                                color: '#a5f3fc',
                              }}
                            >
                              {String(skill)}
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

        {/* ==================== SECTION 6: PROJECTS ==================== */}
        {sortedProjects.length > 0 && (
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
            >
              Featured Projects
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:scale-[1.02]"
                  style={{
                    background: 'rgba(10, 10, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 5px 20px rgba(34, 211, 238, 0.1)',
                  }}
                  onClick={() => setSelectedProjectId(project.id)}
                  data-testid={`card-project-${project.id}`}
                >
                  {/* Project Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {project.mediaUrls && project.mediaUrls[0] ? (
                      <img 
                        src={project.mediaUrls[0]}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(167, 139, 251, 0.2) 100%)',
                        }}
                      >
                        <Layers className="w-12 h-12 text-cyan-400/50" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to top, rgba(10, 10, 30, 0.95) 0%, rgba(10, 10, 30, 0.5) 100%)',
                      }}
                    >
                      <button 
                        className="px-4 py-2 rounded-full flex items-center gap-2 font-medium"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(167, 139, 251, 0.3) 100%)',
                          border: '1px solid rgba(34, 211, 238, 0.4)',
                        }}
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span className="text-white text-sm">View Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    
                    {project.category && (
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs mb-3"
                        style={{
                          background: 'rgba(167, 139, 251, 0.2)',
                          color: '#e9d5ff',
                        }}
                      >
                        {project.category}
                      </span>
                    )}

                    {/* Industry Tag */}
                    {project.industry && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span 
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: 'rgba(34, 211, 238, 0.1)',
                            color: '#a5f3fc',
                          }}
                        >
                          {project.industry}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== SECTION 7: SERVICES (PREMIUM) ==================== */}
        {isPremium && userServices.length > 0 && (
          <section className="py-20">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center"
              style={{ textShadow: '0 0 20px rgba(167, 139, 251, 0.4)' }}
            >
              Services & Offerings
            </h2>
            <p className="text-center text-white/60 mb-12">What I can help you with</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userServices.filter(s => s.isActive !== false).map((service, index) => (
                <div 
                  key={service.id}
                  className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: 'rgba(10, 10, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 5px 20px rgba(167, 139, 251, 0.1)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    {service.imageUrl ? (
                      <img 
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(167, 139, 251, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                        }}
                      >
                        <Briefcase className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{service.title}</h3>
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-xs mt-1"
                        style={{
                          background: 'rgba(167, 139, 251, 0.2)',
                          color: '#e9d5ff',
                        }}
                      >
                        {service.category}
                      </span>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-white/70 mt-4 text-sm">{service.description}</p>
                  )}

                  {/* Pricing */}
                  <div className="mt-4 flex items-center gap-4">
                    {service.priceInr && (
                      <span 
                        className="text-lg font-bold"
                        style={{
                          color: '#22d3ee',
                          textShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                        }}
                      >
                        ₹{String(service.priceInr)}
                        {service.isHourly && <span className="text-sm font-normal text-white/60">/hr</span>}
                      </span>
                    )}
                    {service.priceUsd && (
                      <span className="text-white/60 text-sm">
                        (${String(service.priceUsd)}{service.isHourly ? '/hr' : ''})
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  {service.features && toStringArray(service.features).length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {toStringArray(service.features).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                          <Zap className="w-4 h-4 text-cyan-400" />
                          {String(feature)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  <button 
                    className="w-full mt-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(167, 139, 251, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)',
                      border: '1px solid rgba(167, 139, 251, 0.3)',
                    }}
                    onClick={() => setIsMentorshipDialogOpen(true)}
                  >
                    <span className="text-white">Book a Consultation</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 text-center">
          <p className="text-white/40 text-sm">
            Built with <span className="text-cyan-400">Brandentifier</span>
          </p>
        </footer>
      </div>

      {/* ==================== PROJECT DETAIL MODAL ==================== */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            background: 'rgba(10, 10, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            boxShadow: '0 20px 60px rgba(34, 211, 238, 0.2)',
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl font-bold"
                  style={{
                    color: '#fff',
                    textShadow: '0 0 15px rgba(34, 211, 238, 0.4)',
                  }}
                >
                  {selectedProject.title}
                </DialogTitle>
                {selectedProject.category && (
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm mt-2 w-fit"
                    style={{
                      background: 'rgba(167, 139, 251, 0.2)',
                      border: '1px solid rgba(167, 139, 251, 0.3)',
                      color: '#e9d5ff',
                    }}
                  >
                    {selectedProject.category}
                  </span>
                )}
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Image Gallery */}
                {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                  <div className="rounded-xl overflow-hidden">
                    <img 
                      src={selectedProject.mediaUrls[0]}
                      alt={selectedProject.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                {selectedProject.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Description</h4>
                    <p className="text-white/80">{selectedProject.description}</p>
                  </div>
                )}

                {/* Timeline & Industry */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.startDate && (
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-400 mb-1">Timeline</h4>
                      <p className="text-white/80 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedProject.startDate)}
                      </p>
                    </div>
                  )}
                  {selectedProject.industry && (
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-1">Industry</h4>
                      <p className="text-white/80">{selectedProject.industry}</p>
                    </div>
                  )}
                </div>

                {/* Project Link */}
                {selectedProject.projectUrl && (
                  <a 
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(167, 139, 251, 0.2) 100%)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                    }}
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">View Live Project</span>
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
        @keyframes holographicFloat {
          0%, 100% { 
            transform: translateY(0) translateX(0); 
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-10px) translateX(-10px); 
            opacity: 0.5;
          }
          75% { 
            transform: translateY(15px) translateX(5px); 
            opacity: 0.7;
          }
        }

        @keyframes holographicRotate {
          from { transform: rotate(0deg) scale(1.15); }
          to { transform: rotate(360deg) scale(1.15); }
        }

        @keyframes holographicPulse {
          0%, 100% { 
            transform: scale(1.08); 
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.12); 
            opacity: 0.8;
          }
        }

        @keyframes holographicScanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }

        @keyframes holographicFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes holographicSlideIn {
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
