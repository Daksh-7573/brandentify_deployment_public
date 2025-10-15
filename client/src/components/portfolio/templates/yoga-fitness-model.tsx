import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { 
  MapPin, Calendar, Building, GraduationCap, Briefcase, Award, 
  ExternalLink, Heart, Star, Sparkles, Flower2, Circle, Mail, Users
} from "lucide-react";

interface YogaFitnessModelProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    company: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
    phoneNumber?: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
  currentUserId?: number;
}

// Floating Chakra Symbol
function ChakraSymbol({ color, delay = 0, top, left }: { color: string; delay?: number; top: string; left: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5],
        scale: [1, 1.15, 1],
        rotate: [0, 360]
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`absolute ${top} ${left} w-24 h-24`}
      style={{ filter: "drop-shadow(0 0 20px currentColor)" }}
    >
      <div className={`w-full h-full rounded-full border-4 ${color} opacity-60`}>
        <div className="absolute inset-4 rounded-full border-2 border-current" />
        <div className="absolute inset-8 rounded-full border border-current" />
      </div>
    </motion.div>
  );
}

// Lotus Petal Animation
function LotusDecoration({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [0.9, 1.1, 0.9],
        rotate: [0, 10, 0]
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Flower2 className="w-full h-full" strokeWidth={1.5} />
    </motion.div>
  );
}

