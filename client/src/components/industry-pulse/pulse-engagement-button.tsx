import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Share, MessageSquare } from "lucide-react";
import { useFeedEngagement, formatEngagementCount, getEngagementStyles } from "@/hooks/feed";
import { useState } from "react";

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
  // Local state for instant UI feedback (updated immediately on click)
  const [localCountIncrement, setLocalCountIncrement] = useState(0);
  
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
  
  // Display count = prop count + any local pending increments
  const displayCount = currentCount + localCountIncrement;
  
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
  
  // Label based on engagement type with local count
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
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 rounded-full ${styles.textColor} ${styles.hoverBg} ${className}`}
      data-testid={`engagement-btn-${type}-${pulseId}`}
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          const clickTime = Date.now();
          console.log(`[${type}] Click at ${clickTime}, current count: ${currentCount}, increment: ${localCountIncrement}`);
          
          // For reactions only: update local state immediately for instant visual feedback
          if (type === "insightful" || type === "misinformed") {
            console.log(`[${type}] Setting local increment from ${localCountIncrement} to ${localCountIncrement + 1}`);
            setLocalCountIncrement(prev => {
              const newVal = prev + 1;
              console.log(`[${type}] State callback - new increment: ${newVal}`);
              return newVal;
            });
          }
          
          console.log(`[${type}] About to call handleEngagement`);
          
          // Call the engagement handler
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