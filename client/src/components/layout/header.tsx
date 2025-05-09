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
    <nav className="backdrop-blur-glass bg-opacity-15 border-b border-glass-border shadow-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-8">
              <div className="flex items-center">
                <div
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => setLocation('/dashboard')}
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                    <span className="text-white font-bold text-lg">B</span>
                  </div>
                  <span className="text-primary text-xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
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
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto rounded-lg ${
                  isActive('/industry-pulse') 
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
                }`}
                onClick={() => setLocation('/industry-pulse')}
              >
                <Home className="h-4 w-4" />
                <span>Industry Pulse</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto rounded-lg ${
                  isActive('/search') 
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
                }`}
                onClick={() => setLocation('/search')}
              >
                <Search className="h-4 w-4" />
                <span>Discover & Connect</span>
              </Button>
              

              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto rounded-lg ${
                  isActive('/radar') 
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
                }`}
                onClick={() => setLocation('/radar')}
              >
                <MapPin className="h-4 w-4" />
                <span>Smart Radar</span>
              </Button>
              

              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto rounded-lg ${
                  isActive('/brand-quests') || isActive('/career-quests')
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
                }`}
                onClick={() => setLocation('/brand-quests')}
              >
                <Trophy className="h-4 w-4" />
                <span>Brand Quests</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto rounded-lg ${
                  isActive('/career-capsule') 
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md p-2 hover:bg-glass-bg/25 hover:shadow-glass-hover transition-all border border-glass-border/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-glass-text" />
              ) : (
                <Menu className="h-5 w-5 text-glass-text" />
              )}
            </Button>

            {/* Create Pulse Button */}
            <Button 
              variant="default" 
              size="sm"
              className="hidden sm:flex px-4 py-2 text-sm font-medium bg-primary-glass/30 hover:bg-primary-glass/40 backdrop-blur-sm text-white shadow-glass-glow items-center gap-1.5 border border-glass-border"
              onClick={() => setLocation('/create-pulse')}
            >
              <Zap className="h-4 w-4" /> Create Pulse
            </Button>
            
            {/* Settings Button removed as requested */}
            
            {/* Messages Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`hidden sm:flex rounded-full h-9 w-9 items-center justify-center transition-all relative ${
                isActive('/messages') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border ${
                isActive('/profile') 
                  ? 'border-glass-border bg-primary-glass/20 text-white shadow-glass-glow' 
                  : 'border-glass-border hover:bg-glass-bg/25 hover:shadow-glass-hover'
              } transition-all duration-200 group`}
              onClick={() => setLocation('/profile')}
            >
              {/* User name */}
              <span className="text-sm font-medium text-glass-text hidden md:block">
                {userData?.name || (user && 'displayName' in user ? user.displayName : null) || "Profile"}
              </span>
              
              {/* User avatar */}
              <div className="relative">
                <div 
                  className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/70 transition-all"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-glass-bg/30 flex items-center justify-center border border-glass-border shadow-glass group-hover:shadow-glass-glow transition-all">
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
        <div className="md:hidden backdrop-blur-sm bg-glass-bg/10 border-b border-glass-border shadow-glass">
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/industry-pulse') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/search') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="sm"
              className={`flex items-center py-2.5 text-sm font-medium rounded-md ${
                isActive('/messages') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/radar') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/brand-quests') || isActive('/career-quests')
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/career-capsule') 
                  ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                  : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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

            <div className="pt-4 mt-2 border-t border-glass-border/50">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                  isActive('/profile') 
                    ? 'text-white bg-primary-glass/20 backdrop-blur-sm shadow-glass-glow' 
                    : 'text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover'
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
                variant="ghost"
                size="sm"
                className="w-full justify-start py-2.5 text-sm font-medium rounded-md text-glass-text hover:bg-glass-bg/25 hover:shadow-glass-hover"
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
                className="w-full mt-3 justify-center py-3 text-sm font-medium bg-primary-glass/30 hover:bg-primary-glass/40 backdrop-blur-sm text-white shadow-glass-glow rounded-md border border-glass-border"
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
