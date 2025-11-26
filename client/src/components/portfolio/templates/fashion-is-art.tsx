import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Download, ExternalLink, ChevronRight, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FashionIsArtProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    aboutMe: string | null;
    tagline: string | null;
    visionStatement: string | null;
    missionStatement: string | null;
    uniqueValueProposition: string | null;
    coreValues?: string[] | null;
    lookingFor: string | null;
    photoURL: string | null;
  };
  userSkills: Array<{ id: number; name: string; level?: string | null }>;
  userExperiences: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  }>;
  userProjects: Array<{
    id: number;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    mediaUrls?: string[];
    startDate?: string | null;
    projectUrl?: string | null;
  }>;
  userEducations?: Array<{
    id: number;
    institution: string;
    degree: string;
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
}

const signatureBlue = "#1E88E5";
const softGold = "#D4AF37";
const inkBlack = "#0B0B0B";
const paperWhite = "#FFFFFF";

function ProjectModal({ project, isOpen, onClose }: { project: any | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = project.mediaUrls ? (typeof project.mediaUrls === 'string' ? JSON.parse(project.mediaUrls) : project.mediaUrls) : [];
  const allImages = [...(project.thumbnailUrl ? [project.thumbnailUrl] : []), ...mediaUrls];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-4xl font-serif text-black">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <img key={idx} src={url} alt={`${project.title} - ${idx + 1}`} className="w-full h-auto object-cover rounded-lg" />
              ))}
            </div>
          )}
          {project.description && <p className="text-gray-700 leading-relaxed">{project.description}</p>}
          <div className="flex flex-wrap gap-4">
            {project.startDate && <span className="text-sm text-gray-600">{new Date(project.startDate).getFullYear()}</span>}
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition-colors" style={{ color: signatureBlue }}>
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

export default function FashionIsArt({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: FashionIsArtProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

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

  const sortedEducations = [...userEducations].sort((a, b) => {
    const aDate = a.endDate || '9999-12-31';
    const bDate = b.endDate || '9999-12-31';
    return bDate.localeCompare(aDate);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: paperWhite, color: inkBlack }}>
      {/* HERO SECTION */}
      <section className="py-20 md:py-32 px-6 md:px-12" style={{ backgroundColor: paperWhite }}>
        <div className="max-w-6xl mx-auto">
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {/* LEFT: Photo */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="flex justify-center order-2 lg:order-1">
              {userInfo.photoURL && (
                <div className="relative w-full max-w-sm">
                  <img src={userInfo.photoURL} alt={userInfo.name} className="w-full rounded-lg shadow-2xl" />
                </div>
              )}
            </motion.div>

            {/* RIGHT: Content */}
            <motion.div className="space-y-6 order-1 lg:order-2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
              <motion.h1 
                className="text-6xl md:text-7xl font-serif leading-tight" 
                style={{ color: inkBlack }}
              >
                {userInfo.name}
              </motion.h1>
              
              {userInfo.tagline && (
                <motion.p className="text-xl md:text-2xl text-gray-600 italic font-light">
                  {userInfo.tagline}
                </motion.p>
              )}

              {userInfo.title && (
                <motion.p className="text-lg font-semibold" style={{ color: signatureBlue }}>
                  {userInfo.title}
                </motion.p>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                {userInfo.location && (
                  <Badge className="px-4 py-2" style={{ backgroundColor: signatureBlue, color: 'white' }}>
                    <MapPin className="w-4 h-4 mr-2" />
                    {userInfo.location}
                  </Badge>
                )}
                {userInfo.industry && (
                  <Badge className="px-4 py-2" style={{ backgroundColor: signatureBlue, color: 'white' }}>
                    {userInfo.industry}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                <Button size="lg" className="px-8 py-6 text-white font-semibold rounded-full" style={{ backgroundColor: signatureBlue }}>
                  <Star className="w-5 h-5 mr-2" />
                  Book Me
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 font-semibold rounded-full" style={{ borderColor: signatureBlue, color: signatureBlue }}>
                  <Download className="w-5 h-5 mr-2" />
                  Media Kit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement) && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-5xl md:text-6xl font-serif mb-8" style={{ color: inkBlack }}>About</h2>
              {userInfo.aboutMe && <p className="text-lg text-gray-700 leading-relaxed mb-8">{userInfo.aboutMe}</p>}
            </motion.div>

            <div className="space-y-6">
              {userInfo.visionStatement && (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="pl-6 border-l-4" style={{ borderLeftColor: signatureBlue }}>
                  <h3 className="text-2xl font-serif mb-3" style={{ color: signatureBlue }}>Vision</h3>
                  <p className="text-gray-700 italic text-lg">"{userInfo.visionStatement}"</p>
                </motion.div>
              )}

              {userInfo.missionStatement && (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }} className="pl-6 border-l-4" style={{ borderLeftColor: signatureBlue }}>
                  <h3 className="text-2xl font-serif mb-3" style={{ color: signatureBlue }}>Mission</h3>
                  <p className="text-gray-700 italic text-lg">"{userInfo.missionStatement}"</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {sortedProjects.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-serif mb-12" style={{ color: inkBlack }}>
              Projects
            </motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              {sortedProjects.map((project: any, idx) => (
                <motion.div 
                  key={project.id} 
                  whileHover={{ translateY: -8 }} 
                  transition={{ duration: 0.3 }} 
                  className="group cursor-pointer rounded-lg overflow-hidden shadow-lg"
                  onClick={() => { setSelectedProject(project); setIsProjectModalOpen(true); }}
                >
                  <div className="relative h-80 overflow-hidden bg-gray-200">
                    {project.thumbnailUrl && (
                      <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      whileHover={{ opacity: 1 }} 
                      transition={{ duration: 0.3 }} 
                      className="absolute inset-0 flex items-end justify-start p-6" 
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    >
                      <div className="text-white">
                        <h3 className="text-2xl font-serif">{project.title}</h3>
                        {project.startDate && <p className="text-sm text-gray-200 mt-2">{new Date(project.startDate).getFullYear()}</p>}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* EXPERIENCE SECTION */}
      {sortedExperiences.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-serif mb-12" style={{ color: inkBlack }}>
              Experience
            </motion.h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 md:left-0 top-0 bottom-0 w-1" style={{ backgroundColor: signatureBlue + '20' }} />
              {sortedExperiences.map((exp, idx) => (
                <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }} className="relative pl-12 md:pl-0">
                  <div className="absolute -left-2 md:left-0 top-2 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: signatureBlue }} />
                  <Card className="border border-gray-200 shadow-none">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-serif">{exp.title}</h3>
                      <p className="text-lg font-semibold text-gray-700 mt-1">{exp.company}</p>
                      <p className="text-sm" style={{ color: signatureBlue }}>{new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</p>
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
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-serif mb-12" style={{ color: inkBlack }}>
              Skills
            </motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              {userSkills.map((skill) => {
                const profMap = { 'expert': 4, 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
                const level = profMap[skill.level?.toLowerCase() as keyof typeof profMap] ?? 0;
                return (
                  <motion.div key={skill.id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="p-6 rounded-lg border border-gray-200 bg-white">
                    <h3 className="font-serif text-lg mb-3">{skill.name}</h3>
                    {skill.level && (
                      <div>
                        <p className="text-sm font-semibold" style={{ color: signatureBlue }}>{skill.level}</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: i <= level ? signatureBlue : '#e5e5e5' }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* EDUCATION SECTION */}
      {sortedEducations.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-serif mb-12" style={{ color: inkBlack }}>
              Education
            </motion.h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 md:left-0 top-0 bottom-0 w-1" style={{ backgroundColor: signatureBlue + '20' }} />
              {sortedEducations.map((edu, idx) => (
                <motion.div key={edu.id} initial={{ opacity: 0, x: (idx % 2 === 0 ? -20 : 20) }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }} className="relative pl-12 md:pl-0">
                  <div className="absolute -left-2 md:left-0 top-2 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: signatureBlue }} />
                  <Card className="border border-gray-200 shadow-none">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-serif">{edu.degree}</h3>
                      <p className="text-lg font-semibold text-gray-700 mt-1">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                      <p className="text-sm" style={{ color: signatureBlue }}>{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CTA */}
      <section className="py-16 md:py-24 px-6 md:px-12 text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-serif" style={{ color: inkBlack }}>
            Ready to Collaborate?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }} className="text-xl text-gray-700">
            {userInfo.lookingFor || "Let's create something extraordinary together"}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="px-8 py-6 text-white font-semibold rounded-full" style={{ backgroundColor: signatureBlue }}>
              <Mail className="w-5 h-5 mr-2" />
              Get in Touch
            </Button>
          </motion.div>
        </div>
      </section>

      <ProjectModal project={selectedProject} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}
