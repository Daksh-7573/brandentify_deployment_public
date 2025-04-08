import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";

export default function Header() {
  const { user, isDemoMode, signOut, refreshUserData } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Use TanStack Query to fetch and cache user data
  const { data: userData, isError } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log(`Fetching user data for header with ID: ${userId}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.error(`User with ID ${userId} not found in backend`);
        return null;
      }
      
      const data = await response.json();
      console.log("Fetched user data for header:", data);
      return data;
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: true // Refresh when window gets focus
  });
  
  // Force refresh data when component mounts
  useEffect(() => {
    // Immediately trigger a refresh of user data when header loads
    if (userId) {
      console.log("Header mounted - invalidating user query");
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    }
  }, [userId]);

  // Determine which photo URL to use (prioritize userData if available)
  const photoURL = userData?.photoURL || user?.photoURL;

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <span 
                  className="text-primary text-2xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => setLocation('/dashboard')}
                >
                  Brandentifier
                </span>
                {isDemoMode && (
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-500">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Create Pulse Button */}
            <Button 
              variant="default" 
              size="sm"
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white shadow-md flex items-center gap-1.5"
              onClick={() => setLocation('/create-pulse')}
            >
              <Zap className="h-4 w-4" /> Create Pulse
            </Button>
            
            {/* User profile section - combined name and avatar */}
            <div 
              className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setLocation('/profile')}
            >
              {/* User name */}
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {userData?.name || user?.displayName || "Profile"}
              </span>
              
              {/* User avatar */}
              <div className="relative">
                <div 
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/70 transition-all hover:shadow-md"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                    <img 
                      className="h-full w-full object-cover" 
                      src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
