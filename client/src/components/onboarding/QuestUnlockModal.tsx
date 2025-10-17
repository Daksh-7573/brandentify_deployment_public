import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Target, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface QuestUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestUnlockModal({ isOpen, onClose }: QuestUnlockModalProps) {
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleViewQuests = () => {
    onClose();
    setLocation('/brand-quests');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 border-2 border-blue-500/50 backdrop-blur-xl overflow-hidden"
        data-testid="quest-unlock-modal"
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {showConfetti && (
            <>
              {/* Sparkle effect */}
              <div className="absolute top-0 left-1/4 animate-ping">
                <Sparkles className="h-8 w-8 text-yellow-400 opacity-75" />
              </div>
              <div className="absolute top-10 right-1/4 animate-ping animation-delay-200">
                <Sparkles className="h-6 w-6 text-blue-400 opacity-75" />
              </div>
              <div className="absolute top-5 left-1/2 animate-ping animation-delay-400">
                <Sparkles className="h-10 w-10 text-purple-400 opacity-75" />
              </div>
              <div className="absolute top-20 right-1/3 animate-ping animation-delay-600">
                <Sparkles className="h-7 w-7 text-pink-400 opacity-75" />
              </div>
            </>
          )}
        </div>

        <div className="relative z-10 text-center py-8 space-y-6">
          {/* Trophy icon with animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full">
                <Trophy className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Main message */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse" data-testid="unlock-title">
              🎉 Quests Unlocked!
            </h2>
            <p className="text-xl text-gray-300" data-testid="unlock-description">
              Your profile is ready and your personalized Brand Quests are waiting!
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-sm">Daily Quests</h3>
                  <p className="text-xs text-gray-400">Get 1-4 personalized tasks daily</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-sm">Earn XP & Badges</h3>
                  <p className="text-xs text-gray-400">Track your progress & achievements</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <Button
              onClick={handleViewQuests}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6 group"
              data-testid="button-view-quests"
            >
              View My Quests
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-gray-400 mt-3">Complete quests to build your professional brand!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
