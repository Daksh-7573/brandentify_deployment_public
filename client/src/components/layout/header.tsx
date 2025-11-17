import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Settings, Menu, X, Home, Search, Bot, User, MapPin, FileText, Trophy, Award, Calendar, Flag, Bell, MessageSquare, Shield, Crown } from "lucide-react";
import NotificationBell from "@/components/notifications/notification-bell";
import { PremiumBadge } from "@/components/ui/premium-badge";

export default function Header() {
  const { user, signOut } = useAuth();
  const [path, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  // Helper function to check if current path matches
  const isActive = (routePath: string) => path === routePath;
  
  // PERFORMANCE FIX: Use same numeric database ID logic as all other pages
  // This eliminates redundant API calls and cache inconsistencies
  const userId = user?.id || 1; // Use numeric database ID or demo fallback
  
  // Use TanStack Query to fetch and cache user data
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log(`[HEADER PERFORMANCE] Fetching user data for ID: ${userId}`);
      const response = await apiRequest('GET', `/api/users/${userId}`);
      
      if (response.status === 404) {
        console.error(`User with ID ${userId} not found in backend`);
        return null;
      }
      
      const data = await response.json();
      console.log("[HEADER PERFORMANCE] User data loaded:", data ? 'SUCCESS' : 'NULL');
      return data;
    },
    enabled: !!userId, // Only run query if userId exists
    staleTime: 0, // Always consider data stale so updates show immediately
    refetchOnWindowFocus: false // Don't auto-refetch to avoid unnecessary calls
  });
  
  // Force refresh data when component mounts
  useEffect(() => {
    // Immediately trigger a refresh of user data when header loads
    if (userId) {
      console.log("Header mounted - invalidating user query");
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    }
  }, [userId]);
  
  // PERFORMANCE FIX: Function to check for unread messages using numeric user ID
  const checkUnreadMessages = useCallback(async () => {
    if (!userId) return;
    
    try {
      // Use numeric user ID for consistency across all API calls
      const response = await apiRequest('GET', `/api/messaging/unread/count?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setHasUnreadMessages(data.count > 0);
        console.log('[HEADER PERFORMANCE] Unread messages check completed for userId:', userId);
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
        console.log('[HEADER PERFORMANCE] Marking all messages as read for userId:', userId);
        apiRequest('POST', `/api/messaging/conversations/mark-all-read?userId=${userId}`);
      }
    }
  }, [path, checkUnreadMessages, userId]);
  
  // PROFILE PICTURE PERSISTENCE FIX: Listen for profile picture updates
  useEffect(() => {
    const handleProfilePictureUpdate = (event: CustomEvent) => {
      const { newPhotoURL } = event.detail;
      console.log('[HEADER] 🖼️ Profile picture updated event received, refreshing header data');
      
      // Immediately update cache with new photo
      if (userId) {
        queryClient.setQueryData(['/api/users', userId], (oldData: any) => {
          if (oldData) {
            console.log('[HEADER] ✅ Immediate cache update with new profile picture');
            return {
              ...oldData,
              photoURL: newPhotoURL
            };
          }
          return oldData;
        });
        
        // Also invalidate to ensure fresh data from server
        queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      }
    };

    // Add event listener for profile picture updates
    window.addEventListener('profile-picture-updated', handleProfilePictureUpdate as EventListener);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('profile-picture-updated', handleProfilePictureUpdate as EventListener);
    };
  }, [userId]);

  // PERFORMANCE FIX: Determine photo URL with proper loading states
  // Wait for userData to load before showing any photo to prevent flicker
  const getPhotoURL = () => {
    // Show placeholder while loading to prevent flicker
    if (isLoading) {
      return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
    }
    
    // Priority: Custom Upload > Google Photo > Default
    return userData?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };
  
  const photoURL = getPhotoURL();
  
  // Performance monitoring logs
  console.log('[HEADER PERFORMANCE] isLoading:', isLoading);
  console.log('[HEADER PERFORMANCE] userData ready:', !!userData);
  console.log('[HEADER PERFORMANCE] Photo source:', 
    isLoading ? 'LOADING_PLACEHOLDER' : 
    userData?.photoURL ? 'CUSTOM_UPLOAD' : 
    user?.photoURL ? 'GOOGLE_PHOTO' : 'DEFAULT');
  console.log('[HEADER PERFORMANCE] userId:', userId);

  return (
    <nav className="neo-glass-panel fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-8">
              <div className="flex items-center">
                <div
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => setLocation('/dashboard')}
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-white to-white/60 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                    <span className="text-black font-bold text-lg">B</span>
                  </div>
                  <span className="text-xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                    Brandentifier
                  </span>
                </div>
                {userId === 1 && (
                  <Badge variant="outline" className="ml-2 text-orange-500 border-orange-500">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Main Navigation */}
            <div className="hidden md:flex space-x-6">
              {/* HERO: Brand Quests - Primary Feature */}
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-semibold px-4 py-2 h-auto relative ${
                  isActive('/brand-quests') || isActive('/career-quests')
                    ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 neo-glass-nav-item active shadow-lg border border-white/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/10 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/brand-quests')}
              >
                <Trophy className="h-5 w-5" />
                <span>Brand Quests</span>
                {/* AI-Powered badge */}
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/industry-pulse') 
                    ? 'text-white bg-white/10 hover:bg-white/15 neo-glass-nav-item active' 
                    : 'text-white/80 hover:text-white hover:bg-white/5 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/industry-pulse')}
              >
                <Home className="h-4 w-4" />
                <span>Industry Pulse</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/search') 
                    ? 'text-white bg-white/10 hover:bg-white/15 neo-glass-nav-item active' 
                    : 'text-white/80 hover:text-white hover:bg-white/5 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/search')}
              >
                <Search className="h-4 w-4" />
                <span>Discover & Connect</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/radar') 
                    ? 'text-white bg-white/10 hover:bg-white/15 neo-glass-nav-item active' 
                    : 'text-white/80 hover:text-white hover:bg-white/5 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/radar')}
              >
                <MapPin className="h-4 w-4" />
                <span>Smart Radar</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/career-capsule') 
                    ? 'text-white bg-white/10 hover:bg-white/15 neo-glass-nav-item active' 
                    : 'text-white/80 hover:text-white hover:bg-white/5 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/career-capsule')}
              >
                <Flag className="h-4 w-4" />
                <span>Career Capsule</span>
              </Button>
              
              {/* Privacy & Data Control - Hidden temporarily */}
              {/* <Button
                variant="ghost"
                size="sm" 
                className={`flex items-center gap-2 font-medium px-3 py-2 h-auto ${
                  isActive('/privacy') 
                    ? 'text-white bg-white/10 hover:bg-white/15 neo-glass-nav-item active' 
                    : 'text-white/80 hover:text-white hover:bg-white/5 neo-glass-nav-item'
                }`}
                onClick={() => setLocation('/privacy')}
              >
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </Button> */}
              
              {/* Career Capsule feature added */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md h-9 w-9 backdrop-blur-sm border text-white/90 bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Premium Upgrade or Status */}
            {(userData as any)?.subscriptionTier === 'premium' ? (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
                <PremiumBadge size="sm" showTooltip={false} />
                <span className="text-xs font-medium text-yellow-400">Premium</span>
              </div>
            ) : (
              <button 
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-yellow-500/30 transition-all hover:scale-105"
                onClick={() => setLocation('/pricing')}
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade to Premium</span>
              </button>
            )}
            
            {/* Create Pulse Button */}
            <button 
              className="neo-glass-button hidden sm:flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
              onClick={() => setLocation('/create-pulse-new')}
            >
              <Zap className="h-4 w-4" />
              <span>Create Pulse</span>
            </button>
            
            {/* Settings Button removed as requested */}
            
            {/* Messages Icon */}
            <div
              className={`hidden sm:flex cursor-pointer relative transition-all duration-300 ${
                isActive('/messages') 
                  ? 'text-white' 
                  : 'text-white/90 hover:text-white'
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
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              )}
              {/* Show unread messages indicator */}
              {hasUnreadMessages && !isActive('/messages') && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-white/30"></span>
              )}
            </div>
            
            {/* Notification Bell */}
            <NotificationBell className="hidden sm:flex" />
            
            {/* User profile section - combined name and avatar */}
            <div 
              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all duration-300 group ${
                isActive('/profile') 
                  ? 'text-white bg-white/20 border-white/40 shadow-md' 
                  : 'text-white/90 bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
              }`}
              onClick={() => setLocation('/profile')}
            >
              {/* User name */}
              <span className="text-sm font-medium text-white hidden md:block">
                {userData?.name || (user && 'displayName' in user ? user.displayName : null) || "Profile"}
              </span>
              
              {/* User avatar */}
              <div className="relative">
                <div 
                  className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/30 transition-all"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/20 shadow-sm group-hover:shadow-md transition-all">
                    <img 
                      className="h-full w-full object-cover" 
                      src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                      alt="User profile"
                      onLoad={() => {
                        console.log('[HEADER IMAGE DEBUG] Image loaded successfully');
                        console.log('[HEADER IMAGE DEBUG] Image source type:', photoURL?.startsWith('data:') ? 'BASE64' : 'URL');
                        console.log('[HEADER IMAGE DEBUG] Image source length:', photoURL?.length || 'N/A');
                      }}
                      onError={(e) => {
                        console.error('[HEADER IMAGE DEBUG] Image failed to load');
                        console.error('[HEADER IMAGE DEBUG] Failed source type:', photoURL?.startsWith('data:') ? 'BASE64' : 'URL');
                        console.error('[HEADER IMAGE DEBUG] Failed source length:', photoURL?.length || 'N/A');
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
        <div className="md:hidden neo-glass-card border-0 shadow-2xl">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {/* HERO: Brand Quests First */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-semibold rounded-md relative ${
                isActive('/brand-quests') || isActive('/career-quests')
                  ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-600/30 border border-white/20' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setLocation('/brand-quests');
                setIsMobileMenuOpen(false);
              }}
            >
              <Trophy className="h-5 w-5 mr-3 ml-0.5" />
              <span>Brand Quests</span>
              <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/industry-pulse') 
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setLocation('/career-capsule');
                setIsMobileMenuOpen(false);
              }}
            >
              <Flag className="h-4 w-4 mr-3 ml-0.5" />
              <span>Career Capsule</span>
            </Button>
            
            {/* Privacy - Hidden temporarily */}
            {/* <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                isActive('/privacy') 
                  ? 'text-white bg-white/20 hover:bg-white/25' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setLocation('/privacy');
                setIsMobileMenuOpen(false);
              }}
            >
              <Shield className="h-4 w-4 mr-3 ml-0.5" />
              <span>Privacy</span>
            </Button> */}
            
            {/* Career Capsule feature added to mobile menu */}
            


            <div className="pt-4 mt-2 border-t border-white/20">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start py-2.5 text-sm font-medium rounded-md ${
                  isActive('/profile') 
                    ? 'text-white bg-white/20 hover:bg-white/25' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
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
                className="w-full justify-start py-2.5 text-sm font-medium rounded-md text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <Bell className="h-4 w-4 mr-3 ml-0.5" />
                <span>Notifications</span>
              </Button>
              
              <button
                className="neo-glass-button w-full mt-3 flex items-center justify-center gap-1 py-1.5 px-3 whitespace-nowrap"
                onClick={() => {
                  setLocation('/create-pulse-new');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Zap className="h-4 w-4" />
                <span>Create Pulse</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
