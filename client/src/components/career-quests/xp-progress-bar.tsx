import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface XpProgressBarProps {
  balance: number;
  lifetimeEarned: number;
  className?: string;
}

// Levels are defined as thresholds of XP required
const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
  { level: 6, xp: 1750 },
  { level: 7, xp: 2750 },
  { level: 8, xp: 4000 },
  { level: 9, xp: 5500 },
  { level: 10, xp: 7500 },
  // Add more levels as needed
];

export function XpProgressBar({ balance, lifetimeEarned, className }: XpProgressBarProps) {
  // Find current level and next level
  const currentLevelInfo = LEVELS.find((l, i) => 
    balance >= l.xp && (i === LEVELS.length - 1 || balance < LEVELS[i + 1].xp)
  ) || LEVELS[0];
  
  const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevelInfo.level) + 1;
  const nextLevelInfo = nextLevelIndex < LEVELS.length 
    ? LEVELS[nextLevelIndex] 
    : { level: currentLevelInfo.level + 1, xp: currentLevelInfo.xp * 1.5 };
  
  // Calculate progress to next level
  const xpForCurrentLevel = currentLevelInfo.xp;
  const xpForNextLevel = nextLevelInfo.xp;
  const xpRange = xpForNextLevel - xpForCurrentLevel;
  const progressInCurrentLevel = balance - xpForCurrentLevel;
  const progressPercentage = Math.min(100, Math.floor((progressInCurrentLevel / xpRange) * 100));
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="px-3 py-1.5 font-bold text-md">
                  LVL {currentLevelInfo.level}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your current career level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="text-sm font-medium">
            <span className="text-yellow-500 dark:text-yellow-400">{balance} XP</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{progressInCurrentLevel} / {xpRange} XP to Level {nextLevelInfo.level}</span>
              </TooltipTrigger>
              <TooltipContent className="space-y-2 w-56">
                <p>Lifetime earned: {lifetimeEarned} XP</p>
                <p>Current balance: {balance} XP</p>
                <p>Next level at: {nextLevelInfo.xp} XP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-3"
      />
    </div>
  );
}