import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, LightbulbIcon, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

// Import Musk avatar
import muskAvatar from '@assets/Musk.png';

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

const THINKING_MESSAGES = [
  "Analyzing your profile...",
  "Reviewing your activity...",
  "Scanning industry trends...",
  "Examining your network...",
  "Finding relevant opportunities...",
  "Identifying growth areas..."
];

export default function MuskChatPanel({ context, onClose }: MuskChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize chat with welcome message when component mounts
  useEffect(() => {
    const welcomeMessage = generateWelcomeMessage();
    setMessages([
      {
        id: '1',
        content: welcomeMessage,
        sender: 'musk',
        timestamp: new Date(),
        quickResponses: [
          "Tell me about industry trends",
          "How can I improve my profile?",
          "Find me career opportunities",
          "Help me build my personal brand"
        ]
      }
    ]);
  }, []);

  // Generate contextual welcome message
  const generateWelcomeMessage = () => {
    const userName = user?.name?.split(' ')[0] || 'there';
    const currentHour = new Date().getHours();
    let timeGreeting = "Hello";
    
    if (currentHour < 12) {
      timeGreeting = "Good morning";
    } else if (currentHour < 18) {
      timeGreeting = "Good afternoon";
    } else {
      timeGreeting = "Good evening";
    }

    // Default welcome message
    let welcomeMessage = `${timeGreeting}, ${userName}! 👋 I'm Musk, your AI career strategist.\n\nI can help you build your professional brand, find opportunities, and accelerate your career growth.`;

    // Add contextual message based on current page
    if (context?.page) {
      switch (context.page) {
        case 'profile':
          welcomeMessage += "\n\nI notice you're working on your profile. Would you like some tips on how to make it stand out to potential connections?";
          break;
        case 'pulses':
          welcomeMessage += "\n\nLooking to share something new? I can help you craft content that resonates with your network.";
          break;
        case 'projects':
          welcomeMessage += "\n\nI see you're in the assignments section. Need help showcasing your best work to impress recruiters?";
          break;
        case 'search':
          welcomeMessage += "\n\nSearching for something specific? I can help you find the right connections and opportunities.";
          break;
      }
    }

    return welcomeMessage;
  };

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle typing animation for Musk's responses
  useEffect(() => {
    if (isTyping && typingIndex < typingText.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 15); // Speed of typing animation
      return () => clearTimeout(timer);
    } else if (isTyping && typingIndex >= typingText.length) {
      setIsTyping(false);
      // Update the last message with the complete text
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].sender === 'musk') {
          updated[lastIndex].content = typingText;
          updated[lastIndex].thinking = false;
        }
        return updated;
      });
    }
  }, [isTyping, typingIndex, typingText]);

  // Cycle through thinking messages for the AI analysis effect
  useEffect(() => {
    if (isLoading && messages.length > 0) {
      // Start cycling through thinking messages
      thinkingIntervalRef.current = setInterval(() => {
        setCurrentThinkingIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
        
        // Update the last message with the new thinking message
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].sender === 'musk' && updated[lastIndex].thinking) {
            updated[lastIndex].content = THINKING_MESSAGES[currentThinkingIndex];
          }
          return updated;
        });
      }, 1500);
    }

    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
    };
  }, [isLoading, currentThinkingIndex, messages]);

  // Extract quick responses from AI messages
  const extractQuickResponses = (message: string): string[] => {
    try {
      // Use regex to find the specific formatting pattern for quick responses
      const quickResponseSection = message.match(/Quick Response Options:([\s\S]*?)(?:\n\n|$)/);
      
      if (!quickResponseSection) return [];
      
      // Extract bullet points
      const bulletPoints = quickResponseSection[1].match(/- (.*?)(?:\n|$)/g) || [];
      
      // Clean up the options
      return bulletPoints.map(point => 
        point.replace(/- /, '').trim()
      ).filter(point => point.length > 0);
    } catch (error) {
      console.error("Error extracting quick responses:", error);
      return [];
    }
  };

  // Process message before displaying (handle markdown, format content)
  const processMessage = (message: string): string => {
    // Remove the quick response section if it exists
    return message.replace(/Quick Response Options:[\s\S]*?(?:\n\n|$)/, '');
  };

  // Handle quick response button clicks
  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
    
    // Submit after a short delay to ensure state update
    setTimeout(() => {
      const submitEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
      submitEvent.preventDefault = () => {}; // Mock preventDefault
      handleSubmit(submitEvent);
    }, 100);
  };

  // Submit user message and get AI response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userId = user?.id || 1;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Add thinking message from Musk
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: THINKING_MESSAGES[0],
      sender: 'musk',
      timestamp: new Date(),
      thinking: true
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      // Call the API to get Musk's response
      const response = await apiRequest('POST', '/api/musk/chat', {
        userId,
        message: inputMessage,
        context
      });
      
      const data = await response.json();
      
      // Clear the thinking interval
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      
      if (data.message) {
        // Extract quick responses if any
        const quickResponses = extractQuickResponses(data.message) || [
          "Tell me more about this",
          "What are the next steps?",
          "How can I implement this?",
          "Something else on my mind..."
        ];
        
        // Start typing animation for Musk's response
        setTypingText(data.message);
        setTypingIndex(0);
        setIsTyping(true);
        
        // Update the thinking message with the response data but keep it as thinking
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].sender === 'musk' && updated[lastIndex].thinking) {
            updated[lastIndex].id = data.id || (Date.now() + 2).toString();
            updated[lastIndex].quickResponses = quickResponses;
            // Leave content and thinking flag as is for now
          }
          return updated;
        });
        
        // Invalidate chat history query if we have it
        if (userId) {
          queryClient.invalidateQueries({
            queryKey: ['/api/users', userId, 'chat-messages']
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      // If error occurs, change the thinking message to an error message
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].sender === 'musk' && updated[lastIndex].thinking) {
          updated[lastIndex].content = "I'm sorry, I couldn't process your request. Please try again.";
          updated[lastIndex].thinking = false;
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] w-full shadow-xl border border-primary/20">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center gap-3 bg-gradient-to-r from-primary/80 to-primary text-white">
        <Avatar className="h-10 w-10 border-2 border-white/30">
          <AvatarImage src={muskAvatar} alt="Musk" />
          <AvatarFallback className="bg-primary-600 text-white">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Musk</h3>
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
          </div>
          <p className="text-xs text-white/80">Your AI Career Strategist</p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto py-4 px-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-100'} rounded-lg p-3 shadow-sm`}>
                {message.sender === 'musk' && message.thinking ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{message.content}</span>
                  </div>
                ) : message.sender === 'musk' && isTyping && message.id === messages[messages.length - 1].id ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {processMessage(typingText.substring(0, typingIndex))}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className={`${message.sender === 'musk' ? 'prose prose-sm max-w-none' : ''}`}>
                    {message.sender === 'musk' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {processMessage(message.content)}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {/* Quick response buttons */}
          {messages.length > 0 && messages[messages.length - 1].sender === 'musk' && 
           messages[messages.length - 1].quickResponses && 
           messages[messages.length - 1].quickResponses.length > 0 && 
           !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-start mt-2"
            >
              {messages[messages.length - 1].quickResponses?.map((response, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="secondary"
                  className="text-xs rounded-full px-3 py-1 h-auto bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => handleQuickResponse(response)}
                >
                  {response}
                </Button>
              ))}
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="py-3 px-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            className="flex-1"
            placeholder="Ask Musk anything about your career..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading || isTyping}
          />
          <Button 
            type="submit" 
            disabled={isLoading || isTyping || !inputMessage.trim()} 
            size="icon"
            className="bg-primary hover:bg-primary-600"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}