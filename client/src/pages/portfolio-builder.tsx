import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Layout, Eye, EyeOff, Save, Check } from "lucide-react";

// Define AuthUser type to match the one in auth-context
type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  title?: string;
  location?: string;
};

// Define the schema for portfolio form
const portfolioFormSchema = z.object({
  layout: z.enum(["professional", "creative", "minimal", "technical", "executive"]),
  customTitle: z.string().nullable().optional(),
  customBio: z.string().nullable().optional(),
  isPublished: z.boolean().default(false),
  publicUrl: z.string().nullable().optional(),
  customizationOptions: z.any().optional(),
  featuredProjects: z.array(z.number()).optional(),
  featuredSkills: z.array(z.number()).optional(),
  featuredExperiences: z.array(z.number()).optional()
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  // Tab state removed as we're using single page layout
  const [preview, setPreview] = useState(false);

  // Fetch existing portfolio if it exists
  const { data: portfolio, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.uid}/portfolio`],
    enabled: !!user,
    staleTime: 30000 // 30 seconds
  });

  // Form setup
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      layout: "professional",
      customTitle: "",
      customBio: "",
      isPublished: false,
      publicUrl: "",
      customizationOptions: {},
      featuredProjects: [],
      featuredSkills: [],
      featuredExperiences: []
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
        customTitle: string | null;
        customBio: string | null;
        customizationOptions: Record<string, any>;
        isPublished: boolean;
        publicUrl: string | null;
        featuredProjects: number[];
        featuredSkills: number[];
        featuredExperiences: number[];
        createdAt: string;
        updatedAt: string;
      };
      
      form.reset({
        layout: typedPortfolio.layout as any, // Cast to match enum
        customTitle: typedPortfolio.customTitle || "",
        customBio: typedPortfolio.customBio || "",
        isPublished: typedPortfolio.isPublished,
        publicUrl: typedPortfolio.publicUrl || "",
        customizationOptions: typedPortfolio.customizationOptions || {},
        featuredProjects: typedPortfolio.featuredProjects || [],
        featuredSkills: typedPortfolio.featuredSkills || [],
        featuredExperiences: typedPortfolio.featuredExperiences || []
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
        setIsCreating(true);
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
      setIsCreating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save portfolio: ${error.message}`,
        variant: "destructive",
      });
      setIsCreating(false);
    }
  });

  // Handle form submission
  function onSubmit(data: PortfolioFormValues) {
    portfolioMutation.mutate(data);
  }

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

  // Layout templates
  const layoutOptions = [
    { id: "professional", name: "Professional", description: "Clean, traditional layout ideal for corporate environments" },
    { id: "creative", name: "Creative", description: "Visual-heavy design perfect for designers and artists" },
    { id: "minimal", name: "Minimal", description: "Simple, elegant design that focuses on content" },
    { id: "technical", name: "Technical", description: "Code-focused design for developers and engineers" },
    { id: "executive", name: "Executive", description: "Sophisticated layout for senior professionals and executives" }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar activePage="portfolio-builder" />
      <div className="flex-1 overflow-auto">
        <div className="container px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Builder</h1>
              <p className="text-muted-foreground">Create and customize your professional portfolio</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-2"
              >
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {preview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={portfolioMutation.isPending}
                className="flex items-center gap-2"
              >
                {portfolioMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : portfolio ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {portfolioMutation.isPending ? "Saving..." : portfolio ? "Update Portfolio" : "Create Portfolio"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : preview ? (
            <div className="border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Portfolio Preview</h2>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Layout Style</h3>
                  <p>{layoutOptions.find(l => l.id === form.watch("layout"))?.name || "Professional"}</p>
                </div>
                {/* Custom Title and Bio fields removed from preview */}
                <div>
                  <h3 className="font-semibold">Publication Status</h3>
                  <p>{form.watch("isPublished") ? "Published" : "Draft (not published)"}</p>
                </div>
                {form.watch("publicUrl") && (
                  <div>
                    <h3 className="font-semibold">Custom URL</h3>
                    <p>{form.watch("publicUrl")}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="layout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio Layout</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a layout style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {layoutOptions.map(layout => (
                                <SelectItem key={layout.id} value={layout.id}>
                                  {layout.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose a layout that best represents your professional style
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Portfolio Title and Custom Bio fields removed as requested */}
                    
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Publish Portfolio
                            </FormLabel>
                            <FormDescription>
                              Make your portfolio visible to the public
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
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
                            Create a custom URL for your portfolio (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}