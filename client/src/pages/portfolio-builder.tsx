import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Education, Service } from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Import our portfolio templates
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub"; // Using the new improved template
import TimelineStoryteller from "@/components/portfolio/templates/timeline-storyteller";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";
import Animated from "@/components/portfolio/templates/animated";
import Scholar from "@/components/portfolio/templates/scholar";
import TestWhatIOffer from "@/components/portfolio/templates/test-whatioffer";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
// Removed Sidebar import, using top navigation only
import { apiRequest } from "@/lib/queryClient";
import { ProfileSkeleton, SectionSkeleton } from "@/components/ui/skeleton-loaders";

// Define AuthUser type to match Firebase user structure
type AuthUser = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Add other Firebase user fields as needed
};
import { ProfileImage } from "@/components/ui/profile-image";
import { 
  Loader2, Eye, ChevronRight, Check, ArrowLeft, Bot, 
  Mail, Linkedin, Instagram, Briefcase, Award, User,
  Code, Github, Terminal
} from "lucide-react";
import Header from "@/components/layout/header";

// Define the schema for portfolio form
const portfolioFormSchema = z.object({
  layout: z.enum([
    "professional", "creative", "minimal", "technical", "executive", "minimalist_pro",
    "minimalist-pro", "timeline-storyteller", "visual-expert", "corporate-executive", 
    "dynamic-innovator", "freelancer-hub", "animated", "scholar"
  ]),
  isPublished: z.boolean().default(false),
  publicUrl: z.string().nullable().optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

// Wizard steps
const STEPS = {
  SELECT_LAYOUT: 0,
  PREVIEW: 1,
  PUBLISH: 2
};

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_LAYOUT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Define User type to match server-side schema
  type User = {
    id: number;
    username: string;
    email: string;
    name: string;
    title: string | null;
    photoURL: string | null;
    industry: string | null;
    domain: string | null;
    location: string | null;
    jobLevel: string | null;
    lookingFor: string | null;
    aboutMe: string | null;
    whatIOffer: string | null;
    // Add other fields as needed
  };
  
  // Fetch user profile data with proper typing
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${user?.uid}`], // This uses Firebase UID to get the numeric DB ID
    enabled: !!user,
    staleTime: 30000
  });
  
  // Directly fetch user data for debugging
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchUserData = async () => {
      try {
        console.log("Directly fetching user data for debugging whatIOffer field");
        const response = await fetch(`/api/users/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Direct user data fetch result:", data);
          console.log("whatIOffer field:", data.whatIOffer);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, [user?.uid]);
  
  // Fetch user profile numeric ID for use in other queries
  const userNumericId = userData?.id;
  
  // Fetch existing portfolio if it exists
  const { data: portfolio, isLoading: isLoadingPortfolio, isError: isPortfolioError } = useQuery({
    queryKey: [`/api/users/${userNumericId}/portfolio`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
    // If portfolio not found, we'll create one in the portfolioMutation
    onError: (error) => {
      console.log("Portfolio not found, will create one when user selects a template");
    }
  });
  
  // Define types for experiences, skills, and projects
  type WorkExperience = {
    id: number;
    userId: number;
    title: string;
    company: string;
    industry: string;
    domain: string;
    location: string;
    startDate: string;
    endDate: string | null;
    description: string;
  };
  
  type Skill = {
    id: number;
    userId: number;
    name: string;
    level: string;
    proficiency: number;
  };
  
  type Project = {
    id: number;
    userId: number;
    title: string;
    description: string | null;
    startDate: string;
    // Other project fields
  };
  
  // Education and Service types are imported from @shared/schema at the top of file

  // Fetch user experiences - use the numerical ID instead of Firebase UID
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<WorkExperience[]>({
    queryKey: [`/api/users/${userNumericId}/experiences`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000
  });
  
  // Fetch user education
  const { data: educations, isLoading: isLoadingEducations } = useQuery<Education[]>({
    queryKey: [`/api/users/${userNumericId}/educations`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000,
    onSuccess: (data) => {
      console.log("Education Query - Fetched educations data:", data);
      console.log("Education Query - Data length:", data?.length);
    }
  });
  
  // Direct education data fetch to verify data from API
  useEffect(() => {
    if (!userNumericId) return;
    
    const fetchEducationData = async () => {
      try {
        console.log("Education - Directly fetching education data");
        const response = await fetch(`/api/users/${userNumericId}/educations`);
        if (response.ok) {
          const data = await response.json();
          console.log("Education - Direct education fetch result:", data);
        }
      } catch (error) {
        console.error("Error directly fetching education data:", error);
      }
    };
    
    fetchEducationData();
  }, [userNumericId]);
  
  // Fetch user services
  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/users/${userNumericId}/services`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000,
    onSuccess: (data) => {
      console.log("Portfolio builder - Fetched services data:", data);
      console.log("Portfolio builder - Services data length:", data?.length);
      console.log("Portfolio builder - Services data type:", typeof data, Array.isArray(data));
    }
  });
  
  // Direct fetch for services data to compare with the useQuery result
  useEffect(() => {
    if (!userNumericId) return;
    
    const fetchServices = async () => {
      try {
        console.log("Directly fetching services data");
        const response = await fetch(`/api/users/${userNumericId}/services`);
        if (response.ok) {
          const data = await response.json();
          console.log("Direct services fetch result:", data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    
    fetchServices();
  }, [userNumericId]);
  
  // For direct fetching when needed in useEffects and other places
  const fetchLatestExperiences = async () => {
    if (!userNumericId) return [];
    
    console.log("Work Experience - Directly fetching latest experiences data", Date.now());
    try {
      // First try fetching by userNumericId
      const response = await fetch(`/api/users/${userNumericId}/experiences`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache, no-store' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Work Experience - Got direct fetch data for userNumericId:", data);
        
        // If no data, try with userId=0 (existing data)
        if (data.length === 0) {
          const fallbackResponse = await fetch(`/api/users/0/experiences`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log("Work Experience - Got fallback data for userId=0:", fallbackData);
            return fallbackData;
          }
        }
        
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch latest experiences:", error);
    }
    return [];
  };
  
  // Fetch user skills - use the numerical ID instead of Firebase UID
  const { data: skills, isLoading: isLoadingSkills } = useQuery<Skill[]>({
    queryKey: [`/api/users/${userNumericId}/skills`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000
  });
  
  // For direct fetching when needed in useEffects and other places
  const fetchLatestSkills = async () => {
    if (!userNumericId) return [];
    
    console.log("Skills - Directly fetching latest skills data", Date.now());
    try {
      // First try fetching by userNumericId
      const response = await fetch(`/api/users/${userNumericId}/skills`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache, no-store' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Skills - Got direct fetch data for userNumericId:", data);
        
        // If no data, try with userId=0 (existing data)
        if (data.length === 0) {
          const fallbackResponse = await fetch(`/api/users/0/skills`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log("Skills - Got fallback data for userId=0:", fallbackData);
            return fallbackData;
          }
        }
        
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch latest skills:", error);
    }
    return [];
  };
  
  // Fetch user projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: [`/api/users/${userNumericId}/projects`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000
  });

  // Form setup
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      layout: "corporate-executive", // Set to show The Corporate Executive by default
      isPublished: false,
      publicUrl: "",
    }
  });

  // Set form values when portfolio data is loaded
  useEffect(() => {
    if (portfolio) {
      // Define the portfolio with proper typing to match the Portfolio type from schema
      const typedPortfolio = portfolio as {
        id: number;
        userId: number;
        layout: string;
        isPublished: boolean;
        publicUrl: string | null;
      };
      
      form.reset({
        layout: typedPortfolio.layout as any, // Cast to match enum
        isPublished: typedPortfolio.isPublished,
        publicUrl: typedPortfolio.publicUrl || "",
      });
    }
  }, [portfolio, form]);

  // Define mutation for create/update portfolio
  const portfolioMutation = useMutation({
    mutationFn: async (data: PortfolioFormValues) => {
      if (portfolio) {
        // Type the portfolio for accessing id
        const typedPortfolio = portfolio as { id: number };
        // Update existing portfolio
        const res = await apiRequest("PUT", `/api/portfolios/${typedPortfolio.id}`, data);
        return await res.json();
      } else {
        // Create new portfolio - use numeric user ID instead of Firebase UID
        const res = await apiRequest("POST", "/api/portfolios", {
          ...data,
          userId: userNumericId // Use the numeric ID from database instead of Firebase UID
        });
        return await res.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: portfolio ? "Portfolio updated!" : "Portfolio created!",
        description: "Your portfolio has been saved successfully.",
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/portfolio`] });
      setCurrentStep(STEPS.PUBLISH);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save portfolio: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Layout templates
  const layoutOptions = [
    { 
      id: "corporate-executive", 
      name: "The Corporate Executive", 
      description: `✔ Theme: High-End, Premium, & Polished
✔ Best For: Senior Executives, Investors, Industry Experts`,
      theme: "#DAA520"
    },
    { 
      id: "scholar", 
      name: "The Scholar", 
      description: `✔ Theme: Clean, Modern, Knowledge-Centric
✔ Best For: Students, Fresh Graduates, Interns, Early-Career Professionals`,
      theme: "#4F86C6"
    },
    { 
      id: "timeline-storyteller", 
      name: "The Timeline Storyteller", 
      description: `✔ Theme: Interactive & Storytelling-Based
✔ Best For: Product Managers, Entrepreneurs, Creatives`,
      theme: "#FF6B6B"
    },
    { 
      id: "visual-expert", 
      name: "The Visual Expert", 
      description: `✔ Theme: Image-First, Creative & Bold
✔ Best For: Designers, Photographers, Marketers`,
      theme: "#F8C471"
    },
    { 
      id: "dynamic-innovator", 
      name: "The Dynamic Innovator", 
      description: `✔ Theme: Futuristic & High-Tech
✔ Best For: AI Experts, Engineers, Startups`,
      theme: "#0FF0FC"
    },
    { 
      id: "freelancer-hub", 
      name: "The Freelancer Hub", 
      description: `✔ Theme: Colorful, Playful, Expressive
✔ Best For: Freelancers, Influencers, Coaches, Creators`,
      theme: "#FF5757"
    },
    { 
      id: "animated", 
      name: "The Animated", 
      description: `✔ Theme: Fully Animated, Motion-Driven, Interactive
✔ Best For: Motion Designers, VFX Artists, Web Animators, AR/VR & Game Designers`,
      theme: "#00E5FF"
    }
  ];

  // Handle creating portfolio with AI
  const handleCreatePortfolio = () => {
    setIsAnalyzingProfile(true);

    // First check if we have the user's profile and portfolio related data
    setTimeout(() => {
      setIsAnalyzingProfile(false);
      setIsGenerating(true);

      // Directly fetch the most up-to-date data
      const fetchAllUserData = async () => {
        let experiencesData = [];
        let skillsData = [];
        let projectsData = [];
        let educationsData = [];
        let servicesData = [];
        
        if (userNumericId) {
          try {
            // Fetch latest experiences from userNumericId
            const expResponse = await fetch(`/api/users/${userNumericId}/experiences`);
            if (expResponse.ok) {
              experiencesData = await expResponse.json();
              console.log("Portfolio - Got latest experiences for userNumericId:", experiencesData);
              
              // If no experiences, try with userId=0 (for existing data)
              if (experiencesData.length === 0) {
                const fallbackResponse = await fetch(`/api/users/0/experiences`);
                if (fallbackResponse.ok) {
                  experiencesData = await fallbackResponse.json();
                  console.log("Portfolio - Got fallback experiences for userId=0:", experiencesData);
                }
              }
            }
            
            // Fetch latest skills from userNumericId
            const skillsResponse = await fetch(`/api/users/${userNumericId}/skills`);
            if (skillsResponse.ok) {
              skillsData = await skillsResponse.json();
              console.log("Portfolio - Got latest skills for userNumericId:", skillsData);
              
              // If no skills, try with userId=0 (for existing data)
              if (skillsData.length === 0) {
                const fallbackResponse = await fetch(`/api/users/0/skills`);
                if (fallbackResponse.ok) {
                  skillsData = await fallbackResponse.json();
                  console.log("Portfolio - Got fallback skills for userId=0:", skillsData);
                }
              }
            }
            
            // Fetch latest educations from userNumericId
            const educationsResponse = await fetch(`/api/users/${userNumericId}/educations`);
            if (educationsResponse.ok) {
              educationsData = await educationsResponse.json();
              console.log("Portfolio - Got latest educations for userNumericId:", educationsData);
              
              // If no educations, try with userId=0 (for existing data)
              if (educationsData.length === 0) {
                const fallbackResponse = await fetch(`/api/users/0/educations`);
                if (fallbackResponse.ok) {
                  educationsData = await fallbackResponse.json();
                  console.log("Portfolio - Got fallback educations for userId=0:", educationsData);
                }
              }
            }
            
            // Fetch latest projects - already linked to correct userNumericId
            const projectsResponse = await fetch(`/api/users/${userNumericId}/projects`);
            if (projectsResponse.ok) {
              projectsData = await projectsResponse.json();
              console.log("Portfolio - Got latest projects:", projectsData);
            }
            
            // Fetch latest services from userNumericId
            const servicesResponse = await fetch(`/api/users/${userNumericId}/services`);
            if (servicesResponse.ok) {
              servicesData = await servicesResponse.json();
              console.log("Portfolio - Got latest services for userNumericId:", servicesData);
              
              // If no services, try with userId=0 (for existing data)
              if (servicesData.length === 0) {
                const fallbackResponse = await fetch(`/api/users/0/services`);
                if (fallbackResponse.ok) {
                  servicesData = await fallbackResponse.json();
                  console.log("Portfolio - Got fallback services for userId=0:", servicesData);
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch latest user data:", error);
          }
        }

        // Prepare the portfolio data with user information
        const selectedLayout = form.getValues().layout;
        const publicUrl = form.getValues().publicUrl;
        
        // Get all user details for Musk AI to analyze
        const userDetails = {
          name: userData?.name || user?.name || '',
          title: userData?.title || '',
          industry: userData?.industry || '',
          domain: userData?.domain || '',
          location: userData?.location || '',
          jobLevel: userData?.jobLevel || '',
          lookingFor: userData?.lookingFor || '',
          email: userData?.email || user?.email || '',
          photoURL: userData?.photoURL || user?.photoURL || null,
        };
        
        console.log("Portfolio - User details for AI analysis:", userDetails);
        console.log("Portfolio - Layout selected:", selectedLayout);
      
        // Prepare portfolio data with user information
        const portfolioData = {
          layout: selectedLayout,
          publicUrl: publicUrl || null,
          isPublished: false,
          customTitle: userDetails.name,
          customBio: userDetails.title 
            ? `${userDetails.title}${userDetails.industry ? ` in ${userDetails.industry}` : ''}`
            : (userDetails.industry ? `Professional in ${userDetails.industry}` : ''),
          customizationOptions: {
            theme: selectedLayout === 'visual-expert' || selectedLayout === 'timeline-storyteller' ? 'colorful' : 'professional',
            showContact: true
          },
          featuredProjects: projectsData.map((project: Project) => project.id),
          featuredSkills: skillsData.map((skill: Skill) => skill.id),
          featuredExperiences: experiencesData.map((exp: WorkExperience) => exp.id),
          // Additional analyzed data fields
          skills: skillsData,
          experiences: experiencesData,
          projects: projectsData,
          educations: educationsData,
          services: servicesData,
          userData: userDetails,
        };
        
        console.log("Portfolio - AI generated data:", portfolioData);
        
        // Save the analyzed data for preview templates
        localStorage.setItem('portfolio-preview-data', JSON.stringify(portfolioData));
        
        // Set the updated form values to include our personalized data
        form.setValue('isPublished', false);
        
        // AI generation simulation complete
        setIsGenerating(false);
        setGenerationComplete(true);
        setCurrentStep(STEPS.PREVIEW);
      };
      
      // Execute the data fetching and processing
      fetchAllUserData();
    }, 2000);
  };

  // Handle final publish
  const handlePublish = () => {
    portfolioMutation.mutate(form.getValues());
  };

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render wizard steps
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.SELECT_LAYOUT:
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-2">Step 1: Choose a Portfolio Layout</h2>
              <p className="text-gray-600">
                Browse through multiple portfolio designs and select a layout that best represents your professional brand.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layoutOptions.map(layout => (
                <Card 
                  key={layout.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${form.watch("layout") === layout.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => form.setValue("layout", layout.id as any)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{layout.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm text-gray-600 whitespace-pre-line" 
                      style={{
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}
                    >
                      {layout.description}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    {form.watch("layout") === layout.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleCreatePortfolio}
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" /> Create with Musk AI
              </Button>
            </div>
          </div>
        );

      case STEPS.PREVIEW:
        // Get portfolio data from local storage
        const storedData = localStorage.getItem('portfolio-preview-data');
        const portfolioPreviewData = storedData ? JSON.parse(storedData) : null;
        
        // Extract user data and content from stored portfolio data
        const userInfo = portfolioPreviewData?.userData || {
          name: userData?.name || user?.name || '',
          title: userData?.title || '',
          industry: userData?.industry || '',
          domain: userData?.domain || '',
          location: userData?.location || '',
          email: userData?.email || user?.email || '',
          photoURL: userData?.photoURL || user?.photoURL || null,
          aboutMe: userData?.aboutMe || '',
          whatIOffer: userData?.whatIOffer || '',  // Added whatIOffer field
          lookingFor: userData?.lookingFor || null,
          jobLevel: userData?.jobLevel || null,
        };
        
        // Extract skills, sorted by proficiency
        const userSkills = portfolioPreviewData?.skills || skills || [];
        const sortedSkills = [...userSkills].sort((a, b) => b.proficiency - a.proficiency);
        
        // Extract experiences, sorted by date
        const userExperiences = portfolioPreviewData?.experiences || experiences || [];
        const sortedExperiences = [...userExperiences].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        
        // Extract projects, sorted by date
        const userProjects = portfolioPreviewData?.projects || projects || [];
        const sortedProjects = [...userProjects].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        
        // Extract educations, sorted by date
        const userEducations = portfolioPreviewData?.educations || educations || [];
        const sortedEducations = [...userEducations].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        console.log("Preview step - Educations data:", userEducations, "Length:", userEducations.length);
        
        // Extract services
        const userServices = portfolioPreviewData?.services || services || [];
        console.log("Preview step - Services data:", userServices, "Source:", portfolioPreviewData?.services ? "portfolioPreviewData" : services ? "services query" : "empty array");
        
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-2">Step 2: Preview Your Portfolio</h2>
              <p className="text-gray-600">
                Review your AI-generated portfolio before publishing it to the world.
              </p>
            </div>
            
            {/* Dynamic portfolio preview based on selected layout */}
            {/* The Minimalist Pro */}
            {form.watch("layout") === "minimalist-pro" && (
              <>
                {console.log("In MinimalistPro - Services data being passed:", userServices)}
                {console.log("In MinimalistPro - Services check:", {
                  servicesType: userServices ? typeof userServices : 'undefined',
                  isArray: Array.isArray(userServices),
                  length: userServices ? userServices.length : 0,
                  directData: JSON.stringify(userServices)
                })}
                <MinimalistPro 
                  userInfo={userInfo}
                  userSkills={userSkills}
                  userExperiences={userExperiences || []}
                  userProjects={userProjects}
                  userEducations={userEducations || []}
                  userServices={userServices || []}
                />
              </>
            )}
            
            {form.watch("layout") === "timeline-storyteller" && (
              <>
                {console.log("Timeline Storyteller - Education data being passed:", userEducations)}
                {console.log("Timeline Storyteller - Services data being passed:", userServices)}
                {console.log("Timeline Storyteller - whatIOffer data:", {
                  fromUserInfo: userInfo.whatIOffer,
                  fromUserData: userData?.whatIOffer,
                  combinedValue: userInfo.whatIOffer || userData?.whatIOffer || 'I offer professional services in my area of expertise.'
                })}
                {console.log("Timeline Storyteller - Full userInfo being passed:", {
                  name: userInfo.name,
                  title: userInfo.title,
                  industry: userInfo.industry,
                  domain: userInfo.domain,
                  location: userInfo.location,
                  email: userInfo.email,
                  photoURL: userInfo.photoURL,
                  lookingFor: userData?.lookingFor || '',
                  jobLevel: userData?.jobLevel || '',
                  aboutMe: userData?.aboutMe || '',
                  whatIOffer: userInfo.whatIOffer || userData?.whatIOffer || 'I offer professional services in my area of expertise.'
                })}
                
                {/* Test component to debug whatIOffer field */}
                {console.log("Raw whatIOffer values - userInfo:", userInfo.whatIOffer, "userData:", userData?.whatIOffer)}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <h3 className="text-lg font-semibold mb-2">Debug - What I Offer Field</h3>
                  <TestWhatIOffer userInfo={{ 
                    whatIOffer: userInfo.whatIOffer || userData?.whatIOffer || 'I offer professional services in my area of expertise.'
                  }} />
                </div>
                <TimelineStoryteller 
                  userInfo={{
                    name: userInfo.name,
                    title: userInfo.title,
                    industry: userInfo.industry,
                    domain: userInfo.domain,
                    location: userInfo.location,
                    email: userInfo.email,
                    photoURL: userInfo.photoURL,
                    lookingFor: userData?.lookingFor || '',
                    jobLevel: userData?.jobLevel || '',
                    aboutMe: userData?.aboutMe || '',
                    whatIOffer: userInfo.whatIOffer || userData?.whatIOffer || 'I offer professional services in my area of expertise.'
                  }}
                  userSkills={userSkills}
                  userExperiences={userExperiences || []}
                  userProjects={userProjects}
                  userEducations={userEducations || []}
                  userServices={userServices || []}
                />
              </>
            )}
            
            {form.watch("layout") === "visual-expert" && (
              <VisualExpert
                userInfo={{
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  location: userData?.location || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  lookingFor: userData?.lookingFor || null,
                  jobLevel: userData?.jobLevel || null
                }}
                userSkills={userSkills || []}
                userExperiences={userExperiences || []}
                userProjects={userProjects || []}
                userEducations={userEducations || []}
                userServices={userServices || []}
              />
            )}
            
            {form.watch("layout") === "corporate-executive" && (
              <CorporateExecutive
                userInfo={{
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  location: userData?.location || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  lookingFor: userData?.lookingFor || null,
                  jobLevel: userData?.jobLevel || null,
                  aboutMe: userData?.aboutMe || ''
                }}
                userSkills={userSkills || []}
                userExperiences={userExperiences || []}
                userProjects={userProjects || []}
                userEducations={userEducations || []}
                userServices={userServices || []}
              />
            )}
            
            {form.watch("layout") === "dynamic-innovator" && (
              <DynamicInnovator
                userInfo={{
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  location: userData?.location || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  lookingFor: userData?.lookingFor || null,
                  jobLevel: userData?.jobLevel || null
                }}
                userSkills={userSkills || []}
                userExperiences={userExperiences || []}
                userProjects={userProjects || []}
              />
            )}
            
            {form.watch("layout") === "freelancer-hub" && (
              <Card className="overflow-hidden bg-white border-gray-200 shadow-lg">
                <CardContent className="p-0">
                  <FreelancerHub 
                    userInfo={{
                      name: userData?.name || user?.name || '',
                      title: userData?.title || '',
                      industry: userData?.industry || '',
                      domain: userData?.domain || '',
                      location: userData?.location || '',
                      email: userData?.email || user?.email || '',
                      photoURL: userData?.photoURL || user?.photoURL || null,
                      lookingFor: userData?.lookingFor || '',
                      jobLevel: userData?.jobLevel || ''
                    }}
                    userSkills={userSkills || []}
                    userServices={userServices || []}
                    userExperiences={userExperiences || []}
                    userEducations={userEducations || []}
                    userProjects={userProjects?.map(p => ({
                      id: p.id,
                      title: p.title,
                      description: p.description,
                      userId: p.userId,
                      startDate: p.startDate,
                      createdAt: null,
                      projectUrl: null,
                      category: null,
                      thumbnailUrl: null,
                      thumbnailFile: null,
                      mediaUrls: [],
                      updatedAt: null
                    })) || []}
                  />
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "animated" && (
              <Card className="overflow-hidden bg-black border-gray-800 shadow-lg">
                <CardContent className="p-0">
                  <Animated 
                    name={userData?.name || user?.name || ''}
                    title={userData?.title || ''}
                    industry={userData?.industry || ''}
                    domain={userData?.domain || ''}
                    location={userData?.location || ''}
                    email={userData?.email || user?.email || ''}
                    photoURL={userData?.photoURL || user?.photoURL || null}
                    lookingFor={userData?.lookingFor || ''}
                    skills={userSkills || []}
                    services={userServices || []}
                    experiences={userExperiences || []}
                    educations={userEducations || []}
                    projects={userProjects?.map(p => ({
                      id: p.id,
                      title: p.title,
                      description: p.description,
                      userId: p.userId,
                      startDate: p.startDate,
                      createdAt: null,
                      projectUrl: p.projectUrl || null,
                      category: p.category || null,
                      thumbnailUrl: p.thumbnailUrl || null,
                      thumbnailFile: null,
                      mediaUrls: p.mediaUrls || [],
                      updatedAt: null
                    })) || []}
                  />
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "scholar" && (
              <Card className="overflow-hidden bg-white border-gray-200 shadow-lg">
                <CardContent className="p-0">
                  <Scholar 
                    userInfo={{
                      name: userData?.name || user?.name || '',
                      title: userData?.title || '',
                      industry: userData?.industry || '',
                      domain: userData?.domain || '',
                      location: userData?.location || '',
                      email: userData?.email || user?.email || '',
                      photoURL: userData?.photoURL || user?.photoURL || null,
                      lookingFor: userData?.lookingFor || '',
                      jobLevel: userData?.jobLevel || '',
                      aboutMe: userData?.aboutMe || ''
                    }}
                    userSkills={userSkills || []}
                    userServices={userServices || []}
                    userExperiences={userExperiences || []}
                    userEducations={userEducations || []}
                    userProjects={userProjects || []}
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(STEPS.SELECT_LAYOUT)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handlePublish}
                className="flex items-center gap-2"
                disabled={portfolioMutation.isPending}
              >
                {portfolioMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {portfolioMutation.isPending ? "Publishing..." : "Publish Portfolio"}
              </Button>
            </div>
          </div>
        );
      case STEPS.PUBLISH:
        return (
          <div className="space-y-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
              <h2 className="text-xl font-semibold text-green-700 mb-2">Success! Your Portfolio is Live</h2>
              <p className="text-gray-600">
                Your portfolio has been published and is now available to the public. Share your custom URL with others to showcase your professional profile.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Layout Style</h3>
                  <p>{layoutOptions.find(l => l.id === form.watch("layout"))?.name || "Professional"}</p>
                </div>
                {form.watch("publicUrl") && (
                  <div>
                    <h3 className="font-semibold">Portfolio URL</h3>
                    <p className="text-primary">brandentifier.com/{form.watch("publicUrl")}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(STEPS.SELECT_LAYOUT)}
                >
                  Edit Portfolio
                </Button>
                <Button onClick={() => setLocation('/profile')}>
                  Return to Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  // Render loading states
  const renderLoadingState = () => {
    if (isAnalyzingProfile) {
      return (
        <div className="container mx-auto p-4">
          <div className="flex flex-col space-y-6">
            <SectionSkeleton title="Analyzing Your Profile" />
            <div className="space-y-4">
              <ProfileSkeleton />
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <Bot className="h-5 w-5 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-medium">Musk AI is analyzing your profile</h3>
                <p className="text-gray-500">Gathering information from your experiences, skills, and projects...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (isGenerating) {
      return (
        <div className="container mx-auto p-4">
          <div className="flex flex-col space-y-6">
            <SectionSkeleton title="Creating Your Portfolio" />
            <div className="space-y-4">
              <ProfileSkeleton />
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <Bot className="h-5 w-5 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-medium">Creating your personalized portfolio</h3>
                <p className="text-gray-500">Musk AI is designing your portfolio with the {layoutOptions.find(l => l.id === form.watch("layout"))?.name.toLowerCase()} layout...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (isLoadingPortfolio) {
      return (
        <div className="container mx-auto p-4">
          <div className="flex flex-col space-y-6">
            <SectionSkeleton title="Portfolio Preview" />
            <ProfileSkeleton />
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Main render
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top (pt-16) to account for fixed header */}
        
        <div className="flex-1 overflow-auto">
            <div className="container px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Portfolio Builder</h1>
                  <p className="text-muted-foreground">Create a personalized portfolio with Musk AI</p>
                </div>
                {/* Progress indicator */}
              <div className="hidden sm:flex items-center space-x-2">
                {Object.values(STEPS).filter(step => typeof step === 'number').map((step) => (
                  <div 
                    key={step} 
                    className={`h-2 w-12 rounded-full ${
                      currentStep >= step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {isAnalyzingProfile || isGenerating || isLoadingPortfolio ? (
              renderLoadingState()
            ) : (
              renderStepContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}