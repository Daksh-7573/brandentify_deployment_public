import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import NotificationList from './notification-list';
import { GlassCard } from '@/components/ui/glass-card';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isDemoMode } = useAuth();
  
  // Get the user ID for queries
  const userId = isDemoMode ? 1 : user?.uid;
  
  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const response = await apiRequest('GET', `/api/notifications/${userId}/count`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };
  
  // Fetch notifications when component mounts and every minute
  useEffect(() => {
    if (!userId) return;
    
    fetchUnreadCount();
    
    // Set up polling for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userId]);
  
  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await apiRequest('POST', `/api/notifications/${userId}/read-all`);
      setUnreadCount(0);
      fetchUnreadCount(); // Refresh count after marking all as read
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <GlassButton
          variant="glass-dark"
          size="icon"
          className={`relative rounded-full p-2 transition-all ${className}`}
          onClick={() => setIsOpen(true)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white border border-white/30 shadow-sm text-xs" 
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </GlassButton>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 mr-4 overflow-hidden backdrop-blur-md bg-white/70 dark:bg-gray-900/50 border border-white/30 dark:border-gray-800/30 shadow-xl" align="end">
        <GlassCard 
          variant="frosted" 
          className="p-0 rounded-none border-0 shadow-none"
          backgroundEffect="noise"
        >
          <NotificationList 
            userId={userId} 
            onMarkAllAsRead={handleMarkAllAsRead}
            onNotificationRead={() => fetchUnreadCount()}
          />
        </GlassCard>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;