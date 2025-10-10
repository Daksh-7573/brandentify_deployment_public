import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/context/simple-auth-context';
import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

export function BrandGoalsSelector() {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { toast } = useToast();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Fetch existing brand goals
  const { data: existingGoals, isLoading } = useQuery({
    queryKey: ['/api/brand-goals', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/brand-goals/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.selectedGoals) {
        setSelectedGoals(data.selectedGoals);
      }
    }
  });

  // Don't render until user is loaded
  if (!userId) {
    return (
      <div className="p-6 text-center text-white/60">
        Loading...
      </div>
    );
  }

  // Save brand goals mutation
  const saveGoalsMutation = useMutation({
    mutationFn: async (goals: string[]) => {
      const payload = { 
        userId: user?.id, 
        selectedGoals: goals 
      };
      console.log('[BrandGoalsSelector] Saving with payload:', payload);
      
      return apiRequest({
        url: '/api/brand-goals',
        method: 'POST',
        data: payload
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-goals', userId] });
      toast({
        title: "Goals saved!",
        description: "✅ Your daily quests will now adapt to match your focus.",
      });
    },
    onError: (error) => {
      console.error('[BrandGoalsSelector] Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save goals. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleSave = () => {
    saveGoalsMutation.mutate(selectedGoals);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-white/60">
        Loading your brand goals...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">🎯 Choose Your Brand Goals</h2>
        <p className="text-white/70">
          Select up to 3 goals that match what you want to achieve right now. Your daily Brand Quests will be personalized based on these goals.
        </p>
        <div className="text-sm text-white/60">
          {selectedGoals.length}/3 selected
        </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {Object.entries(BRAND_GOALS).map(([key, category]) => (
          <AccordionItem key={key} value={key} className="border border-white/10 rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-white/5">
              <div className="flex flex-col items-start text-left">
                <div className="text-lg font-semibold text-white">{category.title}</div>
                <div className="text-sm text-white/60">{category.description}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 mt-2">
                {category.goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  const isDisabled = !isSelected && selectedGoals.length >= 3;
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => !isDisabled && toggleGoal(goal.id)}
                      disabled={isDisabled}
                      data-testid={`goal-${goal.id}`}
                      className={`
                        w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all
                        ${isSelected 
                          ? 'bg-blue-500/20 border-2 border-blue-500' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-blue-500' : 'border border-white/30'}
                      `}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-white text-sm">{goal.text}</span>
                    </button>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={selectedGoals.length === 0 || saveGoalsMutation.isPending}
          data-testid="button-save-goals"
          className={`
            ${selectedGoals.length > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600'}
            text-white px-6 py-2 rounded-lg font-semibold transition-colors
          `}
        >
          {saveGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
        </Button>
      </div>
    </div>
  );
}
