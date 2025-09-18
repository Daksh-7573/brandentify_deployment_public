import React from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Set of authentication buttons for the application
 */
export function GoogleLoginButton({ className = '' }: { className?: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get Google OAuth URL from server
      const response = await fetch('/api/auth/google/url', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.oauthUrl) {
          window.location.href = data.oauthUrl;
        } else {
          throw new Error('Failed to get OAuth URL');
        }
      } else {
        throw new Error('Failed to initiate Google authentication');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleGoogleLogin} 
      disabled={isLoading}
      className={`neo-glass-button w-full flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FaGoogle className="h-4 w-4" />
      )}
      Continue with Google
    </button>
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