import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/context/simple-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Plus, X, Edit2 } from 'lucide-react';
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
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Fetch existing brand goals
  const { data: existingGoals, isLoading } = useQuery({
    queryKey: ['/api/brand-goals', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/brand-goals/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      return response.json();
    }
  });

  // Update selectedGoals and customGoals when data is fetched
  useEffect(() => {
    if (existingGoals?.selectedGoals) {
      setSelectedGoals(existingGoals.selectedGoals);
    }
    if (existingGoals?.customGoals) {
      setCustomGoals(existingGoals.customGoals);
    }
  }, [existingGoals]);

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
    mutationFn: async ({ selectedGoals, customGoals }: { selectedGoals: string[], customGoals: string[] }) => {
      const payload = { 
        userId: user?.id, 
        selectedGoals,
        customGoals
      };
      console.log('[BrandGoalsSelector] Saving with payload:', payload);
      
      return apiRequest('POST', '/api/brand-goals', payload);
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

  const totalSelected = selectedGoals.length + customGoals.length;

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else if (totalSelected < 3) {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleAddCustomGoal = () => {
    const trimmed = customGoalInput.trim();
    
    if (!trimmed) {
      toast({
        title: "Empty goal",
        description: "Please enter a custom goal.",
        variant: "destructive"
      });
      return;
    }
    
    if (totalSelected >= 3) {
      toast({
        title: "Maximum 3 goals",
        description: "Remove a goal to add another.",
        variant: "destructive"
      });
      return;
    }
    
    if (trimmed.length > 200) {
      toast({
        title: "Goal too long",
        description: "Keep it under 200 characters.",
        variant: "destructive"
      });
      return;
    }
    
    setCustomGoals([...customGoals, trimmed]);
    setCustomGoalInput('');
  };

  const handleDeleteCustomGoal = (index: number) => {
    setCustomGoals(customGoals.filter((_, i) => i !== index));
  };

  const handleEditCustomGoal = (index: number) => {
    setEditingIndex(index);
    setEditingText(customGoals[index]);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editingText.trim();
    
    if (!trimmed) {
      toast({
        title: "Empty goal",
        description: "Custom goals cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    if (trimmed.length > 200) {
      toast({
        title: "Goal too long",
        description: "Keep it under 200 characters.",
        variant: "destructive"
      });
      return;
    }
    
    const updated = [...customGoals];
    updated[index] = trimmed;
    setCustomGoals(updated);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleSave = () => {
    saveGoalsMutation.mutate({ selectedGoals, customGoals });
  };

  // Check if current selection differs from saved goals
  const hasChanges = () => {
    const savedGoals = existingGoals?.selectedGoals || [];
    const savedCustom = existingGoals?.customGoals || [];
    
    if (selectedGoals.length !== savedGoals.length) return true;
    if (customGoals.length !== savedCustom.length) return true;
    
    // Sort both arrays and compare
    const sortedCurrent = [...selectedGoals].sort();
    const sortedSaved = [...savedGoals].sort();
    if (sortedCurrent.some((goal, idx) => goal !== sortedSaved[idx])) return true;
    
    // Compare custom goals
    return customGoals.some((goal, idx) => goal !== savedCustom[idx]);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading your brand goals...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">🎯 Choose Your Brand Goals</h2>
        <p className="text-gray-400">
          Select up to 3 goals total (pre-defined + custom). Your daily Brand Quests will be personalized based on these goals.
        </p>
        <div className="text-sm text-gray-400">
          {totalSelected}/3 selected ({selectedGoals.length} pre-defined + {customGoals.length} custom)
        </div>
      </div>

      {/* Section 1: Pre-Defined Goals */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h3 className="text-lg font-semibold text-white">📋 Select from Curated Goals</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <Accordion type="multiple" className="w-full space-y-2">
          {Object.entries(BRAND_GOALS).map(([key, category]) => (
            <AccordionItem key={key} value={key} className="border border-white/10 rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-white/5">
                <div className="flex flex-col items-start text-left">
                  <div className="text-lg font-semibold text-white">{category.title}</div>
                  <div className="text-sm text-gray-400">{category.description}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 mt-2">
                  {category.goals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    const isDisabled = !isSelected && totalSelected >= 3;
                    
                    return (
                      <button
                        key={goal.id}
                        onClick={() => !isDisabled && toggleGoal(goal.id)}
                        disabled={isDisabled}
                        data-testid={`goal-${goal.id}`}
                        className={`
                          w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all
                          ${isSelected 
                            ? 'bg-[rgba(81,69,205,0.2)] border-2 border-[rgba(81,69,205,0.8)]' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                          ${isSelected ? 'bg-[rgba(81,69,205,0.9)]' : 'border border-white/30'}
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
      </div>

      {/* Section 2: Custom Goals */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <h3 className="text-lg font-semibold text-white">✍️ Create Your Own Custom Goal</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="flex gap-2">
          <Input
            value={customGoalInput}
            onChange={(e) => setCustomGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomGoal();
              }
            }}
            placeholder="e.g., Build thought leadership in AI by publishing weekly insights"
            maxLength={200}
            disabled={totalSelected >= 3}
            data-testid="input-custom-goal"
            className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
          />
          <Button
            onClick={handleAddCustomGoal}
            disabled={totalSelected >= 3 || !customGoalInput.trim()}
            data-testid="button-add-custom-goal"
            className="neo-glass-button px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {customGoalInput.length > 0 && (
          <div className="text-xs text-gray-400">
            {customGoalInput.length}/200 characters
          </div>
        )}

        {customGoals.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium text-gray-400">Your Custom Goals:</div>
            {customGoals.map((goal, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3"
                data-testid={`custom-goal-${index}`}
              >
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      maxLength={200}
                      className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-9 sm:h-10 text-sm sm:text-base"
                      data-testid={`input-edit-custom-goal-${index}`}
                    />
                    <Button
                      onClick={() => handleSaveEdit(index)}
                      size="sm"
                      className="neo-glass-button px-3"
                      data-testid={`button-save-edit-${index}`}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="ghost"
                      className="text-white/70 hover:text-white px-3"
                      data-testid={`button-cancel-edit-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-white text-sm">{goal}</span>
                    <Button
                      onClick={() => handleEditCustomGoal(index)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white px-2"
                      data-testid={`button-edit-custom-goal-${index}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCustomGoal(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 px-2"
                      data-testid={`button-delete-custom-goal-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          onClick={handleSave}
          disabled={totalSelected === 0 || saveGoalsMutation.isPending || !hasChanges()}
          data-testid="button-save-goals"
          className={`
            ${totalSelected > 0 && hasChanges() 
              ? 'neo-glass-button' 
              : 'bg-gray-600/50 text-white/50 border border-white/10'
            }
            px-6 py-2.5 rounded-lg font-semibold transition-all
          `}
        >
          {saveGoalsMutation.isPending ? 'Saving...' : hasChanges() ? 'Save My Goals' : 'Saved ✓'}
        </Button>
      </div>
    </div>
  );
}
