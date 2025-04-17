import { useState } from "react";
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
import { IndustryCombobox } from "../ui/industry-combobox";
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

export function SmartConnectForm({ userId }: { userId: number }) {
  const [skillInput, setSkillInput] = useState("");
  const queryClient = useQueryClient();
  
  // Initialize the form
  const form = useForm<SmartConnectFormValues>({
    resolver: zodResolver(smartConnectSchema),
    defaultValues,
  });
  
  // Watch for industry change to conditionally show domain field
  const selectedIndustry = form.watch("industry");
  
  // Smart Connect mutation
  const smartConnectMutation = useMutation({
    mutationFn: async (values: SmartConnectFormValues) => {
      return apiRequest("/api/smart-connect", {
        method: "POST",
        body: JSON.stringify({
          userId,
          ...values,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Smart Connect request submitted",
        description: "We're finding the best professional matches for you.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/smart-connect"] });
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
    <Card className="w-full mx-auto max-w-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Smart Connect</CardTitle>
        <CardDescription>
          Find the perfect professional connections based on your specific needs.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* What are you looking for */}
            <FormField
              control={form.control}
              name="lookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">I am looking for</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select what you're looking for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mentor">A Mentor</SelectItem>
                      <SelectItem value="mentee">Someone to Mentor</SelectItem>
                      <SelectItem value="collaborator">A Collaborator</SelectItem>
                      <SelectItem value="connection">Professional Connections</SelectItem>
                      <SelectItem value="hire">Someone to Hire</SelectItem>
                      <SelectItem value="job">Job Opportunities</SelectItem>
                      <SelectItem value="advisor">An Advisor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
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
                  <FormLabel className="text-base">Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Product Manager" {...field} />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel className="text-base">Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                      <SelectItem value="management">Management (5+ years)</SelectItem>
                      <SelectItem value="executive">Executive (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
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
                  <FormLabel className="text-base">Industry</FormLabel>
                  <FormControl>
                    <IndustryCombobox
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select or enter an industry"
                    />
                  </FormControl>
                  <FormDescription>
                    The industry sector you're interested in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Domain - conditionally shown based on industry selection */}
            {selectedIndustry && (
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Domain Expertise</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`e.g. Specific area within ${selectedIndustry}`} 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Specific domain or expertise within the selected industry
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. San Francisco, CA" {...field} />
                  </FormControl>
                  <FormDescription>
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
                  <FormLabel className="text-base">Skills</FormLabel>
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
                    />
                    <Button type="button" onClick={addSkill} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("skills")?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-xs font-medium rounded-full hover:bg-destructive/20 ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Remote Preference</FormLabel>
                    <FormDescription>
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
            
            <Separator />
            
            <Button 
              type="submit" 
              className="w-full"
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
      
      <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
        <p>
          Our intelligent matching engine will find the best connections based on your criteria.
        </p>
      </CardFooter>
    </Card>
  );
}