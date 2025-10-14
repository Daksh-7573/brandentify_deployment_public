import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, Calendar, ExternalLink, Award, GraduationCap, 
  Briefcase, Heart, Users, Sparkles, Phone, Instagram, Linkedin, 
  X, ChevronDown
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

interface FashionRunwayProps {
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

// Three-Layer Parallax Background
function FashionParallaxBackground() {
  const { scrollY } = useScroll();
  
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -100]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -250]);
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -400]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Subtle gradient background */}
      <motion.div 
        style={{ y: layer1Y }}
        className="absolute inset-0 bg-gradient-to-br from-white via-[#F5F1E8] to-[#E8D4D0]"
      />
      
      {/* Layer 2: Abstract fashion shapes */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-[#D4C5B9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-[15%] w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Layer 3: Accent elements */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        <div className="absolute top-[30%] left-[5%] w-2 h-32 bg-gradient-to-b from-[#D4AF37]/20 to-transparent" />
        <div className="absolute top-[60%] right-[8%] w-2 h-40 bg-gradient-to-b from-black/10 to-transparent" />
      </motion.div>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif text-black">{project.title}</DialogTitle>
          {project.category && (
            <Badge variant="outline" className="w-fit text-xs border-black/20">
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
                  className="w-full h-auto rounded-sm object-cover"
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
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.startDate).getFullYear()}</span>
              </div>
            )}
            {project.projectUrl && (
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-black transition-colors"
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

export default function FashionRunway({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
}: FashionRunwayProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-white text-black font-sans">
      {/* Parallax Background */}
      <FashionParallaxBackground />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-6 md:px-20 lg:px-32"
      >
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Profile Photo */}
          {userInfo.photoURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-8"
            >
              <img
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-full h-full object-cover rounded-full ring-4 ring-black/5"
              />
            </motion.div>
          )}

          {/* Name - Large Serif */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-light tracking-tight"
          >
            {userInfo.name}
          </motion.h1>

          {/* Title */}
          {userInfo.title && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl font-light tracking-wide text-gray-700"
            >
              {userInfo.title}
            </motion.p>
          )}

          {/* Tagline */}
          {userInfo.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl font-light italic text-gray-600 max-w-2xl mx-auto"
            >
              "{userInfo.tagline}"
            </motion.p>
          )}

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="h-8 w-8 text-gray-400" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Portfolio Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
            Portfolio
          </h2>
          <div className="w-20 h-px bg-black mx-auto mb-16" />

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {userProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => openProjectModal(project)}
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
                  {project.thumbnailUrl ? (
                    <motion.img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Sparkles className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <p className="text-white text-xl font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.title}
                    </p>
                  </div>
                </div>
                
                {project.category && (
                  <p className="mt-3 text-sm text-gray-600 text-center font-light tracking-wide">
                    {project.category}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {userProjects.length === 0 && (
            <p className="text-center text-gray-500 italic py-12">
              No portfolio items yet
            </p>
          )}
        </motion.div>
      </section>

      {/* About Section */}
      {userInfo.aboutMe && (
        <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32 bg-[#F5F1E8]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
              About
            </h2>
            <div className="w-20 h-px bg-black mx-auto mb-16" />

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-gray-700">
                  {userInfo.aboutMe}
                </p>

                {/* Vision Statement */}
                {userInfo.visionStatement && (
                  <blockquote className="border-l-2 border-black/20 pl-6 italic text-gray-600">
                    {userInfo.visionStatement}
                  </blockquote>
                )}

                {/* Mission Statement */}
                {userInfo.missionStatement && (
                  <p className="text-gray-700">
                    {userInfo.missionStatement}
                  </p>
                )}

                {/* Core Values */}
                {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                  <div className="pt-4">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-3">Core Values</p>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.coreValues.map((value, idx) => (
                        <Badge key={idx} variant="outline" className="border-black/20 text-black">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unique Value Proposition */}
                {userInfo.uniqueValueProposition && (
                  <div className="pt-4 bg-white/50 p-6 rounded-sm">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">What Sets Me Apart</p>
                    <p className="text-gray-800 font-light">
                      {userInfo.uniqueValueProposition}
                    </p>
                  </div>
                )}
              </div>

              {/* Secondary Image or Placeholder */}
              <div className="relative">
                {userInfo.photoURL && (
                  <motion.img
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Experience Timeline */}
      {userExperiences.length > 0 && (
        <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
              Experience
            </h2>
            <div className="w-20 h-px bg-black mx-auto mb-16" />

            <div className="space-y-12">
              {userExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative pl-8 border-l border-gray-200"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-black rounded-full" />
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-light">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed pt-2">
                        {exp.description}
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
        <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32 bg-[#F5F1E8]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
              Skills & Expertise
            </h2>
            <div className="w-20 h-px bg-black mx-auto mb-16" />

            <div className="flex flex-wrap justify-center gap-3">
              {userSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Badge 
                    variant="outline" 
                    className="px-4 py-2 text-sm border-black/20 hover:bg-black hover:text-white transition-colors"
                  >
                    {skill.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Services/What I Offer */}
      {(userInfo.whatIOffer || userServices.length > 0) && (
        <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
              Services
            </h2>
            <div className="w-20 h-px bg-black mx-auto mb-16" />

            {userInfo.whatIOffer && (
              <p className="text-lg text-center text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                {userInfo.whatIOffer}
              </p>
            )}

            {userServices.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-6 border border-gray-200 hover:border-black transition-colors"
                  >
                    <h3 className="text-xl font-serif mb-3">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Education */}
      {userEducations.length > 0 && (
        <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32 bg-[#F5F1E8]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
              Education
            </h2>
            <div className="w-20 h-px bg-black mx-auto mb-16" />

            <div className="space-y-8">
              {userEducations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center space-y-2"
                >
                  <h3 className="text-xl font-serif">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Contact/CTA Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-20 lg:px-32">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-light mb-8">
            Let's Work Together
          </h2>

          {userInfo.location && (
            <p className="text-gray-600 mb-8 flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5" />
              {userInfo.location}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {userInfo.email && (
              <Button
                onClick={() => window.location.href = `mailto:${userInfo.email}`}
                className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg font-light"
                data-testid="button-lets-connect"
              >
                Let's Connect
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`}
              className="border-black text-black hover:bg-black hover:text-white px-8 py-6 text-lg font-light"
              data-testid="button-mentor"
            >
              Mentor
            </Button>
          </div>

          {/* Email */}
          {userInfo.email && (
            <a 
              href={`mailto:${userInfo.email}`}
              className="text-gray-600 hover:text-black transition-colors flex items-center justify-center gap-2 mb-8"
            >
              <Mail className="h-5 w-5" />
              {userInfo.email}
            </a>
          )}

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors">
              <X className="h-6 w-6" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-gray-200">
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
