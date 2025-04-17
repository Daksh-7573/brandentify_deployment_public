import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface ProfileSectionEditorProps {
  section: string;
  content: any;
  userId: number | undefined;
  onClose: () => void;
}

export default function ProfileSectionEditor({ section, content, userId, onClose }: ProfileSectionEditorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    suggestions: string[];
    keywords: string[];
    improvedVersion: string | null;
  } | null>(null);
  
  // Fetch suggestions when component mounts
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await apiRequest("/api/profile-coach/suggestions", {
          method: "POST",
          body: JSON.stringify({
            userId,
            section,
            currentContent: content,
          }),
        });
        
        setSuggestions(response);
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
        url: z.string().nullable().optional(),
        startDate: z.string().min(2, "Start date is required"),
        endDate: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
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
      await apiRequest("/api/profile-coach/save-improvements", {
        method: "POST",
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
                    <Input placeholder="Major or field of study" {...field} />
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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Link to your project" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
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
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>{getSectionTitle()}</CardTitle>
          <CardDescription>
            Update your {section} information to enhance your professional profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderFormFields()}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
            <CardDescription>
              AI-powered suggestions to enhance your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.suggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tips</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {suggestions.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-muted-foreground">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestions.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Recommended Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {suggestions.improvedVersion && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Suggested Content</h3>
                <p className="bg-muted p-3 rounded text-sm">
                  {suggestions.improvedVersion}
                </p>
                <CardFooter className="px-0 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (section === "experience" || section === "projects" || section === "education") {
                        form.setValue("description", suggestions.improvedVersion || "");
                      }
                    }}
                  >
                    Use Suggested Content
                  </Button>
                </CardFooter>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}