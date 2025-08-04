import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function AuthTest() {
  const { user, isAuthenticated, isLoading, signInWithGoogle, signOut } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  useEffect(() => {
    const checkFirebaseAuth = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        setFirebaseUser(currentUser);
        
        const status = `
          Context User: ${user ? `${user.email} (${user.uid})` : 'None'}
          Firebase User: ${currentUser ? `${currentUser.email} (${currentUser.uid})` : 'None'}
          IsAuthenticated: ${isAuthenticated}
          IsLoading: ${isLoading}
        `;
        setAuthStatus(status);
      } catch (error) {
        setAuthStatus(`Error: ${error}`);
      }
    };

    checkFirebaseAuth();
    const interval = setInterval(checkFirebaseAuth, 1000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated, isLoading]);

  const handleGoogleSignIn = async () => {
    console.log("Starting Google sign in test...");
    try {
      await signInWithGoogle();
      console.log("Google sign in completed");
    } catch (error) {
      console.error("Google sign in failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Auth Status</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">
            {authStatus}
          </pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded mr-4"
            >
              {isLoading ? "Signing In..." : "Sign In with Google"}
            </button>
            
            {isAuthenticated && (
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Firebase User Details</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">
            {firebaseUser ? JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified,
              providerData: firebaseUser.providerData?.map((p: any) => ({
                providerId: p.providerId,
                email: p.email,
                displayName: p.displayName
              }))
            }, null, 2) : 'No Firebase user'}
          </pre>
        </div>
      </div>
    </div>
  );
}