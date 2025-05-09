import React, { useEffect, useRef } from 'react';
import { useChat, type Message as MessageType } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

const MessageList: React.FC = () => {
  const { messages, currentConversation, loadingMessages, markConversationAsRead } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark conversation as read when viewing
  useEffect(() => {
    if (currentConversation?.id && messages.length > 0) {
      markConversationAsRead(currentConversation.id);
    }
  }, [currentConversation?.id, messages, markConversationAsRead]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-8">
        <div className="flex justify-center py-3">
          <div className="px-3 py-1 rounded-full bg-muted/70 text-xs text-muted-foreground">
            Today
          </div>
        </div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} 
            className={`group flex items-end gap-3 ${i % 2 === 0 ? 'self-end flex-row-reverse' : ''}`}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex-shrink-0", 
              i % 2 === 0 ? "bg-primary/10" : "bg-muted/50"
            )} />
            <div 
              className={cn(
                "p-4 rounded-2xl max-w-[85%] h-[60px]",
                i % 2 === 0 
                  ? "bg-gradient-to-br from-primary/80 to-primary rounded-br-none" 
                  : "bg-muted/30 backdrop-blur-sm border border-muted/20 rounded-bl-none"
              )}
            >
              <div className="h-3 w-24 bg-current opacity-10 animate-pulse rounded-full" />
              <div className="h-3 w-32 mt-2 bg-current opacity-10 animate-pulse rounded-full" />
              <div className="h-2 w-8 mt-3 ml-auto bg-current opacity-10 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <GlassCard 
          variant="frosted"
          blurStrength="md"
          transparency="medium"
          backgroundEffect="noise"
          backgroundIntensity="medium"
          className="text-center px-8 py-6 max-w-xs layer-3"
          elevation="floating"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-primary/20">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Begin Your Conversation</h3>
          <p className="text-sm text-muted-foreground">
            Send your first message below to start connecting
          </p>
        </GlassCard>
      </div>
    );
  }

  // Group messages by date
  type MessageGroup = {
    date: string;
    formattedDate: string;
    messages: MessageType[];
  };

  const messageGroups: MessageGroup[] = messages.reduce((groups: MessageGroup[], message) => {
    const messageDate = new Date(message.sentAt);
    const date = format(messageDate, 'yyyy-MM-dd');
    
    let formattedDate = format(messageDate, 'MMMM d, yyyy');
    if (isToday(messageDate)) {
      formattedDate = 'Today';
    } else if (isYesterday(messageDate)) {
      formattedDate = 'Yesterday';
    }
    
    const existingGroup = groups.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date, formattedDate, messages: [message] });
    }
    
    return groups;
  }, []);

  const userId = localStorage.getItem('userId');

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {messageGroups.map((group) => (
        <div key={group.date} className="space-y-6">
          <div className="flex justify-center py-1">
            <div className="px-3 py-1 rounded-full bg-muted/60 text-xs text-muted-foreground backdrop-blur-sm">
              {group.formattedDate}
            </div>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const isOwnMessage = message.senderId.toString() === userId;
            const showAvatar = messageIndex === 0 || 
              group.messages[messageIndex - 1].senderId !== message.senderId;
            const showSenderName = !isOwnMessage && showAvatar && message.senderName;
            
            // Check if this message is part of a sequence from the same sender
            const isSequence = messageIndex > 0 && 
              group.messages[messageIndex - 1].senderId === message.senderId;
            
            // Check if the next message is from the same sender (for rounded corners)
            const nextIsSameSender = messageIndex < group.messages.length - 1 && 
              group.messages[messageIndex + 1].senderId === message.senderId;
            
            return (
              <div key={message.id} className="space-y-1">
                {showSenderName && (
                  <div className="flex items-center ml-12 mb-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      {message.senderName}
                    </div>
                  </div>
                )}
                
                <div 
                  className={cn(
                    "flex items-end gap-2 group",
                    isOwnMessage ? "justify-end" : "",
                    isSequence ? "mt-1" : "mt-3"
                  )}
                >
                  {!isOwnMessage && showAvatar ? (
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10 ring-offset-1 ring-offset-background flex-shrink-0">
                      {message.senderPhotoURL ? (
                        <AvatarImage src={message.senderPhotoURL} alt={message.senderName || 'User'} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {(message.senderName?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : !isOwnMessage ? (
                    <div className="w-9 flex-shrink-0" />
                  ) : null}
                  
                  <div 
                    className={cn(
                      "max-w-[85%] px-4 py-3 shadow-md",
                      isOwnMessage 
                        ? "text-white bg-primary/90 border border-primary/30" 
                        : "frosted-glass noise-texture bg-glass-bg",
                      // Dynamically add rounded corners based on message sequence
                      "rounded-2xl",
                      isOwnMessage && !isSequence ? "rounded-tr-md" : "",
                      isOwnMessage && !nextIsSameSender ? "rounded-br-md" : "",
                      !isOwnMessage && !isSequence ? "rounded-tl-md" : "",
                      !isOwnMessage && !nextIsSameSender ? "rounded-bl-md" : ""
                    )}
                  >
                    <div className="break-words whitespace-pre-line relative z-10">
                      {message.content}
                    </div>
                    <div className="text-[10px] opacity-70 mt-1 text-right flex items-center justify-end relative z-10">
                      {format(new Date(message.sentAt), 'h:mm a')}
                      {isOwnMessage && (
                        <span className="ml-1 text-white">
                          {message.readAt ? (
                            <Check className="h-3 w-3 inline-block" />
                          ) : (
                            <Check className="h-3 w-3 inline-block opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;