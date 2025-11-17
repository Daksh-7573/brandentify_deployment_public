import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export function PremiumBadge({ 
  size = "md", 
  className,
  showTooltip = true 
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm"
  };

  const badge = (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold",
        "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500",
        "shadow-lg shadow-yellow-500/50",
        "border-2 border-yellow-300/30",
        sizeClasses[size],
        className
      )}
      data-testid="premium-badge"
    >
      <span className="text-white drop-shadow-md" style={{ fontFamily: 'Georgia, serif' }}>
        B
      </span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">Premium Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
