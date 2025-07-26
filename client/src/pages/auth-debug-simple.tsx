import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { getRedirectResult } from 'firebase/auth';

export default function AuthDebugSimple() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      const redirectResult = await getRedirectResult(auth);
      const currentUser = auth.currentUser;
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        isAuthenticated,
        isLoading,
        user,
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        } : null,
        redirectResult: redirectResult ? {
          uid: redirectResult.user.uid,
          email: redirectResult.user.email,
          displayName: redirectResult.user.displayName
        } : null,
        localStorage: {
          googleRedirectAttempt: localStorage.getItem('google_auth_redirect_attempt'),
          googleRedirectTime: localStorage.getItem('google_auth_redirect_time'),
        }
      });
    };

    checkAuth();
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Authentication Debug</h1>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Quick Actions</h2>
        <button 
          onClick={() => localStorage.clear()}
          style={{ margin: '5px', padding: '10px' }}
        >
          Clear localStorage
        </button>
        <button 
          onClick={() => window.location.href = '/auth'}
          style={{ margin: '5px', padding: '10px' }}
        >
          Go to Auth Page
        </button>
        <button 
          onClick={() => window.location.href = '/industry-pulse'}
          style={{ margin: '5px', padding: '10px' }}
        >
          Go to Industry Pulse
        </button>
      </div>
    </div>
  );
}