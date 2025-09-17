import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Simple Google Login Button for testing
 * Minimal implementation to isolate any issues
 */
export function SimpleGoogleButton() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    console.log("🟢 SIMPLE BUTTON: Click detected!");
    
    // Immediately set flag for testing
    // Clear any old auth flags for clean authentication
    sessionStorage.removeItem('redirect_auth_attempt');
    sessionStorage.removeItem('redirect_auth_time');
    sessionStorage.removeItem('redirect_auth_success');
    
    console.log("🟢 SIMPLE BUTTON: Flags set - attempting auth");
    
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("🟢 SIMPLE BUTTON: Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Basic click test
  const testClick = () => {
    console.log("🟡 BASIC TEST: Button clicked successfully!");
    alert("Button click working!");
  };

  return (
    <div className="w-full space-y-2">
      {/* Basic click test */}
      <button
        onClick={testClick}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
      >
        🟡 TEST: Basic Click (Should show alert)
      </button>
      
      {/* Google auth test */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        style={{ minHeight: '48px' }}
      >
        {isLoading ? "Signing in..." : "🔵 TEST: Continue with Google"}
      </button>
    </div>
  );
}