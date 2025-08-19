import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLocation } from 'wouter';

/**
 * Temporary authentication bypass for testing while Firebase is being configured
 * This creates a demo user account without requiring Google OAuth
 */
export function BypassAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Create demo user data
      const demoUserData = {
        email: 'demo@brandentifier.com',
        name: 'Demo User',
        photoURL: '',
        authProvider: 'demo',
        emailVerified: true
      };

      console.log('Creating demo user account...');

      // Call backend to create demo user
      const response = await fetch('/api/auth/demo-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoUserData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Demo user created successfully');
        
        // Trigger auth success event
        const authEvent = new CustomEvent('googleAuthSuccess', { 
          detail: { user: data.user }
        });
        window.dispatchEvent(authEvent);
        
        toast({
          title: 'Welcome!',
          description: 'Demo account created successfully',
        });
        
        // Navigate to dashboard
        setTimeout(() => {
          setLocation('/industry-pulse');
        }, 1000);
        
      } else {
        throw new Error(data.message || 'Demo login failed');
      }
      
    } catch (error: any) {
      console.error('Demo login error:', error);
      
      toast({
        title: 'Demo Login Failed',
        description: 'Could not create demo account. Please try again.',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h4 className="font-semibold text-green-300 mb-2">Ready to Test</h4>
        <p className="text-sm text-green-200">
          Skip the Google setup and access Brandentifier immediately with a demo account
        </p>
      </div>
      
      <Button
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="lg"
      >
        {isLoading ? 'Setting up your account...' : 'Enter Brandentifier Now'}
      </Button>
    </div>
  );
}