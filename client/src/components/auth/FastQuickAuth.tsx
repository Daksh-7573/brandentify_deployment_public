import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Optimized Quick Authentication for Testing
 * Minimal overhead for fastest possible authentication
 */
export function FastQuickAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuickAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Fast Quick Auth starting...');
      
      // Create test user data
      const userData = {
        firebaseUid: 'quick-test-' + Date.now(),
        email: 'quicktest@brandentifier.com',
        name: 'Quick Test User',
        photoURL: '',
        googleId: 'quick-google-' + Date.now(),
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
        console.log('✅ Backend success, storing user...');
        
        // Store user immediately
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        // Trigger auth update
        window.dispatchEvent(new CustomEvent('googleAuthSuccess', { 
          detail: { user: data.user }
        }));
        
        toast({
          title: 'Quick Auth Successful!',
          description: 'Redirecting...',
          variant: 'default'
        });
        
        console.log('🎯 Redirecting directly...');
        
        // Immediate redirect
        window.location.href = '/industry-pulse';
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
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        'Quick Test Login'
      )}
    </Button>
  );
}