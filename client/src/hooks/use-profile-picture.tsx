import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useProfilePicture(userId: number | string | null = null) {
  // Get the current user from auth context
  const { user } = useAuth();
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadedImage, setCurrentUploadedImage] = useState<string | null>(null);
  
  // If userId is not provided, use the current user's ID
  const targetUserId = userId || user?.id || null;
  
  // Get user data to extract the profile picture URL
  const { data: userData } = useQuery({
    queryKey: ['/api/users', targetUserId],
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
  const profilePictureUrl = (userData as any)?.photoURL || null;
  
  // Mutation for updating the profile picture
  const profilePictureMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      console.log(`Updating profile picture for user ID: ${targetUserId}`);
      // Store the uploaded image for cache update
      setCurrentUploadedImage(base64Image);
      
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
        
        // Send only the photoURL update to the API
        console.log('[PROFILE UPLOAD DEBUG] Uploading to user ID:', targetUserId);
        console.log('[PROFILE UPLOAD DEBUG] Base64 image length:', base64Image.length);
        console.log('[PROFILE UPLOAD DEBUG] Base64 preview:', base64Image.substring(0, 100) + '...');
        
        const res = await apiRequest(
          'PUT',
          `/api/users/${targetUserId}`,
          {
            photoURL: base64Image
          }
        );
        
        console.log('[PROFILE UPLOAD DEBUG] API response:', res);
        console.log('[PROFILE UPLOAD DEBUG] Response photoURL:', (res as any)?.photoURL ? 'EXISTS' : 'MISSING');
        
        // Complete the progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        console.log("Profile picture update successful");
        return res;
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
      
      console.log('[PROFILE PICTURE] Upload successful, response data:', data);
      console.log('[PROFILE PICTURE] Target user ID for cache update:', targetUserId);
      console.log('[PROFILE PICTURE] New photoURL from server:', (data as any)?.photoURL ? 'RECEIVED' : 'MISSING');
      
      // Direct cache data update instead of invalidation to prevent wrong API calls
      if (targetUserId) {
        // Use the stored uploaded image for cache update since API response doesn't include photoURL
        const newPhotoURL = (data as any)?.photoURL || currentUploadedImage;
        console.log('[PROFILE PICTURE] About to update cache with photoURL:', newPhotoURL ? 'HAS_DATA' : 'NO_DATA');
        
        // Update the cached data directly with the new profile picture
        queryClient.setQueryData(['/api/users', targetUserId], (oldData: any) => {
          if (oldData) {
            console.log('[PROFILE PICTURE] Updating cached data - old photoURL:', oldData.photoURL ? 'EXISTS' : 'NULL');
            console.log('[PROFILE PICTURE] Updating cached data - new photoURL:', newPhotoURL ? 'EXISTS' : 'NULL');
            const updatedData = {
              ...oldData,
              photoURL: newPhotoURL
            };
            console.log('[PROFILE PICTURE] ✅ Cache updated successfully for userId:', targetUserId);
            console.log('[PROFILE PICTURE] ✅ Updated data includes photoURL:', updatedData.photoURL ? 'YES' : 'NO');
            return updatedData;
          }
          return oldData;
        });
        
        // Also update by numeric ID if different from targetUserId
        const numericUserId = (data as any)?.id?.toString();
        if (numericUserId && numericUserId !== targetUserId) {
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
        
        // Force all components to re-render immediately after cache update
        console.log('[PROFILE PICTURE] 🔄 Triggering component re-renders for userId:', targetUserId);
        queryClient.invalidateQueries({ 
          queryKey: ['/api/users', targetUserId],
          exact: true,
          refetchType: 'none' // Don't refetch, just trigger re-renders
        });
        if (numericUserId && numericUserId !== targetUserId) {
          console.log('[PROFILE PICTURE] 🔄 Also triggering re-renders for numericUserId:', numericUserId);
          queryClient.invalidateQueries({ 
            queryKey: ['/api/users', numericUserId],
            exact: true,
            refetchType: 'none'
          });
        }
        console.log('[PROFILE PICTURE] 🎉 All cache updates and re-renders completed!');
        
        console.log('[PROFILE PICTURE] Cache data update complete');
      }
      
      // Clear the stored image after successful upload
      setCurrentUploadedImage(null);
      
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