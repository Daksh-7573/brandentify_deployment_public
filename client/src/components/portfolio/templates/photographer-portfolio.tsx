import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Instagram, Award, Star, MessageCircle, Eye } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

// Custom cursor component
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.cursor-hover')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.cursor-hover')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-difference hidden lg:block"
      animate={{
        x: position.x - 20,
        y: position.y - 20,
        scale: isHovering ? 2 : 1,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center">
        {isHovering && <Eye className="w-4 h-4 text-white" />}
      </div>
    </motion.div>
  );
}

// Parallax Hero Component
function ParallaxHero({ projects, name }: { projects: Project[]; name: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const heroImages = projects
    .filter(p => p.thumbnailUrl)
    .slice(0, 5)
    .map(p => ({ url: p.thumbnailUrl!, title: p.title }));
  
  useEffect(() => {
    if (prefersReducedMotion || heroImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length, prefersReducedMotion]);
  
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  
  if (heroImages.length === 0) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-black to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white"
          >
            Portfolio Coming Soon
          </motion.h1>
          <p className="text-xl opacity-80">Upload your stunning work to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
          style={prefersReducedMotion ? {} : { y }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 mix-blend-overlay z-10" />
          <img
            src={heroImages[currentSlide].url}
            alt={heroImages[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {/* Hero Content */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-20 text-center"
        style={prefersReducedMotion ? {} : { opacity }}
      >
        <div className="max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tight leading-none">
              {name.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="inline-block mr-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
            >
              Visual Storyteller & Creative Director
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Navigation Arrows */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-30 group"
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-30 group"
            data-testid="button-hero-next"
          >
            <ChevronRight className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}
      
      {/* Slide Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-12' : 'bg-white/30 w-6 hover:bg-white/50'
              }`}
              data-testid={`indicator-${idx}`}
            />
          ))}
        </div>
      )}
      
      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2 z-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <span className="tracking-widest uppercase text-xs">Scroll to explore</span>
        <ChevronRight className="w-5 h-5 rotate-90" />
      </motion.div>
    </div>
  );
}

// Masonry Grid Item with 3D effects
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
      initial={{ opacity: 0, y: 60 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? {} : { 
        y: -12, 
        scale: 1.02,
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      className="group relative bg-gray-100 rounded-2xl overflow-hidden cursor-hover cursor-pointer break-inside-avoid"
      style={{ height: `${height}px` }}
      data-testid={`grid-item-${project.id}`}
    >
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200" />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <Badge className="mb-3 bg-white/20 backdrop-blur-sm text-white border-white/30 w-fit">
          {project.category || 'Photography'}
        </Badge>
        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-white/80 line-clamp-2">{project.description}</p>
        )}
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
}

// Category Filter with modern design
function CategoryFilter({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: string[]; 
  selected: string; 
  onSelect: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        onClick={() => onSelect('all')}
        className={`px-8 py-3 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
          selected === 'all' 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/50' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        data-testid="filter-all"
      >
        All Work
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-8 py-3 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
            selected === cat 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/50' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid={`filter-${cat.toLowerCase()}`}
        >
          {cat}
        </button>
      ))}
    </div>
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
      <DialogContent className="max-w-7xl h-[90vh] bg-black/95 border-none p-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 group"
          data-testid="button-close-lightbox"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="relative h-full flex items-center justify-center p-8">
          <motion.img
            key={currentMediaIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={currentMedia || undefined}
            alt={project.title}
            className="max-w-full max-h-full object-contain"
          />
          
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                data-testid="button-lightbox-prev"
              >
                <ChevronLeft className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                data-testid="button-lightbox-next"
              >
                <ChevronRight className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8 text-white">
          <h3 className="text-3xl font-bold mb-2">{project.title}</h3>
          {project.description && <p className="text-white/80 mb-4 text-lg">{project.description}</p>}
          {project.category && (
            <Badge className="bg-white/20 text-white border-white/30">{project.category}</Badge>
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
      <DialogContent className="max-w-lg bg-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Let's Create Together
            </h2>
            <p className="text-gray-600">Tell me about your vision</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border-2 focus:border-purple-500"
              data-testid="input-contact-name"
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-2 focus:border-purple-500"
              data-testid="input-contact-email"
            />
            <Textarea
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="border-2 focus:border-purple-500"
              data-testid="textarea-contact-message"
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg"
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
  userServices,
  currentUserId
}: PhotographerPortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const categories = Array.from(new Set(userProjects.map(p => p.category).filter(Boolean))) as string[];
  const filteredProjects = selectedCategory === 'all' 
    ? userProjects 
    : userProjects.filter(p => p.category === selectedCategory);
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate masonry heights
  const getHeight = (index: number) => {
    const heights = [400, 500, 350, 450, 400, 550, 380, 420];
    return heights[index % heights.length];
  };
  
  return (
    <div className="min-h-screen bg-white relative">
      <CustomCursor />
      
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold transition-colors ${scrolled ? 'text-black' : 'text-white'}`}>
            {userInfo.name}
          </h1>
          <Button 
            onClick={() => setIsContactOpen(true)}
            className={`transition-all ${
              scrolled 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'bg-white text-black hover:bg-white/90'
            }`}
            data-testid="button-book-session"
          >
            Book a Session
          </Button>
        </div>
      </motion.nav>
      
      {/* Parallax Hero */}
      <section className="relative">
        <ParallaxHero projects={userProjects} name={userInfo.name} />
      </section>
      
      {/* About Section with Scroll Animation */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {userInfo.title && (
              <p className="text-sm uppercase tracking-[0.3em] text-purple-600 font-semibold mb-6">
                {userInfo.title}
              </p>
            )}
            <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              {userInfo.name}
            </h2>
            {userInfo.aboutMe && (
              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto">
                {userInfo.aboutMe}
              </p>
            )}
            {userInfo.location && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{userInfo.location}</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Services/Pricing Section with Cards */}
      {userServices.length > 0 && (
        <section className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Services & Pricing
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {userServices.slice(0, 3).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden group h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-10 relative">
                      <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                      {service.description && (
                        <p className="text-gray-600 mb-8 leading-relaxed">{service.description}</p>
                      )}
                      {service.priceUsd && (
                        <div className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                          ${service.priceUsd}
                          {service.isHourly && <span className="text-xl text-gray-500">/hr</span>}
                        </div>
                      )}
                      <Button 
                        onClick={() => setIsContactOpen(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6"
                        data-testid={`button-book-${service.id}`}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Masonry Portfolio Grid */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Portfolio
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-600 mb-16 text-lg"
          >
            A collection of moments frozen in time
          </motion.p>
          
          {/* Category Filter */}
          <div className="mb-16">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          
          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-7xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <MasonryGridItem
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                  height={getHeight(idx)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          >
            What Clients Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Bride",
                text: "Absolutely stunning work! Every photo captured the emotion perfectly. Couldn't be happier with our wedding album.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Business Owner",
                text: "Professional, creative, and delivered beyond expectations. Our brand photos are getting amazing engagement!",
                rating: 5
              },
              {
                name: "Emma Davis",
                role: "Model",
                text: "Such an amazing experience! The photos turned out incredible and the whole session was fun and relaxed.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">"{testimonial.text}"</p>
                    <div>
                      <p className="font-bold text-lg">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="py-20 bg-white border-y">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-16 max-w-6xl mx-auto">
            {[
              { icon: Award, text: "Featured in Vogue" },
              { icon: Award, text: "200+ Happy Clients" },
              { icon: Award, text: "Award Winner 2024" },
              { icon: Instagram, text: "50K+ Followers" }
            ].map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <badge.icon className="w-8 h-8" />
                <span className="text-lg font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-40 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Let's bring your vision to life through stunning photography that tells your story
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button 
                onClick={() => setIsContactOpen(true)}
                size="lg"
                className="bg-white text-purple-900 hover:bg-gray-100 px-10 py-7 text-lg font-semibold shadow-2xl"
                data-testid="button-cta-contact"
              >
                <Mail className="w-6 h-6 mr-3" />
                Get in Touch
              </Button>
              {userInfo.email && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-10 py-7 text-lg font-semibold"
                  onClick={() => window.location.href = `mailto:${userInfo.email}`}
                  data-testid="button-cta-email"
                >
                  <Mail className="w-6 h-6 mr-3" />
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 group"
        onClick={() => setIsContactOpen(true)}
        data-testid="button-whatsapp"
      >
        <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
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
