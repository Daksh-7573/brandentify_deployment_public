import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Settings, Menu, X, Home, Search, Bot, User, MapPin, FileText, Trophy, Award, Calendar, Flag, Bell, MessageSquare } from "lucide-react";
import NotificationBell from "@/components/notifications/notification-bell";

export default function Header() {
  const { user, isDemoMode, signOut, refreshUserData } = useAuth();
  const [path, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
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
  
  // Function to check for unread messages
  const checkUnreadMessages = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await apiRequest('GET', `/api/messaging/unread/count?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHasUnreadMessages(data.count > 0);
      }
    } catch (error) {
      console.error('Error checking for unread messages:', error);
    }
  }, [userId]);

  // Check for unread messages periodically
  useEffect(() => {
    // Check initially
    checkUnreadMessages();
    
    // Set up an interval to check every 30 seconds
    const interval = setInterval(checkUnreadMessages, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [checkUnreadMessages]);
  
  // Recheck unread messages when route changes
  useEffect(() => {
    // Check for unread messages when user changes routes
    if (path !== '/messages') {
      checkUnreadMessages();
    } else {
      // If we're on the messages page, assume they've seen all messages
      setHasUnreadMessages(false);
      
      // Mark all messages as read when visiting the messages page
      if (userId) {
        apiRequest('POST', `/api/messaging/conversations/mark-all-read?userId=${userId}`);
      }
    }
  }, [path, checkUnreadMessages, userId]);

  // Determine which photo URL to use (prioritize userData if available)
  const photoURL = userData?.photoURL || user?.photoURL;

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 transition-all duration-300">
      <div className="max-w-full mx-auto backdrop-filter backdrop-blur-xl bg-[rgba(20,20,20,0.6)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-xl">
        <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-8">
              <div className="flex items-center">
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setLocation('/dashboard')}
                >
                  <div className="h-10 w-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all group-hover:shadow-primary/30 group-hover:scale-105">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-white text-xl font-bold cursor-pointer">
                    Brandentifier
                  </span>
                </div>
                {isDemoMode && (
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-500">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:flex space-x-6">
              <Button
                variant="glass"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/industry-pulse') 
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' 
                    : 'text-white hover:text-primary'
                }`}
                onClick={() => setLocation('/industry-pulse')}
              >
                <Home className="h-4 w-4" />
                <span>Industry Pulse</span>
              </Button>
              
              <Button
                variant="glass"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/search') 
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' 
                    : 'text-white hover:text-primary'
                }`}
                onClick={() => setLocation('/search')}
              >
                <Search className="h-4 w-4" />
                <span>Discover & Connect</span>
              </Button>
              

              
              <Button
                variant="glass"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/radar') 
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' 
                    : 'text-white hover:text-primary'
                }`}
                onClick={() => setLocation('/radar')}
              >
                <MapPin className="h-4 w-4" />
                <span>Smart Radar</span>
              </Button>
              

              <Button
                variant="glass"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/brand-quests') || isActive('/career-quests')
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' 
                    : 'text-white hover:text-primary'
                }`}
                onClick={() => setLocation('/brand-quests')}
              >
                <Trophy className="h-4 w-4" />
                <span>Brand Quests</span>
              </Button>
              
              <Button
                variant="glass"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/career-capsule') 
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' 
                    : 'text-white hover:text-primary'
                }`}
                onClick={() => setLocation('/career-capsule')}
              >
                <Flag className="h-4 w-4" />
                <span>Career Capsule</span>
              </Button>
              
              {/* Career Capsule feature added */}
              
              {/* Brand of the Day feature is now integrated into Nowboard panel */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="glass"
              size="icon"
              className="md:hidden rounded-xl hover:bg-[rgba(45,45,45,0.6)] transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>

            {/* Create Pulse Button */}
            <Button 
              variant="default" 
              size="sm"
              className="hidden sm:flex px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white shadow-md hover:shadow-lg items-center gap-1.5 hover:scale-[1.02] transition-all duration-300"
              onClick={() => setLocation('/create-pulse')}
            >
              <Zap className="h-4 w-4" /> Create Pulse
            </Button>
            
            {/* Settings Button removed as requested */}
            
            {/* Messages Button */}
            <Button
              variant="glass"
              size="icon"
              className={`hidden sm:flex rounded-full h-9 w-9 items-center justify-center transition-all duration-300 relative ${
                isActive('/messages') ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.3)]' : 'text-white'
              }`}
              onClick={() => {
                setLocation('/messages');
                // Mark messages as read if there are any unread
                if (hasUnreadMessages && userId) {
                  apiRequest('POST', `/api/messaging/conversations/mark-all-read?userId=${userId}`);
                  setHasUnreadMessages(false);
                }
              }}
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {/* Show active indicator */}
              {isActive('/messages') && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
              )}
              {/* Show unread messages indicator */}
              {hasUnreadMessages && !isActive('/messages') && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </Button>
            
            {/* Notification Bell */}
            <NotificationBell className="hidden sm:flex" />
            
            {/* User profile section - combined name and avatar */}
            <div 
              className={`flex items-center gap-3 cursor-pointer px-4 py-2 rounded-2xl border transition-all duration-300 ${
                isActive('/profile') 
                  ? 'border-primary/30 backdrop-blur-md bg-[rgba(0,209,255,0.08)] shadow-[0_0_15px_rgba(0,209,255,0.2)]' 
                  : 'border-[rgba(255,255,255,0.12)] backdrop-blur-md bg-[rgba(35,35,35,0.4)] hover:bg-[rgba(35,35,35,0.6)]'
              } group`}
              onClick={() => setLocation('/profile')}
            >
              {/* User name */}
              <span className="text-sm font-medium text-white hidden md:block">
                {userData?.name || (user && 'displayName' in user ? user.displayName : null) || "Profile"}
              </span>
              
              {/* User avatar */}
              <div className="relative">
                <div 
                  className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/70 transition-all"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-9 w-9 rounded-full overflow-hidden bg-[rgba(0,209,255,0.05)] flex items-center justify-center border border-[rgba(255,255,255,0.15)] shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
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
        <div className="md:hidden mt-2 backdrop-blur-xl bg-[rgba(20,20,20,0.8)] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-xl">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Button
              variant="glass"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/industry-pulse') 
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/industry-pulse');
                setIsMobileMenuOpen(false);
              }}
            >
              <Home className="h-4 w-4 mr-3 ml-0.5" />
              <span>Industry Pulse</span>
            </Button>
            
            <Button
              variant="glass"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/search') 
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/search');
                setIsMobileMenuOpen(false);
              }}
            >
              <Search className="h-4 w-4 mr-3 ml-0.5" />
              <span>Discover & Connect</span>
            </Button>
            
            <Button
              variant="glass"
              size="sm"
              className={`flex items-center py-2.5 text-sm font-medium rounded-md ${
                isActive('/messages') 
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/messages');
                setIsMobileMenuOpen(false);
                // Mark messages as read if there are any unread
                if (hasUnreadMessages && userId) {
                  apiRequest('POST', `/api/messaging/conversations/mark-all-read?userId=${userId}`);
                  setHasUnreadMessages(false);
                }
              }}
            >
              <div className="relative">
                <MessageSquare className="h-4 w-4 mr-3 ml-0.5" />
                {hasUnreadMessages && !isActive('/messages') && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </div>
              <span>Messages</span>
            </Button>
            
            <Button
              variant="glass"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/radar') 
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/radar');
                setIsMobileMenuOpen(false);
              }}
            >
              <MapPin className="h-4 w-4 mr-3 ml-0.5" />
              <span>Smart Radar</span>
            </Button>
            

            <Button
              variant="glass"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/brand-quests') || isActive('/career-quests')
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/brand-quests');
                setIsMobileMenuOpen(false);
              }}
            >
              <Trophy className="h-4 w-4 mr-3 ml-0.5" />
              <span>Brand Quests</span>
            </Button>
            
            <Button
              variant="glass"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/career-capsule') 
                  ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                  : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
              }`}
              onClick={() => {
                setLocation('/career-capsule');
                setIsMobileMenuOpen(false);
              }}
            >
              <Flag className="h-4 w-4 mr-3 ml-0.5" />
              <span>Career Capsule</span>
            </Button>
            
            {/* Career Capsule feature added to mobile menu */}
            
            {/* Brand of the Day feature is now integrated into Nowboard panel */}

            <div className="pt-4 mt-2 border-t border-[rgba(255,255,255,0.15)]">
              <Button
                variant="glass"
                size="sm"
                className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                  isActive('/profile') 
                    ? 'text-primary border-primary/30 shadow-[0_0_10px_rgba(0,209,255,0.2)]' 
                    : 'text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary'
                }`}
                onClick={() => {
                  setLocation('/profile');
                  setIsMobileMenuOpen(false);
                }}
              >
                <User className="h-4 w-4 mr-3 ml-0.5" />
                <span>My Profile</span>
              </Button>
              
              {/* Settings Button removed as requested */}
              
              <Button
                variant="glass"
                size="sm"
                className="w-full justify-start py-2.5 text-sm font-medium rounded-md text-white hover:bg-[rgba(45,45,45,0.6)] hover:text-primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <Bell className="h-4 w-4 mr-3 ml-0.5" />
                <span>Notifications</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="w-full mt-4 justify-center py-3 text-sm font-medium bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 shadow-md hover:shadow-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
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
