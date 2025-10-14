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
  ExternalLink, BookOpen, Compass, Map, Star, Feather, Clock,
  Target, Heart, Users, TrendingUp, Mail, Phone, Globe
} from "lucide-react";

interface TimelineStoryteller2Props {
  userInfo: {
    id?: number;
    name: string;
    email: string;
    title: string;
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

function FloatingStoryElement({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        y: [-10, 10, -10]
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

function StorytellingParallaxBackground() {
  const { scrollY } = useScroll();
  
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -400]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -800]);
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -1200]);
  
  const compass1Rotate = useTransform(scrollY, [0, 2000], [0, 360]);
  const compass2Rotate = useTransform(scrollY, [0, 2000], [0, -180]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div 
        style={{ y: layer1Y }}
        className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"
      />
      
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        <div className="absolute top-32 right-[10%] w-[500px] h-[500px] bg-amber-300/40 rounded-full blur-3xl" />
        <div className="absolute bottom-48 left-[8%] w-[600px] h-[600px] bg-orange-300/35 rounded-full blur-3xl" />
        <div className="absolute top-[55%] left-[45%] w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl" />
        
        <motion.div style={{ rotate: compass1Rotate }} className="absolute top-48 left-[12%] w-32 h-32">
          <Compass className="w-full h-full text-amber-600/60" strokeWidth={1.5} />
        </motion.div>
        <motion.div style={{ rotate: compass2Rotate }} className="absolute bottom-56 right-[18%] w-40 h-40">
          <Compass className="w-full h-full text-orange-600/60" strokeWidth={1.5} />
        </motion.div>
        
        <div className="absolute top-[25%] right-[25%] w-28 h-28">
          <BookOpen className="w-full h-full text-amber-700/50" strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-[35%] left-[20%] w-24 h-24">
          <Map className="w-full h-full text-orange-700/50" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        <FloatingStoryElement delay={0}>
          <Star className="absolute top-[20%] right-[15%] w-6 h-6 text-amber-500/60 fill-amber-400/40" />
        </FloatingStoryElement>
        <FloatingStoryElement delay={1}>
          <Star className="absolute top-[65%] left-[18%] w-5 h-5 text-orange-500/60 fill-orange-400/40" />
        </FloatingStoryElement>
        <FloatingStoryElement delay={2}>
          <Star className="absolute bottom-[25%] right-[22%] w-4 h-4 text-yellow-500/60 fill-yellow-400/40" />
        </FloatingStoryElement>
        
        <div className="absolute top-[45%] left-[8%] w-16 h-16 rotate-45">
          <Feather className="w-full h-full text-amber-600/50" strokeWidth={1.5} />
        </div>
        
        <div className="absolute top-[35%] right-[12%] w-3 h-48 bg-gradient-to-b from-amber-500/50 to-transparent rounded-full" />
        <div className="absolute bottom-[30%] left-[15%] w-3 h-40 bg-gradient-to-b from-orange-500/50 to-transparent rounded-full" />
        
        <div className="absolute top-[28%] right-[8%] w-4 h-4 rounded-full bg-amber-600/60" />
        <div className="absolute top-[72%] left-[25%] w-3 h-3 rounded-full bg-orange-600/60" />
        <div className="absolute bottom-[15%] right-[30%] w-4 h-4 rounded-full bg-yellow-600/60" />
      </motion.div>
    </div>
  );
}

