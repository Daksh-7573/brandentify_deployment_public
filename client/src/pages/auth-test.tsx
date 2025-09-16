import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
// TestFirebase removed - Firebase disabled, using custom OAuth only

export default function AuthTest() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  // firebaseUser removed - Firebase disabled

  useEffect(() => {
    // Firebase check removed - using custom OAuth only
    const status = `
      Context User: ${user ? `${user.email} (${user.uid})` : 'None'}
      Firebase User: DISABLED - Using Custom OAuth Only
      IsAuthenticated: ${isAuthenticated}
      IsLoading: ${isLoading}
    `;
    setAuthStatus(status);
  }, [user, isAuthenticated, isLoading]);

  const handleGoogleSignIn = async () => {
    console.log("Custom OAuth sign in test - redirecting to /api/auth/oauth/google...");
    try {
      // Use custom OAuth instead of Firebase
      window.location.href = '/api/auth/oauth/google';
    } catch (error) {
      console.error("Custom OAuth sign in failed:", error);
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

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">🚫 Firebase User Details Disabled</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">
            Firebase authentication has been completely disabled.
            Using custom OAuth authentication only.
          </pre>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg font-bold mb-2">🚫 Firebase Testing Disabled</h3>
          <p>Firebase authentication has been disabled in favor of unified custom OAuth.</p>
        </div>
      </div>
    </div>
  );
}