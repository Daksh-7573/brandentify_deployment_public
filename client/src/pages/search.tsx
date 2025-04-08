import { useState } from "react";
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
import { Search, Users, MessageSquare, Hash } from "lucide-react";

type SearchCategory = "all" | "pulses" | "profiles" | "hashtags";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

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

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Search</h1>
          <p className="text-muted-foreground">Find pulses, profiles, and hashtags in the Brandentifier community</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for pulses, profiles, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pulses">Pulses</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {submittedQuery ? (
              isLoading ? (
                <SearchResultsSkeleton count={6} />
              ) : (
                <>
                  {/* Pulse Results */}
                  {(searchResults?.pulses?.length || 0) > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        <h2 className="text-xl font-semibold">Pulses</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {searchResults?.pulses?.slice(0, 4).map((pulse: any) => (
                          <PulseCard key={pulse.id} pulse={pulse} />
                        ))}
                      </div>
                      {(searchResults?.pulses?.length || 0) > 4 && (
                        <div className="text-center mb-6">
                          <Button variant="outline" onClick={() => handleTabChange("pulses")}>
                            View all {searchResults?.pulses?.length} pulse results
                          </Button>
                        </div>
                      )}
                      <Separator className="my-6" />
                    </div>
                  )}

                  {/* Profile Results */}
                  {(searchResults?.profiles?.length || 0) > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Users className="mr-2 h-5 w-5" />
                        <h2 className="text-xl font-semibold">Profiles</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {searchResults?.profiles?.slice(0, 3).map((profile: any) => (
                          <ProfileCard key={profile.id} profile={profile} />
                        ))}
                      </div>
                      {(searchResults?.profiles?.length || 0) > 3 && (
                        <div className="text-center mb-6">
                          <Button variant="outline" onClick={() => handleTabChange("profiles")}>
                            View all {searchResults?.profiles?.length} profile results
                          </Button>
                        </div>
                      )}
                      <Separator className="my-6" />
                    </div>
                  )}

                  {/* Hashtag Results */}
                  {(searchResults?.hashtags?.length || 0) > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Hash className="mr-2 h-5 w-5" />
                        <h2 className="text-xl font-semibold">Hashtags</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {searchResults?.hashtags?.slice(0, 10).map((hashtag: any) => (
                          <Badge key={hashtag.id} className="text-sm py-1 px-3 cursor-pointer hover:bg-primary/90">
                            #{hashtag.name} <span className="ml-1 text-xs opacity-70">({hashtag.count})</span>
                          </Badge>
                        ))}
                      </div>
                      {(searchResults?.hashtags?.length || 0) > 10 && (
                        <div className="text-center mb-6">
                          <Button variant="outline" onClick={() => handleTabChange("hashtags")}>
                            View all {searchResults?.hashtags?.length} hashtag results
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Results */}
                  {(!searchResults?.pulses?.length && !searchResults?.profiles?.length && !searchResults?.hashtags?.length) && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No results found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find anything matching "{submittedQuery}". Try different keywords or check your spelling.
                      </p>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h2 className="text-xl font-medium mb-2">Search the Brandentifier community</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter keywords in the search box above to find pulses, profiles, and trending hashtags
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pulses">
            {submittedQuery ? (
              isLoading ? (
                <SearchResultsSkeleton count={6} />
              ) : (
                <>
                  {(searchResults?.pulses?.length || 0) > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults?.pulses?.map((pulse: any) => (
                        <PulseCard key={pulse.id} pulse={pulse} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No pulses found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any pulses matching "{submittedQuery}". Try different keywords.
                      </p>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h2 className="text-xl font-medium mb-2">Search for pulses</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Find industry insights, polls, and project updates from the community
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profiles">
            {submittedQuery ? (
              isLoading ? (
                <SearchResultsSkeleton count={6} />
              ) : (
                <>
                  {(searchResults?.profiles?.length || 0) > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults?.profiles?.map((profile: any) => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No profiles found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any profiles matching "{submittedQuery}". Try different keywords.
                      </p>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h2 className="text-xl font-medium mb-2">Search for profiles</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect with professionals in your industry or discover new talent
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hashtags">
            {submittedQuery ? (
              isLoading ? (
                <SearchResultsSkeleton count={12} />
              ) : (
                <>
                  {(searchResults?.hashtags?.length || 0) > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults?.hashtags?.map((hashtag: any) => (
                        <Card key={hashtag.id} className="border hover:shadow-sm transition-shadow duration-200 cursor-pointer">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Hash className="mr-2 h-5 w-5" />
                              #{hashtag.name}
                            </CardTitle>
                            <CardDescription>Used in {hashtag.count} posts</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="outline" size="sm">View Posts</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No hashtags found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any hashtags matching "{submittedQuery}". Try different keywords.
                      </p>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-16">
                <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h2 className="text-xl font-medium mb-2">Search for hashtags</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Discover trending topics and join the conversation
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Card components for search results
const PulseCard = ({ pulse }: { pulse: any }) => {
  const [location, setLocation] = useLocation();

  return (
    <Card className="overflow-hidden border hover:shadow-sm transition-shadow duration-200 cursor-pointer"
          onClick={() => setLocation(`/pulse/${pulse.id}`)}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={pulse.user?.photoURL} alt={pulse.user?.name} />
              <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{pulse.user?.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(pulse.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{pulse.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription className="line-clamp-2">
          {pulse.description}
        </CardDescription>
        {pulse.tags && pulse.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {pulse.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProfileCard = ({ profile }: { profile: any }) => {
  const [location, setLocation] = useLocation();

  return (
    <Card className="border hover:shadow-sm transition-shadow duration-200 cursor-pointer"
          onClick={() => setLocation(`/profile/${profile.username}`)}>
      <CardHeader className="text-center">
        <Avatar className="h-16 w-16 mx-auto mb-2">
          <AvatarImage src={profile.photoURL} alt={profile.name} />
          <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{profile.name}</CardTitle>
        <CardDescription>{profile.title || "Brandentifier Member"}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {profile.location && (
          <p className="text-sm text-muted-foreground mb-2">{profile.location}</p>
        )}
        {profile.industry && (
          <Badge variant="outline" className="mx-auto mt-1">
            {profile.industry}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" size="sm">View Profile</Button>
      </CardFooter>
    </Card>
  );
};

// Skeleton loader for search results
const SearchResultsSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full mr-2" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-full mt-3" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1 mt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchPage;