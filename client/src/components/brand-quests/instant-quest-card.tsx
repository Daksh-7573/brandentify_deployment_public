import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Clock, TrendingUp, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface InstantQuest {
  id: number;
  userId: number;
  trendTopic: string;
  trendCategory: string;
  relevanceScore: number;
  careerQuestDefinitionId?: number;
  socialQuestDefinitionId?: number;
  trendNarrative: string;
  careerOpportunity?: string;
  socialOpportunity?: string;
  status: 'pending' | 'accepted' | 'dismissed' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  careerQuest?: any;
  socialQuest?: any;
}

interface InstantQuestCardProps {
  quest: InstantQuest;
}

export function InstantQuestCard({ quest }: InstantQuestCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<'career' | 'social' | null>(null);

  const acceptMutation = useMutation({
    mutationFn: async (questType: 'career' | 'social') => {
      return await apiRequest('POST', `/api/instant-quests/${quest.id}/accept`, {
        questType
      });
    },
    onSuccess: (_, questType) => {
      queryClient.invalidateQueries({ queryKey: ['/api/instant-quests/pending'] });
      toast({
        title: 'Trending Quest Accepted!',
        description: `You've accepted the ${questType} quest opportunity`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept quest',
        variant: 'destructive',
      });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/instant-quests/${quest.id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instant-quests/pending'] });
      toast({
        title: 'Quest Dismissed',
        description: 'Opportunity removed from your list',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to dismiss quest',
        variant: 'destructive',
      });
    }
  });

  const handleAccept = (questType: 'career' | 'social') => {
    setSelectedType(questType);
    acceptMutation.mutate(questType);
  };

  const handleDismiss = () => {
    dismissMutation.mutate();
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(quest.expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m remaining`;
    }
    return `${diffMins}m remaining`;
  };

  const relevanceColor = quest.relevanceScore >= 8 ? 'bg-green-500' : 
                         quest.relevanceScore >= 6 ? 'bg-yellow-500' : 
                         'bg-blue-500';

  return (
    <Card className="p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{quest.trendTopic}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs border-white/20">
                {quest.trendCategory}
              </Badge>
              <Badge className={`text-xs ${relevanceColor}`}>
                {quest.relevanceScore}/10 match
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      <p className="text-white/80 mb-4 text-sm leading-relaxed">
        {quest.trendNarrative}
      </p>

      <div className="space-y-3 mb-4">
        {quest.careerOpportunity && quest.careerQuest && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300 mb-1">Career Opportunity</p>
                <p className="text-xs text-white/70">{quest.careerOpportunity}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept('career')}
                disabled={acceptMutation.isPending || selectedType !== null}
                className="text-blue-400 hover:bg-blue-500/20"
                data-testid={`button-accept-career-${quest.id}`}
              >
                {selectedType === 'career' ? <CheckCircle2 className="w-4 h-4" /> : 'Accept'}
              </Button>
            </div>
          </div>
        )}

        {quest.socialOpportunity && quest.socialQuest && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-purple-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-300 mb-1">Social Opportunity</p>
                <p className="text-xs text-white/70">{quest.socialOpportunity}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAccept('social')}
                disabled={acceptMutation.isPending || selectedType !== null}
                className="text-purple-400 hover:bg-purple-500/20"
                data-testid={`button-accept-social-${quest.id}`}
              >
                {selectedType === 'social' ? <CheckCircle2 className="w-4 h-4" /> : 'Accept'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          disabled={dismissMutation.isPending || selectedType !== null}
          className="text-white/40 hover:text-white/60 hover:bg-white/5"
          data-testid={`button-dismiss-${quest.id}`}
        >
          <XCircle className="w-4 h-4 mr-1" />
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
