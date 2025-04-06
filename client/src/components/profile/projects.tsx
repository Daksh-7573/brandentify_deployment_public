import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Trash2, Plus, FolderKanban, CalendarIcon, ExternalLinkIcon, Star, X, CheckCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define schemas for forms
const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  projectUrl: z.string().url().nullable().optional().or(z.literal('')),
  mediaUrls: z.array(z.string()).nullable().optional(),
});

const collaboratorSchema = z.object({
  profileLink: z.string().min(1, { message: "Profile Link is required" }).url({ message: "Please enter a valid URL" }),
});

const endorsementSchema = z.object({
  profileLink: z.string().min(1, { message: "Client profile link is required" }).url({ message: "Please enter a valid URL" }),
});

// Define types
type ProjectFormValues = z.infer<typeof projectSchema>;
type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;
type EndorsementFormValues = z.infer<typeof endorsementSchema>;

interface Project {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[] | null;
  userId: number;
}

interface Collaborator {
  id: number;
  name: string;
  email: string | null;
  role: string;
  profileLink: string | null;
  userId: number | null;
  projectId: number;
  inviteStatus: string | null;
}

interface Endorsement {
  id: number;
  clientName: string;
  clientEmail: string | null;
  clientTitle: string | null;
  clientCompany: string | null;
  message: string | null;
  rating: number | null;
  isVerified: boolean | null;
  projectId: number;
}

