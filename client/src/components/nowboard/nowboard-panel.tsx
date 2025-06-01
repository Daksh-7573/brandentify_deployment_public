import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowUp, 
  Brain, 
  Lightbulb, 
  Rocket, 
  Calendar, 
  Users, 
  Eye, 
  Loader2 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useFeedAlgorithm, useFeedEngagement, formatFeedDate, getEngagementStyles } from "@/hooks/feed";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";
import BrandOfTheDay from "./brand-of-the-day";
import { NowboardMenu } from "./nowboard-menu";

// Button component for "Inspired" action
function NowboardInspiredButton({ 
  itemId, 
  userId, 
  currentCount = 0 
}: { 
  itemId: number; 
  userId: number; 
  currentCount: number 
}) {
  // Get user's existing inspired status for this item
  const { data: userInspiredData } = useQuery<{ id: number } | null>({
    queryKey: [`/api/nowboard-items/${itemId}/inspired-by/user/${userId}`],
    refetchOnWindowFocus: false
  });
  
  // Get count of all items this user has inspired (for quota)
  const { data: userInspiredCountData } = useQuery<{ count: number }>({
    queryKey: [`/api/users/${userId}/inspired-count`],
    refetchOnWindowFocus: false,
    // Handle 404 gracefully
    retry: (failureCount, error: any) => {
      return !(error.status === 404) && failureCount < 3;
    }
  });
  
  const userInspiredId = userInspiredData?.id;
  const isInspired = !!userInspiredId;
  const totalUserInspired = userInspiredCountData?.count || 0;
  
  // Use the shared engagement hook
  const { handleEngagement, isLoading } = useFeedEngagement({
    engagementType: "inspired",
    userId,
    itemId,
    apiEndpoint: "nowboard-items",
    currentCount,
    quotaData: {
      inspired: {
        used: totalUserInspired,
        remaining: Math.max(0, 10 - totalUserInspired),
        max: 10
      }
    }
  });
  
  // Get appropriate styles based on engagement status
  const styles = getEngagementStyles("inspired", isInspired);
  
  return (
    <button
      className={`text-xs text-white/60 hover:text-white/80 flex items-center gap-1 transition-colors ${isLoading ? 'opacity-50' : ''}`}
      onClick={() => handleEngagement(userInspiredId)}
      disabled={isLoading || (isInspired === false && totalUserInspired >= 10)}
      title={isInspired 
        ? "Already inspired" 
        : (totalUserInspired >= 10 
            ? "You've reached your limit of 10 inspirations"
            : "Mark as inspired")}
    >
      <Lightbulb className={`h-3 w-3 ${isInspired ? 'text-yellow-400' : 'text-white/60'}`} />
      <span>{currentCount} inspired</span>
    </button>
  );
}

// Interface for Nowboard items
interface NowboardItem {
  id: number;
  userId: number;
  content: string;
  category: "growth" | "learning" | "launch" | "planning" | "collaboration" | "visibility";
  visibility: "public" | "connections-only";
  inspiredCount: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
  relatedSkills?: string | null;
  relatedProject?: number | null;
  imageUrl?: string | null;
  // User info for display
  user?: {
    name: string | null;
    photoURL: string | null;
  };
}

