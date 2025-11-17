import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  title?: string;
  message?: string;
  feature?: string;
  variant?: "card" | "inline" | "modal";
  className?: string;
}

export function UpgradePrompt({
  title = "Upgrade to Premium",
  message = "This feature is only available for Premium members.",
  feature,
  variant = "card",
  className = "",
}: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
  };

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/30 ${className}`}>
        <Crown className="w-5 h-5 text-yellow-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-white/90">
            {feature ? `${feature} is ` : ''}
            <span className="font-semibold text-yellow-400">Premium only</span>
          </p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
          onClick={handleUpgrade}
          data-testid="button-upgrade-inline"
        >
          Upgrade
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`p-8 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-amber-600/10 backdrop-blur-xl border-yellow-400/30 ${className}`} data-testid="card-upgrade-prompt">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            {title}
            <Crown className="w-6 h-6 text-yellow-400" />
          </h3>
          <p className="text-white/70 max-w-md mx-auto">
            {message}
          </p>
          {feature && (
            <p className="text-sm text-yellow-400 font-medium">
              Feature: {feature}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30"
            onClick={handleUpgrade}
            data-testid="button-upgrade-primary"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now - ₹799/month
          </Button>
          <Button
            variant="outline"
            className="border-yellow-400/30 hover:bg-yellow-400/10 text-yellow-400"
            onClick={handleUpgrade}
            data-testid="button-view-plans"
          >
            View All Plans
          </Button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/50">
            ✨ Unlimited features • Priority support • Early access
          </p>
        </div>
      </div>
    </Card>
  );
}
