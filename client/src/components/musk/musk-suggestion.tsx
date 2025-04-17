import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { BrainCircuit, X, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export interface SuggestionTrigger {
  id: string;
  type: 'daily' | 'inactivity' | 'newPulse' | 'newFeature' | 'lowEngagement' | 'projectCompletion' | 'resumeUpdate' | 'goalChange';
  title: string;
  message: string;
  actionLink: string;
  actionText: string;
  priority: number;
  cooldownHours: number;
  relevanceScore?: number;
  expiresAt?: Date;
}

export function MuskSuggestion() {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionTrigger | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Fetch suggestions from the backend
  const { data: suggestions = [] } = useQuery({
    queryKey: ['/api/musk/suggestions'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await apiRequest('GET', '/api/musk/suggestions');
      return response;
    },
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  useEffect(() => {
    // Don't show on auth pages
    if (!isAuthenticated || location === '/' || location === '/auth' || location === '/verify-email') {
      setIsVisible(false);
      return;
    }

    // Logic to select the highest priority suggestion that hasn't been dismissed
    const availableSuggestions = suggestions.filter((s: SuggestionTrigger) => !dismissed.has(s.id));
    
    if (availableSuggestions.length > 0) {
      // Sort by priority (higher number = higher priority)
      const sortedSuggestions = [...availableSuggestions].sort((a, b) => b.priority - a.priority);
      setActiveSuggestion(sortedSuggestions[0]);
      
      // Show suggestion after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setActiveSuggestion(null);
      setIsVisible(false);
    }
  }, [suggestions, isAuthenticated, location, dismissed]);

  const handleDismiss = () => {
    if (activeSuggestion) {
      // Add to dismissed set
      setDismissed(prev => new Set([...prev, activeSuggestion.id]));
      
      // Log dismissal to backend
      apiRequest('POST', '/api/musk/suggestions/dismiss', { 
        suggestionId: activeSuggestion.id 
      });
      
      setIsVisible(false);
    }
  };

  const handleAction = () => {
    if (activeSuggestion) {
      // Log action taken to backend
      apiRequest('POST', '/api/musk/suggestions/action', { 
        suggestionId: activeSuggestion.id 
      });
      
      // Navigate to the action link
      if (activeSuggestion.actionLink.startsWith('/')) {
        setLocation(activeSuggestion.actionLink);
      } else {
        window.open(activeSuggestion.actionLink, '_blank');
      }
      
      // Dismiss after action
      setDismissed(prev => new Set([...prev, activeSuggestion.id]));
      setIsVisible(false);
    }
  };

  // Don't render if not visible or no active suggestion
  if (!isVisible || !activeSuggestion) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-[9998] max-w-[320px] transition-all duration-300 ease-in-out transform">
      <Card className="p-4 border-2 border-purple-400 shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            <span className="font-semibold">Musk</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDismiss}
            className="h-6 w-6 text-white hover:bg-purple-700 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm mb-3">{activeSuggestion.message}</p>
        
        <Button 
          variant="secondary"
          size="sm"
          onClick={handleAction}
          className="w-full bg-white text-purple-700 hover:bg-gray-100 flex items-center justify-center gap-1"
        >
          {activeSuggestion.actionText}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </Card>
    </div>
  );
}