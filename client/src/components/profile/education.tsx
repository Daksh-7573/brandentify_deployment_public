import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Pencil, Plus, Trash2, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import { popularLocations } from "@/lib/location-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { INDUSTRY_DOMAINS, INDUSTRIES } from "@/pages/profile";

// Define common degree options
const DEGREES = [
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS/BSc)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Technology (BTech)",
  "Master of Arts (MA)",
  "Master of Science (MS/MSc)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (MEng)",
  "Master of Fine Arts (MFA)",
  "Master of Technology (MTech)",
  "Doctor of Philosophy (PhD)",
  "Doctor of Education (EdD)",
  "Doctor of Medicine (MD)",
  "Juris Doctor (JD)",
  "Associate of Arts (AA)",
  "Associate of Science (AS)",
  "Associate of Applied Science (AAS)",
  "Diploma",
  "Certificate",
  "Post Graduate Diploma",
  "High School Diploma",
  "GED",
  "Other"
];

// Create schema for education
const educationSchema = z.object({
  userId: z.number(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  currentlyEnrolled: z.boolean().default(false),
  description: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
}).refine(data => !data.currentlyEnrolled || !data.endDate, {
  message: "End date should be empty if currently enrolled",
  path: ["endDate"]
}).refine(data => data.currentlyEnrolled || data.endDate || data.startDate, {
  message: "Either currently enrolled or end date must be provided",
  path: ["endDate"]
}).refine(data => !data.startDate || !data.endDate || data.startDate < data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type Education = z.infer<typeof educationSchema>;

export default function Education() {
  const { userId } = useParams<{ userId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State for edit/create dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [domainOptions, setDomainOptions] = useState<string[]>([]);
  
  // Use ID 1 for development
  // This will be replaced with actual userId in production
  const effectiveUserId = 1;
  
  // Fetch education data for user
  const { data: educations = [], isLoading } = useQuery<Education[]>({
    queryKey: [`/api/users/${effectiveUserId}/educations`],
    enabled: !!effectiveUserId,
    staleTime: 1000, 
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const form = useForm<Education>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      userId: effectiveUserId,
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      currentlyEnrolled: false,
      description: "",
      industry: "",
      domain: "",
    }
  });
  
  // Create education mutation
  const createEducationMutation = useMutation({
    mutationFn: async (data: Education) => {
      const res = await apiRequest("POST", "/api/educations", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${effectiveUserId}/educations`] });
      toast({
        title: "Education added",
        description: "Your education has been added successfully",
      });
      setOpenDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding education",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update education mutation
  const updateEducationMutation = useMutation({
    mutationFn: async (data: Education) => {
      const res = await apiRequest("PUT", `/api/educations/${editingEducation?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${effectiveUserId}/educations`] });
      toast({
        title: "Education updated",
        description: "Your education has been updated successfully",
      });
      setOpenDialog(false);
      setEditingEducation(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating education",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete education mutation
  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/educations/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${effectiveUserId}/educations`] });
      toast({
        title: "Education deleted",
        description: "Your education has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting education",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle industry selection and update domains
  useEffect(() => {
    if (selectedIndustry) {
      const domains = INDUSTRY_DOMAINS[selectedIndustry] || [];
      setDomainOptions(domains);
      
      // If current domain is not in new list, clear it
      if (domains.length > 0 && selectedDomain && !domains.includes(selectedDomain)) {
        setSelectedDomain("");
        form.setValue("domain", "");
      }
    } else {
      setDomainOptions([]);
      setSelectedDomain("");
      form.setValue("domain", "");
    }
  }, [selectedIndustry, form]);
  
  // Handle form submission
  const onSubmit = (data: Education) => {
    // If no end date and currently enrolled, set end date to null
    if (data.currentlyEnrolled) {
      data.endDate = undefined;
    }
    
    if (editingEducation) {
      updateEducationMutation.mutate(data);
    } else {
      createEducationMutation.mutate(data);
    }
  };
  
  // Handle edit education
  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    
    // Set industry and domain for dropdowns
    setSelectedIndustry(education.industry || "");
    setSelectedDomain(education.domain || "");
    
    // Update domain options based on selected industry
    if (education.industry) {
      setDomainOptions(INDUSTRY_DOMAINS[education.industry] || []);
    }
    
    // Update form values
    form.reset({
      ...education,
      // Convert string dates to Date objects if they exist
      startDate: education.startDate ? new Date(education.startDate) : undefined,
      endDate: education.endDate ? new Date(education.endDate) : undefined,
    });
    
    setOpenDialog(true);
  };
  
  // Handle add new education
  const handleAddEducation = () => {
    setEditingEducation(null);
    setSelectedIndustry("");
    setSelectedDomain("");
    form.reset({
      userId: effectiveUserId,
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      currentlyEnrolled: false,
      description: "",
      industry: "",
      domain: "",
    });
    setOpenDialog(true);
  };
  
  // Convert location data to combobox format
  const locationOptions = popularLocations.map(location => ({
    value: location,
    label: location,
  }));
  
  // Convert industry data to combobox format
  const industryOptions = INDUSTRIES.map(industry => ({
    value: industry,
    label: industry,
  }));
  
  // Format date for display
  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    return format(new Date(date), "MMM yyyy");
  };
  
  // Get domains for a specific industry
  const getDomainsForIndustry = (industry: string) => {
    return INDUSTRY_DOMAINS[industry] || [];
  };
  
  // Convert domains to combobox format
  const domainOptionsFormatted = domainOptions.map(value => ({
    value,
    label: value,
  }));
  
  // Convert degrees to combobox format
  const degreeOptions = DEGREES.map(degree => ({
    value: degree,
    label: degree,
  }));
  
  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    form.reset();
    setEditingEducation(null);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Education</CardTitle>
          <CardDescription>Add your educational background</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1" 
          onClick={handleAddEducation}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-1" />
              <Skeleton className="h-4 w-1/5 mb-3" />
              <Separator className="my-2" />
            </div>
          ))
        ) : educations.length === 0 ? (
          // Empty state
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No education added yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleAddEducation}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </div>
        ) : (
          // Education list
          <div className="space-y-4">
            {educations.map((education, index) => (
              <div key={education.id || index} className="relative">
                <div className="mb-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{education.institution}</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleEditEducation(education)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteEducationMutation.mutate(education.id as number)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {education.degree}{education.field ? `, ${education.field}` : ""}
                  </p>
                  
                  <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-sm">
                    {education.location && (
                      <span className="flex items-center text-muted-foreground">
                        📍 {education.location}
                      </span>
                    )}
                    <span className="flex items-center text-muted-foreground">
                      🗓️ {formatDate(education.startDate)} - {education.currentlyEnrolled 
                        ? "Present" 
                        : formatDate(education.endDate)}
                    </span>
                  </div>
                  
                  {(education.industry || education.domain) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {education.industry && (
                        <Badge variant="outline" className="bg-secondary/50">
                          {education.industry}
                        </Badge>
                      )}
                      {education.domain && (
                        <Badge variant="outline" className="bg-secondary/20">
                          {education.domain}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {education.description && (
                    <p className="mt-2 text-sm">{education.description}</p>
                  )}
                </div>
                {index < educations.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Education dialog for adding/editing */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? "Edit Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription>
              {editingEducation 
                ? "Update your educational information below." 
                : "Add your educational information below."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Institution */}
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution*</FormLabel>
                    <FormControl>
                      <Input placeholder="Harvard University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Degree */}
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree*</FormLabel>
                    <FormControl>
                      <Combobox
                        options={degreeOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a degree type..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Field of Study */}
              <FormField
                control={form.control}
                name="field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Combobox
                        options={locationOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a location..."
                      />
                    </FormControl>
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
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Combobox
                        options={industryOptions}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedIndustry(value);
                        }}
                        placeholder="Select an industry..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select the industry relevant to your education
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Domain - Only show if industry is selected */}
              {selectedIndustry && (
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Combobox
                          options={domainOptionsFormatted}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDomain(value);
                          }}
                          placeholder="Select a domain..."
                        />
                      </FormControl>
                      <FormDescription>
                        Select a specific domain within your industry
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Currently Enrolled Checkbox */}
              <FormField
                control={form.control}
                name="currentlyEnrolled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Currently Enrolled</FormLabel>
                      <FormDescription>
                        Are you currently studying at this institution?
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
              
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                            defaultMonth={field.value || new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* End Date - Only show if not currently enrolled */}
                {!form.watch("currentlyEnrolled") && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1950}
                              toYear={new Date().getFullYear()}
                              defaultMonth={field.value || new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of your studies, achievements, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEducationMutation.isPending || updateEducationMutation.isPending}
                >
                  {(createEducationMutation.isPending || updateEducationMutation.isPending) ? (
                    <div className="flex items-center">
                      <span className="mr-2">Saving...</span>
                      <span className="animate-spin">⏳</span>
                    </div>
                  ) : (
                    editingEducation ? "Update" : "Add"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}