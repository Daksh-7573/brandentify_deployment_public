import { useEffect, useState } from "react";

export default function SimpleAuthTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [authUser, setAuthUser] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[SimpleAuthTest] ${message}`);
  };

  useEffect(() => {
    const initFirebase = async () => {
      addLog("Starting Firebase initialization test...");
      
      try {
        // Test environment variables
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        const appId = import.meta.env.VITE_FIREBASE_APP_ID;
        
        addLog(`Environment: apiKey=${!!apiKey}, projectId=${projectId}, appId=${!!appId}`);
        
        if (!apiKey || !projectId || !appId) {
          addLog("ERROR: Missing Firebase environment variables");
          return;
        }
        
        // Import Firebase
        addLog("Importing Firebase...");
        const firebaseModule = await import('@/lib/firebase');
        addLog(`Firebase imported: auth=${!!firebaseModule.auth}, googleProvider=${!!firebaseModule.googleProvider}`);
        
        // Test auth current user
        const currentUser = (firebaseModule.auth as any)?.currentUser;
        addLog(`Current Firebase user: ${currentUser ? currentUser.email : 'None'}`);
        
        // Set up auth listener
        addLog("Setting up auth state listener...");
        if (firebaseModule.auth) {
          const unsubscribe = (firebaseModule.auth as any).onAuthStateChanged((user: any) => {
            setAuthUser(user);
            if (user) {
              addLog(`✅ Auth state changed: User signed in as ${user.email}`);
              addLog(`✅ User UID: ${user.uid}`);
              addLog(`✅ Display name: ${user.displayName || 'Not set'}`);
            } else {
              addLog(`❌ Auth state changed: No user signed in`);
            }
          });
          
          addLog("Auth state listener active");
          return () => unsubscribe();
        } else {
          addLog("ERROR: Auth object is null");
        }
        
      } catch (error) {
        addLog(`ERROR: ${error}`);
      }
    };
    
    initFirebase();
  }, []);

  const testGoogleSignIn = async () => {
    addLog("Testing Google sign in...");
    
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      
      addLog("About to call signInWithPopup...");
      
      // Add a longer timeout to see if auth is just slow
      const result = await Promise.race([
        signInWithPopup(auth as any, googleProvider as any),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout after 30 seconds')), 30000)
        )
      ]);
      
      addLog(`Sign in successful! User: ${(result as any).user.email}`);
      addLog(`User details: ${JSON.stringify({
        uid: (result as any).user.uid,
        email: (result as any).user.email,
        displayName: (result as any).user.displayName,
        photoURL: (result as any).user.photoURL
      })}`);
      
    } catch (error) {
      addLog(`Sign in failed: ${error}`);
      addLog(`Error details: ${JSON.stringify(error)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Firebase Authentication Test</h1>
        
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">Domain Authorization Required</h3>
          <p className="text-yellow-200 text-sm">
            If Google sign-in fails with "popup-closed-by-user", you need to add this domain to Firebase Console:
            <br />
            <code className="bg-yellow-800/30 px-2 py-1 rounded mt-1 inline-block">
              {window.location.hostname}
            </code>
          </p>
          <p className="text-yellow-200 text-sm mt-2">
            Go to Firebase Console → Authentication → Settings → Authorized domains
          </p>
        </div>
        
        <div className="mb-6">
          <button
            onClick={testGoogleSignIn}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
          >
            Test Google Sign In
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Auth User</h2>
            <pre className="text-sm bg-gray-900 p-4 rounded overflow-auto">
              {authUser ? JSON.stringify({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                emailVerified: authUser.emailVerified
              }, null, 2) : 'No authenticated user'}
            </pre>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="text-sm bg-gray-900 p-4 rounded h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}