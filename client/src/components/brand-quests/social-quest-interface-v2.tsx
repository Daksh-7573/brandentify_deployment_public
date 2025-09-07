import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp } from 'lucide-react';
import { useSocialQuests } from '@/hooks/use-social-quests';

interface SocialQuestInterfaceV2Props {
  userId: number;
}

export function SocialQuestInterfaceV2({ userId }: SocialQuestInterfaceV2Props) {
  console.log("🔥🔥🔥 NEW V2 SOCIAL QUEST INTERFACE MOUNTING! 🔥🔥🔥", { userId });

  const { data: socialQuests = [], isLoading } = useSocialQuests(userId);

  // Filter quests by status for different tabs
  const weeklyQuests = socialQuests.filter(quest => 
    quest.status === 'active' || quest.status === 'pending'
  );
  
  const completedQuests = socialQuests.filter(quest => 
    quest.status === 'completed'
  );
  
  const missedQuests = socialQuests.filter(quest => 
    quest.status === 'missed' || quest.status === 'expired'
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/20 border border-blue-400 p-4 rounded-lg">
          <p className="text-blue-300 font-semibold">🔄 Loading V2 Social Quest Interface...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-3 bg-white/15 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderQuestCard = (quest: any) => (
    <Card key={quest.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/8 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white">
            {quest.platform} Challenge
          </CardTitle>
          <Badge variant={quest.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
            {quest.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-white/80 text-sm mb-3">{quest.description}</p>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Due {new Date(quest.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="bg-green-500/20 border-2 border-green-400 p-6 rounded-lg">
        <h2 className="text-green-300 font-bold text-xl mb-2">
          ✨ SUCCESS! V2 Social Quest Interface Loaded!
        </h2>
        <p className="text-green-200">
          This confirms the new component is working. Found {socialQuests.length} quests for user {userId}.
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-sm">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-white/20">
            Weekly ({weeklyQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white/20">
            Completed ({completedQuests.length})
          </TabsTrigger>
          <TabsTrigger value="missed" className="data-[state=active]:bg-white/20">
            Missed ({missedQuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="text-sm text-white/70 mb-4">
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Weekly social media challenges to boost your professional presence
          </div>
          {weeklyQuests.length > 0 ? (
            <div className="grid gap-4">
              {weeklyQuests.map(renderQuestCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              No weekly quests available. New challenges coming soon!
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-sm text-white/70 mb-4">
            Completed social quests that earned you XP and boosted your brand
          </div>
          {completedQuests.length > 0 ? (
            <div className="grid gap-4">
              {completedQuests.map(renderQuestCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              Complete your first social quest to see it here!
            </div>
          )}
        </TabsContent>

        <TabsContent value="missed" className="space-y-4">
          <div className="text-sm text-white/70 mb-4">
            Missed opportunities - learn and improve for future quests
          </div>
          {missedQuests.length > 0 ? (
            <div className="grid gap-4">
              {missedQuests.map(renderQuestCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              Great job! You haven't missed any quests yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}