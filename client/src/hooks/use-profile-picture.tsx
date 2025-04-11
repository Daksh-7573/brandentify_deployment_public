import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export function useProfilePicture(userId: number | string | null = null) {
  // Get the refresh function and current user from auth context
  const { refreshUserData, user } = useAuth();
  
  // If userId is not provided, use the current user's UID
  const targetUserId = userId || user?.uid || null;
  
  // Mutation for updating the profile picture
  return useMutation({
    mutationFn: async (base64Image: string) => {
      console.log(`Updating profile picture for user ID: ${targetUserId}`);
      // Ensure we have a valid user ID
      if (!targetUserId) {
        throw new Error("Invalid user ID. Please log in again.");
      }
      
      // Check image size before uploading
      const imageSizeInBytes = base64Image.length * 0.75; // Approximate size conversion from base64 to bytes
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
      
      if (imageSizeInBytes > maxSizeInBytes) {
        throw new Error("Image size exceeds 5MB limit. Please upload a smaller image.");
      }
      
      try {
        // Send only the photoURL update to the API using the new API request format
        const res = await apiRequest({
          method: 'PUT',
          url: `/api/users/${targetUserId}`,
          data: {
            photoURL: base64Image
          }
        });
        
        return await res.json() as User;
      } catch (error) {
        console.error("API request failed:", error);
        
        // Enhance error message
        if (error instanceof Error) {
          if (error.message.includes("413")) {
            throw new Error("Image is too large. Please use a smaller image (max 5MB).");
          } else if (error.message.includes("Network error")) {
            throw new Error("Network error. Please check your internet connection and try again.");
          } else {
            throw error;
          }
        }
        throw new Error("Failed to update profile picture. Please try again.");
      }
    },
    onSuccess: async (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${targetUserId}`] });
      
      // Immediately refresh the auth context
      if (refreshUserData) {
        try {
          await refreshUserData();
        } catch (err) {
          console.warn("Could not refresh user data after profile picture update", err);
        }
      }
      
      // Force invalidate all user data queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${targetUserId}`] });
      
      toast({
        title: "Success!",
        description: "Your profile picture has been updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating profile picture:", error);
      toast({
        title: "Error updating profile picture",
        description: error.message || "There was an error updating your profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
}