import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import RightSidebar from "@/components/layout/right-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProfileCompletion from "@/components/common/profile-completion";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { ArrowLeft, FileCode, Github, Globe, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Project Detail Component with NeoGlass Design
function ProjectDetailView({ projectId, onBack }: { projectId: string, onBack: () => void }) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [localProject, setLocalProject] = useState<any>(null);
  
  // Fast direct fetch on component mount for immediate rendering
  useEffect(() => {
    const fetchProjectFast = async () => {
      try {
        // @ts-ignore
        if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[projectId]) {
          // @ts-ignore
          setLocalProject(window.__PROJECT_CACHE__[projectId]);
          setInitialLoad(false);
          return;
        }

        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          setLocalProject(projectData);
          
          // Cache for future use
          // @ts-ignore
          if (!window.__PROJECT_CACHE__) window.__PROJECT_CACHE__ = {};
          // @ts-ignore
          window.__PROJECT_CACHE__[projectId] = projectData;
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
      setInitialLoad(false);
    };
    
    fetchProjectFast();
  }, [projectId]);
  
  // Use React Query for proper data management
  const { data: project, isLoading: loading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    staleTime: 300000,
    refetchOnWindowFocus: false,
    initialData: () => {
      // @ts-ignore
      if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[projectId]) {
        // @ts-ignore
        return window.__PROJECT_CACHE__[projectId];
      }
      return undefined;
    }
  });

  // Fetch project collaborators
  const { data: collaborators = [] } = useQuery({
    queryKey: [`/api/projects/${projectId}/collaborators`],
    staleTime: 300000,
    refetchOnWindowFocus: false,
    enabled: !!projectId
  });

  // Fetch project endorsements
  const { data: endorsements = [] } = useQuery({
    queryKey: [`/api/projects/${projectId}/endorsements`],
    staleTime: 300000,
    refetchOnWindowFocus: false,
    enabled: !!projectId
  });

  // Show loading state
  if (loading && !localProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm" 
            className="mb-8 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl animate-pulse">
            <div className="h-12 w-80 bg-white/20 rounded mb-6"></div>
            <div className="h-6 w-60 bg-white/10 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-white/10 rounded"></div>
              <div className="h-4 w-3/4 bg-white/10 rounded"></div>
              <div className="h-4 w-1/2 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm" 
            className="mb-8 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-red-300 mb-4">Error Loading Project</h3>
            <p className="text-white/80">Unable to load project details. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Use current project data (local or from query)
  const currentProject = localProject || project;

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
        
        <div className="relative z-10 p-6 max-w-7xl mx-auto">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm" 
            className="mb-8 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          
          <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">Project Not Found</h3>
            <p className="text-white/80">The requested project could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm" 
            className="mb-4 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>

        {/* Main Project Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          {/* Project Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div className="flex-1 mb-6 md:mb-0">
              <h1 className="text-4xl font-bold text-white mb-4">{currentProject.title}</h1>
              <div className="flex flex-wrap items-center text-white/60 text-sm space-x-6 mb-4">
                <span className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  {currentProject.startDate ? format(new Date(currentProject.startDate), 'MMM yyyy') : 'Date not set'}
                  {currentProject.endDate && ` - ${format(new Date(currentProject.endDate), 'MMM yyyy')}`}
                  {currentProject.isCurrent && ' (Current)'}
                </span>
                <span className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
                  <User className="h-4 w-4 mr-2" />
                  Personal Project
                </span>
              </div>
            </div>
            {currentProject.thumbnailUrl && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex-shrink-0">
                <img 
                  src={currentProject.thumbnailUrl} 
                  alt="Project thumbnail" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Project Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">About This Project</h3>
            <p className="text-white/80 leading-relaxed text-lg">{currentProject.description}</p>
          </div>

          {/* Skills & Technologies */}
          {currentProject.skills && currentProject.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-3">
                {currentProject.skills.map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-100 text-sm font-medium hover:bg-blue-500/30 transition-all duration-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Media Gallery */}
          {currentProject.mediaUrls && currentProject.mediaUrls.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Project Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProject.mediaUrls.map((media: string, index: number) => (
                  <div key={index} className="group relative aspect-video backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300">
                    <img 
                      src={media} 
                      alt={`Project media ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Links */}
          {currentProject.links && currentProject.links.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Project Links</h3>
              <div className="space-y-3">
                {currentProject.links.map((link: { label: string, url: string }, index: number) => (
                  <a 
                    key={index}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 group"
                  >
                    {link.label.toLowerCase().includes('github') ? (
                      <Github className="h-5 w-5 mr-3 text-white/70 group-hover:text-white" />
                    ) : (
                      <Globe className="h-5 w-5 mr-3 text-white/70 group-hover:text-white" />
                    )}
                    <span className="text-white/80 group-hover:text-white font-medium">{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team & Collaborators Section */}
        {collaborators && collaborators.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-6">Team & Collaborators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((collaborator: any, index: number) => (
                <div key={index} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src="" alt={collaborator.name} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {collaborator.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">{collaborator.name}</h4>
                      <p className="text-white/60 text-sm">{collaborator.role}</p>
                    </div>
                  </div>
                  {collaborator.profileLink && (
                    <a 
                      href={collaborator.profileLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Endorsements Section */}
        {endorsements && endorsements.length > 0 && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-6">Project Endorsements</h3>
            <div className="space-y-6">
              {endorsements.map((endorsement: any, index: number) => (
                <div key={index} className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6">
                  <div className="flex items-start mb-4">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src="" alt={endorsement.endorserName} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {endorsement.endorserName?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{endorsement.endorserName}</h4>
                      <p className="text-white/60 text-sm">{endorsement.endorserTitle}</p>
                    </div>
                  </div>
                  <p className="text-white/80 italic">"{endorsement.content}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4 inline-block">
            <p className="text-white/60 text-sm">
              Created {format(new Date(currentProject.createdAt), 'PPP')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const [view, setView] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const userId = isDemoMode ? 1 : user?.uid;
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const projectIdParam = params.get('projectId');
    
    if (viewParam === 'project' && projectIdParam) {
      setView('project');
      setProjectId(projectIdParam);
    }
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: [`/api/projects/user/${userId}`],
    enabled: !!userId
  });

  const { data: workExperiences = [] } = useQuery({
    queryKey: [`/api/work-experiences/user/${userId}`],
    enabled: !!userId
  });

  const { data: educations = [] } = useQuery({
    queryKey: [`/api/educations/user/${userId}`],
    enabled: !!userId
  });

  const { data: skills = [] } = useQuery({
    queryKey: [`/api/skills/user/${userId}`],
    enabled: !!userId
  });

  const { data: services = [] } = useQuery({
    queryKey: [`/api/services/user/${userId}`],
    enabled: !!userId
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const projectIdParam = params.get('projectId');
    
    if (viewParam === 'project' && projectIdParam) {
      setView('project');
      setProjectId(projectIdParam);
    }
  }, []);

  const handleBackToDashboard = () => {
    setView(null);
    setProjectId(null);
    setLocation('/dashboard');
  };

  if (!isAuthenticated && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h2>
          <Button onClick={() => setLocation('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const profileCompletionPercentage = calculateOverallProfileCompletion({
    user,
    workExperiences,
    educations,
    skills,
    projects,
    services
  });

  if (view === 'project' && projectId) {
    return <ProjectDetailView projectId={projectId} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Button onClick={() => setLocation('/profile')}>
                Complete Profile
              </Button>
            </div>
            
            {profileCompletionPercentage < 80 && (
              <div className="mb-6">
                <ProfileCompletion percentage={profileCompletionPercentage} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <Button 
                    className="mt-4 w-full" 
                    onClick={() => setLocation('/profile?section=projects')}
                  >
                    Manage Projects
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{workExperiences.length}</p>
                  <Button 
                    className="mt-4 w-full" 
                    onClick={() => setLocation('/profile?section=experience')}
                  >
                    Update Experience
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{skills.length}</p>
                  <Button 
                    className="mt-4 w-full" 
                    onClick={() => setLocation('/profile?section=skills')}
                  >
                    Manage Skills
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}