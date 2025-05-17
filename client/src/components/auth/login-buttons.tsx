import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

/**
 * Set of authentication buttons for the application
 */
export function GoogleLoginButton({ className = '' }: { className?: string }) {
  const { signInWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  
  const handleGoogleLogin = async () => {
    try {
      // First check if already logged in
      if (auth.currentUser) {
        console.log("User already logged in, signing out first to ensure Google provider is used");
        
        // Set a flag to indicate we're forcing Google auth
        localStorage.setItem('force_google_auth', 'true');
        
        // Sign out first
        await auth.signOut();
        
        // Clear all auth-related storage
        localStorage.removeItem('firebase:authUser');
        sessionStorage.removeItem('firebase:authUser');
        localStorage.removeItem('auth_state');
        localStorage.removeItem('auth_user');
        
        // Small delay to ensure sign out completes
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Now perform Google sign in with a fresh state
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Google login failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Clear the forcing flag
      localStorage.removeItem('force_google_auth');
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