import React from "react";
import {
  Briefcase,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  Download,
  FileText,
  Star,
  GraduationCap,
  MessageSquare,
  Globe,
  BookOpen,
  Award,
  Tag,
  Code,
  Wrench as Tool
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useTypewriter } from "@/hooks/use-typewriter";

interface ScholarProps {
  userInfo: {
    name: string;
    title: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    email: string;
    photoURL: string | null;
    lookingFor: string | null;
    jobLevel: string | null;
  };
  userSkills: {
    id: number;
    name: string;
    level: string;
    proficiency: number;
  }[];
  userServices: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    rate?: string | null;
  }[];
  userExperiences: {
    id: number;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    description: string;
    industry: string;
    domain: string;
  }[];
  userEducations: {
    id: number;
    degree: string;
    institution: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    description?: string | null;
    achievements?: string | null;
  }[];
  userProjects: {
    id: number;
    title: string;
    description: string | null;
    startDate: string;
    projectUrl?: string | null;
    category?: string | null;
    thumbnailUrl?: string | null;
    mediaUrls?: string[];
  }[];
}

export default function Scholar({
  userInfo,
  userSkills,
  userServices,
  userExperiences,
  userEducations,
  userProjects
}: ScholarProps) {
  // Set up animated typewriter text based on user info
  const phrases = [
    userInfo.title || "Student & Lifelong Learner",
    userInfo.industry ? `Specializing in ${userInfo.industry}` : "Knowledge Seeker",
    userInfo.domain ? `Focused on ${userInfo.domain}` : "Passionate about Learning",
    userInfo.lookingFor ? `Looking for ${userInfo.lookingFor}` : "Open to Opportunities"
  ];

  const { text } = useTypewriter({
    words: phrases,
    loop: true,
    typeSpeed: 80,
    deleteSpeed: 50,
    delaySpeed: 2000
  });

  // Function to choose a color for skills based on skill name
  const getSkillColor = (name: string) => {
    const nameToLower = name.toLowerCase();
    
    if (nameToLower.includes('communication') || nameToLower.includes('speaking')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (nameToLower.includes('leadership') || nameToLower.includes('management')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (nameToLower.includes('teamwork') || nameToLower.includes('collaboration')) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (nameToLower.includes('problem') || nameToLower.includes('analytical')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    } else if (nameToLower.includes('creative') || nameToLower.includes('design')) {
      return 'bg-pink-50 text-pink-700 border-pink-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper function to get icon for project categories
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('research') || categoryLower.includes('academic')) {
      return <BookOpen className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('web') || categoryLower.includes('software')) {
      return <Code className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('volunteer') || categoryLower.includes('community')) {
      return <Globe className="h-3.5 w-3.5" />;
    } else if (categoryLower.includes('design') || categoryLower.includes('creative')) {
      return <Briefcase className="h-3.5 w-3.5" />;
    } else {
      return <FileText className="h-3.5 w-3.5" />;
    }
  };

  // Group skills by category
  const skillCategories = {
    technical: userSkills.filter(skill => 
      skill.name.toLowerCase().includes('programming') || 
      skill.name.toLowerCase().includes('technical') ||
      skill.name.toLowerCase().includes('coding') ||
      skill.name.toLowerCase().includes('development')
    ),
    soft: userSkills.filter(skill => 
      skill.name.toLowerCase().includes('communication') || 
      skill.name.toLowerCase().includes('leadership') ||
      skill.name.toLowerCase().includes('teamwork') ||
      skill.name.toLowerCase().includes('collaboration')
    ),
    tools: userSkills.filter(skill => 
      skill.name.toLowerCase().includes('tool') || 
      skill.name.toLowerCase().includes('software') ||
      skill.name.toLowerCase().includes('platform')
    ),
    other: userSkills.filter(skill => 
      !skill.name.toLowerCase().includes('programming') && 
      !skill.name.toLowerCase().includes('technical') &&
      !skill.name.toLowerCase().includes('coding') &&
      !skill.name.toLowerCase().includes('development') &&
      !skill.name.toLowerCase().includes('communication') && 
      !skill.name.toLowerCase().includes('leadership') &&
      !skill.name.toLowerCase().includes('teamwork') &&
      !skill.name.toLowerCase().includes('collaboration') &&
      !skill.name.toLowerCase().includes('tool') && 
      !skill.name.toLowerCase().includes('software') &&
      !skill.name.toLowerCase().includes('platform')
    )
  };

  // Sort educations by date (most recent first)
  const sortedEducations = [...userEducations].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Check if we have any data sections to display
  const hasSkills = userSkills && userSkills.length > 0;
  const hasExperiences = userExperiences && userExperiences.length > 0;
  const hasEducation = userEducations && userEducations.length > 0;
  const hasProjects = userProjects && userProjects.length > 0;
  const hasServices = userServices && userServices.length > 0;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile picture */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md transition-transform hover:scale-105">
                <Avatar className="w-full h-full">
                  <AvatarImage src={userInfo.photoURL || ''} alt={userInfo.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                    {userInfo.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              {userInfo.lookingFor && (
                <Badge className="absolute -bottom-2 right-0 bg-blue-600 hover:bg-blue-700">
                  {userInfo.lookingFor}
                </Badge>
              )}
            </div>

            {/* Name and intro */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {userInfo.name}
              </h1>
              
              <div className="h-8 mb-2 text-blue-700 font-serif text-lg">
                {text}
                <span className="animate-blink">|</span>
              </div>

              {userInfo.location && (
                <div className="flex items-center justify-center md:justify-start text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{userInfo.location}</span>
                </div>
              )}

              {/* Domain/Industry pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {userInfo.industry && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    # {userInfo.industry}
                  </Badge>
                )}
                {userInfo.domain && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    # {userInfo.domain}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
            What I'm All About
          </h2>
          
          <Card className="bg-blue-50 border-blue-100 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {userInfo.title || userInfo.industry 
                      ? `As ${userInfo.title ? `a ${userInfo.title}` : ''}${userInfo.industry ? ` in the ${userInfo.industry} field` : ''}, I'm passionate about continuous learning and applying my knowledge to real-world challenges.`
                      : "I'm passionate about continuous learning and applying my knowledge to real-world challenges. My academic journey has equipped me with both theoretical understanding and practical skills."}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {userInfo.lookingFor 
                      ? `Currently seeking ${userInfo.lookingFor.toLowerCase()}. I bring a fresh perspective, strong work ethic, and eagerness to contribute to meaningful projects.`
                      : "I bring a fresh perspective, strong work ethic, and eagerness to contribute to meaningful projects. I'm constantly looking to expand my skills and take on new challenges."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
            What I'm Good At
          </h2>
          
          {!hasSkills && (
            <Card className="mb-6 border-dashed border-blue-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 italic">Add skills to showcase your strengths and abilities to potential employers or collaborators.</p>
                <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Add Skills
                </Button>
              </CardContent>
            </Card>
          )}
          
          {hasSkills && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Skills */}
              {skillCategories.technical.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-blue-600" /> Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillCategories.technical.map((skill) => (
                        <div key={skill.id} className="w-full mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.round(skill.proficiency / 20) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <Progress
                            value={skill.proficiency}
                            className="h-2 bg-blue-100"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Soft Skills */}
              {skillCategories.soft.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" /> Soft Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillCategories.soft.map((skill) => (
                        <Badge 
                          key={skill.id} 
                          variant="outline"
                          className={`text-sm py-2 px-3 ${getSkillColor(skill.name)}`}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Tools */}
              {skillCategories.tools.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Tool className="h-5 w-5 mr-2 text-purple-600" /> Tools & Software
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillCategories.tools.map((skill) => (
                        <Badge 
                          key={skill.id} 
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Other Skills */}
              {skillCategories.other.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-green-600" /> Other Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillCategories.other.map((skill) => (
                        <Badge 
                          key={skill.id} 
                          variant="outline"
                          className={`text-sm py-2 px-3 ${getSkillColor(skill.name)}`}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Services Section (if services exist) */}
      {hasServices && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
              What I Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userServices.slice(0, 3).map((service) => (
                <Card key={service.id} className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    {service.rate && (
                      <div className="text-blue-600 font-medium mb-4">{service.rate}</div>
                    )}
                    <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      Request Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
            Showcase
          </h2>
          
          {!hasProjects && (
            <Card className="mb-6 border-dashed border-blue-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 italic">Add projects to showcase your work and accomplishments.</p>
                <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Add Projects
                </Button>
              </CardContent>
            </Card>
          )}
          
          {hasProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {project.thumbnailUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                      {project.category && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center">
                          {getCategoryIcon(project.category)}
                          <span className="ml-1">{project.category}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {project.startDate && (
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(project.startDate).toLocaleDateString(undefined, { 
                          year: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    )}
                    
                    {project.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    )}
                    
                    {project.projectUrl && (
                      <div className="flex justify-end">
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View Project <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
            Career Path
          </h2>
          
          {!hasExperiences && (
            <Card className="mb-6 border-dashed border-blue-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 italic">Add work experience to showcase your professional journey and achievements.</p>
                <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Add Work Experience
                </Button>
              </CardContent>
            </Card>
          )}
            
          {hasExperiences && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-3 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              <div className="space-y-8 pl-8 md:pl-12">
                {userExperiences.map((experience, index) => (
                  <div key={experience.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-3 -translate-x-1/2 md:-translate-x-3 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                    
                    <Card className="border-blue-100">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{experience.title}</h3>
                            <div className="text-gray-600 mb-2">
                              {experience.company}
                              {experience.location && <span> • {experience.location}</span>}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-1 md:mt-0 md:ml-4 md:text-right whitespace-nowrap">
                            {experience.startDate && (
                              <>
                                {new Date(experience.startDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}
                                {experience.endDate ? ` - ${new Date(experience.endDate).toLocaleDateString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}` : ' - Present'}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{experience.description}</p>
                        
                        {(experience.industry || experience.domain) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {experience.industry && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {experience.industry}
                              </Badge>
                            )}
                            {experience.domain && (
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {experience.domain}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Education Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-0.5 bg-blue-500 mr-3"></span> 
            Academic Background
          </h2>
          
          {!hasEducation && (
            <Card className="mb-6 border-dashed border-blue-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500 italic">Add education details to showcase your academic background and achievements.</p>
                <Button variant="outline" className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50">
                  Add Education
                </Button>
              </CardContent>
            </Card>
          )}
          
          {hasEducation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedEducations.map((education) => (
                <Card key={education.id} className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{education.degree}</h3>
                        <div className="text-gray-600 mb-2">
                          {education.institution}
                          {education.location && <span> • {education.location}</span>}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-3">
                      {education.startDate && (
                        <>
                          {new Date(education.startDate).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short' 
                          })}
                          {education.endDate ? ` - ${new Date(education.endDate).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short' 
                          })}` : ' - Present'}
                        </>
                      )}
                    </div>
                    
                    {education.description && (
                      <p className="text-gray-700 mb-3">{education.description}</p>
                    )}
                    
                    {education.achievements && (
                      <div className="mt-3">
                        <div className="flex items-center mb-1">
                          <Award className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-700">Achievements</span>
                        </div>
                        <p className="text-gray-700 pl-6">{education.achievements}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section / CTA */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Let's Connect</h2>
              <p className="text-gray-700 mb-6">
                Interested in discussing potential opportunities, collaborations, or just want to chat about shared interests? Feel free to reach out!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" /> 
                  Send Message
                </Button>
                
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Download className="h-4 w-4 mr-2" /> 
                  Grab My Resume
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <Card className="w-full md:max-w-md border-blue-100">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>
                  
                  <div className="space-y-3">
                    {userInfo.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-blue-600 mr-3" />
                        <a href={`mailto:${userInfo.email}`} className="text-gray-700 hover:text-blue-600">
                          {userInfo.email}
                        </a>
                      </div>
                    )}
                    
                    {userInfo.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="text-gray-700">{userInfo.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}