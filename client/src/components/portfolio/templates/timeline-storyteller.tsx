import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useEffect, useState, useRef } from "react";
import { 
  Calendar, 
  MapPin, 
  Mail, 
  Linkedin, 
  Instagram, 
  Code, 
  ChevronRight, 
  BriefcaseBusiness, 
  BookOpen, 
  Wallet, 
  ExternalLink, 
  User, 
  Clock, 
  Radio, 
  Volume2, 
  VolumeX, 
  MessagesSquare, 
  Github, 
  CheckCircle, 
  LucideIcon
} from "lucide-react";

interface TimelineStorytellerProps {
  userInfo: {
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
}

// For skill icons
const skillIconMap: Record<string, LucideIcon> = {
  default: CheckCircle
};

export default function TimelineStoryteller({ 
  userInfo, 
  userSkills, 
  userExperiences, 
  userProjects,
  userEducations = [],
  userServices = []
}: TimelineStorytellerProps) {
  // State for audio narration feature
  const [isNarrating, setIsNarrating] = useState(false);
  
  // State for chapter navigation
  const [activeChapter, setActiveChapter] = useState("intro");
  const chapterRefs = {
    intro: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    services: useRef<HTMLDivElement>(null),
    showcase: useRef<HTMLDivElement>(null),
    career: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null)
  };
  
  // Sort skills by proficiency
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort projects by date
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  
  // Sort services
  const sortedServices = [...userServices];
  
  // Helper for formatting dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };
  
