import React from 'react';
import { useChat, type Conversation } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ConversationListProps = {
  onNewConversation: () => void;
};

const ConversationList: React.FC<ConversationListProps> = ({ onNewConversation }) => {
  const { conversations, currentConversation, setCurrentConversation, loadingConversations, markConversationAsRead } = useChat();

  if (loadingConversations) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-spotify-gray animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-spotify-gray animate-pulse rounded-full w-3/4" />
              <div className="h-3 bg-spotify-gray animate-pulse rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-16 h-16 bg-spotify-glass-highlight rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-spotify-white" />
        </div>
        <h3 className="font-medium text-spotify-white mb-2">No conversations yet</h3>
        <p className="text-sm text-spotify-light-gray mb-6">
          Start connecting with professionals
        </p>
        <button 
          onClick={onNewConversation}
          className="px-4 py-2 rounded-full bg-spotify-green text-spotify-black hover:scale-105 transition-transform text-sm font-medium flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Connection
        </button>
      </div>
    );
  }

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.title) return conversation.title;
    
    // For direct messages, show the other participant's name
    const otherParticipants = conversation.participants?.filter(
      (p) => p.userId.toString() !== localStorage.getItem('userId')
    ) || [];
    
    if (otherParticipants.length === 1 && otherParticipants[0].userName) {
      return otherParticipants[0].userName;
    }
    
    if (conversation.isGroup) {
      return 'Group Conversation';
    }
    
    return 'Conversation';
  };

  const getParticipantAvatar = (conversation: Conversation): string | undefined => {
    if (conversation.isGroup) return undefined;
    
    const otherParticipant = conversation.participants?.find(
      (p) => p.userId.toString() !== localStorage.getItem('userId')
    );
    
    return otherParticipant?.userPhotoURL;
  };

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isActive = currentConversation?.id === conversation.id;
        const lastMessage = conversation.lastMessage;
        const avatarUrl = getParticipantAvatar(conversation);
        const hasUnread = (conversation.unreadCount || 0) > 0;
        
        return (
          <div
            key={conversation.id}
            className={`neo-spotify-playlist p-3 cursor-pointer ${
              isActive ? 'active' : ''
            } ${hasUnread ? 'font-medium' : ''}`}
            onClick={() => {
              setCurrentConversation(conversation);
              // Mark conversation as read when clicked
              if (conversation.unreadCount && conversation.unreadCount > 0) {
                markConversationAsRead(conversation.id);
              }
            }}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="neo-spotify-avatar w-10 h-10 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={getConversationName(conversation)} />
                ) : (
                  <span className="avatar-placeholder">
                    {conversation.isGroup ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      getConversationName(conversation).charAt(0).toUpperCase()
                    )}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium truncate text-spotify-white">
                    {getConversationName(conversation)}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-spotify-light-gray">
                      {formatDistanceToNow(new Date(lastMessage.sentAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  {lastMessage ? (
                    <span 
                      className={`text-xs truncate ${
                        hasUnread ? 'text-spotify-white' : 'text-spotify-light-gray'
                      }`}
                    >
                      {lastMessage.content}
                    </span>
                  ) : (
                    <span className="text-xs text-spotify-light-gray italic">
                      No messages yet
                    </span>
                  )}
                  
                  {hasUnread && (
                    <span className="ml-1 w-5 h-5 flex items-center justify-center text-[10px] bg-spotify-green text-spotify-black rounded-full font-bold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;