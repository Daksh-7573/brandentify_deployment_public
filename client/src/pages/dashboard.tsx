import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
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

// Project Detail Component
function ProjectDetailView({ projectId, onBack }: { projectId: string, onBack: () => void }) {
  // Initialize local state for instant showing of project before React Query completes
  const [initialLoad, setInitialLoad] = useState(true);
  const [localProject, setLocalProject] = useState<any>(null);
  
  // Fast direct fetch on component mount for immediate rendering
  useEffect(() => {
    const fetchProjectFast = async () => {
      try {
        // First try to use cache if available
        // @ts-ignore
        if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[projectId]) {
          // @ts-ignore
          setLocalProject(window.__PROJECT_CACHE__[projectId]);
          setInitialLoad(false);
          return;
        }
        
        // Otherwise fetch directly
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setLocalProject(data);
          // Update cache for future use
          // @ts-ignore
          window.__PROJECT_CACHE__ = window.__PROJECT_CACHE__ || {};
          // @ts-ignore
          window.__PROJECT_CACHE__[projectId] = data;
        }
      } catch (error) {
        console.error('Fast fetch error:', error);
      } finally {
        // Always ensure we stop showing the loading state
        setInitialLoad(false);
      }
    };
    
    fetchProjectFast();
  }, [projectId]);
  
  // Use React Query for proper data management (runs in parallel with fast fetch)
  const { data: project, isLoading: loading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    
    // Add prefetching to improve loading speed  
    initialData: () => {
      // Return cached data if it exists in window.__PROJECT_CACHE__
      // @ts-ignore
      if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[projectId]) {
        // @ts-ignore
        return window.__PROJECT_CACHE__[projectId];
      }
      return undefined;
    },
    
    // Update local state when query succeeds
    onSuccess: (data) => {
      setLocalProject(data);
      setInitialLoad(false);
    }
  });

  // Show interactive skeleton UI instead of spinner during loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" className="mr-2 opacity-70">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 w-[200px] bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-[150px] bg-gray-100 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="h-5 w-32 bg-gray-200 mb-3 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <div className="h-5 w-40 bg-gray-200 mb-3 rounded animate-pulse"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="h-5 w-32 bg-gray-200 mb-3 rounded animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="flex justify-between items-center w-full">
              <div className="h-5 w-40 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h3>
            <p className="text-gray-500">{error}</p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
            <p className="text-gray-500">The requested project could not be found.</p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center mb-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Project Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <CardDescription className="mt-2 text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {project.startDate && format(new Date(project.startDate), 'MMM yyyy')} - 
                {project.endDate ? format(new Date(project.endDate), 'MMM yyyy') : 'Present'}
              </CardDescription>
            </div>
            <Badge variant={project.status === 'completed' ? 'default' : 'outline'} className="capitalize">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
          
          {project.skills && project.skills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {project.mediaUrls && project.mediaUrls.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Project Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.mediaUrls.map((media: string, index: number) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={media} 
                      alt={`Project media ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {project.links && project.links.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Project Links</h3>
              <div className="space-y-2">
                {project.links.map((link: { label: string, url: string }, index: number) => (
                  <div key={index} className="flex items-center">
                    {link.label.toLowerCase().includes('github') ? (
                      <Github className="h-4 w-4 mr-2" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Created by User #{project.userId}</span>
            </div>
            <Button>
              <FileCode className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const [_, setLocation] = useLocation();
  const [view, setView] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const projectIdParam = params.get('projectId');
    
    if (viewParam) setView(viewParam);
    if (projectIdParam) setProjectId(projectIdParam);
  }, []);
  
  // Use TanStack Query to fetch user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/users/${userId}`);
      if (response.status === 404) return null;
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user experiences
  const { data: experiences = [] } = useQuery({
    queryKey: [`/api/users/${userId}/experiences`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/experiences`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user education
  const { data: educations = [] } = useQuery({
    queryKey: [`/api/users/${userId}/educations`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/educations`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user skills
  const { data: skills = [] } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/skills`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Fetch user projects
  const { data: projects = [] } = useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/users/${userId}/projects`);
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Calculate profile completion percentage
  const profileCompletionPercentage = calculateOverallProfileCompletion(
    userData,
    experiences,
    educations,
    skills,
    projects
  );

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Function to clear view parameters and go back to dashboard
  const handleBackToDashboard = () => {
    // Use wouter for client-side navigation
    const [_, setLocation] = useLocation();
    // Update URL without parameters
    setLocation('/dashboard');
    // Reset the local state
    setView(null);
    setProjectId(null);
  };
  
  // Create a page transition component
  const PageTransition = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="animate-fadeIn transition-all duration-300">
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        {/* Sidebar */}
        <Sidebar activePage="dashboard" />

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-4xl">
            {view === 'project' && projectId ? (
              <ProjectDetailView 
                projectId={projectId} 
                onBack={handleBackToDashboard}
              />
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                
                {/* Completion Progress */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Profile Completion</h2>
                      <span className="text-sm font-medium text-primary">{profileCompletionPercentage}%</span>
                    </div>
                    <ProfileCompletion percentage={profileCompletionPercentage} />
                    <p className="mt-3 text-sm text-gray-500">Complete your profile to get more accurate job matches and career insights.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                      onClick={() => setLocation('/profile')}
                    >
                      Complete Profile
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Dashboard Message */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to Your Dashboard</h2>
                    <p className="text-gray-600">This is your central hub for monitoring your profile's progress and upcoming activities.</p>
                    <p className="text-gray-600 mt-2">Check your profile for personalized career insights and job matches.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                      onClick={() => setLocation('/profile')}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Show right sidebar only on the main dashboard view */}
        {view !== 'project' && <RightSidebar />}
      </div>
    </div>
  );
}
