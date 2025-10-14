import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, Heart, Star, Sparkles,
  Award, GraduationCap, Briefcase, Clock,
  Users, Calendar, CheckCircle, Flower2
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import type { Skill, Project, WorkExperience, Education, Service } from "@shared/schema";

interface ZenHarmonyProps {
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

// Breathing Background Animation
function BreathingBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, #DCD4F5 0%, #B8DFC6 50%, #F4F7F6 100%)",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F4F7F6]/20 to-[#F4F7F6]/60" />
    </div>
  );
}

// Floating Lotus Elements
function FloatingLotus() {
  const lotuses = [
    { id: 1, x: 10, y: 20, size: 40, duration: 15 },
    { id: 2, x: 85, y: 60, size: 50, duration: 18 },
    { id: 3, x: 20, y: 75, size: 35, duration: 20 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {lotuses.map((lotus) => (
        <motion.div
          key={lotus.id}
          className="absolute"
          style={{
            left: `${lotus.x}%`,
            top: `${lotus.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: lotus.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flower2 
            size={lotus.size} 
            className="text-[#B8DFC6]"
            strokeWidth={1}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Floating Leaves with Parallax
function FloatingLeaves() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -100]);

  const leaves = [
    { id: 1, x: 15, y: y1, rotation: 45, delay: 0 },
    { id: 2, x: 75, y: y2, rotation: -30, delay: 2 },
    { id: 3, x: 50, y: y3, rotation: 15, delay: 4 },
    { id: 4, x: 90, y: y1, rotation: -45, delay: 1 },
    { id: 5, x: 30, y: y2, rotation: 60, delay: 3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute w-8 h-8"
          style={{
            left: `${leaf.x}%`,
            y: leaf.y,
          }}
          animate={{
            rotate: [leaf.rotation, leaf.rotation + 360],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full opacity-20">
            <path
              d="M12 2C12 2 6 8 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 8 12 2 12 2Z"
              fill="#6FA9C7"
              stroke="#6FA9C7"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Zen Card Component
function ZenCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={`backdrop-blur-md bg-white/50 border border-white/80 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}

// Service Card with Yoga Theme
function YogaServiceCard({ service, index }: { service: Service; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <ZenCard className="p-6 h-full">
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 360 : 0,
          }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8DFC6] to-[#6FA9C7] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <h3 className="text-xl font-semibold text-[#2E3D3A] mb-2">{service.title}</h3>
        {service.description && (
          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
        )}
        {(service.priceUsd || service.priceInr) && (
          <p className="text-lg font-bold text-[#6FA9C7]">
            {service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}
            {service.isHourly && <span className="text-sm text-gray-500 ml-1">/hour</span>}
          </p>
        )}
        {service.category && (
          <div className="mt-2">
            <Badge className="bg-gradient-to-r from-[#DCD4F5] to-[#F9C9B8] text-[#2E3D3A] border-0 text-xs">
              {service.category}
            </Badge>
          </div>
        )}
      </ZenCard>
    </motion.div>
  );
}

// Skill Wellness Card
function WellnessSkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
      className="relative group"
    >
      <div className="backdrop-blur-md bg-gradient-to-br from-white/60 to-white/40 border border-white/80 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#2E3D3A]">{skill.name}</h4>
          <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0 text-xs">
            {skill.level}
          </Badge>
        </div>
        
        {skill.proficiency && (
          <div className="relative h-2 bg-gray-200/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7]"
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.proficiency}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.05 }}
            />
          </div>
        )}
        
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#B8DFC6]/20 to-[#DCD4F5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
        />
      </div>
    </motion.div>
  );
}

// Experience Timeline Node
function JourneyTimelineNode({ experience, index, isLast }: { experience: WorkExperience; index: number; isLast: boolean }) {
  const isLeft = index % 2 === 0;
  
  return (
    <div className={`relative flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-8 mb-12`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex-1"
      >
        <ZenCard className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-[#2E3D3A]">{experience.title}</h3>
              <p className="text-[#6FA9C7] font-medium">{experience.company}</p>
            </div>
            <Briefcase className="w-5 h-5 text-[#B8DFC6]" />
          </div>
          
          {experience.startDate && (
            <p className="text-sm text-gray-500 mb-3">
              {new Date(experience.startDate).getFullYear()} - {experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present'}
            </p>
          )}
          
          {experience.description && (
            <p className="text-sm text-gray-600">{experience.description}</p>
          )}
        </ZenCard>
      </motion.div>
      
      {/* Center Node */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B8DFC6] to-[#6FA9C7] flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 rounded-full bg-white" />
        </div>
      </motion.div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Connecting Line */}
      {!isLast && (
        <div className="absolute left-1/2 top-12 w-0.5 h-full bg-gradient-to-b from-[#B8DFC6] to-[#6FA9C7] opacity-30 -translate-x-1/2" />
      )}
    </div>
  );
}

// Project Gallery Card
function PracticeGalleryCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
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
      className="cursor-pointer group relative overflow-hidden rounded-3xl"
      data-testid={`project-card-${index}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#DCD4F5]/30 to-[#B8DFC6]/30">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E3D3A]/80 via-[#2E3D3A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <h3 className="text-white font-bold text-lg mb-2">{project.title}</h3>
          {project.category && (
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/40 w-fit">
              {project.category}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Education Certification Card
function CertificationCard({ education, index }: { education: Education; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 10 }}
    >
      <ZenCard className="p-6 flex items-start gap-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#DCD4F5] to-[#F9C9B8] flex items-center justify-center">
            {education.degree?.toLowerCase().includes('certification') || education.degree?.toLowerCase().includes('teacher') ? (
              <Award className="w-7 h-7 text-white" />
            ) : (
              <GraduationCap className="w-7 h-7 text-white" />
            )}
          </div>
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[#2E3D3A] mb-1">{education.degree}</h3>
          <p className="text-[#6FA9C7] font-medium mb-2">{education.institution}</p>
          {education.endDate && (
            <p className="text-sm text-gray-500">{new Date(education.endDate).getFullYear()}</p>
          )}
          {education.fieldOfStudy && (
            <p className="text-sm text-gray-600 mt-2">{education.fieldOfStudy}</p>
          )}
        </div>
      </ZenCard>
    </motion.div>
  );
}

// Project Detail Modal
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const mediaUrls = (project.mediaUrls as string[]) || [];
  
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#F4F7F6] to-white">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2E3D3A] mb-2">{project.title}</h2>
          {project.category && (
            <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0">
              {project.category}
            </Badge>
          )}
        </div>
        
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {mediaUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${project.title} ${idx + 1}`}
                className="w-full rounded-2xl object-cover aspect-video"
              />
            ))}
          </div>
        )}
        
        {project.description && (
          <div>
            <h3 className="font-semibold text-lg text-[#2E3D3A] mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
        )}
        
        {project.category && (
          <div>
            <h3 className="font-semibold text-lg text-[#2E3D3A] mb-2">Category</h3>
            <Badge className="bg-white/80 text-[#2E3D3A] border border-[#B8DFC6]">
              {project.category}
            </Badge>
          </div>
        )}
        
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white">
              View Project
            </Button>
          </a>
        )}
      </div>
    </DialogContent>
  );
}

