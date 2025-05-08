import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Check, Copy, Hash, MessageSquare, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface HashtagSuggestionsProps {
  industry?: string;
  questType?: string;
  targetAction?: string;
  contentContext?: string;
  onHashtagClick?: (hashtag: string) => void;
  className?: string;
  isCompact?: boolean;
  count?: number;
  showRefresh?: boolean;
  showTitle?: boolean;
  showMuskTip?: boolean;
  showSources?: boolean;
  title?: string;
  muskTipContent?: string;
  demo?: boolean;
}

export function HashtagSuggestions({
  industry,
  questType = 'pulse_creation',
  targetAction,
  contentContext,
  onHashtagClick,
  className = '',
  isCompact = false,
  count = 5,
  showRefresh = true,
  showTitle = true,
  showMuskTip = false,
  showSources = false,
  title = 'Recommended Hashtags',
  muskTipContent,
  demo = false
}: HashtagSuggestionsProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const fetchHashtags = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If a demo was requested, use the demo endpoint
      const endpoint = demo 
        ? '/api/personalized-hashtags/demo' 
        : '/api/personalized-hashtags';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: industry || user?.industry,
          domain: user?.domain,
          questType,
          targetAction,
          contentContext,
          count
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hashtags: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setHashtags(data.hashtags);
        
        if (data.sources && Array.isArray(data.sources)) {
          setSources(data.sources);
        }
      } else {
        setHashtags([]);
        setSources([]);
      }
    } catch (err) {
      console.error('Error fetching hashtags:', err);
      setError('Failed to load hashtag suggestions. Please try again later.');
      setHashtags([]);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHashtags();
  }, [user, industry, questType, targetAction, contentContext, count, demo]);
  
  const handleCopy = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    setCopied({...copied, [hashtag]: true});
    
    toast({
      title: "Copied to clipboard",
      description: `Hashtag ${hashtag} copied to clipboard`,
      duration: 2000,
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(prev => ({...prev, [hashtag]: false}));
    }, 2000);
    
    // If a click handler was provided, call it
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    }
  };
  
  // Generate the color variants based on index
  const getColor = (index: number) => {
    const colors = [
      'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-300',
      'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-300',
      'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-300',
      'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-300',
      'bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800 text-pink-800 dark:text-pink-300',
      'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-300',
      'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900 dark:hover:bg-cyan-800 text-cyan-800 dark:text-cyan-300',
      'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-300',
    ];
    
    return colors[index % colors.length];
  };

  return (
    <div className={`${className}`}>
      {showTitle && (
        <h3 className="text-lg font-medium mb-2">{title}</h3>
      )}
      
      {showMuskTip && muskTipContent && (
        <Alert className="mb-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <MessageSquare className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">Musk's Tip</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-xs">
            {muskTipContent}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {hashtags.length > 0 ? (
              hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`cursor-pointer flex items-center gap-1 ${getColor(index)}`}
                  onClick={() => handleCopy(hashtag)}
                >
                  <Hash className="h-3 w-3" />
                  {hashtag.startsWith('#') ? hashtag.substring(1) : hashtag}
                  {copied[hashtag] ? (
                    <Check className="h-3 w-3 ml-1" />
                  ) : (
                    <Copy className="h-3 w-3 ml-1 opacity-50" />
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hashtag suggestions available.</p>
            )}
          </div>
          
          {showSources && sources.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Sources:</span> {sources.join(', ')}
              </p>
            </div>
          )}
          
          {showRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-xs" 
              onClick={fetchHashtags}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh suggestions
            </Button>
          )}
        </>
      )}
    </div>
  );
}