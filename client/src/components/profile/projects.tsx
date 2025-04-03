import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, PencilIcon, TrashIcon, PlusIcon, ExternalLinkIcon, CheckCircleIcon, XCircleIcon, Users2Icon, AwardIcon } from 'lucide-react';
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
  endDate: z.string().nullable().optional(),
  projectUrl: z.string().url().nullable().optional().or(z.literal('')),
  clientName: z.string().nullable().optional(),
  clientUrl: z.string().url().nullable().optional().or(z.literal('')),
  mediaUrls: z.array(z.string()).nullable().optional(),
  status: z.enum(['Planned', 'In Progress', 'Completed', 'On Hold']).default('In Progress'),
  isVisible: z.boolean().default(true),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Define the Collaborator schema
const collaboratorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email().nullable().optional(),
  role: z.string().min(1, { message: "Role is required" }),
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
  endDate: string | null;
  projectUrl: string | null;
  clientName: string | null;
  clientUrl: string | null;
  mediaUrls: string[] | null;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  isVisible: boolean;
  userId: number;
}

interface Collaborator {
  id: number;
  name: string;
  email: string | null;
  role: string;
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
  id?: number;
  username?: string;
  email?: string;
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

  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      projectUrl: '',
      clientName: '',
      clientUrl: '',
      mediaUrls: [],
      status: 'In Progress',
      isVisible: true,
    },
  });

  const collaboratorForm = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Contributor',
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
    
    // Use actual user id if available
    const userId = user?.id || 0;
    
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
    
    // Use actual user id if available
    const userId = user?.id || 0;
    
    setLoading(true);
    try {
      const projectData = {
        ...values,
        userId,
      };
      
      const response = await apiRequest('POST', '/api/projects', projectData);
      const data = await response.json();
      
      setProjects([...projects, data as Project]);
      setIsAddDialogOpen(false);
      projectForm.reset();
      
      toast({
        title: 'Success',
        description: 'Project added successfully!',
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: 'Failed to add project. Please try again.',
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
      const updatedProject = await response.json();
      
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      setIsEditDialogOpen(false);
      
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
      endDate: project.endDate || '',
      projectUrl: project.projectUrl || '',
      clientName: project.clientName || '',
      clientUrl: project.clientUrl || '',
      mediaUrls: project.mediaUrls || [],
      status: project.status || 'In Progress',
      isVisible: project.isVisible !== undefined ? project.isVisible : true,
    });
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = (project: Project) => {
    setCurrentProject(project);
    setIsDetailDialogOpen(true);
    setActiveTab('details');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'Planned':
        return <Badge variant="outline">Planned</Badge>;
      case 'On Hold':
        return <Badge variant="destructive">On Hold</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Showcase your work, contributions, and achievements to enhance your professional profile.
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
                        <Input placeholder="My Amazing Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date*</FormLabel>
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
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
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
                                  <span>Present/Ongoing</span>
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Client or Company Name" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="clientUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://client-website.com" {...field} value={field.value || ''} />
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
                        <Input placeholder="https://project-website.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Public Visibility</FormLabel>
                        <FormDescription>
                          Make this project visible on your public profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Project'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">No projects added yet</p>
            <p className="text-sm">Add your professional projects to showcase your work.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium leading-none">{project.title}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(project)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                      {project.category && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{project.category}</span>
                        </>
                      )}
                    </div>
                    
                    {project.description && (
                      <p className="mt-2 text-sm line-clamp-2">{project.description}</p>
                    )}
                    
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDetailDialog(project)}>
                        View Details
                      </Button>
                      {project.projectUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                            <ExternalLinkIcon className="h-3 w-3" />
                            Visit Project
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[650px]">
            {currentProject && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl">{currentProject.title}</DialogTitle>
                    {getStatusBadge(currentProject.status)}
                  </div>
                  <DialogDescription>
                    {formatDate(currentProject.startDate)} - {formatDate(currentProject.endDate)}
                    {currentProject.category && ` • ${currentProject.category}`}
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-1">
                      <Users2Icon className="h-4 w-4" />
                      Team
                    </TabsTrigger>
                    <TabsTrigger value="endorsements" className="flex items-center gap-1">
                      <AwardIcon className="h-4 w-4" />
                      Endorsements
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    {currentProject.description && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Description</h3>
                        <p className="text-sm">{currentProject.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentProject.clientName && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Client</h3>
                          <p className="text-sm flex items-center">
                            {currentProject.clientName}
                            {currentProject.clientUrl && (
                              <a href={currentProject.clientUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center text-primary">
                                <ExternalLinkIcon className="h-3 w-3" />
                              </a>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {currentProject.projectUrl && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Project URL</h3>
                          <a href={currentProject.projectUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center">
                            Visit Project <ExternalLinkIcon className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional metadata could go here */}
                  </TabsContent>
                  
                  <TabsContent value="team">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Project Collaborators</h3>
                        <Form {...collaboratorForm}>
                          <form onSubmit={collaboratorForm.handleSubmit(handleAddCollaborator)} className="space-y-4">
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline"
                              onClick={() => document.getElementById('add-collaborator-form')?.classList.toggle('hidden')}
                            >
                              Add Collaborator
                            </Button>
                            
                            <div id="add-collaborator-form" className="hidden mt-4 space-y-4 border rounded-lg p-4">
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
                              
                              <Button type="submit" size="sm">
                                Add
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                      
                      <Separator />
                      
                      {collaborators.length > 0 ? (
                        <div className="space-y-3">
                          {collaborators.map((collaborator) => (
                            <div key={collaborator.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                              <div>
                                <p className="font-medium">{collaborator.name}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <span className="mr-2">{collaborator.role}</span>
                                  {collaborator.inviteStatus === 'accepted' && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Verified</Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteCollaborator(collaborator.id)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground mb-2">No collaborators added yet</p>
                          <p className="text-sm">Add team members or collaborators who worked with you.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="endorsements">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Client Endorsements</h3>
                        <Form {...endorsementForm}>
                          <form onSubmit={endorsementForm.handleSubmit(handleAddEndorsement)} className="space-y-4">
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline"
                              onClick={() => document.getElementById('add-endorsement-form')?.classList.toggle('hidden')}
                            >
                              Add Endorsement
                            </Button>
                            
                            <div id="add-endorsement-form" className="hidden mt-4 space-y-4 border rounded-lg p-4">
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
                                    <FormLabel>Testimonial</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Client's testimonial about your work" 
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
                                    <Select
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                      defaultValue={field.value?.toString() || "5"}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a rating" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="3">3 - Good</SelectItem>
                                        <SelectItem value="4">4 - Very Good</SelectItem>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button type="submit" size="sm">
                                Add
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                      
                      <Separator />
                      
                      {endorsements.length > 0 ? (
                        <div className="space-y-4">
                          {endorsements.map((endorsement) => (
                            <div key={endorsement.id} className="border rounded-lg p-4 relative">
                              <div className="absolute top-4 right-4 flex space-x-1">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEndorsement(endorsement.id)}>
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                                {endorsement.isVerified ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Badge variant="outline" className="text-xs">Pending Verification</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center mb-3">
                                {/* Rating stars */}
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i < (endorsement.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              
                              {endorsement.message && (
                                <p className="italic text-sm mb-3">"{endorsement.message}"</p>
                              )}
                              
                              <div>
                                <p className="font-medium text-sm">{endorsement.clientName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {endorsement.clientTitle && `${endorsement.clientTitle}, `}
                                  {endorsement.clientCompany}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground mb-2">No endorsements added yet</p>
                          <p className="text-sm">Add testimonials from clients or stakeholders to build credibility.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details and information.
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
                        <Input placeholder="My Amazing Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Planned">Planned</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date*</FormLabel>
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
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
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
                                  <span>Present/Ongoing</span>
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
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={projectForm.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Client or Company Name" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={projectForm.control}
                    name="clientUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://client-website.com" {...field} value={field.value || ''} />
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
                        <Input placeholder="https://project-website.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Public Visibility</FormLabel>
                        <FormDescription>
                          Make this project visible on your public profile
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Project'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}