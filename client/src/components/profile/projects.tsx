import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, X, Edit, Trash2, Star, StarHalf, ExternalLink, PlusSquare, Upload, CheckCircle2, Calendar, Link, Users, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

// Define project schema
const projectSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  startDate: z.string().min(10, "Date is required"),
  projectUrl: z.string().url("Must be a valid URL").optional().nullable(),
  userId: z.number().optional(), // This will be set automatically
});

// Define collaborator schema
const collaboratorSchema = z.object({
  name: z.string().optional().nullable(), // Made optional
  email: z.string().email("Invalid email").optional().nullable(),
  role: z.string().optional().nullable(), // Made optional
  profileLink: z.string().url("Must be a valid URL").optional().nullable(), // Added profile link
  projectId: z.number().optional(), // This will be set automatically
  userId: z.number().optional().nullable(),
});

// Define endorsement schema
const endorsementSchema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Invalid email").optional().nullable(),
  clientTitle: z.string().optional().nullable(),
  clientCompany: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  rating: z.number().min(1).max(5),
  projectId: z.number().optional(), // This will be set automatically
});

// Define type for project
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

// Define type for collaborator
interface Collaborator {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  profileLink: string | null;
  userId: number | null;
  projectId: number;
  inviteStatus: string | null;
}

// Define type for endorsement
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

interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string;
  location?: string;
}

