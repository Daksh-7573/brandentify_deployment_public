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
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowLeft } from "lucide-react";

// Import our portfolio templates
import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub"; // Using the new improved template
import TimelineStoryteller2 from "@/components/portfolio/templates/timeline-storyteller-2";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";
import Animated from "@/components/portfolio/templates/animated";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey";
import Scholar from "@/components/portfolio/templates/scholar";
import DesignerShowcase from "@/components/portfolio/templates/designer-showcase";
import PhotographerPortfolio from "@/components/portfolio/templates/photographer-portfolio";
import PastelDreamscape from "@/components/portfolio/templates/pastel-dreamscape";
import NatureCreative from "@/components/portfolio/templates/nature-creative";
import FashionRunway from "@/components/portfolio/templates/fashion-runway";
import YogaFitnessModel from "@/components/portfolio/templates/yoga-fitness-model";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { FREE_PORTFOLIO_TEMPLATES } from "@/lib/feature-access";
// Removed Sidebar import, using top navigation only
import { apiRequest } from "@/lib/queryClient";
// Removed ProfileSkeleton, SectionSkeleton - using FeedSkeleton instead

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
  Loader2, Eye, ChevronRight, Check, Bot, 
  Mail, Linkedin, Instagram, Briefcase, Award, User,
  Code, Github, Terminal, Lock, Gift
} from "lucide-react";
import Header from "@/components/layout/header";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { FeedSkeleton } from "@/components/ui/skeleton-components";
import { useReferralStatus } from "@/hooks/use-referral";
import { ShareModal } from "@/components/referral/share-modal";

