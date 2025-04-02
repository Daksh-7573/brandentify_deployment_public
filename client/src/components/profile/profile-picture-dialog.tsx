import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileUpload } from "./profile-upload";

interface ProfilePictureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoURL?: string | null;
  onSave: (base64Image: string) => void;
}

export function ProfilePictureDialog({
  open,
  onOpenChange,
  currentPhotoURL,
  onSave
}: ProfilePictureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex justify-center">
          <ProfileUpload
            currentPhotoURL={currentPhotoURL}
            onImageSelected={(base64Image) => {
              onSave(base64Image);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}