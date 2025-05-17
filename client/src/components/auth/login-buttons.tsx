import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

/**
 * Set of authentication buttons for the application
 */
export function GoogleLoginButton({ className = '' }: { className?: string }) {
  const { signInWithGoogle, isLoading } = useAuth();
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleGoogleLogin} 
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FaGoogle className="h-4 w-4" />
      )}
      Continue with Google
    </Button>
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