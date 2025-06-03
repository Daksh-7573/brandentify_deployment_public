import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PulseEngagementButton from "./pulse-engagement-button";
import PulseMenu from "./pulse-menu";
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
  
  // Parse and format content with clickable reference links
  const getFormattedContent = () => {
    if (!pulse.content) return null;
    
    // Check if content contains reference links section
    const readMoreIndex = pulse.content.indexOf('📚 Read More:');
    
    if (readMoreIndex === -1) {
      // No reference links, use original logic with truncation
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
    }
    
    // Split content into main content and reference links
    const mainContent = pulse.content.substring(0, readMoreIndex).trim();
    const referencesSection = pulse.content.substring(readMoreIndex);
    
    // Parse reference links from the text
    const referenceLines = referencesSection.split('\n').slice(1); // Skip the "📚 Read More:" line
    const references = [];
    
    for (let i = 0; i < referenceLines.length; i += 2) {
      const titleLine = referenceLines[i];
      const urlLine = referenceLines[i + 1];
      
      if (titleLine && urlLine && titleLine.startsWith('•') && urlLine.trim().startsWith('http')) {
        const titleMatch = titleLine.match(/^•\s*(.+?)\s*-\s*(.+)$/);
        if (titleMatch) {
          references.push({
            title: titleMatch[1].trim(),
            source: titleMatch[2].trim(),
            url: urlLine.trim()
          });
        }
      }
    }
    
    return (
      <div className="mt-2">
        <p className="text-sm text-muted-foreground">{mainContent}</p>
        
        {references.length > 0 && (
          <div className="mt-3 p-3 bg-muted/30 rounded-md border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">📚 Read More</span>
            </div>
            <div className="space-y-2">
              {references.map((ref, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <a 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {ref.title}
                  </a>
                  <span className="text-xs text-muted-foreground">{ref.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <PulseMenu 
                pulseId={pulse.id}
                currentUserId={userId}
                pulseCreatorId={pulse.userId}
              />
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}