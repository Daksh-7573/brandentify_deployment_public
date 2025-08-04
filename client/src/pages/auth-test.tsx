import { TestGoogleAuth } from "@/components/auth/test-google-auth";

/**
 * Auth Test Page
 * 
 * A dedicated page for testing authentication functionality
 * in a clean environment with detailed diagnostic output.
 */
export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Authentication Test Suite</h1>
          <p className="text-gray-600">
            Use this page to test Google authentication with detailed diagnostics
          </p>
        </div>
        
        <TestGoogleAuth />
        
        <div className="mt-10 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Guidelines</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">1. Check Firebase Configuration</h3>
              <p className="text-gray-600">
                Ensure Firebase API keys and project settings are correctly configured in environment variables.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Verify Domain Authorization</h3>
              <p className="text-gray-600">
                Confirm this domain is added to the authorized domains list in Firebase Console.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Check Browser Features</h3>
              <p className="text-gray-600">
                Make sure cookies, local storage, and popup windows are enabled in your browser.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">4. Review Console Logs</h3>
              <p className="text-gray-600">
                Open your browser's developer console to check for detailed error messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}