import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export function useProfilePicture(userId: number) {
  // Mutation for updating the profile picture
  return useMutation({
    mutationFn: async (base64Image: string) => {
      // Send only the photoURL update to the API
      const res = await apiRequest('PUT', `/api/users/${userId}`, {
        photoURL: base64Image
      });
      return await res.json() as User;
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile picture",
        description: error.message || "There was an error updating your profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
}