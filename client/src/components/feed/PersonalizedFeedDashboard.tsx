/**
 * Personalized Feed Dashboard Component
 * 
 * Showcases all 6 personalization features:
 * 1. Followed hashtags feed
 * 2. Mentor/user following feed
 * 3. Similar hashtags recommendations
 * 4. Engagement-based content
 * 5. Industry/domain matching
 * 6. AI-detected interests
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  usePersonalizedFeed, 
  useHashtagFeed, 
  useMentorFeed,
  useTrackEngagement,
  useUserInterests,
  useFollowedHashtags,
  useFollowedUsers,
  useFeedAnalytics,
  useFollowUser,
  useUnfollowUser
} from '@/hooks/feed/use-personalized-feed';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Users, 
  Hash, 
  Brain, 
  UserPlus,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface PulseCardProps {
  pulse: any;
  onEngagement: (pulseId: number, type: string) => void;
}

const PulseCard: React.FC<PulseCardProps> = ({ pulse, onEngagement }) => {
  const handleEngagement = (type: string) => {
    onEngagement(pulse.id, type);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={pulse.photoURL} />
            <AvatarFallback>{pulse.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{pulse.name}</h4>
            <p className="text-xs text-muted-foreground">{pulse.title}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {pulse.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-medium mb-2">{pulse.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {pulse.content}
        </p>
        
        {pulse.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pulse.hashtags.slice(0, 3).map((tag: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {pulse.hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{pulse.hashtags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleEngagement('insightful')}
          >
            <Heart className="h-4 w-4 mr-1" />
            Insightful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleEngagement('comment')}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleEngagement('share')}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PersonalizedFeedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Core feed hooks
  const { data: personalizedFeed, isLoading: feedLoading } = usePersonalizedFeed({
    userId: user?.uid || '',
    limit: 20,
    types: selectedTypes.length > 0 ? selectedTypes : undefined
  });
  
  const { data: hashtagFeed } = useHashtagFeed(user?.uid || '');
  const { data: mentorFeed } = useMentorFeed(user?.uid || '');
  const { data: analytics } = useFeedAnalytics(user?.uid || '');
  
  // User data hooks
  const { data: userInterests } = useUserInterests(user?.uid || '');
  const { data: followedHashtags } = useFollowedHashtags(user?.uid || '');
  const { data: followedUsers } = useFollowedUsers(user?.uid || '');
  
  // Interaction hooks
  const trackEngagement = useTrackEngagement();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const handleEngagement = (pulseId: number, type: string) => {
    if (!user?.uid) return;
    
    trackEngagement.mutate({
      userId: parseInt(user.uid) || 0,
      pulseId,
      engagementType: type,
      weight: type === 'insightful' ? 2.0 : type === 'share' ? 1.5 : 1.0
    });
  };

  const typeFilters = [
    { value: 'Media', label: 'Media', icon: '🖼️' },
    { value: 'Polls', label: 'Polls', icon: '📊' },
    { value: 'Projects', label: 'Projects', icon: '🚀' },
    { value: 'Musk', label: 'Musk AI', icon: '🤖' }
  ];

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <p className="text-muted-foreground">Please sign in to view your personalized feed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Feed Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Items</span>
                  <span className="font-medium">{analytics.totalItems}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Hashtags</span>
                    <span>{analytics.distribution.followedHashtags}%</span>
                  </div>
                  <Progress value={analytics.distribution.followedHashtags} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Mentors</span>
                    <span>{analytics.distribution.mentorPulses}%</span>
                  </div>
                  <Progress value={analytics.distribution.mentorPulses} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>AI Interests</span>
                    <span>{analytics.distribution.aiInterests}%</span>
                  </div>
                  <Progress value={analytics.distribution.aiInterests} className="h-1" />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading analytics...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Followed Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {followedHashtags?.slice(0, 6).map((hashtag: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  #{hashtag.tag}
                </Badge>
              ))}
              {(followedHashtags?.length || 0) > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{followedHashtags.length - 6} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {userInterests?.slice(0, 4).map((interest: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {interest.interest}
                </Badge>
              ))}
              {(userInterests?.length || 0) > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{userInterests.length - 4} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Types</CardTitle>
          <CardDescription className="text-xs">
            Filter your personalized feed by content type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedTypes.includes(filter.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTypeFilter(filter.value)}
                className="h-8"
              >
                <span className="mr-1">{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
            {selectedTypes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTypes([])}
                className="h-8 text-muted-foreground"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            All Sources
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Hashtags
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Personalized Feed</h3>
              <Badge variant="secondary" className="text-xs">
                {personalizedFeed?.totalItems || 0} items
              </Badge>
            </div>
            
            {feedLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <Card key={idx} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-5/6"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : personalizedFeed?.items?.length > 0 ? (
              <div className="space-y-4">
                {personalizedFeed.items.map((pulse: any) => (
                  <PulseCard
                    key={pulse.id}
                    pulse={pulse}
                    onEngagement={handleEngagement}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No personalized content yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow hashtags and users to start building your personalized feed
                  </p>
                  <Button size="sm">Discover Content</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hashtags" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hashtag-Based Feed</h3>
            {hashtagFeed?.length > 0 ? (
              <div className="space-y-4">
                {hashtagFeed.map((pulse: any) => (
                  <PulseCard
                    key={pulse.id}
                    pulse={pulse}
                    onEngagement={handleEngagement}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Follow hashtags to see content from your interests
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mentor Feed</h3>
            {mentorFeed?.length > 0 ? (
              <div className="space-y-4">
                {mentorFeed.map((pulse: any) => (
                  <PulseCard
                    key={pulse.id}
                    pulse={pulse}
                    onEngagement={handleEngagement}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Follow industry mentors to see their latest insights
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trending in Your Industry</h3>
            <Card className="text-center p-8">
              <CardContent>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Industry trending content will appear here
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedFeedDashboard;