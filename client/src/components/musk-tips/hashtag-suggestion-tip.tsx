import React, { useState, useEffect } from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { Lightbulb, Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HashtagSuggestionTipProps {
  industry?: string;
  domain?: string;
  contentContext?: string;
  previouslyUsedHashtags?: string[];
  onSelect?: (hashtag: string) => void;
  className?: string;
  tipText?: string;
  maxVisibleHashtags?: number;
}

export function HashtagSuggestionTip({
  industry,
  domain,
  contentContext = '',
  previouslyUsedHashtags = [],
  onSelect,
  className,
  tipText = "Musk's hashtag suggestions:",
  maxVisibleHashtags = 5
}: HashtagSuggestionTipProps) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Fetch hashtag suggestions
  const fetchHashtags = async () => {
    if (!industry && !domain && !contentContext) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/musk-ai/suggest-hashtags', {
        method: 'POST',
        body: JSON.stringify({
          industry,
          domain,
          previouslyUsedHashtags,
          contentContext,
          count: 10 // Request more than we'll show to have variety
        }),
      });
      
      if (response.hashtags && Array.isArray(response.hashtags)) {
        setHashtags(response.hashtags);
      }
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (tooltipOpen) {
      fetchHashtags();
    }
  }, [tooltipOpen]);

  // Handle hashtag selection
  const handleSelectHashtag = (hashtag: string) => {
    if (onSelect) {
      onSelect(hashtag);
    } else {
      // Default behavior: copy to clipboard
      navigator.clipboard.writeText(hashtag);
      setCopied({...copied, [hashtag]: true});
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(prev => ({...prev, [hashtag]: false}));
      }, 2000);
    }
  };

  // Visible hashtags limited by maxVisibleHashtags
  const visibleHashtags = hashtags.slice(0, maxVisibleHashtags);

  return (
    <TooltipProvider>
      <Tooltip 
        open={tooltipOpen} 
        onOpenChange={setTooltipOpen}
      >
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "gap-2 text-amber-600 border-amber-200 hover:bg-amber-50", 
              className
            )}
          >
            <Lightbulb 
              className="h-4 w-4 text-amber-500" 
              aria-hidden="true" 
            />
            <span className="hidden sm:inline">Hashtag Ideas</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start" 
          className="p-4 w-80 space-y-3"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">{tipText}</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchHashtags} 
              disabled={isLoading}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={cn(
                "h-4 w-4", 
                isLoading && "animate-spin"
              )} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-2 flex justify-center">
              <RefreshCw className="animate-spin h-5 w-5 text-muted-foreground" />
            </div>
          ) : hashtags.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No suggestions available for the current context.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visibleHashtags.map((hashtag, index) => (
                <Badge 
                  key={`${hashtag}-${index}`}
                  variant="outline"
                  className="pl-2 pr-1 py-1 cursor-pointer hover:bg-accent flex items-center gap-1 group"
                  onClick={() => handleSelectHashtag(hashtag)}
                >
                  <span>{hashtag}</span>
                  {copied[hashtag] ? (
                    <Check className="h-3 w-3 text-green-500 ml-1" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-70 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Click on a hashtag to {onSelect ? "insert" : "copy"} it
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}