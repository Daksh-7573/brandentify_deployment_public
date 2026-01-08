import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, MapPin, ExternalLink, Target, Briefcase, Users, 
  Zap, ChevronDown, ChevronRight, Download, Heart, Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";

const colors = {
  executivePurple: '#7C3AED',
  royalBlack: '#0A0A0A',
  platinumSilver: '#C9CBCF',
  deepCharcoal: '#1A1A1A',
  richNavy: '#0F1A2E',
  pureWhite: '#FFFFFF',
  softWhite: 'rgba(255,255,255,0.9)',
  mutedSilver: 'rgba(255,255,255,0.7)',
  softPurpleGlow: 'rgba(124,58,237,0.35)',
  platinumEdgeGlow: 'rgba(201,203,207,0.25)',
};

interface CEOPortfolioProps {
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
    tagline: string | null;
    visionStatement: string | null;
    missionStatement: string | null;
    coreValues: string[];
    uniqueValueProposition: string | null;
    primaryAudience: string[];
    secondaryAudience: string[];
  };
  userSkills?: Array<{
    id: number;
    name?: string;
    skillName?: string;
    proficiencyLevel?: string | null;
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
    keyResponsibilities?: string[] | any;
  }>;
  userEducations?: Array<{
    id: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate: string;
    endDate?: string | null;
    skillsAcquired?: string[] | any;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string | null;
    mediaUrls?: string[] | any;
    technologies?: string[] | any;
    outcome?: string | null;
    impact?: string | null;
    role?: string | null;
    teamSize?: number | null;
    link?: string | null;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description: string;
    priceUsd?: number | null;
    features?: string[] | any;
  }>;
}

