import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Camera, Mail, Aperture, Focus, Film, Zap, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  userSkills?: Array<{ id: number; skillName: string; proficiencyLevel?: string | null }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    category?: string | null;
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

  useEffect(() => {
    const timer = setTimeout(() => setApertureOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const triggerShutter = () => {
    setShutterTrigger(true);
    setTimeout(() => setShutterTrigger(false), 200);
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
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    style={{ transformStyle: 'preserve-3d' }}
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
                const proficiency = skill.proficiencyLevel || 'Intermediate';
                const widthMap: Record<string, string> = {
                  'Beginner': '33%',
                  'Intermediate': '66%',
                  'Advanced': '100%',
                };
                const width = widthMap[proficiency] || '50%';

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
                      {skill.skillName}
                    </h3>
                    <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${colors.warmAmber}, ${colors.cameraRed})` }}
                        initial={{ width: 0 }}
                        whileInView={{ width }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.05 }}
                      />
                    </div>
                    <p className="text-sm mt-2 opacity-70">{proficiency}</p>
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
                        {exp.location && (
                          <p className="text-sm opacity-60 mb-3">📍 {exp.location}</p>
                        )}
                        {exp.description && (
                          <p className="opacity-80 leading-relaxed">{exp.description}</p>
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
                    initial={{ opacity: 0, rotateY: 90 }}
                    whileInView={{ opacity: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    whileHover={{ rotateY: 10, rotateX: 10, scale: 1.05 }}
                    className="relative bg-white p-6 pb-16 rounded-sm shadow-2xl cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Polaroid photo area */}
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 mb-4 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Aperture size={64} color={colors.filmGray} opacity={0.3} />
                      </motion.div>
                    </div>
                    {/* Polaroid text */}
                    <div className="text-center" style={{ color: colors.richBlack }}>
                      <h3 className="font-bold text-lg mb-1">{edu.degree}</h3>
                      <p className="text-sm font-medium opacity-70">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-xs opacity-60 mt-1">{edu.fieldOfStudy}</p>
                      )}
                      <p className="text-xs opacity-50 mt-2">
                        {startYear} - {endYear}
                      </p>
                    </div>
                    {/* Flash effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-white pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: [0, 0.8, 0] }}
                      transition={{ duration: 0.3 }}
                    />
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
    </div>
  );
}
