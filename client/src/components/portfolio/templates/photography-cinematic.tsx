import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Camera, Mail, MapPin, Eye, Target, Heart, Users, Briefcase, Calendar, ChevronLeft, ChevronRight, X, ExternalLink, Globe, Download, MessageCircle, Aperture, Film, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useRef } from "react";

const colors = {
  cream: '#F5F0E8',
  warmWhite: '#FAF8F5',
  goldenHour: '#FBBF24',
  goldenLight: '#FDBA74',
  deepSepia: '#8B7355',
  charcoal: '#1C1C1C',
  softBlack: '#0D0D0D',
  filmGrain: '#E8E4DC',
  copper: '#B87333',
  skyBlue: '#60A5FA'
};

interface PhotographyCinematicProps {
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
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
  };
  userSkills?: Array<{ 
    id: number; 
    name?: string;
    skillName?: string; 
    level?: string | null; 
    proficiency?: number | null;
    proficiencyLevel?: string | null;
    category?: string | null;
    yearsOfExperience?: number | null;
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
    imageUrl?: string | null;
    category?: string | null;
    industry?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    projectUrl?: string | null;
    link?: string | null;
    mediaUrls?: string[] | any;
    technologies?: string[] | any;
    outcome?: string | null;
    impact?: string | null;
    role?: string | null;
    teamSize?: number | null;
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
    isHourly?: boolean | null;
    category?: string | null;
    features?: string[] | any;
    imageUrl?: string | null;
  }>;
  currentUserId?: number;
}

function LightLeakOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute -left-1/4 top-0 w-3/4 h-full"
        style={{
          background: `linear-gradient(120deg, transparent 30%, ${colors.goldenHour}30 50%, ${colors.goldenLight}20 60%, transparent 70%)`,
        }}
        animate={{
          x: ['0%', '150%'],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

function FilmStripFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -left-3 top-0 bottom-0 w-6 flex flex-col justify-around">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-3 h-2 bg-charcoal/20 rounded-sm" />
        ))}
      </div>
      <div className="absolute -right-3 top-0 bottom-0 w-6 flex flex-col justify-around">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-3 h-2 bg-charcoal/20 rounded-sm" />
        ))}
      </div>
      {children}
    </div>
  );
}

