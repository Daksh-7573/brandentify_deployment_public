import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, Leaf, TreePine, Flower2, Sparkles,
  Award, GraduationCap, Briefcase, Globe, Heart,
  ExternalLink, Calendar, Users, Mountain, Bird,
  Phone, Linkedin, Github, Twitter, Instagram, Facebook
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Skill, Project, WorkExperience, Education, Service } from "@shared/schema";

interface NatureCreativeProps {
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

// Enhanced Multi-Layer Parallax Background
function EnhancedParallaxBackground() {
  const { scrollY } = useScroll();
  
  const skyY = useTransform(scrollY, [0, 2000], [0, -50]);
  const cloudY = useTransform(scrollY, [0, 2000], [0, -200]);
  const cloudY2 = useTransform(scrollY, [0, 2000], [0, -150]);
  const mountainY = useTransform(scrollY, [0, 2000], [0, 300]);
  const treeY = useTransform(scrollY, [0, 2000], [0, 150]);
  const birdY = useTransform(scrollY, [0, 2000], [0, -100]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Layer 1: Animated Sky Gradient */}
      <motion.div 
        style={{ y: skyY }}
        className="absolute inset-0 bg-gradient-to-b from-[#E8F4F8] via-[#F5E6FA] to-[#FFE8D9]"
      >
        {/* Subtle sun glow */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl" />
      </motion.div>
      
      {/* Layer 2: Distant Clouds */}
      <motion.div style={{ y: cloudY }} className="absolute inset-0">
        <div className="absolute top-10 left-[10%] w-48 h-20 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute top-24 right-[15%] w-56 h-24 bg-white/35 rounded-full blur-2xl" />
        <div className="absolute top-40 left-[60%] w-40 h-16 bg-white/30 rounded-full blur-xl" />
      </motion.div>

      {/* Layer 2.5: Mid Clouds */}
      <motion.div style={{ y: cloudY2 }} className="absolute inset-0">
        <div className="absolute top-32 left-[30%] w-64 h-28 bg-white/45 rounded-full blur-2xl" />
        <div className="absolute top-16 right-[40%] w-52 h-22 bg-white/40 rounded-full blur-xl" />
      </motion.div>

      {/* Layer 3: Flying Birds */}
      <motion.div style={{ y: birdY }} className="absolute inset-0">
        <motion.div
          className="absolute top-[15%] left-[20%]"
          animate={{
            x: [0, 100, 200],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Bird className="text-gray-400/30" size={20} />
        </motion.div>
        <motion.div
          className="absolute top-[25%] right-[30%]"
          animate={{
            x: [0, -80, -160],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        >
          <Bird className="text-gray-400/25" size={16} />
        </motion.div>
      </motion.div>
      
      {/* Layer 4: Distant Mountains */}
      <motion.div 
        style={{ y: mountainY }}
        className="absolute bottom-0 left-0 right-0 h-[500px]"
      >
        <svg viewBox="0 0 1440 500" className="w-full h-full" preserveAspectRatio="none">
          {/* Far mountains */}
          <path 
            d="M0,500 L0,300 L240,180 L480,260 L720,140 L960,220 L1200,180 L1440,280 L1440,500 Z" 
            fill="url(#farMountain)" 
            opacity="0.2"
          />
          {/* Mid mountains */}
          <path 
            d="M0,500 L0,350 L360,220 L600,300 L840,200 L1080,280 L1440,260 L1440,500 Z" 
            fill="url(#midMountain)" 
            opacity="0.25"
          />
          <defs>
            <linearGradient id="farMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B8C9E0" />
              <stop offset="100%" stopColor="#D4E0E8" />
            </linearGradient>
            <linearGradient id="midMountain" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A7C7E7" />
              <stop offset="100%" stopColor="#C4D9D0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Layer 5: Forest Trees Silhouette */}
      <motion.div 
        style={{ y: treeY }}
        className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
      >
        <div className="absolute bottom-0 left-[10%] flex items-end gap-4">
          <TreePine className="text-emerald-600" size={120} />
          <TreePine className="text-emerald-700" size={100} />
          <TreePine className="text-emerald-600" size={110} />
        </div>
        <div className="absolute bottom-0 right-[15%] flex items-end gap-3">
          <TreePine className="text-teal-600" size={95} />
          <TreePine className="text-teal-700" size={115} />
          <TreePine className="text-emerald-600" size={105} />
        </div>
        <div className="absolute bottom-0 left-[45%] flex items-end gap-2">
          <TreePine className="text-emerald-700" size={90} />
          <TreePine className="text-teal-600" size={108} />
        </div>
      </motion.div>
    </div>
  );
}

// Floating Nature Elements
function FloatingNatureElements() {
  const elements = [
    // Leaves
    { id: 'leaf1', type: 'leaf', x: 5, y: -10, size: 36, duration: 16, delay: 0, rotate: 45 },
    { id: 'leaf2', type: 'leaf', x: 25, y: 15, size: 32, duration: 18, delay: 2, rotate: 120 },
    { id: 'leaf3', type: 'leaf', x: 75, y: 5, size: 40, duration: 20, delay: 4, rotate: 90 },
    { id: 'leaf4', type: 'leaf', x: 90, y: 35, size: 34, duration: 17, delay: 6, rotate: 180 },
    { id: 'leaf5', type: 'leaf', x: 12, y: 55, size: 38, duration: 19, delay: 3, rotate: 270 },
    { id: 'leaf6', type: 'leaf', x: 55, y: 75, size: 33, duration: 16, delay: 5, rotate: 30 },
    // Floating Flowers
    { id: 'butterfly1', type: 'flower', x: 15, y: 20, size: 28, duration: 14, delay: 1, rotate: 0 },
    { id: 'butterfly2', type: 'flower', x: 70, y: 45, size: 24, duration: 16, delay: 4, rotate: 180 },
    { id: 'butterfly3', type: 'flower', x: 40, y: 65, size: 26, duration: 15, delay: 7, rotate: 90 },
    // Flowers
    { id: 'flower1', type: 'flower', x: 35, y: 10, size: 30, duration: 20, delay: 2, rotate: 0 },
    { id: 'flower2', type: 'flower', x: 80, y: 60, size: 28, duration: 18, delay: 5, rotate: 45 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {elements.map((el) => {
        const Icon = el.type === 'leaf' ? Leaf : Flower2;
        const color = el.type === 'leaf' 
          ? 'text-emerald-300/40' 
          : 'text-rose-300/45';

        return (
          <motion.div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            initial={{ opacity: 0, y: -100 }}
            animate={{
              y: [0, 250, 500],
              x: [0, -30, 30, 0],
              rotate: [el.rotate, el.rotate + 360, el.rotate + 720],
              opacity: [0, 0.6, 0.4, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "linear",
              delay: el.delay,
            }}
          >
            <Icon className={color} size={el.size} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Sparkle Particles - Memoized positions for stable rendering
function SparkleParticles() {
  const sparkles = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 12 + Math.random() * 12,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
          }}
        >
          <Sparkles className="text-yellow-300/40" size={sparkle.size} />
        </motion.div>
      ))}
    </div>
  );
}

// Typewriter Effect Hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setIsComplete(true);
      return;
    }
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

export default function NatureCreative({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
  currentUserId,
}: NatureCreativeProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Memoize hero particles positions for stable rendering
  const heroParticles = useMemo(() => 
    [...Array(6)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 2 + Math.random(),
    }))
  , []);

  // Memoize footer sparkles for stable rendering
  const footerSparkles = useMemo(() =>
    [...Array(10)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 16 + Math.random() * 16,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
  , []);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F5F0FF] via-[#FFF5F0] to-[#F0FFF5] overflow-hidden">
      {/* Background Layers */}
      <EnhancedParallaxBackground />
      <FloatingNatureElements />
      <SparkleParticles />

      {/* Main Content Container */}
      <div className="relative z-20">
        
        {/* Hero Section */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="min-h-screen flex items-center justify-center px-6 relative"
        >
          <div className="max-w-5xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center relative"
            >
              {/* Profile Photo with Nature Frame */}
              <motion.div 
                className="relative inline-block mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-xl opacity-60"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl">
                  {userInfo.photoURL ? (
                    <img 
                      src={userInfo.photoURL} 
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
                      <span className="text-5xl text-white font-bold">
                        {userInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Floating particles around photo */}
                {heroParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute"
                    style={{
                      top: `${particle.top}%`,
                      left: `${particle.left}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      x: [-5, 5, -5],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Infinity,
                      delay: particle.id * 0.3,
                    }}
                  >
                    <Sparkles className="text-emerald-300" size={12} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Name with Gradient Animation */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {userInfo.name}
              </motion.h1>

              {/* Title */}
              {userInfo.title && (
                <motion.p 
                  className="text-2xl md:text-3xl text-gray-600 mb-3 font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {userInfo.title}
                </motion.p>
              )}

              {/* Tagline/Personal Motto */}
              {userInfo.tagline && (
                <motion.p 
                  className="text-lg md:text-xl text-emerald-600 mb-6 italic font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  "{userInfo.tagline}"
                </motion.p>
              )}

              {/* Location */}
              {userInfo.location && (
                <motion.div
                  className="flex items-center justify-center gap-2 text-gray-500 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <MapPin className="text-rose-400" size={20} />
                  <span>{userInfo.location}</span>
                </motion.div>
              )}

              {/* Looking For (Highlighted) */}
              {userInfo.lookingFor && (
                <motion.div
                  className="mb-8 inline-block px-6 py-3 bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300 rounded-full shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-rose-700 font-semibold text-center">
                    🌟 Looking for: {userInfo.lookingFor}
                  </p>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                  onClick={() => userInfo.email && (window.location.href = `mailto:${userInfo.email}`)}
                  data-testid="button-lets-connect"
                >
                  <Mail className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
                  Let's Connect
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-rose-300 to-pink-300 hover:from-rose-400 hover:to-pink-400 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  data-testid="button-mentor-me"
                >
                  <Heart className="mr-2 group-hover:scale-125 transition-transform" size={20} />
                  Mentor Me
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-emerald-400 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* About Section */}
        {userInfo.aboutMe && (
          <section className="py-20 px-6 relative">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Organic blob background */}
                <div className="absolute -inset-8 bg-gradient-to-br from-white/60 to-emerald-50/60 rounded-[3rem] blur-xl" />
                
                <div className="relative bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-emerald-100/50 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <Leaf className="text-emerald-600" size={28} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">About Me</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
                    {userInfo.aboutMe}
                  </p>
                  
                  {/* Industry & Domain */}
                  {(userInfo.industry || userInfo.domain) && (
                    <div className="mb-6 flex flex-wrap gap-3">
                      {userInfo.industry && (
                        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                          <span className="text-sm text-emerald-700 font-medium">
                            Industry: {userInfo.industry}
                          </span>
                        </div>
                      )}
                      {userInfo.domain && (
                        <div className="px-4 py-2 bg-teal-50 border border-teal-200 rounded-full">
                          <span className="text-sm text-teal-700 font-medium">
                            Domain: {userInfo.domain}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Core Values */}
                  {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="text-emerald-500" size={20} />
                        Core Values
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.coreValues.map((value, idx) => (
                          <Badge key={idx} className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 px-3 py-1">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unique Value Proposition */}
                  {userInfo.uniqueValueProposition && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-l-4 border-rose-400 rounded-lg">
                      <h3 className="text-sm font-semibold text-rose-700 mb-1">What Sets Me Apart</h3>
                      <p className="text-gray-700">{userInfo.uniqueValueProposition}</p>
                    </div>
                  )}
                  
                  {/* Contact Info */}
                  <div className="mt-6 flex flex-wrap gap-4">
                    {userInfo.email && (
                      <motion.a
                        href={`mailto:${userInfo.email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        data-testid="link-email"
                      >
                        <Mail size={16} />
                        <span className="text-sm">{userInfo.email}</span>
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Vision & Mission Statements - Side by Side */}
            {(userInfo.visionStatement || userInfo.missionStatement) && (
              <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-6">
                {/* Vision Statement */}
                {userInfo.visionStatement && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    <div className="relative bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-cyan-100 shadow-lg">
                      <h3 className="text-xl font-bold text-cyan-700 mb-3 flex items-center gap-2">
                        <Mountain className="text-cyan-500" size={24} />
                        Vision Statement
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{userInfo.visionStatement}</p>
                    </div>
                  </motion.div>
                )}

                {/* Mission Statement */}
                {userInfo.missionStatement && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    <div className="relative bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-lg">
                      <h3 className="text-xl font-bold text-emerald-700 mb-3 flex items-center gap-2">
                        <TreePine className="text-emerald-500" size={24} />
                        Mission Statement
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{userInfo.missionStatement}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Skills Section - Floating Leaves Layout */}
        {userSkills.length > 0 && (
          <section className="py-20 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3"
              >
                <Award className="text-emerald-500" size={36} />
                Skills & Expertise
              </motion.h2>

              <div className="flex flex-wrap gap-4 justify-center">
                {userSkills.map((skill, idx) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      y: -5,
                    }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 200 
                    }}
                    className="group relative"
                    data-testid={`skill-${skill.id}`}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    
                    <div className="relative px-6 py-3 bg-white/70 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl shadow-md flex items-center gap-2">
                      <Leaf className="text-emerald-500 group-hover:rotate-12 transition-transform" size={18} />
                      <span className="text-gray-700 font-medium">{skill.name}</span>
                      {skill.proficiency && (
                        <Badge className="ml-2 bg-teal-100 text-teal-700 text-xs">
                          {skill.proficiency}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section - Growing Vine Timeline */}
        {userExperiences.length > 0 && (
          <section className="py-20 px-6 relative">
            <div className="max-w-5xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16 flex items-center justify-center gap-3"
              >
                <Briefcase className="text-emerald-500" size={36} />
                Experience Journey
              </motion.h2>

              <div className="relative">
                {/* Vine timeline */}
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute left-8 top-0 w-1 bg-gradient-to-b from-emerald-300 via-teal-300 to-cyan-300 rounded-full"
                />

                <div className="space-y-12">
                  {userExperiences.map((exp, idx) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 }}
                      className="relative pl-20"
                      data-testid={`experience-${exp.id}`}
                    >
                      {/* Flower node on timeline */}
                      <motion.div
                        className="absolute left-4 top-6 w-9 h-9 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 180 }}
                        transition={{ type: "spring" }}
                      >
                        <Flower2 className="text-rose-600" size={20} />
                      </motion.div>

                      {/* Card */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-lg hover:shadow-xl transition-all"
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{exp.title}</h3>
                        <p className="text-emerald-600 font-medium mb-2">{exp.company}</p>
                        
                        {/* Location, Industry, Domain */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {exp.location && (
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <MapPin size={14} className="text-rose-400" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                          {exp.industry && (
                            <Badge className="bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
                              {exp.industry}
                            </Badge>
                          )}
                          {exp.domain && (
                            <Badge className="bg-teal-50 text-teal-700 text-xs border border-teal-200">
                              {exp.domain}
                            </Badge>
                          )}
                        </div>

                        {exp.startDate && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <Calendar size={14} />
                            <span>
                              {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              {exp.endDate && ` - ${new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            </span>
                          </div>
                        )}
                        {exp.description && (
                          <p className="text-gray-600 leading-relaxed mb-3">{exp.description}</p>
                        )}
                        
                        {/* Key Responsibilities */}
                        {exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-emerald-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Responsibilities:</h4>
                            <ul className="space-y-1">
                              {exp.keyResponsibilities.map((resp: string, idx: number) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-1">•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {userEducations.length > 0 && (
          <section className="py-20 px-6 relative">
            <div className="max-w-5xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3"
              >
                <GraduationCap className="text-emerald-500" size={36} />
                Education
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6">
                {userEducations.map((edu, idx) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group"
                    data-testid={`education-${edu.id}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-emerald-100 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{edu.degree}</h3>
                      <p className="text-emerald-600 font-medium mb-2">{edu.institution}</p>
                      {edu.startDate && (
                        <p className="text-gray-500 text-sm">
                          {new Date(edu.startDate).getFullYear()}
                          {edu.endDate && ` - ${new Date(edu.endDate).getFullYear()}`}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section - Masonry Grid with Nature Borders */}
        {userProjects.length > 0 && (
          <section className="py-20 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3"
              >
                <Mountain className="text-emerald-500" size={36} />
                Featured Projects
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedProject(project)}
                    className="group relative cursor-pointer"
                    data-testid={`project-card-${project.id}`}
                  >
                    {/* Nature-themed border glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    
                    <div className="relative bg-white/60 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-lg hover:shadow-2xl transition-all">
                      {project.thumbnailUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {project.description}
                        </p>
                        {project.category && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {project.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {userServices.length > 0 && (
          <section className="py-20 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12 flex items-center justify-center gap-3"
              >
                <Globe className="text-emerald-500" size={36} />
                Services I Offer
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userServices.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, rotateZ: 2 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative"
                    data-testid={`service-${service.id}`}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                    <div className="relative p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-emerald-200 shadow-lg text-center">
                      <motion.div
                        className="inline-block p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full mb-4"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Award className="text-emerald-300" size={32} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact/CTA Section - Immersive Nature Scene */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <Leaf className="absolute top-10 left-10 text-emerald-600" size={60} />
            <Flower2 className="absolute top-20 right-20 text-rose-500" size={50} />
            <Flower2 className="absolute bottom-20 left-1/4 text-pink-500" size={45} />
            <TreePine className="absolute bottom-10 right-10 text-emerald-700" size={80} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                Let's Create Something Beautiful Together
              </h2>
              <p className="text-xl mb-10 text-gray-600">
                Ready to collaborate? I'm just a message away.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  onClick={() => userInfo.email && (window.location.href = `mailto:${userInfo.email}`)}
                  data-testid="button-lets-connect-footer"
                >
                  <Mail className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
                  Let's Connect
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                  data-testid="button-mentor-me-footer"
                >
                  <Heart className="mr-2 group-hover:scale-125 transition-transform" size={20} />
                  Mentor Me
                </Button>
              </div>

              {userInfo.email && (
                <motion.p
                  className="flex items-center justify-center gap-2 text-lg text-gray-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <Mail size={20} className="text-emerald-600" />
                  {userInfo.email}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Floating particles in footer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {footerSparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute"
                style={{
                  left: `${sparkle.left}%`,
                  top: `${sparkle.top}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: sparkle.duration,
                  repeat: Infinity,
                  delay: sparkle.delay,
                }}
              >
                <Sparkles className="text-emerald-400/60" size={sparkle.size} />
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedProject.thumbnailUrl && (
                <img
                  src={selectedProject.thumbnailUrl}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-t-3xl"
                />
              )}
              <div className="p-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedProject.title}</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{selectedProject.description}</p>
                {selectedProject.category && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Category</h4>
                    <Badge className="bg-emerald-50 text-emerald-700">
                      {selectedProject.category}
                    </Badge>
                  </div>
                )}
                {selectedProject.projectUrl && (
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => window.open(selectedProject.projectUrl!, '_blank')}
                  >
                    <ExternalLink className="mr-2" size={20} />
                    View Project
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
