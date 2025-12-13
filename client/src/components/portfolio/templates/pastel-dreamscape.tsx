import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, ChevronDown, 
  Sparkles, Star, Heart,
  Briefcase, GraduationCap, Award, Code
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { Skill, Project, WorkExperience, Education, Service } from "@shared/schema";

interface PastelDreamscapeProps {
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
    whatIOffer?: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

// Floating Particle Component
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30 blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Blob Background Component
function BlobBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Blob 1 - Top Right */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, #F9E2F4 0%, #D7F2F5 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 2 - Bottom Left */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, #FFD8BA 0%, #F9E2F4 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Blob 3 - Center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #D7F2F5 0%, #F4F5FF 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Glass Card Component
function GlassCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className={`backdrop-blur-xl bg-white/40 border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {children}
    </motion.div>
  );
}

// Skill Petal Component (Radial Layout)
function SkillPetals({ skills }: { skills: Skill[] }) {
  const displaySkills = skills.slice(0, 8);
  const radius = 180;
  
  return (
    <div className="relative w-full flex justify-center items-center py-16">
      <div className="relative w-[500px] h-[500px] flex items-center justify-center">
        {/* Center Circle */}
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center shadow-lg z-10"
          animate={{
            scale: [1, 1.1, 1],
            rotate: 360,
          }}
          transition={{
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
        >
          <Star className="w-10 h-10 text-white" />
        </motion.div>

        {/* Skill Petals in Radial Layout */}
        {displaySkills.map((skill, index) => {
          const angle = (index * 360) / displaySkills.length;
          const radian = (angle * Math.PI) / 180;
          const xPos = radius * Math.cos(radian);
          const yPos = radius * Math.sin(radian);

          return (
            <motion.div
              key={skill.id}
              className="absolute"
              style={{
                left: `calc(50% + ${xPos}px)`,
                top: `calc(50% + ${yPos}px)`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.15 }}
            >
              <div className="w-32 h-32 rounded-full backdrop-blur-md bg-white/70 border-2 border-white/90 shadow-lg flex flex-col items-center justify-center p-3 text-center hover:bg-white/90 transition-all duration-300">
                <span className="font-bold text-xs text-gray-800 mb-1 line-clamp-2">{skill.name}</span>
                
                <span className="px-2 py-0.5 bg-gradient-to-r from-pink-200 to-purple-200 text-xs font-semibold text-gray-700 rounded-full mb-2">
                  {skill.level}
                </span>
                
                {skill.proficiency ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-20 bg-gray-300 h-1.5 rounded-full overflow-hidden mb-1">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <div className="text-xs font-bold text-gray-700">{skill.proficiency}%</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">Not rated</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Project Mosaic Card
function ProjectMosaicCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const mediaUrls = (project.mediaUrls as string[]) || [];
  const thumbnailUrl = project.thumbnailUrl || mediaUrls[0] || "";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onClick={onClick}
      className="cursor-pointer group"
      data-testid={`project-card-${index}`}
    >
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/50 border border-white/70 shadow-lg hover:shadow-2xl transition-all duration-300">
        {thumbnailUrl && (
          <div className="h-64 overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
            {project.title}
          </h3>
          {project.category && (
            <Badge className="mb-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0">
              {project.category}
            </Badge>
          )}
          {project.description && (
            <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
          )}
        </div>
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <span className="text-white font-semibold flex items-center gap-2">
            View Details <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Timeline Node
function TimelineNode({ experience, index, isLast }: { experience: WorkExperience; index: number; isLast: boolean }) {
  const isEven = index % 2 === 0;
  const startYear = experience.startDate ? new Date(experience.startDate).getFullYear() : "";
  const endYear = experience.endDate ? new Date(experience.endDate).getFullYear() : "Present";
  const responsibilities = (experience.keyResponsibilities as string[]) || [];

  return (
    <div className="relative">
      {/* Timeline Line */}
      {!isLast && (
        <motion.div
          className="absolute left-1/2 top-20 w-0.5 h-full bg-gradient-to-b from-pink-300 to-purple-300 -translate-x-1/2 z-0"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      <div className={`flex items-center gap-8 ${isEven ? "" : "flex-row-reverse"}`}>
        {/* Content Card */}
        <motion.div
          className="w-5/12"
          initial={{ opacity: 0, x: isEven ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-6" delay={0.2}>
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-lg text-gray-800">{experience.title}</h4>
                <p className="text-gray-700 font-medium">{experience.company}</p>
                <p className="text-sm text-purple-600 font-semibold mt-1">
                  {startYear} - {endYear}
                </p>
              </div>

              {(experience.industry || experience.domain || experience.location) && (
                <div className="flex flex-wrap gap-2">
                  {experience.industry && (
                    <Badge className="bg-pink-100 text-pink-700 border-0 text-xs">
                      {experience.industry}
                    </Badge>
                  )}
                  {experience.domain && (
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                      {experience.domain}
                    </Badge>
                  )}
                  {experience.location && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {experience.location}
                    </Badge>
                  )}
                </div>
              )}

              {responsibilities.length > 0 && (
                <ul className="space-y-1">
                  {responsibilities.slice(0, 3).map((resp, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Center Node */}
        <motion.div
          className="w-2/12 flex justify-center z-10"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center shadow-lg border-4 border-white">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
        </motion.div>

        {/* Empty Space */}
        <div className="w-5/12" />
      </div>
    </div>
  );
}

// Isometric Service Card
function IsometricServiceCard({ service, index }: { service: Service; index: number }) {
  const features = (service.features as string[]) || [];
  const priceDisplay = service.priceUsd 
    ? `$${service.priceUsd}${service.isHourly ? "/hr" : ""}` 
    : service.priceInr 
    ? `₹${service.priceInr}${service.isHourly ? "/hr" : ""}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -10, rotateX: 5 }}
      style={{ perspective: 1000 }}
      className="transform-gpu"
    >
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/70 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
        {/* Isometric Border Effect */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-pink-300 to-purple-400 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
        
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl text-gray-800">{service.title}</h3>
            {priceDisplay && (
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-sm">
                {priceDisplay}
              </div>
            )}
          </div>

          {service.category && (
            <Badge className="bg-purple-100 text-purple-700 border-0">
              {service.category}
            </Badge>
          )}

          {service.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
          )}

          {features.length > 0 && (
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Education Accordion
function EducationAccordion({ educations }: { educations: Education[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {educations.map((edu, index) => {
        const isExpanded = expandedId === edu.id;
        const skills = (edu.skillsAcquired as string[]) || [];

        return (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="overflow-hidden cursor-pointer" delay={0}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : edu.id)}
                className="p-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 space-y-3 border-t border-white/50">
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        {edu.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {edu.location}
                          </span>
                        )}
                        {edu.startDate && (
                          <span>
                            {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                          </span>
                        )}
                      </div>

                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Field of Study:</span> {edu.fieldOfStudy}
                        </p>
                      )}

                      {(edu.industry || edu.domain) && (
                        <div className="flex gap-2">
                          {edu.industry && (
                            <Badge className="bg-pink-100 text-pink-700 border-0 text-xs">
                              {edu.industry}
                            </Badge>
                          )}
                          {edu.domain && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              {edu.domain}
                            </Badge>
                          )}
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Skills Acquired:</p>
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Component
export default function PastelDreamscape({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
  currentUserId,
}: PastelDreamscapeProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#F4F5FF" }}>
      {/* Background Elements */}
      <BlobBackground />
      <FloatingParticles />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section - Split Diagonal */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    {userInfo.name}
                  </h1>
                  {userInfo.title && (
                    <h2 className="text-2xl md:text-3xl text-gray-700 font-semibold mb-2">
                      {userInfo.title}
                    </h2>
                  )}
                  {userInfo.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{userInfo.location}</span>
                    </div>
                  )}
                </motion.div>

                {userInfo.tagline && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-600 leading-relaxed"
                  >
                    {userInfo.tagline}
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-3"
                >
                  {userInfo.industry && (
                    <Badge className="bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0 text-sm px-4 py-2">
                      {userInfo.industry}
                    </Badge>
                  )}
                  {userInfo.domain && (
                    <Badge className="bg-white/60 text-gray-700 border-white/80 text-sm px-4 py-2">
                      {userInfo.domain}
                    </Badge>
                  )}
                </motion.div>

                {userInfo.lookingFor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                      <Sparkles className="w-5 h-5" />
                      <span>Looking for: {userInfo.lookingFor}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {userInfo.email && (
                        <>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}`}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-6"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Let's Talk
                          </Button>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`}
                            className="backdrop-blur-md bg-white/60 border-2 border-white/80 text-purple-600 hover:bg-white/80 shadow-lg rounded-full px-6"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Mentor
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Right Side - Profile Image with Floating Shapes */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative w-full max-w-md mx-auto">
                  {/* Main Profile Image */}
                  {userInfo.photoURL && (
                    <motion.div
                      className="relative z-10"
                      animate={{
                        y: [0, -15, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl backdrop-blur-xl bg-white/40">
                        <img
                          src={userInfo.photoURL}
                          alt={userInfo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Animated Border Glow */}
                      <motion.div
                        className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 -z-10 blur-xl opacity-50"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: 360,
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Floating Accent Shapes */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 blur-2xl opacity-60"
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-300 to-pink-300 blur-2xl opacity-60"
                    animate={{
                      y: [0, 20, 0],
                      x: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              style={{ opacity }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-sm">Scroll to explore</span>
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section - Floating Glass Capsule */}
        {userInfo.aboutMe && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  About Me
                </h2>
                <GlassCard className="p-10">
                  <p className="text-gray-700 text-lg leading-relaxed text-center">
                    {userInfo.aboutMe}
                  </p>
                  
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">
                        Core Values
                      </h3>
                      <div className="flex flex-wrap justify-center gap-3">
                        {userInfo.coreValues.map((value, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0 px-4 py-2 text-sm">
                              <Heart className="w-4 h-4 mr-2" />
                              {value}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            </div>
          </section>
        )}

        {/* What I Offer Section */}
        {userInfo.whatIOffer && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  What I Offer
                </h2>
                <GlassCard className="p-10">
                  <p className="text-gray-700 text-lg leading-relaxed text-center">
                    {userInfo.whatIOffer}
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </section>
        )}

        {/* Skills Section - Radial Petals */}
        {userSkills.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                My Skills
              </h2>
              <SkillPetals skills={userSkills} />
            </div>
          </section>
        )}

        {/* Projects Section - Animated Mosaic */}
        {userProjects.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userProjects.map((project, index) => (
                  <ProjectMosaicCard
                    key={project.id}
                    project={project}
                    index={index}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section - Timeline Ribbon */}
        {userExperiences.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                My Journey
              </h2>
              <div className="space-y-16">
                {userExperiences.map((exp, index) => (
                  <TimelineNode
                    key={exp.id}
                    experience={exp}
                    index={index}
                    isLast={index === userExperiences.length - 1}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services Section - Isometric Cards */}
        {userServices.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userServices.map((service, index) => (
                  <IsometricServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Education Section - Accordion */}
        {userEducations.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Education
              </h2>
              <EducationAccordion educations={userEducations} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600"
          >
            © {new Date().getFullYear()} {userInfo.name}. Crafted with{" "}
            <Heart className="w-4 h-4 inline text-pink-500" /> and creativity.
          </motion.p>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-4xl backdrop-blur-xl bg-white/90 border border-white/70 rounded-3xl">
              <div className="space-y-6">
                {selectedProject.thumbnailUrl && (
                  <div className="w-full h-96 rounded-2xl overflow-hidden">
                    <img
                      src={selectedProject.thumbnailUrl}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedProject.title}
                  </h3>
                  {selectedProject.category && (
                    <Badge className="bg-gradient-to-r from-pink-400 to-purple-400 text-white border-0">
                      {selectedProject.category}
                    </Badge>
                  )}
                </div>
                {selectedProject.description && (
                  <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                )}
                {selectedProject.projectUrl && (
                  <Button
                    onClick={() => window.open(selectedProject.projectUrl as string, "_blank")}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    View Project
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
