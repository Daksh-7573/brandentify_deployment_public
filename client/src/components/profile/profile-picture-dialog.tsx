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
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  
  console.log("ProfilePictureDialog rendered with open:", open);
  
  // Use the profile picture mutation hook with the provided userId or the authenticated user's ID
  const actualUserId = userId || (authUser?.id ?? 1);
  // Make a direct mutation with useMutation to upload the profile picture
  const profilePictureMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      console.log(`Updating profile picture for user ID: ${actualUserId}`);
      // Ensure we have a valid user ID
      if (!actualUserId) {
        throw new Error("Invalid user ID. Please log in again.");
      }
      
      // Check image size before uploading
      const imageSizeInBytes = base64Image.length * 0.75; // Approximate size conversion from base64 to bytes
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
      
      if (imageSizeInBytes > maxSizeInBytes) {
        throw new Error("Image size exceeds 5MB limit. Please upload a smaller image.");
      }
      
      try {
        // Log information for debugging
        console.log("Starting profile picture upload...");
        console.log("Image size (bytes):", imageSizeInBytes);
        
        // Send only the photoURL update to the API using the new API request format
        const res = await apiRequest({
          method: 'PUT',
          url: `/api/users/${actualUserId}`,
          data: {
            photoURL: base64Image
          }
        });
        
        console.log("Profile picture update successful");
        return await res.json();
      } catch (error) {
        console.error("API request failed:", error);
        throw new Error("Failed to update profile picture. Please try again.");
      }
    },
    onSuccess: () => {
      setIsUploading(false);
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
        variant: "default",
      });
      
      // Force invalidate all user data queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${actualUserId}`] });
      
      onOpenChange(false);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast({
        title: "Error!",
        description: error.message || "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update profile picture:", error);
    }
  });

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
      profilePictureMutation.mutate(base64Image);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing dialog during upload
      if (isUploading && !newOpen) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto neo-glass-card">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-bold">Profile Picture</DialogTitle>
          <DialogDescription className="text-gray-300">
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