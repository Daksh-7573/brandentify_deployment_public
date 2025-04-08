import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ThumbsUp, Calendar, Users, BarChart, Video, Image, FileCode, Check, Loader2, Maximize2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Extended Pulse type with user info for display purposes
interface PulseWithUser {
  id: number;
  userId: number;
  type: "poll" | "media-pulse" | "project";
  title: string;
  content: string | null;
  mediaType: "image" | "video" | null;
  mediaUrls: string[]; // Array of media URLs
  mediaLocalStorageKeys?: string[]; // Array of localStorage keys for media
  pollOptions: string[]; // Array of poll options
  projectId: number | null;
  likes: number;
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
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
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

export default function IndustryPulsePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [_, setLocation] = useLocation();
  
  // Fetch all pulses
  const { data: pulses = [], isLoading } = useQuery<PulseWithUser[]>({
    queryKey: ["/api/pulses"],
    onSuccess: (data) => {
      // Initialize project cache for faster loading
      const projectPulses = data.filter(pulse => pulse.type === 'project' && pulse.projectId);
      
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
  
  // Filter pulses based on the active tab
  const filteredPulses = pulses.filter(pulse => {
    if (activeTab === "all") return true;
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
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        <Sidebar activePage="industry-pulse" />
        <div className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-5xl mx-auto">
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
                <TabsTrigger value="poll">Polls</TabsTrigger>
                <TabsTrigger value="media-pulse">Media</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : filteredPulses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No pulses yet</h3>
                      <p className="text-center text-muted-foreground max-w-md mb-6">
                        {activeTab === "all" 
                          ? "Be the first to create a pulse in your professional network!" 
                          : `No ${activeTab} pulses available yet. Create one to get started!`}
                      </p>
                      <Button onClick={() => setLocation("/create-pulse")}>
                        Create Your First Pulse
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {filteredPulses.map((pulse) => (
                      <Card key={pulse.id} className="overflow-hidden">
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
                          <div className="flex space-x-4">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {pulse.likes || 0} Likes
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {pulse.comments || 0} Comments
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
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