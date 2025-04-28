import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, CalendarDays, ExternalLink, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skill, WorkExperience, Education, Service } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Custom styles for this template
import '@/styles/animated-odyssey.css';

interface AnimatedOdysseyProps {
  name: string;
  title: string;
  industry: string;
  domain: string;
  location: string;
  photoURL: string | null;
  skills: Skill[];
  projects: any[];
  experiences: WorkExperience[];
  educations: Education[];
  services: Service[];
  lookingFor: string;
  email: string;
  aboutMe: string | null;
  whatIOffer: string | null;
}

const AnimatedOdyssey: React.FC<AnimatedOdysseyProps> = ({
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
  whatIOffer
}) => {
  // Refs for sections to track when they come into view
  const heroRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  
  // Check if sections are in view
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const isSkillsInView = useInView(skillsRef, { once: false, amount: 0.3 });
  const isServicesInView = useInView(servicesRef, { once: false, amount: 0.3 });
  const isProjectsInView = useInView(projectsRef, { once: false, amount: 0.3 });
  const isTimelineInView = useInView(timelineRef, { once: false, amount: 0.3 });
  const isEducationInView = useInView(educationRef, { once: false, amount: 0.3 });
  
  // Parallax effect for background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // State to track carousel index for services
  const [serviceIndex, setServiceIndex] = useState(0);
  
  // Handle mouse movement for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const xPos = clientX / innerWidth;
    const yPos = clientY / innerHeight;
    
    mouseX.set(xPos);
    mouseY.set(yPos);
  };
  
  // Spring animation for smooth parallax
  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });
  
  // Transform for parallax effects
  const moveBgX = useTransform(springX, [0, 1], ['-5%', '5%']);
  const moveBgY = useTransform(springY, [0, 1], ['-5%', '5%']);
  
  // Auto advance services carousel
  useEffect(() => {
    if (services.length <= 1) return;
    
    const interval = setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % services.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [services.length]);
  
  // Content for the "What I'm All About" section
  const contentInfo = whatIOffer || aboutMe || `I am a passionate professional with a focus on ${domain || 'innovation'} within the ${industry || 'creative'} industry. My work combines expertise and strategic thinking to create impactful results and drive meaningful outcomes.`;
  
  return (
    <div 
      className="animated-odyssey bg-space-background min-h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animation BG Layer */}
      <motion.div 
        className="animation-bg-layer"
        style={{ 
          x: moveBgX,
          y: moveBgY,
          background: 'radial-gradient(circle at center, rgba(25, 25, 70, 0.4) 0%, rgba(10, 10, 30, 0.1) 70%)'
        }}
      />
      
      {/* Star particles */}
      <div className="stars-container">
        <div className="stars stars-small"></div>
        <div className="stars stars-medium"></div>
        <div className="stars stars-large"></div>
      </div>
      
      {/* Hero Section */}
      <section id="hero" className="hero-section min-h-screen flex items-center justify-center relative overflow-hidden" ref={heroRef}>
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Profile Photo Orbital Animation */}
            <div className="relative profile-orbit">
              <motion.div
                className="absolute"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <motion.div 
                  className="profile-photo-container"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHeroInView ? 1 : 0, 
                    opacity: isHeroInView ? 1 : 0 
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt={name} 
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo profile-placeholder">
                      <span>{name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="profile-glow"></div>
                </motion.div>
              </motion.div>
              
              {/* Glowing Name */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold glowing-text mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  y: isHeroInView ? 0 : 20 
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {name}
              </motion.h1>
            </div>
            
            {/* Title with animated appearance */}
            <motion.h2 
              className="text-2xl md:text-3xl text-gradient-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {title}
            </motion.h2>
            
            {/* Industry & Domain */}
            <motion.div 
              className="flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {industry && (
                <Badge className="badge-glow-primary text-md py-2 px-4">
                  {industry}
                </Badge>
              )}
              {domain && (
                <Badge className="badge-glow-secondary text-md py-2 px-4">
                  {domain}
                </Badge>
              )}
            </motion.div>
            
            {/* Location */}
            <motion.div 
              className="flex items-center text-md text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <MapPin className="h-5 w-5 mr-2 text-neon-blue" />
              {location}
            </motion.div>
            
            {/* Looking For - with pulse animation */}
            {lookingFor && (
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isHeroInView ? 1 : 0, 
                  scale: isHeroInView ? 1 : 0.8 
                }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <motion.div
                  className="looking-for-badge"
                  animate={{ boxShadow: ['0 0 10px #4f46e5', '0 0 20px #4f46e5', '0 0 10px #4f46e5'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {lookingFor.replace(/_/g, ' ')}
                </motion.div>
              </motion.div>
            )}
            
            {/* Content Info */}
            <motion.div 
              className="mt-8 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <p className="text-lg text-slate-300 leading-relaxed">
                {contentInfo}
              </p>
            </motion.div>
            
            {/* Contact Button */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isHeroInView ? 1 : 0, 
                y: isHeroInView ? 0 : 20 
              }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href={`mailto:${email}`} className="glowing-button">
                Connect with Me
              </a>
            </motion.div>
            
            {/* Mouse Scroll Indicator */}
            <motion.div 
              className="mouse-scroll-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <div className="mouse">
                <div className="mouse-wheel"></div>
              </div>
              <div className="scroll-arrow">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section id="skills" className="skills-section py-20 relative z-10" ref={skillsRef}>
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isSkillsInView ? 1 : 0, 
              y: isSkillsInView ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
          >
            What I'm Good At
          </motion.h2>
          
          <div className="skills-grid">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <motion.div 
                  key={skill.id || index}
                  className="skill-bubble"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: isSkillsInView ? 1 : 0, 
                    scale: isSkillsInView ? 1 : 0 
                  }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.6)' }}
                >
                  <div className="skill-bubble-inner">
                    <div className="skill-name">{skill.name}</div>
                    <div 
                      className="skill-fill" 
                      style={{ 
                        height: `${(skill.level === 'Beginner' ? 30 : skill.level === 'Intermediate' ? 65 : 90)}%`,
                        background: `linear-gradient(to top, 
                          rgba(79, 70, 229, 0.8) 0%, 
                          rgba(124, 58, 237, 0.8) 70%, 
                          rgba(167, 139, 250, 0.8) 100%)`
                      }}
                    ></div>
                    <div className="skill-percentage">
                      {skill.level === 'Beginner' ? '30%' : skill.level === 'Intermediate' ? '65%' : '90%'}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="text-center text-slate-400 py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSkillsInView ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-neon-blue opacity-60" />
                <h3 className="text-xl font-semibold mb-2">Skills Showcase Coming Soon</h3>
                <p>My professional skills will appear here soon.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="services-section py-20 relative z-10" ref={servicesRef}>
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isServicesInView ? 1 : 0, 
              y: isServicesInView ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
          >
            What I Offer
          </motion.h2>
          
          {services && services.length > 0 ? (
            <div className="services-carousel-container">
              <div className="services-carousel">
                {services.map((service, index) => (
                  <motion.div 
                    key={service.id || index}
                    className={`service-card ${index === serviceIndex ? 'active' : ''}`}
                    initial={{ opacity: 0, y: 50, rotateY: -10 }}
                    animate={{ 
                      opacity: isServicesInView ? 1 : 0, 
                      y: isServicesInView ? 0 : 50,
                      rotateY: index === serviceIndex ? 0 : (index < serviceIndex ? -10 : 10)
                    }}
                    transition={{ duration: 0.6, delay: 0.1 * (index % 5) }}
                  >
                    <div className="service-card-inner">
                      <h3 className="service-title">{service.title}</h3>
                      <p className="service-description">{service.description}</p>
                      
                      {/* Price Badge */}
                      <div className="price-badge">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {service.isHourly ? (
                            <span>
                              {formatCurrency(service.pricing || 0)} / hour
                            </span>
                          ) : (
                            <span>
                              {formatCurrency(service.pricing || 0)}
                            </span>
                          )}
                        </motion.div>
                      </div>
                      
                      {/* Features */}
                      <div className="service-features">
                        {service.features && Array.isArray(service.features) ? 
                          service.features.map((feature: string, idx: number) => (
                            <motion.div 
                              key={idx} 
                              className="service-feature"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ 
                                opacity: isServicesInView && index === serviceIndex ? 1 : 0, 
                                x: isServicesInView && index === serviceIndex ? 0 : -20 
                              }}
                              transition={{ duration: 0.3, delay: 0.2 + (idx * 0.1) }}
                            >
                              <Sparkles className="h-4 w-4 mr-2 text-neon-blue" />
                              <span>{feature}</span>
                            </motion.div>
                          )) 
                          : null
                        }
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Carousel Controls */}
              <div className="carousel-controls">
                {services.map((_, index) => (
                  <button 
                    key={index}
                    className={`carousel-dot ${index === serviceIndex ? 'active' : ''}`}
                    onClick={() => setServiceIndex(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <motion.div 
              className="text-center text-slate-400 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isServicesInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-neon-blue opacity-60" />
              <h3 className="text-xl font-semibold mb-2">Services Coming Soon</h3>
              <p>My professional services will be listed here.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="projects-section py-20 relative z-10" ref={projectsRef}>
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isProjectsInView ? 1 : 0, 
              y: isProjectsInView ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
          >
            Project Showcase
          </motion.h2>
          
          {projects && projects.length > 0 ? (
            <div className="projects-grid">
              {projects.map((project, index) => (
                <motion.div 
                  key={project.id || index}
                  className="project-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: isProjectsInView ? 1 : 0, 
                    scale: isProjectsInView ? 1 : 0.8 
                  }}
                  transition={{ duration: 0.6, delay: 0.1 * (index % 6) }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 0 25px rgba(79, 70, 229, 0.6)' 
                  }}
                >
                  <div className="project-card-inner">
                    <div className="project-thumbnail">
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title} 
                          className="project-image"
                        />
                      ) : (
                        <div className="project-thumbnail-placeholder">
                          <Sparkles className="h-10 w-10 text-neon-blue" />
                        </div>
                      )}
                    </div>
                    
                    <div className="project-info">
                      <h3 className="project-title">{project.title}</h3>
                      
                      {project.startDate && (
                        <div className="project-date">
                          <CalendarDays className="h-4 w-4 mr-1" />
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      )}
                      
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center text-slate-400 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isProjectsInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-neon-blue opacity-60" />
              <h3 className="text-xl font-semibold mb-2">Projects Coming Soon</h3>
              <p>My project portfolio will be showcased here.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Career Timeline Section */}
      <section id="timeline" className="timeline-section py-20 relative z-10" ref={timelineRef}>
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isTimelineInView ? 1 : 0, 
              y: isTimelineInView ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
          >
            Career Path
          </motion.h2>
          
          {experiences && experiences.length > 0 ? (
            <div className="timeline-container">
              {/* Vertical timeline line */}
              <div className="timeline-line"></div>
              
              {experiences.map((experience, index) => (
                <motion.div 
                  key={experience.id || index}
                  className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ 
                    opacity: isTimelineInView ? 1 : 0, 
                    x: isTimelineInView ? 0 : (index % 2 === 0 ? -50 : 50)
                  }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                >
                  {/* Timeline dot */}
                  <div className="timeline-dot">
                    <motion.div 
                      className="timeline-dot-pulse"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  {/* Timeline content */}
                  <div className="timeline-content">
                    <div className="timeline-date">
                      {new Date(experience.startDate || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })} - {' '}
                      {experience.endDate 
                        ? new Date(experience.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })
                        : 'Present'}
                    </div>
                    
                    <div className="timeline-card">
                      <h3 className="timeline-title">{experience.title}</h3>
                      <h4 className="timeline-company">{experience.company}</h4>
                      
                      {experience.location && (
                        <div className="timeline-location">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                      
                      {experience.description && (
                        <p className="timeline-description">{experience.description}</p>
                      )}
                      
                      {/* Key Responsibilities */}
                      {experience.keyResponsibilities && 
                       typeof experience.keyResponsibilities === 'object' &&
                       Array.isArray(experience.keyResponsibilities) && 
                       experience.keyResponsibilities.length > 0 && (
                        <div className="timeline-responsibilities">
                          <h5 className="responsibilities-title">Key Responsibilities</h5>
                          <ul className="responsibilities-list">
                            {experience.keyResponsibilities.map((responsibility: string, idx: number) => (
                              <motion.li 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ 
                                  opacity: isTimelineInView ? 1 : 0, 
                                  x: isTimelineInView ? 0 : -20 
                                }}
                                transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
                              >
                                {responsibility}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Industry & Domain badges */}
                      <div className="timeline-badges">
                        {experience.industry && (
                          <Badge className="badge-industry">
                            {experience.industry}
                          </Badge>
                        )}
                        {experience.domain && (
                          <Badge className="badge-domain">
                            {experience.domain}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center text-slate-400 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isTimelineInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-neon-blue opacity-60" />
              <h3 className="text-xl font-semibold mb-2">Career Journey Coming Soon</h3>
              <p>My professional experiences will be displayed here.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Education Section */}
      <section id="education" className="education-section py-20 relative z-10" ref={educationRef}>
        <div className="container">
          <motion.h2 
            className="section-title text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isEducationInView ? 1 : 0, 
              y: isEducationInView ? 0 : 20 
            }}
            transition={{ duration: 0.6 }}
          >
            Academic Background
          </motion.h2>
          
          {educations && educations.length > 0 ? (
            <div className="education-grid">
              {educations.map((education, index) => (
                <motion.div 
                  key={education.id || index}
                  className="education-card"
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  animate={{ 
                    opacity: isEducationInView ? 1 : 0, 
                    y: isEducationInView ? 0 : 50,
                    rotateX: isEducationInView ? 0 : -10
                  }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(79, 70, 229, 0.5)'
                  }}
                >
                  <div className="education-card-inner">
                    <div className="education-icon">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="education-icon-inner"
                      >
                        📚
                      </motion.div>
                    </div>
                    
                    <h3 className="education-degree">{education.degree}</h3>
                    <h4 className="education-institution">{education.institution}</h4>
                    
                    <div className="education-date">
                      {new Date(education.startDate || '').toLocaleDateString('en-US', {
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
                    
                    {education.location && (
                      <div className="education-location">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{education.location}</span>
                      </div>
                    )}
                    
                    {/* Field of Study, Industry, Domain */}
                    <div className="education-details">
                      {education.fieldOfStudy && (
                        <Badge className="badge-field">
                          {education.fieldOfStudy}
                        </Badge>
                      )}
                      {education.industry && (
                        <Badge className="badge-industry">
                          {education.industry}
                        </Badge>
                      )}
                      {education.domain && (
                        <Badge className="badge-domain">
                          {education.domain}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Skills Acquired */}
                    {education.skillsAcquired && 
                     typeof education.skillsAcquired === 'object' &&
                     Array.isArray(education.skillsAcquired) && 
                     education.skillsAcquired.length > 0 && (
                      <div className="skills-acquired-container">
                        <h5 className="skills-acquired-title">Skills Acquired</h5>
                        <div className="skills-acquired-badges">
                          {education.skillsAcquired.map((skill: string, idx: number) => (
                            <motion.div 
                              key={idx}
                              className="skill-acquired-badge"
                              initial={{ opacity: 0, scale: 0, rotate: -10 }}
                              animate={{ 
                                opacity: isEducationInView ? 1 : 0, 
                                scale: isEducationInView ? 1 : 0,
                                rotate: isEducationInView ? 0 : -10
                              }}
                              transition={{ duration: 0.3, delay: 0.5 + (idx * 0.1) }}
                            >
                              {skill}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center text-slate-400 py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isEducationInView ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-neon-blue opacity-60" />
              <h3 className="text-xl font-semibold mb-2">Education Details Coming Soon</h3>
              <p>My academic background will be displayed here.</p>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Sticky CTA Footer */}
      <motion.div 
        className="sticky-cta-footer"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
      >
        <div className="container">
          <div className="cta-buttons">
            <motion.a 
              href={`mailto:${email}`}
              className="cta-button cta-primary"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(79, 70, 229, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Talk
            </motion.a>
            
            <motion.a 
              href="#"
              className="cta-button cta-secondary"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168, 85, 247, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              Grab My Resume
            </motion.a>
            
            <motion.a 
              href="#"
              className="cta-button cta-tertiary"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(251, 113, 133, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              Mentor Me
            </motion.a>
          </div>
        </div>
      </motion.div>
      
      {/* Progress Avatar (Small fixed position avatar that transforms as user scrolls) */}
      <motion.div 
        className="progress-avatar"
        style={{
          backgroundImage: photoURL ? `url(${photoURL})` : 'none'
        }}
      >
        {!photoURL && (
          <div className="progress-avatar-fallback">
            {name.charAt(0)}
          </div>
        )}
        <div className="progress-avatar-indicator"></div>
      </motion.div>
    </div>
  );
};

export default AnimatedOdyssey;