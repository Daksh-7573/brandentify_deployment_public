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
import { X, Send, MessageSquare, Loader2, FileUp, Paperclip, FileText, PresentationIcon, LightbulbIcon, Copy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getSuggestedQuestions, type SuggestedQuestion } from './suggested-questions';
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
  explainable?: {
    emotion?: string;
    stage?: string;
    brandGoals?: string[];
    reason?: string;
  };
};

export default function MuskChatPanel({ context, onClose }: MuskChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'resume' | 'pitchdeck'>('resume');
  const [userData, setUserData] = useState<UserData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pitchDeckFileInputRef = useRef<HTMLInputElement>(null);
  
  // For generating personalized suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [engagementHistory, setEngagementHistory] = useState<Record<string, number>>({});
  const [suggestedTemplateIds, setSuggestedTemplateIds] = useState<number[]>([]);
  const { user } = useAuth(); // Get current user data from auth context
  
  // Helper function: Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Helper function: Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-[rgba(255,255,255,0.1)] rounded w-2/3 animate-pulse"></div>
    </div>
  );
  
  // Initialize with default welcome message (personalized questions will load)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi there! I'm Musk, your AI career assistant. I can analyze your resume or pitch deck, and provide personalized professional guidance. How can I help with your career development today?",
      sender: 'musk',
      timestamp: new Date(),
      quickResponses: [] // Will be populated with AI-generated personalized questions
    }
  ]);
  
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
  
  // Generate suggested questions when user data is available
  useEffect(() => {
    if (userData) {
      // Load engagement history from localStorage if available
      try {
        const saved = localStorage.getItem('musk-question-engagement');
        if (saved) {
          setEngagementHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load question engagement history:", error);
      }
      
      // Generate AI-powered contextual suggestions
      generateContextualSuggestions();
    }
  }, [userData]);
  
  // Generate AI-powered contextual suggestions
  const generateContextualSuggestions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/musk/contextual-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          conversationHistory: messages,
          suggestedTemplateIds, // Pass previously suggested template IDs to avoid repeats
          profileData: userData ? {
            title: userData.title,
            industry: userData.industry,
            lookingFor: userData.lookingFor,
            domain: userData.domain,
            location: userData.location
          } : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiQuestions: SuggestedQuestion[] = data.suggestions.map((suggestion: any, idx: number) => ({
          id: `ai-${suggestion.template_id || Date.now()}-${idx}`,
          text: suggestion.text || suggestion,
          category: 'career',
          relevanceScore: 1.0,
          isNew: true
        }));
        
        setSuggestedQuestions(aiQuestions);
        
        // Track the template IDs that were just suggested
        const newTemplateIds = data.suggestions
          .map((suggestion: any) => suggestion.template_id)
          .filter((id: any) => id !== undefined);
        
        if (newTemplateIds.length > 0) {
          setSuggestedTemplateIds(prev => [...prev, ...newTemplateIds]);
          console.log('[Musk Chat] Tracking suggested template IDs:', newTemplateIds);
        }
        
        console.log('[Musk Chat] Generated AI suggestions from:', data.source);
      } else {
        // Fallback to static questions if API fails
        const questions = getSuggestedQuestions(userData, engagementHistory);
        setSuggestedQuestions(questions);
      }
    } catch (error) {
      console.error('[Musk Chat] Error generating suggestions:', error);
      // Fallback to static questions
      const questions = getSuggestedQuestions(userData, engagementHistory);
      setSuggestedQuestions(questions);
    }
  };
  
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
    
    // Get user ID from context, but prefer Firebase UID if available
    // This will allow our backend to properly resolve the numeric user ID
    
    // Prefer the Firebase UID when available, as it's what the server expects for lookup
    let userId;
    if (user?.uid) {
      userId = user.uid; // This is the Firebase UID (string)
      console.log("Musk chat: Using Firebase UID from auth:", userId);
    } else if (context?.userId) {
      userId = context.userId;
      console.log("Musk chat: Using userId from context:", userId, "type:", typeof userId);
    } else {
      console.log("Musk chat: No userId available in context or auth");
    }
    
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
      // Instead of separate quick responses, use the suggested questions
      // that we've already generated
      const personalizedQuestions = suggestedQuestions.slice(0, 4).map(q => q.text);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: data.id || 'response-' + Date.now(),
                content: content,
                sender: 'musk',
                timestamp: new Date(),
                quickResponses: personalizedQuestions.length > 0 
                  ? personalizedQuestions 
                  : quickResponses // Fallback to regular quick responses if no suggested questions
              }
            : msg
        )
      );
      
      // Update engagement history for the suggested questions that were used
      if (personalizedQuestions.length > 0) {
        // Find the categories of the questions we just used
        const usedQuestions = suggestedQuestions.slice(0, 4);
        const newHistory = { ...engagementHistory };
        
        // Increment usage count for each category
        usedQuestions.forEach(question => {
          newHistory[question.category] = (newHistory[question.category] || 0) + 1;
        });
        
        // Save updated history
        setEngagementHistory(newHistory);
        try {
          localStorage.setItem('musk-question-engagement', JSON.stringify(newHistory));
        } catch (error) {
          console.error("Failed to save question engagement history:", error);
        }
        
        // Generate new AI-powered contextual questions based on the conversation
        generateContextualSuggestions();
      }
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
    
    // Get user ID from context, but prefer Firebase UID if available 
    // This will allow our backend to properly resolve the numeric user ID
    
    // Prefer the Firebase UID when available, as it's what the server expects for lookup
    let userId;
    if (user?.uid) {
      userId = user.uid; // This is the Firebase UID (string)
      console.log("Musk file upload: Using Firebase UID from auth:", userId);
    } else if (user?.id) {
      userId = user.id; // Simple auth numeric ID
      console.log("Musk file upload: Using user.id from auth:", userId);
    } else if (context?.userId) {
      userId = context.userId;
      console.log("Musk file upload: Using userId from context:", userId, "type:", typeof userId);
    } else {
      console.log("Musk file upload: No userId available in context or auth");
    }
    
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
      // Only append userId if it exists
      if (userId !== null && userId !== undefined) {
        formData.append('userId', userId.toString());
      }
      
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
      
      // Check if response contains an error
      if (uploadResult.error) {
        throw new Error(JSON.stringify({
          error: uploadResult.error,
          message: uploadResult.message,
          suggestion: uploadResult.suggestion,
          details: uploadResult.details
        }));
      }
      
      // The result includes the analysis message directly
      const analyzeResult = {
        analysis: uploadResult.analysis || uploadResult.message || 'Analysis completed successfully'
      };
      
      // Use personalized questions or fallback to file-type specific responses
      const personalizedQuestions = suggestedQuestions.slice(0, 4).map(q => q.text);
      
      // If we have personalized questions, use them
      // Otherwise fall back to default file-type specific responses
      const quickResponses = personalizedQuestions.length > 0 
        ? personalizedQuestions
        : (isResume 
            ? [
                'How can I improve my skills section?',
                'What about my work experiences?',
                'Can you help me tailor it for a specific role?'
              ]
            : [
                'How can I improve my problem statement?',
                'Is my business model compelling enough?',
                'What should I focus on for investor readiness?'
              ]);
      
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
      
      // Update engagement history if we used personalized questions
      if (personalizedQuestions.length > 0) {
        // Find the categories of the questions we just used
        const usedQuestions = suggestedQuestions.slice(0, 4);
        const newHistory = { ...engagementHistory };
        
        // Increment usage count for each category
        usedQuestions.forEach(question => {
          newHistory[question.category] = (newHistory[question.category] || 0) + 1;
        });
        
        // Save updated history
        setEngagementHistory(newHistory);
        try {
          localStorage.setItem('musk-question-engagement', JSON.stringify(newHistory));
        } catch (error) {
          console.error("Failed to save question engagement history:", error);
        }
        
        // Generate new AI-powered contextual questions based on the conversation
        generateContextualSuggestions();
      }
      
      toast({
        title: 'Analysis complete',
        description: `Your ${isResume ? 'resume' : 'pitch deck'} has been analyzed successfully`,
      });
      
    } catch (error) {
      console.error(`Error processing ${isResume ? 'resume' : 'pitch deck'}:`, error);
      
      // Try to extract detailed error information from the response
      let errorTitle = `Failed to analyze your ${isResume ? 'resume' : 'pitch deck'}`;
      let errorDescription = isResume
        ? "I'm sorry, I had trouble processing your resume. Please try again or upload a different file format."
        : "I'm sorry, I had trouble analyzing your pitch deck. Please make sure it's a valid PDF and try again.";
      
      let chatMessage = errorDescription;
      
      // Try to parse structured error response if available
      if (error instanceof Error && error.message) {
        try {
          // Try to parse as JSON (for structured errors from backend)
          const errorData = JSON.parse(error.message) as { error?: string; message?: string; suggestion?: string; details?: string };
          if (errorData.message) {
            errorDescription = errorData.message;
            if (errorData.suggestion) {
              chatMessage = `${errorData.message}\n\n💡 **Suggestion:** ${errorData.suggestion}`;
            } else {
              chatMessage = errorData.message;
            }
            
            // Customize title based on error type
            if (errorData.error === 'INVALID_FILE_TYPE') {
              errorTitle = 'Unsupported File Type';
            } else if (errorData.error === 'FILE_TOO_LARGE') {
              errorTitle = 'File Size Exceeded';
            } else if (errorData.error === 'TEXT_EXTRACTION_ERROR') {
              errorTitle = 'Unable to Read File';
            } else if (errorData.error === 'AI_SERVICE_ERROR') {
              errorTitle = 'Service Temporarily Unavailable';
            } else if (errorData.error === 'SERVICE_TIMEOUT') {
              errorTitle = 'Processing Timeout';
            }
          }
        } catch (parseError) {
          // If JSON parsing fails, try extracting from plain error message
          const msg = error.message.toLowerCase();
          if (msg.includes('invalid file') || msg.includes('file type') || msg.includes('not allowed')) {
            errorTitle = 'Unsupported File Type';
            errorDescription = 'The file type you uploaded is not supported. Please upload: PDF, Word (.doc/.docx), Text (.txt), or RTF.';
            chatMessage = errorDescription;
          } else if (msg.includes('too large') || msg.includes('exceeds')) {
            errorTitle = 'File Size Exceeded';
            errorDescription = 'Your file is too large. Please upload a file smaller than 10MB.';
            chatMessage = errorDescription;
          } else if (msg.includes('text') || msg.includes('extract') || msg.includes('corrupted') || msg.includes('empty')) {
            errorTitle = 'Unable to Read File';
            errorDescription = 'Could not read the content of your file. Make sure it is a valid, readable document. Try converting it to PDF format.';
            chatMessage = errorDescription;
          }
        }
      }
      
      // Replace the thinking message with the detailed error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === thinkingMessage.id 
            ? {
                id: 'error-' + Date.now(),
                content: chatMessage,
                sender: 'musk',
                timestamp: new Date()
              }
            : msg
        )
      );
      
      toast({
        title: errorTitle,
        description: errorDescription,
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
    <>
      {/* Completely hidden file inputs outside main component */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx"
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />
      
      <input
        type="file"
        ref={pitchDeckFileInputRef}
        onChange={handleFileUpload}
        accept=".pdf"
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        className="fixed bottom-4 right-4 w-96 h-[80vh] max-h-[700px] z-50 flex flex-col overflow-hidden rounded-xl"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          background: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header with message counter */}
        <div 
          className="flex items-center justify-between p-4"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'transparent',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              <img 
                src="/Contact Candour_1761062906599.gif"
                alt="Musk AI" 
                className="h-full w-full object-cover rounded-full"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white">Musk</h3>
              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>AI Career Assistant</p>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)]">
              {messages.length} messages
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full text-white hover:bg-white/10 border-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto" role="log" aria-live="polite" aria-label="Chat messages">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in fade-in-0 zoom-in-95 duration-300",
                  message.sender === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar Badge Improvement #7 */}
                {message.sender === 'user' ? (
                  <div className="h-8 w-8 rounded-full flex-shrink-0 bg-[rgba(255,255,255,0.2)] flex items-center justify-center text-xs font-semibold text-white border border-[rgba(255,255,255,0.3)]">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                    <img src="/Contact Candour_1761062906599.gif" alt="Musk" className="h-full w-full object-cover" />
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={cn(
                    "flex flex-col rounded-2xl p-4 max-w-[45%] xs:max-w-[50%] sm:max-w-[55%] md:max-w-[60%]",
                    message.sender === 'user' ? "rounded-tr-sm" : "rounded-tl-sm"
                  )}
                  style={message.sender === 'user' ? {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  } : {
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: 'white'
                  }}
                  role={message.sender === 'musk' ? 'article' : undefined}
                  aria-label={`${message.sender === 'user' ? 'Your' : 'Musk'} message`}
                >
                  {/* Show loading skeleton instead of "Thinking" - Improvement #6 */}
                  {message.thinking ? (
                    <LoadingSkeleton />
                  ) : (
                    <div 
                      className="text-sm whitespace-pre-wrap leading-relaxed text-white prose prose-sm max-w-none prose-invert prose-headings:mb-2 prose-headings:mt-4 prose-h3:text-base prose-h2:text-lg prose-h1:text-xl prose-li:my-0 prose-p:my-2 first:prose-headings:mt-0 prose-headings:text-white prose-p:text-white prose-li:text-white prose-strong:text-white prose-em:text-white"
                      style={{color: 'white'}}
                      dangerouslySetInnerHTML={{ 
                        __html: (message.content || '')
                          // Headers
                          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                          // Bold and Italic
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          // Sections with emoji headers
                          .replace(/(^|[^\w])([🔍📊📈🎯🧠⚠️💡✅❓📝📌]+) (.*?):/gm, '$1<h3 class="flex items-center gap-2"><span class="text-xl">$2</span> $3:</h3>')
                          // Code formatting - Improvement #4 (Better syntax highlighting)
                          .replace(/```([^`]+)```/gm, '<pre style="background:rgba(0,0,0,0.3);padding:12px;border-radius:6px;border-left:3px solid rgba(59,130,246,0.5);overflow-x:auto;margin:8px 0"><code style="color:#00d4ff;font-family:monospace">$1</code></pre>')
                          .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:3px;color:#00d4ff;font-family:monospace">$1</code>')
                          // Bullet lists
                          .replace(/^- (.*)/gm, '<li>$1</li>')
                          .replace(/<li>/g, '<ul class="list-disc pl-5 my-2"><li>').replace(/<\/li>\s*(?!<li>|<\/ul>)/g, '</li></ul>')
                          // Checkboxes
                          .replace(/^\[x\] (.*)/gm, '<div class="flex items-start gap-2 my-1"><div class="rounded-sm w-4 h-4 mt-1 bg-primary flex items-center justify-center"><svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 1L4 7L1 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div>$1</div></div>')
                          .replace(/^\[ \] (.*)/gm, '<div class="flex items-start gap-2 my-1"><div class="rounded-sm w-4 h-4 mt-1 border border-border"></div><div>$1</div></div>')
                          // Horizontal rule
                          .replace(/^---$/gm, '<hr class="my-4">')
                          // Paragraphs
                          .replace(/\n\n/g, '</p><p>')
                      }}
                    ></div>
                  )}

                  {/* Timestamp & Copy Button - Improvements #1 & #2 */}
                  {!message.thinking && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[rgba(255,255,255,0.6)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'musk' && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            toast({
                              title: 'Copied!',
                              description: 'Message copied to clipboard'
                            });
                          }}
                          className="hover:text-white transition-colors flex items-center gap-1"
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Message Meta Chips (B5) - Intent, Stage, Confidence */}
                {message.sender === 'musk' && message.explainable && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity">
                    {message.explainable.emotion && (
                      <span className="px-2 py-1 rounded-full bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] text-[rgba(255,255,255,0.8)]">
                        {message.explainable.emotion}
                      </span>
                    )}
                    {message.explainable.stage && (
                      <span className="px-2 py-1 rounded-full bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] text-[rgba(255,255,255,0.8)]">
                        {message.explainable.stage}
                      </span>
                    )}
                  </div>
                )}

                {/* Explainable Musk Banner (Layer 8) - Collapsible with Emoji & Why Link */}
                {message.sender === 'musk' && message.explainable && (
                  <details className="mt-3 cursor-pointer group">
                    <summary className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(59,130,246,0.08)] hover:bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.3)] text-xs font-medium text-white transition-colors">
                      <LightbulbIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span>
                        {message.explainable.emotion && `😊 ${message.explainable.emotion}`}
                        {message.explainable.stage && ` • ${message.explainable.stage}`}
                      </span>
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-[rgba(59,130,246,0.06)] border-l-4 border-l-[rgba(59,130,246,0.5)]" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      <div className="text-xs leading-relaxed">
                        {message.explainable.reason && (
                          <div className="mb-2">{message.explainable.reason}</div>
                        )}
                        <button 
                          className="text-blue-400 hover:text-blue-300 underline text-xs transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            toast({
                              title: "Why this suggestion?",
                              description: `Intent classification matched your ${message.explainable?.emotion} state in the ${message.explainable?.stage} stage, using 8-layer emotional intelligence system.`
                            });
                          }}
                        >
                          Why this? →
                        </button>
                      </div>
                    </div>
                  </details>
                )}

                {/* Rich Action Cards (B1) - Actionable cards with icons + CTAs */}
                {message.sender === 'musk' && message.quickResponses && message.quickResponses.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {message.quickResponses.slice(0, 3).map((response, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickResponse(response)}
                        className="px-4 py-2 text-xs text-left rounded-lg transition-all duration-200 hover:shadow-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: 'rgba(255, 255, 255, 0.95)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.18)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                        }}
                        aria-label={`Suggested response: ${response}`}
                      >
                        <div className="line-clamp-2">{response}</div>
                      </button>
                    ))}
                    {message.quickResponses.length > 3 && (
                      <button 
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                        onClick={() => {
                          toast({
                            title: "More suggestions",
                            description: `${message.quickResponses!.slice(3).join(', ')}`
                          });
                        }}
                      >
                        +{message.quickResponses.length - 3} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div 
          style={{
            height: '1px',
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        />
        


        {/* We're removing the separate Suggested Questions section 
            and will instead show suggested questions directly in the chat */}
        
        {/* File upload buttons */}
        <div 
          className="flex items-center justify-center gap-2 px-4 py-2"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 text-white border-0"
            disabled={isTyping || isUploading}
            title="Upload Resume"
            onClick={triggerResumeUpload}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isTyping && !isUploading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <FileText className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-2 text-white border-0"
            disabled={isTyping || isUploading}
            title="Upload Pitch Deck"
            onClick={triggerPitchDeckUpload}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isTyping && !isUploading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
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
              className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20 h-12 text-sm sm:text-base"
              disabled={isTyping || isUploading}
            />
          </div>
          <Button 
            type="submit" 
            variant="default" 
            className="px-3 gap-2 text-white border-0"
            disabled={!inputValue.trim() || isTyping || isUploading}
            title="Send message"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
        
        {/* Upload progress indicator */}
        {isUploading && (
          <div 
            className="px-4 py-2"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-xs mb-1 flex justify-between text-white">
              <span>Uploading {uploadType === 'resume' ? 'resume' : 'pitch deck'}...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div 
              className="h-1 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{ 
                  width: `${uploadProgress}%`,
                  background: 'linear-gradient(135deg, #3B82F6, #0EA5E9)'
                }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}