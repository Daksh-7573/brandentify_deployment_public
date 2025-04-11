import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileUpload } from "./profile-upload";
import { useProfilePicture } from "@/hooks/use-profile-picture";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  // Use the profile picture mutation hook with the provided userId or the authenticated user's ID
  const actualUserId = userId || (authUser?.id ?? 1);
  const profilePictureMutation = useProfilePicture(actualUserId);

  // Handle saving the updated profile picture
  const handleSaveProfilePicture = (base64Image: string) => {
    // Show uploading state
    setIsUploading(true);
    
    // If onSave callback is provided, use it
    if (onSave) {
      onSave(base64Image);
      setIsUploading(false);
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
        variant: "default",
      });
      onOpenChange(false);
    } else {
      // Otherwise use the default mutation
      profilePictureMutation.mutate(base64Image, {
        onSuccess: () => {
          setIsUploading(false);
          toast({
            title: "Success!",
            description: "Profile picture updated successfully",
            variant: "default",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          setIsUploading(false);
          toast({
            title: "Error!",
            description: "Failed to update profile picture. Please try again.",
            variant: "destructive",
          });
          console.error("Failed to update profile picture:", error);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing dialog during upload
      if (isUploading && !newOpen) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a professional photo that clearly shows your face
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <ProfileUpload 
            currentPhotoURL={currentPhotoURL}
            onImageSelected={handleSaveProfilePicture}
            onCancel={() => onOpenChange(false)}
            isUploading={isUploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}