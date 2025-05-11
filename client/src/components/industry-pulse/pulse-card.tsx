import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PulseEngagementButton from "./pulse-engagement-button";
import { PulseFlagButton } from "./pulse-flag-button";
import { formatFeedDate } from "@/hooks/feed";

interface PulseCardProps {
  pulse: {
    id: number;
    userId: number;
    type: string;
    title: string;
    content: string | null;
    mediaType?: string | null;
    mediaUrls?: string[];
    pollOptions?: string[];
    industry?: string | null;
    category?: string | null;
    createdAt: string | Date;
    insightfulCount: number;
    misinformedCount: number;
    shareCount: number;
    comments: number;
    user?: {
      name: string | null;
      photoURL: string | null;
    };
  };
  userId: number;
  quotaData?: any;
  onComment?: (pulseId: number) => void;
  onShare?: (pulseId: number) => void;
}

export default function PulseCard({ 
  pulse, 
  userId, 
  quotaData,
  onComment,
  onShare
}: PulseCardProps) {
  // State to track expanded view for longer content
  const [expanded, setExpanded] = useState(false);
  
  // Format content with truncation for very long content
  const getFormattedContent = () => {
    if (!pulse.content) return null;
    
    const maxLength = 250;
    if (pulse.content.length <= maxLength || expanded) {
      return <p className="text-sm text-muted-foreground mt-2">{pulse.content}</p>;
    }
    
    return (
      <div className="mt-2">
        <p className="text-sm text-muted-foreground">
          {pulse.content.substring(0, maxLength)}...
          <button 
            className="text-primary ml-1 hover:underline" 
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        </p>
      </div>
    );
  };
  
  // Format category and industry badges
  const renderBadges = () => {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {pulse.category && (
          <Badge variant="outline" className="text-xs">
            {pulse.category}
          </Badge>
        )}
        
        {pulse.industry && (
          <Badge variant="outline" className="text-xs bg-primary/5">
            {pulse.industry}
          </Badge>
        )}
        
        <Badge variant="outline" className="text-xs ml-auto">
          {pulse.type.replace("-pulse", "")}
        </Badge>
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header with user info and timestamp */}
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={pulse.user?.photoURL || undefined} alt={pulse.user?.name || "User"} />
            <AvatarFallback>{pulse.user?.name ? pulse.user.name.charAt(0) : "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{pulse.user?.name || "User"}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatFeedDate(pulse.createdAt)}
                </p>
              </div>
            </div>
            
            {renderBadges()}
            
            {/* Title and content */}
            <h4 className="text-lg font-medium mt-3">{pulse.title}</h4>
            {getFormattedContent()}
            
            {/* Media content preview (simplified) */}
            {pulse.mediaType && pulse.mediaUrls && pulse.mediaUrls.length > 0 && (
              <div className="mt-3 rounded-md overflow-hidden bg-muted/50 h-48 flex items-center justify-center">
                {/* In a real implementation, this would render actual media content */}
                <p className="text-muted-foreground">
                  {pulse.mediaType === "image" ? "Image Content" : "Video Content"}
                </p>
              </div>
            )}
            
            {/* Poll options preview (simplified) */}
            {pulse.type === "poll" && pulse.pollOptions && pulse.pollOptions.length > 0 && (
              <div className="mt-3 space-y-2">
                {pulse.pollOptions.map((option, i) => (
                  <div key={i} className="p-2 rounded-md bg-muted/50 text-sm">
                    {option}
                  </div>
                ))}
              </div>
            )}
            
            {/* Engagement buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <PulseEngagementButton 
                type="insightful" 
                pulseId={pulse.id} 
                userId={userId} 
                currentCount={pulse.insightfulCount}
                quotaData={quotaData}
              />
              
              <PulseEngagementButton 
                type="misinformed" 
                pulseId={pulse.id} 
                userId={userId} 
                currentCount={pulse.misinformedCount}
                quotaData={quotaData}
              />
              
              <PulseEngagementButton 
                type="comment" 
                pulseId={pulse.id} 
                userId={userId} 
                currentCount={pulse.comments}
                quotaData={quotaData}
                onClick={() => onComment && onComment(pulse.id)}
                className="ml-auto"
              />
              
              <PulseEngagementButton 
                type="share" 
                pulseId={pulse.id} 
                userId={userId} 
                currentCount={pulse.shareCount}
                quotaData={quotaData}
                onClick={() => onShare && onShare(pulse.id)}
              />
              
              {/* Flag Button for Content Moderation */}
              <PulseFlagButton pulseId={pulse.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}