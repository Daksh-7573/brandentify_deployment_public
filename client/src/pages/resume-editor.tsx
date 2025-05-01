import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useLocation } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertCircle,
  BriefcaseBusiness, 
  GraduationCap, 
  User2, 
  Trophy, 
  FileText, 
  Save, 
  ArrowLeft,
  PenLine,
  Layout,
  Calendar,
  MapPin,
  Trash,
  Plus,
  School,
  RefreshCw
} from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define schemas for each section
const personalInfoSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  title: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

const experienceSchema = z.object({
  experiences: z.array(
    z.object({
      id: z.number().optional(),
      title: z.string().min(1, { message: 'Job title is required' }),
      company: z.string().min(1, { message: 'Company name is required' }),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional().nullable(),
      isCurrent: z.boolean().optional(),
      description: z.string().optional(),
      responsibilities: z.array(z.string()).optional(),
    })
  ).optional(),
});

const educationSchema = z.object({
  educations: z.array(
    z.object({
      id: z.number().optional(),
      institution: z.string().min(1, { message: 'Institution name is required' }),
      degree: z.string().min(1, { message: 'Degree is required' }),
      fieldOfStudy: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional().nullable(),
      isCurrentlyEnrolled: z.boolean().optional(),
      gpa: z.string().optional(),
      achievements: z.string().optional(),
    })
  ).optional(),
});

const skillsSchema = z.object({
  skills: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, { message: 'Skill name is required' }),
      level: z.string().optional(),
      category: z.string().optional(),
    })
  ).optional(),
});

const projectsSchema = z.object({
  projects: z.array(
    z.object({
      id: z.number().optional(),
      title: z.string().min(1, { message: 'Project title is required' }),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional().nullable(),
      url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
      skills: z.array(z.string()).optional(),
      achievements: z.string().optional(),
    })
  ).optional(),
});

const resumeSettingsSchema = z.object({
  isDownloadable: z.boolean().optional(),
  visibility: z.enum(['private', 'public', 'connections']).optional(),
  themeStyle: z.enum(['professional', 'creative', 'modern', 'simple', 'elegant']).optional(),
});

// Combine all schemas
const resumeSchema = z.object({
  personalInfo: personalInfoSchema,
  experiences: experienceSchema,
  education: educationSchema,
  skills: skillsSchema,
  projects: projectsSchema,
  settings: resumeSettingsSchema,
});

