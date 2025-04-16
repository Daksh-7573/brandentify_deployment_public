import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PollDisplayProps {
  pulseId: number;
  options: string[];
  userId: string | number;
}

const PollDisplay = ({ pulseId, options, userId }: PollDisplayProps) => {
  const { user, isDemoMode } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Fetch poll votes
  const { data: votes, isLoading: votesLoading } = useQuery({
    queryKey: [`/api/pulses/${pulseId}/poll-votes`],
    queryFn: async () => {
      const response = await apiRequest({ 
        url: `/api/pulses/${pulseId}/poll-votes`,
        method: "GET" 
      });
      return await response.json();
    },
  });
  
  // Check if user has already voted
  const { data: userVote, isLoading: userVoteLoading } = useQuery({
    queryKey: [`/api/poll-votes/user/${userId}/pulse/${pulseId}`],
    queryFn: async () => {
      const response = await apiRequest({ 
        url: `/api/poll-votes/user/${userId}/pulse/${pulseId}`,
        method: "GET" 
      });
      if (response.status === 404) {
        return null;
      }
      return await response.json();
    },
    retry: false
  });
  
  // Submit vote mutation
  const voteMutation = useMutation({
    mutationFn: (option: string) => 
      apiRequest({ 
        url: `/api/pulses/${pulseId}/poll-votes`, 
        method: "POST",
        data: { userId, option }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pulses/${pulseId}/poll-votes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/poll-votes/user/${userId}/pulse/${pulseId}`] });
      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
      });
    }
  });
  
  // Handle vote submission
  const handleVote = () => {
    if (selectedOption) {
      voteMutation.mutate(selectedOption);
    }
  };
  
  // Calculate vote percentages
  const calculatePercentages = () => {
    if (!votes || votes.length === 0) return { percentages: {}, counts: {} };
    
    const totalVotes = votes.length;
    const counts: Record<string, number> = {};
    
    // Count votes for each option
    votes.forEach((vote: any) => {
      counts[vote.option] = (counts[vote.option] || 0) + 1;
    });
    
    // Calculate percentages
    const percentages: Record<string, number> = {};
    
    options.forEach((option) => {
      const count = counts[option] || 0;
      percentages[option] = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    });
    
    return { percentages, counts };
  };
  
  const { percentages, counts } = calculatePercentages();
  const hasVoted = !!userVote;
  const votingDisabled = hasVoted || !selectedOption || voteMutation.isPending;
  
  // Determine which option the user voted for
  const userVotedOption = hasVoted ? userVote.option : null;
  
  if (votesLoading || userVoteLoading) {
    return (
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            {hasVoted 
              ? `Results (${votes?.length || 0} ${votes?.length === 1 ? 'vote' : 'votes'})` 
              : 'Cast your vote'}
          </p>
          
          <div className="space-y-3">
            {options.map((option) => {
              const percentage = percentages?.[option] || 0;
              const count = counts?.[option] || 0;
              const isSelected = selectedOption === option;
              const isUserVote = userVotedOption === option;
              
              return (
                <div key={option} className="relative">
                  <div 
                    className={`
                      relative z-10 p-3 rounded-md border transition-all 
                      ${hasVoted 
                        ? 'cursor-default' 
                        : 'cursor-pointer hover:border-primary/50'}
                      ${isSelected && !hasVoted ? 'border-primary ring-1 ring-primary/20' : 'border-muted'}
                      ${isUserVote ? 'border-primary/60 ring-1 ring-primary/30 bg-primary/5' : ''}
                    `}
                    onClick={() => !hasVoted && setSelectedOption(option)}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {option}
                        {isUserVote && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Your vote
                          </span>
                        )}
                      </div>
                      {hasVoted && (
                        <div className="text-sm font-medium">
                          {percentage}% ({count})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar for results */}
                  {hasVoted && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary/10 rounded-md"
                      style={{ width: `${percentage}%`, maxWidth: '100%' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {!hasVoted && (
            <div className="flex justify-end mt-4">
              <Button 
                size="sm" 
                onClick={handleVote} 
                disabled={votingDisabled}
                className="font-medium"
              >
                {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollDisplay;