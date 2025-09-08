import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Hash, 
  Copy,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PostSuggestion {
  platform: string;
  postIdeas: string[];
  hashtags: string[];
  contentType: string;
  toneOfVoice: string;
}

interface PostSuggestionDisplayProps {
  questType: string;
  targetAction: string;
  userId: number;
  platform?: string;
}

export function PostSuggestionDisplay({ 
  questType, 
  targetAction, 
  userId, 
  platform 
}: PostSuggestionDisplayProps) {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<PostSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract platform from targetAction if not provided
  const extractedPlatform = platform || extractPlatformFromAction(targetAction);

  useEffect(() => {
    if (questType === 'social_post' && extractedPlatform && userId) {
      generateSuggestion();
    }
  }, [questType, extractedPlatform, userId, targetAction]);

  const generateSuggestion = async () => {
    if (!extractedPlatform || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/post-suggestions/generate', {
        userId,
        platform: extractedPlatform,
        targetAction
      });

      if ((response as any).success) {
        setSuggestion((response as any).suggestion);
      } else {
        throw new Error((response as any).message || 'Failed to generate suggestion');
      }
    } catch (err) {
      console.error('Error generating post suggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestion');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied`,
      description: 'Copied to clipboard',
    });
  };

  const copyAllHashtags = () => {
    if (suggestion?.hashtags) {
      const hashtagText = suggestion.hashtags.join(' ');
      copyToClipboard(hashtagText, 'Hashtags');
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      linkedin: '💼',
      instagram: '📸',
      twitter: '🐦',
      youtube: '📺',
      facebook: '👥',
      tiktok: '🎵'
    };
    return icons[platform.toLowerCase()] || '📱';
  };

  if (questType !== 'social_post') {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-3 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Share2 className="w-4 h-4" />
          <span>Loading post suggestions...</span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full bg-white/10" />
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-12 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-200">
            <span>⚠️</span>
            <span>AI suggestions temporarily unavailable</span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={generateSuggestion}
            className="h-6 px-2 text-xs text-amber-200 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        </div>
        <p className="text-xs text-amber-200/70 mt-1">💡 <strong>Use Musk's Tip above</strong> to create your post. AI suggestions will be back soon!</p>
      </div>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <div className="mt-3 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="text-lg">{getPlatformIcon(extractedPlatform)}</span>
          <span>AI-Generated {extractedPlatform} Suggestions</span>
        </div>
        <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-xs">
          {suggestion.contentType} • {suggestion.toneOfVoice}
        </Badge>
      </div>

      {/* Post Ideas */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>Post Ideas</span>
        </div>
        <div className="space-y-1">
          {suggestion.postIdeas.slice(0, 3).map((idea, index) => (
            <div 
              key={index} 
              className="bg-white/5 p-2 rounded text-sm text-white/80 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => copyToClipboard(idea, 'Post idea')}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-white/60 mt-0.5">{index + 1}.</span>
                <span className="flex-1">{idea}</span>
                <Copy className="w-3 h-3 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtags */}
      {suggestion.hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white/90">
              <Hash className="w-4 h-4 text-blue-400" />
              <span>Hashtags</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={copyAllHashtags}
              className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
            >
              Copy All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestion.hashtags.slice(0, 8).map((hashtag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 cursor-pointer text-xs"
                onClick={() => copyToClipboard(hashtag, 'Hashtag')}
              >
                {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
              </Badge>
            ))}
          </div>
        </div>
      )}


      {/* Refresh Button */}
      <div className="pt-2 border-t border-white/10">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={generateSuggestion}
          disabled={loading}
          className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Generate New Suggestions
        </Button>
      </div>
    </div>
  );
}

function extractPlatformFromAction(targetAction: string): string {
  const platformMap: { [key: string]: string } = {
    'post_linkedin_suggestion': 'linkedin',
    'post_instagram_suggestion': 'instagram', 
    'post_twitter_suggestion': 'twitter',
    'post_youtube_suggestion': 'youtube',
    'post_facebook_suggestion': 'facebook',
    'post_tiktok_suggestion': 'tiktok',
    'post_multi_platform_suggestion': 'linkedin', // Default to LinkedIn for multi-platform
    'post_hashtag_optimized_suggestion': 'linkedin',
    'post_visual_content_suggestion': 'instagram',
    'post_engagement_optimized_suggestion': 'linkedin'
  };
  
  return platformMap[targetAction] || 'linkedin';
}