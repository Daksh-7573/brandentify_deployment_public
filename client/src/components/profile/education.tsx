import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Calendar as CalendarIcon, GraduationCap, Building, MapPin, BookOpen, Briefcase, AlertCircle } from "lucide-react";
import * as z from "zod";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExperienceItemSkeleton } from "@/components/ui/skeleton-loaders";
import { popularLocations } from "@/lib/location-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DegreeCombobox } from "@/components/ui/degree-combobox";

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

// Define industry domains map
interface IndustryDomainMap {
  [key: string]: string[];
}

// Define common industries with their domains
const INDUSTRY_DOMAINS: IndustryDomainMap = {
  "Technology": [
    "Artificial Intelligence & Machine Learning",
    "Blockchain & Cryptocurrency",
    "Cloud Computing & SaaS",
    "Cybersecurity",
    "Data Science & Analytics",
    "DevOps & Infrastructure",
    "E-commerce & Retail Tech",
    "Enterprise Software",
    "Gaming & Entertainment",
    "Hardware & IoT",
    "Mobile Development",
    "Robotics & Automation",
    "Web Development & Design"
  ],
  "Healthcare": [
    "Biotechnology",
    "Digital Health",
    "Healthcare IT",
    "Medical Devices",
    "Mental Health",
    "Pharmaceuticals",
    "Telehealth"
  ],
  "Finance": [
    "Banking",
    "Financial Technology (FinTech)",
    "Insurance",
    "Investment Management",
    "Personal Finance",
    "Real Estate Finance",
    "Wealth Management"
  ],
  "Education": [
    "Corporate Training",
    "EdTech",
    "Higher Education",
    "K-12 Education",
    "Language Learning",
    "Lifelong Learning",
    "Vocational Training"
  ],
  "Marketing": [
    "Advertising",
    "Branding",
    "Content Marketing",
    "Digital Marketing",
    "Market Research",
    "Public Relations",
    "Social Media Marketing"
  ],
  "Retail & E-commerce": [
    "Consumer Goods",
    "Fashion & Apparel",
    "Food & Beverage",
    "Luxury Retail",
    "Online Marketplaces"
  ],
  "Media & Entertainment": [
    "Digital Media",
    "Film & Television",
    "Music & Audio",
    "Publishing",
    "Streaming Services"
  ],
  "Manufacturing": [
    "Aerospace & Defense",
    "Automotive",
    "Chemical",
    "Electronics",
    "Food Processing",
    "Textile"
  ],
  "Energy & Utilities": [
    "Clean Energy",
    "Electricity",
    "Environmental Services",
    "Oil & Gas",
    "Renewable Energy",
    "Water & Waste Management"
  ],
  "Transportation & Logistics": [
    "Aviation",
    "Freight & Shipping",
    "Public Transportation",
    "Supply Chain Management",
    "Warehousing"
  ],
  "Consulting": [
    "Business Consulting",
    "IT Consulting",
    "Management Consulting",
    "Strategy Consulting"
  ],
  "Real Estate": [
    "Commercial Real Estate",
    "Property Management",
    "Real Estate Development",
    "Residential Real Estate"
  ],
  "Hospitality & Tourism": [
    "Accommodation",
    "Event Planning",
    "Food Service",
    "Travel & Tourism"
  ],
  "Nonprofit & Social Impact": [
    "Charities",
    "Environmental Conservation",
    "Human Rights",
    "International Development",
    "Social Services"
  ],
  "Agriculture": [
    "Agritech",
    "Farming",
    "Food Production",
    "Forestry",
    "Livestock"
  ],
  "Legal": [
    "Corporate Law",
    "Intellectual Property",
    "Legal Tech",
    "Litigation"
  ],
  "Human Resources": [
    "HR Technology",
    "Recruitment",
    "Talent Management",
    "Training & Development"
  ],
  "Government & Public Sector": [
    "Civic Technology",
    "Defense",
    "Public Administration",
    "Public Policy"
  ]
};

// Get all industries as an array
const INDUSTRIES = Object.keys(INDUSTRY_DOMAINS);

