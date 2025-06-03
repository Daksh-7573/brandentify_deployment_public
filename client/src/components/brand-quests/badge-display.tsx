import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserBadge, getBadgeLabel, BadgeType, getBadgeDescription } from '@/types/career-quest';
import { useUserBadges } from '@/hooks/use-career-quests';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  userId?: number;
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
  visibility_boosted: '👁️',
  explorer: '🔍',
  opportunist: '💼'
};

const BADGE_COLORS: Record<BadgeType, string> = {
  quest_initiate: 'bg-blue-500/20 text-white border border-blue-500/30 backdrop-blur-sm',
  weekly_hustler: 'bg-green-500/20 text-white border border-green-500/30 backdrop-blur-sm',
  musk_learner: 'bg-purple-500/20 text-white border border-purple-500/30 backdrop-blur-sm',
  thought_leader: 'bg-yellow-500/20 text-white border border-yellow-500/30 backdrop-blur-sm',
  portfolio_star: 'bg-pink-500/20 text-white border border-pink-500/30 backdrop-blur-sm',
  visibility_boosted: 'bg-indigo-500/20 text-white border border-indigo-500/30 backdrop-blur-sm',
  explorer: 'bg-amber-500/20 text-white border border-amber-500/30 backdrop-blur-sm',
  opportunist: 'bg-teal-500/20 text-white border border-teal-500/30 backdrop-blur-sm'
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
              <Skeleton key={i} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Your Badges</h2>
              <p className="text-white/70 text-sm">Achievements you've unlocked</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (!badges || badges.length === 0) {
    if (compact) return null;
    
    return (
      <div className={className}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Your Badges</h2>
          <p className="text-white/70 text-sm">Complete quests to earn badges</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <div className="text-center py-4 text-white/70">
            You haven't earned any badges yet. Complete quests to earn badges!
          </div>
        </div>
      </div>
    );
  }
  
  const handleBadgeClick = (badge: UserBadge) => {
    setSelectedBadge(badge);
  };
  
  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {displayBadges && displayBadges.map(badge => (
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
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Your Badges</h2>
        <p className="text-white/70 text-sm">Achievements you've unlocked</p>
      </div>
      <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-lg p-4">
        <div className="flex flex-wrap gap-3">
          {displayBadges && displayBadges.map(badge => (
            <Dialog key={badge.id}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn("w-20 h-20 rounded-full flex flex-col items-center justify-center p-0 backdrop-blur-sm", 
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
      </div>
    </div>
  );
}

function BadgeDialogContent({ badge }: { badge: UserBadge }) {
  return (
    <DialogContent className="sm:max-w-md bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{BADGE_ICONS[badge.badgeType]}</span>
            <span>{getBadgeLabel(badge.badgeType)}</span>
          </div>
        </DialogTitle>
        <DialogDescription className="text-white/60">
          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <p className="text-white/80">{getBadgeDescription(badge.badgeType)}</p>
        
        <div className="flex justify-center py-4">
          <div className={cn("w-28 h-28 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm", 
            BADGE_COLORS[badge.badgeType])}>
            {BADGE_ICONS[badge.badgeType]}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="ghost" className="bg-white/10 text-white hover:bg-white/20 border border-white/10">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}