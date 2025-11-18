import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FastQuickAuthProps {
  simulateNewUser?: boolean;
}

/**
 * Optimized Quick Authentication for Testing
 * Minimal overhead for fastest possible authentication
 */
export function FastQuickAuth({ simulateNewUser = false }: FastQuickAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuickAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Fast Quick Auth starting...');
      
      // Create test user data with unique email to avoid conflicts
      const timestamp = Date.now();
      const userData = {
        firebaseUid: 'quick-test-' + timestamp,
        email: `test${timestamp}@brandentifier.com`,
        name: 'Test User',
        photoURL: '',
        googleId: 'quick-google-' + timestamp,
        authProvider: 'google',
        emailVerified: true
      };
      
      console.log('⚡ Sending to backend...');
      
      // Fast backend call
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Quick auth success');
        
        // If simulating new user, reset profile to trigger onboarding
        if (simulateNewUser && data.user?.id) {
          console.log('🔄 Simulating new user - resetting profile...');
          
          try {
            // Reset profile to simulate new user
            await fetch(`/api/users/${data.user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileCompleted: 0,
                title: null,
                industry: null,
                domain: null
              })
            });
            
            // Update the user object in session storage with reset profile
            const resetUser = { ...data.user, profileCompleted: 0 };
            sessionStorage.setItem('brandentifier_user', JSON.stringify(resetUser));
            
            console.log('✅ Profile reset - redirecting to onboarding');
            window.location.replace('/onboarding');
          } catch (resetError) {
            console.error('❌ Profile reset failed:', resetError);
            // Continue with normal login even if reset fails
            sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
            window.location.replace('/industry-pulse');
          }
        } else {
          // Normal login flow
          sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
          window.location.replace('/industry-pulse');
        }
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error: any) {
      console.error('❌ Fast quick auth error:', error);
      
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleQuickAuth}
      disabled={isLoading}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      data-testid="button-quick-test-login"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        simulateNewUser ? 'Quick Test (New User)' : 'Quick Test Login'
      )}
    </Button>
  );
}