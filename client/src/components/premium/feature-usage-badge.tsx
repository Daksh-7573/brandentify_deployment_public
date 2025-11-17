import { Crown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureUsageBadgeProps {
  used: number;
  limit: number;
  label: string;
  isPremium?: boolean;
}

export function FeatureUsageBadge({ used, limit, label, isPremium }: FeatureUsageBadgeProps) {
  const percentage = limit === Infinity ? 0 : (used / limit) * 100;
  const isLow = percentage >= 80;
  const isExhausted = used >= limit && limit !== Infinity;

  if (limit === Infinity) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0" data-testid={`badge-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              <Crown className="w-3 h-3 mr-1" />
              Unlimited {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Premium: Unlimited {label.toLowerCase()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isExhausted ? "destructive" : isLow ? "default" : "secondary"}
            className={isExhausted ? "bg-red-500/20 text-red-400 border-red-500/30" : ""}
            data-testid={`badge-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Zap className="w-3 h-3 mr-1" />
            {used}/{limit} {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isExhausted
              ? `You've used all ${limit} ${label.toLowerCase()} this month`
              : `${limit - used} ${label.toLowerCase()} remaining this month`}
          </p>
          {!isPremium && (
            <p className="text-xs text-yellow-400 mt-1">
              ✨ Upgrade to Premium for unlimited access
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
