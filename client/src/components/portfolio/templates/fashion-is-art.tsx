import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, ExternalLink, Download } from "lucide-react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";

interface FashionIsArtProps {
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
    mediaUrls?: string[];
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

export default function FashionIsArt({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  isPreview = false
}: FashionIsArtProps) {
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

  const displayTitle = userInfo.title || "Professional";

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* STICKY NAVIGATION - Hidden in preview mode */}
      {!isPreview && (
        <motion.nav 
          initial={{ y: -100 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.8 }}
          className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-black/5"
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{userInfo.name}</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Media Kit
              </Button>
            </div>
          </div>
        </motion.nav>
      )}

      {/* HERO SECTION */}
      <section className={`pb-20 px-6 md:px-12 ${isPreview ? 'pt-6' : 'pt-32'}`}>
        <div className="max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            {/* LEFT: Photo */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              {userInfo.photoURL && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/10 to-[#D4AF37]/10 rounded-xl blur-2xl" />
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="relative w-full max-w-[420px] h-[560px] object-cover rounded-xl shadow-2xl"
                  />
                </div>
              )}
            </motion.div>

            {/* RIGHT: Content */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <div>
                <h1 
                  className="text-6xl md:text-7xl font-bold leading-tight mb-4"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#0B0B0B' }}
                >
                  {userInfo.name}
                </h1>
                {displayTitle && (
                  <p className="break-all text-xl text-gray-700 font-light">{displayTitle}</p>
                )}
              </div>

              {userInfo.tagline && (
                <p className="text-lg text-gray-600 italic max-w-md">{userInfo.tagline}</p>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                {userInfo.location && (
                  <Badge variant="outline" className="border-black/20">
                    <MapPin className="w-3 h-3 mr-1" /> {userInfo.location}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge variant="outline" className="border-black/20">
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge variant="outline" className="border-black/20">
                    {userInfo.domain}
                  </Badge>
                )}
              </div>

              <div className="pt-6">
                <PortfolioCtaButtons 
                  variant="creative" 
                  userId={userInfo.id} 
                  userName={userInfo.name} 
                   
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      {userInfo.aboutMe && (
        <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-[#F8F8F8]">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                About
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">{userInfo.aboutMe}</p>

              {(userInfo.visionStatement || userInfo.missionStatement || userInfo.coreValues?.length) && (
                <div className="grid md:grid-cols-3 gap-6 pt-8">
                  {userInfo.visionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: '#1E88E5' }}>
                      <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Vision</h3>
                      <p className="break-all text-gray-800 italic">{userInfo.visionStatement}</p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div className="pl-6 border-l-4" style={{ borderColor: '#D4AF37' }}>
                      <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Mission</h3>
                      <p className="text-gray-800 italic">{userInfo.missionStatement}</p>
                    </div>
                  )}
                  {userInfo.coreValues?.length && (
                    <div className="space-y-3">
                      <h3 className="text-sm uppercase tracking-wider text-gray-600 mb-2">Values</h3>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.coreValues.map((value, idx) => (
                          <Badge key={idx} variant="outline" className="border-black/20">
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

      {/* PROJECTS GALLERY */}
      {sortedProjects.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Selected Work
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {sortedProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                  className="group relative overflow-hidden rounded-sm cursor-pointer bg-gray-100"
                >
                  {project.thumbnailUrl && (
                    <>
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-[360px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/40 flex flex-col items-end justify-end p-6"
                      >
                        <div className="text-white">
                          <h3 className="text-xl font-semibold">{project.title}</h3>
                          {project.startDate && (
                            <p className="text-sm text-white/80">{new Date(project.startDate).getFullYear()}</p>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Project Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selectedProject?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedProject?.thumbnailUrl && (
                  <img src={selectedProject.thumbnailUrl} alt={selectedProject.title} className="w-full rounded-lg" />
                )}
                {selectedProject?.description && (
                  <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                )}
                {selectedProject?.projectUrl && (
                  <Button onClick={() => window.open(selectedProject.projectUrl, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" /> View Project
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </section>
      )}

      {/* EXPERIENCE SECTION */}
      {sortedExperiences.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-[#F8F8F8]">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Experience
            </motion.h2>

            <div className="space-y-6">
              {sortedExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="pl-6 border-l-2" style={{ borderColor: '#1E88E5' }}
                >
                  <Card className="border-none shadow-none bg-white">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold">{exp.title}</h3>
                      <p className="text-gray-600 text-lg mt-1">{exp.company}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                      </p>
                      {exp.description && <p className="text-gray-700 mt-4">{exp.description}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS SECTION */}
      {userSkills.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Skills
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {userSkills.map((skill) => (
                <Card key={skill.id} className="border-black/10">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(skill as any).category && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {(skill as any).category}
                        </span>
                      )}
                      {(skill as any).yearsOfExperience && (
                        <span className="text-xs bg-black text-white px-2 py-1 rounded">
                          {(skill as any).yearsOfExperience}y exp
                        </span>
                      )}
                    </div>
                    {skill.level && (
                      <p className="text-sm text-gray-600 mt-2">{skill.level}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* EDUCATION SECTION */}
      {userEducations.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-[#F8F8F8]">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
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
                  className="p-6 bg-white rounded-sm border border-black/10"
                >
                  <h3 className="text-2xl font-semibold">{edu.degree}</h3>
                  <p className="text-gray-600 text-lg mt-1">{edu.institution}</p>
                  {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES SECTION */}
      {userServices.length > 0 && (
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1200px] mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Services
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {userServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ translateY: -8 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 bg-white border border-black/10 rounded-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  {service.description && (
                    <p className="text-gray-700">{service.description}</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-16 px-6 md:px-12 bg-black text-white">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-gray-400">{userInfo.name}</p>
          <p className="text-gray-500 text-sm mt-6">© 2024. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
