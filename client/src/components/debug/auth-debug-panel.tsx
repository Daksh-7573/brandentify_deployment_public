import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AuthDebugPanel() {
  const { user, isAuthenticated, isLoading, signInWithGoogle } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
    console.log(`[${timestamp}] ${message}`);
  };
  
  useEffect(() => {
    addLog(`Auth Debug Panel loaded`);
    addLog(`Initial state - Authenticated: ${isAuthenticated}, Loading: ${isLoading}`);
    if (user) {
      addLog(`User: ${user.name} (${user.email})`);
    }
  }, []);
  
  useEffect(() => {
    addLog(`Auth state changed - Authenticated: ${isAuthenticated}, Loading: ${isLoading}`);
    if (user) {
      addLog(`User data: ${user.name} (${user.email})`);
    } else {
      addLog('No user data');
    }
  }, [isAuthenticated, isLoading, user]);
  
  const handleTestLogin = async () => {
    addLog('🚀 Starting Google sign-in test...');
    try {
      await signInWithGoogle();
      addLog('✅ Sign-in function completed');
    } catch (error) {
      addLog(`❌ Sign-in error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <Card className="mt-4 bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-sm">Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Loading:</span>
            <span className={`ml-2 ${isLoading ? 'text-yellow-400' : 'text-gray-300'}`}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        {user && (
          <div className="text-sm">
            <div className="text-gray-400">User:</div>
            <div className="text-white">{user.name}</div>
            <div className="text-gray-300">{user.email}</div>
          </div>
        )}
        
        <Button 
          onClick={handleTestLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          Test Google Sign-In
        </Button>
        
        <div className="space-y-1">
          <div className="text-gray-400 text-xs">Debug Logs:</div>
          <div className="bg-black/30 rounded p-2 max-h-32 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs text-gray-300 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={() => setLogs([])}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Clear Logs
        </Button>
      </CardContent>
    </Card>
  );
}