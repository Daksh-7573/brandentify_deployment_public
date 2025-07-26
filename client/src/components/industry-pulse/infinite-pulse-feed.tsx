import { useState, useEffect, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Pulse } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BarChart, 
  Video, 
  Image, 
  FileCode, 
  Loader2, 
  AlertTriangle,
  Flame,
  Share,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { StandardLoadingScreen } from "@/components/ui/standard-loading-screen";
import { cn } from "@/lib/utils";

// Extended Pulse type with user info for display purposes
interface PulseWithUser {
  id: number;
  userId: number;
  type: "poll" | "media-pulse" | "project" | "news-pulse";
  title: string;
  content: string | null;
  mediaType: "image" | "video" | null;
  mediaUrls: string[];
  mediaLocalStorageKeys?: string[];
  pollOptions: string[];
  projectId: number | null;
  likes: number;
  insightfulCount?: number;
  misinformedCount?: number;
  shareCount?: number;
  comments: number;
  isPublished: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    name: string | null;
    photoURL: string | null;
  };
  projectDetails?: string;
}

interface InfinitePulseFeedProps {
  filters?: {
    industry?: string;
    domain?: string;
    type?: string;
  };
  className?: string;
}

// Optimized pulse card component with lazy loading
function PulseCard({ pulse, isVisible }: { pulse: PulseWithUser; isVisible: boolean }) {
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Lazy load images only when visible
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Get pulse icon
  const getPulseIcon = () => {
    switch (pulse.type) {
      case "poll":
        return <BarChart className="h-4 w-4" />;
      case "media-pulse":
        return pulse.mediaType === "video" ? 
          <Video className="h-4 w-4" /> : 
          <Image className="h-4 w-4" />;
      case "project":
        return <FileCode className="h-4 w-4" />;
      case "news-pulse":
        return <Flame className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Format creation date
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <Card className="neo-glass-card mb-4 transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={pulse.user?.photoURL || ''} 
                alt={pulse.user?.name || 'User'}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {pulse.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">
                {pulse.user?.name || 'Unknown User'}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                {getPulseIcon()}
                <span>{formatDate(pulse.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-white mt-3">
          {pulse.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        {pulse.content && (
          <p className="text-gray-100 leading-relaxed">
            {pulse.content}
          </p>
        )}

        {/* Media Content - Lazy Loaded */}
        {pulse.mediaUrls && pulse.mediaUrls.length > 0 && isVisible && (
          <div className="space-y-3">
            {pulse.mediaUrls.map((url, index) => (
              <div key={index} className="relative">
                {pulse.mediaType === "image" ? (
                  <div className="relative">
                    {!imageLoaded && !imageError && (
                      <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    )}
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className={cn(
                        "w-full rounded-lg object-cover transition-opacity duration-300",
                        imageLoaded ? "opacity-100" : "opacity-0",
                        imageError ? "hidden" : ""
                      )}
                      style={{ aspectRatio: "16/9" }}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {imageError && (
                      <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-gray-400" />
                        <span className="ml-2 text-gray-400">Failed to load image</span>
                      </div>
                    )}
                  </div>
                ) : pulse.mediaType === "video" ? (
                  <video
                    src={url}
                    controls
                    className="w-full rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Poll Options */}
        {pulse.type === "poll" && pulse.pollOptions && pulse.pollOptions.length > 0 && (
          <div className="space-y-2">
            {pulse.pollOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start neo-glass-button text-left"
                size="sm"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{pulse.comments || 0}</span>
            </span>
            {pulse.insightfulCount !== undefined && (
              <span className="flex items-center space-x-1">
                <span>👍</span>
                <span>{pulse.insightfulCount}</span>
              </span>
            )}
            {pulse.shareCount !== undefined && (
              <span className="flex items-center space-x-1">
                <Share className="h-4 w-4" />
                <span>{pulse.shareCount}</span>
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Intersection observer hook for detecting visible items
function useIntersectionObserver(callback: () => void, options: IntersectionObserverInit = {}) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback]);

  return targetRef;
}

// Main infinite feed component
export default function InfinitePulseFeed({ filters, className }: InfinitePulseFeedProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  // Type for paginated response
  interface PaginatedResponse {
    pulses: PulseWithUser[];
    nextCursor: string | null;
    hasMore: boolean;
  }

  // Infinite query for pulses
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ['/api/pulses/paginated', filters],
    queryFn: async ({ pageParam }): Promise<PaginatedResponse> => {
      const params = new URLSearchParams();
      params.append('limit', '20');
      
      if (pageParam) {
        params.append('cursor', pageParam as string);
      }
      
      if (filters?.industry) {
        params.append('industry', filters.industry);
      }
      
      if (filters?.domain) {
        params.append('domain', filters.domain);
      }
      
      if (filters?.type) {
        params.append('type', filters.type);
      }

      const response = await fetch(`/api/pulses/paginated?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pulses');
      }
      return response.json();
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: PaginatedResponse) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaces cacheTime in newer versions)
  });

  // Load more trigger
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  // Track visible items for lazy loading
  useEffect(() => {
    if (!listRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = parseInt(entry.target.getAttribute('data-pulse-id') || '0');
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const cards = listRef.current.querySelectorAll('[data-pulse-id]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [data]);

  // Handle loading states
  if (isLoading) {
    return (
      <div className={className}>
        <StandardLoadingScreen message="Loading your Industry Pulse feed..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load pulses</h3>
        <p className="text-gray-300 mb-4">Something went wrong. Please try again.</p>
        <Button 
          onClick={() => refetch()} 
          className="neo-glass-button"
          disabled={isFetching}
        >
          {isFetching && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Get all pulses from pages
  const allPulses = data?.pages.flatMap((page: PaginatedResponse) => page.pulses) || [];

  if (allPulses.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No pulses found</h3>
        <p className="text-gray-300">Be the first to share something in your industry!</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} ref={listRef}>
      {/* Pulses List */}
      {allPulses.map((pulse) => (
        <div key={pulse.id} data-pulse-id={pulse.id}>
          <PulseCard 
            pulse={pulse} 
            isVisible={visibleItems.has(pulse.id)}
          />
        </div>
      ))}

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <div className="flex items-center space-x-2 text-gray-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more pulses...</span>
            </div>
          ) : (
            <div className="h-4" /> // Invisible trigger
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasNextPage && allPulses.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-gray-400 text-sm">You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
}