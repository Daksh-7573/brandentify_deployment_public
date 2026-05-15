import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MuskChatInput } from '@/components/musk/musk-chat-input';
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
import { getSuggestedQuestions, type SuggestedQuestion } from './suggested-questions';
import { UserData } from '@/types/user';
import { FEATURES } from '@/config/features';

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
  const ENABLE_RESUME_UPLOAD = FEATURES.ENABLE_RESUME_UPLOAD;
  const ENABLE_PITCH_DECK = FEATURES.ENABLE_PITCH_DECK;
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

  // Helper function: Loading Skeleton - Improved typing indicator
  const LoadingSkeleton = () => (
    <div className="flex items-center gap-2 py-2">
      <div className="flex items-center gap-1.5">
        <div 
          className="h-2.5 w-2.5 rounded-full bg-white/40 animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        ></div>
        <div 
          className="h-2.5 w-2.5 rounded-full bg-white/40 animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        ></div>
        <div 
          className="h-2.5 w-2.5 rounded-full bg-white/40 animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        ></div>
      </div>
      <span className="text-xs text-white/60 ml-2">Musk is thinking...</span>
    </div>
  );
  
  // Initialize with default welcome message (no follow-ups on first message)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi there! I'm Musk, your AI career assistant. I can analyze your resume or pitch deck, and provide personalized professional guidance. How can I help with your career development today?",
      sender: 'musk',
      timestamp: new Date(),
      quickResponses: []
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

  useEffect(() => {
    const loadHistory = async () => {
      if (!context?.userId) return;

      try {
        const response = await apiRequest("GET", `/api/musk-chat/history/${context.userId}`);
        const data = await response.json();
        const historyMessages = Array.isArray(data?.messages)
          ? data.messages.map((entry: any, index: number) => ({
              id: `${entry.role || 'history'}-${index}`,
              content: entry.message || '',
              sender: entry.role === 'musk' ? 'musk' : 'user',
              timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
            }))
          : [];

        if (historyMessages.length > 0) {
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error('[Musk Chat] Failed to load history:', error);
      }
    };

    loadHistory();
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
      
      // Note: Contextual suggestions disabled - only use AI-extracted follow-ups
      // generateContextualSuggestions();
    }
  }, [userData]);
  
  // Generate AI-powered contextual suggestions
  const generateContextualSuggestions = async () => {
    try {
      const questions = getSuggestedQuestions(userData, engagementHistory);
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('[Musk Chat] Error generating suggestions:', error);
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

    if (!context?.userId) {
      toast({
        title: 'Missing user context',
        description: 'Open Musk from a profile to enable backend chat.',
      });
      return;
    }

    const messageText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      content: 'Musk is thinking...',
      sender: 'musk',
      timestamp: new Date(),
      thinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInputValue('');
    setIsTyping(true);

    const finalQuickResponses = suggestedQuestions.length > 0
      ? suggestedQuestions.slice(0, 6).map(question => question.text)
      : ['Tell me more about this', 'What are the next steps?', 'How can I apply this?'];

    const pendingReplyId = thinkingMessage.id;

    const applyMuskReply = (content: string, options?: { messageId?: string; quickResponses?: string[] }) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      setMessages(prev => prev.map(msg =>
        msg.id === pendingReplyId
          ? {
              ...msg,
              id: options?.messageId || msg.id,
              content: trimmed,
              sender: 'musk',
              thinking: false,
              timestamp: new Date(),
              quickResponses: options?.quickResponses || finalQuickResponses,
            }
          : msg
      ));
    };

    try {
      const response = await apiRequest('POST', '/api/musk-chat/message', {
        userId: context.userId,
        message: messageText,
        page: context.page,
        section: context.section,
        data: context.data,
        stream: true,
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamedContent = '';
        let doneQuickResponses = finalQuickResponses;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() || '';

          for (const block of blocks) {
            const lines = block.split('\n');
            let eventName = 'message';
            let payloadText = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                payloadText += line.slice(5).trim();
              }
            }

            if (!payloadText) continue;

            try {
              const payload = JSON.parse(payloadText);
              if (eventName === 'token' && typeof payload.token === 'string') {
                streamedContent += payload.token;
                applyMuskReply(streamedContent);
              } else if (eventName === 'done') {
                streamedContent = payload?.response || streamedContent;
                if (Array.isArray(payload?.quickResponses) && payload.quickResponses.length > 0) {
                  doneQuickResponses = payload.quickResponses;
                }
                applyMuskReply(streamedContent, {
                  messageId: payload?.assistantMessage?.id
                    ? String(payload.assistantMessage.id)
                    : undefined,
                  quickResponses: doneQuickResponses,
                });
              }
            } catch {
              // Ignore malformed stream chunks and keep rendering what we already have.
            }
          }
        }

        if (!streamedContent.trim()) {
          throw new Error('Musk returned an empty streamed response');
        }
        applyMuskReply(streamedContent, { quickResponses: doneQuickResponses });
      } else {
        const data = await response.json();
        if (data?.success === false) {
          throw new Error(data?.error || 'Musk Chat request failed');
        }
        const content = data?.response || data?.message || '';
        if (!content.trim()) {
          throw new Error(data?.error || 'Musk returned an empty response');
        }

        applyMuskReply(content, {
          messageId: data?.id || `response-${Date.now()}`,
          quickResponses: data?.quickResponses || finalQuickResponses,
        });
      }

      if (suggestedQuestions.length > 0) {
        const usedQuestions = suggestedQuestions.slice(0, 4);
        const newHistory = { ...engagementHistory };

        usedQuestions.forEach(question => {
          newHistory[question.category] = (newHistory[question.category] || 0) + 1;
        });

        setEngagementHistory(newHistory);
        try {
          localStorage.setItem('musk-question-engagement', JSON.stringify(newHistory));
        } catch (error) {
          console.error('Failed to save question engagement history:', error);
        }

        generateContextualSuggestions();
      }

      toast({
        title: 'Message sent',
        description: 'Musk processed your message.',
      });
    } catch (error) {
      console.error('Error getting Musk response:', error);
      const errorDetail = error instanceof Error ? error.message : 'Unknown error';

      setMessages(prev => prev.map(msg => 
        msg.id === pendingReplyId
          ? {
              id: `error-${Date.now()}`,
              content: `I could not complete that request (${errorDetail}). Please try again in a moment.`,
              sender: 'musk',
              thinking: false,
              timestamp: new Date(),
            }
          : msg
      ));

      toast({
        title: 'Musk Chat error',
        description: errorDetail.includes('503') || errorDetail.includes('502')
          ? 'The server could not process your message. Please try again.'
          : errorDetail.slice(0, 120),
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

    const isResume = e.target === fileInputRef.current;
    const isPitchDeck = e.target === pitchDeckFileInputRef.current;
    const uploadedFile = e.target.files[0];

    if (isResume) {
      const name = uploadedFile.name.toLowerCase();
      const isPdf = name.endsWith('.pdf') || uploadedFile.type === 'application/pdf';
      if (!isPdf) {
        toast({
          title: 'PDF only',
          description: 'Please upload your resume as a PDF file.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
    }

    if (!context?.userId) {
      toast({
        title: 'Missing user context',
        description: 'Open Musk from a profile to upload a file.',
      });
      return;
    }

    if (!isResume && !isPitchDeck) {
      toast({
        title: 'Unsupported upload',
        description: 'Please use the resume or pitch deck upload buttons.',
      });
      return;
    }

    setIsUploading(true);
    setUploadType(isResume ? 'resume' : 'pitchdeck');
    setUploadProgress(20);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: isResume
          ? `I'm uploading my resume (${uploadedFile.name}) for analysis`
          : `I'm uploading my pitch deck (${uploadedFile.name}) for analysis`,
        sender: 'user',
        timestamp: new Date(),
      },
      {
        id: 'upload-stub-' + Date.now().toString(),
        content: isResume ? 'Analyzing resume...' : 'Analyzing pitch deck...',
        sender: 'musk',
        timestamp: new Date(),
        thinking: true,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append('userId', String(context.userId));
      formData.append(isResume ? 'resume' : 'deck', uploadedFile);
      formData.append(isResume ? 'fileName' : 'deckName', uploadedFile.name);

      const endpoint = isResume ? '/api/musk-chat/upload-resume' : '/api/musk/pitchdeck-upload';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Upload failed (${response.status})`
        );
      }
      const analysis = data?.analysis;
      const content =
        (typeof analysis === 'string' ? analysis : analysis?.summary) ||
        data?.response ||
        data?.message ||
        (isResume ? 'Resume analysis complete.' : 'Pitch deck analysis complete.');

      setMessages(prev => prev.map(msg =>
        msg.id.startsWith('upload-stub-')
          ? {
              id: data?.id || `${isResume ? 'resume' : 'pitchdeck'}-response-${Date.now()}`,
              content,
              sender: 'musk',
              thinking: false,
              timestamp: new Date(),
              quickResponses: isResume
                ? ['What should I fix first?', 'Tailor this for a role', 'Show me stronger bullets']
                : ['What is the biggest risk?', 'How do I sharpen the story?', 'What should I improve first?'],
            }
          : msg
      ));

      toast({
        title: isResume ? 'Resume analyzed' : 'Pitch deck analyzed',
        description: isResume ? 'Musk processed the uploaded resume.' : 'Musk processed the uploaded pitch deck.',
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Upload failed',
        description: isResume ? 'Unable to analyze the resume right now.' : 'Unable to analyze the pitch deck right now.',
        variant: 'destructive',
      });

      const failMessage =
        error instanceof Error
          ? error.message
          : isResume
            ? 'Resume analysis failed. Please try again.'
            : 'Pitch deck analysis failed. Please try again.';

      setMessages(prev => prev.map(msg =>
        msg.id.startsWith('upload-stub-')
          ? {
              id: `${isResume ? 'resume' : 'pitchdeck'}-error-${Date.now()}`,
              content: failMessage,
              sender: 'musk',
              thinking: false,
              timestamp: new Date(),
            }
          : msg
      ));
    } finally {
      setUploadProgress(100);
      setIsUploading(false);
    }

    e.target.value = '';
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
      {ENABLE_RESUME_UPLOAD && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,application/pdf"
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
      )}
      
      {ENABLE_PITCH_DECK && (
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
      )}

      <motion.div
        className={`${context?.page === 'messages' ? 'w-full h-full relative' : 'fixed bottom-4 right-4 w-96 h-[80vh] max-h-[700px] z-50 rounded-xl'} flex flex-col overflow-hidden`}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          background: context?.page === 'messages' ? 'transparent' : 'rgba(18, 18, 18, 0.95)',
          backdropFilter: context?.page === 'messages' ? 'none' : 'blur(16px)',
          border: context?.page === 'messages' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: context?.page === 'messages' ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header with message counter - Hidden when used in messages page (Chat component provides header) */}
        {context?.page !== 'messages' && (
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
                  src="/Contact Candour_1753488336182.gif"
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
        )}
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto" role="log" aria-live="polite" aria-label="Chat messages">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex gap-0 animate-in fade-in-0 zoom-in-95 duration-300 w-full",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {/* Message Bubble - No Avatars */}
                <div 
                  className={cn(
                    "flex flex-col rounded-2xl p-4 max-w-[95%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]",
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

                  {/* Follow-up Questions - Inside message bubble */}
                  {message.sender === 'musk' && !message.thinking && message.quickResponses && message.quickResponses.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.15)] space-y-2 w-full">
                      <div className="text-xs text-[rgba(255,255,255,0.8)] font-medium">💬 Continue:</div>
                      <div className="flex flex-col gap-2 w-full">
                        {message.quickResponses.map((response, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickResponse(response)}
                            className="w-full px-3 py-2 text-xs text-left rounded-lg transition-all duration-200 hover:shadow-lg whitespace-normal"
                            style={{
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                              color: 'rgba(255, 255, 255, 0.95)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                            }}
                            aria-label={`Follow-up: ${response}`}
                          >
                            {response}
                          </button>
                        ))}
                      </div>
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
        
        {/* Input form with integrated file upload */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
          {/* File upload buttons row */}
          <div className="flex items-center gap-2 mb-3">
            {ENABLE_RESUME_UPLOAD && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 h-9 rounded-lg border border-white/10"
                disabled={isTyping || isUploading}
                title="Upload Resume"
                onClick={triggerResumeUpload}
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Resume</span>
              </Button>
            )}
            {ENABLE_PITCH_DECK && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 h-9 rounded-lg border border-white/10"
                disabled={isTyping || isUploading}
                title="Upload Pitch Deck"
                onClick={triggerPitchDeckUpload}
              >
                <PresentationIcon className="h-4 w-4" />
                <span className="text-xs">Pitch Deck</span>
              </Button>
            )}
          </div>
          
          {/* Message input row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <MuskChatInput
                ref={inputRef}
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="transition-all"
                disabled={isTyping || isUploading}
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              className="h-11 w-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
              disabled={!inputValue.trim() || isTyping || isUploading}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
        
        {/* Upload progress indicator */}
        {isUploading && (
          <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-xs font-medium text-white">Uploading {uploadType === 'resume' ? 'resume' : 'pitch deck'}...</span>
              </div>
              <span className="text-xs font-semibold text-blue-400">{uploadProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white/10">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}