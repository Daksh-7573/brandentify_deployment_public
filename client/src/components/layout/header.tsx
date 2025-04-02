import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, isDemoMode, signOut } = useAuth();
  const [_, setLocation] = useLocation();
  const [userData, setUserData] = useState<any>(null);

  // Fetch the latest user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userId = isDemoMode ? 1 : user.uid;
          const response = await apiRequest('GET', `/api/users/${userId}`);
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data for header:", error);
        }
      }
    };

    fetchUserData();
  }, [user, isDemoMode]);

  // Determine which photo URL to use (prioritize userData if available)
  const photoURL = userData?.photoURL || user?.photoURL;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <span 
                  className="text-primary text-2xl font-bold cursor-pointer"
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
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button 
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setLocation('/profile')}
                >
                  <span className="sr-only">Open user menu</span>
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User profile" 
                  />
                </button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="ml-4"
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
