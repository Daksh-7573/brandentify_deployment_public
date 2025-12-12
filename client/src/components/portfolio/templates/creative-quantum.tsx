import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project as ProjectSchema, Service, Skill, WorkExperience } from "@shared/schema";
import { MentorshipDialog } from "@/components/shared/mentorship-dialog";
import { 
  Mail, MapPin, Calendar, Download, FileText, ChevronRight,
  Briefcase, GraduationCap, Award, Target, Building, ExternalLink,
  Eye, Users, Clock, Check, ArrowRight, Zap, Command, Star
} from "lucide-react";

interface Project extends Omit<ProjectSchema, 'mediaUrls'> {
  mediaUrls?: string[];
}

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  return [];
};

interface CreativeQuantumProps {
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

export default function CreativeQuantum({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId,
  isPremium = false
}: CreativeQuantumProps) {
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
      style={{
        background: 'linear-gradient(135deg, #0A0F2C 0%, #1F1B44 100%)',
      }}
    >
      {/* Grid Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%233b82f6' stroke-opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Circuit SVG Decoration - Top Right */}
      <svg 
        className="fixed top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path d="M180 20 L180 60 L140 60 L140 100 L100 100 L100 140 L60 140 L60 180" 
          fill="none" stroke="url(#circuitGrad)" strokeWidth="2" />
        <circle cx="180" cy="20" r="4" fill="#22d3ee" />
        <circle cx="140" cy="60" r="3" fill="#a78bfa" />
        <circle cx="100" cy="100" r="4" fill="#3b82f6" />
        <circle cx="60" cy="140" r="3" fill="#22d3ee" />
        <circle cx="60" cy="180" r="4" fill="#a78bfa" />
        <rect x="160" y="80" width="30" height="20" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
        <rect x="120" y="120" width="25" height="15" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Chip SVG Decoration - Bottom Left */}
      <svg 
        className="fixed bottom-0 left-0 w-48 h-48 opacity-15 pointer-events-none"
        viewBox="0 0 150 150"
      >
        <rect x="40" y="40" width="70" height="70" rx="4" fill="none" stroke="#22d3ee" strokeWidth="2" />
        <rect x="50" y="50" width="50" height="50" rx="2" fill="none" stroke="#a78bfa" strokeWidth="1" />
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <line x1={55 + i*10} y1="40" x2={55 + i*10} y2="25" stroke="#3b82f6" strokeWidth="2" />
            <line x1={55 + i*10} y1="110" x2={55 + i*10} y2="125" stroke="#3b82f6" strokeWidth="2" />
            <line x1="40" y1={55 + i*10} x2="25" y2={55 + i*10} stroke="#3b82f6" strokeWidth="2" />
            <line x1="110" y1={55 + i*10} x2="125" y2={55 + i*10} stroke="#3b82f6" strokeWidth="2" />
          </g>
        ))}
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ==================== SECTION 1: HERO HEADER ==================== */}
        <section className="min-h-[70vh] flex items-center justify-center py-16">
          <div 
            className="w-full max-w-2xl p-8 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 26, 63, 0.9) 0%, rgba(31, 27, 68, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 25px 80px rgba(34, 211, 238, 0.15), 0 10px 40px rgba(167, 139, 251, 0.1)',
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)',
            }}
          >
            {/* Angled edge accent */}
            <div 
              className="absolute bottom-0 right-0 w-20 h-20"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(34, 211, 238, 0.2) 50%)',
              }}
            />

            {/* Profile Section */}
            <div className="flex flex-col items-center text-center">
              {/* Profile Image with 3-layer glow */}
              <div className="relative mb-6">
                {/* Outer glow layer */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                    filter: 'blur(20px)',
                    opacity: 0.5,
                    transform: 'scale(1.2)',
                    animation: 'quantumPulseSlow 3s ease-in-out infinite',
                  }}
                />
                {/* Middle glow layer */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8B5CF6)',
                    filter: 'blur(10px)',
                    opacity: 0.6,
                    transform: 'scale(1.1)',
                  }}
                />
                {/* Profile image */}
                <div 
                  className="relative w-32 h-32 rounded-full overflow-hidden"
                  style={{
                    border: '3px solid transparent',
                    background: 'linear-gradient(#0A1A3F, #0A1A3F) padding-box, linear-gradient(135deg, #22d3ee, #a78bfa) border-box',
                  }}
                >
                  {userInfo.photoURL ? (
                    <ProfileImage 
                      src={userInfo.photoURL} 
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                      <span className="text-4xl font-bold text-white">{userInfo.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name with gradient */}
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(90deg, #ffffff 0%, #22d3ee 50%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% 100%',
                  animation: 'quantumShimmer 4s ease-in-out infinite',
                }}
              >
                {userInfo.name}
              </h1>

              {/* Title Badge */}
              {userInfo.title && (
                <div 
                  className="inline-flex items-center px-4 py-1.5 rounded-full mb-3"
                  style={{
                    background: 'rgba(30, 58, 138, 0.5)',
                    border: '1px solid rgba(34, 211, 238, 0.4)',
                    boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)',
                  }}
                >
                  <span className="text-cyan-300 text-sm font-medium">{userInfo.title}</span>
                </div>
              )}

              {/* Tagline */}
              {userInfo.tagline && (
                <p className="text-white/70 text-sm mb-6 max-w-md">{userInfo.tagline}</p>
              )}

              {/* Info Chips Row */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {userInfo.location && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-200">{userInfo.location}</span>
                  </div>
                )}
                {userInfo.industry && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: 'rgba(167, 139, 251, 0.15)',
                      border: '1px solid rgba(167, 139, 251, 0.3)',
                    }}
                  >
                    <Building className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-200">{userInfo.industry}</span>
                  </div>
                )}
                {userInfo.domain && (
                  <div 
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      background: 'rgba(34, 211, 238, 0.15)',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                    }}
                  >
                    <Command className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-200">{userInfo.domain}</span>
                    {/* Ping indicator */}
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setIsMentorshipDialogOpen(true)}
                  className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:translate-y-[-2px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(167, 139, 251, 0.3) 100%)',
                    border: '1px solid rgba(34, 211, 238, 0.5)',
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
                    color: '#ffffff',
                  }}
                >
                  Let's Talk
                </button>
                {userInfo.resumeUrl && (
                  <a 
                    href={userInfo.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                      color: '#ffffff',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Grab My Resume
                  </a>
                )}
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167, 139, 251, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                    border: '1px solid rgba(167, 139, 251, 0.5)',
                    boxShadow: '0 0 20px rgba(167, 139, 251, 0.3)',
                    color: '#ffffff',
                  }}
                >
                  View My Work
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2: ABOUT / SNAPSHOT ==================== */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* About Me Card */}
              {userInfo.aboutMe && (
                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(10, 26, 63, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    About Me
                  </h3>
                  <p className="text-white/90 leading-relaxed">{userInfo.aboutMe}</p>
                </div>
              )}

              {/* Vision Card */}
              {userInfo.visionStatement && (
                <div 
                  className="p-5 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(10, 26, 63, 0.7)',
                    borderLeft: '3px solid #22d3ee',
                  }}
                >
                  <h4 className="text-cyan-400 font-medium text-sm mb-2">Vision</h4>
                  <p className="text-white/80 text-sm">{userInfo.visionStatement}</p>
                </div>
              )}

              {/* Mission Card */}
              {userInfo.missionStatement && (
                <div 
                  className="p-5 rounded-xl relative overflow-hidden"
                  style={{
                    background: 'rgba(10, 26, 63, 0.7)',
                    borderLeft: '3px solid #a78bfa',
                  }}
                >
                  <h4 className="text-purple-400 font-medium text-sm mb-2">Mission</h4>
                  <p className="text-white/80 text-sm">{userInfo.missionStatement}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* What Makes Me Different */}
              {userInfo.uniqueValueProposition && (
                <div 
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(10, 26, 63, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(167, 139, 251, 0.2)',
                  }}
                >
                  <h3 className="text-purple-400 font-semibold mb-3">What Makes Me Different</h3>
                  <p 
                    className="text-lg font-medium"
                    style={{
                      background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {userInfo.uniqueValueProposition}
                  </p>
                </div>
              )}

              {/* Core Values */}
              {userInfo.coreValues && toStringArray(userInfo.coreValues).length > 0 && (
                <div 
                  className="p-5 rounded-xl"
                  style={{
                    background: 'rgba(10, 26, 63, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <h4 className="text-white/80 font-medium text-sm mb-3">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {toStringArray(userInfo.coreValues).map((value, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 rounded-full text-xs transition-all duration-300 hover:translate-x-1"
                        style={{
                          background: 'rgba(167, 139, 251, 0.2)',
                          border: '1px solid rgba(167, 139, 251, 0.4)',
                          color: '#e9d5ff',
                          boxShadow: '0 0 10px rgba(167, 139, 251, 0.2)',
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
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(10, 26, 63, 0.6)',
                    }}
                  >
                    <h4 className="text-cyan-400 font-medium text-xs mb-2">Primary Audience</h4>
                    <div className="flex flex-wrap gap-1">
                      {toStringArray(userInfo.primaryAudience).map((aud, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: 'rgba(34, 211, 238, 0.15)',
                            color: '#a5f3fc',
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
                    className="p-4 rounded-xl"
                    style={{
                      background: 'rgba(10, 26, 63, 0.6)',
                    }}
                  >
                    <h4 className="text-purple-400 font-medium text-xs mb-2">Secondary Audience</h4>
                    <div className="flex flex-wrap gap-1">
                      {toStringArray(userInfo.secondaryAudience).map((aud, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: 'rgba(167, 139, 251, 0.15)',
                            color: '#e9d5ff',
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
                className="p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between"
                style={{
                  background: 'rgba(10, 26, 63, 0.5)',
                }}
              >
                {userInfo.lookingFor && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-white/80 text-sm">{userInfo.lookingFor}</span>
                  </div>
                )}
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
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
          <section className="py-20">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.3)' }}
              >
                Skills & Focus Areas
              </h2>
              <p className="text-white/60">Tools & strengths that power my work</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {userSkills.map((skill, index) => {
                const proficiency = getProficiencyLevel(skill);
                return (
                  <div 
                    key={skill.id}
                    className="p-4 rounded-xl transition-all duration-300 hover:translate-y-[-4px] group"
                    style={{
                      background: '#0A1A3F',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      animation: `quantumFadeIn 0.4s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <h4 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {skill.name}
                    </h4>
                    {skill.level && (
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-xs mb-3"
                        style={{
                          background: 'rgba(167, 139, 251, 0.2)',
                          color: '#e9d5ff',
                        }}
                      >
                        {skill.level}
                      </span>
                    )}
                    
                    {/* Proficiency Bars */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level}
                          className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            background: level <= proficiency 
                              ? 'linear-gradient(90deg, #22d3ee, #3b82f6)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: level <= proficiency 
                              ? '0 0 8px rgba(34, 211, 238, 0.5)' 
                              : 'none',
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
          <section className="py-20">
            <h2 
              className="text-3xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 30px rgba(167, 139, 251, 0.3)' }}
            >
              Work Experience
            </h2>

            <div 
              className="p-8 rounded-2xl relative"
              style={{
                background: 'rgba(10, 26, 63, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              {/* Timeline Line */}
              <div 
                className="absolute left-8 sm:left-12 top-8 bottom-8 w-0.5"
                style={{
                  background: 'linear-gradient(to bottom, #22d3ee, #a78bfa)',
                }}
              />

              <div className="space-y-8">
                {sortedExperiences.map((exp, index) => {
                  const isCurrent = !exp.endDate;
                  return (
                    <div 
                      key={exp.id}
                      className="relative pl-12 sm:pl-16 group"
                      style={{
                        animation: `quantumSlideIn 0.5s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      {/* Timeline Node */}
                      <div className="absolute left-6 sm:left-10 top-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)',
                          }}
                        />
                        {isCurrent && (
                          <div 
                            className="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                            style={{
                              background: 'rgba(34, 211, 238, 0.4)',
                            }}
                          />
                        )}
                      </div>

                      {/* Experience Content */}
                      <div className="transition-all duration-300 hover:translate-x-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                            <p className="text-cyan-400 font-medium">{exp.company}</p>
                          </div>
                          <span 
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#93c5fd',
                            }}
                          >
                            {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exp.industry && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                background: 'rgba(167, 139, 251, 0.15)',
                                color: '#e9d5ff',
                              }}
                            >
                              {exp.industry}
                            </span>
                          )}
                          {exp.domain && (
                            <span 
                              className="px-2 py-0.5 rounded text-xs"
                              style={{
                                background: 'rgba(34, 211, 238, 0.15)',
                                color: '#a5f3fc',
                              }}
                            >
                              {exp.domain}
                            </span>
                          )}
                          {exp.location && (
                            <span className="flex items-center gap-1 text-xs text-white/60">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          )}
                        </div>

                        {exp.description && (
                          <p className="text-white/70 text-sm mb-3">{exp.description}</p>
                        )}

                        {(() => {
                          const responsibilities = toStringArray(exp.keyResponsibilities);
                          return responsibilities.length > 0 ? (
                            <ul className="space-y-1">
                              {responsibilities.slice(0, 4).map((resp, i) => (
                                <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
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
          <section className="py-20">
            <h2 
              className="text-3xl font-bold text-white mb-12 text-center"
              style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
            >
              Education & Learning
            </h2>

            <div className="space-y-6">
              {sortedEducations.map((edu, index) => (
                <div 
                  key={edu.id}
                  className="p-6 rounded-xl relative pl-8 transition-all duration-300 hover:translate-x-1"
                  style={{
                    background: 'rgba(10, 26, 63, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderLeft: '3px solid rgba(59, 130, 246, 0.5)',
                    animation: `quantumFadeIn 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Small node */}
                  <div 
                    className="absolute left-[-8px] top-6 w-3 h-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #a78bfa)',
                    }}
                  />

                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        {edu.degree}
                      </h3>
                      <p className="text-blue-300 font-medium">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <span 
                          className="inline-block mt-1 px-2 py-0.5 rounded text-xs"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#93c5fd',
                          }}
                        >
                          {edu.fieldOfStudy}
                        </span>
                      )}
                    </div>
                    <span className="text-white/60 text-sm">
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
                              background: 'rgba(34, 211, 238, 0.1)',
                              color: '#a5f3fc',
                            }}
                          >
                            {String(skill)}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== SECTION 6: PROJECTS ==================== */}
        {userProjects.length > 0 && (
          <section id="projects" className="py-20">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.3)' }}
              >
                Selected Projects
              </h2>
              <p className="text-white/60">A snapshot of my recent work</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => (
                <div 
                  key={project.id}
                  className="rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: '#0A1A3F',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    animation: `quantumFadeIn 0.5s ease-out ${index * 0.1}s both`,
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
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(167, 139, 251, 0.2) 100%)',
                        }}
                      />
                    )}
                    
                    {/* Dark overlay */}
                    <div 
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(to top, rgba(10, 15, 44, 0.95) 0%, rgba(10, 15, 44, 0.3) 100%)',
                      }}
                    />

                    {/* Category badge */}
                    {project.category && (
                      <span 
                        className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: 'rgba(167, 139, 251, 0.8)',
                          color: '#ffffff',
                        }}
                      >
                        {project.category}
                      </span>
                    )}

                    {/* Hover CTA */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                        style={{
                          background: 'rgba(34, 211, 238, 0.3)',
                          border: '1px solid rgba(34, 211, 238, 0.5)',
                          color: '#ffffff',
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Case Study
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-white/70 text-sm line-clamp-2 mb-3">{project.description}</p>
                    )}

                    {/* Industry tag */}
                    {project.industry && (
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-xs"
                        style={{
                          background: 'rgba(34, 211, 238, 0.1)',
                          color: '#a5f3fc',
                        }}
                      >
                        {project.industry}
                      </span>
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
            <div className="text-center mb-12">
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ textShadow: '0 0 30px rgba(167, 139, 251, 0.4)' }}
              >
                Services & Engagements
              </h2>
              <p className="text-white/60">Ways we can work together</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.filter(s => s.isActive !== false).map((service, index) => (
                <div 
                  key={service.id}
                  className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(10, 26, 63, 0.9) 0%, rgba(31, 27, 68, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(167, 139, 251, 0.3)',
                    boxShadow: '0 10px 40px rgba(167, 139, 251, 0.15)',
                    animation: `quantumFadeIn 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Service Image/Icon */}
                  <div className="mb-4">
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
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(167, 139, 251, 0.3) 100%)',
                        }}
                      >
                        <Briefcase className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                  <span 
                    className="inline-block px-2 py-0.5 rounded text-xs mb-3"
                    style={{
                      background: 'rgba(167, 139, 251, 0.2)',
                      color: '#e9d5ff',
                    }}
                  >
                    {service.category}
                  </span>

                  {/* Pricing */}
                  <div className="mb-3">
                    {service.priceInr && (
                      <span 
                        className="text-xl font-bold"
                        style={{
                          color: '#22d3ee',
                          textShadow: '0 0 10px rgba(34, 211, 238, 0.3)',
                        }}
                      >
                        ₹{service.priceInr.toLocaleString()}
                        {service.isHourly && <span className="text-sm font-normal text-white/60">/hr</span>}
                      </span>
                    )}
                    {service.priceUsd && (
                      <span className="text-white/60 text-sm ml-2">
                        (${service.priceUsd}{service.isHourly ? '/hr' : ''})
                      </span>
                    )}
                  </div>

                  {service.description && (
                    <p className="text-white/70 text-sm mb-4">{service.description}</p>
                  )}

                  {/* Features */}
                  {(() => {
                    const features = toStringArray(service.features);
                    return features.length > 0 ? (
                      <ul className="space-y-2 mb-4">
                        {features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span>{String(feature)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}

                  {/* CTA */}
                  <button 
                    onClick={() => setIsMentorshipDialogOpen(true)}
                    className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:translate-y-[-2px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(167, 139, 251, 0.3) 100%)',
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      color: '#ffffff',
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
                    }}
                  >
                    Let's Talk
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 text-center border-t border-white/10">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} {userInfo.name}. Built with Brandentifier.
          </p>
        </footer>
      </div>

      {/* ==================== PROJECT MODAL ==================== */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            background: 'linear-gradient(145deg, rgba(10, 15, 44, 0.98) 0%, rgba(31, 27, 68, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 25px 80px rgba(34, 211, 238, 0.2)',
          }}
        >
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle 
                  className="text-2xl font-bold text-white"
                  style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.4)' }}
                >
                  {selectedProject.title}
                </DialogTitle>
                {selectedProject.category && (
                  <span 
                    className="inline-block w-fit px-3 py-1 rounded-full text-sm mt-2"
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
                {/* Image */}
                {(selectedProject.thumbnailUrl || (selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0)) && (
                  <div className="rounded-xl overflow-hidden">
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
                    <h4 className="text-cyan-400 font-semibold mb-2">Description</h4>
                    <p className="text-white/80">{selectedProject.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.startDate && (
                    <div>
                      <h4 className="text-purple-400 font-medium text-sm mb-1">Timeline</h4>
                      <p className="text-white/80 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedProject.startDate)}
                      </p>
                    </div>
                  )}
                  {selectedProject.industry && (
                    <div>
                      <h4 className="text-purple-400 font-medium text-sm mb-1">Industry</h4>
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:translate-y-[-2px]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(167, 139, 251, 0.2) 100%)',
                      border: '1px solid rgba(34, 211, 238, 0.4)',
                      color: '#ffffff',
                    }}
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
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
        @keyframes quantumPulseSlow {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(1.2);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.25);
          }
        }

        @keyframes quantumShimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }

        @keyframes quantumFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes quantumSlideIn {
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
