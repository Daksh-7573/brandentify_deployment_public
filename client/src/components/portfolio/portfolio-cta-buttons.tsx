import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, MessageCircle, X, 
  ChevronDown, Send, File, Paperclip
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

export interface PortfolioCtaButtonsProps {
  variant?: 'default' | 'corporate' | 'creative' | 'minimal' | 'technical';
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
  const { toast } = useToast();
  
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
  };

  const handleSubmitRequest = () => {
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
    
    // Combine selected intro and message
    const combinedMessage = `Purpose: ${selectedIntro}\n\n${message}`;
      
    // Send email with attachment info if present
    const fileInfo = file ? `\n\nI've also prepared a file (${file.name}) to share with you.` : '';
    const subject = `Let's Talk - Request from Brandentifier`;
    const body = `Hello ${userName || ''},\n\n${combinedMessage}${fileInfo}\n\nLooking forward to your response!\n\nBest regards,`;
    
    // In a real application, you'd upload the file to a server here
    // For now, we'll just direct to email
    window.location.href = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Close dialog
    setDialogOpen(false);
    // Reset state
    setSelectedIntro("");
    setMessage("");
    setFile(null);
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
    // Open the Let's Talk dialog
    setDialogOpen(true);
  };
  
  // Styles based on portfolio variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'corporate':
        return {
          container: `flex flex-col sm:flex-row ${className}`,
          resumeBtn: 'bg-gradient-to-r from-[#6a0dad] to-[#9c27b0] hover:opacity-90 text-white border-none text-sm h-8 px-3',
          mentorBtn: 'border-[#6a0dad] text-[#6a0dad] bg-white hover:bg-[#f8f5fd] text-sm h-8 px-3',
          connectBtn: 'border-[#6a0dad] text-[#6a0dad] bg-white hover:bg-[#f8f5fd] text-sm h-8 px-3'
        };
      case 'creative':
        return {
          container: `flex flex-wrap gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white border-none',
          mentorBtn: 'border-purple-400 text-purple-600 bg-white hover:bg-purple-50',
          connectBtn: 'border-pink-400 text-pink-600 bg-white hover:bg-pink-50'
        };
      case 'minimal':
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-gray-900 hover:bg-gray-800 text-white border-none',
          mentorBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
          connectBtn: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        };
      case 'technical':
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-blue-600 hover:bg-blue-700 text-white border-none',
          mentorBtn: 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50',
          connectBtn: 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50'
        };
      default:
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-primary hover:bg-primary/90 text-white border-none',
          mentorBtn: 'border-primary/30 text-primary bg-white hover:bg-primary/10',
          connectBtn: 'border-primary/30 text-primary bg-white hover:bg-primary/10'
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
            className={`flex items-center gap-2 min-w-[120px] justify-center`}
            buttonStyle={buttonStyle}
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
        >
          <MessageCircle size={16} />
          {variant === 'corporate' ? "Let's Talk" : "Connect"}
        </Button>
      </div>

      {/* Let's Talk Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-xl font-semibold">Let's Talk with {userName || 'Professional'}</span>
              <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                <X size={16} />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-1 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Dropdown with pre-written intros */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Purpose to connect <span className="text-red-500">*</span>
              </label>
              
              {/* Custom radio button implementation instead of Select */}
              <div className="border rounded-md p-2 space-y-1 max-h-64 overflow-y-auto">
                
                {introOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`p-2 cursor-pointer rounded-md ${selectedIntro === option ? 'bg-purple-50' : 'hover:bg-gray-50'}`} 
                    onClick={() => setSelectedIntro(option)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`h-5 w-5 mt-0.5 rounded-full border flex items-center justify-center ${selectedIntro === option ? 'border-[#6a0dad]' : 'border-gray-300'}`}>
                        {selectedIntro === option && <div className="w-3 h-3 rounded-full bg-[#6a0dad]" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Message textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Your message
                <span className="text-gray-400 text-xs ml-2">
                  {message.length}/350 characters
                </span>
              </label>
              <Textarea
                placeholder="Write a short note..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 350))}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            {/* File attachment section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Attachment (optional)</label>
              
              {!file ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500">
                  <Paperclip className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center mb-2">Drag files here or click to upload</p>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveFile}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <div className="pt-4">
              <Button 
                onClick={handleSubmitRequest}
                className="w-full bg-[#6a0dad] hover:bg-[#7b1fa2] text-white"
              >
                <Send size={16} className="mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}