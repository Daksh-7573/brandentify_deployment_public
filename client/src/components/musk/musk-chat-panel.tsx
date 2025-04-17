import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { X, Send, MessageSquare, Loader2, FileUp, Paperclip } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      const content = data.message;
      
      // Check for "Quick Response Options:" format in the message
      if (content && content.includes('Quick Response Options:')) {
        const parts = content.split('Quick Response Options:');
        const optionsText = parts[1];
        
        // Extract options using regex to find list items
        const optionsMatch = optionsText.match(/(?:"([^"]+)"|'([^']+)'|([^,"'\n]+))/g);
        if (optionsMatch) {
          quickResponses = optionsMatch.map((option: string) => 
            option.replace(/^["'\s-]*(.*?)["'\s]*$/, '$1').trim()
          ).filter(Boolean);
        }
      }
      
      // Replace the thinking message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: data.id || 'response-' + Date.now(),
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
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    // Validate file type and size
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or Word document (.pdf, .doc, .docx)',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Get current user ID from context or fallback to demo user
    const userId = context?.userId || 1;
    
    // Add user message about uploading resume
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `I'm uploading my resume (${file.name}) for analysis`,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add a "processing" message placeholder
    const thinkingMessage: Message = {
      id: 'thinking-' + Date.now().toString(),
      content: '',
      sender: 'musk',
      timestamp: new Date(),
      thinking: true
    };
    
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId.toString());
      
      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.open('POST', '/api/musk/resume-upload');
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error occurred'));
        };
        
        xhr.send(formData);
      });
      
      // Wait for upload to complete
      const uploadResult = await uploadPromise;
      
      if (!uploadResult) {
        throw new Error('Failed to upload file');
      }
      
      // The server's handleResumeUpload method already performs the analysis
      // The result includes the analysis message directly
      const analyzeResult = {
        analysis: uploadResult.message
      };
      
      // Replace the thinking message with the analysis result
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'analysis-' + Date.now(),
                content: analyzeResult.analysis,
                sender: 'musk',
                timestamp: new Date(),
                quickResponses: [
                  'How can I improve my skills section?',
                  'What about my work experiences?',
                  'Can you help me tailor it for a specific role?'
                ]
              }
            : msg
        )
      );
      
      toast({
        title: 'Analysis complete',
        description: 'Your resume has been analyzed successfully',
      });
      
    } catch (error) {
      console.error('Error processing resume:', error);
      
      // Replace the thinking message with an error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'error-' + Date.now(),
                content: "I'm sorry, I had trouble processing your resume. Please try again or upload a different file format.",
                sender: 'musk',
                timestamp: new Date()
              }
            : msg
        )
      );
      
      toast({
        title: 'Processing Error',
        description: 'Failed to analyze your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 flex gap-2">
          <div className="flex-1 flex gap-2 relative">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full pr-10"
              disabled={isTyping || isUploading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={triggerFileUpload}
              disabled={isTyping || isUploading}
              title="Upload Resume/CV"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            type="submit" 
            variant="default" 
            size="icon"
            disabled={!inputValue.trim() || isTyping || isUploading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Upload progress indicator */}
        {isUploading && (
          <div className="px-4 py-2 bg-primary/10 border-t">
            <div className="text-xs mb-1 flex justify-between">
              <span>Uploading resume...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>
    </Card>
  );
}