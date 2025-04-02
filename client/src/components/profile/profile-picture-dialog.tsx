import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileUpload } from "./profile-upload";
import { useProfilePicture } from "@/hooks/use-profile-picture";

interface ProfilePictureDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoURL?: string | null;
}

export function ProfilePictureDialog({
  userId,
  open,
  onOpenChange,
  currentPhotoURL,
}: ProfilePictureDialogProps) {
  // Use the profile picture mutation hook
  const profilePictureMutation = useProfilePicture(userId);

  // Handle saving the updated profile picture
  const handleSaveProfilePicture = (base64Image: string) => {
    profilePictureMutation.mutate(base64Image);
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