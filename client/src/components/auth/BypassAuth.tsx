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

      // Store demo user in localStorage to bypass Firebase entirely
      const demoUser = {
        id: Date.now(),
        email: demoUserData.email,
        name: demoUserData.name,
        username: demoUserData.email.split('@')[0],
        photoURL: demoUserData.photoURL || '',
        emailVerified: true,
        authProvider: 'demo'
      };
      
      // Set authentication state directly in localStorage
      localStorage.setItem('auth_bypass', 'true');
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      sessionStorage.setItem('authSuccess', 'true');
      sessionStorage.setItem('userAuthenticated', 'true');
      
      console.log('Demo authentication set successfully');
      
      // Trigger authentication success event
      const authEvent = new CustomEvent('authStateChanged', { 
        detail: { 
          isAuthenticated: true, 
          user: demoUser,
          bypass: true
        }
      });
      window.dispatchEvent(authEvent);
      
      toast({
        title: 'Welcome to Brandentifier!',
        description: 'Demo access granted - exploring with full features',
      });
      
      // Navigate to main app
      setTimeout(() => {
        setLocation('/industry-pulse');
      }, 1500);
      
    } catch (error: any) {
      console.error('Demo authentication error:', error);
      
      // Even if backend fails, set local demo auth
      const fallbackUser = {
        id: Date.now(),
        email: 'demo@brandentifier.com',
        name: 'Demo User',
        username: 'demo',
        photoURL: '',
        emailVerified: true,
        authProvider: 'demo'
      };
      
      localStorage.setItem('auth_bypass', 'true');
      localStorage.setItem('demo_user', JSON.stringify(fallbackUser));
      sessionStorage.setItem('authSuccess', 'true');
      
      toast({
        title: 'Demo Access Granted',
        description: 'Continuing with offline demo mode',
      });
      
      setTimeout(() => {
        setLocation('/industry-pulse');
      }, 1000);
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h4 className="font-semibold text-green-300 mb-2">Instant Demo Access</h4>
        <p className="text-sm text-green-200">
          Skip the Firebase setup and explore the full app with a demo account
        </p>
        <p className="text-xs text-green-300 mt-2">
          No configuration required - works immediately
        </p>
      </div>
      
      <Button
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
        size="lg"
      >
        {isLoading ? 'Setting up demo access...' : '🚀 Enter Brandentifier Now'}
      </Button>
    </div>
  );
}