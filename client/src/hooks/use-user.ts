import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

export interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  title: string | null;
  aboutMe: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  lookingFor: string | null;
  whatIOffer: string | null;
  visitingCardType: string | null;
  profileCompleted: number | null;
  emailVerified: boolean;
  createdAt: Date;
}

export function useUser() {
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users', authUser?.uid],
    queryFn: async () => {
      if (!authUser?.uid) return null;
      try {
        const data = await apiRequest(`/api/users/${authUser.uid}`);
        return data as User;
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },
    enabled: !!authUser?.uid && isAuthenticated,
  });

  return {
    user: data,
    isLoading: isLoading || isAuthLoading,
    error,
    isAuthenticated,
  };
}