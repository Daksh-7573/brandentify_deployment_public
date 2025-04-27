import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
// Removed Sidebar import, using top navigation only
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import WorkExperience from "@/components/profile/work-experience";
import Education from "@/components/profile/education";
import Skills from "@/components/profile/skills";
import Projects from "@/components/profile/projects";
import Services from "@/components/profile/services";
import PersonalInfoSection from "@/components/profile/personal-info-section";
import EditPersonalInfo from "@/components/profile/edit-personal-info";
import MuskButton from "@/components/musk/musk-button";
import { ProfilePageSkeleton } from "@/components/ui/skeleton-loaders";
// Removed Resume and LinkedIn import components
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { Camera, FileText, Edit } from "lucide-react";
import PersonalInfoIcon from "@/components/icons/personal-info-icon";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { ProfilePictureDialog } from "@/components/profile/profile-picture-dialog";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";

// Define "I am looking for" categories
const LOOKING_FOR_CATEGORIES = [
  // Career & Job Seeking category
  { value: "job_opportunities", label: "💼 Job Opportunities" },
  { value: "job_seekers", label: "💼 Job Seekers / Candidates" },
  { value: "internships", label: "💼 Internships" },
  { value: "interns", label: "💼 Interns" },
  { value: "mentors", label: "💼 Career Mentors" },
  { value: "mentees", label: "💼 Career Mentees" },
  
  // Business & Investment category  
  { value: "investors", label: "🚀 Investors" },
  { value: "startups", label: "🚀 Startups" },
  { value: "co_founders", label: "🚀 Co-Founders" },
  { value: "business_partners", label: "🚀 Business Partners" },
  { value: "advisors", label: "🚀 Legal/Financial Advisors" },
  { value: "tech_partners", label: "🚀 Technical Partners" },
  
  // Learning & Upskilling category
  { value: "skill_trainers", label: "🎓 Skill Trainers" },
  { value: "learners", label: "🎓 Students/Learners" },
  { value: "study_groups", label: "🎓 Study Groups" },
  
  // Networking & Collaborations category
  { value: "industry_experts", label: "🤝 Industry Experts" },
  { value: "share_expertise", label: "🤝 Sharing My Expertise" },
  
  // Freelance & Side Hustle category
  { value: "freelance_gigs", label: "💰 Freelance Gigs" },
  { value: "hiring_freelancers", label: "💰 Hiring Freelancers" },
];

// Define interface for the industry domains map
interface IndustryDomainMap {
  [key: string]: string[];
}

