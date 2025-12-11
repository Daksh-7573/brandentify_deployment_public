/**
 * Follow as Mentor Button Component
 * Allows users to follow another user as a mentor (with quota limits)
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { UserPlus, UserMinus, Loader2, Users, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FollowMentorButtonProps {
  mentorId: number;
  mentorName?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowMentorButton({
  mentorId,
  mentorName = "this user",
  className = "",
  variant = "default",
  size = "default"
}: FollowMentorButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);

  const currentUserId = user?.id;

  // Check if user is following this mentor
  const { data: followStatus, isLoading: isCheckingFollow } = useQuery({
    queryKey: ['/api/mentor/is-following', currentUserId, mentorId],
    queryFn: async () => {
      if (!currentUserId || currentUserId === mentorId) return { isFollowing: false };
      const response = await fetch(`/api/mentor/is-following/${currentUserId}/${mentorId}`);
      return response.json();
    },
    enabled: !!currentUserId && currentUserId !== mentorId
  });

  // Get mentor quota
  const { data: quotaData } = useQuery({
    queryKey: ['/api/mentor/quota', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;
      const response = await fetch(`/api/mentor/quota/${currentUserId}`);
      return response.json();
    },
    enabled: !!currentUserId
  });

  // Get mentorship details (days remaining, etc.)
  const { data: mentorshipDetails } = useQuery({
    queryKey: ['/api/mentor/details', currentUserId, mentorId],
    queryFn: async () => {
      if (!currentUserId || !followStatus?.isFollowing) return null;
      const response = await fetch(`/api/mentor/details/${currentUserId}/${mentorId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!currentUserId && followStatus?.isFollowing === true
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/mentor/follow', {
        followerId: currentUserId,
        mentorId: mentorId
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Following as Mentor",
        description: data.message || `You are now following ${mentorName} as a mentor. Check your messages!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/is-following', currentUserId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/quota', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/my-mentors', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Could not follow",
        description: error.message || "Failed to follow as mentor. Please try again.",
        variant: "destructive"
      });
      setShowConfirmDialog(false);
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/mentor/unfollow', {
        followerId: currentUserId,
        mentorId: mentorId
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Mentorship Ended",
        description: `You are no longer following ${mentorName} as a mentor.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/is-following', currentUserId, mentorId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/quota', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/mentor/my-mentors', currentUserId] });
      setShowUnfollowDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Could not unfollow",
        description: error.message || "Failed to end mentorship. Please try again.",
        variant: "destructive"
      });
      setShowUnfollowDialog(false);
    }
  });

  // Don't show button if viewing own profile or not logged in
  if (!currentUserId || currentUserId === mentorId) {
    return null;
  }

  const isFollowing = followStatus?.isFollowing;
  const isLoading = isCheckingFollow || followMutation.isPending || unfollowMutation.isPending;
  const daysRemaining = mentorshipDetails?.daysRemaining;

  const handleClick = () => {
    if (isFollowing) {
      setShowUnfollowDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFollowing ? "outline" : variant}
              size={size}
              className={`${className} ${isFollowing ? 'border-green-500 text-green-500 hover:border-red-500 hover:text-red-500' : ''}`}
              onClick={handleClick}
              disabled={isLoading}
              data-testid={isFollowing ? "button-unfollow-mentor" : "button-follow-mentor"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isFollowing ? (
                <UserMinus className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isFollowing ? (
                daysRemaining !== undefined ? `Following (${daysRemaining}d)` : "Following"
              ) : (
                "Follow as Mentor"
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFollowing ? (
              <p>Click to end mentorship. {daysRemaining !== undefined && `${daysRemaining} days remaining.`}</p>
            ) : (
              <p>
                Follow as mentor for 30 days. 
                {quotaData && ` (${quotaData.remaining}/${quotaData.max} slots available)`}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Confirm Follow Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-[rgba(18,18,18,0.95)] backdrop-blur-[15px] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Follow {mentorName} as Mentor?
            </DialogTitle>
            <DialogDescription className="text-white/70">
              When you follow someone as a mentor:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>A chat conversation will open between you</li>
                <li>The mentorship lasts for 30 days</li>
                <li>You'll receive a reminder before it expires</li>
                <li>You can end the mentorship anytime</li>
              </ul>
              {quotaData && (
                <p className="mt-3 text-sm">
                  <Clock className="h-4 w-4 inline mr-1" />
                  You have {quotaData.remaining} of {quotaData.max} mentor slots available.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
            >
              {followMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Follow as Mentor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Unfollow Dialog */}
      <Dialog open={showUnfollowDialog} onOpenChange={setShowUnfollowDialog}>
        <DialogContent className="bg-[rgba(18,18,18,0.95)] backdrop-blur-[15px] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-destructive" />
              End Mentorship with {mentorName}?
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to end this mentorship early?
              {daysRemaining !== undefined && (
                <p className="mt-2">
                  You still have {daysRemaining} days remaining.
                </p>
              )}
              <p className="mt-2">
                Your chat history will remain accessible.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnfollowDialog(false)}>
              Keep Following
            </Button>
            <Button 
              variant="destructive"
              onClick={() => unfollowMutation.mutate()}
              disabled={unfollowMutation.isPending}
            >
              {unfollowMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              End Mentorship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Mentor Follower Count Display
 * Shows how many people follow this user as a mentor
 */
interface MentorFollowerCountProps {
  mentorId: number;
  className?: string;
}

export function MentorFollowerCount({ mentorId, className = "" }: MentorFollowerCountProps) {
  const { data: followerData, isLoading } = useQuery({
    queryKey: ['/api/mentor/follower-count', mentorId],
    queryFn: async () => {
      const response = await fetch(`/api/mentor/follower-count/${mentorId}`);
      return response.json();
    },
    enabled: !!mentorId
  });

  if (isLoading || !followerData || followerData.count === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-sm text-white/70 ${className}`} data-testid="text-mentor-follower-count">
      <Users className="h-4 w-4" />
      <span>{followerData.count} {followerData.count === 1 ? 'mentee' : 'mentees'}</span>
    </div>
  );
}
