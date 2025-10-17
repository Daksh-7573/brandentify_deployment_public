import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Users, DollarSign, Check } from 'lucide-react';

const BRAND_GOAL_CATEGORIES = [
  {
    id: 'visibility',
    icon: Sparkles,
    title: 'Visibility & Awareness',
    description: 'Grow audience, get discovered',
    color: 'from-purple-500 to-pink-500',
    goals: [
      { id: 'visibility_1', text: 'Improve visibility on social media networks' },
      { id: 'visibility_2', text: 'Increase brand recognition among my target audience' },
      { id: 'visibility_3', text: 'Establish a consistent online presence across platforms' },
      { id: 'visibility_4', text: 'Appear in search results when people look for my name or expertise' },
      { id: 'visibility_5', text: 'Grow my follower base with an engaged audience' }
    ]
  },
  {
    id: 'professional',
    icon: Target,
    title: 'Professional & Career Growth',
    description: 'Build authority, attract opportunities',
    color: 'from-blue-500 to-cyan-500',
    goals: [
      { id: 'professional_1', text: 'Position myself as an authority in my niche' },
      { id: 'professional_2', text: 'Attract new business opportunities' },
      { id: 'professional_3', text: 'Get featured on podcasts or collaborations' }
    ]
  },
  {
    id: 'engagement',
    icon: Users,
    title: 'Engagement & Community',
    description: 'Build and connect with loyal followers',
    color: 'from-green-500 to-emerald-500',
    goals: [
      { id: 'engagement_1', text: 'Build a loyal community around my brand' }
    ]
  },
  {
    id: 'monetization',
    icon: DollarSign,
    title: 'Monetization & Impact',
    description: 'Earn, collaborate, and launch products',
    color: 'from-yellow-500 to-orange-500',
    goals: [
      { id: 'monetization_1', text: 'Attract sponsorships and brand collaborations' },
      { id: 'monetization_2', text: 'Convert followers into leads or customers' },
      { id: 'monetization_3', text: 'Launch my own product or service under my name' }
    ]
  }
];

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: (selectedGoal: string) => void;
}

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      onComplete(selectedGoal);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-800/95 border border-white/20 backdrop-blur-xl" data-testid="welcome-modal">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent" data-testid="welcome-modal-title">
            Welcome to Brandentifier! 🎉
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-300 mt-2" data-testid="welcome-modal-description">
            Let's start by choosing your primary brand goal. This will help us create personalized quests just for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <p className="text-sm text-gray-400 text-center">Select 1 primary goal to focus on:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BRAND_GOAL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{category.title}</h3>
                      <p className="text-xs text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pl-2">
                    {category.goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedGoal === goal.id
                            ? 'bg-white/20 border-2 border-blue-400'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        data-testid={`goal-option-${goal.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-gray-200 flex-1">{goal.text}</span>
                          {selectedGoal === goal.id && (
                            <Check className="h-5 w-5 text-blue-400 flex-shrink-0" data-testid="check-icon" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8"
            data-testid="button-continue"
          >
            Continue to Profile Setup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
