import React, { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MessageRequests from './MessageRequests';
import MuskChatPanel from '@/components/musk/musk-chat-panel';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  MessageCircleMore,
  UserRound,
  Music2,
  Home,
  LibraryBig,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Chat: React.FC<{ userId: number }> = ({ userId }) => {
  const { currentConversation, setCurrentConversation, markConversationAsRead, conversations } = useChat();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = React.useState<'recent' | 'unread' | 'all' | 'requests' | 'musk'>('recent');

  // Log when filter changes
  useEffect(() => {
    console.log(`[Chat] 🔄 Filter changed to: "${filter}"`);
  }, [filter]);

  // Scroll to bottom effect for new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentConversation?.id]);
  
  // Mark conversation as read when it's opened
  useEffect(() => {
    if (currentConversation?.id && currentConversation.unreadCount && currentConversation.unreadCount > 0) {
      markConversationAsRead(currentConversation.id);
    }
  }, [currentConversation?.id, currentConversation?.unreadCount, markConversationAsRead]);

  // Get details about the other user in the current conversation
  const otherUser = currentConversation?.participants?.find(p => p.userId !== userId);

  // Log participant resolution
  useEffect(() => {
    if (currentConversation) {
      console.log(`[Chat] 📋 Current conversation:`, {
        id: currentConversation.id,
        title: currentConversation.title,
        participantCount: currentConversation.participants?.length || 0,
        participants: currentConversation.participants?.map(p => ({
          userId: p.userId,
          userName: p.userName,
          userPhotoURL: p.userPhotoURL
        }))
      });
      console.log(`[Chat] 👤 Other user (for userId ${userId}):`, {
        userId: otherUser?.userId,
        userName: otherUser?.userName,
        userPhotoURL: otherUser?.userPhotoURL
      });
    }
  }, [currentConversation, userId, otherUser]);

  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 h-full overflow-hidden">
      {/* Left sidebar - Hidden on mobile when a conversation is selected */}
      <div className={`${currentConversation ? 'hidden md:block' : 'block'} md:w-1/3 lg:w-1/4 xl:w-1/5 h-full md:min-w-[280px] lg:min-w-[300px] overflow-hidden flex flex-col`}>
        <div className="neo-spotify-sidebar h-full flex flex-col overflow-hidden">
          <div className="sidebar-top">
            <div className="user-profile">
              <div className="neo-spotify-avatar">
                <UserRound className="w-5 h-5 text-spotify-white" />
              </div>
              <div className="user-info">
                <div className="user-name">My Conversations</div>
                <div className="user-type">Professional Network</div>
              </div>
            </div>
            
            <div className="sidebar-nav">
              <div className="sidebar-item active">
                <MessageCircleMore className="w-4 h-4 mr-2" />
                Connections
              </div>
            </div>
            
            <div className="sidebar-tabs">
              <button 
                className={`sidebar-tab ${filter === 'recent' ? 'active' : ''}`}
                onClick={() => setFilter('recent')}
                data-testid="filter-recent"
              >
                Recent
              </button>
              <button 
                className={`sidebar-tab ${filter === 'requests' ? 'active' : ''}`}
                onClick={() => setFilter('requests')}
                data-testid="filter-requests"
              >
                Requests
              </button>
              <button 
                className={`sidebar-tab ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
                data-testid="filter-unread"
              >
                Unread
              </button>
              <button 
                className={`sidebar-tab ${filter === 'musk' ? 'active' : ''}`}
                onClick={() => setFilter('musk')}
                data-testid="filter-musk"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Musk
              </button>
            </div>
          </div>
          
          <div className="sidebar-playlists">
            {filter === 'requests' ? (
              <div className="p-4 text-center text-spotify-light-gray text-sm">
                Click a request to view and respond
              </div>
            ) : (
              <ConversationList filter={filter} onMuskSelect={() => setFilter('musk')} />
            )}
          </div>
        </div>
      </div>
      
      {/* Main chat area - Full width on mobile when a conversation is selected */}
      <div className={`${currentConversation || filter === 'musk' || filter === 'requests' ? 'block' : 'hidden md:block'} flex-1 h-full overflow-hidden flex flex-col`}>
        <div className="neo-spotify-main h-full w-full flex flex-col overflow-hidden">
          {filter === 'requests' ? (
            <>
              {/* Message Requests - Show requests directly in main area */}
              <MessageRequests />
            </>
          ) : filter === 'musk' ? (
            <>
              {/* Musk Chat Header */}
              <div className="neo-spotify-header">
                <div className="flex items-center">
                  <div className="header-nav mr-2 sm:mr-4 md:hidden">
                    <button 
                      className="header-nav-btn p-2"
                      onClick={() => setFilter('recent')}
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  
                  <div className="neo-spotify-avatar">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-spotify-green" />
                  </div>
                  
                  <div className="ml-2 sm:ml-3">
                    <div className="font-semibold text-sm sm:text-base">
                      Musk AI Assistant
                    </div>
                    <div className="text-xs sm:text-sm text-spotify-light-gray">
                      Your Career Coach
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Musk Chat Content */}
              <div className="neo-spotify-content flex-1 overflow-hidden">
                <MuskChatPanel context={{ userId, page: 'messages' }} />
              </div>
            </>
          ) : currentConversation ? (
            <>
              {/* Message header */}
              <div className="neo-spotify-header">
                <div className="flex items-center">
                  <div className="header-nav mr-2 sm:mr-4 md:hidden">
                    <button 
                      className="header-nav-btn p-2"
                      onClick={() => setCurrentConversation(null)}
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  
                  <div className="neo-spotify-avatar">
                    {otherUser?.userPhotoURL ? (
                      <img src={otherUser.userPhotoURL} alt={otherUser.userName || 'User'} />
                    ) : (
                      <span className="avatar-placeholder">
                        {otherUser?.userName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  <div className="ml-2 sm:ml-3">
                    <div className="font-semibold text-sm sm:text-base">
                      {otherUser?.userName || 'Conversation'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <button className="sidebar-action-btn ml-2 sm:ml-3 p-2">
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Message content */}
              <div className="neo-spotify-content flex-1 overflow-y-auto" ref={scrollRef}>
                <MessageList />
              </div>
              
              {/* Message input */}
              <div className="p-3 sm:p-4 border-t border-spotify-glass-border backdrop-filter backdrop-blur-[15px] bg-spotify-glass-bg">
                <MessageInput />
              </div>
            </>
          ) : (
            <div className="neo-spotify-content flex items-center justify-center text-center p-4 sm:p-6 md:p-8">
              <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-spotify-glass-highlight flex items-center justify-center mb-4 sm:mb-6">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-spotify-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-spotify-white">No Connections Yet</h3>
                <p className="text-spotify-light-gray mb-6 sm:mb-8 text-base sm:text-lg">
                  Visit someone's profile and send a connection request to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Chat;