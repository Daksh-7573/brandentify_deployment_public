import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@lib/queryClient';

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
          if (currentConversation?.id === data.conversationId) {
            queryClient.setQueryData<Message[]>(
              ['/api/messaging/conversations', currentConversation.id, 'messages'],
              (oldMessages) => [...(oldMessages || []), newMessage]
            );
          }
          
          // Invalidate conversations to refresh unread counts
          queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
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
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['/api/messaging/conversations'],
    enabled: !!userId,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['/api/messaging/conversations', currentConversation?.id, 'messages'],
    enabled: !!currentConversation,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ title, userIds }: { title: string | null, userIds: number[] }) => {
      const response = await apiRequest('/api/messaging/conversations', {
        method: 'POST',
        body: JSON.stringify({ title, userIds }),
      });
      return response as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
    },
  });

  // Mark conversation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await apiRequest(`/api/messaging/conversations/${conversationId}/read`, {
        method: 'PATCH',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
    },
  });

  // Send message function
  const sendMessage = (content: string, conversationId: number, recipientId?: number) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !content.trim()) {
      console.error('Cannot send message: Socket not connected or empty message');
      return;
    }

    const messageData = {
      type: 'message',
      senderId: userId,
      conversationId,
      content,
      recipientId,
    };

    // Send over WebSocket for real-time delivery
    socket.send(JSON.stringify(messageData));

    // Also send through API to persist
    apiRequest('/api/messaging/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        content,
      }),
    })
      .then((newMessage: Message) => {
        // Optimistically update message list
        queryClient.setQueryData<Message[]>(
          ['/api/messaging/conversations', conversationId, 'messages'],
          (oldMessages) => [...(oldMessages || []), newMessage]
        );
      })
      .catch((error) => {
        console.error('Error sending message via API:', error);
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