function SkillLensCard({ skill, index }: { skill: any; index: number }) {
  const skillName = skill.name || skill.skillName || 'Skill';
  const proficiency = skill.proficiency || (skill.proficiencyLevel ? parseInt(skill.proficiencyLevel) : 3);
  const years = skill.yearsOfExperience || Math.floor(proficiency * 1.5);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="relative p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-charcoal/10 shadow-sm hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: i < proficiency ? colors.goldenHour : `${colors.charcoal}20`,
                transform: `scale(${1 - i * 0.15})`,
              }}
              whileHover={{ 
                borderColor: colors.goldenHour,
                transition: { delay: i * 0.05 }
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <Aperture className="w-6 h-6 text-goldenHour group-hover:animate-pulse" style={{ color: colors.goldenHour }} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-charcoal truncate" style={{ color: colors.charcoal }}>
            {skillName}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium" style={{ color: colors.goldenHour }}>
              {proficiency}/5
            </span>
            <span className="text-xs text-charcoal/60">•</span>
            <span className="text-xs text-charcoal/60">{years}+ yrs</span>
          </div>
          {skill.category && (
            <Badge variant="outline" className="mt-2 text-xs" style={{ borderColor: colors.copper, color: colors.copper }}>
              {skill.category}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="mt-3 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${colors.goldenHour}, ${colors.goldenLight})` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(proficiency / 5) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
}

function FilmReelExperience({ experience, index, isLast }: { experience: any; index: number; isLast: boolean }) {
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const responsibilities = Array.isArray(experience.keyResponsibilities) 
    ? experience.keyResponsibilities 
    : typeof experience.keyResponsibilities === 'string'
      ? experience.keyResponsibilities.split(',').map((s: string) => s.trim())
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="relative flex gap-6"
    >
      <div className="flex flex-col items-center">
        <motion.div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.goldenHour}, ${colors.copper})` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {experience.company?.charAt(0) || 'C'}
        </motion.div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-3" style={{ background: `linear-gradient(to bottom, ${colors.goldenHour}, ${colors.cream})` }} />
        )}
      </div>
      
      <div className="flex-1 pb-8">
        <div className="p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-charcoal/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-lg" style={{ color: colors.charcoal }}>{experience.title}</h4>
              <p className="text-sm font-medium" style={{ color: colors.copper }}>{experience.company}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ background: `${colors.goldenHour}20`, color: colors.deepSepia }}>
              <Calendar className="w-3 h-3" />
              {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : (
                <span className="flex items-center gap-1">
                  Present
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </span>
              )}
            </div>
          </div>
          
          {experience.location && (
            <div className="flex items-center gap-1 text-xs text-charcoal/60 mb-2">
              <MapPin className="w-3 h-3" />
              {experience.location}
            </div>
          )}
          
          {experience.description && (
            <p className="text-sm text-charcoal/80 mb-3 line-clamp-3">{experience.description}</p>
          )}
          
          {responsibilities.length > 0 && (
            <ul className="space-y-1">
              {responsibilities.slice(0, 3).map((resp: string, i: number) => (
                <li key={i} className="text-xs text-charcoal/70 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: colors.goldenHour }} />
                  {resp}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EducationSlide({ education, index }: { education: any; index: number }) {
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  const skills = Array.isArray(education.skillsAcquired) 
    ? education.skillsAcquired 
    : typeof education.skillsAcquired === 'string'
      ? education.skillsAcquired.split(',').map((s: string) => s.trim())
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-80 p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-charcoal/10 shadow-sm hover:shadow-md transition-all snap-center"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${colors.skyBlue}20` }}>
          <Award className="w-5 h-5" style={{ color: colors.skyBlue }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate" style={{ color: colors.charcoal }}>{education.degree}</h4>
          <p className="text-xs truncate" style={{ color: colors.copper }}>{education.institution}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-charcoal/60 mb-3">
        {education.location && (
          <>
            <MapPin className="w-3 h-3" />
            <span className="truncate">{education.location}</span>
            <span>•</span>
          </>
        )}
        <span>{formatDate(education.startDate)} - {education.endDate ? formatDate(education.endDate) : 'Present'}</span>
      </div>
      
      {education.fieldOfStudy && (
        <Badge variant="outline" className="mb-3 text-xs" style={{ borderColor: colors.goldenHour, color: colors.deepSepia }}>
          {education.fieldOfStudy}
        </Badge>
      )}
      
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill: string, i: number) => (
            <span 
              key={i} 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${colors.goldenHour}15`, color: colors.deepSepia }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ProjectCard({ project, onClick, index }: { project: any; onClick: () => void; index: number }) {
  const imageUrl = project.thumbnailUrl || project.imageUrl || (project.mediaUrls?.[0]);
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group cursor-pointer relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      style={{ aspectRatio: '4/3' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${colors.cream}, ${colors.filmGrain})` }}
        >
          <Camera className="w-12 h-12 text-charcoal/30" />
        </div>
      )}
      
      <motion.div
        className="absolute inset-0 border-4 rounded-xl pointer-events-none z-20"
        style={{ borderColor: colors.goldenHour }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h4 className="font-semibold text-white text-lg mb-1 line-clamp-1">{project.title}</h4>
        {project.category && (
          <Badge className="text-xs" style={{ background: colors.goldenHour, color: colors.softBlack }}>
            {project.category}
          </Badge>
        )}
      </div>
      
      <motion.div
        className="absolute top-0 left-0 right-0 p-3 z-20 flex flex-wrap gap-2"
        initial={{ opacity: 0, y: -10 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        {project.role && (
          <span className="text-xs px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm">
            {project.role}
          </span>
        )}
        {project.teamSize && (
          <span className="text-xs px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
            <Users className="w-3 h-3" /> {project.teamSize}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

function ProjectModal({ project, onClose }: { project: any; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = project.mediaUrls?.length > 0 
    ? project.mediaUrls 
    : project.thumbnailUrl || project.imageUrl 
      ? [project.thumbnailUrl || project.imageUrl] 
      : [];
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden" style={{ background: colors.warmWhite }}>
        <div className="flex flex-col lg:flex-row">
          <div className="relative lg:w-3/5 aspect-video lg:aspect-auto bg-black">
            {images.length > 0 ? (
              <>
                <img 
                  src={images[currentImageIndex]} 
                  alt={project.title}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: colors.filmGrain }}>
                <Camera className="w-16 h-16 text-charcoal/30" />
              </div>
            )}
          </div>
          
          <div className="lg:w-2/5 p-6 overflow-y-auto max-h-[70vh]">
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>{project.title}</h2>
            
            {project.category && (
              <Badge className="mb-4" style={{ background: colors.goldenHour, color: colors.softBlack }}>
                {project.category}
              </Badge>
            )}
            
            <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: colors.charcoal }}>
              {project.role && (
                <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: `${colors.goldenHour}15` }}>
                  <Briefcase className="w-3 h-3" /> {project.role}
                </div>
              )}
              {project.teamSize && (
                <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: `${colors.skyBlue}15` }}>
                  <Users className="w-3 h-3" /> Team of {project.teamSize}
                </div>
              )}
              {project.startDate && (
                <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: `${colors.copper}15` }}>
                  <Calendar className="w-3 h-3" /> {new Date(project.startDate).getFullYear()}
                </div>
              )}
            </div>
            
            {project.description && (
              <p className="text-sm text-charcoal/80 mb-4 leading-relaxed">{project.description}</p>
            )}
            
            {(project.outcome || project.impact) && (
              <div className="p-3 rounded-lg mb-4" style={{ background: `${colors.goldenHour}10`, borderLeft: `3px solid ${colors.goldenHour}` }}>
                <p className="text-sm font-medium" style={{ color: colors.deepSepia }}>
                  {project.impact || project.outcome}
                </p>
              </div>
            )}
            
            {technologies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.charcoal }}>Tools & Technologies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((tech: string, i: number) => (
                    <span 
                      key={i} 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: `${colors.charcoal}10`, color: colors.charcoal }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(project.projectUrl || project.link) && (
              <a 
                href={project.projectUrl || project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: colors.skyBlue }}
              >
                <ExternalLink className="w-4 h-4" /> View Project
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ServiceCard({ service, index, currency }: { service: any; index: number; currency: 'INR' | 'USD' }) {
  const price = currency === 'INR' ? service.priceInr : service.priceUsd;
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const features = Array.isArray(service.features) 
    ? service.features 
    : typeof service.features === 'string'
      ? service.features.split(',').map((s: string) => s.trim())
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-charcoal/10 shadow-sm hover:shadow-lg transition-all group"
    >
      {price && (
        <div 
          className="absolute -top-3 -left-3 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.goldenHour}, ${colors.copper})` }}
        >
          {currencySymbol}{price}
        </div>
      )}
      
      <div className="pt-4">
        <h4 className="font-semibold text-lg mb-1" style={{ color: colors.charcoal }}>{service.title}</h4>
        {service.category && (
          <Badge variant="outline" className="text-xs mb-2" style={{ borderColor: colors.copper, color: colors.copper }}>
            {service.category}
          </Badge>
        )}
        {service.isHourly && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: `${colors.skyBlue}15`, color: colors.skyBlue }}>
            /hour
          </span>
        )}
        
        <p className="text-sm text-charcoal/70 mb-4 line-clamp-2">{service.description}</p>
        
        {features.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {features.slice(0, 4).map((feature: string, i: number) => (
              <li key={i} className="text-xs text-charcoal/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.goldenHour }} />
                {feature}
              </li>
            ))}
          </ul>
        )}
        
        <Button 
          className="w-full text-sm font-medium"
          style={{ background: `linear-gradient(135deg, ${colors.goldenHour}, ${colors.goldenLight})`, color: colors.softBlack }}
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Book / Contact
        </Button>
      </div>
    </motion.div>
  );
}

