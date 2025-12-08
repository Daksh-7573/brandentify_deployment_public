import React, { useState } from "react";
import { Mail, MapPin, Briefcase, Building2, GraduationCap, Code, Zap, Share2, ExternalLink, ChevronRight, Award, Users, TrendingUp, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreativeQuantumPortfolioProps {
  userInfo: {
    name: string;
    title?: string | null;
    photoURL?: string | null;
    tagline?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    email?: string | null;
    aboutMe?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    uniqueValueProposition?: string | null;
    coreValues?: string[] | null;
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
    lookingFor?: string | null;
    resumeUrl?: string | null;
  };
  userSkills: Array<{ id: number; name: string; level: string; proficiency?: number | null }>;
  userExperiences: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    keyResponsibilities?: string[] | null;
  }>;
  userEducations?: Array<{
    id: number;
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string | null;
    fieldOfStudy?: string | null;
    industry?: string | null;
    skillsAcquired?: string[] | null;
  }>;
  userProjects: Array<{
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    startDate?: string | null;
    projectUrl?: string | null;
    mediaUrls?: string[];
    industry?: string | null;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    priceInr?: number | null;
    priceUsd?: number | null;
    features?: string[] | null;
  }>;
  isPremium?: boolean;
  currentUserId?: number;
}

const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") return v.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  if (Array.isArray((v as any)?.values)) return (v as any).values.map(String);
  return [];
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

const SectionBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full py-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F2C] to-[#1F1B44] z-0">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJBMkE0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-20"></div>
    </div>
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </div>
);

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.2)]"></div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const CTAButton = ({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) => {
  const content = (
    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-md text-cyan-400 text-sm font-medium inline-flex items-center border border-blue-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] hover:bg-blue-800/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300 cursor-pointer">
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <div onClick={onClick}>{content}</div>;
};

