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
  ExternalLink, Clock, Sparkles,
  Target, Heart, Users, TrendingUp, Mail, Globe, Building2
} from "lucide-react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";

interface TimelineStoryteller2Props {
  userInfo: {
    id?: number;
    name: string;
    email: string;
    title: string;
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

function ElegantBackground({ isPreview = false }: { isPreview?: boolean }) {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 pointer-events-none overflow-hidden`} style={{ zIndex: -1 }}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/80 to-orange-50/60" />
      
      {/* Subtle warm overlay */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0"
      >
        {/* Soft ambient glows - no icons */}
        <div className="absolute top-20 right-[15%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[5%] w-[500px] h-[500px] bg-orange-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[25%] w-[350px] h-[350px] bg-yellow-200/20 rounded-full blur-3xl" />
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} 
        />
      </motion.div>
      
      {/* Bottom fade for content sections */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent" />
    </div>
  );
}

function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = (project.mediaUrls as string[]) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-amber-900">{project.title}</DialogTitle>
          {(project.category || project.industry) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.category && (
                <Badge className="bg-amber-200 text-amber-900">{project.category}</Badge>
              )}
              {project.industry && (
                <Badge variant="outline" className="border-orange-300 text-orange-800">{project.industry}</Badge>
              )}
            </div>
          )}
        </DialogHeader>
        <div className="space-y-6">
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaUrls.map((url, idx) => (
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
                <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
          
          {project && (project as any).clientEndorsement && (
            <div className="bg-amber-100/50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Client Endorsement</h4>
              <p className="text-gray-700 italic">"{(project as any).clientEndorsement}"</p>
            </div>
          )}
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
  currentUserId,
  isPremium
}: TimelineStoryteller2Props & { isPremium?: boolean }) {
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
    <div className="timeline-storyteller-unique-scope-v3 relative min-h-screen bg-stone-50 text-gray-900 isolate">
      <ElegantBackground isPreview={true} />

      {/* Hero Section - Clean header with 6 fields */}
      <motion.section 
        style={{ opacity: heroOpacity }}
        className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Profile Picture */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -inset-3 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-full blur-xl" />
              <ProfileImage
                src={userInfo.photoURL}
                alt={userInfo.name}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white shadow-xl relative z-10 object-cover"
              />
            </motion.div>
          </div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-3"
          >
            {userInfo.name}
          </motion.h1>

          {/* Title + Company */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-amber-700 font-medium mb-4"
          >
            {userInfo.title}{userInfo.company ? ` at ${userInfo.company}` : ''}
          </motion.p>

          {/* Location */}
          {userInfo.location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-gray-600 mb-4"
            >
              <MapPin className="w-4 h-4" />
              <span>{userInfo.location}</span>
            </motion.div>
          )}

          {/* Looking For - highlighted */}
          {userInfo.lookingFor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-6"
            >
              <Badge className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg">
                Looking for: {userInfo.lookingFor}
              </Badge>
            </motion.div>
          )}

          {/* Tagline */}
          {userInfo.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed italic border-l-4 border-amber-400 pl-4 text-left"
            >
              "{userInfo.tagline}"
            </motion.p>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-4 mt-8 pb-12"
          >
            <PortfolioCtaButtons 
              variant="minimal" 
              userId={userInfo.id} 
              userName={userInfo.name} 
              userEmail={userInfo.email} 
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 lg:px-24 space-y-16">
        {/* Vision, Mission, Core Values & Unique Value - All Combined in One Card */}
        {(userInfo.visionStatement || userInfo.missionStatement || (userInfo.coreValues && userInfo.coreValues.length > 0) || userInfo.uniqueValueProposition) && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
              <CardContent className="p-8 space-y-6">
                {(userInfo.visionStatement || userInfo.missionStatement) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userInfo.visionStatement && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Vision
                        </h3>
                        <p className="text-gray-700 leading-relaxed italic break-words">{userInfo.visionStatement}</p>
                      </div>
                    )}
                    {userInfo.missionStatement && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Mission
                        </h3>
                        <p className="text-gray-700 leading-relaxed break-words">{userInfo.missionStatement}</p>
                      </div>
                    )}
                  </div>
                )}
                {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-amber-900">Core Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.coreValues.map((value, idx) => (
                        <Badge 
                          key={idx} 
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300 text-sm font-medium"
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {userInfo.uniqueValueProposition && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-amber-900">Unique Value Proposition</h3>
                    <p className="text-gray-700 leading-relaxed font-medium break-words">{userInfo.uniqueValueProposition}</p>
                  </div>
                )}
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
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-amber-900">{service.title}</h3>
                        {((service.priceUsd && parseFloat(String(service.priceUsd)) > 0) || (service.priceInr && parseFloat(String(service.priceInr)) > 0)) && (
                          <Badge className="bg-amber-600 text-white font-semibold px-3 py-1">
                            {service.priceUsd && parseFloat(String(service.priceUsd)) > 0 ? `$${service.priceUsd}` : `₹${service.priceInr}`}
                            {service.isHourly && ' / hr'}
                          </Badge>
                        )}
                      </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((skill, idx) => {
                const levelPercent = skill.proficiency ?? (typeof skill.level === 'number' ? skill.level : (typeof skill.level === 'string' && !isNaN(parseInt(skill.level)) ? parseInt(skill.level) : 75));
                const levelLabel = skill.level && typeof skill.level === 'string' && ['Expert', 'Advanced', 'Intermediate', 'Beginner'].includes(skill.level) 
                  ? skill.level 
                  : (levelPercent >= 90 ? 'Expert' : levelPercent >= 70 ? 'Advanced' : levelPercent >= 50 ? 'Intermediate' : 'Beginner');
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-amber-900">{skill.name}</h4>
                          <Badge className="bg-amber-100 text-amber-700 text-xs">{levelLabel}</Badge>
                        </div>
                        {((skill as any).category || (skill as any).yearsOfExperience) && (
                          <div className="flex flex-wrap gap-2 text-xs text-amber-600">
                            {(skill as any).category && (
                              <span className="bg-amber-50 px-2 py-0.5 rounded">
                                {(skill as any).category}
                              </span>
                            )}
                            {(skill as any).yearsOfExperience && (
                              <span className="bg-orange-50 px-2 py-0.5 rounded">
                                {(skill as any).yearsOfExperience} yrs exp
                              </span>
                            )}
                          </div>
                        )}
                        <div className="relative h-3 bg-amber-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${levelPercent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: (idx % 10) * 0.1 + 0.5 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-amber-900">Projects</h2>
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
                            {exp.endDate ? ` - ${new Date(exp.endDate).getFullYear()}` : ' - Present'}
                          </Badge>
                        </div>
                        
                        {(exp.industry || exp.domain) && (
                          <div className="flex flex-wrap gap-2">
                            {exp.industry && (
                              <Badge variant="outline" className="text-amber-700 border-amber-300">
                                <Building className="w-3 h-3 mr-1" />
                                {exp.industry as React.ReactNode || ''}
                              </Badge>
                            )}
                            {exp.domain && (
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                {exp.domain as React.ReactNode || ''}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                        
                        {exp.keyResponsibilities && Array.isArray(exp.keyResponsibilities) && exp.keyResponsibilities.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-amber-800">Key Responsibilities:</h4>
                            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                              {(exp.keyResponsibilities as string[]).map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
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
                        <p className="text-gray-700 font-medium">{edu.fieldOfStudy}</p>
                      )}
                      
                      {(edu.industry || edu.domain) && (
                        <div className="flex flex-wrap gap-2">
                          {edu.industry && (
                            <Badge variant="outline" className="text-amber-700 border-amber-300 text-xs">
                              {edu.industry as React.ReactNode || ''}
                            </Badge>
                          )}
                          {edu.domain && (
                            <Badge variant="outline" className="text-orange-700 border-orange-300 text-xs">
                              {edu.domain as React.ReactNode || ''}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-amber-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {edu.startDate && new Date(edu.startDate).getFullYear()}
                            {edu.endDate ? ` - ${new Date(edu.endDate).getFullYear()}` : ' - Present'}
                          </span>
                        </div>
                        {edu.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{edu.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {edu.skillsAcquired && Array.isArray(edu.skillsAcquired) && edu.skillsAcquired.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-amber-800">Skills Acquired:</h4>
                          <div className="flex flex-wrap gap-2">
                            {(edu.skillsAcquired as string[]).map((skill, i) => (
                              <Badge key={i} className="bg-orange-100 text-orange-800 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Buttons Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pb-20"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <PortfolioCtaButtons 
              variant="minimal" 
              userId={userInfo.id} 
              userName={userInfo.name} 
              userEmail={userInfo.email} 
            />
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
