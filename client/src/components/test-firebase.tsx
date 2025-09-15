import { useEffect, useState } from "react";

export default function TestFirebase() {
  const [status, setStatus] = useState("Testing Firebase...");
  const [authState, setAuthState] = useState<any>(null);

  useEffect(() => {
    const testFirebaseInit = async () => {
      try {
        console.log("Testing Firebase initialization...");
        
        // Test environment variables
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        const appId = import.meta.env.VITE_FIREBASE_APP_ID;
        
        console.log("Environment variables:", {
          apiKeyPresent: !!apiKey,
          projectId,
          appIdPresent: !!appId
        });
        
        if (!apiKey || !projectId || !appId) {
          throw new Error("Missing Firebase environment variables");
        }
        
        // Test Firebase imports
        const { auth, googleProvider } = await import('@/lib/firebase');
        console.log("Firebase imports successful:", {
          auth: !!auth,
          googleProvider: !!googleProvider,
          currentUser: (auth as any)?.currentUser
        });
        
        // Test auth state listener
        if (auth) {
          const unsubscribe = (auth as any).onAuthStateChanged((user: any) => {
            console.log("Firebase auth state changed:", user ? user.email : "No user");
            setAuthState(user);
          });
          
          setStatus("Firebase initialized successfully! Auth listener active.");
          
          // Return cleanup function
          return unsubscribe;
        } else {
          throw new Error("Auth object is null");
        }
        
      } catch (error) {
        console.error("Firebase test failed:", error);
        setStatus(`Firebase test failed: ${error}`);
      }
    };
    
    testFirebaseInit();
  }, []);

  const testGoogleSignIn = async () => {
    try {
      console.log("Testing Google sign in...");
      setStatus("Testing Google sign in...");
      
      const { signInWithPopup } = await import('firebase/auth');
      const { auth: authInstance, googleProvider } = await import('@/lib/firebase');
      
      console.log("About to call signInWithPopup with:", {
        auth: !!authInstance,
        googleProvider: !!googleProvider
      });
      
      const result = await signInWithPopup(authInstance as any, googleProvider as any);
      console.log("Sign in result:", result);
      
      setStatus(`Sign in successful: ${result.user.email}`);
      
    } catch (error) {
      console.error("Google sign in test failed:", error);
      setStatus(`Google sign in failed: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Firebase Test Component</h2>
      
      <div className="mb-4">
        <strong>Status:</strong>
        <pre className="mt-2 p-2 bg-gray-900 rounded text-sm">
          {status}
        </pre>
      </div>
      
      <div className="mb-4">
        <strong>Auth State:</strong>
        <pre className="mt-2 p-2 bg-gray-900 rounded text-sm">
          {authState ? JSON.stringify({
            uid: authState.uid,
            email: authState.email,
            displayName: authState.displayName
          }, null, 2) : "No authenticated user"}
        </pre>
      </div>
      
      <button
        onClick={testGoogleSignIn}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        Test Google Sign In
      </button>
    </div>
  );
}