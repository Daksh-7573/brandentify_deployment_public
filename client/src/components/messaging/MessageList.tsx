import React, { useEffect, useRef } from 'react';
import { useChat, type Message as MessageType } from '@/contexts/ChatContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

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
      <div className="h-full flex flex-col p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? 'self-end flex-row-reverse' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className={`p-3 rounded-lg ${i % 2 === 0 ? 'bg-primary/20' : 'bg-muted'} w-64 h-16 animate-pulse`} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="font-medium">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by sending a message below
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  type MessageGroup = {
    date: string;
    messages: MessageType[];
  };

  const messageGroups: MessageGroup[] = messages.reduce((groups: MessageGroup[], message) => {
    const date = format(new Date(message.sentAt), 'MMMM d, yyyy');
    const existingGroup = groups.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
    
    return groups;
  }, []);

  const userId = localStorage.getItem('userId');

  return (
    <ScrollArea className="h-full p-4">
      {messageGroups.map((group, groupIndex) => (
        <div key={group.date} className="space-y-4 mb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative bg-background px-2 text-xs text-muted-foreground">
              {group.date}
            </div>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const isOwnMessage = message.senderId.toString() === userId;
            const showAvatar = messageIndex === 0 || 
              group.messages[messageIndex - 1].senderId !== message.senderId;
            
            return (
              <div 
                key={message.id} 
                className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : ''}`}
              >
                {!isOwnMessage && showAvatar ? (
                  <Avatar className="h-8 w-8">
                    {message.senderPhotoURL ? (
                      <AvatarImage src={message.senderPhotoURL} alt={message.senderName || 'User'} />
                    ) : null}
                    <AvatarFallback>
                      {(message.senderName?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : !isOwnMessage ? (
                  <div className="w-8" />
                ) : null}
                
                <div 
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-muted rounded-bl-none'
                  }`}
                >
                  {!isOwnMessage && showAvatar && message.senderName && (
                    <div className="text-xs font-semibold mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <div className="break-words">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {format(new Date(message.sentAt), 'h:mm a')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default MessageList;