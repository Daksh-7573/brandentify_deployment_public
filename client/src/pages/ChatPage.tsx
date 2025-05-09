import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import Chat from '@/components/messaging/Chat';
import { Loader2, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

const ChatPage: React.FC = () => {
  // Get current user data from the auth context
  const { user, isLoading: authLoading } = useAuth();
  
  // Get current user ID (from auth context or localStorage as fallback)
  const userId = user?.uid || Number(localStorage.getItem('userId')) || 0;
  
  // Fetch current user for verification from our backend
  const { data: userData, isLoading: dataLoading, isError } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <span className="text-lg font-medium text-muted-foreground">Loading messages...</span>
        </div>
      </div>
    );
  }

  // If we're not loading and either there's no user or there was an error fetching
  if (!user && !userData) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-xl bg-muted/30 border shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div className="text-xl font-semibold mb-2">Authentication Required</div>
          <p className="text-muted-foreground mb-6">
            Please log in to access the messaging feature and connect with other professionals
          </p>
          <a 
            href="/" 
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-[calc(100vh-65px)] py-6 px-4 md:px-6">
      <div className="max-w-7xl mx-auto bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 md:p-6 border-b bg-background/80 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-primary" />
            Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and collaborate with professionals across the Brandentifier network
          </p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <ChatProvider userId={userId}>
            <Chat userId={userId} />
          </ChatProvider>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;