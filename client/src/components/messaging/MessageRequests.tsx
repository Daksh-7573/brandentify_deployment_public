import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, Clock, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConnectionRequest {
  id: number;
  senderId: number;
  receiverId: number;
  reason: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  senderName?: string;
  senderPhotoUrl?: string;
}

const MessageRequests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch pending connection requests
  const { data: requests, isLoading, error } = useQuery<ConnectionRequest[]>({
    queryKey: ['/api/users', user?.id, 'received-connection-requests'],
    enabled: !!user?.id,
    queryFn: async () => {
      console.log(`[MessageRequests] 🔍 Fetching requests for user ${user?.id}`);
      const response = await apiRequest('GET', `/api/users/${user?.id}/received-connection-requests`);
      const allRequests = await response.json() as ConnectionRequest[];
      console.log(`[MessageRequests] 📦 Received ${allRequests.length} total requests from API`);
      console.log(`[MessageRequests] 📋 ALL requests:`, allRequests.map(r => ({
        id: r.id,
        senderId: r.senderId,
        receiverId: r.receiverId,
        status: r.status,
        statusType: typeof r.status,
        statusValue: `"${r.status}"`,
        senderName: r.senderName,
        createdAt: r.createdAt
      })));
      
      // Count by status
      const statusCounts = allRequests.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`[MessageRequests] 📊 Status breakdown:`, statusCounts);
      
      // Filter for pending only
      const pendingRequests = allRequests.filter(r => r.status === 'pending');
      console.log(`[MessageRequests] ✅ Filtered to ${pendingRequests.length} PENDING requests`);
      
      if (pendingRequests.length > 0) {
        console.log(`[MessageRequests] 📋 PENDING requests:`, pendingRequests.map(r => ({
          id: r.id,
          senderName: r.senderName,
          reason: r.reason,
          message: r.message?.substring(0, 50)
        })));
      } else {
        console.log(`[MessageRequests] ⚠️ No pending requests found!`);
      }
      
      return pendingRequests;
    },
  });

  // Accept connection request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: number) => {
      console.log(`[MessageRequests] Accepting request ${requestId}`);
      return await apiRequest('PUT', `/api/connection-requests/${requestId}/accept`);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      console.log(`[MessageRequests] ✅ Request accepted, conversation:`, data.conversation);
      
      toast({
        title: "Connection accepted!",
        description: "You can now message each other.",
      });
      
      // Invalidate both connection requests and conversations
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'received-connection-requests'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/messaging/conversations');
        }
      });
    },
    onError: (error: any) => {
      console.error(`[MessageRequests] ❌ Accept error:`, error);
      toast({
        title: "Failed to accept connection",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Decline connection request mutation
  const declineMutation = useMutation({
    mutationFn: async (requestId: number) => {
      console.log(`[MessageRequests] Declining request ${requestId}`);
      return await apiRequest('PUT', `/api/connection-requests/${requestId}/decline`);
    },
    onSuccess: () => {
      toast({
        title: "Request declined",
        description: "The connection request has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'received-connection-requests'] });
    },
    onError: (error: any) => {
      console.error(`[MessageRequests] ❌ Decline error:`, error);
      toast({
        title: "Failed to decline request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Log if there's an error fetching
  if (error) {
    console.error(`[MessageRequests] ❌ Error fetching requests:`, error);
  }

  // Log current state
  console.log(`[MessageRequests] Current state:`, {
    isLoading,
    hasError: !!error,
    requestCount: requests?.length || 0,
    userId: user?.id
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-red-500">Error Loading Requests</h3>
          <p className="text-spotify-light-gray text-sm mb-4">
            {error instanceof Error ? error.message : 'Failed to load message requests'}
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'received-connection-requests'] })}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-spotify-white" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-spotify-glass-highlight flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-spotify-white" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-spotify-white">No Message Requests</h3>
          <p className="text-spotify-light-gray text-sm">
            When someone wants to connect with you, their request will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-spotify-white mb-1">Message Requests</h3>
        <p className="text-sm text-spotify-light-gray">
          {requests.length} {requests.length === 1 ? 'person wants' : 'people want'} to connect with you
        </p>
      </div>

      {requests.map((request) => (
        <div
          key={request.id}
          className="neo-glass-card p-4 hover:bg-white/5 transition-all"
          data-testid={`message-request-${request.id}`}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              {request.senderPhotoUrl ? (
                <AvatarImage src={request.senderPhotoUrl} alt={request.senderName || 'User'} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                  {request.senderName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">
                {request.senderName || 'Unknown User'}
              </h4>

              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">Purpose: </span>
                  <span className="text-gray-200">{request.reason}</span>
                </div>

                {request.message && (
                  <div className="text-sm">
                    <p className="text-gray-200 pl-3 border-l-2 border-purple-500 italic">
                      "{request.message}"
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(request.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => acceptMutation.mutate(request.id)}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
                  data-testid={`button-accept-${request.id}`}
                >
                  {acceptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => declineMutation.mutate(request.id)}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10 h-9"
                  data-testid={`button-decline-${request.id}`}
                >
                  {declineMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageRequests;
