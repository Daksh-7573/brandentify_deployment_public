import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileUpload } from "./profile-upload";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { useAuth } from "@/hooks/use-auth";

interface ProfilePictureDialogProps {
  userId?: number | string; // Optional userId, will use hook's default if not provided
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoURL?: string | null;
  onSave?: (base64Image: string) => void; // Optional onSave callback
}

export function ProfilePictureDialog({
  userId, // No default - will be set from auth context if not provided
  open,
  onOpenChange,
  currentPhotoURL,
  onSave,
}: ProfilePictureDialogProps) {
  // Get authenticated user
  const { user: authUser } = useAuth();
  // Use the profile picture mutation hook with the provided userId or the authenticated user's ID
  const actualUserId = userId || (authUser?.id ?? 1);
  const profilePictureMutation = useProfilePicture(actualUserId);

  // Handle saving the updated profile picture
  const handleSaveProfilePicture = (base64Image: string) => {
    // If onSave callback is provided, use it
    if (onSave) {
      onSave(base64Image);
    } else {
      // Otherwise use the default mutation
      profilePictureMutation.mutate(base64Image);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <ProfileUpload 
            currentPhotoURL={currentPhotoURL}
            onImageSelected={handleSaveProfilePicture}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}