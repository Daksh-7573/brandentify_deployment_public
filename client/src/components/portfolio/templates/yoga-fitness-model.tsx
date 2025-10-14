import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, Calendar, ExternalLink, Award, GraduationCap, 
  Briefcase, Heart, Users, Sparkles, Phone, Instagram, Linkedin, 
  X, ChevronDown, Flower2, Circle
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Skill, Project, WorkExperience, Education, Service } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface YogaFitnessModelProps {
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
    jobLevel?: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
    brandName?: string | null;
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

// Breathing Circle Animation Component
function BreathingCircle() {
  return (
    <motion.div
      className="absolute top-1/4 right-[10%] w-32 h-32 rounded-full border-2 border-sage-500/20"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-sage-400/10"
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}

// Lotus Flower Component
function LotusFlower({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <Flower2 className="w-full h-full text-sage-400/30" strokeWidth={1} />
    </motion.div>
  );
}

// Three-Layer Parallax Background with Yoga Elements
function YogaParallaxBackground() {
  const { scrollY } = useScroll();
  
  // Enhanced parallax with more dramatic movement
  const layer1Y = useTransform(scrollY, [0, 1500], [0, -300]);
  const layer2Y = useTransform(scrollY, [0, 1500], [0, -600]);
  const layer3Y = useTransform(scrollY, [0, 1500], [0, -900]);
  
  // Rotation effects for yoga elements
  const lotus1Rotate = useTransform(scrollY, [0, 1500], [0, 45]);
  const lotus2Rotate = useTransform(scrollY, [0, 1500], [0, -30]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Soft earth tone gradient background - slowest */}
      <motion.div 
        style={{ y: layer1Y }}
        className="absolute inset-0 bg-gradient-to-br from-white via-beige-50 to-sage-50"
      />
      
      {/* Layer 2: Organic shapes and subtle patterns - medium speed */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {/* Soft gradient orbs with increased opacity for visibility */}
        <div className="absolute top-20 right-[15%] w-96 h-96 bg-sage-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-60 left-[10%] w-[500px] h-[500px] bg-sky-300/25 rounded-full blur-3xl" />
        <div className="absolute top-[50%] left-[40%] w-64 h-64 bg-olive-300/20 rounded-full blur-3xl" />
        
        {/* Lotus flowers with rotation */}
        <motion.div style={{ rotate: lotus1Rotate }} className="absolute top-32 left-[8%] w-28 h-28">
          <Flower2 className="w-full h-full text-sage-500/40" strokeWidth={1.5} />
        </motion.div>
        <motion.div style={{ rotate: lotus2Rotate }} className="absolute bottom-40 right-[12%] w-36 h-36">
          <Flower2 className="w-full h-full text-sage-600/40" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Layer 3: Accent elements and breathing circle - fastest */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        <BreathingCircle />
        
        {/* Decorative lines with increased visibility */}
        <div className="absolute top-[40%] left-[5%] w-2 h-32 bg-gradient-to-b from-sage-400/40 to-transparent rounded-full" />
        <div className="absolute top-[70%] right-[8%] w-2 h-40 bg-gradient-to-b from-olive-400/30 to-transparent rounded-full" />
        
        {/* Mandala-like circles with enhanced visibility */}
        <div className="absolute top-[25%] right-[20%] w-20 h-20 rounded-full border-2 border-sage-400/30" />
        <div className="absolute top-[25%] right-[20%] w-14 h-14 rounded-full border-2 border-sage-400/20 m-3" />
        
        {/* Additional floating elements */}
        <div className="absolute top-[60%] left-[15%] w-3 h-3 rounded-full bg-sage-500/40" />
        <div className="absolute top-[35%] right-[30%] w-2 h-2 rounded-full bg-olive-500/40" />
      </motion.div>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
    </div>
  );
}

// Project Modal Component
function ProjectModal({ 
  project, 
  isOpen, 
  onClose 
}: { 
  project: Project | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!project) return null;

  const mediaUrls = Array.isArray(project.mediaUrls) ? project.mediaUrls : [];
  const allImages = [
    project.thumbnailUrl,
    ...mediaUrls.filter(url => url && typeof url === 'string')
  ].filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-sage-200">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif text-olive-900">{project.title}</DialogTitle>
          {project.category && (
            <Badge variant="outline" className="w-fit text-xs border-sage-300 text-sage-700">
              {project.category}
            </Badge>
          )}
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Image Gallery */}
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <motion.img
                  key={idx}
                  src={url}
                  alt={`${project.title} - ${idx + 1}`}
                  className="w-full h-auto rounded-lg object-cover shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sage-600" />
                <span>{new Date(project.startDate).getFullYear()}</span>
              </div>
            )}
            {project.projectUrl && (
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-sage-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Project</span>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function YogaFitnessModel({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
}: YogaFitnessModelProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.98]);

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 font-sans">
      {/* Parallax Background */}
      <YogaParallaxBackground />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-6 md:px-16 lg:px-24"
      >
        <div className="text-center max-w-5xl mx-auto space-y-10">
          {/* Profile Photo with organic border */}
          {userInfo.photoURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-56 h-56 md:w-72 md:h-72 mx-auto mb-10 relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sage-200/40 to-sky-200/30 blur-xl" />
              <img
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="relative w-full h-full object-cover rounded-full ring-8 ring-white/50 shadow-xl"
              />
            </motion.div>
          )}

          {/* Name - Serif/Script Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight text-olive-900"
            style={{ fontFamily: "'Playfair Display', 'Cormorant', serif" }}
          >
            {userInfo.name}
          </motion.h1>

          {/* Tagline or Title */}
          {(userInfo.tagline || userInfo.title) && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl font-light tracking-wide text-gray-600 italic"
            >
              {userInfo.tagline || userInfo.title}
            </motion.p>
          )}

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="pt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <ChevronDown className="h-8 w-8 text-sage-400" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      {(userInfo.aboutMe || userInfo.missionStatement || userInfo.visionStatement) && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-transparent to-beige-50/30">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-12 text-center">
              My Journey
            </h2>

            <div className="space-y-8">
              {userInfo.aboutMe && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-sm border border-sage-100">
                  <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                    {userInfo.aboutMe}
                  </p>
                </div>
              )}

              {userInfo.missionStatement && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-sm border border-sage-100">
                  <h3 className="text-xl font-serif text-sage-800 mb-4 flex items-center gap-2">
                    <Flower2 className="h-5 w-5 text-sage-600" />
                    Mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {userInfo.missionStatement}
                  </p>
                </div>
              )}

              {userInfo.visionStatement && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-sm border border-sage-100">
                  <h3 className="text-xl font-serif text-sage-800 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sage-600" />
                    Vision
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {userInfo.visionStatement}
                  </p>
                </div>
              )}

              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mt-8">
                  {userInfo.coreValues.map((value, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Badge 
                        variant="outline" 
                        className="px-4 py-2 text-sm border-sage-300 text-sage-800 bg-white/50"
                      >
                        {value}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Experience Section */}
      {userExperiences.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-16 text-center">
              Experience
            </h2>

            <div className="space-y-8">
              {userExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-sm border border-sage-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Briefcase className="h-6 w-6 text-sage-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif text-olive-900 mb-2">
                        {exp.title}
                      </h3>
                      <p className="text-lg text-sage-700 mb-3">{exp.company}</p>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                        {exp.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </span>
                          </div>
                        )}
                        {exp.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>

                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Portfolio/Projects Section */}
      {userProjects.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-transparent to-sage-50/20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-16 text-center">
              Portfolio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-sage-100 hover:shadow-lg transition-all duration-300"
                  onClick={() => openProjectModal(project)}
                  data-testid={`card-project-${project.id}`}
                >
                  {project.thumbnailUrl && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-olive-900 mb-2 group-hover:text-sage-700 transition-colors">
                      {project.title}
                    </h3>
                    {project.category && (
                      <Badge variant="outline" className="mb-3 text-xs border-sage-300 text-sage-700">
                        {project.category}
                      </Badge>
                    )}
                    {project.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Skills Section */}
      {userSkills.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-16 text-center">
              Skills & Expertise
            </h2>

            <div className="flex flex-wrap gap-4 justify-center">
              {userSkills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-sage-100 hover:shadow-md hover:border-sage-200 transition-all"
                  data-testid={`badge-skill-${skill.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sage-700 font-medium">{skill.name}</span>
                    {skill.proficiency && (
                      <Badge variant="secondary" className="text-xs bg-sage-100 text-sage-800">
                        {skill.proficiency}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Education & Certifications */}
      {userEducations.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-transparent to-beige-50/30">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-16 text-center">
              Education & Certifications
            </h2>

            <div className="space-y-6">
              {userEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-sage-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <GraduationCap className="h-6 w-6 text-sage-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif text-olive-900 mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-lg text-sage-700 mb-2">{edu.institution}</p>
                      {edu.startDate && (
                        <p className="text-sm text-gray-600">
                          {edu.startDate} - {edu.endDate || 'Present'}
                        </p>
                      )}
                      {edu.fieldOfStudy && (
                        <p className="text-gray-700 mt-3 leading-relaxed">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Services Section */}
      {userServices.length > 0 && (
        <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light text-olive-900 mb-16 text-center">
              Services
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-sage-100 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-2xl font-serif text-olive-900 mb-3">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  )}
                  {(service.priceUsd || service.priceInr) && (
                    <p className="text-lg font-semibold text-sage-700">
                      {service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}
                      {service.isHourly && ' / hour'}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Contact/CTA Section */}
      <section className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-gradient-to-b from-transparent to-sage-50/30">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-light text-olive-900 mb-8">
            Let's Connect
          </h2>

          {userInfo.uniqueValueProposition && (
            <p className="text-lg md:text-xl text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto">
              {userInfo.uniqueValueProposition}
            </p>
          )}

          {userInfo.location && (
            <p className="text-gray-600 mb-10 flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-sage-600" />
              {userInfo.location}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {userInfo.email && (
              <Button
                onClick={() => window.location.href = `mailto:${userInfo.email}`}
                className="bg-sage-700 text-white hover:bg-sage-800 px-10 py-6 text-lg font-light rounded-full shadow-lg hover:shadow-xl transition-all"
                data-testid="button-lets-connect"
              >
                <Mail className="h-5 w-5 mr-2" />
                Let's Connect
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`}
              className="border-2 border-sage-700 text-sage-800 hover:bg-sage-700 hover:text-white px-10 py-6 text-lg font-light rounded-full shadow-lg hover:shadow-xl transition-all"
              data-testid="button-mentor"
            >
              <Heart className="h-5 w-5 mr-2" />
              Mentor
            </Button>
          </div>

          {/* Email */}
          {userInfo.email && (
            <a 
              href={`mailto:${userInfo.email}`}
              className="text-gray-600 hover:text-sage-700 transition-colors flex items-center justify-center gap-2 mb-10 text-lg"
            >
              <Mail className="h-5 w-5" />
              {userInfo.email}
            </a>
          )}

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-sage-700 transition-colors">
              <Instagram className="h-7 w-7" />
            </a>
            <a href="#" className="text-gray-400 hover:text-sage-700 transition-colors">
              <Linkedin className="h-7 w-7" />
            </a>
            <a href="#" className="text-gray-400 hover:text-sage-700 transition-colors">
              <X className="h-7 w-7" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-10 px-6 border-t border-sage-200 bg-white/50">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {userInfo.name}. All rights reserved.
        </p>
      </footer>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}
