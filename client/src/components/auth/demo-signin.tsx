import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * Demo Sign-in Component
 * Provides quick demo access when Firebase OAuth fails
 */
export function DemoSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/demo-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@brandentifier.com',
          name: 'Demo User',
          authProvider: 'demo',
          demoBypassed: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', 'demo_token_' + Date.now());
        localStorage.setItem('demo_mode', 'true');
        
        toast({
          title: 'Demo Access Granted',
          description: 'You have been signed in with demo credentials.',
        });
        
        // Redirect to main app
        setTimeout(() => {
          window.location.href = '/industry-pulse';
        }, 1000);
      } else {
        throw new Error(data.message || 'Demo authentication failed');
      }
    } catch (error: any) {
      console.error('Demo sign-in error:', error);
      toast({
        title: 'Demo Sign-in Error',
        description: error.message || 'Demo authentication failed',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDemoSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Enter as Demo User
        </>
      )}
    </Button>
  );
}