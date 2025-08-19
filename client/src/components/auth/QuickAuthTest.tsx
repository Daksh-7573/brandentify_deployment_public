import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

/**
 * Quick Authentication Test
 * Simple component to test the authentication flow without complex redirects
 */
export function QuickAuthTest() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuickAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting quick authentication test...');
      
      // Create a test user directly via API
      const testUserData = {
        firebaseUid: 'quick-test-' + Date.now(),
        email: 'quicktest@example.com',
        name: 'Quick Test User',
        photoURL: '',
        googleId: 'quick-google-' + Date.now(),
        authProvider: 'google',
        emailVerified: true
      };
      
      console.log('📝 Creating test user...');
      const response = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData)
      });
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (data.success) {
        // Store user data and redirect
        sessionStorage.setItem('brandentifier_user', JSON.stringify(data.user));
        
        toast({
          title: 'Authentication Successful!',
          description: 'Redirecting to dashboard...'
        });
        
        // Redirect directly to Industry Pulse
        window.location.href = '/industry-pulse';
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
      
    } catch (error: any) {
      console.error('❌ Quick auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Test Authentication</h3>
        <p className="text-sm text-gray-300 mb-4">Skip Google OAuth and test the Brandentifier system directly</p>
        
        <Button 
          onClick={handleQuickAuth}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? 'Creating Account...' : 'Quick Test Login'}
        </Button>
      </div>
    </div>
  );
}