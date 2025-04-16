import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, BarChart4 } from "lucide-react";

interface PollDisplayProps {
  pulseId: number;
  options: string[];
  userId: string | number;
}

const PollDisplay: React.FC<PollDisplayProps> = ({ 
  pulseId, 
  options, 
  userId 
}) => {
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Get all votes for this poll to calculate percentages
  const { 
    data: allVotes,
    isLoading: votesLoading 
  } = useQuery({
    queryKey: ["/api/pulses", pulseId, "poll-votes"],
    queryFn: () => apiRequest(`/api/pulses/${pulseId}/poll-votes`),
    refetchOnWindowFocus: false
  });
  
  // Check if the user has already voted
  const { 
    data: userVote,
    isLoading: userVoteLoading 
  } = useQuery({
    queryKey: ["/api/poll-votes/user", userId, "pulse", pulseId],
    queryFn: () => apiRequest(`/api/poll-votes/user/${userId}/pulse/${pulseId}`),
    refetchOnWindowFocus: false,
    retry: false,
    // React Query will throw an error for 404s, but we want to handle them
    onError: () => {
      setHasVoted(false);
    },
    onSuccess: (data) => {
      if (data && data.optionIndex !== undefined) {
        setSelectedOption(data.optionIndex);
        setHasVoted(true);
      }
    },
    enabled: !!userId && !!pulseId
  });
  
  // Submit a vote
  const voteMutation = useMutation({
    mutationFn: (voteData: { userId: string | number, pulseId: number, optionIndex: number }) => 
      apiRequest("/api/poll-votes", {
        method: "POST",
        body: JSON.stringify(voteData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pulses", pulseId, "poll-votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/poll-votes/user", userId, "pulse", pulseId] });
      setHasVoted(true);
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive"
      });
    }
  });
  
  // Calculate percentages and total votes
  const calculateResults = () => {
    if (!allVotes || !Array.isArray(allVotes)) return { counts: [], total: 0, percentages: [] };
    
    // Initialize arrays with zeros
    const counts = Array(options.length).fill(0);
    const percentages = Array(options.length).fill(0);
    let total = 0;
    
    // Count votes for each option
    allVotes.forEach((vote: any) => {
      if (vote.optionIndex >= 0 && vote.optionIndex < options.length) {
        counts[vote.optionIndex]++;
        total++;
      }
    });
    
    // Calculate percentages
    if (total > 0) {
      for (let i = 0; i < options.length; i++) {
        percentages[i] = Math.round((counts[i] / total) * 100);
      }
    }
    
    return { counts, total, percentages };
  };
  
  const { counts, total, percentages } = calculateResults();
  
  // Handle vote
  const handleVote = (optionIndex: number) => {
    // If in demo mode, just show a toast
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "In a real account, this would record your vote"
      });
      
      // Still set the UI as if voted
      setSelectedOption(optionIndex);
      setHasVoted(true);
      return;
    }
    
    setSelectedOption(optionIndex);
    
    voteMutation.mutate({
      userId,
      pulseId,
      optionIndex
    });
  };
  
  const isLoading = votesLoading || userVoteLoading;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart4 size={18} />
        <span className="font-medium">Poll</span>
        {hasVoted && (
          <span className="text-xs text-muted-foreground">
            {total} {total === 1 ? 'vote' : 'votes'} total
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const percentage = percentages[index] || 0;
          const voteCount = counts[index] || 0;
          
          return (
            <div key={index} className="space-y-1">
              {hasVoted ? (
                // Results view (after voting)
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {isSelected && <Check size={14} className="text-primary" />}
                      <span className={isSelected ? "font-medium" : ""}>{option}</span>
                    </div>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-6" />
                    {voteCount > 0 && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-white">
                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Voting view (before voting)
                <Button
                  variant={isLoading ? "outline" : "secondary"}
                  className="w-full text-start justify-start h-auto py-2 px-4"
                  disabled={isLoading || voteMutation.isPending}
                  onClick={() => handleVote(index)}
                >
                  {option}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollDisplay;