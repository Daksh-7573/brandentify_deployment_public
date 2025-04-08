import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Search as SearchIcon, Users, MessageSquare, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Types for search
type SearchCategory = "pulses" | "profiles" | "hashtags";

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

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("pulses");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Parse URL search params on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    const category = url.searchParams.get("category") as SearchCategory;
    
    if (q) {
      setSearchQuery(q);
      setSubmittedQuery(q);
    }
    
    if (category && ["pulses", "profiles", "hashtags"].includes(category)) {
      setActiveCategory(category);
    }
  }, []);

  // Query for search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', activeCategory, submittedQuery],
    queryFn: async () => {
      if (!submittedQuery) return { pulses: [], profiles: [], hashtags: [] };
      const response = await fetch(`/api/search?q=${encodeURIComponent(submittedQuery)}&category=${activeCategory}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return response.json();
    },
    enabled: !!submittedQuery,
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    if (submittedQuery) {
      setLocation(`/search?q=${encodeURIComponent(submittedQuery)}&category=${value}`);
    }
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search</h1>
          <p className="text-gray-600">Find pulses, profiles, and hashtags in the Brandentifier network</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Tabs for different search categories */}
        <Tabs defaultValue={activeCategory} onValueChange={handleTabChange} value={activeCategory}>
          <TabsList className="mb-6">
            <TabsTrigger value="pulses" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Pulses
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users size={16} />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash size={16} />
              Hashtags
            </TabsTrigger>
          </TabsList>

          {/* Pulses Results */}
          <TabsContent value="pulses">
            {!submittedQuery ? (
              <div className="text-center py-12">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Search for pulses</h3>
                <p className="text-gray-500 mt-2">
                  Enter keywords to find pulses related to specific topics or interests
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults?.pulses?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.pulses.map((pulse) => (
                  <Card key={pulse.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={pulse.user?.photoURL || undefined} />
                          <AvatarFallback>{getInitials(pulse.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{pulse.title}</CardTitle>
                          <CardDescription>
                            {pulse.user?.name} • {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{pulse.content}</p>
                    </CardContent>
                    <CardFooter>
                      <Badge variant="outline" className="mr-2">{pulse.type}</Badge>
                    </CardFooter>
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
                  Find professionals by name, title, location, or industry
                </p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="bg-gray-100 h-24"></div>
                    <div className="px-6 pb-6">
                      <div className="flex justify-center -mt-10 mb-4">
                        <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
                      </div>
                      <div className="text-center space-y-2">
                        <Skeleton className="h-4 w-[150px] mx-auto" />
                        <Skeleton className="h-4 w-[100px] mx-auto" />
                        <Skeleton className="h-4 w-[180px] mx-auto" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchResults?.profiles?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.profiles.map((profile) => (
                  <Card key={profile.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 h-24"></div>
                    <div className="px-6 pb-6">
                      <div className="flex justify-center -mt-10 mb-4">
                        <Avatar className="h-20 w-20 border-4 border-white">
                          <AvatarImage src={profile.photoURL || undefined} />
                          <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">{profile.name}</h3>
                        {profile.title && (
                          <p className="text-gray-600 mt-1">{profile.title}</p>
                        )}
                        {(profile.location || profile.industry) && (
                          <p className="text-gray-500 text-sm mt-2">
                            {profile.location && profile.location}
                            {profile.location && profile.industry && " • "}
                            {profile.industry && profile.industry}
                          </p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setLocation(`/profile/${profile.id}`)}
                        >
                          View Profile
                        </Button>
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
            ) : searchResults?.hashtags?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.hashtags.map((tag) => (
                  <Card key={tag.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">#{tag.name}</h3>
                          <p className="text-gray-500 text-sm">{tag.count} {tag.count === 1 ? 'post' : 'posts'}</p>
                        </div>
                        <Hash className="h-8 w-8 text-primary/40" />
                      </div>
                    </CardContent>
                  </Card>
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
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;