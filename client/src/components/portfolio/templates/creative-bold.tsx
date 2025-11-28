import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MapPin, ExternalLink, Briefcase, Award, GraduationCap } from "lucide-react";

interface CreativeBoldProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills?: Array<{ id: number; name: string; level?: string | null }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string;
    startDate?: string | null;
    thumbnailUrl?: string | null;
    projectUrl?: string | null;
  }>;
  userEducations?: Array<{
    id: number;
    degree: string;
    institution: string;
    fieldOfStudy?: string | null;
    startDate: string;
    endDate?: string | null;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description?: string | null;
  }>;
  currentUserId?: number;
  isPreview?: boolean;
}

const CORAL = '#FF6B5A';
const PAPER_WHITE = '#FFFFFF';
const INK_BLACK = '#0C0C0C';
const COOL_GRAY = '#575757';
const PORCELAIN = '#F4F6F8';

export default function CreativeBold({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  isPreview = false
}: CreativeBoldProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedExperiences = [...userExperiences].sort((a, b) => {
    const aDate = a.endDate || '9999-12-31';
    const bDate = b.endDate || '9999-12-31';
    return bDate.localeCompare(aDate);
  });

  const sortedProjects = [...userProjects].sort((a, b) => {
    const aDate = a.startDate || '';
    const bDate = b.startDate || '';
    return bDate.localeCompare(aDate);
  });

  const displayTitle = userInfo.title || "Creative Professional";

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER_WHITE, color: INK_BLACK }}>
      {/* STICKY HEADER - Hidden in preview mode */}
      {!isPreview && (
        <motion.header 
          initial={{ y: -100 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.6 }}
          className="fixed top-0 w-full z-50 transition-all"
          style={{ backgroundColor: PAPER_WHITE, borderBottom: `1px solid #E5E7EB` }}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: INK_BLACK }}>{userInfo.name}</h2>
            <div className="flex items-center gap-2">
              {userInfo.email && (
                <Button 
                  size="sm" 
                  style={{ backgroundColor: CORAL, color: PAPER_WHITE }}
                  onClick={() => window.location.href = `mailto:${userInfo.email}`}
                >
                  Book Me
                </Button>
              )}
            </div>
          </div>
        </motion.header>
      )}

      {/* HERO - Service-First with Photo */}
      <section className={`pb-20 px-6 md:px-12 ${isPreview ? 'pt-6' : 'pt-32'}`}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* LEFT: Photo - Minimalist */}
            {userInfo.photoURL && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center lg:justify-start order-2 lg:order-1"
              >
                <div className="relative">
                  {/* Subtle gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B5A]/8 to-[#FF6B5A]/4 rounded-2xl blur-3xl" />
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="relative w-full max-w-[380px] h-[500px] object-cover rounded-2xl shadow-xl"
                  />
                  {/* Subtle overlay accent */}
                  <div className="absolute inset-0 rounded-2xl" style={{ border: `2px solid ${CORAL}`, opacity: 0.2 }} />
                </div>
              </motion.div>
            )}

            {/* RIGHT: Content */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8 }}
              className="space-y-8 order-1 lg:order-2"
            >
              {/* Name with coral underline */}
              <div>
                <h1 className="text-6xl md:text-7xl font-bold mb-2" style={{ color: INK_BLACK }}>
                  {userInfo.name}
                </h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: CORAL }} />
              </div>

              {/* Title + tagline */}
              {displayTitle && (
                <p className="text-2xl font-light" style={{ color: COOL_GRAY }}>
                  {displayTitle}
                </p>
              )}
              {userInfo.tagline && (
                <p className="text-lg italic max-w-2xl" style={{ color: COOL_GRAY }}>
                  {userInfo.tagline}
                </p>
              )}

              {/* Service chips */}
              {userServices && userServices.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {userServices.slice(0, 4).map(service => (
                    <Badge 
                      key={service.id} 
                      style={{ backgroundColor: CORAL, color: PAPER_WHITE }}
                      className="text-sm font-medium"
                    >
                      {service.title}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Location & Industry badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {userInfo.location && (
                  <Badge variant="outline" style={{ borderColor: COOL_GRAY, color: COOL_GRAY }}>
                    <MapPin className="w-3 h-3 mr-1" /> {userInfo.location}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge variant="outline" style={{ borderColor: COOL_GRAY, color: COOL_GRAY }}>
                    {userInfo.industry}
                  </Badge>
                )}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 pt-4">
                {userInfo.email && (
                  <Button 
                    size="lg"
                    style={{ backgroundColor: CORAL, color: PAPER_WHITE }}
                    onClick={() => window.location.href = `mailto:${userInfo.email}`}
                  >
                    Book a Project
                  </Button>
                )}
                <Button 
                  size="lg"
                  variant="outline"
                  style={{ borderColor: INK_BLACK, color: INK_BLACK }}
                >
                  Explore Work
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BRAND IDENTITY */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement || userInfo.coreValues?.length) && (
        <section className="py-20 px-6 md:px-12" style={{ backgroundColor: PORCELAIN }}>
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold" style={{ color: INK_BLACK }}>About</h2>
              
              {userInfo.aboutMe && (
                <p className="text-lg leading-relaxed max-w-3xl" style={{ color: COOL_GRAY }}>
                  {userInfo.aboutMe}
                </p>
              )}

              {/* Vision, Mission, Values Grid */}
              {(userInfo.visionStatement || userInfo.missionStatement || userInfo.coreValues?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  {userInfo.visionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: CORAL }}>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-2" style={{ color: CORAL }}>Vision</h3>
                      <p style={{ color: COOL_GRAY }}>{userInfo.visionStatement}</p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: CORAL }}>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-2" style={{ color: CORAL }}>Mission</h3>
                      <p style={{ color: COOL_GRAY }}>{userInfo.missionStatement}</p>
                    </div>
                  )}
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div>
                      <h3 className="text-sm uppercase tracking-wider font-bold mb-3" style={{ color: CORAL }}>Values</h3>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.coreValues.map((value, idx) => (
                          <Badge key={idx} style={{ backgroundColor: CORAL, color: PAPER_WHITE }}>
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* SERVICES - CORE SECTION */}
      {userServices && userServices.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Services
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-lg transition-all"
                  style={{ 
                    backgroundColor: PORCELAIN, 
                    borderTop: `4px solid ${CORAL}`,
                    cursor: 'pointer'
                  }}
                >
                  <h3 className="text-xl font-bold mb-2" style={{ color: INK_BLACK }}>
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-sm" style={{ color: COOL_GRAY }}>
                      {service.description}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="mt-4 p-0"
                    style={{ color: CORAL }}
                  >
                    Book Service →
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* PROJECTS GALLERY */}
      {sortedProjects.length > 0 && (
        <section className="py-20 px-6 md:px-12" style={{ backgroundColor: PORCELAIN }}>
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Work
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {sortedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                  className="cursor-pointer group"
                >
                  {project.thumbnailUrl && (
                    <div className="relative overflow-hidden rounded-lg mb-4" style={{ backgroundColor: '#ddd' }}>
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
                        style={{ backgroundColor: CORAL }}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-bold mb-1" style={{ color: INK_BLACK }}>
                    {project.title}
                  </h3>
                  {project.startDate && (
                    <p className="text-sm" style={{ color: COOL_GRAY }}>
                      {new Date(project.startDate).getFullYear()}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Project Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl" style={{ backgroundColor: PAPER_WHITE }}>
              <DialogHeader>
                <DialogTitle style={{ color: INK_BLACK }}>
                  {selectedProject?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedProject?.thumbnailUrl && (
                  <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="w-full rounded-lg" />
                )}
                {selectedProject?.description && (
                  <p style={{ color: COOL_GRAY }}>{selectedProject.description}</p>
                )}
                {selectedProject?.projectUrl && (
                  <Button 
                    onClick={() => window.open(selectedProject.projectUrl, '_blank')}
                    style={{ backgroundColor: CORAL, color: PAPER_WHITE }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> View Project
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </section>
      )}

      {/* EXPERIENCE TIMELINE */}
      {sortedExperiences.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Experience
            </motion.h2>

            <div className="space-y-8">
              {sortedExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-6"
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: CORAL, flexShrink: 0 }} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: INK_BLACK }}>
                      {exp.title}
                    </h3>
                    <p style={{ color: COOL_GRAY }}>{exp.company}</p>
                    <p className="text-sm mt-2" style={{ color: COOL_GRAY }}>
                      {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="mt-3" style={{ color: COOL_GRAY }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {userSkills.length > 0 && (
        <section className="py-20 px-6 md:px-12" style={{ backgroundColor: PORCELAIN }}>
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Skills
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userSkills.map((skill) => (
                <div key={skill.id} className="p-4 bg-white rounded-lg">
                  <h3 className="font-bold mb-2" style={{ color: INK_BLACK }}>
                    {skill.name}
                  </h3>
                  {skill.level && (
                    <p className="text-sm" style={{ color: COOL_GRAY }}>
                      {skill.level}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {userEducations.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ color: INK_BLACK }}
            >
              Education
            </motion.h2>

            <div className="space-y-6">
              {userEducations.map((edu) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: PORCELAIN }}
                >
                  <h3 className="text-xl font-bold mb-1" style={{ color: INK_BLACK }}>
                    {edu.degree}
                  </h3>
                  <p style={{ color: COOL_GRAY }}>{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm mt-2" style={{ color: COOL_GRAY }}>
                      {edu.fieldOfStudy}
                    </p>
                  )}
                  <p className="text-sm mt-2" style={{ color: COOL_GRAY }}>
                    {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t" style={{ borderColor: '#E5E7EB' }}>
        <div className="max-w-[1200px] mx-auto text-center">
          <p style={{ color: COOL_GRAY }}>© {new Date().getFullYear()}. {userInfo.name}</p>
          {userInfo.email && (
            <a 
              href={`mailto:${userInfo.email}`} 
              className="inline-block mt-2 transition-colors"
              style={{ color: CORAL }}
            >
              {userInfo.email}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
