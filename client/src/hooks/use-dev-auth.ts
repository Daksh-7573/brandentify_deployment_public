import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { auth as firebaseAuth, googleProvider } from '@/lib/firebase';
import { signInWithRedirect, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

/**
 * A specialized hook for handling Google authentication on development domains
 * This hook uses the redirect method which is more reliable on Replit domains
 */
export function useDevAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setError(null);
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Execute Google sign-in with redirect
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear any previous auth attempts
      localStorage.removeItem('auth_redirect_attempt');
      localStorage.removeItem('auth_redirect_time');
      
      // Create a fresh provider for this attempt
      const freshProvider = new GoogleAuthProvider();
      
      // Add required scopes
      freshProvider.addScope('email');
      freshProvider.addScope('profile');
      
      // Force account selection with strict parameters
      freshProvider.setCustomParameters({
        prompt: 'select_account',
        auth_type: 'reauthenticate',
        login_hint: '',
        include_granted_scopes: 'true'
      });
      
      // Track this auth attempt
      localStorage.setItem('dev_auth_redirect', 'true');
      localStorage.setItem('dev_auth_time', Date.now().toString());
      
      // Start redirect flow
      await signInWithRedirect(firebaseAuth, freshProvider);
      
      // This line won't execute until after redirect completes
      console.log("Redirect initiated");
    } catch (err: any) {
      console.error("Error starting Google sign-in:", err);
      setError(err.message || "Authentication failed");
      toast({
        title: "Authentication Error",
        description: `Failed to start Google authentication: ${err.message}`,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [toast]);
  
  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Firebase
      await firebaseAuth.signOut();
      
      // Clear any storage items
      localStorage.removeItem('dev_auth_redirect');
      localStorage.removeItem('dev_auth_time');
      localStorage.removeItem('auth_state');
      
      // Go to home page
      setLocation('/');
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (err: any) {
      console.error("Error signing out:", err);
      toast({
        title: "Sign Out Error",
        description: `Failed to sign out: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setLocation, toast]);
  
  return {
    isLoading,
    isAuthenticated,
    error,
    signInWithGoogle,
    signOut
  };
}