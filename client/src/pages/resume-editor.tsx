import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useShadowResume } from '@/hooks/use-shadow-resume';
import { useUserProfile } from '@/hooks/use-user-profile';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  FileText,
  User2,
  BriefcaseBusiness,
  GraduationCap,
  Trophy,
  Layout,
  CirclePlus,
  CircleMinus,
  Building,
  Calendar,
  MapPin,
  ArrowUpRight, 
  BookText,
  Save,
  PenLine,
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

// Separate component for error display to avoid hook ordering issues
function ErrorDisplay({ resumeError, profileError, handleBack }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Error Loading Resume Editor
        </CardTitle>
        <CardDescription>
          We encountered a problem loading your data
        </CardDescription>
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
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Separate component for loading display
function LoadingDisplay() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loading Resume Editor...</CardTitle>
        <CardDescription>Please wait while we fetch your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main resume editor component
export default function ResumeEditor() {
  // Initialize all hooks at the top level without conditional execution
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Get user ID from the URL or use the logged-in user's ID
  const userId = user?.id || 2;
  
  // State variables
  const [activeTab, setActiveTab] = useState('personal-info');
  const [pageStatus, setPageStatus] = useState('initializing');
  const [localCachedFormData, setLocalCachedFormData] = useState<any>(null);
  const [metadataFormData, setMetadataFormData] = useState<any>(null);
  const [formInitialized, setFormInitialized] = useState(false);
  
  // Data fetching hooks
  const { 
    data: resumeData, 
    isLoading: isResumeLoading, 
    error: resumeError
  } = useShadowResume(userId);
  
  const { 
    data: profileData, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useUserProfile(userId, { 
    enabled: !!userId 
  });
  
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
  
  // Navigation helpers
  const handleBack = () => {
    navigate('/resume');
  };
  
  // Create a loading state for the update operation
  const [isUpdatingFromProfile, setIsUpdatingFromProfile] = useState(false);
  
  // Update resume data from profile
  const updateFromProfile = async () => {
    if (!profileData) {
      toast({
        title: 'Profile data not loaded',
        description: 'Unable to update from profile because the profile data is not loaded.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUpdatingFromProfile(true);
    console.log('Current form values:', form.getValues());
    
    try {
      // Use the existing profile data as a backup, in case we can't fetch new data
      let latestProfileData = profileData;
      
      // Fetch all the data we need
      console.log('Fetching all profile data from API for user', userId);
      
      // Try to get the latest profile data
      try {
        const profileResponse = await fetch(`/api/users/${userId}`);
        if (profileResponse.ok) {
          const fetchedProfileData = await profileResponse.json();
          latestProfileData = fetchedProfileData;
          console.log('Latest profile data fetched successfully:', latestProfileData);
        } else {
          console.warn('Profile data endpoint returned status:', profileResponse.status);
          console.warn('Using existing profile data from context');
        }
      } catch (error) {
        console.warn('Error fetching profile data:', error);
        console.warn('Using existing profile data from context');
      }
      console.log('Latest profile data fetched:', latestProfileData);
      
      // Initialize empty arrays for each section
      let workExperiences = [];
      let educations = [];
      let skills = [];
      let projects = [];

      // Try to get work experiences
      try {
        console.log('Fetching work experiences...');
        const experiencesResponse = await fetch(`/api/users/${userId}/work-experiences`);
        if (experiencesResponse.ok) {
          workExperiences = await experiencesResponse.json();
          console.log('Work experiences fetched successfully:', workExperiences);
        } else {
          console.warn('Work experiences endpoint returned status:', experiencesResponse.status);
          console.warn('Using empty array for work experiences');
        }
      } catch (error) {
        console.warn('Error fetching work experiences:', error);
        console.warn('Using empty array for work experiences');
      }
      
      // Try to get education
      try {
        console.log('Fetching education...');
        const educationResponse = await fetch(`/api/users/${userId}/educations`);
        if (educationResponse.ok) {
          educations = await educationResponse.json();
          console.log('Education fetched successfully:', educations);
        } else {
          console.warn('Education endpoint returned status:', educationResponse.status);
          console.warn('Using empty array for education');
        }
      } catch (error) {
        console.warn('Error fetching education:', error);
        console.warn('Using empty array for education');
      }
      
      // Try to get skills
      try {
        console.log('Fetching skills...');
        const skillsResponse = await fetch(`/api/users/${userId}/skills`);
        if (skillsResponse.ok) {
          skills = await skillsResponse.json();
          console.log('Skills fetched successfully:', skills);
        } else {
          console.warn('Skills endpoint returned status:', skillsResponse.status);
          console.warn('Using empty array for skills');
        }
      } catch (error) {
        console.warn('Error fetching skills:', error);
        console.warn('Using empty array for skills');
      }
      
      // Try to get projects
      try {
        console.log('Fetching projects...');
        const projectsResponse = await fetch(`/api/users/${userId}/projects`);
        if (projectsResponse.ok) {
          projects = await projectsResponse.json();
          console.log('Projects fetched successfully:', projects);
        } else {
          console.warn('Projects endpoint returned status:', projectsResponse.status);
          console.warn('Using empty array for projects');
        }
      } catch (error) {
        console.warn('Error fetching projects:', error);
        console.warn('Using empty array for projects');
      }
      
      // Create base personal info from the latest profile data
      const basePersonalInfo = {
        fullName: latestProfileData.name || '',
        title: latestProfileData.title || '',
        email: latestProfileData.email || '',
        phone: latestProfileData.phoneNumber || '',
        location: latestProfileData.location || '',
        summary: latestProfileData.aboutMe || '',
        website: latestProfileData.website || '',
      };
      
      // Map work experiences to resume format
      const mappedExperiences = workExperiences.map(exp => ({
        title: exp.position || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || null,
        isCurrent: exp.isCurrent || false,
        description: exp.description || '',
        industry: exp.industry || '',
        domain: exp.domain || '',
        responsibilities: exp.responsibilities || '',
      }));
      
      // Map education to resume format
      const mappedEducations = educations.map(edu => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        fieldOfStudy: edu.fieldOfStudy || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        isCurrentlyEnrolled: edu.isCurrent || false,
        gpa: edu.gpa || '',
        achievements: edu.achievements || '',
        skillsAcquired: edu.skillsAcquired || [],
      }));
      
      // Map skills to resume format
      const mappedSkills = skills.map(skill => ({
        name: typeof skill === 'string' ? skill : skill.name || '',
        level: typeof skill === 'object' ? skill.level || 'Intermediate' : 'Intermediate',
        category: typeof skill === 'object' ? skill.category || '' : '',
      }));
      
      // Map projects to resume format
      const mappedProjects = projects.map(proj => ({
        title: proj.title || '',
        description: proj.description || '',
        startDate: proj.startDate || '',
        endDate: proj.endDate || null,
        url: proj.projectUrl || '',
        skills: proj.technologies || [],
        achievements: proj.description || '',
        category: proj.category || '',
      }));
      
      // Create updated form values
      const settings = resumeData?.form?.settings || {
        isDownloadable: resumeData?.resume?.isDownloadable || false,
        visibility: resumeData?.resume?.visibility || 'private',
        themeStyle: resumeData?.resume?.themeStyle || 'professional',
      };
      
      // Complete form object
      const updatedValues = {
        personalInfo: basePersonalInfo,
        experiences: { 
          experiences: mappedExperiences 
        },
        education: { 
          educations: mappedEducations 
        },
        skills: { 
          skills: mappedSkills 
        },
        projects: { 
          projects: mappedProjects 
        },
        settings: settings,
      };
      
      console.log('Complete form data to be set:', updatedValues);
      
      // Reset form with updated values
      form.reset(updatedValues);
      
      // Force re-render to ensure all fields display properly
      setTimeout(() => {
        form.reset(updatedValues);
        
        // Show success toast
        toast({
          title: 'Profile data updated',
          description: 'Your resume has been updated with the latest profile information.',
          variant: 'default',
        });
        
        setIsUpdatingFromProfile(false);
      }, 100);
      
    } catch (error) {
      console.error('Error updating from profile:', error);
      toast({
        title: 'Update failed',
        description: `Failed to update from profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsUpdatingFromProfile(false);
    }
  };
  
  // Helper functions for form array management
  const addExperience = () => {
    const experiences = form.getValues('experiences.experiences') || [];
    form.setValue('experiences.experiences', [
      ...experiences,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      },
    ]);
  };
  
  const removeExperience = (index: number) => {
    const experiences = form.getValues('experiences.experiences') || [];
    form.setValue(
      'experiences.experiences',
      experiences.filter((_, i) => i !== index)
    );
  };
  
  const addEducation = () => {
    const educations = form.getValues('education.educations') || [];
    form.setValue('education.educations', [
      ...educations,
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrentlyEnrolled: false,
        gpa: '',
        achievements: '',
      },
    ]);
  };
  
  const removeEducation = (index: number) => {
    const educations = form.getValues('education.educations') || [];
    form.setValue(
      'education.educations',
      educations.filter((_, i) => i !== index)
    );
  };
  
  const addSkill = () => {
    const skills = form.getValues('skills.skills') || [];
    form.setValue('skills.skills', [
      ...skills,
      {
        name: '',
        level: 'Intermediate',
        category: '',
      },
    ]);
  };
  
  const removeSkill = (index: number) => {
    const skills = form.getValues('skills.skills') || [];
    form.setValue(
      'skills.skills',
      skills.filter((_, i) => i !== index)
    );
  };
  
  const addProject = () => {
    const projects = form.getValues('projects.projects') || [];
    form.setValue('projects.projects', [
      ...projects,
      {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        url: '',
        skills: [],
        achievements: '',
      },
    ]);
  };
  
  const removeProject = (index: number) => {
    const projects = form.getValues('projects.projects') || [];
    form.setValue(
      'projects.projects',
      projects.filter((_, i) => i !== index)
    );
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof resumeSchema>) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Create JSON string for metadata
      const metadata = JSON.stringify(values);
      
      // Build the request data
      const requestData = {
        userId,
        resumeId: resumeData?.resume?.id, // Include resume ID if we're updating
        isDownloadable: values.settings.isDownloadable,
        visibility: values.settings.visibility,
        themeStyle: values.settings.themeStyle,
        metadata, // Send the full form data as metadata
        isShadowResume: true // Mark this as a shadow resume
      };
      
      // Check if we're creating a new resume or updating an existing one
      if (resumeData?.resume?.id) {
        // Update existing resume
        const response = await fetch(`/api/shadow-resume/${resumeData.resume.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update resume: ${response.statusText}`);
        }
        
        // Show success message
        toast({
          title: 'Resume updated',
          description: 'Your resume has been updated successfully.',
          variant: 'default',
        });
      } else {
        // Create new resume
        const response = await fetch('/api/shadow-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create resume: ${response.statusText}`);
        }
        
        // Show success message
        toast({
          title: 'Resume created',
          description: 'Your resume has been created successfully.',
          variant: 'default',
        });
      }
      
      // Invalidate the queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/shadow-resume', userId] });
      setPageStatus('saved-successfully');
      
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: 'Error',
        description: `Failed to save resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setPageStatus('save-error');
    }
  };
  
  // All useEffect hooks consolidated
  // Log page status
  useEffect(() => {
    console.log(`Resume Editor - Status: ${pageStatus} for userId: ${userId}`);
  }, [pageStatus, userId]);
  
  // Cache resume form data
  useEffect(() => {
    if (resumeData?.resume?.id && resumeData?.form) {
      console.log("Caching resume form data to localStorage", resumeData.form);
      localStorage.setItem(`resume_form_${resumeData.resume.id}`, JSON.stringify(resumeData.form));
    }
  }, [resumeData?.form, resumeData?.resume?.id]);
  
  // Retrieve cached form data
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
  
  // Parse metadata
  useEffect(() => {
    if (resumeData?.resume?.metadata && !resumeData?.form) {
      try {
        const parsedMetadata = JSON.parse(resumeData.resume.metadata as string);
        console.log("Found form data in resume metadata field", parsedMetadata);
        setMetadataFormData(parsedMetadata);
        setPageStatus('metadata-parsed');
      } catch (e) {
        console.error("Failed to parse resume metadata", e);
        setPageStatus('metadata-parse-failed');
      }
    }
  }, [resumeData?.resume?.metadata, resumeData?.form]);
  
  // Initialize form data
  useEffect(() => {
    if (profileData && !formInitialized && !isLoading) {
      console.log("Initializing form with data");
      setPageStatus('initializing-form');
      
      // Create the base personal info from profile data to ensure we always have fresh profile data
      const basePersonalInfo = {
        fullName: profileData.name || '',
        title: profileData.title || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        location: profileData.location || '',
        summary: profileData.aboutMe || '',
        website: profileData.website || '',
      };
      
      // Always use profile data as the base, and only supplement with form/metadata data
      // Determine which data source to use
      if (resumeData?.form) {
        console.log("Using saved resume form data from API response but ensuring profile data integration");
        form.reset({
          personalInfo: {
            ...basePersonalInfo,
            // Selectively override with form data only if it's been intentionally changed
            ...(resumeData.form.personalInfo || {}),
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
      } 
      else if (metadataFormData) {
        console.log("Using form data from parsed metadata with profile integration");
        form.reset({
          ...metadataFormData,
          personalInfo: {
            ...basePersonalInfo,
            ...(metadataFormData.personalInfo || {}),
          },
          settings: {
            isDownloadable: resumeData?.resume?.isDownloadable || false,
            visibility: resumeData?.resume?.visibility || 'private',
            themeStyle: resumeData?.resume?.themeStyle || 'professional',
          },
        });
      }
      else if (localCachedFormData) {
        console.log("Using form data from localStorage cache with profile integration");
        form.reset({
          ...localCachedFormData,
          personalInfo: {
            ...basePersonalInfo,
            ...(localCachedFormData.personalInfo || {}),
          },
          settings: {
            isDownloadable: resumeData?.resume?.isDownloadable || false,
            visibility: resumeData?.resume?.visibility || 'private',
            themeStyle: resumeData?.resume?.themeStyle || 'professional',
          },
        });
      }
      else {
        console.log("No saved form data, initializing from profile data");
        form.reset({
          personalInfo: basePersonalInfo,
          experiences: { experiences: [] },
          education: { educations: [] },
          skills: { skills: [] },
          projects: { projects: [] },
          settings: {
            isDownloadable: resumeData?.resume?.isDownloadable || false,
            visibility: resumeData?.resume?.visibility || 'private',
            themeStyle: resumeData?.resume?.themeStyle || 'professional',
          },
        });
      }
      
      setFormInitialized(true);
      setPageStatus('form-initialized');
    }
  }, [profileData, resumeData, metadataFormData, localCachedFormData, form, formInitialized, isLoading]);
  
  // Show error toast for partial data loading
  useEffect(() => {
    if ((resumeError || profileError) && profileData) {
      toast({
        title: 'Warning',
        description: 'Some data may not have loaded properly. You can still edit your resume, but saving may create a new resume.',
        variant: 'default',
        duration: 7000,
      });
    }
  }, [resumeError, profileError, profileData, toast]);
  
  // Set error status
  useEffect(() => {
    if ((resumeError || profileError) && !profileData) {
      setPageStatus('error-loading');
    }
  }, [resumeError, profileError, profileData]);
  
  // Logging for debugging
  useEffect(() => {
    console.log("Resume Editor - resumeData:", resumeData);
    
    // Verify the resume data structure
    const hasResumeData = !!resumeData;
    const hasResumeObject = !!resumeData?.resume;
    const hasApiFormData = !!resumeData?.form;
    const hasMetadataForm = !!metadataFormData;
    const hasCachedForm = !!localCachedFormData;
    const resumeDataKeys = resumeData ? Object.keys(resumeData) : [];
    const resumeReadyState = hasResumeObject || hasApiFormData || hasMetadataForm || hasCachedForm;
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
    console.log("Resume Editor - profileData:", profileData, "isProfileLoading:", isProfileLoading, "profileError:", profileError);
  }, [resumeData, resumeError, profileData, profileError, isProfileLoading, metadataFormData, localCachedFormData]);
  
  // Conditional rendering based on state
  if (isLoading) {
    return <LoadingDisplay />;
  }
  
  if ((resumeError || profileError) && !profileData) {
    return <ErrorDisplay 
      resumeError={resumeError} 
      profileError={profileError} 
      handleBack={handleBack} 
    />;
  }
  
  // Main content render
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Editor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={updateFromProfile}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update from Profile
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
                                  <Input {...field} type="date" />
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
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>This is my current position</FormLabel>
                            <FormMessage />
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
                              <Textarea {...field} className="min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.watch('experiences.experiences') || form.watch('experiences.experiences').length === 0) && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-secondary/25 p-4 mb-4">
                      <BriefcaseBusiness className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium">No work experience added yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your professional experience to showcase your career growth.
                    </p>
                    <Button type="button" onClick={addExperience}>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                      
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
                                  <Input {...field} type="date" />
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
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Currently enrolled</FormLabel>
                            <FormMessage />
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
                              <Textarea {...field} className="min-h-[80px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {(!form.watch('education.educations') || form.watch('education.educations').length === 0) && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-secondary/25 p-4 mb-4">
                      <School className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium">No education added yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your educational background to highlight your academic achievements.
                    </p>
                    <Button type="button" onClick={addEducation}>
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
                          <Trash className="h-4 w-4" />
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
                        
                        <FormField
                          control={form.control}
                          name={`skills.skills.${index}.level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Proficiency Level</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Expert">Expert</option>
                                </select>
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
                                <Input {...field} placeholder="e.g., Programming, Design, Marketing" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
                
                {(!form.watch('skills.skills') || form.watch('skills.skills').length === 0) && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-secondary/25 p-4 mb-4">
                      <Trophy className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium">No skills added yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your professional skills to showcase your expertise.
                    </p>
                    <Button type="button" onClick={addSkill}>
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
                              <Textarea {...field} className="min-h-[80px]" />
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
                              <FormLabel>Start Date</FormLabel>
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
                              <FormLabel>End Date (leave empty if ongoing)</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
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
                              <Input {...field} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Note: Skills array input would be more complex and require custom implementation */}
                      
                      <FormField
                        control={form.control}
                        name={`projects.projects.${index}.achievements`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Achievements (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                className="min-h-[80px]"
                                placeholder="Describe the key achievements and outcomes of this project" 
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
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-secondary/25 p-4 mb-4">
                      <Layout className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-medium">No projects added yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your projects to showcase your portfolio work.
                    </p>
                    <Button type="button" onClick={addProject}>
                      Add Project
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="settings.isDownloadable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Make Downloadable</FormLabel>
                      <FormDescription className="text-xs">
                        Allow others to download your resume
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Resume
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}