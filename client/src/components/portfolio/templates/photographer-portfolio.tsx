import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, Mail, MapPin, MessageCircle, Camera } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Skill, Project, WorkExperience, Education, Service } from "@shared/schema";

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
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

// Skill Bar Component
function SkillBar({ skill, level }: { skill: string; level: string }) {
  const levelWidth = {
    'Advanced': '90%',
    'Intermediate': '65%',
    'Beginner': '40%'
  }[level] || '50%';

  return (
    <div className="mb-4" data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex justify-between mb-2">
        <span className="text-white font-medium">{skill}</span>
        <span className="text-stone-200 text-sm">{level}</span>
      </div>
      <div className="w-full bg-black/30 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: levelWidth }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-amber-600 h-1.5 rounded-full"
        />
      </div>
    </div>
  );
}

// Career Timeline Component
function CareerTimeline({ experiences }: { experiences: WorkExperience[] }) {
  return (
    <div className="space-y-6">
      {experiences.map((exp, idx) => {
        const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
        const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present';
        const responsibilities = (exp.keyResponsibilities as string[]) || [];
        
        return (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/60 p-6 rounded-lg border-l-4 border-amber-600"
            data-testid={`experience-${idx}`}
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-stone-800 text-xl">{exp.title}</h4>
                <p className="text-stone-700 font-medium">{exp.company}</p>
                <p className="text-amber-700 font-semibold text-sm mt-1">
                  {startYear} - {endYear}
                </p>
              </div>

              {/* Industry, Domain, Location */}
              {(exp.industry || exp.domain || exp.location) && (
                <div className="flex flex-wrap gap-2">
                  {exp.industry && (
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                      {exp.industry}
                    </Badge>
                  )}
                  {exp.domain && (
                    <Badge className="bg-stone-200 text-stone-700 border-0 text-xs">
                      {exp.domain}
                    </Badge>
                  )}
                  {exp.location && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exp.location}
                    </Badge>
                  )}
                </div>
              )}

              {exp.description && (
                <p className="text-sm text-stone-600 leading-relaxed">{exp.description}</p>
              )}

              {/* Key Responsibilities */}
              {responsibilities.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-sm font-semibold text-stone-700 mb-2">Key Responsibilities:</h5>
                  <ul className="space-y-1">
                    {responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-sm text-stone-600 flex items-start gap-2">
                        <span className="text-amber-600 mt-1">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Masonry Grid Item
function MasonryGridItem({ 
  project, 
  onClick,
  height 
}: { 
  project: Project; 
  onClick: () => void;
  height: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);
  
  return (
    <motion.div
      ref={setRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? {} : { 
        y: -6,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      className="group relative bg-stone-200 rounded-3xl overflow-hidden cursor-pointer break-inside-avoid mb-6"
      style={{ height: `${height}px` }}
      data-testid={`grid-item-${project.id}`}
    >
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-amber-200 via-stone-300 to-amber-100" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="text-xl font-bold text-white">{project.title}</h3>
        {project.category && (
          <p className="text-sm text-stone-200 mt-1">{project.category}</p>
        )}
      </div>
    </motion.div>
  );
}

// Lightbox Modal
function LightboxModal({ 
  project, 
  isOpen, 
  onClose 
}: { 
  project: Project | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0);
    }
  }, [isOpen, project?.id]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevMedia();
      } else if (e.key === 'ArrowRight') {
        nextMedia();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  if (!project) return null;
  
  const mediaUrls = (project.mediaUrls as string[]) || [];
  const mediaItems = mediaUrls.length > 0 ? mediaUrls : [project.thumbnailUrl].filter(Boolean);
  const currentMedia = mediaItems[currentMediaIndex] || project.thumbnailUrl;
  
  const nextMedia = () => setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
  const prevMedia = () => setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] bg-stone-900/95 border-none p-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
          data-testid="button-close-lightbox"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative h-full flex items-center justify-center p-8">
          <motion.img
            key={currentMediaIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={currentMedia || undefined}
            alt={project.title}
            className="max-w-full max-h-full object-contain"
          />
          
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
                data-testid="button-lightbox-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
                data-testid="button-lightbox-next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
          {project.description && <p className="text-stone-300 mb-3">{project.description}</p>}
          {project.category && (
            <Badge className="bg-amber-700 text-white border-0">{project.category}</Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Contact Modal
function ContactModal({ 
  isOpen, 
  onClose, 
  userId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userId?: number;
}) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest('POST', `/api/contact/${userId}`, formData);
      toast({ title: "Message sent!", description: "I'll get back to you soon." });
      setFormData({ name: '', email: '', message: '' });
      onClose();
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-stone-50">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2 text-stone-800">
              Let's Create Together
            </h2>
            <p className="text-stone-600">Tell me about your vision</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border-2 border-stone-300 focus:border-amber-600"
              data-testid="input-contact-name"
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-2 border-stone-300 focus:border-amber-600"
              data-testid="input-contact-email"
            />
            <Textarea
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="border-2 border-stone-300 focus:border-amber-600"
              data-testid="textarea-contact-message"
            />
            <Button 
              type="submit" 
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-6 text-lg"
              disabled={isSubmitting}
              data-testid="button-send-message"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function PhotographerPortfolio({
  userInfo,
  userProjects,
  userSkills,
  userExperiences,
  userEducations,
  userServices,
  currentUserId
}: PhotographerPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
  };

  // Calculate masonry heights
  const getHeight = (index: number) => {
    const heights = [420, 520, 380, 480, 400, 550, 360, 440];
    return heights[index % heights.length];
  };

  return (
    <div className="min-h-screen bg-[#8B7355]">
      {/* Hero Section - Side by Side */}
      <section className="min-h-screen bg-[#8B7355] relative overflow-hidden">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 lg:pr-12"
            >
              {/* Name & Title */}
              <div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 leading-tight">
                  {userInfo.name}
                </h1>
                <p className="text-2xl text-stone-100 font-light">
                  {userInfo.title || 'Professional'}
                </p>
              </div>

              {/* Looking For */}
              {userInfo.lookingFor && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
                    Looking For
                  </h3>
                  <p className="text-white leading-relaxed">
                    {userInfo.lookingFor}
                  </p>
                </div>
              )}

              {/* Location */}
              {userInfo.location && (
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{userInfo.location}</span>
                </div>
              )}
              
              {/* Industry & Domain */}
              {(userInfo.industry || userInfo.domain) && (
                <div className="flex flex-wrap gap-3">
                  {userInfo.industry && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-4 py-1.5">
                      {userInfo.industry}
                    </Badge>
                  )}
                  {userInfo.domain && (
                    <Badge className="bg-white/20 text-white border-white/40 px-4 py-1.5">
                      {userInfo.domain}
                    </Badge>
                  )}
                </div>
              )}

              {/* Core Values */}
              {(userInfo.coreValues?.length ?? 0) > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
                    Core Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.coreValues?.map((value, idx) => (
                      <Badge key={idx} variant="outline" className="border-white text-white px-3 py-1">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* What I Offer - Services */}
              {userServices.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    What I Offer
                  </h3>
                  <div className="space-y-3">
                    {userServices.map((service) => {
                      const features = (service.features as string[]) || [];
                      return (
                        <Card key={service.id} className="bg-white/80 border-amber-200 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-base font-semibold text-stone-800 mb-1">
                                  {service.title}
                                </h4>
                                {service.category && service.category !== 'other' && (
                                  <Badge variant="outline" className="text-xs mb-2">
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                              {(service.priceInr || service.priceUsd) && (
                                <div className="text-right ml-4">
                                  {service.priceInr && (
                                    <p className="text-amber-700 font-bold">
                                      ₹{service.priceInr}{service.isHourly ? '/hr' : ''}
                                    </p>
                                  )}
                                  {service.priceUsd && (
                                    <p className="text-stone-600 text-sm">
                                      ${service.priceUsd}{service.isHourly ? '/hr' : ''}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {service.description && (
                              <p className="text-stone-700 text-sm leading-relaxed mb-3">
                                {service.description}
                              </p>
                            )}
                            {features.length > 0 && (
                              <ul className="space-y-1">
                                {features.map((feature, idx) => (
                                  <li key={idx} className="text-stone-600 text-sm flex items-start gap-2">
                                    <span className="text-amber-600 mt-0.5">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Profile Picture as Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {userInfo.photoURL ? (
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-amber-200 to-stone-300 flex items-center justify-center shadow-2xl">
                  <Camera className="w-24 h-24 text-stone-500" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Me & Skills Section */}
      {(userInfo.aboutMe || userSkills.length > 0) && (
        <section className="py-20 bg-[#3E2723]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto space-y-16">
              {/* About Me - Full Width */}
              {userInfo.aboutMe && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h2 className="text-4xl font-serif font-bold text-stone-100 mb-6">
                    About Me
                  </h2>
                  <p className="text-lg text-stone-300 leading-relaxed max-w-4xl mx-auto">
                    {userInfo.aboutMe}
                  </p>
                </motion.div>
              )}

              {/* What I'm Good At - Skills */}
              {userSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h2 className="text-4xl font-serif font-bold text-stone-100 mb-8 text-center">
                    What I'm Good At
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {userSkills.map((skill) => (
                      <SkillBar
                        key={skill.id}
                        skill={skill.name}
                        level={skill.level || 'Intermediate'}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* What Makes Me Unique with Mission & Vision */}
      {(userInfo.uniqueValueProposition || userInfo.visionStatement || userInfo.missionStatement) && (
        <section className="py-20 bg-[#8B7355]">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-serif font-bold text-white">
                What Makes Me Unique
              </h2>
              
              {userInfo.uniqueValueProposition && (
                <p className="text-lg text-stone-100 leading-relaxed">
                  {userInfo.uniqueValueProposition}
                </p>
              )}

              {(userInfo.visionStatement || userInfo.missionStatement) && (
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  {userInfo.visionStatement && (
                    <Card className="bg-white/90 border-amber-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-amber-800 mb-3">Vision</h3>
                        <p className="text-stone-700 leading-relaxed">
                          {userInfo.visionStatement}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {userInfo.missionStatement && (
                    <Card className="bg-white/90 border-stone-300">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-stone-800 mb-3">Mission</h3>
                        <p className="text-stone-700 leading-relaxed">
                          {userInfo.missionStatement}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Portfolio Section */}
      <section className="py-20 bg-[#3E2723]">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-serif font-bold text-stone-100 mb-16"
          >
            Portfolio
          </motion.h2>

          {/* Masonry Grid - Images from First Project */}
          {(() => {
            // Get the first project or first project with media
            const featuredProject = userProjects.find(p => {
              const mediaUrls = (p.mediaUrls as string[]) || [];
              return mediaUrls.length > 0 || p.thumbnailUrl;
            }) || userProjects[0];

            if (!featuredProject) return null;

            const mediaUrls = (featuredProject.mediaUrls as string[]) || [];
            const allImages = (mediaUrls.length > 0 
              ? mediaUrls 
              : [featuredProject.thumbnailUrl]).filter(Boolean) as string[];

            return (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto">
                {allImages.map((imageUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -6 }}
                    onClick={() => handleProjectClick(featuredProject)}
                    className="group relative bg-stone-200 rounded-3xl overflow-hidden cursor-pointer break-inside-avoid mb-6"
                    style={{ height: `${getHeight(idx)}px` }}
                    data-testid={`portfolio-image-${idx}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${featuredProject.title} - Image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Project Details on First Image */}
                    {idx === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-900 via-stone-900/90 to-transparent">
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-white">
                            {featuredProject.title}
                          </h3>
                          {featuredProject.category && (
                            <p className="text-sm text-amber-300 font-medium">
                              {featuredProject.category}
                            </p>
                          )}
                          {featuredProject.description && (
                            <p className="text-stone-200 text-sm line-clamp-2">
                              {featuredProject.description}
                            </p>
                          )}
                          <Button
                            className="bg-amber-600 hover:bg-amber-700 text-white mt-3"
                            size="sm"
                            data-testid="button-know-more"
                          >
                            Know More
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover Overlay for Other Images */}
                    {idx !== 0 && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <h3 className="text-xl font-bold text-white">{featuredProject.title}</h3>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Career Path & Education */}
      <section className="py-20 bg-[#D4B896]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Career Path */}
            {userExperiences.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-serif font-bold text-stone-800 mb-8">
                  Career Path
                </h2>
                <CareerTimeline experiences={userExperiences} />
              </motion.div>
            )}

            {/* Education */}
            {userEducations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-4xl font-serif font-bold text-stone-800 mb-8">
                  Education
                </h2>
                <div className="space-y-6">
                  {userEducations.map((edu, idx) => {
                    const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : '';
                    const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';
                    const skillsAcquired = (edu.skillsAcquired as string[]) || [];
                    
                    return (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        data-testid={`education-${idx}`}
                      >
                        <div className="bg-white/60 p-6 rounded-lg border-l-4 border-amber-600">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-stone-800 text-xl mb-1">
                                {edu.degree}
                              </h4>
                              <p className="text-stone-700 font-medium">
                                {edu.institution}
                              </p>
                              <p className="text-amber-700 text-sm font-semibold mt-1">
                                {startYear} - {endYear}
                              </p>
                            </div>

                            {/* Industry, Domain, Location */}
                            {(edu.industry || edu.domain || edu.location) && (
                              <div className="flex flex-wrap gap-2">
                                {edu.industry && (
                                  <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                                    {edu.industry}
                                  </Badge>
                                )}
                                {edu.domain && (
                                  <Badge className="bg-white/80 text-stone-700 border-0 text-xs">
                                    {edu.domain}
                                  </Badge>
                                )}
                                {edu.location && (
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {edu.location}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {edu.fieldOfStudy && (
                              <p className="text-stone-600 text-sm italic">
                                Field: {edu.fieldOfStudy}
                              </p>
                            )}

                            {/* Skills Acquired */}
                            {skillsAcquired.length > 0 && (
                              <div className="pt-2">
                                <h5 className="text-sm font-semibold text-stone-700 mb-2">Skills Acquired:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {skillsAcquired.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-[#3E2723] text-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-stone-100 mb-6">
              Let's Work Together
            </h2>
            <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto">
              Ready to capture your story? Get in touch and let's create something beautiful.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => setIsContactOpen(true)}
                size="lg"
                className="bg-amber-700 hover:bg-amber-800 text-white px-10 py-6 text-lg"
                data-testid="button-cta-contact"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get in Touch
              </Button>
              {userInfo.email && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-stone-300 text-stone-100 hover:bg-stone-700 px-10 py-6 text-lg"
                  onClick={() => window.location.href = `mailto:${userInfo.email}`}
                  data-testid="button-cta-email"
                >
                  {userInfo.email}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
        onClick={() => setIsContactOpen(true)}
        data-testid="button-whatsapp"
      >
        <MessageCircle className="w-8 h-8" />
      </motion.button>

      {/* Modals */}
      <LightboxModal
        project={selectedProject}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        userId={userInfo.id}
      />
    </div>
  );
}
