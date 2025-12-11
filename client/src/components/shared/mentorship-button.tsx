import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMentorship } from '@/hooks/use-mentorship';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { FaUserGraduate, FaUserCheck, FaTimesCircle, FaRedoAlt, FaComments } from 'react-icons/fa';
import { differenceInDays, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Clock } from 'lucide-react';

interface MentorshipButtonProps {
  userId: number;
  mentorId: number;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  buttonText?: string;
  showIcon?: boolean;
}

export function MentorshipButton({
  userId,
  mentorId,
  className = '',
  variant = 'default',
  size = 'default',
  buttonText = 'Follow as Mentor',
  showIcon = true
}: MentorshipButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Load current user ID from localStorage on client-side
  useEffect(() => {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error("Failed to get current user ID:", error);
    }
  }, []);

  // Use the actually logged-in user ID if available, otherwise fall back to the passed userId
  const actualUserId = currentUserId || userId;
  
  const {
    mentorshipStatus,
    mentorshipStats,
    isLoading,
    isSubmitting,
    canRequestMoreMentors,
    followMentor,
    unfollowMentor,
    renewMentorship
  } = useMentorship(actualUserId, mentorId);

  // Don't show the button if viewing your own profile
  if (actualUserId === mentorId) {
    return null;
  }

  // Calculate remaining days for active mentorships
  const getRemainingDays = () => {
    if (mentorshipStatus?.expiresAt) {
      try {
        const expiryDate = parseISO(mentorshipStatus.expiresAt);
        const today = new Date();
        const days = differenceInDays(expiryDate, today);
        return days >= 0 ? days : 0;
      } catch (error) {
        return mentorshipStatus.daysRemaining || 0;
      }
    }
    return mentorshipStatus?.daysRemaining || 0;
  };
  
  const remainingDays = getRemainingDays();
  const isFollowing = mentorshipStatus?.isFollowing;
  
  // Determine button text and action based on mentorship status
  let actionButtonText = buttonText;
  let actionIcon = showIcon ? <FaUserGraduate className="mr-2" /> : null;
  let currentVariant = variant;
  
  if (isLoading) {
    actionButtonText = "Loading...";
  } else if (isFollowing) {
    actionButtonText = remainingDays > 0 ? `Following (${remainingDays}d)` : "Following";
    actionIcon = showIcon ? <FaUserCheck className="mr-2" /> : null;
    currentVariant = 'secondary';
  }

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={currentVariant}
        size={size}
        onClick={handleButtonClick}
        disabled={isLoading || isSubmitting}
        className={className}
        data-testid={isFollowing ? "button-following-mentor" : "button-follow-mentor"}
      >
        {actionIcon}
        {actionButtonText}
      </Button>

      {/* Mentorship Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[rgba(18,18,18,0.95)] backdrop-blur-[15px] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Mentor Connection
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {isFollowing 
                ? "You are currently following this mentor."
                : "Follow this user as your mentor for personalized guidance."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Active Mentorship (Following) */}
            {isFollowing && (
              <div className="space-y-4">
                <div className="flex items-center text-green-500 font-medium">
                  <FaUserCheck className="mr-2" />
                  Active Mentorship
                </div>
                
                <div className="flex items-center text-sm text-white/70">
                  <Clock className="mr-2 h-4 w-4" />
                  {remainingDays > 0 
                    ? `${remainingDays} days remaining` 
                    : "Expires soon"
                  }
                </div>
                
                <div className="flex items-center text-sm text-white/70">
                  <FaComments className="mr-2" />
                  Chat is available in your messages
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      unfollowMentor();
                      setIsDialogOpen(false);
                    }}
                    disabled={isSubmitting}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <FaTimesCircle className="mr-2" />
                    End Mentorship
                  </Button>
                  
                  {remainingDays <= 7 && (
                    <Button
                      onClick={() => {
                        renewMentorship();
                        setIsDialogOpen(false);
                      }}
                      disabled={isSubmitting}
                    >
                      <FaRedoAlt className="mr-2" />
                      Renew for 30 Days
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}

            {/* New Mentorship (Not Following) */}
            {!isFollowing && (
              <div className="space-y-4">
                <div className="flex items-center font-medium text-white">
                  <FaUserGraduate className="mr-2" />
                  Follow as Mentor
                </div>
                
                <div className="text-sm text-white/70 space-y-2">
                  <p>When you follow someone as a mentor:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>A chat conversation opens between you</li>
                    <li>The mentorship lasts for 30 days</li>
                    <li>You'll receive a reminder before it expires</li>
                    <li>You can end the mentorship anytime</li>
                  </ul>
                </div>

                <div className="flex items-center text-sm text-white/70 mt-2">
                  <Users className="mr-2 h-4 w-4" />
                  {mentorshipStats?.remainingSlots} of {mentorshipStats?.maxMentors} mentor slots available
                </div>

                {!canRequestMoreMentors && (
                  <div className="text-amber-400 text-sm mt-2 p-2 bg-amber-500/10 rounded">
                    You've reached your mentor limit. 
                    {!mentorshipStats?.isPremium && " Upgrade to Premium for more slots."}
                  </div>
                )}
                
                <DialogFooter className="mt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button 
                            onClick={() => {
                              followMentor();
                              setIsDialogOpen(false);
                            }}
                            disabled={isSubmitting || !canRequestMoreMentors}
                            className="w-full"
                          >
                            <FaUserGraduate className="mr-2" />
                            Follow as Mentor
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canRequestMoreMentors && (
                        <TooltipContent>
                          <p>You've reached your mentor limit</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
