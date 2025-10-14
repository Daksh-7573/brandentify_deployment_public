import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, MapPin, Leaf, TreePine, Flower2, Sparkles,
  Award, GraduationCap, Briefcase, Globe, Heart,
  ExternalLink, Calendar, Users, Mountain
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

// Floating Leaves Animation Component
function FloatingLeaves() {
  const leaves = [
    { id: 1, x: 10, y: -10, size: 40, duration: 15, delay: 0, rotate: 45 },
    { id: 2, x: 30, y: 20, size: 35, duration: 18, delay: 2, rotate: 120 },
    { id: 3, x: 70, y: 10, size: 45, duration: 20, delay: 4, rotate: 90 },
    { id: 4, x: 85, y: 40, size: 38, duration: 16, delay: 6, rotate: 180 },
    { id: 5, x: 15, y: 60, size: 42, duration: 19, delay: 3, rotate: 270 },
    { id: 6, x: 50, y: 80, size: 36, duration: 17, delay: 5, rotate: 30 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
          }}
          initial={{ opacity: 0, y: -100 }}
          animate={{
            y: [0, 200, 400],
            x: [0, -50, 50, 0],
            rotate: [leaf.rotate, leaf.rotate + 360, leaf.rotate + 720],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            ease: "linear",
            delay: leaf.delay,
          }}
        >
          <Leaf className="text-emerald-300/40" size={leaf.size} />
        </motion.div>
      ))}
    </div>
  );
}

