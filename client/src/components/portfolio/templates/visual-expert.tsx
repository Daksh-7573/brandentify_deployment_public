import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { Education, Project, Service, Skill, WorkExperience } from "@shared/schema";
import { useState } from "react";
import {
  Calendar,
  MapPin,
  Mail,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Star,
  ChevronRight,
  Award
} from "lucide-react";
import PortfolioCtaButtons from "../portfolio-cta-buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VisualExpertProps {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string | null;
    company?: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
    photoURL: string | null;
    jobLevel?: string | null;
  };
  userSkills: Skill[];
  userExperiences: WorkExperience[];
  userProjects: Project[];
  userEducations?: Education[];
  userServices?: Service[];
  currentUserId?: number;
}

// Project Modal Component
function ProjectModal({ project, isOpen, onClose }: { project: Project | null; isOpen: boolean; onClose: () => void }) {
  if (!project) return null;

  const mediaUrls = project.mediaUrls ? (typeof project.mediaUrls === 'string' ? JSON.parse(project.mediaUrls) : project.mediaUrls) : [];
  const allImages = [
    ...(project.thumbnailUrl ? [project.thumbnailUrl] : []),
    ...mediaUrls
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-black">{project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${project.title} - ${idx + 1}`}
                  className="w-full h-auto object-cover"
                />
              ))}
            </div>
          )}

          {project.description && (
            <div className="prose max-w-none">
              <p className="break-all text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                className="flex items-center gap-2 hover:text-black transition-colors"
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

export default function VisualExpert({
  userInfo,
  userSkills,
  userExperiences,
  userProjects,
  userEducations = [],
  userServices = [],
  currentUserId
}: VisualExpertProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Accent color for visual enhancement
  const accentColor = "#2563eb"; // Professional blue
  const accentLight = "#dbeafe"; // Light blue for backgrounds
  const accentDark = "#1e40af"; // Dark blue for hover

  const sortedExperiences = [...userExperiences].sort((a, b) => {
    const aDate = a.endDate || '9999-12-31';
    const bDate = b.endDate || '9999-12-31';
    return bDate.localeCompare(aDate);
  });

  const sortedProjects = [...userProjects].sort((a, b) => {
    const aDate = a.startDate || '';
    const bDate = b.startDate || '';
    return bDate.localeCompare(aDate);
  });

  const sortedEducations = [...userEducations].sort((a, b) => {
    const aDate = a.endDate || '9999-12-31';
    const bDate = b.endDate || '9999-12-31';
    return bDate.localeCompare(aDate);
  });

  const sortedSkills = [...userSkills].sort((a, b) => {
    const proficiencyOrder = { 'expert': 3, 'advanced': 2, 'intermediate': 1, 'beginner': 0 };
    const aLevel = proficiencyOrder[a.level?.toLowerCase() as keyof typeof proficiencyOrder] ?? -1;
    const bLevel = proficiencyOrder[b.level?.toLowerCase() as keyof typeof proficiencyOrder] ?? -1;
    return bLevel - aLevel;
  });

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const displayTitle = userInfo.company 
    ? `${userInfo.title} at ${userInfo.company}`
    : userInfo.title || "Professional";

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section - Bold Typography with Photo */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left: Profile Photo */}
            <div className="md:col-span-4 flex justify-center">
              {userInfo.photoURL && (
                <div className="relative">
                  <div className="absolute -inset-2" style={{ backgroundColor: accentColor, opacity: 0.1 }}></div>
                  <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
                    <img
                      src={userInfo.photoURL}
                      alt={userInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="md:col-span-8 space-y-6">
              {/* Large Bold Name */}
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                {userInfo.name}
              </h1>

              {/* Title and Location */}
              <div className="flex flex-col gap-3 text-sm md:text-base text-gray-600 uppercase tracking-wider">
                <span className="font-medium text-lg">{displayTitle}</span>
                {userInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userInfo.location}</span>
                  </div>
                )}
              </div>

              {/* Tagline/About */}
              {(userInfo.tagline || userInfo.aboutMe) && (
                <div className="max-w-2xl">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {userInfo.tagline || userInfo.aboutMe}
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <PortfolioCtaButtons 
                  variant="minimal" 
                  userId={userInfo.id} 
                  userName={userInfo.name} 
                   
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Editorial Style */}
      {(userInfo.visionStatement || userInfo.missionStatement || userInfo.uniqueValueProposition || (userInfo.coreValues && userInfo.coreValues.length > 0)) && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200" style={{ backgroundColor: accentLight + '10' }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>About</h2>

            <div className="space-y-8 max-w-4xl">
              {userInfo.visionStatement && (
                <div className="pl-4 border-l-4" style={{ borderLeftColor: accentColor }}>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-2" style={{ color: accentDark }}>Vision</h3>
                  <p className="break-all text-gray-700 leading-relaxed">{userInfo.visionStatement}</p>
                </div>
              )}

              {userInfo.missionStatement && (
                <div className="pl-4 border-l-4" style={{ borderLeftColor: accentColor }}>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-2" style={{ color: accentDark }}>Mission</h3>
                  <p className="text-gray-700 leading-relaxed">{userInfo.missionStatement}</p>
                </div>
              )}

              {userInfo.uniqueValueProposition && (
                <div className="pl-4 border-l-4" style={{ borderLeftColor: accentColor }}>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-2" style={{ color: accentDark }}>Value Proposition</h3>
                  <p className="text-gray-700 leading-relaxed">{userInfo.uniqueValueProposition}</p>
                </div>
              )}

              {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                <div className="pl-4 border-l-4" style={{ borderLeftColor: accentColor }}>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-3" style={{ color: accentDark }}>Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {userInfo.coreValues.map((value, idx) => (
                      <Badge key={idx} className="px-3 py-1 text-sm font-medium" style={{ backgroundColor: accentColor, color: 'white', border: 'none' }}>
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section - Grid Layout */}
      {sortedExperiences.length > 0 && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>Experience</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sortedExperiences.map((exp, idx) => (
                <Card key={exp.id} className="border-l-4 shadow-md hover:shadow-lg transition-shadow" style={{ borderLeftColor: accentColor }}>
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: `${accentColor}15` }}>
                      <Briefcase className="w-6 h-6" style={{ color: accentColor }} />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-bold text-lg uppercase tracking-wide text-black">{exp.title}</h3>
                      {exp.company && (
                        <p className="text-sm font-semibold text-gray-700">{exp.company}</p>
                      )}
                      <p className="text-xs font-medium" style={{ color: accentColor }}>
                        {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section - Collections Style */}
      {sortedProjects.length > 0 && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>Projects</h2>

            <div className="space-y-16">
              {sortedProjects.map((project, idx) => (
                <div key={project.id} className="border-b border-gray-200 pb-12 last:border-0 hover:bg-opacity-50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl font-bold" style={{ color: accentColor }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-2xl font-bold uppercase tracking-wide leading-tight">{project.title}</h3>
                      </div>

                      {project.description && (
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">{project.description}</p>
                      )}

                      {project.startDate && (
                        <p className="text-sm font-semibold" style={{ color: accentColor }}>
                          {new Date(project.startDate).getFullYear()}
                        </p>
                      )}

                      <Button
                        className="group px-0 hover:bg-transparent text-sm uppercase tracking-wider font-medium"
                        style={{ color: accentColor }}
                        variant="ghost"
                        onClick={() => openProjectModal(project)}
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.thumbnailUrl && (
                          <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-lg transition-all cursor-pointer">
                            <img
                              src={project.thumbnailUrl}
                              alt={project.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onClick={() => openProjectModal(project)}
                            />
                          </div>
                        )}
                        {project.mediaUrls && (typeof project.mediaUrls === 'string' ? JSON.parse(project.mediaUrls) : project.mediaUrls).slice(0, 2).map((url: string, i: number) => (
                          <div key={i} className="aspect-video overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-lg transition-all cursor-pointer">
                            <img
                              src={url}
                              alt={`${project.title} ${i + 2}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              onClick={() => openProjectModal(project)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {sortedSkills.length > 0 && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>Skills</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSkills.map((skill) => {
                const proficiencyMap = { 'expert': 4, 'advanced': 3, 'intermediate': 2, 'beginner': 1 };
                const level = proficiencyMap[skill.level?.toLowerCase() as keyof typeof proficiencyMap] ?? 0;
                
                return (
                  <div key={skill.id} className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                        <Award className="w-5 h-5" style={{ color: accentColor }} />
                      </div>
                      <h3 className="font-bold uppercase tracking-wide text-black">{skill.name}</h3>
                    </div>
                    
                    {skill.level && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentColor }}>{skill.level}</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-2 flex-1 rounded-full transition-colors"
                              style={{
                                backgroundColor: i <= level ? accentColor : '#e5e7eb'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {sortedEducations.length > 0 && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>Education</h2>

            <div className="relative space-y-8 pl-8">
              {/* Timeline Line */}
              <div className="absolute left-3 top-0 bottom-0 w-1" style={{ backgroundColor: `${accentColor}20` }}></div>

              {sortedEducations.map((edu, idx) => (
                <div key={edu.id} className="relative pb-8 last:pb-0">
                  {/* Timeline Dot */}
                  <div 
                    className="absolute -left-5 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md"
                    style={{ backgroundColor: accentColor }}
                  ></div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-black">{edu.degree}</h3>
                    <p className="font-semibold text-gray-700">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                    )}
                    <p className="text-sm font-medium" style={{ color: accentColor }}>
                      {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {userServices && userServices.length > 0 && (
        <section className="py-12 md:py-20 px-6 md:px-12 border-b-2 border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12" style={{ color: accentColor }}>Services</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userServices.map((service, idx) => {
                const icons = [Briefcase, Star, Award, GraduationCap, MapPin, Mail];
                const Icon = icons[idx % icons.length];
                
                return (
                  <Card key={service.id} className="border-2 hover:shadow-lg transition-all" style={{ borderColor: `${accentColor}33` }}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: `${accentColor}15` }}>
                          <Icon className="w-6 h-6" style={{ color: accentColor }} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-wide text-black flex-1">{service.title}</h3>
                      </div>
                      {service.description && (
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">{service.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-6 md:px-12" style={{ backgroundColor: accentLight + '15' }}>
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter" style={{ color: accentDark }}>
            Let's Connect
          </h2>

          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            {userInfo.lookingFor || "Ready to collaborate and create something amazing together"}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-6">
            <Button
              size="lg"
              className="text-white px-10 py-5 text-sm font-medium uppercase tracking-wide hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: accentColor }}
              data-testid="button-connect-footer"
            >
              <Mail className="w-4 h-4 mr-2" />
              Connect With Me
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 px-10 py-5 text-sm font-medium uppercase tracking-wide transition-all"
              style={{ borderColor: accentColor, color: accentColor }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = accentColor; }}
              data-testid="button-mentor-footer"
            >
              <Star className="w-4 h-4 mr-2" />
              Request Mentorship
            </Button>
          </div>
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
