import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { NeoGlassLayout } from '@/components/layout/neo-glass-layout';
import { NeoGlassSection } from '@/components/layout/neo-glass-section';
import { InfoIcon, CheckCircle, AlertCircle, LogOut, LogIn, RefreshCw } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export default function GoogleAuthTest() {
  const { user, isAuthenticated, isLoading, signInWithGoogle, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <NeoGlassLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Google Authentication Test</h1>
        
        <div className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
          <NeoGlassSection title="Authentication Status">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin mr-2">
                    <RefreshCw size={20} />
                  </div>
                  <span>Checking authentication status...</span>
                </div>
              ) : isAuthenticated ? (
                <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Authenticated</AlertTitle>
                  <AlertDescription>
                    You are currently signed in with Google.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Not Authenticated</AlertTitle>
                  <AlertDescription>
                    You are not currently signed in.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {!isAuthenticated ? (
                  <Button onClick={signInWithGoogle} disabled={isLoading}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in with Google
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
                      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh User Data
                    </Button>
                    <Button onClick={handleSignOut} variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </NeoGlassSection>
          
          {isAuthenticated && user && (
            <NeoGlassSection title="User Profile Data">
              <Card className="bg-background/60 backdrop-blur-lg border-0">
                <CardHeader className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.photoURL || ''} alt={user.name || 'User'} />
                    <AvatarFallback>{user.name?.substring(0, 2) || user.email?.substring(0, 2) || 'U'}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{user.name || 'No Name'}</CardTitle>
                  <CardDescription>{user.title || 'No Title'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Firebase UID</div>
                      <div className="col-span-2 overflow-hidden text-ellipsis">{user.uid}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">User ID</div>
                      <div className="col-span-2">{user.id}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Email</div>
                      <div className="col-span-2">{user.email || 'No Email'}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Username</div>
                      <div className="col-span-2">{user.username}</div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Location</div>
                      <div className="col-span-2">{user.location || 'No Location'}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20">
                    <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Profile Status</AlertTitle>
                    <AlertDescription className="text-sm">
                      {user.name && user.photoURL 
                        ? 'Your Google profile data is being properly synced.' 
                        : 'Some Google profile data may be missing. Try signing out and in again.'}
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </NeoGlassSection>
          )}
          
          <NeoGlassSection title="Technical Details">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication Flow</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>When you click "Sign in with Google", you'll be redirected to Google's authentication page</li>
                  <li>After authenticating, Google will redirect back to our app</li>
                  <li>The app will create or update your user profile in our database using your Google profile data</li>
                  <li>Your profile should include your Google display name and profile picture</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Fixed Issues</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Enhanced user creation to properly sync Google profile data to backend</li>
                  <li>Added better handling of both Firebase UID and numeric ID in API calls</li>
                  <li>Improved error handling for authentication redirect flow</li>
                  <li>Prevented creation of generic "Firebase User" profiles without proper Google data</li>
                </ul>
              </div>
            </div>
          </NeoGlassSection>
        </div>
      </div>
    </NeoGlassLayout>
  );
}