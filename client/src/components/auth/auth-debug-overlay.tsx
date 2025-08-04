import { useEffect, useState } from 'react';

/**
 * Debug overlay to show authentication status in real-time
 * This helps identify exactly what's happening during the auth flow
 */
export function AuthDebugOverlay() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show in development or when there's a redirect attempt
    const isDev = window.location.hostname.includes('replit.dev') || window.location.hostname === 'localhost';
    const hasRedirectAttempt = sessionStorage.getItem('redirect_auth_attempt') === 'true';
    const isAuthPage = window.location.pathname === '/auth';
    
    // Show if we're in dev, have redirect attempt, or on auth page
    if (isDev || hasRedirectAttempt || isAuthPage) {
      setIsVisible(true);
    }

    const updateDebugInfo = () => {
      const redirectAttempt = sessionStorage.getItem('redirect_auth_attempt');
      const redirectTime = sessionStorage.getItem('redirect_auth_time');
      const authSuccess = sessionStorage.getItem('authSuccess');
      const userAuthenticated = sessionStorage.getItem('user_authenticated');
      const currentUser = sessionStorage.getItem('current_user');
      
      console.log("🔧 Debug overlay update:", {
        redirectAttempt,
        redirectTime,
        authSuccess,
        userAuthenticated,
        hasCurrentUser: !!currentUser
      });
      
      setDebugInfo({
        redirectAttempt,
        redirectTime,
        authSuccess,
        userAuthenticated,
        currentUser,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-2 right-2 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm"
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-green-400">Auth Debug</h4>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <strong>Redirect Attempt:</strong> <span className={debugInfo.redirectAttempt === 'true' ? 'text-green-400' : 'text-red-400'}>{debugInfo.redirectAttempt || 'false'}</span>
        </div>
        <div>
          <strong>Redirect Time:</strong> {debugInfo.redirectTime || 'none'}
        </div>
        <div>
          <strong>Auth Success:</strong> <span className={debugInfo.authSuccess === 'true' ? 'text-green-400' : 'text-red-400'}>{debugInfo.authSuccess || 'false'}</span>
        </div>
        <div>
          <strong>User Auth:</strong> <span className={debugInfo.userAuthenticated === 'true' ? 'text-green-400' : 'text-red-400'}>{debugInfo.userAuthenticated || 'false'}</span>
        </div>
        <div>
          <strong>Current User:</strong> <span className={debugInfo.currentUser ? 'text-green-400' : 'text-red-400'}>{debugInfo.currentUser ? 'yes' : 'no'}</span>
        </div>
        <div className="text-gray-400">
          <strong>Updated:</strong> {debugInfo.timestamp}
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <button 
          onClick={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Clear & Reload
        </button>
      </div>
    </div>
  );
}