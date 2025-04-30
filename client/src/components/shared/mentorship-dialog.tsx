import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FaUserGraduate } from 'react-icons/fa';
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
      <DialogContent className={`sm:max-w-md ${className || ''}`}>
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
          {isViewingOtherProfile ? (
            <MentorshipButton
              userId={userId}
              mentorId={mentorId}
              className="w-full bg-purple-600 hover:bg-purple-700"
              buttonText="Request Mentorship"
              showIcon={true}
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
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