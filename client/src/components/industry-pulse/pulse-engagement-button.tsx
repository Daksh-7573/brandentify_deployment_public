import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Share, MessageSquare } from "lucide-react";
import { useFeedEngagement, formatEngagementCount, getEngagementStyles } from "@/hooks/feed";
import { queryClient } from "@/lib/queryClient";
import { useCallback } from "react";

interface PulseEngagementButtonProps {
  type: "insightful" | "misinformed" | "share" | "comment";
  pulseId: number;
  userId: number;
  currentCount: number;
  quotaData?: any;
  className?: string;
  onClick?: () => void;
}

export default function PulseEngagementButton({
  type,
  pulseId,
  userId,
  currentCount,
  quotaData,
  className = "",
  onClick
}: PulseEngagementButtonProps) {
  // Get user's existing reaction status
  const { data: userReactionData } = useQuery<{ id: number; reactionType: string } | null>({
    queryKey: [`/api/pulses/${pulseId}/reactions/user/${userId}`],
    refetchOnWindowFocus: false
  });
  
  // SUBSCRIBE to pulses feed to get instant cache updates
  const { data: pulsesList } = useQuery<any[]>({
    queryKey: ["/api/pulses"],
    enabled: false, // Don't fetch - just subscribe to cache
    staleTime: Infinity,
  });

  // Check if this specific reaction type is active (not just any reaction)
  const userReactionId = (type === "insightful" || type === "misinformed") && 
                         userReactionData?.reactionType === type
    ? userReactionData.id 
    : undefined;
  
  const isActive = !!userReactionId;
  
  // Get count from cache if available, otherwise use prop
  const displayCount = (() => {
    if (pulsesList) {
      const pulse = pulsesList.find(p => p.id === pulseId);
      if (pulse) {
        const countField = type === "insightful" ? "insightfulCount" : 
                          type === "misinformed" ? "misinformedCount" : 
                          "commentCount";
        return pulse[countField] || currentCount;
      }
    }
    return currentCount;
  })();
  
  // Use the shared engagement hook
  const { handleEngagement, isLoading } = useFeedEngagement({
    engagementType: type,
    userId,
    itemId: pulseId,
    apiEndpoint: "pulses",
    currentCount: displayCount,
    quotaData
  });
  
  // Get appropriate styles based on engagement type and status
  const styles = getEngagementStyles(type, isActive);
  
  // Icon based on engagement type
  const Icon = () => {
    switch (type) {
      case "insightful": return <Flame className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "misinformed": return <Lightbulb className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "share": return <Share className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "comment": return <MessageSquare className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      default: return null;
    }
  };
  
  // Label based on engagement type
  const getLabel = () => {
    const count = formatEngagementCount(displayCount);
    
    switch (type) {
      case "insightful": return `${count} Insightful`;
      case "misinformed": return `${count} Misinformed`;
      case "share": return `${count} Share`;
      case "comment": return `${count} ${displayCount === 1 ? 'Comment' : 'Comments'}`;
      default: return "";
    }
  };
  
  // Handle click with cache update BEFORE mutation
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }

    if (type === "insightful" || type === "misinformed") {
      // UPDATE CACHE IMMEDIATELY
      console.log(`⚡ [${type}] Instant cache update for pulse ${pulseId}`);
      const cachedPulses = queryClient.getQueryData<any[]>(["/api/pulses"]);
      if (cachedPulses) {
        const countField = type === "insightful" ? "insightfulCount" : "misinformedCount";
        const updated = cachedPulses.map(p => {
          if (p.id === pulseId) {
            return { ...p, [countField]: p[countField] + 1 };
          }
          return p;
        });
        // This triggers re-render of button component instantly
        queryClient.setQueryData(["/api/pulses"], updated);
      }
    }

    // Call mutation AFTER cache update
    handleEngagement(userReactionId);
  }, [pulseId, type, userId, userReactionId, handleEngagement, onClick]);
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 rounded-full ${styles.textColor} ${styles.hoverBg} ${className}`}
      data-testid={`engagement-btn-${type}-${pulseId}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Icon />
      <span>{getLabel()}</span>
    </Button>
  );
}
