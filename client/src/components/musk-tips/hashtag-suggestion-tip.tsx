import React, { useState, useEffect } from 'react';
import { Info, Hash, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HashtagSuggestionTipProps {
  industry?: string;
  domain?: string;
  contentContext?: string;
  previouslyUsedHashtags?: string[];
  count?: number;
  onSelectHashtag?: (hashtag: string) => void;
}

/**
 * Musk's Hashtag Suggestion Tip
 * 
 * A component that suggests relevant hashtags based on the user's context
 * Can be embedded in post creation forms, content editors, etc.
 */
export function HashtagSuggestionTip({
  industry,
  domain,
  contentContext,
  previouslyUsedHashtags = [],
  count = 5,
  onSelectHashtag
}: HashtagSuggestionTipProps) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedHashtag) {
      const timeout = setTimeout(() => {
        setCopiedHashtag(null);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copiedHashtag]);

  // Only fetch hashtags if we have enough context
  const fetchHashtags = async () => {
    if (!industry && !domain && !contentContext) {
      setError("Not enough context to suggest hashtags");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('/api/musk-ai/suggest-hashtags', {
        method: 'POST',
        body: JSON.stringify({
          industry,
          domain,
          previouslyUsedHashtags,
          contentContext,
          count
        })
      });
      
      if (response.hashtags && Array.isArray(response.hashtags)) {
        setHashtags(response.hashtags);
      } else {
        setHashtags([]);
      }
    } catch (err) {
      console.error('Error fetching hashtag suggestions:', err);
      setError('Unable to get hashtag suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopiedHashtag(hashtag);
    toast({
      title: "Hashtag copied!",
      description: `${hashtag} has been copied to your clipboard.`,
      duration: 2000
    });
    
    if (onSelectHashtag) {
      onSelectHashtag(hashtag);
    }
  };

  return (
    <Card className="shadow-sm border-blue-100 bg-blue-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-sm font-medium text-blue-700">Musk's Tip</CardTitle>
        </div>
        <CardDescription className="text-blue-600">
          Add relevant hashtags to increase visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {!hashtags.length && !isLoading && !error ? (
          <div className="flex justify-center my-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchHashtags}
              className="text-blue-600 border-blue-200 hover:bg-blue-100"
            >
              <Hash className="mr-1 h-4 w-4" />
              Get hashtag suggestions
            </Button>
          </div>
        ) : isLoading ? (
          <div className="py-3 text-center text-sm text-blue-600">
            <span className="inline-block animate-pulse">Getting relevant hashtags...</span>
          </div>
        ) : error ? (
          <div className="py-3 text-center text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 py-2">
            {hashtags.map((hashtag) => (
              <TooltipProvider key={hashtag}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-blue-100 transition-colors px-2 py-1 border-blue-200"
                      onClick={() => handleCopyHashtag(hashtag)}
                    >
                      <span className="mr-1">{hashtag}</span>
                      {copiedHashtag === hashtag ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-blue-600" />
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardContent>
      {hashtags.length > 0 && (
        <CardFooter className="pt-0 flex justify-between">
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-blue-600 p-0"
            onClick={fetchHashtags}
          >
            Refresh suggestions
          </Button>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-blue-600 p-0"
            onClick={() => setHashtags([])}
          >
            Hide suggestions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}