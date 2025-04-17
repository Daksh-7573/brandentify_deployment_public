import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MuskMatch } from '@/types/musk-match';
import MuskMatchCard from '@/components/musk/musk-match-card';
import { 
  UserPlus, 
  RefreshCw, 
  X, 
  User, 
  BellRing, 
  History, 
  Loader2 
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

interface MuskMatchContainerProps {
  userId: number;
  limit?: number;
}

export default function MuskMatchContainer({ userId, limit = 5 }: MuskMatchContainerProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();
  
  // Fetch all matches for the user
  const { 
    data: allMatches = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['/api/musk-matches/user', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/musk-matches/user', { userId });
      return await response.json() as MuskMatch[];
    },
  });
  
  // Mutation for generating new matches
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/musk-matches/user/${userId}/generate`, { limit });
      return await response.json() as MuskMatch[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/musk-matches/user', userId] });
      toast({
        title: "New matches generated",
        description: "Musk AI has found new professional connections for you.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate matches",
        description: "There was an error generating new matches. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Filter matches based on active tab
  const pendingMatches = allMatches.filter(match => !match.isDismissed && !match.isConnected);
  const connectedMatches = allMatches.filter(match => match.isConnected);
  const dismissedMatches = allMatches.filter(match => match.isDismissed && !match.isConnected);
  
  // Get the active matches based on selected tab
  const getActiveMatches = () => {
    switch (activeTab) {
      case 'pending':
        return pendingMatches;
      case 'connected':
        return connectedMatches;
      case 'dismissed':
        return dismissedMatches;
      default:
        return pendingMatches;
    }
  };
  
  const activeMatches = getActiveMatches();
  
  // Handle refresh - generate new matches
  const handleRefresh = () => {
    generateMutation.mutate();
  };
  
  return (
    <Card className="shadow-lg border border-border w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-primary" />
            Musk Match Suggestions
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={generateMutation.isPending || isLoading}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          AI-powered connection suggestions based on your career goals
        </p>
      </CardHeader>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">
              <BellRing className="h-4 w-4 mr-1" />
              Pending <span className="ml-1 text-xs bg-primary/10 rounded-full px-1.5 py-0.5">{pendingMatches.length}</span>
            </TabsTrigger>
            <TabsTrigger value="connected" className="flex-1">
              <User className="h-4 w-4 mr-1" />
              Connected <span className="ml-1 text-xs bg-primary/10 rounded-full px-1.5 py-0.5">{connectedMatches.length}</span>
            </TabsTrigger>
            <TabsTrigger value="dismissed" className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Dismissed <span className="ml-1 text-xs bg-primary/10 rounded-full px-1.5 py-0.5">{dismissedMatches.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Separator className="my-2" />
        
        <CardContent>
          <TabsContent value="pending" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : pendingMatches.length > 0 ? (
              <AnimatePresence>
                {pendingMatches.map(match => (
                  <MuskMatchCard 
                    key={match.id} 
                    match={match} 
                    onAction={refetch}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No pending match suggestions.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleRefresh}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Generate Suggestions
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="connected" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : connectedMatches.length > 0 ? (
              <AnimatePresence>
                {connectedMatches.map(match => (
                  <MuskMatchCard 
                    key={match.id} 
                    match={match} 
                    onAction={refetch}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No connected matches yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dismissed" className="mt-0 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : dismissedMatches.length > 0 ? (
              <AnimatePresence>
                {dismissedMatches.map(match => (
                  <MuskMatchCard 
                    key={match.id} 
                    match={match} 
                    onAction={refetch}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No dismissed matches.</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}