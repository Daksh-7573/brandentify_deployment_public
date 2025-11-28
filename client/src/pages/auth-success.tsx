import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

/**
 * Auth Success Page - Intermediate page shown in popup after OAuth callback
 * 
 * Flow:
 * 1. OAuth callback redirects here
 * 2. Shows loading state while verifying session cookie
 * 3. Once verified, redirects parent window to dashboard
 * 4. Auto-closes popup
 */
export default function AuthSuccessPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [verifyingSession, setVerifyingSession] = useState(true);

  useEffect(() => {
    console.log('[Auth Success] Page mounted, starting session verification');

    const verifyAndRedirect = async () => {
      try {
        // Wait for auth context to check session (should be fast with fresh cookie)
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max with 100ms checks

        while (verifyingSession && attempts < maxAttempts) {
          // Check if auth context has loaded and found a session
          if (!isLoading && isAuthenticated && user) {
            console.log('[Auth Success] ✅ Session verified successfully', {
              userId: user.id,
              email: user.email,
            });

            setVerifyingSession(false);

            // Give a brief moment for UI to register the success
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Redirect parent window if in popup
            if (window.opener) {
              console.log('[Auth Success] 📤 Redirecting parent to dashboard...');
              window.opener.location.href = '/dashboard';

              // Give parent time to navigate, then close popup
              await new Promise((resolve) => setTimeout(resolve, 500));
              window.close();
            } else {
              // Not in popup, just navigate
              console.log('[Auth Success] 📲 Not in popup, navigating to dashboard');
              navigate('/dashboard');
            }

            return;
          }

          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // If we get here, session verification timed out
        if (verifyingSession) {
          console.error(
            '[Auth Success] ⏱️ Session verification timed out, redirecting to auth',
          );
          setVerifyingSession(false);

          if (window.opener) {
            window.close();
          } else {
            navigate('/auth?error=session_timeout');
          }
        }
      } catch (error) {
        console.error('[Auth Success] ❌ Error during verification:', error);
        setVerifyingSession(false);

        if (window.opener) {
          window.close();
        } else {
          navigate('/auth?error=verification_failed');
        }
      }
    };

    verifyAndRedirect();
  }, [isLoading, isAuthenticated, user, navigate, verifyingSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80">
      <div className="flex flex-col items-center gap-4">
        {/* Loading spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-400 animate-spin"></div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            Verifying your authentication...
          </h1>
          <p className="text-gray-400 text-sm">
            Please wait while we confirm your login.
          </p>
        </div>

        {/* Success check (shown after verification) */}
        {!verifyingSession && isAuthenticated && (
          <div className="mt-4 text-center">
            <div className="text-green-400 text-3xl mb-2">✓</div>
            <p className="text-green-400 text-sm font-medium">
              Authentication successful!
            </p>
            <p className="text-gray-400 text-xs mt-1">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}