import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Settings, Menu, X, Home, Search, Bot, User, MapPin, Bell } from "lucide-react";

export default function Header() {
  const { user, isDemoMode, signOut, refreshUserData } = useAuth();
  const [path, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Helper function to check if current path matches
  const isActive = (routePath: string) => path === routePath;
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Use TanStack Query to fetch and cache user data
  const { data: userData, isError } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log(`Fetching user data for header with ID: ${userId}`);
      const response = await apiRequest({ method: 'GET', url: `/api/users/${userId}` });
      
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
    <nav className="bg-ui-white border-b border-ui-shadow shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-8">
              <div className="flex items-center">
                <div
                  className="flex items-center gap-1.5 cursor-pointer group slide-in"
                  onClick={() => setLocation('/dashboard')}
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-ui-aqua to-ui-teal rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 neon-glow-primary">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-ui-charcoal text-xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-ui-aqua to-ui-teal">
                    Brandentifier
                  </span>
                </div>
                {isDemoMode && (
                  <Badge variant="outline" className="ml-2 text-ui-pink border-ui-pink">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:flex space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3.5 py-2 h-auto button-expand ${
                  isActive('/industry-pulse') 
                    ? 'text-ui-aqua bg-ui-aqua/5 hover:bg-ui-aqua/10 neon-border-primary border-b-2 border-ui-aqua' 
                    : 'text-ui-charcoal hover:text-ui-aqua hover:bg-ui-warm-white border-b-2 border-transparent'
                }`}
                onClick={() => setLocation('/industry-pulse')}
              >
                <Home className={`h-4 w-4 ${isActive('/industry-pulse') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>Industry Pulse</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3.5 py-2 h-auto button-expand ${
                  isActive('/search') 
                    ? 'text-ui-aqua bg-ui-aqua/5 hover:bg-ui-aqua/10 neon-border-primary border-b-2 border-ui-aqua' 
                    : 'text-ui-charcoal hover:text-ui-aqua hover:bg-ui-warm-white border-b-2 border-transparent'
                }`}
                onClick={() => setLocation('/search')}
              >
                <Search className={`h-4 w-4 ${isActive('/search') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>Discover & Connect</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3.5 py-2 h-auto button-expand ${
                  isActive('/ai-career') 
                    ? 'text-ui-aqua bg-ui-aqua/5 hover:bg-ui-aqua/10 neon-border-primary border-b-2 border-ui-aqua' 
                    : 'text-ui-charcoal hover:text-ui-aqua hover:bg-ui-warm-white border-b-2 border-transparent'
                }`}
                onClick={() => setLocation('/ai-career')}
              >
                <Bot className={`h-4 w-4 ${isActive('/ai-career') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>AI Career Booster</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3.5 py-2 h-auto button-expand ${
                  isActive('/radar') 
                    ? 'text-ui-aqua bg-ui-aqua/5 hover:bg-ui-aqua/10 neon-border-primary border-b-2 border-ui-aqua' 
                    : 'text-ui-charcoal hover:text-ui-aqua hover:bg-ui-warm-white border-b-2 border-transparent'
                }`}
                onClick={() => setLocation('/radar')}
              >
                <MapPin className={`h-4 w-4 ${isActive('/radar') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>Smart Radar</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md p-2 hover:bg-ui-warm-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-ui-charcoal" />
              ) : (
                <Menu className="h-5 w-5 text-ui-charcoal" />
              )}
            </Button>
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full w-9 h-9 hover:bg-ui-warm-white transition-colors relative"
              onClick={() => {/* Toggle notifications */}}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-ui-charcoal" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-ui-pink"></span>
            </Button>

            {/* Create Pulse Button */}
            <Button 
              variant="default" 
              size="sm"
              className="hidden sm:flex px-4 py-2 text-sm font-medium bg-ui-pink hover:bg-ui-pink/90 text-white shadow-sm items-center gap-1.5 neon-glow-secondary button-expand"
              onClick={() => setLocation('/create-pulse')}
            >
              <Zap className="h-4 w-4" /> Create Pulse
            </Button>
            
            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex rounded-full w-9 h-9 hover:bg-ui-warm-white transition-colors"
              onClick={() => setLocation('/settings')}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-ui-charcoal" />
            </Button>
            
            {/* User profile section - combined name and avatar */}
            <div 
              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg ${
                isActive('/profile') 
                  ? 'bg-ui-aqua/5 neon-glow-primary' 
                  : 'hover:bg-ui-warm-white'
              } transition-all duration-200 group`}
              onClick={() => setLocation('/profile')}
            >
              {/* User name */}
              <span className="text-sm font-medium text-ui-charcoal hidden md:block group-hover:text-ui-aqua transition-colors">
                {userData?.name || (user && 'displayName' in user ? user.displayName : null) || "Profile"}
              </span>
              
              {/* User avatar */}
              <div className="relative">
                <div 
                  className="flex items-center rounded-full focus:outline-none transition-all"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center border transition-all ${
                    isActive('/profile')
                      ? 'border-ui-aqua shadow-md' 
                      : 'border-ui-shadow group-hover:border-ui-aqua shadow-sm group-hover:shadow-md'
                  }`}>
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

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-ui-shadow shadow-lg animate-fadeIn">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                isActive('/industry-pulse') 
                  ? 'text-ui-aqua bg-ui-aqua/5' 
                  : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
              }`}
              onClick={() => {
                setLocation('/industry-pulse');
                setIsMobileMenuOpen(false);
              }}
            >
              <Home className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/industry-pulse') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
              <span>Industry Pulse</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                isActive('/search') 
                  ? 'text-ui-aqua bg-ui-aqua/5' 
                  : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
              }`}
              onClick={() => {
                setLocation('/search');
                setIsMobileMenuOpen(false);
              }}
            >
              <Search className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/search') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
              <span>Discover & Connect</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                isActive('/ai-career') 
                  ? 'text-ui-aqua bg-ui-aqua/5' 
                  : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
              }`}
              onClick={() => {
                setLocation('/ai-career');
                setIsMobileMenuOpen(false);
              }}
            >
              <Bot className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/ai-career') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
              <span>AI Career Booster</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                isActive('/radar') 
                  ? 'text-ui-aqua bg-ui-aqua/5' 
                  : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
              }`}
              onClick={() => {
                setLocation('/radar');
                setIsMobileMenuOpen(false);
              }}
            >
              <MapPin className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/radar') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
              <span>Smart Radar</span>
            </Button>
            

            <div className="pt-4 mt-2 border-t border-ui-shadow">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                  isActive('/profile') 
                    ? 'text-ui-aqua bg-ui-aqua/5' 
                    : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
                }`}
                onClick={() => {
                  setLocation('/profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                <User className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/profile') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>My Profile</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start py-2.5 text-sm font-medium rounded-md staggered-item ${
                  isActive('/settings') 
                    ? 'text-ui-aqua bg-ui-aqua/5' 
                    : 'text-ui-charcoal hover:bg-ui-warm-white hover:text-ui-aqua'
                }`}
                onClick={() => {
                  setLocation('/settings');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Settings className={`h-4 w-4 mr-3 ml-0.5 ${isActive('/settings') ? 'text-ui-aqua' : 'text-ui-charcoal'}`} />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="w-full mt-3 justify-center py-3 text-sm font-medium bg-ui-pink hover:bg-ui-pink/90 text-white shadow-sm rounded-md neon-glow-secondary staggered-item"
                onClick={() => {
                  setLocation('/create-pulse');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                <span>Create Pulse</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
