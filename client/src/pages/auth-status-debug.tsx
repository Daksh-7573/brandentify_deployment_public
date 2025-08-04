import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function AuthStatusDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[AuthStatusDebug] ${message}`);
  };

  useEffect(() => {
    const checkAuth = async () => {
      addLog("Checking authentication status...");
      
      try {
        // Check Firebase auth directly
        const { auth } = await import('@/lib/firebase');
        const currentUser = (auth as any)?.currentUser;
        setFirebaseUser(currentUser);
        
        addLog(`Firebase current user: ${currentUser ? currentUser.email : 'None'}`);
        addLog(`Auth context user: ${user ? user.email : 'None'}`);
        addLog(`Is authenticated: ${isAuthenticated}`);
        addLog(`Is loading: ${isLoading}`);
        
        // Set up real-time auth listener
        if (auth) {
          const unsubscribe = (auth as any).onAuthStateChanged((authUser: any) => {
            setFirebaseUser(authUser);
            addLog(`Firebase auth changed: ${authUser ? authUser.email : 'No user'}`);
          });
          
          return () => unsubscribe();
        }
        
      } catch (error) {
        addLog(`Error checking auth: ${error}`);
      }
    };
    
    checkAuth();
  }, [user, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Status Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
            <div className="space-y-2 text-sm">
              <div>Loading: <span className={isLoading ? "text-yellow-400" : "text-green-400"}>{isLoading.toString()}</span></div>
              <div>Authenticated: <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>{isAuthenticated.toString()}</span></div>
              <div>User Email: <span className="text-blue-400">{user?.email || 'None'}</span></div>
              <div>User ID: <span className="text-blue-400">{user?.id || 'None'}</span></div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Firebase User</h2>
            <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40">
              {firebaseUser ? JSON.stringify({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                emailVerified: firebaseUser.emailVerified,
                photoURL: firebaseUser.photoURL
              }, null, 2) : 'No Firebase user'}
            </pre>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
            <div className="text-xs bg-gray-900 p-3 rounded h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono">{log}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">Authentication Flow Status</h3>
            <div className="text-sm text-blue-200">
              <p><strong>Expected Flow:</strong> Firebase User → Auth Context → UI Update</p>
              <p><strong>Current Status:</strong> 
                {firebaseUser && user ? "✅ Complete" : 
                 firebaseUser && !user ? "⚠️ Firebase OK, Context Missing" :
                 !firebaseUser && user ? "⚠️ Context OK, Firebase Missing" :
                 "❌ No Authentication"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}