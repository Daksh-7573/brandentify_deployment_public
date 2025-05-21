import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";
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
  ChevronRight,
  Image
} from "lucide-react";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

// Define schemas for forms
const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  industry: z.string().nullable().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  projectUrl: z.string().url({ message: "Valid URL is required" }).min(1, { message: "Project URL is required" }),
  mediaUrls: z.array(z.string()).nullable().optional(), // This is handled separately with our custom validation
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
  industry: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailFile?: string | null; // Add property to store the filename separately
  mediaUrls: string[] | string | null; // Can be string[] or a JSON string or null
  userId: number;
  createdAt?: string | null;
  updatedAt?: string | null;
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
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number>(-1); // -1 means no image selected as thumbnail
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
        
        // Force update (only if there are actual changes)
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
          
          // Check if there are meaningful changes before updating state
          const currentProjectsStr = JSON.stringify(projects);
          const newProjectsStr = JSON.stringify(normalizedData);
          
          if (currentProjectsStr !== newProjectsStr) {
            console.log("Projects direct fetch found changes, updating state");
            setProjects([...normalizedData]);
            // Update the ref as well
            latestProjectsRef.current = [...normalizedData];
          } else {
            console.log("Projects direct fetch found no changes, skipping update");
          }
        }
      } catch (error) {
        console.error("Error during direct projects fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const interval = setInterval(directFetch, 1000);
    return () => clearInterval(interval);
  }, [userId, projects]); // Depend on both userId and projects state
  
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
      
      // Check if this update has any meaningful differences before replacing state
      const hasChanges = JSON.stringify(normalizedData) !== JSON.stringify(projects);
      if (hasChanges) {
        console.log("Projects data has changes, updating state");
        // Always update our reference with the latest data
        latestProjectsRef.current = [...normalizedData];
        
        // Update the state too to trigger re-renders
        setProjects([...normalizedData]);
      } else {
        console.log("Projects data unchanged, skipping state update");
      }
    }
  }, [serverProjects, projects]);
  
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
  
  // Image management state
  const [isConfirmingDeleteImage, setIsConfirmingDeleteImage] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  
  // Image management functions
  const handleDeleteImage = async (imageUrl: string) => {
    setImageToDelete(imageUrl);
    setIsConfirmingDeleteImage(true);
  };
  
  const confirmDeleteImage = async () => {
    if (!currentProject || !imageToDelete) return;
    
    try {
      // Call the API to delete the image
      const response = await apiRequest(
        'DELETE',
        `/api/projects/${currentProject.id}/media`,
        { mediaUrl: imageToDelete }
      );
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the project in state with new media URLs
        const updatedProject = {
          ...currentProject,
          mediaUrls: result.mediaUrls,
          thumbnailUrl: result.thumbnailUrl
        };
        
        // Update local state
        setCurrentProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        
        toast({
          title: "Image deleted",
          description: "The image has been removed from your project.",
        });
        
        // Refresh data
        refetch();
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive"
      });
    }
    
    // Clean up state
    setImageToDelete(null);
    setIsConfirmingDeleteImage(false);
  };
  
  const cancelDeleteImage = () => {
    setImageToDelete(null);
    setIsConfirmingDeleteImage(false);
  };
  
  const handleSetAsThumbnail = async (imageUrl: string) => {
    if (!currentProject) return;
    
    try {
      // Call the API to set the thumbnail
      const response = await apiRequest(
        'PATCH',
        `/api/projects/${currentProject.id}/set-thumbnail`,
        { thumbnailUrl: imageUrl }
      );
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the project in state with new thumbnail URL
        const updatedProject = {
          ...currentProject,
          thumbnailUrl: result.thumbnailUrl
        };
        
        // Update local state
        setCurrentProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        
        toast({
          title: "Thumbnail updated",
          description: "Project thumbnail has been updated successfully.",
        });
        
        // Refresh data
        refetch();
      } else {
        throw new Error("Failed to update thumbnail");
      }
    } catch (error) {
      console.error("Error setting thumbnail:", error);
      toast({
        title: "Error",
        description: "Failed to update the thumbnail. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle selecting a thumbnail from newly uploaded images
  const handleSelectThumbnail = (index: number) => {
    setSelectedThumbnailIndex(index);
    
    // Set the thumbnail file from the selected image
    if (index >= 0 && index < projectImages.length) {
      setThumbnailFile(projectImages[index]);
      
      toast({
        title: "Thumbnail selected",
        description: "This image will be set as the project thumbnail.",
      });
    } else {
      setThumbnailFile(null);
    }
  };
  
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
      const response = await apiRequest(
        'GET', 
        `/api/projects/${projectId}/collaborators`
      );
      const data = await response.json();
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadEndorsements = async (projectId: number) => {
    try {
      const response = await apiRequest(
        'GET', 
        `/api/projects/${projectId}/endorsements`
      );
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
      industry: null,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: '',
      mediaUrls: null,
    });
    setThumbnailFile(null);
    setThumbnailError(null);
    setProjectImages([]);
    setProjectVideo(null);
    setMediaErrors(null);
    setSelectedThumbnailIndex(-1);
    
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
    console.log("Editing project:", project);
    
    setCurrentProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description || '',
      category: project.category || '',
      industry: project.industry || null,
      startDate: project.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: project.projectUrl || '',
      mediaUrls: project.mediaUrls || null,
    });
    // Reset all file inputs when editing
    setThumbnailFile(null);
    setThumbnailError(null);
    setProjectImages([]);
    setProjectVideo(null);
    setMediaErrors(null);
    setSelectedThumbnailIndex(-1);
    
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
      const response = await apiRequest(
        'DELETE', 
        `/api/projects/${id}`
      );
      
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
    
    // No longer requiring thumbnail for projects
    
    // Validate additional media files
    let validationFailed = false;
    const newMediaErrors: {images?: string, video?: string, general?: string} = {};
    
    // Validate at least one media item is required (either images or video)
    // But don't require it if editing a project that already has media
    const hasExistingMedia = currentProject && 
      currentProject.mediaUrls && 
      ((Array.isArray(currentProject.mediaUrls) && currentProject.mediaUrls.length > 0) ||
       (typeof currentProject.mediaUrls === 'string' && currentProject.mediaUrls.length > 0));
      
    if (projectImages.length === 0 && !projectVideo && !hasExistingMedia) {
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
        // Check if we're updating the industry field
        if (values.industry !== currentProject.industry) {
          console.log(`Updating industry field from "${currentProject.industry}" to "${values.industry}"`);
          
          // Use the dedicated PATCH endpoint for updating the industry field
          console.log('Sending PATCH request to update industry');
          try {
            response = await apiRequest(
              'PATCH', 
              `/api/projects/${currentProject.id}`, 
              { industry: values.industry }
            );
            console.log('PATCH response status:', response.status);
            console.log('PATCH response data:', await response.clone().json());
          } catch (error) {
            console.error('Error in PATCH request:', error);
          }
          
          // Then update the rest of the project data with PUT
          const restOfValues = { ...values };
          console.log('Sending PUT request with the rest of the values:', restOfValues);
          try {
            response = await apiRequest(
              'PUT', 
              `/api/projects/${currentProject.id}`, 
              restOfValues
            );
            console.log('PUT response status:', response.status);
          } catch (error) {
            console.error('Error in PUT request:', error);
          }
        } else {
          // Standard update without industry changes
          response = await apiRequest(
            'PUT', 
            `/api/projects/${currentProject.id}`, 
            values
          );
        }
        projectData = await response.json();
        
        // Thumbnail is no longer required for existing projects
        
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
          
          // Add selected thumbnail index if available
          if (selectedThumbnailIndex >= 0 && selectedThumbnailIndex < projectImages.length) {
            mediaFormData.append('thumbnailIndex', selectedThumbnailIndex.toString());
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
        response = await apiRequest(
          'POST', 
          '/api/projects', 
          newProjectData
        );
        projectData = await response.json();
        
        // Thumbnail is no longer required for new projects
        
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
          
          // Add selected thumbnail index if available
          if (selectedThumbnailIndex >= 0 && selectedThumbnailIndex < projectImages.length) {
            mediaFormData.append('thumbnailIndex', selectedThumbnailIndex.toString());
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
      setSelectedThumbnailIndex(-1);
      
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
      
      const response = await apiRequest(
        'POST', 
        '/api/project-collaborators', 
        collaboratorData
      );
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
      await apiRequest(
        'DELETE', 
        `/api/project-collaborators/${collaboratorId}`,
        undefined
      );
      
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
      
      const response = await apiRequest(
        'POST', 
        '/api/project-endorsements', 
        endorsementData
      );
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
    if (!confirm('Are you sure you want to remove this client endorsement?')) return;
    
    try {
      await apiRequest(
        'DELETE', 
        `/api/project-endorsements/${endorsementId}`,
        undefined
      );
      
      setEndorsements(endorsements.filter(e => e.id !== endorsementId));
      
      toast({
        title: "Success",
        description: "Client endorsement removed successfully!",
      });
    } catch (error) {
      console.error('Error removing client endorsement:', error);
      toast({
        title: "Error",
        description: "Failed to remove client endorsement. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Lightbox functions
  const openLightbox = (mediaUrls: string[], startIndex = 0) => {
    if (!mediaUrls || mediaUrls.length === 0) return;
    setLightboxImages(mediaUrls);
    setCurrentImageIndex(startIndex);
    setIsLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };
  
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + lightboxImages.length) % lightboxImages.length);
  };
  
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % lightboxImages.length);
  };

  return (
    <NeoGlassSection title="Project Showcase" className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <button onClick={handleAdd} className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
              <p className="text-sm text-slate-300">Loading your project showcase...</p>
            </div>
          </div>
        ) : displayProjects && displayProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayProjects.map((project) => (
              <div key={project.id} className="bg-slate-800/60 backdrop-blur-md border border-white/5 rounded-lg overflow-hidden shadow-lg group relative">
                {/* Project Thumbnail */}
                <div className="relative w-full aspect-square bg-slate-900/70 flex items-center justify-center overflow-hidden">
                  {project.thumbnailUrl ? (
                    <img 
                      src={
                        project.thumbnailUrl.startsWith('/uploads/') 
                          ? project.thumbnailUrl 
                          : project.thumbnailUrl
                      }
                      alt={project.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        console.error("Thumbnail image failed to load");
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : project.mediaUrls && (
                    (Array.isArray(project.mediaUrls) && project.mediaUrls.length > 0) || 
                    (typeof project.mediaUrls === 'string' && 
                     (project.mediaUrls.indexOf('http') >= 0 || 
                      project.mediaUrls.indexOf('[') === 0))) ? (
                      <>
                        <img 
                          src={
                            Array.isArray(project.mediaUrls) 
                              ? project.mediaUrls[0] 
                              : typeof project.mediaUrls === 'string' && project.mediaUrls.startsWith('[')
                                ? JSON.parse(project.mediaUrls)[0]
                                : String(project.mediaUrls)
                          }
                          alt={`${project.title} media image`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            console.error("Media URL image failed to load");
                            // Hide this image
                            (e.target as HTMLImageElement).style.display = 'none';
                            
                            // Fall back to thumbnail if available
                            if (project.thumbnailUrl && project.thumbnailUrl !== "null" && project.thumbnailUrl !== null) {
                              const imgElement = document.createElement('img');
                              imgElement.src = project.thumbnailUrl;
                              imgElement.alt = `${project.title} thumbnail fallback`;
                              imgElement.className = "w-full h-full object-cover hover:scale-105 transition-transform duration-200";
                              (e.target as HTMLImageElement).parentNode?.appendChild(imgElement);
                            } else if (project.thumbnailFile && project.thumbnailFile !== "null" && project.thumbnailFile !== null) {
                              const imgElement = document.createElement('img');
                              imgElement.src = `/uploads/projects/${project.thumbnailFile}`;
                              imgElement.alt = `${project.title} thumbnail fallback`;
                              imgElement.className = "w-full h-full object-cover hover:scale-105 transition-transform duration-200";
                              (e.target as HTMLImageElement).parentNode?.appendChild(imgElement);
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <FolderKanban className="w-10 h-10" />
                      </div>
                    )}
                    
                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleView(project)} 
                          variant="secondary" 
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          View
                        </Button>
                        <Button 
                          onClick={() => handleEdit(project)} 
                          variant="secondary" 
                          size="sm"
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleDelete(project.id)} 
                          variant="destructive" 
                          size="sm"
                          className="bg-destructive/90"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-lg truncate">{project.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{new Date(project.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short'
                      })}</span>
                      
                      {project.projectUrl && (
                        <>
                          <span className="mx-1">•</span>
                          <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                          <a 
                            href={project.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary text-xs truncate max-w-[120px] inline-block align-bottom"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {new URL(project.projectUrl).hostname}
                          </a>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.category && (
                        <Badge variant="outline">
                          {project.category}
                        </Badge>
                      )}
                      {project.industry && (
                        <Badge variant="secondary" className="bg-slate-100">
                          {project.industry}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 p-6 text-center border border-white/5 rounded-lg bg-slate-800/40 backdrop-blur-md">
              <FolderKanban className="w-10 h-10 mb-4 text-slate-300" />
              <h3 className="text-lg font-medium mb-1 text-white">No projects yet</h3>
              <p className="text-sm text-slate-300 mb-4">
                Create your first project showcase to highlight your work
              </p>
              <Button onClick={handleAdd} className="gap-1 bg-slate-800/60 text-white hover:bg-slate-700/70">
                <Plus className="w-4 h-4" />
                Add New Project
              </Button>
            </div>
          )}
        </div>
      
      
      {/* Add Project Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Showcase</DialogTitle>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
                  <TabsTrigger value="endorsements" className="flex-1">Clients</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <FormField
                      control={projectForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title*</FormLabel>
                          <FormControl>
                            <Input placeholder="Project title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a clear, descriptive title for your project
                          </FormDescription>
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
                              placeholder="Describe your project, its objectives, and outcome" 
                              {...field}
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about your project (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category*</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Web Development" {...field} />
                            </FormControl>
                            <FormDescription>
                              Project category or type
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={projectForm.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <IndustryCombobox 
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Select or type an industry"
                              />
                            </FormControl>
                            <FormDescription>
                              Industry the project belongs to
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={projectForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date*</FormLabel>
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
                                      format(field.value, "PPP")
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
                                  onSelect={(date) => field.onChange(format(date || new Date(), 'yyyy-MM-dd'))}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When was the project completed?
                            </FormDescription>
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
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Link to the live project or repository
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="media" className="space-y-4 pt-4">
                  <div className="space-y-8">
                    {/* Media Type Selection */}
                    <div className="space-y-2">
                      <Label>Media Type</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
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
                            }}
                          />
                          <label htmlFor="media-type-images" className="ml-2 text-sm font-medium">
                            Images (Up to 10)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            }}
                          />
                          <label htmlFor="media-type-video" className="ml-2 text-sm font-medium">
                            Video (Max 120 sec)
                          </label>
                        </div>
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
                        
                        {/* Image Previews */}
                        {projectImages.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Image Previews:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {projectImages.map((file, index) => (
                                <div 
                                  key={index} 
                                  className={`relative group ${selectedThumbnailIndex === index ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                >
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Preview ${index + 1}`}
                                    className="aspect-square w-full object-cover rounded-md border" 
                                  />
                                  <div className="absolute top-1 right-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectThumbnail(index)}
                                      className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedThumbnailIndex === index ? 'opacity-100' : ''}`}
                                      aria-label="Set as thumbnail"
                                      title="Set as thumbnail"
                                    >
                                      <Image className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [...projectImages];
                                        newImages.splice(index, 1);
                                        setProjectImages(newImages);
                                        
                                        // If this was the selected thumbnail, reset the selection
                                        if (selectedThumbnailIndex === index) {
                                          setSelectedThumbnailIndex(-1);
                                          setThumbnailFile(null);
                                        } else if (selectedThumbnailIndex > index) {
                                          // Adjust the index if we're removing an image before the selected one
                                          setSelectedThumbnailIndex(selectedThumbnailIndex - 1);
                                        }
                                      }}
                                      className="bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="Remove image"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {selectedThumbnailIndex === index && (
                                    <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                      Thumbnail
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {selectedThumbnailIndex !== -1 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Image {selectedThumbnailIndex + 1} will be used as the project thumbnail
                              </p>
                            )}
                          </div>
                        )}
                        
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
                        
                        {/* Video Preview */}
                        {projectVideo && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Video Preview:</p>
                            <div className="relative w-full">
                              <video 
                                src={URL.createObjectURL(projectVideo)} 
                                controls
                                className="w-full h-auto rounded-md border max-h-[200px]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProjectVideo(null);
                                  if (videoInputRef.current) {
                                    videoInputRef.current.value = '';
                                  }
                                }}
                                className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                                aria-label="Remove video"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        
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
                  Save Showcase
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
              <DialogTitle>Edit Showcase</DialogTitle>
            </DialogHeader>
            
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                {/* Similar form fields as Add Project, but with current values */}
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                    <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
                    <TabsTrigger value="endorsements" className="flex-1">Clients</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 pt-4">
                    {/* Same fields as add form */}
                    <div className="space-y-4">
                      <FormField
                        control={projectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title*</FormLabel>
                            <FormControl>
                              <Input placeholder="Project title" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter a clear, descriptive title for your project
                            </FormDescription>
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
                                placeholder="Describe your project, its objectives, and outcome" 
                                {...field}
                                className="min-h-[120px]"
                              />
                            </FormControl>
                            <FormDescription>
                              Provide details about your project (max 500 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={projectForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Web Development" {...field} />
                              </FormControl>
                              <FormDescription>
                                Project category or type
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={projectForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry</FormLabel>
                              <FormControl>
                                <IndustryCombobox
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  placeholder="Select or type an industry"
                                />
                              </FormControl>
                              <FormDescription>
                                Industry the project belongs to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={projectForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date*</FormLabel>
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
                                    onSelect={(date) => field.onChange(format(date || new Date(), 'yyyy-MM-dd'))}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When was the project completed?
                              </FormDescription>
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
                                <Input placeholder="https://example.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Link to the live project or repository
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-4 pt-4">
                    <div className="space-y-8">
                      {/* Existing Media Preview (if available) */}
                      {currentProject.mediaUrls && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Current Media</h3>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {Array.isArray(currentProject.mediaUrls) ? (
                              currentProject.mediaUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={url} 
                                    alt={`Project Image ${index + 1}`} 
                                    className={`h-24 w-full object-cover rounded-md border
                                      ${currentProject.thumbnailUrl === url ? 'ring-2 ring-primary ring-offset-1' : ''}
                                    `}
                                    onClick={() => openLightbox(
                                      Array.isArray(currentProject.mediaUrls) 
                                        ? currentProject.mediaUrls as string[] 
                                        : [], 
                                      index
                                    )}
                                  />
                                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSetAsThumbnail(url)}
                                      className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                        ${currentProject.thumbnailUrl === url ? 'opacity-100' : ''}
                                      `}
                                      aria-label="Set as thumbnail"
                                      title="Set as thumbnail"
                                    >
                                      <Image className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteImage(url)}
                                      className="bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="Remove image"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {currentProject.thumbnailUrl === url && (
                                    <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                      Thumbnail
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : typeof currentProject.mediaUrls === 'string' ? (
                              // Handle string case (assume it's a JSON string or single URL)
                              <>
                                {currentProject.mediaUrls.startsWith('[') ? (
                                  // It's a JSON string array, parse it
                                  JSON.parse(currentProject.mediaUrls).map((url: string, index: number) => (
                                    <div key={index} className="relative group">
                                      <img 
                                        src={url} 
                                        alt={`Project Image ${index + 1}`} 
                                        className={`h-24 w-full object-cover rounded-md border
                                          ${currentProject.thumbnailUrl === url ? 'ring-2 ring-primary ring-offset-1' : ''}
                                        `}
                                        onClick={() => openLightbox(JSON.parse(currentProject.mediaUrls as string), index)}
                                      />
                                      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSetAsThumbnail(url)}
                                          className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                            ${currentProject.thumbnailUrl === url ? 'opacity-100' : ''}
                                          `}
                                          aria-label="Set as thumbnail"
                                          title="Set as thumbnail"
                                        >
                                          <Image className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteImage(url)}
                                          className="bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label="Remove image"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                      {currentProject.thumbnailUrl === url && (
                                        <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                          Thumbnail
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  // It's a single URL
                                  <div className="relative group">
                                    <img 
                                      src={currentProject.mediaUrls} 
                                      alt="Project Image" 
                                      className={`h-24 w-full object-cover rounded-md border
                                        ${currentProject.thumbnailUrl === currentProject.mediaUrls ? 'ring-2 ring-primary ring-offset-1' : ''}
                                      `}
                                      onClick={() => openLightbox([currentProject.mediaUrls as string], 0)}
                                    />
                                    <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSetAsThumbnail(currentProject.mediaUrls as string)}
                                        className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                          ${currentProject.thumbnailUrl === currentProject.mediaUrls ? 'opacity-100' : ''}
                                        `}
                                        aria-label="Set as thumbnail"
                                        title="Set as thumbnail"
                                      >
                                        <Image className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteImage(currentProject.mediaUrls as string)}
                                        className="bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    {currentProject.thumbnailUrl === currentProject.mediaUrls && (
                                      <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                        Thumbnail
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}
                      
                      {/* Media Type Selection */}
                      <div className="space-y-2">
                        <Label>Add Media</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-media-type-images"
                              name="edit-media-type"
                              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              checked={!projectVideo}
                              onChange={() => {
                                setProjectVideo(null);
                                if (videoInputRef.current) {
                                  videoInputRef.current.value = '';
                                }
                              }}
                            />
                            <label htmlFor="edit-media-type-images" className="ml-2 text-sm font-medium">
                              Images (Up to 10)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-media-type-video"
                              name="edit-media-type"
                              className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              checked={!!projectVideo}
                              onChange={() => {
                                setProjectImages([]);
                                if (multipleImagesInputRef.current) {
                                  multipleImagesInputRef.current.value = '';
                                }
                              }}
                            />
                            <label htmlFor="edit-media-type-video" className="ml-2 text-sm font-medium">
                              Video (Max 120 sec)
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Input fields similar to Add Project */}
                      {!projectVideo ? (
                        <FormItem>
                          <FormLabel>Add More Images</FormLabel>
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
                            Add up to 10 more images to your project showcase
                          </FormDescription>
                          {mediaErrors?.images && <p className="text-sm font-medium text-destructive">{mediaErrors.images}</p>}
                          
                          {/* Image Previews - similar to Add Project */}
                          {projectImages.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">New Image Previews:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {projectImages.map((file, index) => (
                                  <div 
                                    key={index} 
                                    className={`relative group ${selectedThumbnailIndex === index ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                  >
                                    <img 
                                      src={URL.createObjectURL(file)} 
                                      alt={`Preview ${index + 1}`}
                                      className="h-24 w-full object-cover rounded-md border" 
                                    />
                                    <div className="absolute top-1 right-1 flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectThumbnail(index)}
                                        className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedThumbnailIndex === index ? 'opacity-100' : ''}`}
                                        aria-label="Set as thumbnail"
                                        title="Set as thumbnail"
                                      >
                                        <Image className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newImages = [...projectImages];
                                          newImages.splice(index, 1);
                                          setProjectImages(newImages);
                                          
                                          // If this was the selected thumbnail, reset the selection
                                          if (selectedThumbnailIndex === index) {
                                            setSelectedThumbnailIndex(-1);
                                            setThumbnailFile(null);
                                          } else if (selectedThumbnailIndex > index) {
                                            // Adjust the index if we're removing an image before the selected one
                                            setSelectedThumbnailIndex(selectedThumbnailIndex - 1);
                                          }
                                        }}
                                        className="bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                    {selectedThumbnailIndex === index && (
                                      <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                        New Thumbnail
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {selectedThumbnailIndex !== -1 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Image {selectedThumbnailIndex + 1} will be used as the project thumbnail
                                </p>
                              )}
                            </div>
                          )}
                          
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
                                  // Check approximate video size
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
                            Replace with a new video (max 120 seconds)
                          </FormDescription>
                          {mediaErrors?.video && <p className="text-sm font-medium text-destructive">{mediaErrors.video}</p>}
                          
                          {/* Video Preview - similar to Add Project */}
                          {projectVideo && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">New Video Preview:</p>
                              <div className="relative w-full">
                                <video 
                                  src={URL.createObjectURL(projectVideo)} 
                                  controls
                                  className="w-full h-auto rounded-md border max-h-[200px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProjectVideo(null);
                                    if (videoInputRef.current) {
                                      videoInputRef.current.value = '';
                                    }
                                  }}
                                  className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                                  aria-label="Remove video"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="team" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Team Members</h3>
                      
                      {collaborators.length > 0 ? (
                        <div className="space-y-2">
                          {collaborators.map((collaborator) => (
                            <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{collaborator.name}</p>
                                <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                                {collaborator.profileLink && (
                                  <a 
                                    href={collaborator.profileLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View Profile
                                  </a>
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteCollaborator(collaborator.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No team members yet.</p>
                      )}
                      
                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Add Team Member</h3>
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
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="endorsements" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Client Endorsements</h3>
                      
                      {endorsements.length > 0 ? (
                        <div className="space-y-2">
                          {endorsements.map((endorsement) => (
                            <div key={endorsement.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <p className="font-medium">{endorsement.clientName}</p>
                                    {endorsement.isVerified && (
                                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    )}
                                    {!endorsement.isVerified && (
                                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    )}
                                  </div>
                                  {endorsement.clientTitle && endorsement.clientCompany && (
                                    <p className="text-sm text-muted-foreground">
                                      {endorsement.clientTitle}, {endorsement.clientCompany}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteEndorsement(endorsement.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {endorsement.message && (
                                <p className="text-sm mt-2 italic">"{endorsement.message}"</p>
                              )}
                              {endorsement.rating && (
                                <div className="flex items-center mt-2">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < endorsement.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              )}
                              {!endorsement.isVerified && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Waiting for client verification
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No client endorsements yet.</p>
                      )}
                      
                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-2">Add Client</h3>
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
                                      <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormDescription>
                                      Add Brandentifier profile link of your client
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" size="sm" className="mt-2">
                                Add Client
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Showcase
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Detail View Modal */}
      {currentProject && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{currentProject.title}</DialogTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                <span>{new Date(currentProject.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long'
                })}</span>
                
                {currentProject.projectUrl && (
                  <>
                    <span className="mx-1">•</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                    <a 
                      href={currentProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Project Link
                    </a>
                  </>
                )}
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="team" className="flex-1">Team</TabsTrigger>
                <TabsTrigger value="endorsements" className="flex-1">Clients</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Project Media Showcase */}
                <div className="space-y-4">
                  {currentProject.mediaUrls && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Array.isArray(currentProject.mediaUrls) ? (
                        currentProject.mediaUrls.slice(0, 6).map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Project Image ${index + 1}`} 
                              className={`aspect-square w-full object-cover rounded-md border cursor-pointer hover:opacity-95
                                ${currentProject.thumbnailUrl === url ? 'ring-2 ring-primary ring-offset-1' : ''}
                              `}
                              onClick={() => openLightbox(
                                Array.isArray(currentProject.mediaUrls) 
                                  ? currentProject.mediaUrls as string[] 
                                  : [], 
                                index
                              )}
                            />
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetAsThumbnail(url);
                                }}
                                className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                  ${currentProject.thumbnailUrl === url ? 'opacity-100' : ''}
                                `}
                                aria-label="Set as thumbnail"
                                title="Set as thumbnail"
                              >
                                <Image className="h-3 w-3" />
                              </button>
                            </div>
                            {currentProject.thumbnailUrl === url && (
                              <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                Thumbnail
                              </div>
                            )}
                          </div>
                        ))
                      ) : typeof currentProject.mediaUrls === 'string' ? (
                        // Handle string case (assume it's a JSON string or single URL)
                        <>
                          {currentProject.mediaUrls.startsWith('[') ? (
                            // It's a JSON string array, parse it
                            JSON.parse(currentProject.mediaUrls).slice(0, 6).map((url: string, index: number) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Project Image ${index + 1}`} 
                                  className={`aspect-square w-full object-cover rounded-md border cursor-pointer hover:opacity-95
                                    ${currentProject.thumbnailUrl === url ? 'ring-2 ring-primary ring-offset-1' : ''}
                                  `}
                                  onClick={() => openLightbox(JSON.parse(currentProject.mediaUrls as string), index)}
                                />
                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetAsThumbnail(url);
                                    }}
                                    className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                      ${currentProject.thumbnailUrl === url ? 'opacity-100' : ''}
                                    `}
                                    aria-label="Set as thumbnail"
                                    title="Set as thumbnail"
                                  >
                                    <Image className="h-3 w-3" />
                                  </button>
                                </div>
                                {currentProject.thumbnailUrl === url && (
                                  <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                    Thumbnail
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            // It's a single URL
                            <div className="relative group col-span-2">
                              <img 
                                src={currentProject.mediaUrls} 
                                alt="Project Image" 
                                className={`aspect-square w-full object-cover rounded-md border cursor-pointer hover:opacity-95
                                  ${currentProject.thumbnailUrl === currentProject.mediaUrls ? 'ring-2 ring-primary ring-offset-1' : ''}
                                `}
                                onClick={() => openLightbox([currentProject.mediaUrls as string], 0)}
                              />
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetAsThumbnail(currentProject.mediaUrls as string);
                                  }}
                                  className={`bg-primary text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity
                                    ${currentProject.thumbnailUrl === currentProject.mediaUrls ? 'opacity-100' : ''}
                                  `}
                                  aria-label="Set as thumbnail"
                                  title="Set as thumbnail"
                                >
                                  <Image className="h-3 w-3" />
                                </button>
                              </div>
                              {currentProject.thumbnailUrl === currentProject.mediaUrls && (
                                <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-sm">
                                  Thumbnail
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : null}
                      
                      {/* View All button if more than 6 images */}
                      {Array.isArray(currentProject.mediaUrls) && currentProject.mediaUrls.length > 6 && (
                        <button
                          type="button"
                          onClick={() => openLightbox(currentProject.mediaUrls as string[], 0)}
                          className="aspect-square w-full flex items-center justify-center bg-muted rounded-md border hover:bg-muted/80"
                        >
                          <span className="text-sm font-medium">
                            View All ({currentProject.mediaUrls.length})
                          </span>
                        </button>
                      )}
                      
                      {typeof currentProject.mediaUrls === 'string' && 
                        currentProject.mediaUrls.startsWith('[') && 
                        JSON.parse(currentProject.mediaUrls).length > 6 && (
                        <button
                          type="button"
                          onClick={() => openLightbox(JSON.parse(currentProject.mediaUrls as string), 0)}
                          className="aspect-square w-full flex items-center justify-center bg-muted rounded-md border hover:bg-muted/80"
                        >
                          <span className="text-sm font-medium">
                            View All ({JSON.parse(currentProject.mediaUrls).length})
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Project Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                    <p>{currentProject.category || 'Not specified'}</p>
                  </div>
                  
                  {currentProject.industry && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Industry</h3>
                      <p>{currentProject.industry}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="whitespace-pre-line">{currentProject.description}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-6 mt-4">
                {collaborators.length > 0 ? (
                  <div className="space-y-4">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div>
                            <h3 className="font-medium">{collaborator.name}</h3>
                            <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                          </div>
                          
                          <div className="mt-2 sm:mt-0 flex items-center gap-2">
                            {collaborator.profileLink && (
                              <a 
                                href={collaborator.profileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Profile
                              </a>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive/90"
                              onClick={() => handleDeleteCollaborator(collaborator.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No team members added yet.</p>
                    <p className="text-sm mt-2">
                      Add team members to showcase collaboration on this project.
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Form {...collaboratorForm}>
                    <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                      <div className="space-y-4 border rounded-lg p-4">
                        <h3 className="text-sm font-medium">Add Team Member</h3>
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
                </div>
              </TabsContent>
              
              <TabsContent value="endorsements" className="space-y-6 mt-4">
                {endorsements.length > 0 ? (
                  <div className="space-y-4">
                    {endorsements.map((endorsement) => (
                      <div key={endorsement.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-medium">{endorsement.clientName}</h3>
                              {endorsement.isVerified && (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              )}
                              {!endorsement.isVerified && (
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                              )}
                            </div>
                            {endorsement.clientTitle && endorsement.clientCompany && (
                              <p className="text-sm text-muted-foreground">
                                {endorsement.clientTitle}, {endorsement.clientCompany}
                              </p>
                            )}
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteEndorsement(endorsement.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        {endorsement.message && (
                          <p className="text-sm mt-4 italic">"{endorsement.message}"</p>
                        )}
                        
                        {endorsement.rating && (
                          <div className="flex items-center mt-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < endorsement.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        )}
                        
                        {!endorsement.isVerified && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Waiting for client verification
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No client endorsements yet.</p>
                    <p className="text-sm mt-2">
                      Invite clients to endorse your work on this project.
                    </p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Form {...endorsementForm}>
                    <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                      <div className="space-y-4 border rounded-lg p-4">
                        <h3 className="text-sm font-medium">Add Client</h3>
                        <FormField
                          control={endorsementForm.control}
                          name="profileLink"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Profile Link*</FormLabel>
                              <FormControl>
                                <Input placeholder="https://brandentifier.replit.app/profile/username" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormDescription>
                                Add Brandentifier profile link of your client
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" size="sm" className="mt-2">
                          Add Client
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              <Button onClick={() => {
                setIsDetailModalOpen(false);
                handleEdit(currentProject);
              }}>
                Edit Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Lightbox for Images */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="max-w-4xl mx-auto p-4 relative">
            <img 
              src={lightboxImages[currentImageIndex]} 
              alt={`Lightbox image ${currentImageIndex + 1}`} 
              className="max-h-[80vh] max-w-full object-contain" 
            />
            
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
              <Button 
                onClick={goToPrevious} 
                variant="outline" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
              <Button 
                onClick={goToNext} 
                variant="outline" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <div className="absolute top-2 right-2">
              <Button 
                onClick={closeLightbox} 
                variant="outline" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <div className="absolute bottom-2 left-0 right-0 text-center text-sm text-white">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Delete Image Dialog */}
      <AlertDialog open={isConfirmingDeleteImage} onOpenChange={setIsConfirmingDeleteImage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteImage}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NeoGlassSection>
  );
}