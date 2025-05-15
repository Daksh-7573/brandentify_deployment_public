import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search as SearchIcon, Users, MessageSquare, Hash, UserPlus, Star, MapPin, ArrowUpRight, ArrowDownRight, Plus, Check, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import Header from "@/components/layout/header";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Types for search
type SearchCategory = "pulses" | "profiles" | "hashtags" | "smart-connect";

type SearchResultsType = {
  pulses: Array<{
    id: number;
    title: string;
    content: string;
    type: "poll" | "media-pulse" | "project";
    createdAt: string;
    user: {
      name: string;
      photoURL: string | null;
    };
  }>;
  profiles: Array<{
    id: number;
    name: string;
    title: string | null;
    photoURL: string | null;
    location: string | null;
    industry: string | null;
  }>;
  hashtags: Array<{
    id: number;
    name: string;
    count: number;
  }>;
};

// Smart Connect types
type MatchmakingFormData = {
  lookingFor: string;
  jobTitle: string;
  experienceLevel: string;
  industry: string;
  domain: string;
  location: string;
};

type MatchResult = {
  id: number;
  name: string;
  photoURL: string | null;
  title: string;
  location: string;
  skills: string[];
  matchPercentage: number;
  lookingFor?: string;
  matchDetails: {
    complementaryMatch?: number;
    industryMatch: number;
    domainMatch: number;
    experienceMatch: number;
  };
};

// Define industries for dropdown
const INDUSTRIES = [
  "IT & Software",
  "Marketing & Advertising",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Real Estate",
  "Hospitality",
  "Transportation & Logistics",
  "Agriculture",
  "Energy & Utilities",
  "Construction",
  "Legal Services"
];

// Define domain expertise for each industry
const DOMAIN_EXPERTISE: Record<string, string[]> = {
  "IT & Software": [
    "UI/UX Design",
    "Software Development",
    "AI/ML Development",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "Data Science",
    "Blockchain",
    "Mobile App Development",
    "Quality Assurance"
  ],
  "Marketing & Advertising": [
    "Digital Marketing",
    "Content & Copywriting",
    "Brand Management",
    "Market Research",
    "SEO/SEM",
    "Social Media Marketing",
    "Email Marketing",
    "Creative Services",
    "Public Relations",
    "Event Marketing"
  ],
  "Finance & Banking": [
    "Investment Banking",
    "Financial Analysis",
    "Risk Management",
    "Accounting",
    "Wealth Management",
    "Corporate Finance",
    "Insurance",
    "Fintech",
    "Cryptocurrency",
    "Regulatory Compliance"
  ],
  "Healthcare": [
    "Medical Practice",
    "Healthcare Administration",
    "Pharmaceuticals",
    "Medical Research",
    "Mental Health",
    "Public Health",
    "Health Informatics",
    "Biotechnology",
    "Nursing",
    "Healthcare Policy"
  ],
  "Education": [
    "K-12 Education",
    "Higher Education",
    "Educational Technology",
    "Curriculum Development",
    "Special Education",
    "Educational Administration",
    "Adult Education",
    "Early Childhood Education",
    "STEM Education",
    "Language Education"
  ]
};

// Define experience levels
const EXPERIENCE_LEVELS = [
  "Fresher",
  "Student",
  "Junior",
  "Mid-Level",
  "Senior",
  "Director",
  "Executive",
  "Consultant"
];

// Define "I am looking for" categories
// Define complementary relationship mapping for Smart Connect algorithm
// Each key maps to its complementary value(s) for cross-matching
const COMPLEMENTARY_RELATIONS: Record<string, string[]> = {
  // Career & Job Seeking category
  "job_opportunities": ["job_seekers"],
  "job_seekers": ["job_opportunities"],
  "internships": ["interns"],
  "interns": ["internships"],
  "mentors": ["mentees"],
  "mentees": ["mentors"],
  
  // Business & Investment category
  "investors": ["startups"],
  "startups": ["investors", "tech_partners", "advisors"],
  "co_founders": ["business_partners", "co_founders"],
  "business_partners": ["co_founders", "business_partners"],
  "advisors": ["startups"],
  "tech_partners": ["startups"],
  
  // Learning & Upskilling category
  "skill_trainers": ["learners"],
  "learners": ["skill_trainers", "study_groups"],
  "study_groups": ["learners", "study_groups"],
  
  // Networking & Collaborations category
  "industry_experts": ["share_expertise"],
  "share_expertise": ["industry_experts"],
  
  // Freelance & Side Hustle category
  "freelance_gigs": ["hiring_freelancers"],
  "hiring_freelancers": ["freelance_gigs"]
};