// Resume editor component
export default function ResumeEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Get user ID from the URL or use the logged-in user's ID
  const userId = user?.id || 1; // Fallback to ID 1 for demo if no user ID is available
  
  // Current editing section state
  const [activeTab, setActiveTab] = useState('personal-info');
  
  // Debug info
  console.log("Resume Editor - userId:", userId);

  // Fetch resume data
  const { data: resumeData, isLoading: isResumeLoading, error: resumeError } = useQuery({
    queryKey: ['/api/users', userId, 'shadow-resume'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required to fetch shadow resume');
      }
      
      console.log(`Fetching shadow resume data for user ${userId}`);
      const response = await fetch(`/api/users/${userId}/shadow-resume`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch shadow resume: ${response.status} ${errorText}`);
        throw new Error(`Failed to fetch shadow resume: ${response.status}`);
      }
      
      return await response.json();
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
  
  console.log("Resume Editor - resumeData:", resumeData, "isResumeLoading:", isResumeLoading, "resumeError:", resumeError);
  
  // Fetch comprehensive user profile data with our new hook
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useUserProfile(userId, { enabled: !!userId });
  
  console.log("Resume Editor - profileData:", profileData, "isProfileLoading:", isProfileLoading, "profileError:", profileError);
  
  // Combined loading state
  const isLoading = isResumeLoading || isProfileLoading;
  
  // Form setup with combined schema
  const form = useForm<z.infer<typeof resumeSchema>>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      personalInfo: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        website: '',
      },
      experiences: { experiences: [] },
      education: { educations: [] },
      skills: { skills: [] },
      projects: { projects: [] },
      settings: {
        isDownloadable: false,
        visibility: 'private',
        themeStyle: 'professional',
      },
    },
  });
  
  // Update form values when profile data and resume data are loaded
  useEffect(() => {
    if (profileData) {
      console.log("Updating form with profile data:", profileData);
      
      // Handle case where resume data might not be available
      const resume = resumeData && resumeData.resume
        ? resumeData.resume 
        : {
            isDownloadable: false,
            visibility: 'private',
            themeStyle: 'professional'
          };
      
      form.reset({
        personalInfo: {
          fullName: profileData.name || '',
          title: profileData.title || '',
          email: profileData.email || '',
          phone: profileData.phoneNumber || '',
          location: profileData.location || '',
          summary: profileData.aboutMe || '',
          website: profileData.website || '',
        },
        experiences: { 
          experiences: profileData.workExperiences?.map((exp: any) => ({
            id: exp.id,
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate?.split('T')[0] || '',
            endDate: exp.endDate ? exp.endDate.split('T')[0] : null,
            isCurrent: !exp.endDate,
            description: exp.description || '',
            responsibilities: exp.keyResponsibilities || [],
          })) || []
        },
        education: {
          educations: profileData.education?.map((edu: any) => ({
            id: edu.id,
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            location: edu.location || '',
            startDate: edu.startDate?.split('T')[0] || '',
            endDate: edu.endDate ? edu.endDate.split('T')[0] : null,
            isCurrentlyEnrolled: !edu.endDate,
            gpa: edu.gpa || '',
            achievements: edu.achievements || '',
          })) || []
        },
        skills: {
          skills: profileData.skills?.map((skill: any) => ({
            id: skill.id,
            name: skill.name || '',
            level: skill.level || '',
            category: skill.category || '',
          })) || []
        },
        projects: {
          projects: profileData.projects?.map((project: any) => ({
            id: project.id,
            title: project.title || '',
            description: project.description || '',
            startDate: project.startDate?.split('T')[0] || '',
            endDate: project.endDate ? project.endDate.split('T')[0] : null,
            url: project.projectUrl || '',
            skills: project.skills || [],
            achievements: project.achievements || '',
          })) || []
        },
        settings: {
          isDownloadable: resume.isDownloadable || false,
          visibility: resume.visibility || 'private',
          themeStyle: resume.themeStyle || 'professional',
        },
      });
    }
  }, [profileData, resumeData, form]);
  
  // Save resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resumeSchema>) => {
      // Make sure we have a valid userId before making the request
      if (!userId) {
        throw new Error("User ID not available");
      }
      
      // Get the resume ID from the resumeData
      const resumeId = resumeData?.resume?.id;
      
      if (!resumeId) {
        throw new Error("Resume ID not available");
      }
      
      console.log(`Saving shadow resume ${resumeId} for user ${userId}`);
      
      // Use direct fetch instead of apiRequest to ensure correct method is used
      const response = await fetch(`/api/users/${userId}/shadow-resume/${resumeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: data,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update shadow resume: ${response.status} ${errorText}`);
        throw new Error(`Failed to update shadow resume: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Resume Saved',
        description: 'Your resume has been updated successfully. The Shadow Resume tab has been updated with your changes.',
      });
      
      // Invalidate both the shadow resume and the user profile queries
      // This ensures that both tabs get the latest data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'shadow-resume'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId],
      });
    },
    onError: (error) => {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your resume. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update resume with latest profile data
  const updateResumeFromProfile = () => {
    if (!profileData) {
      toast({
        title: 'Error',
        description: 'Unable to fetch profile data. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    // Refresh profile data first
    queryClient.invalidateQueries({
      queryKey: ['/api/users', userId],
    });
    
    // Handle case where resume data might not be available
    const resume = resumeData && resumeData.resume
      ? resumeData.resume 
      : {
          isDownloadable: false,
          visibility: 'private',
          themeStyle: 'professional'
        };
    
    form.reset({
      personalInfo: {
        fullName: profileData.name || '',
        title: profileData.title || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        location: profileData.location || '',
        summary: profileData.aboutMe || '',
        website: profileData.website || '',
      },
      experiences: { 
        experiences: profileData.workExperiences?.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate?.split('T')[0] || '',
          endDate: exp.endDate ? exp.endDate.split('T')[0] : null,
          isCurrent: !exp.endDate,
          description: exp.description || '',
          responsibilities: exp.keyResponsibilities || [],
        })) || []
      },
      education: {
        educations: profileData.education?.map((edu: any) => ({
          id: edu.id,
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          location: edu.location || '',
          startDate: edu.startDate?.split('T')[0] || '',
          endDate: edu.endDate ? edu.endDate.split('T')[0] : null,
          isCurrentlyEnrolled: !edu.endDate,
          gpa: edu.gpa || '',
          achievements: edu.achievements || '',
        })) || []
      },
      skills: {
        skills: profileData.skills?.map((skill: any) => ({
          id: skill.id,
          name: skill.name || '',
          level: skill.level || '',
          category: skill.category || '',
        })) || []
      },
      projects: {
        projects: profileData.projects?.map((project: any) => ({
          id: project.id,
          title: project.title || '',
          description: project.description || '',
          startDate: project.startDate?.split('T')[0] || '',
          endDate: project.endDate ? project.endDate.split('T')[0] : null,
          url: project.projectUrl || '',
          skills: project.skills || [],
          achievements: project.achievements || '',
        })) || []
      },
      settings: {
        isDownloadable: resume.isDownloadable || false,
        visibility: resume.visibility || 'private',
        themeStyle: resume.themeStyle || 'professional',
      },
    });
    
    // Automatically save the resume with the updated data
    saveResumeMutation.mutate(form.getValues());
    
    toast({
      title: 'Resume Updated',
      description: 'Your resume has been refreshed with the latest profile data and saved to your Shadow Resume.',
    });
  };
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof resumeSchema>) => {
    saveResumeMutation.mutate(data);
  };
  
  // Handle back to resume page
  const handleBack = () => {
    navigate('/resume');
  };
  
  // Add experience item
  const addExperience = () => {
    const currentExperiences = form.getValues('experiences.experiences') || [];
    form.setValue('experiences.experiences', [
      ...currentExperiences,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: null,
        isCurrent: false,
        description: '',
        responsibilities: [],
      },
    ]);
  };
  
  // Remove experience item
  const removeExperience = (index: number) => {
    const currentExperiences = form.getValues('experiences.experiences') || [];
    const newExperiences = [...currentExperiences];
    newExperiences.splice(index, 1);
    form.setValue('experiences.experiences', newExperiences);
  };
  
  // Add education item
  const addEducation = () => {
    const currentEducations = form.getValues('education.educations') || [];
    form.setValue('education.educations', [
      ...currentEducations,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: null,
        isCurrentlyEnrolled: false,
        gpa: '',
        achievements: '',
      },
    ]);
  };
  
  // Remove education item
  const removeEducation = (index: number) => {
    const currentEducations = form.getValues('education.educations') || [];
    const newEducations = [...currentEducations];
    newEducations.splice(index, 1);
    form.setValue('education.educations', newEducations);
  };
  
  // Add skill item
  const addSkill = () => {
    const currentSkills = form.getValues('skills.skills') || [];
    form.setValue('skills.skills', [
      ...currentSkills,
      {
        name: '',
        level: '',
        category: '',
      },
    ]);
  };
  
  // Remove skill item
  const removeSkill = (index: number) => {
    const currentSkills = form.getValues('skills.skills') || [];
    const newSkills = [...currentSkills];
    newSkills.splice(index, 1);
    form.setValue('skills.skills', newSkills);
  };
  
  // Add project item
  const addProject = () => {
    const currentProjects = form.getValues('projects.projects') || [];
    form.setValue('projects.projects', [
      ...currentProjects,
      {
        title: '',
        description: '',
        startDate: '',
        endDate: null,
        url: '',
        skills: [],
        achievements: '',
      },
    ]);
  };
  
  // Remove project item
  const removeProject = (index: number) => {
    const currentProjects = form.getValues('projects.projects') || [];
    const newProjects = [...currentProjects];
    newProjects.splice(index, 1);
    form.setValue('projects.projects', newProjects);
  };
  
  // Add responsibility to an experience
  const addResponsibility = (expIndex: number) => {
    const currentExperiences = form.getValues('experiences.experiences') || [];
    if (currentExperiences[expIndex]) {
      const currentResponsibilities = currentExperiences[expIndex].responsibilities || [];
      const newResponsibilities = [...currentResponsibilities, ''];
      const newExperiences = [...currentExperiences];
      newExperiences[expIndex] = {
        ...newExperiences[expIndex],
        responsibilities: newResponsibilities,
      };
      form.setValue('experiences.experiences', newExperiences);
    }
  };
  
  // Remove responsibility from an experience
  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const currentExperiences = form.getValues('experiences.experiences') || [];
    if (currentExperiences[expIndex] && currentExperiences[expIndex].responsibilities) {
      const newResponsibilities = [...currentExperiences[expIndex].responsibilities!];
      newResponsibilities.splice(respIndex, 1);
      const newExperiences = [...currentExperiences];
      newExperiences[expIndex] = {
        ...newExperiences[expIndex],
        responsibilities: newResponsibilities,
      };
      form.setValue('experiences.experiences', newExperiences);
    }
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Loading Resume Editor...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error states
  if (resumeError || profileError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Resume Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              There was a problem loading your resume data. Please try again later.
            </p>
            {resumeError && (
              <div className="p-4 bg-destructive/10 rounded-md">
                <p className="font-medium">Resume Error:</p>
                <p className="text-sm">{resumeError.message || 'Unknown error occurred'}</p>
              </div>
            )}
            {profileError && (
              <div className="p-4 bg-destructive/10 rounded-md">
                <p className="font-medium">Profile Error:</p>
                <p className="text-sm">{profileError.message || 'Unknown error occurred'}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Editor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume
          </Button>
        </div>
        <CardDescription>
          Edit your professional resume information
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full mb-6">
                <TabsTrigger value="personal-info" className="flex items-center gap-1">
                  <User2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Personal Info</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-1">
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="hidden sm:inline">Experience</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Education</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-1">
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Personal Information Tab */}
              <TabsContent value="personal-info" className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData?.photoURL || ''} alt={profileData?.name || 'User'} />
                        <AvatarFallback>{profileData?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h3 className="text-lg font-medium">{profileData?.name}</h3>
                        <p className="text-sm text-muted-foreground">{profileData?.title}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 space-y-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="personalInfo.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="personalInfo.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="personalInfo.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City, State, Country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="personalInfo.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="personalInfo.summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Summary</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Write a brief professional summary..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                    Add Experience
                  </Button>
                </div>
                
                {form.watch('experiences.experiences')?.map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`experiences.experiences.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`experiences.experiences.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`experiences.experiences.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`experiences.experiences.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {!form.watch(`experiences.experiences.${index}.isCurrent`) && (
                          <FormField
                            control={form.control}
                            name={`experiences.experiences.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="date"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`experiences.experiences.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue(`experiences.experiences.${index}.endDate`, null);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>Current Position</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`experiences.experiences.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Description of your role and responsibilities..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <FormLabel>Key Responsibilities</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addResponsibility(index)}
                          >
                            Add
                          </Button>
                        </div>
                        
                        {form.watch(`experiences.experiences.${index}.responsibilities`)?.map(
                          (_, respIndex) => (
                            <div key={respIndex} className="flex gap-2 items-start">
                              <FormField
                                control={form.control}
                                name={`experiences.experiences.${index}.responsibilities.${respIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input {...field} placeholder={`Responsibility ${respIndex + 1}`} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeResponsibility(index, respIndex)}
                              >
                                Remove
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {(!form.watch('experiences.experiences') || 
                  form.watch('experiences.experiences').length === 0) && (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No work experiences added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addExperience}
                    >
                      Add Experience
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Education Tab */}
              <TabsContent value="education" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Education</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                    Add Education
                  </Button>
                </div>
                
                {form.watch('education.educations')?.map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium">Education {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`education.educations.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.educations.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`education.educations.${index}.fieldOfStudy`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field of Study</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`education.educations.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.educations.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {!form.watch(`education.educations.${index}.isCurrentlyEnrolled`) && (
                          <FormField
                            control={form.control}
                            name={`education.educations.${index}.endDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="date"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`education.educations.${index}.isCurrentlyEnrolled`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked) {
                                    form.setValue(`education.educations.${index}.endDate`, null);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>Currently Enrolled</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.educations.${index}.gpa`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPA (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`education.educations.${index}.achievements`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Achievements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Honors, awards, relevant coursework..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.watch('education.educations') ||
                  form.watch('education.educations').length === 0) && (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No education added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addEducation}
                    >
                      Add Education
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Skills</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                    Add Skill
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.watch('skills.skills')?.map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-md font-medium">Skill {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSkill(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`skills.skills.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skill Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`skills.skills.${index}.level`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Skill Level (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., Beginner, Intermediate, Expert"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`skills.skills.${index}.category`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., Technical, Soft Skills, Languages"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {(!form.watch('skills.skills') || form.watch('skills.skills').length === 0) && (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No skills added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addSkill}
                    >
                      Add Skill
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Projects</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addProject}>
                    Add Project
                  </Button>
                </div>
                
                {form.watch('projects.projects')?.map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-md font-medium">Project {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProject(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`projects.projects.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`projects.projects.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Description of the project, its purpose, and your role..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`projects.projects.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`projects.projects.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="date"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`projects.projects.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project URL (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/project" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`projects.projects.${index}.achievements`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Achievements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Key achievements, outcomes, or metrics..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.watch('projects.projects') || form.watch('projects.projects').length === 0) && (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No projects added yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={addProject}
                    >
                      Add Project
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <Separator className="my-4" />
          
          <CardFooter className="flex justify-between">
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="settings.isDownloadable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Allow others to download your resume</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={updateResumeFromProfile}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Update Resume</span>
              </Button>
              
              <Button
                type="submit"
                className="gap-2"
                disabled={saveResumeMutation.isPending || !form.formState.isDirty}
              >
                {saveResumeMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Resume</span>
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}