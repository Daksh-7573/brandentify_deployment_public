/**
 * Resume Button Component
 * 
 * Displays a button that either generates a resume or opens an existing resume
 * based on the user's resume status.
 */

import { Button } from '@/components/ui/button';
import { useResume } from '@/hooks/use-resume';
import { DownloadCloud, FileText, Loader2 } from 'lucide-react';
import { CSSProperties } from 'react';

interface ResumeButtonProps {
  userId: number | string;
  className?: string;
  variant?: 'default' | 'corporate' | 'creative' | 'minimal' | 'technical';
  buttonStyle?: CSSProperties;
}

export function ResumeButton({ 
  userId,
  className = '',
  variant = 'default',
  buttonStyle = {}
}: ResumeButtonProps) {
  const { 
    resumeStatus, 
    isLoading, 
    isGenerating, 
    generateResume 
  } = useResume(userId);
  
  const hasResume = resumeStatus?.hasGeneratedResume && resumeStatus?.resumeUrl;
  
  const handleButtonClick = () => {
    if (hasResume && resumeStatus?.resumeUrl) {
      // If resume exists, open it in a new tab
      window.open(resumeStatus.resumeUrl, '_blank');
    } else {
      // If no resume, trigger generation
      generateResume();
    }
  };

  // Get button text based on resume status
  const getButtonText = () => {
    if (isLoading || isGenerating) {
      return 'Processing...';
    }
    return hasResume ? 'View Resume' : 'Generate Resume';
  };
  
  return (
    <Button 
      onClick={handleButtonClick}
      className={`flex items-center justify-center gap-2 ${className}`}
      disabled={isLoading || isGenerating}
      style={Object.keys(buttonStyle).length > 0 ? buttonStyle : undefined}
    >
      {isLoading || isGenerating ? (
        <Loader2 size={16} className="animate-spin" />
      ) : hasResume ? (
        <FileText size={16} />
      ) : (
        <DownloadCloud size={16} />
      )}
      {getButtonText()}
    </Button>
  );
}