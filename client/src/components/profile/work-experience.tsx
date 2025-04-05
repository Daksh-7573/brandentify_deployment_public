import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, CalendarIcon, Building, MapPin, Briefcase, TagIcon, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { popularLocations } from "@/lib/location-data";
import { formatDate } from "@/lib/utils";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schema for work experience form
const workExperienceFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Job title is required" }),
  company: z.string().min(1, { message: "Company name is required" }),
  location: z.string().optional(),
  industry: z.string().min(1, { message: "Industry is required" }),
  domain: z.string().min(1, { message: "Domain is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional().nullable(),
  description: z.string().optional(),
  isCurrentlyWorking: z.boolean().default(false),
  userId: z.number()
});
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";


import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Define interface for the industry domains map
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
    "E-commerce Technology",
    "Enterprise Software",
    "Gaming & Entertainment",
    "Hardware & IoT",
    "Mobile Development",
    "Quantum Computing",
    "Robotics & Automation",
    "Software Development",
    "Web3 & Decentralized Tech",
  ],
  "Healthcare": [
    "Biotechnology",
    "Digital Health",
    "Healthcare IT",
    "Medical Devices",
    "Pharmaceuticals",
    "Research & Development",
    "Telemedicine",
    "Healthcare Services",
    "Mental Health",
    "Public Health",
  ],
  "Finance": [
    "Banking",
    "Financial Services",
    "FinTech",
    "Investment Management",
    "Insurance",
    "Wealth Management",
    "Payments & Transactions",
    "Cryptocurrency & DeFi",
    "Lending & Credit",
    "Regulatory Compliance",
  ],
  "Education": [
    "EdTech",
    "Higher Education",
    "K-12 Education",
    "Professional Development",
    "Online Learning",
    "Educational Content",
    "Tutoring & Coaching",
    "Educational Administration",
    "Research & Development",
  ],
  "Manufacturing": [
    "Advanced Manufacturing",
    "Automotive Manufacturing",
    "Chemical Manufacturing",
    "Electronics Manufacturing",
    "Food & Beverage Production",
    "Industrial Automation",
    "Textiles & Apparel",
    "Machinery & Equipment",
    "Quality Assurance",
    "Supply Chain Management",
  ],
  "Retail": [
    "E-commerce",
    "Brick & Mortar Retail",
    "Consumer Goods",
    "Fashion & Apparel",
    "Grocery & Food Retail",
    "Luxury Retail",
    "Retail Technology",
    "Omnichannel Retail",
    "Supply Chain & Logistics",
  ],
  "Media & Entertainment": [
    "Advertising",
    "Content Creation",
    "Digital Media",
    "Film & Television",
    "Gaming",
    "Music & Audio",
    "Publishing",
    "Social Media",
    "Sports & Recreation",
    "Streaming Services",
  ],
  "Construction": [
    "Architecture",
    "Construction Management",
    "Engineering",
    "Infrastructure Development",
    "Residential Construction",
    "Commercial Construction",
    "Sustainable Building",
    "Project Management",
    "Construction Technology",
  ],
  "Transportation": [
    "Automotive",
    "Aviation",
    "Logistics",
    "Maritime",
    "Public Transportation",
    "Ride-sharing & Mobility",
    "Transportation Technology",
    "Supply Chain",
    "Fleet Management",
  ],
  "Energy": [
    "Renewable Energy",
    "Oil & Gas",
    "Utilities",
    "Energy Storage",
    "Clean Technology",
    "Energy Efficiency",
    "Nuclear Energy",
    "Smart Grid",
    "Energy Management",
  ],
  "Hospitality": [
    "Accommodations",
    "Food & Beverage Service",
    "Travel & Tourism",
    "Event Management",
    "Hospitality Technology",
    "Cruises & Resorts",
    "Customer Experience",
    "Hospitality Management",
  ],
  "Agriculture": [
    "AgTech",
    "Crop Production",
    "Livestock",
    "Sustainable Agriculture",
    "Food Processing",
    "Forestry",
    "Aquaculture",
    "Agricultural Research",
    "Agricultural Supply Chain",
  ],
  "Telecommunications": [
    "Wireless Communications",
    "Network Infrastructure",
    "Telecom Services",
    "Internet Service Providers",
    "Telecom Equipment",
    "Mobile & Voice",
    "Data Services",
    "Satellite Communications",
    "5G & Next-Gen Networks",
  ],
  "Real Estate": [
    "Commercial Real Estate",
    "Residential Real Estate",
    "Property Management",
    "Real Estate Development",
    "Real Estate Technology",
    "Facilities Management",
    "Property Investment",
    "Real Estate Services",
  ],
  "Consulting": [
    "Management Consulting",
    "Technology Consulting",
    "Strategy Consulting",
    "Financial Advisory",
    "HR Consulting",
    "Business Transformation",
    "Digital Consulting",
    "Operations Consulting",
    "Industry-Specific Consulting",
  ],
  "Legal Services": [
    "Corporate Law",
    "Intellectual Property",
    "Litigation",
    "Legal Technology",
    "Compliance",
    "Criminal Law",
    "Family Law",
    "Environmental Law",
    "International Law",
  ],
  "Marketing & Advertising": [
    "Digital Marketing",
    "Content Marketing",
    "Social Media Marketing",
    "Brand Management",
    "Marketing Technology",
    "Advertising Technology",
    "Performance Marketing",
    "Creative Services",
    "Market Research",
  ],
  "Aerospace": [
    "Aircraft Manufacturing",
    "Space Technology",
    "Defense Aerospace",
    "Avionics",
    "Aerospace Engineering",
    "Unmanned Aerial Systems",
    "Space Exploration",
    "Satellite Systems",
    "Aviation Services",
  ],
  "Automotive": [
    "Vehicle Manufacturing",
    "Auto Parts & Components",
    "Electric Vehicles",
    "Autonomous Driving",
    "Automotive Technology",
    "Automotive Design",
    "Fleet Management",
    "Mobility Services",
    "Automotive Retail",
  ],
  "Biotechnology": [
    "Biopharmaceuticals",
    "Genomics",
    "Medical Biotechnology",
    "Agricultural Biotechnology",
    "Bioinformatics",
    "Biotech R&D",
    "Bioprocessing",
    "Molecular Diagnostics",
    "Synthetic Biology",
  ],
  "Nonprofit": [
    "Charitable Organizations",
    "Foundations",
    "Social Services",
    "Healthcare Nonprofits",
    "Educational Nonprofits",
    "Environmental Organizations",
    "Arts & Cultural Organizations",
    "Religious Organizations",
    "International Development",
  ],
  "Government": [
    "Federal Government",
    "State/Provincial Government",
    "Local Government",
    "Public Administration",
    "Public Policy",
    "Government Technology",
    "Defense & Security",
    "Public Services",
    "Government Relations",
  ],
  "Food & Beverage": [
    "Food Production",
    "Beverage Production",
    "Food Technology",
    "Restaurants & Catering",
    "Food Service",
    "Specialty Foods",
    "Functional Foods & Beverages",
    "Food Safety & Quality",
    "Food & Beverage Distribution",
  ],
  "Fashion": [
    "Apparel Manufacturing",
    "Fashion Retail",
    "Luxury Fashion",
    "Sustainable Fashion",
    "Fashion Technology",
    "Accessories & Footwear",
    "Textile Development",
    "Fashion Design",
    "Fashion Marketing",
  ],
  "Arts & Design": [
    "Graphic Design",
    "Industrial Design",
    "UX/UI Design",
    "Architecture",
    "Fine Arts",
    "Digital Arts",
    "Interior Design",
    "Design Technology",
    "Creative Services",
  ],
};

