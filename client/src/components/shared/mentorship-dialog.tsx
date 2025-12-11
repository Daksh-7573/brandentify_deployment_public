import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MentorshipButton } from './mentorship-button';

interface MentorshipDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: number;
  mentorId?: number;
  className?: string;
}

export const MentorshipDialog: React.FC<MentorshipDialogProps> = ({
  isOpen,
  onOpenChange,
  userId,
  mentorId,
  className
}) => {
  const isViewingOtherProfile = userId && mentorId && userId !== mentorId;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md bg-[rgba(18,18,18,0.95)] backdrop-blur-[15px] border-white/10 ${className || ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Mentor Connection
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Connect with a mentor to accelerate your professional growth.
            Mentorships last for 30 days and can be renewed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isViewingOtherProfile ? (
            <MentorshipButton
              userId={userId}
              mentorId={mentorId}
              className="w-full bg-primary hover:bg-primary/90"
              buttonText="Follow as Mentor"
              showIcon={true}
            />
          ) : (
            <div className="text-center">
              <p className="text-white/70 mb-4">
                Mentoring others is a great way to give back to the community and develop your own leadership skills.
              </p>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
