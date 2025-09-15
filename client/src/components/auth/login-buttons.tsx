import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
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