// Parallax Background Layers Component
function ParallaxBackground() {
  const { scrollY } = useScroll();
  
  const mountainY = useTransform(scrollY, [0, 1000], [0, 150]);
  const cloudY = useTransform(scrollY, [0, 1000], [0, -100]);
  const treeY = useTransform(scrollY, [0, 1000], [0, 80]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Soft Pastel Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E3F2FD] via-[#F0E6FA] to-[#FFE5D9]" />
      
      {/* Soft Clouds Layer */}
      <motion.div 
        style={{ y: cloudY }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-10 w-32 h-16 bg-white/50 rounded-full blur-xl" />
        <div className="absolute top-32 right-20 w-40 h-20 bg-white/40 rounded-full blur-xl" />
        <div className="absolute top-10 right-40 w-28 h-14 bg-white/35 rounded-full blur-lg" />
      </motion.div>
      
      {/* Soft Mountains Layer */}
      <motion.div 
        style={{ y: mountainY }}
        className="absolute bottom-0 left-0 right-0 h-96"
      >
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,400 L0,200 L200,100 L400,180 L600,80 L800,160 L1000,120 L1200,200 L1200,400 Z" 
                fill="url(#mountainGradient)" opacity="0.25"/>
          <path d="M0,400 L0,250 L300,150 L500,220 L700,140 L900,200 L1200,180 L1200,400 Z" 
                fill="url(#mountainGradient2)" opacity="0.2"/>
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A7C7E7" />
              <stop offset="100%" stopColor="#B8D4C8" />
            </linearGradient>
            <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C4D9D0" />
              <stop offset="100%" stopColor="#D4E7D7" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      
      {/* Soft Trees Layer */}
      <motion.div 
        style={{ y: treeY }}
        className="absolute bottom-0 left-0 right-0 flex justify-around items-end h-64 opacity-15"
      >
        <TreePine className="text-emerald-300" size={80} />
        <TreePine className="text-teal-300" size={100} />
        <TreePine className="text-emerald-300" size={90} />
        <TreePine className="text-teal-300" size={70} />
        <TreePine className="text-emerald-300" size={95} />
      </motion.div>
    </div>
  );
}

// Animated Branch Divider
function BranchDivider() {
  return (
    <div className="w-full flex justify-center my-12">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-64 h-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <Flower2 className="absolute -top-3 left-1/2 -translate-x-1/2 text-rose-300" size={24} />
      </motion.div>
    </div>
  );
}

export default function NatureCreative({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations,
  userServices,
  currentUserId
}: NatureCreativeProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F0FF] via-[#FFF5F0] to-[#F0FFF5] relative overflow-x-hidden">
      {/* Parallax Background */}
      <ParallaxBackground />
      
      {/* Floating Leaves */}
      <FloatingLeaves />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: headerOpacity }}
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-5xl mx-auto text-center z-10">
          {/* Animated Profile Photo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative inline-block mb-8"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-full blur-lg opacity-60 animate-pulse" />
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {userInfo.photoURL ? (
                <img src={userInfo.photoURL} alt={userInfo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-teal-300 flex items-center justify-center text-gray-700 text-4xl font-bold">
                  {userInfo.name.charAt(0)}
                </div>
              )}
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Leaf className="text-emerald-300" size={32} />
            </motion.div>
          </motion.div>

          {/* Name and Title */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent"
          >
            {userInfo.name}
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl text-gray-600 mb-6 font-light"
          >
            {userInfo.title || userInfo.tagline || "Creative Freelancer"}
          </motion.p>

          {userInfo.location && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-gray-500 mb-8"
            >
              <MapPin size={20} />
              <span>{userInfo.location}</span>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-300 to-teal-300 hover:from-emerald-400 hover:to-teal-400 text-gray-700 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => userInfo.email && (window.location.href = `mailto:${userInfo.email}`)}
            >
              <Mail className="mr-2" size={20} />
              Let's Connect
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-300 text-gray-600 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Heart className="mr-2" size={20} />
              Mentor Me
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-emerald-300 rounded-full p-1">
            <motion.div
              className="w-1.5 h-1.5 bg-emerald-300 rounded-full mx-auto"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* About Me Section */}
      <section className="relative py-20 px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-600 flex items-center justify-center gap-3">
              <Sparkles className="text-emerald-300" />
              About Me
              <Sparkles className="text-emerald-300" />
            </h2>
            
            {userInfo.aboutMe && (
              <p className="text-lg text-gray-700 leading-relaxed text-center mb-6">
                {userInfo.aboutMe}
              </p>
            )}

            {userInfo.uniqueValueProposition && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-emerald-200">
                <h3 className="text-xl font-semibold text-gray-600 mb-3">What Makes Me Unique</h3>
                <p className="text-gray-700">{userInfo.uniqueValueProposition}</p>
              </div>
            )}

            {userInfo.whatIOffer && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-3xl border border-emerald-200">
                <h3 className="text-xl font-semibold text-gray-600 mb-3">What I Offer</h3>
                <p className="text-gray-700">{userInfo.whatIOffer}</p>
              </div>
            )}

            {userInfo.coreValues && userInfo.coreValues.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {userInfo.coreValues.map((value, idx) => (
                  <Badge key={idx} variant="secondary" className="px-4 py-2 text-sm bg-emerald-50 text-gray-600 border border-green-300">
                    {value}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <BranchDivider />

      {/* Skills Section */}
      {userSkills.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-600"
            >
              Skills & Expertise
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative p-6 bg-white rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="p-2 bg-emerald-50 rounded-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Leaf className="text-emerald-300" size={24} />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
                    </div>
                    {skill.level && (
                      <div className="mt-3">
                        <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level === 'Expert' ? 100 : skill.level === 'Advanced' ? 80 : skill.level === 'Intermediate' ? 60 : 40}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-300 to-teal-300"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{skill.level}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BranchDivider />

      {/* Projects Section */}
      {userProjects.length > 0 && (
        <section className="relative py-20 px-6 bg-white/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-600"
            >
              Featured Projects
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="group relative cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-3xl opacity-0 group-hover:opacity-75 blur-lg transition duration-500" />
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-100">
                    {project.thumbnailUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={project.thumbnailUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                        {project.title}
                        <ExternalLink className="text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                      </h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      {project.category && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-emerald-50 text-gray-600">
                            {project.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BranchDivider />

      {/* Experience Section */}
      {userExperiences.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-600"
            >
              Professional Journey
            </motion.h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200" />
              
              {userExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 10 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative pl-20 pb-12 group"
                >
                  {/* Timeline Dot */}
                  <motion.div
                    className="absolute left-5 top-0 w-8 h-8 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                    whileHover={{ scale: 1.3, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Briefcase className="text-white" size={16} />
                  </motion.div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-200 group-hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800">{exp.title}</h3>
                    <p className="text-gray-500 font-semibold mb-2">{exp.company}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {exp.startDate} - {exp.endDate || "Present"}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600">{exp.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BranchDivider />

      {/* Education Section */}
      {userEducations.length > 0 && (
        <section className="relative py-20 px-6 bg-white/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-600"
            >
              Education & Growth
            </motion.h2>
            
            <div className="grid grid-cols-1 gap-6">
              {userEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative bg-white p-6 rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="p-3 bg-emerald-50 rounded-xl"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <GraduationCap className="text-emerald-300" size={28} />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{edu.degree}</h3>
                        <p className="text-gray-500 font-semibold">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-gray-600 mb-2">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {edu.startDate} - {edu.endDate || "Present"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BranchDivider />

      {/* Services Section */}
      {userServices.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-600"
            >
              Services I Offer
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, rotateZ: 2 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative p-6 bg-white rounded-2xl border border-emerald-200 shadow-lg text-center">
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

      {/* Contact/CTA Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200">
        <div className="max-w-4xl mx-auto text-center text-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-700">Let's Create Something Amazing</h2>
            <p className="text-xl mb-10 text-gray-600">
              Ready to bring your ideas to life? Let's connect and make it happen.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-white text-gray-600 hover:bg-gray-50 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => userInfo.email && (window.location.href = `mailto:${userInfo.email}`)}
              >
                <Mail className="mr-2" size={20} />
                Let's Connect
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-400 text-gray-600 hover:bg-white/50 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Heart className="mr-2" size={20} />
                Mentor Me
              </Button>
            </div>

            {userInfo.email && (
              <motion.p
                className="flex items-center justify-center gap-2 text-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Mail size={20} />
                {userInfo.email}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Floating particles in footer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Sparkles className="text-gray-400/50" size={16 + Math.random() * 16} />
            </motion.div>
          ))}
        </div>
      </section>

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
                <p className="text-gray-600 mb-6">{selectedProject.description}</p>
                {selectedProject.category && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Category</h4>
                    <Badge className="bg-emerald-50 text-gray-600">
                      {selectedProject.category}
                    </Badge>
                  </div>
                )}
                {selectedProject.projectUrl && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(selectedProject.projectUrl!, '_blank')}
                  >
                    <ExternalLink className="mr-2" size={18} />
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
