import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import { 
  Mail, Briefcase, GraduationCap, MapPin, 
  ChevronRight, Globe, ExternalLink, Sparkles,
  Palette, Code, Camera, Music, Star, Zap,
  Heart, Users, Target, Award, Lightbulb
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Skill, Service } from "@shared/schema";
import { UserExperience, UserEducation } from "@/types";

interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  startDate: string | null;
  projectUrl: string | null;
  category: string | null;
  industry: string | null;
  thumbnailUrl: string | null;
  thumbnailFile: string | null;
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

interface FreelancerHubProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    company: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string | null;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
    
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
    primaryAudience?: string[] | null;
    secondaryAudience?: string[] | null;
  };
  userSkills: Skill[];
  userProjects: Project[];
  userServices: Service[];
  userExperiences: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    keyResponsibilities?: string[];
  }>;
  userEducations: Array<{
    id: number;
    degree: string;
    institution: string;
    fieldOfStudy?: string | null;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    industry?: string | null;
    domain?: string | null;
    skillsAcquired?: string[];
  }>;
  publicUrl?: string | null;
  currentUserId?: number;
}

// Parallax Background Component
function ParallaxBackground() {
  const { scrollY } = useScroll();
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -300]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -700]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Subtle gradient background */}
      <motion.div 
        style={{ 
          y: layer1Y,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
        }}
        className="absolute inset-0 opacity-40"
      />
      
      {/* Layer 2: Large decorative shapes - softened */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {/* Soft primary blob */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-blue-50 opacity-20 blur-3xl" />
        
        {/* Soft accent blob */}
        <div className="absolute top-[40%] right-20 w-[600px] h-[600px] rounded-full bg-indigo-50 opacity-20 blur-3xl" />
      </motion.div>
    </div>
  );
}

