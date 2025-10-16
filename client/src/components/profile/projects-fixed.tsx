import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Plus, Upload, X, FolderKanban, Users, MessageSquare, Award, Trash2, Pencil } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { IndustryCombobox } from '@/components/ui/industry-combobox';

interface Project {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[] | string | null;
  userId: number;
  clientInfo?: string | null;
  teamMembers?: TeamMember[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface TeamMember {
  id: number;
  role: string;
  brandentifier: string;
}

const ProjectsFixed = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentTeamMember, setCurrentTeamMember] = useState({ role: '', brandentifier: '' });
  
  // Media state management
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectVideo, setProjectVideo] = useState<File | null>(null);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [mediaErrors, setMediaErrors] = useState<{ images?: string; video?: string }>({});
  
  const projectForm = useForm();
  const multipleImagesInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Handle viewing project details
  const handleViewProject = async (project: Project) => {
    console.log('Opening project details for:', project);
    
    try {
      // Fetch fresh team members and client information from database
      console.log(`Making API calls to /api/projects/${project.id}/collaborators and /api/projects/${project.id}/endorsements`);
      
      const [collaboratorsResponse, endorsementsResponse] = await Promise.all([
        fetch(`/api/projects/${project.id}/collaborators`),
        fetch(`/api/projects/${project.id}/endorsements`)
      ]);
      
      console.log('Collaborators response status:', collaboratorsResponse.status, collaboratorsResponse.statusText);
      console.log('Endorsements response status:', endorsementsResponse.status, endorsementsResponse.statusText);
      
      const collaborators = collaboratorsResponse.ok ? await collaboratorsResponse.json() : [];
      const endorsements = endorsementsResponse.ok ? await endorsementsResponse.json() : [];
      
      console.log('Fresh project collaborators:', collaborators);
      console.log('Fresh project endorsements:', endorsements);
      
      // Update project with fresh data
      const updatedProject = {
        ...project,
        collaborators,
        endorsements
      };
      
      setSelectedProject(updatedProject);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      // Fallback to existing project data
      setSelectedProject(project);
      setIsViewModalOpen(true);
    }
  };

  // Fetch projects from the backend using current authenticated user
  // Use consistent user ID logic matching the profile page  
  const userIdentifier = user?.id?.toString() || user?.username || user?.uid || '1';
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['/api/users', userIdentifier, 'projects'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${userIdentifier}/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        let projectsData;
        try {
          projectsData = await response.json();
        } catch (parseError) {
          console.error('Error parsing projects response:', parseError);
          return [];
        }
        
        if (!Array.isArray(projectsData)) {
          console.error('Projects data is not an array:', projectsData);
          return [];
        }
        
        // Fetch team members and client information for each project from the database
        const enrichedProjects = await Promise.all(
          projectsData.map(async (project: any) => {
            try {
              // Fetch collaborators for this project
              const collaboratorsResponse = await fetch(`/api/projects/${project.id}/collaborators`);
              const collaborators = collaboratorsResponse.ok ? await collaboratorsResponse.json() : [];
              
              // Fetch endorsements for this project
              const endorsementsResponse = await fetch(`/api/projects/${project.id}/endorsements`);
              const endorsements = endorsementsResponse.ok ? await endorsementsResponse.json() : [];
              
              console.log(`Project ${project.id} - Collaborators:`, collaborators, 'Endorsements:', endorsements);
              
              return {
                ...project,
                collaborators,
                endorsements
              };
            } catch (error) {
              console.error(`Error fetching project data for project ${project.id}:`, error);
              return {
                ...project,
                collaborators: [],
                endorsements: []
              };
            }
          })
        );
        
        console.log('Final enriched projects:', enrichedProjects);
        return enrichedProjects;
        
      } catch (error) {
        console.error('Error in projects query:', error);
        return [];
      }
    }
  });
  
  // Create the mutation for saving projects to backend
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      console.log('Sending project data to API:', projectData);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Try to parse the error message from the server response
        let errorMessage = "Failed to save your project. Please try again.";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If parsing fails, use the raw error text or default message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your project showcase has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier, 'projects'] });
      setIsAddModalOpen(false);
      // Reset form and clear data
      projectForm.reset();
      setTeamMembers([]);
      setProjectImages([]);
      setCurrentTeamMember({ role: '', brandentifier: '' });
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      
      // Check if it's a project limit message
      const errorMessage = error.message || "Failed to save your project. Please try again.";
      if (errorMessage.includes("Max 6 projects")) {
        toast({
          title: "Project Limit Reached",
          description: errorMessage,
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  });

  // Update mutation for editing existing projects
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, projectData }: { id: number; projectData: any }) => {
      console.log(`Updating project ${id} with data:`, projectData);
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorMessage = "Failed to update your project. Please try again.";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your project showcase has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier, 'projects'] });
      setIsAddModalOpen(false);
      setEditingProjectId(null); // Clear editing state
      projectForm.reset();
      setTeamMembers([]);
      setProjectImages([]);
      setCurrentTeamMember({ role: '', brandentifier: '' });
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update your project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      // Handle 404 as success since the project doesn't exist anyway
      if (response.status === 404) {
        return { message: 'Project already deleted or does not exist' };
      }
      
      if (!response.ok) throw new Error('Failed to delete project');
      return response.json();
    },
    onMutate: async (projectId: number) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/users', userIdentifier, 'projects'] });
      
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(['/api/users', userIdentifier, 'projects']);
      
      // Optimistically update to remove the project immediately
      queryClient.setQueryData(['/api/users', userIdentifier, 'projects'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((project: Project) => project.id !== projectId);
      });
      
      // Close the modal immediately
      setIsViewModalOpen(false);
      setSelectedProject(null);
      
      // Return context with the previous projects for rollback
      return { previousProjects };
    },
    onSuccess: () => {
      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier, 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success!",
        description: "Project deleted successfully.",
      });
    },
    onError: (error: any, projectId, context) => {
      console.error('Error deleting project:', error);
      // Don't rollback for 404 - the project is gone either way
      // For other errors, rollback to previous state
      if (context?.previousProjects) {
        queryClient.setQueryData(['/api/users', userIdentifier, 'projects'], context.previousProjects);
      }
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addTeamMember = () => {
    if (teamMembers.length < 5 && (currentTeamMember.role || currentTeamMember.brandentifier)) {
      setTeamMembers([...teamMembers, { ...currentTeamMember, id: Date.now() }]);
      setCurrentTeamMember({ role: '', brandentifier: '' });
    }
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  // Media handlers from Industry Pulse
  const handleImagesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setProjectImages(prev => [...prev, ...filesArray]);
      setMediaErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const handleVideoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProjectVideo(event.target.files[0]);
      setMediaErrors(prev => ({ ...prev, video: undefined }));
    }
  };

  const removeProjectImage = (index: number) => {
    setProjectImages(prev => prev.filter((_, i) => i !== index));
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > index) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  const removeProjectVideo = () => {
    setProjectVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSelectFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
  };

  const onProjectSubmit = async (values: any) => {
    try {
      // Use the current authenticated user's identifier
      console.log('Using user for project creation:', { user, userIdentifier });
      
      // Prepare the project data matching the database schema
      const projectData = {
        userId: parseInt(userIdentifier), // Convert to number for backend validation
        title: values.title || '',
        description: values.description || '',
        category: values.category || '',
        industry: values.industry || '',
        projectUrl: values.projectUrl || '',
        thumbnailUrl: null, // TODO: Implement proper file upload with FormData
        mediaUrls: [], // TODO: Implement proper file upload with FormData
        // Team members and client info will be saved separately to their respective tables
      };

      console.log('Submitting project data:', projectData);
      console.log('Team members:', teamMembers);
      console.log('Project images:', projectImages);

      // Submit the project data to backend - use update if editing, create if new
      let savedProject;
      if (editingProjectId) {
        console.log(`Updating existing project ${editingProjectId}`);
        savedProject = await updateProjectMutation.mutateAsync({ id: editingProjectId, projectData });
      } else {
        console.log('Creating new project');
        savedProject = await createProjectMutation.mutateAsync(projectData);
      }
      
      // If project was saved successfully and we have team members or client info, save them separately
      if (savedProject && (savedProject.id || editingProjectId)) {
        const projectId = savedProject.id || editingProjectId;
        
        // Save team members to project_collaborators table
        if (teamMembers.length > 0) {
          for (const member of teamMembers) {
            try {
              await fetch(`/api/project-collaborators`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  projectId: projectId,
                  name: member.role || 'Collaborator', // Use role as name
                  role: member.role || 'Team Member',
                  profileLink: member.brandentifier || null,
                }),
              });
            } catch (error) {
              console.error('Error saving team member:', error);
            }
          }
        }
        
        // Save client information to project_endorsements table
        if (values.clientProfileLink) {
          try {
            await fetch(`/api/project-endorsements`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: projectId,
                profileLink: values.clientProfileLink,
              }),
            });
          } catch (error) {
            console.error('Error saving client information:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Error",
        description: "Failed to save your project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            Project Showcase
          </h2>
          <p className="text-sm text-gray-300">Highlight your best work and project achievements</p>
        </div>
        {projects && projects.length >= 6 ? (
          <div className="p-3 text-center border border-amber-500/30 rounded-lg bg-amber-500/10 backdrop-blur-sm shadow-neo">
            <p className="text-amber-400 font-medium text-sm">Maximum of 6 projects reached</p>
            <p className="text-gray-300 mt-1 text-xs">
              Please delete an existing project before adding a new one.
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="neo-glass-button flex items-center gap-2 py-1.5 px-3 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Showcase</span>
          </button>
        )}
      </div>

      {/* Projects List */}
      {isProjectsLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center">
            <FolderKanban className="h-10 w-10 text-gray-400/50 mb-4" />
            <p className="text-gray-400">No projects yet. Add your first showcase project!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <div key={project.id} className="neo-glass-card rounded-lg border border-white/10 hover:border-white/20 transition-all overflow-hidden cursor-pointer" onClick={() => handleViewProject(project)}>
              {/* Project Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 overflow-hidden">
                {project.thumbnailUrl ? (
                  <img 
                    src={project.thumbnailUrl} 
                    alt={project.title || 'Project thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderKanban className="h-16 w-16 text-gray-400/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">{project.title || 'Untitled Project'}</h3>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Award className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {project.description || 'No description available'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">
                      {project.category}
                    </span>
                  )}
                  {project.industry && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      {project.industry}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No date'}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProject(project);
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) {
          setEditingProjectId(null); // Clear editing state when closing
          projectForm.reset();
          setTeamMembers([]);
          setProjectImages([]);
          setProjectVideo(null);
          setFeaturedImageIndex(0);
          setExistingMedia([]);
          setMediaErrors({});
          if (multipleImagesInputRef.current) multipleImagesInputRef.current.value = '';
          if (videoInputRef.current) videoInputRef.current.value = '';
        }
      }}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {editingProjectId ? 'Edit Showcase' : 'Add Showcase'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
          }}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6 py-5">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6 dark-tabs-list">
                  <TabsTrigger value="details" className="flex-1 dark-tabs-trigger">Details</TabsTrigger>
                  <TabsTrigger value="images" className="flex-1 dark-tabs-trigger">Images</TabsTrigger>
                  <TabsTrigger value="videos" className="flex-1 dark-tabs-trigger">Videos</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1 dark-tabs-trigger">Team</TabsTrigger>
                  <TabsTrigger value="endorsements" className="flex-1 dark-tabs-trigger">Client</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm">Title</label>
                      <input
                        {...projectForm.register('title')}
                        placeholder="Project title"
                        className="neo-glass-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm">Description</label>
                      <textarea
                        {...projectForm.register('description')}
                        placeholder="Describe your project"
                        rows={5}
                        className="neo-glass-input resize-none"
                      />
                    </div>

                    {/* Category and Industry Row */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Category */}
                      <div className="space-y-2">
                        <label className="text-white font-medium text-sm">Category</label>
                        <input
                          {...projectForm.register('category')}
                          placeholder="e.g., Web Development"
                          className="neo-glass-input"
                        />
                      </div>

                      {/* Industry */}
                      <div className="space-y-2">
                        <label className="text-white font-medium text-sm">Industry</label>
                        <IndustryCombobox
                          value={projectForm.watch('industry') || ''}
                          onChange={(value) => projectForm.setValue('industry', value)}
                          triggerClassName="neo-glass-input"
                          contentClassName="bg-[rgba(18,18,18,0.95)] text-white border-white/20"
                        />
                      </div>
                    </div>

                    {/* Start Date and Project URL Row */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <label className="text-white font-medium text-sm">Start Date</label>
                        <input
                          type="date"
                          {...projectForm.register('startDate')}
                          className="neo-glass-input"
                        />
                      </div>

                      {/* Project URL */}
                      <div className="space-y-2">
                        <label className="text-white font-medium text-sm">Project URL</label>
                        <input
                          {...projectForm.register('projectUrl')}
                          placeholder="https://example.com"
                          className="neo-glass-input"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Project Images Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-white font-medium text-sm">Project Images</label>
                        <div className="text-white/60 text-xs">Max 10 images</div>
                      </div>
                      
                      {/* Information about thumbnails */}
                      <div className="p-3 rounded-md text-sm space-y-1 bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="font-medium text-white">About Thumbnails:</p>
                        <p className="text-white/70">
                          Select one image as your project thumbnail by clicking the star icon. This image will be the main preview shown in your profile.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <input
                            ref={multipleImagesInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImagesSelected}
                            className="neo-glass-input file:bg-[#1DB954] file:text-black file:hover:bg-[#1DB954]/90"
                          />
                          {mediaErrors?.images && (
                            <p className="text-sm text-red-400">{mediaErrors.images}</p>
                          )}
                        </div>
                        
                        {/* Selected images preview */}
                        {projectImages.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">New Images</div>
                              {projectImages.length > 0 && 0 <= featuredImageIndex && featuredImageIndex < 1000 && (
                                <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954]">
                                  Thumbnail selected from new images
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {projectImages.map((file, index) => (
                                <div key={`new-${index}`} className="relative group">
                                  <div className={`border rounded-md overflow-hidden aspect-square ${featuredImageIndex === index ? 'ring-2 ring-[#1DB954] border-[#1DB954]/40' : 'border-white/20'}`}>
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                    <button
                                      type="button"
                                      className="h-8 w-8 bg-black/60 border border-white/20 text-white hover:bg-red-900/80 rounded flex items-center justify-center"
                                      onClick={() => removeProjectImage(index)}
                                      title="Remove image"
                                    >
                                      ✕
                                    </button>
                                    <button
                                      type="button"
                                      className={`h-8 w-8 rounded flex items-center justify-center ${featuredImageIndex === index ? 'bg-[#1DB954] text-black' : 'bg-white/20 text-white'}`}
                                      onClick={() => handleSelectFeaturedImage(index)}
                                      title="Set as thumbnail"
                                    >
                                      ★
                                    </button>
                                  </div>
                                  {featuredImageIndex === index && (
                                    <div className="absolute top-1 right-1 bg-[#1DB954] text-black rounded-full p-1" title="Current thumbnail">
                                      ★
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Existing images preview */}
                        {existingMedia.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">Existing Media</div>
                              {existingMedia.length > 0 && featuredImageIndex >= 1000 && (
                                <div className="ml-2 bg-[#1DB954]/20 text-[#1DB954] text-xs px-2 py-0.5 rounded-full">
                                  Thumbnail selected from existing images
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingMedia.map((url, index) => {
                                const existingMediaIndex = index + 1000;
                                const isExistingFeatured = featuredImageIndex === existingMediaIndex;
                                
                                return (
                                  <div key={`existing-${index}`} className="relative group">
                                    <div className={`border rounded-md overflow-hidden aspect-square ${isExistingFeatured ? 'ring-2 ring-[#1DB954]' : 'border-white/20'}`}>
                                      <img
                                        src={url}
                                        alt={`Media ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <button
                                        type="button"
                                        className={`h-8 w-8 rounded flex items-center justify-center ${isExistingFeatured ? 'bg-[#1DB954] text-black' : 'bg-white/20 text-white'}`}
                                        onClick={() => handleSelectFeaturedImage(existingMediaIndex)}
                                        title="Set as thumbnail"
                                      >
                                        ★
                                      </button>
                                    </div>
                                    {isExistingFeatured && (
                                      <div className="absolute top-1 right-1 bg-[#1DB954] text-black rounded-full p-1" title="Current thumbnail">
                                        ★
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Project Video Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-white font-medium text-sm">Project Video</label>
                        <div className="text-white/60 text-xs">Optional (~2.5 min max)</div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoSelected}
                            className="neo-glass-input file:bg-[#1DB954] file:text-black file:hover:bg-[#1DB954]/90"
                          />
                          {mediaErrors?.video && (
                            <p className="text-sm text-red-400">{mediaErrors.video}</p>
                          )}
                        </div>
                        
                        {/* Selected video preview */}
                        {projectVideo && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium text-white">Selected Video:</div>
                              <button
                                type="button"
                                onClick={removeProjectVideo}
                                className="px-3 py-1 text-sm bg-black/60 border border-white/20 text-white hover:bg-red-900/80 rounded"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="border rounded-md p-2 flex items-center gap-2 bg-white/5 backdrop-blur-sm border-white/10 text-white">
                              <Upload className="h-5 w-5 text-[#1DB954]" />
                              <span className="text-sm truncate">{projectVideo.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Team Members */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-medium text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Team Members
                        </label>
                        <span className="text-white/60 text-xs">
                          {teamMembers.length} / 5 members
                        </span>
                      </div>
                      
                      {/* Added Team Members List */}
                      {teamMembers.map((member) => (
                        <div key={member.id} className="space-y-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="text-white/90 font-medium">{member.role || 'Team Member'}</div>
                              {member.brandentifier && (
                                <div className="text-white/70 text-sm break-all">{member.brandentifier}</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTeamMember(member.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add New Team Member Form */}
                      {teamMembers.length < 5 && (
                        <div className="space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-white/80 text-sm">Role</label>
                              <input
                                value={currentTeamMember.role}
                                onChange={(e) => setCurrentTeamMember({...currentTeamMember, role: e.target.value})}
                                placeholder="e.g., Designer, Developer, Manager"
                                className="neo-glass-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-white/80 text-sm">Brandentifier Profile</label>
                              <input
                                value={currentTeamMember.brandentifier}
                                onChange={(e) => setCurrentTeamMember({...currentTeamMember, brandentifier: e.target.value})}
                                placeholder="https://brandentifier.replit.app/profile/username"
                                className="neo-glass-input"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={addTeamMember}
                            disabled={!currentTeamMember.role && !currentTeamMember.brandentifier}
                            className="w-full p-3 neo-glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm flex items-center justify-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Team Member
                          </button>
                        </div>
                      )}

                      {/* Maximum Reached Message */}
                      {teamMembers.length >= 5 && (
                        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-center">
                          <p className="text-white/60 text-sm">Maximum of 5 team members reached</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="endorsements" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Client Profile Link */}
                    <div className="space-y-4">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Client Information
                      </label>
                      
                      <div className="space-y-2">
                        <label className="text-white/80 text-sm">Client Profile Link</label>
                        <input
                          {...projectForm.register("clientProfileLink")}
                          placeholder="https://brandentifier.replit.app/profile/username"
                          className="neo-glass-input"
                        />
                        <p className="text-xs text-white/60">Add Brandentifier profile link of your client</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Form Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="px-6 py-3 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createProjectMutation.isPending ? 'Saving...' : 'Add Showcase'}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Project Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {selectedProject?.title || 'Project Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
            }}>
              {/* Project Thumbnail */}
              {selectedProject.thumbnailUrl && (
                <div className="mb-6">
                  <img 
                    src={selectedProject.thumbnailUrl} 
                    alt={selectedProject.title || 'Project thumbnail'}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {/* Project Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedProject.description || 'No description available'}
                  </p>
                </div>
                
                {/* Project Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-1">Category</h4>
                    <p className="text-gray-300">{selectedProject.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Industry</h4>
                    <p className="text-gray-300">{selectedProject.industry || 'Not specified'}</p>
                  </div>
                </div>
                
                {/* Team Members - Show placeholder if no data yet */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Team Members</h3>
                  {(selectedProject as any).collaborators && (selectedProject as any).collaborators.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(selectedProject as any).collaborators.map((member: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white font-medium">{member.role || 'Team Member'}</p>
                          <p className="text-white/80 text-sm">{member.name || 'Collaborator'}</p>
                          {member.profileLink && (
                            <a 
                              href={member.profileLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 border-dashed">
                      <p className="text-white/60 text-sm text-center">No team members added yet</p>
                    </div>
                  )}
                </div>

                {/* Client Information - Show placeholder if no data yet */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Client Information</h3>
                  {(selectedProject as any).endorsements && (selectedProject as any).endorsements.length > 0 ? (
                    <div>
                      {(selectedProject as any).endorsements.map((client: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                          {client.profileLink && (
                            <a 
                              href={client.profileLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                            >
                              View Client Profile
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 border-dashed">
                      <p className="text-white/60 text-sm text-center">No client information added yet</p>
                    </div>
                  )}
                </div>

                {/* Media Gallery */}
                {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Project Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(Array.isArray(selectedProject.mediaUrls) ? selectedProject.mediaUrls : []).map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Project media ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Project Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {selectedProject.projectUrl && (
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl"
                    >
                      Visit Project
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      // Wait for view modal to close, then open edit modal
                      setTimeout(() => {
                        // Set editing mode with project ID
                        setEditingProjectId(selectedProject.id);
                        
                        // Pre-fill the form with existing project data
                        projectForm.reset({
                          title: selectedProject.title,
                          description: selectedProject.description,
                          category: selectedProject.category,
                          industry: selectedProject.industry,
                          startDate: selectedProject.startDate,
                          projectUrl: selectedProject.projectUrl,
                          clientInfo: selectedProject.clientInfo
                        });
                        
                        // Load existing team members if available
                        if ((selectedProject as any).collaborators && (selectedProject as any).collaborators.length > 0) {
                          const existingTeamMembers = (selectedProject as any).collaborators.map((collab: any) => ({
                            id: collab.id,
                            role: collab.role || collab.name,
                            brandentifier: collab.profileLink || ''
                          }));
                          setTeamMembers(existingTeamMembers);
                        } else {
                          setTeamMembers([]);
                        }
                        
                        // Load existing media/images if available
                        if (selectedProject.mediaUrls && Array.isArray(selectedProject.mediaUrls)) {
                          setExistingMedia(selectedProject.mediaUrls);
                        } else {
                          setExistingMedia([]);
                        }
                        
                        setIsAddModalOpen(true);
                      }, 100);
                    }}
                    className="px-4 py-2 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-white/10 text-white font-medium rounded-md hover:bg-white/20 transition-all"
                  >
                    Close
                  </button>
                </div>
                
                {/* Delete Icon - Bottom Right Corner */}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                      deleteProjectMutation.mutate(selectedProject.id);
                    }
                  }}
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsFixed;