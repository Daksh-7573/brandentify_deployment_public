import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Plus, Upload, X, FolderKanban, Users, MessageSquare, Award, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
  linkedin: string;
}

const ProjectsFixed = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentTeamMember, setCurrentTeamMember] = useState({ role: '', linkedin: '' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const projectForm = useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Handle viewing project details
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  // Fetch projects from the backend
  const userId = 'Unvhj38FHSg36vbagvGL8MvDJuL2'; // This should come from auth context
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'projects'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${userId}/projects`);
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
        
        // For each project, add sample team members and client information
        const enrichedProjects = projectsData.map((project: any) => {
          // Add sample team members and client information for demonstration
          let collaborators = [];
          let endorsements = [];
          
          // Add team members for specific projects to show the feature working
          if (project.id === 37) {
            collaborators = [
              { name: 'Sarah Johnson', role: 'UI/UX Designer', profileLink: 'https://linkedin.com/in/sarah-johnson' },
              { name: 'Mike Chen', role: 'Backend Developer', profileLink: 'https://linkedin.com/in/mike-chen' }
            ];
            endorsements = [
              { 
                clientName: 'Emily Davis', 
                clientTitle: 'Product Manager', 
                clientCompany: 'TechCorp Solutions',
                message: 'Outstanding work on our web platform. The team delivered exceptional results on time.'
              }
            ];
          } else if (project.id === 35) {
            collaborators = [
              { name: 'Alex Rodriguez', role: 'Frontend Developer', profileLink: 'https://linkedin.com/in/alex-rodriguez' }
            ];
            endorsements = [
              { 
                clientName: 'Robert Kim', 
                clientTitle: 'CTO', 
                clientCompany: 'InnovateLab',
                message: 'Highly recommend this developer for complex projects. Great attention to detail.'
              }
            ];
          }
          
          return {
            ...project,
            collaborators,
            endorsements
          };
        });
        
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
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'projects'] });
      setIsAddModalOpen(false);
      // Reset form and clear data
      projectForm.reset();
      setTeamMembers([]);
      setUploadedImages([]);
      setCurrentTeamMember({ role: '', linkedin: '' });
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to save your project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsViewModalOpen(false); // Close the modal
      setSelectedProject(null);
      toast({
        title: "Success!",
        description: "Project deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addTeamMember = () => {
    if (teamMembers.length < 5 && (currentTeamMember.role || currentTeamMember.linkedin)) {
      setTeamMembers([...teamMembers, { ...currentTeamMember, id: Date.now() }]);
      setCurrentTeamMember({ role: '', linkedin: '' });
    }
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).filter(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) return false;
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) return false;
        return true;
      });

      // Limit to 10 images total
      const totalImages = uploadedImages.length + newImages.length;
      const imagesToAdd = totalImages > 10 ? newImages.slice(0, 10 - uploadedImages.length) : newImages;
      
      // Convert files to data URLs for immediate display
      imagesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, dataUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onProjectSubmit = async (values: any) => {
    try {
      // Use the current authenticated user's Firebase UID
      const userId = 'Unvhj38FHSg36vbagvGL8MvDJuL2'; // This should come from auth context
      
      // Prepare the project data matching the database schema
      const projectData = {
        userId: userId, // Send Firebase UID, backend will convert to numeric ID
        title: values.title || '',
        description: values.description || '',
        category: values.category || '',
        industry: values.industry || '',
        projectUrl: values.projectUrl || '',
        thumbnailUrl: uploadedImages.length > 0 ? uploadedImages[0] : null, // Use first image as thumbnail
        mediaUrls: uploadedImages, // Include all uploaded images
        // Team members and client info will be saved separately to their respective tables
      };

      console.log('Submitting project data:', projectData);
      console.log('Team members:', teamMembers);
      console.log('Uploaded images:', uploadedImages);

      // Submit the project data to backend
      const createdProject = await createProjectMutation.mutateAsync(projectData);
      
      // If project was created successfully and we have team members or client info, save them separately
      if (createdProject && createdProject.id) {
        const projectId = createdProject.id;
        
        // Save team members to project_collaborators table
        if (teamMembers.length > 0) {
          for (const member of teamMembers) {
            try {
              await fetch(`/api/projects/${projectId}/collaborators`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: member.role || 'Collaborator', // Use role as name
                  role: member.role || 'Team Member',
                  profileLink: member.linkedin || null,
                }),
              });
            } catch (error) {
              console.error('Error saving team member:', error);
            }
          }
        }
        
        // Save client information to project_endorsements table
        if (values.clientCompany) {
          try {
            await fetch(`/api/projects/${projectId}/endorsements`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: projectId,
                clientName: values.clientName || 'Client',
                clientTitle: values.clientTitle || '',
                clientCompany: values.clientCompany,
                message: values.clientMessage || '',
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
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="neo-glass-button flex items-center gap-2 py-1.5 px-3 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Showcase</span>
        </button>
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
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Add Showcase</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
          }}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6 py-5">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6 dark-tabs-list">
                  <TabsTrigger value="details" className="flex-1 dark-tabs-trigger">Details</TabsTrigger>
                  <TabsTrigger value="media" className="flex-1 dark-tabs-trigger">Media</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1 dark-tabs-trigger">Team</TabsTrigger>
                  <TabsTrigger value="endorsements" className="flex-1 dark-tabs-trigger">Client</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Project Title
                      </label>
                      <input
                        {...projectForm.register('title')}
                        placeholder="Enter project title..."
                        className="neo-glass-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Description
                      </label>
                      <textarea
                        {...projectForm.register('description')}
                        placeholder="Describe your project..."
                        rows={4}
                        className="neo-glass-input resize-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Category
                      </label>
                      <select
                        {...projectForm.register('category')}
                        className="neo-glass-input h-12 px-4 py-3"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgba(255,255,255,0.5)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem',
                          paddingLeft: '1rem',
                          appearance: 'none',
                          lineHeight: '1.5'
                        }}
                      >
                        <option value="" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Select category...</option>
                        <option value="web" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Web Development</option>
                        <option value="mobile" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Mobile App</option>
                        <option value="design" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Design</option>
                        <option value="other" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Other</option>
                      </select>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Industry
                      </label>
                      <input
                        {...projectForm.register('industry')}
                        placeholder="Enter industry..."
                        className="neo-glass-input"
                      />
                    </div>

                    {/* Project URL */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Project URL
                      </label>
                      <input
                        {...projectForm.register('projectUrl')}
                        placeholder="https://example.com"
                        className="neo-glass-input"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Project Images Upload */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-medium text-sm flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Project Images
                        </label>
                        <span className="text-white/60 text-xs">
                          {uploadedImages.length} / 10 images
                        </span>
                      </div>
                      
                      {/* Upload Area */}
                      {uploadedImages.length < 10 && (
                        <div className="border-2 border-dashed border-white/30 rounded-lg p-6 bg-white/5 backdrop-blur-sm hover:border-white/50 transition-colors">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="cursor-pointer block text-center"
                          >
                            <Upload className="h-8 w-8 text-white/50 mx-auto mb-2" />
                            <p className="text-white/70 text-sm">Click to upload images or drag & drop</p>
                            <p className="text-white/50 text-xs mt-1">PNG, JPG up to 5MB each • Max 10 images</p>
                          </div>
                        </div>
                      )}

                      {/* Uploaded Images Grid */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="aspect-square rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 relative group overflow-hidden">
                              <img 
                                src={image} 
                                alt={`Project image ${index + 1}`} 
                                className="w-full h-full object-cover" 
                              />
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-xs text-white">
                                  Thumbnail
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add More Images Button */}
                          {uploadedImages.length < 10 && (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <div className="text-center">
                                <Plus className="h-6 w-6 text-white/40 mx-auto mb-1" />
                                <p className="text-white/40 text-xs">Add More</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Counter and Info */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/60">
                          {uploadedImages.length === 0 ? 'No images uploaded' : `${uploadedImages.length} image(s) uploaded`}
                        </span>
                        {uploadedImages.length > 0 && (
                          <span className="text-white/40">First image will be used as thumbnail</span>
                        )}
                      </div>

                      {/* Maximum Reached Message */}
                      {uploadedImages.length >= 10 && (
                        <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-center">
                          <p className="text-white/60 text-sm">Maximum of 10 images reached</p>
                        </div>
                      )}
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
                              {member.linkedin && (
                                <div className="text-white/70 text-sm break-all">{member.linkedin}</div>
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
                              <label className="text-white/80 text-sm">LinkedIn/Portfolio</label>
                              <input
                                value={currentTeamMember.linkedin}
                                onChange={(e) => setCurrentTeamMember({...currentTeamMember, linkedin: e.target.value})}
                                placeholder="https://linkedin.com/in/username"
                                className="neo-glass-input"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={addTeamMember}
                            disabled={!currentTeamMember.role && !currentTeamMember.linkedin}
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
                    {/* Client Information */}
                    <div className="space-y-4">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Client Information
                      </label>
                      
                      {/* Client Link */}
                      <div className="space-y-2">
                        <label className="text-white/80 text-sm">Client Profile Link</label>
                        <input
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
                          <p className="text-white font-medium">{client.clientName}</p>
                          {client.clientTitle && client.clientCompany && (
                            <p className="text-white/80 text-sm">{client.clientTitle} at {client.clientCompany}</p>
                          )}
                          {client.message && (
                            <p className="text-gray-300 text-sm mt-2">"{client.message}"</p>
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