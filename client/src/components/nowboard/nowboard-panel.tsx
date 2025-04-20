import { useState } from "react";
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
import { FeaturedProfessional } from "./featured-professional";

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
  // Get user's existing inspired status
  const { data: userInspiredData } = useQuery<{ id: number } | null>({
    queryKey: [`/api/nowboard-items/${itemId}/inspired-by/user/${userId}`],
    refetchOnWindowFocus: false
  });
  
  const userInspiredId = userInspiredData?.id;
  const isInspired = !!userInspiredId;
  
  // Use the shared engagement hook
  const { handleEngagement, isLoading } = useFeedEngagement({
    engagementType: "inspired",
    userId,
    itemId,
    apiEndpoint: "nowboard-items",
    currentCount
  });
  
  // Get appropriate styles based on engagement status
  const styles = getEngagementStyles("inspired", isInspired);
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-auto p-1 ${styles.textColor} ${styles.hoverBg}`}
      onClick={() => handleEngagement(userInspiredId)}
      disabled={isLoading}
    >
      <Lightbulb className={`h-4 w-4 mr-1 ${styles.activeFill}`} />
      <span>{currentCount} inspired</span>
    </Button>
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
  
  // Use the shared feed algorithm hook
  const { 
    items: nowboardItems, 
    isLoading, 
    refetch 
  } = useFeedAlgorithm<NowboardItem>({
    queryKey: ["/api/nowboard-items"],
    filters: categoryFilter ? { category: categoryFilter } : undefined,
    fetchUserData: async (items) => {
      console.log("==============================");
      console.log("Nowboard items received:", items.length);
      
      // Detailed log of what's being received
      items.forEach((item, index) => {
        console.log(`Item ${index} details:`, {
          id: item.id,
          content: item.content?.substring(0, 20) + (item.content && item.content.length > 20 ? '...' : ''),
          category: item.category,
          createdAt: item.createdAt,
          visibility: item.visibility,
          inspiredCount: item.inspiredCount,
          userId: item.userId
        });
      });
      
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
              console.log(`Added user data for item ${item.id}:`, item.user);
            }
          } catch (error) {
            console.error("Error fetching user data for nowboard item:", error);
          }
        }
      }
      console.log("==============================");
    },
    refreshInterval: 30000 // Refresh every 30 seconds for testing
  });

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    createMutation.mutate({
      userId,
      content: newItemContent,
      category: selectedCategory,
      visibility: "public"
    });
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
      <Card className="flex-1 flex flex-col shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-primary font-semibold">Nowboard</span>
            <span className="text-xs text-muted-foreground">What professionals are doing now</span>
          </CardTitle>
        </CardHeader>
        
        <div className="px-4 pb-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Share what you're working on... (150 chars max)"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              className="resize-none text-sm min-h-[60px]"
              maxLength={150}
            />
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="visibility">Visibility</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="submit"
                size="sm"
                className="ml-auto"
                disabled={createMutation.isPending || !newItemContent.trim()}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </Button>
            </div>
            <div className="text-xs text-right text-muted-foreground">
              {newItemContent.length}/150 characters
            </div>
          </form>
        </div>
        
        <CardContent className="flex-1 overflow-y-auto pt-0">
          {/* Featured Professional Section */}
          <FeaturedProfessional />
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : nowboardItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No professional updates yet.</p>
              <p className="text-sm mt-1">Be the first to share what you're working on!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nowboardItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user?.photoURL || undefined} alt={item.user?.name || "User"} />
                      <AvatarFallback>{item.user?.name ? item.user.name.charAt(0) : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{item.user?.name || "User"}</p>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(item.category)}`}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(item.category)}
                            <span className="capitalize">{item.category}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
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
        </CardContent>
      </Card>
    </div>
  );
}