export default function Projects() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    // If we have a Firebase user ID (string), we need to find the corresponding numeric ID
    if (user?.uid) {
      // Fetch the numeric ID for this user
      apiRequest("GET", `/api/users/find/${user.uid}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.id) {
            console.log("Found numeric userId:", data.id);
            setUserId(data.id);
          } else {
            // If the user doesn't exist yet in our DB, create them
            return apiRequest("POST", "/api/users", {
              username: user.uid, // Use Firebase UID as username
              email: user.email || `user-${user.uid}@example.com`,
              name: user.name || `User ${user.uid.substring(0, 5)}`,
              phoneNumber: null,
              photoURL: user.photoURL || null,
            });
          }
        })
        .then(response => {
          if (response) return response.json();
          return null;
        })
        .then(newUser => {
          if (newUser && newUser.id) {
            console.log("Created new user with ID:", newUser.id);
            setUserId(newUser.id);
          }
        })
        .catch(error => {
          console.error("Error getting/creating user:", error);
        });
    }
  }, [user]);
  
  // Fetch projects for user
  const { 
    data: projects = [], 
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['/api/users', userId, 'projects'],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest("GET", `/api/users/${userId}/projects`);
      return response.json();
    },
    enabled: !!userId,
  });
  
  // Project form
  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      projectUrl: "",
    },
  });
  
  // Collaborator form
  const collaboratorForm = useForm<z.infer<typeof collaboratorSchema>>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      profileLink: "",
    },
  });
  
  // Endorsement form
  const endorsementForm = useForm<z.infer<typeof endorsementSchema>>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientTitle: "",
      clientCompany: "",
      message: "",
      rating: 5,
    },
  });
  
  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      const data = { ...values, userId };
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Added",
        description: "Your project has been added successfully.",
      });
      projectForm.reset();
      setIsAddDialogOpen(false);
      refetchProjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error adding your project.",
        variant: "destructive",
      });
      console.error("Add project error:", error);
    }
  });
  
  // Edit project mutation
  const editProjectMutation = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema> & { id: number }) => {
      const { id, ...data } = values;
      const response = await apiRequest("PUT", `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully.",
      });
      projectForm.reset();
      setIsEditDialogOpen(false);
      refetchProjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating your project.",
        variant: "destructive",
      });
      console.error("Edit project error:", error);
    }
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully.",
      });
      refetchProjects();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error deleting your project.",
        variant: "destructive",
      });
      console.error("Delete project error:", error);
    }
  });
  
  // Upload thumbnail mutation
  const uploadThumbnailMutation = useMutation({
    mutationFn: async (projectId: number) => {
      if (!thumbnailFile) return null;
      
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      formData.append('projectId', projectId.toString());
      
      const response = await fetch('/api/projects/upload-thumbnail', {
        method: 'POST',
        body: formData,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.thumbnailUrl) {
        toast({
          title: "Thumbnail Uploaded",
          description: "Project thumbnail has been uploaded successfully.",
        });
        
        // Update the project with the new thumbnail URL
        if (selectedProject) {
          const updatedProject = { ...selectedProject, thumbnailUrl: data.thumbnailUrl };
          setSelectedProject(updatedProject);
          refetchProjects();
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error uploading the thumbnail.",
        variant: "destructive",
      });
      console.error("Upload thumbnail error:", error);
    }
  });
  
  // Fetch collaborators for selected project
  const { 
    data: collaborators = [], 
    isLoading: isLoadingCollaborators,
    refetch: refetchCollaborators
  } = useQuery({
    queryKey: ['/api/projects', selectedProject?.id, 'collaborators'],
    queryFn: async () => {
      if (!selectedProject) return [];
      const response = await apiRequest("GET", `/api/projects/${selectedProject.id}/collaborators`);
      return response.json();
    },
    enabled: !!selectedProject,
  });
  
  // Fetch endorsements for selected project
  const { 
    data: endorsements = [], 
    isLoading: isLoadingEndorsements,
    refetch: refetchEndorsements
  } = useQuery({
    queryKey: ['/api/projects', selectedProject?.id, 'endorsements'],
    queryFn: async () => {
      if (!selectedProject) return [];
      const response = await apiRequest("GET", `/api/projects/${selectedProject.id}/endorsements`);
      return response.json();
    },
    enabled: !!selectedProject,
  });
  
  // Add collaborator mutation
  const addCollaboratorMutation = useMutation({
    mutationFn: async (values: z.infer<typeof collaboratorSchema>) => {
      const data = { ...values, projectId: selectedProject?.id };
      const response = await apiRequest("POST", "/api/project-collaborators", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Team Member Added",
        description: "The team member has been added successfully.",
      });
      collaboratorForm.reset();
      refetchCollaborators();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error adding the team member.",
        variant: "destructive",
      });
      console.error("Add collaborator error:", error);
    }
  });
  
  // Delete collaborator mutation
  const deleteCollaboratorMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/project-collaborators/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: "Team Member Removed",
        description: "The team member has been removed successfully.",
      });
      refetchCollaborators();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error removing the team member.",
        variant: "destructive",
      });
      console.error("Delete collaborator error:", error);
    }
  });
  
  // Add endorsement mutation
  const addEndorsementMutation = useMutation({
    mutationFn: async (values: z.infer<typeof endorsementSchema>) => {
      const data = { ...values, projectId: selectedProject?.id };
      const response = await apiRequest("POST", "/api/project-endorsements", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Endorsement Added",
        description: "The endorsement has been added successfully.",
      });
      endorsementForm.reset();
      refetchEndorsements();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error adding the endorsement.",
        variant: "destructive",
      });
      console.error("Add endorsement error:", error);
    }
  });
  
  // Delete endorsement mutation
  const deleteEndorsementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/project-endorsements/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      toast({
        title: "Endorsement Removed",
        description: "The endorsement has been removed successfully.",
      });
      refetchEndorsements();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error removing the endorsement.",
        variant: "destructive",
      });
      console.error("Delete endorsement error:", error);
    }
  });
  
  const handleAddProject = async (values: z.infer<typeof projectSchema>) => {
    addProjectMutation.mutate(values);
  };
  
  const handleEditProject = async (values: z.infer<typeof projectSchema>) => {
    if (selectedProject) {
      editProjectMutation.mutate({ ...values, id: selectedProject.id });
    }
  };
  
  const handleDeleteProject = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };
  
  const handleAddCollaborator = async (values: z.infer<typeof collaboratorSchema>) => {
    addCollaboratorMutation.mutate(values);
  };
  
  const handleAddEndorsement = async (values: z.infer<typeof endorsementSchema>) => {
    addEndorsementMutation.mutate(values);
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadThumbnail = async () => {
    if (!selectedProject || !thumbnailFile) return;
    
    setUploading(true);
    try {
      await uploadThumbnailMutation.mutateAsync(selectedProject.id);
    } finally {
      setUploading(false);
    }
  };
  
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description || "",
      category: project.category || "",
      startDate: project.startDate,
      projectUrl: project.projectUrl || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const openDetailDialog = (project: Project) => {
    setSelectedProject(project);
    setActiveTab("details");
    setThumbnailPreview(project.thumbnailUrl || null);
    setIsDetailDialogOpen(true);
  };
  
  if (isLoadingProjects) {
    return <div className="flex justify-center p-6">Loading projects...</div>;
  }
  
  if (projectsError) {
    return <div className="text-red-500 p-6">Error loading projects.</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">My Projects</h3>
        
        <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <div className="bg-muted p-6 text-center rounded-lg">
          <p className="text-muted-foreground">You haven't added any projects yet.</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            variant="outline" 
            className="mt-4"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:bg-accent/5 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    {project.startDate && (
                      <CardDescription>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="text-xs">{formatDate(project.startDate)}</span>
                        </div>
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2 space-y-2">
                <div className="relative aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => openDetailDialog(project)}>
                  {project.thumbnailUrl ? (
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                      <PlusSquare className="h-8 w-8 mb-1" />
                      <span className="text-xs">Add Image</span>
                    </div>
                  )}
                </div>
                
                {project.description && (
                  <p className="text-sm line-clamp-2">{project.description}</p>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  {project.category && (
                    <Badge variant="outline" className="text-xs">
                      {project.category}
                    </Badge>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => openDetailDialog(project)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Showcase your work by adding details about your project.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(handleAddProject)} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
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
                        placeholder="Describe your project" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={projectForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://myproject.com" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addProjectMutation.isPending}>
                  {addProjectMutation.isPending ? "Adding..." : "Add Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of your project.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(handleEditProject)} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
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
                        placeholder="Describe your project" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={projectForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''} 
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Writing">Writing</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="projectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://myproject.com" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editProjectMutation.isPending}>
                  {editProjectMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Project Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProject?.title || "Project Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.startDate && (
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(selectedProject.startDate)}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="aspect-video rounded-md bg-muted flex items-center justify-center overflow-hidden">
                {thumbnailPreview ? (
                  <img 
                    src={thumbnailPreview} 
                    alt={selectedProject?.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <PlusSquare className="h-12 w-12 mb-2" />
                    <span>Add Thumbnail Image</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Thumbnail Image</label>
                  {thumbnailFile && !uploading && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleUploadThumbnail}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="text-sm text-muted-foreground">
                    Uploading...
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {selectedProject?.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm leading-relaxed">{selectedProject.description}</p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2">
                  {selectedProject?.category && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-24">Category:</span>
                      <Badge variant="outline">{selectedProject.category}</Badge>
                    </div>
                  )}
                  
                  {selectedProject?.projectUrl && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-24">Project URL:</span>
                      <a 
                        href={selectedProject.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center"
                      >
                        {selectedProject.projectUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Project Team</h4>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {isLoadingCollaborators ? (
                  <div className="text-center py-4">Loading team members...</div>
                ) : collaborators.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>No team members added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div className="space-y-1">
                          {collaborator.name && <div className="font-medium">{collaborator.name}</div>}
                          {collaborator.role && <div className="text-sm text-muted-foreground">{collaborator.role}</div>}
                          {collaborator.email && <div className="text-sm">{collaborator.email}</div>}
                          {collaborator.profileLink && (
                            <a 
                              href={collaborator.profileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary flex items-center"
                            >
                              <Link className="h-3 w-3 mr-1" />
                              Profile Link
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteCollaboratorMutation.mutate(collaborator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Add Team Member</h4>
                
                <Form {...collaboratorForm}>
                  <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                    <div className="space-y-4 border rounded-lg p-4">
                      <FormField
                        control={collaboratorForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Collaborator name" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collaboratorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collaboratorForm.control}
                        name="profileLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Link</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/username" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={collaboratorForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input placeholder="Developer, Designer, PM, etc." {...field} value={field.value || ''} />
                            </FormControl>
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
            
            <TabsContent value="endorsements" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Client Endorsements</h4>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {isLoadingEndorsements ? (
                  <div className="text-center py-4">Loading endorsements...</div>
                ) : endorsements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <ThumbsUp className="h-12 w-12 mx-auto mb-2" />
                    <p>No endorsements yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {endorsements.map((endorsement) => (
                      <div key={endorsement.id} className="p-4 border rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{endorsement.clientName}</div>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              {endorsement.clientTitle && <span>{endorsement.clientTitle}</span>}
                              {endorsement.clientTitle && endorsement.clientCompany && <span>•</span>}
                              {endorsement.clientCompany && <span>{endorsement.clientCompany}</span>}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i}>
                                  {i + 1 <= (endorsement.rating || 0) ? (
                                    <Star className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Star className="h-4 w-4 text-muted" />
                                  )}
                                </div>
                              ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => deleteEndorsementMutation.mutate(endorsement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {endorsement.message && (
                          <div className="mt-2 text-sm">
                            "{endorsement.message}"
                          </div>
                        )}
                        
                        {endorsement.isVerified && (
                          <div className="mt-2 flex items-center text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified endorsement
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Add Endorsement</h4>
                
                <Form {...endorsementForm}>
                  <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                    <div className="space-y-4 border rounded-lg p-4">
                      <FormField
                        control={endorsementForm.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Client name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={endorsementForm.control}
                          name="clientTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="CEO, Manager, etc." {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={endorsementForm.control}
                          name="clientCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={endorsementForm.control}
                        name="clientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="client@example.com" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={endorsementForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What the client said about your work" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={endorsementForm.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating*</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value?.toString() || "5"}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Star</SelectItem>
                                  <SelectItem value="2">2 Stars</SelectItem>
                                  <SelectItem value="3">3 Stars</SelectItem>
                                  <SelectItem value="4">4 Stars</SelectItem>
                                  <SelectItem value="5">5 Stars</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" size="sm" className="mt-2">
                        Add Endorsement
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}