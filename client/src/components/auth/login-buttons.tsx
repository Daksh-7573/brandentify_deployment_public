import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/google-auth-context';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Set of authentication buttons for the application
 */
export function GoogleLoginButton({ className = '' }: { className?: string }) {
  const { signInWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  
  const handleGoogleLogin = async () => {
    try {
      console.log("🚀 Starting Google login via auth context");
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenInNewTab = async () => {
    try {
      // Get OAuth URL and force open in new tab
      const response = await fetch('/api/auth/google/url', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }

      const data = await response.json();
      
      if (!data.success || !data.oauthUrl) {
        throw new Error('Invalid OAuth response');
      }

      console.log("🔄 Opening Google OAuth in new tab manually");
      window.open(data.oauthUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Manual Google login error:', error);
      toast({
        title: "Failed to open login",
        description: "Could not open Google login in new tab. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-2">
      <button 
        onClick={handleGoogleLogin} 
        disabled={isLoading}
        className={`neo-glass-button w-full flex items-center justify-center gap-2 ${className}`}
        data-testid="button-google-login"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4" />
        )}
        Continue with Google
      </button>
      
      {/* Fallback button for iframe issues */}
      <button 
        onClick={handleOpenInNewTab}
        disabled={isLoading}
        className="text-xs text-muted-foreground hover:text-foreground underline w-full py-1"
        data-testid="button-google-new-tab"
      >
        Or open Google login in new tab
      </button>
    </div>
  );
}

export function EmailLoginForm() {
  // Email login form implementation will go here
  return null;
}

export function PhoneLoginForm() {
  // Phone login form implementation will go here
  return null;
}