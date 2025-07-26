import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function ConsoleInspector() {
  const [logs, setLogs] = useState<string[]>([]);
  const authContext = useAuth();

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const captureLog = (level: string, ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev.slice(-50), `[${level}] ${new Date().toLocaleTimeString()}: ${message}`]);
    };

    console.log = (...args) => {
      originalLog(...args);
      captureLog('LOG', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      captureLog('ERROR', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      captureLog('WARN', ...args);
    };

    // Initial auth context inspection
    console.log("🔍 AuthContext inspection on mount:", {
      hasAuthContext: !!authContext,
      signInWithGoogle: typeof authContext?.signInWithGoogle,
      isAuthenticated: authContext?.isAuthenticated,
      isLoading: authContext?.isLoading,
      user: authContext?.user ? { uid: authContext.user.uid, email: authContext.user.email } : null
    });

    // Test Firebase objects
    import('@/lib/firebase').then(firebase => {
      console.log("🔥 Firebase objects check:", {
        auth: !!firebase.auth,
        googleProvider: !!firebase.googleProvider,
        authType: typeof firebase.auth,
        providerType: typeof firebase.googleProvider
      });
    }).catch(err => {
      console.error("❌ Firebase import error:", err);
    });

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const testButtonClick = () => {
    console.log("🧪 Manual button test - Auth context:", {
      signInWithGoogle: typeof authContext?.signInWithGoogle,
      functionExists: authContext?.signInWithGoogle ? "YES" : "NO"
    });

    if (authContext?.signInWithGoogle) {
      console.log("🚀 Calling signInWithGoogle directly...");
      authContext.signInWithGoogle().then(() => {
        console.log("✅ Direct call successful");
      }).catch(err => {
        console.error("❌ Direct call failed:", err);
      });
    } else {
      console.error("❌ signInWithGoogle function not available");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Real-Time Console Inspector</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>Current Auth State:</h3>
        <pre>{JSON.stringify({
          hasContext: !!authContext,
          signInFunction: typeof authContext?.signInWithGoogle,
          isAuthenticated: authContext?.isAuthenticated,
          isLoading: authContext?.isLoading
        }, null, 2)}</pre>
        
        <button 
          onClick={testButtonClick}
          style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test signInWithGoogle
        </button>
      </div>

      <div style={{ 
        height: '400px', 
        overflow: 'auto', 
        border: '1px solid #ccc', 
        padding: '10px',
        background: '#000',
        color: '#0f0'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#666' }}>Waiting for console logs...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '2px',
              color: log.includes('[ERROR]') ? '#ff6b6b' : log.includes('[WARN]') ? '#ffd93d' : '#0f0'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}