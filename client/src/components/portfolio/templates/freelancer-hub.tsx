import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MentorshipButton } from "@/components/shared/mentorship-button";
import { MentorshipDialog } from "@/components/shared/mentorship-dialog";
import { ProfileImage } from "@/components/ui/profile-image";
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
    whatIOffer?: string | null;
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
  userExperiences: UserExperience[];
  userEducations: UserEducation[];
  publicUrl?: string | null;
  currentUserId?: number;
}

// Parallax Background Component
function ParallaxBackground() {
  const { scrollY } = useScroll();
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -300]);
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -700]);
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -1200]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Colorful gradient background */}
      <motion.div 
        style={{ 
          y: layer1Y,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #feca57 100%)"
        }}
        className="absolute inset-0 opacity-20"
      />
      
      {/* Layer 2: Large decorative shapes */}
      <motion.div style={{ y: layer2Y }} className="absolute inset-0">
        {/* Purple blob */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-purple-400 opacity-30 blur-3xl" />
        
        {/* Pink blob */}
        <div className="absolute top-[40%] right-20 w-[600px] h-[600px] rounded-full bg-pink-400 opacity-30 blur-3xl" />
        
        {/* Orange blob */}
        <div className="absolute bottom-40 left-[30%] w-[550px] h-[550px] rounded-full bg-orange-400 opacity-30 blur-3xl" />
        
        {/* Cyan blob */}
        <div className="absolute top-[60%] right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-400 opacity-30 blur-3xl" />
      </motion.div>
      
      {/* Layer 3: Floating elements */}
      <motion.div style={{ y: layer3Y }} className="absolute inset-0">
        {/* Paint splashes and creative elements */}
        <motion.div 
          className="absolute top-40 left-[15%] w-32 h-32 border-4 border-purple-400 rounded-full opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="absolute top-[30%] right-[20%] w-24 h-24 border-4 border-pink-400 opacity-50"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="absolute bottom-[40%] left-[40%] w-40 h-40 border-4 border-orange-400 rounded-full opacity-50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        {/* Stars and sparkles */}
        <Star className="absolute top-[25%] left-[25%] w-8 h-8 text-yellow-400 opacity-60" />
        <Sparkles className="absolute top-[50%] right-[30%] w-10 h-10 text-cyan-400 opacity-60" />
        <Zap className="absolute bottom-[30%] right-[15%] w-8 h-8 text-purple-400 opacity-60" />
        <Heart className="absolute bottom-[50%] left-[20%] w-8 h-8 text-pink-400 opacity-60" />
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
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);

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
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
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
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic">
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

                {userInfo.email && (
                  <div className="flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-400">
                    <Mail className="h-5 w-5" />
                    <a href={`mailto:${userInfo.email}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {userInfo.email}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    data-testid="button-connect-hero"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Connect
                  </Button>

                  {userInfo.id && currentUserId && currentUserId !== userInfo.id && (
                    <MentorshipButton
                      userId={currentUserId}
                      mentorId={userInfo.id}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                      buttonText="Request Mentorship"
                      data-testid="button-mentor-hero"
                    />
                  )}
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

                {userInfo.whatIOffer && (
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-pink-200 dark:border-pink-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Award className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">What I Offer</h3>
                          <p className="text-gray-600 dark:text-gray-300">{userInfo.whatIOffer}</p>
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
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{userInfo.visionStatement}</p>
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

        {/* Audience Section */}
        {(userInfo.primaryAudience?.length || userInfo.secondaryAudience?.length) && (
          <section className="px-6 py-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Users className="inline h-8 w-8 mr-3 text-purple-600" />
                  My Audience
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {userInfo.primaryAudience && userInfo.primaryAudience.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">Primary Audience</h3>
                        <div className="flex flex-wrap gap-2">
                          {userInfo.primaryAudience.map((audience, index) => (
                            <Badge key={index} className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {userInfo.secondaryAudience && userInfo.secondaryAudience.length > 0 && (
                    <Card className="bg-white dark:bg-gray-900 border-pink-200 dark:border-pink-800">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4 text-pink-600 dark:text-pink-400">Secondary Audience</h3>
                        <div className="flex flex-wrap gap-2">
                          {userInfo.secondaryAudience.map((audience, index) => (
                            <Badge key={index} className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
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
                            <Badge variant="outline" className="mt-2 md:mt-0 w-fit">
                              {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                            </Badge>
                          </div>
                          {(exp.location || (exp as any).industry) && (
                            <div className="flex flex-wrap gap-3 mb-2 text-gray-600 dark:text-gray-400">
                              {exp.location && (
                                <span className="flex items-center">
                                  <MapPin className="inline h-4 w-4 mr-1" />
                                  {exp.location}
                                </span>
                              )}
                              {(exp as any).industry && (
                                <span className="flex items-center">
                                  <Briefcase className="inline h-4 w-4 mr-1" />
                                  {(exp as any).industry}
                                </span>
                              )}
                            </div>
                          )}
                          {exp.description && (
                            <p className="text-gray-700 dark:text-gray-300 mt-3">{exp.description}</p>
                          )}
                          {(exp as any).keyResponsibilities && (exp as any).keyResponsibilities.length > 0 && (
                            <ul className="mt-3 list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                              {(exp as any).keyResponsibilities.map((resp: string, idx: number) => (
                                <li key={idx} className="text-sm">{resp}</li>
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
                          <GraduationCap className="h-8 w-8 text-purple-500 mb-3" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{edu.degree}</h3>
                          <p className="text-lg text-purple-600 dark:text-purple-400 mb-2">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{edu.fieldOfStudy}</p>
                          )}
                          {((edu as any).location || (edu as any).industry) && (
                            <div className="flex flex-wrap gap-3 mb-2 text-sm text-gray-500 dark:text-gray-400">
                              {(edu as any).location && (
                                <span className="flex items-center">
                                  <MapPin className="inline h-3 w-3 mr-1" />
                                  {(edu as any).location}
                                </span>
                              )}
                              {(edu as any).industry && (
                                <span className="flex items-center">
                                  <Briefcase className="inline h-3 w-3 mr-1" />
                                  {(edu as any).industry}
                                </span>
                              )}
                            </div>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          </Badge>
                          {(edu as any).skillsAcquired && (edu as any).skillsAcquired.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(edu as any).skillsAcquired.map((skill: string, idx: number) => (
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
                          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                          {service.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                          )}
                          {(service.priceUsd || service.priceInr) && (
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {service.priceUsd ? `$${service.priceUsd}` : `₹${service.priceInr}`}
                              {service.isHourly && <span className="text-sm">/hr</span>}
                            </p>
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
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-white text-purple-600 hover:bg-purple-50 border-white"
                  data-testid="button-connect-footer"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Connect With Me
                </Button>

                {userInfo.id && currentUserId && currentUserId !== userInfo.id && (
                  <MentorshipButton
                    userId={currentUserId}
                    mentorId={userInfo.id}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-white"
                    variant="outline"
                    buttonText="Request Mentorship"
                    data-testid="button-mentor-footer"
                  />
                )}

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

              {userInfo.email && (
                <p className="mt-8 text-purple-100">
                  <Mail className="inline h-4 w-4 mr-2" />
                  {userInfo.email}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      </div>

      {/* Mentorship Dialog */}
      {userInfo.id && currentUserId && currentUserId !== userInfo.id && (
        <MentorshipDialog
          isOpen={isMentorshipDialogOpen}
          onOpenChange={setIsMentorshipDialogOpen}
          userId={currentUserId}
          mentorId={userInfo.id}
        />
      )}
    </div>
  );
}
