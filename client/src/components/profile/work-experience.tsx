import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, CalendarIcon, Building, MapPin, Briefcase, TagIcon, AlertCircle, X } from "lucide-react";
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
  keyResponsibilities: z.array(z.string()).max(10, { message: "Maximum 10 items allowed" }).optional().default([]),
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
import { ExperienceItemSkeleton } from "@/components/ui/skeleton-loaders";

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
  
  // Get the numeric user ID from the fetched user data OR directly from the auth context
  // This ensures we have a numeric ID even before the userData query completes
  const userNumericId = userData?.id || user?.id || 2;
  
  console.log("WorkExperience component - Using userNumericId:", userNumericId, "Firebase UID:", userId);
  
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
      keyResponsibilities: [],
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
    keyResponsibilities: [] as string[],
    userId: userNumericId || 0,
    isCurrentlyWorking: false
  });
  
  // Update the userId in formData whenever userNumericId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userId: userNumericId || 0
    }));
  }, [userNumericId]);
  
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
  
  // State for new responsibility input
  const [newResponsibilityInput, setNewResponsibilityInput] = useState('');
  const [editResponsibilityInput, setEditResponsibilityInput] = useState('');
  
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
      keyResponsibilities: [],
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
    // Reset responsibility inputs
    setNewResponsibilityInput('');
    setEditResponsibilityInput('');
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
      const res = await apiRequest({
        method: 'POST', 
        url: '/api/experiences',
        data: data
      });
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
        description: error.message || "Failed to add work experience",
        variant: "destructive",
      });
    }
  });
  
  // Update experience mutation
  const updateExperienceMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Updating work experience:", data);
      
      // Ensure keyResponsibilities is properly formatted as an array for JSON
      if (data.keyResponsibilities && Array.isArray(data.keyResponsibilities)) {
        // Make sure it's a plain array of strings for proper JSON serialization
        data.keyResponsibilities = [...data.keyResponsibilities];
      } else if (!data.keyResponsibilities) {
        // If it's undefined or null, set to empty array
        data.keyResponsibilities = [];
      }
      
      console.log("Formatted work experience data:", data);
      
      const res = await apiRequest({
        method: 'PATCH', 
        url: `/api/experiences/${data.id}`,
        data: data
      });
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
        description: error.message || "Failed to update work experience",
        variant: "destructive",
      });
    }
  });
  
  // Delete experience mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting work experience:", id);
      await apiRequest({
        method: 'DELETE', 
        url: `/api/experiences/${id}`,
      });
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
        description: error.message || "Failed to delete work experience",
        variant: "destructive",
      });
    }
  });
  
  // We're now using the global formatDate from @/lib/utils
  
  // Convert location data to SelectItem format with unique keys
  const locationOptions = popularLocations.map((location, index) => ({
    value: location,
    label: location,
    key: `location-${index}`,
  }));
  
  // Convert industry data to SelectItem format with unique keys
  const industryOptions = INDUSTRIES.map((industry, index) => ({
    value: industry,
    label: industry,
    key: `industry-${index}`,
  }));
  
  // Function to create domain options with unique keys
  const getDomainOptionsForIndustry = (industry: string) => {
    if (!industry || !INDUSTRY_DOMAINS[industry]) return [];
    return INDUSTRY_DOMAINS[industry].map((domain, index) => ({
      value: domain,
      label: domain,
      key: `${industry}-domain-${index}`,
    }));
  };
  
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
    
    // Convert old description to keyResponsibilities array if needed
    let keyResponsibilities: string[] = [];
    if (experience.keyResponsibilities && Array.isArray(experience.keyResponsibilities)) {
      keyResponsibilities = experience.keyResponsibilities;
    } else if (experience.description && typeof experience.description === 'string') {
      // If we have a legacy description but no keyResponsibilities,
      // add the description as the first item in the array
      if (experience.description.trim()) {
        keyResponsibilities = [experience.description];
      }
    }
    
    setFormData({
      ...experience,
      startDate,
      endDate,
      isCurrentlyWorking,
      keyResponsibilities
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
    
    // Format dates to strings and ensure we use the latest userNumericId
    const payload = {
      ...formData,
      userId: userNumericId, // Make sure we're always using the latest value
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.isCurrentlyWorking ? null : (formData.endDate ? formData.endDate.toISOString() : null)
    };
    
    console.log("Submitting work experience with userId:", userNumericId);
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
    
    // Format dates to strings and ensure we use the latest userNumericId
    const payload = {
      ...formData,
      userId: userNumericId, // Make sure we're always using the latest value
      startDate: formData.startDate ? formData.startDate.toISOString() : null,
      endDate: formData.isCurrentlyWorking ? null : (formData.endDate ? formData.endDate.toISOString() : null)
    };
    
    console.log("Updating work experience with userId:", userNumericId);
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
          <CardTitle className="text-xl font-bold">Career Path</CardTitle>
          <CardDescription>Add your professional experience</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={openAddDialog}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Experience
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <ExperienceItemSkeleton />
            <ExperienceItemSkeleton />
          </div>
        ) : sortedExperiences.length === 0 ? (
          <div className="py-6 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No career path added yet.</p>
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
                    
                    {/* Key Responsibilities Section */}
                    {experience.keyResponsibilities && Array.isArray(experience.keyResponsibilities) && experience.keyResponsibilities.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-1">Key Responsibilities:</h4>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          {experience.keyResponsibilities.map((responsibility: string, index: number) => (
                            <li key={index}>{responsibility}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(experience)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(experience.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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
        <DialogContent className="md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Career Path</DialogTitle>
            <DialogDescription>
              Add details about your professional experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                Job Title <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Software Engineer"
                value={formData.title}
                onChange={handleInputChange}
                className={cn(formErrors.title ? "border-red-500" : "", "bg-gray-50")}
                disabled={createExperienceMutation.isPending}
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
                placeholder="e.g. Acme Corporation"
                value={formData.company}
                onChange={handleInputChange}
                className={cn(formErrors.company ? "border-red-500" : "", "bg-gray-50")}
                disabled={createExperienceMutation.isPending}
              />
              {formErrors.company && (
                <p className="text-sm text-red-500">Company name is required</p>
              )}
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="location">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. New York, NY"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-gray-50"
                disabled={createExperienceMutation.isPending}
              />
              
              {/* Location suggestions */}
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border max-h-60 overflow-auto">
                  <ul className="py-1">
                    {locationSuggestions.map((suggestion, index) => (
                      <li 
                        key={`suggestion-${index}`}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
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
                      {industryOptions.map(option => (
                        <SelectItem key={option.key} value={option.value}>
                          {option.label}
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
                      {formData.industry && getDomainOptionsForIndustry(formData.industry).map(option => (
                        <SelectItem key={option.key} value={option.value}>
                          {option.label}
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
                        "justify-start text-left font-normal w-full",
                        formErrors.startDate ? "border-red-500" : "",
                        "bg-gray-50"
                      )}
                      disabled={createExperienceMutation.isPending}
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">Start date is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="endDate" className="flex items-center">
                    End Date {!formData.isCurrentlyWorking && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="flex items-center space-x-2 text-sm">
                    <Switch
                      id="current-job"
                      checked={formData.isCurrentlyWorking}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          isCurrentlyWorking: checked,
                          // Clear end date if currently working
                          endDate: checked ? undefined : prev.endDate
                        }));
                        // Clear validation error
                        setFormErrors(prev => ({
                          ...prev,
                          endDate: false
                        }));
                      }}
                      disabled={createExperienceMutation.isPending}
                    />
                    <Label htmlFor="current-job" className="cursor-pointer">Current job</Label>
                  </div>
                </div>
                
                {!formData.isCurrentlyWorking && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          formErrors.endDate ? "border-red-500" : "",
                          "bg-gray-50"
                        )}
                        disabled={createExperienceMutation.isPending || formData.isCurrentlyWorking}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? formatDate(formData.endDate) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        initialFocus
                        disabled={(date) => formData.startDate ? date < formData.startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                
                {formErrors.endDate && !formData.isCurrentlyWorking && (
                  <p className="text-sm text-red-500">End date is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keyResponsibilities">
                Key Responsibilities
              </Label>
              
              {/* Responsibilities list */}
              {formData.keyResponsibilities.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {formData.keyResponsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-center bg-gray-50 rounded-md p-2 text-sm">
                      <span className="flex-1">{responsibility}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            keyResponsibilities: prev.keyResponsibilities.filter((_, i) => i !== index)
                          }));
                        }}
                        disabled={createExperienceMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Add new responsibility */}
              <div className="flex space-x-2">
                <Input
                  id="newResponsibility"
                  name="newResponsibility"
                  placeholder="e.g. Led a team of 5 developers"
                  value={newResponsibilityInput}
                  onChange={(e) => setNewResponsibilityInput(e.target.value)}
                  className="bg-gray-50 flex-1"
                  disabled={createExperienceMutation.isPending || formData.keyResponsibilities.length >= 10}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newResponsibilityInput.trim()) {
                      e.preventDefault();
                      setFormData(prev => ({
                        ...prev,
                        keyResponsibilities: [...prev.keyResponsibilities, newResponsibilityInput.trim()]
                      }));
                      setNewResponsibilityInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!newResponsibilityInput.trim() || createExperienceMutation.isPending || formData.keyResponsibilities.length >= 10}
                  onClick={() => {
                    if (newResponsibilityInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        keyResponsibilities: [...prev.keyResponsibilities, newResponsibilityInput.trim()]
                      }));
                      setNewResponsibilityInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              
              {formData.keyResponsibilities.length >= 10 && (
                <p className="text-sm text-amber-600 flex items-center mt-1">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  Maximum of 10 responsibilities reached
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              disabled={createExperienceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddSubmit}
              disabled={createExperienceMutation.isPending}
            >
              {createExperienceMutation.isPending ? "Adding..." : "Add Career Path"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Experience Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Career Path</DialogTitle>
            <DialogDescription>
              Update details about your professional experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="flex items-center">
                Job Title <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="edit-title"
                name="title"
                placeholder="e.g. Software Engineer"
                value={formData.title}
                onChange={handleInputChange}
                className={cn(formErrors.title ? "border-red-500" : "", "bg-gray-50")}
                disabled={updateExperienceMutation.isPending}
              />
              {formErrors.title && (
                <p className="text-sm text-red-500">Job title is required</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-company" className="flex items-center">
                Company <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="edit-company"
                name="company"
                placeholder="e.g. Acme Corporation"
                value={formData.company}
                onChange={handleInputChange}
                className={cn(formErrors.company ? "border-red-500" : "", "bg-gray-50")}
                disabled={updateExperienceMutation.isPending}
              />
              {formErrors.company && (
                <p className="text-sm text-red-500">Company name is required</p>
              )}
            </div>
            
            <div className="space-y-2 relative">
              <Label htmlFor="edit-location">
                Location
              </Label>
              <Input
                id="edit-location"
                name="location"
                placeholder="e.g. New York, NY"
                value={formData.location}
                onChange={handleInputChange}
                className="bg-gray-50"
                disabled={updateExperienceMutation.isPending}
              />
              
              {/* Location suggestions */}
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border max-h-60 overflow-auto">
                  <ul className="py-1">
                    {locationSuggestions.map((suggestion, index) => (
                      <li 
                        key={`edit-suggestion-${index}`}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-industry" className="flex items-center">
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
                      {industryOptions.map(option => (
                        <SelectItem key={option.key} value={option.value}>
                          {option.label}
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
                <Label htmlFor="edit-domain" className="flex items-center">
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
                      {formData.industry && getDomainOptionsForIndustry(formData.industry).map(option => (
                        <SelectItem key={option.key} value={option.value}>
                          {option.label}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate" className="flex items-center">
                  Start Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full",
                        formErrors.startDate ? "border-red-500" : "",
                        "bg-gray-50"
                      )}
                      disabled={updateExperienceMutation.isPending}
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.startDate && (
                  <p className="text-sm text-red-500">Start date is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="edit-endDate" className="flex items-center">
                    End Date {!formData.isCurrentlyWorking && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="flex items-center space-x-2 text-sm">
                    <Switch
                      id="edit-current-job"
                      checked={formData.isCurrentlyWorking}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          isCurrentlyWorking: checked,
                          // Clear end date if currently working
                          endDate: checked ? undefined : prev.endDate
                        }));
                        // Clear validation error
                        setFormErrors(prev => ({
                          ...prev,
                          endDate: false
                        }));
                      }}
                      disabled={updateExperienceMutation.isPending}
                    />
                    <Label htmlFor="edit-current-job" className="cursor-pointer">Current job</Label>
                  </div>
                </div>
                
                {!formData.isCurrentlyWorking && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          formErrors.endDate ? "border-red-500" : "",
                          "bg-gray-50"
                        )}
                        disabled={updateExperienceMutation.isPending || formData.isCurrentlyWorking}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? formatDate(formData.endDate) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        initialFocus
                        disabled={(date) => formData.startDate ? date < formData.startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                
                {formErrors.endDate && !formData.isCurrentlyWorking && (
                  <p className="text-sm text-red-500">End date is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-keyResponsibilities">
                Key Responsibilities
              </Label>
              
              {/* Responsibilities list */}
              {formData.keyResponsibilities.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {formData.keyResponsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-center bg-gray-50 rounded-md p-2 text-sm">
                      <span className="flex-1">{responsibility}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            keyResponsibilities: prev.keyResponsibilities.filter((_, i) => i !== index)
                          }));
                        }}
                        disabled={updateExperienceMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Add new responsibility */}
              <div className="flex space-x-2">
                <Input
                  id="edit-newResponsibility"
                  name="editResponsibilityInput"
                  placeholder="e.g. Led a team of 5 developers"
                  value={editResponsibilityInput}
                  onChange={(e) => setEditResponsibilityInput(e.target.value)}
                  className="bg-gray-50 flex-1"
                  disabled={updateExperienceMutation.isPending || formData.keyResponsibilities.length >= 10}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editResponsibilityInput.trim()) {
                      e.preventDefault();
                      setFormData(prev => ({
                        ...prev,
                        keyResponsibilities: [...prev.keyResponsibilities, editResponsibilityInput.trim()]
                      }));
                      setEditResponsibilityInput('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!editResponsibilityInput.trim() || updateExperienceMutation.isPending || formData.keyResponsibilities.length >= 10}
                  onClick={() => {
                    if (editResponsibilityInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        keyResponsibilities: [...prev.keyResponsibilities, editResponsibilityInput.trim()]
                      }));
                      setEditResponsibilityInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              
              {formData.keyResponsibilities.length >= 10 && (
                <p className="text-sm text-amber-600 flex items-center mt-1">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  Maximum of 10 responsibilities reached
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                resetForm();
              }}
              disabled={updateExperienceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleEditSubmit}
              disabled={updateExperienceMutation.isPending}
            >
              {updateExperienceMutation.isPending ? "Updating..." : "Update Career Path"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
