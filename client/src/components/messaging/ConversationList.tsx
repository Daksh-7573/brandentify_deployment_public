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
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="font-medium">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start chatting with other professionals
        </p>
        <Button onClick={onNewConversation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
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
    <div className="h-full flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <Button variant="ghost" size="icon" onClick={onNewConversation}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => {
            const isActive = currentConversation?.id === conversation.id;
            const lastMessage = conversation.lastMessage;
            const avatarUrl = getParticipantAvatar(conversation);
            const hasUnread = (conversation.unreadCount || 0) > 0;
            
            return (
              <Button
                key={conversation.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start px-3 py-6 h-auto ${
                  hasUnread ? 'font-medium' : ''
                }`}
                onClick={() => {
                  setCurrentConversation(conversation);
                  // Mark conversation as read when clicked
                  if (conversation.unreadCount && conversation.unreadCount > 0) {
                    markConversationAsRead(conversation.id);
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={getConversationName(conversation)} />
                    ) : null}
                    <AvatarFallback>
                      {conversation.isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getConversationName(conversation).charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">
                        {getConversationName(conversation)}
                      </span>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lastMessage.sentAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      {lastMessage ? (
                        <span 
                          className={`text-xs truncate ${
                            hasUnread ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {lastMessage.content}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No messages yet
                        </span>
                      )}
                      
                      {hasUnread && (
                        <Badge 
                          variant="default" 
                          className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;