// Get list of main industries
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Construction",
  "Transportation",
  "Energy",
  "Hospitality",
  "Agriculture",
  "Telecommunications",
  "Real Estate",
  "Consulting",
  "Pharmaceuticals",
  "Legal Services",
  "Marketing & Advertising",
  "Aerospace",
  "Automotive",
  "Biotechnology",
  "Nonprofit",
  "Government",
  "Food & Beverage",
  "Fashion",
  "Arts & Design",
];

export default function WorkExperience() {
  const { user, isDemoMode } = useAuth();
  const { toast } = useToast();
  
  // Get user ID (use demo ID if in demo mode)
  // We need the Firebase UID as is - it's a string and will be converted to numeric ID on the server
  const userId = isDemoMode ? 1 : (user?.uid || null);
  
  // Get user data from profile page
  const { data: userData } = useQuery<any>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  // Get the numeric user ID from the fetched user data
  const userNumericId = userData?.id || null;
  
  console.log("WorkExperience component - Using userNumericId:", userNumericId);
  
  // Form definition using useForm hook
  const form = useForm<z.infer<typeof workExperienceFormSchema>>({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues: {
      id: 0,
      title: "",
      company: "",
      location: "",
      industry: "",
      domain: "",
      description: "",
      isCurrentlyWorking: false,
      userId: userNumericId
    }
  });
  
  // Force a direct fetch every time the component renders
  useEffect(() => {
    async function directFetch() {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      console.log(`Work Experience - Directly fetching latest experiences data`, timestamp);
      try {
        // Use the numeric user ID for API requests
        const endpointUserId = userNumericId || (isDemoMode ? 1 : 0);
        console.log(`Work Experience - Fetching experiences with numeric userId: ${endpointUserId}`);
        
        const response = await fetch(`/api/users/${endpointUserId}/experiences?_=${timestamp}`, {
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        const freshData = await response.json();
        console.log("Work Experience - Got direct fetch data:", freshData);
        // Force update experiences data with the fetched data
        if (freshData && Array.isArray(freshData)) {
          setDirectExperiences([...freshData]);
          // Update the ref as well
          latestDataRef.current = [...freshData];
        }
      } catch (error) {
        console.error("Error during direct experience fetch:", error);
      }
    }
    
    directFetch();
    
    // Poll every second
    const intervalId = setInterval(directFetch, 1000);
    return () => clearInterval(intervalId);
  }, [userId, userNumericId, isDemoMode]);
  
  // Reference to hold the most recent data
  const latestDataRef = useRef<any[]>([]);
  
  // State for storing directly fetched experiences
  const [directExperiences, setDirectExperiences] = useState<any[]>([]);
  
  // State for the dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    company: '',
    location: '',
    industry: '',
    domain: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    description: '',
    userId: userNumericId || 0,
    isCurrentlyWorking: false
  });
  
  // State for location suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({
    title: false,
    company: false,
    industry: false,
    domain: false,
    startDate: false,
    endDate: false
  });
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      id: 0,
      title: '',
      company: '',
      location: '',
      industry: '',
      domain: '',
      startDate: undefined,
      endDate: undefined,
      description: '',
      userId: userNumericId || 0,
      isCurrentlyWorking: false
    });
    setFormErrors({
      title: false,
      company: false,
      industry: false,
      domain: false,
      startDate: false,
      endDate: false
    });
  };
  
  // Fetch user experiences - use numeric ID when available
  const endpointUserId = userNumericId || (isDemoMode ? 1 : 0);
  const { data: experiences = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${endpointUserId}/experiences`],
    enabled: !!endpointUserId,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Create experience mutation
  const createExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating work experience:", data);
      const res = await apiRequest('POST', '/api/experiences', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${endpointUserId}/experiences`] });
      toast({
        title: "Work experience added",
        description: "Your work experience has been added successfully",
      });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding work experience",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update experience mutation
  const updateExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Updating work experience:", data);
      const res = await apiRequest('PUT', `/api/experiences/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${endpointUserId}/experiences`] });
      toast({
        title: "Work experience updated",
        description: "Your work experience has been updated successfully",
      });
      setShowEditDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating work experience",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete experience mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting work experience:", id);
      const res = await apiRequest('DELETE', `/api/experiences/${id}`);
      
      // For 204 No Content responses, just return a success value without trying to parse JSON
      if (res.status === 204) {
        return { success: true };
      }
      
      // For other responses, try to parse JSON
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${endpointUserId}/experiences`] });
      toast({
        title: "Work experience deleted",
        description: "Your work experience has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting work experience",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // We're now using the global formatDate from @/lib/utils
  
  // Handle dialog visibility
  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };
  
  const openEditDialog = (experience: any) => {
    setEditId(experience.id);
    
    // Parse date strings into Date objects
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;
    
    if (experience.startDate) {
      startDate = new Date(experience.startDate);
    }
    
    // Check if end date is missing, which means "Currently working here" is true
    const isCurrentlyWorking = !experience.endDate;
    
    if (experience.endDate) {
      endDate = new Date(experience.endDate);
    }
    
    setFormData({
      ...experience,
      startDate,
      endDate,
      isCurrentlyWorking
    });
    
    setShowEditDialog(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
    
    // Handle location suggestions
    if (name === 'location' && value.trim()) {
      // Filter locations that match the input value
      const inputValue = value.toLowerCase();
      
      // First try exact matches (most relevant)
      let filtered = popularLocations.filter(location => 
        location.toLowerCase().includes(inputValue)
      );
      
      // If no exact matches or very few, try fuzzy matching for spelling variations
      if (filtered.length < 3) {
        // Try alternative spellings and common misspellings
        const alternativeMatches = popularLocations.filter(location => {
          const locationLower = location.toLowerCase();
          
          // Handle common spelling variations for major cities
          if (inputValue.includes('melb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('malb') && locationLower.includes('melbourne')) return true;
          if (inputValue.includes('syd') && locationLower.includes('sydney')) return true;
          if (inputValue.includes('bris') && locationLower.includes('brisbane')) return true;
          if (inputValue.includes('auck') && locationLower.includes('auckland')) return true;
          if (inputValue.includes('sing') && locationLower.includes('singapore')) return true;
          if (inputValue.includes('bangl') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('bengal') && locationLower.includes('bangalore')) return true;
          if (inputValue.includes('york') && locationLower.includes('new york')) return true;
          if (inputValue.includes('angeles') && locationLower.includes('los angeles')) return true;
          if (inputValue.includes('fran') && locationLower.includes('san francisco')) return true;
          if (inputValue.includes('tokyo') && locationLower.includes('tokyo')) return true;
          if (inputValue.includes('dubai') && locationLower.includes('dubai')) return true;
          
          return false;
        });
        
        // Combine both sets of results with exact matches first
        filtered = [...filtered, ...alternativeMatches];
      }
      
      setLocationSuggestions(filtered.slice(0, 10)); // Show up to 10 suggestions
    } else if (name === 'location' && !value.trim()) {
      setLocationSuggestions([]);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion
    }));
    setLocationSuggestions([]); // Clear suggestions after selection
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user selects
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
    
    // If industry changes, reset domain
    if (name === 'industry') {
      setFormData(prev => ({
        ...prev,
        domain: ''
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (name: string, value: Date | undefined) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };
      
      // If we're setting the start date and it's after the end date, clear the end date
      if (name === 'startDate' && updatedData.startDate && updatedData.endDate && updatedData.startDate > updatedData.endDate) {
        updatedData.endDate = undefined;
      }
      
      return updatedData;
    });
    
    // Clear validation error when user selects a date
    if (name in formErrors) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };
  
  // Handle form submission for adding experience
  const handleAddSubmit = () => {
    // Validate required fields
    const errors = {
      title: !formData.title,
      company: !formData.company,
      industry: !formData.industry,
      domain: !formData.domain,
      startDate: !formData.startDate,
      endDate: !formData.isCurrentlyWorking ? !formData.endDate : false
    };
    
    setFormErrors(errors);
    
    // Check if any required field is empty
    if (Object.values(errors).some(error => error)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check if end date is before start date
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after or equal to the start date",
        variant: "destructive",
      });
      return;
    }
    
    // Format dates to strings
    const payload = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.isCurrentlyWorking ? null : (formData.endDate ? formData.endDate.toISOString() : null)
    };
    
    createExperienceMutation.mutate(payload);
  };
  
  // Handle form submission for editing experience
  const handleEditSubmit = () => {
    // Validate required fields
    const errors = {
      title: !formData.title,
      company: !formData.company,
      industry: !formData.industry,
      domain: !formData.domain,
      startDate: !formData.startDate,
      endDate: !formData.isCurrentlyWorking ? !formData.endDate : false
    };
    
    setFormErrors(errors);
    
    // Check if any required field is empty
    if (Object.values(errors).some(error => error)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Check if end date is before start date
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after or equal to the start date",
        variant: "destructive",
      });
      return;
    }
    
    // Format dates to strings
    const payload = {
      ...formData,
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.isCurrentlyWorking ? null : (formData.endDate ? formData.endDate.toISOString() : null)
    };
    
    updateExperienceMutation.mutate(payload);
  };
  
  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this work experience?")) {
      deleteExperienceMutation.mutate(id);
    }
  };
  
  // For direct debugging
  useEffect(() => {
    const logData = () => {
      console.log("Work Experience - Directly fetching latest experiences data", Date.now());
      
      setTimeout(() => {
        console.log("Work Experience - Got direct fetch data:", experiences);
      }, 100);
    };
    
    logData();
    const intervalId = setInterval(logData, 1000);
    
    return () => clearInterval(intervalId);
  }, [experiences]);
  
  // Combine data sources for better reliability
  const displayExperiences = directExperiences.length > 0 
    ? directExperiences 
    : (latestDataRef.current.length > 0 
        ? latestDataRef.current 
        : experiences);
  
  // Sort experiences by date (newest first)
  const sortedExperiences = [...displayExperiences].sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Work Experience</CardTitle>
          <CardDescription>Add your professional experience</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1" 
          onClick={openAddDialog}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-6 w-6 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
          </div>
        ) : sortedExperiences.length === 0 ? (
          <div className="py-6 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No work experience added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExperiences.map((experience: any) => (
              <div key={experience.id} className="rounded-md border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{experience.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Building className="h-3.5 w-3.5 mr-1.5" />
                      {experience.company}
                      {experience.location && (
                        <>
                          <span className="mx-1">•</span>
                          <MapPin className="h-3.5 w-3.5 mr-1.5" />
                          {experience.location}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                      {formatDate(experience.startDate)} - 
                      {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {experience.industry && (
                        <Badge variant="outline" className="bg-gray-50 flex items-center">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {experience.industry}
                        </Badge>
                      )}
                      
                      {experience.domain && (
                        <Badge variant="outline" className="bg-gray-50 flex items-center">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {experience.domain}
                        </Badge>
                      )}
                    </div>
                    
                    {experience.description && (
                      <p className="mt-2 text-sm">{experience.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(experience)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Add Experience Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
            <DialogDescription>
              Add details about your work experience
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="mb-4 bg-blue-50 border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 font-medium">
              Industry and Domain fields are essential for accurate job matching and smart networking recommendations.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                Job Title <span className="text-red-500 ml-1">*</span>
              </Label>
              <JobTitleCombobox 
                value={formData.title}
                onChange={(value) => handleSelectChange('title', value)}
                disabled={createExperienceMutation.isPending}
                error={formErrors.title}
              />
              {formErrors.title && (
                <p className="text-sm text-red-500">Job title is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center">
                Company <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={createExperienceMutation.isPending}
                className={formErrors.company ? "border-red-500" : ""}
              />
              {formErrors.company && (
                <p className="text-sm text-red-500">Company is required</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center">
                  Industry <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                  disabled={createExperienceMutation.isPending}
                >
                  <SelectTrigger className={cn(formErrors.industry ? "border-red-500" : "", "bg-gray-50")}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.industry && (
                  <p className="text-sm text-red-500">Industry is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domain" className="flex items-center">
                  Domain <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) => handleSelectChange('domain', value)}
                  disabled={!formData.industry || createExperienceMutation.isPending}
                >
                  <SelectTrigger className={cn(formErrors.domain ? "border-red-500" : "", "bg-gray-50")}>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {formData.industry && INDUSTRY_DOMAINS[formData.industry]?.map(domain => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.domain && (
                  <p className="text-sm text-red-500">Domain is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={createExperienceMutation.isPending}
                placeholder="Enter location (optional)"
                className="bg-gray-50"
              />
              
              {/* Location suggestions dropdown */}
              {locationSuggestions.length > 0 && (
                <div className="absolute w-full mt-1 p-2 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="space-y-1">
                    {locationSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-2 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center">
                  Start Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                        formErrors.startDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? formatDate(formData.startDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange('startDate', date)}
                      disabled={createExperienceMutation.isPending}
                      fromYear={1980}
                      toYear={2035}
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">Start date is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center">
                  End Date {!formData.isCurrentlyWorking && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground",
                        formErrors.endDate && "border-red-500"
                      )}
                      disabled={formData.isCurrentlyWorking || createExperienceMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? formatDate(formData.endDate) : "Present"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange('endDate', date)}
                      disabled={formData.isCurrentlyWorking || createExperienceMutation.isPending}
                      fromYear={1980}
                      toYear={2035}
                    />
                  </PopoverContent>
                </Popover>
                <div className="h-5">
                  {formErrors.endDate && (
                    <p className="text-sm text-red-500">End date is required</p>
                  )}
                  {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
                    <p className="text-sm text-red-500">End date must be after start date</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox 
                    id="currentlyWorking"
                    checked={formData.isCurrentlyWorking}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        isCurrentlyWorking: checked === true,
                        // Clear end date if currently working
                        endDate: checked === true ? undefined : prev.endDate
                      }));
                      // Clear end date validation error if currently working
                      if (checked === true) {
                        setFormErrors(prev => ({
                          ...prev,
                          endDate: false
                        }));
                      }
                    }}
                    disabled={createExperienceMutation.isPending}
                  />
                  <Label
                    htmlFor="currentlyWorking"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I am currently working here
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={createExperienceMutation.isPending}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog(false)}
              disabled={createExperienceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubmit}
              disabled={createExperienceMutation.isPending}
            >
              {createExperienceMutation.isPending ? "Adding..." : "Add Experience"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Experience Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update details about your work experience
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="mb-4 bg-blue-50 border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700 font-medium">
              Industry and Domain fields are essential for accurate job matching and smart networking recommendations.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                Job Title <span className="text-red-500 ml-1">*</span>
              </Label>
              <JobTitleCombobox 
                value={formData.title}
                onChange={(value) => handleSelectChange('title', value)}
                disabled={updateExperienceMutation.isPending}
                error={formErrors.title}
              />
              {formErrors.title && (
                <p className="text-sm text-red-500">Job title is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center">
                Company <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={updateExperienceMutation.isPending}
                className={formErrors.company ? "border-red-500" : ""}
              />
              {formErrors.company && (
                <p className="text-sm text-red-500">Company is required</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center">
                  Industry <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                  disabled={updateExperienceMutation.isPending}
                >
                  <SelectTrigger className={cn(formErrors.industry ? "border-red-500" : "", "bg-gray-50")}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.industry && (
                  <p className="text-sm text-red-500">Industry is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domain" className="flex items-center">
                  Domain <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) => handleSelectChange('domain', value)}
                  disabled={!formData.industry || updateExperienceMutation.isPending}
                >
                  <SelectTrigger className={cn(formErrors.domain ? "border-red-500" : "", "bg-gray-50")}>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {formData.industry && INDUSTRY_DOMAINS[formData.industry]?.map(domain => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.domain && (
                  <p className="text-sm text-red-500">Domain is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={updateExperienceMutation.isPending}
                placeholder="Enter location (optional)"
                className="bg-gray-50"
              />
              
              {/* Location suggestions dropdown */}
              {locationSuggestions.length > 0 && (
                <div className="absolute w-full mt-1 p-2 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="space-y-1">
                    {locationSuggestions.map((suggestion) => (
                      <div
                        key={suggestion}
                        className="px-2 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center">
                  Start Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                        formErrors.startDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? formatDate(formData.startDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange('startDate', date)}
                      disabled={updateExperienceMutation.isPending}
                      fromYear={1980}
                      toYear={2035}
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">Start date is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center">
                  End Date {!formData.isCurrentlyWorking && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground",
                        formErrors.endDate && "border-red-500"
                      )}
                      disabled={formData.isCurrentlyWorking || updateExperienceMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? formatDate(formData.endDate) : "Present"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => handleDateChange('endDate', date)}
                      disabled={formData.isCurrentlyWorking || updateExperienceMutation.isPending}
                      fromYear={1980}
                      toYear={2035}
                    />
                  </PopoverContent>
                </Popover>
                <div className="h-5">
                  {formErrors.endDate && (
                    <p className="text-sm text-red-500">End date is required</p>
                  )}
                  {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
                    <p className="text-sm text-red-500">End date must be after start date</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Checkbox 
                    id="currentlyWorkingEdit"
                    checked={formData.isCurrentlyWorking}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        isCurrentlyWorking: checked === true,
                        // Clear end date if currently working
                        endDate: checked === true ? undefined : prev.endDate
                      }));
                      // Clear end date validation error if currently working
                      if (checked === true) {
                        setFormErrors(prev => ({
                          ...prev,
                          endDate: false
                        }));
                      }
                    }}
                    disabled={updateExperienceMutation.isPending}
                  />
                  <Label
                    htmlFor="currentlyWorkingEdit"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I am currently working here
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={updateExperienceMutation.isPending}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={updateExperienceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={updateExperienceMutation.isPending}
            >
              {updateExperienceMutation.isPending ? "Updating..." : "Update Experience"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
