import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Hash, Plus, Search, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PulseItem from "@/components/shared/pulse-item";

function DiscoverPage() {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personalized");
  const [hashtagInput, setHashtagInput] = useState("");
  
  const userId = isDemo ? 1 : user?.uid;
  
  // Fetch personalized feed
  const { 
    data: personalizedFeed, 
    isLoading: personalizedFeedLoading, 
    error: personalizedFeedError 
  } = useQuery({
    queryKey: ["/api/personalized-feed", userId],
    queryFn: () => apiRequest(`/api/personalized-feed/${userId}`),
    enabled: !!userId
  });
  
  // Fetch all hashtags
  const { data: hashtags, isLoading: hashtagsLoading } = useQuery({
    queryKey: ["/api/hashtags"],
    queryFn: () => apiRequest("/api/hashtags")
  });
  
  // Fetch hashtags followed by user
  const { data: followedHashtags, isLoading: followedHashtagsLoading } = useQuery({
    queryKey: ["/api/users", userId, "hashtag-follows"],
    queryFn: () => apiRequest(`/api/users/${userId}/hashtag-follows`),
    enabled: !!userId
  });
  
  // Follow a hashtag
  const followHashtagMutation = useMutation({
    mutationFn: (hashtagId: number) => 
      apiRequest(`/api/hashtags/${hashtagId}/follow`, {
        method: "POST",
        body: JSON.stringify({ userId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "hashtag-follows"] });
      toast({
        title: "Success",
        description: "You're now following this hashtag",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to follow hashtag",
        variant: "destructive"
      });
    }
  });
  
  // Unfollow a hashtag
  const unfollowHashtagMutation = useMutation({
    mutationFn: (hashtagId: number) => 
      apiRequest(`/api/hashtags/${hashtagId}/follow`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "hashtag-follows"] });
      toast({
        title: "Success",
        description: "You've unfollowed this hashtag",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to unfollow hashtag",
        variant: "destructive"
      });
    }
  });
  
  // Check if a hashtag is followed by the user
  const isHashtagFollowed = (hashtagId: number) => {
    return followedHashtags?.some((follow: any) => follow.hashtagId === hashtagId);
  };
  
  // Handle follow/unfollow
  const toggleHashtagFollow = (hashtagId: number) => {
    if (isHashtagFollowed(hashtagId)) {
      unfollowHashtagMutation.mutate(hashtagId);
    } else {
      followHashtagMutation.mutate(hashtagId);
    }
  };
  
  // Filter hashtags by search input
  const filteredHashtags = hashtags?.filter((hashtag: any) => 
    hashtag.tag.toLowerCase().includes(hashtagInput.toLowerCase())
  ) || [];
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover & Connect</h1>
            <p className="text-muted-foreground mt-1">
              Explore personalized content, trending topics, and people to follow
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="personalized" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>For You</span>
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash size={16} />
              <span>Hashtags</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users size={16} />
              <span>People</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Personalized Feed Tab */}
          <TabsContent value="personalized" className="space-y-4">
            {personalizedFeedLoading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="mt-4">
                      <Skeleton className="h-[200px] w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : personalizedFeedError ? (
              // Error state
              <Card className="p-6 text-center">
                <p className="text-red-500">
                  Failed to load personalized feed. Please try again later.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/personalized-feed", userId] })}
                >
                  Retry
                </Button>
              </Card>
            ) : personalizedFeed?.length === 0 ? (
              // Empty state
              <Card className="p-10 text-center">
                <h3 className="text-xl font-semibold mb-2">No personalized content yet</h3>
                <p className="text-muted-foreground mb-6">
                  Follow hashtags and connect with people to see relevant content here
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab("hashtags")}
                  >
                    <Hash size={16} />
                    <span>Find Hashtags</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab("profiles")}
                  >
                    <Users size={16} />
                    <span>Find People</span>
                  </Button>
                </div>
              </Card>
            ) : (
              // Populated feed
              <div className="space-y-6">
                {personalizedFeed?.map((pulse: any) => (
                  <PulseItem
                    key={pulse.id}
                    pulse={pulse}
                    userId={userId}
                    showComments={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Hashtags Tab */}
          <TabsContent value="hashtags">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search hashtags..."
                    className="pl-10"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Followed Hashtags Section */}
              {followedHashtags?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Hashtags You Follow</h3>
                  <div className="flex flex-wrap gap-2">
                    {followedHashtagsLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                      ))
                    ) : (
                      followedHashtags?.map((follow: any) => {
                        const hashtag = hashtags?.find((h: any) => h.id === follow.hashtagId);
                        return hashtag ? (
                          <Badge
                            key={hashtag.id}
                            variant="secondary"
                            className="px-3 py-1 text-sm flex items-center gap-2 cursor-pointer hover:bg-secondary/80"
                            onClick={() => toggleHashtagFollow(hashtag.id)}
                          >
                            <Hash size={14} />
                            {hashtag.tag}
                            <Check size={14} className="text-green-500 ml-1" />
                          </Badge>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              )}
              
              <Separator className="my-2" />
              
              {/* All Hashtags Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Explore Hashtags</h3>
                {hashtagsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array(12).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-full" />
                    ))}
                  </div>
                ) : filteredHashtags.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">
                    {hashtagInput ? "No hashtags match your search" : "No hashtags found"}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredHashtags.map((hashtag: any) => {
                      const isFollowed = isHashtagFollowed(hashtag.id);
                      return (
                        <Badge
                          key={hashtag.id}
                          variant={isFollowed ? "secondary" : "outline"}
                          className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-secondary/80 ${
                            isFollowed ? "bg-secondary" : ""
                          }`}
                          onClick={() => toggleHashtagFollow(hashtag.id)}
                        >
                          <span className="flex items-center gap-1">
                            <Hash size={14} />
                            {hashtag.tag}
                          </span>
                          {isFollowed ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Plus size={14} />
                          )}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search profiles..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Profile discovery coming soon</h3>
                <p className="text-muted-foreground">
                  This feature is currently in development. Check back later!
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default DiscoverPage;