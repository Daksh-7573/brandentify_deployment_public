import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { QuestPanel } from '@/components/brand-quests/quest-panel';
import { BadgeDisplay } from '@/components/brand-quests/badge-display';
import { XpProgressBar } from '@/components/brand-quests/xp-progress-bar';
// Removed HashtagSuggestions and NowboardSuggestions as they're now integrated into quests
// BrandQuestDemo import removed per request
import { useToast } from '@/hooks/use-toast';
import { 
  useUserXp,
  useUserWeeklyQuests,
  getCurrentWeekNumber,
  getCurrentYear
} from '@/hooks/use-career-quests';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { NeoGlassLayout } from '@/components/layout/neo-glass-layout';
import { NeoGlassSection } from '@/components/ui/neo-glass/index';

export default function BrandQuestsPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  
  // Use actual user ID from authentication
  const userId = user?.id;
  
  const { data: userXp, isLoading: isLoadingXp } = useUserXp(userId);
  
  if (!userId) {
    return (
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Brand Quests</h1>
          <p className="text-muted-foreground">Please log in to view your brand quests.</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <NeoGlassLayout className="mt-3 mx-6">
        <div className="flex-1 max-w-4xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Brand Quests</h1>
              <p className="text-white/80 mt-1">
                Complete quests to earn XP and badges for your professional growth
              </p>
            </div>
          </div>

          <NeoGlassSection className="mb-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Your Brand Growth</h2>
              <p className="text-white/70 text-sm">Track your professional development progress</p>
            </div>
            {isLoadingXp ? (
              <Skeleton className="w-full h-[50px] bg-gray-800/60" />
            ) : userXp ? (
              <XpProgressBar 
                balance={userXp.balance || 0}
                monthlyEarned={userXp.currentMonthEarned || 0}
                lifetimeEarned={userXp.lifetimeEarned || 0}
              />
            ) : (
              <div className="text-center py-4 text-white/60">
                No XP data available
              </div>
            )}
          </NeoGlassSection>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content - Quests */}
            <div className="lg:col-span-2">
              {/* Quests Panel */}
              <NeoGlassSection>
                <QuestPanel userId={userId} />
              </NeoGlassSection>
            </div>
            
            {/* Sidebar - Badges */}
            <div>
              <NeoGlassSection>
                <BadgeDisplay userId={userId} />
              </NeoGlassSection>
            </div>
          </div>
        </div>
      </NeoGlassLayout>
    </>
  );
}