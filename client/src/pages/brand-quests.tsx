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
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Brand Quests</h1>
          <p className="text-muted-foreground">Complete quests to earn XP and badges</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Quests */}
          <div className="lg:col-span-2 space-y-6">
            {/* XP Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Brand Growth</CardTitle>
                <CardDescription>Track your professional development</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingXp ? (
                  <Skeleton className="w-full h-[50px]" />
                ) : userXp ? (
                  <XpProgressBar 
                    balance={userXp.balance}
                    monthlyEarned={userXp.currentMonthEarned}
                    lifetimeEarned={userXp.lifetimeEarned}
                  />
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No XP data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quests Panel */}
            <QuestPanel userId={userId} />
          </div>
          
          {/* Sidebar - Badges and transactions */}
          <div className="space-y-6">
            {/* Badges */}
            <BadgeDisplay userId={userId} />
            
            {/* Removed standalone Hashtag Suggestions and Nowboard Suggestions as they're now integrated into quests */}
            
            {/* XP Transactions section removed */}
          </div>
        </div>
      </div>
    </>
  );
}