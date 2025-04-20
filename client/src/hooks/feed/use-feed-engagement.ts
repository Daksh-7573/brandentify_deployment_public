import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EngagementType } from "./use-feed-algorithm";

interface EngagementQuota {
  used: number;
  remaining: number;
  max: number;
}

interface EngagementOptions {
  /** Type of engagement ("insightful", "inspired", etc.) */
  engagementType: EngagementType;
  /** User ID of the person engaging */
  userId: number;
  /** Item ID being engaged with */
  itemId: number;
  /** Name of the API endpoint (e.g., "pulses", "nowboard-items") */
  apiEndpoint: string;
  /** Current count of this engagement type */
  currentCount?: number;
  /** Engagement quotas if applicable */
  quotaData?: Record<string, EngagementQuota>;
  /** Optional message (for shares, comments, etc.) */
  message?: string;
  /** Optional recipient ID (for shares) */
  recipientId?: number | null;
}

/**
 * Custom hook to handle engagement actions consistently across different feeds
 * Works with both Industry Pulse reactions and Nowboard inspired actions
 */
export function useFeedEngagement({
  engagementType,
  userId,
  itemId,
  apiEndpoint,
  currentCount = 0,
  quotaData,
  message = "",
  recipientId = null
}: EngagementOptions) {
  const { toast } = useToast();
  
  // Determine if user has remaining quota for this engagement type
  const hasRemainingQuota = () => {
    if (!quotaData || !quotaData[engagementType]) return true;
    return quotaData[engagementType].remaining > 0;
  };
  
  // Create engagement mutation (insightful, inspired, etc)
  const createMutation = useMutation({
    mutationFn: async () => {
      let endpoint = '';
      let payload = {};
      
      // Different endpoints for different engagement types
      switch (engagementType) {
        case "insightful":
        case "misinformed":
          endpoint = `/api/pulse-reactions`;
          payload = {
            userId,
            pulseId: itemId,
            reactionType: engagementType
          };
          break;
        
        case "inspired":
          endpoint = `/api/${apiEndpoint}/${itemId}/inspired-by`;
          payload = { userId };
          break;
          
        case "share":
          if (!recipientId) throw new Error("Recipient ID required for sharing");
          endpoint = `/api/pulse-shares`;
          payload = {
            pulseId: itemId,
            senderId: userId,
            recipientId,
            message
          };
          break;
          
        case "comment":
          endpoint = `/api/${apiEndpoint}/${itemId}/comments`;
          payload = {
            userId,
            content: message
          };
          break;
          
        default:
          throw new Error(`Unsupported engagement type: ${engagementType}`);
      }
      
      const res = await apiRequest("POST", endpoint, payload);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}/${itemId}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reaction-quota`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}`] });
      
      // If this is an inspired action, also invalidate the user's total inspired count
      if (engagementType === "inspired") {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/inspired-count`] });
        queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}/${itemId}/inspired-by/user/${userId}`] });
      }
      
      // Show success toast
      const messages = {
        insightful: "Marked as Insightful 🔥",
        misinformed: "Flagged as Misinformed ⚠️",
        inspired: "Marked as Inspired 💡",
        share: "Successfully shared",
        comment: "Comment posted successfully"
      };
      
      toast({
        title: messages[engagementType],
        description: quotaData 
          ? `Daily quota: ${quotaData[engagementType]?.used || 0}/${quotaData[engagementType]?.max || 10}` 
          : undefined,
      });
    },
    onError: (error) => {
      // If 409 (already engaged), don't show error - this could be a duplicate click
      const isConflict = (error as any)?.status === 409;
      
      if (!isConflict) {
        toast({
          title: `Failed to ${engagementType}`,
          description: `Error processing your ${engagementType} action`,
          variant: "destructive",
        });
      }
    }
  });
  
  // Delete engagement mutation (remove reaction, inspired, etc)
  const deleteMutation = useMutation({
    mutationFn: async (engagementId: number) => {
      let endpoint = '';
      
      // Different endpoints for different engagement types
      switch (engagementType) {
        case "insightful":
        case "misinformed":
          endpoint = `/api/pulse-reactions/${engagementId}`;
          break;
          
        case "inspired":
          endpoint = `/api/${apiEndpoint}/${itemId}/inspired-by/${engagementId}`;
          break;
          
        case "comment":
          endpoint = `/api/${apiEndpoint}/${itemId}/comments/${engagementId}`;
          break;
          
        default:
          throw new Error(`Unsupported engagement type for deletion: ${engagementType}`);
      }
      
      const res = await apiRequest("DELETE", endpoint);
      return res.ok;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}/${itemId}/reactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}`] });
      
      toast({
        title: `${engagementType} removed`,
        description: `Your ${engagementType} reaction has been removed`,
      });
    },
    onError: (error) => {
      toast({
        title: `Failed to remove ${engagementType}`,
        description: `Error removing your ${engagementType}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle engagement toggle
  const handleEngagement = (userEngagementId?: number) => {
    if (userEngagementId) {
      // For 'inspired' type, don't allow removing once set
      if (engagementType === "inspired") {
        toast({
          title: "Cannot un-inspire",
          description: "Once you mark something as inspired, it cannot be undone.",
        });
        return;
      }
      
      // Remove existing engagement
      deleteMutation.mutate(userEngagementId);
    } else {
      // Special case for "inspired" - hard limit of 10 per user
      if (engagementType === "inspired") {
        // Check if user has inspired 10 or more items
        const quota = quotaData?.[engagementType];
        if (quota && quota.used >= 10) {
          toast({
            title: "Inspiration limit reached",
            description: "You can only mark 10 items as inspired in total.",
          });
          return;
        }
      }
      // Check quota before adding new engagement
      else if (quotaData && !hasRemainingQuota()) {
        const quota = quotaData[engagementType];
        toast({
          title: "Daily limit reached",
          description: `You've used all your ${engagementType} actions for today (${quota?.max})`,
        });
        return;
      }
      
      // Add new engagement
      createMutation.mutate();
    }
  };
  
  // Track loading states
  const isLoading = createMutation.isPending || deleteMutation.isPending;
  
  return {
    handleEngagement,
    isLoading,
    currentCount
  };
}