// Define common industries with their domains
export const INDUSTRY_DOMAINS: IndustryDomainMap = {
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
export const INDUSTRIES = [
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

export default function Profile() {
  const { user, isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get user ID from authenticated user object
  // Use the Firebase UID directly, the backend will handle the conversion
  const userId = user?.uid || null;
  
  // State for edit dialogs
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [showEditPersonalInfo, setShowEditPersonalInfo] = useState(false);
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  
  // Profile picture update mutation
  const profilePictureMutation = useProfilePicture(userId);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    jobLevel: '',
    location: '',
    industry: '',
    domain: '',
    lookingFor: '',
    aboutMe: '',
    whatIOffer: ''
  });
  
  // Also fetch current user data for the profile
  // FIXED: Use a consistent queryKey without timestamp to work with invalidation
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUserData } = useQuery<any>({
    queryKey: ['/api/users', userId], // Removed timestamp for consistent cache key
    enabled: !!userId && isAuthenticated,
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 30000, // Cache for 30 seconds
    refetchOnMount: "always", // Always refetch on mount
    refetchOnWindowFocus: true,
    retry: 5, // Increase retries for better reliability
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff with max 10s
    refetchInterval: 0, // Don't poll automatically
    queryFn: async () => {
      try {
        console.log(`Forcing fresh fetch of user data for ID: ${userId} at ${new Date().toLocaleTimeString()}`);
        // Add cache busting parameter to prevent browser caching
        const timestamp = new Date().getTime();
        
        // Try direct fetch first with more detailed error handling
        try {
          // Use server-side cache busting parameter
          const directUrl = `/api/users/${userId}?_=${timestamp}`;
          console.log(`Attempting direct fetch of user data from: ${directUrl}`);
          
          const response = await fetch(directUrl);
          
          if (!response.ok) {
            console.error(`Direct fetch failed with status: ${response.status}`);
            throw new Error(`Direct fetch failed: ${response.statusText}`);
          }
          
          // IMPORTANT: Clone the response before parsing to avoid "body already read" errors
          // if we need to retry with alternative methods
          const responseClone = response.clone();
          
          try {
            const freshData = await response.json();
            console.log("Fresh user data fetched:", freshData);
            console.log("whatIOffer field from fresh data:", freshData.whatIOffer || 'NOT FOUND');
            
            return freshData;
          } catch (parseError) {
            console.error("Failed to parse JSON from direct fetch:", parseError);
            
            // Try to get the raw text to see if it's valid
            try {
              const rawText = await responseClone.text();
              console.error("Raw response text:", rawText);
            } catch (textError) {
              console.error("Failed to get raw response text:", textError);
            }
          }
        } catch (directFetchError) {
          console.error("Direct fetch attempt failed:", directFetchError);
        }
        
        // If direct fetch fails or returns invalid data, try the API request function
        try {
          const response = await apiRequest('GET', `/api/users/${userId}?_=${timestamp}`);
          
          if (response && typeof response === 'object') {
            console.log("API request user data fetched:", response);
            console.log("whatIOffer field from API request:", response.whatIOffer || 'NOT FOUND');
            return response;
          } else {
            console.error("Invalid response from API request:", response);
          }
        } catch (apiError) {
          console.error("API request failed:", apiError);
          
          // Final fallback - try to use any existing data in the cache
          const existingData = queryClient.getQueryData(['/api/users', userId]);
          if (existingData) {
            console.log("Using existing cached data:", existingData);
            return existingData;
          }
        }
        
        // If all attempts fail, return an empty object to prevent crashes
        return {};
      } catch (error) {
        console.error("User data fetch error:", error);
        throw error;
      }
    }
  });

  // This effect runs when we return from profile editing via a browser reload
  useEffect(() => {
    // Check for edit completion timestamp in URL
    const urlParams = new URLSearchParams(window.location.search);
    const editTimestamp = urlParams.get('edit_complete');
    
    if (editTimestamp) {
      console.log(`Detected return from profile editing (timestamp: ${new Date(parseInt(editTimestamp)).toLocaleTimeString()}) - executing enhanced refresh procedure`);
      
      // Clear the query param without changing the rest of the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Force a refetch of user data
      refetchUserData();
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
        variant: "default",
      });
    }
  }, []);
  
  // Update local form state when user data is fetched
  useEffect(() => {
    if (userData) {
      // Initialize selectedIndustry and selectedDomain based on userData
      if (userData.industry) {
        setSelectedIndustry(userData.industry);
        
        // Initialize domain if the industry exists and has a matching domain
        if (userData.domain && INDUSTRY_DOMAINS[userData.industry]) {
          // Check if the domain is valid for the industry
          if (INDUSTRY_DOMAINS[userData.industry].includes(userData.domain)) {
            setSelectedDomain(userData.domain);
          }
        }
      }
      
      // Update form data
      setFormData({
        name: userData.name || '',
        title: userData.title || '',
        jobLevel: userData.jobLevel || '',
        location: userData.location || '',
        industry: userData.industry || '',
        domain: userData.domain || '',
        lookingFor: userData.lookingFor || '',
        aboutMe: userData.aboutMe || '',
        whatIOffer: userData.whatIOffer || ''
      });
    }
  }, [userData]);
  
  // State for profile sidebar
  const [showAboutMeEdit, setShowAboutMeEdit] = useState(false);
  const [showWhatIOfferEdit, setShowWhatIOfferEdit] = useState(false);
  const [aboutMeText, setAboutMeText] = useState('');
  const [whatIOfferText, setWhatIOfferText] = useState('');
  
  // Handle showing the about me edit dialog
  const handleShowAboutMeEdit = () => {
    setAboutMeText(userData?.aboutMe || '');
    setShowAboutMeEdit(true);
  };
  
  // Handle showing the what I offer edit dialog
  const handleShowWhatIOfferEdit = () => {
    setWhatIOfferText(userData?.whatIOffer || '');
    setShowWhatIOfferEdit(true);
  };
  
  // Save about me text
  const saveAboutMe = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const response = await apiRequest('PATCH', `/api/users/${userId}`, {
        aboutMe: aboutMeText
      });
      
      if (response) {
        // Update the userData in the query cache
        queryClient.setQueryData(['/api/users', userId], {
          ...userData,
          aboutMe: aboutMeText
        });
        
        toast({
          title: "About Me updated",
          description: "Your profile has been successfully updated",
          variant: "default",
        });
        
        setShowAboutMeEdit(false);
      }
    } catch (error) {
      console.error("Failed to update About Me:", error);
      
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Save what I offer text
  const saveWhatIOffer = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const response = await apiRequest('PATCH', `/api/users/${userId}`, {
        whatIOffer: whatIOfferText
      });
      
      if (response) {
        // Update the userData in the query cache
        queryClient.setQueryData(['/api/users', userId], {
          ...userData,
          whatIOffer: whatIOfferText
        });
        
        toast({
          title: "What I Offer updated",
          description: "Your profile has been successfully updated",
          variant: "default",
        });
        
        setShowWhatIOfferEdit(false);
      }
    } catch (error) {
      console.error("Failed to update What I Offer:", error);
      
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Find the domain values for the current industry
  const availableDomains = selectedIndustry ? INDUSTRY_DOMAINS[selectedIndustry] || [] : [];
  
  // Handler for industry change
  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    setSelectedDomain(''); // Reset domain when industry changes
  };
  
  // Helper function to get user's numeric ID for APIs that require it
  const userNumericId = userData?.id || null;
  
  // Calculate profile completion percentage
  const profileCompletionPercentage = userData ? calculateOverallProfileCompletion(userData) : 0;
  
  // Helper function to find the label for a looking for category
  const getLookingForLabel = (value: string) => {
    const category = LOOKING_FOR_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };
  
  // Basic info update mutation
  const updateBasicInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      return apiRequest('PATCH', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your basic information has been successfully updated",
        variant: "default",
      });
      
      // Close dialog
      setShowEditBasicInfo(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Personal info update mutation
  const updatePersonalInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      return apiRequest('PATCH', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your personal information has been successfully updated",
        variant: "default",
      });
      
      // Close dialog
      setShowEditPersonalInfo(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission for basic info
  const handleBasicInfoSubmit = (data: any) => {
    updateBasicInfoMutation.mutate({
      title: data.title,
      jobLevel: data.jobLevel,
      location: data.location,
      industry: data.industry,
      domain: data.domain
    });
  };
  
  // Handle form submission for personal info
  const handlePersonalInfoSubmit = (data: any) => {
    updatePersonalInfoMutation.mutate({
      name: data.name,
      lookingFor: data.lookingFor,
      aboutMe: data.aboutMe
    });
  };
  
  // Check for loading state
  const isLoading = isAuthLoading || isLoadingUser;
  
  // If user is not authenticated or data is loading, show loading state
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }
  
  // If user is not authenticated and not loading, redirect to login
  if (!isAuthenticated && !isLoading) {
    setLocation("/login");
    return null;
  }
  
  return (
    <div className="flex h-screen flex-col relative">
      {/* Main Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-y-auto bg-gray-50 relative">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <p className="text-gray-600">
              Manage your profile information and enhance your professional presence
            </p>
          </div>
          
          {/* Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="mb-6">
                <CardContent className="py-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {userData?.photoURL ? (
                          <img 
                            src={userData.photoURL} 
                            alt={userData.name || 'Profile picture'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-3xl font-semibold">
                            {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      
                      {/* Photo upload button with circular background */}
                      <div 
                        className="absolute bottom-1 right-1 rounded-full p-2 bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors"
                        onClick={() => setShowProfilePictureDialog(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold">{userData?.name || 'Your Name'}</h3>
                    <p className="text-gray-600">{userData?.title || 'Your Title'}</p>
                    
                    {/* Social/Contact Icons */}
                    <div className="flex space-x-2 mt-2">
                      {/* Email icon */}
                      {userData?.email && (
                        <a href={`mailto:${userData.email}`} className="text-gray-500 hover:text-indigo-600 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* About Me section */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900">About Me</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-gray-500 hover:text-indigo-600" 
                        onClick={handleShowAboutMeEdit}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {userData?.aboutMe || 'Add a brief description about yourself...'}
                    </p>
                  </div>
                  
                  {/* Edit Button */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setShowEditBasicInfo(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion Card */}
              <Card className="mb-6">
                <CardContent className="py-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Profile Completion</h3>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${profileCompletionPercentage}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-4">
                    {profileCompletionPercentage}% Complete
                  </p>
                  
                  {/* Completion tips */}
                  <div className="space-y-2">
                    {!userData?.photoURL && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Add a profile photo
                      </div>
                    )}
                    
                    {!userData?.title && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Add your professional title
                      </div>
                    )}
                    
                    {!userData?.industry && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Set your industry
                      </div>
                    )}
                    
                    {!userData?.domain && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Add your domain expertise
                      </div>
                    )}
                    
                    {!userData?.lookingFor && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Set what you're looking for
                      </div>
                    )}
                    
                    {(!userData?.aboutMe || userData.aboutMe.length < 20) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                        Add more details to your bio
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Musk AI Button */}
              <div className="mb-6">
                <MuskButton />
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Info Section */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <PersonalInfoIcon className="h-8 w-8 text-indigo-600 mr-3" />
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowEditPersonalInfo(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.name || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Email */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.email || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Professional Title</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.title || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Job Level */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Job Level</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.jobLevel || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Location */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.location || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Industry */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.industry || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Domain */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Domain</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.domain || 'Not provided'}
                      </p>
                    </div>
                    
                    {/* Looking For */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Looking For</h3>
                      <p className="text-base font-normal text-gray-900">
                        {userData?.lookingFor ? getLookingForLabel(userData.lookingFor) : 'Not provided'}
                      </p>
                    </div>
                    
                    {/* What I Offer */}
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-medium text-gray-500">What I Offer</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-gray-500 hover:text-indigo-600" 
                          onClick={handleShowWhatIOfferEdit}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-base font-normal text-gray-900 whitespace-pre-wrap">
                        {userData?.whatIOffer || 'Not provided'}
                      </p>
                    </div>
                  

                </div>
                {/* Skills section removed */}
              </CardContent>
            </Card>
            
            {/* Personal Information Section moved to dedicated page */}
            
            {/* Profile Import Options section removed */}
            
            {/* Skills Section */}
            <Skills />
            
            {/* Services Section */}
            <Services />
            
            {/* Projects Section */}
            <Projects />
            
            {/* Work Experience Section */}
            <WorkExperience />
            
            {/* Education Section */}
            <Education />
          </div>
        </div>
      </div>
    </div>
      
      {/* Edit Basic Info Dialog */}
      <Dialog open={showEditBasicInfo} onOpenChange={setShowEditBasicInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Basic Information</DialogTitle>
          </DialogHeader>
          
          {/* Basic Info Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleBasicInfoSubmit(formData);
          }}>
            <div className="space-y-4 py-2">
              {/* Professional Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <JobTitleCombobox 
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              
              {/* Job Level */}
              <div className="space-y-2">
                <Label htmlFor="jobLevel">Job Level</Label>
                <Select 
                  value={formData.jobLevel} 
                  onValueChange={(value) => setFormData({ ...formData, jobLevel: value })}
                >
                  <SelectTrigger id="jobLevel">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry_level">Entry Level</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid_level">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="executive">C-Level Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              
              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={handleIndustryChange}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Domain (depends on industry selection) */}
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Select 
                  value={selectedDomain} 
                  onValueChange={(value) => setSelectedDomain(value)}
                  disabled={!selectedIndustry || availableDomains.length === 0}
                >
                  <SelectTrigger id="domain">
                    <SelectValue placeholder={!selectedIndustry ? "Select an industry first" : "Select a domain"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDomains.map((domain) => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditBasicInfo(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateBasicInfoMutation.isPending}
              >
                {updateBasicInfoMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Personal Info Dialog */}
      <Dialog open={showEditPersonalInfo} onOpenChange={setShowEditPersonalInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
          </DialogHeader>
          
          {/* Personal Info Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            handlePersonalInfoSubmit(formData);
          }}>
            <div className="space-y-4 py-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Smith"
                />
              </div>
              
              {/* Looking For */}
              <div className="space-y-2">
                <Label htmlFor="lookingFor">I am looking for</Label>
                <Select 
                  value={formData.lookingFor} 
                  onValueChange={(value) => setFormData({ ...formData, lookingFor: value })}
                >
                  <SelectTrigger id="lookingFor">
                    <SelectValue placeholder="Select what you're looking for" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Career & Job Seeking</SelectLabel>
                      <SelectItem value="job_opportunities">💼 Job Opportunities</SelectItem>
                      <SelectItem value="job_seekers">💼 Job Seekers / Candidates</SelectItem>
                      <SelectItem value="internships">💼 Internships</SelectItem>
                      <SelectItem value="interns">💼 Interns</SelectItem>
                      <SelectItem value="mentors">💼 Career Mentors</SelectItem>
                      <SelectItem value="mentees">💼 Career Mentees</SelectItem>
                    </SelectGroup>
                    
                    <SelectSeparator />
                    
                    <SelectGroup>
                      <SelectLabel>Business & Investment</SelectLabel>
                      <SelectItem value="investors">🚀 Investors</SelectItem>
                      <SelectItem value="startups">🚀 Startups</SelectItem>
                      <SelectItem value="co_founders">🚀 Co-Founders</SelectItem>
                      <SelectItem value="business_partners">🚀 Business Partners</SelectItem>
                      <SelectItem value="advisors">🚀 Legal/Financial Advisors</SelectItem>
                      <SelectItem value="tech_partners">🚀 Technical Partners</SelectItem>
                    </SelectGroup>
                    
                    <SelectSeparator />
                    
                    <SelectGroup>
                      <SelectLabel>Learning & Upskilling</SelectLabel>
                      <SelectItem value="skill_trainers">🎓 Skill Trainers</SelectItem>
                      <SelectItem value="learners">🎓 Students/Learners</SelectItem>
                      <SelectItem value="study_groups">🎓 Study Groups</SelectItem>
                    </SelectGroup>
                    
                    <SelectSeparator />
                    
                    <SelectGroup>
                      <SelectLabel>Networking & Collaborations</SelectLabel>
                      <SelectItem value="industry_experts">🤝 Industry Experts</SelectItem>
                      <SelectItem value="share_expertise">🤝 Sharing My Expertise</SelectItem>
                    </SelectGroup>
                    
                    <SelectSeparator />
                    
                    <SelectGroup>
                      <SelectLabel>Freelance & Side Hustle</SelectLabel>
                      <SelectItem value="freelance_gigs">💰 Freelance Gigs</SelectItem>
                      <SelectItem value="hiring_freelancers">💰 Hiring Freelancers</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea 
                  id="aboutMe" 
                  value={formData.aboutMe} 
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Tell others about yourself, your experience, and your interests"
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditPersonalInfo(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updatePersonalInfoMutation.isPending}
              >
                {updatePersonalInfoMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* About Me Edit Dialog */}
      <Dialog open={showAboutMeEdit} onOpenChange={setShowAboutMeEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit About Me</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              value={aboutMeText} 
              onChange={(e) => setAboutMeText(e.target.value)}
              placeholder="Tell others about yourself, your experience, and your interests"
              rows={8}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAboutMeEdit(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveAboutMe}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* What I Offer Edit Dialog */}
      <Dialog open={showWhatIOfferEdit} onOpenChange={setShowWhatIOfferEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit What I Offer</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              value={whatIOfferText} 
              onChange={(e) => setWhatIOfferText(e.target.value)}
              placeholder="Describe what services, expertise, or value you offer to others"
              rows={8}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowWhatIOfferEdit(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveWhatIOffer}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Profile Picture Dialog */}
      <ProfilePictureDialog 
        open={showProfilePictureDialog} 
        onOpenChange={setShowProfilePictureDialog} 
      />
      
      {/* Personal Info Edit Component (for full edit experience) */}
      <EditPersonalInfo 
        userData={userData} 
        userNumericId={userNumericId} 
      />
    </div>
  );
}