export default function NowboardPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to demo user if not logged in
  
  const [newItemContent, setNewItemContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"growth" | "learning" | "launch" | "planning" | "collaboration" | "visibility">("learning");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  
  // Fetch nowboard items using useQuery
  const { 
    data: nowboardItems = [], 
    isLoading 
  } = useQuery({
    queryKey: ["/api/nowboard-items", categoryFilter],
    enabled: true,
    select: (data: any[]) => {
      console.log("Raw nowboard data:", data);
      return data.map(item => ({
        ...item,
        user: { name: "User", photoURL: null } // Default user data
      }));
    }
  });
  
  // Function to manually refetch
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/nowboard-items"] });
  };

  // Add console log to debug
  console.log("Nowboard items data:", nowboardItems);
  console.log("Nowboard items loading:", isLoading);

  // Create new nowboard item
  const createMutation = useMutation({
    mutationFn: async (newItem: { 
      userId: number;
      content: string;
      category: "growth" | "learning" | "launch" | "planning" | "collaboration" | "visibility";
      visibility: "public" | "connections-only";
    }) => {
      const res = await apiRequest("POST", "/api/nowboard-items", newItem);
      return await res.json();
    },
    onSuccess: () => {
      // Clear form and refresh data
      setNewItemContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/nowboard-items"] });
      
      toast({
        title: "Update shared!",
        description: "Your professional update has been shared.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to share update",
        description: "There was an error sharing your update. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle submit of new nowboard item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newItemContent.trim()) {
      toast({
        title: "Empty update",
        description: "Please enter some content for your update.",
        variant: "destructive",
      });
      return;
    }
    
    if (newItemContent.length > 150) {
      toast({
        title: "Update too long",
        description: "Please keep your update under 150 characters.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        userId,
        content: newItemContent,
        category: selectedCategory,
        visibility: "public"
      });
    } catch (error) {
      console.error("Error creating nowboard item:", error);
    }
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "growth":
        return <ArrowUp className="h-4 w-4 text-emerald-500" />;
      case "learning":
        return <Brain className="h-4 w-4 text-violet-500" />;
      case "launch":
        return <Rocket className="h-4 w-4 text-blue-500" />;
      case "planning":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case "collaboration":
        return <Users className="h-4 w-4 text-pink-500" />;
      case "visibility":
        return <Eye className="h-4 w-4 text-indigo-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get color for category badge
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "growth":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "learning":
        return "bg-violet-100 text-violet-800 hover:bg-violet-200";
      case "launch":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "planning":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "collaboration":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      case "visibility":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <NeoGlassSection className="flex-1 flex flex-col h-full">
        <div className="pb-3 border-b border-white/20 mb-4">
          <h2 className="text-xl font-semibold text-white mb-1">Nowboard</h2>
          <p className="text-white/70 text-sm">What professionals are doing now</p>
        </div>
        
        <div className="pb-4 border-b border-white/10 mb-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Share what you're working on... (150 chars max)"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              className="resize-none text-sm min-h-[60px] bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50 focus:ring-white/30"
              maxLength={150}
            />
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/30 text-white hover:bg-white/15 focus:ring-white/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                  <SelectItem value="learning" className="text-white hover:bg-white/10 focus:bg-white/10">Learning</SelectItem>
                  <SelectItem value="growth" className="text-white hover:bg-white/10 focus:bg-white/10">Growth</SelectItem>
                  <SelectItem value="launch" className="text-white hover:bg-white/10 focus:bg-white/10">Launch</SelectItem>
                  <SelectItem value="planning" className="text-white hover:bg-white/10 focus:bg-white/10">Planning</SelectItem>
                  <SelectItem value="collaboration" className="text-white hover:bg-white/10 focus:bg-white/10">Collaboration</SelectItem>
                  <SelectItem value="visibility" className="text-white hover:bg-white/10 focus:bg-white/10">Visibility</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={handleSubmit}
                className="neo-glass-button ml-auto"
                disabled={createMutation.isPending || !newItemContent.trim()}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </button>
            </div>
            <div className="text-xs text-right text-white/60">
              {newItemContent.length}/150 characters
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Brand of the Day Section */}
          <BrandOfTheDay />
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : nowboardItems.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No professional updates yet.</p>
              <p className="text-sm mt-1">Be the first to share what you're working on!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nowboardItems.map((item) => (
                <div key={item.id} className="neo-glass-card rounded-lg p-4 hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user?.photoURL || undefined} alt={item.user?.name || "User"} />
                      <AvatarFallback className="bg-white/10 text-white">{item.user?.name ? item.user.name.charAt(0) : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{item.user?.name || "User"}</p>
                          <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white/80">
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(item.category)}
                              <span className="capitalize">{item.category}</span>
                            </span>
                          </Badge>
                        </div>
                        <NowboardMenu 
                          itemId={item.id} 
                          userId={item.userId} 
                          currentUserId={userId}
                        />
                      </div>
                      <p className="text-sm mt-1 text-white/80 leading-relaxed">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-white/60 mt-2">
                        <span>
                          {(() => {
                            console.log(`Date format for item ${item.id}:`, item.createdAt, typeof item.createdAt);
                            try {
                              return formatFeedDate(item.createdAt);
                            } catch (error) {
                              console.error(`Error formatting date for item ${item.id}:`, error);
                              return "recently";
                            }
                          })()}
                        </span>
                        <NowboardInspiredButton itemId={item.id} userId={userId} currentCount={item.inspiredCount} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </NeoGlassSection>
    </div>
  );
}