import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check, X, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileSectionEditorProps {
  section: string;
  content: any;
  userId: number | undefined;
  onClose: () => void;
}

export default function ProfileSectionEditor({ section, content, userId, onClose }: ProfileSectionEditorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = React.useState(false);
  
  // State for AI-generated suggestions
  const [suggestions, setSuggestions] = React.useState<{
    suggestions: string[];
    keywords: string[];
    improvedVersion: string | null;
  } | null>(null);
  
  // Fetch suggestions when component mounts
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await apiRequest("POST", "/api/profile-coach/suggestions", {
          body: JSON.stringify({
            userId,
            section,
            currentContent: content,
          }),
        });
        
        if (response) {
          setSuggestions(response);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    
    fetchSuggestions();
  }, [userId, section, content]);
  
  // Define form validation schema based on section type
  let formSchema: any;
  
  switch (section) {
    case "basic":
      formSchema = z.object({
        id: z.number(),
        name: z.string().min(2, "Name must be at least 2 characters"),
        title: z.string().min(2, "Job title must be at least 2 characters"),
        industry: z.string().min(2, "Industry must be at least 2 characters"),
        location: z.string().min(2, "Location must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        phoneNumber: z.string().nullable().optional(),
        lookingFor: z.string().nullable().optional(),
      });
      break;
      
    case "experience":
      formSchema = z.object({
        id: z.number().optional(),
        userId: z.number(),
        title: z.string().min(2, "Job title is required"),
        company: z.string().min(2, "Company name is required"),
        location: z.string().nullable().optional(),
        startDate: z.string().min(2, "Start date is required"),
        endDate: z.string().nullable().optional(),
        description: z.string().min(10, "Please provide at least a brief description"),
        current: z.boolean().optional(),
      });
      break;
      
    case "education":
      formSchema = z.object({
        id: z.number().optional(),
        userId: z.number(),
        institution: z.string().min(2, "Institution name is required"),
        degree: z.string().min(2, "Degree is required"),
        fieldOfStudy: z.string().min(2, "Field of study is required"),
        startDate: z.string().min(2, "Start date is required"),
        endDate: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
      });
      break;
      
    case "skills":
      formSchema = z.object({
        id: z.number().optional(),
        userId: z.number(),
        name: z.string().min(2, "Skill name is required"),
        proficiency: z.string().min(2, "Proficiency level is required"),
        yearsOfExperience: z.number().or(z.string()).optional(),
        description: z.string().nullable().optional(),
      });
      break;
      
    case "projects":
      formSchema = z.object({
        id: z.number().optional(),
        userId: z.number(),
        title: z.string().min(2, "Project title is required"),
        description: z.string().min(10, "Please provide a project description"),
        projectUrl: z.string().nullable().optional(),
        startDate: z.string().min(2, "Start date is required"),
        endDate: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
      });
      break;
      
    default:
      formSchema = z.object({});
  }
  
  // Set up form with react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...content,
      // Convert any null values to empty strings for form inputs
      ...Object.entries(content).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value === null ? "" : value,
        }),
        {}
      ),
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/profile-coach/save-improvements", {
        body: JSON.stringify({
          userId,
          section,
          updatedContent: data,
        }),
      });
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error saving profile updates:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile updates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get section title based on section type
  const getSectionTitle = () => {
    switch (section) {
      case "basic":
        return "Basic Information";
      case "experience":
        return content.id ? "Edit Work Experience" : "Add Work Experience";
      case "education":
        return content.id ? "Edit Education" : "Add Education";
      case "skills":
        return content.id ? "Edit Skill" : "Add Skill";
      case "projects":
        return content.id ? "Edit Project" : "Add Project";
      default:
        return "Edit Profile";
    }
  };
  
  // Render appropriate form fields based on section type
  const renderFormFields = () => {
    switch (section) {
      case "basic":
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Your industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Your location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Looking For</FormLabel>
                  <FormControl>
                    <Input placeholder="What you're looking for (e.g., New opportunities, Mentorship)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "experience":
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Job location" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM" {...field} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM or leave empty if current" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Current Position</FormLabel>
                    <FormDescription>Check if you currently work here</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your responsibilities, achievements, and skills used"
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "education":
        return (
          <>
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="School or university name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="Degree type (e.g., Bachelor's, Master's)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fieldOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <FormControl>
                    <Input placeholder="Major or field of study" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM" {...field} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM or leave empty if current" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about your education"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "skills":
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Skill name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="proficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Years of experience"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about your skill"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "projects":
        return (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM or leave empty if ongoing" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project, technologies used, and outcomes"
                      className="min-h-[150px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      default:
        return null;
    }
  };
  
  // Apply AI suggestions to the appropriate field
  const applyAiSuggestion = () => {
    if (!suggestions || !suggestions.improvedVersion) return;
    
    // Different fields based on section type
    switch (section) {
      case "basic":
        // Likely no direct field match
        break;
        
      case "experience":
      case "education":
      case "projects":
      case "skills":
        form.setValue(
          "description",
          suggestions.improvedVersion,
          { shouldValidate: true, shouldDirty: true }
        );
        break;
        
      default:
        break;
    }
    
    toast({
      title: "AI Suggestion Applied",
      description: "The improved content has been applied to your form.",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{getSectionTitle()}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Complete the form below to update your profile. Required fields are marked with an asterisk.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Dynamic form fields based on section */}
                {renderFormFields()}
                
                {/* Form buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Right sidebar with AI suggestions */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium flex items-center gap-1 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI Suggestions
              </h3>
              
              {suggestions ? (
                <>
                  {suggestions.keywords.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        Recommended Keywords
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {suggestions.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestions.suggestions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">
                        Improvement Tips
                      </h4>
                      <ul className="text-xs space-y-1">
                        {suggestions.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex gap-1">
                            <span className="text-muted-foreground">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {suggestions.improvedVersion && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-medium text-muted-foreground">
                          AI-Improved Version
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={applyAiSuggestion}
                        >
                          Apply
                        </Button>
                      </div>
                      <div className="text-xs bg-muted/50 p-2 rounded-md max-h-[200px] overflow-y-auto">
                        {suggestions.improvedVersion}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}