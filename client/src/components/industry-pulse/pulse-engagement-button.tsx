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
  const { data: userReactionData } = useQuery<{ id: number } | null>({
    queryKey: [`/api/pulses/${pulseId}/reactions/user/${userId}`],
    refetchOnWindowFocus: false
  });
  
  const userReactionId = type === "insightful" || type === "misinformed" 
    ? userReactionData?.id 
    : undefined;
  
  const isActive = !!userReactionId;
  
  // Use the shared engagement hook
  const { handleEngagement, isLoading } = useFeedEngagement({
    engagementType: type,
    userId,
    itemId: pulseId,
    apiEndpoint: "pulses",
    currentCount,
    quotaData
  });
  
  // Get appropriate styles based on engagement type and status
  const styles = getEngagementStyles(type, isActive);
  
  // Icon based on engagement type
  const Icon = () => {
    switch (type) {
      case "insightful": return <Flame className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "misinformed": return <AlertTriangle className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "share": return <Share className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      case "comment": return <MessageSquare className={`h-4 w-4 mr-1.5 ${styles.activeFill}`} />;
      default: return null;
    }
  };
  
  // Label based on engagement type
  const getLabel = () => {
    const count = formatEngagementCount(currentCount);
    
    switch (type) {
      case "insightful": return `${count} Insightful`;
      case "misinformed": return `${count} Misinformed`;
      case "share": return `${count} Share`;
      case "comment": return `${count} ${currentCount === 1 ? 'Comment' : 'Comments'}`;
      default: return "";
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 rounded-full ${styles.textColor} ${styles.hoverBg} ${className}`}
      onClick={() => {
        if (onClick) onClick();
        else handleEngagement(userReactionId);
      }}
      disabled={isLoading}
    >
      <Icon />
      <span>{getLabel()}</span>
    </Button>
  );
}