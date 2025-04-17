import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from '@/lib/queryClient';
import { 
  X, 
  Send, 
  MessageSquare, 
  Loader2, 
  FileUp, 
  Paperclip, 
  FileText, 
  PresentationIcon,
  LightbulbIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import SuggestedQuestionsDisplay from './suggested-questions-display';
import { getSuggestedQuestions } from './suggested-questions';
import { UserData } from '@/types/user';

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
  // State declarations
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'resume' | 'pitchdeck'>('resume');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi there! I'm Musk, your AI career assistant. I can analyze your resume or pitch deck, and provide personalized professional guidance. How can I help with your career development today?",
      sender: 'musk',
      timestamp: new Date(),
      quickResponses: [
        'What career advice can you offer?',
        'Analyze my resume',
        'Evaluate my pitch deck',
        'Help me network better'
      ]
    }
  ]);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pitchDeckFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (context?.userId) {
        try {
          const response = await fetch(`/api/users/${context.userId}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Failed to fetch user data for Musk suggestions:', error);
        }
      }
    };
    
    fetchUserData();
  }, [context?.userId]);
  
  // Update initial message quick responses with dynamic suggested questions
  useEffect(() => {
    if (userData) {
      try {
        // Get suggested questions based on user profile
        const suggestedQuestions = getSuggestedQuestions(userData, {}, 4);
        
        // If we have suggestions, update the initial message
        if (suggestedQuestions.length > 0) {
          setMessages(prevMessages => {
            // Clone the messages array
            const updatedMessages = [...prevMessages];
            
            // If we have a welcome message, update its quick responses
            if (updatedMessages.length > 0 && updatedMessages[0].id === 'welcome') {
              updatedMessages[0] = {
                ...updatedMessages[0],
                quickResponses: suggestedQuestions.map(q => q.text)
              };
            }
            
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error('Error generating suggested questions:', error);
      }
    }
  }, [userData]);
  
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
    const isResume = e.target === fileInputRef.current;
    const isPitchDeck = e.target === pitchDeckFileInputRef.current;
    
    // Set the upload type based on which input triggered the event
    setUploadType(isResume ? 'resume' : 'pitchdeck');
    
    // Different validation for resume vs pitch deck
    if (isResume) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      // Validate file type for resume
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document (.pdf, .doc, .docx)',
          variant: 'destructive',
        });
        return;
      }
    } else if (isPitchDeck) {
      // For pitch deck, only allow PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file for your pitch deck',
          variant: 'destructive',
        });
        return;
      }
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
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
    
    // Add user message about uploading file
    const userMessage: Message = {
      id: Date.now().toString(),
      content: isResume 
        ? `I'm uploading my resume (${file.name}) for analysis`
        : `I'm uploading my pitch deck (${file.name}) for analysis`,
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
        // Determine the endpoint based on the file type
        const endpoint = isResume ? '/api/musk/resume-upload' : '/api/musk/pitchdeck-upload';
        xhr.open('POST', endpoint);
        
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
        throw new Error(`Failed to upload ${isResume ? 'resume' : 'pitch deck'}`);
      }
      
      // The result includes the analysis message directly
      const analyzeResult = {
        analysis: uploadResult.message
      };
      
      // Different quick responses based on file type
      const quickResponses = isResume 
        ? [
            'How can I improve my skills section?',
            'What about my work experiences?',
            'Can you help me tailor it for a specific role?'
          ]
        : [
            'How can I improve my problem statement?',
            'Is my business model compelling enough?',
            'What should I focus on for investor readiness?'
          ];
      
      // Replace the thinking message with the analysis result
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'analysis-' + Date.now(),
                content: analyzeResult.analysis,
                sender: 'musk',
                timestamp: new Date(),
                quickResponses
              }
            : msg
        )
      );
      
      toast({
        title: 'Analysis complete',
        description: `Your ${isResume ? 'resume' : 'pitch deck'} has been analyzed successfully`,
      });
      
    } catch (error) {
      console.error(`Error processing ${isResume ? 'resume' : 'pitch deck'}:`, error);
      
      // Replace the thinking message with an error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'error-' + Date.now(),
                content: isResume
                  ? "I'm sorry, I had trouble processing your resume. Please try again or upload a different file format."
                  : "I'm sorry, I had trouble analyzing your pitch deck. Please make sure it's a valid PDF and try again.",
                sender: 'musk',
                timestamp: new Date()
              }
            : msg
        )
      );
      
      toast({
        title: 'Processing Error',
        description: `Failed to analyze your ${isResume ? 'resume' : 'pitch deck'}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Reset file input
      if (isResume && fileInputRef.current) {
        fileInputRef.current.value = '';
      } else if (isPitchDeck && pitchDeckFileInputRef.current) {
        pitchDeckFileInputRef.current.value = '';
      }
    }
  };
  
  const triggerResumeUpload = () => {
    fileInputRef.current?.click();
  };
  
  const triggerPitchDeckUpload = () => {
    pitchDeckFileInputRef.current?.click();
  };
  
  // Animation variants for the panel
  const panelAnimation = {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
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
    <Card className="fixed inset-0 sm:relative sm:inset-auto sm:w-[450px] sm:shadow-xl bg-card rounded-lg border border-border/50 flex flex-col overflow-hidden">
      <motion.div
        className="flex flex-col h-[600px] max-h-screen w-full"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={panelAnimation}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </Avatar>
            <div>
              <h3 className="text-sm font-medium">Musk AI</h3>
              <p className="text-xs text-muted-foreground">Your Career Assistant</p>
            </div>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={onClose}
              title="Close Musk chat"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex flex-col gap-2",
                  message.sender === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {message.sender === 'musk' && (
                    <Avatar className="h-8 w-8 mt-0.5 bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "rounded-lg py-2 px-3 text-sm",
                      message.sender === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    {message.thinking ? (
                      <div className="flex items-center gap-1.5 h-5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 mt-0.5 bg-primary">
                      <div className="text-xs font-medium text-primary-foreground">You</div>
                    </Avatar>
                  )}
                </div>
                
                {/* Quick responses */}
                {message.quickResponses && message.quickResponses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-10 max-w-[90%]">
                    {message.quickResponses.map((response, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs bg-card/80 hover:bg-muted/80"
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
        
        {/* Hidden file inputs */}
        <input 
          ref={fileInputRef} 
          type="file" 
          onChange={handleFileUpload} 
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
        
        <input 
          ref={pitchDeckFileInputRef} 
          type="file" 
          onChange={handleFileUpload} 
          accept=".pdf"
          className="hidden"
        />

        {/* Suggested Questions Section */}
        {userData && (
          <div className="border-t border-border/20 px-4 pt-2 pb-0">
            <SuggestedQuestionsDisplay 
              user={userData} 
              onSelectQuestion={(question) => setInputValue(question)}
              className=""
            />
          </div>
        )}
        
        {/* File upload buttons */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isTyping || isUploading}
            title="Upload Resume"
            onClick={triggerResumeUpload}
          >
            <FileText className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isTyping || isUploading}
            title="Upload Pitch Deck"
            onClick={triggerPitchDeckUpload}
          >
            <PresentationIcon className="h-4 w-4" />
            <span>Upload Pitch Deck</span>
          </Button>
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 pt-2 flex gap-2">
          <div className="flex-1 flex gap-2 relative">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full"
              disabled={isTyping || isUploading}
            />
          </div>
          <Button 
            type="submit" 
            variant="default" 
            className="px-3 gap-2"
            disabled={!inputValue.trim() || isTyping || isUploading}
            title="Send message"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
        
        {/* Upload progress indicator */}
        {isUploading && (
          <div className="px-4 py-2 bg-primary/10 border-t">
            <div className="text-xs mb-1 flex justify-between">
              <span>Uploading {uploadType === 'resume' ? 'resume' : 'pitch deck'}...</span>
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