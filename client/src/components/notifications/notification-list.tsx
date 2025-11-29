import { useState, useEffect } from 'react';
import { Check, X, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
  metadata?: Record<string, any>; // JSON object with approval-related data
  actionUrl?: string; // URL for approval actions
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
  const [activeTab, setActiveTab] = useState<'new' | 'read'>('new');
  const { toast } = useToast();
  
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
  
  // Handle approve action for team member/client requests
  const handleApprove = async (notification: Notification) => {
    try {
      let endpoint = '';
      const isTeamMember = notification.category === 'team_member_request';
      
      if (isTeamMember && notification.metadata) {
        const collaboratorId = notification.metadata.collaboratorId;
        if (collaboratorId) {
          endpoint = `/api/projects/collaborators/${collaboratorId}/approve`;
        }
      } else if (notification.category === 'client_request' && notification.metadata) {
        const endorsementId = notification.metadata.endorsementId;
        if (endorsementId) {
          endpoint = `/api/projects/endorsements/${endorsementId}/approve`;
        }
      }
      
      if (!endpoint) {
        toast({
          title: "Error",
          description: "Invalid request data",
          variant: "destructive"
        });
        return;
      }
      
      const response = await apiRequest('POST', endpoint);
      if (response.ok) {
        toast({
          title: "Approved",
          description: isTeamMember ? "Team member request approved successfully" : "Client request approved successfully"
        });
        // Remove the notification after approval
        await handleDelete(notification.id);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to approve request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "An error occurred while approving the request",
        variant: "destructive"
      });
    }
  };
  
  // Handle decline action for team member/client requests
  const handleDecline = async (notification: Notification) => {
    try {
      let endpoint = '';
      const isTeamMember = notification.category === 'team_member_request';
      
      if (isTeamMember && notification.metadata) {
        const collaboratorId = notification.metadata.collaboratorId;
        if (collaboratorId) {
          endpoint = `/api/projects/collaborators/${collaboratorId}/decline`;
        }
      } else if (notification.category === 'client_request' && notification.metadata) {
        const endorsementId = notification.metadata.endorsementId;
        if (endorsementId) {
          endpoint = `/api/projects/endorsements/${endorsementId}/decline`;
        }
      }
      
      if (!endpoint) {
        toast({
          title: "Error",
          description: "Invalid request data",
          variant: "destructive"
        });
        return;
      }
      
      const response = await apiRequest('POST', endpoint);
      if (response.ok) {
        toast({
          title: "Declined",
          description: isTeamMember ? "Team member request declined" : "Client request declined"
        });
        // Remove the notification after declining
        await handleDelete(notification.id);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to decline request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Error",
        description: "An error occurred while declining the request",
        variant: "destructive"
      });
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'new' 
    ? notifications.filter(notification => !notification.isRead)
    : notifications.filter(notification => notification.isRead);
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-spotify-glass-highlight text-spotify-white border border-spotify-glass-border">✓</Badge>;
      case 'error':
        return <Badge className="bg-spotify-glass-highlight text-spotify-white border border-spotify-glass-border">!</Badge>;
      case 'warning':
        return <Badge className="bg-spotify-glass-highlight text-spotify-white border border-spotify-glass-border">⚠</Badge>;
      case 'info':
      default:
        return <Badge className="bg-spotify-glass-highlight text-spotify-white border border-spotify-glass-border">i</Badge>;
    }
  };
  
  // Render action buttons based on notification category
  const renderActionButtons = (notification: Notification) => {
    const isApprovalRequest = notification.category === 'team_member_request' || notification.category === 'client_request';
    
    if (isApprovalRequest) {
      return (
        <div className="flex gap-2 mt-2">
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
            onClick={() => handleApprove(notification)}
            data-testid="button-approve-request"
          >
            <Check className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/20 h-7 text-xs"
            onClick={() => handleDecline(notification)}
            data-testid="button-decline-request"
          >
            <X className="h-3 w-3 mr-1" />
            Decline
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="max-h-[450px] overflow-hidden flex flex-col text-spotify-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-800/20">
        <h3 className="font-semibold text-base text-spotify-white">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMarkAllAsRead}
          className="text-xs text-spotify-light-gray hover:text-spotify-white hover:bg-spotify-glass-highlight"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Mark all as read
        </Button>
      </div>
      
      <Tabs 
        defaultValue="new" 
        className="w-full" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'new' | 'read')}
      >
        <div className="border-b border-gray-800/20 px-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="new" className="mt-0">
          <div className="overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-spotify-glass-highlight" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-spotify-glass-highlight" />
                      <Skeleton className="h-3 w-3/4 bg-spotify-glass-highlight" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b border-gray-800/20 last:border-0 hover:bg-spotify-glass-highlight transition-colors bg-spotify-glass-highlight/40`}
                  data-testid={`notification-item-new-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1 text-spotify-white" data-testid={`text-notification-title-${notification.id}`}>{notification.title}</p>
                      <p className="text-sm text-spotify-light-gray line-clamp-2 mt-0.5" data-testid={`text-notification-message-${notification.id}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-spotify-light-gray/70 mt-1" data-testid={`text-notification-time-${notification.id}`}>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {renderActionButtons(notification)}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-spotify-white/10 text-spotify-light-gray hover:text-spotify-white"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Mark as read"
                        data-testid={`button-mark-read-${notification.id}`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-spotify-white/10 text-spotify-light-gray hover:text-spotify-white"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete notification"
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-spotify-glass-highlight p-3 rounded-full mb-3">
                  <Bell className="h-6 w-6 text-spotify-light-gray" />
                </div>
                <h3 className="text-base font-medium text-spotify-white">No new notifications</h3>
                <p className="mt-1 text-sm text-spotify-light-gray">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="read" className="mt-0">
          <div className="overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-spotify-glass-highlight" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-spotify-glass-highlight" />
                      <Skeleton className="h-3 w-3/4 bg-spotify-glass-highlight" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="p-3 border-b border-gray-800/20 last:border-0 hover:bg-spotify-glass-highlight transition-colors"
                  data-testid={`notification-item-read-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1 text-spotify-white" data-testid={`text-notification-title-read-${notification.id}`}>{notification.title}</p>
                      <p className="text-sm text-spotify-light-gray line-clamp-2 mt-0.5" data-testid={`text-notification-message-read-${notification.id}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-spotify-light-gray/70 mt-1" data-testid={`text-notification-time-read-${notification.id}`}>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {renderActionButtons(notification)}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-spotify-white/10 text-spotify-light-gray hover:text-spotify-white"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete notification"
                        data-testid={`button-delete-read-${notification.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-spotify-glass-highlight p-3 rounded-full mb-3">
                  <Bell className="h-6 w-6 text-spotify-light-gray" />
                </div>
                <h3 className="text-base font-medium text-spotify-white">No read notifications</h3>
                <p className="mt-1 text-sm text-spotify-light-gray">
                  Your read notifications will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
