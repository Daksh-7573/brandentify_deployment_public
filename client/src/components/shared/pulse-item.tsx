import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Share, 
  Hash, 
  ThumbsUp, 
  ThumbsDown,
  AlertCircle,
  BookOpen,
  Award,
  BarChart4,
  Calendar,
  CheckCircle2,
  Lightbulb,
  XCircle
} from "lucide-react";

// Image Carousel component for displaying multiple images in a pulse
import ImageCarousel from "@/components/shared/image-carousel";
import PollDisplay from "@/components/shared/poll-display";
import { Badge as BadgeType } from "@/components/ui/badge";

// Helper to get pulse type icon
const getPulseTypeIcon = (type: string) => {
  switch (type) {
    case "poll":
      return <BarChart4 size={18} />;
    case "media-pulse":
      return <Lightbulb size={18} />;
    case "project":
      return <BookOpen size={18} />;
    default:
      return <MessageSquare size={18} />;
  }
};

// Helper to get pulse category badge
const getPulseCategoryBadge = (category: string | null | undefined) => {
  if (!category) return null;
  
  const categories: Record<string, { label: string, icon: JSX.Element, variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    "certification": { 
      label: "Certification", 
      icon: <Award size={14} />,
      variant: "outline" 
    },
    "launch": { 
      label: "Launch", 
      icon: <CheckCircle2 size={14} />,
      variant: "default" 
    },
    "award": { 
      label: "Award", 
      icon: <Award size={14} />,
      variant: "secondary" 
    },
    "assignment": { 
      label: "Assignment", 
      icon: <BookOpen size={14} />,
      variant: "outline" 
    },
    "announcement": { 
      label: "Announcement", 
      icon: <AlertCircle size={14} />,
      variant: "default" 
    },
    "highlight": { 
      label: "Highlight", 
      icon: <Lightbulb size={14} />,
      variant: "outline" 
    }
  };
  
  const badgeInfo = categories[category.toLowerCase()] || { 
    label: category, 
    icon: <Hash size={14} />,
    variant: "outline"
  };
  
  return (
    <Badge variant={badgeInfo.variant} className="gap-1 items-center">
      {badgeInfo.icon}
      {badgeInfo.label}
    </Badge>
  );
};

interface PulseItemProps {
  pulse: any;
  userId: string | number;
  showComments?: boolean;
  highlightHashtags?: boolean;
}

