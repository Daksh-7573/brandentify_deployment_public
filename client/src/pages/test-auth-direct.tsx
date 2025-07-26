import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAuthDirect() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGoogleAuth = async () => {
    setIsLoading(true);
    addLog("🚀 Starting direct Google authentication test...");
    
    try {
      // Direct Firebase import and test
      const { auth, googleProvider } = await import('@/lib/firebase');
      addLog(`✅ Firebase objects imported: auth=${!!auth}, googleProvider=${!!googleProvider}`);
      
      // Test Firebase auth availability
      addLog(`Current user: ${auth.currentUser ? auth.currentUser.email : 'none'}`);
      
      // Test signInWithPopup directly
      const { signInWithPopup } = await import('firebase/auth');
      addLog("✅ Firebase signInWithPopup imported");
      
      addLog("🔄 Attempting Google sign-in with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result?.user) {
        addLog(`✅ Authentication successful: ${result.user.email}`);
        addLog(`User UID: ${result.user.uid}`);
        addLog(`Display Name: ${result.user.displayName}`);
      } else {
        addLog("❌ No user result from authentication");
      }
      
    } catch (error: any) {
      addLog(`❌ Authentication error: ${error.message}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
      addLog("🏁 Authentication test completed");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      <h1>Direct Authentication Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <Button 
          onClick={testGoogleAuth} 
          disabled={isLoading}
          style={{ marginRight: '10px' }}
        >
          {isLoading ? 'Testing...' : 'Test Google Auth Direct'}
        </Button>
        
        <Button 
          onClick={() => setLogs([])}
          variant="outline"
        >
          Clear Logs
        </Button>
      </div>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '4px',
        height: '400px',
        overflow: 'auto',
        border: '1px solid #ddd'
      }}>
        {logs.length === 0 ? (
          <p style={{ color: '#666' }}>Click "Test Google Auth Direct" to start testing...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p>This page tests Google authentication directly without the auth context.</p>
        <p>Check browser console for additional debugging information.</p>
      </div>
    </div>
  );
}