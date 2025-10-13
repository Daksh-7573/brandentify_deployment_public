import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Instagram, Award, Star, MessageCircle } from "lucide-react";
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
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations: Education[];
  userServices: Service[];
  currentUserId?: number;
}

// Hero Carousel Component
function HeroCarousel({ projects }: { projects: Project[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  
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
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-5xl font-bold mb-4">Portfolio Coming Soon</h1>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentSlide].url}
            alt={heroImages[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Arrows */}
      {heroImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            data-testid="button-hero-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            data-testid="button-hero-next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Slide Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/40'
              }`}
              data-testid={`indicator-${idx}`}
            />
          ))}
        </div>
      )}
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60 text-sm flex flex-col items-center gap-2 animate-bounce">
        <span>Scroll to explore</span>
        <ChevronRight className="w-5 h-5 rotate-90" />
      </div>
    </div>
  );
}

// Category Filter Component
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
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={() => onSelect('all')}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          selected === 'all' 
            ? 'bg-black text-white' 
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
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            selected === cat 
              ? 'bg-black text-white' 
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

// Instagram-Style Grid Item
function GridItem({ 
  project, 
  onClick 
}: { 
  project: Project; 
  onClick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
      data-testid={`grid-item-${project.id}`}
    >
      {project.thumbnailUrl ? (
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          {project.category && (
            <p className="text-sm text-white/80">{project.category}</p>
          )}
        </div>
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
  
  // Reset media index when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMediaIndex(0);
    }
  }, [isOpen, project?.id]);
  
  // Keyboard navigation
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
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
          data-testid="button-close-lightbox"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="relative h-full flex items-center justify-center p-8">
          <img
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
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
          {project.description && <p className="text-white/80 mb-4">{project.description}</p>}
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
      <DialogContent className="max-w-md bg-white">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Let's Create Together</h2>
            <p className="text-gray-600">Tell me about your vision</p>
          </div>
          
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
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              data-testid="textarea-contact-message"
            />
            <Button 
              type="submit" 
              className="w-full bg-black hover:bg-gray-800"
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
  
  const categories = Array.from(new Set(userProjects.map(p => p.category).filter(Boolean))) as string[];
  const filteredProjects = selectedCategory === 'all' 
    ? userProjects 
    : userProjects.filter(p => p.category === selectedCategory);
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsLightboxOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Fullscreen Hero Carousel */}
      <section className="relative">
        <HeroCarousel projects={userProjects} />
        
        {/* Floating Nav */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="container mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">{userInfo.name}</h1>
            <Button 
              onClick={() => setIsContactOpen(true)}
              className="bg-white text-black hover:bg-white/90"
              data-testid="button-book-session"
            >
              Book a Session
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {userInfo.title && (
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
                {userInfo.title}
              </p>
            )}
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{userInfo.name}</h2>
            {userInfo.aboutMe && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {userInfo.aboutMe}
              </p>
            )}
            {userInfo.location && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <MapPin className="w-5 h-5" />
                <span>{userInfo.location}</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Services/Pricing Section */}
      {userServices.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Services & Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {userServices.slice(0, 3).map((service) => (
                <Card key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-600 mb-6">{service.description}</p>
                    )}
                    {service.priceUsd && (
                      <div className="text-3xl font-bold mb-4">
                        ${service.priceUsd}
                        {service.isHourly && <span className="text-lg text-gray-500">/hr</span>}
                      </div>
                    )}
                    <Button 
                      onClick={() => setIsContactOpen(true)}
                      className="w-full bg-black hover:bg-gray-800"
                      data-testid={`button-book-${service.id}`}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Portfolio Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Portfolio</h2>
          
          {/* Category Filter */}
          <div className="mb-12">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          
          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <GridItem
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
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
              <Card key={idx} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-12 max-w-5xl mx-auto opacity-60">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">Featured in Vogue</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">200+ Happy Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">Award Winner 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="w-6 h-6" />
              <span className="text-sm font-medium">50K+ Followers</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Let's bring your vision to life through stunning photography
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => setIsContactOpen(true)}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8"
              data-testid="button-cta-contact"
            >
              <Mail className="w-5 h-5 mr-2" />
              Get in Touch
            </Button>
            {userInfo.email && (
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8"
                asChild
              >
                <a href={`mailto:${userInfo.email}`} data-testid="link-email">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Email Me
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/1234567890`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50"
        data-testid="button-whatsapp"
      >
        <Phone className="w-6 h-6" />
      </a>
      
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
