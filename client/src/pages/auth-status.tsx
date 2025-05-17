import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth } from 'firebase/auth';

/**
 * Auth Status Check Page
 * 
 * This page displays detailed information about the current authentication state,
 * including the authentication provider (Google vs Firebase) and user details.
 */
export default function AuthStatusPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [providerInfo, setProviderInfo] = useState<string>('Checking...');
  
  useEffect(() => {
    // Check the current auth state in Firebase
    const checkAuthState = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setProviderInfo('Not authenticated with any provider');
          return;
        }
        
        // Check the provider data to determine if Google auth is used
        const providers = currentUser.providerData || [];
        const googleProvider = providers.find(p => p.providerId === 'google.com');
        
        if (googleProvider) {
          setProviderInfo(
            `Authenticated with Google (${googleProvider.email || 'no email'})
            Provider ID: ${googleProvider.providerId}
            Display Name: ${googleProvider.displayName || 'not available'}
            UID: ${googleProvider.uid}
            Photo URL: ${googleProvider.photoURL || 'not available'}`
          );
        } else if (providers.length > 0) {
          const firstProvider = providers[0];
          setProviderInfo(
            `Authenticated with ${firstProvider.providerId} (NOT Google)
            Provider: ${firstProvider.providerId}
            Email: ${firstProvider.email || 'not available'}
            Display Name: ${firstProvider.displayName || 'not available'}
            UID: ${firstProvider.uid}`
          );
        } else {
          setProviderInfo(`Authenticated with Firebase directly (no external providers)
            UID: ${currentUser.uid}
            Email: ${currentUser.email || 'not available'}
            Display Name: ${currentUser.displayName || 'not available'}`
          );
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setProviderInfo(`Error checking auth provider: ${error}`);
      }
    };
    
    checkAuthState();
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Authentication Provider</h3>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {providerInfo}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">User State</h3>
            <div className="bg-muted p-4 rounded-md">
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>User ID: {user?.id || 'not available'}</p>
              <p>User UID: {user?.uid || 'not available'}</p>
              <p>Username: {user?.username || 'not available'}</p>
              <p>Email: {user?.email || 'not available'}</p>
              <p>Name: {user?.name || 'not available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}