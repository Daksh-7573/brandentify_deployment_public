import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MuskChatPanelProps {
  context?: {
    page?: string;
    userId?: number;
    section?: string;
    data?: any;
  };
  onClose?: () => void;
}

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'musk';
  timestamp: Date;
  quickResponses?: string[];
  thinking?: boolean;
};

export default function MuskChatPanel({ context, onClose }: MuskChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi there! I'm Musk, your AI career assistant. How can I help with your professional development today?",
      sender: 'musk',
      timestamp: new Date(),
      quickResponses: [
        'What career advice can you offer?',
        'Help me improve my profile',
        'How can I network better?',
        'Tell me about industry trends'
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on initial render
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Get current user ID from context or fallback to demo user
    const userId = context?.userId || 1;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add a "thinking" message placeholder
    const thinkingMessage: Message = {
      id: 'thinking-' + Date.now().toString(),
      content: '',
      sender: 'musk',
      timestamp: new Date(),
      thinking: true
    };
    
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Make API request to get Musk's response
      const response = await fetch('/api/musk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: inputValue,
          context
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json() as {id: string; message: string; timestamp: Date};
      
      // Parse quick responses from the AI message if available
      let quickResponses: string[] | undefined = undefined;
      const content = response.message;
      
      // Check for "Quick Response Options:" format in the message
      if (content.includes('Quick Response Options:')) {
        const parts = content.split('Quick Response Options:');
        const optionsText = parts[1];
        
        // Extract options using regex to find list items
        const optionsMatch = optionsText.match(/(?:"([^"]+)"|'([^']+)'|([^,"'\n]+))/g);
        if (optionsMatch) {
          quickResponses = optionsMatch.map(option => 
            option.replace(/^["'\s-]*(.*?)["'\s]*$/, '$1').trim()
          ).filter(Boolean);
        }
      }
      
      // Replace the thinking message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: response.id || 'response-' + Date.now(),
                content: content,
                sender: 'musk',
                timestamp: new Date(),
                quickResponses
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error getting Musk response:', error);
      
      // Replace the thinking message with an error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'error-' + Date.now(),
                content: "I'm sorry, I'm having trouble connecting to my intelligence center. Please try again in a moment.",
                sender: 'musk',
                timestamp: new Date()
              }
            : msg
        )
      );
      
      toast({
        title: 'Connection Error',
        description: 'Could not connect to Musk AI. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleQuickResponse = (response: string) => {
    setInputValue(response);
    inputRef.current?.focus();
  };
  
  const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[80vh] max-h-[700px] shadow-xl bg-background border rounded-xl overflow-hidden z-50">
      <motion.div
        className="flex flex-col h-full"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10">
              <img 
                src="/images/musk-ai-avatar.png" 
                alt="Musk AI"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=Musk&background=6366f1&color=fff";
                }}
              />
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">Musk</h3>
              <p className="text-xs text-muted-foreground">AI Career Assistant</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-3 animate-in fade-in-0 zoom-in-95 duration-300",
                  message.sender === 'user' 
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-none" 
                    : "mr-auto bg-muted rounded-bl-none"
                )}
              >
                {/* Show thinking indicator */}
                {message.thinking ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">Thinking</div>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                )}
                
                {/* Quick responses */}
                {message.sender === 'musk' && message.quickResponses && message.quickResponses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.quickResponses.map((response, i) => (
                      <Button 
                        key={i}
                        variant="secondary"
                        size="sm"
                        className="text-xs py-1 h-auto bg-background/80 hover:bg-background"
                        onClick={() => handleQuickResponse(response)}
                      >
                        {response}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <Separator />
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            variant="default" 
            size="icon"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </motion.div>
    </Card>
  );
}