import { useQuery } from "@tanstack/react-query";

export function useReplitAuth() {
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}