export default function FreelancerHub({ 
  userInfo, 
  userSkills, 
  userProjects, 
  userServices, 
  userExperiences = [], 
  userEducations = [],
  publicUrl,
  currentUserId
}: FreelancerHubProps) {
  // Sort data
  const sortedSkills = [...userSkills].sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0));
  const sortedExperiences = [...userExperiences].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );
  const sortedProjects = [...userProjects].sort((a, b) => 
    new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime()
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase();
    if (name.includes('design') || name.includes('art')) return <Palette className="h-4 w-4" />;
    if (name.includes('photo')) return <Camera className="h-4 w-4" />;
    if (name.includes('code') || name.includes('dev')) return <Code className="h-4 w-4" />;
    if (name.includes('music')) return <Music className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ParallaxBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Profile Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-400 shadow-2xl">
                    <ProfileImage src={userInfo.photoURL} alt={userInfo.name} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Available
                  </div>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {userInfo.name}
                </h1>

                {userInfo.title && (
                  <h2 className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4">
                    {userInfo.title}{userInfo.company ? ` at ${userInfo.company}` : ''}
                  </h2>
                )}

                {userInfo.tagline && (
                  <p className="break-all text-xl text-gray-600 dark:text-gray-400 mb-6 italic">
                    "{userInfo.tagline}"
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-6">
                  {userInfo.location && (
                    <Badge variant="outline" className="px-4 py-2 border-purple-400 text-purple-700 dark:text-purple-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      {userInfo.location}
                    </Badge>
                  )}
                  {userInfo.industry && (
                    <Badge variant="outline" className="px-4 py-2 border-pink-400 text-pink-700 dark:text-pink-300">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {userInfo.industry}
                    </Badge>
                  )}
                  {userInfo.domain && (
                    <Badge variant="outline" className="px-4 py-2 border-orange-400 text-orange-700 dark:text-orange-300">
                      <Target className="h-4 w-4 mr-2" />
                      {userInfo.domain}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <PortfolioCtaButtons 
                    variant="creative" 
                    userId={userInfo.id} 
                    userName={userInfo.name} 
                  />
                </div>
              </motion.div>

              {/* Right: Key Info Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                {userInfo.uniqueValueProposition && (
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">What Makes Me Unique</h3>
                          <p className="text-gray-600 dark:text-gray-300">{userInfo.uniqueValueProposition}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Heart className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Core Values</h3>
                          <div className="flex flex-wrap gap-2">
                            {userInfo.coreValues.map((value, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-none"
                              >
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userInfo.lookingFor && (
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Target className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Looking For</h3>
                          <p className="text-gray-600 dark:text-gray-300">{userInfo.lookingFor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        {(userInfo.visionStatement || userInfo.missionStatement) && (
          <section className="px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {userInfo.visionStatement && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 border-none h-full">
                      <CardContent className="p-8">
                        <Lightbulb className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Vision</h3>
                        <p className="break-all text-gray-700 dark:text-gray-300 leading-relaxed">{userInfo.visionStatement}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {userInfo.missionStatement && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/30 border-none h-full">
                      <CardContent className="p-8">
                        <Target className="h-10 w-10 text-pink-600 dark:text-pink-400 mb-4" />
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mission</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{userInfo.missionStatement}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}


        {/* Skills Section */}
        {sortedSkills.length > 0 && (
          <section className="px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  <Star className="inline h-8 w-8 mr-3 text-orange-600" />
                  Skills & Expertise
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedSkills.map((skill) => (
                    <Card key={skill.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          {getSkillIcon(skill.name)}
                          <h3 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
                        </div>
                        {((skill as any).category || (skill as any).yearsOfExperience) && (
                          <div className="flex flex-wrap gap-2 mb-2 text-xs">
                            {(skill as any).category && (
                              <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                                {(skill as any).category}
                              </span>
                            )}
                            {(skill as any).yearsOfExperience && (
                              <span className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded">
                                {(skill as any).yearsOfExperience}y
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${skill.proficiency || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{skill.proficiency}%</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{skill.level}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {sortedProjects.length > 0 && (
          <section className="px-6 py-16 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                  <Briefcase className="inline h-8 w-8 mr-3 text-purple-600" />
                  Featured Projects
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProjects.slice(0, 6).map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-white dark:bg-gray-900 overflow-hidden h-full hover:shadow-2xl transition-shadow duration-300">
                        {project.thumbnailUrl && (
                          <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
                            <img 
                              src={project.thumbnailUrl} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{project.title}</h3>
                          {project.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{project.description}</p>
                          )}
                          {project.category && (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mb-3">
                              {project.category}
                            </Badge>
                          )}
                          {project.projectUrl && (
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Project
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {sortedExperiences.length > 0 && (
          <section className="px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  <Briefcase className="inline h-8 w-8 mr-3 text-cyan-600" />
                  Work Experience
                </h2>

                <div className="space-y-8">
                  {sortedExperiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-white dark:bg-gray-900 border-l-4 border-purple-500">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                              <p className="text-lg text-purple-600 dark:text-purple-400">{exp.company}</p>
                            </div>
                            <Badge className="mt-2 md:mt-0 w-fit bg-purple-600 text-white border-none shadow-sm">
                              {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                            </Badge>
                          </div>
                          {(exp.location || exp.industry || exp.domain) && (
                            <div className="flex flex-wrap gap-3 mb-2 text-gray-600 dark:text-gray-400">
                              {exp.location && (
                                <span className="flex items-center">
                                  <MapPin className="inline h-4 w-4 mr-1" />
                                  {exp.location}
                                </span>
                              )}
                              {exp.industry && (
                                <span className="flex items-center">
                                  <Briefcase className="inline h-4 w-4 mr-1" />
                                  {exp.industry}
                                </span>
                              )}
                              {exp.domain && (
                                <span className="flex items-center">
                                  <Target className="inline h-4 w-4 mr-1" />
                                  {exp.domain}
                                </span>
                              )}
                            </div>
                          )}
                          {exp.description && (
                            <p className="text-gray-700 dark:text-gray-300 mt-3">{exp.description}</p>
                          )}
                          {exp.keyResponsibilities && exp.keyResponsibilities.length > 0 && (
                            <ul className="mt-3 list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                              {exp.keyResponsibilities.map((resp: string, idx: number) => (
                                <li key={idx} className="text-sm">{String(resp)}</li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {sortedEducations.length > 0 && (
          <section className="px-6 py-16 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  <GraduationCap className="inline h-8 w-8 mr-3 text-purple-600" />
                  Education
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {sortedEducations.map((edu, index) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-white dark:bg-gray-900 h-full">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-purple-600 text-white border-none shadow-md px-3 py-1 text-sm font-bold">
                              {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                            </Badge>
                            <GraduationCap className="h-8 w-8 text-purple-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{edu.degree}</h3>
                          <p className="text-lg text-purple-600 dark:text-purple-400 mb-2">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{edu.fieldOfStudy}</p>
                          )}
                          {(edu.location || edu.industry || edu.domain) && (
                            <div className="flex flex-wrap gap-3 mb-2 text-sm text-gray-500 dark:text-gray-400">
                              {edu.location && (
                                <span className="flex items-center">
                                  <MapPin className="inline h-3 w-3 mr-1" />
                                  {edu.location}
                                </span>
                              )}
                              {edu.industry && (
                                <span className="flex items-center">
                                  <Briefcase className="inline h-3 w-3 mr-1" />
                                  {edu.industry}
                                </span>
                              )}
                              {edu.domain && (
                                <span className="flex items-center">
                                  <Target className="inline h-3 w-3 mr-1" />
                                  {edu.domain}
                                </span>
                              )}
                            </div>
                          )}
                          {edu.skillsAcquired && edu.skillsAcquired.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {edu.skillsAcquired.map((skill: string, idx: number) => (
                                <Badge key={idx} className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {userServices.length > 0 && (
          <section className="px-6 py-16">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  <Zap className="inline h-8 w-8 mr-3 text-orange-600" />
                  Services I Offer
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-orange-200 dark:border-orange-800 h-full hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.title}</h3>
                            <Badge className="bg-orange-600 text-white border-none shadow-md px-3 py-1 font-bold text-lg">
                              {service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}
                              {service.isHourly && <span className="text-xs ml-1">/hr</span>}
                            </Badge>
                          </div>
                          {service.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Core Values Section */}
        {userInfo.coreValues && userInfo.coreValues.length > 0 && (
          <section className="px-6 py-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Heart className="inline h-8 w-8 mr-3 text-purple-600" />
                  Core Values
                </h2>

                <div className="flex flex-wrap justify-center gap-4">
                  {userInfo.coreValues.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Badge className="px-6 py-3 text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {value}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Footer CTA Section */}
        <section className="px-6 py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Create Something Amazing Together</h2>
              <p className="text-xl mb-8 text-purple-100">
                Ready to bring your ideas to life? Get in touch and let's make it happen!
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <PortfolioCtaButtons 
                  variant="creative" 
                  userId={userInfo.id} 
                  userName={userInfo.name} 
                />

                {publicUrl && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white hover:bg-white/10 border-white"
                    asChild
                  >
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-5 w-5 mr-2" />
                      Visit Portfolio
                    </a>
                  </Button>
                )}
              </div>

            </motion.div>
          </div>
        </section>
      </div>

    </div>
  );
}