// Create schema for education
const educationSchema = z.object({
  userId: z.number(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  industry: z.string().min(1, "Industry is required"),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }).optional(),
  currentlyEnrolled: z.boolean().default(false),
  skillsAcquired: z.array(z.string()).max(10, { message: "Maximum 10 skills/achievements allowed" }).optional().default([]),
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

// Define the basic Education type from the schema
type Education = z.infer<typeof educationSchema> & { id?: number };

// Define a type for API-compatible education data with string dates
// Define what the API expects
interface EducationApiData {
  id?: number;
  userId: number;
  institution: string;
  degree: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

// Define what we use in the UI (superset of API data)
interface EducationUIData extends EducationApiData {
  field?: string;
  currentlyEnrolled: boolean;
  skillsAcquired?: string[];
  industry?: string;
  domain?: string;
}

export default function Education() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for edit/create dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [domainOptions, setDomainOptions] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>("");
  const [skillsAcquired, setSkillsAcquired] = useState<string[]>([]);
  
  // Use the actual user ID from auth context if available, or 1 for demo mode
  const effectiveUserId = user?.id || 1;
  
  // Fetch education data for user
  const { data: fetchedEducations = [], isLoading } = useQuery<any>({
    queryKey: [`/api/users/${effectiveUserId}/educations`],
    enabled: true,
    staleTime: 1000, 
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Ensure educations is always an array to prevent "map is not a function" errors
  const educations = Array.isArray(fetchedEducations) ? fetchedEducations : [];
  
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
      skillsAcquired: [],
      industry: "",
      domain: "",
    }
  });
  
  // Create education mutation
  const createEducationMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Submitting education data:", data);
      const res = await fetch("/api/educations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status} ${errorText.substring(0, 100)}`);
      }
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
    mutationFn: async (data: any) => {
      console.log("Updating education data:", data);
      const res = await fetch(`/api/educations/${editingEducation?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status} ${errorText.substring(0, 100)}`);
      }
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
      console.log("Deleting education with ID:", id);
      const res = await fetch(`/api/educations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        throw new Error(`Server error: ${res.status} ${errorText.substring(0, 100)}`);
      }
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
  }, [selectedIndustry, form, selectedDomain]);
  
  // Handle form submission
  const onSubmit = (data: Education) => {
    // Create a copy of the data to avoid modifying the original
    const processedData = {...data};
    
    // If currently enrolled, remove end date
    if (processedData.currentlyEnrolled) {
      processedData.endDate = undefined;
    }
    
    // Store all the UI data for display purposes
    const uiData = {
      id: processedData.id,
      userId: processedData.userId,
      institution: processedData.institution,
      degree: processedData.degree,
      location: processedData.location,
      startDate: processedData.startDate ? processedData.startDate.toISOString().split('T')[0] : undefined, // YYYY-MM-DD format
      endDate: processedData.endDate ? processedData.endDate.toISOString().split('T')[0] : undefined, // YYYY-MM-DD format
      field: processedData.field,
      currentlyEnrolled: processedData.currentlyEnrolled,
      skillsAcquired: processedData.skillsAcquired,
      industry: processedData.industry,
      domain: processedData.domain
    };
    
    // Create a version with all fields including the newly added ones
    const apiData = {
      id: uiData.id,
      userId: uiData.userId,
      institution: uiData.institution,
      degree: uiData.degree,
      location: uiData.location,
      startDate: uiData.startDate,
      endDate: uiData.endDate,
      // Include the new fields - use names that match the database schema exactly
      industry: uiData.industry,
      fieldOfStudy: uiData.field, // Map UI 'field' to database 'fieldOfStudy' column (camelCase)
      // Convert skills array to JSON string for Postgres JSONB column
      skillsAcquired: Array.isArray(uiData.skillsAcquired) ? JSON.stringify(uiData.skillsAcquired) : "[]",
      domain: uiData.domain
    };
    
    if (editingEducation) {
      updateEducationMutation.mutate(apiData);
    } else {
      createEducationMutation.mutate(apiData);
    }
  };
  
  // Handle edit education
  const handleEditEducation = (education: any) => {
    setEditingEducation(education);
    
    // Set industry and domain for dropdowns
    setSelectedIndustry(education.industry || "");
    setSelectedDomain(education.domain || "");
    
    // Update domain options based on selected industry
    if (education.industry) {
      setDomainOptions(INDUSTRY_DOMAINS[education.industry] || []);
    }
    
    // Initialize the skills state
    setSkillsAcquired(education.skillsAcquired || []);
    setNewSkillInput("");
    
    // Handle fieldOfStudy mapping - the database field is fieldOfStudy but we use field in the UI form
    const field = education.fieldOfStudy || "";
    
    // Update form values
    form.reset({
      ...education,
      // Convert string dates to Date objects if they exist
      startDate: education.startDate ? new Date(education.startDate) : undefined,
      endDate: education.endDate ? new Date(education.endDate) : undefined,
      // Ensure skillsAcquired is an array and field is properly mapped
      skillsAcquired: education.skillsAcquired || [],
      field: field,
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
      skillsAcquired: [],
      industry: "",
      domain: "",
    });
    setSkillsAcquired([]);
    setNewSkillInput("");
    setOpenDialog(true);
  };
  
  // Convert location data to combobox format
  const locationOptions = popularLocations.map((location, index) => ({
    value: location,
    label: location,
    key: `location-${index}`, // Add unique key based on index
  }));
  
  // Convert industry data to combobox format with unique keys
  const industryOptions = INDUSTRIES.map((industry, index) => ({
    value: industry,
    label: industry,
    key: `industry-${index}`,
  }));
  
  // We're now using the global formatDate from @/lib/utils
  
  // Convert domains to combobox format with unique keys
  const domainOptionsFormatted = domainOptions.map((value, index) => ({
    value,
    label: value,
    key: `domain-${index}`,
  }));
  
  // Convert degrees to combobox format with unique keys
  const degreeOptions = DEGREES.map((degree, index) => ({
    value: degree,
    label: degree,
    key: `degree-${index}`,
  }));
  
  return (
    <div className="mb-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">Academic Background</h2>
          <p className="text-sm text-gray-300">Add your academic journey</p>
        </div>
        <button
          className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
          onClick={handleAddEducation}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Education</span>
        </button>
      </div>
      
      <div className="p-1">
        {isLoading ? (
          // Loading skeleton with improved components
          <div className="space-y-4">
            <ExperienceItemSkeleton />
            <ExperienceItemSkeleton />
          </div>
        ) : educations.length === 0 ? (
          // Empty state
          <div className="py-6 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-gray-400/50" />
            <p className="mt-2 text-gray-400">No academic background added yet.</p>
          </div>
        ) : (
          // Education list
          <div className="space-y-4">
            {educations.map((education, index) => (
              <div key={education.id || index} className="neo-glass-card p-4 rounded-lg transition-all hover:translate-y-[-3px]">
                <div className="mb-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-gray-300 flex-shrink-0" />
                      <h3 className="font-medium text-lg text-white">{education.institution}</h3>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800/50" 
                        onClick={() => handleEditEducation(education)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => education.id && deleteEducationMutation.mutate(education.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 ml-7">
                    {education.degree}{education.fieldOfStudy ? `, ${education.fieldOfStudy}` : ""}
                  </p>
                  
                  <div className="flex flex-wrap gap-y-1 gap-x-4 mt-1 text-sm ml-7">
                    {education.location && (
                      <span className="flex items-center text-gray-300">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        {education.location}
                      </span>
                    )}
                    <span className="flex items-center text-gray-300">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      {formatDate(education.startDate)} - {education.currentlyEnrolled 
                        ? "Present" 
                        : formatDate(education.endDate)}
                    </span>
                  </div>
                  
                  {(education.industry || education.domain) && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-7">
                      {education.industry && (
                        <Badge className="neo-glass-badge flex items-center">
                          {education.industry}
                        </Badge>
                      )}
                      {education.domain && (
                        <Badge className="neo-glass-badge flex items-center">
                          {education.domain}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {education.skillsAcquired && education.skillsAcquired.length > 0 && (
                    <div className="mt-2 ml-7">
                      <h4 className="text-xs font-medium text-white mb-1">Skills & Achievements</h4>
                      <ul className="list-disc pl-4 text-sm space-y-1 text-gray-300">
                        {education.skillsAcquired.map((skill, i) => (
                          <li key={i}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {index < educations.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Education dialog for adding/editing */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {editingEducation ? "Edit Academic Background" : "Add Academic Background"}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {editingEducation 
                ? "Update your academic background information below." 
                : "Add your academic background information below."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
          }}>
            <div className="py-5">
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Institution */}
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Institution
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Harvard University" {...field} className="neo-glass-input" />
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
                    <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Degree
                    </FormLabel>
                    <FormControl>
                      <DegreeCombobox
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Type or select a degree"
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
                    <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Industry
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedIndustry(value);
                        }}
                      >
                        <SelectTrigger className="neo-glass-input">
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((option) => (
                            <SelectItem key={option.key} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Field of Study
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} className="neo-glass-input" />
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
                    <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="neo-glass-input">
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationOptions.map((option) => (
                            <SelectItem key={option.key} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Domain - only show if industry is selected */}
              {selectedIndustry && (
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Domain
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDomain(value);
                          }}
                        >
                          <SelectTrigger className="neo-glass-input">
                            <SelectValue placeholder="Select a domain" />
                          </SelectTrigger>
                          <SelectContent>
                            {domainOptionsFormatted.map((option) => (
                              <SelectItem key={option.key} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Start Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "neo-glass-input w-full justify-start text-left font-normal h-12",
                                !field.value && "text-white/50"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                "Select start date"
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            fromYear={1950}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* End Date (hidden if currently enrolled) */}
                {!form.watch("currentlyEnrolled") && (
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          End Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "neo-glass-input w-full justify-start text-left font-normal h-12",
                                  !field.value && "text-white/50"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  "Select end date"
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              fromYear={1950}
                              toYear={2030}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Currently Enrolled */}
              <FormField
                control={form.control}
                name="currentlyEnrolled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between neo-glass-card p-4">
                    <div className="space-y-1">
                      <FormLabel className="text-white font-medium text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Currently Enrolled
                      </FormLabel>
                      <FormDescription className="text-white/70 text-xs">
                        Are you currently studying at this institution?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("endDate", undefined, { shouldValidate: true });
                          }
                        }}
                        className="data-[state=checked]:bg-white/20 data-[state=unchecked]:bg-white/10"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Skills Acquired & Academic Achievements */}
              <FormField
                control={form.control}
                name="skillsAcquired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills Acquired & Academic Achievements</FormLabel>
                    <div className="space-y-4">
                      {/* Input for adding new skills */}
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input
                            placeholder="e.g., Statistical Analysis, Academic Scholarship"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            if (newSkillInput.trim()) {
                              const updatedSkills = [...field.value, newSkillInput.trim()];
                              field.onChange(updatedSkills);
                              setSkillsAcquired(updatedSkills);
                              setNewSkillInput("");
                            }
                          }}
                          disabled={!newSkillInput.trim() || field.value.length >= 10}
                        >
                          Add
                        </Button>
                      </div>

                      {/* List of added skills */}
                      {field.value.length > 0 ? (
                        <div className="border rounded-md p-3">
                          <ul className="space-y-2">
                            {field.value.map((skill, index) => (
                              <li key={index} className="flex items-center justify-between group">
                                <div className="flex items-start">
                                  <BookOpen className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm">{skill}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const updatedSkills = field.value.filter((_, i) => i !== index);
                                    field.onChange(updatedSkills);
                                    setSkillsAcquired(updatedSkills);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-3 border border-dashed rounded-md">
                          No skills or achievements added yet
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Add up to 10 skills or achievements (e.g., "Data Analysis", "Academic Scholarship")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <button 
                  type="submit" 
                  className="neo-glass-button"
                  disabled={createEducationMutation.isPending || updateEducationMutation.isPending}
                >
                  {editingEducation ? "Update" : "Add"} Academic Background
                </button>
              </DialogFooter>
            </form>
          </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}