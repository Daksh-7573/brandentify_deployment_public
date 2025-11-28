import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/simple-auth-context';
import { QuestPanel } from '@/components/brand-quests/quest-panel';
import { BadgeDisplay } from '@/components/brand-quests/badge-display';
import { XpProgressBar } from '@/components/brand-quests/xp-progress-bar';
import { BrandGoalsSelector } from '@/components/brand-quests/brand-goals-selector';
import { ProfileCompletionWidget } from '@/components/brand-quests/profile-completion-widget';
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
import { QuestCardSkeleton } from '@/components/ui/skeleton-components';
import { NeoGlassLayout } from '@/components/layout/neo-glass-layout';
import { NeoGlassSection } from '@/components/ui/neo-glass/index';

export default function BrandQuestsPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  
  // FIXED: Use same logic as header - fallback to demo user if no auth
  const userId = user?.id || 1;
  
  // Debug logging for authentication state
  console.log(`[BRAND QUESTS PAGE DEBUG] Component rendered with user:`, {
    userId: user?.id,
    actualUserId: userId,
    authenticated: !!user,
    timestamp: new Date().toISOString()
  });
  
  const { data: userXp, isLoading: isLoadingXp } = useUserXp(userId);
  
  return (
    <NeoGlassLayout className="mt-3 mx-3 sm:mx-6 w-full pt-16">
      <div className="flex-1 max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Brand Quests</h1>
              <p className="text-white/80 mt-1 text-sm sm:text-base">
                Complete quests to earn XP and badges for your professional growth
              </p>
            </div>
          </div>

          <NeoGlassSection className="mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Your Brand Growth</h2>
              <p className="text-white/70 text-xs sm:text-sm">Track your professional development progress</p>
            </div>
            {isLoadingXp ? (
              <QuestCardSkeleton />
            ) : userXp ? (
              <XpProgressBar 
                balance={userXp.balance || 0}
                monthlyEarned={userXp.currentMonthEarned || 0}
                lifetimeEarned={userXp.lifetimeEarned || 0}
              />
            ) : (
              <div className="text-center py-3 sm:py-4 text-white/60 text-sm">
                No XP data available
              </div>
            )}
          </NeoGlassSection>

          <NeoGlassSection>
            <Tabs defaultValue="quests" className="w-full">
              <TabsList className="grid w-full grid-cols-2 dark-tabs-list border border-white/5 mb-6">
                <TabsTrigger 
                  value="quests"
                  className="dark-tabs-trigger"
                >
                  Brand Quests
                </TabsTrigger>
                <TabsTrigger 
                  value="goals"
                  className="dark-tabs-trigger"
                >
                  Brand Goals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="mt-0">
                <BrandGoalsSelector />
              </TabsContent>

              <TabsContent value="quests" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                  {/* Main content - Quests */}
                  <div className="lg:col-span-2 order-2 lg:order-1">
                    <QuestPanel userId={userId} />
                  </div>
                  
                  {/* Sidebar - Badges */}
                  <div className="order-1 lg:order-2">
                    <BadgeDisplay userId={userId} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </NeoGlassSection>
      </div>
    </NeoGlassLayout>
  );
}