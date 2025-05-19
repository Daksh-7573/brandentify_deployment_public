import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Domain Debug Tool
 * 
 * This component helps diagnose Firebase domain issues by providing:
 * - Current domain information
 * - Firebase configuration verification
 * - Authentication state
 * - Authorized domains check
 */
const DomainDebug: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [config, setConfig] = useState<any>({});
  const [authState, setAuthState] = useState<string>('checking');
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Get domain info
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port;
      const origin = window.location.origin;
      
      setDomain({
        hostname,
        protocol,
        port,
        origin,
        full: window.location.href,
      } as any);
    }
    
    // Check Firebase config
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      
      setConfig({
        ...firebaseConfig,
        apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length,
        apiKeyPresent: !!import.meta.env.VITE_FIREBASE_API_KEY,
        appIdPresent: !!import.meta.env.VITE_FIREBASE_APP_ID,
        projectIdPresent: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      });
      
      // Initialize Firebase
      try {
        const app = initializeApp(firebaseConfig, 'domain-debug-instance');
        const auth = getAuth(app);
        
        // Check current auth state
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              providerId: user.providerData[0]?.providerId,
              isAnonymous: user.isAnonymous,
            });
            setAuthState('authenticated');
          } else {
            setUser(null);
            setAuthState('not-authenticated');
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Firebase init error:", error);
        setAuthState('firebase-error');
      }
    } catch (error) {
      console.error("Config error:", error);
      setConfig({ error: error.message });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8">Firebase Domain Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Domain Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-400">Domain Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Hostname:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">{domain.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Origin:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">{domain.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">{domain.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Full URL:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded truncate max-w-[200px]">{domain.full}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-yellow-400 text-sm font-medium mb-2">Domains to authorize in Firebase:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li className="font-mono text-gray-300">{domain.hostname}</li>
                  <li className="font-mono text-gray-300">{domain.hostname}.replit.app</li>
                  <li className="font-mono text-gray-300">*.replit.dev</li>
                  <li className="font-mono text-gray-300">*.replit.app</li>
                </ol>
                <Button 
                  onClick={() => copyToClipboard(`${domain.hostname}\n${domain.hostname}.replit.app\n*.replit.dev\n*.replit.app`)}
                  className="mt-2 text-xs bg-blue-800 hover:bg-blue-700" 
                  size="sm"
                >
                  Copy Domain List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Firebase Config */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-400">Firebase Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Project ID:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                  {config.projectId || 'Not found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Auth Domain:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                  {config.authDomain || 'Not found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">API Key:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                  {config.apiKeyPresent ? `Present (${config.apiKeyLength} chars)` : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">App ID:</span>
                <span className="font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                  {config.appIdPresent ? 'Present' : 'Missing'}
                </span>
              </div>
              
              {config.error && (
                <div className="mt-2 p-2 bg-red-900/50 rounded text-red-300 text-sm">
                  Error: {config.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Auth State */}
        <Card className="bg-gray-800 border-gray-700 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-blue-400">Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            {authState === 'checking' && (
              <div className="text-yellow-400">Checking authentication state...</div>
            )}
            
            {authState === 'firebase-error' && (
              <div className="text-red-400">Firebase initialization error</div>
            )}
            
            {authState === 'not-authenticated' && (
              <div className="text-orange-400">Not authenticated</div>
            )}
            
            {authState === 'authenticated' && user && (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-800/30 p-3 rounded-md">
                  <div className="text-green-400 font-medium">Authenticated User</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">User ID:</div>
                    <div className="font-mono text-xs bg-gray-900 p-2 rounded overflow-x-auto whitespace-nowrap">
                      {user.uid}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Display Name:</div>
                    <div className="font-mono text-xs bg-gray-900 p-2 rounded">
                      {user.displayName || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Email:</div>
                    <div className="font-mono text-xs bg-gray-900 p-2 rounded">
                      {user.email || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Provider:</div>
                    <div className="font-mono text-xs bg-gray-900 p-2 rounded">
                      {user.providerId || 'Unknown'}
                    </div>
                  </div>
                </div>
                
                {user.photoURL && (
                  <div className="flex justify-center mt-3">
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full border-2 border-blue-500/20"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 bg-blue-900/20 border border-blue-800/30 p-4 rounded-md">
        <h2 className="text-xl font-semibold text-blue-400 mb-2">Diagnosing Firebase Auth Issues</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          <li>Make sure all domains are added to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</li>
          <li>Verify that Google is enabled in Firebase Console &gt; Authentication &gt; Sign-in method</li>
          <li>Check that all environment variables (API Key, Project ID, App ID) are present</li>
          <li>Consider using redirect authentication method instead of popup for Replit domains</li>
          <li>Ensure third-party cookies are enabled in your browser</li>
        </ul>
      </div>
    </div>
  );
};

export default DomainDebug;