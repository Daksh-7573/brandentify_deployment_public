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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Eye, ChevronRight, Check, ArrowLeft, Bot } from "lucide-react";
import Header from "@/components/layout/header";

// Define the schema for portfolio form
const portfolioFormSchema = z.object({
  layout: z.enum(["professional", "creative", "minimal", "technical", "executive"]),
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

  // Fetch existing portfolio if it exists
  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: [`/api/users/${user?.uid}/portfolio`],
    enabled: !!user,
    staleTime: 30000 // 30 seconds
  });

  // Form setup
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      layout: "professional",
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
        // Create new portfolio
        const res = await apiRequest("POST", "/api/portfolios", {
          ...data,
          userId: user?.uid
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
      
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.uid}/portfolio`] });
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
    { id: "professional", name: "Professional", description: "Clean, traditional layout ideal for corporate environments" },
    { id: "creative", name: "Creative", description: "Visual-heavy design perfect for designers and artists" },
    { id: "minimal", name: "Minimal", description: "Simple, elegant design that focuses on content" },
    { id: "technical", name: "Technical", description: "Code-focused design for developers and engineers" },
    { id: "executive", name: "Executive", description: "Sophisticated layout for senior professionals and executives" }
  ];

  // Handle creating portfolio with AI
  const handleCreatePortfolio = () => {
    setIsAnalyzingProfile(true);

    // Simulate AI analyzing the profile
    setTimeout(() => {
      setIsAnalyzingProfile(false);
      setIsGenerating(true);

      // Simulate AI generating the portfolio
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationComplete(true);
        setCurrentStep(STEPS.PREVIEW);
      }, 2500);
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
                    <p className="text-sm text-gray-500">{layout.description}</p>
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
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 p-6 rounded-lg border mb-8">
              <h2 className="text-xl font-semibold mb-2">Step 3: Preview Your Portfolio</h2>
              <p className="text-gray-600">
                Review your AI-generated portfolio before publishing it to the world.
              </p>
            </div>
            
            {/* Simplified AI-generated portfolio preview */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
              <CardContent className="relative pt-16 pb-4">
                <div className="absolute -top-16 left-6">
                  <div className="h-24 w-24 overflow-hidden rounded-full bg-white ring-4 ring-white flex items-center justify-center">
                    <img 
                      className="h-full w-full object-cover" 
                      src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                </div>
                <div className="pl-32 mt-2">
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Professional'}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user?.title || 'Professional'}</p>
                </div>
              </CardContent>
            </Card>
            
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