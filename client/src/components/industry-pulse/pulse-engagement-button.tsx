import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Share, MessageSquare } from "lucide-react";
import { useFeedEngagement, formatEngagementCount, getEngagementStyles } from "@/hooks/feed";

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
  
  // Check if this specific reaction type is active (not just any reaction)
  const userReactionId = (type === "insightful" || type === "misinformed") && 
                         userReactionData?.reactionType === type
    ? userReactionData.id 
    : undefined;
  
  const isActive = !!userReactionId;
  
  // Subscribe to the pulses feed to get instant cache updates
  const { data: pulsesList } = useQuery({
    queryKey: ["/api/pulses"],
    enabled: false, // Don't fetch, just subscribe to cache
    staleTime: Infinity,
  });

  // Get the actual count from the feed data
  const cachedCount = (() => {
    if (pulsesList) {
      const pulse = pulsesList.find((p: any) => p.id === pulseId);
      if (pulse) {
        const countField = type === "insightful" ? "insightfulCount" : 
                          type === "misinformed" ? "misinformedCount" :
                          type === "inspired" ? "inspiredCount" : "commentCount";
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
    currentCount: cachedCount,
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
  
  // Label based on engagement type - use cachedCount to show instant updates
  const getLabel = () => {
    const count = formatEngagementCount(cachedCount);
    
    switch (type) {
      case "insightful": return `${count} Insightful`;
      case "misinformed": return `${count} Misinformed`;
      case "share": return `${count} Share`;
      case "comment": return `${count} ${cachedCount === 1 ? 'Comment' : 'Comments'}`;
      default: return "";
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 rounded-full ${styles.textColor} ${styles.hoverBg} ${className}`}
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          // Optimistic updates are handled in useFeedEngagement hook's onMutate callback
          handleEngagement(userReactionId);
        }
      }}
      disabled={isLoading}
    >
      <Icon />
      <span>{getLabel()}</span>
    </Button>
  );
}