import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";

/**
 * Types of engagement metrics tracked across feeds
 */
export type EngagementType = "insightful" | "misinformed" | "inspired" | "share" | "comment";

/**
 * Generic feed item interface that can be extended by both Pulse and Nowboard items
 */
export interface FeedItem {
  id: number;
  userId: number;
  content: string | null;
  createdAt: string | Date;
  user?: {
    name: string | null;
    photoURL: string | null;
  };
}

/**
 * Feed algorithm configuration options
 */
export interface FeedAlgorithmOptions<T extends FeedItem> {
  /** Query key for fetching feed items */
  queryKey: string | string[];
  /** Optional filters to apply */
  filters?: {
    category?: string;
    type?: string;
    industry?: string;
    visibility?: string;
  };
  /** Number of items to return per page */
  pageSize?: number;
  /** Function to fetch user data for items that don't have it */
  fetchUserData?: (items: T[]) => Promise<void>;
  /** Custom sort function for items */
  sortFunction?: (a: T, b: T) => number;
  /** Fetch fresh data periodically (in ms) */
  refreshInterval?: number;
}

/**
 * Custom hook to apply consistent feed algorithms across different feeds
 * Works with both Industry Pulse and Nowboard
 */
export function useFeedAlgorithm<T extends FeedItem>(options: FeedAlgorithmOptions<T>) {
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to 1 (demo user) if not authenticated
  
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [hasNewContent, setHasNewContent] = useState(false);
  const [hasPremiumContent, setHasPremiumContent] = useState(false);
  
  // Format queryKey to be consistent
  const queryKey = Array.isArray(options.queryKey) 
    ? options.queryKey 
    : [options.queryKey];
  
  // Fetch feed items
  const { data: items = [], isLoading, refetch } = useQuery<T[]>({
    queryKey,
    refetchInterval: options.refreshInterval,
    // Using onSuccess callback for React Query v5
    select: (data) => {
      const filtered = filterItems(data);
      
      // Check for premium content
      const hasPremium = data.some((item) => 
        // Example premium detection logic - override this as needed
        item.userId === 3 || // Musk is premium
        (item as any).isPremium === true
      );
      
      setHasPremiumContent(hasPremium);
      return data;
    }
  });
  
  // Effect to handle user data fetching and filtering with proper memoization
  useEffect(() => {
    // Skip if no items or no fetchUserData function
    if (!items.length || !options.fetchUserData) {
      setFilteredItems(filterItems(items));
      return;
    }
    
    // Function to fetch user data and update filtered items
    const processItems = async () => {
      await options.fetchUserData(items);
      const filtered = filterItems(items);
      setFilteredItems(filtered);
    };
    
    // Call the processing function
    processItems();
  }, [items, options.fetchUserData]);

  // Filter items based on options
  const filterItems = (items: T[]) => {
    if (!options.filters) return sortItems(items);
    
    return sortItems(items.filter(item => {
      // Filter by category if specified
      if (options.filters.category && (item as any).category !== options.filters.category) {
        return false;
      }
      
      // Filter by type if specified
      if (options.filters.type && (item as any).type !== options.filters.type) {
        return false;
      }
      
      // Filter by industry if specified
      if (options.filters.industry && (item as any).industry !== options.filters.industry) {
        return false;
      }
      
      // Filter by visibility if specified
      if (options.filters.visibility && (item as any).visibility !== options.filters.visibility) {
        // Special case: 'connections-only' requires checking if user is connected
        if (options.filters.visibility === 'connections-only') {
          // This would require checking connections - simplified for now
          return true; 
        }
        return false;
      }
      
      return true;
    }));
  };
  
  // Sort items (newest first by default, but can be customized)
  const sortItems = (items: T[]) => {
    if (options.sortFunction) {
      return [...items].sort(options.sortFunction);
    }
    
    // Default sorting (newest first)
    return [...items].sort((a, b) => {
      // Handle different date formats (string, Date object)
      let dateA: Date;
      let dateB: Date;
      
      if (a.createdAt instanceof Date) {
        dateA = a.createdAt;
      } else {
        dateA = new Date(a.createdAt);
      }
      
      if (b.createdAt instanceof Date) {
        dateB = b.createdAt;
      } else {
        dateB = new Date(b.createdAt);
      }
      
      return dateB.getTime() - dateA.getTime();
    });
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    await refetch();
    setHasNewContent(false);
  };

  // Apply pagination if needed
  const paginatedItems = options.pageSize 
    ? filteredItems.slice(0, options.pageSize) 
    : filteredItems;
  
  return {
    items: paginatedItems,
    allItems: filteredItems,
    isLoading,
    hasNewContent,
    hasPremiumContent,
    handleRefresh,
    refetch,
    userId
  };
}

/**
 * Helper function to format engagement counts (K, M for large numbers)
 */
export function formatEngagementCount(count: number = 0): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Helper function to check if the user has already engaged with an item
 */
export function hasUserEngaged(
  engagementData: any[] | undefined, 
  userId: number, 
  engagementType: string
): boolean {
  return engagementData?.some(
    (engagement: any) => engagement.userId === userId && engagement.type === engagementType
  ) || false;
}