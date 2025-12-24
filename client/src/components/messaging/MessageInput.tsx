import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; url: string }>>([]);
  const { currentConversation, sendMessage, isConnected } = useChat();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the textarea when the conversation changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentConversation?.id]);

  const handleSubmit = async () => {
    if ((!message.trim() && attachments.length === 0) || !currentConversation || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the recipient ID (for WebSocket delivery)
      const userId = localStorage.getItem('userId');
      const recipient = currentConversation.participants?.find(
        p => p.userId.toString() !== userId
      );
      
      // Format message with attachments
      let finalMessage = message.trim();
      if (attachments.length > 0) {
        const attachmentLinks = attachments
          .map(att => `[${att.name}](${att.url})`)
          .join(' ');
        finalMessage = finalMessage ? `${finalMessage}\n${attachmentLinks}` : attachmentLinks;
      }
      
      await sendMessage(
        finalMessage, 
        currentConversation.id,
        recipient?.userId
      );
      setMessage('');
      setAttachments([]);
      
      // Auto-resize the textarea back to default size
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: "Files must be smaller than 10MB",
            variant: "destructive"
          });
          continue;
        }

        // Convert to data URL for now
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type,
            url
          }]);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive"
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-spotify-glass-highlight border border-spotify-glass-border rounded-lg px-3 py-2"
            >
              <span className="text-xs text-spotify-light-gray truncate max-w-[150px]">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-spotify-light-gray hover:text-spotify-white transition-colors"
                data-testid="remove-attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1 sm:gap-2 relative">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
            className={cn(
              "resize-none py-2 sm:py-3 px-3 sm:px-4 pr-10 sm:pr-12 min-h-[45px] sm:min-h-[50px] max-h-[120px] sm:max-h-[150px] overflow-y-auto w-full",
              "rounded-full backdrop-filter backdrop-blur-[20px] text-white text-sm sm:text-base font-medium",
              "border transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-spotify-green/50 focus:border-spotify-green",
              "hover:border-white/30",
              "placeholder:text-gray-400",
              "shadow-xl"
            )}
            disabled={!currentConversation || !isConnected}
          />
          
        </div>
        
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ position: 'absolute', width: '0', height: '0', opacity: '0', pointerEvents: 'none' }}
            data-testid="file-input"
            accept="*/*"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-spotify-light-gray hover:text-spotify-white mx-1 transition-colors"
            disabled={!currentConversation || !isConnected}
            data-testid="attach-button"
          >
            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={(!message.trim() && attachments.length === 0) || !currentConversation || isSubmitting || !isConnected}
            className={cn(
              "h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-spotify-white text-spotify-black",
              "flex items-center justify-center ml-1",
              "hover:scale-105 transition-transform",
              (!message.trim() && attachments.length === 0) && "opacity-70"
            )}
            data-testid="send-button"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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