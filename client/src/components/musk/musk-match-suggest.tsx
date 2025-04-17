import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { UserData } from '@/types/user';
import { 
  generateMuskMatchMessage, 
  getMuskMatchSuggestions, 
  shouldShowMuskMatch 
} from '@/services/match-suggestions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  X, 
  Lightning, 
  ArrowRight,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Local storage key for tracking when matches were last shown
const LAST_MATCH_SHOWN_KEY = 'musk_match_last_shown';
const DISMISSED_MATCHES_KEY = 'musk_match_dismissed';

interface MuskMatchSuggestProps {
  currentUser: UserData;
  allUsers: UserData[];
  onDismiss?: () => void;
  compact?: boolean; // For compact display in sidebar/chat
}

const MuskMatchSuggest: React.FC<MuskMatchSuggestProps> = ({ 
  currentUser, 
  allUsers,
  onDismiss,
  compact = false
}) => {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if we should show recommendations
    const lastShown = localStorage.getItem(LAST_MATCH_SHOWN_KEY);
    
    if (!shouldShowMuskMatch(lastShown)) {
      return;
    }
    
    // Get previously dismissed match IDs
    const dismissedMatches = JSON.parse(localStorage.getItem(DISMISSED_MATCHES_KEY) || '[]');
    
    // Find matches for the current user
    const matches = getMuskMatchSuggestions(currentUser, allUsers);
    
    // Filter out previously dismissed matches
    const validMatches = matches.filter(match => 
      !dismissedMatches.includes(match.user.id)
    );
    
    if (validMatches.length > 0) {
      // Select a random match from top results
      const match = validMatches[Math.floor(Math.random() * Math.min(validMatches.length, 3))];
      setSelectedMatch(match);
      setMatchMessage(generateMuskMatchMessage(currentUser, match));
      setIsVisible(true);
      
      // Update last shown timestamp
      localStorage.setItem(LAST_MATCH_SHOWN_KEY, new Date().toISOString());
    }
  }, [currentUser, allUsers]);
  
  // Handle dismissing the suggestion
  const handleDismiss = () => {
    setIsVisible(false);
    
    if (selectedMatch) {
      // Add to dismissed matches
      const dismissedMatches = JSON.parse(localStorage.getItem(DISMISSED_MATCHES_KEY) || '[]');
      dismissedMatches.push(selectedMatch.user.id);
      localStorage.setItem(DISMISSED_MATCHES_KEY, JSON.stringify(dismissedMatches));
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // Handle connecting with the suggested user
  const handleConnect = () => {
    // In a real app, this would send a connection request
    toast({
      title: "Connection request sent",
      description: `You've sent a connection request to ${selectedMatch?.user.name}.`,
    });
    
    handleDismiss();
  };
  
  const handleMessage = () => {
    // In a real app, this would open a message composer
    toast({
      title: "Message started",
      description: `You can now send a message to ${selectedMatch?.user.name}.`,
    });
    
    handleDismiss();
  };
  
  // If no match or not visible, don't render anything
  if (!selectedMatch || !isVisible) {
    return null;
  }
  
  // Compact version for sidebar or Musk chat
  if (compact) {
    return (
      <div className="p-3 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 shadow-sm mb-4">
        <div className="flex items-start gap-2">
          <div className="shrink-0">
            <Lightning className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{matchMessage}</p>
            <div className="flex items-center mt-2 space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="h-8 text-xs"
              >
                <Link to={`/profile/${selectedMatch.user.username}`}>
                  View Profile <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss} 
                className="h-8 p-0 w-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Full card version for main content areas
  return (
    <Card className="w-full max-w-md mx-auto shadow-md overflow-hidden border-amber-200 dark:border-amber-900">
      <div className="absolute top-2 right-2">
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-300"></div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightning className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Musk Match</CardTitle>
        </div>
        <CardDescription>
          {matchMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 mt-2">
          <Avatar className="h-16 w-16 border-2 border-amber-100 dark:border-amber-800">
            <AvatarImage 
              src={selectedMatch.user.photoURL || undefined} 
              alt={selectedMatch.user.name || 'User'} 
            />
            <AvatarFallback className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
              {selectedMatch.user.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{selectedMatch.user.name}</h3>
            {selectedMatch.user.title && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {selectedMatch.user.title}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedMatch.user.industry && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {selectedMatch.user.industry}
                </Badge>
              )}
              {selectedMatch.user.lookingFor && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {selectedMatch.user.lookingFor}
                </Badge>
              )}
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs px-1.5 py-0.5">
                {Math.round(selectedMatch.score * 100)}% Match
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          asChild
        >
          <Link to={`/profile/${selectedMatch.user.username}`}>
            <UserCheck className="mr-2 h-4 w-4" />
            View Profile
          </Link>
        </Button>
        <Button 
          variant="outline"
          className="flex-1"
          onClick={handleMessage}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
        <Button 
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          onClick={handleConnect}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MuskMatchSuggest;