// Define the schema for portfolio form
const portfolioFormSchema = z.object({
  layout: z.enum([
    "professional", "creative", "minimal", "technical", "executive", "minimalist_pro",
    "minimalist-pro", "timeline-storyteller-2", "visual-expert", "corporate-executive", 
    "dynamic-innovator", "freelancer-hub", "animated", "animated-odyssey", "scholar",
    "designer-portfolio", "photographer-portfolio", "pastel-dreamscape", "nature-creative",
    "fashion-runway", "yoga-fitness-model"
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
  const { isPremium, canAccessPortfolioTemplate } = useFeatureAccess();
  const { toast } = useToast();
  
  // DEBUG: Log premium status
  console.log('[PortfolioBuilder] isPremium:', isPremium);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_LAYOUT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [portfolioPreviewData, setPortfolioPreviewData] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { data: referralStatus, isLoading: isLoadingReferral } = useReferralStatus();
  
  // Premium template access control using feature access system
  const checkTemplateAccess = (layout: string) => {
    const result = canAccessPortfolioTemplate(layout);
    if (!result.hasAccess) {
      toast({
        title: "Premium Template",
        description: result.message || "This template is only available for Premium members.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Filter templates - show only free templates for free users
  const getVisibleTemplates = () => {
    const allLayouts = layoutOptions;
    if (isPremium) {
      return allLayouts;
    }
    return allLayouts.filter(layout => FREE_PORTFOLIO_TEMPLATES.includes(layout.id));
  };

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
    whatIOffer: string | null;
    aboutMe: string | null;
    tagline: string | null;
    visionStatement: string | null;
    missionStatement: string | null;
    coreValues: string[] | null;
    uniqueValueProposition: string | null;
    brandName: string | null;
    primaryAudience: string[] | null;
    secondaryAudience: string[] | null;
  };
  
  // Fetch user profile data with proper typing
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${user?.id}`], // This uses user numeric ID to get the user data
    enabled: !!user,
    staleTime: 30000
  });
  
  // Fetch user profile numeric ID for use in other queries
  const userNumericId = userData?.id;
  
  // Debug userNumericId
  console.log("Portfolio Builder Debug - userData:", userData);
  console.log("Portfolio Builder Debug - userNumericId:", userNumericId);
  console.log("Portfolio Builder Debug - user?.id:", user?.id);
  
  // State for whatIOffer value - placed at component top level to avoid hook rule violations
  const [whatIOfferValue, setWhatIOfferValue] = useState(userData?.whatIOffer || '');
  
  // Effect to update whatIOffer value when userData changes
  useEffect(() => {
    if (userData?.whatIOffer) {
      console.log("Setting whatIOffer from userData:", userData.whatIOffer);
      setWhatIOfferValue(userData.whatIOffer);
    }
  }, [userData]);
  
  // Effect to fetch whatIOffer data - placed at component top level
  useEffect(() => {
    const fetchWhatIOffer = async () => {
      if (userNumericId && currentStep === STEPS.PREVIEW) {
        try {
          console.log("Actively fetching whatIOffer with dedicated endpoint for userId:", userNumericId);
          const response = await fetch(`/api/users/${userNumericId}/what-i-offer`);
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched whatIOffer with dedicated endpoint:", data);
            if (data.whatIOffer) {
              console.log("Setting whatIOffer from API response:", data.whatIOffer);
              setWhatIOfferValue(data.whatIOffer);
            }
          }
        } catch (error) {
          console.error("Error fetching whatIOffer:", error);
        }
      }
    };
    
    fetchWhatIOffer();
  }, [userNumericId, currentStep]);
  
  // Fetch existing portfolio if it exists
  const { data: portfolio, isLoading: isLoadingPortfolio, isError: isPortfolioError } = useQuery({
    queryKey: [`/api/users/${userNumericId}/portfolio`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
    // If portfolio not found, we'll create one in the portfolioMutation
  });
  
  // Define types for experiences, skills, and projects
  type WorkExperience = {
    id: number;
    userId: number;
    title: string;
    company: string;
    industry: string | null;
    domain: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    description: string | null;
    keyResponsibilities: unknown;
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
    startDate: string | null;
    industry: string | null;
    createdAt: Date | null;
    category: string | null;
    updatedAt: Date | null;
    projectUrl: string | null;
    thumbnailUrl: string | null;
    thumbnailFile: string | null;
    mediaUrls: unknown;
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

  // Check if a portfolio layout is locked
  const isLayoutLocked = (layoutId: string): boolean => {
    if (isPremium) return false; // Premium users have no locked templates
    if (!referralStatus) return false;
    const portfolio = referralStatus.portfolios.find((p) => p.id === layoutId);
    return portfolio?.locked ?? false;
  };

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
      id: "timeline-storyteller-2", 
      name: "The Timeline Storyteller", 
      description: `✔ Theme: Interactive Timeline with Comprehensive Profile Display
✔ Best For: Storytellers & Professionals with Rich Career Histories`,
      theme: "#6C63FF"
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
    },
    { 
      id: "designer-portfolio", 
      name: "The Designer Showcase", 
      description: `✔ Theme: Neo-Glass, Modern, Visually Rich
✔ Best For: Designers, Creative Professionals, Portfolio-First Careers`,
      theme: "#A855F7"
    },
    { 
      id: "photographer-portfolio", 
      name: "The Photographer Portfolio", 
      description: `✔ Theme: Creative, Animation-Rich, Photography-Focused with Camera Effects
✔ Best For: Photographers, Visual Artists, Videographers, Creative Image-Driven Professionals`,
      theme: "#FFB84D"
    },
    { 
      id: "pastel-dreamscape", 
      name: "Pastel Dreamscape", 
      description: `✔ Theme: Animated, Pastel Colors, Unique Graphics & Layouts
✔ Best For: Creative Professionals, Designers, Artists, Modern Portfolio Seekers`,
      theme: "#F4F5FF"
    },
    { 
      id: "nature-creative", 
      name: "Nature Creative", 
      description: `✔ Theme: Nature-Inspired, Parallax Effects, Full Animations & Creative Graphics
✔ Best For: Nature-Loving Freelancers, Creative Professionals, Outdoor Enthusiasts, Eco-Conscious Brands`,
      theme: "#10b981"
    },
    { 
      id: "fashion-runway", 
      name: "Fashion Runway", 
      description: `✔ Theme: High-Fashion, Editorial, Minimal & Elegant
✔ Best For: Fashion Models, Runway Models, Editorial Models, Brand Ambassadors`,
      theme: "#000000"
    },
    { 
      id: "yoga-fitness-model", 
      name: "Yoga/Fitness Model", 
      description: `✔ Theme: Clean, Soulful, Earth Tones, Mindful Aesthetics, Parallax Effects
✔ Best For: Yoga Instructors, Fitness Models, Wellness Coaches, Mindfulness Professionals`,
      theme: "#9DC183"
    }
  ];

  // Handle creating portfolio with AI
  const handleCreatePortfolio = async () => {
    console.log("Portfolio - Starting AI creation process");
    setIsAnalyzingProfile(true);

    // First analyze user profile
    setTimeout(() => {
      setIsAnalyzingProfile(false);
      setIsGenerating(true);
      console.log("Portfolio - Starting data generation");

      // Use the already-fetched data from existing queries
      const fetchAllUserData = async () => {
        try {
          let experiencesData = experiences || [];
          let skillsData = skills || [];
          let projectsData = projects || [];
          let educationsData = educations || [];
          let servicesData = services || [];
          
          if (userNumericId) {
            console.log("Portfolio - Fetching user data for userNumericId:", userNumericId);
            
            // Fetch experiences with timeout
            try {
              const expResponse = await Promise.race([
                fetch(`/api/users/${userNumericId}/experiences`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
              ]) as Response;
              if (expResponse.ok) {
                experiencesData = await expResponse.json();
                console.log("Portfolio - Got experiences:", experiencesData?.length || 0);
              }
            } catch (error) {
              console.log("Portfolio - Failed to fetch experiences:", error);
              experiencesData = [];
            }
            
            // Fetch skills with timeout
            try {
              const skillsResponse = await Promise.race([
                fetch(`/api/users/${userNumericId}/skills`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
              ]) as Response;
              if (skillsResponse.ok) {
                skillsData = await skillsResponse.json();
                console.log("Portfolio - Got skills:", skillsData?.length || 0);
              }
            } catch (error) {
              console.log("Portfolio - Failed to fetch skills:", error);
              skillsData = [];
            }
            
            // Fetch projects with timeout
            try {
              const projectsResponse = await Promise.race([
                fetch(`/api/users/${userNumericId}/projects`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
              ]) as Response;
              if (projectsResponse.ok) {
                projectsData = await projectsResponse.json();
                console.log("Portfolio - Got projects:", projectsData?.length || 0);
              }
            } catch (error) {
              console.log("Portfolio - Failed to fetch projects:", error);
              projectsData = [];
            }
            
            // Fetch educations with timeout
            try {
              const educationsResponse = await Promise.race([
                fetch(`/api/users/${userNumericId}/educations`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
              ]) as Response;
              if (educationsResponse.ok) {
                educationsData = await educationsResponse.json();
                console.log("Portfolio - Got educations:", educationsData?.length || 0);
              }
            } catch (error) {
              console.log("Portfolio - Failed to fetch educations:", error);
              educationsData = [];
            }
            
            // Fetch services with timeout
            try {
              const servicesResponse = await Promise.race([
                fetch(`/api/users/${userNumericId}/services`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
              ]) as Response;
              if (servicesResponse.ok) {
                servicesData = await servicesResponse.json();
                console.log("Portfolio - Got services:", servicesData?.length || 0);
              }
            } catch (error) {
              console.log("Portfolio - Failed to fetch services:", error);
              servicesData = [];
            }
          }

          // Prepare the portfolio data with user information
          const selectedLayout = form.getValues().layout;
          const publicUrl = form.getValues().publicUrl;
          
          // Get all user details for AI to analyze
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
              theme: selectedLayout === 'visual-expert' || selectedLayout === 'timeline-storyteller-2' ? 'colorful' : 'professional',
              showContact: true
            },
            featuredProjects: projectsData?.map((project: Project) => project.id) || [],
            featuredSkills: skillsData?.map((skill: Skill) => skill.id) || [],
            featuredExperiences: experiencesData?.map((exp: WorkExperience) => exp.id) || [],
            // Additional analyzed data fields
            skills: skillsData || [],
            experiences: experiencesData || [],
            projects: projectsData || [],
            educations: educationsData || [],
            services: servicesData || [],
            userData: userDetails,
          };
          
          console.log("Portfolio - AI generated data:", portfolioData);
          
          // Save the analyzed data for preview templates
          try {
            const dataToSave = JSON.stringify(portfolioData);
            localStorage.setItem('portfolio-preview-data', dataToSave);
            console.log("Portfolio - Saved preview data to localStorage");
          } catch (error) {
            console.error("Portfolio - Failed to save to localStorage:", error);
            // Fallback: store in session state instead
            console.log("Portfolio - Using session storage as fallback");
            try {
              sessionStorage.setItem('portfolio-preview-data', JSON.stringify(portfolioData));
            } catch (sessionError) {
              console.error("Portfolio - Session storage also failed:", sessionError);
              // Continue anyway - we'll pass data directly to components
            }
          }
          
          // Store data in component state as additional fallback
          setPortfolioPreviewData(portfolioData);
          
          // Set the updated form values to include our personalized data
          form.setValue('isPublished', false as boolean);
          
          // AI generation simulation complete
          console.log("Portfolio - AI generation complete, moving to preview");
          setIsGenerating(false);
          setGenerationComplete(true);
          setCurrentStep(STEPS.PREVIEW);
        } catch (error) {
          console.error("Portfolio - Error in fetchAllUserData:", error);
          // Even if there's an error, complete the process
          setIsGenerating(false);
          setGenerationComplete(true);
          setCurrentStep(STEPS.PREVIEW);
        }
      };
      
      // Execute the data fetching and processing
      fetchAllUserData();
    }, 2000);
  };

  // Handle final publish
  const handlePublish = () => {
    const portfolioData = form.getValues();
    portfolioData.isPublished = true;
    portfolioMutation.mutate(portfolioData);
  };

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 bg-blend-overlay bg-cover bg-center" 
           style={{ backgroundImage: "url('/attached_assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg')" }}>
        <Card className="w-96 bg-black/80 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Authentication Required</CardTitle>
            <CardDescription className="text-white/70">Please log in to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/auth")} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              Go to Login
            </Button>
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
            <NeoGlassSection title="Step 1: Choose a Portfolio Layout">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/70">
                  Browse through multiple portfolio designs and select a layout that best represents your professional brand.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 whitespace-nowrap"
                  data-testid="button-portfolio-share-to-unlock"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  Share to Unlock
                </Button>
              </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {getVisibleTemplates().map(layout => {
                  const locked = isLayoutLocked(layout.id);
                  return (
                    <div 
                      key={layout.id}
                      className={`neo-glass-card transition-all rounded-lg p-3 sm:p-4 ${
                        locked 
                          ? "opacity-60 cursor-not-allowed" 
                          : "cursor-pointer hover:shadow-xl hover:border-white/20 hover:-translate-y-1"
                      } ${
                        form.watch("layout") === layout.id 
                          ? "ring-1 ring-white/20 border border-white/15 bg-black/70" 
                          : "border border-white/10 bg-black/60"
                      }`}
                      onClick={() => {
                        if (locked) {
                          setShowShareModal(true);
                          toast({
                            title: "Portfolio Locked",
                            description: "Share Brandentifier with friends to unlock this portfolio!",
                            variant: "default",
                          });
                        } else if (!checkTemplateAccess(layout.id)) {
                          return;
                        } else {
                          form.setValue("layout", layout.id as any);
                        }
                      }}
                      data-testid={`portfolio-card-${layout.id}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="pb-2 flex items-center justify-between">
                          <h3 className="text-base sm:text-lg font-medium text-white">
                            {locked && <Lock className="h-4 w-4 mr-2 inline text-purple-400" />}
                            {!checkTemplateAccess(layout.id) && !locked && <Lock className="h-4 w-4 mr-2 inline text-yellow-500" />}
                            {layout.name}
                            {!checkTemplateAccess(layout.id) && !locked && <span className="text-xs ml-2 text-yellow-400">(Premium)</span>}
                          </h3>
                        </div>
                        <div className="flex-grow">
                          <div 
                            className="text-xs sm:text-sm text-white/70 whitespace-pre-line" 
                            style={{
                              maxHeight: '180px',
                              overflowY: 'auto'
                            }}
                          >
                            {layout.description}
                          </div>
                        </div>
                        <div className="pt-2 sm:pt-3 flex justify-end">
                          {form.watch("layout") === layout.id && !locked && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center shadow-md">
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center sm:justify-end mt-6">
                <button 
                  onClick={handleCreatePortfolio}
                  className="neo-glass-button flex items-center gap-2 py-2 px-4 text-sm sm:text-base whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  <Bot className="h-4 w-4" />
                  <span>Create with Musk AI</span>
                </button>
              </div>
            </NeoGlassSection>
          </div>
        );

      case STEPS.PREVIEW:
        // Get portfolio data from local storage
        const storedData = localStorage.getItem('portfolio-preview-data');
        const portfolioPreviewData = storedData ? JSON.parse(storedData) : null;
        
        // Extract user data and content from stored portfolio data
        console.log("Portfolio Builder - userData check:", {
          userData,
          whatIOffer: userData?.whatIOffer,
          whatIOfferType: typeof userData?.whatIOffer,
          whatIOfferExists: !!userData?.whatIOffer,
          whatIOfferFromState: whatIOfferValue
        });
        
        // Log the current whatIOffer value from state
        console.log("Portfolio Builder - whatIOfferValue from state:", whatIOfferValue);
        
        const userInfo = portfolioPreviewData?.userData || {
          name: userData?.name || user?.name || '',
          title: userData?.title || '',
          industry: userData?.industry || '',
          domain: userData?.domain || '',
          location: userData?.location || '',
          email: userData?.email || user?.email || '',
          photoURL: userData?.photoURL || user?.photoURL || null,
          aboutMe: userData?.aboutMe || '',
          whatIOffer: whatIOfferValue, // Use the value we've fetched
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
            <div className="bg-black/50 p-6 rounded-lg border border-white/10 backdrop-blur-md mb-8">
              <h2 className="text-xl font-semibold mb-2 text-white">Step 2: Preview Your Portfolio</h2>
              <p className="text-white/70">
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
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    title: userData?.title || null,
                    industry: userData?.industry || null,
                    domain: userData?.domain || null,
                    location: userData?.location || null,
                    email: userData?.email || user?.email || null,
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    lookingFor: userData?.lookingFor || null,
                    jobLevel: userData?.jobLevel || null,
                    aboutMe: userData?.aboutMe || '',
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                  currentUserId={userNumericId}
                />
              </>
            )}
            
            {/* Original Timeline Storyteller option has been removed */}
            
            {form.watch("layout") === "timeline-storyteller-2" && (
              <>
                {console.log("Timeline Storyteller Preview - Complete data check:", {
                  whatIOfferValue,
                  userDataWhatIOffer: userData?.whatIOffer,
                  finalWhatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                  aboutMe: userData?.aboutMe,
                  skillsCount: skills?.length || 0,
                  experiencesCount: experiences?.length || 0,
                  projectsCount: projects?.length || 0,
                  educationsCount: educations?.length || 0,
                  servicesCount: services?.length || 0,
                  skillsData: skills,
                  experiencesData: experiences,
                  projectsData: projects,
                  educationsData: educations,
                  servicesData: services
                })}
                <TimelineStoryteller2 
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    title: userData?.title || '',
                    industry: userData?.industry || '',
                    domain: userData?.domain || '',
                    location: userData?.location || '',
                    email: userData?.email || user?.email || '',
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    lookingFor: userData?.lookingFor || '',
                    aboutMe: userData?.aboutMe || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </>
            )}
            
            {form.watch("layout") === "visual-expert" && (
              <>
                {console.log("Visual Expert Preview - Complete data check:", {
                  whatIOfferValue,
                  userDataWhatIOffer: userData?.whatIOffer,
                  finalWhatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                  aboutMe: userData?.aboutMe,
                  skillsCount: skills?.length || 0,
                  experiencesCount: experiences?.length || 0,
                  projectsCount: projects?.length || 0,
                  educationsCount: educations?.length || 0,
                  servicesCount: services?.length || 0,
                  skillsData: skills,
                  experiencesData: experiences,
                  projectsData: projects,
                  educationsData: educations,
                  servicesData: services
                })}
                <VisualExpert
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    email: userData?.email || user?.email || null,
                    title: userData?.title || null,
                    aboutMe: userData?.aboutMe || null,
                    location: userData?.location || null,
                    industry: userData?.industry || null,
                    domain: userData?.domain || null,
                    lookingFor: userData?.lookingFor || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    jobLevel: userData?.jobLevel || null
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </>
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
                userSkills={skills || []}
                userExperiences={experiences || []}
                userProjects={projects?.map(project => ({
                  ...project,
                  mediaUrls: Array.isArray(project.mediaUrls) ? project.mediaUrls : []
                })) || []}
                userEducations={educations || []}
                userServices={services || []}
              />
            )}
            
            {form.watch("layout") === "dynamic-innovator" && (
              <>
                {console.log("Dynamic Innovator Preview - Complete data check:", {
                  whatIOfferValue,
                  userDataWhatIOffer: userData?.whatIOffer,
                  finalWhatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                  skillsCount: skills?.length || 0,
                  experiencesCount: experiences?.length || 0,
                  projectsCount: projects?.length || 0,
                  educationsCount: educations?.length || 0,
                  servicesCount: services?.length || 0,
                  skillsData: skills,
                  experiencesData: experiences,
                  projectsData: projects,
                  educationsData: educations,
                  servicesData: services
                })}
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
                    jobLevel: userData?.jobLevel || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </>
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
                      jobLevel: userData?.jobLevel || '',
                      whatIOffer: whatIOfferValue || userData?.whatIOffer || null
                    }}
                    userSkills={skills || []}
                    userServices={services || []}
                    userExperiences={experiences || []}
                    userEducations={educations || []}
                    userProjects={projects?.map((p: any) => ({
                      id: p.id,
                      title: p.title,
                      description: p.description,
                      userId: p.userId,
                      startDate: p.startDate,
                      industry: p.industry || null,
                      createdAt: p.createdAt || new Date().toISOString(),
                      projectUrl: p.projectUrl || null,
                      category: p.category || null,
                      thumbnailUrl: p.thumbnailUrl || null,
                      thumbnailFile: p.thumbnailFile || null,
                      mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : [],
                      updatedAt: p.updatedAt || new Date().toISOString()
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
                    aboutMe={userData?.aboutMe || ''}
                    whatIOffer={whatIOfferValue || userData?.whatIOffer || ''}
                    skills={skills || []}
                    services={services || []}
                    experiences={experiences || []}
                    educations={educations || []}
                    projects={projects?.map((p: any) => ({
                      id: p.id,
                      title: p.title,
                      description: p.description,
                      userId: p.userId,
                      startDate: p.startDate,
                      industry: p.industry || null,
                      createdAt: p.createdAt || new Date().toISOString(),
                      projectUrl: p.projectUrl || null,
                      category: p.category || null,
                      thumbnailUrl: p.thumbnailUrl || null,
                      thumbnailFile: p.thumbnailFile || null,
                      mediaUrls: p.mediaUrls || [],
                      updatedAt: p.updatedAt || new Date().toISOString()
                    })) || []}
                  />
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "scholar" && (
              <>
                {console.log("Scholar - portfolioPreviewData:", portfolioPreviewData)}
                {console.log("Scholar - userSkills:", portfolioPreviewData?.skills || userSkills)}
                {console.log("Scholar - userServices:", portfolioPreviewData?.services || userServices)}
                {console.log("Scholar - userExperiences:", portfolioPreviewData?.experiences || userExperiences)}
                {console.log("Scholar - userEducations:", portfolioPreviewData?.educations || userEducations)}
                {console.log("Scholar - userProjects:", portfolioPreviewData?.projects || userProjects)}
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
                      userSkills={skills || []}
                      userServices={services?.map(service => ({
                        ...service,
                        isHourly: service.isHourly === null ? undefined : service.isHourly,
                        isActive: service.isActive === null ? undefined : service.isActive
                      })) || []}
                      userExperiences={experiences?.map(exp => ({
                        ...exp,
                        location: exp.location || '',
                        description: exp.description || '',
                        industry: exp.industry || '',
                        domain: exp.domain || '',
                        keyResponsibilities: Array.isArray(exp.keyResponsibilities) ? exp.keyResponsibilities : []
                      })) || []}
                      userEducations={educations?.map(edu => ({
                        ...edu,
                        skillsAcquired: Array.isArray(edu.skillsAcquired) ? edu.skillsAcquired : []
                      })) || []}
                      userProjects={projects?.map(project => ({
                        ...project,
                        startDate: project.startDate || '',
                        mediaUrls: Array.isArray(project.mediaUrls) ? project.mediaUrls : []
                      })) || []}
                    />
                  </CardContent>
                </Card>
              </>
            )}
            
            {form.watch("layout") === "animated-odyssey" && (
              <Card className="overflow-hidden bg-black border-gray-800 shadow-lg">
                <CardContent className="p-0">
                  <AnimatedOdyssey 
                    name={userData?.name || user?.name || ''}
                    title={userData?.title || ''}
                    industry={userData?.industry || ''}
                    domain={userData?.domain || ''}
                    location={userData?.location || ''}
                    email={userData?.email || user?.email || ''}
                    photoURL={userData?.photoURL || user?.photoURL || null}
                    lookingFor={userData?.lookingFor || ''}
                    aboutMe={userData?.aboutMe || ''}
                    whatIOffer={whatIOfferValue || userData?.whatIOffer || ''}
                    skills={skills?.map(skill => ({
                      id: skill.id,
                      name: skill.name,
                      level: (skill.level as "beginner" | "intermediate" | "advanced") || "beginner",
                      proficiency: skill.proficiency || 0
                    })) || []}
                    services={services?.map(service => ({
                      id: service.id,
                      title: service.title,
                      description: service.description,
                      price: (service as any).price || null,
                      isHourly: service.isHourly || false,
                      category: service.category || 'other',
                      features: Array.isArray(service.features) ? service.features : []
                    })) || []}
                    experiences={experiences?.map(exp => ({
                      id: exp.id,
                      title: exp.title,
                      company: exp.company,
                      location: exp.location || null,
                      industry: exp.industry || null,
                      domain: exp.domain || null,
                      startDate: exp.startDate,
                      endDate: exp.endDate || null,
                      description: exp.description || null,
                      keyResponsibilities: Array.isArray(exp.keyResponsibilities) ? exp.keyResponsibilities : []
                    })) || []}
                    educations={educations?.map(edu => ({
                      id: edu.id,
                      degree: edu.degree,
                      institution: edu.institution,
                      location: edu.location || null,
                      startDate: edu.startDate,
                      endDate: edu.endDate || null,
                      fieldOfStudy: edu.fieldOfStudy || null,
                      industry: edu.industry || null,
                      domain: edu.domain || null,
                      skillsAcquired: Array.isArray(edu.skillsAcquired) ? edu.skillsAcquired : []
                    })) || []}
                    projects={projects?.map(p => ({
                      id: p.id,
                      title: p.title,
                      description: p.description,
                      startDate: p.startDate || '',
                      projectUrl: p.projectUrl || null,
                      category: p.category || null,
                      industry: p.industry || null,
                      thumbnailUrl: p.thumbnailUrl || null,
                      mediaUrls: Array.isArray(p.mediaUrls) ? p.mediaUrls : []
                    })) || []}
                  />
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "designer-portfolio" && (
              <DesignerShowcase
                userInfo={{
                  id: userData?.id,
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  aboutMe: userData?.aboutMe || null,
                  location: userData?.location || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  lookingFor: userData?.lookingFor || null,
                  whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                  jobLevel: userData?.jobLevel || null,
                  tagline: userData?.tagline || null,
                  visionStatement: userData?.visionStatement || null,
                  missionStatement: userData?.missionStatement || null,
                  coreValues: userData?.coreValues || [],
                  uniqueValueProposition: userData?.uniqueValueProposition || null
                }}
                userSkills={skills || []}
                userExperiences={experiences || []}
                userProjects={projects || []}
                userEducations={educations || []}
                userServices={services || []}
              />
            )}
            
            {form.watch("layout") === "photographer-portfolio" && (
              <PhotographerPortfolio
                userInfo={{
                  id: userData?.id,
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  aboutMe: userData?.aboutMe || null,
                  location: userData?.location || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  lookingFor: userData?.lookingFor || null,
                  tagline: userData?.tagline || null,
                  visionStatement: userData?.visionStatement || null,
                  missionStatement: userData?.missionStatement || null,
                  coreValues: userData?.coreValues || [],
                  uniqueValueProposition: userData?.uniqueValueProposition || null
                }}
                userSkills={skills || []}
                userExperiences={experiences || []}
                userProjects={projects || []}
                userEducations={educations || []}
                userServices={services || []}
              />
            )}
            
            {form.watch("layout") === "pastel-dreamscape" && (
              <PastelDreamscape
                userInfo={{
                  id: userData?.id,
                  name: userData?.name || user?.name || '',
                  title: userData?.title || null,
                  email: userData?.email || user?.email || null,
                  photoURL: userData?.photoURL || user?.photoURL || null,
                  aboutMe: userData?.aboutMe || null,
                  location: userData?.location || null,
                  industry: userData?.industry || null,
                  domain: userData?.domain || null,
                  lookingFor: userData?.lookingFor || null,
                  whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                  jobLevel: userData?.jobLevel || null,
                  tagline: userData?.tagline || null,
                  visionStatement: userData?.visionStatement || null,
                  missionStatement: userData?.missionStatement || null,
                  coreValues: userData?.coreValues || [],
                  uniqueValueProposition: userData?.uniqueValueProposition || null,
                  brandName: userData?.brandName || null,
                  primaryAudience: userData?.primaryAudience || [],
                  secondaryAudience: userData?.secondaryAudience || []
                }}
                userSkills={skills || []}
                userExperiences={experiences || []}
                userProjects={projects || []}
                userEducations={educations || []}
                userServices={services || []}
              />
            )}

            {form.watch("layout") === "nature-creative" && (
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg relative">
                <NatureCreative
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    title: userData?.title || null,
                    email: userData?.email || user?.email || null,
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    aboutMe: userData?.aboutMe || null,
                    location: userData?.location || null,
                    industry: userData?.industry || null,
                    domain: userData?.domain || null,
                    lookingFor: userData?.lookingFor || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                    jobLevel: userData?.jobLevel || null,
                    tagline: userData?.tagline || null,
                    visionStatement: userData?.visionStatement || null,
                    missionStatement: userData?.missionStatement || null,
                    coreValues: userData?.coreValues || [],
                    uniqueValueProposition: userData?.uniqueValueProposition || null,
                    brandName: userData?.brandName || null,
                    primaryAudience: userData?.primaryAudience || [],
                    secondaryAudience: userData?.secondaryAudience || []
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </div>
            )}

            {form.watch("layout") === "fashion-runway" && (
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg relative">
                <FashionRunway
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    title: userData?.title || null,
                    email: userData?.email || user?.email || null,
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    aboutMe: userData?.aboutMe || null,
                    location: userData?.location || null,
                    industry: userData?.industry || null,
                    domain: userData?.domain || null,
                    lookingFor: userData?.lookingFor || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                    jobLevel: userData?.jobLevel || null,
                    tagline: userData?.tagline || null,
                    visionStatement: userData?.visionStatement || null,
                    missionStatement: userData?.missionStatement || null,
                    coreValues: userData?.coreValues || [],
                    uniqueValueProposition: userData?.uniqueValueProposition || null,
                    brandName: userData?.brandName || null,
                    primaryAudience: userData?.primaryAudience || [],
                    secondaryAudience: userData?.secondaryAudience || []
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </div>
            )}

            {form.watch("layout") === "yoga-fitness-model" && (
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg relative">
                <YogaFitnessModel
                  userInfo={{
                    id: userData?.id,
                    name: userData?.name || user?.name || '',
                    title: userData?.title || null,
                    email: userData?.email || user?.email || null,
                    photoURL: userData?.photoURL || user?.photoURL || null,
                    aboutMe: userData?.aboutMe || null,
                    location: userData?.location || null,
                    industry: userData?.industry || null,
                    domain: userData?.domain || null,
                    lookingFor: userData?.lookingFor || null,
                    whatIOffer: whatIOfferValue || userData?.whatIOffer || null,
                    jobLevel: userData?.jobLevel || null,
                    tagline: userData?.tagline || null,
                    visionStatement: userData?.visionStatement || null,
                    missionStatement: userData?.missionStatement || null,
                    coreValues: userData?.coreValues || [],
                    uniqueValueProposition: userData?.uniqueValueProposition || null,
                    brandName: userData?.brandName || null,
                    primaryAudience: userData?.primaryAudience || [],
                    secondaryAudience: userData?.secondaryAudience || []
                  }}
                  userSkills={skills || []}
                  userExperiences={experiences || []}
                  userProjects={projects || []}
                  userEducations={educations || []}
                  userServices={services || []}
                />
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(STEPS.SELECT_LAYOUT)}
                className="flex items-center gap-2 bg-black/70 text-white border-white/20 hover:bg-black/80 hover:border-white/30"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={handlePublish}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white border-0"
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
            <div className="bg-black/70 backdrop-blur-lg p-6 rounded-lg border border-green-500/30 mb-8">
              <h2 className="text-xl font-semibold text-green-400 mb-2">Success! Your Portfolio is Live</h2>
              <p className="text-white/70">
                Your portfolio has been published and is now available to the public. Share your custom URL with others to showcase your professional profile.
              </p>
            </div>
            
            <Card className="bg-black/70 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white">Layout Style</h3>
                  <p className="text-white/70">{layoutOptions.find(l => l.id === form.watch("layout"))?.name || "Professional"}</p>
                </div>
                {form.watch("publicUrl") && (
                  <div>
                    <h3 className="font-semibold text-white">Portfolio URL</h3>
                    <p className="text-primary">brandentifier.com/{form.watch("publicUrl")}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-white/5">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(STEPS.SELECT_LAYOUT)}
                  className="bg-black/70 text-white border-white/20 hover:bg-black/80 hover:border-white/30"
                >
                  Edit Portfolio
                </Button>
                <Button 
                  onClick={() => setLocation('/profile')}
                  className="bg-primary hover:bg-primary/90 text-white border-0"
                >
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
      return <FeedSkeleton count={2} />;
    }
    
    if (isGenerating) {
      return <FeedSkeleton count={2} />;
    }
    
    if (isLoadingPortfolio) {
      return <FeedSkeleton count={2} />;
    }
    
    return null;
  };

  // Main render
  return (
    <div 
      className="flex min-h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm z-0"></div>
      <Header />
      <div className="flex-1 overflow-y-auto">
        <NeoGlassLayout className="mx-3 sm:mx-4 md:mx-6 mt-3 mb-6 relative z-10">
          <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 gap-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep === STEPS.SELECT_LAYOUT) {
                  // If on first step, go back to profile
                  setLocation('/profile');
                } else {
                  // Otherwise go back one step
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="text-white hover:text-white hover:bg-white/20 bg-white/10 px-3 py-2 border border-white/20 flex items-center gap-2 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Portfolio Builder</h1>
              <p className="text-white/70 text-sm sm:text-base">Create a personalized portfolio with Musk AI</p>
            </div>
            {/* Progress indicator */}
            <div className="flex sm:hidden items-center space-x-1 w-full">
              {Object.values(STEPS).filter(step => typeof step === 'number').map((step) => (
                <div 
                  key={step} 
                  className={`h-2 flex-1 rounded-full ${
                    currentStep === step 
                      ? 'bg-primary' 
                      : currentStep > step 
                        ? 'bg-primary/70' 
                        : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              {Object.values(STEPS).filter(step => typeof step === 'number').map((step) => (
                <div 
                  key={step} 
                  className={`h-2 w-12 rounded-full ${
                    currentStep === step 
                      ? 'bg-primary' 
                      : currentStep > step 
                        ? 'bg-primary/70' 
                        : 'bg-slate-600'
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
        </NeoGlassLayout>
      </div>
      
      {/* Share Modal for Referral System */}
      <ShareModal open={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
}