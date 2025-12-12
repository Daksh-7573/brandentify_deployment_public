import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, Heart, Wind, Target, MapPin, Mail, Calendar, 
  Award, Users, TrendingUp, Play, Download, MessageCircle, 
  ChevronLeft, ChevronRight, X, ExternalLink, Clock, Star,
  Instagram, Youtube, CheckCircle, Zap, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";

const colors = {
  energeticLime: '#A3E635',
  vibrantOrange: '#FB923C',
  deepEmerald: '#065F46',
  skyBlue: '#38BDF8',
  offWhiteMist: '#F8F9FA',
  coolGrey: '#E5E7EB',
  deepCharcoal: '#1F2937',
  warmWhite: '#FAFEFB',
};

interface FitnessPortfolioProps {
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

function BreathOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        scale: [1, 1.02, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `radial-gradient(circle at 50% 50%, ${colors.energeticLime}10, transparent 70%)`,
      }}
    />
  );
}

function ChakraAuraRing({ photoURL, name }: { photoURL: string | null; name: string }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  return (
    <div className="relative w-40 h-40 flex-shrink-0">
      <motion.div
        className="absolute -inset-4 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${colors.energeticLime}, ${colors.vibrantOrange}, ${colors.skyBlue}, ${colors.energeticLime})`,
          opacity: 0.2,
          filter: 'blur(12px)',
        }}
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.05, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          border: `4px solid ${colors.deepEmerald}20`,
        }}
        animate={prefersReducedMotion ? {} : { rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={photoURL || `https://ui-avatars.com/api/?name=${name}&background=065F46&color=A3E635`}
          alt={name}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${name}&background=065F46&color=A3E635`;
          }}
        />
      </div>
    </div>
  );
}

function parseProficiency(skill: any): number {
  if (typeof skill.proficiency === 'number' && !isNaN(skill.proficiency)) {
    return Math.min(5, Math.max(1, skill.proficiency));
  }
  if (skill.proficiencyLevel) {
    const level = skill.proficiencyLevel.toString().toLowerCase();
    const levelMap: Record<string, number> = {
      'beginner': 1, 'novice': 1, 'basic': 1,
      'elementary': 2, 'developing': 2,
      'intermediate': 3, 'competent': 3, 'proficient': 3,
      'advanced': 4, 'experienced': 4,
      'expert': 5, 'master': 5, 'professional': 5
    };
    if (levelMap[level]) return levelMap[level];
    const parsed = parseInt(skill.proficiencyLevel);
    if (!isNaN(parsed)) return Math.min(5, Math.max(1, parsed));
  }
  return 3;
}

function SkillRingCard({ skill, index, reducedMotion = false }: { skill: any; index: number; reducedMotion?: boolean }) {
  const skillName = skill.name || skill.skillName || 'Skill';
  const proficiency = parseProficiency(skill);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (proficiency / 5) * circumference;

  const getSkillColor = (idx: number) => {
    const colorPalette = [colors.energeticLime, colors.vibrantOrange, colors.skyBlue, colors.deepEmerald];
    return colorPalette[idx % colorPalette.length];
  };

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      whileHover={reducedMotion ? {} : { scale: 1.05, y: -4 }}
      className="relative p-5 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={colors.coolGrey}
              strokeWidth="6"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={getSkillColor(index)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: reducedMotion ? offset : circumference }}
              whileInView={{ strokeDashoffset: offset }}
              viewport={{ once: true }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.2, delay: index * 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: getSkillColor(index) }}>
              {proficiency * 20}%
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{skillName}</h4>
          {skill.category && (
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: getSkillColor(index), color: getSkillColor(index) }}
            >
              {skill.category}
            </Badge>
          )}
          {skill.yearsOfExperience && (
            <p className="text-xs text-gray-500 mt-1">{skill.yearsOfExperience}+ years</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ExperienceNode({ experience, index, isLast, reducedMotion = false }: { experience: any; index: number; isLast: boolean; reducedMotion?: boolean }) {
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
      initial={reducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.15 }}
      className="relative pl-8"
    >
      <div 
        className="absolute left-0 top-3 w-4 h-4 rounded-full border-4 z-10"
        style={{ 
          borderColor: colors.energeticLime,
          backgroundColor: !experience.endDate ? colors.energeticLime : 'white'
        }}
      >
        {!experience.endDate && (
          <span className="absolute -inset-2 rounded-full animate-ping opacity-30" style={{ backgroundColor: colors.energeticLime }} />
        )}
      </div>
      
      {!isLast && (
        <div 
          className="absolute left-[7px] top-7 w-0.5 h-full"
          style={{ background: `linear-gradient(to bottom, ${colors.energeticLime}, ${colors.coolGrey})` }}
        />
      )}
      
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge style={{ background: colors.deepEmerald, color: 'white' }}>
            {experience.company}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatDate(experience.startDate)} — {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </span>
        </div>
        
        <h4 className="font-semibold text-gray-800 mb-2">{experience.title}</h4>
        
        {experience.description && (
          <p className="text-sm text-gray-600 mb-3">{experience.description}</p>
        )}
        
        {responsibilities.length > 0 && (
          <ul className="space-y-1">
            {responsibilities.slice(0, 3).map((resp: string, i: number) => (
              <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.energeticLime }} />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        )}
        
        {experience.location && (
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>{experience.location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CertificationCard({ education, index, reducedMotion = false }: { education: any; index: number; reducedMotion?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.getFullYear().toString();
  };

  const skillsAcquired = Array.isArray(education.skillsAcquired) 
    ? education.skillsAcquired 
    : typeof education.skillsAcquired === 'string'
      ? education.skillsAcquired.split(',').map((s: string) => s.trim())
      : [];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${colors.vibrantOrange}, ${colors.energeticLime})` }}
        >
          <Award className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{education.degree}</h4>
          <p className="text-sm text-gray-600">{education.institution}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(education.startDate)} — {education.endDate ? formatDate(education.endDate) : 'Present'}</span>
          </div>
        </div>
      </div>
      
      {(education.fieldOfStudy || skillsAcquired.length > 0) && (
        <div className="mt-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: colors.deepEmerald }}
          >
            {expanded ? 'Hide details' : 'View details'}
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {education.fieldOfStudy && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Field:</span> {education.fieldOfStudy}
                    </p>
                  )}
                  {skillsAcquired.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skillsAcquired.map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function ProjectCard({ project, index, onClick, reducedMotion = false }: { project: any; index: number; onClick: () => void; reducedMotion?: boolean }) {
  const imageUrl = project.thumbnailUrl || project.imageUrl || project.mediaUrls?.[0];
  
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      whileHover={reducedMotion ? {} : { y: -8 }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.deepEmerald}, ${colors.energeticLime})` }}
          >
            <Dumbbell className="w-12 h-12 text-white/50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-sm font-medium">View Case Study →</span>
        </div>
        
        {project.category && (
          <Badge 
            className="absolute top-3 left-3"
            style={{ background: colors.vibrantOrange, color: 'white' }}
          >
            {project.category}
          </Badge>
        )}
      </div>
      
      <div className="p-5">
        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-1">{project.title}</h4>
        
        {project.outcome && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.outcome}</p>
        )}
        
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(project.technologies) ? project.technologies : []).slice(0, 3).map((tech: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ServiceCard({ service, index, currency, onBook, reducedMotion = false }: { service: any; index: number; currency: 'INR' | 'USD'; onBook: () => void; reducedMotion?: boolean }) {
  const price = currency === 'INR' ? service.priceInr : service.priceUsd;
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  
  const features = Array.isArray(service.features) 
    ? service.features 
    : typeof service.features === 'string'
      ? service.features.split(',').map((s: string) => s.trim())
      : [];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${colors.energeticLime}, ${colors.vibrantOrange})` }}
        >
          <Activity className="w-6 h-6 text-white" />
        </div>
        
        {price && (
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: colors.deepEmerald }}>
              {currencySymbol}{price.toLocaleString()}
            </p>
            {service.isHourly && <span className="text-xs text-gray-500">/hour</span>}
          </div>
        )}
      </div>
      
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
      
      {features.length > 0 && (
        <ul className="space-y-2 mb-5">
          {features.slice(0, 4).map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.energeticLime }} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
      
      <Button
        onClick={onBook}
        className="w-full font-semibold"
        style={{ 
          background: `linear-gradient(90deg, ${colors.energeticLime}, ${colors.vibrantOrange})`,
          color: 'white'
        }}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Book Now
      </Button>
    </motion.div>
  );
}

