import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import Chat from '@/components/messaging/Chat';
import { Loader2, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import '../styles/neo-glass-spotify.css';

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
      <div className="neo-spotify-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-spotify-glass-bg backdrop-filter backdrop-blur-[15px] rounded-full border border-spotify-glass-border">
              <Loader2 className="w-10 h-10 animate-spin text-spotify-white" />
            </div>
            <span className="text-lg font-medium text-spotify-white mt-4 block">Loading messages...</span>
          </div>
        </div>
      </div>
    );
  }

  // If we're not loading and either there's no user or there was an error fetching
  if (!user && !userData) {
    return (
      <div className="neo-spotify-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md p-8 bg-spotify-glass-bg backdrop-filter backdrop-blur-[15px] rounded-xl border border-spotify-glass-border shadow-lg">
            <div className="w-16 h-16 bg-spotify-glass-highlight rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-spotify-white" />
            </div>
            <div className="text-xl font-semibold mb-4 text-spotify-white">Authentication Required</div>
            <p className="text-spotify-light-gray mb-6">
              Please log in to access the messaging feature and connect with other professionals
            </p>
            <a 
              href="/" 
              className="px-6 py-3 rounded-full bg-spotify-white text-spotify-black hover:opacity-90 transition-opacity inline-block font-medium"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-spotify-container">
      <div className="neo-spotify-wrapper">
        <ChatProvider userId={userId}>
          <Chat userId={userId} />
        </ChatProvider>
      </div>
    </div>
  );
};

export default ChatPage;