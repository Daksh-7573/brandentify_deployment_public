import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";

interface BatchFeedData {
  reactions: Record<number, any[]>;
  pollVotes: Record<number, any[]>;
  flagStatus: Record<number, boolean>;
  userVotes: Record<number, number | null>;
  reactionQuota: {
    insightful: { used: number; remaining: number; max: number };
    misinformed: { used: number; remaining: number; max: number };
  };
}

export function useFeedBatch(userId: number, pulseIds: number[]) {
  const sortedPulseIds = useMemo(
    () => [...pulseIds].sort((a, b) => a - b),
    [pulseIds.join(",")]
  );

  return useQuery<BatchFeedData>({
    queryKey: ["/api/feed/batch", userId, sortedPulseIds],
    queryFn: async () => {
      if (!userId || sortedPulseIds.length === 0) {
        return {
          reactions: {},
          pollVotes: {},
          flagStatus: {},
          userVotes: {},
          reactionQuota: {
            insightful: { used: 0, remaining: 10, max: 10 },
            misinformed: { used: 0, remaining: 10, max: 10 },
          },
        };
      }
      const response = await fetch(
        `/api/feed/batch/${userId}?pulseIds=${sortedPulseIds.join(",")}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch batch feed data");
      }
      return response.json();
    },
    enabled: userId > 0 && sortedPulseIds.length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });
}

export function usePrefetchFeedBatch(userId: number, pulseIds: number[]) {
  const prefetchedRef = useRef<string | null>(null);
  
  const sortedPulseIds = useMemo(
    () => [...pulseIds].sort((a, b) => a - b),
    [pulseIds.join(",")]
  );

  useEffect(() => {
    if (userId <= 0 || sortedPulseIds.length === 0) return;
    
    const cacheKey = `${userId}-${sortedPulseIds.join(",")}`;
    if (prefetchedRef.current === cacheKey) return;
    
    const url = `/api/feed/batch/${userId}?pulseIds=${sortedPulseIds.join(",")}`;
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) {
      prefetchedRef.current = cacheKey;
      return;
    }
    
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "fetch";
    document.head.appendChild(link);
    prefetchedRef.current = cacheKey;
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [userId, sortedPulseIds]);
}