export default function ZenHarmony({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
}: ZenHarmonyProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <div className="relative min-h-screen bg-[#F4F7F6] overflow-hidden">
      {/* Background Elements */}
      <BreathingBackground />
      <FloatingLotus />
      <FloatingLeaves />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative w-full max-w-md mx-auto">
                  {userInfo.photoURL && (
                    <motion.div
                      className="relative z-10"
                      animate={{
                        y: [0, -15, 0],
                      }}
                      transition={{
                        duration: 6,
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
                      
                      {/* Zen Glow */}
                      <motion.div
                        className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] -z-10 blur-2xl opacity-40"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: 360,
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Right Side - Text Content */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#6FA9C7] via-[#B8DFC6] to-[#DCD4F5] bg-clip-text text-transparent">
                    {userInfo.name}
                  </h1>
                  {userInfo.title && (
                    <h2 className="text-2xl md:text-3xl text-[#2E3D3A] font-semibold mb-2">
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
                    className="text-lg text-gray-600 leading-relaxed italic"
                  >
                    "{userInfo.tagline}"
                  </motion.p>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-3"
                >
                  {userInfo.industry && (
                    <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0 text-sm px-4 py-2">
                      {userInfo.industry}
                    </Badge>
                  )}
                  {userInfo.domain && (
                    <Badge className="bg-white/60 text-[#2E3D3A] border-white/80 text-sm px-4 py-2">
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
                    <div className="flex items-center gap-2 text-[#6FA9C7] font-semibold">
                      <Sparkles className="w-5 h-5" />
                      <span>Looking for: {userInfo.lookingFor}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {userInfo.email && (
                        <>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}`}
                            className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white rounded-full px-6 shadow-lg"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Let's Connect
                          </Button>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`}
                            className="backdrop-blur-md bg-white/60 border-2 border-white/80 text-[#6FA9C7] hover:bg-white/80 shadow-lg rounded-full px-6"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Mentor
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              style={{ opacity }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 text-gray-500"
              >
                <span className="text-sm">Begin Your Journey</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flower2 className="w-6 h-6 text-[#B8DFC6]" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Philosophy & Intent Section */}
        {userInfo.aboutMe && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                  My Philosophy
                </h2>
                <ZenCard className="p-10">
                  <p className="text-gray-700 text-lg leading-relaxed text-center mb-6">
                    {userInfo.aboutMe}
                  </p>
                  
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-[#2E3D3A] text-center mb-4">
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
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Badge className="bg-gradient-to-r from-[#DCD4F5] to-[#F9C9B8] text-[#2E3D3A] border-0 px-4 py-2 text-sm">
                              <Heart className="w-4 h-4 mr-2" />
                              {value}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </ZenCard>
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
                <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                  What I Offer
                </h2>
                <ZenCard className="p-10">
                  <p className="text-gray-700 text-lg leading-relaxed text-center">
                    {userInfo.whatIOffer}
                  </p>
                </ZenCard>
              </motion.div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {userServices.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                Services & Offerings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userServices.map((service, index) => (
                  <YogaServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills Section - Mind-Body Toolkit */}
        {userSkills.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                Mind-Body Toolkit
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSkills.map((skill, index) => (
                  <WellnessSkillCard key={skill.id} skill={skill} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section - Practice Gallery */}
        {userProjects.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                Practice Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userProjects.map((project, index) => (
                  <PracticeGalleryCard
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

        {/* Experience Section - Journey Timeline */}
        {userExperiences.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                My Journey
              </h2>
              <div className="relative">
                {userExperiences.map((exp, index) => (
                  <JourneyTimelineNode
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

        {/* Education Section - Certifications */}
        {userEducations.length > 0 && (
          <section className="py-24 px-6">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                Training & Certifications
              </h2>
              <div className="space-y-6">
                {userEducations.map((education, index) => (
                  <CertificationCard key={education.id} education={education} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Call to Action Footer */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B8DFC6]/20 via-[#DCD4F5]/20 to-[#F9C9B8]/20" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-6 flex justify-center"
              >
                <Flower2 className="w-16 h-16 text-[#B8DFC6]" />
              </motion.div>
              
              <h2 className="text-4xl font-bold mb-4 text-[#2E3D3A]">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Let's connect and explore how we can work together to achieve balance, wellness, and growth.
              </p>
              
              {userInfo.email && (
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    onClick={() => window.location.href = `mailto:${userInfo.email}`}
                    size="lg"
                    className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white rounded-full px-8 shadow-lg"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Book a Session
                  </Button>
                  <Button
                    onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Question`}
                    size="lg"
                    variant="outline"
                    className="backdrop-blur-md bg-white/60 border-2 border-white/80 text-[#2E3D3A] hover:bg-white/80 rounded-full px-8"
                  >
                    Ask a Question
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600"
          >
            © {new Date().getFullYear()} {userInfo.name}. Namaste{" "}
            <Heart className="w-4 h-4 inline text-[#F9C9B8]" />
          </motion.p>
        </footer>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
