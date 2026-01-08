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
import PortfolioCtaButtons from "../portfolio-cta-buttons";

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

// Earthy Parallax Background - Reference Website Inspired
function YogaParallaxBackground() {
  const { scrollY } = useScroll();
  
  // Three subtle parallax layers with earthy tones
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -300]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -600]);
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -900]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Cream base - slowest */}
      <motion.div 
        style={{ 
          y: layer1Y,
          background: "linear-gradient(to bottom, #F5F1EC 0%, #F0EBE6 30%, #EBE4DC 60%, #E8DFD5 100%)"
        }}
        className="absolute inset-0"
      />
      
      {/* Layer 2: Subtle beige/green accents - medium speed */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {/* Soft gradient orbs for depth */}
        <div className="absolute top-32 right-[20%] w-[400px] h-[400px] rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#D4C5B0' }} />
        <div className="absolute top-[40%] left-[15%] w-[500px] h-[500px] rounded-full blur-3xl opacity-25" style={{ backgroundColor: '#2D5F4F' }} />
        <div className="absolute bottom-40 right-[25%] w-[450px] h-[450px] rounded-full blur-3xl opacity-30" style={{ backgroundColor: '#C9B5A0' }} />
        <ChakraSymbol color="border-[#F5A54A]" top="top-[60%]" left="right-[12%]" delay={1.5} />
        <ChakraSymbol color="border-[#E89B3C]" top="bottom-[35%]" left="left-[20%]" delay={2} />
        <ChakraSymbol color="border-[#1A453F]" top="bottom-[20%]" left="right-[15%]" delay={2.5} />
        <ChakraSymbol color="border-[#D4A59A]" top="bottom-[10%]" left="left-[18%]" delay={3} />
        
        {/* Lotus flowers with natural tones */}
        <div className="absolute top-[35%] right-[25%] w-32 h-32" style={{ color: 'rgba(229, 180, 164, 0.5)' }}>
          <LotusDecoration delay={0} />
        </div>
        <div className="absolute bottom-[40%] left-[22%] w-28 h-28" style={{ color: 'rgba(127, 168, 163, 0.5)' }}>
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
          <Star className="w-8 h-8 fill-[#F5A54A]/40" style={{ color: 'rgba(245, 165, 74, 0.6)' }} />
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-[65%] right-[10%]"
        >
          <Sparkles className="w-10 h-10" style={{ color: 'rgba(136, 181, 176, 0.6)' }} />
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-[25%] left-[12%]"
        >
          <Heart className="w-9 h-9 fill-[#E5B4A4]/40" style={{ color: 'rgba(229, 180, 164, 0.6)' }} />
        </motion.div>
        
        {/* Energy flow lines with natural colors */}
        <div className="absolute top-[30%] right-[8%] w-1 h-56 bg-gradient-to-b from-[#7FA8A3]/50 via-[#88B5B0]/50 to-transparent" />
        <div className="absolute bottom-[25%] left-[10%] w-1 h-48 bg-gradient-to-t from-[#F5A54A]/50 via-[#E89B3C]/50 to-transparent" />
        
        {/* Mandala circles with sage teal */}
        <div className="absolute top-[40%] left-[5%] w-20 h-20">
          <div className="w-full h-full rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(127, 168, 163, 0.4)', animationDuration: "20s" }}>
            <div className="absolute inset-3 rounded-full border" style={{ borderColor: 'rgba(127, 168, 163, 0.3)' }} />
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F5F1EC' }}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-light" style={{ color: '#2D5F4F' }}>{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <motion.img
                  key={idx}
                  src={url}
                  alt={`${project.title} - ${idx + 1}`}
                  className="w-full h-auto rounded-2xl object-cover shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          )}
          
          {project.description && (
            <div className="prose max-w-none">
              <p className="break-words leading-relaxed" style={{ color: '#6B7F75' }}>{project.description}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#6B7F75' }}>
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
                className="flex items-center gap-2 transition-colors"
                style={{ color: '#2D5F4F' }}
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
    <div className="relative min-h-screen font-sans" style={{ backgroundColor: '#F5F1EC' }}>
      <YogaParallaxBackground />

      {/* Hero Section - Reference Website Inspired */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative min-h-[85vh] flex items-center px-6 md:px-12 lg:px-20 py-16"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight" style={{ color: '#2D5F4F' }}>
                {userInfo.tagline || `Your harmony starts here`}
              </h1>
              <p className="text-xl md:text-2xl font-light" style={{ color: '#6B7F75' }}>
                {userInfo.name}
                {userInfo.title && (
                  <>
                    {' - '}
                    <span>{userInfo.title}</span>
                    {userInfo.company && <span> at {userInfo.company}</span>}
                  </>
                )}
              </p>
            </div>
            
            <div className="flex gap-4">
              <PortfolioCtaButtons 
                variant="minimal" 
                userId={userInfo.id} 
                userName={userInfo.name} 
                 
              />
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
              {userInfo.photoURL ? (
                <img 
                  src={userInfo.photoURL} 
                  alt={userInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: '#D4C5B0' }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: 'rgba(212, 197, 176, 0.3)' }}>
            <p className="text-4xl font-light mb-2" style={{ color: '#2D5F4F' }}>
              {sortedExperiences.length || 0}+
            </p>
            <p className="text-sm uppercase tracking-wide" style={{ color: '#6B7F75' }}>Experience</p>
          </div>
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: 'rgba(212, 197, 176, 0.3)' }}>
            <p className="text-4xl font-light mb-2" style={{ color: '#2D5F4F' }}>
              {sortedProjects.length || 0}+
            </p>
            <p className="text-sm uppercase tracking-wide" style={{ color: '#6B7F75' }}>Projects</p>
          </div>
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: 'rgba(212, 197, 176, 0.3)' }}>
            <p className="text-4xl font-light mb-2" style={{ color: '#2D5F4F' }}>
              {userSkills.length || 0}+
            </p>
            <p className="text-sm uppercase tracking-wide" style={{ color: '#6B7F75' }}>Skills</p>
          </div>
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: 'rgba(212, 197, 176, 0.3)' }}>
            <p className="text-4xl font-light mb-2" style={{ color: '#2D5F4F' }}>93%</p>
            <p className="text-sm uppercase tracking-wide" style={{ color: '#6B7F75' }}>Success Rate</p>
          </div>
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>About Me</h2>
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#D4C5B0', borderRadius: '24px' }}>
              <CardContent className="p-8 md:p-12">
                <p className="text-lg leading-relaxed" style={{ color: '#2D5F4F' }}>{userInfo.aboutMe}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {userInfo.visionStatement && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#C9B5A0', borderRadius: '24px' }}>
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl font-light mb-4" style={{ color: '#2D5F4F' }}>Vision</h3>
                <p className="break-words text-lg leading-relaxed italic" style={{ color: '#2D5F4F' }}>{userInfo.visionStatement}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {userInfo.missionStatement && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 shadow-lg" style={{ backgroundColor: '#B9967E', borderRadius: '24px' }}>
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl font-light mb-4" style={{ color: '#2D5F4F' }}>Mission</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#2D5F4F' }}>{userInfo.missionStatement}</p>
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>Experience</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedExperiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow" style={{ backgroundColor: '#D4C5B0', borderRadius: '20px' }}>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: '#2D5F4F' }}>{exp.title}</h3>
                          <p className="text-base font-medium" style={{ color: '#6B7F75' }}>{exp.company}</p>
                        </div>
                        <Briefcase className="w-5 h-5" style={{ color: '#2D5F4F' }} />
                      </div>
                      
                      {exp.description && (
                        <p className="text-sm leading-relaxed" style={{ color: '#6B7F75' }}>{exp.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm pt-2" style={{ color: '#6B7F75' }}>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                        {exp.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(exp.startDate).getFullYear()}</span>
                          </div>
                        )}
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>Education</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedEducations.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg h-full hover:shadow-xl transition-shadow" style={{ backgroundColor: '#C9B5A0', borderRadius: '20px' }}>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: '#2D5F4F' }}>{edu.degree}</h3>
                          <p className="text-base font-medium" style={{ color: '#6B7F75' }}>{edu.institution}</p>
                        </div>
                        <GraduationCap className="w-5 h-5" style={{ color: '#2D5F4F' }} />
                      </div>
                      
                      {edu.fieldOfStudy && (
                        <p className="text-sm" style={{ color: '#6B7F75' }}>{edu.fieldOfStudy}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm pt-2" style={{ color: '#6B7F75' }}>
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>Skills</h2>
            
            <div className="flex flex-wrap justify-center gap-3">
              {userSkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Badge className="px-6 py-3 text-base border-0 shadow-md" style={{
                      backgroundColor: '#D4C5B0',
                      color: '#2D5F4F',
                      borderRadius: '20px'
                    }}>
                      {skill.name}
                    </Badge>
                    {((skill as any).category || (skill as any).yearsOfExperience) && (
                      <div className="flex gap-2 text-xs">
                        {(skill as any).category && (
                          <span className="px-2 py-1 rounded-full bg-white/80 text-gray-600">
                            {(skill as any).category}
                          </span>
                        )}
                        {(skill as any).yearsOfExperience && (
                          <span className="px-2 py-1 rounded-full bg-[#2D5F4F]/20 text-[#2D5F4F]">
                            {(skill as any).yearsOfExperience}y
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>Projects</h2>
            
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
                    className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full overflow-hidden"
                    style={{ borderRadius: '20px' }}
                    onClick={() => openProjectModal(project)}
                  >
                    <CardContent className="p-0">
                      {project.thumbnailUrl && (
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={project.thumbnailUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {project.title}
                            </h3>
                            {project.startDate && (
                              <p className="text-sm text-white/80">{new Date(project.startDate).getFullYear()}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!project.thumbnailUrl && (
                        <div className="p-6" style={{ backgroundColor: '#B9967E' }}>
                          <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D5F4F' }}>
                            {project.title}
                          </h3>
                          {project.description && (
                            <p className="text-sm line-clamp-3" style={{ color: '#6B7F75' }}>
                              {project.description}
                            </p>
                          )}
                        </div>
                      )}
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
            <h2 className="text-4xl md:text-5xl font-light mb-12 text-center" style={{ color: '#2D5F4F' }}>Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full" style={{ backgroundColor: '#B9967E', borderRadius: '20px' }}>
                    <CardContent className="p-8 space-y-3">
                      <div className="flex items-start gap-3">
                        <Heart className="w-6 h-6 mt-1" style={{ color: '#2D5F4F' }} />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D5F4F' }}>{service.title}</h3>
                          {service.description && (
                            <p className="leading-relaxed" style={{ color: '#6B7F75' }}>{service.description}</p>
                          )}
                        </div>
                      </div>
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
          <h2 className="text-4xl md:text-5xl font-light mb-12" style={{ color: '#2D5F4F' }}>
            Let's Connect
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="text-white font-medium px-12 py-6 rounded-full shadow-lg border-0"
              style={{
                backgroundColor: '#2D5F4F'
              }}
              data-testid="button-connect-footer"
            >
              <Mail className="w-5 h-5 mr-2" />
              Connect With Me
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 font-medium px-12 py-6 rounded-full"
              style={{
                borderColor: '#2D5F4F',
                color: '#2D5F4F',
                backgroundColor: 'transparent'
              }}
              data-testid="button-mentor-footer"
            >
              <Users className="w-5 h-5 mr-2" />
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
