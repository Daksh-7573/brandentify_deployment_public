import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types
export type Message = {
  id: string;
  conversationId: number;
  senderId: number;
  content: string;
  sentAt: string;
  readAt: string | null;
  replyToId: string | null;
  senderName?: string;
  senderPhotoURL?: string;
};

export type Conversation = {
  id: number;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
  lastMessage?: Message;
  participants?: Array<{
    id: number;
    userId: number;
    userName?: string;
    userPhotoURL?: string;
  }>;
  unreadCount?: number;
};

// Context type
type ChatContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  loadingConversations: boolean;
  socket: WebSocket | null;
  sendMessage: (content: string, conversationId: number, recipientId?: number) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  createConversation: (title: string | null, userIds: number[]) => Promise<Conversation>;
  markConversationAsRead: (conversationId: number) => void;
  isConnected: boolean;
};

// Create context with default values
const ChatContext = createContext<ChatContextType>({
  conversations: [],
  currentConversation: null,
  messages: [],
  loadingMessages: false,
  loadingConversations: false,
  socket: null,
  sendMessage: () => {},
  setCurrentConversation: () => {},
  createConversation: async () => ({ 
    id: 0, 
    title: null, 
    isGroup: false, 
    createdAt: new Date().toISOString() 
  }),
  markConversationAsRead: () => {},
  isConnected: false,
});

export const ChatProvider: React.FC<{ children: ReactNode; userId: number }> = ({ 
  children,
  userId,
}) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Set up WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate with the server
      ws.send(JSON.stringify({ 
        type: 'auth',
        userId: userId.toString()
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          setIsConnected(true);
          console.log('WebSocket authenticated');
        } else if (data.type === 'new_message') {
          // Handle incoming message
          const newMessage: Message = {
            id: data.id || crypto.randomUUID(),
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            sentAt: data.timestamp || new Date().toISOString(),
            readAt: null,
            replyToId: null,
            senderName: data.senderName,
          };
          
          // Add to messages if in current conversation
          if (currentConversation && currentConversation.id === data.conversationId) {
            queryClient.setQueryData<Message[]>(
              ['/api/messaging/conversations', currentConversation.id, 'messages'],
              (oldMessages) => [...(oldMessages || []), newMessage]
            );
          }
          
          // Invalidate conversations to refresh unread counts
          queryClient.invalidateQueries({ 
            predicate: (query) => {
              const key = query.queryKey[0];
              return typeof key === 'string' && key.startsWith('/api/messaging/conversations');
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [userId, queryClient]);

  // Fetch conversations
  const { data: conversationsData, isLoading: loadingConversations, error: conversationsError } = useQuery({
    queryKey: ['/api/messaging/conversations', userId],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations?userId=${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Convert data to proper types
  const conversations: Conversation[] = Array.isArray(conversationsData) ? conversationsData : [];

  // Auto-select most recent conversation when they load and none is selected
  useEffect(() => {
    if (!currentConversation && conversations.length > 0 && !loadingConversations) {
      const sorted = [...conversations].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (sorted[0]) {
        setCurrentConversation(sorted[0]);
      }
    }
  }, [conversations, currentConversation, loadingConversations, setCurrentConversation]);

  // Fetch messages for current conversation
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['/api/messaging/conversations', currentConversation?.id, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations/${currentConversation?.id}/messages`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!currentConversation,
  });
  
  // Convert data to proper types
  const messages: Message[] = Array.isArray(messagesData) ? messagesData : [];

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ title, userIds }: { title: string | null, userIds: number[] }) => {
      const response = await apiRequest('POST', '/api/messaging/conversations', {
        title, 
        userIds
      });
      const data = await response.json();
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/messaging/conversations');
        }
      });
    },
  });

  // Mark conversation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await apiRequest('PATCH', `/api/messaging/conversations/${conversationId}/read`, {
        userId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/messaging/conversations');
        }
      });
    },
  });

  // Send message function
  const sendMessage = (content: string, conversationId: number, recipientId?: number) => {
    if (!content.trim()) {
      console.error('Cannot send message: Empty message');
      return;
    }

    // Send through API to persist
    apiRequest('POST', `/api/messaging/conversations/${conversationId}/messages`, {
      conversationId,
      senderId: userId,
      content,
    })
      .then(async (response) => {
        // Check for 403 Forbidden (not connected)
        if (response.status === 403) {
          const error = await response.json();
          toast({
            title: "Connection required",
            description: error.message || "You need to be connected to send messages. Visit their portfolio and send a connection request first.",
            variant: "destructive",
          });
          return;
        }
        
        if (!response.ok) {
          const error = await response.json();
          toast({
            title: "Failed to send message",
            description: error.error || "Please try again later",
            variant: "destructive",
          });
          return;
        }
        
        const newMessage = await response.json() as Message;
        // Optimistically update message list
        queryClient.setQueryData<Message[]>(
          ['/api/messaging/conversations', conversationId, 'messages'],
          (oldMessages) => [...(oldMessages || []), newMessage]
        );
        
        // Send over WebSocket for real-time delivery if connected
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'message',
            senderId: userId,
            conversationId,
            content,
            recipientId,
          }));
        }
      })
      .catch((error) => {
        console.error('Error sending message via API:', error);
        toast({
          title: "Failed to send message",
          description: "Please try again later",
          variant: "destructive",
        });
      });
  };

  // Create conversation function
  const createConversation = async (title: string | null, userIds: number[]) => {
    const newConversation = await createConversationMutation.mutateAsync({ title, userIds });
    return newConversation;
  };

  // Mark conversation as read
  const markConversationAsRead = (conversationId: number) => {
    markAsReadMutation.mutate(conversationId);
  };

  const contextValue: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    loadingMessages,
    loadingConversations,
    socket,
    sendMessage,
    setCurrentConversation,
    createConversation,
    markConversationAsRead,
    isConnected,
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);