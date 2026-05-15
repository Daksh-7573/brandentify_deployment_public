import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/hooks/use-encryption';

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
  isEncrypted?: boolean;
  decryptedContent?: string;
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
  isMuskConversation?: boolean;
  isEncryptionEnabled?: boolean;
};

// Context type
type ChatContextType = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
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
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const { encryptForRecipients, decryptMessage, isReady: encryptionReady } = useEncryption(userId);

  // Set up WebSocket connection with automatic reconnection
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setReconnectAttempt(0); // Reset attempt counter on successful connection
        // Authenticate with the server
        ws.send(JSON.stringify({ 
          type: 'auth',
          userId: userId.toString()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          console.log('[ChatContext] 📩 WebSocket message received:', data.type);
          
          if (data.type === 'auth_success') {
            setIsConnected(true);
            console.log('WebSocket authenticated');
          } else if (data.type === 'new_conversation') {
            // Handle new conversation created (e.g., when connection request accepted)
            console.log('[ChatContext] 🔔 New conversation available:', data);
            toast({
              title: "New Conversation",
              description: data.message || `You can now message ${data.senderName || 'your connection'}`,
            });
            
            // Refresh conversations list
            queryClient.invalidateQueries({ 
              predicate: (query) => {
                const key = query.queryKey[0];
                return typeof key === 'string' && key.includes('/api/messaging/conversations');
              }
            });
          } else if (data.type === 'connection_accepted') {
            // Handle connection accepted notification
            console.log('[ChatContext] 🔔 Connection accepted:', data);
            toast({
              title: "Connection Accepted",
              description: data.message || `${data.receiverName || 'Your connection'} accepted your request`,
            });
            
            // Refresh conversations list to show new conversation
            queryClient.invalidateQueries({ 
              predicate: (query) => {
                const key = query.queryKey[0];
                return typeof key === 'string' && key.includes('/api/messaging/conversations');
              }
            });
          } else if (data.type === 'new_message') {
            // Handle incoming message with E2E decryption
            let displayContent = data.content;
            const isEncrypted = data.isEncrypted || false;
            
            // Decrypt if message is encrypted
            if (isEncrypted && encryptionReady) {
              displayContent = decryptMessage(data.content, true);
            }
            
            const newMessage: Message = {
              id: data.id || crypto.randomUUID(),
              conversationId: data.conversationId,
              senderId: data.senderId,
              content: data.content,
              sentAt: data.timestamp || new Date().toISOString(),
              readAt: null,
              replyToId: null,
              senderName: data.senderName,
              isEncrypted,
              decryptedContent: isEncrypted ? displayContent : undefined,
            };
            
            // Add to messages cache using same key structure as MessageList
            queryClient.setQueryData<Message[]>(
              ['/api/messaging/conversations', data.conversationId, 'messages'],
              (oldMessages) => [...(oldMessages || []), newMessage]
            );
            
            // Invalidate conversations to refresh unread counts
            queryClient.invalidateQueries({ 
              predicate: (query) => {
                const key = query.queryKey[0];
                return typeof key === 'string' && key.includes('/api/messaging/conversations');
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
        
        // Attempt to reconnect with exponential backoff
        const attempt = reconnectAttempt + 1;
        setReconnectAttempt(attempt);
        
        // Cap reconnection attempts at reasonable intervals (max 30 seconds)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        console.log(`Reconnecting in ${delay}ms (attempt ${attempt})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      setSocket(ws);
    };

    connectWebSocket();

    // Clean up on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [userId, queryClient, reconnectAttempt]);

  // Fetch conversations using direct fetch with proper key structure
  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: [`/api/messaging/conversations?userId=${userId}`],
    enabled: !!userId,
    onSuccess: (data) => {
      console.log(`[ChatContext] ✅ Loaded ${Array.isArray(data) ? data.length : 0} conversations for user ${userId}`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[ChatContext] First conversation:`, data[0]);
      }
    },
    onError: (error: any) => {
      console.error(`[ChatContext] ❌ Error loading conversations:`, error);
    },
  });

  // Convert data to proper types
  const conversations: Conversation[] = Array.isArray(conversationsData) ? conversationsData : [];

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
          return typeof key === 'string' && key.includes('/api/messaging/conversations');
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
          return typeof key === 'string' && key.includes('/api/messaging/conversations');
        }
      });
    },
  });

  // Send message function with E2E encryption support
  const sendMessage = async (content: string, conversationId: number, recipientId?: number) => {
    if (!content.trim()) {
      console.error('Cannot send message: Empty message');
      return;
    }

    // Check if we should encrypt this message
    const conversation = conversations.find(c => c.id === conversationId);
    const shouldEncrypt = encryptionReady && 
                          conversation?.isEncryptionEnabled !== false && 
                          !conversation?.isMuskConversation;
    
    let finalContent = content;
    let isEncrypted = false;
    let encryptedForUsers = '';
    
    // Encrypt if possible and conversation supports it
    if (shouldEncrypt && recipientId) {
      const recipientIds = [recipientId, userId].filter(Boolean);
      const encrypted = await encryptForRecipients(content, recipientIds);
      if (encrypted) {
        finalContent = encrypted.encrypted;
        isEncrypted = true;
        encryptedForUsers = encrypted.encryptedForUsers;
        console.log('[E2E] Message encrypted for recipients');
      }
    }

    // Send through API to persist
    apiRequest('POST', `/api/messaging/conversations/${conversationId}/messages`, {
      conversationId,
      senderId: userId,
      content: finalContent,
      isEncrypted,
      encryptedForUsers,
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
        // Add decrypted content for display if encrypted
        if (newMessage.isEncrypted) {
          newMessage.decryptedContent = content; // We know the original content
        }
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

  const contextValue = useMemo(() => ({
    conversations,
    currentConversation,
    loadingConversations,
    socket,
    sendMessage,
    setCurrentConversation,
    createConversation,
    markConversationAsRead,
    isConnected,
  }), [conversations, currentConversation, loadingConversations, socket, sendMessage, setCurrentConversation, createConversation, markConversationAsRead, isConnected]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);