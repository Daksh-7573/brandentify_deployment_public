import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { setupInstantDemoAccess } from '@/utils/instant-demo-access';

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
      toast({
        title: 'Welcome to Brandentifier!',
        description: 'Demo access granted - bypassing OAuth issues',
      });
      
      // Use utility function for instant demo access
      setupInstantDemoAccess();
      
    } catch (error: any) {
      console.error('Demo authentication error:', error);
      
      toast({
        title: 'Demo Access Granted',
        description: 'Continuing with offline demo mode',
      });
      
      // Fallback direct navigation
      setTimeout(() => {
        window.location.href = '/industry-pulse';
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-xl shadow-lg">
        <div className="text-2xl mb-3">🚀</div>
        <h4 className="font-bold text-green-300 mb-3 text-lg">Skip Authentication Issues</h4>
        <p className="text-sm text-green-200 mb-2">
          Google OAuth has configuration issues - use instant demo access instead
        </p>
        <p className="text-xs text-green-300 font-semibold">
          ✅ Full app access • ✅ No setup required • ✅ Works immediately
        </p>
      </div>
      
      <Button
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-lg py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Setting up demo access...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🚀</span>
            <span>Enter Brandentifier Now</span>
            <span className="text-xl">⚡</span>
          </div>
        )}
      </Button>
    </div>
  );
}