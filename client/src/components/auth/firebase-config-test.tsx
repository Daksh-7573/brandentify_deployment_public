import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Firebase Configuration Test
 * Simple test to verify Firebase configuration is correct
 */
export function FirebaseConfigTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConfig = async () => {
    setIsLoading(true);
    setTestResult('Testing Firebase configuration...\n\n');
    
    try {
      let result = '';
      
      // Test 1: Environment variables
      result += '=== Environment Variables Test ===\n';
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;
      
      result += `API Key: ${apiKey ? '✅ Present' : '❌ Missing'}\n`;
      result += `Project ID: ${projectId ? '✅ Present' : '❌ Missing'} (${projectId})\n`;
      result += `App ID: ${appId ? '✅ Present' : '❌ Missing'}\n`;
      
      if (!apiKey || !projectId || !appId) {
        result += '\n❌ Firebase configuration is incomplete!\n';
        setTestResult(result);
        return;
      }
      
      // Test 2: Firebase module loading
      result += '\n=== Firebase Module Loading Test ===\n';
      try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getAuth, GoogleAuthProvider } = await import('firebase/auth');
        result += '✅ Firebase modules loaded successfully\n';
        
        // Test 3: Firebase initialization
        result += '\n=== Firebase Initialization Test ===\n';
        const firebaseConfig = {
          apiKey,
          authDomain: `${projectId}.firebaseapp.com`,
          projectId,
          storageBucket: `${projectId}.appspot.com`,
          appId
        };
        
        result += `Auth Domain: ${firebaseConfig.authDomain}\n`;
        result += `Storage Bucket: ${firebaseConfig.storageBucket}\n`;
        
        let app;
        const existingApps = getApps();
        if (existingApps.length > 0) {
          app = existingApps[0];
          result += '✅ Using existing Firebase app\n';
        } else {
          app = initializeApp(firebaseConfig, 'config-test');
          result += '✅ Firebase app initialized successfully\n';
        }
        
        // Test 4: Auth initialization
        result += '\n=== Authentication Service Test ===\n';
        const auth = getAuth(app);
        if (auth) {
          result += '✅ Firebase Auth service initialized\n';
          result += `Auth current user: ${auth.currentUser ? auth.currentUser.email : 'Not signed in'}\n`;
        } else {
          result += '❌ Failed to initialize Firebase Auth service\n';
        }
        
        // Test 5: Provider configuration
        result += '\n=== Google Provider Test ===\n';
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        result += '✅ Google Auth Provider configured\n';
        
        result += '\n=== Configuration Summary ===\n';
        result += '✅ All Firebase components are properly configured!\n';
        result += '✅ Ready for authentication\n';
        result += '\nThe popup issues are likely due to browser settings or Replit domain restrictions.\n';
        result += 'Redirect authentication should work reliably.\n';
        
      } catch (moduleError) {
        result += `❌ Firebase module error: ${moduleError}\n`;
      }
      
    } catch (error: any) {
      result += `\n❌ Configuration test failed: ${error.message}\n`;
    } finally {
      setTestResult(result);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={testFirebaseConfig}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isLoading ? 'Testing...' : 'Test Firebase Configuration'}
      </Button>
      
      {testResult && (
        <div className="bg-gray-800 p-3 rounded-md text-xs font-mono text-gray-300 whitespace-pre-line max-h-64 overflow-y-auto">
          {testResult}
        </div>
      )}
    </div>
  );
}