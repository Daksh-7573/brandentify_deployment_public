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
import { 
  Loader2, 
  Pencil, 
  Trash2, 
  Plus, 
  FolderKanban, 
  CalendarIcon, 
  ExternalLinkIcon, 
  ExternalLink,
  Star, 
  X, 
  CheckCircle, 
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
  description: z.string().min(1, { message: "Description is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  projectUrl: z.string().url({ message: "Valid URL is required" }).min(1, { message: "Project URL is required" }),
  mediaUrls: z.array(z.string()).optional(), // This is handled separately with our custom validation
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
  const [mediaErrors, setMediaErrors] = useState<{images?: string, video?: string, general?: string} | null>(null);
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
          // Normalize data to ensure mediaUrls is always an array
          const normalizedData = freshData.map(project => {
            // If mediaUrls is a string (JSON), parse it into an array
            if (project.mediaUrls && typeof project.mediaUrls === 'string') {
              try {
                project.mediaUrls = JSON.parse(project.mediaUrls);
              } catch (error) {
                console.error("Error parsing mediaUrls:", error);
                project.mediaUrls = [];
              }
            }
            return project;
          });
          
          console.log("Projects received updated data:", normalizedData);
          setProjects([...normalizedData]);
          // Update the ref as well
          latestProjectsRef.current = [...normalizedData];
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
      // Normalize data to ensure mediaUrls is always an array
      const normalizedData = serverProjects.map(project => {
        // If mediaUrls is a string (JSON), parse it into an array
        if (project.mediaUrls && typeof project.mediaUrls === 'string') {
          try {
            project.mediaUrls = JSON.parse(project.mediaUrls);
          } catch (error) {
            console.error("Error parsing mediaUrls:", error);
            project.mediaUrls = [];
          }
        }
        return project;
      });
      
      console.log("Projects: Initial data from server:", normalizedData);
      setProjects(normalizedData);
      latestProjectsRef.current = normalizedData;
    }
  }, []);
  
  // Update projects state when server data changes
  useEffect(() => {
    if (serverProjects && Array.isArray(serverProjects)) {
      // Normalize data to ensure mediaUrls is always an array
      const normalizedData = serverProjects.map(project => {
        // If mediaUrls is a string (JSON), parse it into an array
        if (project.mediaUrls && typeof project.mediaUrls === 'string') {
          try {
            project.mediaUrls = JSON.parse(project.mediaUrls);
          } catch (error) {
            console.error("Error parsing mediaUrls:", error);
            project.mediaUrls = [];
          }
        }
        return project;
      });
      
      console.log("Projects received updated data:", normalizedData);
      
      // Always update our reference with the latest data
      latestProjectsRef.current = [...normalizedData];
      
      // Update the state too to trigger re-renders
      setProjects([...normalizedData]);
    }
  }, [serverProjects]);
  
  // Always use the latest data for display, using direct ref access as a fallback
  const displayProjects = projects.length > 0 ? projects : 
                       (latestProjectsRef.current.length > 0 ? latestProjectsRef.current : []);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Form setup
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',  // Empty string for required field
      category: '',     // Empty string for required field
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: '',   // Empty string for required field
      mediaUrls: [],    // Empty array for project images/media
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
      const response = await apiRequest({
        method: 'GET', 
        url: `/api/projects/${projectId}/collaborators`
      });
      const data = await response.json();
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadEndorsements = async (projectId: number) => {
    try {
      const response = await apiRequest({
        method: 'GET', 
        url: `/api/projects/${projectId}/endorsements`
      });
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
      description: '',
      category: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: '',
      mediaUrls: [],
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
      description: project.description || '',
      category: project.category || '',
      startDate: project.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: project.projectUrl || '',
      mediaUrls: project.mediaUrls || [],
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
      const response = await apiRequest({
        method: 'DELETE', 
        url: `/api/projects/${id}`
      });
      
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
    console.log("Form submission triggered", values);
    console.log("Form errors:", projectForm.formState.errors);
    
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
    const newMediaErrors: {images?: string, video?: string, general?: string} = {};
    
    // Validate at least one media item is required (either images or video)
    if (projectImages.length === 0 && !projectVideo) {
      newMediaErrors.general = "At least one project image or video is required";
      validationFailed = true;
    }
    
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
      console.log("Media validation failed:", newMediaErrors);
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
        response = await apiRequest({
          method: 'PUT', 
          url: `/api/projects/${currentProject.id}`, 
          data: values
        });
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
        response = await apiRequest({
          method: 'POST', 
          url: '/api/projects', 
          data: newProjectData
        });
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
      
      const response = await apiRequest({
        method: 'POST', 
        url: '/api/project-collaborators', 
        data: collaboratorData
      });
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
      await apiRequest({
        method: 'DELETE', 
        url: `/api/project-collaborators/${collaboratorId}`
      });
      
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
      
      const response = await apiRequest({
        method: 'POST', 
        url: '/api/project-endorsements', 
        data: endorsementData
      });
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
      await apiRequest({
        method: 'DELETE', 
        url: `/api/project-endorsements/${endorsementId}`
      });
      
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
                <div key={project.id} className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Project Thumbnail */}
                  {(project.thumbnailUrl || (project.mediaUrls && Array.isArray(project.mediaUrls) && project.mediaUrls.length > 0)) && (
                    <div className="w-full h-32 overflow-hidden bg-muted">
                      <img 
                        src={project.thumbnailUrl || (Array.isArray(project.mediaUrls) && project.mediaUrls.length > 0 ? project.mediaUrls[0] : undefined)}
                        alt={project.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}
                  
                  <div className="p-3">
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
                        <FormLabel>Category*</FormLabel>
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
                        <FormLabel>Description*</FormLabel>
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
                        <FormLabel>Project URL*</FormLabel>
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
                  
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-sm font-medium">Project Media (Choose One Type)*</h3>
                    {mediaErrors?.general && (
                      <p className="text-sm font-medium text-destructive">{mediaErrors.general}</p>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="media-type-images"
                          name="media-type"
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          checked={!projectVideo}
                          onChange={() => {
                            setProjectVideo(null);
                            if (videoInputRef.current) {
                              videoInputRef.current.value = '';
                            }
                            setMediaErrors(prev => ({...prev, video: undefined}));
                          }}
                        />
                        <label htmlFor="media-type-images" className="ml-2 text-sm font-medium">
                          Images (Max 10)
                        </label>
                      </div>
                      <div className="flex items-center ml-6">
                        <input
                          type="radio"
                          id="media-type-video"
                          name="media-type"
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                          checked={!!projectVideo}
                          onChange={() => {
                            setProjectImages([]);
                            if (multipleImagesInputRef.current) {
                              multipleImagesInputRef.current.value = '';
                            }
                            setMediaErrors(prev => ({...prev, images: undefined}));
                          }}
                        />
                        <label htmlFor="media-type-video" className="ml-2 text-sm font-medium">
                          Video (Max 120 sec)
                        </label>
                      </div>
                    </div>

                    {!projectVideo ? (
                      <FormItem>
                        <FormLabel>Project Images</FormLabel>
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
                    ) : (
                      <FormItem>
                        <FormLabel>Project Video</FormLabel>
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
                    )}
                  </div>
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
                          <FormLabel>Project URL*</FormLabel>
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
                    
                    <div className="space-y-4 border p-4 rounded-md">
                      <h3 className="text-sm font-medium">Project Media (Choose One Type)*</h3>
                      {mediaErrors?.general && (
                        <p className="text-sm font-medium text-destructive">{mediaErrors.general}</p>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="media-type-images-edit"
                            name="media-type-edit"
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            checked={!projectVideo}
                            onChange={() => {
                              setProjectVideo(null);
                              if (videoInputRef.current) {
                                videoInputRef.current.value = '';
                              }
                              setMediaErrors(prev => ({...prev, video: undefined}));
                            }}
                          />
                          <label htmlFor="media-type-images-edit" className="ml-2 text-sm font-medium">
                            Images (Max 10)
                          </label>
                        </div>
                        <div className="flex items-center ml-6">
                          <input
                            type="radio"
                            id="media-type-video-edit"
                            name="media-type-edit"
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            checked={!!projectVideo}
                            onChange={() => {
                              setProjectImages([]);
                              if (multipleImagesInputRef.current) {
                                multipleImagesInputRef.current.value = '';
                              }
                              setMediaErrors(prev => ({...prev, images: undefined}));
                            }}
                          />
                          <label htmlFor="media-type-video-edit" className="ml-2 text-sm font-medium">
                            Video (Max 120 sec)
                          </label>
                        </div>
                      </div>

                      {!projectVideo ? (
                        <FormItem>
                          <FormLabel>Project Images</FormLabel>
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
                      ) : (
                        <FormItem>
                          <FormLabel>Project Video</FormLabel>
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
                      )}
                    </div>
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
            {/* Header with close button and edit button */}
            <div className="p-6 pb-2">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl font-bold">{currentProject.title}</DialogTitle>
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
                  <DialogClose className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted">
                    <X className="h-4 w-4" />
                  </DialogClose>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-3 px-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6 pt-4 animate-in fade-in-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Thumbnail and Project Media */}
                  <div className="space-y-4">
                    {/* Project Thumbnail */}
                    {currentProject.thumbnailUrl && (
                      <div 
                        className="w-full aspect-square rounded-xl shadow-sm overflow-hidden bg-muted cursor-pointer"
                        onClick={() => {
                          // Open the thumbnail in the lightbox
                          console.log("Thumbnail clicked, currentProject:", currentProject);
                          console.log("Thumbnail URL:", currentProject.thumbnailUrl);
                          if (currentProject.thumbnailUrl) {
                            console.log("Setting lightbox for thumbnail");
                            const thumbImage = [currentProject.thumbnailUrl];
                            setLightboxImages(thumbImage);
                            setCurrentImageIndex(0);
                            
                            // Use a setTimeout to ensure state updates complete before showing lightbox
                            setTimeout(() => {
                              setIsLightboxOpen(true);
                              console.log("Thumbnail lightbox should be open now");
                            }, 50);
                          }
                        }}
                      >
                        <img 
                          src={currentProject.thumbnailUrl} 
                          alt={currentProject.title} 
                          className="w-full h-full object-cover hover:scale-[1.03] transition-all duration-300 ease-in-out"
                        />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {currentProject.category && (
                      <div className="flex items-center">
                        <Badge className="px-3 py-1 text-sm rounded-full font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                          {currentProject.category}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Project Media Carousel */}
                    {currentProject.mediaUrls && Array.isArray(currentProject.mediaUrls) && currentProject.mediaUrls.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h3 className="text-sm font-medium">Project Media</h3>
                        <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                          {currentProject.mediaUrls.map((url, index) => (
                            <div 
                              key={index} 
                              className="flex-none w-24 h-24 rounded-lg overflow-hidden bg-muted shadow-sm snap-center cursor-pointer"
                              onClick={() => {
                                console.log("Image clicked:", url);
                                console.log("Current project media:", currentProject.mediaUrls);
                                if (currentProject.mediaUrls && Array.isArray(currentProject.mediaUrls)) {
                                  console.log("Setting lightbox images:", currentProject.mediaUrls);
                                  // Create a new array to ensure React detects the change
                                  const mediaImages = [...currentProject.mediaUrls];
                                  setLightboxImages(mediaImages);
                                  setCurrentImageIndex(index);
                                  // Using a timeout to ensure state updates are applied
                                  setTimeout(() => {
                                    setIsLightboxOpen(true);
                                    console.log("Lightbox should be open now after timeout");
                                  }, 50);
                                }
                              }}
                            >
                              <img 
                                src={url} 
                                alt={`Project media ${index + 1}`} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Project Details */}
                  <div className="space-y-6">
                    {/* Project Date */}
                    <div className="text-sm text-muted-foreground">
                      <CalendarIcon className="inline-block h-4 w-4 mr-1 -mt-0.5" />
                      {formatDate(currentProject.startDate)}
                    </div>
                    
                    {/* Project Description */}
                    <div>
                      <h3 className="text-base font-semibold mb-2">About this project</h3>
                      <div className="text-muted-foreground space-y-2">
                        {currentProject.description?.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        )) || "No description provided."}
                      </div>
                    </div>
                    
                    {/* Project URL Button */}
                    {currentProject.projectUrl && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="gap-2 w-full sm:w-auto"
                          onClick={() => window.open(currentProject.projectUrl ?? '', '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                          Visit Site
                          <span className="sr-only">(opens in a new tab)</span>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentProject.projectUrl}
                        </p>
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
      
      {/* Lightbox for images */}
      {console.log("Rendering lightbox component, isLightboxOpen:", isLightboxOpen)}
      {isLightboxOpen && lightboxImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => {
            console.log("Lightbox background clicked, closing");
            setIsLightboxOpen(false);
          }}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Image container */}
          <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img 
              src={lightboxImages[currentImageIndex]} 
              alt={`Project image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Navigation buttons */}
          {lightboxImages.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button 
                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-80"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setCurrentImageIndex(prev => 
                    prev === 0 ? lightboxImages.length - 1 : prev - 1
                  ); 
                }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-80"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setCurrentImageIndex(prev => 
                    prev === lightboxImages.length - 1 ? 0 : prev + 1
                  ); 
                }}
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          )}
          
          {/* Image counter */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}