const SkillBar = ({ value }: { value: number | undefined }) => {
  const fill = Math.min(Math.max(value || 3, 1), 5);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all ${i <= fill ? "bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
};

export default function CreativeQuantumPortfolio({
  userInfo,
  userSkills,
  userExperiences,
  userEducations = [],
  userProjects,
  userServices = [],
  isPremium = false,
  currentUserId,
}: CreativeQuantumPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* ==================== SECTION 1: HERO ==================== */}
      <SectionBackground>
        <div className="min-h-[70vh] flex items-center justify-center">
          <GlassCard>
            <div className="p-8 sm:p-12">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-8">
                {/* Profile Picture */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-lg rounded-full opacity-70"></div>
                  <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-r from-cyan-400 to-purple-500 relative">
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-[#0A1A3F] to-[#1F1B44] flex items-center justify-center overflow-hidden border border-white/20">
                      {userInfo.photoURL ? (
                        <img src={userInfo.photoURL} alt={userInfo.name} className="h-full w-full object-cover" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${userInfo.name}&background=0D1117&color=60A5FA`} alt={userInfo.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white text-center mb-2">
                  {userInfo.name}
                </h1>

                {/* Title Badge */}
                {userInfo.title && (
                  <div className="px-4 py-2 rounded-full bg-blue-900/50 backdrop-blur-sm border border-blue-500/30 text-cyan-400 text-sm font-medium inline-flex items-center shadow-[0_0_10px_rgba(34,211,238,0.2)] mb-4">
                    <Zap className="h-4 w-4 mr-2" />
                    {userInfo.title}
                  </div>
                )}

                {/* Tagline */}
                {userInfo.tagline && (
                  <p className="text-white/70 text-lg text-center max-w-md mb-4">{userInfo.tagline}</p>
                )}

                {/* Location & Domain Chips */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {userInfo.location && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-900/30 backdrop-blur-sm border border-blue-500/40 rounded-full">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      <span className="text-white/90 text-sm">{userInfo.location}</span>
                    </div>
                  )}
                  {userInfo.domain && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-purple-900/30 backdrop-blur-sm border border-purple-500/40 rounded-full">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                      </span>
                      <span className="text-purple-300 text-xs font-medium">#{userInfo.domain}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 justify-center">
                <CTAButton onClick={() => window.location.href = `mailto:${userInfo.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Let's Talk
                </CTAButton>
                {userInfo.resumeUrl && (
                  <CTAButton href={userInfo.resumeUrl}>
                    <Download className="h-4 w-4 mr-2" />
                    Grab My Resume
                  </CTAButton>
                )}
                <CTAButton>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  View My Work
                </CTAButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </SectionBackground>

      {/* ==================== SECTION 2: ABOUT ==================== */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement) && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-12">About Me</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {userInfo.aboutMe && (
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-cyan-400 font-semibold mb-3">Professional Story</h3>
                    <p className="text-white/90 leading-relaxed">{userInfo.aboutMe}</p>
                  </div>
                </GlassCard>
              )}
              {userInfo.visionStatement && (
                <GlassCard>
                  <div className="p-6 border-l-4 border-cyan-500">
                    <h4 className="text-cyan-400 text-sm font-semibold mb-2">Vision</h4>
                    <p className="text-white/80 text-sm">{userInfo.visionStatement}</p>
                  </div>
                </GlassCard>
              )}
              {userInfo.missionStatement && (
                <GlassCard>
                  <div className="p-6 border-l-4 border-purple-500">
                    <h4 className="text-purple-400 text-sm font-semibold mb-2">Mission</h4>
                    <p className="text-white/80 text-sm">{userInfo.missionStatement}</p>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {userInfo.uniqueValueProposition && (
                <GlassCard>
                  <div className="p-6">
                    <h3 className="text-cyan-400 font-semibold mb-3">What Makes Me Different</h3>
                    <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold">
                      {userInfo.uniqueValueProposition}
                    </p>
                  </div>
                </GlassCard>
              )}

              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <GlassCard>
                  <div className="p-6">
                    <h4 className="text-purple-400 font-semibold mb-3">Core Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.coreValues.map((value, i) => (
                        <div key={i} className="px-3 py-1 rounded-full bg-purple-900/30 backdrop-blur-sm border border-purple-500/40 text-purple-300 text-xs font-medium">
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}

              {(userInfo.primaryAudience || userInfo.secondaryAudience) && (
                <GlassCard>
                  <div className="p-6">
                    <h4 className="text-cyan-400 font-semibold mb-3">Who I Work Best With</h4>
                    <div className="space-y-2">
                      {userInfo.primaryAudience && userInfo.primaryAudience.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {userInfo.primaryAudience.map((aud, i) => (
                            <span key={i} className="px-2 py-1 text-xs rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300">
                              {aud}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </SectionBackground>
      )}

      {/* ==================== SECTION 3: SKILLS ==================== */}
      {userSkills.length > 0 && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-2">Skills & Focus Areas</h2>
          <p className="text-white/60 mb-12">Tools & strengths that drive my work</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill) => (
              <GlassCard key={skill.id}>
                <div className="p-5">
                  <h4 className="font-semibold text-white mb-2">{skill.name}</h4>
                  {skill.level && <p className="text-xs text-purple-300 mb-3">{skill.level}</p>}
                  <SkillBar value={skill.proficiency ?? 3} />
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionBackground>
      )}

      {/* ==================== SECTION 4: EXPERIENCE ==================== */}
      {userExperiences.length > 0 && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-12">Work Experience</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500 opacity-30"></div>

            <div className="space-y-8">
              {userExperiences.map((exp, idx) => (
                <div key={exp.id} className="relative">
                  {/* Timeline Node */}
                  <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 -translate-y-2 w-4 h-4 rounded-full border-2 border-cyan-500 bg-[#0A0F2C]" style={{ top: "20px" }}></div>

                  {/* Card */}
                  <div className={`ml-8 sm:ml-0 ${idx % 2 === 0 ? "sm:mr-auto sm:w-5/12" : "sm:ml-auto sm:w-5/12"}`}>
                    <GlassCard>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                        <p className="text-cyan-400 text-sm font-medium mb-2">{exp.company}</p>
                        <p className="text-white/60 text-xs mb-3">
                          {formatDate(exp.startDate)} – {exp.endDate ? formatDate(exp.endDate) : "Present"}
                        </p>
                        {exp.description && <p className="text-white/80 text-sm mb-3">{exp.description}</p>}
                        {exp.keyResponsibilities && toStringArray(exp.keyResponsibilities).length > 0 && (
                          <ul className="space-y-1">
                            {toStringArray(exp.keyResponsibilities).slice(0, 3).map((resp, i) => (
                              <li key={i} className="flex gap-2 text-white/70 text-xs">
                                <ChevronRight className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                                <span>{String(resp)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionBackground>
      )}

      {/* ==================== SECTION 5: EDUCATION ==================== */}
      {userEducations.length > 0 && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-12">Education</h2>
          <div className="space-y-4">
            {userEducations.map((edu) => (
              <GlassCard key={edu.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-400" />
                        {edu.degree}
                      </h3>
                      <p className="text-cyan-400 font-medium">{edu.institution}</p>
                    </div>
                    <span className="text-xs text-white/60">
                      {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}
                    </span>
                  </div>
                  {edu.fieldOfStudy && <p className="text-white/70 text-sm mb-2">{edu.fieldOfStudy}</p>}
                  {edu.skillsAcquired && toStringArray(edu.skillsAcquired).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {toStringArray(edu.skillsAcquired).map((skill, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300">
                          {String(skill)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionBackground>
      )}

      {/* ==================== SECTION 6: PROJECTS ==================== */}
      {userProjects.length > 0 && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-2">Selected Projects</h2>
          <p className="text-white/60 mb-12">A snapshot of my recent work</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProjects.map((project) => (
              <GlassCard key={project.id}>
                <div className="cursor-pointer group overflow-hidden rounded-lg" onClick={() => setSelectedProject(project)}>
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-600 to-cyan-600 overflow-hidden">
                    {project.mediaUrls && project.mediaUrls.length > 0 ? (
                      <img src={project.mediaUrls[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Code className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {project.category && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 mb-2">
                        {project.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-white/70 text-sm line-clamp-2">{project.description}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionBackground>
      )}

      {/* ==================== SECTION 7: SERVICES (PREMIUM) ==================== */}
      {isPremium && userServices.length > 0 && (
        <SectionBackground>
          <h2 className="text-3xl font-bold text-white mb-2">How We Can Work Together</h2>
          <p className="text-white/60 mb-12">Services & engagements</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userServices.map((service) => (
              <GlassCard key={service.id}>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1">{service.title}</h3>
                  {service.category && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 mb-3">
                      {service.category}
                    </span>
                  )}
                  {service.description && (
                    <p className="text-white/80 text-sm mb-4">{service.description}</p>
                  )}

                  {/* Pricing */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    {service.priceInr && (
                      <p className="text-cyan-400 font-semibold">
                        ₹{service.priceInr.toLocaleString()}
                        {service.features && service.features.includes("hourly") && " /hr"}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  {service.features && toStringArray(service.features).length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {toStringArray(service.features).slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex gap-2 text-white/70 text-sm">
                          <Zap className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <span>{String(feature)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <CTAButton>
                    <Share2 className="h-4 w-4 mr-2" />
                    Let's Talk
                  </CTAButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </SectionBackground>
      )}

      {/* ==================== PROJECT MODAL ==================== */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl" style={{ background: "rgba(10, 15, 44, 0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
          {selectedProject && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                <img src={selectedProject.mediaUrls[0]} alt={selectedProject.title} className="w-full h-64 object-cover rounded-lg" />
              )}
              {selectedProject.description && (
                <p className="text-white/90">{selectedProject.description}</p>
              )}
              {selectedProject.projectUrl && (
                <a href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                  <ExternalLink className="h-4 w-4" />
                  View Live Project
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
