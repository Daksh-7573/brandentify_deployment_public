import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useProfilePicture(userId: number | string | null = null) {
  // Get the refresh function and current user from auth context
  const { refreshUserData, user } = useAuth();
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // If userId is not provided, use the current user's UID
  const targetUserId = userId || user?.uid || null;
  
  // Get user data to extract the profile picture URL
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${targetUserId}`],
    enabled: !!targetUserId,
  });

  // Function to open the profile picture dialog
  const openProfilePictureDialog = () => {
    console.log("Opening profile picture dialog");
    setShowProfilePictureDialog(true);
  };

  // Function to close the profile picture dialog
  const closeProfilePictureDialog = () => {
    setShowProfilePictureDialog(false);
  };
  
  // Extract profile picture URL from user data
  const profilePictureUrl = userData?.photoURL || null;
  
  // Mutation for updating the profile picture
  const profilePictureMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      console.log(`Updating profile picture for user ID: ${targetUserId}`);
      // Ensure we have a valid user ID
      if (!targetUserId) {
        throw new Error("Invalid user ID. Please log in again.");
      }
      
      // Start upload progress tracking
      setIsUploading(true);
      setUploadProgress(0);
      
      // Check image size before uploading
      const imageSizeInBytes = base64Image.length * 0.75; // Approximate size conversion from base64 to bytes
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB limit
      
      if (imageSizeInBytes > maxSizeInBytes) {
        setIsUploading(false);
        throw new Error("Image size exceeds 5MB limit. Please upload a smaller image.");
      }
      
      try {
        // Log information for debugging
        console.log("Starting profile picture upload...");
        console.log("Image size (bytes):", imageSizeInBytes);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 5;
          });
        }, 200);
        
        // Send only the photoURL update to the API using the new API request format
        const res = await apiRequest({
          method: 'PUT',
          url: `/api/users/${targetUserId}`,
          data: {
            photoURL: base64Image
          }
        });
        
        // Complete the progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log("Profile picture update successful");
        return await res.json() as User;
      } catch (error) {
        console.error("API request failed:", error);
        setIsUploading(false);
        setUploadProgress(0);
        
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
      // Complete upload and reset state
      setIsUploading(false);
      setUploadProgress(0);
      closeProfilePictureDialog();
      
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
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Error updating profile picture",
        description: error.message || "There was an error updating your profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return {
    profilePictureUrl,
    isUploading,
    uploadProgress,
    showProfilePictureDialog,
    openProfilePictureDialog,
    closeProfilePictureDialog,
    updateProfilePicture: profilePictureMutation.mutate,
    isUpdating: profilePictureMutation.isPending
  };
}