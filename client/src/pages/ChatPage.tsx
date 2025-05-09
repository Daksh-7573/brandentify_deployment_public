import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import Chat from '@/components/messaging/Chat';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const ChatPage: React.FC = () => {
  // Get current user ID (using the stored userId in localStorage)
  const userId = Number(localStorage.getItem('userId')) || 0;
  
  // Fetch current user for verification
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading chat...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <div className="text-lg font-medium mb-2">Authentication Required</div>
        <p className="text-muted-foreground mb-4">
          Please log in to access the chat feature
        </p>
        <a href="/login" className="text-primary hover:underline">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Chat with other professionals on the platform
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatProvider userId={userId}>
          <Chat userId={userId} />
        </ChatProvider>
      </div>
    </div>
  );
};

export default ChatPage;