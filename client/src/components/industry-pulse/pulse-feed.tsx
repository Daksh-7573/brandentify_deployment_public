import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Filter, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import PulseEngagementButton from "./pulse-engagement-button";
import { useFeedAlgorithm, formatFeedDate, sortByRelevance } from "@/hooks/feed";

// Types for pulse items
interface PulseItem {
  id: number;
  userId: number;
  type: "poll" | "media-pulse" | "project" | "news-pulse";
  title: string;
  content: string | null;
  createdAt: string | Date;
  insightfulCount: number;
  misinformedCount: number;
  shareCount: number;
  comments: number;
  industry?: string | null;
  category?: string | null;
  // Media specific
  mediaType?: "image" | "video" | null;
  mediaUrls?: string[];
  // Poll specific
  pollOptions?: string[];
  // Hashtags
  hashtags?: string[] | any[];
  // Relevance scoring
  relevanceScore?: number;
  // User info for display
  user?: {
    name: string | null;
    photoURL: string | null;
  };
}

export default function PulseFeed() {
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to demo user if not logged in
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [relevanceSort, setRelevanceSort] = useState(true);
  
  // Get user's engagement quota
  const { data: userQuota } = useQuery({
    queryKey: [`/api/users/${userId}/reaction-quota`],
    refetchOnWindowFocus: false
  });
  
  // Determine filter based on active tab
  const getFilter = () => {
    if (activeTab === "media") return { type: "media-pulse" };
    if (activeTab === "polls") return { type: "poll" };
    if (activeTab === "projects") return { type: "project" };
    if (activeTab === "news") return { type: "news-pulse" };
    return undefined; // "all" tab
  };
  
  // Fetch user's followed hashtags
  const { data: followedHashtags = [] } = useQuery<string[]>({
    queryKey: [`/api/users/${userId}/followed-hashtags`],
    refetchOnWindowFocus: false
  });
  
  // User preferences for relevance sorting
  const userPreferences = {
    interests: (user as any)?.interests || [],
    industry: (user as any)?.industry || "",
    followedUsers: (user as any)?.following || [],
    followedHashtags: followedHashtags
  };
  
  // Use the shared feed algorithm hook
  const { 
    items: pulseItems, 
    isLoading, 
    hasNewContent,
    refetch,
    handleRefresh 
  } = useFeedAlgorithm<PulseItem>({
    queryKey: ["/api/pulses"],
    filters: getFilter(),
    fetchUserData: async (items) => {
      // Fetch user data for each item
      for (const item of items) {
        if (!item.user) {
          try {
            const response = await fetch(`/api/users/${item.userId}`);
            if (response.ok) {
              const userData = await response.json();
              item.user = {
                name: userData.name,
                photoURL: userData.photoURL
              };
            }
          } catch (error) {
            console.error("Error fetching user data for pulse item:", error);
          }
        }
      }
      
      // If relevance sort is enabled, calculate relevance scores
      if (relevanceSort) {
        sortByRelevance(items, userPreferences);
      }
    },
    refreshInterval: 120000, // Refresh every 2 minutes
    sortFunction: relevanceSort 
      ? (a, b) => {
          // Relevance mode: use calculated relevance scores
          if (a.relevanceScore && b.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          // Otherwise fall back to date sorting
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      : (a, b) => {
          // Personalized Recency mode: Recent + from followed users/hashtags first
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          
          const aIsFollowed = userPreferences.followedUsers?.includes(a.userId);
          const bIsFollowed = userPreferences.followedUsers?.includes(b.userId);
          
          // Boost items from followed users by treating them as if posted 12 hours earlier
          const aAdjustedDate = aIsFollowed ? aDate + (12 * 60 * 60 * 1000) : aDate;
          const bAdjustedDate = bIsFollowed ? bDate + (12 * 60 * 60 * 1000) : bDate;
          
          return bAdjustedDate - aAdjustedDate;
        }
  });
  
  // Toggle between relevance and recency sorting
  const toggleSortMode = () => {
    setRelevanceSort(!relevanceSort);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Industry Pulse</CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={toggleSortMode}
            >
              <Filter className="h-4 w-4" />
              <span>{relevanceSort ? "Relevance" : "Recency"}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${hasNewContent ? "text-blue-500" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {/* Skeleton loaders for pulse cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="p-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted"></div>
                        <div>
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded mt-1"></div>
                        </div>
                      </div>
                      <div className="h-5 w-16 bg-muted rounded"></div>
                    </div>
                    
                    {/* Title and content skeleton */}
                    <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-full bg-muted rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-muted rounded mb-4"></div>
                    
                    {/* Media placeholder skeleton */}
                    <div className="bg-muted h-40 rounded mb-3"></div>
                    
                    {/* Engagement buttons skeleton */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <div className="h-8 w-20 bg-muted rounded"></div>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pulseItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pulses found for this filter.</p>
              <Button className="mt-4" onClick={() => setActiveTab("all")}>
                View all pulses
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {pulseItems.map((pulse) => (
                <PulseCard 
                  key={pulse.id} 
                  pulse={pulse} 
                  userId={userId} 
                  quotaData={userQuota} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}

// Individual Pulse Card Component
function PulseCard({ 
  pulse, 
  userId, 
  quotaData 
}: { 
  pulse: PulseItem, 
  userId: number,
  quotaData: any 
}) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header with user info and timestamp */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pulse.user?.photoURL || undefined} alt={pulse.user?.name || "User"} />
              <AvatarFallback>{pulse.user?.name ? pulse.user.name.charAt(0) : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{pulse.user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{formatFeedDate(pulse.createdAt)}</p>
            </div>
          </div>
          
          <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
            {pulse.type.replace("-pulse", "")}
          </div>
        </div>
        
        {/* Title and content */}
        <h3 className="text-lg font-medium mb-1">{pulse.title}</h3>
        {pulse.content && <p className="text-sm text-muted-foreground mb-3">{pulse.content}</p>}
        
        {/* Media placeholder (actual implementation would include media components) */}
        {pulse.mediaType && (
          <div className="bg-muted h-40 rounded flex items-center justify-center mb-3">
            <p className="text-muted-foreground">
              {pulse.mediaType === "image" ? "Image Content" : "Video Content"}
            </p>
          </div>
        )}
        
        {/* Poll placeholder (actual implementation would include poll components) */}
        {pulse.type === "poll" && pulse.pollOptions && (
          <div className="border rounded p-3 mb-3">
            <p className="text-sm font-medium mb-2">Poll Options:</p>
            <div className="space-y-2">
              {pulse.pollOptions.map((option, idx) => (
                <div key={idx} className="bg-muted p-2 rounded text-sm">
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Engagement buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <PulseEngagementButton 
            type="insightful" 
            pulseId={pulse.id} 
            userId={userId} 
            currentCount={pulse.insightfulCount}
            quotaData={quotaData}
          />
          
          <PulseEngagementButton 
            type="misinformed" 
            pulseId={pulse.id} 
            userId={userId} 
            currentCount={pulse.misinformedCount}
            quotaData={quotaData}
          />
          
          <PulseEngagementButton 
            type="comment" 
            pulseId={pulse.id} 
            userId={userId} 
            currentCount={pulse.comments}
            quotaData={quotaData}
            onClick={() => {
              // This would open a comment modal in a full implementation
              console.log("Open comment modal for pulse:", pulse.id);
            }}
          />
          
          <PulseEngagementButton 
            type="share" 
            pulseId={pulse.id} 
            userId={userId} 
            currentCount={pulse.shareCount}
            quotaData={quotaData}
            onClick={() => {
              // This would open a share modal in a full implementation
              console.log("Open share modal for pulse:", pulse.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}