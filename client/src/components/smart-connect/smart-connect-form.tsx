import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { IndustryCombobox } from "@/components/ui/industry-combobox";
import { Badge } from "@/components/ui/badge";

// Define the schema for Smart Connect criteria
const smartConnectSchema = z.object({
  lookingFor: z.string().min(1, "Please specify what you are looking for"),
  targetJobTitle: z.string().optional(),
  experienceLevel: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional().nullable(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  remotePreference: z.boolean().optional(),
});

type SmartConnectFormValues = z.infer<typeof smartConnectSchema>;

// Storage key for form persistence
const SMART_CONNECT_FORM_STORAGE_KEY = 'smartConnect_formState';

// Default form values
const defaultValues: Partial<SmartConnectFormValues> = {
  lookingFor: "",
  targetJobTitle: "",
  experienceLevel: "",
  industry: "",
  domain: "",
  location: "",
  skills: [],
  remotePreference: false,
};

// Helper functions for localStorage operations
const saveFormState = (values: SmartConnectFormValues) => {
  try {
    localStorage.setItem(SMART_CONNECT_FORM_STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    console.warn('Failed to save Smart Connect form state:', error);
  }
};

const loadFormState = (): Partial<SmartConnectFormValues> => {
  try {
    const stored = localStorage.getItem(SMART_CONNECT_FORM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that the stored data matches our expected structure
      return {
        ...defaultValues,
        ...parsed,
        skills: Array.isArray(parsed.skills) ? parsed.skills : []
      };
    }
  } catch (error) {
    console.warn('Failed to load Smart Connect form state:', error);
  }
  return defaultValues;
};

const clearFormState = () => {
  try {
    localStorage.removeItem(SMART_CONNECT_FORM_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear Smart Connect form state:', error);
  }
};

export function SmartConnectForm({ userId, onSuccess }: { userId: number; onSuccess?: (results: any) => void }) {
  const [skillInput, setSkillInput] = useState("");
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const queryClient = useQueryClient();
  
  // Initialize the form with loaded state
  const form = useForm<SmartConnectFormValues>({
    resolver: zodResolver(smartConnectSchema),
    defaultValues: loadFormState(),
  });

  // Load saved form state on mount
  useEffect(() => {
    const savedState = loadFormState();
    
    // Reset form with saved state
    form.reset(savedState);
    setIsFormLoaded(true);
    
    console.log('[SmartConnect] Form state loaded from localStorage:', savedState);
  }, [form]);

  // Auto-save form state on changes (debounced)
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (values: SmartConnectFormValues) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (isFormLoaded) { // Only save if form is fully loaded
            saveFormState(values);
            console.log('[SmartConnect] Form state auto-saved:', values);
          }
        }, 1000); // 1 second debounce
      };
    })(),
    [isFormLoaded]
  );

  // Watch all form values and auto-save
  const watchedValues = form.watch();
  useEffect(() => {
    if (isFormLoaded) {
      debouncedSave(watchedValues as SmartConnectFormValues);
    }
  }, [watchedValues, debouncedSave, isFormLoaded]);
  
  // Watch for industry change to conditionally show domain field
  const selectedIndustry = form.watch("industry");
  
  // Smart Connect mutation
  const smartConnectMutation = useMutation({
    mutationFn: async (values: SmartConnectFormValues) => {
      return apiRequest('POST', `/api/smart-connect`, {
        userId,
        ...values,
      });
    },
    onSuccess: (data) => {
      console.log('[SmartConnect] POST request successful, received data:', data);
      
      toast({
        title: "Smart Connect request submitted",
        description: "We're finding the best professional matches for you.",
      });
      
      // Clear saved form state after successful submission
      clearFormState();
      console.log('[SmartConnect] Form state cleared after successful submission');
      
      // DON'T invalidate queries - it might be causing navigation
      // queryClient.invalidateQueries({ queryKey: ["/api/smart-connect"] });
      
      console.log('[SmartConnect] About to call onSuccess callback to switch tabs');
      
      // Call onSuccess callback to switch to results tab with data
      if (onSuccess) {
        console.log('[SmartConnect] Calling onSuccess with data');
        onSuccess(data);
        console.log('[SmartConnect] onSuccess callback executed successfully');
      } else {
        console.log('[SmartConnect] WARNING: onSuccess callback is undefined!');
      }
    },
    onError: (error) => {
      console.error("Smart Connect error:", error);
      toast({
        title: "Failed to process Smart Connect request",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Submit handler
  function onSubmit(values: SmartConnectFormValues) {
    console.log('[SmartConnect] Form submitted, mutation starting');
    smartConnectMutation.mutate(values);
  }
  
  // Add a skill to the skills array
  const addSkill = () => {
    if (!skillInput.trim()) return;
    
    const currentSkills = form.getValues("skills") || [];
    const newSkill = skillInput.trim();
    
    // Don't add duplicates
    if (!currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill]);
    }
    
    setSkillInput("");
  };
  
  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };
  
  return (
    <Card className="w-full mx-auto max-w-2xl neo-glass-card rounded-lg border border-white/10 backdrop-blur-lg bg-black/40">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-2xl font-bold text-white">Smart Connect</CardTitle>
        <CardDescription className="text-white/70">
          Find the perfect professional connections based on your specific needs.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* What are you looking for */}
            <FormField
              control={form.control}
              name="lookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">I am looking for</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="neo-glass-input bg-black/30 border-white/10 text-white hover:border-white/20 focus:border-white/30">
                        <SelectValue placeholder="Select what you're looking for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/95 border-white/10 backdrop-blur-lg">
                      <SelectItem value="mentor" className="text-white hover:bg-white/10">A Mentor</SelectItem>
                      <SelectItem value="mentee" className="text-white hover:bg-white/10">Someone to Mentor</SelectItem>
                      <SelectItem value="collaborator" className="text-white hover:bg-white/10">A Collaborator</SelectItem>
                      <SelectItem value="connection" className="text-white hover:bg-white/10">Professional Connections</SelectItem>
                      <SelectItem value="hire" className="text-white hover:bg-white/10">Someone to Hire</SelectItem>
                      <SelectItem value="job" className="text-white hover:bg-white/10">Job Opportunities</SelectItem>
                      <SelectItem value="advisor" className="text-white hover:bg-white/10">An Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-white/60 text-sm">
                    This helps us understand the type of professional relationship you're seeking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Job Title */}
            <FormField
              control={form.control}
              name="targetJobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">Job Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Product Manager" 
                      {...field} 
                      className="neo-glass-input bg-black/30 border-white/10 text-white placeholder:text-white/50 hover:border-white/20 focus:border-white/30"
                    />
                  </FormControl>
                  <FormDescription className="text-white/60 text-sm">
                    The professional role you're interested in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Experience Level */}
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="neo-glass-input bg-black/30 border-white/10 text-white hover:border-white/20 focus:border-white/30">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black/95 border-white/10 backdrop-blur-lg">
                      <SelectItem value="entry-level" className="text-white hover:bg-white/10">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid-level" className="text-white hover:bg-white/10">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior" className="text-white hover:bg-white/10">Senior (6-10 years)</SelectItem>
                      <SelectItem value="lead" className="text-white hover:bg-white/10">Lead/Principal (8+ years)</SelectItem>
                      <SelectItem value="management" className="text-white hover:bg-white/10">Management (5+ years)</SelectItem>
                      <SelectItem value="executive" className="text-white hover:bg-white/10">Executive (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-white/60 text-sm">
                    Preferred experience level for your connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">Industry</FormLabel>
                  <FormControl>
                    <IndustryCombobox
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Select or enter an industry"
                    />
                  </FormControl>
                  <FormDescription className="text-white/60 text-sm">
                    The industry sector you're interested in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Domain - conditionally shown based on industry selection */}
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem style={{ 
                  display: selectedIndustry ? 'block' : 'none',
                  opacity: selectedIndustry ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}>
                  <FormLabel className="text-base text-white font-medium">Domain Expertise</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={selectedIndustry ? `e.g. Specific area within ${selectedIndustry}` : "Select an industry first"} 
                      {...field} 
                      value={field.value || ""}
                      disabled={!selectedIndustry}
                      className="neo-glass-input bg-black/30 border-white/10 text-white placeholder:text-white/50 hover:border-white/20 focus:border-white/30 disabled:opacity-50"
                    />
                  </FormControl>
                  <FormDescription className="text-white/60 text-sm">
                    {selectedIndustry 
                      ? "Specific domain or expertise within the selected industry"
                      : "Please select an industry to specify your domain expertise"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. San Francisco, CA" 
                      {...field} 
                      className="neo-glass-input bg-black/30 border-white/10 text-white placeholder:text-white/50 hover:border-white/20 focus:border-white/30"
                    />
                  </FormControl>
                  <FormDescription className="text-white/60 text-sm">
                    Preferred geographic location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Skills */}
            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base text-white font-medium">Skills</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="neo-glass-input bg-black/30 border-white/10 text-white placeholder:text-white/50 hover:border-white/20 focus:border-white/30"
                    />
                    <Button 
                      type="button" 
                      onClick={addSkill} 
                      size="sm"
                      className="neo-glass-button bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("skills")?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1 bg-white/10 text-white border border-white/10 hover:bg-white/20">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-xs font-medium rounded-full hover:bg-destructive/20 ml-1 text-white/80 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription className="text-white/60 text-sm">
                    Skills you're looking for in potential connections
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Remote Preference */}
            <FormField
              control={form.control}
              name="remotePreference"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-white font-medium">Remote Preference</FormLabel>
                    <FormDescription className="text-white/60 text-sm">
                      Prefer connections open to remote collaboration
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Separator className="bg-white/10" />
            
            <Button 
              type="submit" 
              className="w-full neo-glass-button bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
              disabled={smartConnectMutation.isPending}
            >
              {smartConnectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding matches...
                </>
              ) : (
                "Find Smart Connections"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col text-center text-sm text-white/60 border-t border-white/5 pt-4">
        <p>
          Our intelligent matching engine will find the best connections based on your criteria.
        </p>
      </CardFooter>
    </Card>
  );
}