import { useQuery } from '@tanstack/react-query';
import { InstantQuestCard } from './instant-quest-card';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InstantQuestPanelProps {
  userId: number;
}

export function InstantQuestPanel({ userId }: InstantQuestPanelProps) {
  const { data: instantQuests, isLoading, error } = useQuery({
    queryKey: ['/api/instant-quests/pending', userId],
    queryFn: async () => {
      const response = await fetch(`/api/instant-quests/pending/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch instant quests');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute to catch new trends
  });

  if (isLoading) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-md border border-white/10">
        <div className="flex items-center justify-center gap-3 text-white/60">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading trending opportunities...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 bg-red-500/10 backdrop-blur-md border border-red-500/20">
        <p className="text-red-400 text-center">
          Failed to load instant quests. Please try again later.
        </p>
      </Card>
    );
  }

  if (!instantQuests || instantQuests.length === 0) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-md border border-white/10">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Trending Opportunities</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            We're monitoring industry trends. When relevant opportunities arise, they'll appear here instantly.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Trending Opportunities</h2>
          <p className="text-sm text-white/60">
            {instantQuests.length} {instantQuests.length === 1 ? 'opportunity' : 'opportunities'} matched to your interests
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {instantQuests.map((quest: any) => (
          <InstantQuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
}
