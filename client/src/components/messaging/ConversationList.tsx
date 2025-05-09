import React from 'react';
import { useChat, type Conversation } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { cn } from '@/lib/utils';

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
        <GlassCard 
          variant="frosted" 
          blurStrength="md"
          transparency="medium"
          backgroundEffect="noise"
          backgroundIntensity="medium"
          className="p-6 w-full max-w-xs layer-2"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-lg mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start chatting with other professionals
          </p>
          <GlassButton 
            variant="glass"
            size="default"
            onClick={onNewConversation}
            className="w-full"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Conversation
          </GlassButton>
        </GlassCard>
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
              <GlassButton
                key={conversation.id}
                variant={isActive ? "glass-dark" : "ghost"}
                className={cn(
                  "w-full justify-start px-3 py-6 h-auto",
                  hasUnread ? 'font-medium' : '',
                  isActive ? 'bg-primary/10 backdrop-blur-sm' : ''
                )}
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
              </GlassButton>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;