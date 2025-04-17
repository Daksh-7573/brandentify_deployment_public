import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X, Lightbulb, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IndustryCombobox } from "@/components/ui/industry-combobox";

interface ProfileSectionEditorProps {
  section: string;
  content: any;
  userId: number | undefined;
  onClose: () => void;
}

export default function ProfileSectionEditor({ section, content, userId, onClose }: ProfileSectionEditorProps) {
  const [currentContent, setCurrentContent] = useState(content);
  
  // States for suggestions
  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Create schema based on section type
  const getSchemaForSection = (section: string) => {
    switch (section) {
      case "basic":
        return z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          title: z.string().min(2, "Job title must be at least 2 characters"),
          industry: z.string().min(2, "Industry must be at least 2 characters"),
          location: z.string().min(2, "Location must be at least 2 characters"),
          email: z.string().email("Please enter a valid email address"),
          phoneNumber: z.string().nullable().optional(),
          lookingFor: z.string().nullable().optional(),
        });
      case "experience":
        return z.object({
          title: z.string().min(2, "Job title is required"),
          company: z.string().min(2, "Company name is required"),
          location: z.string().nullable().optional(),
          startDate: z.string().min(2, "Start date is required"),
          endDate: z.string().nullable().optional(),
          description: z.string().min(10, "Please provide at least a brief description"),
          current: z.boolean().optional(),
        });
      case "education":
        return z.object({
          institution: z.string().min(2, "Institution name is required"),
          degree: z.string().min(2, "Degree is required"),
          fieldOfStudy: z.string().min(2, "Field of study is required"),
          startDate: z.string().min(2, "Start date is required"),
          endDate: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        });
      case "skills":
        return z.object({
          name: z.string().min(2, "Skill name is required"),
          proficiency: z.string().min(2, "Proficiency level is required"),
          yearsOfExperience: z.number().optional(),
          description: z.string().nullable().optional(),
        });
      case "projects":
        return z.object({
          title: z.string().min(2, "Project title is required"),
          description: z.string().min(10, "Please provide a project description"),
          url: z.string().nullable().optional(),
          startDate: z.string().min(2, "Start date is required"),
          endDate: z.string().nullable().optional(),
          status: z.string().nullable().optional(),
        });
      default:
        return z.object({});
    }
  };
  
  // Initialize form with the schema for this section
  const form = useForm({
    resolver: zodResolver(getSchemaForSection(section)),
    defaultValues: content || {},
  });
  
  // Get suggestions from the API
  const { data: suggestions, isLoading: suggestionsLoading, error: suggestionsError } = useQuery({
    queryKey: ["/api/profile-coach/suggestions", section, userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      
      const response = await fetch("/api/profile-coach/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          section,
          currentContent: content || {},
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      
      return response.json();
    },
    enabled: !!userId,
  });
  
  // Apply the improved version from suggestions
  const applySuggestion = () => {
    if (suggestions?.improvedVersion) {
      form.reset(suggestions.improvedVersion);
      toast({
        title: "Suggestion Applied",
        description: "The AI-improved version has been applied to your form.",
      });
    }
  };
  
  // Apply a specific suggestion (for keyword insertion)
  const applySpecificSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    
    // This would depend on the section, but for example, for description fields:
    if (section === "experience" || section === "education" || section === "projects") {
      const currentDescription = form.getValues("description") || "";
      form.setValue("description", `${currentDescription} ${suggestion}`.trim());
    }
  };
  
  // Save the updated content
  const saveContentMutation = useMutation({
    mutationFn: async (updatedContent: any) => {
      if (!userId) throw new Error("User not authenticated");
      
      const response = await fetch("/api/profile-coach/save-improvements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          section,
          updatedContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save improvements");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Changes Saved",
        description: "Your profile improvements have been successfully saved.",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error saving improvements:", error);
      toast({
        title: "Error Saving Changes",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  const onSubmit = (data: any) => {
    saveContentMutation.mutate({ id: content?.id, ...data, userId });
  };
  
  // Get section title and description
  const getSectionInfo = () => {
    switch (section) {
      case "basic":
        return {
          title: "Basic Information",
          description: "Edit your personal and professional details",
        };
      case "experience":
        return {
          title: "Work Experience",
          description: "Add or edit your professional experience",
        };
      case "education":
        return {
          title: "Education",
          description: "Add or edit your academic background",
        };
      case "skills":
        return {
          title: "Skills",
          description: "Add or edit your professional skills",
        };
      case "projects":
        return {
          title: "Projects",
          description: "Add or edit your showcase projects",
        };
      default:
        return {
          title: "Edit Profile Section",
          description: "Update your profile information",
        };
    }
  };
  
  // Render form fields based on section
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} value={field.value || ""} />
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
                    <Input placeholder="Your professional title" {...field} value={field.value || ""} />
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
                    <IndustryCombobox
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select or type your industry"
                    />
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
                    <Input placeholder="City, State, Country" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} value={field.value || ""} />
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
                  <FormLabel>What are you looking for?</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select what you're looking for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Career Opportunities">Career Opportunities</SelectItem>
                      <SelectItem value="A New Job">A New Job</SelectItem>
                      <SelectItem value="Networking">Networking</SelectItem>
                      <SelectItem value="A Career Mentor">A Career Mentor</SelectItem>
                      <SelectItem value="Hiring Talent">Hiring Talent</SelectItem>
                      <SelectItem value="Business Partnerships">Business Partnerships</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="e.g. Senior Software Engineer" {...field} value={field.value || ""} />
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
                    <Input placeholder="e.g. Acme Corporation" {...field} value={field.value || ""} />
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
                    <Input placeholder="e.g. San Francisco, CA" {...field} value={field.value || ""} />
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
                      <Input placeholder="e.g. Jan 2020" {...field} value={field.value || ""} />
                    </FormControl>
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
                      <Input placeholder="e.g. Present" {...field} value={field.value || ""} disabled={form.watch("current")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Current Position</FormLabel>
                    <FormDescription>
                      Check if this is your current job
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("endDate", "Present");
                        } else {
                          form.setValue("endDate", "");
                        }
                      }}
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
                      placeholder="Describe your responsibilities, achievements, and the impact of your work" 
                      className="min-h-[120px]" 
                      {...field} 
                      value={field.value || ""} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include measurable achievements and specific skills used
                  </FormDescription>
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
                    <Input placeholder="e.g. Stanford University" {...field} value={field.value || ""} />
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
                    <Input placeholder="e.g. Bachelor of Science" {...field} value={field.value || ""} />
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
                    <Input placeholder="e.g. Computer Science" {...field} value={field.value || ""} />
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
                      <Input placeholder="e.g. Sep 2016" {...field} value={field.value || ""} />
                    </FormControl>
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
                      <Input placeholder="e.g. Jun 2020" {...field} value={field.value || ""} />
                    </FormControl>
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
                      placeholder="Add details about your coursework, achievements, activities, etc." 
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
                    <Input placeholder="e.g. JavaScript" {...field} value={field.value || ""} />
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
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your proficiency level" />
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
                      placeholder="e.g. 3" 
                      {...field}
                      value={field.value?.toString() || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      placeholder="Describe how you've used this skill in your professional experience" 
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
                    <Input placeholder="e.g. E-commerce Platform Redesign" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://example.com/project" {...field} value={field.value || ""} />
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
                      <Input placeholder="e.g. Jan 2022" {...field} value={field.value || ""} />
                    </FormControl>
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
                      <Input placeholder="e.g. Mar 2022 or Ongoing" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
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
                      placeholder="Describe the project, your role, technologies used, and outcomes" 
                      className="min-h-[120px]" 
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
        return <p>Unknown section type</p>;
    }
  };
  
  // Section-specific info for the UI
  const sectionInfo = getSectionInfo();
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{sectionInfo.title}</CardTitle>
              <CardDescription>{sectionInfo.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main form */}
            <div className={cn("space-y-6", suggestions ? "md:w-2/3" : "w-full")}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderFormFields()}
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveContentMutation.isPending}
                    >
                      {saveContentMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            
            {/* Suggestions panel (if available) */}
            {suggestions && (
              <div className="md:w-1/3 space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium flex items-center mb-3">
                    <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                    AI Recommendations
                  </h3>
                  
                  {suggestionsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Suggested improvements:</p>
                        <ul className="space-y-2">
                          {suggestions?.suggestions?.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="text-muted-foreground">{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {suggestions?.keywords && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Recommended keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestions.keywords.map((keyword: string, index: number) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={cn(
                                  "cursor-pointer hover:bg-primary/10",
                                  selectedSuggestion === keyword && "bg-primary/20 border-primary"
                                )}
                                onClick={() => applySpecificSuggestion(keyword)}
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={applySuggestion}
                          size="sm"
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Apply All Suggestions
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}