// Traditional Yoga Parallax Background
function YogaParallaxBackground() {
  const { scrollY } = useScroll();
  
  // Three dramatic parallax layers
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -500]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -1000]);
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -1500]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: 7-Chakra rainbow gradient background - slowest */}
      <motion.div 
        style={{ 
          y: layer1Y,
          background: "linear-gradient(to bottom, #6B21A8 0%, #4C1D95 14%, #3730A3 28%, #0891B2 42%, #059669 56%, #CA8A04 70%, #EA580C 84%, #DC2626 100%)"
        }}
        className="absolute inset-0"
      />
      
      {/* Layer 2: Chakra symbols and orbs - medium speed */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {/* Chakra gradient orbs */}
        <div className="absolute top-20 right-[15%] w-[500px] h-[500px] bg-purple-500/40 rounded-full blur-3xl" />
        <div className="absolute top-[30%] left-[10%] w-[600px] h-[600px] bg-cyan-400/35 rounded-full blur-3xl" />
        <div className="absolute top-[50%] right-[20%] w-[550px] h-[550px] bg-green-400/40 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-[15%] w-[580px] h-[580px] bg-orange-500/38 rounded-full blur-3xl" />
        
        {/* Chakra Symbols - 7 chakras */}
        <ChakraSymbol color="border-purple-400" top="top-32" left="left-[12%]" delay={0} />
        <ChakraSymbol color="border-indigo-400" top="top-[25%]" left="right-[18%]" delay={0.5} />
        <ChakraSymbol color="border-cyan-400" top="top-[45%]" left="left-[15%]" delay={1} />
        <ChakraSymbol color="border-green-400" top="top-[60%]" left="right-[12%]" delay={1.5} />
        <ChakraSymbol color="border-yellow-400" top="bottom-[35%]" left="left-[20%]" delay={2} />
        <ChakraSymbol color="border-orange-400" top="bottom-[20%]" left="right-[15%]" delay={2.5} />
        <ChakraSymbol color="border-red-400" top="bottom-[10%]" left="left-[18%]" delay={3} />
        
        {/* Lotus flowers */}
        <div className="absolute top-[35%] right-[25%] w-32 h-32 text-pink-300/50">
          <LotusDecoration delay={0} />
        </div>
        <div className="absolute bottom-[40%] left-[22%] w-28 h-28 text-purple-300/50">
          <LotusDecoration delay={1} />
        </div>
      </motion.div>

      {/* Layer 3: Floating spiritual elements - fastest */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        {/* Floating stars/sparkles */}
        <motion.div
          animate={{ y: [-20, 20, -20], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[20%] left-[8%]"
        >
          <Star className="w-8 h-8 text-yellow-300/60 fill-yellow-300/40" />
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-[65%] right-[10%]"
        >
          <Sparkles className="w-10 h-10 text-cyan-300/60" />
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-[25%] left-[12%]"
        >
          <Heart className="w-9 h-9 text-pink-300/60 fill-pink-300/40" />
        </motion.div>
        
        {/* Energy flow lines */}
        <div className="absolute top-[30%] right-[8%] w-1 h-56 bg-gradient-to-b from-purple-400/50 via-pink-400/50 to-transparent" />
        <div className="absolute bottom-[25%] left-[10%] w-1 h-48 bg-gradient-to-t from-orange-400/50 via-yellow-400/50 to-transparent" />
        
        {/* Mandala circles */}
        <div className="absolute top-[40%] left-[5%] w-20 h-20">
          <div className="w-full h-full rounded-full border-2 border-cyan-400/40 animate-spin" style={{ animationDuration: "20s" }}>
            <div className="absolute inset-3 rounded-full border border-cyan-400/30" />
          </div>
        </div>
      </motion.div>

      {/* Subtle energy texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
    </div>
  );
}

// Project Modal
function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = (project.mediaUrls as string[]) || [];
  const allImages = [
    ...(project.thumbnailUrl ? [project.thumbnailUrl] : []),
    ...mediaUrls
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900/95 via-pink-800/95 to-orange-700/95 text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-white">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <motion.img
                  key={idx}
                  src={url}
                  alt={`${project.title} - ${idx + 1}`}
                  className="w-full h-auto rounded-lg object-cover shadow-md border-2 border-purple-300/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          )}
          
          {project.description && (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-100 leading-relaxed">{project.description}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-purple-200">
            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.startDate).getFullYear()}</span>
              </div>
            )}
            {project.projectUrl && (
              <a 
                href={project.projectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-purple-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Project</span>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function YogaFitnessModel({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: YogaFitnessModelProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-purple-950 text-white font-sans">
      <YogaParallaxBackground />

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto space-y-10"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute -inset-6 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, violet, indigo, cyan, green, yellow, orange, red, violet)"
                }}
              />
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-52 h-52 rounded-full border-4 border-white shadow-2xl relative z-10"
              />
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full backdrop-blur-sm border border-purple-300/20"
            >
              <Circle className="w-3 h-3 text-purple-300 fill-purple-300 animate-pulse" />
              <span className="text-purple-100 font-medium">Namaste</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200"
            >
              {userInfo.name}
            </motion.h1>

            {userInfo.title && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl md:text-4xl text-purple-200 font-light"
              >
                {userInfo.title}{userInfo.company ? ` at ${userInfo.company}` : ''}
              </motion.p>
            )}

            {userInfo.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto italic"
              >
                "{userInfo.tagline}"
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-purple-200"
          >
            {userInfo.location && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <MapPin className="w-4 h-4" />
                <span>{userInfo.location}</span>
              </div>
            )}
            {userInfo.industry && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Building className="w-4 h-4" />
                <span>{userInfo.industry}</span>
              </div>
            )}
            {userInfo.domain && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <Heart className="w-4 h-4" />
                <span>{userInfo.domain}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-10 py-6 rounded-full shadow-xl shadow-purple-500/30"
              data-testid="button-connect"
            >
              <Mail className="w-5 h-5 mr-2" />
              Connect
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-purple-300 text-purple-100 hover:bg-purple-500/20 font-semibold px-10 py-6 rounded-full backdrop-blur-sm"
              data-testid="button-mentor"
            >
              <Users className="w-5 h-5 mr-2" />
              Request Mentorship
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Content Sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-20 space-y-24">
        {userInfo.aboutMe && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-purple-100">My Journey</h2>
            </div>
            <Card className="bg-white/10 backdrop-blur-md border-2 border-purple-300/20 shadow-2xl">
              <CardContent className="p-8">
                <p className="text-lg text-purple-50 leading-relaxed">{userInfo.aboutMe}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {userInfo.visionStatement && (
          <motion.section
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-green-400 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-cyan-100">Vision</h2>
            </div>
            <Card className="bg-white/10 backdrop-blur-md border-2 border-cyan-300/20 shadow-2xl">
              <CardContent className="p-8">
                <p className="text-lg text-cyan-50 leading-relaxed italic">{userInfo.visionStatement}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {userInfo.missionStatement && (
          <motion.section
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-yellow-400 rounded-full">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="text-4xl font-bold text-green-100">Mission</h2>
            </div>
            <Card className="bg-white/10 backdrop-blur-md border-2 border-green-300/20 shadow-2xl">
              <CardContent className="p-8">
                <p className="text-lg text-green-50 leading-relaxed">{userInfo.missionStatement}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {sortedExperiences.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-yellow-100">Experience</h2>
            </div>
            
            <div className="space-y-6">
              {sortedExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-2 border-yellow-300/20 shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-yellow-100">{exp.title}</h3>
                          <p className="text-lg text-yellow-200 font-medium">{exp.company}</p>
                        </div>
                        <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-300/30">
                          {exp.startDate && new Date(exp.startDate).getFullYear()}
                        </Badge>
                      </div>
                      
                      {exp.description && (
                        <p className="text-purple-100 leading-relaxed">{exp.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-yellow-200">
                        <MapPin className="w-4 h-4" />
                        <span>{exp.location || 'Remote'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {sortedEducations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-orange-100">Education</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-2 border-orange-300/20 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-orange-100">{edu.degree}</h3>
                          <p className="text-orange-200 font-medium">{edu.institution}</p>
                        </div>
                        <GraduationCap className="w-8 h-8 text-orange-400" />
                      </div>
                      
                      {edu.fieldOfStudy && (
                        <p className="text-purple-100">{edu.fieldOfStudy}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-orange-200">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {edu.startDate && new Date(edu.startDate).getFullYear()}
                          {edu.endDate && ` - ${new Date(edu.endDate).getFullYear()}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {userSkills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-pink-100">Skills</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {userSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge className="px-5 py-2 text-base bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-100 hover:from-pink-500/40 hover:to-purple-500/40 border border-pink-300/20 backdrop-blur-sm">
                    {skill.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {sortedProjects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-cyan-100">Projects</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className="bg-white/10 backdrop-blur-md border-2 border-cyan-300/20 shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full"
                    onClick={() => openProjectModal(project)}
                  >
                    <CardContent className="p-0">
                      {project.thumbnailUrl && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-cyan-100 group-hover:text-cyan-200 transition-colors">
                          {project.title}
                        </h3>
                        
                        {project.description && (
                          <p className="text-purple-100 text-sm line-clamp-3">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-cyan-200">
                            <Calendar className="w-4 h-4" />
                            <span>{project.startDate && new Date(project.startDate).getFullYear()}</span>
                          </div>
                          <ExternalLink className="w-5 h-5 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {userServices && userServices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
              <h2 className="text-4xl font-bold text-green-100">Services</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-2 border-green-300/20 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-green-100">{service.title}</h3>
                      {service.description && (
                        <p className="text-purple-100">{service.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-20"
        >
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 mb-8">
            Let's Connect
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-12 py-7 rounded-full shadow-2xl shadow-purple-500/40"
              data-testid="button-connect-footer"
            >
              <Mail className="w-6 h-6 mr-2" />
              Connect With Me
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-purple-300 text-purple-100 hover:bg-purple-500/20 font-semibold px-12 py-7 rounded-full backdrop-blur-sm"
              data-testid="button-mentor-footer"
            >
              <Users className="w-6 h-6 mr-2" />
              Request Mentorship
            </Button>
          </div>
        </motion.section>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
