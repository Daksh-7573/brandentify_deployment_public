import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Calendar, Mail, MapPin, Star, Award, Briefcase, GraduationCap, Heart, MessageCircle, CheckCircle2, ExternalLink, Camera, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
      whileHover: { y: -4, transition: { duration: 0.15 } }
    },
    scalePress: prefersReducedMotion ? {} : {
      whileTap: { scale: 0.98 }
    }
  };
};

// Skill progress indicator
function SkillIndicator({ skill }: { skill: Skill }) {
  const proficiency = skill.proficiency || 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.name}</span>
        <Badge variant="outline" className="text-xs">
          {skill.level}
        </Badge>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-700"
          style={{ width: `${proficiency}%` }}
        />
      </div>
    </div>
  );
}

// Project gallery card
function ProjectGalleryCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const anim = useAnimationConfig();
  const isVideo = project.mediaUrls && project.mediaUrls.length > 0 && 
    (project.mediaUrls[0].endsWith('.mp4') || project.mediaUrls[0].endsWith('.webm'));
  
  return (
    <motion.div
      {...anim.fadeIn}
      {...anim.hoverLift}
      className="group relative aspect-[3/4] md:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
      onClick={onClick}
      data-testid={`project-card-${project.id}`}
    >
      {project.thumbnailUrl ? (
        <img 
          src={project.thumbnailUrl} 
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-teal-100 dark:from-indigo-900/30 dark:to-teal-900/30" />
      )}
      
      {isVideo && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
          <Play className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
          <div className="flex gap-2 flex-wrap">
            {project.category && (
              <Badge className="bg-indigo-500/90 text-white border-0 text-xs">
                {project.category}
              </Badge>
            )}
            {project.industry && (
              <Badge className="bg-teal-500/90 text-white border-0 text-xs">
                {project.industry}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Project detail modal with media carousel
function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  if (!project) return null;
  
  const mediaItems = project.mediaUrls || [project.thumbnailUrl].filter(Boolean);
  const currentMedia = mediaItems[currentMediaIndex] || project.thumbnailUrl;
  const isVideo = currentMedia?.endsWith('.mp4') || currentMedia?.endsWith('.webm');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
          <DialogDescription>
            {project.category} {project.industry && `• ${project.industry}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Media Carousel */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {isVideo ? (
              <video 
                src={currentMedia} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={currentMedia} 
                alt={project.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          {/* Thumbnail navigation */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((media, idx) => {
                const isVideoThumb = media.endsWith('.mp4') || media.endsWith('.webm');
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentMediaIndex ? 'border-indigo-500' : 'border-transparent'
                    }`}
                    data-testid={`media-thumbnail-${idx}`}
                  >
                    {isVideoThumb ? (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                    ) : (
                      <img src={media} alt={`${project.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Project details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2">Description</h4>
              <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {project.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.projectUrl && (
                <a 
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Contact modal
function ContactModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId?: number }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/contact/${userId}`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
      
      setFormData({ name: '', email: '', message: '' });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Let's Talk</DialogTitle>
          <DialogDescription>Send me a message and I'll get back to you soon.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-contact-name"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              data-testid="input-contact-email"
            />
          </div>
          <div>
            <Textarea
              placeholder="Your Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              data-testid="textarea-contact-message"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isSubmitting}
            data-testid="button-send-message"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PhotographerPortfolioProps {
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
    brandName?: string | null;
    primaryAudience?: string[];
    secondaryAudience?: string[];
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

export default function PhotographerPortfolio({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
  currentUserId
}: PhotographerPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const { toast } = useToast();
  const anim = useAnimationConfig();
  
  const heroImage = userProjects[0]?.thumbnailUrl || userInfo.photoURL || '/placeholder-hero.jpg';
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };
  
  const handleResumeDownload = () => {
    if (userInfo.id) {
      window.location.href = `/api/user/${userInfo.id}/resume`;
    } else {
      toast({
        title: "Resume not available",
        description: "Please contact me directly for my resume.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt={userInfo.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12 md:pb-16">
          <motion.div {...anim.fadeIn} className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/20">
                <AvatarImage src={userInfo.photoURL || undefined} alt={userInfo.name} />
                <AvatarFallback className="text-2xl bg-indigo-600 text-white">
                  {userInfo.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{userInfo.name}</h1>
                {userInfo.title && (
                  <p className="text-xl md:text-2xl text-white/90">{userInfo.title}</p>
                )}
              </div>
            </div>
            
            {userInfo.tagline && (
              <p className="text-lg md:text-xl text-white/80 mb-2">{userInfo.tagline}</p>
            )}
            
            {userInfo.location && (
              <div className="flex items-center gap-2 text-white/70 mb-8">
                <MapPin className="w-5 h-5" />
                <span>{userInfo.location}</span>
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setIsMentorModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-testid="button-mentor"
              >
                <Heart className="w-4 h-4 mr-2" />
                Mentor
              </Button>
              <Button 
                onClick={handleResumeDownload}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                data-testid="button-resume"
              >
                <Download className="w-4 h-4 mr-2" />
                Grab my Resume
              </Button>
              <Button 
                onClick={() => setIsContactModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-contact"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Let's Talk
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* About & Brand Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div {...anim.fadeIn}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About Me</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {userInfo.aboutMe || "Passionate photographer dedicated to capturing moments that tell stories."}
              </p>
              
              {userInfo.uniqueValueProposition && (
                <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">What Sets Me Apart</h3>
                    <p className="text-indigo-800 dark:text-indigo-200">{userInfo.uniqueValueProposition}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
            
            <motion.div {...anim.fadeIn}>
              {userInfo.brandName && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{userInfo.brandName}</h3>
                </div>
              )}
              
              {userInfo.visionStatement && (
                <Card className="mb-4">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Vision</h4>
                    <p className="text-gray-700 dark:text-gray-300">{userInfo.visionStatement}</p>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.missionStatement && (
                <Card className="mb-4">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Mission</h4>
                    <p className="text-gray-700 dark:text-gray-300">{userInfo.missionStatement}</p>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.coreValues.map((value, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-gray-200 dark:bg-gray-700">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      {(userServices.length > 0 || userInfo.whatIOffer) && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div {...anim.fadeIn}>
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Services</h2>
              
              {userServices.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {userServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Camera className="w-10 h-10 text-indigo-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                        {service.price && (
                          <p className="text-lg font-bold text-indigo-600">{service.price}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <p className="text-gray-700 dark:text-gray-300 text-center">{userInfo.whatIOffer}</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Skills Section */}
      {userSkills.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div {...anim.fadeIn}>
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Skills & Tools</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {userSkills.slice(0, 9).map((skill) => (
                  <SkillIndicator key={skill.id} skill={skill} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Project Gallery */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div {...anim.fadeIn}>
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Portfolio</h2>
            
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project) => (
                  <ProjectGalleryCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No projects yet. Check back soon!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Experience Timeline */}
      {userExperiences.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div {...anim.fadeIn}>
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Career Path</h2>
              <div className="max-w-4xl mx-auto space-y-6">
                {userExperiences.map((exp) => (
                  <Card key={exp.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Briefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mt-2">
                            <span>{new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</span>
                            {exp.location && (
                              <>
                                <span>•</span>
                                <span>{exp.location}</span>
                              </>
                            )}
                          </div>
                          {exp.description && (
                            <p className="mt-3 text-gray-700 dark:text-gray-300">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Education */}
      {userEducations.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div {...anim.fadeIn}>
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Education</h2>
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                {userEducations.map((edu) => (
                  <Card key={edu.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                          <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{edu.fieldOfStudy}</p>
                          )}
                          {edu.graduationDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(edu.graduationDate).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Work Together?</h2>
          <p className="text-xl mb-8 text-white/90">Let's create something amazing</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => setIsMentorModalOpen(true)}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-indigo-600"
              data-testid="button-mentor-footer"
            >
              <Heart className="w-5 h-5 mr-2" />
              Mentor
            </Button>
            <Button 
              onClick={handleResumeDownload}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-indigo-600"
              data-testid="button-resume-footer"
            >
              <Download className="w-5 h-5 mr-2" />
              Grab my Resume
            </Button>
            <Button 
              onClick={() => setIsContactModalOpen(true)}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100"
              data-testid="button-contact-footer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Let's Talk
            </Button>
          </div>
        </div>
      </section>
      
      {/* Modals */}
      <ProjectModal 
        project={selectedProject}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
      
      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userId={userInfo.id}
      />
      
      {/* Mentor Modal - reuse Contact Modal structure */}
      <ContactModal 
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        userId={userInfo.id}
      />
    </div>
  );
}
