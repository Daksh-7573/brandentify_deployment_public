import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Calendar, MapPin, Heart, MessageCircle, ExternalLink, Camera, Play, Target, Compass } from "lucide-react";
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
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hoverLift: prefersReducedMotion ? {} : {
      whileHover: { y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", transition: { duration: 0.15 } }
    }
  };
};

// Skill bar component with sophisticated design
function SkillBar({ skill }: { skill: Skill }) {
  const proficiency = skill.proficiency || 0;
  const anim = useAnimationConfig();
  
  return (
    <motion.div {...anim.fadeIn} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{skill.name}</span>
        <Badge variant="outline" className="text-xs border-[#A8A8A8]" style={{ color: '#555555' }}>
          {skill.level}
        </Badge>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EAEAEA' }}>
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: '#6366F1' }}
          initial={{ width: 0 }}
          whileInView={{ width: `${proficiency}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// Masonry Gallery Item
function ProjectGalleryCard({ project, onClick, index }: { project: Project; onClick: () => void; index: number }) {
  const anim = useAnimationConfig();
  const mediaUrls = (project.mediaUrls as string[]) || [];
  const isVideo = mediaUrls.length > 0 && 
    (mediaUrls[0].endsWith('.mp4') || mediaUrls[0].endsWith('.webm'));
  
  // Vary aspect ratios for masonry effect
  const aspectClass = index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/3]";
  
  return (
    <motion.div
      {...anim.fadeIn}
      {...anim.hoverLift}
      className={`group relative ${aspectClass} rounded-xl overflow-hidden cursor-pointer`}
      style={{ backgroundColor: '#F8F9FA' }}
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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #EAEAEA 100%)' }} />
      )}
      
      {isVideo && (
        <div className="absolute top-4 right-4 rounded-full p-2" style={{ backgroundColor: 'rgba(11, 12, 16, 0.6)', backdropFilter: 'blur(8px)' }}>
          <Play className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%)' }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
          {project.category && (
            <p className="text-sm text-white/80">{project.category}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Project Modal
function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  if (!project) return null;
  
  const mediaUrls = (project.mediaUrls as string[]) || [];
  const mediaItems = mediaUrls.length > 0 ? mediaUrls : [project.thumbnailUrl].filter(Boolean);
  const currentMedia = mediaItems[currentMediaIndex] || project.thumbnailUrl;
  const isVideo = currentMedia?.endsWith('.mp4') || currentMedia?.endsWith('.webm');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F8F9FA' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>
            {project.title}
          </DialogTitle>
          <DialogDescription style={{ color: '#555555' }}>
            {project.category} {project.industry && `• ${project.industry}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative aspect-video rounded-lg overflow-hidden" style={{ backgroundColor: '#EAEAEA' }}>
            {isVideo ? (
              <video src={currentMedia || undefined} controls className="w-full h-full object-contain" />
            ) : (
              <img src={currentMedia || undefined} alt={project.title} className="w-full h-full object-contain" />
            )}
          </div>
          
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((media, idx) => {
                if (!media) return null;
                const isVideoThumb = media.endsWith('.mp4') || media.endsWith('.webm');
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === currentMediaIndex ? 'border-[#6366F1]' : 'border-transparent'
                    }`}
                    data-testid={`media-thumbnail-${idx}`}
                  >
                    {isVideoThumb ? (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAEAEA' }}>
                        <Play className="w-6 h-6" style={{ color: '#555555' }} />
                      </div>
                    ) : (
                      <img src={media} alt={`${project.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-2" style={{ fontFamily: 'Inter', color: '#0B0C10' }}>Description</h4>
              <p style={{ color: '#555555', lineHeight: '1.5' }}>{project.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {project.startDate && (
                <div className="flex items-center gap-2 text-sm" style={{ color: '#555555' }}>
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.projectUrl && (
                <a 
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:opacity-80"
                  style={{ color: '#6366F1' }}
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

// Contact Modal
function ContactModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId?: number }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest('POST', `/api/contact/${userId}`, formData);
      
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
      <DialogContent className="max-w-md" style={{ backgroundColor: '#F8F9FA' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>Let's create something together</DialogTitle>
          <DialogDescription style={{ color: '#555555' }}>
            I'm open to collaborations and mentorship.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-contact-name"
          />
          <Input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            data-testid="input-contact-email"
          />
          <Textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            data-testid="textarea-contact-message"
          />
          <Button 
            type="submit" 
            className="w-full hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#6366F1', color: 'white' }}
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
  currentUserId
}: PhotographerPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Hero Section with Vision/Mission Overlay */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt={userInfo.name}
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 100%)' }}
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative h-full container mx-auto px-4 md:px-6 lg:px-8 flex items-end pb-20 md:pb-24">
          <div className="w-full grid md:grid-cols-2 gap-8 items-end">
            {/* Left: Profile Info */}
            <motion.div {...anim.fadeIn} className="space-y-6">
              <div>
                <h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-3"
                  style={{ fontFamily: 'Playfair Display', lineHeight: '1.2' }}
                >
                  {userInfo.name}
                </h1>
                {userInfo.title && (
                  <p className="text-xl md:text-2xl text-white/90 font-light" style={{ fontFamily: 'Inter' }}>
                    {userInfo.title}
                  </p>
                )}
              </div>
              
              {userInfo.aboutMe && (
                <p className="text-base md:text-lg text-white/80 max-w-lg leading-relaxed" style={{ fontFamily: 'Inter' }}>
                  {userInfo.aboutMe}
                </p>
              )}
              
              {userInfo.location && (
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-5 h-5" />
                  <span style={{ fontFamily: 'Inter', fontSize: '15px' }}>{userInfo.location}</span>
                </div>
              )}
              
              {userInfo.whatIOffer && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-white/60 mb-2" style={{ fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    What I Offer
                  </h3>
                  <p className="text-white/90" style={{ fontFamily: 'Inter' }}>{userInfo.whatIOffer}</p>
                </div>
              )}
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#6366F1', color: 'white', fontFamily: 'Inter', fontSize: '15px', letterSpacing: '0.01em' }}
                  data-testid="button-mentor"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Mentor
                </Button>
                <Button 
                  onClick={handleResumeDownload}
                  variant="outline"
                  className="rounded-lg px-6 py-3 font-medium transition-all hover:bg-white/10"
                  style={{ 
                    borderColor: 'rgba(255,255,255,0.3)', 
                    color: 'white', 
                    fontFamily: 'Inter', 
                    fontSize: '15px',
                    letterSpacing: '0.01em'
                  }}
                  data-testid="button-resume"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Grab my Resume
                </Button>
                <Button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="rounded-lg px-6 py-3 font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'transparent', color: 'white', border: '2px solid #6366F1', fontFamily: 'Inter', fontSize: '15px', letterSpacing: '0.01em' }}
                  data-testid="button-contact"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Let's Talk
                </Button>
              </div>
            </motion.div>
            
            {/* Right: Vision & Mission Cards */}
            <motion.div {...anim.fadeIn} className="flex flex-col gap-4 md:items-end">
              {userInfo.visionStatement && (
                <Card className="w-full md:w-80 rounded-xl overflow-hidden border-0">
                  <CardContent className="p-6" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <Target className="w-5 h-5 mt-1" style={{ color: '#6366F1' }} />
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>Vision</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555', fontFamily: 'Inter', fontStyle: 'italic' }}>
                      {userInfo.visionStatement}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.missionStatement && (
                <Card className="w-full md:w-80 rounded-xl overflow-hidden border-0">
                  <CardContent className="p-6" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <Compass className="w-5 h-5 mt-1" style={{ color: '#6366F1' }} />
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>Mission</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#555555', fontFamily: 'Inter', fontStyle: 'italic' }}>
                      {userInfo.missionStatement}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <Card className="w-full md:w-80 rounded-xl overflow-hidden border-0">
                  <CardContent className="p-6" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: 'Inter', color: '#0B0C10', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Core Values
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.coreValues.map((value, idx) => (
                        <Badge 
                          key={idx} 
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{ backgroundColor: '#F8F9FA', color: '#555555', border: '1px solid #EAEAEA' }}
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Looking For Section */}
      {userInfo.lookingFor && (
        <section className="py-20 md:py-24" style={{ backgroundColor: '#0B0C10' }}>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div {...anim.fadeIn} className="max-w-4xl mx-auto text-center">
              <h2 
                className="text-sm font-medium mb-4" 
                style={{ fontFamily: 'Inter', color: '#A8A8A8', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Looking For
              </h2>
              <p 
                className="text-2xl md:text-3xl leading-relaxed"
                style={{ fontFamily: 'Playfair Display', color: 'white', fontWeight: 500 }}
              >
                {userInfo.lookingFor}
              </p>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* What I'm Good At Section */}
      {userSkills.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div {...anim.fadeIn} className="max-w-5xl mx-auto">
              <h2 
                className="text-3xl md:text-4xl font-semibold mb-16 text-center"
                style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}
              >
                What I'm Good At
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
                {userSkills.slice(0, 9).map((skill) => (
                  <SkillBar key={skill.id} skill={skill} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Portfolio Gallery - Masonry Layout */}
      <section className="py-20 md:py-24" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div {...anim.fadeIn}>
            <h2 
              className="text-3xl md:text-4xl font-semibold mb-16 text-center"
              style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}
            >
              Portfolio
            </h2>
            
            {userProjects.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {userProjects.map((project, idx) => (
                  <div key={project.id} className="break-inside-avoid">
                    <ProjectGalleryCard 
                      project={project} 
                      index={idx}
                      onClick={() => handleProjectClick(project)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 mx-auto mb-4" style={{ color: '#A8A8A8' }} />
                <p style={{ color: '#555555', fontFamily: 'Inter' }}>No projects yet. Check back soon!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Career Path Section */}
      {userExperiences.length > 0 && (
        <section className="py-20 md:py-24" style={{ backgroundColor: '#F8F9FA' }}>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div {...anim.fadeIn}>
              <h2 
                className="text-3xl md:text-4xl font-semibold mb-16 text-center"
                style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}
              >
                Career Path
              </h2>
              <div className="max-w-4xl mx-auto space-y-8">
                {userExperiences.map((exp, idx) => (
                  <motion.div 
                    key={exp.id}
                    {...anim.fadeIn}
                    className="relative pl-8 pb-8 border-l-2"
                    style={{ borderColor: idx === 0 ? '#6366F1' : '#EAEAEA' }}
                  >
                    <div 
                      className="absolute left-[-9px] top-0 w-4 h-4 rounded-full"
                      style={{ backgroundColor: idx === 0 ? '#6366F1' : '#A8A8A8' }}
                    />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>
                        {exp.title}
                      </h3>
                      <p className="text-base font-medium" style={{ color: '#555555', fontFamily: 'Inter' }}>
                        {exp.company}
                      </p>
                      <p className="text-sm" style={{ color: '#A8A8A8', fontFamily: 'Inter' }}>
                        {new Date(exp.startDate).getFullYear()} - {!exp.endDate ? 'Present' : new Date(exp.endDate).getFullYear()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Education Section */}
      {userEducations.length > 0 && (
        <section className="py-20 md:py-24" style={{ backgroundColor: 'white' }}>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <motion.div {...anim.fadeIn}>
              <h2 
                className="text-3xl md:text-4xl font-semibold mb-16 text-center"
                style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}
              >
                Education
              </h2>
              <div className="max-w-3xl mx-auto grid gap-6">
                {userEducations.map((edu) => (
                  <Card key={edu.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6" style={{ backgroundColor: '#F8F9FA' }}>
                      <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Playfair Display', color: '#0B0C10' }}>
                        {edu.degree}
                      </h3>
                      <p className="text-base mb-2" style={{ color: '#555555', fontFamily: 'Inter' }}>
                        {edu.institution}
                      </p>
                      <p className="text-sm" style={{ color: '#A8A8A8', fontFamily: 'Inter' }}>
                        {new Date(edu.startDate).getFullYear()} - {!edu.endDate ? 'Present' : new Date(edu.endDate).getFullYear()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Contact Footer */}
      <section className="py-24 md:py-32" style={{ background: 'linear-gradient(135deg, #0B0C10 0%, #1a1a1a 100%)' }}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div {...anim.fadeIn} className="max-w-2xl mx-auto text-center space-y-8">
            <h2 
              className="text-3xl md:text-4xl font-semibold text-white"
              style={{ fontFamily: 'Playfair Display' }}
            >
              Let's create something together
            </h2>
            <p className="text-lg text-white/70" style={{ fontFamily: 'Inter' }}>
              I'm open to collaborations and mentorship opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setIsContactModalOpen(true)}
                variant="outline"
                className="rounded-lg px-8 py-6 font-medium transition-all hover:bg-white/10"
                style={{ 
                  borderColor: 'rgba(255,255,255,0.3)', 
                  color: 'white', 
                  fontFamily: 'Inter', 
                  fontSize: '15px',
                  letterSpacing: '0.01em'
                }}
                data-testid="button-footer-mentor"
              >
                Mentor
              </Button>
              <Button 
                onClick={handleResumeDownload}
                variant="ghost"
                className="rounded-lg px-8 py-6 font-medium transition-opacity hover:opacity-70"
                style={{ 
                  color: 'white', 
                  fontFamily: 'Inter', 
                  fontSize: '15px',
                  letterSpacing: '0.01em'
                }}
                data-testid="button-footer-resume"
              >
                Grab my Resume
              </Button>
              <Button 
                onClick={() => setIsContactModalOpen(true)}
                className="rounded-lg px-8 py-6 font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#6366F1', color: 'white', fontFamily: 'Inter', fontSize: '15px', letterSpacing: '0.01em' }}
                data-testid="button-footer-contact"
              >
                Let's Talk
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Modals */}
      <ProjectModal project={selectedProject} isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} userId={userInfo.id} />
    </div>
  );
}
