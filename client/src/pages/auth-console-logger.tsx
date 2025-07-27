import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function AuthConsoleLogger() {
  const { user, isAuthenticated, isLoading, signInWithGoogle } = useAuth();
  const [logs, setLogs] = useState<Array<{message: string, type: 'info' | 'success' | 'error' | 'warning', timestamp: string}>>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, type, timestamp };
    setLogs(prev => [logEntry, ...prev.slice(0, 19)]);
    
    // Also log to browser console with appropriate method
    const consoleMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('Auth Console Logger initialized');
    addLog(`Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    addLog(`Loading status: ${isLoading ? 'Loading' : 'Ready'}`);
    
    if (user) {
      addLog(`Current user: ${user.name} (${user.email})`, 'success');
    }

    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('🔥') || message.includes('🔍') || message.includes('🔄') || message.includes('👤') || message.includes('✅') || message.includes('❌')) {
        addLog(message, 'info');
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Firebase') || message.includes('Auth') || message.includes('Google')) {
        addLog(message, 'error');
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Firebase') || message.includes('Auth') || message.includes('Google')) {
        addLog(message, 'warning');
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [user, isAuthenticated, isLoading]);

  const testGoogleSignIn = async () => {
    setTesting(true);
    addLog('Starting Google Sign-In test...', 'info');
    
    try {
      await signInWithGoogle();
      addLog('Google Sign-In initiated successfully', 'success');
    } catch (error: any) {
      addLog(`Google Sign-In failed: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Authentication Console Logger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Current Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Current Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span>Authentication: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
                  </div>
                  {user && (
                    <div className="text-green-400">
                      User: {user.name} ({user.email})
                    </div>
                  )}
                </div>
              </div>

              {/* Environment Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Environment</h3>
                <div className="space-y-1 text-sm font-mono bg-gray-900 p-3 rounded">
                  <div>Hostname: {window.location.hostname}</div>
                  <div>Origin: {window.location.origin}</div>
                  <div>Path: {window.location.pathname}</div>
                  <div>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Missing'}</div>
                  <div>API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing'}</div>
                </div>
              </div>
            </div>

            {/* Test Button */}
            <div className="mb-6">
              <Button 
                onClick={testGoogleSignIn} 
                disabled={testing || isAuthenticated}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Testing Google Sign-In...' : 'Test Google Sign-In'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Console Logs */}
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Live Authentication Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet... Try signing in with Google.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`flex items-start gap-2 mb-2 ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                    <div className="flex-1">
                      <span className="text-gray-400 text-xs">[{log.timestamp}]</span>{' '}
                      <span>{log.message}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              onClick={() => setLogs([])}
              variant="outline"
              size="sm"
              className="mt-3 border-gray-600 text-white hover:bg-gray-700"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-900/20 border-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-blue-400">How to Use This Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>This page captures all authentication-related console logs in real-time, making it easier to debug without opening browser dev tools.</p>
            <div className="bg-blue-900/30 p-3 rounded">
              <p className="font-semibold mb-2">Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Test Google Sign-In" button</li>
                <li>Complete the Google authentication flow</li>
                <li>Watch the live logs below for any errors</li>
                <li>Share the log output if issues persist</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}