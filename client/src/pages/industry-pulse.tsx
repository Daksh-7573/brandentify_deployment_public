import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
// Removed Sidebar import, using top navigation only
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useGlassEffects } from "@/contexts/GlassEffectsContext";
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
  Plus,
  Flame
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CardSkeleton } from "@/components/ui/skeleton-loaders";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

function PulseReactions({ pulse }: PulseReactionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  // State for the share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareRecipientId, setShareRecipientId] = useState<number | null>(null);
  
  // Get user reaction quota
  const { data: quotaData } = useQuery<any>({
    queryKey: [`/api/users/${userId}/reaction-quota`],
  });
  
  // Get user's reactions for this pulse
  const { data: userReactionData, refetch: refetchUserReactions } = useQuery<any>({
    queryKey: [`/api/pulses/${pulse.id}/reactions`],
  });
  
  // Determine if user has already reacted to this pulse
  const hasInsightfulReaction = userReactionData?.some(
    (reaction: any) => reaction.userId === userId && reaction.reactionType === "insightful"
  );
  
  const hasMisinformedReaction = userReactionData?.some(
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
          ? "Marked as Insightful! 🔥" 
          : "Flagged as Misinformed ⚠️",
        description: `Daily usage: ${data.quota.used}/${data.quota.max}`,
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
        message: shareMessage
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsShareDialogOpen(false);
      setShareMessage("");
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
    const userReactions = userReactionData || [];
    const existingReaction = userReactions.find(
      (reaction: any) => reaction.userId === userId && reaction.reactionType === reactionType
    );
    
    if (existingReaction) {
      // Remove existing reaction
      deleteReactionMutation.mutate(existingReaction.id);
    } else {
      // Check quota and add new reaction
      const quota = quotaData?.[reactionType];
      const hasRemainingQuota = quota?.remaining > 0;
      
      if (!hasRemainingQuota) {
        toast({
          title: "Daily limit reached",
          description: `You've used all your ${reactionType} reactions for today (${quota?.max})`,
          variant: "warning",
        });
        return;
      }
      
      reactionMutation.mutate(reactionType);
    }
  };
  
  // Handle share button click
  const handleShareSubmit = () => {
    if (!shareRecipientId) {
      toast({
        title: "Select a recipient",
        description: "Please select a recipient to share with",
        variant: "warning",
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
            <Button 
              variant={hasInsightfulReaction ? "default" : "ghost"} 
              size="sm" 
              disabled={isLoading}
              className={`${hasInsightfulReaction ? "bg-amber-600 hover:bg-amber-700" : "text-muted-foreground"}`}
              onClick={() => handleReaction("insightful")}
            >
              <Flame className={`h-4 w-4 mr-2 ${hasInsightfulReaction ? "text-white" : ""}`} />
              {formatCount(pulse.insightfulCount || 0)}
            </Button>
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
            <Button 
              variant={hasMisinformedReaction ? "default" : "ghost"} 
              size="sm" 
              disabled={isLoading}
              className={`${hasMisinformedReaction ? "bg-red-600 hover:bg-red-700" : "text-muted-foreground"}`}
              onClick={() => handleReaction("misinformed")}
            >
              <AlertTriangle className={`h-4 w-4 mr-2 ${hasMisinformedReaction ? "text-white" : ""}`} />
              {formatCount(pulse.misinformedCount || 0)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Flag as Misinformed ⚠️</p>
            {quotaData && (
              <p className="text-xs mt-1">Remaining: {quotaData.misinformed?.remaining}/{quotaData.misinformed?.max}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Share Button */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share className="h-4 w-4 mr-2" />
            {formatCount(pulse.shareCount || 0)}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this pulse</DialogTitle>
            <DialogDescription>
              Share this pulse with another user in your network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              {/* This would be replaced with a proper user search/select */}
              <select 
                id="recipient" 
                className="w-full rounded-md border border-input p-2"
                value={shareRecipientId || ""}
                onChange={(e) => setShareRecipientId(Number(e.target.value) || null)}
              >
                <option value="">Select a user</option>
                <option value="1">Demo User</option>
                {userId !== 1 && <option value="1">Senior Professional</option>}
                {userId !== 2 && user && <option value="2">{user.name || user.username}</option>}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Input
                id="message"
                placeholder="Add a message..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShareSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comments Button */}
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <MessageSquare className="h-4 w-4 mr-2" />
        {formatCount(pulse.comments || 0)}
      </Button>
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
      <div className="text-sm font-medium flex items-center gap-2">
        <BarChart className="h-4 w-4 text-purple-500" />
        <span>Poll Options</span>
      </div>
      
      <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-gradient-to-b from-purple-50/30 to-purple-50/10">
        {pulse.pollOptions.map((option, index) => (
          <div key={index} className="space-y-1 mb-3 last:mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-8 ${userVote === index ? 'bg-purple-100 border-purple-300 text-purple-700' : ''} transition-all duration-300`}
                  onClick={() => handleVote(index)}
                  disabled={isLoading}
                >
                  {userVote === index && <Check className="h-3 w-3 mr-1 text-purple-600" />}
                  {option}
                </Button>
                
                {userVote !== null && (
                  <span className="text-xs text-muted-foreground">
                    {voteCounts[index] || 0} vote{voteCounts[index] !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {userVote !== null && (
                <span className="text-xs font-medium">
                  {totalVotes > 0 ? Math.round((voteCounts[index] || 0) / totalVotes * 100) : 0}%
                </span>
              )}
            </div>
            
            {userVote !== null && (
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-500 ease-in-out"
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
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          </div>
        )}
        
        {userVote !== null && (
          <div className="text-xs text-right text-muted-foreground pt-2 border-t border-purple-100 mt-2">
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
          <Image className="h-4 w-4 text-blue-500" />
          <span>Image Gallery ({images.length})</span>
        </div>
        <div className="mt-2">
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    <CarouselPrevious className="relative -translate-y-0 -left-0 mr-2 bg-white/90 hover:bg-white shadow-md" />
                    <CarouselNext className="relative -translate-y-0 -right-0 ml-2 bg-white/90 hover:bg-white shadow-md" />
                  </div>
                  <div className="flex gap-1 mt-1">
                    {images.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'w-4 bg-primary' : 'w-1.5 bg-gray-300'
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
              className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-gray-800"
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

// Video Component for Media Pulses
function VideoPlayer({ pulse }: { pulse: PulseWithUser }) {
  // Only render for video media pulses
  if (pulse.type !== 'media-pulse' || pulse.mediaType !== 'video') {
    return null;
  }
  
  const [isLoading, setIsLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>('');
  
  useEffect(() => {
    // Log what we received from the server
    console.log("Pulse received for video player:", pulse);
    console.log("Video media URLs:", pulse.mediaUrls);
    console.log("Video localStorage keys:", pulse.mediaLocalStorageKeys);
    
    let videoUrl = '';
    
    // First try to use mediaUrls if they exist
    if (pulse.mediaUrls && pulse.mediaUrls.length > 0) {
      // Get the first valid URL
      const validUrl = pulse.mediaUrls.find(url => url && url.trim() !== '');
      if (validUrl) {
        videoUrl = validUrl;
        console.log("Using mediaUrls for video:", videoUrl);
      }
    } 
    // If no mediaUrls, try mediaLocalStorageKeys
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      // Check if these are URLs (from newer uploads) or localStorage keys (from older uploads)
      const firstKey = pulse.mediaLocalStorageKeys[0];
      
      if (firstKey && (firstKey.startsWith('http://') || firstKey.startsWith('https://'))) {
        videoUrl = firstKey;
        console.log("Using mediaLocalStorageKeys as direct URL:", videoUrl);
      } else if (firstKey) {
        // These might be old localStorage keys, try to retrieve the first one
        try {
          const storedData = localStorage.getItem(firstKey);
          if (storedData && (storedData.startsWith('data:video') || storedData.startsWith('blob:'))) {
            videoUrl = storedData;
            console.log("Retrieved video from localStorage");
          }
        } catch (e) {
          console.error("Error retrieving video from localStorage:", e);
        }
      }
    }
    
    // Log if no video URL was found
    if (!videoUrl) {
      console.warn("No video URL found for this pulse. This pulse might be missing video data.");
    }
    
    setVideoSrc(videoUrl);
    setIsLoading(false);
  }, [pulse]);
  
  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <Video className="h-4 w-4 text-blue-500" />
        <span>Video</span>
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
          <div className="relative group">
            {videoSrc ? (
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <video 
                    src={videoSrc} 
                    controls 
                    className="w-full h-full object-cover rounded-lg"
                    style={{ maxHeight: "400px" }}
                    onError={(e) => {
                      console.error(`Failed to load video: ${videoSrc}`);
                      // If video fails to load, show message
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="h-72 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg">
                            <div class="text-center">
                              <div class="mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <p class="text-blue-500">Video could not be loaded</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  {/* Video play overlay (can be customized) */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity flex items-center justify-center pointer-events-none">
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-sm">
                <div className="text-center">
                  <div className="mb-2">
                    <Video className="h-12 w-12 text-blue-300 mx-auto" />
                  </div>
                  <p className="text-blue-500">No video available for this pulse</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Project Details Component
function ProjectDetails({ pulse }: { pulse: PulseWithUser }) {
  if (pulse.type !== 'project') {
    return null;
  }

  // Initial loading state reference for skeleton UI
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Add project data state to show UI while fetching in background
  const [localProject, setLocalProject] = useState<any>(null);
  
  // Use location hook at the component level (NOT inside event handlers)
  const [_, setLocation] = useLocation();
  
  // Use React Query for better caching and performance
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${pulse.projectId}`],
    enabled: !!pulse.projectId,
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    
    // Add prefetching to improve loading speed
    initialData: () => {
      // Return cached data if it exists in window.__PROJECT_CACHE__
      // @ts-ignore
      if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[pulse.projectId]) {
        // @ts-ignore
        return window.__PROJECT_CACHE__[pulse.projectId];
      }
      return undefined;
    },
    
    // Initialize the UI with partial data immediately
    onSuccess: (data) => {
      setLocalProject(data);
      setInitialLoad(false);
    }
  });
  
  // Fast parallel fetch outside React Query for faster initial render
  useEffect(() => {
    if (!pulse.projectId) return;
    
    // This fetch happens in parallel with React Query but renders faster
    const fetchProjectFast = async () => {
      try {
        // @ts-ignore - Check if we already have the data in cache first
        if (window.__PROJECT_CACHE__ && window.__PROJECT_CACHE__[pulse.projectId]) {
          // @ts-ignore
          setLocalProject(window.__PROJECT_CACHE__[pulse.projectId]);
          setInitialLoad(false);
          return;
        }
        
        // Only proceed if we don't have data yet
        const response = await fetch(`/api/projects/${pulse.projectId}`);
        if (response.ok) {
          const data = await response.json();
          setLocalProject(data);
          // Also update the cache
          // @ts-ignore
          window.__PROJECT_CACHE__ = window.__PROJECT_CACHE__ || {};
          // @ts-ignore
          window.__PROJECT_CACHE__[pulse.projectId] = data;
        }
      } catch (error) {
        console.error('Fast fetch error:', error);
      } finally {
        // Always ensure we stop showing the loading state
        setInitialLoad(false);
      }
    };
    
    fetchProjectFast();
  }, [pulse.projectId]);
  
  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <FileCode className="h-4 w-4 text-green-500" />
        <span>Project Details</span>
      </div>
      <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-gradient-to-b from-green-50/30 to-green-50/10">
        {initialLoad ? (
          <div className="h-20 space-y-3 animate-pulse">
            <div className="h-5 w-2/3 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-8 w-32 bg-muted rounded mt-4"></div>
          </div>
        ) : (localProject || project) ? (
          <>
            <div className="mb-3">
              <h4 className="font-medium text-sm text-green-700">{(localProject || project)?.title}</h4>
              <p className="text-sm mt-1">{(localProject || project)?.description}</p>
            </div>
            
            {(localProject || project)?.skills && (localProject || project)?.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {(localProject || project)?.skills.map((skill: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-green-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Status: <span className="font-medium text-green-600 capitalize">{(localProject || project)?.status}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => {
                  // Use the already declared setLocation hook
                  setLocation(`/dashboard?view=project&projectId=${pulse.projectId}`);
                }}
              >
                <FileCode className="h-3 w-3 mr-1" /> View Full Project
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Project details not available</p>
        )}
      </div>
    </div>
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
  
  return (
    <button
      className={cn(
        "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:shadow-lg hover:-translate-y-px mb-4",
        isPremiumContent
          ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 text-amber-800"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800"
      )}
      onClick={onRefresh}
    >
      <RefreshCw className={cn(
        "h-4 w-4 animate-spin-slow", 
        isPremiumContent ? "text-amber-500" : "text-blue-500"
      )} />
      <span className="font-medium">New posts available</span>
    </button>
  );
}

// Pulse Reactions Component
interface PulseReactionsProps {
  pulse: PulseWithUser;
}

function PulseReactions({ pulse }: PulseReactionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  // State for the share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareRecipientId, setShareRecipientId] = useState<number | null>(null);
  
  // Get user reaction quota
  const { data: quotaData } = useQuery<any>({
    queryKey: [`/api/users/${userId}/reaction-quota`],
  });
  
  // Get user's reactions for this pulse
  const { data: userReactionData, refetch: refetchUserReactions } = useQuery<any>({
    queryKey: [`/api/pulses/${pulse.id}/reactions`],
  });
  
  // Determine if user has already reacted to this pulse
  const hasInsightfulReaction = userReactionData?.some(
    (reaction: any) => reaction.userId === userId && reaction.reactionType === "insightful"
  );
  
  const hasMisinformedReaction = userReactionData?.some(
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
          ? "Marked as Insightful! 🔥" 
          : "Flagged as Misinformed ⚠️",
        description: `Daily usage: ${data.quota.used}/${data.quota.max}`,
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
        message: shareMessage
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsShareDialogOpen(false);
      setShareMessage("");
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
    const userReactions = userReactionData || [];
    const existingReaction = userReactions.find(
      (reaction: any) => reaction.userId === userId && reaction.reactionType === reactionType
    );
    
    if (existingReaction) {
      // Remove existing reaction
      deleteReactionMutation.mutate(existingReaction.id);
    } else {
      // Check quota and add new reaction
      const quota = quotaData?.[reactionType];
      const hasRemainingQuota = quota?.remaining > 0;
      
      if (!hasRemainingQuota) {
        toast({
          title: "Daily limit reached",
          description: `You've used all your ${reactionType} reactions for today (${quota?.max})`,
          variant: "warning",
        });
        return;
      }
      
      reactionMutation.mutate(reactionType);
    }
  };
  
  // Handle share button click
  const handleShareSubmit = () => {
    if (!shareRecipientId) {
      toast({
        title: "Select a recipient",
        description: "Please select a recipient to share with",
        variant: "warning",
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
            <Button 
              variant={hasInsightfulReaction ? "default" : "ghost"} 
              size="sm" 
              disabled={isLoading}
              className={`${hasInsightfulReaction ? "bg-amber-600 hover:bg-amber-700" : "text-muted-foreground"}`}
              onClick={() => handleReaction("insightful")}
            >
              <Flame className={`h-4 w-4 mr-2 ${hasInsightfulReaction ? "text-white" : ""}`} />
              {formatCount(pulse.insightfulCount || 0)}
            </Button>
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
            <Button 
              variant={hasMisinformedReaction ? "default" : "ghost"} 
              size="sm" 
              disabled={isLoading}
              className={`${hasMisinformedReaction ? "bg-red-600 hover:bg-red-700" : "text-muted-foreground"}`}
              onClick={() => handleReaction("misinformed")}
            >
              <AlertTriangle className={`h-4 w-4 mr-2 ${hasMisinformedReaction ? "text-white" : ""}`} />
              {formatCount(pulse.misinformedCount || 0)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Flag as Misinformed ⚠️</p>
            {quotaData && (
              <p className="text-xs mt-1">Remaining: {quotaData.misinformed?.remaining}/{quotaData.misinformed?.max}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Share Button */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share className="h-4 w-4 mr-2" />
            {formatCount(pulse.shareCount || 0)}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this pulse</DialogTitle>
            <DialogDescription>
              Share this pulse with another user in your network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              {/* This would be replaced with a proper user search/select */}
              <select 
                id="recipient" 
                className="w-full rounded-md border border-input p-2"
                value={shareRecipientId || ""}
                onChange={(e) => setShareRecipientId(Number(e.target.value) || null)}
              >
                <option value="">Select a user</option>
                <option value="1">Demo User</option>
                {userId !== 1 && <option value="1">Senior Professional</option>}
                {userId !== 2 && user && <option value="2">{user.name || user.username}</option>}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Input
                id="message"
                placeholder="Add a message..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShareSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comments Button */}
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        <MessageSquare className="h-4 w-4 mr-2" />
        {formatCount(pulse.comments || 0)}
      </Button>
    </div>
  );
}

export default function IndustryPulsePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Smart refresh state
  const [hasNewContent, setHasNewContent] = useState(false);
  const [hasPremiumContent, setHasPremiumContent] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch all pulses
  const { data: pulses = [], isLoading, refetch } = useQuery<PulseWithUser[]>({
    queryKey: ["/api/pulses"],
    // @ts-ignore - onSuccess is valid but TS is complaining
    onSuccess: (data: PulseWithUser[]) => {
      // Initialize project cache for faster loading
      const projectPulses = data.filter((pulse: PulseWithUser) => pulse.type === 'project' && pulse.projectId);
      
      if (projectPulses.length > 0) {
        // Pre-fetch project data for all project pulses
        const prefetchProjects = async () => {
          // @ts-ignore - Create global cache if it doesn't exist
          window.__PROJECT_CACHE__ = window.__PROJECT_CACHE__ || {};
          
          for (const pulse of projectPulses) {
            if (!pulse.projectId) continue;
            
            try {
              const response = await fetch(`/api/projects/${pulse.projectId}`);
              if (response.ok) {
                const projectData = await response.json();
                // @ts-ignore - Add to global cache
                window.__PROJECT_CACHE__[pulse.projectId] = projectData;
              }
            } catch (error) {
              console.error(`Error prefetching project ${pulse.projectId}:`, error);
            }
          }
        };
        
        prefetchProjects();
      }
    }
  });
  
  // Simulate a new content notification (for demo purposes)
  // In a real implementation, this would be triggered by a websocket or polling
  useEffect(() => {
    const simulateNewContent = () => {
      // Randomly decide if this is premium content (like a Musk update)
      const isPremiumUpdate = Math.random() > 0.7;
      
      setHasNewContent(true);
      setHasPremiumContent(isPremiumUpdate);
      
      // Show toast notification for premium content
      if (isPremiumUpdate) {
        toast({
          title: "Premium Update",
          description: "Musk just updated your feed 💡",
          variant: "default",
        });
      }
      
      // Set timeout to auto-refresh after 10 minutes if user doesn't interact
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        handleRefresh();
      }, 10 * 60 * 1000); // 10 minutes
    };
    
    // For demo purposes, simulate new content arriving after a delay
    const newContentTimer = setTimeout(() => {
      simulateNewContent();
    }, 20000); // 20 seconds - for demo purposes
    
    return () => {
      clearTimeout(newContentTimer);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  
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
  const filteredPulses = pulses.filter((pulse: PulseWithUser) => {
    if (activeTab === "all") return true;
    
    if (activeTab === "musk-news") {
      // Filter for news pulses specifically from Musk (userId 3 is Musk in our system)
      // Need to use type assertion for TypeScript since "news-pulse" isn't in the basic types
      return (pulse.type as string) === "news-pulse" && pulse.userId === 3;
    }
    
    return pulse.type === activeTab;
  });

  const getPulseIcon = (pulse: PulseWithUser) => {
    switch (pulse.type) {
      case "poll":
        return <BarChart className="h-5 w-5 text-purple-500" />;
      case "media-pulse":
        return pulse.mediaType === "video" ? 
          <Video className="h-5 w-5 text-blue-500" /> : 
          <Image className="h-5 w-5 text-blue-500" />;
      case "project":
        return <FileCode className="h-5 w-5 text-green-500" />;
      case "news-pulse":
        // Special icon for news pulses, amber/yellow color to match Musk branding
        return <Newspaper className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <div className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Industry Pulse</h1>
                <p className="text-muted-foreground mt-1">
                  Discover insights, polls, and media from your professional network
                </p>
              </div>
              <GlassButton 
                onClick={() => setLocation("/create-pulse")} 
                variant="primary"
                blurStrength="md"
                transparency="low"
                interactive={true}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Pulse
              </GlassButton>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 glass-nav backdrop-blur-md bg-opacity-30 border border-white/20">
                <TabsTrigger value="all" className="text-foreground/80 data-[state=active]:text-foreground">All</TabsTrigger>
                <TabsTrigger value="poll" className="text-foreground/80 data-[state=active]:text-foreground">Polls</TabsTrigger>
                <TabsTrigger value="media-pulse" className="text-foreground/80 data-[state=active]:text-foreground">Media</TabsTrigger>
                <TabsTrigger value="project" className="text-foreground/80 data-[state=active]:text-foreground">Projects</TabsTrigger>
                <TabsTrigger value="musk-news" className="flex items-center gap-1 text-foreground/80 data-[state=active]:text-foreground">
                  <span className="text-amber-500">⚡</span> Musk News
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {/* Smart Refresh Banner */}
                <SmartRefreshBanner 
                  hasNewContent={hasNewContent} 
                  onRefresh={handleRefresh} 
                  isPremiumContent={hasPremiumContent} 
                />

                {isLoading ? (
                  <div className="space-y-4 py-4">
                    {/* Skeleton loaders for pulse cards */}
                    {[1, 2, 3, 4].map((i) => (
                      <CardSkeleton key={i} className="h-[300px]" />
                    ))}
                  </div>
                ) : filteredPulses.length === 0 ? (
                  <GlassCard variant="frosted" transparency="medium" interactive={false} blurStrength="md">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No pulses yet</h3>
                      <p className="text-center text-muted-foreground max-w-md mb-6">
                        {activeTab === "all" 
                          ? "Be the first to create a pulse in your professional network!" 
                          : activeTab === "musk-news" 
                            ? "No Musk news updates available yet. Check back later for the latest insights!" 
                            : `No ${activeTab} pulses available yet. Create one to get started!`}
                      </p>
                      {activeTab === "musk-news" ? (
                        <GlassButton
                          variant="secondary"
                          onClick={() => setActiveTab("all")}
                          blurStrength="md"
                          transparency="medium"
                          interactive={true}
                        >
                          View All Pulses
                        </GlassButton>
                      ) : (
                        <GlassButton
                          variant="primary"
                          onClick={() => setLocation("/create-pulse")}
                          blurStrength="md"
                          transparency="low"
                          interactive={true}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Pulse
                        </GlassButton>
                      )}
                    </CardContent>
                  </GlassCard>
                ) : (
                  <div className="space-y-6">
                    {filteredPulses.map((pulse: PulseWithUser) => (
                      <GlassCard 
                        key={pulse.id} 
                        variant="frosted" 
                        blurStrength="md" 
                        transparency="medium" 
                        className="overflow-hidden"
                        interactive={true} 
                        elevation="raised"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <div className="flex gap-3 items-center">
                              <Avatar>
                                <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
                                <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{pulse.user?.name || "User"}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {pulse.createdAt 
                                    ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
                                    : "Recently"}
                                </div>
                              </div>
                            </div>
                            <div>
                              {getPulseIcon(pulse)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardTitle className="mb-3">{pulse.title}</CardTitle>
                          <p className="text-muted-foreground">{pulse.content}</p>
                          
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
                            <ProjectDetails pulse={pulse} />
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <PulseReactions pulse={pulse} />
                        </CardFooter>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}