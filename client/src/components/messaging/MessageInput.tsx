import React, { useState, KeyboardEvent } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentConversation, sendMessage, isConnected } = useChat();

  const handleSubmit = async () => {
    if (!message.trim() || !currentConversation || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the recipient ID (for WebSocket delivery)
      const userId = localStorage.getItem('userId');
      const recipient = currentConversation.participants?.find(
        p => p.userId.toString() !== userId
      );
      
      await sendMessage(
        message.trim(), 
        currentConversation.id,
        recipient?.userId
      );
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[80px]"
          disabled={!currentConversation || !isConnected}
        />
        <Button 
          size="icon"
          onClick={handleSubmit}
          disabled={!message.trim() || !currentConversation || isSubmitting || !isConnected}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {!isConnected && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Connecting to chat server...
        </div>
      )}
    </div>
  );
};

export default MessageInput;