const LOOKING_FOR_OPTIONS = [
  // Career & Job Seeking category
  { value: "job_opportunities", label: "💼 Job Opportunities", category: "Career & Job Seeking" },
  { value: "job_seekers", label: "💼 Job Seekers / Candidates", category: "Career & Job Seeking" },
  { value: "internships", label: "💼 Internships", category: "Career & Job Seeking" },
  { value: "interns", label: "💼 Interns", category: "Career & Job Seeking" },
  { value: "mentors", label: "💼 Career Mentors", category: "Career & Job Seeking" },
  { value: "mentees", label: "💼 Career Mentees", category: "Career & Job Seeking" },
  
  // Business & Investment category  
  { value: "investors", label: "🚀 Investors", category: "Business & Investment" },
  { value: "startups", label: "🚀 Startups", category: "Business & Investment" },
  { value: "co_founders", label: "🚀 Co-Founders", category: "Business & Investment" },
  { value: "business_partners", label: "🚀 Business Partners", category: "Business & Investment" },
  { value: "advisors", label: "🚀 Legal/Financial Advisors", category: "Business & Investment" },
  { value: "tech_partners", label: "🚀 Technical Partners", category: "Business & Investment" },
  
  // Learning & Upskilling category
  { value: "skill_trainers", label: "🎓 Skill Trainers", category: "Learning & Upskilling" },
  { value: "learners", label: "🎓 Students/Learners", category: "Learning & Upskilling" },
  { value: "study_groups", label: "🎓 Study Groups", category: "Learning & Upskilling" },
  
  // Networking & Collaborations category
  { value: "industry_experts", label: "🤝 Industry Experts", category: "Networking & Collaborations" },
  { value: "share_expertise", label: "🤝 Sharing My Expertise", category: "Networking & Collaborations" },
  
  // Freelance & Side Hustle category
  { value: "freelance_gigs", label: "💰 Freelance Gigs", category: "Freelance & Side Hustle" },
  { value: "hiring_freelancers", label: "💰 Hiring Freelancers", category: "Freelance & Side Hustle" },
];

const SearchPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("pulses");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  
  // Smart Connect form state
  const [formData, setFormData] = useState<MatchmakingFormData>({
    lookingFor: "industry_experts",
    jobTitle: "",
    experienceLevel: "",
    industry: "",
    domain: "",
    location: ""
  });

  // Parse URL search params on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    const category = url.searchParams.get("category") as SearchCategory;
    
    if (q) {
      setSearchQuery(q);
      setSubmittedQuery(q);
    }
    
    if (category && ["pulses", "profiles", "hashtags", "smart-connect"].includes(category)) {
      setActiveCategory(category);
    }
  }, []);

  // Get user data for pre-filling form
  const { data: userData } = useQuery<{
    id: number;
    username: string;
    email: string;
    name: string;
    photoURL: string | null;
    title: string | null;
    location: string | null;
    industry: string | null;
    lookingFor: string | null;
    profileCompleted: number;
    createdAt: string;
  }>({
    queryKey: ["/api/users/1"],
    enabled: isAuthenticated && activeCategory === "smart-connect",
  });

  // Pre-fill Smart Connect form with user data when available
  useEffect(() => {
    if (userData && activeCategory === "smart-connect") {
      let lookingFor = userData.lookingFor || "industry_experts";
      
      // Map user's lookingFor value to our options
      const lookingForOption = LOOKING_FOR_OPTIONS.find(option => 
        option.value === lookingFor || option.label.toLowerCase().includes(lookingFor.toLowerCase())
      );
      
      // Initialize form with user data
      setFormData(prev => ({
        ...prev,
        lookingFor: lookingForOption ? lookingForOption.value : "industry_experts",
        jobTitle: userData.title || "",
        location: userData.location || "",
        industry: userData.industry ? userData.industry.split(": ")[0] : "",
        domain: userData.industry && userData.industry.includes(": ") ? userData.industry.split(": ")[1] : ""
      }));
      
      // Set experience level if it can be extracted from title
      if (userData.title) {
        for (const level of EXPERIENCE_LEVELS) {
          if (userData.title.startsWith(level + " ")) {
            setFormData(prev => ({
              ...prev,
              experienceLevel: level
            }));
            break;
          }
        }
      }
    }
  }, [userData, activeCategory]);

  // Update domains when industry changes
  useEffect(() => {
    if (formData.industry && DOMAIN_EXPERTISE[formData.industry as keyof typeof DOMAIN_EXPERTISE]) {
      setDomains(DOMAIN_EXPERTISE[formData.industry as keyof typeof DOMAIN_EXPERTISE]);
    } else {
      setDomains([]);
    }
  }, [formData.industry]);

  // Query for search results
  const { data: searchResults, isLoading } = useQuery<SearchResultsType>({
    queryKey: ['/api/search', activeCategory, submittedQuery],
    queryFn: async () => {
      if (!submittedQuery || activeCategory === "smart-connect") return { pulses: [], profiles: [], hashtags: [] };
      const response = await fetch(`/api/search?q=${encodeURIComponent(submittedQuery)}&category=${activeCategory}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: !!submittedQuery && activeCategory !== "smart-connect",
  });

  // Smart Connect mutation
  const matchMutation = useMutation<MatchResult[]>({
    mutationFn: async () => {
      // In a real implementation, this would call an API endpoint
      // Here we're creating mock data for demonstration
      return Array(5).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Professional ${i + 1}`,
        photoURL: null,
        title: `${formData.experienceLevel || 'Senior'} ${formData.jobTitle || 'Professional'}`,
        location: formData.location || 'New York, NY',
        skills: ['Leadership', 'Communication', formData.domain || 'Strategy'],
        matchPercentage: 95 - i * 5,
        lookingFor: Object.keys(COMPLEMENTARY_RELATIONS).find(key => 
          COMPLEMENTARY_RELATIONS[key].includes(formData.lookingFor)
        ),
        matchDetails: {
          complementaryMatch: Math.floor(Math.random() * 70) + 30,
          industryMatch: Math.floor(Math.random() * 40) + 60,
          domainMatch: Math.floor(Math.random() * 30) + 70,
          experienceMatch: Math.floor(Math.random() * 20) + 80
        }
      }));
    }
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeCategory === "smart-connect") {
      handleSmartConnectSubmit(e);
      return;
    }
    
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search term",
        description: "Enter keywords to find pulses, profiles, or hashtags",
        variant: "destructive"
      });
      return;
    }
    setSubmittedQuery(searchQuery);
    // Update URL with search params
    setLocation(`/search?q=${encodeURIComponent(searchQuery)}&category=${activeCategory}`);
  };

  const handleTabChange = (value: string) => {
    setActiveCategory(value as SearchCategory);
    if (value === "smart-connect") {
      // Reset search for Smart Connect
      setSubmittedQuery("");
    } else if (submittedQuery) {
      setLocation(`/search?q=${encodeURIComponent(submittedQuery)}&category=${value}`);
    }
  };
  
  // Handle form input changes for Smart Connect
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle Smart Connect form submission
  const handleSmartConnectSubmit = (e: React.FormEvent | undefined) => {
    if (e) e.preventDefault();
    
    // Validate required fields
    if (!formData.lookingFor) {
      toast({
        title: "Missing information",
        description: "Please specify what you're looking for",
        variant: "destructive"
      });
      return;
    }
    
    setShowMatchResults(true);
    matchMutation.mutate();
  };

  // Helper to get initial letters for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // HashtagCard component for rendering hashtags with follow/unfollow functionality
  const HashtagCard = ({ tag, userId }: { tag: { id: number, name: string, count: number }, userId?: number }) => {
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Check if user is following this hashtag
    const { data: followData } = useQuery<{ isFollowing: boolean }>({
      queryKey: [`/api/hashtags/${tag.id}/is-following`, userId],
      queryFn: async () => {
        if (!userId) return { isFollowing: false };
        const response = await fetch(`/api/hashtags/${tag.id}/is-following?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to check follow status');
        }
        return response.json();
      },
      enabled: !!userId,
    });
    
    // Update the following state when data changes
    useEffect(() => {
      if (followData) {
        setIsFollowing(followData.isFollowing);
      }
    }, [followData]);
    
    // Follow hashtag mutation
    const followMutation = useMutation({
      mutationFn: async () => {
        if (!userId) {
          toast({
            title: "Error",
            description: "You must be logged in to follow hashtags",
            variant: "destructive"
          });
          return;
        }
        
        setIsLoading(true);
        const res = await apiRequest({
          method: 'POST',
          url: `/api/hashtags/${tag.id}/follow?userId=${userId}`,
          data: { userId }
        });
        
        return res.json();
      },
      onSuccess: () => {
        setIsFollowing(true);
        toast({
          title: "Success",
          description: `You are now following #${tag.name}`,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/hashtags/${tag.id}/is-following`] });
      },
      onError: (error) => {
        console.error("Error following hashtag:", error);
        toast({
          title: "Error",
          description: `Failed to follow hashtag: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
    
    // Unfollow hashtag mutation
    const unfollowMutation = useMutation({
      mutationFn: async () => {
        if (!userId) {
          toast({
            title: "Error",
            description: "You must be logged in to unfollow hashtags",
            variant: "destructive"
          });
          return;
        }
        
        setIsLoading(true);
        // Direct fetch request for DELETE since apiRequest might be having issues with it
        const response = await fetch(`/api/hashtags/${tag.id}/follow?userId=${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to unfollow hashtag');
        }
        
        return response.json();
      },
      onSuccess: () => {
        setIsFollowing(false);
        toast({
          title: "Success",
          description: `You have unfollowed #${tag.name}`,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/hashtags/${tag.id}/is-following`] });
      },
      onError: (error) => {
        console.error("Error unfollowing hashtag:", error);
        toast({
          title: "Error",
          description: `Failed to unfollow hashtag: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
    
    const handleFollowToggle = () => {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to follow hashtags",
          variant: "destructive"
        });
        return;
      }
      
      if (isFollowing) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    };
    
    return (
      <Card 
        key={tag.id} 
        className="overflow-hidden rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 group"
      >
        <CardContent className="p-5 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-12 -mr-12 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                <span className="text-primary font-semibold">#</span>{tag.name}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {tag.count} {tag.count === 1 ? 'post' : 'posts'}
              </p>
            </div>
            {userId ? (
              <button
                className={`min-w-[110px] px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  isFollowing 
                    ? 'text-primary bg-white border border-primary/30 hover:bg-primary/5 hover:shadow-md' 
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                }`}
                onClick={handleFollowToggle}
                disabled={isLoading}
              >
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {isFollowing ? (
                        <span className="flex items-center">
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Unfollow
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> Follow
                        </span>
                      )}
                    </div>
                  )}
                </span>
              </button>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Hash className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16" style={{ backgroundImage: 'url("/assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Discover & Connect</h1>
          <p className="text-gray-300">Find content, professionals, and networking opportunities in one place</p>
        </div>

        {/* Main Tabs: Search vs Smart Connect */}
        <Tabs defaultValue={activeCategory === "smart-connect" ? "smart-connect" : "search"} className="mb-6">
          <TabsList className="w-full border-b border-gray-700/50 shadow-md rounded-lg overflow-hidden">
            <TabsTrigger 
              value="search" 
              className="flex items-center justify-center gap-2 flex-1 py-4 text-gray-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/15 data-[state=active]:to-white/5 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-white/70 data-[state=active]:text-white transition-all"
              onClick={() => activeCategory !== "pulses" && setActiveCategory("pulses")}
            >
              <SearchIcon size={18} />
              <span className="text-base font-medium">Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart-connect" 
              className="flex items-center justify-center gap-2 flex-1 py-4 text-gray-300 data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/15 data-[state=active]:to-white/5 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-white/70 data-[state=active]:text-white transition-all"
              onClick={() => activeCategory !== "smart-connect" && setActiveCategory("smart-connect")}
            >
              <UserPlus size={18} />
              <span className="text-base font-medium">Smart Connect</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab Content */}
          <TabsContent value="search" className="mt-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                <input
                  type="search"
                  placeholder="Search pulses, profiles, or hashtags..."
                  className="w-full rounded-md pl-10 py-2 bg-gray-800/80 border border-gray-700/50 shadow-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/40 placeholder:text-gray-400 text-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="px-5 py-2 rounded-md bg-gradient-to-r from-white/80 to-white/90 text-black hover:shadow-md hover:scale-105 hover:from-white/90 hover:to-white focus:outline-none focus:ring-1 focus:ring-white/20 shadow-sm font-medium transition-all min-w-[100px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    <span>Searching...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </span>
                )}
              </button>
            </form>

            {/* Search Category Tabs */}
            <Tabs defaultValue={activeCategory === "smart-connect" ? "pulses" : activeCategory} onValueChange={handleTabChange}>
              <TabsList className="mb-6 bg-gray-800/60 rounded-full p-1 border border-gray-700/40 shadow-sm">
                <TabsTrigger 
                  value="pulses" 
                  className="flex items-center gap-1.5 py-2 px-4 rounded-full text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/10 transition-all"
                >
                  <MessageSquare size={16} />
                  <span>Pulses</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profiles" 
                  className="flex items-center gap-1.5 py-2 px-4 rounded-full text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/10 transition-all"
                >
                  <Users size={16} />
                  <span>Profiles</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="hashtags" 
                  className="flex items-center gap-1.5 py-2 px-4 rounded-full text-gray-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:border-white/10 transition-all"
                >
                  <Hash size={16} />
                  <span>Hashtags</span>
                </TabsTrigger>
              </TabsList>

              {/* Pulses Results */}
              <TabsContent value="pulses">
                {!submittedQuery ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">Search for pulses</h3>
                    <p className="text-gray-500 mt-2">
                      Discover polls, media shares, and projects from professionals
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchResults && searchResults.pulses && searchResults.pulses.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.pulses.map((pulse: {
                      id: number;
                      title: string;
                      content: string;
                      type: "poll" | "media-pulse" | "project";
                      createdAt: string;
                      user: {
                        name: string;
                        photoURL: string | null;
                      };
                    }) => (
                      <Card key={pulse.id} className="hover:border-primary/40 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={pulse.user.photoURL || undefined} />
                              <AvatarFallback>{getInitials(pulse.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{pulse.user.name}</h3>
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <h4 className="font-medium mb-2">{pulse.title}</h4>
                          <p className="text-gray-600 mb-3 line-clamp-2">{pulse.content}</p>
                          <div className="flex">
                            <Badge variant={
                              pulse.type === "poll" ? "secondary" : 
                              pulse.type === "media-pulse" ? "outline" : "default"
                            }>
                              {pulse.type === "poll" ? "Poll" : 
                               pulse.type === "media-pulse" ? "Media" : "Project"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No pulses found</h3>
                    <p className="text-gray-500 mt-2">
                      Try a different search term or check for typos
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Profiles Results */}
              <TabsContent value="profiles">
                {!submittedQuery ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">Search for profiles</h3>
                    <p className="text-gray-500 mt-2">
                      Discover professionals across various industries
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="overflow-hidden rounded-xl shadow-lg border-0">
                        <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 h-28 relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gray-200 rounded-full -mb-10 -ml-10 blur-xl"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200 rounded-full -mt-10 -mr-10 blur-xl"></div>
                        </div>
                        <div className="px-6 pb-6 relative">
                          <div className="flex justify-center -mt-12 mb-4">
                            <Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
                          </div>
                          <div className="text-center space-y-3">
                            <Skeleton className="h-5 w-36 mx-auto rounded-md" />
                            <Skeleton className="h-4 w-28 mx-auto rounded-md" />
                            <Skeleton className="h-3 w-44 mx-auto rounded-md" />
                            <div className="py-2 mt-2">
                              <Skeleton className="h-9 w-28 mx-auto rounded-full" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : searchResults && searchResults.profiles && searchResults.profiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.profiles.map((profile: {
                      id: number;
                      name: string;
                      title: string | null;
                      photoURL: string | null;
                      location: string | null;
                      industry: string | null;
                    }) => (
                      <Card key={profile.id} className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 group">
                        <div className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/5 h-28 relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/10 rounded-full -mb-10 -ml-10 blur-xl"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mt-10 -mr-10 blur-xl"></div>
                        </div>
                        <div className="px-6 pb-6 relative">
                          <div className="flex justify-center -mt-12 mb-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-md group-hover:shadow-lg transition-all duration-300">
                              <AvatarImage src={profile.photoURL || undefined} />
                              <AvatarFallback className="text-xl bg-gradient-to-br from-primary/60 to-primary/80 text-white">{getInitials(profile.name)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">{profile.name}</h3>
                            {profile.title && (
                              <p className="text-gray-600 mt-1 font-medium">{profile.title}</p>
                            )}
                            {(profile.location || profile.industry) && (
                              <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-1">
                                {profile.location && (
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                    {profile.location}
                                  </span>
                                )}
                                {profile.location && profile.industry && <span className="mx-1 text-gray-300">•</span>}
                                {profile.industry && profile.industry}
                              </p>
                            )}
                            <button 
                              className="mt-5 px-5 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium text-sm transition-all group-hover:border-primary/40 group-hover:shadow"
                              onClick={() => setLocation(`/profile/${profile.id}`)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No profiles found</h3>
                    <p className="text-gray-500 mt-2">
                      Try a different search term or check for typos
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Hashtags Results */}
              <TabsContent value="hashtags">
                {!submittedQuery ? (
                  <div className="text-center py-12">
                    <Hash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">Search for hashtags</h3>
                    <p className="text-gray-500 mt-2">
                      Discover trending topics and hashtags across the platform
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-24 mb-2" />
                          <Skeleton className="h-4 w-16" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : searchResults && searchResults.hashtags && searchResults.hashtags.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.hashtags.map((tag: {
                      id: number;
                      name: string;
                      count: number;
                    }) => (
                      <HashtagCard key={tag.id} tag={tag} userId={user?.id} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Hash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No hashtags found</h3>
                    <p className="text-gray-500 mt-2">
                      Try a different search term or check for typos
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Smart Connect Tab Content */}
          <TabsContent value="smart-connect" className="mt-6">
            <div className="space-y-6">
              {/* Matchmaking Form */}
              <Card className="bg-gray-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white">{showMatchResults ? "Your Match Criteria" : "Find Your Match"}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {showMatchResults 
                      ? "Based on these criteria, we found relevant matches for you" 
                      : "Fill in the criteria to find professionals matching your needs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showMatchResults ? (
                    <form onSubmit={handleSmartConnectSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="lookingFor" className="text-white">I am looking for</Label>
                        <Select 
                          value={formData.lookingFor}
                          onValueChange={(value) => setFormData({...formData, lookingFor: value})}
                        >
                          <SelectTrigger className="w-full bg-gray-800/80 border-gray-700/50 text-white focus:ring-white/20">
                            <SelectValue placeholder="What are you looking for?" />
                          </SelectTrigger>
                          <SelectContent className="max-h-80 bg-gray-800 border-gray-700/50 text-white">
                            <SelectGroup>
                              <SelectLabel>Career & Job Seeking</SelectLabel>
                              {LOOKING_FOR_OPTIONS.filter(opt => opt.category === "Career & Job Seeking").map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Business & Investment</SelectLabel>
                              {LOOKING_FOR_OPTIONS.filter(opt => opt.category === "Business & Investment").map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Learning & Upskilling</SelectLabel>
                              {LOOKING_FOR_OPTIONS.filter(opt => opt.category === "Learning & Upskilling").map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Networking & Collaborations</SelectLabel>
                              {LOOKING_FOR_OPTIONS.filter(opt => opt.category === "Networking & Collaborations").map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Freelance & Side Hustle</SelectLabel>
                              {LOOKING_FOR_OPTIONS.filter(opt => opt.category === "Freelance & Side Hustle").map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobTitle" className="text-white">Job Title</Label>
                        <JobTitleCombobox
                          value={formData.jobTitle}
                          onChange={(value) => setFormData({...formData, jobTitle: value})}
                          placeholder="Enter job title"
                          className="bg-gray-800/80 border-gray-700/50 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel" className="text-white">Experience Level</Label>
                        <Select 
                          value={formData.experienceLevel}
                          onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
                        >
                          <SelectTrigger className="w-full bg-gray-800/80 border-gray-700/50 text-white focus:ring-white/20">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700/50 text-white">
                            {EXPERIENCE_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-white">Industry</Label>
                        <Select 
                          value={formData.industry}
                          onValueChange={(value) => {
                            setFormData({
                              ...formData, 
                              industry: value,
                              domain: '' // Reset domain when industry changes
                            });
                          }}
                        >
                          <SelectTrigger className="w-full bg-gray-800/80 border-gray-700/50 text-white focus:ring-white/20">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700/50 text-white">
                            {INDUSTRIES.map(industry => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.industry && domains.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="domain" className="text-white">Domain Expertise</Label>
                          <Select 
                            value={formData.domain}
                            onValueChange={(value) => setFormData({...formData, domain: value})}
                          >
                            <SelectTrigger className="w-full bg-gray-800/80 border-gray-700/50 text-white focus:ring-white/20">
                              <SelectValue placeholder="Select domain expertise" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700/50 text-white">
                              {domains.map(domain => (
                                <SelectItem key={domain} value={domain}>
                                  {domain}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white">Location</Label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="City, Country"
                          className="w-full bg-gray-800/80 border-gray-700/50 text-white focus:ring-white/20 focus:border-white/40 placeholder:text-gray-400"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full mt-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/80 to-white/90 text-black hover:shadow-md hover:scale-105 hover:from-white/90 hover:to-white focus:outline-none focus:ring-1 focus:ring-white/20 shadow-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={matchMutation.isPending}
                      >
                        {matchMutation.isPending ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2" />
                            <span>Finding matches...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <UserPlus className="h-4 w-4 mr-2" />
                            <span>Find Matches</span>
                          </span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Looking For</p>
                          <p className="font-medium">
                            {LOOKING_FOR_OPTIONS.find(opt => opt.value === formData.lookingFor)?.label || "Professionals"}
                          </p>
                        </div>
                        {formData.jobTitle && (
                          <div>
                            <p className="text-xs text-gray-500">Job Title</p>
                            <p className="font-medium">{formData.jobTitle}</p>
                          </div>
                        )}
                        {formData.experienceLevel && (
                          <div>
                            <p className="text-xs text-gray-500">Experience Level</p>
                            <p className="font-medium">{formData.experienceLevel}</p>
                          </div>
                        )}
                        {formData.industry && (
                          <div>
                            <p className="text-xs text-gray-500">Industry</p>
                            <p className="font-medium">{formData.industry}</p>
                          </div>
                        )}
                        {formData.domain && (
                          <div>
                            <p className="text-xs text-gray-500">Domain</p>
                            <p className="font-medium">{formData.domain}</p>
                          </div>
                        )}
                        {formData.location && (
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{formData.location}</p>
                          </div>
                        )}
                      </div>
                      <button 
                        className="w-full mt-4 px-5 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium transition-all text-sm flex items-center justify-center gap-2"
                        onClick={() => setShowMatchResults(false)}
                      >
                        <span>Edit Criteria</span>
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Network Recommendations */}
              {!showMatchResults && (
                <Card className="bg-gray-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Network Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <div className="bg-white/20 rounded-full p-2 h-fit">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-white">Complete your profile</h4>
                        <p className="text-gray-300 text-xs">Profiles with 80%+ completion get 3x more connections</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-2 h-fit">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Specify your industry</h4>
                        <p className="text-gray-500 text-xs">Match with professionals in your field</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-2 h-fit">
                        <ArrowDownRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Clarify what you seek</h4>
                        <p className="text-gray-500 text-xs">Our algorithm works best with clear intentions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Match Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Smart Connect Results</CardTitle>
                  <CardDescription>
                    {showMatchResults 
                      ? matchMutation.isSuccess 
                        ? "We found professionals that match your criteria"
                        : "Finding the best professional matches for you..."
                      : "Fill out the form to discover tailored professional connections"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showMatchResults ? (
                    <div className="text-center py-12">
                      <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">Define your criteria</h3>
                      <p className="text-gray-500 mt-2">
                        Fill out the form to find professionals that match your needs
                      </p>
                    </div>
                  ) : matchMutation.isPending ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex gap-4 items-center">
                              <Skeleton className="h-16 w-16 rounded-full" />
                              <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                                <div className="flex gap-1 mt-2">
                                  <Skeleton className="h-3 w-12 rounded-full" />
                                  <Skeleton className="h-3 w-12 rounded-full" />
                                  <Skeleton className="h-3 w-12 rounded-full" />
                                </div>
                              </div>
                              <div className="w-20">
                                <Skeleton className="h-8 w-full rounded-md" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : matchMutation.isSuccess && matchMutation.data.length > 0 ? (
                    <div className="space-y-4">
                      {matchMutation.data.map((match) => (
                        <Card key={match.id} className="border border-gray-200 overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex gap-4 items-center">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={match.photoURL || undefined} />
                                <AvatarFallback className="text-lg">{getInitials(match.name)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-grow">
                                <h4 className="font-medium">{match.name}</h4>
                                <p className="text-sm text-gray-600">{match.title}</p>
                                
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {match.skills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="text-xs font-normal">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center mt-3 text-xs text-gray-500">
                                  <MapPin size={12} className="mr-1" />
                                  {match.location}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="mb-1 relative w-16 h-16">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold">{match.matchPercentage}%</span>
                                  </div>
                                  <Progress 
                                    value={match.matchPercentage} 
                                    className="w-16 h-16 rounded-full [&>div]:bg-primary [&>div]:rounded-full" 
                                  />
                                </div>
                                <button 
                                  className="mt-2 w-full px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium transition-all text-sm flex items-center justify-center"
                                  onClick={() => setLocation(`/profile/${match.id}`)}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1" />
                                  <span>Connect</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Match Details */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h5 className="text-xs font-medium mb-2">Match Details</h5>
                              <div className="grid grid-cols-4 gap-2">
                                {match.matchDetails.complementaryMatch && (
                                  <div>
                                    <p className="text-xs text-gray-500">Goals Match</p>
                                    <div className="flex items-center mt-1">
                                      <Progress value={match.matchDetails.complementaryMatch} className="h-1 mr-2" />
                                      <span className="text-xs">{match.matchDetails.complementaryMatch}%</span>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-500">Industry</p>
                                  <div className="flex items-center mt-1">
                                    <Progress value={match.matchDetails.industryMatch} className="h-1 mr-2" />
                                    <span className="text-xs">{match.matchDetails.industryMatch}%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Domain</p>
                                  <div className="flex items-center mt-1">
                                    <Progress value={match.matchDetails.domainMatch} className="h-1 mr-2" />
                                    <span className="text-xs">{match.matchDetails.domainMatch}%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Experience</p>
                                  <div className="flex items-center mt-1">
                                    <Progress value={match.matchDetails.experienceMatch} className="h-1 mr-2" />
                                    <span className="text-xs">{match.matchDetails.experienceMatch}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                      <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No matches found</h3>
                      <p className="text-gray-500 mt-2">
                        Try adjusting your criteria to find more professionals
                      </p>
                    </div>
                  )}
                </CardContent>
                {showMatchResults && matchMutation.isSuccess && matchMutation.data.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-gray-500">Showing top {matchMutation.data.length} matches</p>
                    <button 
                      className="px-4 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm font-medium transition-all text-sm flex items-center gap-1.5"
                    >
                      <span>View More</span>
                      <ChevronRight size={14} />
                    </button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;