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
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";

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
  layout: z.enum(["minimalist-pro", "timeline-storyteller", "visual-expert", "corporate-executive", "dynamic-innovator", "freelancer-hub"]),
  isPublished: z.boolean().default(false),
  publicUrl: z.string().nullable().optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

// Wizard steps
const STEPS = {
  SELECT_LAYOUT: 0,
  CUSTOMIZE: 1,
  PREVIEW: 2,
  PUBLISH: 3
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
    // Add other fields as needed
  };
  
  // Fetch user profile data with proper typing
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${user?.uid}`], // This uses Firebase UID to get the numeric DB ID
    enabled: !!user,
    staleTime: 30000
  });
  
  // Fetch user profile numeric ID for use in other queries
  const userNumericId = userData?.id;
  
  // Fetch existing portfolio if it exists
  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: [`/api/users/${userNumericId}/portfolio`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000 // 30 seconds
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

  // Fetch user experiences - use the numerical ID instead of Firebase UID
  const { data: experiences, isLoading: isLoadingExperiences } = useQuery<WorkExperience[]>({
    queryKey: [`/api/users/${userNumericId}/experiences`],
    enabled: !!user && !!userNumericId, // Only fetch when we have the numeric ID
    staleTime: 30000
  });
  
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
      layout: "minimalist-pro",
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
      id: "minimalist-pro", 
      name: "The Minimalist Pro", 
      description: `✔ Theme: Clean, Elegant, & Modern
✔ Best For: Tech Professionals, Consultants, Business Executives
🎨 Color Palette: Light Gray (#F5F7FA), Deep Blue (#0044CC), Soft Gray (#EAEAEA), Dark Gray (#333333)
🖌 UI Elements: Flat card-based layout with ample white space, subtle hover effects, rounded edges
🎬 Animations: Smooth fade-ins, subtle micro-animations for skill bars & timeline`,
      theme: "#0044CC"
    },
    { 
      id: "timeline-storyteller", 
      name: "The Timeline Storyteller", 
      description: "Interactive storytelling layout ideal for PMs, entrepreneurs & creatives",
      theme: "#FF6B6B"
    },
    { 
      id: "visual-expert", 
      name: "The Visual Expert", 
      description: "Image-first bold design for designers, photographers & marketers",
      theme: "#F8C471"
    },
    { 
      id: "corporate-executive", 
      name: "The Corporate Executive", 
      description: "Premium, polished layout for senior executives & industry experts",
      theme: "#DAA520"
    },
    { 
      id: "dynamic-innovator", 
      name: "The Dynamic Innovator", 
      description: "Futuristic high-tech design for AI experts, engineers & startups",
      theme: "#0FF0FC"
    },
    { 
      id: "freelancer-hub", 
      name: "The Freelancer Hub", 
      description: "Vibrant, playful design for freelancers, influencers & coaches",
      theme: "#FF7F50"
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
            
            // Fetch latest projects - already linked to correct userNumericId
            const projectsResponse = await fetch(`/api/users/${userNumericId}/projects`);
            if (projectsResponse.ok) {
              projectsData = await projectsResponse.json();
              console.log("Portfolio - Got latest projects:", projectsData);
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
                onClick={() => setCurrentStep(STEPS.CUSTOMIZE)}
                className="flex items-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case STEPS.CUSTOMIZE:
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-2">Step 2: Customize Your Portfolio</h2>
              <p className="text-gray-600">
                Customize your portfolio settings before creating it. Musk AI will analyze your profile and generate a personalized portfolio.
              </p>
            </div>
            
            <Form {...form}>
              <form className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Settings</CardTitle>
                    <CardDescription>Configure how your portfolio will be displayed and accessed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="publicUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your-custom-url"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Create a custom URL for your portfolio (e.g., brandentifier.com/your-name)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(STEPS.SELECT_LAYOUT)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleCreatePortfolio}
                    className="flex items-center gap-2"
                  >
                    <Bot className="h-4 w-4" /> Create with Musk AI
                  </Button>
                </div>
              </form>
            </Form>
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
        
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-2">Step 3: Preview Your Portfolio</h2>
              <p className="text-gray-600">
                Review your AI-generated portfolio before publishing it to the world.
              </p>
            </div>
            
            {/* Dynamic portfolio preview based on selected layout */}
            {/* The Minimalist Pro */}
            {form.watch("layout") === "minimalist-pro" && (
              <MinimalistPro 
                userInfo={userInfo}
                userSkills={userSkills}
                userExperiences={userExperiences || []}
                userProjects={userProjects}
              />
            )}
            
            {form.watch("layout") === "timeline-storyteller" && (
              <Card className="overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        {userInfo.name}
                      </h2>
                      <p className="text-base font-medium text-gray-800 mb-4">
                        {userInfo.title || userInfo.domain || 'Creative Professional'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sortedSkills.slice(0, 4).map((skill) => (
                          <Badge 
                            key={skill.id} 
                            className={`
                              ${skill.level === 'Expert' ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' : 
                                skill.level === 'Advanced' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                                skill.level === 'Intermediate' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' :
                                'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                            `}
                          >
                            {skill.name}
                          </Badge>
                        ))}
                        
                        {sortedSkills.length === 0 && (
                          <>
                            <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                              {userInfo.domain || 'Design'}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                              {userInfo.industry || 'Creative'}
                            </Badge>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <Linkedin className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <Code className="h-4 w-4" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Instagram className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center p-6 relative">
                      <div className="relative overflow-hidden rounded-full h-64 w-64 bg-gradient-to-br from-pink-400 to-purple-600 p-1">
                        <ProfileImage
                          src={userInfo.photoURL}
                          alt={userInfo.name || "User profile"}
                          className="h-full w-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute w-32 h-32 rounded-full border-4 border-white bg-pink-100 -bottom-10 -left-4 -z-10"></div>
                      <div className="absolute w-24 h-24 rounded-full border-4 border-white bg-purple-100 -top-8 -right-4 -z-10"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "visual-expert" && (
              <Card className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 mb-4 flex items-center justify-center">
                      <ProfileImage
                        src={user?.photoURL}
                        alt={user?.name || "User profile"}
                      />
                    </div>
                    <h2 className="text-2xl font-light text-gray-900 mb-1">{userData?.name || user?.name || 'Minimalist Professional'}</h2>
                    <p className="text-sm text-gray-500">{userData?.title || 'Professional'}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">About</h3>
                        <p className="text-sm text-gray-600">A professional with a minimalist approach to design and problem-solving. Focused on delivering clean, efficient solutions.</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">Expertise</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>Simplified UX Design</li>
                          <li>Clean Architecture</li>
                          <li>User-Centered Approach</li>
                          <li>Accessible Design</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>{userData?.email || user?.email || 'email@example.com'}</li>
                          <li>{form.watch("publicUrl") ? `brandentifier.com/${form.watch("publicUrl")}` : 'Your portfolio URL'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "corporate-executive" && (
              <Card className="overflow-hidden text-gray-100 bg-gray-900 border-none">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <div className="bg-gray-800 p-4 rounded-md">
                        <div className="flex items-center mb-4">
                          <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-700 mr-4 flex items-center justify-center">
                            <ProfileImage
                              src={user?.photoURL}
                              alt={user?.name || "User profile"}
                            />
                          </div>
                          <div>
                            <p className="text-green-400 font-mono text-xs mb-1">class Developer &#123;</p>
                            <h2 className="text-xl font-semibold text-green-300 font-mono">{userData?.name || user?.name || 'TechDev'}</h2>
                            <p className="text-green-400 font-mono text-xs">&#125;</p>
                          </div>
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                          <p className="text-gray-400 font-mono text-sm mb-2">// Main.skills</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">JavaScript</div>
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">TypeScript</div>
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">React</div>
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">Node.js</div>
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">Python</div>
                            <div className="bg-gray-700 px-2 py-1 rounded text-xs font-mono text-green-300">Docker</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <div className="bg-gray-800 p-4 rounded-md mb-4 font-mono">
                        <p className="text-gray-400 text-sm mb-2">// About.me</p>
                        <p className="text-gray-200 text-sm">
                          <span className="text-blue-400">function</span> <span className="text-yellow-400">getProfile</span>() &#123;<br />
                          &nbsp;&nbsp;<span className="text-blue-400">return</span> &#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;title: <span className="text-green-300">"{userData?.title || 'Software Engineer'}"</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;focus: <span className="text-green-300">"Full-stack development"</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;yearsOfExperience: <span className="text-purple-400">5</span><br />
                          &nbsp;&nbsp;&#125;;<br />
                          &#125;
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-md font-mono">
                        <p className="text-gray-400 text-sm mb-2">// Projects.latest</p>
                        <div className="space-y-3">
                          <div className="border-l-2 border-green-500 pl-3">
                            <p className="text-yellow-400 text-sm">Project: <span className="text-gray-200">AI-Powered Analytics Platform</span></p>
                            <p className="text-gray-400 text-xs">// Tech: React, Node.js, TensorFlow</p>
                          </div>
                          <div className="border-l-2 border-blue-500 pl-3">
                            <p className="text-yellow-400 text-sm">Project: <span className="text-gray-200">Microservice Architecture</span></p>
                            <p className="text-gray-400 text-xs">// Tech: Docker, Kubernetes, Go</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {form.watch("layout") === "dynamic-innovator" && (
              <Card className="overflow-hidden bg-stone-50 border-stone-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 bg-stone-900 text-stone-100 p-8">
                      <div className="flex flex-col items-center md:items-start">
                        <div className="h-32 w-32 overflow-hidden rounded-full bg-stone-800 mb-6 flex items-center justify-center border-4 border-stone-700">
                          <ProfileImage
                            src={user?.photoURL}
                            alt={user?.name || "User profile"}
                          />
                        </div>
                        <h2 className="text-2xl font-bold text-stone-100 mb-1">{userData?.name || user?.name || 'Executive Leader'}</h2>
                        <p className="text-sm text-stone-400 mb-6">{userData?.title || 'Chief Executive Officer'}</p>
                        <div className="w-16 h-1 bg-amber-500 mb-6 hidden md:block"></div>
                        <div className="space-y-4 text-center md:text-left">
                          <div>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">Email</p>
                            <p className="text-sm">{userData?.email || user?.email || 'email@example.com'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">Location</p>
                            <p className="text-sm">New York, NY</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">Connect</p>
                            <div className="flex gap-3 mt-2 justify-center md:justify-start">
                              <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center">
                                <Linkedin className="h-4 w-4" />
                              </div>
                              <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center">
                                <Mail className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-3/5 p-8">
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center mr-2">
                            <User className="h-3 w-3" />
                          </span>
                          Executive Summary
                        </h3>
                        <p className="text-stone-600">
                          Seasoned executive with a track record of strategic leadership and business transformation. 
                          Expertise in organizational development, stakeholder management, and driving sustainable growth.
                        </p>
                      </div>
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center mr-2">
                            <Award className="h-3 w-3" />
                          </span>
                          Key Achievements
                        </h3>
                        <ul className="space-y-2 text-stone-600">
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Led company through 200% growth over 3 years
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Successfully navigated digital transformation
                          </li>
                          <li className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            Expanded operations into 5 new international markets
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center mr-2">
                            <Briefcase className="h-3 w-3" />
                          </span>
                          Areas of Expertise
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-stone-600 text-sm">Strategic Planning</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-stone-600 text-sm">Corporate Finance</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-stone-600 text-sm">Team Leadership</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-stone-600 text-sm">Business Development</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    userSkills={skills || []}
                    userProjects={projects?.map(p => ({
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
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(STEPS.CUSTOMIZE)}
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
        <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Bot className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Musk AI is analyzing your profile</h3>
            <p className="text-gray-500">Gathering information from your experiences, skills, and projects...</p>
          </div>
        </div>
      );
    }
    
    if (isGenerating) {
      return (
        <div className="h-[500px] flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <Bot className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium">Creating your personalized portfolio</h3>
            <p className="text-gray-500">Musk AI is designing your portfolio with the {layoutOptions.find(l => l.id === form.watch("layout"))?.name.toLowerCase()} layout...</p>
          </div>
        </div>
      );
    }
    
    if (isLoadingPortfolio) {
      return (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    return null;
  };

  // Main render
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="profile" />
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