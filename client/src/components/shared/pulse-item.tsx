import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Heart, 
  MessageSquare, 
  Share, 
  ThumbsDown, 
  ThumbsUp,
  MoreHorizontal,
  Lightbulb,
  Trash2,
  AlertTriangle,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ImageCarousel from "@/components/shared/image-carousel";
import PollDisplay from "@/components/shared/poll-display";

interface PulseItemProps {
  pulse: any;
  userId: string | number;
  showComments?: boolean;
}

type PulseReactionType = 'insightful' | 'misinformed' | 'like';

const PulseItem = ({ pulse, userId, showComments = false }: PulseItemProps) => {
  const [_, navigate] = useLocation();
  const { isDemo: isDemoMode } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  
  // Format timestamp for display
  const formattedDate = pulse.createdAt ? 
    formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) : 
    "recently";
  
  // Get pulse reaction counts
  const { data: reactions, isLoading: reactionsLoading } = useQuery({
    queryKey: [`/api/pulses/${pulse.id}/reactions`],
    queryFn: async () => {
      const response = await apiRequest({ 
        url: `/api/pulses/${pulse.id}/reactions`,
        method: "GET" 
      });
      return await response.json();
    }
  });
  
  // Get user reaction quotas
  const { data: quotas, isLoading: quotasLoading } = useQuery({
    queryKey: [`/api/users/${userId}/reaction-quota`],
    queryFn: async () => {
      const response = await apiRequest({ 
        url: `/api/users/${userId}/reaction-quota`,
        method: "GET" 
      });
      return await response.json();
    },
    enabled: !!userId
  });
  
  // Get comments 
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/pulses/${pulse.id}/comments`],
    queryFn: async () => {
      const response = await apiRequest({ 
        url: `/api/pulses/${pulse.id}/comments`,
        method: "GET" 
      });
      return await response.json();
    },
    enabled: showComments
  });
  
  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: (type: PulseReactionType) => 
      apiRequest({ 
        url: `/api/pulses/${pulse.id}/reactions`, 
        method: "POST",
        data: { userId, type }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reaction-quota`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reaction",
      });
    }
  });
  
  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: (type: PulseReactionType) => 
      apiRequest({ 
        url: `/api/pulses/${pulse.id}/reactions/${type}`, 
        method: "DELETE"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reaction-quota`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove reaction",
      });
    }
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (text: string) => 
      apiRequest({ 
        url: `/api/pulses/${pulse.id}/comments`, 
        method: "POST",
        data: { userId, text }
      }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment",
      });
    }
  });
  
  // Check if user has already reacted
  const hasUserReacted = (type: PulseReactionType) => {
    if (!reactions) return false;
    return reactions.some((reaction: any) => 
      reaction.userId === userId && reaction.type === type
    );
  };
  
  // Handle reaction toggle
  const toggleReaction = (type: PulseReactionType) => {
    if (hasUserReacted(type)) {
      removeReactionMutation.mutate(type);
    } else {
      // Check if user has quota for this reaction type
      if ((type === 'insightful' || type === 'misinformed') && 
          quotas && quotas[type] && quotas[type].remaining <= 0) {
        toast({
          variant: "warning",
          title: "Quota Exceeded",
          description: `You've used all your ${type} reactions for today.`,
        });
        return;
      }
      
      addReactionMutation.mutate(type);
    }
  };
  
  // Handle comment submission
  const handleAddComment = () => {
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText.trim());
    }
  };
  
  // Share pulse function
  const sharePulse = () => {
    const url = `${window.location.origin}/pulse/${pulse.id}`;
    
    // Try to use the clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Pulse link copied to clipboard",
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "Could not copy the link to clipboard",
          });
        });
    } else {
      // Fallback for browsers without clipboard support
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Link copied",
          description: "Pulse link copied to clipboard",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
        });
      }
      
      document.body.removeChild(textArea);
    }
  };
  
  // Get counts for reactions
  const getReactionCount = (type: PulseReactionType) => {
    if (!reactions) return 0;
    return reactions.filter((reaction: any) => reaction.type === type).length;
  };
  
  // Get content based on type
  const renderPulseContent = () => {
    switch (pulse.type) {
      case 'media-pulse':
        if (pulse.mediaType === 'image' && pulse.mediaUrls && pulse.mediaUrls.length > 0) {
          console.log("Pulse received for carousel:", pulse);
          console.log("Media URLs:", pulse.mediaUrls);
          console.log("Media localStorage keys:", pulse.mediaLocalStorageKeys || []);
          console.log("Using mediaUrls for carousel:", pulse.mediaUrls);
          
          return (
            <div className="mt-4">
              <ImageCarousel 
                images={pulse.mediaUrls} 
                storedImages={pulse.mediaLocalStorageKeys || []}
              />
            </div>
          );
        } else if (pulse.mediaType === 'video' && pulse.mediaUrls && pulse.mediaUrls.length > 0) {
          console.log("Pulse received for video player:", pulse);
          console.log("Video media URLs:", pulse.mediaUrls);
          console.log("Video localStorage keys:", pulse.mediaLocalStorageKeys || []);
          
          const videoUrl = pulse.mediaUrls[0];
          console.log("Using mediaUrls for video:", videoUrl);
          
          return (
            <div className="mt-4 rounded-lg overflow-hidden bg-black">
              <video 
                controls 
                className="w-full"
                style={{ maxHeight: '400px' }}
                src={videoUrl}
                poster={pulse.thumbnailUrl || ''}
              />
            </div>
          );
        }
        return null;
        
      case 'poll':
        if (pulse.pollOptions && pulse.pollOptions.length > 0) {
          return (
            <div className="mt-4">
              <PollDisplay 
                pulseId={pulse.id}
                options={pulse.pollOptions}
                userId={userId}
              />
            </div>
          );
        }
        return null;
        
      case 'project':
        if (pulse.projectId) {
          return (
            <Card className="mt-4 border-muted">
              <CardContent className="pt-6 pb-4">
                <div className="text-sm text-muted-foreground mb-2">Project Showcase</div>
                <div className="font-medium">{pulse.project?.title || 'Loading project...'}</div>
                <p className="text-muted-foreground text-sm mt-2">
                  {pulse.project?.description || 'Project details loading...'}
                </p>
                
                <div className="flex mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm"
                    onClick={() => navigate(`/projects/${pulse.projectId}`)}
                  >
                    View Project Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
        
      default:
        return null;
    }
  };
  
  // Generate badge for pulse category
  const renderPulseCategory = () => {
    const categories: Record<string, { label: string, variant: "default" | "secondary" | "outline" }> = {
      'certification': { label: 'Certification', variant: 'secondary' },
      'launch': { label: 'Launch', variant: 'default' },
      'award': { label: 'Award', variant: 'default' },
      'project': { label: 'Assignment', variant: 'outline' },
      'announcement': { label: 'Announcement', variant: 'outline' },
      'highlight': { label: 'Highlight', variant: 'secondary' },
      'media-pulse': { label: 'Insight', variant: 'outline' },
      'poll': { label: 'Trend', variant: 'outline' },
    };
    
    const category = categories[pulse.type] || { label: 'Pulse', variant: 'outline' };
    
    return (
      <Badge variant={category.variant} className="ml-2">
        {category.label}
      </Badge>
    );
  };
  
  // Extract hashtags from content (basic implementation)
  const extractHashtags = (content: string) => {
    if (!content) return [];
    const regex = /#(\w+)/g;
    const matches = content.match(regex);
    return matches ? matches : [];
  };
  
  const hashtags = extractHashtags(pulse.content);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full overflow-hidden bg-muted cursor-pointer"
              onClick={() => navigate(`/@${pulse.user?.username || 'user'}`)}
            >
              <img 
                src={pulse.user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt={pulse.user?.name || "User"} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                }}
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                <div 
                  className="font-semibold text-foreground cursor-pointer hover:underline"
                  onClick={() => navigate(`/@${pulse.user?.username || 'user'}`)}
                >
                  {pulse.user?.name || "User"}
                </div>
                {renderPulseCategory()}
              </div>
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={sharePulse}>
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Report</span>
              </DropdownMenuItem>
              {pulse.userId === userId && (
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Pulse title */}
        {pulse.title && (
          <h3 className="text-lg font-semibold mb-1.5">{pulse.title}</h3>
        )}
        
        {/* Pulse content */}
        <p className="text-sm whitespace-pre-line mb-2">{pulse.content}</p>
        
        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 mb-2">
            {hashtags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => navigate(`/search?hashtag=${tag.substring(1)}`)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Pulse media content */}
        {renderPulseContent()}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="py-2.5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            {/* Insightful reaction */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs gap-1.5 rounded px-2 py-1 h-auto ${
                hasUserReacted('insightful') ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : ''
              }`}
              onClick={() => toggleReaction('insightful')}
              disabled={addReactionMutation.isPending || removeReactionMutation.isPending}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Insightful</span>
              {getReactionCount('insightful') > 0 && (
                <span>({getReactionCount('insightful')})</span>
              )}
            </Button>
            
            {/* Misinformed reaction */}
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs gap-1.5 rounded px-2 py-1 h-auto ${
                hasUserReacted('misinformed') ? 'text-red-600 bg-red-50 hover:bg-red-100' : ''
              }`}
              onClick={() => toggleReaction('misinformed')}
              disabled={addReactionMutation.isPending || removeReactionMutation.isPending}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>Misinformed</span>
              {getReactionCount('misinformed') > 0 && (
                <span>({getReactionCount('misinformed')})</span>
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Comments */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 rounded px-2 py-1 h-auto"
              onClick={() => navigate(`/pulse/${pulse.id}`)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Comment{comments?.length !== 1 ? 's' : ''}</span>
              {comments?.length > 0 && (
                <span>({comments.length})</span>
              )}
            </Button>
            
            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 rounded px-2 py-1 h-auto"
              onClick={sharePulse}
            >
              <Share className="h-3.5 w-3.5" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </CardFooter>
      
      {/* Show comments if enabled */}
      {showComments && (
        <div className="px-6 pb-4">
          <Separator className="mb-4" />
          
          {/* Comment input */}
          <div className="flex gap-3 mb-4">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Your avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 rounded-full border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button 
                size="sm" 
                className="rounded-full px-3 h-7"
                disabled={!commentText.trim() || addCommentMutation.isPending}
                onClick={handleAddComment}
              >
                {addCommentMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
          
          {/* Comments list */}
          {commentsLoading ? (
            <div className="text-center text-muted-foreground text-sm py-3">
              Loading comments...
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-3">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={comment.user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt={comment.user?.name || "User"} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                  <div>
                    <div className="bg-secondary p-2.5 rounded-lg">
                      <div className="font-medium text-sm">
                        {comment.user?.name || "User"}
                      </div>
                      <div className="text-sm mt-0.5">
                        {comment.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        {comment.createdAt ? 
                          formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 
                          "recently"}
                      </span>
                      <button className="hover:text-foreground">Like</button>
                      <button className="hover:text-foreground">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default PulseItem;