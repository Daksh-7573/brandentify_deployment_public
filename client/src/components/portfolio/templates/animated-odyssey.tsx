import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useAnimation, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MapPin, 
  Mail, 
  Globe, 
  ArrowRight, 
  Download,
  MessageSquareText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorshipButton } from "@/components/shared/mentorship-button";

// Add custom styles for this template
import "@/styles/animated-odyssey.css";

interface AnimatedOdysseyProps {
  id?: number; // User ID for mentorship button (as mentorId)
  name: string;
  title: string;
  industry: string;
  domain: string;
  location: string;
  photoURL: string | null;
  skills: Array<{
    id: number;
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    proficiency: number;
  }>;
  projects: Array<{
    id: number;
    title: string;
    description: string | null;
    startDate: string;
    projectUrl: string | null;
    category: string | null;
    industry: string | null;
    thumbnailUrl: string | null;
    mediaUrls: string[];
  }>;
  experiences: Array<{
    id: number;
    title: string;
    company: string;
    location: string | null;
    industry: string | null;
    domain: string | null;
    startDate: string;
    endDate: string | null;
    description: string | null;
    keyResponsibilities?: string[];
  }>;
  educations: Array<{
    id: number;
    degree: string;
    institution: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    fieldOfStudy: string | null;
    industry: string | null;
    domain: string | null;
    skillsAcquired?: string[];
  }>;
  services: Array<{
    id: number;
    title: string;
    description: string | null;
    price: number | null;
    isHourly: boolean;
    category: string;
    features: string[];
  }>;
  lookingFor: string;
  email: string;
  aboutMe: string | null;
  whatIOffer: string | null;
  currentUserId?: number; // Current logged-in user ID for mentorship button
}

