import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
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
  Flame,
  LightbulbIcon,
  Play,
  Eye
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
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

// PulseCard Component - Handles different card types
function PulseCard({ pulse }: { pulse: PulseWithUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Function to render the appropriate card based on pulse type
  const renderCard = () => {
    switch(pulse.type) {
      case 'media-pulse':
        return <MediaPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
      case 'poll':
        return <PollPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
      case 'project':
        return <ProjectPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
      case 'news-pulse':
        // Check if this is a Musk news pulse (userId 3)
        if (pulse.userId === 3) {
          return <MuskNewsPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
        }
        // Regular news pulse
        return <NewsPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
      default:
        return <DefaultPulseCard pulse={pulse} onClick={() => setIsModalOpen(true)} />;
    }
  };
  
  return (
    <>
      {renderCard()}
      
      {/* Modal for expanded view */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{pulse.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
                  <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{pulse.user?.name || "User"}</span>
                <span className="text-muted-foreground">
                  {pulse.createdAt 
                    ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
                    : "Recently"}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="mb-4">{pulse.content}</p>
            
            {/* Render expanded content based on type */}
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
            
            <div className="mt-6 border-t pt-4">
              <PulseReactions pulse={pulse} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Media Pulse Card (Images/Videos)
function MediaPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  // For preview, show first image or video thumbnail
  const previewUrl = pulse.mediaUrls?.[0] || "";
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        {/* Media type badge */}
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {pulse.mediaType === "video" ? "Video" : "Media"}
        </div>
        
        {/* Media preview */}
        <div className="h-48 overflow-hidden bg-muted">
          {pulse.mediaType === "video" ? (
            <div className="h-full w-full flex items-center justify-center bg-black/10 relative">
              <img 
                src={previewUrl} 
                alt={pulse.title} 
                className="object-cover w-full h-full opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
          ) : (
            <img 
              src={previewUrl} 
              alt={pulse.title} 
              className="object-cover w-full h-full"
            />
          )}
        </div>
        
        {/* Hover overlay with quick info */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-2">{pulse.title}</h3>
          <p className="line-clamp-2 text-sm text-white/90">{pulse.content}</p>
        </div>
      </div>
      
      <CardFooter className="flex justify-between items-center p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
            <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{pulse.user?.name || "User"}</span>
        </div>
        
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Poll Pulse Card
function PollPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900"
      onClick={onClick}
    >
      {/* Poll type badge */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
          Poll
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
              <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pulse.user?.name || "User"}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {pulse.createdAt 
              ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
              : "Recently"}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-lg font-bold mb-2">{pulse.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{pulse.content}</p>
        
        {/* Show just the first 2 options as preview */}
        <div className="space-y-2">
          {pulse.pollOptions.slice(0, 2).map((option, index) => (
            <div 
              key={index}
              className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-md text-sm"
            >
              {option}
            </div>
          ))}
          {pulse.pollOptions.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{pulse.pollOptions.length - 2} more options
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 border-t border-purple-100 dark:border-purple-900/50">
        <div className="text-xs text-muted-foreground">
          {pulse.comments} votes
        </div>
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Project Pulse Card
function ProjectPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-green-100 dark:border-green-900"
      onClick={onClick}
    >
      {/* Project type badge */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Project
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
              <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pulse.user?.name || "User"}</span>
          </div>
          <FileCode className="h-5 w-5 text-green-500" />
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-lg font-bold mb-1">{pulse.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{pulse.content}</p>
        
        {/* Project tags - derived from content */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pulse.content?.match(/#\w+/g)?.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              {tag}
            </span>
          )) || (
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              #Project
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 border-t border-green-100 dark:border-green-900/50">
        <div className="text-xs text-muted-foreground">
          {pulse.createdAt 
            ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
            : "Recently"}
        </div>
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Musk News Pulse Card
function MuskNewsPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group border-amber-200 dark:border-amber-900/70 bg-amber-50/50 dark:bg-amber-950/20"
      onClick={onClick}
    >
      {/* Musk badge */}
      <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <span>Musk AI Pulse</span>
        <span className="text-white">⚡</span>
      </div>
      
      <CardHeader className="pb-2 pt-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="h-8 w-8 ring-2 ring-amber-500">
              <AvatarImage src="/images/industry-icons/musk.png" alt="Musk" />
              <AvatarFallback>M</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium flex items-center gap-1">
                Musk <span className="text-amber-500">⚡</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {pulse.createdAt 
                  ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
                  : "Recently"}
              </div>
            </div>
          </div>
          <LightbulbIcon className="h-5 w-5 text-amber-500" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <h3 className="text-lg font-bold mb-2">{pulse.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{pulse.content}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-64 p-4">
            <p className="font-medium text-sm">What this means for your career:</p>
            <p className="text-xs mt-1">This development could impact professionals in AI, technology, and engineering. Consider upskilling in related technologies.</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 border-t border-amber-200 dark:border-amber-900/50">
        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          Premium Content
        </div>
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Default/Regular News Pulse Card
function NewsPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      onClick={onClick}
    >
      {/* News type badge */}
      <div className="absolute top-2 right-2 z-10 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
        News
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
              <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pulse.user?.name || "User"}</span>
          </div>
          <Newspaper className="h-5 w-5 text-gray-500" />
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-lg font-bold mb-2">{pulse.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{pulse.content}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 border-t">
        <div className="text-xs text-muted-foreground">
          {pulse.createdAt 
            ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
            : "Recently"}
        </div>
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Default Pulse Card (fallback)
function DefaultPulseCard({ pulse, onClick }: { pulse: PulseWithUser; onClick: () => void }) {
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pulse.user?.photoURL || ""} alt={pulse.user?.name || ""} />
              <AvatarFallback>{pulse.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pulse.user?.name || "User"}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {pulse.createdAt 
              ? formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true }) 
              : "Recently"}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-lg font-bold mb-2">{pulse.title}</h3>
        <p className="text-sm text-muted-foreground">{pulse.content}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-3 border-t">
        <div></div>
        <PulseQuickReactions pulse={pulse} />
      </CardFooter>
    </Card>
  );
}

// Quick Reactions component (for card view)
function PulseQuickReactions({ pulse }: { pulse: PulseWithUser }) {
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  // Get user reaction quota
  const { data: quotaData } = useQuery<any>({
    queryKey: ['/api/users', userId, 'reaction-quota'],
    enabled: !!userId,
  });
  
  // Get user's existing reactions
  const { data: existingReactions = [] } = useQuery<any>({
    queryKey: ['/api/pulses', pulse.id, 'reactions'],
    enabled: !!pulse.id,
  });
  
  const userReactions = existingReactions.filter((r: any) => r.userId === userId);
  
  // Check if user has already reacted
  const hasInsightful = userReactions.some((r: any) => r.reactionType === 'insightful');
  const hasMisinformed = userReactions.some((r: any) => r.reactionType === 'misinformed');
  
  return (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={hasInsightful ? "text-rose-500" : "text-muted-foreground"}
              onClick={(e) => {
                e.stopPropagation();
                // This is just a preview, full logic is in PulseReactions component
              }}
            >
              <Flame className="h-4 w-4" />
            </Button>
            {pulse.insightfulCount ? (
              <span className="text-xs">{pulse.insightfulCount}</span>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Insightful {quotaData?.insightful ? `(${quotaData.insightful.remaining} left today)` : ""}</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={hasMisinformed ? "text-amber-500" : "text-muted-foreground"}
              onClick={(e) => {
                e.stopPropagation();
                // This is just a preview, full logic is in PulseReactions component
              }}
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
            {pulse.misinformedCount ? (
              <span className="text-xs">{pulse.misinformedCount}</span>
            ) : null}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Misinformed {quotaData?.misinformed ? `(${quotaData.misinformed.remaining} left today)` : ""}</p>
        </TooltipContent>
      </Tooltip>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          // This is just a preview, full logic is in PulseReactions component
        }}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Pulse Reactions Component
function PulseReactions({ pulse }: { pulse: PulseWithUser }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  // State for the share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareRecipientId, setShareRecipientId] = useState<number | null>(null);
  
  // Get user reaction quota
  const { data: quotaData } = useQuery<any>({
    queryKey: ['/api/users', userId, 'reaction-quota'],
    enabled: !!userId,
  });
  
  // Get user's existing reactions
  const { data: existingReactions = [] } = useQuery<any>({
    queryKey: ['/api/pulses', pulse.id, 'reactions'],
    enabled: !!pulse.id,
  });
  
  const userReactions = existingReactions.filter((r: any) => r.userId === userId);
  
  // Check if user has already reacted
  const hasInsightful = userReactions.some((r: any) => r.reactionType === 'insightful');
  const hasMisinformed = userReactions.some((r: any) => r.reactionType === 'misinformed');
  
  // Get reaction IDs if they exist
  const insightfulReactionId = userReactions.find((r: any) => r.reactionType === 'insightful')?.id;
  const misinformedReactionId = userReactions.find((r: any) => r.reactionType === 'misinformed')?.id;
  
  // Create reaction mutation
  const createReactionMutation = useMutation({
    mutationFn: async ({ pulseId, reactionType }: { pulseId: number, reactionType: string }) => {
      return apiRequest("POST", "/api/pulse-reactions", {
        pulseId,
        reactionType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pulses', pulse.id, 'reactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'reaction-quota'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
    },
    onError: (error: any) => {
      console.error("Error creating reaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to react to this pulse.",
        variant: "destructive",
      });
    }
  });
  
  // Delete reaction mutation
  const deleteReactionMutation = useMutation({
    mutationFn: async (reactionId: number) => {
      const res = await apiRequest("DELETE", `/api/pulse-reactions/${reactionId}`);
      return res;
    },
    onSuccess: (data) => {
      console.log("Reaction deleted successfully:", data);
      
      // Update the UI by invalidating relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/pulses', pulse.id, 'reactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'reaction-quota'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
      
      // Show toast with quota information if available
      if (data.quota) {
        toast({
          title: "Reaction removed",
          description: `You have ${data.quota.remaining} reactions left today.`,
        });
      }
    },
    onError: (error: any) => {
      console.error("Error deleting reaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove reaction.",
        variant: "destructive",
      });
    }
  });
  
  // Share post mutation
  const sharePulseMutation = useMutation({
    mutationFn: async ({ pulseId, recipientId, message }: { pulseId: number, recipientId: number, message?: string }) => {
      return apiRequest("POST", "/api/pulse-shares", {
        pulseId,
        recipientId,
        message
      });
    },
    onSuccess: () => {
      setIsShareDialogOpen(false);
      setShareMessage("");
      setShareRecipientId(null);
      
      queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
      
      toast({
        title: "Pulse shared",
        description: "The pulse has been shared successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error sharing pulse:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to share this pulse.",
        variant: "destructive",
      });
    }
  });
  
  // Handle insightful reaction
  const handleInsightful = async () => {
    if (hasInsightful && insightfulReactionId) {
      // If user already reacted, remove the reaction
      deleteReactionMutation.mutate(insightfulReactionId);
    } else {
      // Otherwise create a new reaction
      // First check if quota is available
      if (quotaData?.insightful?.hasQuotaRemaining) {
        createReactionMutation.mutate({ 
          pulseId: pulse.id, 
          reactionType: "insightful" 
        });
      } else {
        toast({
          title: "Daily limit reached",
          description: "You've used all your insightful reactions for today.",
          variant: "warning",
        });
      }
    }
  };
  
  // Handle misinformed reaction
  const handleMisinformed = async () => {
    if (hasMisinformed && misinformedReactionId) {
      // If user already reacted, remove the reaction
      deleteReactionMutation.mutate(misinformedReactionId);
    } else {
      // Otherwise create a new reaction
      // First check if quota is available
      if (quotaData?.misinformed?.hasQuotaRemaining) {
        createReactionMutation.mutate({ 
          pulseId: pulse.id, 
          reactionType: "misinformed" 
        });
      } else {
        toast({
          title: "Daily limit reached",
          description: "You've used all your misinformed reactions for today.",
          variant: "warning",
        });
      }
    }
  };
  
  // Handle share
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };
  
  // Submit share
  const submitShare = () => {
    if (!shareRecipientId) {
      toast({
        title: "Error",
        description: "Please select a recipient.",
        variant: "destructive",
      });
      return;
    }
    
    sharePulseMutation.mutate({
      pulseId: pulse.id,
      recipientId: shareRecipientId,
      message: shareMessage
    });
  };
  
  // Comment button - just a placeholder for now
  const handleComment = () => {
    toast({
      title: "Comments",
      description: "Comments functionality is coming soon.",
    });
  };
  
  return (
    <div className="flex flex-wrap justify-between items-center">
      <div className="flex space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-1 ${hasInsightful ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}
                onClick={handleInsightful}
                disabled={createReactionMutation.isPending || deleteReactionMutation.isPending}
              >
                {createReactionMutation.isPending || deleteReactionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flame className="h-4 w-4" />
                )}
                <span>
                  {pulse.insightfulCount || 0} {hasInsightful ? "Insightful" : "Insightful"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex flex-col gap-1">
              <p>🔥 Insightful</p>
              {quotaData?.insightful && (
                <p className="text-xs text-muted-foreground">
                  {quotaData.insightful.remaining}/{quotaData.insightful.max} remaining today
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-1 ${hasMisinformed ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                onClick={handleMisinformed}
                disabled={createReactionMutation.isPending || deleteReactionMutation.isPending}
              >
                {createReactionMutation.isPending || deleteReactionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>
                  {pulse.misinformedCount || 0} {hasMisinformed ? "Misinformed" : "Misinformed"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex flex-col gap-1">
              <p>⚠️ Flag as Misinformed</p>
              {quotaData?.misinformed && (
                <p className="text-xs text-muted-foreground">
                  {quotaData.misinformed.remaining}/{quotaData.misinformed.max} remaining today
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 text-muted-foreground"
          onClick={handleShare}
        >
          <Share className="h-4 w-4" />
          <span>{pulse.shareCount || 0} Share</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 text-muted-foreground"
          onClick={handleComment}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{pulse.comments || 0} Comment</span>
        </Button>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this pulse</DialogTitle>
            <DialogDescription>
              Share this pulse with a colleague or connection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient</Label>
              <select 
                id="recipient"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={shareRecipientId || ""}
                onChange={(e) => setShareRecipientId(Number(e.target.value))}
              >
                <option value="">Select a recipient</option>
                <option value="1">Demo User</option>
                <option value="2">Jane Smith</option>
                <option value="3">Alex Johnson</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Input 
                id="message" 
                placeholder="Add a personal message..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitShare}
              disabled={!shareRecipientId || sharePulseMutation.isPending}
            >
              {sharePulseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>Share</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Smart Refresh Banner Component
function SmartRefreshBanner({ 
  hasNewContent, 
  onRefresh, 
  isPremiumContent = false
}: { 
  hasNewContent: boolean; 
  onRefresh: () => void; 
  isPremiumContent?: boolean;
}) {
  if (!hasNewContent) return null;
  
  return (
    <div 
      className={cn(
        "mb-6 p-3 rounded-lg flex items-center justify-between",
        isPremiumContent 
          ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
          : "bg-muted/30 border"
      )}
    >
      <div className="flex items-center gap-2">
        {isPremiumContent ? (
          <>
            <div className="bg-amber-500 text-white p-1 rounded-full">
              <LightbulbIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Musk just updated your feed 💡</span>
          </>
        ) : (
          <>
            <div className="bg-primary text-primary-foreground p-1 rounded-full">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">New posts available</span>
          </>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Refresh
      </Button>
    </div>
  );
}

// Poll voting component
function PollVoting({ pulse }: { pulse: PulseWithUser }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 1;
  
  // State for showing results
  const [showResults, setShowResults] = useState(false);
  
  // Get existing votes
  const { data: votes = [] } = useQuery<any>({
    queryKey: ['/api/pulses', pulse.id, 'poll-votes'],
    enabled: !!pulse.id,
  });
  
  // Check if user has already voted
  const { data: userVote, isError } = useQuery<any>({
    queryKey: ['/api/poll-votes/user', userId, 'pulse', pulse.id],
    enabled: !!userId && !!pulse.id,
    onSuccess: (data) => {
      if (data) {
        setShowResults(true);
      }
    },
    retry: false,
  });
  
  // Show results immediately if user has already voted
  useEffect(() => {
    if (userVote || isError) {
      setShowResults(true);
    }
  }, [userVote, isError]);
  
  // Calculate vote percentages
  const totalVotes = votes.length;
  const optionVotes = pulse.pollOptions.map(option => {
    const count = votes.filter((vote: any) => vote.option === option).length;
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { option, count, percentage };
  });
  
  // Create vote mutation
  const voteMutation = useMutation({
    mutationFn: async (option: string) => {
      return apiRequest("POST", "/api/poll-votes", {
        pulseId: pulse.id,
        option
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pulses', pulse.id, 'poll-votes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/poll-votes/user', userId, 'pulse', pulse.id] });
      setShowResults(true);
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record your vote.",
        variant: "destructive",
      });
    }
  });
  
  // Handle vote
  const handleVote = (option: string) => {
    if (userVote) {
      // User already voted, just show results
      setShowResults(true);
      return;
    }
    
    voteMutation.mutate(option);
  };
  
  // Check which option the user voted for
  const getUserVoteOption = () => {
    return userVote?.option || null;
  };
  
  return (
    <div className="mt-4">
      <div className="space-y-3">
        {pulse.pollOptions.map((option, index) => {
          const voteData = optionVotes[index];
          const isUserVote = userVote && getUserVoteOption() === option;
          
          return (
            <div key={index} className="relative">
              {showResults ? (
                // Show results view
                <div className={cn(
                  "rounded-md border p-3 relative overflow-hidden",
                  isUserVote ? "border-primary bg-primary/5" : ""
                )}>
                  <div className="flex justify-between items-center z-10 relative">
                    <span className="text-sm">{option}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{voteData.percentage}%</span>
                      {isUserVote && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                  
                  {/* Progress bar in background */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary/10"
                    style={{ width: `${voteData.percentage}%` }}
                  ></div>
                </div>
              ) : (
                // Show voting buttons
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 font-normal"
                  disabled={voteMutation.isPending}
                  onClick={() => handleVote(option)}
                >
                  {option}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        
        {showResults && !userVote && (
          <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
            Cast your vote
          </Button>
        )}
        
        {!showResults && (
          <Button variant="ghost" size="sm" onClick={() => setShowResults(true)}>
            Show results
          </Button>
        )}
      </div>
    </div>
  );
}

// Image Carousel Component
function ImageCarousel({ pulse }: { pulse: PulseWithUser }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  useEffect(() => {
    console.log("Pulse received for carousel:", pulse);
    console.log("Media URLs:", pulse.mediaUrls);
    console.log("Media localStorage keys:", pulse.mediaLocalStorageKeys);
    
    let imageUrlsToUse: string[] = [];
    
    // First try to use mediaUrls if they exist
    if (pulse.mediaUrls && pulse.mediaUrls.length > 0) {
      // Filter out any empty strings
      imageUrlsToUse = pulse.mediaUrls.filter(url => url && url.trim() !== '');
      console.log("Using mediaUrls for carousel:", imageUrlsToUse);
    }
    // Fallback to localStorage keys if needed
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      // Try to get data URLs from localStorage
      imageUrlsToUse = pulse.mediaLocalStorageKeys
        .map(key => localStorage.getItem(key))
        .filter((url): url is string => url !== null);
      console.log("Using localStorage for carousel, found images:", imageUrlsToUse.length);
    }
    
    setImages(imageUrlsToUse);
  }, [pulse]);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Only show carousel for image type media pulses with actual images
  if (pulse.type !== 'media-pulse' || pulse.mediaType !== 'image' || images.length === 0) {
    return (
      <div className="text-center p-4 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="mt-4 relative">
        <div className="aspect-video bg-black/5 overflow-hidden rounded-md">
          <img 
            src={images[currentImageIndex]} 
            alt={`Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Image counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
          {currentImageIndex + 1} / {images.length}
        </div>
        
        {/* Controls */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="bg-black/40 text-white hover:bg-black/60 rounded-full h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevImage}
              className="bg-black/40 text-white hover:bg-black/60 rounded-full h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextImage}
              className="bg-black/40 text-white hover:bg-black/60 rounded-full h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Fullscreen modal */}
      {isFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-screen-lg max-h-[90vh] p-0 bg-black/95">
            <div className="relative flex items-center justify-center h-full">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 z-10 bg-black/40 text-white hover:bg-black/60 h-8 w-8 rounded-full"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <img 
                src={images[currentImageIndex]} 
                alt={`Image ${currentImageIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />
              
              {/* Navigation buttons */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={prevImage}
                    className="bg-black/40 text-white hover:bg-black/60 h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={nextImage}
                    className="bg-black/40 text-white hover:bg-black/60 h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
      }
    }
    // Fallback to localStorage keys if needed
    else if (pulse.mediaLocalStorageKeys && pulse.mediaLocalStorageKeys.length > 0) {
      // Try to get the video URL from localStorage
      const key = pulse.mediaLocalStorageKeys[0];
      const storedUrl = localStorage.getItem(key);
      if (storedUrl) {
        videoUrl = storedUrl;
      }
    }
    
    console.log("Using mediaUrls for video:", videoUrl);
    setVideoSrc(videoUrl);
    setIsLoading(false);
  }, [pulse]);
  
  if (isLoading) {
    return (
      <div className="mt-4 aspect-video bg-muted/20 rounded-md flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!videoSrc) {
    return (
      <div className="mt-4 aspect-video bg-muted/20 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">Video source unavailable</p>
      </div>
    );
  }
  
  return (
    <div className="mt-4 rounded-md overflow-hidden">
      <video 
        src={videoSrc} 
        controls 
        className="w-full aspect-video"
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
      />
    </div>
  );
}

// Project Details Component
function ProjectDetails({ pulse }: { pulse: PulseWithUser }) {
  // Get project details if available
  const { data: project } = useQuery<any>({
    queryKey: ['/api/projects', pulse.projectId],
    enabled: !!pulse.projectId,
  });
  
  // If no project ID, show basic info
  if (!pulse.projectId) {
    return (
      <div className="mt-4 p-4 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No detailed project information available</p>
      </div>
    );
  }
  
  // If loading, show skeleton
  if (!project) {
    return (
      <div className="mt-4 space-y-2">
        <div className="h-6 bg-muted/40 rounded-md animate-pulse" />
        <div className="h-4 bg-muted/40 rounded-md w-3/4 animate-pulse" />
        <div className="h-4 bg-muted/40 rounded-md w-1/2 animate-pulse" />
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <div className="rounded-md border p-4">
        <h3 className="text-lg font-medium mb-2">{project.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        
        {/* Project details like technologies used */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {project.technologies.map((tech: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Team/Collaborators */}
        {project.team && project.team.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Team</h4>
            <div className="space-y-2">
              {project.team.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.photoURL || ""} alt={member.name} />
                    <AvatarFallback>{member.name?.charAt(0) || "M"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                  <span className="text-xs text-muted-foreground">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Industry Pulse page component
export default function IndustryPulseNew() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [pulses, setPulses] = useState<PulseWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewContent, setHasNewContent] = useState(false);
  const [hasPremiumContent, setHasPremiumContent] = useState(false);
  const [, setLocation] = useLocation();
  
  // Query for getting pulses
  const { data } = useQuery<PulseWithUser[]>({
    queryKey: ['/api/pulses'],
    onSuccess: (data) => {
      setPulses(data);
      setIsLoading(false);
    },
  });
  
  // Effect for simulating new content
  useEffect(() => {
    // Simulate new content available after random interval
    const timer = setTimeout(() => {
      // 30% chance of premium (Musk) content
      const isPremium = Math.random() < 0.3;
      setHasPremiumContent(isPremium);
      setHasNewContent(true);
      
      // Auto refresh after 10 seconds if user doesn't manually refresh
      const autoRefreshTimer = setTimeout(() => {
        if (hasNewContent) {
          handleRefresh();
        }
      }, 10000);
      
      return () => clearTimeout(autoRefreshTimer);
    }, Math.random() * 20000 + 10000); // Random time between 10-30 seconds
    
    return () => clearTimeout(timer);
  }, [hasNewContent]);
  
  // Function to handle refresh
  const handleRefresh = () => {
    setHasNewContent(false);
    setHasPremiumContent(false);
    
    // Invalidate pulses query to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/pulses'] });
    
    // Show toast
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

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <div className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Industry Pulse</h1>
                <p className="text-muted-foreground mt-1">
                  Discover insights, polls, and media from your professional network
                </p>
              </div>
              <Button onClick={() => setLocation("/create-pulse")}>
                Create Pulse
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="media-pulse">Media</TabsTrigger>
                <TabsTrigger value="poll">Polls</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
                <TabsTrigger value="musk-news" className="flex items-center gap-1">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader className="bg-muted/20 h-14"></CardHeader>
                        <CardContent className="p-4 space-y-2">
                          <div className="h-5 bg-muted/40 rounded"></div>
                          <div className="h-20 bg-muted/20 rounded"></div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 h-12"></CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : filteredPulses.length === 0 ? (
                  <Card>
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
                        <Button variant="outline" onClick={() => setActiveTab("all")}>
                          View All Pulses
                        </Button>
                      ) : (
                        <Button onClick={() => setLocation("/create-pulse")}>
                          Create Your First Pulse
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  /* Responsive Grid Layout */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPulses.map((pulse: PulseWithUser) => (
                      <PulseCard key={pulse.id} pulse={pulse} />
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