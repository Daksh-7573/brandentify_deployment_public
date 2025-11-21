import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
// Nowboard panel import
// Removed Nowboard panel import as it's now integrated into quests
// Removed Sidebar import, using top navigation only
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart, 
  Video, 
  Image, 
  FileCode, 
  Check, 
  Loader2, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RefreshCw, 
  Newspaper,
  Share,
  AlertTriangle,
  Flame
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { AuthLoadingBoundary } from "@/components/auth/auth-loading-boundary";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import NowboardPanelSimple from "@/components/nowboard/nowboard-panel-simple";
import PulseMenu from "@/components/industry-pulse/pulse-menu";
import { CommentSection } from "@/components/pulse/comment-section";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeedSkeleton } from "@/components/ui/skeleton-components";
import { SearchableUserSelect } from "@/components/share/searchable-user-select";
import { SocialShareButtons } from "@/components/share/social-share-buttons";
import { PremiumBadge } from "@/components/ui/premium-badge";

// Extended Pulse type with user info for display purposes
interface PulseWithUser {
  id: number;
  userId: number;
  type: "poll" | "media-pulse" | "project" | "news-pulse";
  title: string;
  content: string | null;
  mediaType: "image" | "video" | null;
  mediaUrls: string[]; // Array of media URLs
  mediaLocalStorageKeys?: string[]; // Array of localStorage keys for media
  pollOptions: string[]; // Array of poll options
  projectId: number | null;
  likes: number;
  insightfulCount?: number; // New field for Insightful reactions count
  misinformedCount?: number; // New field for Misinformed reactions count
  shareCount?: number; // New field for Share count
  comments: number;
  isPublished: boolean;
  createdAt: string | Date; // Can be a string from the API
  updatedAt: string | Date;
  // Additional display properties
  user?: {
    name: string | null;
    photoURL: string | null;
  };
  projectDetails?: string;
}

// Pulse Reactions Component
interface PulseReactionsProps {
  pulse: PulseWithUser;
  onCommentClick?: () => void;
  currentUserId?: number;
}