export default function FitnessPortfolio({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  currentUserId,
}: FitnessPortfolioProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');
  const [contactOpen, setContactOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const kpis = [
    { label: 'Clients Coached', value: '500+' },
    { label: 'Avg Rating', value: '★ 4.9' },
    { label: 'Years Experience', value: userExperiences.length > 0 ? `${userExperiences.length * 2}+` : '5+' },
    { label: 'Success Rate', value: '94%' },
  ];

  const methodSteps = [
    { icon: Target, title: 'Assessment', desc: 'Personalized evaluation' },
    { icon: Activity, title: 'Program Design', desc: 'Custom training plan' },
    { icon: Dumbbell, title: 'Coaching', desc: 'Expert guidance' },
    { icon: TrendingUp, title: 'Results', desc: 'Track progress' },
  ];

  return (
    <div className="min-h-screen" style={{ background: colors.offWhiteMist }}>
      <BreathOverlay />
      
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.warmWhite} 0%, ${colors.offWhiteMist} 50%, ${colors.deepEmerald}10 100%)`,
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <ChakraAuraRing photoURL={userInfo.photoURL} name={userInfo.name} />
                <div>
                  <motion.h1 
                    className="text-4xl lg:text-5xl font-bold mb-2"
                    style={{ color: colors.deepCharcoal }}
                  >
                    {userInfo.name}
                  </motion.h1>
                  
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${colors.vibrantOrange}, ${colors.energeticLime})`,
                    }}
                  >
                    <Dumbbell className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">
                      {userInfo.title || 'Fitness Coach'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {userInfo.tagline || 'Strengthen the body. Calm the mind. Move with purpose.'}
              </p>
              
              {userInfo.uniqueValueProposition && (
                <div 
                  className="p-4 rounded-xl border-l-4"
                  style={{ 
                    borderColor: colors.energeticLime,
                    background: `${colors.energeticLime}10`
                  }}
                >
                  <p className="text-gray-700 italic">"{userInfo.uniqueValueProposition}"</p>
                </div>
              )}
              
              {userInfo.location && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{userInfo.location}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="font-semibold"
                  style={{ 
                    background: `linear-gradient(90deg, ${colors.energeticLime}, ${colors.vibrantOrange})`,
                    color: 'white'
                  }}
                  onClick={() => setContactOpen(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a Session
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold"
                  style={{ borderColor: colors.deepEmerald, color: colors.deepEmerald }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Grab Resume
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {kpis.map((kpi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-lg text-center"
                >
                  <p className="text-3xl font-bold" style={{ color: colors.deepEmerald }}>
                    {kpi.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 px-6" style={{ background: colors.deepEmerald }}>
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Certified Professional</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">94% Client Success Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">500+ Transformations</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-sm font-medium">4.9 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {(userInfo.aboutMe || userInfo.visionStatement || userInfo.missionStatement) && (
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6" style={{ color: colors.deepCharcoal }}>
                  About Me
                </h2>
                
                {userInfo.aboutMe && (
                  <div className="prose prose-lg text-gray-600 mb-6">
                    <p>{userInfo.aboutMe}</p>
                  </div>
                )}
                
                {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {userInfo.coreValues.map((value, i) => (
                      <Badge 
                        key={i}
                        variant="outline"
                        className="px-3 py-1"
                        style={{ borderColor: colors.energeticLime, color: colors.deepEmerald }}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {userInfo.primaryAudience && userInfo.primaryAudience.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Who I Help:</p>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.primaryAudience.map((audience, i) => (
                        <span key={i} className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-6" style={{ color: colors.deepCharcoal }}>
                  My Method
                </h3>
                
                <div className="space-y-4">
                  {methodSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: `linear-gradient(135deg, ${colors.energeticLime}, ${colors.vibrantOrange})` }}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{step.title}</h4>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {userSkills.length > 0 && (
        <section className="py-20 px-6" style={{ background: colors.warmWhite }}>
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepCharcoal }}>
                Specialties & Skills
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Training expertise backed by years of experience and continuous learning
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.map((skill, i) => (
                <SkillRingCard key={skill.id} skill={skill} index={i} reducedMotion={prefersReducedMotion} />
              ))}
            </div>
          </div>
        </section>
      )}

      {userExperiences.length > 0 && (
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepCharcoal }}>
                Career Journey
              </h2>
            </motion.div>
            
            <div className="space-y-6">
              {userExperiences.map((exp, i) => (
                <ExperienceNode 
                  key={exp.id} 
                  experience={exp} 
                  index={i} 
                  isLast={i === userExperiences.length - 1}
                  reducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {userEducations.length > 0 && (
        <section className="py-20 px-6" style={{ background: colors.warmWhite }}>
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepCharcoal }}>
                Education & Certifications
              </h2>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEducations.map((edu, i) => (
                <CertificationCard key={edu.id} education={edu} index={i} reducedMotion={prefersReducedMotion} />
              ))}
            </div>
          </div>
        </section>
      )}

      {userProjects.length > 0 && (
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepCharcoal }}>
                Transformations & Case Studies
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real results from real clients — see the impact of dedicated training
              </p>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, i) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  index={i}
                  onClick={() => setSelectedProject(project)}
                  reducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {userServices.length > 0 && (
        <section className="py-20 px-6" style={{ background: colors.warmWhite }}>
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepCharcoal }}>
                Training Programs & Services
              </h2>
              
              <div className="inline-flex items-center gap-2 p-1 rounded-full bg-gray-100 mt-4">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currency === 'USD' ? 'bg-white shadow-sm' : ''}`}
                >
                  USD
                </button>
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currency === 'INR' ? 'bg-white shadow-sm' : ''}`}
                >
                  INR
                </button>
              </div>
            </motion.div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userServices.map((service, i) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  index={i}
                  currency={currency}
                  onBook={() => setContactOpen(true)}
                  reducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section 
        className="py-16 px-6"
        style={{ background: `linear-gradient(90deg, ${colors.deepEmerald}, ${colors.energeticLime})` }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Start your fitness journey today. Book a free assessment and let's create your personalized plan.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="font-semibold bg-white hover:bg-gray-100"
              style={{ color: colors.deepEmerald }}
              onClick={() => setContactOpen(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Free Assessment
            </Button>
            
            {userInfo.email && (
              <Button
                size="lg"
                variant="outline"
                className="font-semibold border-white text-white hover:bg-white/10"
                asChild
              >
                <a href={`mailto:${userInfo.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Me
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">{userInfo.name}</h3>
              <p className="text-gray-400 text-sm">{userInfo.title || 'Fitness Coach'}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              {userInfo.email && (
                <a href={`mailto:${userInfo.email}`} className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {userInfo.name}. Built with Brandentifier.
          </div>
        </div>
      </footer>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <div className="space-y-6">
              {(selectedProject.thumbnailUrl || selectedProject.imageUrl) && (
                <img 
                  src={selectedProject.thumbnailUrl || selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedProject.title}</h3>
                {selectedProject.category && (
                  <Badge style={{ background: colors.vibrantOrange, color: 'white' }}>
                    {selectedProject.category}
                  </Badge>
                )}
              </div>
              
              {selectedProject.description && (
                <p className="text-gray-600">{selectedProject.description}</p>
              )}
              
              {selectedProject.outcome && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-1">Outcome</h4>
                  <p className="text-green-700">{selectedProject.outcome}</p>
                </div>
              )}
              
              {selectedProject.impact && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-1">Impact</h4>
                  <p className="text-blue-700">{selectedProject.impact}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                {selectedProject.projectUrl || selectedProject.link ? (
                  <Button asChild style={{ background: colors.deepEmerald }}>
                    <a href={selectedProject.projectUrl || selectedProject.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Project
                    </a>
                  </Button>
                ) : null}
                
                <Button variant="outline" onClick={() => setContactOpen(true)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Book Similar Program
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-6 text-center">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${colors.energeticLime}, ${colors.vibrantOrange})` }}
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Book a Session</h3>
              <p className="text-gray-600 mt-2">Connect with {userInfo.name} to start your fitness journey</p>
            </div>
            
            <div className="space-y-3">
              {userInfo.email && (
                <Button 
                  className="w-full" 
                  style={{ background: colors.deepEmerald }}
                  asChild
                >
                  <a href={`mailto:${userInfo.email}?subject=Booking Request`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email: {userInfo.email}
                  </a>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" onClick={() => setContactOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
