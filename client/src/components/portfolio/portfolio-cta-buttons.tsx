import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, MessageCircle, X, 
  ChevronDown, Send, File, Paperclip, Loader2, Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ResumeButton } from "@/components/shared/resume-button";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface PortfolioCtaButtonsProps {
  variant?: 'default' | 'corporate' | 'creative' | 'minimal' | 'technical' | 'artistic' | 'fashion-quantum';
  resumeUrl?: string | null;
  mentorUrl?: string | null;
  connectUrl?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userId?: number | string | null;
  className?: string;
  size?: string;
  buttonStyle?: React.CSSProperties;
}

export default function PortfolioCtaButtons({
  variant = 'default',
  resumeUrl = null,
  mentorUrl = null,
  connectUrl = null,
  userEmail = null,
  userName = null,
  userId = null,
  className = '',
  size = '',
  buttonStyle = {}
}: PortfolioCtaButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIntro, setSelectedIntro] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mutation for sending connection request
  const connectionMutation = useMutation({
    mutationFn: async (data: { receiverId: number, reason: string, message: string }) => {
      console.log(`[PortfolioCTA] Sending connection request to user ${data.receiverId}`);
      const response = await apiRequest('POST', '/api/connection-requests', data);
      const result = await response.json();
      console.log(`[PortfolioCTA] ✅ Connection request sent successfully:`, result);
      return result;
    },
    onSuccess: () => {
      console.log(`[PortfolioCTA] Connection request success handler called`);
      toast({
        title: "Connection request sent!",
        description: `Your connection request has been sent to ${userName}. You'll be notified when they respond.`,
      });
      setDialogOpen(false);
      setSelectedIntro("");
      setMessage("");
      setFile(null);
      // Invalidate connection requests cache
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'sent-connection-requests'] });
    },
    onError: (error: any) => {
      console.error(`[PortfolioCTA] ❌ Connection request error:`, error);
      toast({
        title: "Failed to send request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const introOptions = [
    "Exciting job opportunities are available, and I believe you'd be a great fit.",
    "Would you be open to teaming up on innovative projects?",
    "Let's connect — I admire your work and would love to stay in touch.",
    "I'd like to explore a potential partnership opportunity with you.",
    "I have some exciting freelance projects you might be interested in."
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitRequest = async () => {
    // Check if purpose is selected (now mandatory)
    if (!selectedIntro || selectedIntro === "") {
      toast({
        title: "Purpose required",
        description: "Please select a purpose for your connection request",
        variant: "destructive",
      });
      return;
    }
    
    // Check if message is provided
    if (message.trim() === '') {
      toast({
        title: "Message required",
        description: "Please write a message to send with your request",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is logged in
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to send connection requests",
        variant: "destructive",
      });
      return;
    }
    
    // Check if receiverId is valid
    if (!userId) {
      toast({
        title: "Invalid recipient",
        description: "Cannot send connection request to this user",
        variant: "destructive",
      });
      return;
    }
    
    // Send connection request via API (server uses authenticated user ID)
    const fileInfo = file ? `\n\nAttachment: ${file.name}` : '';
    const combinedMessage = `${message}${fileInfo}`;
    
    connectionMutation.mutate({
      receiverId: typeof userId === 'string' ? parseInt(userId) : userId,
      reason: selectedIntro,
      message: combinedMessage,
    });
  };
  
  const handleDownloadResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      // Fallback to email if no resume URL
      const subject = `Request for Resume from ${userName || 'your profile'}`;
      const body = `Hello,\n\nI came across your profile and would like to see your resume.\n\nThank you!`;
      window.location.href = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  
  const handleMentorRequest = () => {
    if (mentorUrl) {
      window.open(mentorUrl, '_blank');
    } else {
      // Fallback to email if no mentor URL
      const subject = `Mentorship Request for ${userName || 'you'}`;
      const body = `Hello,\n\nI'm interested in connecting with you for mentorship.\n\nLooking forward to your response!\n\nBest regards,`;
      window.location.href = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  
  const handleConnect = () => {
    setDialogOpen(true);
  };
  
  const handleDownloadPortfolio = async () => {
    if (!userId) {
      toast({
        title: "Cannot download portfolio",
        description: "User information is not available",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your portfolio download.",
      });
      
      const response = await fetch(`/api/portfolio/${userId}/download-pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${userName?.toLowerCase().replace(/\s+/g, '-') || 'portfolio'}-portfolio.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download complete!",
        description: "Your portfolio has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Unable to generate the portfolio PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Styles based on portfolio variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'corporate':
        return {
          container: `flex flex-col sm:flex-row ${className}`,
          resumeBtn: 'bg-gradient-to-r from-[#6a0dad] to-[#9c27b0] hover:opacity-90 text-white border-none text-sm h-8 px-3',
          mentorBtn: 'border-[#6a0dad] text-[#6a0dad] bg-white hover:bg-[#f8f5fd] text-sm h-8 px-3',
          connectBtn: 'border-[#6a0dad] text-[#6a0dad] bg-white hover:bg-[#f8f5fd] text-sm h-8 px-3',
          downloadBtn: 'border-[#6a0dad] text-[#6a0dad] bg-white hover:bg-[#f8f5fd] text-sm h-8 px-3'
        };
      case 'creative':
        return {
          container: `flex flex-wrap gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white border-none',
          mentorBtn: 'border-purple-400 text-purple-600 bg-white hover:bg-purple-50',
          connectBtn: 'border-pink-400 text-pink-600 bg-white hover:bg-pink-50',
          downloadBtn: 'border-purple-400 text-purple-600 bg-white hover:bg-purple-50'
        };
      case 'minimal':
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-gray-900 hover:bg-gray-800 text-white border-none',
          mentorBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
          connectBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
          downloadBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        };
      case 'technical':
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-blue-600 hover:bg-blue-700 text-white border-none',
          mentorBtn: 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50',
          connectBtn: 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50',
          downloadBtn: 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50'
        };
      case 'artistic':
        return {
          container: `flex flex-wrap gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-[#a83838] hover:bg-[#8e2d2d] text-white border-none',
          mentorBtn: 'border-[#3a7b7b] text-[#3a7b7b] bg-white hover:bg-[#3a7b7b]10',
          connectBtn: 'border-[#2c3e50] text-[#2c3e50] bg-white hover:bg-[#2c3e50]10',
          downloadBtn: 'border-[#3a7b7b] text-[#3a7b7b] bg-white hover:bg-[#3a7b7b]10'
        };
      case 'fashion-quantum':
        return {
          container: `flex flex-wrap gap-3 ${className}`,
          resumeBtn: 'bg-gradient-to-r from-[#F9C5D5] to-[#FDF3D9] hover:opacity-90 text-[#050509] border-none font-medium',
          mentorBtn: 'border-[#F5F3EE]/30 text-[#F5F3EE] bg-transparent hover:bg-[#F5F3EE]/10',
          connectBtn: 'border-[#F9C5D5]/40 text-[#FDF3D9] bg-transparent hover:bg-[#F9C5D5]/10',
          downloadBtn: 'border-[#F5F3EE]/30 text-[#F5F3EE] bg-transparent hover:bg-[#F5F3EE]/10'
        };
      default:
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-primary hover:bg-primary/90 text-white border-none',
          mentorBtn: 'border-primary/30 text-primary bg-white hover:bg-primary/10',
          connectBtn: 'border-primary/30 text-primary bg-white hover:bg-primary/10',
          downloadBtn: 'border-primary/30 text-primary bg-white hover:bg-primary/10'
        };
    }
  };
  
  const styles = getButtonStyles();
  
  return (
    <>
      <div className={styles.container}>
        {userId ? (
          <ResumeButton
            userId={userId}
            variant={variant}
            className={`${styles.resumeBtn} flex items-center gap-2 min-w-[120px] justify-center`}
            buttonStyle={buttonStyle}
            label="Resume"
          />
        ) : (
          <Button 
            onClick={handleDownloadResume}
            className={`${styles.resumeBtn} flex items-center gap-2 min-w-[120px] justify-center`}
            style={Object.keys(buttonStyle).length > 0 ? buttonStyle : undefined}
          >
            Resume
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleMentorRequest}
          className={`${styles.mentorBtn} flex items-center gap-2 min-w-[120px] justify-center`}
          style={Object.keys(buttonStyle).length > 0 ? buttonStyle : undefined}
        >
          <UserPlus size={16} />
          Mentor
        </Button>
        
        <Button 
          variant={variant === 'corporate' ? 'default' : 'outline'}
          onClick={handleConnect}
          className={variant === 'corporate' 
            ? 'bg-[#6a0dad] hover:bg-[#7b1fa2] text-white border-none flex items-center gap-2 min-w-[120px] justify-center text-sm h-8 px-3'
            : `${styles.connectBtn} flex items-center gap-2 min-w-[120px] justify-center`}
          style={Object.keys(buttonStyle).length > 0 ? buttonStyle : undefined}
          data-testid="button-connect"
        >
          <MessageCircle size={16} />
          Let's Talk
        </Button>
      </div>

      {/* Let's Talk Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl !bg-transparent !border-0 !p-0 !shadow-none">
          <div className="neo-glass-panel rounded-2xl p-6">
            <DialogHeader className="space-y-3 pb-4 border-b border-white/20">
              <DialogTitle className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-white tracking-tight">Let's Talk with {userName || 'Professional'}</span>
                <DialogClose className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <X size={18} />
                </DialogClose>
              </DialogTitle>
            </DialogHeader>
          
          <div className="px-1 pt-6 pb-2 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Dropdown with pre-written intros */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white/90 tracking-wide uppercase text-xs">
                Purpose to connect <span className="text-red-400">*</span>
              </label>
              
              {/* Custom radio button implementation instead of Select */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                
                {introOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`group relative p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                      selectedIntro === option
                        ? 'bg-white/20 border-white/40 shadow-lg shadow-white/10'
                        : 'bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600 hover:shadow-md hover:shadow-white/5 hover:-translate-y-0.5'
                    }`} 
                    onClick={() => setSelectedIntro(option)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-5 w-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${selectedIntro === option ? 'border-white bg-white/20' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                        {selectedIntro === option && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-white leading-relaxed font-medium">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Message textarea */}
            <div className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-white/90 tracking-wide uppercase text-xs">
                  Your message
                </label>
                <span className="text-white/40 text-xs font-medium">
                  {message.length}/350
                </span>
              </div>
              <Textarea
                placeholder="Write a short note..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 350))}
                className="min-h-[120px] resize-none !bg-zinc-900/80 !border-zinc-700 !text-white !placeholder:text-zinc-400 focus:!border-primary focus:!ring-1 focus:!ring-primary px-4 py-3 rounded-xl transition-all duration-200"
              />
            </div>
            
            {/* File attachment section */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-white/90 tracking-wide uppercase text-xs">Attachment <span className="text-white/40 font-normal lowercase">(optional)</span></label>
              
              {!file ? (
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-zinc-300 bg-zinc-900/50 transition-all duration-200 cursor-pointer group ${
                    isDragging 
                      ? 'border-primary bg-primary/10' 
                      : 'border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Paperclip className={`h-10 w-10 mb-3 transition-colors ${
                    isDragging ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`} />
                  <p className="text-sm text-center mb-1 text-white font-medium">
                    {isDragging ? 'Drop file here' : 'Click to upload or drag files here'}
                  </p>
                  <p className="text-xs text-zinc-400">PDF, DOC, images up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="!hidden"
                    style={{ 
                      display: 'none !important' as any,
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: 0,
                      height: 0
                    }}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                </div>
              ) : (
                <div className="border-2 border-zinc-700 rounded-xl p-4 bg-zinc-900/50 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800">
                      <File className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveFile}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
                  >
                    <X size={18} />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="pt-6 pb-2 border-t border-white/20 mt-8">
              <Button 
                onClick={handleSubmitRequest}
                className="w-full h-12 neo-glass-button bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80 font-semibold text-base"
                disabled={connectionMutation.isPending}
                data-testid="button-send-connection-request"
              >
                {connectionMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}