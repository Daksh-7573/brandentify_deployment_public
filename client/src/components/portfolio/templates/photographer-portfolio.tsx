import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Camera, Mail, Aperture, Focus, Film, Zap, Circle, X, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

// Photography color palette
const colors = {
  deepCharcoal: '#1A1A1A',
  richBlack: '#0A0A0A',
  warmAmber: '#FFB84D',
  cameraRed: '#E63946',
  softWhite: '#F5F5F5',
  filmGray: '#2D2D2D'
};

interface PhotographerPortfolioProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    email: string | null;
    photoURL: string | null;
    aboutMe: string | null;
    location: string | null;
    industry?: string | null;
    domain?: string | null;
    lookingFor?: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills?: Array<{ 
    id: number; 
    name: string; 
    level?: string | null; 
    proficiency?: number | null;
  }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    industry?: string | null;
    domain?: string | null;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    keyResponsibilities?: string[] | any;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string | null;
    thumbnailUrl?: string | null;
    category?: string | null;
    industry?: string | null;
    startDate?: string | null;
    projectUrl?: string | null;
    mediaUrls?: string[] | any;
  }>;
  userEducations?: Array<{
    id: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    startDate: string;
    endDate?: string | null;
    skillsAcquired?: string[] | any;
    academicAchievements?: string[] | any;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description: string;
    priceUsd?: number | null;
    priceInr?: number | null;
  }>;
}

// Floating Camera Icon with parallax
function FloatingCamera({ delay = 0, yOffset = 0 }: { delay?: number; yOffset?: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [yOffset, yOffset + 150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);

  return (
    <motion.div
      style={{ y, rotate }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ delay, duration: 2 }}
      className="absolute pointer-events-none"
    >
      <Camera size={40} color={colors.warmAmber} />
    </motion.div>
  );
}

