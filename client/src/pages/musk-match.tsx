import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus, BrainCircuit, RefreshCw, Loader2 } from 'lucide-react';
import MuskMatchContainer from '@/components/musk/musk-match-container';
import { PageLayout } from '@/components/layout/page-layout';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export default function MuskMatchPage() {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const userId = isDemoMode ? 1 : (user?.id || 0);
  
  // Create demo matches
  const createDemoMatch = async () => {
    try {
      // Use the dedicated demo match generation endpoint
      const response = await apiRequest('POST', '/api/musk-matches/generate-demo', {});
      const result = await response.json();
      
      // Show success message with created profiles
      toast({
        title: "Demo matches created",
        description: `Created demo profiles and matches for the Musk Match feature`,
        duration: 5000
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/musk-matches/user', userId] });
    } catch (error) {
      console.error("Error creating demo matches:", error);
      toast({
        title: "Error creating demo matches",
        description: "There was an error generating demo matches. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <PageLayout
      title="Musk Match"
      description="AI-powered professional connection suggestions"
      icon={<UserPlus className="h-5 w-5 text-primary" />}
    >
      <div className="container mx-auto max-w-6xl py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-md border border-primary/10 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
                Musk Match: AI-Powered Connection Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Musk Match uses AI to analyze your profile and find professionals who complement your skills, 
                experience, and career goals. These connections can help advance your career through mentorship, 
                collaboration, and networking opportunities.
              </p>
              
              {isDemoMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  onClick={createDemoMatch}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Create Demo Match (for testing)
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <Separator />
        
        <MuskMatchContainer userId={userId} limit={5} />
      </div>
    </PageLayout>
  );
}