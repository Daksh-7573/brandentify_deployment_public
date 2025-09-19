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
      
      // AUTHENTICATION VALIDATION: Ensure user is properly authenticated
      if (!user) {
        throw new Error("You must be logged in to upload a profile picture. Please sign in first.");
      }
      
      // Ensure we have a valid user ID
      if (!targetUserId) {
        throw new Error("Invalid user ID. Please log in again.");
      }
      
      // SECURITY CHECK: Prevent uploading to different user accounts
      const userNumericId = user.id?.toString();
      const userUid = user.uid || user.id?.toString();
      
      if (targetUserId !== userNumericId && targetUserId !== userUid) {
        console.error('[SECURITY] User attempting to upload to different account:', {
          targetUserId,
          userNumericId,
          userUid
        });
        throw new Error("You can only update your own profile picture.");
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
        
        // Send photoURL update along with user info to ensure user exists
        console.log('[PROFILE UPLOAD DEBUG] Uploading to user ID:', targetUserId);
        console.log('[PROFILE UPLOAD DEBUG] Base64 image length:', base64Image.length);
        console.log('[PROFILE UPLOAD DEBUG] Base64 preview:', base64Image.substring(0, 100) + '...');
        
        // Include user's name and email to help server create user if needed (for Firebase UID cases)
        const updateData: any = {
          photoURL: base64Image
        };
        
        // Add user info from auth context if available to help with Firebase UID user creation
        if (user?.name) {
          updateData.name = user.name;
        }
        if (user?.email) {
          updateData.email = user.email;
        }
        
        console.log('[PROFILE UPLOAD DEBUG] Update data keys:', Object.keys(updateData));
        
        const res = await apiRequest(
          'PUT',
          `/api/users/${targetUserId}`,
          updateData
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
        
        // Enhanced error handling with authentication context
        if (error instanceof Error) {
          console.error('[PROFILE UPLOAD ERROR] Error details:', error);
          
          // Handle authentication-specific errors
          if (error.message.includes("401") || error.message.includes("Authentication required")) {
            throw new Error("Please sign in to upload a profile picture.");
          } else if (error.message.includes("403") || error.message.includes("can only update your own")) {
            throw new Error("You can only update your own profile picture.");
          } else if (error.message.includes("413")) {
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
      
      // Force immediate cache invalidation and refetch for immediate UI updates
      if (targetUserId) {
        // Use the response photoURL or fallback to uploaded image
        const newPhotoURL = (data as any)?.photoURL || currentUploadedImage;
        console.log('[PROFILE PICTURE] About to invalidate cache with new photoURL:', newPhotoURL ? 'HAS_DATA' : 'NO_DATA');
        
        // First update the cache directly to ensure immediate UI update
        queryClient.setQueryData(['/api/users', targetUserId], (oldData: any) => {
          if (oldData) {
            console.log('[PROFILE PICTURE] Updating cached data - old photoURL:', oldData.photoURL ? 'EXISTS' : 'NULL');
            console.log('[PROFILE PICTURE] Updating cached data - new photoURL:', newPhotoURL ? 'EXISTS' : 'NULL');
            const updatedData = {
              ...oldData,
              photoURL: newPhotoURL
            };
            console.log('[PROFILE PICTURE] ✅ Cache updated successfully for userId:', targetUserId);
            return updatedData;
          }
          return oldData;
        });
        
        // Also update by numeric ID if different from targetUserId
        const numericUserId = (data as any)?.id?.toString();
        if (numericUserId && numericUserId !== targetUserId.toString()) {
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
        
        // CRITICAL FIX: Also refresh the auth context to sync with header
        console.log('[PROFILE PICTURE] 🔄 Refreshing auth context for immediate header sync');
        if (user && typeof window !== 'undefined') {
          // Import the auth context refresh function dynamically to avoid circular imports
          const { useAuth } = await import('@/hooks/use-auth');
          // We can't call useAuth here as it's a hook, so we'll trigger the refresh via a session check
          try {
            const response = await fetch('/api/auth/session', {
              method: 'GET',
              credentials: 'include'
            });
            if (response.ok) {
              const sessionData = await response.json();
              if (sessionData.success && sessionData.user) {
                // Update session storage to sync auth context on next check
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
            console.log('[PROFILE PICTURE] Auth context refresh failed, will sync on next page load');
          }
        }
        
        // Then invalidate all related queries to ensure fresh data on next fetch
        console.log('[PROFILE PICTURE] 🔄 Invalidating all user queries for immediate refresh');
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/users'],
          refetchType: 'active' // Refetch all active queries
        });
        
        // Additional specific invalidation for the exact user
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/users', targetUserId]
        });
        
        if (numericUserId && numericUserId !== targetUserId.toString()) {
          await queryClient.invalidateQueries({ 
            queryKey: ['/api/users', numericUserId]
          });
        }
        
        console.log('[PROFILE PICTURE] 🎉 All cache updates and invalidations completed!');
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