  // Scroll to chapter
  const scrollToChapter = (chapter: keyof typeof chapterRefs) => {
    setActiveChapter(chapter);
    if (chapterRefs[chapter]?.current) {
      chapterRefs[chapter]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Toggle narration
  const toggleNarration = () => {
    setIsNarrating(!isNarrating);
    // This would connect to a real audio system in a full implementation
  };
  
  // Auto-scroll story view
  const viewMyStory = () => {
    // Set a delay between each scroll
    const chapters = Object.keys(chapterRefs) as Array<keyof typeof chapterRefs>;
    chapters.forEach((chapter, index) => {
      setTimeout(() => {
        scrollToChapter(chapter);
      }, index * 2000); // 2 second intervals between chapters
    });
  };
  
  // Initialize animations and scroll tracking
  useEffect(() => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      /* Timeline Storyteller Animations */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes glowPulse {
        0% { box-shadow: 0 0 0 0 rgba(144, 202, 249, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(144, 202, 249, 0); }
        100% { box-shadow: 0 0 0 0 rgba(144, 202, 249, 0); }
      }
      
      @keyframes pathAnimation {
        0% { stroke-dashoffset: 1000; }
        100% { stroke-dashoffset: 0; }
      }
      
      .timeline-storyteller-template .animate-fade-in {
        opacity: 0;
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-fade-in-left {
        opacity: 0;
        animation: fadeInLeft 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-fade-in-right {
        opacity: 0;
        animation: fadeInRight 0.8s ease-out forwards;
      }
      
      .timeline-storyteller-template .animate-typewriter {
        overflow: hidden;
        white-space: nowrap;
        display: inline-block;
        animation: typewriter 2.5s steps(40, end) forwards;
      }
      
      .timeline-storyteller-template .timeline-dot {
        animation: glowPulse 2s infinite;
      }
      
      .timeline-storyteller-template .timeline-path {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: pathAnimation 5s ease-out forwards;
      }
      
      /* Staggered animations */
      .timeline-storyteller-template .animate-fade-in:nth-child(1) { animation-delay: 0.1s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(2) { animation-delay: 0.3s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(3) { animation-delay: 0.5s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(4) { animation-delay: 0.7s; }
      .timeline-storyteller-template .animate-fade-in:nth-child(5) { animation-delay: 0.9s; }
      
      /* Horizontal scrolling skill path */
      .timeline-storyteller-template .skill-path {
        overflow-x: auto;
        white-space: nowrap;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      
      .timeline-storyteller-template .skill-path::-webkit-scrollbar {
        display: none;
      }
      
      /* Chapter progress */
      .timeline-storyteller-template .chapter-nav {
        position: fixed;
        top: 50%;
        transform: translateY(-50%);
        right: 20px;
        z-index: 50;
      }
      
      .timeline-storyteller-template .chapter-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #e0e0e0;
        margin: 8px 0;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .timeline-storyteller-template .chapter-indicator.active {
        background-color: #5186EC;
        transform: scale(1.3);
      }
      
      .timeline-storyteller-template .progress-line {
        position: absolute;
        width: 2px;
        background-color: #5186EC;
        left: 50%;
        transform: translateX(-50%);
        transition: height 0.3s ease;
      }
      
      /* Service cards */
      .timeline-storyteller-template .service-card {
        transform-style: preserve-3d;
        transition: transform 0.6s;
      }
      
      .timeline-storyteller-template .service-card:hover {
        transform: rotateY(10deg);
      }
      
      /* Tooltip */
      .timeline-storyteller-template .skill-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
        white-space: normal;
        width: 200px;
        text-align: center;
      }
      
      .timeline-storyteller-template .skill-item:hover .skill-tooltip {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    // Intersection observer for chapter detection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find the id of the intersecting chapter
          const id = entry.target.id.replace('chapter-', '');
          if (id && Object.keys(chapterRefs).includes(id)) {
            setActiveChapter(id as keyof typeof chapterRefs);
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Observe all chapter sections
    Object.keys(chapterRefs).forEach(key => {
      const element = chapterRefs[key as keyof typeof chapterRefs].current;
      if (element) observer.observe(element);
    });
    
    return () => {
      document.head.removeChild(style);
      Object.keys(chapterRefs).forEach(key => {
        const element = chapterRefs[key as keyof typeof chapterRefs].current;
        if (element) observer.unobserve(element);
      });
    };
  }, []);
  
  return (
    <div className="timeline-storyteller-template overflow-x-hidden font-sans" style={{ background: "#FAFAFA" }}>
      {/* Chapter navigation dots */}
      <div className="chapter-nav hidden lg:block">
        <div className="relative flex flex-col items-center h-52">
          <div className="progress-line" style={{ height: `${Object.keys(chapterRefs).indexOf(activeChapter) * 100 / (Object.keys(chapterRefs).length - 1)}%` }}></div>
          {Object.keys(chapterRefs).map((chapter, index) => (
            <div 
              key={chapter}
              className={`chapter-indicator ${activeChapter === chapter ? 'active' : ''}`}
              onClick={() => scrollToChapter(chapter as keyof typeof chapterRefs)}
              title={chapter.charAt(0).toUpperCase() + chapter.slice(1)}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Story control buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <Button 
          onClick={toggleNarration} 
          size="icon" 
          variant="outline" 
          className="rounded-full shadow-md"
        >
          {isNarrating ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button 
          onClick={viewMyStory} 
          variant="outline" 
          className="rounded-full shadow-md flex items-center gap-1 px-3"
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs">View My Story</span>
        </Button>
      </div>
      
      {/* Hero section with typewriter effect */}
      <section 
        id="chapter-intro"
        ref={chapterRefs.intro}
        className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-indigo-500 to-violet-600 text-white relative overflow-hidden px-8"
      >
        <div className="mx-auto max-w-4xl z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in">
            {/* Profile photo with glow effect */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg timeline-dot">
                <ProfileImage
                  src={userInfo.photoURL}
                  alt={userInfo.name || "User profile"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-indigo-400 blur-xl opacity-30"></div>
            </div>
            
            <div className="text-center md:text-left">
              {/* "I am" statement with typewriter effect */}
              <div className="overflow-hidden mb-3">
                <span className="text-indigo-200 text-lg">I am</span>
                <h1 className="text-4xl md:text-5xl font-bold animate-typewriter">
                  {userInfo.title || "a Professional"}
                </h1>
              </div>
              
              {/* Name */}
              <h2 className="text-2xl font-medium">{userInfo.name}</h2>
              
              {/* Location tag */}
              <div className="flex items-center justify-center md:justify-start mt-2">
                <MapPin className="h-4 w-4 text-indigo-200 mr-1" />
                <span className="text-indigo-100">{userInfo.location || "Location"}</span>
              </div>
              
              {/* Industry/Domain chips */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {userInfo.industry && (
                  <Badge className="bg-indigo-700/50 text-white hover:bg-indigo-700/70 py-1.5 px-3">
                    {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge className="bg-fuchsia-700/50 text-white hover:bg-fuchsia-700/70 py-1.5 px-3">
                    {userInfo.domain}
                  </Badge>
                )}
              </div>
              
              {/* Looking for tag */}
              {userInfo.lookingFor && (
                <div className="mt-6 animate-fade-in">
                  <Badge className="bg-gradient-to-r from-amber-500 to-pink-500 text-white hover:from-amber-600 hover:to-pink-600 py-2 px-4">
                    Looking for {userInfo.lookingFor}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <span className="text-indigo-200 text-sm mb-2">Scroll to continue</span>
            <ChevronRight className="h-6 w-6 text-white transform rotate-90" />
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-indigo-300 opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-violet-300 opacity-20 blur-xl"></div>
      </section>
      
      {/* What I'm All About section */}
      <section 
        id="chapter-about" 
        ref={chapterRefs.about}
        className="py-24 px-8 bg-gradient-to-b from-white to-indigo-50"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              Chapter 1: Why I Do What I Do
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">What I'm All About</h2>
          </div>
          
          {/* Personal mission block */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-indigo-100 relative overflow-hidden animate-fade-in">
            {/* Quote style format */}
            <div className="text-7xl text-indigo-200 absolute top-4 left-4 font-serif">"</div>
            <div className="relative z-10">
              <p className="text-xl text-gray-700 leading-relaxed font-serif pl-8">
                {userInfo.lookingFor || 
                `As a ${userInfo.title || "professional"} in the ${userInfo.industry || "industry"}, 
                I'm passionate about creating solutions that make a real difference. My approach combines 
                creativity with technical expertise to deliver exceptional results.`
                }
              </p>
              <div className="text-7xl text-indigo-200 absolute bottom-0 right-4 font-serif">"</div>
            </div>
            
            {/* Optional audio icon */}
            <button 
              className="mt-6 flex items-center text-indigo-600 font-medium hover:text-indigo-800"
              onClick={() => toggleNarration()}
            >
              {isNarrating ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
              {isNarrating ? "Mute narration" : "Listen to narration"}
            </button>
          </div>
        </div>
      </section>
      
      {/* What I'm Good At (Skills) */}
      <section 
        id="chapter-skills" 
        ref={chapterRefs.skills}
        className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-white"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              Chapter 2: My Expertise
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">What I'm Good At</h2>
          </div>
          
          {/* Horizontally scrolling skill path with timeline markers */}
          <div className="relative mt-12 animate-fade-in">
            {/* Timeline path */}
            <div className="absolute h-2 bg-indigo-100 left-0 right-0 top-14 z-0 rounded-full">
              <div className="h-full bg-gradient-to-r from-indigo-300 to-indigo-600 timeline-path rounded-full" style={{ width: sortedSkills.length ? "100%" : "0%" }}></div>
            </div>
            
            {/* Skills */}
            <div className="skill-path py-8 relative z-10">
              {sortedSkills.length > 0 ? (
                <div className="inline-flex gap-8 px-4 min-w-full">
                  {sortedSkills.map((skill, index) => {
                    const IconComponent = skillIconMap[skill.name.toLowerCase()] || skillIconMap.default;
                    return (
                      <div key={skill.id} className="skill-item relative">
                        {/* Timeline dot */}
                        <div className="absolute bottom-full mb-6 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow-md timeline-dot">
                        </div>
                        
                        {/* Skill card */}
                        <div className="w-40 bg-white rounded-lg shadow-md p-4 border border-indigo-100 hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-indigo-600" />
                          </div>
                          <h3 className="text-center font-medium text-gray-800">{skill.name}</h3>
                          
                          {/* Progress bar */}
                          <div className="h-2 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${skill.proficiency || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-2">{skill.level || `${skill.proficiency || 0}%`}</p>
                          
                          {/* Tooltip */}
                          <div className="skill-tooltip">
                            Used in various projects and professional settings, with {Math.round((skill.proficiency || 0) / 10)} years of experience
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Empty state
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-400" />
                  </div>
                  <p className="text-gray-500">Your skills will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* What I Offer (Services) */}
      {sortedServices.length > 0 || true ? (
        <section 
          id="chapter-services" 
          ref={chapterRefs.services}
          className="py-24 px-8 bg-gradient-to-b from-white to-indigo-50"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-12">
              <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
                Chapter 3: How I Can Help
              </div>
              <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">What I Offer</h2>
            </div>
            
            {/* Service cards */}
            {sortedServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {sortedServices.map((service) => (
                  <div key={service.id} className="service-card bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                    <div className="h-3 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                      
                      {service.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        {(service.priceUsd || service.priceInr) && (
                          <div className="text-indigo-600 font-medium">
                            {service.priceUsd && `$${service.priceUsd}`}
                            {service.priceUsd && service.priceInr && ' / '}
                            {service.priceInr && `₹${service.priceInr}`}
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          Book Slot
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="bg-white rounded-lg shadow-md p-8 text-center animate-fade-in">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-indigo-300" />
                <p className="text-gray-500">Services will appear here</p>
              </div>
            )}
          </div>
        </section>
      ) : null}
      
      {/* Showcase (Projects) */}
      <section 
        id="chapter-showcase" 
        ref={chapterRefs.showcase}
        className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-white"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              Chapter 4: My Work
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Showcase</h2>
          </div>
          
          {/* Projects as milestones on timeline */}
          <div className="relative">
            {/* Main timeline */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-100 z-0"></div>
            
            {sortedProjects.length > 0 ? (
              <div className="space-y-12">
                {sortedProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`relative flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 animate-fade-in`}
                  >
                    {/* Timeline node */}
                    <div className={`
                      absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-violet-500 border-4 border-white
                      transform md:translate-x-[-50%] timeline-dot z-10
                    `}></div>
                    
                    {/* Date marker */}
                    <div className="absolute left-14 md:left-1/2 top-5 text-sm text-gray-500 md:transform md:translate-x-[-50%] md:mt-8">
                      {formatDate(project.startDate)}
                    </div>
                    
                    {/* Project card - alternating sides */}
                    <div className={`
                      w-full md:w-5/12 ml-12 md:ml-0 
                      ${index % 2 === 0 ? 'md:text-right md:mr-auto' : 'md:text-left md:ml-auto'}
                    `}>
                      <div className="bg-white rounded-lg shadow-md p-6 border border-indigo-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                        
                        {/* Tags */}
                        <div className={`flex flex-wrap gap-2 mb-3 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                          {project.category && (
                            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                              #{project.category}
                            </Badge>
                          )}
                        </div>
                        
                        {project.description && (
                          <p className="text-gray-600 mb-4">{project.description}</p>
                        )}
                        
                        {/* Project URL */}
                        {project.projectUrl && (
                          <div className={`flex ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                            <a 
                              href={project.projectUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                            >
                              View Project <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="ml-12 md:ml-0 md:mx-auto md:w-6/12 bg-white rounded-lg shadow-md p-8 text-center animate-fade-in">
                <div className="absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-violet-300 border-4 border-white transform md:translate-x-[-50%] timeline-dot z-10"></div>
                <p className="text-gray-500">Your showcase projects will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Career Path (Experience) */}
      <section 
        id="chapter-career" 
        ref={chapterRefs.career}
        className="py-24 px-8 bg-gradient-to-b from-white to-indigo-50"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              Chapter 5: My Journey
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Career Path</h2>
          </div>
          
          {/* Vertical timeline with experience cards */}
          <div className="relative pl-8 md:pl-0">
            {/* Main timeline spine */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-200 md:transform md:translate-x-[-50%] z-0"></div>
            
            {sortedExperiences.length > 0 ? (
              <div className="space-y-12">
                {sortedExperiences.map((exp, index) => (
                  <div 
                    key={exp.id} 
                    className={`relative flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 animate-fade-in`}
                  >
                    {/* Timeline dot */}
                    <div className={`
                      absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white
                      transform md:translate-x-[-50%] timeline-dot z-10
                    `}></div>
                    
                    {/* Experience card - alternating sides */}
                    <div className={`
                      w-full md:w-5/12 ml-8 md:ml-0 
                      ${index % 2 === 0 ? 'md:text-right md:mr-auto' : 'md:text-left md:ml-auto'}
                    `}>
                      <div className="bg-white rounded-lg shadow-md p-6 border border-indigo-100 hover:shadow-lg transition-shadow duration-300">
                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                          <h3 className="text-xl font-bold text-gray-800">{exp.title}</h3>
                          <p className="text-indigo-600 font-medium">{exp.company}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}</span>
                          </div>
                          
                          {exp.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Key responsibilities/achievements */}
                        {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 ? (
                          <div className={`mt-4 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Achievements:</h4>
                            <ul className={`space-y-1 text-sm text-gray-600 ${index % 2 === 0 ? 'md:list-inside' : ''}`}>
                              {exp.keyResponsibilities.slice(0, 3).map((item, i) => (
                                <li key={i} className={`flex items-start ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                  <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0 mr-2" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : exp.description ? (
                          <p className="mt-3 text-gray-600 text-sm">{exp.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="ml-8 md:ml-0 md:mx-auto md:w-6/12 bg-white rounded-lg shadow-md p-8 text-center">
                <div className="absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-indigo-300 border-4 border-white transform md:translate-x-[-50%] timeline-dot z-10"></div>
                <p className="text-gray-500">Your career experience will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Academic Background */}
      <section 
        id="chapter-education" 
        ref={chapterRefs.education}
        className="py-24 px-8 bg-gradient-to-b from-indigo-50 to-white"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="inline-block bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 text-sm font-medium mb-3 animate-fade-in">
              Chapter 6: Early Chapters
            </div>
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">Academic Background</h2>
          </div>
          
          {/* Academic timeline - styled similarly to career path */}
          <div className="relative pl-8 md:pl-0">
            {/* Main timeline spine */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-violet-200 md:transform md:translate-x-[-50%] z-0"></div>
            
            {sortedEducations.length > 0 ? (
              <div className="space-y-12">
                {sortedEducations.map((edu, index) => (
                  <div 
                    key={edu.id} 
                    className={`relative flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 animate-fade-in`}
                  >
                    {/* Timeline dot */}
                    <div className={`
                      absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-violet-500 border-4 border-white
                      transform md:translate-x-[-50%] timeline-dot z-10
                    `}></div>
                    
                    {/* Education card - alternating sides */}
                    <div className={`
                      w-full md:w-5/12 ml-8 md:ml-0 
                      ${index % 2 === 0 ? 'md:text-right md:mr-auto' : 'md:text-left md:ml-auto'}
                    `}>
                      <div className="bg-white rounded-lg shadow-md p-6 border border-violet-100 hover:shadow-lg transition-shadow duration-300">
                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                          <h3 className="text-xl font-bold text-gray-800">{edu.degree}</h3>
                          <p className="text-violet-600 font-medium">{edu.institution}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(edu.startDate)} - {edu.currentlyEnrolled ? 'Present' : formatDate(edu.endDate || '')}
                            </span>
                          </div>
                          
                          {edu.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Field of study and achievements */}
                        <div className={`mt-4 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                          {edu.industry && (
                            <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 mb-2">
                              {edu.industry}
                            </Badge>
                          )}
                          
                          {/* Skills acquired */}
                          {edu.skillsAcquired && edu.skillsAcquired.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills & Achievements:</h4>
                              <ul className={`space-y-1 text-sm text-gray-600 ${index % 2 === 0 ? 'md:list-inside' : ''}`}>
                                {edu.skillsAcquired.slice(0, 3).map((skill, i) => (
                                  <li key={i} className={`flex items-start ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                    <CheckCircle className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0 mr-2" />
                                    <span>{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="ml-8 md:ml-0 md:mx-auto md:w-6/12 bg-white rounded-lg shadow-md p-8 text-center">
                <div className="absolute left-4 md:left-1/2 top-6 w-6 h-6 rounded-full bg-violet-300 border-4 border-white transform md:translate-x-[-50%] timeline-dot z-10"></div>
                <p className="text-gray-500">Your academic background will appear here</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer with contact options */}
      <section className="py-16 px-8 bg-indigo-900 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-3">Get in Touch</h2>
              <p className="text-indigo-200 mb-6">Let's connect and create something amazing together</p>
              
              <div className="flex gap-4">
                {userInfo.email && (
                  <a 
                    href={`mailto:${userInfo.email}`} 
                    className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                >
                  <MessagesSquare className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0">
              <Button 
                onClick={() => scrollToChapter('intro')}
                className="bg-white text-indigo-900 hover:bg-indigo-100 flex items-center gap-2"
              >
                Back to Top
                <ChevronRight className="h-4 w-4 rotate-270 transform -rotate-90" />
              </Button>
            </div>
          </div>
          
          <div className="mt-12 text-center text-indigo-300 text-sm">
            <p>© {new Date().getFullYear()} {userInfo.name} • Made with Brandentifier</p>
          </div>
        </div>
      </section>
    </div>
  );
}