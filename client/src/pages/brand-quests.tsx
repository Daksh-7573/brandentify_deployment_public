import { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestCardSkeleton } from '@/components/ui/skeleton-components';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { BrandQuestsSEO } from '@/components/seo/brand-quests-seo';
import { BrandQuestsStructuredData } from '@/components/seo/brand-quests-structured-data';
import { BrandQuestsFAQSection } from '@/components/seo/brand-quests-faq';

export default function BrandQuestsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const { toast } = useToast();
  
  // CRITICAL FIX: Don't use fallback user ID - require authentication
  const userId = user?.id;
  
  // Debug logging for authentication state
  console.log(`[BRAND QUESTS PAGE] Component rendered:`, {
    userId: user?.id,
    authenticated: isAuthenticated,
    authLoading,
    timestamp: new Date().toISOString()
  });
  
  const { data: userXp, isLoading: isLoadingXp } = useUserXp(userId);
  
  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="w-full min-h-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Brand Quests</h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">Loading your quests...</p>
          </div>
          <QuestCardSkeleton />
          <QuestCardSkeleton />
          <QuestCardSkeleton />
        </div>
      </div>
    );
  }
  
  // Require authentication to view quests
  if (!isAuthenticated || !userId) {
    return (
      <div className="w-full min-h-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <Shield className="text-white/70" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access your Brand Quests</p>
          <Button
            onClick={() => window.location.href = '/auth'}
            className="neo-glass-button px-6 py-3"
            style={{ borderRadius: '5px' }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <BrandQuestsSEO />
      <BrandQuestsStructuredData />
      <div className="w-full min-h-full text-white selection:bg-white/20 font-['Outfit'] relative flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl">
          {/* Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Brand Quests</h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
              Complete quests to earn XP and badges for your professional growth
            </p>
          </motion.div>

          {/* XP Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-1">Your Brand Growth</h2>
              <p className="text-gray-400 text-sm">Track your professional development progress</p>
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
              <div className="text-center py-4 text-gray-400 text-sm">
                No XP data available
              </div>
            )}
          </motion.div>

          {/* Quests & Goals Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="quests" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl mb-8 p-1.5 h-14">
                <TabsTrigger 
                  value="quests"
                  className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all"
                >
                  Brand Quests
                </TabsTrigger>
                <TabsTrigger 
                  value="goals"
                  className="rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-white/5 h-full font-bold text-gray-400 transition-all"
                >
                  Brand Goals
                </TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="mt-0">
                <BrandGoalsSelector />
              </TabsContent>

              <TabsContent value="quests" className="mt-0 space-y-6">
                {/* Main content - Quests */}
                <QuestPanel userId={userId} />
                
                {/* Badges Section - Now at bottom */}
                <BadgeDisplay userId={userId} />
              </TabsContent>
            </Tabs>
            
            {/* FAQ Section for AEO (Answer Engine Optimization) */}
            <BrandQuestsFAQSection />
          </motion.div>
        </div>
      </div>
    </>
  );
}