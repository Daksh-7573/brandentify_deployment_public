import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Mail, CheckCircle2, ExternalLink, Star, MapPin, Users, Award, Briefcase, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { User, Skill, Project, WorkExperience, Education, Service } from "@shared/schema";

// Animation configuration with reduced motion support
const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    duration: prefersReducedMotion ? 0 : 0.2,
    fadeIn: prefersReducedMotion ? {} : { 
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.3 }
    },
    hoverLift: prefersReducedMotion ? {} : {
      whileHover: { y: -6, transition: { duration: 0.18 } }
    },
    scalePress: prefersReducedMotion ? {} : {
      whileTap: { scale: 0.98 }
    }
  };
};

// Skill progress bar with animation
function SkillBar({ skill, delay = 0 }: { skill: Skill; delay?: number }) {
  const [progress, setProgress] = useState(skill.proficiency || 0);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-white/90">{skill.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">
            {skill.level}
          </Badge>
          <span className="text-white/60">{skill.proficiency}%</span>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Project card with hover overlay
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const anim = useAnimationConfig();
  
  return (
    <motion.div
      {...anim.fadeIn}
      {...anim.hoverLift}
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10"
      onClick={onClick}
    >
      {project.thumbnailUrl ? (
        <img 
          src={project.thumbnailUrl} 
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
          <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
          <p className="text-white/80 text-sm line-clamp-2 mb-3">{project.description}</p>
          <div className="flex gap-2">
            {project.category && (
              <Badge className="bg-purple-500/80 text-white border-0">
                {project.category}
              </Badge>
            )}
            {project.industry && (
              <Badge className="bg-indigo-500/80 text-white border-0">
                {project.industry}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface DesignerShowcaseProps {
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
    coreValues?: string[];
    uniqueValueProposition?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
}

export default function DesignerShowcase({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices
}: DesignerShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const anim = useAnimationConfig();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div {...anim.fadeIn} className="flex flex-col md:flex-row gap-12 items-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-xl bg-white/10">
                {userInfo.photoURL ? (
                  <img src={userInfo.photoURL} alt={userInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-6xl font-bold">
                    {userInfo.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 p-3 rounded-full border-4 border-slate-900">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                {userInfo.name}
              </h1>
              <p className="text-2xl text-white/80 mb-2">{userInfo.title || "Creative Professional"}</p>
              
              {/* Industry & Domain under Job Title */}
              {(userInfo.industry || userInfo.domain) && (
                <div className="flex items-center gap-2 text-white/70 mb-4 justify-center md:justify-start">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {userInfo.industry}
                    {userInfo.industry && userInfo.domain && " • "}
                    {userInfo.domain}
                  </span>
                </div>
              )}
              
              {userInfo.location && (
                <div className="flex items-center gap-2 text-white/60 mb-2 justify-center md:justify-start">
                  <MapPin className="w-5 h-5" />
                  <span>{userInfo.location}</span>
                </div>
              )}
              
              {/* Tagline under Location */}
              {userInfo.tagline && (
                <p className="text-lg text-white/70 italic mb-3 justify-center md:justify-start">
                  "{userInfo.tagline}"
                </p>
              )}
              
              {/* I am Looking for under Tagline (highlighted) */}
              {userInfo.lookingFor && (
                <div className="mb-6 inline-block">
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 text-base">
                    <Users className="w-4 h-4 mr-2 inline" />
                    Looking for: {userInfo.lookingFor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              )}
              
              <div className="flex gap-4 justify-center md:justify-start flex-wrap mt-4">
                <Button onClick={() => setShowMentorModal(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Star className="w-4 h-4 mr-2" />
                  Book a Mentorship
                </Button>
                {userInfo.email && (
                  <Button onClick={() => setShowContactModal(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Mail className="w-4 h-4 mr-2" />
                    Let's Talk
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement || userInfo.uniqueValueProposition || (userInfo.coreValues && userInfo.coreValues.length > 0)) && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-400" />
              About Me
            </h2>
            {userInfo.aboutMe && <p className="text-white/80 leading-relaxed mb-6">{userInfo.aboutMe}</p>}
            
            <div className="grid md:grid-cols-2 gap-6">
              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.coreValues.map((value, i) => (
                      <Badge key={i} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {userInfo.visionStatement && (
                <div>
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Vision</h3>
                  <p className="text-white/70">{userInfo.visionStatement}</p>
                </div>
              )}
              {userInfo.missionStatement && (
                <div>
                  <h3 className="text-xl font-semibold text-indigo-400 mb-2">Mission</h3>
                  <p className="text-white/70">{userInfo.missionStatement}</p>
                </div>
              )}
              {(userInfo.uniqueValueProposition || userInfo.whatIOffer) && (
                <>
                  {userInfo.uniqueValueProposition && (
                    <div>
                      <h3 className="text-xl font-semibold text-pink-400 mb-2">Unique Value Proposition</h3>
                      <p className="text-white/70">{userInfo.uniqueValueProposition}</p>
                    </div>
                  )}
                  {userInfo.whatIOffer && (
                    <div>
                      <h3 className="text-xl font-semibold text-amber-400 mb-2">What I Offer</h3>
                      <p className="text-white/70">{userInfo.whatIOffer}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Services Section */}
      {userServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-400" />
              What I Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {userServices.map((service) => (
                <motion.div key={service.id} {...anim.hoverLift}>
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-colors h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-white">{service.title}</h3>
                      <p className="text-white/70 mb-4">{service.description}</p>
                      {service.priceUsd && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-purple-400">${service.priceUsd}</span>
                          {service.isHourly && <span className="text-white/60 text-sm">/hour</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Skills Section */}
      {userSkills.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              Skills & Expertise
            </h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="grid md:grid-cols-2 gap-6">
                {userSkills.map((skill, index) => (
                  <SkillBar key={skill.id} skill={skill} delay={index * 100} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Projects Grid */}
      {userProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-400" />
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Work Experience */}
      {userExperiences.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-purple-400" />
              Work Experience
            </h2>
            <div className="space-y-6">
              {userExperiences.map((exp) => (
                <motion.div key={exp.id} {...anim.hoverLift}>
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-white">{exp.title}</h3>
                          <p className="text-purple-400 text-lg">{exp.company}</p>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-300">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="text-white/80 mb-3">{exp.description}</p>
                      )}
                      {exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                          {(exp.keyResponsibilities as string[]).map((resp, i) => (
                            <li key={i}>{resp}</li>
                          ))}
                        </ul>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Education */}
      {userEducations.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-400" />
              Education
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userEducations.map((edu) => (
                <motion.div key={edu.id} {...anim.hoverLift}>
                  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{edu.degree}</h3>
                          <p className="text-purple-400">{edu.institution}</p>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">
                          {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </Badge>
                      </div>
                      {edu.fieldOfStudy && (
                        <p className="text-white/80 mb-3">Field: {edu.fieldOfStudy}</p>
                      )}
                      {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(edu.skillsAcquired as string[]).map((skill, i) => (
                            <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{selectedProject.title}</DialogTitle>
                <DialogDescription className="text-white/70 text-lg mt-2">
                  {selectedProject.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex gap-3 flex-wrap">
                  {selectedProject.category && (
                    <Badge className="bg-purple-500/80">{selectedProject.category}</Badge>
                  )}
                  {selectedProject.industry && (
                    <Badge className="bg-indigo-500/80">{selectedProject.industry}</Badge>
                  )}
                </div>
                {selectedProject.projectUrl && (
                  <Button 
                    onClick={() => window.open(selectedProject.projectUrl || undefined, '_blank')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Project
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mentor Modal */}
      <Dialog open={showMentorModal} onOpenChange={setShowMentorModal}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Book a Mentorship Session</DialogTitle>
            <DialogDescription className="text-white/70">
              Connect with {userInfo.name} for personalized guidance
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/80 mb-4">This feature is coming soon!</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Get in Touch</DialogTitle>
            <DialogDescription className="text-white/70">
              Reach out to {userInfo.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {userInfo.email && (
              <Button 
                onClick={() => window.location.href = `mailto:${userInfo.email}`}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email to {userInfo.email}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