function PulseReactions({ pulse, onCommentClick, currentUserId }: PulseReactionsProps) {
  const { toast } = useToast();
  const userId = currentUserId || 1; // Use passed userId, default to 1 if not provided
  
  console.log(`[PULSE REACTIONS] Rendering with currentUserId=${currentUserId}, userId=${userId}`);
  
  // State for the share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareRecipientId, setShareRecipientId] = useState<number | null>(null);
  
  // Clean up all old cache entries and invalidate old queries when user changes
  useEffect(() => {
    console.log(`[QUOTA FIX] PulseReactions mounted/updated with currentUserId: ${currentUserId}, computed userId: ${userId}`);
    
    // Clear ALL user quota caches from localStorage
    try {
      for (let i = 1; i <= 10; i++) {
        const cacheKey = `api_cache_/api/users/${i}/reaction-quota`;
        localStorage.removeItem(cacheKey);
      }
      console.log(`[QUOTA FIX] Cleared all user quota caches from localStorage`);
    } catch (e) {
      console.warn('Failed to clear localStorage cache:', e);
    }
    
    // Invalidate all user quota queries from React Query
    queryClient.invalidateQueries({ 
      queryKey: [/\/api\/users\/.*\/reaction-quota/] as any
    });
    console.log(`[QUOTA FIX] Invalidated all user quota queries from React Query`);
  }, [userId]);
  
  // Get user reaction quota - always fetch fresh (no caching)
  const { data: quotaData, refetch: refetchQuota } = useQuery<any>({
    queryKey: [`/api/users/${userId}/reaction-quota`],
    staleTime: 0, // Always consider stale, force refetch
    refetchOnMount: 'always', // Always refetch when component mounts
    gcTime: 0, // Don't cache at all
  });
  
  // Get user's reactions for this pulse
  const { data: userReactionsData } = useQuery<any[]>({
    queryKey: [`/api/pulses/${pulse.id}/reactions`],
  });
  
  // Determine if user has already reacted to this pulse
  const hasInsightfulReaction = userReactionsData?.some(
    (reaction: any) => reaction.userId === userId && reaction.reactionType === "insightful"
  );
  
  const hasMisinformedReaction = userReactionsData?.some(
    (reaction: any) => reaction.userId === userId && reaction.reactionType === "misinformed"
  );

  // Mutation for creating reactions
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: "insightful" | "misinformed") => {
      const res = await apiRequest("POST", "/api/pulse-reactions", {
        userId,
        pulseId: pulse.id,
        reactionType
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh reaction data
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reaction-quota`] });
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] }); // Refresh all pulses
      
      toast({
        title: data.reaction.reactionType === "insightful" 
          ? "Marked as Insightful 🔥" 
          : "Flagged as Misinformed ⚠️",
        description: `Daily quota: ${data.quota.used}/${data.quota.max}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to react",
        description: 'Error submitting your reaction',
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting reactions
  const deleteReactionMutation = useMutation({
    mutationFn: async (reactionId: number) => {
      const res = await apiRequest("DELETE", `/api/pulse-reactions/${reactionId}`);
      return res.ok;
    },
    onSuccess: () => {
      // Invalidate queries to refresh reaction data
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/reactions`] });
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] }); // Refresh all pulses
      
      toast({
        title: "Reaction removed",
        description: "Your reaction has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove reaction",
        description: 'Error removing your reaction',
        variant: "destructive",
      });
    },
  });
  
  // Mutation for sharing pulses
  const shareMutation = useMutation({
    mutationFn: async () => {
      if (!shareRecipientId) throw new Error("No recipient selected");
      
      const res = await apiRequest("POST", "/api/pulse-shares", {
        pulseId: pulse.id,
        senderId: userId,
        recipientId: shareRecipientId,
        message: "" // Empty message as we removed the message input
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsShareDialogOpen(false);
      setShareRecipientId(null);
      
      // Invalidate queries to refresh share data
      queryClient.invalidateQueries({ queryKey: ["/api/pulses"] }); // Refresh all pulses
      
      toast({
        title: "Pulse shared successfully",
        description: "The recipient will be notified",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to share pulse",
        description: 'Error sharing the pulse',
        variant: "destructive",
      });
    },
  });
  
  // Handle reaction button click
  const handleReaction = (reactionType: "insightful" | "misinformed") => {
    console.log('[REACTION DEBUG] handleReaction called', { reactionType, userId });
    console.log('[REACTION DEBUG] userReactionsData:', userReactionsData);
    console.log('[REACTION DEBUG] quotaData:', quotaData);
    
    const userReaction = userReactionsData?.find(
      (reaction: any) => reaction.userId === userId && reaction.reactionType === reactionType
    );
    
    console.log('[REACTION DEBUG] userReaction:', userReaction);
    
    if (userReaction) {
      // Remove existing reaction
      console.log('[REACTION DEBUG] Removing existing reaction:', userReaction.id);
      deleteReactionMutation.mutate(userReaction.id);
    } else {
      // Check quota and add new reaction
      const quota = quotaData?.[reactionType];
      const hasRemainingQuota = quota?.remaining > 0;
      
      console.log('[REACTION DEBUG] Quota check:', { quota, hasRemainingQuota });
      
      if (!hasRemainingQuota && quota) {
        console.log('[REACTION DEBUG] Quota exceeded - showing toast');
        toast({
          title: "Daily limit reached",
          description: `You've used all your ${reactionType} reactions for today (${quota?.max})`,
        });
        return;
      }
      
      console.log('[REACTION DEBUG] Triggering mutation with reactionType:', reactionType);
      reactionMutation.mutate(reactionType);
    }
  };
  
  // Handle share button click
  const handleShareSubmit = () => {
    if (!shareRecipientId) {
      toast({
        title: "Select a recipient",
        description: "Please select a recipient to share with",
      });
      return;
    }
    
    shareMutation.mutate();
  };
  
  // React query gives us loading states
  const isLoading = reactionMutation.isPending || deleteReactionMutation.isPending || shareMutation.isPending;
  
  // Format counts with abbreviations for large numbers
  const formatCount = (count: number = 0) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {/* Insightful Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              disabled={isLoading}
              className="text-gray-400 hover:text-white hover:bg-gray-600/30 hover:scale-110 hover:shadow-md rounded-md px-2 py-1 text-sm flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
              onClick={() => handleReaction("insightful")}
            >
              <Flame className={`h-4 w-4 transition-all duration-200 ${hasInsightfulReaction ? "text-white fill-white scale-110" : ""}`} strokeWidth={2} />
              {formatCount(pulse.insightfulCount || 0)}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mark as Insightful 🔥</p>
            {quotaData && (
              <p className="text-xs mt-1">Remaining: {quotaData.insightful?.remaining}/{quotaData.insightful?.max}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Misinformed Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              disabled={isLoading}
              className="text-gray-400 hover:text-white hover:bg-gray-600/30 hover:scale-110 hover:shadow-md rounded-md px-2 py-1 text-sm flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50"
              onClick={() => handleReaction("misinformed")}
            >
              <AlertTriangle className={`h-4 w-4 transition-all duration-200 ${hasMisinformedReaction ? "text-white fill-white/30 scale-110" : ""}`} strokeWidth={2} />
              {formatCount(pulse.misinformedCount || 0)}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Flag as Misinformed ⚠️</p>
            {quotaData && (
              <p className="text-xs mt-1">Remaining: {quotaData.misinformed?.remaining}/{quotaData.misinformed?.max}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Share Button - HIDDEN TEMPORARILY (Will implement later) */}
      {false && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-gray-400 hover:text-white hover:bg-gray-600/30 hover:scale-110 hover:shadow-md rounded-md px-2 py-1 text-sm flex items-center gap-1.5 transition-all duration-200">
              <Share className={`h-4 w-4 transition-all duration-200 ${isShareDialogOpen ? "text-white scale-110" : ""}`} strokeWidth={2} />
              {formatCount(pulse.shareCount || 0)}
            </button>
          </DialogTrigger>
        <DialogContent className="max-w-md bg-gray-900/80 backdrop-blur-sm border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-white">Share this pulse</DialogTitle>
            <DialogDescription className="text-gray-300">
              Share with someone in your network or on social media
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Internal Share Section */}
            <div className="space-y-3">
              <Label className="text-gray-300">Share with user</Label>
              <SearchableUserSelect
                currentUserId={userId}
                selectedUserId={shareRecipientId}
                onUserSelect={setShareRecipientId}
              />
              {shareRecipientId && (
                <Button
                  onClick={handleShareSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-white/80 to-white/90 text-black font-medium hover:from-white/90 hover:to-white hover:scale-105 transition-all duration-200"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send to User
                </Button>
              )}
            </div>

            {/* Social Share Section */}
            <SocialShareButtons
              pulseId={pulse.id}
              pulseContent={pulse.content || pulse.title}
              pulseAuthor={pulse.user?.name || "a user"}
            />
          </div>
        </DialogContent>
      </Dialog>
      )}
      
      {/* Comments Button - Hidden for Musk AI pulses */}
      {pulse.userId !== 3 && (
        <button 
          onClick={onCommentClick}
          className="text-gray-400 hover:text-white hover:bg-gray-600/30 hover:scale-110 hover:shadow-md rounded-md px-2 py-1 text-sm flex items-center gap-1.5 transition-all duration-200"
          data-testid={`button-comments-${pulse.id}`}
        >
          <MessageSquare className="h-4 w-4" strokeWidth={2} />
          {formatCount(pulse.comments || 0)}
        </button>
      )}
    </div>
  );
}

