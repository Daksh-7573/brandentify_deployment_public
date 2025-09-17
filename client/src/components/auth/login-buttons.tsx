import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * JWT-based authentication buttons (no Firebase dependencies)
 */
export function GoogleLoginButton({ className = '' }: { className?: string }) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    console.log('🚀 [LOGIN-BUTTON] Google login button clicked');
    
    try {
      setIsLoading(true);
      
      // Clear any existing auth data to ensure fresh login
      sessionStorage.removeItem('brandentifier_user');
      localStorage.removeItem('brandentifier_user');
      console.log('🧹 [LOGIN-BUTTON] Cleared existing auth data for fresh login');
      
      // Use the JWT OAuth flow from useAuth hook
      await signInWithGoogle();
      
      console.log('✅ [LOGIN-BUTTON] OAuth redirect initiated successfully');
      
    } catch (error: any) {
      console.error('❌ [LOGIN-BUTTON] Google login error:', error);
      
      toast({
        title: "Google login failed",
        description: error.message || "There was a problem signing in with Google. Please try again.",
        variant: "destructive"
      });
      
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