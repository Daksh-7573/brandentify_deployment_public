import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/simple-auth-context';
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
import { QuestCardSkeleton } from '@/components/ui/skeleton-components';
import { NeoGlassLayout } from '@/components/layout/neo-glass-layout';
import { NeoGlassSection } from '@/components/ui/neo-glass/index';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

export default function BrandQuestsPage() {
  console.log('💫💫💫 BRAND QUESTS PAGE TIMESTAMP: ' + Date.now() + ' 💫💫💫');
  console.log('🎉 TABS SHOULD BE VISIBLE NOW! 🎉');
  console.log('🔥🔥🔥 BRAND QUESTS PAGE COMPONENT LOADING 🔥🔥🔥');
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
    <div 
      className="fixed inset-0 w-full h-full responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Glass UI overlay to maintain design consistency - Modal Screen Effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full h-full overflow-auto">
        <Header />
        <NeoGlassLayout className="mt-3 mx-3 sm:mx-6">
        <div className="flex-1 max-w-4xl">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main content - Quests */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Quests Panel */}
              <NeoGlassSection>
              {/* SIMPLE GUARANTEED WORKING TABS - MUST BE VISIBLE! */}
              <Tabs defaultValue="brand-quests" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 bg-white/20 border-2 border-yellow-400 p-2 rounded-lg">
                  <TabsTrigger value="brand-quests" className="bg-blue-600 text-white p-3 rounded font-bold">
                    Brand Quests
                  </TabsTrigger>
                  <TabsTrigger value="social-quests" className="bg-green-600 text-white p-3 rounded font-bold">
                    🔥 Social Quests 🔥
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="brand-quests">
                  <QuestPanel userId={userId} />
                </TabsContent>

                <TabsContent value="social-quests" className="min-h-[400px]">
                  <div className="bg-red-100 border-4 border-red-500 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 mb-6">🎯 SOCIAL QUEST TABS - YOU SHOULD SEE 3 TABS BELOW! 🎯</h2>
                    
                    {/* SUPER SIMPLE SUB-TABS - GUARANTEED VISIBLE */}
                    <Tabs defaultValue="weekly" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-6 bg-yellow-300 border-4 border-orange-500 p-3 rounded-lg">
                        <TabsTrigger value="weekly" className="bg-red-500 text-white p-4 rounded font-bold text-lg">
                          📅 Weekly
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="bg-green-500 text-white p-4 rounded font-bold text-lg">
                          ✅ Completed
                        </TabsTrigger>
                        <TabsTrigger value="missed" className="bg-gray-500 text-white p-4 rounded font-bold text-lg">
                          ❌ Missed
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="weekly">
                        <div className="p-8 bg-blue-100 border-4 border-blue-500 rounded-lg">
                          <h3 className="text-blue-800 text-2xl font-bold mb-4">📅 WEEKLY SOCIAL QUESTS</h3>
                          <p className="text-blue-700 text-lg">Current week's social media tasks appear here.</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="completed">
                        <div className="p-8 bg-green-100 border-4 border-green-500 rounded-lg">
                          <h3 className="text-green-800 text-2xl font-bold mb-4">✅ COMPLETED SOCIAL QUESTS</h3>
                          <p className="text-green-700 text-lg">Finished social quests appear here.</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="missed">
                        <div className="p-8 bg-gray-100 border-4 border-gray-500 rounded-lg">
                          <h3 className="text-gray-800 text-2xl font-bold mb-4">❌ MISSED SOCIAL QUESTS</h3>
                          <p className="text-gray-700 text-lg">Expired social quests appear here.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
              </NeoGlassSection>
            </div>
            
            {/* Sidebar - Badges */}
            <div className="order-1 lg:order-2">
              <NeoGlassSection>
                <BadgeDisplay userId={userId} />
              </NeoGlassSection>
            </div>
          </div>
        </div>
      </NeoGlassLayout>
      </div>
    </div>
  );
}