// Aperture Opening Animation
function ApertureOpening({ isOpen }: { isOpen: boolean }) {
  const blades = 8;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-96 h-96">
        {[...Array(blades)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 origin-bottom"
            style={{
              width: '2px',
              height: '50%',
              background: `linear-gradient(to bottom, ${colors.warmAmber}, transparent)`,
              transform: `rotate(${(360 / blades) * i}deg)`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isOpen ? 0 : 1 }}
            transition={{ duration: 1.5, delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
}

// Lens Flare Effect
function LensFlare() {
  return (
    <motion.div
      className="absolute top-20 right-20 pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
      transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
    >
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/40 via-amber-200/20 to-transparent blur-xl" />
        <div className="absolute inset-4 rounded-full bg-gradient-radial from-amber-300/30 to-transparent blur-md" />
      </div>
    </motion.div>
  );
}

// Film Strip Border Component
function FilmStripBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Top perforation */}
      <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-2" style={{ background: colors.filmGray }}>
        {[...Array(20)].map((_, i) => (
          <div key={`top-${i}`} className="w-2 h-2 bg-black rounded-sm my-auto" />
        ))}
      </div>
      {/* Bottom perforation */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-between px-2" style={{ background: colors.filmGray }}>
        {[...Array(20)].map((_, i) => (
          <div key={`bottom-${i}`} className="w-2 h-2 bg-black rounded-sm my-auto" />
        ))}
      </div>
      {/* Content */}
      <div className="py-6">{children}</div>
    </div>
  );
}

// Focus Point Animation
function FocusPoint({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 2 }}
      animate={{ opacity: [0, 1, 0], scale: [2, 1, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-red-500" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-red-500" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-red-500" />
      </div>
    </motion.div>
  );
}

// Shutter Click Effect
function ShutterEffect({ trigger }: { trigger: boolean }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          className="fixed inset-0 bg-black z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </AnimatePresence>
  );
}

// Bokeh Background Effect
function BokehBackground() {
  const bokehCircles = 15;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(bokehCircles)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 150 + 50,
            height: Math.random() * 150 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${colors.warmAmber}40, transparent)`,
            filter: 'blur(40px)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Viewfinder Overlay
function ViewfinderOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: colors.warmAmber }} />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: colors.warmAmber }} />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: colors.warmAmber }} />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: colors.warmAmber }} />
      {/* Center cross */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6">
        <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: colors.warmAmber }} />
        <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: colors.warmAmber }} />
      </div>
      {/* Grid lines */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-white/10" />
      <div className="absolute top-2/3 left-0 w-full h-px bg-white/10" />
      <div className="absolute left-1/3 top-0 h-full w-px bg-white/10" />
      <div className="absolute left-2/3 top-0 h-full w-px bg-white/10" />
    </div>
  );
}

export default function PhotographerPortfolio({
  userInfo,
  userProjects = [],
  userSkills = [],
  userExperiences = [],
  userEducations = [],
  userServices = [],
}: PhotographerPortfolioProps) {
  const [apertureOpen, setApertureOpen] = useState(false);
  const [shutterTrigger, setShutterTrigger] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof userProjects[0] | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setApertureOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Reset lightbox when project modal closes
  useEffect(() => {
    if (!selectedProject) {
      setLightboxImageIndex(null);
    }
  }, [selectedProject]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxImageIndex === null || !selectedProject?.mediaUrls) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const mediaUrls = selectedProject.mediaUrls as string[];
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLightboxImageIndex((prev) => 
          prev === null ? 0 : (prev - 1 + mediaUrls.length) % mediaUrls.length
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLightboxImageIndex((prev) => 
          prev === null ? 0 : (prev + 1) % mediaUrls.length
        );
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImageIndex, selectedProject]);

  const triggerShutter = () => {
    setShutterTrigger(true);
    setTimeout(() => setShutterTrigger(false), 200);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!selectedProject?.mediaUrls || lightboxImageIndex === null) return;
    
    const mediaUrls = selectedProject.mediaUrls as string[];
    if (direction === 'prev') {
      setLightboxImageIndex((prev) => 
        prev === null ? 0 : (prev - 1 + mediaUrls.length) % mediaUrls.length
      );
    } else {
      setLightboxImageIndex((prev) => 
        prev === null ? 0 : (prev + 1) % mediaUrls.length
      );
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.deepCharcoal, color: colors.softWhite }}>
      <ShutterEffect trigger={shutterTrigger} />

      {/* Floating Photography Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingCamera delay={0} yOffset={100} />
        <FloatingCamera delay={0.5} yOffset={300} />
        <FloatingCamera delay={1} yOffset={500} />
        <LensFlare />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ApertureOpening isOpen={apertureOpen} />
        <BokehBackground />
        <FocusPoint x={20} y={30} />
        <FocusPoint x={80} y={70} />

        <motion.div
          className="relative z-10 container mx-auto px-6 py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: apertureOpen ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Photo with viewfinder */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <ViewfinderOverlay />
                {userInfo.photoURL ? (
                  <motion.img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Camera size={120} color={colors.warmAmber} />
                  </div>
                )}
                {/* Photo frame effect */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] pointer-events-none" />
              </div>
              {/* Recording indicator */}
              <motion.div
                className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 px-3 py-2 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Circle size={12} fill={colors.cameraRed} color={colors.cameraRed} />
                <span className="text-xs font-mono text-white">REC</span>
              </motion.div>
            </motion.div>

            {/* Right: Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.h1
                  className="text-6xl md:text-7xl font-bold mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${colors.softWhite}, ${colors.warmAmber})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {userInfo.name}
                </motion.h1>
                <p className="text-2xl font-light mb-2" style={{ color: colors.warmAmber }}>
                  {userInfo.title || 'Photographer'}
                </p>
                {userInfo.tagline && (
                  <p className="text-lg opacity-80 italic mb-3">{userInfo.tagline}</p>
                )}
                
                {/* Industry & Domain */}
                {(userInfo.industry || userInfo.domain) && (
                  <div className="flex items-center gap-3 mb-3 text-base opacity-80">
                    {userInfo.industry && (
                      <span className="px-3 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                        {userInfo.industry}
                      </span>
                    )}
                    {userInfo.domain && (
                      <span className="px-3 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                        {userInfo.domain}
                      </span>
                    )}
                  </div>
                )}

                {/* Location */}
                {userInfo.location && (
                  <p className="text-base opacity-70 mb-3">📍 {userInfo.location}</p>
                )}
              </motion.div>

              {userInfo.uniqueValueProposition && (
                <motion.div
                  className="border-l-4 pl-6 py-2 italic text-lg opacity-90"
                  style={{ borderColor: colors.warmAmber }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                >
                  "{userInfo.uniqueValueProposition}"
                </motion.div>
              )}

              {/* Core Values */}
              {(userInfo.coreValues?.length ?? 0) > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                >
                  {userInfo.coreValues?.map((value, idx) => (
                    <Badge
                      key={idx}
                      className="px-3 py-1 text-sm font-medium border"
                      style={{
                        background: `${colors.filmGray}`,
                        borderColor: colors.warmAmber,
                        color: colors.warmAmber,
                      }}
                    >
                      {value}
                    </Badge>
                  ))}
                </motion.div>
              )}

              {/* I am looking for - Highlighted */}
              {userInfo.lookingFor && (
                <motion.div
                  className="p-4 rounded-lg border-2"
                  style={{ 
                    borderColor: colors.warmAmber,
                    background: `${colors.warmAmber}20`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.7 }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: colors.warmAmber }}>
                    I am looking for:
                  </p>
                  <p className="text-base">{userInfo.lookingFor}</p>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                <Button
                  onClick={() => {
                    triggerShutter();
                    if (userInfo.email) window.location.href = `mailto:${userInfo.email}`;
                  }}
                  className="relative overflow-hidden group px-8 py-6 text-lg font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.warmAmber}, ${colors.cameraRed})`,
                    border: 'none',
                  }}
                  data-testid="button-lets-connect"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 2, opacity: 0.2 }}
                    transition={{ duration: 0.6 }}
                  />
                  <Mail className="inline mr-2" size={20} />
                  Let's Connect
                </Button>

                <Button
                  onClick={() => {
                    triggerShutter();
                    if (userInfo.email) window.location.href = `mailto:${userInfo.email}?subject=Mentorship Inquiry`;
                  }}
                  className="px-8 py-6 text-lg font-semibold border-2 bg-transparent hover:bg-white/10"
                  style={{
                    borderColor: colors.warmAmber,
                    color: colors.warmAmber,
                  }}
                  data-testid="button-mentor"
                >
                  <Focus className="inline mr-2" size={20} />
                  Mentor Me
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section with Viewfinder */}
      {userInfo.aboutMe && (
        <section className="relative py-24" style={{ background: colors.richBlack }}>
          <BokehBackground />
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -top-8 -left-8">
                <Aperture size={64} color={colors.warmAmber} opacity={0.3} />
              </div>
              <h2 className="text-5xl font-bold mb-8" style={{ color: colors.warmAmber }}>
                My Story
              </h2>
              <div className="relative p-8 rounded-xl" style={{ background: colors.filmGray }}>
                <ViewfinderOverlay />
                <p className="text-lg leading-relaxed opacity-90 relative z-10">
                  {userInfo.aboutMe}
                </p>
              </div>

              {/* Vision and Mission Statements side by side */}
              {(userInfo.visionStatement || userInfo.missionStatement) && (
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {userInfo.visionStatement && (
                    <motion.div
                      className="p-6 rounded-xl border-2"
                      style={{ 
                        borderColor: colors.warmAmber,
                        background: colors.filmGray,
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className="text-xl font-bold mb-3" style={{ color: colors.warmAmber }}>
                        Vision Statement
                      </h3>
                      <p className="text-base leading-relaxed opacity-90">
                        {userInfo.visionStatement}
                      </p>
                    </motion.div>
                  )}

                  {userInfo.missionStatement && (
                    <motion.div
                      className="p-6 rounded-xl border-2"
                      style={{ 
                        borderColor: colors.warmAmber,
                        background: colors.filmGray,
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <h3 className="text-xl font-bold mb-3" style={{ color: colors.warmAmber }}>
                        Mission Statement
                      </h3>
                      <p className="text-base leading-relaxed opacity-90">
                        {userInfo.missionStatement}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {userServices.length > 0 && (
        <section className="py-24 relative">
          <BokehBackground />
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.h2
              className="text-5xl font-bold mb-16 text-center"
              style={{ color: colors.warmAmber }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Film className="inline mr-4" size={48} />
              Photography Services
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  className="relative p-8 rounded-xl overflow-hidden cursor-pointer group"
                  style={{
                    background: colors.filmGray,
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                >
                  {/* Lens zoom effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl"
                    style={{ background: colors.warmAmber }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 3, opacity: 0.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: colors.warmAmber }}>
                      {service.title}
                    </h3>
                    <p className="opacity-80 mb-4 leading-relaxed">{service.description}</p>
                    {(service.priceUsd || service.priceInr) && (
                      <div className="pt-4 border-t border-white/20">
                        {service.priceUsd && (
                          <p className="text-xl font-bold" style={{ color: colors.warmAmber }}>
                            ${service.priceUsd}
                          </p>
                        )}
                        {service.priceInr && (
                          <p className="text-sm opacity-70">₹{service.priceInr}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Gallery */}
      {userProjects.length > 0 && (
        <section className="py-24 relative" style={{ background: colors.richBlack }}>
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.h2
              className="text-5xl font-bold mb-16 text-center"
              style={{ color: colors.warmAmber }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Portfolio Gallery
            </motion.h2>
            <FilmStripBorder>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      rotateZ: 2,
                      zIndex: 10,
                    }}
                    onClick={() => setSelectedProject(project)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    style={{ transformStyle: 'preserve-3d' }}
                    data-testid={`card-project-${project.id}`}
                  >
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Camera size={60} color={colors.warmAmber} opacity={0.5} />
                      </div>
                    )}
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Caption reveal */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}
                    >
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-sm opacity-80">{project.description}</p>
                      {project.category && (
                        <Badge className="mt-2" style={{ background: colors.warmAmber, color: colors.richBlack }}>
                          {project.category}
                        </Badge>
                      )}
                    </motion.div>
                    {/* Focus frame effect */}
                    <div className="absolute inset-4 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ borderColor: colors.cameraRed }} />
                  </motion.div>
                ))}
              </div>
            </FilmStripBorder>
          </div>
        </section>
      )}

      {/* Skills/Equipment Section */}
      {userSkills.length > 0 && (
        <section className="py-24 relative">
          <BokehBackground />
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.h2
              className="text-5xl font-bold mb-16 text-center"
              style={{ color: colors.warmAmber }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Equipment & Skills
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.map((skill, idx) => {
                const level = skill.level || 'Intermediate';
                const proficiency = skill.proficiency || 50;
                const widthMap: Record<string, string> = {
                  'Beginner': '33%',
                  'Intermediate': '66%',
                  'Advanced': '100%',
                };
                const width = widthMap[level] || `${proficiency}%`;

                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative p-6 rounded-lg"
                    style={{ background: colors.filmGray }}
                  >
                    <motion.div
                      className="absolute top-2 right-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Aperture size={24} color={colors.warmAmber} opacity={0.3} />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: colors.warmAmber }}>
                      {skill.name}
                    </h3>
                    <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${colors.warmAmber}, ${colors.cameraRed})`, width }}
                        initial={{ width: 0 }}
                        whileInView={{ width }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.05 }}
                      />
                    </div>
                    <p className="text-sm mt-2 opacity-70">{level} {proficiency > 0 && `(${proficiency}%)`}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline (Film Strip Style) */}
      {userExperiences.length > 0 && (
        <section className="py-24 relative" style={{ background: colors.richBlack }}>
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.h2
              className="text-5xl font-bold mb-16 text-center"
              style={{ color: colors.warmAmber }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Photography Journey
            </motion.h2>
            <FilmStripBorder>
              <div className="space-y-8">
                {userExperiences.map((exp, idx) => {
                  const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
                  const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present';
                  const isLeft = idx % 2 === 0;

                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-8`}
                    >
                      {/* Camera milestone marker */}
                      <div className="relative">
                        <motion.div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: colors.warmAmber }}
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Camera size={28} color={colors.richBlack} />
                        </motion.div>
                      </div>
                      {/* Content card with photo frame */}
                      <motion.div
                        className="flex-1 p-6 rounded-lg border-4"
                        style={{
                          background: colors.filmGray,
                          borderColor: colors.warmAmber,
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <h3 className="text-2xl font-bold mb-2" style={{ color: colors.warmAmber }}>
                          {exp.title}
                        </h3>
                        <p className="text-lg font-semibold opacity-90">{exp.company}</p>
                        <p className="text-sm opacity-70 mb-3">
                          {startYear} - {endYear}
                        </p>
                        
                        {/* Industry & Domain */}
                        {(exp.industry || exp.domain) && (
                          <div className="flex items-center gap-2 mb-3">
                            {exp.industry && (
                              <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                                {exp.industry}
                              </span>
                            )}
                            {exp.domain && (
                              <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                                {exp.domain}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {exp.location && (
                          <p className="text-sm opacity-60 mb-3">📍 {exp.location}</p>
                        )}
                        {exp.description && (
                          <p className="opacity-80 leading-relaxed mb-3">{exp.description}</p>
                        )}
                        
                        {/* Key Responsibilities */}
                        {exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold mb-2" style={{ color: colors.warmAmber }}>Key Responsibilities:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                              {exp.keyResponsibilities.map((resp: string, respIdx: number) => (
                                <li key={respIdx}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </FilmStripBorder>
          </div>
        </section>
      )}

      {/* Education (Polaroid Style) */}
      {userEducations.length > 0 && (
        <section className="py-24 relative">
          <BokehBackground />
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <motion.h2
              className="text-5xl font-bold mb-16 text-center"
              style={{ color: colors.warmAmber }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Zap className="inline mr-4" size={48} />
              Training & Certifications
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userEducations.map((edu, idx) => {
                const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : '';
                const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';

                return (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative p-6 rounded-lg border-2"
                    style={{ 
                      background: colors.filmGray,
                      borderColor: colors.warmAmber,
                    }}
                  >
                    {/* Icon area */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${colors.warmAmber}20` }}>
                        <Aperture size={40} color={colors.warmAmber} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-xl mb-2" style={{ color: colors.warmAmber }}>{edu.degree}</h3>
                      <p className="text-base font-medium opacity-90">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm opacity-70 mt-1">{edu.fieldOfStudy}</p>
                      )}
                      <p className="text-sm opacity-60 mt-2">
                        {startYear} - {endYear}
                      </p>
                    </div>

                    {/* Industry, Domain, Location */}
                    {(edu.industry || edu.domain || edu.location) && (
                      <div className="flex flex-wrap justify-center gap-2 mb-3">
                        {edu.industry && (
                          <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                            {edu.industry}
                          </span>
                        )}
                        {edu.domain && (
                          <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                            {edu.domain}
                          </span>
                        )}
                        {edu.location && (
                          <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: colors.warmAmber, color: colors.warmAmber }}>
                            📍 {edu.location}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills Acquired */}
                    {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm font-semibold mb-2" style={{ color: colors.warmAmber }}>Skills Acquired:</p>
                        <div className="flex flex-wrap gap-1">
                          {edu.skillsAcquired.map((skill: string, skillIdx: number) => (
                            <span key={skillIdx} className="text-xs px-2 py-1 rounded-full" style={{ background: `${colors.warmAmber}30`, color: colors.softWhite }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Academic Achievements */}
                    {edu.academicAchievements && Array.isArray(edu.academicAchievements) && edu.academicAchievements.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm font-semibold mb-2" style={{ color: colors.warmAmber }}>Academic Achievements:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                          {edu.academicAchievements.map((achievement: string, achIdx: number) => (
                            <li key={achIdx}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Footer with Lens Closing Effect */}
      <section className="relative py-32 overflow-hidden" style={{ background: colors.richBlack }}>
        <BokehBackground />
        {/* Lens closing aperture effect */}
        <ApertureOpening isOpen={false} />
        <motion.div
          className="container mx-auto px-6 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl font-bold mb-6" style={{ color: colors.warmAmber }}>
            Let's Create Magic Together
          </h2>
          <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">
            Ready to capture your moments? Let's discuss your vision and bring it to life through the lens.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Button
              onClick={() => {
                triggerShutter();
                if (userInfo.email) window.location.href = `mailto:${userInfo.email}`;
              }}
              className="px-12 py-8 text-xl font-bold rounded-full relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${colors.warmAmber}, ${colors.cameraRed})`,
                border: 'none',
              }}
              data-testid="button-cta-connect"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    `radial-gradient(circle at 0% 0%, ${colors.warmAmber}, transparent)`,
                    `radial-gradient(circle at 100% 100%, ${colors.cameraRed}, transparent)`,
                    `radial-gradient(circle at 0% 0%, ${colors.warmAmber}, transparent)`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Mail size={24} />
                Get In Touch
              </span>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Portfolio Detail Modal with Photography Theme */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none">
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.6
                }}
                className="relative rounded-2xl overflow-hidden"
                style={{ background: colors.richBlack }}
              >
                {/* Aperture Opening Animation */}
                <motion.div
                  className="absolute inset-0 z-50 pointer-events-none"
                  initial={{ 
                    clipPath: "circle(0% at 50% 50%)",
                    opacity: 1 
                  }}
                  animate={{ 
                    clipPath: "circle(100% at 50% 50%)",
                    opacity: [1, 0.8, 0]
                  }}
                  transition={{ 
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                  style={{ background: colors.warmAmber }}
                />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-50 p-3 rounded-full transition-all hover:scale-110"
                  style={{ background: colors.filmGray }}
                  data-testid="button-close-project-modal"
                >
                  <X size={24} color={colors.warmAmber} />
                </button>

                {/* Content */}
                <div className="relative z-10 p-8">
                  {/* Main Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="relative w-full h-96 mb-8 rounded-xl overflow-hidden group"
                  >
                    {selectedProject.thumbnailUrl ? (
                      <img
                        src={selectedProject.thumbnailUrl}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Camera size={120} color={colors.warmAmber} opacity={0.3} />
                      </div>
                    )}
                    {/* Focus Frame Effect */}
                    <motion.div
                      className="absolute inset-8 border-4 pointer-events-none"
                      style={{ borderColor: colors.cameraRed }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Project Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <h2 className="text-4xl font-bold mb-4" style={{ color: colors.warmAmber }}>
                      {selectedProject.title}
                    </h2>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {selectedProject.category && (
                        <Badge className="px-4 py-2 text-base" style={{ background: colors.warmAmber, color: colors.richBlack }}>
                          {selectedProject.category}
                        </Badge>
                      )}
                      {selectedProject.industry && (
                        <Badge className="px-4 py-2 text-base" style={{ background: colors.filmGray, color: colors.softWhite }}>
                          {selectedProject.industry}
                        </Badge>
                      )}
                      {selectedProject.startDate && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: colors.filmGray }}>
                          <Calendar size={16} color={colors.warmAmber} />
                          <span className="text-sm" style={{ color: colors.softWhite }}>
                            {new Date(selectedProject.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {selectedProject.description && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="mb-8 p-6 rounded-xl"
                        style={{ background: colors.filmGray }}
                      >
                        <h3 className="text-xl font-bold mb-3" style={{ color: colors.warmAmber }}>Project Description</h3>
                        <p className="text-lg leading-relaxed opacity-90" style={{ color: colors.softWhite }}>
                          {selectedProject.description}
                        </p>
                      </motion.div>
                    )}

                    {/* Project URL */}
                    {selectedProject.projectUrl && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mb-8"
                      >
                        <a
                          href={selectedProject.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
                          style={{ background: `linear-gradient(135deg, ${colors.warmAmber}, ${colors.cameraRed})`, color: colors.richBlack }}
                          data-testid="link-project-url"
                        >
                          <ExternalLink size={20} />
                          View Live Project
                        </a>
                      </motion.div>
                    )}

                    {/* Media Gallery */}
                    {selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls) && selectedProject.mediaUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mb-8"
                      >
                        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.warmAmber }}>
                          <Film className="inline mr-3" size={28} />
                          Project Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {selectedProject.mediaUrls.map((url: string, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.0 + idx * 0.1, duration: 0.4 }}
                              whileHover={{ scale: 1.05 }}
                              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                              onClick={() => setLightboxImageIndex(idx)}
                              data-testid={`gallery-image-${idx}`}
                            >
                              <img
                                src={url}
                                alt={`${selectedProject.title} - ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              {/* Lens Flare Effect on Hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 pointer-events-none"
                                style={{ mixBlendMode: 'overlay' }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Film Strip Border */}
                <div className="absolute top-0 left-0 right-0 h-8 flex gap-2 px-4 py-2" style={{ background: colors.filmGray }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-4 h-full rounded-sm" style={{ background: colors.warmAmber, opacity: 0.3 }} />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 flex gap-2 px-4 py-2" style={{ background: colors.filmGray }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-4 h-full rounded-sm" style={{ background: colors.warmAmber, opacity: 0.3 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog 
        open={lightboxImageIndex !== null} 
        onOpenChange={(open) => !open && setLightboxImageIndex(null)}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent overflow-hidden">
          <AnimatePresence mode="wait">
            {lightboxImageIndex !== null && selectedProject?.mediaUrls && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full flex items-center justify-center"
                style={{ background: 'rgba(0, 0, 0, 0.95)' }}
              >
                {/* Aperture Iris Effect */}
                <motion.div
                  className="absolute inset-0 z-10 pointer-events-none"
                  initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 1 }}
                  animate={{ clipPath: 'circle(100% at 50% 50%)', opacity: [1, 0.8, 0] }}
                  transition={{ duration: 0.5, times: [0, 0.7, 1] }}
                  style={{ background: colors.richBlack }}
                />

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLightboxImageIndex(null)}
                  className="absolute top-4 right-4 z-30 rounded-full"
                  style={{ 
                    background: colors.filmGray, 
                    color: colors.warmAmber 
                  }}
                  data-testid="lightbox-close"
                >
                  <X size={24} />
                </Button>

                {/* Navigation Buttons */}
                {(selectedProject.mediaUrls as string[]).length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateLightbox('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-12 h-12"
                      style={{ 
                        background: colors.filmGray, 
                        color: colors.warmAmber 
                      }}
                      data-testid="lightbox-prev"
                    >
                      <ChevronLeft size={32} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateLightbox('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full w-12 h-12"
                      style={{ 
                        background: colors.filmGray, 
                        color: colors.warmAmber 
                      }}
                      data-testid="lightbox-next"
                    >
                      <ChevronRight size={32} />
                    </Button>
                  </>
                )}

                {/* Main Image */}
                <motion.div
                  key={lightboxImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="relative max-w-full max-h-[90vh] z-20"
                >
                  {/* Focus Frame Effect */}
                  <motion.div
                    className="absolute -inset-4 border-4 pointer-events-none z-10"
                    style={{ borderColor: colors.cameraRed }}
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <img
                    src={(selectedProject.mediaUrls as string[])[lightboxImageIndex]}
                    alt={`${selectedProject.title} - Image ${lightboxImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    style={{ boxShadow: `0 0 50px ${colors.warmAmber}40` }}
                  />

                  {/* Image Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full"
                    style={{ 
                      background: colors.filmGray,
                      color: colors.warmAmber,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {lightboxImageIndex + 1} / {(selectedProject.mediaUrls as string[]).length}
                  </motion.div>
                </motion.div>

                {/* Camera Viewfinder Corners */}
                <div className="absolute inset-8 pointer-events-none z-20">
                  <motion.div 
                    className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2"
                    style={{ borderColor: colors.warmAmber }}
                    initial={{ opacity: 0, x: -20, y: -20 }}
                    animate={{ opacity: 0.6, x: 0, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                  <motion.div 
                    className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2"
                    style={{ borderColor: colors.warmAmber }}
                    initial={{ opacity: 0, x: 20, y: -20 }}
                    animate={{ opacity: 0.6, x: 0, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2"
                    style={{ borderColor: colors.warmAmber }}
                    initial={{ opacity: 0, x: -20, y: 20 }}
                    animate={{ opacity: 0.6, x: 0, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                  <motion.div 
                    className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2"
                    style={{ borderColor: colors.warmAmber }}
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 0.6, x: 0, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
