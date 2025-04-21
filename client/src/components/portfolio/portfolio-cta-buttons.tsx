import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud, UserPlus, MessageCircle } from 'lucide-react';

export interface PortfolioCtaButtonsProps {
  variant?: 'default' | 'corporate' | 'creative' | 'minimal' | 'technical';
  resumeUrl?: string | null;
  mentorUrl?: string | null;
  connectUrl?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  className?: string;
}

export default function PortfolioCtaButtons({
  variant = 'default',
  resumeUrl = null,
  mentorUrl = null,
  connectUrl = null,
  userEmail = null,
  userName = null,
  className = ''
}: PortfolioCtaButtonsProps) {
  
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
    if (connectUrl) {
      window.open(connectUrl, '_blank');
    } else if (userEmail) {
      // Fallback to email if no connect URL
      const subject = `Connection Request from Brandentifier`;
      const body = `Hello ${userName || ''},\n\nI came across your profile on Brandentifier and would like to connect with you.\n\nLooking forward to your response!\n\nBest regards,`;
      window.location.href = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };
  
  // Styles based on portfolio variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'corporate':
        return {
          container: `flex flex-col sm:flex-row gap-3 mt-6 ${className}`,
          resumeBtn: 'bg-gradient-to-r from-[#b8860b] to-[#daa520] hover:opacity-90 text-white border-none',
          mentorBtn: 'border-[#b8860b] text-[#b8860b] bg-white hover:bg-[#f9f5e8]',
          connectBtn: 'border-[#b8860b] text-[#b8860b] bg-white hover:bg-[#f9f5e8]'
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
    <div className={styles.container}>
      <Button 
        onClick={handleDownloadResume}
        className={`${styles.resumeBtn} flex items-center gap-2 min-w-[120px] justify-center`}
      >
        <DownloadCloud size={16} />
        Resume
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleMentorRequest}
        className={`${styles.mentorBtn} flex items-center gap-2 min-w-[120px] justify-center`}
      >
        <UserPlus size={16} />
        Mentor
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleConnect}
        className={`${styles.connectBtn} flex items-center gap-2 min-w-[120px] justify-center`}
      >
        <MessageCircle size={16} />
        Connect
      </Button>
    </div>
  );
}