export default function PhotographyCinematic({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = []
}: PhotographyCinematicProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');
  const educationScrollRef = useRef<HTMLDivElement>(null);

  const heroImage = userProjects[0]?.thumbnailUrl || userProjects[0]?.imageUrl || userProjects[0]?.mediaUrls?.[0];
  const sortedSkills = [...userSkills].sort((a, b) => {
    const profA = a.proficiency || 3;
    const profB = b.proficiency || 3;
    return profB - profA;
  });
  const displayedSkills = showAllSkills ? sortedSkills : sortedSkills.slice(0, 6);

  return (
    <div className="min-h-screen relative" style={{ background: colors.warmWhite }}>
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Hero" 
              className="w-full h-full object-cover"
              style={{ filter: 'blur(2px)' }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.warmWhite}ee 0%, ${colors.warmWhite}99 50%, ${colors.goldenHour}40 100%)` }} />
          </div>
        )}
        <LightLeakOverlay />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
          <FilmStripFrame className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-48 h-64 rounded-lg overflow-hidden shadow-2xl border-4"
              style={{ borderColor: colors.cream }}
            >
              {userInfo.photoURL ? (
                <img src={userInfo.photoURL} alt={userInfo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: colors.filmGrain }}>
                  <Camera className="w-12 h-12" style={{ color: colors.charcoal }} />
                </div>
              )}
            </motion.div>
          </FilmStripFrame>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              style={{ 
                color: colors.charcoal,
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 2px 20px rgba(0,0,0,0.1)'
              }}
            >
              {userInfo.name}
            </h1>
            
            {userInfo.title && (
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ background: `linear-gradient(90deg, ${colors.goldenHour}, ${colors.goldenLight})` }}
              >
                <Camera className="w-4 h-4" style={{ color: colors.softBlack }} />
                <span className="text-sm font-semibold tracking-wide" style={{ color: colors.softBlack }}>
                  {userInfo.title}
                </span>
              </div>
            )}
            
            {userInfo.tagline && (
              <p className="text-lg md:text-xl mb-6 max-w-lg" style={{ color: colors.charcoal, opacity: 0.8 }}>
                {userInfo.tagline}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mb-6 justify-center lg:justify-start">
              {userInfo.location && (
                <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full" style={{ background: `${colors.charcoal}10`, color: colors.charcoal }}>
                  <MapPin className="w-3.5 h-3.5" /> {userInfo.location}
                </span>
              )}
              {userInfo.industry && (
                <span className="text-sm px-3 py-1.5 rounded-full" style={{ background: `${colors.goldenHour}20`, color: colors.deepSepia }}>
                  {userInfo.industry}
                </span>
              )}
              {userInfo.domain && (
                <span className="text-sm px-3 py-1.5 rounded-full" style={{ background: `${colors.skyBlue}20`, color: colors.skyBlue }}>
                  {userInfo.domain}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button 
                size="lg"
                className="font-semibold shadow-lg hover:shadow-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${colors.goldenHour}, ${colors.goldenLight})`, color: colors.softBlack }}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Let's Talk
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="font-semibold"
                style={{ borderColor: colors.charcoal, color: colors.charcoal }}
              >
                <Download className="w-4 h-4 mr-2" /> Grab Resume
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 px-6" style={{ background: colors.cream }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-8"
          >
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.charcoal }}>
                <Eye className="w-6 h-6" style={{ color: colors.goldenHour }} />
                About Me
              </h2>
              
              {userInfo.aboutMe && (
                <div className="relative">
                  <p className="text-base leading-relaxed mb-6" style={{ color: colors.charcoal }}>
                    {userInfo.aboutMe}
                  </p>
                  
                  {userInfo.uniqueValueProposition && (
                    <blockquote 
                      className="border-l-4 pl-4 py-2 italic text-lg mb-6"
                      style={{ borderColor: colors.goldenHour, color: colors.deepSepia }}
                    >
                      "{userInfo.uniqueValueProposition}"
                    </blockquote>
                  )}
                </div>
              )}
              
              {userInfo.lookingFor && (
                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: `${colors.goldenHour}10` }}>
                  <Briefcase className="w-5 h-5 mt-0.5" style={{ color: colors.goldenHour }} />
                  <div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: colors.charcoal }}>Looking For</h4>
                    <p className="text-sm" style={{ color: colors.charcoal, opacity: 0.8 }}>{userInfo.lookingFor}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/3 space-y-4">
              {(userInfo.visionStatement || userInfo.missionStatement) && (
                <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-charcoal/10">
                  {userInfo.visionStatement && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${colors.goldenHour}20` }}>
                          <Eye className="w-3 h-3" style={{ color: colors.goldenHour }} />
                        </div>
                        <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>Vision</h4>
                      </div>
                      <p className="text-sm" style={{ color: colors.charcoal, opacity: 0.8 }}>{userInfo.visionStatement}</p>
                    </div>
                  )}
                  {userInfo.missionStatement && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${colors.copper}20` }}>
                          <Target className="w-3 h-3" style={{ color: colors.copper }} />
                        </div>
                        <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>Mission</h4>
                      </div>
                      <p className="text-sm" style={{ color: colors.charcoal, opacity: 0.8 }}>{userInfo.missionStatement}</p>
                    </div>
                  )}
                </div>
              )}
              
              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-charcoal/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4" style={{ color: colors.goldenHour }} />
                    <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>Core Values</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.coreValues.map((value, i) => (
                      <motion.span 
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="text-xs px-3 py-1.5 rounded-full cursor-default"
                        style={{ background: `${colors.goldenHour}15`, color: colors.deepSepia }}
                      >
                        {value}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
              
              {((userInfo.primaryAudience && userInfo.primaryAudience.length > 0) || (userInfo.secondaryAudience && userInfo.secondaryAudience.length > 0)) && (
                <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-charcoal/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" style={{ color: colors.skyBlue }} />
                    <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>Target Audience</h4>
                  </div>
                  {userInfo.primaryAudience && userInfo.primaryAudience.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-charcoal/60 mb-1">Primary</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userInfo.primaryAudience.map((aud, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: `${colors.skyBlue}15`, color: colors.skyBlue }}>
                            {aud}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {userInfo.secondaryAudience && userInfo.secondaryAudience.length > 0 && (
                    <div>
                      <p className="text-xs text-charcoal/60 mb-1">Secondary</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userInfo.secondaryAudience.map((aud, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded" style={{ background: `${colors.charcoal}10`, color: colors.charcoal }}>
                            {aud}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {userInfo.email && (
                <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-charcoal/10 flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: colors.goldenHour }} />
                  <a 
                    href={`mailto:${userInfo.email}`}
                    className="text-sm font-medium hover:underline truncate"
                    style={{ color: colors.charcoal }}
                  >
                    {userInfo.email}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {userSkills.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: colors.charcoal }}>
                <Aperture className="w-6 h-6" style={{ color: colors.goldenHour }} />
                Lens Strengths
              </h2>
              <p className="text-sm mt-2" style={{ color: colors.charcoal, opacity: 0.7 }}>
                Technical expertise & creative capabilities
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSkills.map((skill, index) => (
                <SkillLensCard key={skill.id} skill={skill} index={index} />
              ))}
            </div>
            
            {sortedSkills.length > 6 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  style={{ borderColor: colors.goldenHour, color: colors.deepSepia }}
                >
                  {showAllSkills ? 'Show Less' : `See All (${sortedSkills.length})`}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {userExperiences.length > 0 && (
        <section className="relative py-20 px-6" style={{ background: colors.cream }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: colors.charcoal }}>
                <Film className="w-6 h-6" style={{ color: colors.goldenHour }} />
                Film Reel Timeline
              </h2>
              <p className="text-sm mt-2" style={{ color: colors.charcoal, opacity: 0.7 }}>
                Professional journey & milestones
              </p>
            </motion.div>
            
            <div className="relative">
              {userExperiences.map((exp, index) => (
                <FilmReelExperience 
                  key={exp.id} 
                  experience={exp} 
                  index={index} 
                  isLast={index === userExperiences.length - 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {userEducations.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: colors.charcoal }}>
                <Award className="w-6 h-6" style={{ color: colors.goldenHour }} />
                Slide Strip Credentials
              </h2>
              <p className="text-sm mt-2" style={{ color: colors.charcoal, opacity: 0.7 }}>
                Academic foundation & certifications
              </p>
            </motion.div>
            
            <div 
              ref={educationScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {userEducations.map((edu, index) => (
                <EducationSlide key={edu.id} education={edu} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {userProjects.length > 0 && (
        <section className="relative py-20 px-6" style={{ background: colors.cream }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: colors.charcoal }}>
                <Camera className="w-6 h-6" style={{ color: colors.goldenHour }} />
                Gallery Wall
              </h2>
              <p className="text-sm mt-2" style={{ color: colors.charcoal, opacity: 0.7 }}>
                Featured works & creative projects
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  index={index}
                  onClick={() => setSelectedProject(project)} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {userServices.length > 0 && (
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: colors.charcoal }}>
                <Briefcase className="w-6 h-6" style={{ color: colors.goldenHour }} />
                What I Offer
              </h2>
              <p className="text-sm mt-2 mb-4" style={{ color: colors.charcoal, opacity: 0.7 }}>
                Professional services & packages
              </p>
              
              <div className="inline-flex items-center gap-2 p-1 rounded-full" style={{ background: `${colors.charcoal}10` }}>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currency === 'USD' ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: colors.charcoal }}
                >
                  USD
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currency === 'INR' ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: colors.charcoal }}
                >
                  INR
                </button>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} currency={currency} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-8 px-6 border-t" style={{ borderColor: `${colors.charcoal}10`, background: colors.warmWhite }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: colors.charcoal, opacity: 0.6 }}>
            © {new Date().getFullYear()} {userInfo.name}. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" style={{ borderColor: colors.goldenHour, color: colors.deepSepia }}>
              <Download className="w-4 h-4 mr-2" /> vCard
            </Button>
            {userInfo.email && (
              <Button 
                size="sm"
                style={{ background: `linear-gradient(135deg, ${colors.goldenHour}, ${colors.goldenLight})`, color: colors.softBlack }}
              >
                <Mail className="w-4 h-4 mr-2" /> Contact
              </Button>
            )}
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
