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
    whatIOffer: string | null;
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
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
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
      {/* Hero Section - Bold Typography */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Large Bold Name */}
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
              {userInfo.name}
            </h1>

            {/* Title and Location */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm md:text-base text-gray-600 uppercase tracking-wider">
              <span className="font-medium">{displayTitle}</span>
              {userInfo.location && (
                <>
                  <span className="hidden md:block">•</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userInfo.location}</span>
                  </div>
                </>
              )}
            </div>

            {/* Tagline/About */}
            {(userInfo.tagline || userInfo.aboutMe) && (
              <div className="max-w-2xl">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                  {userInfo.tagline || userInfo.aboutMe}
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-base font-medium uppercase tracking-wide"
                data-testid="button-connect"
              >
                <Mail className="w-5 h-5 mr-2" />
                Connect
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-6 text-base font-medium uppercase tracking-wide"
                data-testid="button-mentor"
              >
                <Star className="w-5 h-5 mr-2" />
                Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Editorial Style */}
      {(userInfo.visionStatement || userInfo.missionStatement || userInfo.uniqueValueProposition) && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">About</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {userInfo.photoURL && (
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-8">
                {userInfo.visionStatement && (
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-3">Vision</h3>
                    <p className="text-gray-700 leading-relaxed">{userInfo.visionStatement}</p>
                  </div>
                )}

                {userInfo.missionStatement && (
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-3">Mission</h3>
                    <p className="text-gray-700 leading-relaxed">{userInfo.missionStatement}</p>
                  </div>
                )}

                {userInfo.uniqueValueProposition && (
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-3">Value Proposition</h3>
                    <p className="text-gray-700 leading-relaxed">{userInfo.uniqueValueProposition}</p>
                  </div>
                )}

                {userInfo.coreValues && userInfo.coreValues.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-3">Core Values</h3>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.coreValues.map((value, idx) => (
                        <Badge key={idx} variant="outline" className="border-black text-black px-3 py-1">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Experience Section - Grid Layout */}
      {sortedExperiences.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">Experience</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sortedExperiences.map((exp) => (
                <Card key={exp.id} className="border-0 shadow-none group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 mb-4 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-gray-300" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg uppercase tracking-wide">{exp.title}</h3>
                      {exp.company && (
                        <p className="text-sm text-gray-600 uppercase">{exp.company}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-700 line-clamp-3 pt-2">{exp.description}</p>
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
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">Projects</h2>

            <div className="space-y-16">
              {sortedProjects.map((project, idx) => (
                <div key={project.id} className="border-b border-gray-200 pb-12 last:border-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-mono">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-2xl font-bold uppercase tracking-wide">{project.title}</h3>
                      </div>

                      {project.description && (
                        <p className="text-gray-700 leading-relaxed">{project.description}</p>
                      )}

                      {project.startDate && (
                        <p className="text-sm text-gray-500 uppercase tracking-wide">
                          {new Date(project.startDate).getFullYear()}
                        </p>
                      )}

                      <Button
                        variant="ghost"
                        className="group px-0 hover:bg-transparent"
                        onClick={() => openProjectModal(project)}
                      >
                        <span className="text-sm uppercase tracking-wider">View Details</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {project.thumbnailUrl && (
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openProjectModal(project)}
                          />
                        </div>
                      )}
                      {project.mediaUrls && (typeof project.mediaUrls === 'string' ? JSON.parse(project.mediaUrls) : project.mediaUrls).slice(0, 3).map((url: string, i: number) => (
                        <div key={i} className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`${project.title} ${i + 2}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openProjectModal(project)}
                          />
                        </div>
                      ))}
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
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">Skills</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sortedSkills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wide">{skill.name}</h3>
                  </div>
                  {skill.level && (
                    <p className="text-sm text-gray-500 uppercase tracking-wider">{skill.level}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {sortedEducations.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">Education</h2>

            <div className="space-y-8">
              {sortedEducations.map((edu) => (
                <div key={edu.id} className="border-b border-gray-200 pb-8 last:border-0">
                  <div className="flex items-start gap-4">
                    <GraduationCap className="w-6 h-6 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold uppercase tracking-wide">{edu.degree}</h3>
                      <p className="text-gray-600 mt-1">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-500 mt-1">{edu.fieldOfStudy}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {userServices && userServices.length > 0 && (
        <section className="py-16 md:py-24 px-6 md:px-12 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">Services</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userServices.map((service) => (
                <Card key={service.id} className="border border-gray-200 hover:border-black transition-colors">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-700 leading-relaxed">{service.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
            Let's Connect
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {userInfo.lookingFor || userInfo.whatIOffer || "Ready to collaborate and create something amazing together"}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-12 py-7 text-base font-medium uppercase tracking-wide"
              data-testid="button-connect-footer"
            >
              <Mail className="w-5 h-5 mr-2" />
              Connect With Me
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white px-12 py-7 text-base font-medium uppercase tracking-wide"
              data-testid="button-mentor-footer"
            >
              <Star className="w-5 h-5 mr-2" />
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
