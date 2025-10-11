import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Calendar, Mail, CheckCircle2, ExternalLink, Star, MapPin, Users, Award, Briefcase, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

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
function SkillBar({ skill, delay = 0 }: { skill: any; delay?: number }) {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(skill.proficiency || 0);
    } else {
      const timer = setTimeout(() => {
        setProgress(skill.proficiency || 0);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [skill.proficiency, delay, prefersReducedMotion]);
  
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
function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
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

export default function DesignerPortfolio() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const anim = useAnimationConfig();
  
  const userId = user?.id || 1;
  
  // Fetch user profile data
  const { data: profile } = useQuery<any>({
    queryKey: ['/api/user', userId],
    enabled: !!userId
  });
  
  // Fetch skills
  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ['/api/skills', userId],
    enabled: !!userId
  });
  
  // Fetch projects
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', userId],
    enabled: !!userId
  });
  
  // Fetch work experiences
  const { data: experiences = [] } = useQuery<any[]>({
    queryKey: ['/api/work-experiences', userId],
    enabled: !!userId
  });
  
  // Fetch education
  const { data: education = [] } = useQuery<any[]>({
    queryKey: ['/api/education', userId],
    enabled: !!userId
  });
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }
  
  const handleResumeDownload = () => {
    if (profile.resumeUrl) {
      window.open(profile.resumeUrl, '_blank');
    } else {
      window.open(`/api/user/${userId}/resume`, '_blank');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.name?.charAt(0) || profile.username?.charAt(0)}
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {profile.name || profile.username}
                </h1>
                <h2 className="text-xl md:text-2xl text-white/70 mb-3">
                  {profile.title || 'Professional'}
                </h2>
                {profile.tagline && (
                  <p className="text-lg text-purple-400 font-medium mb-6">
                    {profile.tagline}
                  </p>
                )}
                
                {/* Location & Stats */}
                <div className="flex flex-wrap gap-4 mb-6 text-white/60">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {projects.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{projects.length} Projects</span>
                    </div>
                  )}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <motion.div {...anim.scalePress}>
                    <Button
                      onClick={() => setShowContactModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                      data-testid="button-lets-talk"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Let's Talk
                    </Button>
                  </motion.div>
                  
                  <motion.div {...anim.scalePress}>
                    <Button
                      onClick={() => setShowMentorModal(true)}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      data-testid="button-mentor"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Mentor
                    </Button>
                  </motion.div>
                  
                  <motion.div {...anim.scalePress}>
                    <Button
                      onClick={handleResumeDownload}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      data-testid="button-resume"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Grab my Resume
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      {(profile.aboutMe || profile.uniqueValueProposition || profile.visionStatement) && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div {...anim.fadeIn}>
                <h2 className="text-3xl font-bold text-white mb-6">About Me</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 leading-relaxed">{profile.aboutMe}</p>
                </div>
              </motion.div>
              
              <motion.div {...anim.fadeIn} className="space-y-6">
                {profile.uniqueValueProposition && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-3">What I Do</h3>
                      <p className="text-white/80">{profile.uniqueValueProposition}</p>
                    </CardContent>
                  </Card>
                )}
                
                {profile.coreValues && profile.coreValues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Core Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.coreValues.map((value: string, idx: number) => (
                        <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.primaryAudience && profile.primaryAudience.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Primary Audience</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.primaryAudience.map((audience: string, idx: number) => (
                        <Badge key={idx} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}
      
      {/* What I Offer */}
      {profile.whatIOffer && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...anim.fadeIn} className="text-3xl font-bold text-white mb-8">
              What I Offer
            </motion.h2>
            <motion.div {...anim.fadeIn}>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-8">
                  <p className="text-white/80 text-lg leading-relaxed">{profile.whatIOffer}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Skills Section */}
      {skills.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...anim.fadeIn} className="text-3xl font-bold text-white mb-8">
              What I'm Good At
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              {skills.map((skill: any, idx: number) => (
                <SkillBar key={skill.id} skill={skill} delay={idx * 100} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Project Showcase */}
      {projects.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...anim.fadeIn} className="text-3xl font-bold text-white mb-8">
              Project Showcase
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Work Experience Timeline */}
      {experiences.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...anim.fadeIn} className="text-3xl font-bold text-white mb-8">
              Career Path
            </motion.h2>
            <div className="space-y-8">
              {experiences.map((exp: any, idx: number) => (
                <motion.div
                  key={exp.id}
                  {...anim.fadeIn}
                  className="flex gap-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-purple-500 border-4 border-purple-500/20" />
                    {idx < experiences.length - 1 && (
                      <div className="w-px flex-1 bg-white/10 mt-2" />
                    )}
                  </div>
                  <Card className="flex-1 bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
                          <p className="text-white/70">{exp.company}</p>
                        </div>
                        <span className="text-sm text-white/60">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-white/80 mb-3">{exp.description}</p>
                      )}
                      {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                          {exp.keyResponsibilities.map((resp: string, i: number) => (
                            <li key={i}>{resp}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Education */}
      {education.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.h2 {...anim.fadeIn} className="text-3xl font-bold text-white mb-8">
              Academic Background
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              {education.map((edu: any) => (
                <motion.div key={edu.id} {...anim.fadeIn} {...anim.hoverLift}>
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <GraduationCap className="w-6 h-6 text-purple-400 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{edu.degree}</h3>
                          <p className="text-white/70">{edu.institution}</p>
                          <span className="text-sm text-white/60">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </span>
                        </div>
                      </div>
                      {edu.fieldOfStudy && (
                        <p className="text-white/80 mb-3">Field: {edu.fieldOfStudy}</p>
                      )}
                      {edu.skillsAcquired && edu.skillsAcquired.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {edu.skillsAcquired.map((skill: string, i: number) => (
                            <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/20">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">{selectedProject.title}</DialogTitle>
                <DialogDescription className="text-white/70">
                  {selectedProject.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedProject.thumbnailUrl && (
                  <img 
                    src={selectedProject.thumbnailUrl}
                    alt={selectedProject.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedProject.category && (
                    <div>
                      <span className="text-white/60">Category:</span>
                      <p className="text-white font-medium">{selectedProject.category}</p>
                    </div>
                  )}
                  {selectedProject.industry && (
                    <div>
                      <span className="text-white/60">Industry:</span>
                      <p className="text-white font-medium">{selectedProject.industry}</p>
                    </div>
                  )}
                </div>
                
                {selectedProject.projectUrl && (
                  <Button
                    onClick={() => window.open(selectedProject.projectUrl, '_blank')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Project
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Mentor Modal */}
      <Dialog open={showMentorModal} onOpenChange={setShowMentorModal}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Request Mentorship</DialogTitle>
            <DialogDescription className="text-white/70">
              I'd love to help you grow in your career. Let me know what you're looking for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/80 text-sm">
              This feature is coming soon. You can reach out directly via the contact form.
            </p>
            <Button onClick={() => {
              setShowMentorModal(false);
              setShowContactModal(true);
            }} className="w-full bg-purple-600 hover:bg-purple-700">
              Open Contact Form
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Let's Talk</DialogTitle>
            <DialogDescription className="text-white/70">
              Send me a message and I'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/80 text-sm">
              Contact form integration coming soon. For now, you can reach out at:
            </p>
            {profile.email && (
              <div className="flex items-center gap-2 text-white">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${profile.email}`} className="hover:text-purple-400 transition-colors">
                  {profile.email}
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
