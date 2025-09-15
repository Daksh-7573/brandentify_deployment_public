import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Replit Authentication UI Component
 * Uses Replit's OIDC authentication system
 */
export function ReplitAuthUI() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Starting Replit Auth login...');
      
      // Redirect to Replit's OIDC authentication
      const loginUrl = '/api/auth/login';
      console.log(`🚀 Redirecting to: ${loginUrl}`);
      window.location.href = loginUrl;
      
    } catch (error: any) {
      console.error('❌ Replit Auth error:', error);
      
      toast({
        title: 'Authentication Failed',
        description: error.message || 'Unable to start authentication',
        variant: 'destructive'
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-white">Sign in to Brandentifier</h3>
        <p className="text-gray-300">Secure authentication powered by Replit</p>
      </div>
      
      {/* Replit Authentication Button */}
      <Button 
        onClick={handleLogin}
        disabled={isLoading}
        data-testid="button-login-replit"
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium text-lg rounded-lg border border-orange-400 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-orange-500 font-bold text-sm">R</span>
              </div>
              <span>Continue with Replit</span>
            </div>
          </>
        )}
      </Button>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">
          Replit authentication provides secure access using your Replit account
        </p>
        <p className="text-xs text-gray-500">
          Your Replit account supports Google, GitHub, and other authentication methods
        </p>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{" "}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}