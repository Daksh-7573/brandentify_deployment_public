import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export function useProfilePicture(userId: number) {
  // Mutation for updating the profile picture
  return useMutation({
    mutationFn: async (base64Image: string) => {
      console.log(`Updating profile picture for user ID: ${userId}`);
      // Ensure we have a valid user ID
      if (!userId || userId === 0) {
        throw new Error("Invalid user ID. Please log in again.");
      }
      
      // Send only the photoURL update to the API
      const res = await apiRequest('PUT', `/api/users/${userId}`, {
        photoURL: base64Image
      });
      
      return await res.json() as User;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile picture updated",
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