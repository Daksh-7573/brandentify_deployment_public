import { useQuery } from "@tanstack/react-query";

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
  return useQuery<BatchFeedData>({
    queryKey: ["/api/feed/batch", userId, pulseIds.join(",")],
    queryFn: async () => {
      if (!userId || pulseIds.length === 0) {
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
        `/api/feed/batch/${userId}?pulseIds=${pulseIds.join(",")}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch batch feed data");
      }
      return response.json();
    },
    enabled: userId > 0 && pulseIds.length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });
}

export function usePrefetchFeedBatch(userId: number, pulseIds: number[]) {
  const enabled = userId > 0 && pulseIds.length > 0;
  
  if (enabled && pulseIds.length > 0) {
    const url = `/api/feed/batch/${userId}?pulseIds=${pulseIds.join(",")}`;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "fetch";
    document.head.appendChild(link);
  }
}
