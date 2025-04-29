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
import { FaUserGraduate, FaUserCheck, FaUserClock, FaCalendarAlt, FaTimesCircle, FaRedoAlt } from 'react-icons/fa';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  buttonText = 'Request Mentorship',
  showIcon = true
}: MentorshipButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Load current user ID from localStorage on client-side
  useEffect(() => {
    // Try to get current user ID from localStorage
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
    canAcceptMoreMentees,
    requestMentorship,
    acceptMentorship,
    declineMentorship,
    cancelMentorship,
    renewMentorship
  } = useMentorship(actualUserId, mentorId);

  // Don't show the button if viewing your own profile
  if (actualUserId === mentorId) {
    return null;
  }

  // Calculate remaining days for active mentorships
  const getRemainingDays = () => {
    if (mentorshipStatus?.endDate) {
      try {
        const endDate = parseISO(mentorshipStatus.endDate);
        const today = new Date();
        const days = differenceInDays(endDate, today);
        return days >= 0 ? days : 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  };
  
  const remainingDays = getRemainingDays();
  
  // Determine button text and action based on mentorship status
  let actionButtonText = buttonText;
  let buttonAction = () => setIsDialogOpen(true);
  let actionIcon = showIcon ? <FaUserGraduate className="mr-2" /> : null;
  let currentVariant = variant;
  
  if (isLoading) {
    actionButtonText = "Loading...";
    buttonAction = () => {}; // Disable button while loading
  } else if (mentorshipStatus?.isActive) {
    actionButtonText = `Mentorship Active (${remainingDays} days)`;
    actionIcon = showIcon ? <FaUserCheck className="mr-2" /> : null;
    currentVariant = 'secondary';
  } else if (mentorshipStatus?.isPending) {
    actionButtonText = "Pending Request";
    actionIcon = showIcon ? <FaUserClock className="mr-2" /> : null;
    currentVariant = 'outline';
  }

  return (
    <>
      <Button
        variant={currentVariant}
        size={size}
        onClick={buttonAction}
        disabled={isLoading || isSubmitting}
        className={className}
      >
        {actionIcon}
        {actionButtonText}
      </Button>

      {/* Mentorship Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaUserGraduate className="mr-2" />
              Mentorship Connection
            </DialogTitle>
            <DialogDescription>
              Connect with a mentor to accelerate your professional growth.
              Mentorships last for 30 days and can be renewed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Active Mentorship */}
            {mentorshipStatus?.isActive && (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 font-medium">
                  <FaUserCheck className="mr-2" />
                  Active Mentorship
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  Started: {mentorshipStatus.startDate && format(parseISO(mentorshipStatus.startDate), 'MMM d, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  Ends: {mentorshipStatus.endDate && format(parseISO(mentorshipStatus.endDate), 'MMM d, yyyy')}
                  {` (${remainingDays} days remaining)`}
                </div>
                
                <DialogFooter className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      cancelMentorship();
                      setIsDialogOpen(false);
                    }}
                    disabled={isSubmitting}
                  >
                    <FaTimesCircle className="mr-2" />
                    End Mentorship
                  </Button>
                  
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
                </DialogFooter>
              </div>
            )}

            {/* Pending Request Sent by Current User */}
            {mentorshipStatus?.isPending && (
              <div className="space-y-4">
                <div className="flex items-center text-amber-600 font-medium">
                  <FaUserClock className="mr-2" />
                  Pending Mentorship Request
                </div>
                
                <p className="text-sm text-gray-600">
                  Your request is waiting for a response. You'll be notified when it's accepted.
                </p>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      cancelMentorship();
                      setIsDialogOpen(false);
                    }}
                    disabled={isSubmitting}
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel Request
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* New Mentorship Request */}
            {!mentorshipStatus?.isActive && !mentorshipStatus?.isPending && (
              <div className="space-y-4">
                <div className="flex items-center font-medium">
                  <FaUserGraduate className="mr-2" />
                  Request Mentorship
                </div>
                
                <p className="text-sm text-gray-600">
                  Mentors can provide guidance, feedback, and support for your professional growth.
                  You can have up to 5 active mentors at a time.
                </p>

                {!canRequestMoreMentors && (
                  <div className="text-red-500 text-sm mt-2">
                    You've reached the maximum limit of 5 mentors or pending requests.
                    Please complete or cancel existing mentorships before requesting new ones.
                  </div>
                )}
                
                <DialogFooter>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button 
                            onClick={() => {
                              requestMentorship();
                              setIsDialogOpen(false);
                            }}
                            disabled={isSubmitting || !canRequestMoreMentors}
                          >
                            <FaUserGraduate className="mr-2" />
                            Send Request
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canRequestMoreMentors && (
                        <TooltipContent>
                          <p>You've reached the maximum limit of 5 mentors or pending requests</p>
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