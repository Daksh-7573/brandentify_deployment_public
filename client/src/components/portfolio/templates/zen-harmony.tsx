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

// Enhanced Breathing Background with Gradient Mesh
function BreathingBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 20% 50%, rgba(184, 223, 198, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(220, 212, 245, 0.4) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(249, 201, 184, 0.3) 0%, transparent 50%), linear-gradient(135deg, #F4F7F6 0%, #E8F3F1 50%, #F0E9F7 100%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#B8DFC6]/30 to-transparent blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-[#DCD4F5]/30 to-transparent blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Soft overlay with texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
    </div>
  );
}

// Enhanced Floating Lotus with better animations
function FloatingLotus() {
  const lotuses = [
    { id: 1, x: 10, y: 20, size: 50, duration: 20, delay: 0 },
    { id: 2, x: 85, y: 60, size: 60, duration: 25, delay: 5 },
    { id: 3, x: 20, y: 75, size: 45, duration: 22, delay: 3 },
    { id: 4, x: 70, y: 30, size: 40, duration: 18, delay: 7 },
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
          initial={{ opacity: 0 }}
          animate={{
            y: [-30, 30, -30],
            rotate: [0, 360],
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: lotus.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: lotus.delay,
          }}
        >
          <Flower2 
            size={lotus.size} 
            className="text-[#B8DFC6] drop-shadow-lg"
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced Floating Leaves with better parallax
function FloatingLeaves() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -180]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -120]);

  const leaves = [
    { id: 1, x: 15, y: y1, rotation: 45, delay: 0, color: "#B8DFC6" },
    { id: 2, x: 75, y: y2, rotation: -30, delay: 2, color: "#DCD4F5" },
    { id: 3, x: 50, y: y3, rotation: 15, delay: 4, color: "#F9C9B8" },
    { id: 4, x: 90, y: y1, rotation: -45, delay: 1, color: "#6FA9C7" },
    { id: 5, x: 30, y: y2, rotation: 60, delay: 3, color: "#B8DFC6" },
    { id: 6, x: 60, y: y3, rotation: -20, delay: 5, color: "#DCD4F5" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute w-10 h-10"
          style={{
            left: `${leaf.x}%`,
            y: leaf.y,
          }}
          animate={{
            rotate: [leaf.rotation, leaf.rotation + 360],
            x: [-15, 15, -15],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full opacity-25 drop-shadow-md">
            <path
              d="M12 2C12 2 6 8 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 8 12 2 12 2Z"
              fill={leaf.color}
              stroke={leaf.color}
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced Zen Card with premium styling
function ZenCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={`group relative backdrop-blur-xl bg-white/60 border-2 border-white/90 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 ${className}`}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Premium border glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] rounded-3xl opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500" />
      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl">
        {children}
      </div>
    </motion.div>
  );
}

// Enhanced Service Card with premium design
function YogaServiceCard({ service, index }: { service: Service; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative h-full"
    >
      <ZenCard className="p-8 h-full">
        <motion.div
          animate={{
            scale: isHovered ? 1.15 : 1,
            rotate: isHovered ? 360 : 0,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-6 relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] flex items-center justify-center shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          {/* Glow effect */}
          <motion.div
            animate={{ scale: isHovered ? 1.5 : 1, opacity: isHovered ? 0.5 : 0 }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B8DFC6] to-[#6FA9C7] blur-xl"
          />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-[#2E3D3A] mb-3 leading-tight">{service.title}</h3>
        {service.description && (
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{service.description}</p>
        )}
        {(service.priceUsd || service.priceInr) && (
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-3xl font-black bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
              {service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}
            </p>
            {service.isHourly && <span className="text-sm text-gray-500 font-medium">/hour</span>}
          </div>
        )}
        {service.category && (
          <Badge className="bg-gradient-to-r from-[#DCD4F5] to-[#F9C9B8] text-[#2E3D3A] border-0 text-xs px-3 py-1 font-semibold">
            {service.category}
          </Badge>
        )}
      </ZenCard>
    </motion.div>
  );
}

// Enhanced Skill Card with better design
function WellnessSkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      whileHover={{ scale: 1.08, rotate: 1 }}
      className="relative group"
    >
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/70 to-white/50 border-2 border-white/90 rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[#2E3D3A] text-lg">{skill.name}</h4>
          <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0 text-xs px-3 py-1 font-semibold shadow-md">
            {skill.level}
          </Badge>
        </div>
        
        {skill.proficiency && (
          <div className="relative">
            <div className="h-3 bg-gray-200/60 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] shadow-md relative"
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.proficiency}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: index * 0.08, ease: "easeOut" }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.08 + 1.5 }}
                />
              </motion.div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-semibold">{skill.proficiency}% Proficiency</p>
          </div>
        )}
        
        {/* Enhanced glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#B8DFC6]/30 via-[#DCD4F5]/30 to-[#6FA9C7]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl"
        />
      </div>
    </motion.div>
  );
}

// Enhanced Experience Timeline with premium styling
function JourneyTimelineNode({ experience, index, isLast }: { experience: WorkExperience; index: number; isLast: boolean }) {
  const isLeft = index % 2 === 0;
  
  return (
    <div className={`relative flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-10 mb-16`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1"
      >
        <ZenCard className="p-8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold text-[#2E3D3A] mb-1">{experience.title}</h3>
              <p className="text-[#6FA9C7] font-semibold text-lg">{experience.company}</p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-br from-[#B8DFC6] to-[#6FA9C7] shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {experience.startDate && (
            <p className="text-sm text-gray-500 mb-4 font-medium">
              {new Date(experience.startDate).getFullYear()} - {experience.endDate ? new Date(experience.endDate).getFullYear() : 'Present'}
            </p>
          )}
          
          {experience.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{experience.description}</p>
          )}
        </ZenCard>
      </motion.div>
      
      {/* Enhanced Center Node */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] flex items-center justify-center shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-white shadow-inner" />
        </div>
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#B8DFC6]"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Enhanced Connecting Line */}
      {!isLast && (
        <div className="absolute left-1/2 top-16 w-1 h-full -translate-x-1/2">
          <div className="w-full h-full bg-gradient-to-b from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] opacity-40 rounded-full" />
        </div>
      )}
    </div>
  );
}

// Enhanced Project Card with better hover effects
function PracticeGalleryCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const mediaUrls = (project.mediaUrls as string[]) || [];
  const thumbnailUrl = project.thumbnailUrl || mediaUrls[0] || "";
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6 }}
      whileHover={{ scale: 1.08, y: -12 }}
      onClick={onClick}
      className="cursor-pointer group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500"
      data-testid={`project-card-${index}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#DCD4F5]/40 to-[#B8DFC6]/40">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
          />
        )}
        
        {/* Enhanced overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E3D3A]/90 via-[#2E3D3A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="text-white font-bold text-2xl mb-3 leading-tight"
          >
            {project.title}
          </motion.h3>
          {project.category && (
            <Badge className="bg-white/30 backdrop-blur-md text-white border-white/50 w-fit px-3 py-1 font-semibold">
              {project.category}
            </Badge>
          )}
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#B8DFC6] to-[#6FA9C7] opacity-0 group-hover:opacity-80 transition-opacity duration-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Education Card
function CertificationCard({ education, index }: { education: Education; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6 }}
      whileHover={{ x: 12, scale: 1.02 }}
    >
      <ZenCard className="p-8 flex items-start gap-6">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DCD4F5] via-[#F9C9B8] to-[#B8DFC6] flex items-center justify-center shadow-xl">
            {education.degree?.toLowerCase().includes('certification') || education.degree?.toLowerCase().includes('teacher') ? (
              <Award className="w-10 h-10 text-white" />
            ) : (
              <GraduationCap className="w-10 h-10 text-white" />
            )}
          </div>
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-bold text-xl text-[#2E3D3A] mb-2">{education.degree}</h3>
          <p className="text-[#6FA9C7] font-semibold text-lg mb-3">{education.institution}</p>
          {education.endDate && (
            <p className="text-sm text-gray-500 font-medium mb-2">
              Completed: {new Date(education.endDate).getFullYear()}
            </p>
          )}
          {education.fieldOfStudy && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              <span className="font-semibold">Focus:</span> {education.fieldOfStudy}
            </p>
          )}
        </div>
      </ZenCard>
    </motion.div>
  );
}

// Enhanced Project Modal
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const mediaUrls = (project.mediaUrls as string[]) || [];
  
  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#F4F7F6] via-white to-[#F0E9F7] border-2 border-white/80 shadow-2xl">
      <div className="space-y-8 p-4">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent mb-4">
            {project.title}
          </h2>
          {project.category && (
            <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              {project.category}
            </Badge>
          )}
        </div>
        
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaUrls.map((url, idx) => (
              <motion.img
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                src={url}
                alt={`${project.title} ${idx + 1}`}
                className="w-full rounded-2xl object-cover aspect-video shadow-xl"
              />
            ))}
          </div>
        )}
        
        {project.description && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/80">
            <h3 className="font-bold text-xl text-[#2E3D3A] mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>
        )}
        
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white font-semibold px-8 shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
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
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F4F7F6] via-[#E8F3F1] to-[#F0E9F7] overflow-hidden">
      {/* Enhanced Background Elements */}
      <BreathingBackground />
      <FloatingLotus />
      <FloatingLeaves />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-32">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Enhanced Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative w-full max-w-lg mx-auto">
                  {userInfo.photoURL && (
                    <motion.div
                      className="relative z-10"
                      animate={{
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="relative w-96 h-96 rounded-full overflow-hidden border-8 border-white shadow-3xl backdrop-blur-2xl bg-white/50">
                        <img
                          src={userInfo.photoURL}
                          alt={userInfo.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Inner border accent */}
                        <div className="absolute inset-0 border-4 border-white/40 rounded-full" />
                      </div>
                      
                      {/* Enhanced Multi-layer Glow */}
                      <motion.div
                        className="absolute -inset-6 rounded-full bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] -z-10 blur-3xl opacity-50"
                        animate={{
                          scale: [1, 1.15, 1],
                          rotate: 360,
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <motion.div
                        className="absolute -inset-12 rounded-full bg-gradient-to-r from-[#6FA9C7] via-[#F9C9B8] to-[#DCD4F5] -z-20 blur-3xl opacity-30"
                        animate={{
                          scale: [1.15, 1, 1.15],
                          rotate: -360,
                        }}
                        transition={{
                          duration: 25,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
              
              {/* Enhanced Text Content */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.h1 
                    className="text-7xl md:text-8xl font-black mb-6 leading-tight"
                    style={{
                      background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 50%, #DCD4F5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {userInfo.name}
                  </motion.h1>
                  {userInfo.title && (
                    <h2 className="text-3xl md:text-4xl text-[#2E3D3A] font-bold mb-4">
                      {userInfo.title}
                    </h2>
                  )}
                  {userInfo.location && (
                    <div className="flex items-center gap-3 text-gray-600 mb-3">
                      <MapPin className="w-6 h-6 text-[#6FA9C7]" />
                      <span className="text-xl font-medium">{userInfo.location}</span>
                    </div>
                  )}
                </motion.div>

                {userInfo.tagline && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="relative"
                  >
                    <div className="absolute -left-6 top-0 text-6xl text-[#B8DFC6]/30 font-serif">"</div>
                    <p className="text-xl text-gray-700 leading-relaxed italic font-medium pl-8">
                      {userInfo.tagline}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap gap-4"
                >
                  {userInfo.industry && (
                    <Badge className="bg-gradient-to-r from-[#B8DFC6] to-[#6FA9C7] text-white border-0 text-base px-6 py-3 font-semibold shadow-lg">
                      {userInfo.industry}
                    </Badge>
                  )}
                  {userInfo.domain && (
                    <Badge className="bg-white/80 backdrop-blur-md text-[#2E3D3A] border-2 border-white/90 text-base px-6 py-3 font-semibold shadow-lg">
                      {userInfo.domain}
                    </Badge>
                  )}
                </motion.div>

                {userInfo.lookingFor && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 text-[#6FA9C7] font-bold text-lg">
                      <Sparkles className="w-6 h-6" />
                      <span>Looking for: {userInfo.lookingFor}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {userInfo.email && (
                        <>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}`}
                            size="lg"
                            className="bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white rounded-full px-8 shadow-2xl font-semibold text-lg"
                          >
                            <Mail className="w-5 h-5 mr-2" />
                            Let's Connect
                          </Button>
                          <Button
                            onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`}
                            size="lg"
                            className="backdrop-blur-xl bg-white/70 border-3 border-white/90 text-[#6FA9C7] hover:bg-white/90 shadow-xl rounded-full px-8 font-semibold text-lg"
                          >
                            <Heart className="w-5 h-5 mr-2" />
                            Mentor Me
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Enhanced Scroll Indicator */}
            <motion.div
              style={{ opacity }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="flex flex-col items-center gap-3 text-gray-500"
              >
                <span className="text-base font-semibold">Begin Your Journey</span>
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Flower2 className="w-8 h-8 text-[#B8DFC6] drop-shadow-lg" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Philosophy Section */}
        {userInfo.aboutMe && (
          <section className="py-32 px-6 relative">
            {/* Section background accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8DFC6]/10 via-transparent to-[#DCD4F5]/10" />
            <div className="container mx-auto max-w-5xl relative">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <motion.h2 
                  className="text-6xl md:text-7xl font-black text-center mb-20"
                  style={{
                    background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  My Philosophy
                </motion.h2>
                <ZenCard className="p-12">
                  <p className="text-gray-700 text-xl leading-loose text-center mb-8 font-medium">
                    {userInfo.aboutMe}
                  </p>
                  
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold text-[#2E3D3A] text-center mb-6">
                        Core Values
                      </h3>
                      <div className="flex flex-wrap justify-center gap-4">
                        {userInfo.coreValues.map((value, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, type: "spring" }}
                            whileHover={{ scale: 1.15, rotate: 3 }}
                          >
                            <Badge className="bg-gradient-to-r from-[#DCD4F5] via-[#F9C9B8] to-[#B8DFC6] text-[#2E3D3A] border-0 px-6 py-3 text-base font-bold shadow-lg">
                              <Heart className="w-5 h-5 mr-2" />
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

        {/* Enhanced What I Offer Section */}
        {userInfo.whatIOffer && (
          <section className="py-32 px-6">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <motion.h2 
                  className="text-6xl md:text-7xl font-black text-center mb-20"
                  style={{
                    background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  What I Offer
                </motion.h2>
                <ZenCard className="p-12">
                  <div className="flex justify-center mb-6">
                    <Sparkles className="w-12 h-12 text-[#B8DFC6]" />
                  </div>
                  <p className="text-gray-700 text-xl leading-loose text-center font-medium">
                    {userInfo.whatIOffer}
                  </p>
                </ZenCard>
              </motion.div>
            </div>
          </section>
        )}

        {/* Enhanced Services Section */}
        {userServices.length > 0 && (
          <section className="py-32 px-6 relative">
            <div className="absolute inset-0 bg-gradient-to-l from-[#DCD4F5]/10 via-transparent to-[#F9C9B8]/10" />
            <div className="container mx-auto max-w-7xl relative">
              <motion.h2 
                className="text-6xl md:text-7xl font-black text-center mb-20"
                style={{
                  background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Services & Offerings
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {userServices.map((service, index) => (
                  <YogaServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Skills Section */}
        {userSkills.length > 0 && (
          <section className="py-32 px-6">
            <div className="container mx-auto max-w-6xl">
              <motion.h2 
                className="text-6xl md:text-7xl font-black text-center mb-20"
                style={{
                  background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Expertise Toolkit
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userSkills.map((skill, index) => (
                  <WellnessSkillCard key={skill.id} skill={skill} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Projects Section */}
        {userProjects.length > 0 && (
          <section className="py-32 px-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#B8DFC6]/10 via-[#DCD4F5]/10 to-[#F9C9B8]/10" />
            <div className="container mx-auto max-w-7xl relative">
              <motion.h2 
                className="text-6xl md:text-7xl font-black text-center mb-20"
                style={{
                  background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Portfolio Gallery
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

        {/* Enhanced Experience Timeline */}
        {userExperiences.length > 0 && (
          <section className="py-32 px-6">
            <div className="container mx-auto max-w-6xl">
              <motion.h2 
                className="text-6xl md:text-7xl font-black text-center mb-24"
                style={{
                  background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Professional Journey
              </motion.h2>
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

        {/* Enhanced Education Section */}
        {userEducations.length > 0 && (
          <section className="py-32 px-6 relative">
            <div className="absolute inset-0 bg-gradient-to-l from-[#B8DFC6]/10 via-transparent to-[#DCD4F5]/10" />
            <div className="container mx-auto max-w-5xl relative">
              <motion.h2 
                className="text-6xl md:text-7xl font-black text-center mb-20"
                style={{
                  background: "linear-gradient(135deg, #6FA9C7 0%, #B8DFC6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Education & Training
              </motion.h2>
              <div className="space-y-8">
                {userEducations.map((education, index) => (
                  <CertificationCard key={education.id} education={education} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced CTA Footer */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B8DFC6]/30 via-[#DCD4F5]/30 to-[#F9C9B8]/30" />
          <div className="container mx-auto max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-8 flex justify-center"
              >
                <Flower2 className="w-20 h-20 text-[#B8DFC6] drop-shadow-2xl" />
              </motion.div>
              
              <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-[#6FA9C7] to-[#B8DFC6] bg-clip-text text-transparent">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Let's connect and explore how we can work together to achieve balance, wellness, and extraordinary growth.
              </p>
              
              {userInfo.email && (
                <div className="flex flex-wrap justify-center gap-6">
                  <Button
                    onClick={() => window.location.href = `mailto:${userInfo.email}`}
                    size="lg"
                    className="bg-gradient-to-r from-[#B8DFC6] via-[#DCD4F5] to-[#6FA9C7] hover:from-[#A0CEB4] hover:to-[#5D97B5] text-white rounded-full px-10 py-6 shadow-2xl font-bold text-lg"
                  >
                    <Mail className="w-6 h-6 mr-3" />
                    Book a Session
                  </Button>
                  <Button
                    onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Question`}
                    size="lg"
                    variant="outline"
                    className="backdrop-blur-xl bg-white/80 border-3 border-white/90 text-[#2E3D3A] hover:bg-white rounded-full px-10 py-6 font-bold text-lg shadow-xl"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Ask a Question
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="py-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600 font-medium text-lg relative z-10"
          >
            © {new Date().getFullYear()} {userInfo.name}. Crafted with{" "}
            <Heart className="w-5 h-5 inline text-[#F9C9B8] animate-pulse" /> and Namaste
          </motion.p>
        </footer>
      </div>

      {/* Enhanced Project Modal */}
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
