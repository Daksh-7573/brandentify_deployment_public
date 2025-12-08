import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Share, MessageSquare } from "lucide-react";
import { useFeedEngagement, formatEngagementCount, getEngagementStyles } from "@/hooks/feed";
import { useCallback, useMemo } from "react";

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
  
  // LISTEN TO THE EXACT SAME QUERY KEY THAT THE MUTATION UPDATES
  // This is critical for instant updates - the mutation updates ["/api/pulses"]
  // so this component must listen to ["/api/pulses"] to get the updates
  const { data: pulsesList } = useQuery<any[]>({
    queryKey: ["/api/pulses"],
    queryFn: () => [],  // Returns empty array as fallback
    staleTime: Infinity,
    gcTime: Infinity,
    // Don't disable - we need the query observer to listen to cache changes
  });

  // Check if this specific reaction type is active
  const userReactionId = (type === "insightful" || type === "misinformed") && 
                         userReactionData?.reactionType === type
    ? userReactionData.id 
    : undefined;
  
  const isActive = !!userReactionId;
  
  // Extract the count for this pulse from the cached list
  const displayCount = useMemo(() => {
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
  }, [pulsesList, pulseId, type, currentCount]);
  
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
  
  // Handle click - just call the mutation
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
      return;
    }
    // The mutation's onMutate callback will update the cache instantly
    // This component is listening to ["/api/pulses"] so it will re-render immediately
    handleEngagement(userReactionId);
  }, [type, userReactionId, handleEngagement, onClick]);
  
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
