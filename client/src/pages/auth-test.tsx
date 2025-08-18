import { CleanGoogleAuth } from "@/components/auth/clean-google-auth";
import { AuthRedirectHandler } from "@/components/auth/auth-redirect-handler";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";

/**
 * Simple Google Authentication Test Page
 * Clean test environment for Google OAuth implementation
 */
export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center p-4">
      <AuthRedirectHandler />
      
      <NeoGlassSection className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Google Auth Test</h1>
          <p className="text-sm text-gray-400">Testing Google authentication flow</p>
        </div>
        
        <CleanGoogleAuth />
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          <div>Environment: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</div>
          <div>Domain: {window.location.hostname}</div>
        </div>
      </NeoGlassSection>
    </div>
  );
}