import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { QuestPanel } from '@/components/brand-quests/quest-panel';
import { BadgeDisplay } from '@/components/brand-quests/badge-display';
import { XpProgressBar } from '@/components/brand-quests/xp-progress-bar';
import { NowboardSuggestions } from '@/components/brand-quests/nowboard-suggestions';
import { useToast } from '@/hooks/use-toast';
import { 
  useUserXp,
  useXpTransactions
} from '@/hooks/use-career-quests'; // Will keep using the same hooks for now
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
  const userId = user?.id;
  
  const { data: userXp, isLoading: isLoadingXp } = useUserXp(userId as number);
  const { data: xpTransactions, isLoading: isLoadingTransactions } = useXpTransactions(userId as number);
  
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
            
            {/* Nowboard Suggestions */}
            <NowboardSuggestions 
              userId={userId} 
              questType="engagement"
            />
            
            {/* XP Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>XP Activity</CardTitle>
                <CardDescription>Your recent XP earnings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-full h-[25px]" />
                    ))}
                  </div>
                ) : !xpTransactions || xpTransactions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No XP activity yet. Complete quests to earn XP!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {xpTransactions.slice(0, 10).map(transaction => (
                      <div 
                        key={transaction.id} 
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <div>
                          <div className="font-medium text-sm">{transaction.reason}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()} at {' '}
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-yellow-500 dark:text-yellow-400 font-bold">
                          +{transaction.amount} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}