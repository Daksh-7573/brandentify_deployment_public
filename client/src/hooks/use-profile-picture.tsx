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
          `/api/users/${targetUserId}/photo`,
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
      console.log('[PROFILE PICTURE] Target user ID for cache invalidation:', targetUserId);
      
      // Force immediate fresh data fetch for ALL user query formats
      console.log('[PROFILE PICTURE] Force refreshing user data for:', targetUserId);
      
      if (targetUserId) {
        // Get both Firebase UID and numeric ID for comprehensive cache clearing
        const numericUserId = (data as any)?.id?.toString();
        
        console.log('[PROFILE PICTURE] Targeting Firebase UID:', targetUserId);
        console.log('[PROFILE PICTURE] Targeting numeric ID:', numericUserId);
        
        // Use ONLY working query key formats that match actual component usage
        
        // 1. STRING FORMAT - Used by Header & Right Sidebar 
        await queryClient.refetchQueries({ 
          queryKey: [`/api/users/${targetUserId}`],
          exact: true 
        });
        
        if (numericUserId && numericUserId !== targetUserId) {
          await queryClient.refetchQueries({ 
            queryKey: [`/api/users/${numericUserId}`],
            exact: true 
          });
        }
        
        // 2. ARRAY FORMAT - Used by Profile Page (but causes wrong endpoint calls)
        // Skip array format refetch to avoid /api/users calls
        queryClient.invalidateQueries({ queryKey: ['/api/users', targetUserId] });
        if (numericUserId && numericUserId !== targetUserId) {
          queryClient.invalidateQueries({ queryKey: ['/api/users', numericUserId] });
        }
        
        // 3. PREDICATE-based invalidation for any other formats
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            const queryKey = query.queryKey;
            if (!Array.isArray(queryKey)) return false;
            
            return queryKey.some(key => 
              typeof key === 'string' && 
              key.includes('/api/users') &&
              (key.includes(String(targetUserId)) || (numericUserId && key.includes(numericUserId)))
            );
          }
        });
        
        console.log('[PROFILE PICTURE] Force refresh and cache reset complete');
      }
      
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