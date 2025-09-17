import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { GoogleLoginButton } from '@/components/auth/login-buttons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log('✅ [AUTH-PAGE] User authenticated, redirecting to dashboard');
      setLocation('/dashboard');
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white/80">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Branding */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-lg flex items-center justify-center mb-4">
            <span className="text-black font-bold text-xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to Brandentifier</h1>
          <p className="text-white/80 mt-2">Sign in to continue to your professional network</p>
        </div>

        {/* Login Card */}
        <Card className="neo-glass-panel border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleLoginButton className="w-full" />
            
            <div className="text-center text-sm text-white/60">
              <p>
                By signing in, you agree to our{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="text-center text-white/60 space-y-2">
          <p className="text-sm">Join thousands of professionals to:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>🚀 Build your brand</div>
            <div>🤝 Connect & network</div>
            <div>💡 Share insights</div>
            <div>🎯 Get career advice</div>
          </div>
        </div>
      </div>
    </div>
  );
}