// Poll Voting Component
interface PollVotingProps {
  pulse: PulseWithUser;
}

function PollVoting({ pulse }: PollVotingProps) {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<any[]>([]);
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  
  // Get the current user ID from auth context
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  // Fetch user's vote for this poll
  const { data: userVoteData } = useQuery<any>({
    queryKey: [`/api/poll-votes/user/${userId}/pulse/${pulse.id}`],
  });
  
  // Effect to handle the user vote data
  useEffect(() => {
    if (userVoteData) {
      setUserVote(userVoteData.optionIndex);
      setSelectedOption(userVoteData.optionIndex);
    }
  }, [userVoteData]);
  
  // Fetch all votes for this poll
  const { data: pollVotesData } = useQuery<any[]>({
    queryKey: [`/api/pulses/${pulse.id}/poll-votes`],
  });
  
  // Effect to handle all poll votes data
  useEffect(() => {
    if (pollVotesData) {
      setPollVotes(pollVotesData);
      
      // Calculate vote counts for each option
      const counts = pulse.pollOptions.map((_, index) => {
        return pollVotesData.filter(vote => vote.optionIndex === index).length;
      });
      
      setVoteCounts(counts);
      setTotalVotes(pollVotesData.length);
    }
  }, [pollVotesData, pulse.pollOptions]);
  
  // Submit vote mutation
  const voteMutation = useMutation({
    mutationFn: async (optionIndex: number) => {
      const res = await apiRequest("POST", "/api/poll-votes", {
        userId,
        pulseId: pulse.id,
        optionIndex
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setUserVote(data.optionIndex);
      
      // Invalidate queries to refresh vote data
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulse.id}/poll-votes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/poll-votes/user/${userId}/pulse/${pulse.id}`] });
      
      toast({
        title: "Vote submitted!",
        description: "Your vote has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit vote",
        description: 'Error submitting your vote',
        variant: "destructive",
      });
    },
  });
  
  const handleVote = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    voteMutation.mutate(optionIndex);
  };
  
  const isLoading = voteMutation.isPending;
  
  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm font-medium flex items-center gap-2 text-white">
        <BarChart className="h-4 w-4 text-blue-400" />
        <span>Poll Options</span>
      </div>
      
      <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10">
        {pulse.pollOptions.map((option, index) => (
          <div key={index} className="space-y-1 mb-3 last:mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className={`h-8 px-3 py-1 rounded-md transition-all duration-300 text-sm font-medium backdrop-blur-sm border flex items-center ${
                    userVote === index 
                      ? 'bg-white/20 border-white/40 text-white shadow-md' 
                      : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15 hover:border-white/30'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => handleVote(index)}
                  disabled={isLoading}
                >
                  {userVote === index && <Check className="h-3 w-3 mr-1 text-white" />}
                  {option}
                </button>
                
                {userVote !== null && (
                  <span className="text-xs text-white/70">
                    {voteCounts[index] || 0} vote{voteCounts[index] !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {userVote !== null && (
                <span className="text-xs font-medium text-white/90">
                  {totalVotes > 0 ? Math.round((voteCounts[index] || 0) / totalVotes * 100) : 0}%
                </span>
              )}
            </div>
            
            {userVote !== null && (
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500 ease-in-out"
                  style={{ 
                    width: `${totalVotes > 0 ? (voteCounts[index] || 0) / totalVotes * 100 : 0}%` 
                  }} 
                />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-white/70" />
          </div>
        )}
        
        {userVote !== null && (
          <div className="text-xs text-right text-white/60 pt-2 border-t border-white/20 mt-2">
            Total votes: {totalVotes}
          </div>
        )}
      </div>
    </div>
  );
}

// Image Carousel Component for Media Pulses
function ImageCarousel({ pulse }: { pulse: PulseWithUser }) {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  useEffect(() => {
    // Log what we received from the server
    console.log("Pulse received for carousel:", pulse);
    console.log("Media URLs:", pulse.mediaUrls);
    console.log("Media localStorage keys:", pulse.mediaLocalStorageKeys);
    
    let mediaImages: string[] = [];
    
    // First try to use mediaUrls if they exist
    if (pulse.mediaUrls && pulse.mediaUrls.length > 0) {
      // Filter out any invalid URLs (empty strings, undefined, etc.)
      mediaImages = pulse.mediaUrls.filter(url => url && url.trim() !== '');
      console.log("Using mediaUrls for carousel:", mediaImages);
    } 
    // If no mediaUrls, try mediaLocalStorageKeys
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      // Check if these are URLs (from newer uploads) or localStorage keys (from older uploads)
      const allStartWithHttp = pulse.mediaLocalStorageKeys.every(
        key => key && (key.startsWith('http://') || key.startsWith('https://'))
      );
      
      if (allStartWithHttp) {
        // These are already URLs (from server)
        mediaImages = pulse.mediaLocalStorageKeys.filter(url => url && url.trim() !== '');
        console.log("Using mediaLocalStorageKeys as direct URLs:", mediaImages);
      } else {
        // These might be old localStorage keys, try to retrieve them
        pulse.mediaLocalStorageKeys.forEach(key => {
          if (!key) return;
          
          try {
            const storedData = localStorage.getItem(key);
            if (storedData && storedData.startsWith('data:image')) {
              mediaImages.push(storedData);
            }
          } catch (e) {
            console.error("Error retrieving image from localStorage:", e);
          }
        });
        console.log("Retrieved images from localStorage:", mediaImages.length);
      }
    }
    
    // Log an alert if we couldn't find any images
    if (mediaImages.length === 0) {
      console.warn("No images found for this pulse. This pulse might be missing image data.");
    }
    
    setImages(mediaImages);
    setIsLoading(false);
  }, [pulse]);

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span>Image Gallery ({images.length})</span>
        </div>
        <div className="mt-2">
          {isLoading ? (
            <div className="h-72 flex flex-col p-4 space-y-4">
              {/* Carousel skeleton */}
              <div className="h-8 w-40 bg-muted rounded mb-2 animate-pulse"></div>
              <div className="flex-1 bg-muted rounded-lg animate-pulse"></div>
              <div className="flex justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-muted animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-muted animate-pulse"></div>
              </div>
            </div>
          ) : (
            <Carousel className="w-full" 
              setApi={(api) => {
                // Update currentImageIndex when carousel changes
                api?.on("select", () => {
                  const selectedIndex = api.selectedScrollSnap();
                  setCurrentImageIndex(selectedIndex);
                });
              }}>
              <CarouselContent>
                {images.map((url, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 group">
                      <div 
                        className="overflow-hidden rounded-lg relative cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                        onClick={() => openLightbox(index)}
                      >
                        <div className="w-full h-72 md:h-60 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                          <img 
                            src={url} 
                            alt={`Media ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(`Failed to load image: ${url}`);
                              e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                            }}
                          />
                          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
                            <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          </div>
                        </div>
                        {/* Image counter indicator */}
                        {images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs py-1 px-2 rounded-full">
                            {index + 1}/{images.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <div className="flex flex-col items-center justify-center mt-4 gap-2">
                  <div className="flex items-center gap-2">
                    <CarouselPrevious className="relative -translate-y-0 -left-0 mr-2 bg-white/80 hover:bg-white hover:scale-110 shadow-md transition-all duration-200" />
                    <CarouselNext className="relative -translate-y-0 -right-0 ml-2 bg-white/80 hover:bg-white hover:scale-110 shadow-md transition-all duration-200" />
                  </div>
                  <div className="flex gap-1 mt-1">
                    {images.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-gray-300/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Carousel>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-screen-xl max-h-screen w-full h-full flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-gray-800/70 hover:scale-110 transition-all duration-200"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
            
            {/* Main image */}
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
              <img 
                src={images[currentImageIndex]} 
                alt={`Fullscreen ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load lightbox image: ${images[currentImageIndex]}`);
                  e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
            
            {/* Navigation buttons */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                <button 
                  className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-80"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-80"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Video Player Component for Media Pulses
function VideoPlayer({ pulse }: { pulse: PulseWithUser }) {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Log what we received from the server
    console.log("Pulse received for video player:", pulse);
    console.log("Video media URLs:", pulse.mediaUrls);
    console.log("Video localStorage keys:", pulse.mediaLocalStorageKeys);
    
    // First try to use mediaUrls if they exist
    if (pulse.mediaUrls && pulse.mediaUrls.length > 0) {
      // Use the first video URL (should only be one video per pulse)
      setVideoUrl(pulse.mediaUrls[0]);
      console.log("Using mediaUrls for video:", pulse.mediaUrls[0]);
    } 
    // If no mediaUrls, try mediaLocalStorageKeys
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      // Check if these are URLs (from newer uploads) or localStorage keys (from older uploads)
      const allStartWithHttp = pulse.mediaLocalStorageKeys.every(
        key => key && (key.startsWith('http://') || key.startsWith('https://'))
      );
      
      if (allStartWithHttp) {
        // These are already URLs (from server)
        setVideoUrl(pulse.mediaLocalStorageKeys[0]);
        console.log("Using mediaLocalStorageKeys as direct URL:", pulse.mediaLocalStorageKeys[0]);
      } else {
        // These might be old localStorage keys, try to retrieve them
        try {
          const key = pulse.mediaLocalStorageKeys[0];
          if (key) {
            const storedData = localStorage.getItem(key);
            if (storedData) {
              setVideoUrl(storedData);
              console.log("Retrieved video from localStorage for key:", key);
            } else {
              console.warn("No video data found in localStorage for key:", key);
            }
          }
        } catch (e) {
          console.error("Error retrieving video from localStorage:", e);
        }
      }
    }
    
    setIsLoading(false);
  }, [pulse]);

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <Video className="h-4 w-4 text-muted-foreground" />
        <span>Video</span>
      </div>
      <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {isLoading ? (
          <div className="h-60 bg-gradient-to-b from-gray-50 to-gray-100 animate-pulse">
            <div className="h-full w-full flex flex-col items-center justify-center">
              <div className="rounded-full bg-muted w-16 h-16 mb-4"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="mt-4 flex items-center justify-center w-full px-8">
                <div className="h-4 w-full max-w-sm bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ) : videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            className="w-full aspect-video bg-black" 
            poster="/images/demo/video-placeholder.svg"
            onError={(e) => {
              console.error(`Failed to load video: ${videoUrl}`);
              e.currentTarget.poster = 'https://via.placeholder.com/800x450?text=Video+Not+Available';
            }}
          />
        ) : (
          <div className="h-60 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <Video className="h-12 w-12 text-gray-300 mb-2" />
            <span className="text-sm text-muted-foreground">Video not available</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Details Component
function ProjectDetails({ pulse, onViewProject }: { pulse: PulseWithUser; onViewProject?: (project: any) => void }) {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!pulse.projectId) {
        setIsLoading(false);
        return;
      }
      
      // Check if we have a cached version of this project
      // @ts-ignore - This is a global variable set in the main component
      if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[pulse.projectId]) {
        // @ts-ignore
        setProjectDetails(window.__PROJECT_CACHE__[pulse.projectId]);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/projects/${pulse.projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProjectDetails(data);
          
          // Also cache this for future use
          // @ts-ignore
          if (!window.__PROJECT_CACHE__) window.__PROJECT_CACHE__ = {};
          // @ts-ignore
          window.__PROJECT_CACHE__[pulse.projectId] = data;
        } else {
          console.error(`Error fetching project details: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [pulse.projectId]);

  // Helper function to normalize media URLs
  const normalizeMediaUrls = (mediaUrls: string | string[] | null): string[] => {
    if (!mediaUrls) return [];
    
    if (Array.isArray(mediaUrls)) {
      return mediaUrls.filter(url => url && url.trim() !== '');
    }
    
    if (typeof mediaUrls === 'string') {
      // Check if it's a JSON array string
      if (mediaUrls.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(mediaUrls);
          if (Array.isArray(parsed)) {
            return parsed.filter(url => url && url.trim() !== '');
          }
        } catch (e) {
          // If JSON parse fails, treat as single URL
          return mediaUrls.trim() ? [mediaUrls] : [];
        }
      }
      // Single URL string
      return mediaUrls.trim() ? [mediaUrls] : [];
    }
    
    return [];
  };

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (images: string[]) => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (images: string[]) => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Get normalized images
  const projectImages = projectDetails ? normalizeMediaUrls(projectDetails.mediaUrls) : [];

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          nextImage(projectImages);
          break;
        case 'ArrowLeft':
          prevImage(projectImages);
          break;
        case 'Escape':
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, projectImages]);

  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span>Project Update</span>
        </div>
        
        <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-gradient-to-b from-gray-800/30 to-gray-900/20 backdrop-blur-sm border border-white/10">
          {isLoading ? (
            <div className="h-24 space-y-3 animate-pulse">
              <div className="h-5 w-2/3 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-8 w-32 bg-muted rounded mt-4"></div>
            </div>
          ) : projectDetails ? (
            <div className="space-y-3">
              <h3 className="font-medium">{projectDetails.title}</h3>
              {projectDetails.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{projectDetails.description}</p>
              )}
              
              {/* Project Images Carousel */}
              {projectImages.length > 0 && (
                <div className="mt-3">
                  <Carousel className="w-full" 
                    setApi={(api) => {
                      api?.on("select", () => {
                        const selectedIndex = api.selectedScrollSnap();
                        setCurrentImageIndex(selectedIndex);
                      });
                    }}>
                    <CarouselContent>
                      {projectImages.map((url, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1 group">
                            <div 
                              className="overflow-hidden rounded-lg relative cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                              onClick={() => openLightbox(index)}
                            >
                              <div className="w-full h-48 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                                <img 
                                  src={url} 
                                  alt={`Project media ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Failed to load project image: ${url}`);
                                    e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
                                  <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                </div>
                              </div>
                              {projectImages.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded-full">
                                  {index + 1}/{projectImages.length}
                                </div>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {projectImages.length > 1 && (
                      <div className="flex flex-col items-center justify-center mt-3 gap-2">
                        <div className="flex items-center gap-2">
                          <CarouselPrevious className="relative -translate-y-0 -left-0 mr-2 bg-white/80 hover:bg-white hover:scale-110 shadow-md transition-all duration-200" />
                          <CarouselNext className="relative -translate-y-0 -right-0 ml-2 bg-white/80 hover:bg-white hover:scale-110 shadow-md transition-all duration-200" />
                        </div>
                        <div className="flex gap-1 mt-1">
                          {projectImages.map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentImageIndex ? 'w-4 bg-primary shadow-sm' : 'w-1.5 bg-gray-300/70'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Carousel>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 transition-all duration-300"
                  onClick={() => onViewProject ? onViewProject(projectDetails) : setLocation(`/dashboard?view=project&projectId=${projectDetails.id}`)}
                  data-testid="button-view-project"
                >
                  View Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-24 flex flex-col items-center justify-center">
              <FileCode className="h-8 w-8 text-gray-300 mb-2" />
              <span className="text-sm text-muted-foreground">Project not found</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for project images */}
      {isLightboxOpen && projectImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-screen-xl max-h-screen w-full h-full flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-gray-800/70 hover:scale-110 transition-all duration-200"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="absolute top-4 left-4 text-white">
              {currentImageIndex + 1} / {projectImages.length}
            </div>
            
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
              <img 
                src={projectImages[currentImageIndex]} 
                alt={`Fullscreen ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load lightbox image: ${projectImages[currentImageIndex]}`);
                  e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
            
            {projectImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-gray-800/70 hover:scale-110 transition-all duration-200"
                  onClick={() => prevImage(projectImages)}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-gray-800/70 hover:scale-110 transition-all duration-200"
                  onClick={() => nextImage(projectImages)}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Smart Refresh Banner Component
interface SmartRefreshBannerProps {
  hasNewContent: boolean;
  onRefresh: () => void;
  isPremiumContent?: boolean;
}

function SmartRefreshBanner({ hasNewContent, onRefresh, isPremiumContent = false }: SmartRefreshBannerProps) {
  if (!hasNewContent) return null;
  
  // Using Neo-Glass UI styling for both types
  const bannerClasses = isPremiumContent
    ? "bg-gray-900/40 border-gray-700/30 text-white" // Premium content (Musk)
    : "bg-gray-900/40 border-gray-700/30 text-white"; // Regular content
    
  const iconClasses = isPremiumContent
    ? "text-white" // Premium content (Musk)
    : "text-white"; // Regular content
  
  return (
    <button 
      className={`w-full py-3 px-4 rounded-lg border backdrop-blur-sm flex items-center justify-center gap-2 mb-4 hover:bg-gray-800/50 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 ${bannerClasses}`}
      onClick={onRefresh}
    >
      <RefreshCw className={`h-4 w-4 ${iconClasses} animate-pulse`} />
      <span className="font-medium">
        {isPremiumContent ? 'Musk has updated your feed' : 'New posts available'}
      </span>
    </button>
  );
}

export default function IndustryPulsePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id; // Get current user ID for personalized pulses
  
  // Project modal state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Smart refresh state
  const [hasNewContent, setHasNewContent] = useState(false);
  const [hasPremiumContent, setHasPremiumContent] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Comment toggle state
  const [expandedCommentsPulseId, setExpandedCommentsPulseId] = useState<number | null>(null);
  
  // Fetch all pulses (includes personalized pulses for this user)
  const { data: pulses = [], isLoading, refetch } = useQuery<PulseWithUser[]>({
    queryKey: ["/api/pulses", userId],
    queryFn: async () => {
      // Pass userId to get personalized pulses
      const url = userId ? `/api/pulses?userId=${userId}` : '/api/pulses';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch pulses');
      return res.json();
    }
  });
  
  // Handle refresh button click
  const handleRefresh = async () => {
    await refetch();
    setHasNewContent(false);
    setHasPremiumContent(false);
    
    // Clear any pending auto-refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    // Show a confirmation toast
    toast({
      title: "Feed Updated",
      description: "Your feed has been refreshed with the latest content.",
    });
  };
  
  // Filter pulses based on the active tab
  // IMPORTANT: Hide all Musk Pulses (news-pulse type, userId 3)
  const filteredPulses = pulses.filter((pulse: PulseWithUser) => {
    // First, exclude all Musk Pulses (news-pulse type OR userId 3)
    const isMuskPulse = (pulse.type as string) === "news-pulse" || pulse.userId === 3;
    if (isMuskPulse) return false;
    
    // Then apply tab filtering
    if (activeTab === "all") return true;
    return pulse.type === activeTab;
  });

  const getPulseIcon = (pulse: PulseWithUser) => {
    switch (pulse.type) {
      case "poll":
        return <BarChart className="h-5 w-5 text-muted-foreground" />;
      case "media-pulse":
        return pulse.mediaType === "video" ? 
          <Video className="h-5 w-5 text-muted-foreground" /> : 
          <Image className="h-5 w-5 text-muted-foreground" />;
      case "project":
        return <FileCode className="h-5 w-5 text-muted-foreground" />;
      case "news-pulse":
        // Special icon for news pulses, amber/yellow color to match Musk branding
        return <Newspaper className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex h-screen flex-col">
        <Header />
        <AuthLoadingBoundary>
        <div className="flex flex-1 overflow-hidden"> {/* Removed pt-16 to match Brand Quests spacing */}
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-6"> {/* Further reduced top margin to 3 (0.75rem) */}
            <div className="flex gap-6">
              {/* Main content */}
              <div className="flex-1 max-w-4xl">
                <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Industry Pulse</h1>
                  <p className="text-white/80 mt-1">
                    Discover insights, polls, and media from your professional network
                  </p>
                </div>
                <button 
                  onClick={() => setLocation("/create-pulse")} 
                  className="neo-glass-button flex items-center gap-2 py-2 px-4"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Create Pulse</span>
                </button>
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 dark-tabs-list">
                  <TabsTrigger value="all" className="dark-tabs-trigger">All</TabsTrigger>
                  <TabsTrigger value="media-pulse" className="dark-tabs-trigger">Media</TabsTrigger>
                  <TabsTrigger value="poll" className="dark-tabs-trigger">Polls</TabsTrigger>
                  <TabsTrigger value="project" className="dark-tabs-trigger">Projects</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {/* Smart refresh banner */}
                  <SmartRefreshBanner 
                    hasNewContent={hasNewContent} 
                    onRefresh={handleRefresh}
                    isPremiumContent={hasPremiumContent}
                  />
                  
                  {isLoading ? (
                    <FeedSkeleton count={2} />
                  ) : filteredPulses.length === 0 ? (
                    <NeoGlassSection>
                      <div className="flex flex-col items-center justify-center py-10">
                        <Users className="h-16 w-16 text-white/80 mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-white">No pulses yet</h3>
                        <p className="text-center text-white/70 max-w-md mb-6">
                          {activeTab === "all" 
                            ? "Be the first to create a pulse in your professional network!" 
                            : `No ${activeTab} pulses available yet. Create one to get started!`}
                        </p>
                        <button 
                          onClick={() => setLocation("/create-pulse")} 
                          className="neo-glass-button flex items-center gap-2 py-2 px-4"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Create Your First Pulse
                        </button>
                      </div>
                    </NeoGlassSection>
                  ) : (
                    <div className="space-y-6">
                      {filteredPulses.map((pulse: PulseWithUser) => (
                        <NeoGlassSection key={pulse.id} className="overflow-hidden mb-6">
                          <div className="pb-3">
                            <div className="flex justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                  {pulse.user?.photoURL ? (
                                    <AvatarImage src={pulse.user.photoURL} alt={pulse.user.name || "User"} />
                                  ) : (
                                    <AvatarFallback>
                                      {pulse.user?.name?.[0] || "U"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    <span>{pulse.user?.name || "Anonymous User"}</span>
                                    {(pulse.user as any)?.subscriptionTier === 'premium' && <PremiumBadge size="sm" />}
                                    {/* Special labeling for Musk */}
                                    {pulse.userId === 3 && <span className="text-amber-500 ml-1">⚡</span>}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      {getPulseIcon(pulse)}
                                      {pulse.type === 'media-pulse' ? pulse.mediaType : pulse.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <PulseMenu 
                                pulseId={pulse.id}
                                currentUserId={user?.id || 0}
                                pulseCreatorId={pulse.userId}
                              />
                            </div>
                          </div>
                          <div className="px-4 py-2">
                            <h3 
                              className="text-xl font-semibold mb-3 text-white hover:text-blue-400 cursor-pointer transition-colors"
                              onClick={() => setLocation(`/pulse/${pulse.id}`)}
                              data-testid={`pulse-title-${pulse.id}`}
                            >
                              {pulse.title}
                            </h3>
                            {/* Render content with clickable reference links */}
                            {(() => {
                              if (!pulse.content) return null;
                              
                              // Check if content contains reference links section
                              const readMoreIndex = pulse.content.indexOf('📚 Read More:');
                              
                              if (readMoreIndex === -1) {
                                // No reference links, render as normal text
                                return <p className="text-white/70">{pulse.content}</p>;
                              }
                              
                              // Split content into main content and reference links
                              const mainContent = pulse.content.substring(0, readMoreIndex).trim();
                              const referencesSection = pulse.content.substring(readMoreIndex);
                              
                              // Parse reference links from the text
                              const referenceLines = referencesSection.split('\n').slice(1); // Skip the "📚 Read More:" line
                              const references = [];
                              
                              for (let i = 0; i < referenceLines.length; i += 2) {
                                const titleLine = referenceLines[i];
                                const urlLine = referenceLines[i + 1];
                                
                                if (titleLine && urlLine && titleLine.startsWith('•') && urlLine.trim().startsWith('http')) {
                                  const titleMatch = titleLine.match(/^•\s*(.+?)\s*-\s*(.+)$/);
                                  if (titleMatch) {
                                    references.push({
                                      title: titleMatch[1].trim(),
                                      source: titleMatch[2].trim(),
                                      url: urlLine.trim()
                                    });
                                  }
                                }
                              }
                              
                              return (
                                <div className="space-y-3">
                                  <p className="text-white/70">{mainContent}</p>
                                  
                                  {references.length > 0 && (
                                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-medium text-white/90">📚 Read More</span>
                                      </div>
                                      <div className="space-y-3">
                                        {references.map((ref, index) => (
                                          <div key={index} className="flex flex-col gap-1">
                                            <a 
                                              href={ref.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors"
                                            >
                                              {ref.title}
                                            </a>
                                            <span className="text-xs text-white/50">{ref.source}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            
                            {/* Render pulse content based on type */}
                            {pulse.type === 'poll' && (
                              <PollVoting pulse={pulse} />
                            )}
                            
                            {pulse.type === 'media-pulse' && pulse.mediaType === 'image' && (
                              <ImageCarousel pulse={pulse} />
                            )}
                            
                            {pulse.type === 'media-pulse' && pulse.mediaType === 'video' && (
                              <VideoPlayer pulse={pulse} />
                            )}
                            
                            {pulse.type === 'project' && (
                              <ProjectDetails 
                                pulse={pulse} 
                                onViewProject={(project) => {
                                  setSelectedProject(project);
                                  setIsProjectModalOpen(true);
                                }}
                              />
                            )}
                          </div>
                          <div className="flex justify-between pt-0 px-4 pb-2">
                            <PulseReactions 
                              key={`pulse-reactions-${pulse.id}-${userId}`}
                              pulse={pulse} 
                              currentUserId={userId}
                              onCommentClick={() => {
                                setExpandedCommentsPulseId(expandedCommentsPulseId === pulse.id ? null : pulse.id);
                              }}
                            />
                          </div>
                          {/* Comment Section - Hidden for Musk AI pulses */}
                          {expandedCommentsPulseId === pulse.id && pulse.userId !== 3 && (
                            <div className="px-4 pb-4">
                              <CommentSection pulseId={pulse.id} initialCommentCount={pulse.comments || 0} isExpanded={true} />
                            </div>
                          )}
                        </NeoGlassSection>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              </div>
              
              {/* Nowboard Panel Sidebar */}
              <div className="w-80 flex-shrink-0">
                <NowboardPanelSimple />
              </div>
            </div>
          </NeoGlassLayout>
        </div>
      </div>
      </div>
      
      {/* Project Detail Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto neo-glass-card bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">{selectedProject?.title}</DialogTitle>
            {selectedProject?.category && (
              <p className="text-sm text-white/60">{selectedProject.category}</p>
            )}
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-4">
              {selectedProject.description && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Description</h3>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedProject.description}</p>
                </div>
              )}
              
              {selectedProject.startDate && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Start Date</h3>
                  <p className="text-white/80">{selectedProject.startDate}</p>
                </div>
              )}
              
              {selectedProject.projectUrl && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Project URL</h3>
                  <a 
                    href={selectedProject.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {selectedProject.projectUrl}
                  </a>
                </div>
              )}
              
              {selectedProject.mediaUrls && selectedProject.mediaUrls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Project Media</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProject.mediaUrls.map((url: string, index: number) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Project media ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Collaborators</h3>
                  <div className="space-y-2">
                    {selectedProject.collaborators.map((collab: any) => (
                      <div key={collab.id} className="flex items-center gap-2">
                        <span className="text-white/80">{collab.name}</span>
                        {collab.role && (
                          <span className="text-xs text-white/60">({collab.role})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsProjectModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </AuthLoadingBoundary>
    </div>
  );
}