export default function Projects() {
  const { user, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.uid || 0);
  const { toast } = useToast();
  
  // State for projects and current data
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [projectVideo, setProjectVideo] = useState<File | null>(null);
  const [mediaErrors, setMediaErrors] = useState<{images?: string, video?: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const multipleImagesInputRef = useRef<HTMLInputElement>(null);
  
  // Reference to hold the most recent data
  const latestProjectsRef = useRef<Project[]>([]);
  
  // Fetch projects from the API with advanced options
  const { data: serverProjects, isLoading, refetch } = useQuery({
    queryKey: [`/api/users/${userId}/projects`],
    enabled: !!userId,
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000, // Poll every second to keep data fresh
  });
  
  // Force a direct fetch every time the component renders
  useEffect(() => {
    async function directFetch() {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      console.log(`Projects - Directly fetching latest projects data (${timestamp})`);
      try {
        const response = await fetch(`/api/users/${userId}/projects?_=${timestamp}`, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const freshData = await response.json();
        console.log("Projects - Got direct fetch data:", freshData);
        // Force update
        if (freshData && Array.isArray(freshData)) {
          setProjects([...freshData]);
          // Update the ref as well
          latestProjectsRef.current = [...freshData];
        }
      } catch (error) {
        console.error("Error during direct projects fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const interval = setInterval(directFetch, 1000);
    return () => clearInterval(interval);
  }, [userId]); // Only re-run when userId changes
  
  // Initialize projects from serverProjects on first load
  useEffect(() => {
    if (serverProjects && Array.isArray(serverProjects) && serverProjects.length > 0) {
      console.log("Projects: Initial data from server:", serverProjects);
      setProjects(serverProjects);
      latestProjectsRef.current = serverProjects;
    }
  }, []);
  
  // Update projects state when server data changes
  useEffect(() => {
    if (serverProjects && Array.isArray(serverProjects)) {
      console.log("Projects received updated data:", serverProjects);
      
      // Always update our reference with the latest data
      latestProjectsRef.current = [...serverProjects];
      
      // Update the state too to trigger re-renders
      setProjects([...serverProjects]);
    }
  }, [serverProjects]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const displayProjects = projects.length > 0 ? projects : 
                       (latestProjectsRef.current.length > 0 ? latestProjectsRef.current : []);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Form setup
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: null,  // Changed from '' to null to match schema
      category: null,     // Changed from '' to null to match schema
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: null,   // Changed from '' to null to match schema
      mediaUrls: null,    // Changed from [] to null to match schema
    },
  });

  const collaboratorForm = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      profileLink: '',
    },
  });

  const endorsementForm = useForm<EndorsementFormValues>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      profileLink: '',
    },
  });

  // Load collaborators and endorsements when viewing a project
  useEffect(() => {
    if (currentProject) {
      loadCollaborators(currentProject.id);
      loadEndorsements(currentProject.id);
    }
  }, [currentProject]);

  const loadCollaborators = async (projectId: number) => {
    try {
      const response = await apiRequest('GET', `/api/projects/${projectId}/collaborators`);
      const data = await response.json();
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadEndorsements = async (projectId: number) => {
    try {
      const response = await apiRequest('GET', `/api/projects/${projectId}/endorsements`);
      const data = await response.json();
      setEndorsements(data);
    } catch (error) {
      console.error('Error loading endorsements:', error);
    }
  };
  
  // Action handlers
  const handleAdd = () => {
    setCurrentProject(null);
    projectForm.reset({
      title: '',
      description: null,
      category: null,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: null,
      mediaUrls: null,
    });
    setThumbnailFile(null);
    setThumbnailError(null);
    setProjectImages([]);
    setProjectVideo(null);
    setMediaErrors(null);
    
    // Reset all file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (multipleImagesInputRef.current) {
      multipleImagesInputRef.current.value = '';
    }
    
    setActiveTab('details');
    setIsAddModalOpen(true);
  };
  
  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description,
      category: project.category,
      startDate: project.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: project.projectUrl,
      mediaUrls: project.mediaUrls,
    });
    // Reset all file inputs when editing
    setThumbnailFile(null);
    setThumbnailError(null);
    setProjectImages([]);
    setProjectVideo(null);
    setMediaErrors(null);
    
    // Reset all file input elements
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (multipleImagesInputRef.current) {
      multipleImagesInputRef.current.value = '';
    }
    
    setActiveTab('details');
    setIsEditModalOpen(true);
  };
  
  const handleView = (project: Project) => {
    setCurrentProject(project);
    setActiveTab('details');
    setIsDetailModalOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/projects/${id}`);
      if (response.ok) {
        // Update local state immediately for responsiveness
        setProjects(projects.filter(p => p.id !== id));
        
        // Show success message
        toast({
          title: "Project deleted",
          description: "Your project has been deleted successfully",
        });
        
        // Refresh data
        refetch();
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete your project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onProjectSubmit = async (values: ProjectFormValues) => {
    if (!userId) return;
    
    // Validate thumbnail is required for new projects
    if (!currentProject && !thumbnailFile) {
      setThumbnailError("Project thumbnail is required");
      toast({
        title: "Validation Error",
        description: "Project thumbnail is required. Please upload an image.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate additional media files
    let validationFailed = false;
    const newMediaErrors: {images?: string, video?: string} = {};
    
    // Validate project images (max 10)
    if (projectImages.length > 10) {
      newMediaErrors.images = "Maximum 10 images allowed";
      validationFailed = true;
    }
    
    // Validate video file size for 120 seconds max (rough estimate - 2MB per minute as a baseline check)
    if (projectVideo && projectVideo.size > 4 * 1024 * 1024) {
      newMediaErrors.video = "Video exceeds maximum size (max ~120 seconds)";
      validationFailed = true;
    }
    
    if (validationFailed) {
      setMediaErrors(newMediaErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors with your media files.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous errors
    setThumbnailError(null);
    setMediaErrors(null);
    
    try {
      let response;
      let projectData: Project;
      
      if (currentProject) {
        // Update existing project
        response = await apiRequest('PUT', `/api/projects/${currentProject.id}`, values);
        projectData = await response.json();
        
        // If we have a thumbnail file, upload it
        if (thumbnailFile) {
          const formData = new FormData();
          formData.append('thumbnail', thumbnailFile);
          formData.append('projectId', projectData.id.toString());
          
          // Use fetch directly as apiRequest doesn't handle FormData
          const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            // Update the thumbnail URL
            projectData.thumbnailUrl = uploadResult.thumbnailUrl;
          }
        }
        
        // Handle additional media uploads (project images and video)
        if (projectImages.length > 0 || projectVideo) {
          const mediaFormData = new FormData();
          
          // Add project images
          projectImages.forEach((file, index) => {
            mediaFormData.append(`projectImage_${index}`, file);
          });
          
          // Add project video
          if (projectVideo) {
            mediaFormData.append('projectVideo', projectVideo);
          }
          
          mediaFormData.append('projectId', projectData.id.toString());
          mediaFormData.append('imageCount', projectImages.length.toString());
          
          // Use fetch directly for media uploads
          const mediaUploadResponse = await fetch('/api/projects/upload-media', {
            method: 'POST',
            body: mediaFormData,
          });
          
          if (mediaUploadResponse.ok) {
            const mediaUploadResult = await mediaUploadResponse.json();
            // Update the media URLs
            if (mediaUploadResult.mediaUrls) {
              projectData.mediaUrls = mediaUploadResult.mediaUrls;
            }
          }
        }
        
        // Update projects state
        setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
        setIsEditModalOpen(false);
        
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully",
        });
      } else {
        // Create new project
        const newProjectData = {
          ...values,
          userId,
        };
        
        // First create the project
        response = await apiRequest('POST', '/api/projects', newProjectData);
        projectData = await response.json();
        
        // If we have a thumbnail file, upload it (we already validated it exists above)
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile!);
        formData.append('projectId', projectData.id.toString());
        
        // Use fetch directly as apiRequest doesn't handle FormData
        const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          // Update the thumbnail URL
          projectData.thumbnailUrl = uploadResult.thumbnailUrl;
        }
        
        // Handle additional media uploads (project images and video)
        if (projectImages.length > 0 || projectVideo) {
          const mediaFormData = new FormData();
          
          // Add project images
          projectImages.forEach((file, index) => {
            mediaFormData.append(`projectImage_${index}`, file);
          });
          
          // Add project video
          if (projectVideo) {
            mediaFormData.append('projectVideo', projectVideo);
          }
          
          mediaFormData.append('projectId', projectData.id.toString());
          mediaFormData.append('imageCount', projectImages.length.toString());
          
          // Use fetch directly for media uploads
          const mediaUploadResponse = await fetch('/api/projects/upload-media', {
            method: 'POST',
            body: mediaFormData,
          });
          
          if (mediaUploadResponse.ok) {
            const mediaUploadResult = await mediaUploadResponse.json();
            // Update the media URLs
            if (mediaUploadResult.mediaUrls) {
              projectData.mediaUrls = mediaUploadResult.mediaUrls;
            }
          }
        }
        
        // Add to projects state
        setProjects([...projects, projectData]);
        setIsAddModalOpen(false);
        
        toast({
          title: "Project added",
          description: "Your project has been added successfully",
        });
      }
      
      // Reset form and all media files
      projectForm.reset();
      setThumbnailFile(null);
      setThumbnailError(null);
      setProjectImages([]);
      setProjectVideo(null);
      setMediaErrors(null);
      
      // Reset all file input elements
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      if (multipleImagesInputRef.current) {
        multipleImagesInputRef.current.value = '';
      }
      
      // Refresh data
      refetch();
      
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: `Failed to ${currentProject ? 'update' : 'save'} your project. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleAddCollaborator = async (values: CollaboratorFormValues) => {
    if (!currentProject) return;
    
    try {
      // Create a collaborator with just the profile link
      const collaboratorData = {
        profileLink: values.profileLink,
        name: "Team Member", // Default name for all team members
        role: "Collaborator", // Default role
        projectId: currentProject.id,
      };
      
      const response = await apiRequest('POST', '/api/project-collaborators', collaboratorData);
      const data = await response.json();
      
      setCollaborators([...collaborators, data]);
      collaboratorForm.reset();
      
      toast({
        title: "Success",
        description: "Team member added successfully!",
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollaborator = async (collaboratorId: number) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    
    try {
      await apiRequest('DELETE', `/api/project-collaborators/${collaboratorId}`);
      
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      
      toast({
        title: "Success",
        description: "Collaborator removed successfully!",
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: "Error",
        description: "Failed to remove collaborator. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddEndorsement = async (values: EndorsementFormValues) => {
    if (!currentProject) return;
    
    try {
      // Only send the client profile link - the rest of the fields will be populated 
      // when the client confirms the endorsement
      const endorsementData = {
        profileLink: values.profileLink,
        clientName: "Pending Client",  // Default name until confirmed
        isVerified: false,            // Not verified until confirmed
        projectId: currentProject.id,
      };
      
      const response = await apiRequest('POST', '/api/project-endorsements', endorsementData);
      const data = await response.json();
      
      setEndorsements([...endorsements, data]);
      endorsementForm.reset();
      
      toast({
        title: "Success",
        description: "Client invitation sent! The client will need to verify to appear in your project.",
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEndorsement = async (endorsementId: number) => {
    if (!confirm('Are you sure you want to remove this endorsement?')) return;
    
    try {
      await apiRequest('DELETE', `/api/project-endorsements/${endorsementId}`);
      
      setEndorsements(endorsements.filter(e => e.id !== endorsementId));
      
      toast({
        title: "Success",
        description: "Endorsement removed successfully!",
      });
    } catch (error) {
      console.error('Error removing endorsement:', error);
      toast({
        title: "Error",
        description: "Failed to remove endorsement. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Projects</CardTitle>
            <CardDescription>Showcase your professional projects and collaborations</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={handleAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : displayProjects && displayProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{project.title}</span>
                      {project.category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {project.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{project.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs px-2" 
                      onClick={() => handleView(project)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No projects added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Project Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
              <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={projectForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="My Amazing Project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Web Development, Design, etc." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your project, its goals, and your contributions" 
                            className="resize-none" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Project Date*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="projectUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Link to your project (GitHub, website, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel>Project Thumbnail*</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setThumbnailFile(file);
                            setThumbnailError(null);
                          }
                        }} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a preview image for your project (required)
                    </FormDescription>
                    {thumbnailError && <p className="text-sm font-medium text-destructive">{thumbnailError}</p>}
                    <FormMessage />
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Project Images (Optional, Max 10)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        ref={multipleImagesInputRef}
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 10) {
                            setMediaErrors(prev => ({...prev, images: "Maximum 10 images allowed"}));
                            return;
                          }
                          setProjectImages(files);
                          setMediaErrors(prev => ({...prev, images: undefined}));
                        }} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload up to 10 images to showcase your project
                    </FormDescription>
                    {mediaErrors?.images && <p className="text-sm font-medium text-destructive">{mediaErrors.images}</p>}
                    <FormMessage />
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Project Video (Optional, Max 120 sec)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check approximate video size (2MB/min is a rough estimate for decent quality)
                            if (file.size > 4 * 1024 * 1024) {
                              setMediaErrors(prev => ({...prev, video: "Video exceeds maximum size (max ~120 seconds)"}));
                              return;
                            }
                            setProjectVideo(file);
                            setMediaErrors(prev => ({...prev, video: undefined}));
                          }
                        }} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a short video (max 120 seconds) to demonstrate your project
                    </FormDescription>
                    {mediaErrors?.video && <p className="text-sm font-medium text-destructive">{mediaErrors.video}</p>}
                    <FormMessage />
                  </FormItem>
                </TabsContent>
                
                <TabsContent value="team" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Add Team Member</h3>
                    <Form {...collaboratorForm}>
                      <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                        <div className="space-y-4 border rounded-lg p-4">
                          <FormField
                            control={collaboratorForm.control}
                            name="profileLink"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Link*</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormDescription>
                                  Add Brandentifier profile link to connect with users
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" size="sm" className="mt-2">
                            Add Team Member
                          </Button>
                        </div>
                      </form>
                    </Form>
                    
                    <p className="text-sm text-muted-foreground">
                      You can add team members after saving the project
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="endorsements" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Add Client</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a client's profile link to invite them to endorse your project.
                    </p>
                    <Form {...endorsementForm}>
                      <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                        <div className="space-y-4 border rounded-lg p-4">
                          <FormField
                            control={endorsementForm.control}
                            name="profileLink"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Client Profile Link*</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Add Brandentifier profile link of your client
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="mt-2"
                          >
                            Add Client
                          </Button>
                        </div>
                      </form>
                    </Form>
                    <p className="text-xs text-muted-foreground italic">
                      Note: You'll need to save the project first before client endorsements can be processed.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Project
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Modal */}
      {currentProject && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <FormField
                      control={projectForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="My Amazing Project" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Web Development, Design, etc." {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your project, its goals, and your contributions" 
                              className="resize-none" 
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Project Date*</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={projectForm.control}
                      name="projectUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://example.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormDescription>
                            Link to your project (GitHub, website, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel>Project Thumbnail*</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setThumbnailFile(file);
                              setThumbnailError(null);
                            }
                          }} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-2">
                        {currentProject.thumbnailUrl ? (
                          <>
                            <span>Current thumbnail:</span>
                            <img 
                              src={currentProject.thumbnailUrl} 
                              alt="Current thumbnail" 
                              className="h-8 w-8 object-cover rounded"
                            />
                            <span className="text-xs text-muted-foreground">(Upload a new one to replace)</span>
                          </>
                        ) : (
                          "A thumbnail image is required for your project"
                        )}
                      </FormDescription>
                      {thumbnailError && <p className="text-sm font-medium text-destructive">{thumbnailError}</p>}
                      <FormMessage />
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel>Project Images (Optional, Max 10)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          ref={multipleImagesInputRef}
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 10) {
                              setMediaErrors(prev => ({...prev, images: "Maximum 10 images allowed"}));
                              return;
                            }
                            setProjectImages(files);
                            setMediaErrors(prev => ({...prev, images: undefined}));
                          }} 
                        />
                      </FormControl>
                      <FormDescription className="flex flex-wrap items-center gap-2">
                        {currentProject.mediaUrls && currentProject.mediaUrls.length > 0 ? (
                          <>
                            <span>Current media:</span>
                            {currentProject.mediaUrls.map((url, index) => (
                              <img 
                                key={index}
                                src={url} 
                                alt={`Project media ${index + 1}`} 
                                className="h-8 w-8 object-cover rounded"
                              />
                            ))}
                            <span className="text-xs text-muted-foreground">(Upload new ones to replace)</span>
                          </>
                        ) : (
                          "Upload up to 10 images to showcase your project"
                        )}
                      </FormDescription>
                      {mediaErrors?.images && <p className="text-sm font-medium text-destructive">{mediaErrors.images}</p>}
                      <FormMessage />
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel>Project Video (Optional, Max 120 sec)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          ref={videoInputRef}
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Check approximate video size (2MB/min is a rough estimate for decent quality)
                              if (file.size > 4 * 1024 * 1024) {
                                setMediaErrors(prev => ({...prev, video: "Video exceeds maximum size (max ~120 seconds)"}));
                                return;
                              }
                              setProjectVideo(file);
                              setMediaErrors(prev => ({...prev, video: undefined}));
                            }
                          }} 
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a short video (max 120 seconds) to demonstrate your project
                      </FormDescription>
                      {mediaErrors?.video && <p className="text-sm font-medium text-destructive">{mediaErrors.video}</p>}
                      <FormMessage />
                    </FormItem>
                  </TabsContent>
                  
                  <TabsContent value="team" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Add Team Member</h3>
                      <Form {...collaboratorForm}>
                        <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                          <div className="space-y-4 border rounded-lg p-4">
                            <FormField
                              control={collaboratorForm.control}
                              name="profileLink"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Profile Link*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Add Brandentifier profile link to connect with users
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button type="submit" size="sm" className="mt-2">
                              Add Team Member
                            </Button>
                          </div>
                        </form>
                      </Form>
                      
                      {collaborators.length > 0 ? (
                        <div className="border rounded-lg p-4 space-y-4">
                          <h3 className="text-sm font-medium">Current Team Members</h3>
                          <div className="space-y-2">
                            {collaborators.map((collaborator) => (
                              <div key={collaborator.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                <div>
                                  <div className="font-medium">Team Member</div>
                                  <div className="text-xs text-muted-foreground">
                                    <a href={collaborator.profileLink || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      {collaborator.profileLink || 'No profile link'}
                                    </a>
                                  </div>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteCollaborator(collaborator.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          No team members added yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="endorsements" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Add Client</h3>
                      <p className="text-sm text-muted-foreground">
                        Add a client's profile link to invite them to endorse your project.
                      </p>
                      <Form {...endorsementForm}>
                        <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                          <div className="space-y-4 border rounded-lg p-4">
                            <FormField
                              control={endorsementForm.control}
                              name="profileLink"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client Profile Link*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Add Brandentifier profile link of your client
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button type="submit" size="sm" className="mt-2">
                              Invite Client
                            </Button>
                          </div>
                        </form>
                      </Form>
                      
                      {endorsements.length > 0 ? (
                        <div className="border rounded-lg p-4 space-y-4">
                          <h3 className="text-sm font-medium">Client Status</h3>
                          <div className="space-y-2">
                            {endorsements.map((endorsement) => (
                              <div key={endorsement.id} className="p-3 bg-muted rounded">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{endorsement.clientName}</div>
                                    {endorsement.isVerified ? (
                                      <div className="flex items-center text-green-600 text-xs">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        <span>Verified</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-amber-600 text-xs">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        <span>Pending Verification</span>
                                      </div>
                                    )}
                                    {endorsement.isVerified && (
                                      <>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {endorsement.clientTitle && `${endorsement.clientTitle}`}
                                          {endorsement.clientTitle && endorsement.clientCompany && ` at `}
                                          {endorsement.clientCompany && `${endorsement.clientCompany}`}
                                        </div>
                                        {endorsement.rating && (
                                          <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, index) => (
                                              <span 
                                                key={index} 
                                                className={`text-sm ${index < (endorsement.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                              >
                                                ★
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteEndorsement(endorsement.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {endorsement.isVerified && endorsement.message && (
                                  <div className="mt-2 text-sm italic">"{endorsement.message}"</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          No clients added yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Project Details Modal */}
      {currentProject && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl">{currentProject.title}</DialogTitle>
                <div className="flex space-x-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8" 
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleEdit(currentProject);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {currentProject.category && (
                <Badge className="mt-1">{currentProject.category}</Badge>
              )}
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                {currentProject.thumbnailUrl && (
                  <div className="w-full h-48 overflow-hidden bg-muted rounded-md mb-4">
                    <img 
                      src={currentProject.thumbnailUrl} 
                      alt={currentProject.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currentProject.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Project Date</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(currentProject.startDate)}</p>
                    </div>
                    
                    {currentProject.projectUrl && (
                      <div>
                        <h3 className="text-sm font-medium">Project URL</h3>
                        <a 
                          href={currentProject.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          <ExternalLinkIcon className="h-3 w-3 mr-1" />
                          View Project
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-4 pt-4">
                {collaborators.length > 0 ? (
                  <div className="grid gap-3">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="p-3 bg-muted rounded-md flex justify-between items-start">
                        <div>
                          <div className="font-medium">Team Member</div>
                          {collaborator.profileLink ? (
                            <a 
                              href={collaborator.profileLink || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center mt-1"
                            >
                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                              {collaborator.profileLink}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground mt-1">No profile link provided</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No team members added yet
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="endorsements" className="space-y-4 pt-4">
                {endorsements.length > 0 ? (
                  <div className="grid gap-4">
                    {endorsements.filter(e => e.isVerified).length > 0 ? (
                      endorsements.filter(e => e.isVerified).map((endorsement) => (
                        <div key={endorsement.id} className="p-4 bg-muted rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{endorsement.clientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {endorsement.clientTitle && `${endorsement.clientTitle}`}
                                {endorsement.clientTitle && endorsement.clientCompany && ` at `}
                                {endorsement.clientCompany && `${endorsement.clientCompany}`}
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <span 
                                  key={index} 
                                  className={`text-sm ${index < (endorsement.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          {endorsement.message && (
                            <div className="text-sm italic mt-2 pl-4 border-l-2 border-muted-foreground/20">
                              "{endorsement.message}"
                            </div>
                          )}
                          <div className="mt-2 flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            <span>Verified Endorsement</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No verified endorsements yet
                      </div>
                    )}
                    
                    {/* Show a count of pending endorsements if there are any */}
                    {endorsements.filter(e => !e.isVerified).length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-md border border-amber-200">
                        <div className="flex items-center text-amber-600 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{endorsements.filter(e => !e.isVerified).length} pending client {endorsements.filter(e => !e.isVerified).length === 1 ? 'verification' : 'verifications'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No endorsements added yet
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}