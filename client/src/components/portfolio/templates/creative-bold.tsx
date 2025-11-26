import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project, Service, Skill, WorkExperience, Education } from "@shared/schema";
import {
  Mail, Briefcase, GraduationCap, ExternalLink, Star, ChevronRight,
  Award, MapPin, Code, Zap, Users, Trophy
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface CreativeBoldProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    company?: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
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
    link?: string | null;
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
    icon?: string | null;
  }>;
  currentUserId?: number;
}

const coralColor = "#FF6B35";
const accentDark = "#E55a24";

function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = project.mediaUrls ? (typeof project.mediaUrls === 'string' ? JSON.parse(project.mediaUrls) : project.mediaUrls) : [];
  const allImages = [...(project.thumbnailUrl ? [project.thumbnailUrl] : []), ...mediaUrls];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-black">{project.title}</DialogTitle>
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
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {project.startDate && <div className="flex items-center gap-2"><ExternalLink className="h-4 w-4" /><span>{new Date(project.startDate).getFullYear()}</span></div>}
            {project.projectUrl && (
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition-colors" style={{ color: coralColor }}>
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

export default function CreativeBold({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: CreativeBoldProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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

  const sortedSkills = [...userSkills].sort((a, b) => {
    const profMap = { 'expert': 4, 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
    const aLevel = profMap[a.level?.toLowerCase() as keyof typeof profMap] ?? -1;
    const bLevel = profMap[b.level?.toLowerCase() as keyof typeof profMap] ?? -1;
    return bLevel - aLevel;
  });

  const displayTitle = userInfo.company ? `${userInfo.title} at ${userInfo.company}` : userInfo.title || "Creative Professional";

  return (
    <div className="min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <section className="py-16 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {/* LEFT: Info */}
            <motion.div className="space-y-6" initial={{ x: -50 }} animate={{ x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-6xl md:text-7xl font-black leading-tight" style={{ color: '#000' }}>{userInfo.name}</h1>
              <div className="space-y-2">
                <p className="text-xl md:text-2xl font-semibold" style={{ color: coralColor }}>{displayTitle}</p>
                {userInfo.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{userInfo.location}</span>
                  </div>
                )}
              </div>
              {userInfo.tagline && <p className="text-lg md:text-xl text-gray-700 italic font-light">{userInfo.tagline}</p>}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="text-white px-8 py-6 text-sm font-bold uppercase" style={{ backgroundColor: coralColor }} onClick={() => window.location.href = `mailto:${userInfo.email}`}>
                  <Mail className="w-5 h-5 mr-2" />Connect
                </Button>
                <Button size="lg" variant="outline" className="border-2 px-8 py-6 text-sm font-bold uppercase" style={{ borderColor: coralColor, color: coralColor }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = coralColor; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = coralColor; }}>
                  <Star className="w-5 h-5 mr-2" />Mentor
                </Button>
              </div>
            </motion.div>

            {/* RIGHT: Image */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="flex justify-center">
              {userInfo.photoURL && (
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: coralColor, opacity: 0.1 }} ></div>
                  <img src={userInfo.photoURL} alt={userInfo.name} className="relative w-full rounded-xl shadow-2xl" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement || userInfo.coreValues?.length) && (
        <section className="py-16 md:py-24 px-6 md:px-12" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="max-w-5xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-5xl md:text-6xl font-black mb-8" style={{ color: coralColor }}>About</h2>
              {userInfo.aboutMe && <p className="text-lg text-gray-700 leading-relaxed mb-8">{userInfo.aboutMe}</p>}
            </motion.div>

            <div className="space-y-8">
              {userInfo.visionStatement && (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="pl-6 border-l-4 border-white" style={{ borderLeftColor: coralColor }}>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: accentDark }}>Vision</h3>
                  <p className="text-gray-700 italic text-lg">"{userInfo.visionStatement}"</p>
                </motion.div>
              )}

              {userInfo.missionStatement && (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }} className="pl-6 border-l-4" style={{ borderLeftColor: coralColor }}>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: accentDark }}>Mission</h3>
                  <p className="text-gray-700 italic text-lg">"{userInfo.missionStatement}"</p>
                </motion.div>
              )}

              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: accentDark }}>Core Values</h3>
                  <div className="flex flex-wrap gap-3">
                    {userInfo.coreValues.map((value, idx) => (
                      <Badge key={idx} className="px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: coralColor }}>
                        {value}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* DETAILS SECTION */}
      <section className="py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {userInfo.industry && (
              <div className="text-center">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Industry</p>
                <p className="text-lg font-bold mt-2">{userInfo.industry}</p>
              </div>
            )}
            {userInfo.domain && (
              <div className="text-center">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Domain</p>
                <p className="text-lg font-bold mt-2">{userInfo.domain}</p>
              </div>
            )}
            {userInfo.email && (
              <div className="text-center">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Email</p>
                <p className="text-lg font-bold mt-2"><a href={`mailto:${userInfo.email}`} style={{ color: coralColor }}>{userInfo.email}</a></p>
              </div>
            )}
          </motion.div>
          {userInfo.lookingFor && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mt-8 text-center p-6 rounded-lg" style={{ backgroundColor: '#f9f9f9' }}>
              <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">Looking For</p>
              <p className="text-xl font-semibold text-gray-800">{userInfo.lookingFor}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* SERVICES SECTION - PRIMARY */}
      {userServices && userServices.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black mb-12" style={{ color: coralColor }}>Services</motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              {userServices.map((service, idx) => {
                const icons = [Briefcase, Star, Award, Code, Zap, Users];
                const Icon = icons[idx % icons.length];
                return (
                  <motion.div key={service.id} whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ duration: 0.3 }} className="p-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: coralColor + '20' }}>
                        <Icon className="w-8 h-8" style={{ color: coralColor }} />
                      </div>
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                    </div>
                    {service.description && <p className="text-gray-700 leading-relaxed">{service.description}</p>}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {sortedProjects.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black mb-12" style={{ color: coralColor }}>Projects</motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              {sortedProjects.map((project: any, idx) => {
                const aspectRatios = ['aspect-square', 'aspect-video', 'aspect-[4/3]', 'aspect-[3/4]'];
                const aspectClass = aspectRatios[idx % aspectRatios.length];
                return (
                  <motion.div key={project.id} whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="relative group cursor-pointer rounded-lg overflow-hidden" onClick={() => { setSelectedProject(project as any); setIsProjectModalOpen(true); }}>
                    <div className={`${aspectClass} overflow-hidden bg-gray-200 relative`}>
                      {project.thumbnailUrl && <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover" />}
                      <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: coralColor + '99' }}>
                        <div className="text-center">
                          <p className="text-white text-xl font-bold">{project.title}</p>
                          <ChevronRight className="w-6 h-6 text-white mx-auto mt-2" />
                        </div>
                      </motion.div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white">
                      <p className="font-bold text-lg">{project.title}</p>
                      {project.startDate && <p className="text-sm text-gray-300">{new Date(project.startDate).getFullYear()}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* EXPERIENCE SECTION */}
      {sortedExperiences.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black mb-12" style={{ color: coralColor }}>Experience</motion.h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 md:left-0 top-0 bottom-0 w-1" style={{ backgroundColor: coralColor + '20' }} ></div>
              {sortedExperiences.map((exp, idx) => (
                <motion.div key={exp.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }} className="relative pl-12 md:pl-0">
                  <div className="absolute -left-2 md:left-0 top-2 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: coralColor }} ></div>
                  <Card className="border border-gray-200 shadow-none">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold">{exp.title}</h3>
                      <p className="text-lg font-semibold text-gray-700 mt-1">{exp.company}</p>
                      <p className="text-sm" style={{ color: coralColor }}>{new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</p>
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
      {sortedSkills.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black mb-12" style={{ color: coralColor }}>Skills</motion.h2>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              {sortedSkills.map((skill) => {
                const profMap = { 'expert': 4, 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
                const level = profMap[skill.level?.toLowerCase() as keyof typeof profMap] ?? 0;
                return (
                  <motion.div key={skill.id} whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="p-6 rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="w-6 h-6" style={{ color: coralColor }} />
                      <h3 className="font-bold text-lg">{skill.name}</h3>
                    </div>
                    {skill.level && (
                      <div>
                        <p className="text-sm font-semibold" style={{ color: coralColor }}>{skill.level}</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: i <= level ? coralColor : '#e5e5e5' }} />
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
            <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black mb-12" style={{ color: coralColor }}>Education</motion.h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 md:left-0 top-0 bottom-0 w-1" style={{ backgroundColor: coralColor + '20' }} ></div>
              {sortedEducations.map((edu, idx) => (
                <motion.div key={edu.id} initial={{ opacity: 0, x: (idx % 2 === 0 ? -20 : 20) }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: idx * 0.1 }} viewport={{ once: true }} className={`relative pl-12 md:pl-0 ${idx % 2 === 0 ? 'md:pr-1/2' : 'md:ml-1/2'}`}>
                  <div className="absolute -left-2 md:left-0 top-2 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: coralColor }} ></div>
                  <Card className="border border-gray-200 shadow-none">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold">{edu.degree}</h3>
                      <p className="text-lg font-semibold text-gray-700 mt-1">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                      <p className="text-sm" style={{ color: coralColor }}>{new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CTA */}
      <section className="py-16 md:py-24 px-6 md:px-12" style={{ backgroundColor: coralColor }}>
        <div className="max-w-5xl mx-auto text-center text-white space-y-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-5xl md:text-6xl font-black">Ready to Create?</motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }} className="text-xl md:text-2xl max-w-3xl mx-auto">
            {userInfo.lookingFor || userInfo.whatIOffer || "Let's collaborate and bring your vision to life"}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" className="bg-white text-white font-bold uppercase px-10 py-6" onClick={() => window.location.href = `mailto:${userInfo.email}`} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = coralColor; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = 'white'; }} style={{ backgroundColor: 'white', color: coralColor }}>
              <Mail className="w-5 h-5 mr-2" />Connect With Me
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white font-bold uppercase px-10 py-6" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = coralColor; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'white'; }}>
              <Star className="w-5 h-5 mr-2" />Request Mentorship
            </Button>
          </motion.div>
        </div>
      </section>

      <ProjectModal project={selectedProject} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
    </div>
  );
}