function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = (project.mediaUrls as string[]) || [];
  const allImages = [
    ...(project.thumbnailUrl ? [project.thumbnailUrl] : []),
    ...mediaUrls
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-amber-900">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <motion.img
                  key={idx}
                  src={url}
                  alt={`${project.title} - ${idx + 1}`}
                  className="w-full h-auto rounded-lg object-cover shadow-md border-2 border-amber-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          )}
          
          {project.description && (
            <div className="prose prose-amber max-w-none">
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-amber-800">
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
                className="flex items-center gap-2 hover:text-amber-600 transition-colors"
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

export default function TimelineStoryteller2({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: TimelineStoryteller2Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

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
    <div className="relative min-h-screen bg-amber-50 text-gray-900 font-serif">
      <StorytellingParallaxBackground />

      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto space-y-8"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-2xl opacity-30"
              />
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-48 h-48 rounded-full border-4 border-amber-300 shadow-2xl relative z-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-200/50 rounded-full"
            >
              <BookOpen className="w-5 h-5 text-amber-700" />
              <span className="text-amber-800 font-medium">Chapter One</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700"
            >
              {userInfo.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-3xl text-amber-800 font-light"
            >
              {userInfo.title}
            </motion.p>

            {userInfo.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto italic"
              >
                "{userInfo.tagline}"
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-amber-800"
          >
            {userInfo.location && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>{userInfo.location}</span>
              </div>
            )}
            {userInfo.industry && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
                <Building className="w-4 h-4" />
                <span>{userInfo.industry}</span>
              </div>
            )}
            {userInfo.domain && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full">
                <Target className="w-4 h-4" />
                <span>{userInfo.domain}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-6 rounded-full shadow-lg"
              data-testid="button-connect"
            >
              <Mail className="w-5 h-5 mr-2" />
              Connect
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-semibold px-8 py-6 rounded-full"
              data-testid="button-mentor"
            >
              <Users className="w-5 h-5 mr-2" />
              Mentor Me
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-20 space-y-32">
        {userInfo.aboutMe && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full">
                <Feather className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">The Story Begins</h2>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-xl">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed">{userInfo.aboutMe}</p>
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">The Vision</h2>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed italic">{userInfo.visionStatement}</p>
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">The Mission</h2>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-xl">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed">{userInfo.missionStatement}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {userInfo.coreValues && userInfo.coreValues.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userInfo.coreValues.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-amber-900">{value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {userInfo.uniqueValueProposition && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Unique Value</h2>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-xl">
              <CardContent className="p-8">
                <p className="text-lg text-gray-700 leading-relaxed font-medium">{userInfo.uniqueValueProposition}</p>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {((userInfo.primaryAudience && userInfo.primaryAudience.length > 0) || 
          (userInfo.secondaryAudience && userInfo.secondaryAudience.length > 0)) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Target Audience</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userInfo.primaryAudience && userInfo.primaryAudience.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                      <Target className="w-6 h-6" />
                      Primary Audience
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.primaryAudience.map((audience, idx) => (
                        <Badge key={idx} className="bg-amber-200 text-amber-900 hover:bg-amber-300">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.secondaryAudience && userInfo.secondaryAudience.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      Secondary Audience
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.secondaryAudience.map((audience, idx) => (
                        <Badge key={idx} className="bg-orange-200 text-orange-900 hover:bg-orange-300">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.section>
        )}

        {sortedExperiences.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Professional Journey</h2>
            </div>
            
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-400" />
              
              <div className="space-y-16">
                {sortedExperiences.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`relative flex items-center ${
                      idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    } flex-col md:gap-16`}
                  >
                    <div className="flex-1 w-full md:w-auto" />
                    
                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-4 border-amber-50 z-10">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    
                    <Card className="flex-1 w-full md:w-auto bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-shadow ml-20 md:ml-0">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-amber-900">{exp.title}</h3>
                            <p className="text-lg text-amber-700 font-medium">{exp.company}</p>
                          </div>
                          <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-300">
                            {exp.startDate && new Date(exp.startDate).getFullYear()}
                          </Badge>
                        </div>
                        
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <MapPin className="w-4 h-4" />
                          <span>{exp.location || 'Remote'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
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
            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Academic Path</h2>
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
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-amber-900">{edu.degree}</h3>
                          <p className="text-amber-700 font-medium">{edu.institution}</p>
                        </div>
                        <GraduationCap className="w-8 h-8 text-orange-500" />
                      </div>
                      
                      {edu.fieldOfStudy && (
                        <p className="text-gray-700">{edu.fieldOfStudy}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-amber-600">
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Skills & Expertise</h2>
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
                  <Badge className="px-4 py-2 text-base bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900 hover:from-amber-300 hover:to-orange-300 border border-amber-300">
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Notable Chapters</h2>
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
                    className="bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all cursor-pointer group h-full"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold text-amber-900 group-hover:text-orange-700 transition-colors">
                          {project.title}
                        </h3>
                        
                        {project.description && (
                          <p className="text-gray-700 text-sm line-clamp-3">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <Calendar className="w-4 h-4" />
                            <span>{project.startDate && new Date(project.startDate).getFullYear()}</span>
                          </div>
                          <ExternalLink className="w-5 h-5 text-amber-600 group-hover:text-orange-600 transition-colors" />
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
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-400 rounded-full">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Services Offered</h2>
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
                  <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow h-full">
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-amber-900">{service.title}</h3>
                      {service.description && (
                        <p className="text-gray-700">{service.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {(userInfo.lookingFor || userInfo.whatIOffer) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pb-20"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Let's Connect</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userInfo.lookingFor && (
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-lg">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-orange-900">Looking For</h3>
                    <p className="text-gray-700">{userInfo.lookingFor}</p>
                  </CardContent>
                </Card>
              )}
              
              {userInfo.whatIOffer && (
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-lg">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-amber-900">What I Offer</h3>
                    <p className="text-gray-700">{userInfo.whatIOffer}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-12">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-10 py-6 rounded-full shadow-xl"
                data-testid="button-connect-footer"
              >
                <Mail className="w-5 h-5 mr-2" />
                Connect With Me
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-semibold px-10 py-6 rounded-full"
                data-testid="button-mentor-footer"
              >
                <Users className="w-5 h-5 mr-2" />
                Request Mentorship
              </Button>
            </div>
          </motion.section>
        )}
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
