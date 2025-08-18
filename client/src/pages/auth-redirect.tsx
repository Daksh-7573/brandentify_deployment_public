import { useEffect } from 'react';

export default function AuthRedirectPage() {
  useEffect(() => {
    // This page handles Firebase redirect after Google OAuth
    // Firebase will redirect here, then we redirect to Industry Pulse
    const handleRedirect = async () => {
      try {
        console.log('Auth redirect page loaded, processing authentication...');
        
        // Import Firebase auth functions
        const { handleRedirectResult } = await import('@/lib/firebase-auth');
        
        // Handle the redirect result
        const user = await handleRedirectResult();
        
        if (user) {
          console.log('Authentication successful, redirecting to Industry Pulse:', user.email);
          // Redirect to Industry Pulse
          window.location.href = '/industry-pulse';
        } else {
          console.log('No authentication found, redirecting to auth page');
          // No authentication, go back to auth page
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error in auth redirect:', error);
        // Error occurred, go back to auth page
        window.location.href = '/';
      }
    };

    handleRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-300">Completing sign in...</p>
      </div>
    </div>
  );
}