import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserBadge, getBadgeLabel, BadgeType, getBadgeDescription } from '@/types/career-quest';
import { useUserBadges } from '@/hooks/use-career-quests';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  userId: number;
  limit?: number;
  compact?: boolean;
  className?: string;
}

// Define badge icons and colors
const BADGE_ICONS: Record<BadgeType, string> = {
  quest_initiate: '🚀',
  weekly_hustler: '⏱️',
  musk_learner: '🧠',
  thought_leader: '💭',
  portfolio_star: '⭐',
  visibility_boosted: '👁️'
};

const BADGE_COLORS: Record<BadgeType, string> = {
  quest_initiate: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
  weekly_hustler: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
  musk_learner: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300',
  thought_leader: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300',
  portfolio_star: 'bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-300',
  visibility_boosted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-300'
};

export function BadgeDisplay({ userId, limit, compact = false, className }: BadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  
  const {
    data: badges,
    isLoading
  } = useUserBadges(userId);
  
  const displayBadges = limit && badges ? badges.slice(0, limit) : badges;
  
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {compact ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-14 h-14 rounded-full" />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements you've unlocked</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-full" />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  if (!badges || badges.length === 0) {
    if (compact) return null;
    
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Complete quests to earn badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            You haven't earned any badges yet. Complete quests to earn badges!
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleBadgeClick = (badge: UserBadge) => {
    setSelectedBadge(badge);
  };
  
  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {displayBadges.map(badge => (
          <Dialog key={badge.id}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn("w-14 h-14 rounded-full flex items-center justify-center text-2xl p-0", 
                  BADGE_COLORS[badge.badgeType])}
                onClick={() => handleBadgeClick(badge)}
              >
                {BADGE_ICONS[badge.badgeType]}
              </Button>
            </DialogTrigger>
            <BadgeDialogContent badge={badge} />
          </Dialog>
        ))}
      </div>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Your Badges</CardTitle>
        <CardDescription>Achievements you've unlocked</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {displayBadges.map(badge => (
            <Dialog key={badge.id}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn("w-20 h-20 rounded-full flex flex-col items-center justify-center p-0", 
                    BADGE_COLORS[badge.badgeType])}
                  onClick={() => handleBadgeClick(badge)}
                >
                  <span className="text-2xl mb-1">{BADGE_ICONS[badge.badgeType]}</span>
                  <span className="text-xs font-medium">{getBadgeLabel(badge.badgeType)}</span>
                </Button>
              </DialogTrigger>
              <BadgeDialogContent badge={badge} />
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeDialogContent({ badge }: { badge: UserBadge }) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{BADGE_ICONS[badge.badgeType]}</span>
            <span>{getBadgeLabel(badge.badgeType)}</span>
          </div>
        </DialogTitle>
        <DialogDescription>
          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <p>{getBadgeDescription(badge.badgeType)}</p>
        
        <div className="flex justify-center py-4">
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-4xl", 
            BADGE_COLORS[badge.badgeType])}>
            {BADGE_ICONS[badge.badgeType]}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="secondary">Close</Button>
      </DialogFooter>
    </DialogContent>
  );
}