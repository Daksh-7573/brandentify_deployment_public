import { useState, useEffect } from 'react';
import { Check, X, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Define notification types based on schema
interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  category: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationListProps {
  userId?: number | string;
  onMarkAllAsRead: () => void;
  onNotificationRead: () => void;
}

export default function NotificationList({ 
  userId, 
  onMarkAllAsRead,
  onNotificationRead
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch notifications when component mounts
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);
  
  // Mark a notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      onNotificationRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Delete a notification
  const handleDelete = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/notifications/${id}`);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
      onNotificationRead();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-600 hover:bg-green-100">✓</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-600 hover:bg-red-100">!</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-600 hover:bg-yellow-100">⚠</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">i</Badge>;
    }
  };
  
  return (
    <div className="max-h-[450px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent dark:from-gray-800/20 dark:to-transparent">
        <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">Notifications</h3>
        <GlassButton 
          variant="glass-dark" 
          size="sm" 
          onClick={onMarkAllAsRead}
          className="text-xs rounded-full px-3 text-white bg-gray-800/40"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Mark all as read
        </GlassButton>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}
      >
        <div className="border-b border-white/10 px-2 bg-white/5 dark:bg-gray-900/20">
          <TabsList className="grid grid-cols-2 h-12 bg-transparent">
            <TabsTrigger 
              value="all" 
              className={cn(
                "text-sm rounded-full data-[state=active]:bg-white/20 data-[state=active]:backdrop-blur-lg dark:data-[state=active]:bg-gray-800/40",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              )}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className={cn(
                "text-sm rounded-full data-[state=active]:bg-white/20 data-[state=active]:backdrop-blur-lg dark:data-[state=active]:bg-gray-800/40",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
              )}
            >
              Unread
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <div className="overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border-b border-white/10 last:border-0 transition-all",
                    "hover:bg-white/10 dark:hover:bg-gray-800/20 backdrop-blur-sm",
                    !notification.isRead ? "bg-blue-50/20 dark:bg-blue-900/10" : "bg-transparent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1 text-gray-800 dark:text-gray-100">{notification.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!notification.isRead && (
                        <GlassButton
                          variant="glass"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </GlassButton>
                      )}
                      <GlassButton
                        variant="glass"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-full mb-4 shadow-sm border border-white/20 dark:border-gray-700/30">
                  <Bell className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === 'all' 
                    ? "You don't have any notifications yet" 
                    : "You don't have any unread notifications"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          <div className="overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border-b border-white/10 last:border-0 transition-all",
                    "hover:bg-white/10 dark:hover:bg-gray-800/20 backdrop-blur-sm",
                    "bg-blue-50/20 dark:bg-blue-900/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1 text-gray-800 dark:text-gray-100">{notification.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <GlassButton
                        variant="glass"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </GlassButton>
                      <GlassButton
                        variant="glass"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-full mb-4 shadow-sm border border-white/20 dark:border-gray-700/30">
                  <Bell className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">No unread notifications</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  All caught up! You've read all your notifications.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}