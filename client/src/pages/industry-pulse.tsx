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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Helper component for image carousels
interface ImageCarouselProps {
  pulse: PulseWithUser;
}

function ImageCarousel({ pulse }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const urls: string[] = [];
    setIsLoading(true);
    
    // First try to use mediaUrls if they exist
    if (pulse.mediaUrls && pulse.mediaUrls.length > 0) {
      pulse.mediaUrls.forEach(url => {
        if (url && url.trim() !== '') {
          urls.push(url);
        }
      });
    } 
    // If no mediaUrls, try mediaLocalStorageKeys
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      pulse.mediaLocalStorageKeys.forEach(key => {
        if (!key) return;
        
        // Check if these are URLs (from newer uploads) or localStorage keys (from older uploads)
        if (key.startsWith('http://') || key.startsWith('https://')) {
          urls.push(key);
        } else {
          // These might be old localStorage keys, try to retrieve the data
          try {
            const storedData = localStorage.getItem(key);
            if (storedData && (storedData.startsWith('data:image') || storedData.startsWith('blob:'))) {
              urls.push(storedData);
            }
          } catch (e) {
            console.error("Error retrieving image from localStorage:", e);
          }
        }
      });
    }
    
    setImageUrls(urls);
    setIsLoading(false);
  }, [pulse]);
  
  const totalImages = imageUrls.length;
  
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };
  
  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Keyboard navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, totalImages, currentImageIndex]);
  
  if (isLoading) {
    return (
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
    );
  }
  
  if (totalImages === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="mb-2">
            <Image className="h-12 w-12 text-blue-300 mx-auto" />
          </div>
          <p className="text-blue-500">No images available for this pulse</p>
        </div>
      </div>
    );
  }
  
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={toggleFullscreen}
          >
            <X className="h-8 w-8" />
          </button>
          
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all"
            onClick={goToPrevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <img
            src={imageUrls[currentImageIndex]}
            alt={`Pulse image ${currentImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all"
            onClick={goToNextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full text-white">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <Image className="h-4 w-4 text-blue-500" />
        <span>Images</span>
        {totalImages > 1 && <span className="text-xs text-muted-foreground">({currentImageIndex + 1}/{totalImages})</span>}
      </div>
      
      <div className="relative group">
        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <img
            src={imageUrls[currentImageIndex]}
            alt={`Pulse image ${currentImageIndex + 1}`}
            className="w-full h-72 object-cover rounded-lg"
          />
          
          {/* Image overlay with controls */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-between px-4">
            {totalImages > 1 && (
              <>
                <button
                  className="bg-white bg-opacity-80 rounded-full p-1.5 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0 duration-300"
                  onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="bg-white bg-opacity-80 rounded-full p-1.5 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300"
                  onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Fullscreen button */}
          <button
            className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1.5 text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Image navigation dots (only show if multiple images) */}
      {totalImages > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {imageUrls.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? "bg-blue-500 scale-110" : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Video player component
function VideoPlayer({ pulse }: { pulse: PulseWithUser }) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let videoUrl: string | null = null;
    
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

// Project details component
function ProjectDetails({ pulse }: { pulse: PulseWithUser }) {
  if (!pulse.projectId || !pulse.projectDetails) {
    return null;
  }
  
  // TODO: Replace with actual project data fetching logic
  // This is just a placeholder
  const projectSnapshot = pulse.projectDetails || "No project details available";
  
  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <FileCode className="h-4 w-4 text-blue-500" />
        <span>Project Update</span>
      </div>
      <GlassCard className="p-4 mt-2">
        <div className="text-sm">{projectSnapshot}</div>
        <div className="mt-4">
          <GlassButton 
            variant="secondary" 
            size="sm"
            blurStrength="sm"
            transparency="medium"
            interactive={true}
            className="text-xs"
          >
            View Full Project
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}

// Poll voting component
interface PollVotingProps {
  pulse: PulseWithUser;
}

function PollVoting({ pulse }: PollVotingProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollResults, setPollResults] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  // Get poll options from the pulse
  const pollOptions = pulse.pollOptions || [];
  
  // Mock submit vote function
  const submitVote = () => {
    if (!selectedOption) return;
    
    // Create mock results based on random votes
    const mockResults: Record<string, number> = {};
    let totalVotes = 0;
    
    // Generate random votes for each option
    pollOptions.forEach((option) => {
      // Selected option gets a bit more votes for better demo experience
      const votes = option === selectedOption 
        ? Math.floor(Math.random() * 50) + 30 
        : Math.floor(Math.random() * 40) + 10;
      mockResults[option] = votes;
      totalVotes += votes;
    });
    
    // Convert to percentages
    pollOptions.forEach((option) => {
      mockResults[option] = Math.round((mockResults[option] / totalVotes) * 100);
    });
    
    setPollResults(mockResults);
    setHasVoted(true);
    
    toast({
      title: "Vote submitted",
      description: `You voted for "${selectedOption}"`,
    });
  };
  
  if (!pollOptions || pollOptions.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <div className="text-sm font-medium flex items-center gap-2 mb-3">
        <BarChart className="h-4 w-4 text-blue-500" />
        <span>Poll</span>
      </div>
      
      <div className="space-y-3">
        {pollOptions.map((option, index) => (
          <div key={index} className="relative">
            <GlassCard 
              className={`p-3 transition-all duration-200 cursor-pointer ${
                selectedOption === option ? 'ring-2 ring-blue-500' : ''
              } ${hasVoted ? 'pointer-events-none' : ''}`}
              onClick={() => !hasVoted && setSelectedOption(option)}
              interactive={!hasVoted}
              variant="frosted"
              transparency="medium"
              blurStrength="sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!hasVoted ? (
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedOption === option 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {selectedOption === option && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  ) : null}
                  <span>{option}</span>
                </div>
                {hasVoted && (
                  <span className="font-medium text-blue-600">{pollResults[option]}%</span>
                )}
              </div>
              
              {/* Progress bar shown after voting */}
              {hasVoted && (
                <div className="mt-2">
                  <Progress value={pollResults[option]} className="h-2" />
                </div>
              )}
            </GlassCard>
          </div>
        ))}
        
        {!hasVoted && (
          <GlassButton 
            variant="primary" 
            className="w-full mt-2" 
            disabled={!selectedOption}
            onClick={submitVote}
            blurStrength="sm"
            transparency="low"
            interactive={true}
          >
            Submit Vote
          </GlassButton>
        )}
      </div>
    </div>
  );
}

// Smart refresh banner component
interface SmartRefreshBannerProps {
  hasNewContent: boolean;
  onRefresh: () => void;
  isPremiumContent?: boolean;
}

function SmartRefreshBanner({ hasNewContent, onRefresh, isPremiumContent = false }: SmartRefreshBannerProps) {
  if (!hasNewContent) return null;
  
  return (
    <GlassCard 
      variant="frosted" 
      transparency="medium" 
      blurStrength="sm"
      interactive={true}
      className="mb-4 overflow-hidden backdrop-brightness-110"
      onClick={onRefresh}
    >
      <div
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-px cursor-pointer",
          isPremiumContent
            ? "text-amber-700 border-amber-200"
            : "text-blue-700 border-blue-200"
        )}
      >
        <RefreshCw className={cn(
          "h-4 w-4 animate-spin-slow", 
          isPremiumContent ? "text-amber-500" : "text-blue-500"
        )} />
        <span className="font-medium">New posts available</span>
      </div>
    </GlassCard>
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
            <GlassButton 
              variant={hasInsightfulReaction ? "amber" : "secondary"} 
              size="sm" 
              disabled={isLoading}
              blurStrength="sm"
              transparency={hasInsightfulReaction ? "low" : "high"}
              interactive={true}
              className={`${hasInsightfulReaction ? "text-white" : "text-muted-foreground"}`}
              onClick={() => handleReaction("insightful")}
            >
              <Flame className={`h-4 w-4 mr-2 ${hasInsightfulReaction ? "text-white" : ""}`} />
              {formatCount(pulse.insightfulCount || 0)}
            </GlassButton>
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
            <GlassButton 
              variant={hasMisinformedReaction ? "destructive" : "secondary"} 
              size="sm" 
              disabled={isLoading}
              blurStrength="sm"
              transparency={hasMisinformedReaction ? "low" : "high"}
              interactive={true}
              className={`${hasMisinformedReaction ? "text-white" : "text-muted-foreground"}`}
              onClick={() => handleReaction("misinformed")}
            >
              <AlertTriangle className={`h-4 w-4 mr-2 ${hasMisinformedReaction ? "text-white" : ""}`} />
              {formatCount(pulse.misinformedCount || 0)}
            </GlassButton>
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
          <GlassButton 
            variant="secondary" 
            size="sm" 
            blurStrength="sm"
            transparency="high"
            interactive={true}
            className="text-muted-foreground"
          >
            <Share className="h-4 w-4 mr-2" />
            {formatCount(pulse.shareCount || 0)}
          </GlassButton>
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
            <GlassButton 
              variant="secondary" 
              blurStrength="sm"
              transparency="medium"
              interactive={true}
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton 
              variant="primary" 
              blurStrength="sm"
              transparency="low"
              interactive={true}
              onClick={handleShareSubmit} 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Share
            </GlassButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comments Button */}
      <GlassButton 
        variant="secondary" 
        size="sm" 
        blurStrength="sm"
        transparency="high"
        interactive={true}
        className="text-muted-foreground"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {formatCount(pulse.comments || 0)}
      </GlassButton>
    </div>
  );
}

export default function IndustryPulsePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Smart refresh state
  const [hasNewContent, setHasNewContent] = useState(false);
  
  // Glass effects context
  const { blurStrength, transparency } = useGlassEffects();
  
  // Check for new content after some time (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly show refresh banner (for demo purposes)
      const showRefresh = Math.random() > 0.7;
      setHasNewContent(showRefresh);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Query for all pulses with user info
  const { data: pulses = [], isLoading, refetch } = useQuery<PulseWithUser[]>({
    queryKey: ["/api/pulses"],
    // @ts-ignore - onSuccess is valid but TS is complaining
    onSuccess: (data: PulseWithUser[]) => {
      console.log("Pulses fetched:", data.length);
    },
  });
  
  const handleRefresh = () => {
    refetch();
    setHasNewContent(false);
    toast({
      title: "Content refreshed",
      description: "You're viewing the latest industry insights",
    });
  };
  
  // Group pulses by type for filtering
  const newsPulses = pulses.filter((pulse: PulseWithUser) => pulse.type === 'news-pulse');
  const mediaPulses = pulses.filter((pulse: PulseWithUser) => pulse.type === 'media-pulse');
  const pollPulses = pulses.filter((pulse: PulseWithUser) => pulse.type === 'poll');
  const projectPulses = pulses.filter((pulse: PulseWithUser) => pulse.type === 'project' && pulse.projectId);
  
  // Filter pulses based on active tab
  const filteredPulses = pulses.filter((pulse: PulseWithUser) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'news') return pulse.type === 'news-pulse';
    if (activeTab === 'media') return pulse.type === 'media-pulse';
    if (activeTab === 'polls') return pulse.type === 'poll';
    if (activeTab === 'projects') return pulse.type === 'project' && pulse.projectId;
    return false;
  });
  
  // Get the appropriate icon for each pulse type
  const getPulseIcon = (pulse: PulseWithUser) => {
    switch (pulse.type) {
      case 'news-pulse':
        return <Newspaper className="h-5 w-5 text-blue-500" />;
      case 'media-pulse':
        return pulse.mediaType === 'video' 
          ? <Video className="h-5 w-5 text-blue-500" /> 
          : <Image className="h-5 w-5 text-blue-500" />;
      case 'poll':
        return <BarChart className="h-5 w-5 text-blue-500" />;
      case 'project':
        return <FileCode className="h-5 w-5 text-blue-500" />;
      default:
        return <Newspaper className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 md:px-8">
      <Header title="Industry Pulse" showGlassControls />
      
      <div className="mt-8">
        {/* Smart refresh banner */}
        <SmartRefreshBanner 
          hasNewContent={hasNewContent} 
          onRefresh={handleRefresh} 
        />
        
        {/* Navigation Tabs */}
        <Tabs 
          defaultValue="all" 
          className="mb-8" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-5 mb-8" data-glass="true" data-glass-blur={blurStrength} data-glass-transparency={transparency}>
            <TabsTrigger value="all" className="text-sm">
              All
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                {pulses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="news" className="text-sm">
              News
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                {newsPulses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              Media
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                {mediaPulses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="text-sm">
              Polls
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                {pollPulses.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">
              Projects
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                {projectPulses.length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Create Pulse Button */}
          <div className="flex justify-end mb-6">
            <GlassButton 
              variant="primary" 
              blurStrength="sm"
              transparency="low"
              interactive={true}
              onClick={() => setLocation('/create-pulse')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pulse
            </GlassButton>
          </div>
          
          {/* Pulse Content */}
          <div className="space-y-6">
            {isLoading ? (
              // Show skeletons while loading
              <div className="space-y-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredPulses.length > 0 ? (
              // Show pulses
              filteredPulses.map((pulse: PulseWithUser) => (
                <GlassCard key={pulse.id} className="overflow-hidden" interactive={true}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {/* User avatar */}
                        <Avatar>
                          <AvatarImage src={pulse.user?.photoURL || undefined} />
                          <AvatarFallback>
                            {(pulse.user?.name || 'User').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-semibold leading-tight">
                            {pulse.user?.name || 'Anonymous User'}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Pulse type icon */}
                            {getPulseIcon(pulse)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {pulse.type === 'news-pulse' ? 'News' : 
                                pulse.type === 'media-pulse' ? 'Media' :
                                pulse.type === 'poll' ? 'Poll' : 'Project'}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    {/* Pulse title and content */}
                    <h3 className="text-lg font-medium mb-2">{pulse.title}</h3>
                    {pulse.content && (
                      <p className="text-base text-muted-foreground mb-4 whitespace-pre-line">
                        {pulse.content}
                      </p>
                    )}
                    
                    {/* Render different content based on pulse type */}
                    {pulse.type === 'media-pulse' && pulse.mediaType === 'image' && (
                      <ImageCarousel pulse={pulse} />
                    )}
                    
                    {pulse.type === 'media-pulse' && pulse.mediaType === 'video' && (
                      <VideoPlayer pulse={pulse} />
                    )}
                    
                    {pulse.type === 'poll' && pulse.pollOptions && pulse.pollOptions.length > 0 && (
                      <PollVoting pulse={pulse} />
                    )}
                    
                    {pulse.type === 'project' && pulse.projectId && (
                      <ProjectDetails pulse={pulse} />
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <PulseReactions pulse={pulse} />
                  </CardFooter>
                </GlassCard>
              ))
            ) : (
              // Show empty state
              <GlassCard className="py-12">
                <div className="text-center">
                  <div className="mb-3">
                    {activeTab === 'all' ? (
                      <Users className="h-12 w-12 text-blue-300 mx-auto" />
                    ) : activeTab === 'news' ? (
                      <Newspaper className="h-12 w-12 text-blue-300 mx-auto" />
                    ) : activeTab === 'media' ? (
                      <Image className="h-12 w-12 text-blue-300 mx-auto" />
                    ) : activeTab === 'polls' ? (
                      <BarChart className="h-12 w-12 text-blue-300 mx-auto" />
                    ) : (
                      <FileCode className="h-12 w-12 text-blue-300 mx-auto" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No pulses found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all' 
                      ? "There are no industry pulses to display yet." 
                      : `There are no ${activeTab} to display in this category yet.`}
                  </p>
                  <div className="flex justify-center gap-4">
                    <GlassButton
                      variant="secondary"
                      blurStrength="sm"
                      transparency="medium"
                      interactive={true}
                      onClick={() => setActiveTab('all')}
                    >
                      View All Pulses
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      blurStrength="sm"
                      transparency="low"
                      interactive={true} 
                      onClick={() => setLocation('/create-pulse')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create {activeTab === 'all' ? 'Pulse' : activeTab === 'news' ? 'News' : activeTab === 'media' ? 'Media Post' : activeTab === 'polls' ? 'Poll' : 'Project Update'}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Type definitions
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