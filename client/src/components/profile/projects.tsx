import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, PencilIcon, TrashIcon, PlusIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon, Users2Icon, AwardIcon, Briefcase, FolderKanban } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the Project schema
const projectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  projectUrl: z.string().url().nullable().optional().or(z.literal('')),
  mediaUrls: z.array(z.string()).nullable().optional(),
  // Public visibility option removed as requested
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Define the Collaborator schema
const collaboratorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email().nullable().optional(),
  role: z.string().min(1, { message: "Role is required" }),
  profileLink: z.string().nullable().optional(),
});

type CollaboratorFormValues = z.infer<typeof collaboratorSchema>;

// Define the Endorsement schema
const endorsementSchema = z.object({
  clientName: z.string().min(1, { message: "Client name is required" }),
  clientEmail: z.string().email().nullable().optional(),
  clientTitle: z.string().nullable().optional(),
  clientCompany: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
});

type EndorsementFormValues = z.infer<typeof endorsementSchema>;

// Define interfaces for our project data
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
  profileLink: string | null; // Added profileLink field
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

interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string;
  location?: string;
}

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      projectUrl: '',
      mediaUrls: [],
      // isVisible removed as requested
    },
  });

  const collaboratorForm = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Contributor',
      profileLink: '',
    },
  });

  const endorsementForm = useForm<EndorsementFormValues>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientTitle: '',
      clientCompany: '',
      message: '',
      rating: 5,
    },
  });

  // Load projects
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // Load collaborators and endorsements when viewing a project
  useEffect(() => {
    if (currentProject) {
      loadCollaborators(currentProject.id);
      loadEndorsements(currentProject.id);
    }
  }, [currentProject]);

  const loadProjects = async () => {
    if (!user) return;
    
    // Use actual user uid if available
    const userId = user?.uid || 0;
    
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/users/${userId}/projects`);
      const data = await response.json();
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddProject = async (values: ProjectFormValues) => {
    if (!user) return;
    
    // Use actual user uid if available
    const userId = user?.uid || 0;
    
    setLoading(true);
    try {
      const projectData = {
        ...values,
        userId,
      };
      
      // First create the project
      const response = await apiRequest('POST', '/api/projects', projectData);
      const project = await response.json();
      
      // If we have a thumbnail file, upload it
      if (thumbnailFile) {
        try {
          console.log('Uploading thumbnail file for project ID:', project.id);
          const formData = new FormData();
          formData.append('thumbnail', thumbnailFile);
          formData.append('projectId', project.id.toString());
          
          // Use fetch directly as apiRequest doesn't handle FormData
          const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            // Try to get error details
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.error('Thumbnail upload failed with status:', uploadResponse.status, errorData);
            throw new Error(`Failed to upload thumbnail: ${errorData.message || uploadResponse.statusText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log('Thumbnail upload successful:', uploadResult);
          
          // Update the project with the thumbnail URL
          project.thumbnailUrl = uploadResult.thumbnailUrl;
        } catch (uploadError) {
          console.error('Error uploading thumbnail:', uploadError);
          // Don't fail the whole operation, just show a toast for the upload error
          toast({
            title: 'Thumbnail Upload Failed',
            description: uploadError instanceof Error ? uploadError.message : 'Unable to upload thumbnail image',
            variant: 'destructive',
          });
          // Continue with the project creation even if thumbnail fails
        }
      }
      
      setProjects([...projects, project as Project]);
      setIsAddDialogOpen(false);
      projectForm.reset();
      setThumbnailFile(null);
      
      toast({
        title: 'Success',
        description: 'Project added successfully!',
      });
    } catch (error) {
      console.error('Error adding project:', error);
      // Show more detailed error message for debugging
      let errorMessage = 'Failed to add project. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
        console.error('Error details:', error.message);
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (values: ProjectFormValues) => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/projects/${currentProject.id}`, values);
      let updatedProject = await response.json();
      
      // If we have a thumbnail file, upload it
      if (thumbnailFile) {
        try {
          console.log('Uploading thumbnail file for project ID:', updatedProject.id);
          const formData = new FormData();
          formData.append('thumbnail', thumbnailFile);
          formData.append('projectId', updatedProject.id.toString());
          
          // Use fetch directly as apiRequest doesn't handle FormData
          const uploadResponse = await fetch('/api/projects/upload-thumbnail', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            // Try to get error details
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.error('Thumbnail upload failed with status:', uploadResponse.status, errorData);
            throw new Error(`Failed to upload thumbnail: ${errorData.message || uploadResponse.statusText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log('Thumbnail upload successful:', uploadResult);
          
          // Update the project with the thumbnail URL
          updatedProject.thumbnailUrl = uploadResult.thumbnailUrl;
        } catch (uploadError) {
          console.error('Error uploading thumbnail:', uploadError);
          // Don't fail the whole operation, just show a toast for the upload error
          toast({
            title: 'Thumbnail Upload Failed',
            description: uploadError instanceof Error ? uploadError.message : 'Unable to upload thumbnail image',
            variant: 'destructive',
          });
          // Continue with the project update even if thumbnail fails
        }
      }
      
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setIsEditDialogOpen(false);
      setThumbnailFile(null);
      
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    setLoading(true);
    try {
      await apiRequest('DELETE', `/api/projects/${projectId}`);
      
      setProjects(projects.filter(p => p.id !== projectId));
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async (values: CollaboratorFormValues) => {
    if (!currentProject) return;
    
    try {
      const collaboratorData = {
        ...values,
        projectId: currentProject.id,
      };
      
      const response = await apiRequest('POST', '/api/project-collaborators', collaboratorData);
      const data = await response.json();
      
      setCollaborators([...collaborators, data]);
      collaboratorForm.reset();
      
      toast({
        title: 'Success',
        description: 'Collaborator added successfully!',
      });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast({
        title: 'Error',
        description: 'Failed to add collaborator. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCollaborator = async (collaboratorId: number) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    
    try {
      await apiRequest('DELETE', `/api/project-collaborators/${collaboratorId}`);
      
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      
      toast({
        title: 'Success',
        description: 'Collaborator removed successfully!',
      });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove collaborator. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddEndorsement = async (values: EndorsementFormValues) => {
    if (!currentProject) return;
    
    try {
      const endorsementData = {
        ...values,
        projectId: currentProject.id,
      };
      
      const response = await apiRequest('POST', '/api/project-endorsements', endorsementData);
      const data = await response.json();
      
      setEndorsements([...endorsements, data]);
      endorsementForm.reset();
      
      toast({
        title: 'Success',
        description: 'Endorsement added successfully!',
      });
    } catch (error) {
      console.error('Error adding endorsement:', error);
      toast({
        title: 'Error',
        description: 'Failed to add endorsement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEndorsement = async (endorsementId: number) => {
    if (!confirm('Are you sure you want to remove this endorsement?')) return;
    
    try {
      await apiRequest('DELETE', `/api/project-endorsements/${endorsementId}`);
      
      setEndorsements(endorsements.filter(e => e.id !== endorsementId));
      
      toast({
        title: 'Success',
        description: 'Endorsement removed successfully!',
      });
    } catch (error) {
      console.error('Error removing endorsement:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove endorsement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (project: Project) => {
    setCurrentProject(project);
    projectForm.reset({
      title: project.title,
      description: project.description || '',
      category: project.category || '',
      startDate: project.startDate || format(new Date(), 'yyyy-MM-dd'),
      projectUrl: project.projectUrl || '',
      mediaUrls: project.mediaUrls || [],
      // isVisible removed as requested
    });
    // Reset the thumbnail file when editing
    setThumbnailFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = (project: Project) => {
    setCurrentProject(project);
    setIsDetailDialogOpen(true);
    setActiveTab('details');
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
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">My Projects</CardTitle>
          <CardDescription>Showcase your professional projects and collaborations</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <PlusIcon className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Showcase your work, contributions, and achievements to enhance your professional profile.
              </DialogDescription>
            </DialogHeader>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(handleAddProject)} className="space-y-4">
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
                      <FormLabel>Project Thumbnail</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setThumbnailFile(file);
                            }
                          }} 
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a preview image for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  </TabsContent>
                  
                  <TabsContent value="team" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Add Team Members</h3>
                      <Form {...collaboratorForm}>
                        <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                          <div className="space-y-4 border rounded-lg p-4">
                            <FormField
                              control={collaboratorForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Collaborator name" {...field} />
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
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Developer, Designer, PM, etc." {...field} />
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
                                    <Input placeholder="Brandentifier profile link" {...field} value={field.value || ''} />
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
                                  <div className="font-medium">{collaborator.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {collaborator.role}
                                    {collaborator.email && ` • ${collaborator.email}`}
                                  </div>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteCollaborator(collaborator.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          <Users2Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No team members added yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="endorsements" className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Add Testimonials & Endorsements</h3>
                      <Form {...endorsementForm}>
                        <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                          <div className="space-y-4 border rounded-lg p-4">
                            <FormField
                              control={endorsementForm.control}
                              name="clientName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client/Reviewer Name*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Smith" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={endorsementForm.control}
                                name="clientEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="email@example.com" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={endorsementForm.control}
                                name="clientTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="CEO, Manager, etc." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={endorsementForm.control}
                              name="clientCompany"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client Company</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Company name" {...field} value={field.value || ''} />
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
                                  <FormLabel>Endorsement Message</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Share what the client said about your work" 
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
                              control={endorsementForm.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rating (1-5)</FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                      defaultValue={field.value?.toString() || "5"}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a rating" />
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
                      
                      {endorsements.length > 0 ? (
                        <div className="border rounded-lg p-4 space-y-4">
                          <h3 className="text-sm font-medium">Current Endorsements</h3>
                          <div className="space-y-2">
                            {endorsements.map((endorsement) => (
                              <div key={endorsement.id} className="p-3 bg-muted rounded">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{endorsement.clientName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {endorsement.clientTitle && `${endorsement.clientTitle}`}
                                      {endorsement.clientTitle && endorsement.clientCompany && ` at `}
                                      {endorsement.clientCompany && `${endorsement.clientCompany}`}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
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
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => handleDeleteEndorsement(endorsement.id)}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {endorsement.message && (
                                  <div className="mt-2 text-sm italic">"{endorsement.message}"</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          <AwardIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No endorsements added yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={loading}>
                    Save Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Showcase your professional projects to highlight your skills and experience.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden flex flex-col h-full">
                {project.thumbnailUrl && (
                  <div className="w-full h-32 overflow-hidden bg-muted">
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold">{project.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7" 
                        onClick={() => openEditDialog(project)}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7" 
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {project.category && (
                    <Badge variant="outline" className="inline-flex mt-1">
                      {project.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2 pt-0">
                  <div className="text-xs text-muted-foreground w-full">
                    <div className="flex justify-between w-full">
                      <span className="inline-flex items-center">
                        <CalendarIcon className="mr-1 h-3 w-3" /> 
                        {formatDate(project.startDate)}
                      </span>
                      {project.projectUrl && (
                        <a 
                          href={project.projectUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center hover:underline"
                        >
                          <ExternalLinkIcon className="h-3 w-3 mr-1" />
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => openDetailDialog(project)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {currentProject && (
        <>
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Update your project information and showcase.
                </DialogDescription>
              </DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(handleEditProject)} className="space-y-4">
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
                        <FormLabel>Project Thumbnail</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setThumbnailFile(file);
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
                            "Upload a preview image for your project"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    </TabsContent>
                    
                    <TabsContent value="team" className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Add Team Members</h3>
                        <Form {...collaboratorForm}>
                          <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                            <div className="space-y-4 border rounded-lg p-4">
                              <FormField
                                control={collaboratorForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Collaborator name" {...field} />
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
                                name="role"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Role*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Developer, Designer, PM, etc." {...field} />
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
                                      <Input placeholder="Brandentifier profile link" {...field} value={field.value || ''} />
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
                                    <div className="font-medium">{collaborator.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {collaborator.role}
                                      {collaborator.email && ` • ${collaborator.email}`}
                                    </div>
                                  </div>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleDeleteCollaborator(collaborator.id)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            <Users2Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No team members added yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="endorsements" className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Add Testimonials & Endorsements</h3>
                        <Form {...endorsementForm}>
                          <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                            <div className="space-y-4 border rounded-lg p-4">
                              <FormField
                                control={endorsementForm.control}
                                name="clientName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client/Reviewer Name*</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Smith" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={endorsementForm.control}
                                  name="clientEmail"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Email</FormLabel>
                                      <FormControl>
                                        <Input placeholder="email@example.com" {...field} value={field.value || ''} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={endorsementForm.control}
                                  name="clientTitle"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="CEO, Manager, etc." {...field} value={field.value || ''} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={endorsementForm.control}
                                name="clientCompany"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Client Company</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Company name" {...field} value={field.value || ''} />
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
                                    <FormLabel>Endorsement Message</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Share what the client said about your work" 
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
                                control={endorsementForm.control}
                                name="rating"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rating (1-5)</FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value?.toString() || "5"}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a rating" />
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
                        
                        {endorsements.length > 0 ? (
                          <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-medium">Current Endorsements</h3>
                            <div className="space-y-2">
                              {endorsements.map((endorsement) => (
                                <div key={endorsement.id} className="p-3 bg-muted rounded">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">{endorsement.clientName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {endorsement.clientTitle && `${endorsement.clientTitle}`}
                                        {endorsement.clientTitle && endorsement.clientCompany && ` at `}
                                        {endorsement.clientCompany && `${endorsement.clientCompany}`}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
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
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => handleDeleteEndorsement(endorsement.id)}
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {endorsement.message && (
                                    <div className="mt-2 text-sm italic">"{endorsement.message}"</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4 text-muted-foreground">
                            <AwardIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No endorsements added yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={loading}>
                      Update Project
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
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
                        setIsDetailDialogOpen(false);
                        openEditDialog(currentProject);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
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
                            <div className="font-medium">{collaborator.name}</div>
                            <div className="text-sm text-muted-foreground">{collaborator.role}</div>
                            {collaborator.email && (
                              <div className="text-sm text-muted-foreground">{collaborator.email}</div>
                            )}
                            {collaborator.profileLink && (
                              <a 
                                href={collaborator.profileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center mt-1"
                              >
                                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                                View Profile
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <Users2Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No team members added yet</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="endorsements" className="space-y-4 pt-4">
                  {endorsements.length > 0 ? (
                    <div className="grid gap-4">
                      {endorsements.map((endorsement) => (
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
                          {endorsement.isVerified && (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Verified Endorsement
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground">
                      <AwardIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No endorsements added yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Card>
  );
}