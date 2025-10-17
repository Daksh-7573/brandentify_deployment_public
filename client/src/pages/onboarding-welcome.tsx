import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

// Brand Goals - matching exactly from brand-goals-selector.tsx
const BRAND_GOALS = {
  'visibility': {
    title: '🧭 Visibility & Awareness',
    description: 'Grow audience, get discovered',
    goals: [
      { id: 'visibility_1', text: 'Improve visibility on social media networks.' },
      { id: 'visibility_2', text: 'Increase brand recognition among my target audience.' },
      { id: 'visibility_3', text: 'Establish a consistent online presence across platforms.' },
      { id: 'visibility_4', text: 'Appear in search results when people look for my name or expertise.' },
      { id: 'visibility_5', text: 'Grow my follower base with an engaged audience.' }
    ]
  },
  'professional': {
    title: '💼 Professional & Career Growth',
    description: 'Build authority, attract opportunities',
    goals: [
      { id: 'professional_1', text: 'Position myself as an authority in my niche.' },
      { id: 'professional_2', text: 'Attract new business opportunities.' },
      { id: 'professional_3', text: 'Get featured on podcasts or collaborations.' }
    ]
  },
  'engagement': {
    title: '🌐 Engagement & Community',
    description: 'Build and connect with loyal followers',
    goals: [
      { id: 'engagement_1', text: 'Build a loyal community around my brand.' }
    ]
  },
  'monetization': {
    title: '💰 Monetization & Impact',
    description: 'Earn, collaborate, and launch products',
    goals: [
      { id: 'monetization_1', text: 'Attract sponsorships and brand collaborations.' },
      { id: 'monetization_2', text: 'Convert followers into leads or customers.' },
      { id: 'monetization_3', text: 'Launch my own product or service under my name.' }
    ]
  }
};

interface OnboardingWelcomeProps {
  userName?: string;
  onGoalSelected: (goalId: string) => void;
}

export default function OnboardingWelcome({ userName, onGoalSelected }: OnboardingWelcomeProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  const handleContinue = () => {
    if (selectedGoal) {
      onGoalSelected(selectedGoal);
    }
  };

  // Get all goals in a flat array for selection
  const allGoals = Object.values(BRAND_GOALS).flatMap(category => category.goals);

  return (
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full h-full overflow-y-auto flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl my-auto">
          <NeoGlassSection className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-white to-white/60 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-black font-bold text-2xl">B</span>
                </div>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  Brandentifier
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                👋 Welcome{userName ? `, ${userName}` : ''}!
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-2">
                Meet your AI-powered career growth coach
              </p>
              
              <p className="text-white/60 max-w-2xl mx-auto">
                Brandentifier creates personalized Brand Quests to help you build your professional brand. 
                The more we know about you, the better your quests will be.
              </p>
            </div>

            {/* Goal Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2 text-center">
                Quick Question: What's your primary brand goal?
              </h2>
              <p className="text-white/60 text-sm text-center mb-6">
                Choose one goal to help us create your first personalized quests
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Left Column - First 3 categories */}
                <div className="space-y-4">
                  {Object.entries(BRAND_GOALS).slice(0, 3).map(([key, category]) => (
                    <div key={key} className="space-y-2">
                      <div className="text-white/90 font-medium text-sm px-2 flex items-center gap-2">
                        <span>{category.title}</span>
                        <span className="text-white/50 text-xs">• {category.description}</span>
                      </div>
                      <div className="space-y-2">
                        {category.goals.map((goal) => {
                          const isSelected = selectedGoal === goal.id;
                          return (
                            <button
                              key={goal.id}
                              onClick={() => setSelectedGoal(goal.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-white/20 border-white/40 shadow-lg' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                              data-testid={`goal-${goal.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex-shrink-0 ${
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                } transition-opacity`}>
                                  <Check className="h-5 w-5 text-green-400" />
                                </div>
                                <span className="text-white/90 text-sm leading-relaxed">
                                  {goal.text}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column - Monetization & Impact */}
                <div className="space-y-4">
                  {Object.entries(BRAND_GOALS).slice(3, 4).map(([key, category]) => (
                    <div key={key} className="space-y-2">
                      <div className="text-white/90 font-medium text-sm px-2 flex items-center gap-2">
                        <span>{category.title}</span>
                        <span className="text-white/50 text-xs">• {category.description}</span>
                      </div>
                      <div className="space-y-2">
                        {category.goals.map((goal) => {
                          const isSelected = selectedGoal === goal.id;
                          return (
                            <button
                              key={goal.id}
                              onClick={() => setSelectedGoal(goal.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-white/20 border-white/40 shadow-lg' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                              }`}
                              data-testid={`goal-${goal.id}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex-shrink-0 ${
                                  isSelected ? 'opacity-100' : 'opacity-0'
                                } transition-opacity`}>
                                  <Check className="h-5 w-5 text-green-400" />
                                </div>
                                <span className="text-white/90 text-sm leading-relaxed">
                                  {goal.text}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                disabled={!selectedGoal}
                size="lg"
                className={`px-8 py-6 text-lg font-semibold transition-all duration-300 ${
                  selectedGoal 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105' 
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
                data-testid="button-continue-welcome"
              >
                Continue →
              </Button>
            </div>

            {/* Time Indicator */}
            <div className="text-center mt-6 text-white/50 text-sm">
              Step 1 of 3 · Less than 3 minutes to start
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </div>
  );
}
