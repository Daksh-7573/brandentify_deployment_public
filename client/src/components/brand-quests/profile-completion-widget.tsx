import { useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { useState } from "react";

interface ProfileCompletionWidgetProps {
  userId: number;
  className?: string;
}

export function ProfileCompletionWidget({ userId, className = "" }: ProfileCompletionWidgetProps) {
  const [_, setLocation] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useContext(AuthContext);

  // Get profile completion from user context
  const profileCompletion = user?.profileCompleted || 0;

  // Don't show if dismissed or profile is complete
  if (isDismissed || profileCompletion >= 80) {
    return null;
  }

  // Determine tier status
  const tier1Complete = profileCompletion >= 40; // Role + Industry
  const tier2Complete = profileCompletion >= 70; // Skills + Services
  const tier3Complete = profileCompletion >= 90; // Projects + Career + Academic

  // Determine next action
  const getNextAction = () => {
    if (!tier1Complete) {
      return {
        tier: "Tier 1",
        action: "Add Role & Industry",
        benefit: "Unlock role-specific quests",
        route: "/onboarding"
      };
    } else if (!tier2Complete) {
      return {
        tier: "Tier 2",
        action: "Add Skills & Services",
        benefit: "Unlock skill-building quests",
        route: "/profile"
      };
    } else {
      return {
        tier: "Tier 3",
        action: "Complete Profile",
        benefit: "Unlock advanced career quests",
        route: "/profile"
      };
    }
  };

  const nextAction = getNextAction();

  return (
    <div className={`neo-glass-panel border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Unlock Better Quests</h3>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white/40 hover:text-white/80 transition-colors"
          data-testid="button-dismiss-widget"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Profile Completion</span>
          <span className="text-white font-medium">{profileCompletion}%</span>
        </div>
        <Progress value={profileCompletion} className="h-2" />
      </div>

      {/* Tier Status */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${tier1Complete ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className={tier1Complete ? 'text-white/90' : 'text-white/50'}>
            Tier 1: Role & Industry {tier1Complete && '✓'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${tier2Complete ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className={tier2Complete ? 'text-white/90' : 'text-white/50'}>
            Tier 2: Skills & Services {tier2Complete && '✓'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${tier3Complete ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className={tier3Complete ? 'text-white/90' : 'text-white/50'}>
            Tier 3: Full Profile {tier3Complete && '✓'}
          </span>
        </div>
      </div>

      {/* Next Action CTA */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2 mb-2">
          <Trophy className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-white/90 font-medium text-sm">{nextAction.action}</div>
            <div className="text-white/60 text-xs mt-0.5">{nextAction.benefit}</div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setLocation(nextAction.route)}
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all"
        data-testid="button-complete-profile"
      >
        {nextAction.action}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>

      <button
        onClick={() => setIsDismissed(true)}
        className="w-full text-center text-white/40 hover:text-white/60 text-xs mt-2 transition-colors"
      >
        Remind me later
      </button>
    </div>
  );
}
