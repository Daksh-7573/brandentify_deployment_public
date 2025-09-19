import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User as FirebaseUser } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useLocation } from 'wouter'; 
import { Auth, getAuth } from 'firebase/auth';

/**
 * AuthStatusPage - Shows detailed information about the current authentication status
 * Useful for debugging authentication issues
 */
export default function AuthStatusPage() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  
  // Get the raw Firebase user and provider data
  useEffect(() => {
    // Check current Firebase user
    const currentFirebaseUser = firebaseAuth.currentUser;
    setFirebaseUser(currentFirebaseUser);
    
    // Extract provider data
    if (currentFirebaseUser && currentFirebaseUser.providerData) {
      setProviders(currentFirebaseUser.providerData);
    }
  }, []);
  
  // Check if using Google authentication (provider ID is google.com)
  const isUsingGoogleAuth = providers.some(provider => 
    provider.providerId === 'google.com'
  );
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out completely.',
    });
    setLocation('/login');
  };
  
  // Handle force Google auth
  const handleForceGoogleAuth = async () => {
    // Force Google auth by clearing all auth state and redirecting to login
    try {
      // Sign out first
      if (firebaseAuth && typeof firebaseAuth.signOut === 'function') {
        await firebaseAuth.signOut();
      }
      
      // Clear all auth-related storage
      localStorage.removeItem('firebase:authUser');
      sessionStorage.removeItem('firebase:authUser');
      localStorage.removeItem('auth_state');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_provider');
      localStorage.removeItem('auth_redirect_attempt');
      localStorage.removeItem('auth_redirect_time');
      localStorage.removeItem('popup_auth_attempt');
      localStorage.removeItem('popup_auth_time');
      localStorage.removeItem('using_google_auth');
      
      // Set the force flag
      localStorage.setItem('force_google_auth', 'true');
      
      // Redirect to login
      toast({
        title: 'Authentication reset',
        description: 'Please login with Google on the next screen.',
      });
      
      // Wait briefly to allow toast to display
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Error forcing Google auth:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset authentication. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container max-w-4xl py-8 flex flex-col gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Status
            {isAuthenticated ? (
              <Badge variant="default" className="bg-green-600 ml-2">
                <CheckCircle className="h-4 w-4 mr-1" /> Authenticated
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="h-4 w-4 mr-1" /> Not Authenticated
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Detailed authentication information for debugging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Backend User Data</h3>
            <div className="bg-zinc-900 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-sm text-zinc-200">{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Firebase User</h3>
            <div className="bg-zinc-900 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-sm text-zinc-200">
                {firebaseUser ? JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                  providerId: firebaseUser.providerId,
                  metadata: {
                    creationTime: firebaseUser.metadata.creationTime,
                    lastSignInTime: firebaseUser.metadata.lastSignInTime,
                  }
                }, null, 2) : 'No Firebase user found'}
              </pre>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Authentication Providers
              {isUsingGoogleAuth ? (
                <Badge className="bg-blue-600 ml-2">Using Google Auth</Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">Not Using Google Auth</Badge>
              )}
            </h3>
            <div className="bg-zinc-900 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-sm text-zinc-200">{JSON.stringify(providers, null, 2)}</pre>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Local Storage Auth Data</h3>
            <div className="bg-zinc-900 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-sm text-zinc-200">
                {JSON.stringify({
                  'auth_state': localStorage.getItem('auth_state'),
                  'auth_user': localStorage.getItem('auth_user'),
                  'firebase:authUser': localStorage.getItem('firebase:authUser') ? 'Present (not shown)' : 'Not found',
                  'force_google_auth': localStorage.getItem('force_google_auth'),
                  'using_google_auth': localStorage.getItem('using_google_auth'),
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Button 
            variant="destructive"
            className="flex items-center"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out Completely
          </Button>
          
          <Button 
            variant="secondary"
            onClick={handleForceGoogleAuth}
          >
            Force Google Authentication
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
          >
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}