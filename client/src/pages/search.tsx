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
import { GridSkeleton, ProfileCardSkeleton, Skeleton } from "@/components/ui/skeleton-components";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search as SearchIcon, Users, MessageSquare, Hash, UserPlus, Star, MapPin, ArrowUpRight, ArrowDownRight, Plus, Check, ChevronRight, Sparkles, Building, FileCode, Image } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobTitleCombobox } from "@/components/ui/job-title-combobox";
import Header from "@/components/layout/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Constants for form options
import { INDUSTRIES, INDUSTRY_DOMAINS as DOMAINS_BY_INDUSTRY, LOOKING_FOR_OPTIONS, EXPERIENCE_LEVELS } from "@shared/constants";

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
  smartConnect?: Array<{
    id: number;
    name: string;
    title: string | null;
    location: string | null;
    photoURL: string | null;
    skills: string[];
    matchPercentage: number;
    matchDetails: {
      industryMatch: number;
      domainMatch: number;
      experienceMatch: number;
      complementaryMatch?: number;
    }
  }>;
};

function SearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("pulses");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultsType | null>(null);
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;
  
  // Smart connect state
  const [showMatchForm, setShowMatchForm] = useState(activeCategory === "smart-connect");
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [industry, setIndustry] = useState("");
  const [domain, setDomain] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  
  // Update domains when industry changes
  useEffect(() => {
    if (industry && DOMAINS_BY_INDUSTRY[industry]) {
      setDomains(DOMAINS_BY_INDUSTRY[industry]);
      setDomain(""); // Reset domain when industry changes
    } else {
      setDomains([]);
    }
  }, [industry]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveCategory(value as SearchCategory);
    
    // Reset search results when changing tabs
    if (activeCategory !== value) {
      setSubmittedQuery("");
      setSearchResults(null);
    }
    
    // Toggle smart connect form visibility
    if (value === "smart-connect") {
      setShowMatchForm(true);
    } else {
      setShowMatchForm(false);
      setShowMatchResults(false);
    }
  };
  
  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }
    
    setSubmittedQuery(query);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${activeCategory}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Search failed",
        description: "There was an error processing your search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Smart match mutation
  const matchMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        userId: user?.id,
        industry,
        domain,
        targetJobTitle: jobTitle,
        experienceLevel: experience,
        lookingFor,
        skills: [],
        location: ""
      };
      
      const response = await fetch("/api/smart-connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error('Failed to find matches');
      }
      
      const data = await response.json();
      return data.matches || [];
    },
    onSuccess: (data) => {
      setShowMatchResults(true);
      toast({
        title: "Match results ready",
        description: `Found ${data.length} potential connections for you`
      });
    },
    onError: () => {
      toast({
        title: "Matching failed",
        description: "Could not find matches with the provided criteria",
        variant: "destructive"
      });
    }
  });
  
  // Handle smart match form submission
  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry || !domain || !jobTitle || !experience || !lookingFor) {
      toast({
        title: "Incomplete form",
        description: "Please fill out all fields for better matching",
        variant: "destructive"
      });
      return;
    }
    
    matchMutation.mutate();
  };
  
  // Helper function to get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Hashtag card component
  const HashtagItem = ({ tag, showFollowButton = true }: { tag: { id: number, name: string, count: number }, showFollowButton?: boolean }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
    
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
        
        setIsFollowLoading(true);
        const res = await fetch(`/api/hashtags/${tag.id}/follow?userId=${userId}`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        } as RequestInit);
        
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
      onError: () => {
        toast({
          title: "Error",
          description: "Could not follow hashtag",
          variant: "destructive"
        });
      },
      onSettled: () => {
        setIsFollowLoading(false);
      }
    });
    
    // Unfollow hashtag mutation
    const unfollowMutation = useMutation({
      mutationFn: async () => {
        if (!userId) return;
        
        setIsFollowLoading(true);
        const res = await fetch(`/api/hashtags/${tag.id}/follow?userId=${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        } as RequestInit);
        
        return res.json();
      },
      onSuccess: () => {
        setIsFollowing(false);
        toast({
          title: "Success",
          description: `You have unfollowed #${tag.name}`,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/hashtags/${tag.id}/is-following`] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not unfollow hashtag",
          variant: "destructive"
        });
      },
      onSettled: () => {
        setIsFollowLoading(false);
      }
    });
    
    // Handle follow/unfollow toggle
    const handleFollowToggle = () => {
      if (isFollowing) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    };
    
    return (
      <Card className="group overflow-hidden border border-white/20 bg-gray-900/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] hover:bg-gray-800/60">
        <CardContent className="p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">#{tag.name}</h3>
              <p className="text-xs text-gray-300">{tag.count} {tag.count === 1 ? 'post' : 'posts'}</p>
            </div>
          </div>
          
          {showFollowButton && userId ? (
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center ${
                isFollowing 
                  ? 'text-white bg-gray-800/80 border border-white/20 hover:bg-gray-700/80 hover:shadow-md' 
                  : 'bg-white/20 text-white hover:bg-white/30 hover:shadow-md'
              }`}
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
            >
              <span className="relative flex items-center justify-center">
                {isFollowLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
              <Hash className="h-5 w-5 text-white" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        {/* Main content area - Mobile responsive */}
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-2 sm:mx-4 lg:mx-6"> {/* Responsive margins */}
            {/* Main content */}
            <div className="flex-1 max-w-4xl">
              <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Discover & Connect</h1>
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    Find content, professionals, and networking opportunities in one place
                  </p>
                </div>
              </div>

              {/* Main Tabs: Search vs Smart Connect */}
              <Tabs 
                value={activeCategory === "smart-connect" ? "smart-connect" : "search"} 
                onValueChange={(value) => {
                  if (value === "smart-connect") {
                    setActiveCategory("smart-connect");
                    setShowMatchForm(true);
                    setShowMatchResults(false);
                  } else {
                    setActiveCategory("pulses");
                    setShowMatchForm(false);
                    setShowMatchResults(false);
                  }
                }}
                className="w-full"
              >
                <TabsList className="mb-6 dark-tabs-list">
                  <TabsTrigger 
                    value="search" 
                    className="dark-tabs-trigger"
                  >
                    <SearchIcon size={16} className="mr-1.5" />
                    <span>Search</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="smart-connect" 
                    className="dark-tabs-trigger"
                  >
                    <Users size={16} className="mr-1.5" />
                    <span>Smart Connect</span>
                  </TabsTrigger>
                </TabsList>

                {/* Search Tab */}
                <TabsContent value="search" className="space-y-4 sm:space-y-6">
                  {/* Search Form - Mobile responsive */}
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-4 sm:mb-6">
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search pulses, profiles, or hashtags..."
                      className="neo-glass-input flex-1 text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      className="neo-glass-button flex items-center justify-center gap-2 py-2 px-4 w-full sm:w-auto min-h-[40px] text-sm sm:text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          <span className="hidden sm:inline">Searching...</span>
                          <span className="sm:hidden">...</span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <SearchIcon className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Search</span>
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Search Category Tabs - Mobile responsive */}
                  <Tabs defaultValue={activeCategory === "smart-connect" ? "pulses" : activeCategory} onValueChange={handleTabChange}>
                    <TabsList className="mb-4 sm:mb-6 dark-tabs-list w-full grid grid-cols-3 h-auto">
                      <TabsTrigger 
                        value="pulses" 
                        className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-2 px-2 text-xs sm:text-sm"
                      >
                        <MessageSquare size={14} className="sm:mr-1" />
                        <span className="text-center">Pulses</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="profiles" 
                        className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-2 px-2 text-xs sm:text-sm"
                      >
                        <Users size={14} className="sm:mr-1" />
                        <span className="text-center">Profiles</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="hashtags" 
                        className="dark-tabs-trigger flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-2 px-2 text-xs sm:text-sm"
                      >
                        <Hash size={14} className="sm:mr-1" />
                        <span className="text-center">Hashtags</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Pulses Results */}
                    <TabsContent value="pulses">
                      {!submittedQuery ? (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <MessageSquare className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">Search for pulses</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Discover polls, media shares, and projects from professionals
                            </p>
                          </div>
                        </NeoGlassSection>
                      ) : isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Card key={i} className="bg-gray-900/60 backdrop-blur-md border border-white/10 shadow-xl">
                              <CardContent className="py-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                                  <div>
                                    <Skeleton className="h-4 w-32 bg-white/10 rounded-md" />
                                    <Skeleton className="h-3 w-24 bg-white/10 rounded-md mt-1" />
                                  </div>
                                </div>
                                <Skeleton className="h-5 w-2/3 bg-white/10 rounded-md mt-3" />
                                <Skeleton className="h-4 w-full bg-white/10 rounded-md mt-2" />
                                <Skeleton className="h-40 w-full bg-white/10 rounded-md mt-3" />
                                <div className="flex gap-3 mt-3">
                                  <Skeleton className="h-8 w-16 bg-white/10 rounded-full" />
                                  <Skeleton className="h-8 w-16 bg-white/10 rounded-full" />
                                  <Skeleton className="h-8 w-16 bg-white/10 rounded-full" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : searchResults && searchResults.pulses && searchResults.pulses.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {searchResults.pulses.map((pulse) => (
                            <NeoGlassSection key={pulse.id} className="overflow-hidden mb-4 sm:mb-6">
                              <div className="pb-2 sm:pb-3">
                                <div className="flex justify-between">
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                                      {pulse.user?.photoURL ? (
                                        <AvatarImage src={pulse.user.photoURL} alt={pulse.user.name || "User"} />
                                      ) : (
                                        <AvatarFallback>
                                          {pulse.user?.name?.[0] || "U"}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-white text-sm sm:text-base truncate">
                                        {pulse.user?.name || "Anonymous User"}
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-white/70">
                                        <span className="truncate">
                                          {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
                                        </span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="flex items-center gap-1 text-xs">
                                          {pulse.type === 'poll' && <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />}
                                          {pulse.type === 'media-pulse' && <Image className="h-3 w-3 sm:h-4 sm:w-4" />}
                                          {pulse.type === 'project' && <FileCode className="h-3 w-3 sm:h-4 sm:w-4" />}
                                          <span className="hidden sm:inline">{pulse.type}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="px-3 sm:px-4 py-2">
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white line-clamp-2">{pulse.title}</h3>
                                <p className="text-white/70 text-sm sm:text-base line-clamp-3">{pulse.content}</p>
                              </div>
                              <div className="flex justify-between pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm"
                                  onClick={() => setLocation(`/pulses/${pulse.id}`)}
                                >
                                  View details
                                </Button>
                              </div>
                            </NeoGlassSection>
                          ))}
                        </div>
                      ) : (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <MessageSquare className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">No pulses found</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Try a different search term or check for typos
                            </p>
                          </div>
                        </NeoGlassSection>
                      )}
                    </TabsContent>

                    {/* Profiles Results */}
                    <TabsContent value="profiles">
                      {!submittedQuery ? (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <Users className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">Search for profiles</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Discover professionals across various industries
                            </p>
                          </div>
                        </NeoGlassSection>
                      ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden rounded-xl shadow-xl border border-white/10 bg-gray-900/60 backdrop-blur-md">
                              <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 h-28 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -mb-10 -ml-10 blur-xl"></div>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mt-10 -mr-10 blur-xl"></div>
                              </div>
                              <div className="px-6 pb-6 relative">
                                <div className="flex justify-center -mt-12 mb-4">
                                  <Skeleton className="h-24 w-24 rounded-full border-4 border-white/20 bg-white/10" />
                                </div>
                                <div className="text-center space-y-3">
                                  <Skeleton className="h-5 w-36 mx-auto rounded-md bg-white/10" />
                                  <Skeleton className="h-4 w-28 mx-auto rounded-md bg-white/10" />
                                  <Skeleton className="h-3 w-44 mx-auto rounded-md bg-white/10" />
                                  <div className="py-2 mt-2">
                                    <Skeleton className="h-9 w-28 mx-auto rounded-full bg-white/10" />
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
                            <Card key={profile.id} className="overflow-hidden rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                              <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 h-28 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -mb-10 -ml-10 blur-xl"></div>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mt-10 -mr-10 blur-xl"></div>
                              </div>
                              <div className="px-6 pb-6 relative">
                                <div className="flex justify-center -mt-12 mb-4">
                                  <Avatar className="h-24 w-24 ring-4 ring-white/20 bg-gray-800">
                                    <AvatarImage src={profile.photoURL || undefined} />
                                    <AvatarFallback className="text-xl">{getInitials(profile.name)}</AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="text-center">
                                  <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
                                  <p className="text-gray-300">{profile.title || "Professional"}</p>
                                  
                                  {(profile.location || profile.industry) && (
                                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                                      {profile.location && (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/10 text-white rounded-full">
                                          <MapPin size={10} />
                                          {profile.location}
                                        </div>
                                      )}
                                      {profile.industry && (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/10 text-white rounded-full">
                                          <Building size={10} />
                                          {profile.industry}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="mt-4">
                                    <Button 
                                      className="w-full neo-glass-button rounded-full py-2 text-sm"
                                      onClick={() => setLocation(`/profile/${profile.id}`)}
                                    >
                                      <span>View Profile</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <Users className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">No profiles found</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Try a different search term or check for typos
                            </p>
                          </div>
                        </NeoGlassSection>
                      )}
                    </TabsContent>

                    {/* Hashtags Results */}
                    <TabsContent value="hashtags">
                      {!submittedQuery ? (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <Hash className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">Search for hashtags</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Find and follow topics that interest you
                            </p>
                          </div>
                        </NeoGlassSection>
                      ) : isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="border border-white/10 bg-gray-900/60 backdrop-blur-md shadow-xl">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                                  <div>
                                    <Skeleton className="h-4 w-24 bg-white/10 rounded-md" />
                                    <Skeleton className="h-3 w-16 bg-white/10 rounded-md mt-1" />
                                  </div>
                                </div>
                                <Skeleton className="h-8 w-24 bg-white/10 rounded-full" />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : searchResults && searchResults.hashtags && searchResults.hashtags.length > 0 ? (
                        <div className="space-y-4">
                          {searchResults.hashtags.map((tag) => (
                            <HashtagItem key={tag.id} tag={tag} />
                          ))}
                        </div>
                      ) : (
                        <NeoGlassSection>
                          <div className="flex flex-col items-center justify-center py-10">
                            <Hash className="h-16 w-16 text-white/80 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-white">No hashtags found</h3>
                            <p className="text-center text-white/70 max-w-md mb-6">
                              Try a different search term or check for typos
                            </p>
                          </div>
                        </NeoGlassSection>
                      )}
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Smart Connect Tab */}
                <TabsContent value="smart-connect">
                  <NeoGlassSection>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">Smart Connection</h2>
                      <p className="text-gray-300">
                        Find professionals who match your career needs
                      </p>
                    </div>
                    
                    {showMatchForm && (
                      <Card className="neo-glass-card-smart-connect mb-8">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-white text-xl font-semibold">Smart Connection Preferences</CardTitle>
                          <CardDescription className="text-white/70">
                            Define your criteria to discover the most relevant professional connections
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleMatchSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="industry" className="text-white">Industry</Label>
                                <Select
                                  value={industry}
                                  onValueChange={setIndustry}
                                >
                                  <SelectTrigger id="industry" className="neo-glass-input">
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900/95 text-white border-white/10">
                                    <SelectGroup>
                                      <SelectLabel>Industries</SelectLabel>
                                      {INDUSTRIES.map((ind) => (
                                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="domain" className="text-white">Domain</Label>
                                <Select
                                  disabled={!industry}
                                  value={domain}
                                  onValueChange={setDomain}
                                >
                                  <SelectTrigger id="domain" className="neo-glass-input">
                                    <SelectValue placeholder={industry ? "Select domain" : "Select industry first"} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900/95 text-white border-white/10">
                                    <SelectGroup>
                                      <SelectLabel>Domains</SelectLabel>
                                      {domains.map((dom) => (
                                        <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="job-title" className="text-white">Job Title</Label>
                                <JobTitleCombobox
                                  value={jobTitle}
                                  onChange={setJobTitle}
                                  className="neo-glass-input"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="experience" className="text-white">Experience Level</Label>
                                <Select
                                  value={experience}
                                  onValueChange={setExperience}
                                >
                                  <SelectTrigger id="experience" className="neo-glass-input">
                                    <SelectValue placeholder="Select experience level" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900/95 text-white border-white/10">
                                    <SelectGroup>
                                      <SelectLabel>Experience Levels</SelectLabel>
                                      {EXPERIENCE_LEVELS.map((exp) => (
                                        <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="looking-for" className="text-white">I'm Looking For</Label>
                                <Select
                                  value={lookingFor}
                                  onValueChange={setLookingFor}
                                >
                                  <SelectTrigger id="looking-for" className="neo-glass-input">
                                    <SelectValue placeholder="What are you looking for?" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900/95 text-white border-white/10">
                                    <SelectGroup>
                                      <SelectLabel>Connection Types</SelectLabel>
                                      {LOOKING_FOR_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                type="submit" 
                                className="neo-glass-button"
                                disabled={matchMutation.isPending}
                              >
                                {matchMutation.isPending ? (
                                  <span className="flex items-center">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                    <span>Finding matches...</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Find Matches
                                  </span>
                                )}
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                    
                    {showMatchResults && (
                      <Card className="neo-glass-card-smart-connect">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-white text-xl font-semibold">Smart Connection Results</CardTitle>
                          <CardDescription className="text-white/70">
                            Professionals who match your criteria based on intelligent analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {matchMutation.isPending ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <Card key={i} className="neo-glass-card-smart-connect overflow-hidden">
                                  <CardContent className="p-4">
                                    <div className="flex gap-4 items-center">
                                      <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
                                      <div className="flex-grow">
                                        <Skeleton className="h-4 w-40 mb-2 bg-white/10" />
                                        <Skeleton className="h-3 w-24 bg-white/10" />
                                        <div className="flex gap-1 mt-2">
                                          <Skeleton className="h-3 w-12 rounded-full bg-white/10" />
                                          <Skeleton className="h-3 w-12 rounded-full bg-white/10" />
                                          <Skeleton className="h-3 w-12 rounded-full bg-white/10" />
                                        </div>
                                      </div>
                                      <div className="w-20">
                                        <Skeleton className="h-8 w-full rounded-md bg-white/10" />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : matchMutation.isSuccess && matchMutation.data && matchMutation.data.length > 0 ? (
                            <div className="space-y-4">
                              {matchMutation.data.map((match: any) => (
                                <Card key={match.user.id} className="neo-glass-card-smart-connect overflow-hidden hover:scale-[1.02] transition-all duration-300">
                                  <CardContent className="p-4">
                                    <div className="flex gap-4 items-center">
                                      <Avatar className="h-16 w-16 border-2 border-white/20">
                                        <AvatarImage src={match.user.photoURL || undefined} />
                                        <AvatarFallback className="text-lg bg-white/10 text-white">{getInitials(match.user.name || "User")}</AvatarFallback>
                                      </Avatar>
                                      
                                      <div className="flex-grow">
                                        <h4 className="font-medium text-white">{match.user.name}</h4>
                                        <p className="text-sm text-gray-300">{match.user.title}</p>
                                        
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {match.strengthAreas?.map((area: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs font-normal bg-white/10 text-white border-white/20">
                                              {area}
                                            </Badge>
                                          ))}
                                        </div>
                                        
                                        <div className="flex items-center mt-3 text-xs text-gray-300">
                                          <MapPin size={12} className="mr-1" />
                                          {match.user.location}
                                        </div>
                                      </div>
                                      
                                      <div className="text-center">
                                        <div className="mb-1 relative w-16 h-16">
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{Math.round(match.score * 100)}%</span>
                                          </div>
                                          <Progress 
                                            value={match.score * 100} 
                                            className="w-16 h-16 rounded-full [&>div]:bg-white/60 [&>div]:rounded-full" 
                                          />
                                        </div>
                                        <button 
                                          className="mt-2 w-full px-4 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-sm font-medium transition-all text-sm flex items-center justify-center"
                                          onClick={() => setLocation(`/profile/${match.user.id}`)}
                                        >
                                          <Plus className="h-3.5 w-3.5 mr-1" />
                                          <span>Connect</span>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Match Details */}
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                      <h5 className="text-xs font-medium mb-2 text-white">Why This Match</h5>
                                      {match.compatibilityInsights && match.compatibilityInsights.length > 0 && (
                                        <div className="mb-3">
                                          <p className="text-xs text-gray-300 mb-1">Compatibility Insights:</p>
                                          <ul className="space-y-1">
                                            {match.compatibilityInsights.slice(0, 2).map((insight: string, i: number) => (
                                              <li key={i} className="text-xs text-white flex items-start">
                                                <span className="text-white/60 mr-2">•</span>
                                                <span>{insight}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {match.matchReasons && match.matchReasons.length > 0 && (
                                        <div>
                                          <p className="text-xs text-gray-300 mb-1">Match Reasons:</p>
                                          <ul className="space-y-1">
                                            {match.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                                              <li key={i} className="text-xs text-white flex items-start">
                                                <span className="text-white/60 mr-2">•</span>
                                                <span>{reason}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10">
                              <UserPlus className="h-16 w-16 text-white/80 mb-4" />
                              <h3 className="text-xl font-semibold mb-2 text-white">No matches found</h3>
                              <p className="text-center text-white/70 max-w-md mb-6">
                                Try adjusting your criteria to find more professionals
                              </p>
                            </div>
                          )}
                        </CardContent>
                        {showMatchResults && matchMutation.isSuccess && matchMutation.data && matchMutation.data.length > 0 && (
                          <CardFooter className="flex justify-between">
                            <p className="text-sm text-gray-300">Showing top {matchMutation.data.length} matches</p>
                            <button 
                              className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-sm font-medium transition-all text-sm flex items-center gap-1.5 text-white"
                            >
                              <span>View More</span>
                              <ChevronRight size={14} />
                            </button>
                          </CardFooter>
                        )}
                      </Card>
                    )}
                  </NeoGlassSection>
                </TabsContent>
              </Tabs>
            </div>
          </NeoGlassLayout>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
