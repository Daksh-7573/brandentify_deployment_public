import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useShadowResume } from '@/hooks/use-shadow-resume';
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
  School
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

  // Use the enhanced shadow resume hook with better persistence and caching
  const { 
    data: resumeData, 
    isLoading: isResumeLoading, 
    error: resumeError
  } = useShadowResume(userId);
  
  // Enhanced logging with conditional checks to aid debugging
  console.log("Resume Editor - resumeData:", resumeData);
  
  // Cache resume form data to localStorage for added persistence
  useEffect(() => {
    if (resumeData?.resume?.id && resumeData?.form) {
      console.log("Caching resume form data to localStorage", resumeData.form);
      localStorage.setItem(`resume_form_${resumeData.resume.id}`, JSON.stringify(resumeData.form));
    }
  }, [resumeData?.form, resumeData?.resume?.id]);
  
  // Attempt to retrieve cached form data for the current resume if API data is missing form
  const [localCachedFormData, setLocalCachedFormData] = useState<any>(null);
  
  useEffect(() => {
    if (resumeData?.resume?.id && !resumeData?.form) {
      const cachedData = localStorage.getItem(`resume_form_${resumeData.resume.id}`);
      
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log("Restored resume form data from localStorage cache", parsedData);
          setLocalCachedFormData(parsedData);
        } catch (e) {
          console.error("Failed to parse cached resume form data", e);
        }
      }
    }
  }, [resumeData?.resume?.id, resumeData?.form]);
  
  // Check if we have form data directly in the metadata field
  const [metadataFormData, setMetadataFormData] = useState<any>(null);
  
  useEffect(() => {
    if (resumeData?.resume?.metadata && !resumeData?.form) {
      try {
        const parsedMetadata = JSON.parse(resumeData.resume.metadata as string);
        console.log("Found form data in resume metadata field", parsedMetadata);
        setMetadataFormData(parsedMetadata);
      } catch (e) {
        console.error("Failed to parse resume metadata", e);
      }
    }
  }, [resumeData?.resume?.metadata, resumeData?.form]);
  
  // Verify the resume data structure
  const hasResumeData = !!resumeData;
  const hasResumeObject = !!resumeData?.resume;
  const hasApiFormData = !!resumeData?.form;
  const hasMetadataForm = !!metadataFormData;
  const hasCachedForm = !!localCachedFormData;
  const resumeDataKeys = resumeData ? Object.keys(resumeData) : [];
  // Fixed condition: We're ready if we have either the resume object or any form data
  const resumeReadyState = hasResumeObject || hasApiFormData || hasMetadataForm || hasCachedForm;
  
  // Determine the actual form data source we'll use
  const effectiveFormData = resumeData?.form || metadataFormData || localCachedFormData;
  
  console.log("Render condition check:", {
    hasResumeData,
    hasResumeObject,
    hasApiFormData,
    hasMetadataForm,
    hasCachedForm,
    resumeDataKeys,
    resumeReadyState,
    effectiveFormDataExists: !!effectiveFormData
  });
  
  // Determine where resume data is coming from for debugging
  const resumeSources = {
    fromResumeData: resumeData?.resume ? "YES" : "NO",
    hasApiForm: resumeData?.form ? "YES" : "NO",
    hasMetadataForm: metadataFormData ? "YES" : "NO",
    hasCachedForm: localCachedFormData ? "YES" : "NO",
    fromManualFetch: "YES", // We're doing a manual fetch in the component
    readyState: resumeReadyState
  };
  
  const resumeExists = !!resumeData?.resume;
  console.log("Resume exists?", resumeExists);
  console.log("Resume sources check:", resumeSources);
  
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
  
  // Keep track of whether form has been initialized to prevent continuous resets
  const [formInitialized, setFormInitialized] = useState(false);

  // Update form values when profile data and resume data are loaded
  useEffect(() => {
    // Only initialize the form once - fixes infinite loop issue
    if (profileData && !formInitialized && !isLoading) {
      console.log("Initializing form with data");
      
      // Check all possible sources of form data and use the first available one
      if (resumeData?.form) {
        // First priority: Form data directly in the API response
        console.log("Using saved resume form data from API response:", resumeData.form);
        form.reset({
          personalInfo: resumeData.form.personalInfo || {
            fullName: profileData.name || '',
            title: profileData.title || '',
            email: profileData.email || '',
            phone: profileData.phoneNumber || '',
            location: profileData.location || '',
            summary: profileData.aboutMe || '',
            website: profileData.website || '',
          },
          experiences: { 
            experiences: resumeData.form.experiences?.experiences || []
          },
          education: { 
            educations: resumeData.form.education?.educations || []
          },
          skills: { 
            skills: resumeData.form.skills?.skills || []
          },
          projects: { 
            projects: resumeData.form.projects?.projects || []
          },
          settings: {
            isDownloadable: resumeData.resume?.isDownloadable || false,
            visibility: resumeData.resume?.visibility || 'private',
            themeStyle: resumeData.resume?.themeStyle || 'professional',
          },
        });
        setFormInitialized(true);
      } 
      else if (metadataFormData) {
        // Second priority: Parsed metadata form data
        console.log("Using form data from parsed metadata:", metadataFormData);
        
        form.reset({
          ...metadataFormData,
          settings: {
            isDownloadable: resumeData?.resume?.isDownloadable || false,
            visibility: resumeData?.resume?.visibility || 'private',
            themeStyle: resumeData?.resume?.themeStyle || 'professional',
          },
        });
        setFormInitialized(true);
      }
      else if (localCachedFormData) {
        // Third priority: Cached form data from localStorage
        console.log("Using form data from localStorage cache:", localCachedFormData);
        
        form.reset({
          ...localCachedFormData,
          settings: {
            isDownloadable: resumeData?.resume?.isDownloadable || false,
            visibility: resumeData?.resume?.visibility || 'private',
            themeStyle: resumeData?.resume?.themeStyle || 'professional',
          },
        });
        setFormInitialized(true);
      }
      else {
        // Fallback to creating form data from profile if no resume form data is available
        console.log("No resume form data available, using profile data as fallback");
        
        // Handle case where resume data might not be available
        const resume = resumeData?.resume || {
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
        setFormInitialized(true);
      }
    }
  }, [profileData, resumeData?.resume?.id, resumeData?.form, metadataFormData, localCachedFormData, isLoading, formInitialized]);
  
  // Save resume mutation - enhanced for better form data persistence
  const saveResumeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resumeSchema>) => {
      // Make sure we have a valid userId before making the request
      if (!userId) {
        throw new Error("User ID not available");
      }
      
      // Get the resume ID from the resumeData
      const resumeId = resumeData?.resume?.id;
      
      // Cache the form data to localStorage for added persistence
      console.log("Saving form data to localStorage cache before API request");
      localStorage.setItem(`resume_form_latest_${userId}`, JSON.stringify(data));
      
      // Check if we need to create a new shadow resume or update an existing one
      if (!resumeId) {
        console.log(`Creating new shadow resume for user ${userId}`);
        
        // Create a new shadow resume first
        const createResponse = await fetch(`/api/users/${userId}/shadow-resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            themeStyle: data.settings.themeStyle || 'professional',
            visibility: data.settings.visibility || 'private',
            isDownloadable: data.settings.isDownloadable || false,
            isShadowResume: true,
            fileName: `${data.personalInfo.fullName || 'User'}_Resume.pdf`,
            // Add metadata field with form data for immediate persistence
            metadata: JSON.stringify(data)
          }),
        });
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error(`Failed to create shadow resume: ${createResponse.status} ${errorText}`);
          throw new Error(`Failed to create shadow resume: ${createResponse.status}`);
        }
        
        // Get the newly created resume ID
        const createResult = await createResponse.json();
        const newResumeId = createResult.id;
        
        if (!newResumeId) {
          throw new Error("Failed to get new resume ID from create response");
        }
        
        console.log(`New shadow resume created with ID ${newResumeId}`);
        
        // Cache form data with the new resumeId for reliable retrieval
        localStorage.setItem(`resume_form_${newResumeId}`, JSON.stringify(data));
        
        // Now update the newly created resume with the form data
        const updateResponse = await fetch(`/api/users/${userId}/shadow-resume/${newResumeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeData: data,
          }),
        });
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error(`Failed to update new shadow resume: ${updateResponse.status} ${errorText}`);
          throw new Error(`Failed to update new shadow resume: ${updateResponse.status}`);
        }
        
        // We no longer update profile from resume - just return the updated resume response
        console.log(`Resume settings updated successfully (ID: ${newResumeId})`);
        return await updateResponse.json();
      } else {
        // If resume exists, update it normally
        console.log(`Updating existing resume ${resumeId} for user ${userId}`);
        
        // Cache form data with the resumeId for reliable retrieval
        localStorage.setItem(`resume_form_${resumeId}`, JSON.stringify(data));
        
        // Update the shadow resume data with form data in both places (resumeData and metadata)
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
        
        // We no longer update profile from resume - just return the updated resume response
        console.log(`Resume settings updated successfully (ID: ${resumeId})`);
        return await response.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Resume Saved',
        description: 'Your resume settings have been updated successfully. Your profile remains unchanged.',
      });
      
      // After successful save, make sure we update our local cached form data
      if (data?.resume?.id) {
        console.log("Updating localStorage cache after successful save for resume ID:", data.resume.id);
        
        // If the server sent back form data, cache that
        if (data.form) {
          localStorage.setItem(`resume_form_${data.resume.id}`, JSON.stringify(data.form));
        }
      }
      
      // Invalidate only resume data, not profile
      queryClient.invalidateQueries({
        queryKey: ['/api/users', userId, 'shadow-resume'],
      });
      
      // This simple timeout allows the UI to show success before refreshing resume data
      setTimeout(() => {
        // Force a refresh of the resume data to ensure we have the latest with updated metadata
        queryClient.refetchQueries({
          queryKey: ['/api/users', userId, 'shadow-resume'],
        });
      }, 300);
    },
    onError: (error) => {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your resume settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
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

  // Handle error states - but only if we also don't have profile data
  // We can still show the form with profile data even if resume data failed to load
  if ((resumeError || profileError) && !profileData) {
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
  
  // If we have errors but profile data loaded, show a warning but still render the form
  if ((resumeError || profileError) && profileData) {
    toast({
      title: 'Warning',
      description: 'Some data may not have loaded properly. You can still edit your resume, but saving may create a new resume.',
      variant: 'default',
      duration: 7000,
    });
  }
  
  // Check if we're showing a fallback form (happens when resumeData is null/undefined)
  const showFallbackForm = !resumeData || !resumeData.resume;
  
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
                onClick={() => {
                  // Show a loading toast
                  toast({
                    title: "Updating Resume",
                    description: "Refreshing with your latest profile information...",
                  });
                  
                  if (resumeData?.resume?.id && userId) {
                    // Fetch the latest profile data from the API endpoint
                    fetch(`/api/users/${userId}/shadow-resume/${resumeData.resume.id}/refresh`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    })
                    .then(response => {
                      // Save response status for debugging
                      console.log(`Update resume API status: ${response.status}`);
                      
                      if (!response.ok) {
                        // Parse error message if possible
                        return response.text().then(errorText => {
                          console.error(`Error response text: ${errorText}`);
                          throw new Error(`Failed to update resume: ${response.status} ${errorText || 'No error details'}`);
                        });
                      }
                      return response.json();
                    })
                    .then(data => {
                      console.log("Resume update successful:", data);
                      // First reload comprehensive profile data
                      queryClient.invalidateQueries({
                        queryKey: ['/api/users', userId]
                      });
                      
                      // Then reload the shadow resume data
                      queryClient.invalidateQueries({
                        queryKey: ['/api/users', userId, 'shadow-resume']
                      });
                      
                      // Show success toast
                      toast({
                        title: "Resume Updated",
                        description: "Your resume has been updated with the latest profile information.",
                      });
                      
                      // Wait for data to refresh
                      setTimeout(() => {
                        window.location.reload(); // Safer approach to ensure clean state
                      }, 1000);
                    })
                    .catch(error => {
                      console.error('Error updating resume:', error);
                      toast({
                        title: "Update Failed",
                        description: error.message || "There was a problem updating your resume. Please try again.",
                        variant: "destructive",
                      });
                    });
                  } else {
                    toast({
                      title: "Update Failed",
                      description: "Resume data not available. Please try again later.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <PenLine className="h-4 w-4" />
                <span>Update</span>
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