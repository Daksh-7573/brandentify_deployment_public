import { useState } from "react";
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
  // Local optimistic state for instant UI updates
  const [localCountDelta, setLocalCountDelta] = useState(0);
  
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
  
  // Use the shared engagement hook
  const { handleEngagement, isLoading } = useFeedEngagement({
    engagementType: type,
    userId,
    itemId: pulseId,
    apiEndpoint: "pulses",
    currentCount: currentCount + localCountDelta,
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
  
  // Label based on engagement type with local optimistic count
  const getLabel = () => {
    const displayCount = currentCount + localCountDelta;
    const count = formatEngagementCount(displayCount);
    
    switch (type) {
      case "insightful": return `${count} Insightful`;
      case "misinformed": return `${count} Misinformed`;
      case "share": return `${count} Share`;
      case "comment": return `${count} ${displayCount === 1 ? 'Comment' : 'Comments'}`;
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
          // Immediately update local state for instant UI feedback
          if (type === "insightful" || type === "misinformed") {
            setLocalCountDelta(prev => prev + 1);
          }
          
          // Call the engagement handler
          handleEngagement(userReactionId);
          
          // Reset local delta after mutation completes (will be synced from server)
          setTimeout(() => {
            setLocalCountDelta(0);
          }, 2000);
        }
      }}
      disabled={isLoading}
    >
      <Icon />
      <span>{getLabel()}</span>
    </Button>
  );
}