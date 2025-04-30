import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';

// Define types for our data models
type UserData = {
  id: number;
  name: string;
  title: string | null;
  email: string | null;
  phoneNumber: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  jobLevel: string | null;
  aboutMe: string | null;
  photoURL: string | null;
  whatIOffer: string | null;
};

type WorkExperience = {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string | null;
  industry: string | null;
  domain: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  keyResponsibilities: string[];
};

type Education = {
  id: number;
  userId: number;
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  startDate: string;
  endDate: string | null;
  skillsAcquired: string[];
};

type Skill = {
  id: number;
  userId: number;
  name: string;
  category: string | null;
  level: number | null;
};

type Project = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string | null;
  industry: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[];
  technologies?: string[];
};

type Resume = {
  id: number;
  userId: number;
  fileName: string | null;
  fileData: string | null;
  isDownloadable: boolean;
  lastUpdatedByMusk: string | null;
};

export default function ResumeEditor() {
  const [_, navigate] = useLocation();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default tabs
  const [activeTab, setActiveTab] = useState('basic-info');
  
  // States for user basic info
  const [basicInfo, setBasicInfo] = useState<Partial<UserData>>({});
  
  // States for work experiences
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  
  // States for education
  const [education, setEducation] = useState<Education[]>([]);
  
  // States for skills
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // States for projects
  const [projects, setProjects] = useState<Project[]>([]);
  
  // States for skills to add, remove
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 3 });
  
  // States for controlling dialogs
  const [showAddWorkExpDialog, setShowAddWorkExpDialog] = useState(false);
  const [showAddEducationDialog, setShowAddEducationDialog] = useState(false);
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  
  // States for new items
  const [newWorkExp, setNewWorkExp] = useState<Partial<WorkExperience>>({
    title: '',
    company: '',
    location: '',
    industry: '',
    domain: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    description: '',
    keyResponsibilities: []
  });
  
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    location: '',
    industry: '',
    domain: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    skillsAcquired: []
  });
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: '',
    industry: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    projectUrl: '',
    technologies: []
  });
  
  // Get user data
  const { data: user, isLoading: isUserLoading } = useQuery<UserData>({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });
  
  // Fetch work experiences for the user
  const { data: fetchedWorkExperiences, isLoading: isWorkExperiencesLoading } = useQuery<WorkExperience[]>({
    queryKey: ['/api/users', userId, 'experiences'],
    enabled: !!userId,
  });
  
  // Fetch education data for the user
  const { data: fetchedEducation, isLoading: isEducationLoading } = useQuery<Education[]>({
    queryKey: ['/api/users', userId, 'educations'],
    enabled: !!userId,
  });
  
  // Fetch user skills 
  const { data: fetchedSkills, isLoading: isSkillsLoading } = useQuery<Skill[]>({
    queryKey: ['/api/users', userId, 'skills'],
    enabled: !!userId,
  });
  
  // Fetch user projects
  const { data: fetchedProjects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/users', userId, 'projects'],
    enabled: !!userId,
  });
  
  // Fetch resume
  const { data: resume, isLoading: isResumeLoading } = useQuery<Resume>({
    queryKey: ['/api/users', userId, 'shadow-resume'],
    enabled: !!userId,
  });
  
  // Update user mutation
  const updateUserMutation = useMutation<any, Error, Partial<UserData>>({
    mutationFn: async (updates) => {
      if (!user?.id) return null;
      
      return await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update user data');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your basic profile information has been updated.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId]
      });
    },
    onError: (error) => {
      console.error('Error updating user data:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your profile information.',
        variant: 'destructive',
      });
    }
  });
  
  // Create work experience mutation
  const createWorkExpMutation = useMutation<any, Error, Partial<WorkExperience>>({
    mutationFn: async (newExp) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExp),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create work experience');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Work Experience Added',
        description: 'Your work experience has been added successfully.',
      });
      
      // Reset form and close dialog
      setNewWorkExp({
        title: '',
        company: '',
        location: '',
        industry: '',
        domain: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: null,
        description: '',
        keyResponsibilities: []
      });
      setShowAddWorkExpDialog(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'experiences']
      });
    },
    onError: (error) => {
      console.error('Error creating work experience:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was a problem adding your work experience.',
        variant: 'destructive',
      });
    }
  });
  
  // Update work experience mutation
  const updateWorkExpMutation = useMutation<any, Error, { id: number, data: Partial<WorkExperience> }>({
    mutationFn: async ({ id, data }) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/experiences/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update work experience');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Work Experience Updated',
        description: 'Your work experience has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'experiences']
      });
    },
    onError: (error) => {
      console.error('Error updating work experience:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your work experience.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete work experience mutation
  const deleteWorkExpMutation = useMutation<any, Error, number>({
    mutationFn: async (id) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/experiences/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete work experience');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Work Experience Deleted',
        description: 'Your work experience has been removed.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'experiences']
      });
    },
    onError: (error) => {
      console.error('Error deleting work experience:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was a problem removing your work experience.',
        variant: 'destructive',
      });
    }
  });
  
  // Create education mutation
  const createEducationMutation = useMutation<any, Error, Partial<Education>>({
    mutationFn: async (newEdu) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/educations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEdu),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create education');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Education Added',
        description: 'Your education entry has been added successfully.',
      });
      
      // Reset form and close dialog
      setNewEducation({
        degree: '',
        institution: '',
        fieldOfStudy: '',
        location: '',
        industry: '',
        domain: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: null,
        skillsAcquired: []
      });
      setShowAddEducationDialog(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'educations']
      });
    },
    onError: (error) => {
      console.error('Error creating education:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was a problem adding your education entry.',
        variant: 'destructive',
      });
    }
  });
  
  // Update education mutation
  const updateEducationMutation = useMutation<any, Error, { id: number, data: Partial<Education> }>({
    mutationFn: async ({ id, data }) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/educations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update education');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Education Updated',
        description: 'Your education entry has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'educations']
      });
    },
    onError: (error) => {
      console.error('Error updating education:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your education entry.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete education mutation
  const deleteEducationMutation = useMutation<any, Error, number>({
    mutationFn: async (id) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/educations/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete education');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Education Deleted',
        description: 'Your education entry has been removed.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'educations']
      });
    },
    onError: (error) => {
      console.error('Error deleting education:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was a problem removing your education entry.',
        variant: 'destructive',
      });
    }
  });
  
  // Create skill mutation
  const createSkillMutation = useMutation<any, Error, Partial<Skill>>({
    mutationFn: async (newSkillData) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSkillData),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create skill');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Skill Added',
        description: 'Your skill has been added successfully.',
      });
      
      // Reset form
      setNewSkill({ name: '', category: '', level: 3 });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'skills']
      });
    },
    onError: (error) => {
      console.error('Error creating skill:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was a problem adding your skill.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete skill mutation
  const deleteSkillMutation = useMutation<any, Error, number>({
    mutationFn: async (id) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/skills/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete skill');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Skill Deleted',
        description: 'Your skill has been removed.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'skills']
      });
    },
    onError: (error) => {
      console.error('Error deleting skill:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was a problem removing your skill.',
        variant: 'destructive',
      });
    }
  });
  
  // Create project mutation
  const createProjectMutation = useMutation<any, Error, Partial<Project>>({
    mutationFn: async (newProjectData) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProjectData),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project Added',
        description: 'Your project has been added successfully.',
      });
      
      // Reset form and close dialog
      setNewProject({
        title: '',
        description: '',
        category: '',
        industry: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        projectUrl: '',
        technologies: []
      });
      setShowAddProjectDialog(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'projects']
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was a problem adding your project.',
        variant: 'destructive',
      });
    }
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation<any, Error, { id: number, data: Partial<Project> }>({
    mutationFn: async ({ id, data }) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update project');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project Updated',
        description: 'Your project has been updated successfully.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'projects']
      });
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast({
        title: 'Update Failed',
        description: 'There was a problem updating your project.',
        variant: 'destructive',
      });
    }
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation<any, Error, number>({
    mutationFn: async (id) => {
      if (!userId) return null;
      
      return await fetch(`/api/users/${userId}/projects/${id}`, {
        method: 'DELETE',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete project');
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Project Deleted',
        description: 'Your project has been removed.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'projects']
      });
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was a problem removing your project.',
        variant: 'destructive',
      });
    }
  });
  
  // Effect to set initial data when loaded
  useEffect(() => {
    if (user) {
      setBasicInfo({
        name: user.name || '',
        title: user.title || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        industry: user.industry || '',
        domain: user.domain || '',
        aboutMe: user.aboutMe || ''
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (fetchedWorkExperiences) {
      setWorkExperiences(fetchedWorkExperiences);
    }
  }, [fetchedWorkExperiences]);
  
  useEffect(() => {
    if (fetchedEducation) {
      setEducation(fetchedEducation);
    }
  }, [fetchedEducation]);
  
  useEffect(() => {
    if (fetchedSkills) {
      setSkills(fetchedSkills);
    }
  }, [fetchedSkills]);
  
  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects);
    }
  }, [fetchedProjects]);
  
  // Helper functions
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: value
    });
  };
  
  const handleSaveBasicInfo = () => {
    updateUserMutation.mutate(basicInfo);
  };
  
  const handleAddWorkResponsibility = () => {
    setNewWorkExp({
      ...newWorkExp,
      keyResponsibilities: [...(newWorkExp.keyResponsibilities || []), '']
    });
  };
  
  const handleUpdateWorkResponsibility = (index: number, value: string) => {
    const updatedResponsibilities = [...(newWorkExp.keyResponsibilities || [])];
    updatedResponsibilities[index] = value;
    setNewWorkExp({
      ...newWorkExp,
      keyResponsibilities: updatedResponsibilities
    });
  };
  
  const handleRemoveWorkResponsibility = (index: number) => {
    const updatedResponsibilities = [...(newWorkExp.keyResponsibilities || [])];
    updatedResponsibilities.splice(index, 1);
    setNewWorkExp({
      ...newWorkExp,
      keyResponsibilities: updatedResponsibilities
    });
  };
  
  const handleAddEducationSkill = () => {
    setNewEducation({
      ...newEducation,
      skillsAcquired: [...(newEducation.skillsAcquired || []), '']
    });
  };
  
  const handleUpdateEducationSkill = (index: number, value: string) => {
    const updatedSkills = [...(newEducation.skillsAcquired || [])];
    updatedSkills[index] = value;
    setNewEducation({
      ...newEducation,
      skillsAcquired: updatedSkills
    });
  };
  
  const handleRemoveEducationSkill = (index: number) => {
    const updatedSkills = [...(newEducation.skillsAcquired || [])];
    updatedSkills.splice(index, 1);
    setNewEducation({
      ...newEducation,
      skillsAcquired: updatedSkills
    });
  };
  
  const handleAddProjectTechnology = () => {
    setNewProject({
      ...newProject,
      technologies: [...(newProject.technologies || []), '']
    });
  };
  
  const handleUpdateProjectTechnology = (index: number, value: string) => {
    const updatedTechs = [...(newProject.technologies || [])];
    updatedTechs[index] = value;
    setNewProject({
      ...newProject,
      technologies: updatedTechs
    });
  };
  
  const handleRemoveProjectTechnology = (index: number) => {
    const updatedTechs = [...(newProject.technologies || [])];
    updatedTechs.splice(index, 1);
    setNewProject({
      ...newProject,
      technologies: updatedTechs
    });
  };
  
  // Check if loading
  if (isUserLoading || isWorkExperiencesLoading || isEducationLoading || isSkillsLoading || isProjectsLoading || isResumeLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Resume</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Button>
      </div>
      
      <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="work-experience">Work Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        {/* Basic Info Tab */}
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal and contact information for your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={basicInfo.name || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="title">Professional Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={basicInfo.title || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={basicInfo.email || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="Your email address"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  value={basicInfo.phoneNumber || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={basicInfo.location || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" 
                  name="industry" 
                  value={basicInfo.industry || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="e.g. Technology"
                />
              </div>
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input 
                  id="domain" 
                  name="domain" 
                  value={basicInfo.domain || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <Label htmlFor="aboutMe">Professional Summary</Label>
                <Textarea 
                  id="aboutMe" 
                  name="aboutMe" 
                  value={basicInfo.aboutMe || ''} 
                  onChange={handleBasicInfoChange} 
                  placeholder="A brief summary of your professional background"
                  rows={5}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveBasicInfo} 
                className="ml-auto"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Basic Info'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Work Experience Tab */}
        <TabsContent value="work-experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Add or edit your professional experience</CardDescription>
              </div>
              <Dialog open={showAddWorkExpDialog} onOpenChange={setShowAddWorkExpDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Experience</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Work Experience</DialogTitle>
                    <DialogDescription>
                      Add details about your work experience
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-title">Job Title</Label>
                        <Input 
                          id="new-title" 
                          value={newWorkExp.title || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, title: e.target.value})} 
                          placeholder="e.g. Senior Developer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-company">Company</Label>
                        <Input 
                          id="new-company" 
                          value={newWorkExp.company || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, company: e.target.value})} 
                          placeholder="Company name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-location">Location</Label>
                        <Input 
                          id="new-location" 
                          value={newWorkExp.location || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, location: e.target.value})} 
                          placeholder="e.g. Remote, New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-industry">Industry</Label>
                        <Input 
                          id="new-industry" 
                          value={newWorkExp.industry || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, industry: e.target.value})} 
                          placeholder="e.g. Technology"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-domain">Domain</Label>
                      <Input 
                        id="new-domain" 
                        value={newWorkExp.domain || ''} 
                        onChange={(e) => setNewWorkExp({...newWorkExp, domain: e.target.value})} 
                        placeholder="e.g. Software Development"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-start-date">Start Date</Label>
                        <Input 
                          id="new-start-date" 
                          type="date" 
                          value={newWorkExp.startDate || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, startDate: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-end-date">End Date (leave blank if current)</Label>
                        <Input 
                          id="new-end-date" 
                          type="date" 
                          value={newWorkExp.endDate || ''} 
                          onChange={(e) => setNewWorkExp({...newWorkExp, endDate: e.target.value || null})} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-description">Description (optional)</Label>
                      <Textarea 
                        id="new-description" 
                        value={newWorkExp.description || ''} 
                        onChange={(e) => setNewWorkExp({...newWorkExp, description: e.target.value})} 
                        placeholder="Brief job description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Key Responsibilities</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddWorkResponsibility}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(newWorkExp.keyResponsibilities || []).map((responsibility, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input 
                              value={responsibility} 
                              onChange={(e) => handleUpdateWorkResponsibility(idx, e.target.value)} 
                              placeholder={`Responsibility #${idx + 1}`}
                            />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleRemoveWorkResponsibility(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {(!newWorkExp.keyResponsibilities || newWorkExp.keyResponsibilities.length === 0) && (
                          <p className="text-sm text-muted-foreground">Add key responsibilities to highlight your achievements</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddWorkExpDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createWorkExpMutation.mutate(newWorkExp as WorkExperience)}
                      disabled={createWorkExpMutation.isPending || !newWorkExp.title || !newWorkExp.company}
                    >
                      {createWorkExpMutation.isPending ? 'Adding...' : 'Add Experience'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {workExperiences && workExperiences.length > 0 ? (
                <Accordion type="multiple" defaultValue={['exp-0']} className="w-full">
                  {workExperiences.map((exp, idx) => (
                    <AccordionItem key={exp.id} value={`exp-${idx}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col items-start">
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company} • {new Date(exp.startDate).getFullYear()} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Job Title</Label>
                              <Input 
                                value={exp.title} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].title = e.target.value;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Company</Label>
                              <Input 
                                value={exp.company} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].company = e.target.value;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Location</Label>
                              <Input 
                                value={exp.location || ''} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].location = e.target.value;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Industry</Label>
                              <Input 
                                value={exp.industry || ''} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].industry = e.target.value;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Domain</Label>
                            <Input 
                              value={exp.domain || ''} 
                              onChange={(e) => {
                                const updated = [...workExperiences];
                                updated[idx].domain = e.target.value;
                                setWorkExperiences(updated);
                              }} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input 
                                type="date" 
                                value={format(new Date(exp.startDate), 'yyyy-MM-dd')} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].startDate = e.target.value;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input 
                                type="date" 
                                value={exp.endDate ? format(new Date(exp.endDate), 'yyyy-MM-dd') : ''} 
                                onChange={(e) => {
                                  const updated = [...workExperiences];
                                  updated[idx].endDate = e.target.value || null;
                                  setWorkExperiences(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label>Key Responsibilities</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const updated = [...workExperiences];
                                  updated[idx].keyResponsibilities = [...updated[idx].keyResponsibilities, ''];
                                  setWorkExperiences(updated);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {exp.keyResponsibilities && exp.keyResponsibilities.map((responsibility, respIdx) => (
                                <div key={respIdx} className="flex gap-2">
                                  <Input 
                                    value={responsibility} 
                                    onChange={(e) => {
                                      const updated = [...workExperiences];
                                      updated[idx].keyResponsibilities[respIdx] = e.target.value;
                                      setWorkExperiences(updated);
                                    }} 
                                  />
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    onClick={() => {
                                      const updated = [...workExperiences];
                                      updated[idx].keyResponsibilities.splice(respIdx, 1);
                                      setWorkExperiences(updated);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteWorkExpMutation.mutate(exp.id)}
                              disabled={deleteWorkExpMutation.isPending}
                            >
                              {deleteWorkExpMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button 
                              onClick={() => updateWorkExpMutation.mutate({ id: exp.id, data: workExperiences[idx] })}
                              disabled={updateWorkExpMutation.isPending}
                              size="sm"
                            >
                              {updateWorkExpMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No work experience added yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddWorkExpDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Experience</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Education</CardTitle>
                <CardDescription>Add or edit your educational background</CardDescription>
              </div>
              <Dialog open={showAddEducationDialog} onOpenChange={setShowAddEducationDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Education</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Education</DialogTitle>
                    <DialogDescription>
                      Add details about your education
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-degree">Degree</Label>
                        <Input 
                          id="new-degree" 
                          value={newEducation.degree || ''} 
                          onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})} 
                          placeholder="e.g. Bachelor of Science"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-field">Field of Study</Label>
                        <Input 
                          id="new-field" 
                          value={newEducation.fieldOfStudy || ''} 
                          onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})} 
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-institution">Institution</Label>
                      <Input 
                        id="new-institution" 
                        value={newEducation.institution || ''} 
                        onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})} 
                        placeholder="University or school name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-edu-location">Location</Label>
                        <Input 
                          id="new-edu-location" 
                          value={newEducation.location || ''} 
                          onChange={(e) => setNewEducation({...newEducation, location: e.target.value})} 
                          placeholder="e.g. New York, USA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-edu-industry">Industry</Label>
                        <Input 
                          id="new-edu-industry" 
                          value={newEducation.industry || ''} 
                          onChange={(e) => setNewEducation({...newEducation, industry: e.target.value})} 
                          placeholder="e.g. Education"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-edu-domain">Domain</Label>
                      <Input 
                        id="new-edu-domain" 
                        value={newEducation.domain || ''} 
                        onChange={(e) => setNewEducation({...newEducation, domain: e.target.value})} 
                        placeholder="e.g. Engineering"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-edu-start-date">Start Date</Label>
                        <Input 
                          id="new-edu-start-date" 
                          type="date" 
                          value={newEducation.startDate || ''} 
                          onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-edu-end-date">End Date (leave blank if current)</Label>
                        <Input 
                          id="new-edu-end-date" 
                          type="date" 
                          value={newEducation.endDate || ''} 
                          onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value || null})} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Skills Acquired</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddEducationSkill}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(newEducation.skillsAcquired || []).map((skill, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input 
                              value={skill} 
                              onChange={(e) => handleUpdateEducationSkill(idx, e.target.value)} 
                              placeholder={`Skill #${idx + 1}`}
                            />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleRemoveEducationSkill(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {(!newEducation.skillsAcquired || newEducation.skillsAcquired.length === 0) && (
                          <p className="text-sm text-muted-foreground">Add skills you acquired during your education</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddEducationDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createEducationMutation.mutate(newEducation as Education)}
                      disabled={createEducationMutation.isPending || !newEducation.degree || !newEducation.institution}
                    >
                      {createEducationMutation.isPending ? 'Adding...' : 'Add Education'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {education && education.length > 0 ? (
                <Accordion type="multiple" defaultValue={['edu-0']} className="w-full">
                  {education.map((edu, idx) => (
                    <AccordionItem key={edu.id} value={`edu-${idx}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col items-start">
                          <h3 className="font-semibold">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</h3>
                          <p className="text-sm text-muted-foreground">{edu.institution} • {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Degree</Label>
                              <Input 
                                value={edu.degree} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].degree = e.target.value;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input 
                                value={edu.fieldOfStudy || ''} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].fieldOfStudy = e.target.value;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Institution</Label>
                            <Input 
                              value={edu.institution} 
                              onChange={(e) => {
                                const updated = [...education];
                                updated[idx].institution = e.target.value;
                                setEducation(updated);
                              }} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Location</Label>
                              <Input 
                                value={edu.location || ''} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].location = e.target.value;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Industry</Label>
                              <Input 
                                value={edu.industry || ''} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].industry = e.target.value;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Domain</Label>
                            <Input 
                              value={edu.domain || ''} 
                              onChange={(e) => {
                                const updated = [...education];
                                updated[idx].domain = e.target.value;
                                setEducation(updated);
                              }} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input 
                                type="date" 
                                value={format(new Date(edu.startDate), 'yyyy-MM-dd')} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].startDate = e.target.value;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input 
                                type="date" 
                                value={edu.endDate ? format(new Date(edu.endDate), 'yyyy-MM-dd') : ''} 
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[idx].endDate = e.target.value || null;
                                  setEducation(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label>Skills Acquired</Label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const updated = [...education];
                                  updated[idx].skillsAcquired = [...(updated[idx].skillsAcquired || []), ''];
                                  setEducation(updated);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {edu.skillsAcquired && edu.skillsAcquired.map((skill, skillIdx) => (
                                <div key={skillIdx} className="flex gap-2">
                                  <Input 
                                    value={skill} 
                                    onChange={(e) => {
                                      const updated = [...education];
                                      updated[idx].skillsAcquired[skillIdx] = e.target.value;
                                      setEducation(updated);
                                    }} 
                                  />
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    onClick={() => {
                                      const updated = [...education];
                                      updated[idx].skillsAcquired.splice(skillIdx, 1);
                                      setEducation(updated);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteEducationMutation.mutate(edu.id)}
                              disabled={deleteEducationMutation.isPending}
                            >
                              {deleteEducationMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button 
                              onClick={() => updateEducationMutation.mutate({ id: edu.id, data: education[idx] })}
                              disabled={updateEducationMutation.isPending}
                              size="sm"
                            >
                              {updateEducationMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No education added yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddEducationDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Education</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add or edit your professional skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Add New Skill</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Skill name" 
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    />
                    <Input 
                      placeholder="Category (optional)" 
                      value={newSkill.category || ''}
                      onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                    />
                    <Button 
                      onClick={() => {
                        if (newSkill.name.trim()) {
                          createSkillMutation.mutate({
                            name: newSkill.name,
                            category: newSkill.category || null,
                            level: newSkill.level
                          });
                        }
                      }}
                      disabled={!newSkill.name.trim() || createSkillMutation.isPending}
                    >
                      {createSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Skills</h3>
                  {skills && skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            {skill.category && <p className="text-xs text-muted-foreground">{skill.category}</p>}
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => deleteSkillMutation.mutate(skill.id)}
                            disabled={deleteSkillMutation.isPending}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-md">
                      <p className="text-muted-foreground">No skills added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Add or edit your projects</CardDescription>
              </div>
              <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Project</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                    <DialogDescription>
                      Add details about your project
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="new-project-title">Project Title</Label>
                      <Input 
                        id="new-project-title" 
                        value={newProject.title || ''} 
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})} 
                        placeholder="e.g. E-commerce Platform"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-project-description">Description</Label>
                      <Textarea 
                        id="new-project-description" 
                        value={newProject.description || ''} 
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                        placeholder="Describe your project"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-project-category">Category</Label>
                        <Input 
                          id="new-project-category" 
                          value={newProject.category || ''} 
                          onChange={(e) => setNewProject({...newProject, category: e.target.value})} 
                          placeholder="e.g. Web Development"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-project-industry">Industry</Label>
                        <Input 
                          id="new-project-industry" 
                          value={newProject.industry || ''} 
                          onChange={(e) => setNewProject({...newProject, industry: e.target.value})} 
                          placeholder="e.g. Retail"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-project-date">Start Date</Label>
                        <Input 
                          id="new-project-date" 
                          type="date" 
                          value={newProject.startDate || ''} 
                          onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-project-url">Project URL</Label>
                        <Input 
                          id="new-project-url" 
                          value={newProject.projectUrl || ''} 
                          onChange={(e) => setNewProject({...newProject, projectUrl: e.target.value})} 
                          placeholder="https://yourproject.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Technologies Used</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddProjectTechnology}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add</span>
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {(newProject.technologies || []).map((tech, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input 
                              value={tech} 
                              onChange={(e) => handleUpdateProjectTechnology(idx, e.target.value)} 
                              placeholder={`Technology #${idx + 1}`}
                            />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleRemoveProjectTechnology(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {(!newProject.technologies || newProject.technologies.length === 0) && (
                          <p className="text-sm text-muted-foreground">Add technologies used in this project</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddProjectDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createProjectMutation.mutate(newProject as Project)}
                      disabled={createProjectMutation.isPending || !newProject.title || !newProject.description}
                    >
                      {createProjectMutation.isPending ? 'Adding...' : 'Add Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <Accordion type="multiple" defaultValue={['proj-0']} className="w-full">
                  {projects.map((project, idx) => (
                    <AccordionItem key={project.id} value={`proj-${idx}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex flex-col items-start">
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.category}{project.industry ? ` • ${project.industry}` : ''}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          <div>
                            <Label>Project Title</Label>
                            <Input 
                              value={project.title} 
                              onChange={(e) => {
                                const updated = [...projects];
                                updated[idx].title = e.target.value;
                                setProjects(updated);
                              }} 
                            />
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea 
                              value={project.description} 
                              onChange={(e) => {
                                const updated = [...projects];
                                updated[idx].description = e.target.value;
                                setProjects(updated);
                              }} 
                              rows={3}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Category</Label>
                              <Input 
                                value={project.category || ''} 
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].category = e.target.value;
                                  setProjects(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Industry</Label>
                              <Input 
                                value={project.industry || ''} 
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].industry = e.target.value;
                                  setProjects(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input 
                                type="date" 
                                value={format(new Date(project.startDate), 'yyyy-MM-dd')} 
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].startDate = e.target.value;
                                  setProjects(updated);
                                }} 
                              />
                            </div>
                            <div>
                              <Label>Project URL</Label>
                              <Input 
                                value={project.projectUrl || ''} 
                                onChange={(e) => {
                                  const updated = [...projects];
                                  updated[idx].projectUrl = e.target.value;
                                  setProjects(updated);
                                }} 
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteProjectMutation.mutate(project.id)}
                              disabled={deleteProjectMutation.isPending}
                            >
                              {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button 
                              onClick={() => updateProjectMutation.mutate({ id: project.id, data: projects[idx] })}
                              disabled={updateProjectMutation.isPending}
                              size="sm"
                            >
                              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No projects added yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddProjectDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Project</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
        <Button 
          onClick={() => {
            // Save all changes - we'll keep this simple since we're saving each section independently
            toast({
              title: 'Resume Saved',
              description: 'All your changes have been saved successfully.',
            });
            
            navigate('/profile');
          }}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          <span>Done Editing</span>
        </Button>
      </div>
    </div>
  );
}