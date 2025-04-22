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
// Removed Resume and LinkedIn import components
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { calculateOverallProfileCompletion } from "@/lib/profile-utils";
import { useState, useEffect } from "react";
import { Camera, FileText } from "lucide-react";
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
  const { user, isAuthenticated, isLoading, isDemoMode, signOut } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get user ID from authenticated user object
  // Use the Firebase UID directly, the backend will handle the conversion
  const userId = user?.uid || (isDemoMode ? 1 : null);
  
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
  
  // Also fetch current user data for the profile with enhanced caching control
  const { data: userData, isLoading: isLoadingUser, refetch: refetchUserData } = useQuery<any>({
    queryKey: [`/api/users/${userId}`, Date.now()], // Add timestamp to force fresh data
    enabled: !!userId && isAuthenticated,
    staleTime: 0, // Always consider data stale to ensure fresh data
    gcTime: 0, // Disable caching for profile data (gcTime is the v5 name for cacheTime)
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
        
        // First approach - direct fetch with cache control headers
        const directResponse = await fetch(`/api/users/${userId}?_=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (directResponse.ok) {
          const freshData = await directResponse.json();
          console.log("Fresh user data fetched:", freshData);
          
          // Check that we have a valid user object
          if (freshData && typeof freshData === 'object') {
            console.log("whatIOffer field value:", freshData.whatIOffer || 'NOT FOUND');
            
            // Store the fetched data in localStorage as well as a backup
            try {
              localStorage.setItem('cachedUserData', JSON.stringify(freshData));
              console.log("Cached user data in localStorage");
            } catch (err) {
              console.error("Failed to cache user data:", err);
            }
            
            return freshData;
          } else {
            console.error("Invalid user data received:", freshData);
          }
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
          
          // As a last resort, try to get data from localStorage
          try {
            const cachedData = localStorage.getItem('cachedUserData');
            if (cachedData) {
              const userData = JSON.parse(cachedData);
              console.log("Using cached user data from localStorage:", userData);
              return userData;
            }
          } catch (cacheError) {
            console.error("Failed to retrieve cached user data:", cacheError);
          }
        }
        
        // If all attempts fail, return an empty object to prevent crashes
        return {};
      } catch (error) {
        console.log("Retrying request (2 attempts left)...");
        throw error; // Let React Query handle the retry
      }
    }
  });
  
  // Define userNumericId based on the userData response
  // Critical: Don't use a fallback value like 0 as it might fetch wrong user's data
  const userNumericId = isDemoMode ? 1 : (userData?.id || null);
  
  // Enhanced refresh logic for profile update caching issues
  // This effect runs when we return from profile editing via a browser reload
  useEffect(() => {
    const justEdited = localStorage.getItem('justEditedProfile');
    const editTimestamp = localStorage.getItem('profileEditTimestamp');
    const redirectToProfile = localStorage.getItem('redirectToProfile');
    
    if (justEdited === 'true' && editTimestamp) {
      console.log(`Detected return from profile editing (timestamp: ${new Date(parseInt(editTimestamp)).toLocaleTimeString()}) - executing enhanced refresh procedure`);
      
      // Clear the flags to prevent continuous refresh
      localStorage.removeItem('justEditedProfile');
      localStorage.removeItem('redirectToProfile');
      
      // Check if we have whatIOffer stored in localStorage
      const storedWhatIOffer = localStorage.getItem('whatIOffer_saved');
      const storedWhatIOfferTimestamp = localStorage.getItem('whatIOffer_savedAt');
      let appliedCachedWhatIOffer = false;
      
      if (storedWhatIOffer && storedWhatIOfferTimestamp) {
        const timestamp = parseInt(storedWhatIOfferTimestamp);
        const timeAgo = Date.now() - timestamp;
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        if (timeAgo < FIVE_MINUTES) {
          console.log("Found recent cached whatIOffer value:", storedWhatIOffer);
          console.log(`Saved ${Math.round(timeAgo/1000)}s ago - applying to ensure consistency`);
          
          // Keep this value as a backup until we confirm it's properly saved in DB
          appliedCachedWhatIOffer = true;
          
          // Apply this backup directly to the form data
          setFormData(prev => ({
            ...prev,
            whatIOffer: storedWhatIOffer
          }));
          
          // Also directly attempt to save it using our direct API
          if (userNumericId) {
            try {
              console.log("Applying cached whatIOffer directly to ensure consistency");
              fetch(`/api/users/${userNumericId}/what-i-offer`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                },
                body: JSON.stringify({ 
                  whatIOffer: storedWhatIOffer,
                  _recovery: true 
                }),
              });
            } catch (error) {
              console.error("Error applying cached whatIOffer:", error);
            }
          }
        } else {
          console.log(`Found cached whatIOffer value but it's too old (${Math.round(timeAgo/60000)}min ago)`);
          localStorage.removeItem('whatIOffer_saved');
          localStorage.removeItem('whatIOffer_savedAt');
        }
      }
      
      // Clear other whatIOffer related flags
      localStorage.removeItem('whatIOffer_value');
      localStorage.removeItem('whatIOffer_pendingUpdate');
      
      // 1. First completely clear the React Query cache
      queryClient.clear();
      
      // 2. Force immediate data refetching with fresh timestamps
      const fetchFreshData = async () => {
        if (userNumericId) {
          console.log("Executing multi-stage refresh procedure for user ID:", userNumericId, 
                      appliedCachedWhatIOffer ? "(with cached whatIOffer backup)" : "");
          
          try {
            // Direct fetch with cache-busting timestamp
            const cacheBuster = Date.now();
            console.log("Forcing fresh fetch of user data for ID:", userNumericId);
            
            const response = await fetch(`/api/users/${userNumericId}?_cb=${cacheBuster}`, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            if (response.ok) {
              const freshData = await response.json();
              console.log("Fresh user data fetched:", freshData);
              console.log("whatIOffer field value:", freshData.whatIOffer);
              
              // Store the fetched data in localStorage as well as a backup
              try {
                localStorage.setItem('cachedUserData', JSON.stringify(freshData));
                console.log("Cached user data in localStorage");
              } catch (err) {
                console.error("Failed to cache user data in localStorage", err);
              }
              
              // Update the query cache with the fresh data
              queryClient.setQueryData([`/api/users/${userNumericId}`], freshData);
              
              // If we have a stored whatIOffer value from the edit page, verify it matches what we got from the server
              if (storedWhatIOffer && storedWhatIOffer !== freshData.whatIOffer) {
                console.warn("Mismatch between stored whatIOffer and server data:", {
                  stored: storedWhatIOffer,
                  server: freshData.whatIOffer
                });
              }
            } else {
              console.error("Failed to fetch fresh user data:", await response.text());
            }
          } catch (error) {
            console.error("Error fetching fresh user data:", error);
          }
        }
      };
      
      // Execute the multi-stage refresh procedure
      fetchFreshData();
      
      // 3. Also use the built-in React Query refetch methods
      setTimeout(() => {
        // Refetch everything through the standard mechanisms too
        console.log("Executing multi-query refetch operation");
        try {
          refetchUserData();
          refetchSkills();
          refetchExperiences();
          refetchProjects();
          refetchEducation();
          refetchServices();
          
          console.log("All refetch operations successfully triggered");
        } catch (refetchError) {
          console.error("Error in refetch operations:", refetchError);
        }
      }, 200);
    }
  }, [queryClient, userNumericId]);
  
  // Debug logging for userData
  useEffect(() => {
    console.log("Current userData:", userData);
    if (userData?.id) {
      console.log(`Using numeric user ID: ${userData.id} for data fetching`);
    }
  }, [userData]);
  
  // Special query for the dedicated "What I Offer" field using our special endpoint
  const { data: whatIOfferData } = useQuery({
    queryKey: ['/api/users', userNumericId, 'what-i-offer', Date.now()],
    queryFn: async () => {
      if (!userNumericId) return null;
      
      console.log("Fetching whatIOffer field with dedicated endpoint");
      try {
        // Use our dedicated endpoint to get just the whatIOffer field
        const response = await fetch(`/api/users/${userNumericId}/what-i-offer`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched whatIOffer with dedicated endpoint:", data);
          return data;
        } else {
          console.error("Dedicated whatIOffer endpoint failed:", response.status);
          return null;
        }
      } catch (error) {
        console.error("Error fetching whatIOffer with dedicated endpoint:", error);
        return null;
      }
    },
    enabled: !!userNumericId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always"
  });
  
  // Use the whatIOffer field from our special query if the main userData doesn't have it
  useEffect(() => {
    if (userData && whatIOfferData && whatIOfferData.whatIOffer) {
      // Only update if the main userData is missing the field or it's different
      if (!userData.whatIOffer || userData.whatIOffer !== whatIOfferData.whatIOffer) {
        console.log("Updating whatIOffer field from dedicated endpoint:", whatIOfferData.whatIOffer);
        
        // Create an updated user object with the correct whatIOffer field
        const updatedUserData = {
          ...userData,
          whatIOffer: whatIOfferData.whatIOffer
        };
        
        // Update the React Query cache
        queryClient.setQueryData([`/api/users/${userData.id}`], updatedUserData);
        queryClient.setQueryData([`/api/users/${userData.id}`, Date.now()], updatedUserData);
      }
    }
  }, [userData, whatIOfferData]);

  // Fetch user skills for the badges
  const { data: skills = [], isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery<any[]>({
    queryKey: [`/api/users/${userNumericId}/skills`],
    queryFn: async () => {
      if (!userNumericId) return [];
      const response = await apiRequest('GET', `/api/users/${userNumericId}/skills`);
      return response;
    },
    enabled: !!userNumericId && isAuthenticated,
    staleTime: 1000, // Consider data stale after 1 second to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Fetch user experiences for profile completion calculation
  const { data: experiences = [], isLoading: isLoadingExperiences, refetch: refetchExperiences } = useQuery<any[]>({
    queryKey: [`/api/users/${userNumericId}/experiences`],
    queryFn: async () => {
      if (!userNumericId) return [];
      try {
        const response = await apiRequest('GET', `/api/users/${userNumericId}/experiences`);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching experiences:", error);
        return [];
      }
    },
    enabled: !!userNumericId && isAuthenticated,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Fetch user educations for profile completion calculation
  const { data: educations = [], isLoading: isLoadingEducations, refetch: refetchEducation } = useQuery<any[]>({
    queryKey: [`/api/users/${userNumericId}/educations`],
    queryFn: async () => {
      if (!userNumericId) return [];
      try {
        const response = await apiRequest('GET', `/api/users/${userNumericId}/educations`);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching educations:", error);
        return [];
      }
    },
    enabled: !!userNumericId && isAuthenticated,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Fetch user projects for profile completion calculation
  const { data: projects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery<any[]>({
    queryKey: [`/api/users/${userNumericId}/projects`],
    queryFn: async () => {
      if (!userNumericId) return [];
      try {
        const response = await apiRequest('GET', `/api/users/${userNumericId}/projects`);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    },
    enabled: !!userNumericId && isAuthenticated,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Fetch user services for profile completion calculation
  const { data: services = [], isLoading: isLoadingServices, refetch: refetchServices } = useQuery<any[]>({
    queryKey: ['/api/users', userNumericId, 'services'],
    queryFn: async () => {
      if (!userNumericId) return [];
      try {
        const response = await apiRequest('GET', `/api/users/${userNumericId}/services`);
        // Ensure we always return an array
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    enabled: !!userNumericId && isAuthenticated,
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Mutation for updating user basic info
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PUT', `/api/users/${userId}`, data);
      return res;
    },
    onSuccess: async (data) => {
      console.log("Profile update mutation succeeded with data:", data);
      
      // Clear all caches to ensure fresh data
      queryClient.clear();
      
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      
      // Add a short delay to ensure the server has processed the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Manually refetch the user data
      refetchUserData();
      
      // Clear localStorage cache and update with fresh data
      try {
        localStorage.removeItem('cachedUserData');
        if (data) {
          localStorage.setItem('cachedUserData', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to update localStorage cache:", err);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully! Changes will appear shortly.",
      });
      
      setShowEditBasicInfo(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // List of popular cities for location suggestions
  const popularLocations = [
    // North America - USA
    "New York, NY, USA",
    "San Francisco, CA, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Seattle, WA, USA",
    "Austin, TX, USA",
    "Boston, MA, USA",
    "Denver, CO, USA",
    "Atlanta, GA, USA",
    "Portland, OR, USA",
    "Washington, DC, USA",
    "San Diego, CA, USA",
    "Miami, FL, USA",
    "Dallas, TX, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "Philadelphia, PA, USA",
    "Las Vegas, NV, USA",
    "Detroit, MI, USA",
    "Minneapolis, MN, USA",
    "Nashville, TN, USA",
    "Charlotte, NC, USA",
    "Raleigh, NC, USA",
    "Indianapolis, IN, USA",
    "Columbus, OH, USA",
    "Cleveland, OH, USA",
    "Pittsburgh, PA, USA",
    "Kansas City, MO, USA",
    "St. Louis, MO, USA",
    "Salt Lake City, UT, USA",
    "Orlando, FL, USA",
    "Tampa, FL, USA",
    "New Orleans, LA, USA",
    "Honolulu, HI, USA",
    "Anchorage, AK, USA",
    "San Jose, CA, USA",
    "Sacramento, CA, USA",
    "Oakland, CA, USA",
    "Cincinnati, OH, USA",
    "Buffalo, NY, USA",
    "Baltimore, MD, USA",
    "San Antonio, TX, USA",
    "Milwaukee, WI, USA",
    "Albuquerque, NM, USA",
    "Tucson, AZ, USA",
    "Fresno, CA, USA",
    "Long Beach, CA, USA",
    "Omaha, NE, USA",
    "Oklahoma City, OK, USA",
    "Louisville, KY, USA",
    "Memphis, TN, USA",
    "Tulsa, OK, USA",
    "Fort Worth, TX, USA",
    "El Paso, TX, USA",
    "Boise, ID, USA",
    "Richmond, VA, USA",
    "Birmingham, AL, USA",
    "Providence, RI, USA",
    "Jacksonville, FL, USA",
    "Albany, NY, USA",
    "Rochester, NY, USA",
    "Baton Rouge, LA, USA",
    "Des Moines, IA, USA",
    "Charleston, SC, USA",
    "Savannah, GA, USA",
    "Madison, WI, USA",
    "Boulder, CO, USA",
    "Ann Arbor, MI, USA",
    "Eugene, OR, USA",
    "Santa Fe, NM, USA",
    "Asheville, NC, USA",
    "Spokane, WA, USA",
    "Tacoma, WA, USA",
    // Canada
    "Toronto, Canada",
    "Vancouver, Canada",
    "Montreal, Canada",
    "Calgary, Canada",
    "Ottawa, Canada",
    "Edmonton, Canada",
    "Winnipeg, Canada",
    "Quebec City, Canada",
    "Hamilton, Canada",
    "Halifax, Canada",
    "Victoria, Canada",
    "London, Canada",
    "Kitchener, Canada",
    "Windsor, Canada",
    "Oshawa, Canada",
    "Saskatoon, Canada",
    "Regina, Canada",
    "St. John's, Canada",
    "Kelowna, Canada",
    "Abbotsford, Canada",
    "Kingston, Canada",
    "Guelph, Canada",
    "Barrie, Canada",
    "Moncton, Canada",
    "Thunder Bay, Canada",
    "Fredericton, Canada",
    "Sherbrooke, Canada",
    "Red Deer, Canada",
    "Sudbury, Canada",
    "Kamloops, Canada",
    "Chilliwack, Canada",
    "Niagara Falls, Canada",
    "Gatineau, Canada",
    "Lethbridge, Canada",
    "Saint John, Canada",
    "Nanaimo, Canada",
    "Burnaby, Canada",
    "Richmond, Canada",
    "Surrey, Canada",
    "Mississauga, Canada",
    "Brampton, Canada",
    "Markham, Canada",
    "Vaughan, Canada",
    "Burlington, Canada",
    "Oakville, Canada",
    "Richmond Hill, Canada",
    "Mexico City, Mexico",
    "Guadalajara, Mexico",
    "Monterrey, Mexico",
    "Cancun, Mexico",
    "Tijuana, Mexico",
    
    // Europe
    "London, UK",
    "Manchester, UK",
    "Edinburgh, UK",
    "Glasgow, UK",
    "Birmingham, UK",
    "Liverpool, UK",
    "Bristol, UK",
    "Leeds, UK",
    "Cardiff, UK",
    "Dublin, Ireland",
    "Cork, Ireland",
    "Galway, Ireland",
    "Paris, France",
    "Lyon, France",
    "Nice, France",
    "Marseille, France",
    "Bordeaux, France",
    "Toulouse, France",
    "Strasbourg, France",
    "Berlin, Germany",
    "Munich, Germany",
    "Hamburg, Germany",
    "Cologne, Germany",
    "Frankfurt, Germany",
    "Stuttgart, Germany",
    "Düsseldorf, Germany",
    "Dresden, Germany",
    "Leipzig, Germany",
    "Amsterdam, Netherlands",
    "Rotterdam, Netherlands",
    "Utrecht, Netherlands",
    "The Hague, Netherlands",
    "Eindhoven, Netherlands",
    "Madrid, Spain",
    "Barcelona, Spain",
    "Valencia, Spain",
    "Seville, Spain",
    "Malaga, Spain",
    "Bilbao, Spain",
    "Lisbon, Portugal",
    "Porto, Portugal",
    "Rome, Italy",
    "Milan, Italy",
    "Florence, Italy",
    "Naples, Italy",
    "Turin, Italy",
    "Bologna, Italy",
    "Venice, Italy",
    "Palermo, Italy",
    "Vienna, Austria",
    "Salzburg, Austria",
    "Innsbruck, Austria",
    "Graz, Austria",
    "Zurich, Switzerland",
    "Geneva, Switzerland",
    "Basel, Switzerland",
    "Bern, Switzerland",
    "Lausanne, Switzerland",
    "Brussels, Belgium",
    "Antwerp, Belgium",
    "Ghent, Belgium",
    "Bruges, Belgium",
    "Copenhagen, Denmark",
    "Aarhus, Denmark",
    "Odense, Denmark",
    "Oslo, Norway",
    "Bergen, Norway",
    "Trondheim, Norway",
    "Stockholm, Sweden",
    "Gothenburg, Sweden",
    "Malmö, Sweden",
    "Helsinki, Finland",
    "Tampere, Finland",
    "Turku, Finland",
    "Reykjavik, Iceland",
    "Prague, Czech Republic",
    "Brno, Czech Republic",
    "Warsaw, Poland",
    "Krakow, Poland",
    "Gdansk, Poland",
    "Wroclaw, Poland",
    "Poznan, Poland",
    "Budapest, Hungary",
    "Debrecen, Hungary",
    "Bratislava, Slovakia",
    "Ljubljana, Slovenia",
    "Zagreb, Croatia",
    "Split, Croatia",
    "Dubrovnik, Croatia",
    "Belgrade, Serbia",
    "Sarajevo, Bosnia and Herzegovina",
    "Skopje, North Macedonia",
    "Tirana, Albania",
    "Sofia, Bulgaria",
    "Bucharest, Romania",
    "Cluj-Napoca, Romania",
    "Athens, Greece",
    "Thessaloniki, Greece",
    "Heraklion, Greece",
    "Nicosia, Cyprus",
    "Valletta, Malta",
    "Tallinn, Estonia",
    "Riga, Latvia",
    "Vilnius, Lithuania",
    "Minsk, Belarus",
    "Kiev, Ukraine",
    "Lviv, Ukraine",
    "Odessa, Ukraine",
    "Moscow, Russia",
    "Saint Petersburg, Russia",
    "Kazan, Russia",
    "Yekaterinburg, Russia",
    
    // Asia - East Asia
    "Tokyo, Japan",
    "Osaka, Japan",
    "Kyoto, Japan",
    "Sapporo, Japan",
    "Fukuoka, Japan",
    "Nagoya, Japan",
    "Yokohama, Japan",
    "Kobe, Japan",
    "Hiroshima, Japan",
    "Nara, Japan",
    "Sendai, Japan",
    "Kawasaki, Japan",
    "Okinawa, Japan",
    "Seoul, South Korea",
    "Busan, South Korea",
    "Incheon, South Korea",
    "Daegu, South Korea",
    "Daejeon, South Korea",
    "Gwangju, South Korea",
    "Suwon, South Korea",
    "Ulsan, South Korea",
    "Jeju, South Korea",
    "Beijing, China",
    "Shanghai, China",
    "Guangzhou, China",
    "Shenzhen, China",
    "Chengdu, China",
    "Hangzhou, China",
    "Nanjing, China",
    "Wuhan, China",
    "Tianjin, China",
    "Xian, China",
    "Chongqing, China",
    "Suzhou, China",
    "Qingdao, China",
    "Dalian, China",
    "Xiamen, China",
    "Kunming, China",
    "Changsha, China",
    "Zhengzhou, China",
    "Hong Kong",
    "Macau",
    "Taipei, Taiwan",
    "Kaohsiung, Taiwan",
    "Taichung, Taiwan",
    "Tainan, Taiwan",
    "Hsinchu, Taiwan",
    "Ulaanbaatar, Mongolia",
    
    // Asia - Southeast Asia
    "Singapore",
    "Kuala Lumpur, Malaysia",
    "Penang, Malaysia",
    "Johor Bahru, Malaysia",
    "Ipoh, Malaysia",
    "Kuching, Malaysia",
    "Kota Kinabalu, Malaysia",
    "Bangkok, Thailand",
    "Chiang Mai, Thailand",
    "Phuket, Thailand",
    "Pattaya, Thailand",
    "Krabi, Thailand",
    "Hua Hin, Thailand",
    "Jakarta, Indonesia",
    "Bali, Indonesia",
    "Surabaya, Indonesia",
    "Bandung, Indonesia",
    "Yogyakarta, Indonesia",
    "Medan, Indonesia",
    "Makassar, Indonesia",
    "Manila, Philippines",
    "Cebu, Philippines",
    "Davao, Philippines",
    "Boracay, Philippines",
    "Baguio, Philippines",
    "Ho Chi Minh City, Vietnam",
    "Hanoi, Vietnam",
    "Da Nang, Vietnam",
    "Hoi An, Vietnam",
    "Nha Trang, Vietnam",
    "Hue, Vietnam",
    "Phnom Penh, Cambodia",
    "Siem Reap, Cambodia",
    "Vientiane, Laos",
    "Luang Prabang, Laos",
    "Yangon, Myanmar",
    "Mandalay, Myanmar",
    "Brunei",
    // India
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Pune, India",
    "Ahmedabad, India",
    "Gandhinagar, India",
    "Jaipur, India",
    "Lucknow, India",
    "Chandigarh, India",
    "Kochi, India",
    "Goa, India",
    "Nagpur, India",
    "Indore, India",
    "Thane, India",
    "Bhopal, India",
    "Visakhapatnam, India",
    "Surat, India",
    "Vadodara, India",
    "Ludhiana, India",
    "Agra, India",
    "Nashik, India",
    "Faridabad, India",
    "Meerut, India",
    "Rajkot, India",
    "Varanasi, India",
    "Srinagar, India",
    "Aurangabad, India",
    "Dhanbad, India",
    "Amritsar, India",
    "Allahabad, India",
    "Ranchi, India",
    "Coimbatore, India",
    "Jabalpur, India",
    "Gwalior, India",
    "Vijayawada, India",
    "Jodhpur, India",
    "Madurai, India",
    "Raipur, India",
    "Kota, India",
    "Guwahati, India",
    "Trivandrum, India",
    "Tiruchirapalli, India",
    "Hubli, India",
    "Mangalore, India",
    "Mysore, India",
    "Dehradun, India",
    "Bhubaneswar, India",
    "Salem, India",
    "Warangal, India",
    "Jamshedpur, India",
    "Noida, India",
    "Gurgaon, India",
    "Thiruvananthapuram, India",
    "Patna, India",
    "Pimpri-Chinchwad, India",
    "Durgapur, India",
    "Gangtok, India",
    "Shimla, India",
    "Ooty, India",
    "Rishikesh, India",
    "Udaipur, India",
    "Haridwar, India",
    "Jammu, India",
    "Mussoorie, India",
    "Nainital, India",
    "Darjeeling, India",
    "Panaji, India",
    "Dharamshala, India",
    "Shillong, India",
    "Port Blair, India",
    "Manali, India",
    "Kanpur, India",
    // West Asia & Middle East
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Sharjah, UAE",
    "Al Ain, UAE",
    "Ras Al Khaimah, UAE",
    "Fujairah, UAE",
    "Ajman, UAE",
    "Umm Al Quwain, UAE",
    "Istanbul, Turkey",
    "Ankara, Turkey",
    "Antalya, Turkey",
    "Izmir, Turkey",
    "Bursa, Turkey",
    "Adana, Turkey",
    "Konya, Turkey",
    "Bodrum, Turkey",
    "Cappadocia, Turkey",
    "Tel Aviv, Israel",
    "Jerusalem, Israel",
    "Haifa, Israel",
    "Eilat, Israel",
    "Amman, Jordan",
    "Petra, Jordan",
    "Aqaba, Jordan",
    "Beirut, Lebanon",
    "Byblos, Lebanon",
    "Tripoli, Lebanon",
    "Doha, Qatar",
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Mecca, Saudi Arabia",
    "Medina, Saudi Arabia",
    "Dammam, Saudi Arabia",
    "Muscat, Oman",
    "Salalah, Oman",
    "Kuwait City, Kuwait",
    "Manama, Bahrain",
    
    // South Asia
    "Lahore, Pakistan",
    "Karachi, Pakistan",
    "Islamabad, Pakistan",
    "Peshawar, Pakistan",
    "Faisalabad, Pakistan",
    "Multan, Pakistan",
    "Rawalpindi, Pakistan",
    "Quetta, Pakistan",
    "Kathmandu, Nepal",
    "Pokhara, Nepal",
    "Dhaka, Bangladesh",
    "Chittagong, Bangladesh",
    "Sylhet, Bangladesh",
    "Khulna, Bangladesh",
    "Colombo, Sri Lanka",
    "Kandy, Sri Lanka",
    "Galle, Sri Lanka",
    "Male, Maldives",
    "Thimphu, Bhutan",
    
    // Australia
    "Sydney, Australia",
    "Melbourne, Australia",
    "Brisbane, Australia",
    "Perth, Australia",
    "Adelaide, Australia",
    "Gold Coast, Australia",
    "Canberra, Australia",
    "Hobart, Australia",
    "Darwin, Australia",
    "Newcastle, Australia",
    "Wollongong, Australia",
    "Geelong, Australia",
    "Cairns, Australia",
    "Townsville, Australia",
    "Alice Springs, Australia",
    "Sunshine Coast, Australia",
    "Toowoomba, Australia",
    "Ballarat, Australia",
    "Bendigo, Australia",
    "Mandurah, Australia",
    "Albury, Australia",
    "Wodonga, Australia",
    "Launceston, Australia",
    "Mackay, Australia",
    "Rockhampton, Australia",
    "Bunbury, Australia",
    "Bundaberg, Australia",
    "Hervey Bay, Australia",
    "Wagga Wagga, Australia",
    "Coffs Harbour, Australia",
    "Gladstone, Australia",
    "Mildura, Australia",
    "Shepparton, Australia",
    "Port Macquarie, Australia",
    "Tamworth, Australia",
    "Orange, Australia",
    "Dubbo, Australia",
    "Geraldton, Australia",
    // New Zealand
    "Auckland, New Zealand",
    "Wellington, New Zealand",
    "Christchurch, New Zealand",
    "Queenstown, New Zealand",
    "Dunedin, New Zealand",
    "Hamilton, New Zealand",
    "Tauranga, New Zealand",
    "Napier-Hastings, New Zealand",
    "Palmerston North, New Zealand",
    "Nelson, New Zealand",
    "Rotorua, New Zealand",
    "New Plymouth, New Zealand",
    "Whangarei, New Zealand",
    "Invercargill, New Zealand",
    "Whanganui, New Zealand",
    "Gisborne, New Zealand",
    "Timaru, New Zealand",
    "Taupo, New Zealand",
    "Blenheim, New Zealand",
    "Pukekohe, New Zealand",
    "Cambridge, New Zealand",
    "Te Awamutu, New Zealand",
    "Oamaru, New Zealand",
    "Whakatane, New Zealand",
    "Kerikeri, New Zealand",
    "Ashburton, New Zealand",
    "Rangiora, New Zealand",
    "Paraparaumu, New Zealand",
    "Motueka, New Zealand",
    "Suva, Fiji",
    "Port Moresby, Papua New Guinea",
    "Nouméa, New Caledonia",
    "Port Vila, Vanuatu",
    "Apia, Samoa",
    "Nuku'alofa, Tonga",
    "Honolulu, Hawaii, USA",
    
    // Africa
    "Cairo, Egypt",
    "Alexandria, Egypt",
    "Johannesburg, South Africa",
    "Cape Town, South Africa",
    "Durban, South Africa",
    "Pretoria, South Africa",
    "Lagos, Nigeria",
    "Abuja, Nigeria",
    "Nairobi, Kenya",
    "Mombasa, Kenya",
    "Casablanca, Morocco",
    "Marrakech, Morocco",
    "Rabat, Morocco",
    "Accra, Ghana",
    "Kumasi, Ghana",
    "Addis Ababa, Ethiopia",
    "Tunis, Tunisia",
    "Algiers, Algeria",
    "Dakar, Senegal",
    "Dar es Salaam, Tanzania",
    "Kampala, Uganda",
    "Lusaka, Zambia",
    "Harare, Zimbabwe",
    "Kigali, Rwanda",
    "Windhoek, Namibia",
    "Gaborone, Botswana",
    "Maputo, Mozambique",
    "Libreville, Gabon",
    "Luanda, Angola",
    "Antananarivo, Madagascar",
    "Port Louis, Mauritius",
    "Victoria, Seychelles",
    "Tripoli, Libya",
    "Khartoum, Sudan",
    "Abidjan, Ivory Coast",
    "Bamako, Mali",
    "Ouagadougou, Burkina Faso",
    "Cotonou, Benin",
    "Lomé, Togo",
    "Yaoundé, Cameroon",
    
    // South America
    "São Paulo, Brazil",
    "Rio de Janeiro, Brazil",
    "Brasília, Brazil",
    "Salvador, Brazil",
    "Recife, Brazil",
    "Fortaleza, Brazil",
    "Curitiba, Brazil",
    "Manaus, Brazil",
    "Porto Alegre, Brazil",
    "Buenos Aires, Argentina",
    "Córdoba, Argentina",
    "Rosario, Argentina",
    "Mendoza, Argentina",
    "Santiago, Chile",
    "Valparaíso, Chile",
    "Concepción, Chile",
    "Lima, Peru",
    "Cusco, Peru",
    "Arequipa, Peru",
    "Bogotá, Colombia",
    "Medellín, Colombia",
    "Cali, Colombia",
    "Cartagena, Colombia",
    "Caracas, Venezuela",
    "Maracaibo, Venezuela",
    "Valencia, Venezuela",
    "Montevideo, Uruguay",
    "Punta del Este, Uruguay",
    "Quito, Ecuador",
    "Guayaquil, Ecuador",
    "Asunción, Paraguay",
    "La Paz, Bolivia",
    "Santa Cruz, Bolivia",
    "Georgetown, Guyana",
    "Paramaribo, Suriname",
    "Cayenne, French Guiana"
  ];
  
  // State for location suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  // Initialize form data when user data changes
  useEffect(() => {
    if (userData) {
      // Log userData for debugging
      console.log("Current userData:", userData);
      console.log("Form data before update:", formData);
      
      // Get industry and domain directly from the userData object
      let mainIndustry = userData.industry || '';
      
      // Get domain from userData.domain if it exists
      let domain = userData.domain || '';
      
      // Get lookingFor from userData
      let lookingFor = userData.lookingFor || '';
      
      // Get what I offer data (if present)
      let whatIOffer = userData.whatIOffer || '';
      
      // Log values for debugging
      console.log("Initializing form with:", {
        industry: mainIndustry, 
        domain: domain,
        lookingFor: lookingFor,
        whatIOffer: whatIOffer
      });
      
      setSelectedIndustry(mainIndustry);
      setSelectedDomain(domain);
      
      // Parse job level from title if possible
      let jobLevel = '';
      let title = userData.title || '';
      
      // Check if the title starts with any of our job levels
      const jobLevels = ['Senior', 'Junior', 'Director', 'Vice President', 'President', 'Consultant'];
      for (const level of jobLevels) {
        if (title.startsWith(level + ' ')) {
          jobLevel = level;
          title = title.substring(level.length + 1); // +1 for the space
          break;
        }
      }
      
      // Special case for C-level executives
      const cLevelTitles = [
        'Chief Executive Officer', 
        'Chief Operating Officer', 
        'Chief Financial Officer', 
        'Chief Technology Officer', 
        'Chief Marketing Officer'
      ];
      
      for (const cTitle of cLevelTitles) {
        if (title === cTitle || title.includes(cTitle)) {
          title = cTitle;
          break;
        }
      }
      
      setFormData({
        name: userData.name || '',
        title: title,
        jobLevel: jobLevel,
        location: userData.location || '',
        industry: mainIndustry || '',
        domain: domain || '',
        lookingFor: lookingFor || '',
        aboutMe: userData.aboutMe || '',
        whatIOffer: whatIOffer || ''
      });
    }
  }, [userData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    setLocationSuggestions([]);
  };
  
  // Reset suggestions when dialog closes
  useEffect(() => {
    if (!showEditBasicInfo) {
      setLocationSuggestions([]);
    }
  }, [showEditBasicInfo]);
  
  // Event handler for location suggestion div to prevent bubbling
  const handleSuggestionClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to keep dropdown open until selection
    event.stopPropagation();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of form data
    const updatedFormData = { ...formData };
    
    // Combine job level and title if both are present
    if (formData.jobLevel && formData.title) {
      updatedFormData.title = `${formData.jobLevel} ${formData.title}`;
    }
    
    // Prepare data for the API - explicitly include domain field separately
    const apiData = {
      name: updatedFormData.name,
      title: updatedFormData.title,
      location: updatedFormData.location,
      industry: updatedFormData.industry,
      domain: updatedFormData.domain, // Send domain as a separate field
      lookingFor: updatedFormData.lookingFor,
      aboutMe: updatedFormData.aboutMe,
      whatIOffer: updatedFormData.whatIOffer
    };
    
    // Log what we're sending to the server
    console.log("Submitting profile data:", apiData);
    
    updateUserMutation.mutate(apiData);
  };

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    setLocation('/');
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Handle profile picture update
  const handleProfilePictureUpdate = (base64Image: string) => {
    profilePictureMutation.mutate(base64Image);
  };
  
  return (
    <div className="flex h-screen flex-col relative">
      {/* Profile Picture Dialog */}
      <ProfilePictureDialog 
        open={showProfilePictureDialog}
        onOpenChange={setShowProfilePictureDialog}
        currentPhotoURL={userData?.photoURL || user?.photoURL}
        onSave={handleProfilePictureUpdate}
      />
      
      {/* Personal Information Edit Dialog */}
      {userData && (
        <Dialog open={showEditPersonalInfo} onOpenChange={setShowEditPersonalInfo}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
            </DialogHeader>
            <EditPersonalInfo 
              userData={userData}
              onCancel={() => setShowEditPersonalInfo(false)}
              onSave={() => {
                setShowEditPersonalInfo(false);
                // Refetch user data
                queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Basic Info Dialog */}
      <Dialog 
        open={showEditBasicInfo} 
        onOpenChange={(isOpen) => {
          if (isOpen) {
            // Debug what's in the form when the dialog opens
            console.log("Opening dialog with form data:", formData);
            console.log("Domain value:", formData.domain);
          }
          setShowEditBasicInfo(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All About Me</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <Select
                      value={formData.jobLevel}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          jobLevel: value
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fresher">Fresher</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Vice President">Vice President</SelectItem>
                        <SelectItem value="President">President</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-2/3">
                    <JobTitleCombobox
                      value={formData.title || ''}
                      onChange={(value) => setFormData({ ...formData, title: value })}
                      placeholder="Select or type your job title"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your location"
                  autoComplete="off"
                />
                {locationSuggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-60 overflow-auto"
                    onClick={handleSuggestionClick}
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
                    setSelectedDomain('');
                    setFormData(prev => ({
                      ...prev,
                      industry: value,
                      domain: ''
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Domain selector - always show it */}
              <div className="grid gap-2">
                <Label htmlFor="domain">Specific Domain</Label>
                <Select
                  value={formData.domain || ""}
                  onValueChange={(value) => {
                    console.log("Domain selected:", value);
                    setSelectedDomain(value);
                    setFormData(prev => ({
                      ...prev,
                      domain: value
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your domain" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {/* Add a General option as the first choice */}
                    <SelectItem key="all" value="all">
                      General
                    </SelectItem>
                    {formData.industry && INDUSTRY_DOMAINS[formData.industry]?.map((domain: string) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lookingFor">I am looking for</Label>
                <Select
                  value={formData.lookingFor}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      lookingFor: value
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="What are you looking for?" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectGroup>
                      <SelectLabel>Career & Job Seeking</SelectLabel>
                      {LOOKING_FOR_CATEGORIES.filter(cat => cat.label.includes("💼")).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Business & Investment</SelectLabel>
                      {LOOKING_FOR_CATEGORIES.filter(cat => cat.label.includes("🚀")).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Learning & Upskilling</SelectLabel>
                      {LOOKING_FOR_CATEGORIES.filter(cat => cat.label.includes("🎓")).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Networking & Collaborations</SelectLabel>
                      {LOOKING_FOR_CATEGORIES.filter(cat => cat.label.includes("🤝")).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Freelance & Side Hustle</SelectLabel>
                      {LOOKING_FOR_CATEGORIES.filter(cat => cat.label.includes("💰")).map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* What I'm All About section */}
              <div className="grid gap-2">
                <Label htmlFor="aboutMe">What I'm All About</Label>
                <Textarea
                  id="aboutMe"
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aboutMe: e.target.value
                  }))}
                  placeholder="Tell us about yourself (max 350 words)"
                  className="min-h-[150px]"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 text-right">
                  {formData.aboutMe?.split(/\s+/).filter(Boolean).length || 0}/350 words
                </div>
              </div>
              
              {/* What I Offer section */}
              <div className="grid gap-2">
                <Label htmlFor="whatIOffer">What I Offer</Label>
                <Textarea
                  id="whatIOffer"
                  name="whatIOffer"
                  value={formData.whatIOffer}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    whatIOffer: e.target.value
                  }))}
                  placeholder="Describe what you can offer to others in your field (max 250 words)"
                  className="min-h-[100px]"
                  maxLength={1500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {formData.whatIOffer?.split(/\s+/).filter(Boolean).length || 0}/250 words
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditBasicInfo(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Top Navigation */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        {/* Sidebar */}
        

        {/* Center content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => {
                    // Create a loading state in the button
                    const btn = document.getElementById('portfolio-btn');
                    if (btn) {
                      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                      btn.classList.add('opacity-80');
                    }
                    
                    // Pre-create empty portfolio in the background
                    fetch('/api/portfolios', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userId: userData?.id,
                        layout: 'professional', // Changed to match the backend schema
                        isPublished: false,
                        publicUrl: null
                      })
                    }).catch(err => console.log("Portfolio creation attempted - ignoring error if already exists"));
                    
                    // Navigate to the portfolio builder page
                    setTimeout(() => setLocation('/portfolio-builder'), 200);
                  }}
                  id="portfolio-btn"
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50"
                  variant="outline"
                >
                  <i className="fas fa-id-card"></i>
                  Portfolio Builder
                </Button>
                
                <Button 
                  onClick={() => setLocation('/resume')}
                  id="resume-btn"
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  Resume Builder
                </Button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Profile Completion</p>
                  <div className="flex items-center mt-1">
                    {userData && (
                      <>
                        <div className="w-36 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            id="profile-completion-bar" 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ 
                              width: `${calculateOverallProfileCompletion(
                                userData, 
                                experiences, 
                                educations, 
                                skills, 
                                projects,
                                services
                              )}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(() => {
                            console.log("Profile Completion Data:", {
                              userData,
                              experiences,
                              educations,
                              skills,
                              projects,
                              services
                            });
                            return calculateOverallProfileCompletion(
                              userData, 
                              experiences, 
                              educations, 
                              skills, 
                              projects,
                              services
                            );
                          })()}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Header */}
            <Card className="mb-6 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-purple-600"></div>
              <CardContent className="relative pt-16 pb-4">
                <div className="absolute -top-16 left-1/2 sm:left-6 transform -translate-x-1/2 sm:translate-x-0">
                  <div className="relative group">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-white ring-4 ring-white flex items-center justify-center">
                      <img 
                        className="h-full w-full object-cover" 
                        src={userData?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                        alt="User profile"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                        }}
                      />
                    </div>
                    {/* Camera button for profile picture update */}
                    <button 
                      onClick={() => setShowProfilePictureDialog(true)}
                      className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Change profile picture"
                    >
                      <Camera size={16} />
                    </button>
                    
                    {/* Edit Profile button positioned to the side of profile picture */}
                    <Button 
                      onClick={() => setLocation('/edit-profile')}
                      className="absolute -right-32 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-primary/90 hover:bg-primary text-xs shadow-lg"
                      size="sm"
                    >
                      Edit Profile
                    </Button>
                    
                    {/* Personal info button - Positioned directly under the profile picture with business card icon */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <button 
                        onClick={() => setLocation('/personal-details')}
                        className="bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-md"
                        aria-label="View personal information"
                      >
                        <PersonalInfoIcon className="w-7 h-7" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pl-0 sm:pl-32 mt-12 sm:mt-2">
                  <div className="flex justify-between items-center group">
                    <h2 className="text-xl text-gray-900">
                      Hey there! <span className="font-bold text-2xl text-primary">{userData?.name || user?.name || 'User'}</span> here,
                    </h2>
                    {/* Edit button removed, using single Edit Profile button instead */}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">I am:</span> {userData?.title || user?.title || 'Professional'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">From:</span> {userData?.location || user?.location || 'Location not specified'}
                  </p>
                  {/* Industry and Domain - now displayed separately */}
                  {userData?.industry && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Industry:</span> {userData.industry}
                    </p>
                  )}
                  {userData?.domain && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Domain:</span> {userData.domain === "all" ? "General" : userData.domain}
                    </p>
                  )}
                  {userData?.lookingFor && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Looking for:</span> {
                        // Display the human-readable label instead of the value
                        LOOKING_FOR_CATEGORIES.find(cat => cat.value === userData.lookingFor)?.label || userData.lookingFor
                      }
                    </p>
                  )}
                  
                  {/* What I'm All About section */}
                  {userData?.aboutMe && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900">What I'm All About</h3>
                      <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                        {userData.aboutMe}
                      </p>
                    </div>
                  )}
                  
                  {/* What I Offer section */}
                  {userData?.whatIOffer && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900">What I Offer</h3>
                      <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                        {userData.whatIOffer}
                      </p>
                    </div>
                  )}
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
            
            {/* AI Career Insights */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">AI Career Insights</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <p className="text-sm text-gray-600">Based on your profile, you have a strong foundation in data analysis.</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">Consider developing skills in data visualization and advanced SQL to become more competitive.</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-sm text-gray-600">Industry trends show growing demand for your skills.</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">Financial analysis roles are projected to grow 10% in the next year.</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                  onClick={() => setLocation('/ai-career')}
                >
                  Get Personalized Advice
                </Button>
              </CardContent>
            </Card>
            
            {/* Job Matches */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Matches</h2>
                <div className="divide-y divide-gray-200">
                  <div className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">Senior Data Analyst</h3>
                        <p className="text-sm text-gray-500">TechCorp Inc. • New York, NY</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          95% Match
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">Seeking an experienced data analyst with strong SQL skills and experience with visualization tools like Tableau.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">SQL</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tableau</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Data Analysis</Badge>
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">Business Intelligence Analyst</h3>
                        <p className="text-sm text-gray-500">Global Finance • Remote</p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          88% Match
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">Looking for a BI professional to help build dashboards and generate actionable insights from financial data.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Power BI</Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Financial Analysis</Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 text-primary bg-primary-50 hover:bg-primary-100"
                >
                  View All Job Matches
                </Button>
              </CardContent>
            </Card>
            
            {/* Sign Out Button */}
            <div className="flex justify-end mb-6">
              <Button 
                variant="outline"
                className="px-6 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                onClick={() => signOut()}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 
        No individual MuskButton needed here - using global MuskButton from App.tsx instead 
        that appears on all pages
      */}
    </div>
  );
}