const CEOExecutivePortfolio: React.FC<CEOPortfolioProps> = ({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userEducations = [],
  userProjects = [],
  userServices = [],
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [currentProjectImageIdx, setCurrentProjectImageIdx] = useState<Record<number, number>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  // Parse proficiency level to number
  const parseProficiency = (level: string | null | undefined): number => {
    if (!level) return 3;
    const lower = level.toLowerCase();
    if (lower.includes('beginner')) return 1;
    if (lower.includes('intermediate')) return 2;
    if (lower.includes('advanced')) return 3;
    if (lower.includes('expert')) return 4;
    return 3;
  };

  const achievements = [
    "15+ Years Leading Teams",
    userInfo.industry ? `Expertise in ${userInfo.industry}` : "Visionary Leader",
    userInfo.domain ? `Specialist in ${userInfo.domain}` : "Innovation Pioneer",
  ].filter(a => a);

  const leadingPillars = userInfo.coreValues.length > 0 
    ? userInfo.coreValues.slice(0, 4) 
    : ["Vision", "Strategy", "People", "Execution"];

  const pillarIcons = [Target, Briefcase, Users, Zap];

  // Get current role (latest experience)
  const currentRole = userExperiences && userExperiences.length > 0 
    ? userExperiences[0] 
    : null;

  return (
    <article
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.royalBlack} 0%, ${colors.deepCharcoal} 100%)`,
        color: colors.softWhite,
      }}
    >
      {/* SECTION 1: HERO / EXECUTIVE PROFILE PANEL */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                {/* Profile Image with Dual Rings */}
                <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-6">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `2px solid ${colors.executivePurple}`,
                      boxShadow: `0 0 30px ${colors.softPurpleGlow}, inset 0 0 20px ${colors.softPurpleGlow}`,
                    }}
                  />
                  <div
                    className="absolute inset-3 rounded-full"
                    style={{
                      border: `1px solid ${colors.platinumSilver}`,
                    }}
                  />
                  <img
                    src={userInfo.photoURL || `https://ui-avatars.com/api/?name=${userInfo.name}&background=0A0A0A&color=7C3AED`}
                    alt={userInfo.name}
                    className="absolute inset-4 rounded-full object-cover"
                  />
                </div>

                {/* Name & Title */}
                <h1 className="text-2xl font-bold text-center lg:text-left">{userInfo.name}</h1>
                <p
                  className="text-sm font-semibold tracking-widest mt-2 text-center lg:text-left"
                  style={{ color: colors.executivePurple }}
                >
                  {userInfo.title || "Executive"}
                </p>

                {/* Currently Leading Badge */}
                {currentRole && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 mx-auto lg:mx-0"
                    style={{
                      background: colors.softPurpleGlow,
                      border: `1px solid ${colors.executivePurple}`,
                      color: colors.executivePurple,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: colors.executivePurple }} />
                    Currently at {currentRole.company}
                  </motion.div>
                )}

                {/* Tagline */}
                {userInfo.tagline && (
                  <p className="mt-6 text-sm italic text-center lg:text-left max-w-xs" style={{ color: colors.mutedSilver }}>
                    "{userInfo.tagline}"
                  </p>
                )}
              </motion.div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Value Proposition Banner */}
                {userInfo.uniqueValueProposition && (
                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      background: `linear-gradient(90deg, ${colors.softPurpleGlow}20, transparent)`,
                      borderColor: colors.executivePurple,
                      borderLeft: `4px solid ${colors.executivePurple}`,
                    }}
                  >
                    <p className="font-semibold text-sm uppercase tracking-wide" style={{ color: colors.executivePurple }}>
                      Core Value Proposition
                    </p>
                    <p className="mt-2 text-base">{userInfo.uniqueValueProposition}</p>
                  </div>
                )}

                {/* Achievements Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {achievements.map((achievement, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="p-3 rounded-lg border flex items-start gap-2"
                      style={{
                        borderColor: colors.platinumEdgeGlow,
                        background: 'transparent',
                      }}
                    >
                      <Award size={16} style={{ color: colors.executivePurple, flexShrink: 0, marginTop: '2px' }} />
                      <span className="text-xs font-medium">{achievement}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Contact Info */}
                {userInfo.location && (
                  <div className="flex gap-4 pt-4">
                    <span className="inline-flex items-center gap-2 text-xs" style={{ color: colors.mutedSilver }}>
                      <MapPin size={14} />
                      {userInfo.location}
                    </span>
                  </div>
                )}
                
                {/* CTA Buttons */}
                <div className="pt-6">
                  <PortfolioCtaButtons 
                    variant="corporate" 
                    userId={userInfo.id} 
                    userName={userInfo.name} 
                     
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BOARDROOM SNAPSHOT */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement) && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Boardroom Snapshot
            </h2>

            {/* Executive Summary */}
            {userInfo.aboutMe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12 p-8 rounded-lg"
                style={{
                  background: `linear-gradient(90deg, ${colors.softPurpleGlow}15, transparent)`,
                  borderLeft: `4px solid ${colors.executivePurple}`,
                }}
              >
                <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: colors.executivePurple }}>
                  Executive Summary
                </p>
                <p className="text-base leading-relaxed">{userInfo.aboutMe}</p>
              </motion.div>
            )}

            {/* Vision & Mission Split */}
            {(userInfo.visionStatement || userInfo.missionStatement) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {userInfo.visionStatement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="p-8 rounded-lg border-l-4"
                    style={{
                      background: colors.deepCharcoal,
                      borderColor: colors.executivePurple,
                    }}
                  >
                    <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: colors.executivePurple }}>
                      Vision
                    </p>
                    <p className="text-sm leading-relaxed">{userInfo.visionStatement}</p>
                  </motion.div>
                )}

                {userInfo.missionStatement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="p-8 rounded-lg border-l-4"
                    style={{
                      background: colors.deepCharcoal,
                      borderColor: colors.platinumSilver,
                    }}
                  >
                    <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: colors.platinumSilver }}>
                      Mission
                    </p>
                    <p className="text-sm leading-relaxed">{userInfo.missionStatement}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Core Values Pillars */}
            {userInfo.coreValues && userInfo.coreValues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xs uppercase tracking-widest font-semibold mb-6" style={{ color: colors.executivePurple }}>
                  Leadership Pillars
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {leadingPillars.map((pillar, idx) => {
                    const IconComponent = pillarIcons[idx] || Award;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 rounded-lg border text-center hover:border-opacity-100 transition-all"
                        style={{
                          borderColor: colors.softPurpleGlow,
                          background: colors.deepCharcoal,
                        }}
                      >
                        <IconComponent size={24} style={{ color: colors.executivePurple, margin: '0 auto mb-2' }} />
                        <p className="text-sm font-semibold">{pillar}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 3: LEADERSHIP CAPABILITIES (SKILLS) */}
      {userSkills && userSkills.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Leadership Capabilities
            </h2>

            <div className="space-y-6">
              {userSkills.map((skill, idx) => {
                const skillName = skill.name || skill.skillName || "Skill";
                const proficiency = parseProficiency(skill.proficiencyLevel);
                const years = skill.yearsOfExperience || 0;

                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{skillName}</span>
                        {skill.category && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: colors.softPurpleGlow, color: colors.executivePurple }}>
                            {skill.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: colors.platinumSilver }}>
                        {years > 0 ? `${years}+ years` : ''}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-opacity-20 overflow-hidden" style={{ background: colors.softPurpleGlow }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(proficiency / 4) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 + 0.2 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${colors.executivePurple}, ${colors.platinumSilver})`,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: CAREER TIMELINE */}
      {userExperiences && userExperiences.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Career Timeline
            </h2>

            <div className="space-y-4">
              {userExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-l-2 pl-6 relative cursor-pointer"
                  style={{ borderColor: colors.executivePurple }}
                >
                  <div
                    className="absolute -left-3 w-4 h-4 rounded-full top-1"
                    style={{ background: colors.executivePurple }}
                  />

                  <div
                    className="p-6 rounded-lg border"
                    style={{
                      borderColor: colors.platinumEdgeGlow,
                      background: colors.deepCharcoal,
                    }}
                    onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{exp.title}</h3>
                        <p style={{ color: colors.executivePurple }} className="text-sm font-semibold">
                          {exp.company}
                        </p>
                        <p style={{ color: colors.mutedSilver }} className="text-xs mt-1">
                          {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                        </p>
                        {(exp.location || exp.industry) && (
                          <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: colors.platinumSilver }}>
                            {exp.location && (
                              <span>📍 {exp.location}</span>
                            )}
                            {exp.industry && (
                              <span>🏢 {exp.industry}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${expandedExp === exp.id ? 'rotate-180' : ''}`}
                        style={{ color: colors.executivePurple }}
                      />
                    </div>

                    <AnimatePresence>
                      {expandedExp === exp.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t"
                          style={{ borderColor: colors.platinumEdgeGlow }}
                        >
                          {exp.description && (
                            <p className="text-sm mb-4">{exp.description}</p>
                          )}
                          {Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs uppercase font-semibold" style={{ color: colors.executivePurple }}>
                                Key Responsibilities
                              </p>
                              <ul className="space-y-1">
                                {exp.keyResponsibilities.slice(0, 5).map((resp: any, i: number) => (
                                  <li key={i} className="text-xs flex items-start gap-2">
                                    <span style={{ color: colors.executivePurple }}>•</span>
                                    <span>{typeof resp === 'string' ? resp : resp.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: EDUCATION */}
      {userEducations && userEducations.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Academic Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-lg border-l-4 hover:border-opacity-100 transition-all"
                  style={{
                    borderColor: colors.executivePurple,
                    background: colors.deepCharcoal,
                  }}
                >
                  <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: colors.executivePurple }}>
                    {edu.degree}
                  </p>
                  <h3 className="text-lg font-bold mb-1">{edu.institution}</h3>
                  {edu.fieldOfStudy && (
                    <p style={{ color: colors.mutedSilver }} className="text-sm mb-2">
                      {edu.fieldOfStudy}
                    </p>
                  )}
                  <p style={{ color: colors.platinumSilver }} className="text-xs">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                  {(edu.location || edu.industry) && (
                    <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: colors.mutedSilver }}>
                      {edu.location && (
                        <span>📍 {edu.location}</span>
                      )}
                      {edu.industry && (
                        <span>🏢 {edu.industry}</span>
                      )}
                    </div>
                  )}

                  {Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {edu.skillsAcquired.slice(0, 4).map((skill: any, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: colors.executivePurple,
                            color: colors.executivePurple,
                          }}
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: PROJECTS (CASE STUDIES) */}
      {userProjects && userProjects.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Executive Case Studies
            </h2>

            <div className="space-y-4">
              {userProjects.map((project, idx) => {
                const images = Array.isArray(project.mediaUrls) ? project.mediaUrls.filter((url: any) => url) : [];
                const currentImageIdx = currentProjectImageIdx[project.id] || 0;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:border-opacity-100 transition-all"
                    style={{
                      borderColor: colors.platinumEdgeGlow,
                      background: colors.deepCharcoal,
                    }}
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  >
                    <div className="p-6 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                        {project.role && (
                          <p style={{ color: colors.executivePurple }} className="text-sm font-semibold mb-1">
                            Role: {project.role}
                          </p>
                        )}
                        {project.description && (
                          <p className="text-sm" style={{ color: colors.mutedSilver }}>
                            {project.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      <ChevronRight size={20} style={{ color: colors.executivePurple }} />
                    </div>

                    <AnimatePresence>
                      {expandedProject === project.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t p-6"
                          style={{ borderColor: colors.platinumEdgeGlow }}
                        >
                          {images.length > 0 && (
                            <div className="mb-6">
                              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-3">
                                <img
                                  src={images[currentImageIdx]}
                                  alt={`${project.title} ${currentImageIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {images.length > 1 && (
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentProjectImageIdx({
                                        ...currentProjectImageIdx,
                                        [project.id]: (currentImageIdx - 1 + images.length) % images.length,
                                      });
                                    }}
                                  >
                                    ←
                                  </Button>
                                  <span className="text-xs px-2 py-1">
                                    {currentImageIdx + 1} / {images.length}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentProjectImageIdx({
                                        ...currentProjectImageIdx,
                                        [project.id]: (currentImageIdx + 1) % images.length,
                                      });
                                    }}
                                  >
                                    →
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {project.description && (
                            <p className="text-sm mb-4">{project.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {project.impact && (
                              <div>
                                <p className="text-xs uppercase font-semibold mb-1" style={{ color: colors.executivePurple }}>
                                  Impact
                                </p>
                                <p className="text-sm">{project.impact}</p>
                              </div>
                            )}
                            {project.outcome && (
                              <div>
                                <p className="text-xs uppercase font-semibold mb-1" style={{ color: colors.executivePurple }}>
                                  Outcome
                                </p>
                                <p className="text-sm">{project.outcome}</p>
                              </div>
                            )}
                          </div>

                          {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech: any, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: colors.executivePurple,
                                    color: colors.executivePurple,
                                  }}
                                >
                                  {typeof tech === 'string' ? tech : tech.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                              style={{ color: colors.executivePurple }}
                            >
                              View Project <ExternalLink size={14} />
                            </a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: SERVICES (PREMIUM) */}
      {userServices && userServices.length > 0 && (
        <section className="py-20 px-4 border-t" style={{ borderColor: colors.platinumEdgeGlow }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12" style={{ color: colors.executivePurple }}>
              Executive Advisory Suite
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-lg border-l-4"
                  style={{
                    borderColor: colors.executivePurple,
                    background: colors.deepCharcoal,
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-sm mb-4" style={{ color: colors.mutedSilver }}>
                    {service.description}
                  </p>

                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {service.features.slice(0, 3).map((feature: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span style={{ color: colors.executivePurple }}>✓</span>
                          <span>{typeof feature === 'string' ? feature : feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {service.priceUsd && (
                    <p className="text-sm font-semibold" style={{ color: colors.executivePurple }}>
                      ${service.priceUsd}
                    </p>
                  )}

                  <Button
                    className="mt-4 w-full"
                    style={{
                      background: colors.executivePurple,
                      color: colors.pureWhite,
                    }}
                  >
                    Request Consultation
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t text-center" style={{ borderColor: colors.platinumEdgeGlow }}>
        <p style={{ color: colors.mutedSilver }} className="text-sm">
          © {new Date().getFullYear()} {userInfo.name}. All rights reserved.
        </p>
      </footer>
    </article>
  );
};

export default CEOExecutivePortfolio;
