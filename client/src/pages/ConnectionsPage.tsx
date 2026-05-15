import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  receiverName?: string;
  receiverPhotoUrl?: string;
}

export default function ConnectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("received");
  const wsRef = useRef<WebSocket | null>(null);

  // 🔥 WebSocket connection for real-time connection request notifications
  useEffect(() => {
    if (!user?.id) return;

    // Get WebSocket URL based on current environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[ConnectionsPage] 🔌 Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[ConnectionsPage] ✅ WebSocket connected');
      // Authenticate the WebSocket connection
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[ConnectionsPage] 📩 WebSocket message received:', data);

        if (data.type === 'auth_success') {
          console.log('[ConnectionsPage] ✅ WebSocket authenticated');
        } else if (data.type === 'connection_request') {
          console.log('[ConnectionsPage] 🔔 New connection request received!', data);
          
          // Show toast notification
          toast({
            title: "New Connection Request",
            description: `${data.senderName || 'Someone'} wants to connect with you!`,
          });

          // Automatically refresh the received connection requests query
          queryClient.invalidateQueries({ 
            queryKey: ['/api/users', user.id, 'received-connection-requests'] 
          });
          console.log('[ConnectionsPage] ♻️  Invalidated received-connection-requests query');
        }
      } catch (error) {
        console.error('[ConnectionsPage] ❌ Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[ConnectionsPage] ❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('[ConnectionsPage] 🔌 WebSocket disconnected');
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.id, toast]);

  // Fetch received connection requests
  const { data: receivedRequests, isLoading: isLoadingReceived, error: receivedError } = useQuery<ConnectionRequest[]>({
    queryKey: ['/api/users', user?.id, 'received-connection-requests'],
    enabled: !!user?.id,
    onSuccess: (data) => {
      console.log(`[ConnectionsPage] ✅ Received requests loaded:`, data?.length || 0, 'requests');
      if (data && data.length > 0) {
        console.log(`[ConnectionsPage] First request:`, data[0]);
      }
    },
    onError: (error: any) => {
      console.error(`[ConnectionsPage] ❌ Error loading received requests:`, error);
    },
  });

  // Fetch sent connection requests
  const { data: sentRequests, isLoading: isLoadingSent, error: sentError } = useQuery<ConnectionRequest[]>({
    queryKey: ['/api/users', user?.id, 'sent-connection-requests'],
    enabled: !!user?.id,
    onSuccess: (data) => {
      console.log(`[ConnectionsPage] ✅ Sent requests loaded:`, data?.length || 0, 'requests');
    },
    onError: (error: any) => {
      console.error(`[ConnectionsPage] ❌ Error loading sent requests:`, error);
    },
  });

  // Accept connection request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest('PUT', `/api/connection-requests/${requestId}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Connection accepted!",
        description: "You can now message each other.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'received-connection-requests'] });
    },
    onError: (error: any) => {
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
      return await apiRequest('PUT', `/api/connection-requests/${requestId}/decline`);
    },
    onSuccess: () => {
      toast({
        title: "Connection declined",
        description: "The request has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'received-connection-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to decline connection",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Cancel connection request mutation
  const cancelMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest('PUT', `/api/connection-requests/${requestId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Request cancelled",
        description: "Your connection request has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'sent-connection-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const pendingReceived = receivedRequests?.filter(r => r.status === 'pending') || [];
  const pendingSent = sentRequests?.filter(r => r.status === 'pending') || [];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="neo-glass-card p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Connections</h1>
          <p className="text-gray-300">Manage your connection requests and network</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="neo-glass-card mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="received" data-testid="tab-received-connections">
              Received ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger value="sent" data-testid="tab-sent-connections">
              Sent ({pendingSent.length})
            </TabsTrigger>
          </TabsList>

          {/* Received Requests Tab */}
          <TabsContent value="received">
            <div className="space-y-4">
              {isLoadingReceived ? (
                <div className="neo-glass-card p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-white" />
                  <p className="text-gray-300 mt-2">Loading requests...</p>
                </div>
              ) : pendingReceived.length === 0 ? (
                <div className="neo-glass-card p-12 text-center">
                  <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-300 text-lg">No pending connection requests</p>
                  <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
                </div>
              ) : (
                pendingReceived.map((request) => (
                  <div 
                    key={request.id} 
                    className="neo-glass-card p-6 hover:bg-white/5 transition-all"
                    data-testid={`connection-request-${request.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {request.senderPhotoUrl ? (
                          <img 
                            src={request.senderPhotoUrl} 
                            alt={request.senderName || 'User'} 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                            {request.senderName?.[0] || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {request.senderName || 'Unknown User'}
                        </h3>
                        
                        <div className="space-y-2 mt-3">
                          <div className="text-sm">
                            <span className="text-gray-400">Purpose: </span>
                            <span className="text-gray-200">{request.reason}</span>
                          </div>
                          
                          {request.message && (
                            <div className="text-sm">
                              <span className="text-gray-400">Message: </span>
                              <p className="text-gray-200 mt-1 pl-4 border-l-2 border-purple-500">
                                {request.message}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={() => acceptMutation.mutate(request.id)}
                            disabled={acceptMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
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
                            disabled={declineMutation.isPending}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
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
                ))
              )}
            </div>
          </TabsContent>

          {/* Sent Requests Tab */}
          <TabsContent value="sent">
            <div className="space-y-4">
              {isLoadingSent ? (
                <div className="neo-glass-card p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-white" />
                  <p className="text-gray-300 mt-2">Loading requests...</p>
                </div>
              ) : pendingSent.length === 0 ? (
                <div className="neo-glass-card p-12 text-center">
                  <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-300 text-lg">No pending sent requests</p>
                  <p className="text-gray-400 text-sm mt-2">Visit portfolios to send connection requests</p>
                </div>
              ) : (
                pendingSent.map((request) => (
                  <div 
                    key={request.id} 
                    className="neo-glass-card p-6 hover:bg-white/5 transition-all"
                    data-testid={`sent-request-${request.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {request.receiverPhotoUrl ? (
                          <img 
                            src={request.receiverPhotoUrl} 
                            alt={request.receiverName || 'User'} 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                            {request.receiverName?.[0] || 'U'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {request.receiverName || 'Unknown User'}
                        </h3>
                        
                        <div className="space-y-2 mt-3">
                          <div className="text-sm">
                            <span className="text-gray-400">Purpose: </span>
                            <span className="text-gray-200">{request.reason}</span>
                          </div>
                          
                          {request.message && (
                            <div className="text-sm">
                              <span className="text-gray-400">Your message: </span>
                              <p className="text-gray-200 mt-1 pl-4 border-l-2 border-blue-500">
                                {request.message}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="w-3 h-3" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Clock className="w-3 h-3" />
                              Pending
                            </div>
                          </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="mt-4">
                          <Button
                            onClick={() => cancelMutation.mutate(request.id)}
                            disabled={cancelMutation.isPending}
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:bg-gray-500/10"
                            data-testid={`button-cancel-${request.id}`}
                          >
                            {cancelMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Cancel Request
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