const PulseItem = ({ pulse, userId, showComments = true, highlightHashtags = true }: PulseItemProps) => {
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  
  // Get user reaction quota
  const { data: reactionQuota } = useQuery({
    queryKey: ["/api/users", userId, "reaction-quota"],
    queryFn: () => apiRequest(`/api/users/${userId}/reaction-quota`),
    enabled: !!userId
  });
  
  // Get pulse reactions
  const { data: reactions, isLoading: reactionsLoading } = useQuery({
    queryKey: ["/api/pulses", pulse.id, "reactions"],
    queryFn: () => apiRequest(`/api/pulses/${pulse.id}/reactions`)
  });
  
  // Get pulse hashtags
  const { data: hashtags, isLoading: hashtagsLoading } = useQuery({
    queryKey: ["/api/pulses", pulse.id, "hashtags"],
    queryFn: () => apiRequest(`/api/pulses/${pulse.id}/hashtags`),
    enabled: !!pulse.id
  });
  
  // Get pulse comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/pulses", pulse.id, "comments"],
    queryFn: () => apiRequest(`/api/pulses/${pulse.id}/comments`),
    enabled: !!pulse.id && showCommentsSection
  });
  
  // Create reaction mutation
  const createReactionMutation = useMutation({
    mutationFn: (reactionData: { userId: string | number; pulseId: number; type: string }) =>
      apiRequest("/api/pulse-reactions", {
        method: "POST",
        body: JSON.stringify(reactionData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pulses", pulse.id, "reactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "reaction-quota"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not record your reaction",
        variant: "destructive"
      });
    }
  });
  
  // Share mutation
  const sharePulseMutation = useMutation({
    mutationFn: (shareData: { userId: string | number; pulseId: number }) =>
      apiRequest("/api/pulse-shares", {
        method: "POST",
        body: JSON.stringify(shareData)
      }),
    onSuccess: () => {
      toast({
        title: "Shared!",
        description: "Pulse has been shared to your profile"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not share this pulse",
        variant: "destructive"
      });
    }
  });
  
  // Check if user has already reacted
  const hasReacted = (type: string) => {
    return reactions?.some((reaction: any) => 
      reaction.userId === userId && reaction.type === type
    );
  };
  
  // Handle creating a reaction
  const handleReact = (type: string) => {
    // If demo mode, show a message
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: `In a real account, this would mark this pulse as ${type}`
      });
      return;
    }
    
    // Check if user has quota
    if (reactionQuota) {
      const quota = reactionQuota[type];
      if (quota.used >= quota.total) {
        toast({
          title: "Daily Limit Reached",
          description: `You've used all your ${type} reactions for today`
        });
        return;
      }
    }
    
    // Create the reaction
    createReactionMutation.mutate({
      userId,
      pulseId: pulse.id,
      type
    });
  };
  
  // Handle sharing a pulse
  const handleShare = () => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "In a real account, this would share the pulse to your profile"
      });
      return;
    }
    
    sharePulseMutation.mutate({
      userId,
      pulseId: pulse.id
    });
  };
  
  // Format content with highlighted hashtags
  const formatContent = (content: string) => {
    if (!highlightHashtags) return content;
    
    return content.replace(/#(\w+)/g, (match, tag) => {
      return `<span class="text-primary font-medium">${match}</span>`;
    });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || "User"} />
              <AvatarFallback>{pulse.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{pulse.user?.name || "Anonymous"}</span>
                {pulse.type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getPulseTypeIcon(pulse.type)}
                    <span className="capitalize">{pulse.type === "media-pulse" ? "Insights" : pulse.type}</span>
                  </Badge>
                )}
                {pulse.category && getPulseCategoryBadge(pulse.category)}
              </div>
              <p className="text-xs text-muted-foreground">
                {pulse.createdAt && formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {pulse.title && <h3 className="text-lg font-semibold mb-2">{pulse.title}</h3>}
        
        {pulse.content && (
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: formatContent(pulse.content) }}
          ></div>
        )}
        
        {/* Display hashtags if available */}
        {!hashtagsLoading && hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {hashtags.map((hashtag: any) => (
              <Badge key={hashtag.id} variant="secondary" className="flex items-center gap-1">
                <Hash size={14} />
                {hashtag.tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Render appropriate content based on pulse type */}
        {pulse.type === "media-pulse" && pulse.mediaType === "image" && pulse.mediaUrls && pulse.mediaUrls.length > 0 && (
          <div className="mb-4">
            <ImageCarousel 
              images={pulse.mediaUrls} 
              storedImages={pulse.mediaLocalStorageKeys} 
            />
          </div>
        )}
        
        {pulse.type === "media-pulse" && pulse.mediaType === "video" && pulse.mediaUrls && pulse.mediaUrls.length > 0 && (
          <div className="mb-4">
            <video 
              src={pulse.mediaUrls[0]} 
              controls
              className="w-full rounded-md max-h-[500px] object-contain bg-black"
            ></video>
          </div>
        )}
        
        {pulse.type === "poll" && pulse.pollOptions && pulse.pollOptions.length > 0 && (
          <div className="mb-4">
            <PollDisplay 
              pulseId={pulse.id}
              options={pulse.pollOptions}
              userId={userId}
            />
          </div>
        )}
        
        {pulse.type === "project" && pulse.projectId && (
          <div className="mb-4">
            <Link to={`/projects/${pulse.projectId}`}>
              <Button variant="outline" className="w-full">
                View Project Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${hasReacted("insightful") ? "text-primary" : ""}`}
            onClick={() => handleReact("insightful")}
          >
            <Lightbulb size={18} />
            <span>{reactions?.filter((r: any) => r.type === "insightful").length || 0}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${hasReacted("misinformed") ? "text-destructive" : ""}`}
            onClick={() => handleReact("misinformed")}
          >
            <XCircle size={18} />
            <span>{reactions?.filter((r: any) => r.type === "misinformed").length || 0}</span>
          </Button>
          
          {showComments && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setShowCommentsSection(!showCommentsSection)}
            >
              <MessageSquare size={18} />
              <span>{pulse.comments || 0}</span>
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handleShare}
        >
          <Share size={18} />
          <span>{pulse.shareCount || 0}</span>
        </Button>
      </CardFooter>
      
      {showCommentsSection && showComments && (
        <div className="px-4 pb-4">
          <Separator className="my-2" />
          
          <div className="mt-2">
            <h4 className="font-medium mb-2">Comments</h4>
            
            {commentsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.photoURL || ""} alt={comment.user?.name || "User"} />
                      <AvatarFallback>{comment.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{comment.user?.name || "Anonymous"}</p>
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PulseItem;