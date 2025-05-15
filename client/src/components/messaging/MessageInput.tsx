import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Image, Smile, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentConversation, sendMessage, isConnected } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when the conversation changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentConversation?.id]);

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
      
      // Auto-resize the textarea back to default size
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);
    
    // Reset height to auto to calculate new height
    textarea.style.height = 'auto';
    
    // Set new height based on scrollHeight, with a max height
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className="w-full relative">
      <div className="flex items-end gap-2 relative">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={cn(
              "resize-none py-3 px-4 pr-12 min-h-[50px] max-h-[150px] overflow-y-auto w-full",
              "rounded-full bg-spotify-gray/40 text-spotify-white",
              "border-spotify-glass-border focus:border-spotify-light-gray/30",
              "focus:outline-none focus:ring-1 focus:ring-spotify-light-gray/30",
              "placeholder:text-spotify-light-gray/60"
            )}
            disabled={!currentConversation || !isConnected}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center">
            <button
              type="button"
              className="text-spotify-light-gray hover:text-spotify-white transition-colors"
              disabled={!currentConversation || !isConnected}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full text-spotify-light-gray hover:text-spotify-white hidden md:flex mx-1"
            disabled={!currentConversation || !isConnected}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full text-spotify-light-gray hover:text-spotify-white hidden md:flex mx-1"
            disabled={!currentConversation || !isConnected}
          >
            <Image className="h-4 w-4" />
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!message.trim() || !currentConversation || isSubmitting || !isConnected}
            className={cn(
              "h-10 w-10 rounded-full bg-spotify-green text-spotify-black",
              "flex items-center justify-center ml-1",
              "hover:scale-105 transition-transform",
              !message.trim() && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {!isConnected && (
        <div className="absolute inset-x-0 -top-8 flex justify-center">
          <div className="px-3 py-1 rounded-full bg-spotify-glass-highlight border border-spotify-glass-border text-xs text-spotify-light-gray animate-pulse flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting to chat server...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;