const AnimatedOdyssey: React.FC<AnimatedOdysseyProps> = ({
  id,
  name,
  title,
  industry,
  domain,
  location,
  photoURL,
  skills,
  projects,
  experiences,
  educations,
  services,
  lookingFor,
  email,
  aboutMe,
  whatIOffer,
  currentUserId,
}) => {
  // For debugging
  console.log("AnimatedOdyssey template - whatIOffer:", whatIOffer);
  console.log("AnimatedOdyssey template - aboutMe:", aboutMe);

  // Setup refs for scroll animations
  const targetRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const experiencesRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  
  // Setup InView hooks for each section
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.2 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.2 });
  const isServicesInView = useInView(servicesRef, { once: false, amount: 0.2 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.2 });
  const isExperiencesInView = useInView(experiencesRef, { once: false, amount: 0.2 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.2 });
  
  // Setup smooth scrolling animations
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  
  // Setup parallax effect for background
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  // Set up project modal state
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  
  // Get content for About Me section
  const aboutContent = whatIOffer || aboutMe || 
    `I'm a passionate professional with a focus on ${domain || 'innovation'} within the ${industry || 'creative'} industry.`;
  
  return (
    <div 
      ref={targetRef} 
      className="animated-odyssey-container"
      style={{
        backgroundPosition: `${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%`,
      }}
    >
      {/* Hero Section */}
      <section 
        id="hero" 
        ref={heroRef} 
        className="min-h-screen flex items-center justify-center relative"
      >
        <div className="cosmic-background">
          {/* Background particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="cosmic-particle"
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "mirror",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
              }}
            />
          ))}
        </div>
        
        <div className="container px-6 z-10 relative">
          <div className="hero-content text-center">
            <motion.div
              className="profile-orbit"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHeroInView ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              {/* Orbiting profile image */}
              <motion.div
                className="orbit-container"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <motion.div 
                  className="profile-image-container"
                  whileHover={{ scale: 1.1 }}
                >
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name} 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image profile-fallback">
                      {name.charAt(0)}
                    </div>
                  )}
                </motion.div>
              </motion.div>
              
              {/* Name and title */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-4 glowing-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  y: isHeroInView ? 0 : 20 
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {name}
              </motion.h1>
              
              <motion.h2 
                className="text-2xl md:text-3xl text-accent-foreground mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  y: isHeroInView ? 0 : 20 
                }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {title}
              </motion.h2>
              
              {/* Location, Industry, Domain */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  y: isHeroInView ? 0 : 20 
                }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {location && (
                  <motion.div 
                    className="flex items-center space-x-2 bg-background/20 backdrop-blur-md p-2 rounded-full"
                    whileHover={{ y: -5, scale: 1.05 }}
                  >
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>{location}</span>
                  </motion.div>
                )}
                
                {industry && (
                  <motion.div 
                    className="flex items-center space-x-2 bg-background/20 backdrop-blur-md p-2 rounded-full"
                    whileHover={{ y: -5, scale: 1.05 }}
                  >
                    <Globe className="h-5 w-5 text-accent" />
                    <span>{industry}</span>
                  </motion.div>
                )}
                
                {domain && (
                  <motion.div 
                    className="flex items-center space-x-2 bg-background/20 backdrop-blur-md p-2 rounded-full"
                    whileHover={{ y: -5, scale: 1.05 }}
                  >
                    <Sparkles className="h-5 w-5 text-accent" />
                    <span>{domain}</span>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Looking for badge */}
              {lookingFor && (
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isHeroInView ? 1 : 0, 
                    scale: isHeroInView ? 1 : 0.8 
                  }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <motion.div
                    className="inline-block"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "mirror"
                    }}
                  >
                    <Badge className="px-4 py-2 text-base bg-primary hover:bg-primary">
                      Looking for: {lookingFor.replace(/_/g, ' ')}
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
              
              {/* About content */}
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  y: isHeroInView ? 0 : 20 
                }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <p className="text-lg">{aboutContent}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="scroll-indicator"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <ArrowRight className="h-6 w-6 rotate-90" />
          <span>Scroll</span>
        </motion.div>
      </section>
      
      {/* Skills Section */}
      <section 
        id="skills" 
        ref={skillsRef} 
        className="min-h-screen flex items-center relative py-20"
      >
        <div className="container px-6 z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center glowing-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isSkillsInView ? 1 : 0, 
              y: isSkillsInView ? 0 : 20 
            }}
            transition={{ duration: 0.8 }}
          >
            What I'm Good At
          </motion.h2>
          
          <div className="skills-container">
            {skills.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    className="skill-bubble"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: isSkillsInView ? 1 : 0, 
                      scale: isSkillsInView ? 1 : 0.8 
                    }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <div className="skill-bubble-inner">
                      <div className="skill-content">
                        <h3 className="skill-name">{skill.name}</h3>
                        <div className="skill-level">
                          <motion.div 
                            className="skill-fill"
                            initial={{ height: "0%" }}
                            animate={{ 
                              height: isSkillsInView ? `${skill.proficiency || 70}%` : "0%" 
                            }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                          />
                        </div>
                        <div className="skill-percentage">
                          {skill.proficiency || 70}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSkillsInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-16 w-16 mx-auto text-accent opacity-60 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Skills Added Yet</h3>
                <p className="text-muted-foreground">Skills will be displayed here once added.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section 
        id="services" 
        ref={servicesRef} 
        className="min-h-screen flex items-center relative py-20"
      >
        <div className="container px-6 z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center glowing-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isServicesInView ? 1 : 0, 
              y: isServicesInView ? 0 : 20 
            }}
            transition={{ duration: 0.8 }}
          >
            What I Offer
          </motion.h2>
          
          {services.length > 0 ? (
            <div className="services-carousel">
              <div className="services-track">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    className="service-card"
                    initial={{ opacity: 0, y: 50, rotateY: 30 }}
                    animate={{ 
                      opacity: isServicesInView ? 1 : 0,
                      y: isServicesInView ? 0 : 50,
                      rotateY: isServicesInView ? 0 : 30
                    }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    whileHover={{ 
                      y: -10, 
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    }}
                  >
                    <h3 className="service-title">{service.title}</h3>
                    
                    {service.description && (
                      <p className="service-description">{service.description}</p>
                    )}
                    
                    {service.price !== null && (
                      <motion.div 
                        className="service-price"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            "0 0 0 rgba(144, 85, 253, 0.4)",
                            "0 0 20px rgba(144, 85, 253, 0.6)",
                            "0 0 0 rgba(144, 85, 253, 0.4)"
                          ]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      >
                        <span className="price-value">
                          {service.price ? `₹${service.price.toLocaleString()}` : 'Price on request'}
                        </span>
                        {service.isHourly && <span className="price-hour">/hour</span>}
                      </motion.div>
                    )}
                    
                    {service.features.length > 0 && (
                      <ul className="service-features">
                        {service.features.map((feature, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: isServicesInView ? 1 : 0,
                              x: isServicesInView ? 0 : -20
                            }}
                            transition={{ duration: 0.5, delay: 0.5 + (i * 0.1) }}
                          >
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isServicesInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto text-accent opacity-60 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Services Added Yet</h3>
              <p className="text-muted-foreground">Services will be displayed here once added.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Projects Section */}
      <section 
        id="projects" 
        ref={projectsRef} 
        className="min-h-screen flex items-center relative py-20"
      >
        <div className="container px-6 z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center glowing-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isProjectsInView ? 1 : 0, 
              y: isProjectsInView ? 0 : 20 
            }}
            transition={{ duration: 0.8 }}
          >
            Project Showcase
          </motion.h2>
          
          {projects.length > 0 ? (
            <div className="project-grid">
              {projects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  style={{
                    backgroundImage: project.thumbnailUrl 
                      ? `url(${project.thumbnailUrl})` 
                      : 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isProjectsInView ? 1 : 0,
                    scale: isProjectsInView ? 1 : 0.8
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="project-overlay">
                    <h3 className="project-title">{project.title}</h3>
                    {project.startDate && (
                      <div className="project-date">
                        {new Date(project.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isProjectsInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto text-accent opacity-60 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Projects Added Yet</h3>
              <p className="text-muted-foreground">Projects will be displayed here once added.</p>
            </motion.div>
          )}
          
          {/* Project Modal */}
          {selectedProject && (
            <motion.div 
              className="project-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            >
              <motion.div 
                className="project-modal"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setSelectedProject(null)}>×</button>
                
                <div className="modal-content">
                  <h2 className="modal-title">{selectedProject.title}</h2>
                  
                  {selectedProject.description && (
                    <p className="modal-description">{selectedProject.description}</p>
                  )}
                  
                  {selectedProject.mediaUrls.length > 0 && (
                    <div className="modal-gallery">
                      {selectedProject.mediaUrls.map((url, index) => (
                        <div key={index} className="gallery-item">
                          <img src={url} alt={`${selectedProject.title} - ${index}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="modal-meta">
                    {selectedProject.startDate && (
                      <div className="meta-item">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">
                          {new Date(selectedProject.startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {selectedProject.category && (
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{selectedProject.category}</span>
                      </div>
                    )}
                    
                    {selectedProject.industry && (
                      <div className="meta-item">
                        <span className="meta-label">Industry:</span>
                        <span className="meta-value">{selectedProject.industry}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedProject.projectUrl && (
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-link"
                    >
                      Visit Project <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Experiences Section */}
      <section 
        id="experiences" 
        ref={experiencesRef} 
        className="min-h-screen flex items-center relative py-20"
      >
        <div className="container px-6 z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center glowing-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isExperiencesInView ? 1 : 0, 
              y: isExperiencesInView ? 0 : 20 
            }}
            transition={{ duration: 0.8 }}
          >
            Career Path
          </motion.h2>
          
          {experiences.length > 0 ? (
            <div className="timeline-container">
              {/* Vertical timeline line */}
              <motion.div 
                className="timeline-line"
                initial={{ height: 0 }}
                animate={{ height: isExperiencesInView ? "100%" : 0 }}
                transition={{ duration: 1.5 }}
              />
              
              {experiences.map((experience, index) => (
                <motion.div 
                  key={experience.id}
                  className="timeline-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ 
                    opacity: isExperiencesInView ? 1 : 0,
                    x: isExperiencesInView ? 0 : (index % 2 === 0 ? -50 : 50)
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <motion.div
                    className="timeline-dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: isExperiencesInView ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <motion.div 
                      className="timeline-dot-pulse"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 0.2, 0.7]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    />
                  </motion.div>
                  
                  <div className="timeline-date">
                    <motion.div 
                      animate={{ 
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: index * 0.2
                      }}
                    >
                      {new Date(experience.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })} - {' '}
                      {experience.endDate 
                        ? new Date(experience.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })
                        : 'Present'}
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="timeline-card"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    <h3 className="timeline-title">{experience.title}</h3>
                    <h4 className="timeline-company">{experience.company}</h4>
                    
                    {experience.description && (
                      <p className="timeline-description">{experience.description}</p>
                    )}
                    
                    {experience.keyResponsibilities && experience.keyResponsibilities.length > 0 && (
                      <div className="timeline-responsibilities">
                        <h5 className="responsibilities-title">Key Responsibilities:</h5>
                        <ul className="responsibilities-list">
                          {experience.keyResponsibilities.map((responsibility, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ 
                                opacity: isExperiencesInView ? 1 : 0,
                                x: isExperiencesInView ? 0 : -20
                              }}
                              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 + i * 0.05 }}
                            >
                              {responsibility}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="timeline-meta">
                      {experience.location && (
                        <div className="meta-location">
                          <MapPin className="h-4 w-4" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                      
                      <div className="timeline-tags">
                        {experience.industry && (
                          <Badge className="timeline-tag">{experience.industry}</Badge>
                        )}
                        {experience.domain && (
                          <Badge className="timeline-tag">{experience.domain}</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isExperiencesInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto text-accent opacity-60 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Experience Entries Yet</h3>
              <p className="text-muted-foreground">Career timeline will be displayed here once experience is added.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Education Section */}
      <section 
        id="education" 
        ref={educationRef} 
        className="min-h-screen flex items-center relative py-20"
      >
        <div className="container px-6 z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center glowing-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isEducationInView ? 1 : 0, 
              y: isEducationInView ? 0 : 20 
            }}
            transition={{ duration: 0.8 }}
          >
            Academic Background
          </motion.h2>
          
          {educations.length > 0 ? (
            <div className="education-container">
              {educations.map((education, index) => (
                <motion.div 
                  key={education.id}
                  className="education-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: isEducationInView ? 1 : 0,
                    y: isEducationInView ? 0 : 50
                  }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="education-icon">
                    <motion.div 
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: index * 0.2
                      }}
                    >
                      {/* Academic icon */}
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="education-svg">
                        <path d="M12 4L2 9.5L12 15L22 9.5L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 13V17.5L12 21L5 17.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 14V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="education-content"
                    initial={{ rotateX: 90 }}
                    animate={{ rotateX: isEducationInView ? 0 : 90 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  >
                    <h3 className="education-degree">{education.degree}</h3>
                    <h4 className="education-institution">{education.institution}</h4>
                    
                    <div className="education-period">
                      {new Date(education.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })} - {' '}
                      {education.endDate 
                        ? new Date(education.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })
                        : 'Present'}
                    </div>
                    
                    <div className="education-details">
                      {education.location && (
                        <div className="education-location">
                          <MapPin className="h-4 w-4" />
                          <span>{education.location}</span>
                        </div>
                      )}
                      
                      {education.fieldOfStudy && (
                        <div className="education-field">
                          <span className="field-label">Field of Study:</span>
                          <span className="field-value">{education.fieldOfStudy}</span>
                        </div>
                      )}
                      
                      <div className="education-tags">
                        {education.industry && (
                          <Badge className="education-tag">{education.industry}</Badge>
                        )}
                        {education.domain && (
                          <Badge className="education-tag">{education.domain}</Badge>
                        )}
                      </div>
                    </div>
                    
                    {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                      <div className="skills-acquired">
                        <h5 className="skills-title">Skills Acquired:</h5>
                        <div className="skills-badges">
                          {education.skillsAcquired.map((skill, i) => (
                            <motion.div 
                              key={i}
                              className="skill-badge-wrapper"
                              initial={{ opacity: 0, scale: 0, y: 20 }}
                              animate={{ 
                                opacity: isEducationInView ? 1 : 0,
                                scale: isEducationInView ? 1 : 0,
                                y: isEducationInView ? 0 : 20
                              }}
                              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 + i * 0.05 }}
                            >
                              <Badge className="skill-badge">{skill}</Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: isEducationInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto text-accent opacity-60 mb-4" />
              <h3 className="text-xl font-bold mb-2">No Education Entries Yet</h3>
              <p className="text-muted-foreground">Academic background will be displayed here once education is added.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Sticky CTA Footer */}
      <motion.div 
        className="sticky-cta"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <div className="container">
          <div className="cta-content">
            <a href={`mailto:${email}`} className="cta-button cta-primary">
              <MessageSquareText className="h-5 w-5 mr-2" />
              Let's Talk
            </a>
            {/* For download resume feature: */}
            <button className="cta-button cta-secondary">
              <Download className="h-5 w-5 mr-2" />
              Get My Resume
            </button>
            
            {/* Mentorship Button - only shown when viewing someone else's profile */}
            {id && currentUserId && id !== currentUserId && (
              <MentorshipButton
                userId={currentUserId}
                mentorId={id}
                className="cta-button cta-primary"
                buttonText="Request Mentorship"
                showIcon={true}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedOdyssey;