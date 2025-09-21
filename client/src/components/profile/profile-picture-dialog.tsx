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
  const [currentUploadedImage, setCurrentUploadedImage] = useState<string | null>(null);
  
  console.log("ProfilePictureDialog rendered with open:", open);
  
  // PROFILE PICTURE PERSISTENCE FIX: Use Firebase UID to match JWT token
  // JWT tokens contain Firebase UID as userId, so we need to use authUser.uid, not authUser.id
  const actualUserId = userId || (authUser?.uid ?? authUser?.id ?? 1);
  
  console.log('[PROFILE DIALOG DEBUG] Auth user data:', {
    id: authUser?.id,
    uid: authUser?.uid,
    email: authUser?.email
  });
  console.log('[PROFILE DIALOG DEBUG] Using actualUserId:', actualUserId);
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
        
        // Send only the photoURL update to the API
        console.log('[PROFILE DIALOG DEBUG] Uploading to user ID:', actualUserId);
        console.log('[PROFILE DIALOG DEBUG] Base64 image length:', base64Image.length);
        
        const res = await apiRequest(
          'PUT',
          `/api/users/${actualUserId}`,
          {
            photoURL: base64Image
          }
        );
        
        console.log('[PROFILE DIALOG DEBUG] API response:', res);
        
        console.log("Profile picture update successful");
        return res;
      } catch (error) {
        console.error("API request failed:", error);
        
        // Enhanced error handling with specific feedback
        if (error instanceof Response) {
          const status = error.status;
          const errorData = await error.json().catch(() => null);
          
          console.error('[PROFILE DIALOG ERROR] HTTP Error:', {
            status,
            statusText: error.statusText,
            errorData,
            url: error.url
          });
          
          if (status === 401) {
            throw new Error("Authentication required. Please log in again and try uploading your profile picture.");
          } else if (status === 403) {
            throw new Error("You don't have permission to update this profile picture. Please make sure you're logged in with the correct account.");
          } else if (status >= 500) {
            throw new Error("Server error occurred while uploading. Please try again in a moment.");
          } else {
            const message = errorData?.error || errorData?.message || "Unknown error occurred";
            throw new Error(`Upload failed: ${message}`);
          }
        } else {
          console.error('[PROFILE DIALOG ERROR] Network or other error:', error);
          throw new Error("Network error occurred. Please check your connection and try again.");
        }
      }
    },
    onSuccess: async (data) => {
      setIsUploading(false);
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
        variant: "default",
      });
      
      // Use the stored uploaded image for immediate cache update
      const newPhotoURL = (data as any)?.photoURL || currentUploadedImage;
      console.log('[PROFILE DIALOG] ✅ Using uploaded image for instant cache update');
      
      queryClient.setQueryData(['/api/users', actualUserId], (oldData: any) => {
        if (oldData) {
          console.log('[PROFILE DIALOG] ✅ Instant cache update with new image');
          return {
            ...oldData,
            photoURL: newPhotoURL
          };
        }
        return oldData;
      });
      
      // Also update by numeric ID if different from actualUserId
      const numericUserId = (data as any)?.id?.toString();
      if (numericUserId && numericUserId !== actualUserId) {
        queryClient.setQueryData(['/api/users', numericUserId], (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              photoURL: newPhotoURL
            };
          }
          return oldData;
        });
      }
      
      // CRITICAL FIX: Sync auth context for header display
      console.log('[PROFILE DIALOG] 🔄 Syncing auth context for header sync');
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include'
          });
          if (response.ok) {
            const sessionData = await response.json();
            if (sessionData.success && sessionData.user) {
              // Update session storage to sync auth context
              sessionStorage.setItem('brandentifier_user', JSON.stringify({
                ...sessionData.user,
                photoURL: newPhotoURL
              }));
              
              // Trigger a manual refresh by dispatching a custom event
              window.dispatchEvent(new CustomEvent('profile-picture-updated', { 
                detail: { newPhotoURL } 
              }));
            }
          }
        } catch (error) {
          console.log('[PROFILE DIALOG] Auth context refresh failed, will sync on next page load');
        }
      }
      
      // Force immediate re-render
      queryClient.invalidateQueries({ 
        queryKey: ['/api/users', actualUserId],
        exact: true,
        refetchType: 'none'
      });
      if (numericUserId && numericUserId !== actualUserId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/users', numericUserId],
          exact: true,
          refetchType: 'none'
        });
      }
      
      // Clear the stored image and close dialog
      setCurrentUploadedImage(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      
      // Enhanced error feedback with actionable messages
      const errorMessage = error.message || "Failed to update profile picture. Please try again.";
      const isAuthError = errorMessage.includes("Authentication") || errorMessage.includes("permission");
      const isNetworkError = errorMessage.includes("Network");
      
      console.log('[PROFILE DIALOG] Upload failed with error:', {
        message: errorMessage,
        isAuthError,
        isNetworkError,
        userId: actualUserId,
        authUser: authUser ? {
          id: authUser.id,
          uid: authUser.uid,
          email: authUser.email
        } : null
      });
      
      toast({
        title: isAuthError ? "Authentication Error" : isNetworkError ? "Connection Error" : "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Additional debugging for authentication errors
      if (isAuthError) {
        console.log('[PROFILE DIALOG] Authentication error details:', {
          targetUserId: actualUserId,
          authUserData: authUser,
          suggestion: "User may need to log out and log back in to refresh authentication"
        });
      }
      
      console.error("Failed to update profile picture:", error);
    }
  });

  // Handle saving the updated profile picture
  const handleSaveProfilePicture = (base64Image: string) => {
    // Store the uploaded image for cache update
    setCurrentUploadedImage(base64Image);
    console.log('[PROFILE DIALOG] 🔄 Storing uploaded image for cache update');
    
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white font-semibold">Profile Picture</DialogTitle>
          <DialogDescription className="text-white/70">
            Upload a professional photo that clearly shows your face
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-lg border border-white/10">
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