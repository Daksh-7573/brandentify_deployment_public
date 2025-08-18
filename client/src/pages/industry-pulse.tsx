import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser, logout } from '@/lib/firebase-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NeoGlassLayout, NeoGlassSection } from '@/components/layout/neo-glass-layout';

export default function IndustryPulsePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize authentication for Industry Pulse page
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Industry Pulse: Checking authentication...');
        
        // First check stored authentication immediately
        const storedAuth = localStorage.getItem('brandentifier_auth');
        const storedUserData = sessionStorage.getItem('brandentifier_user');
        
        if (storedAuth === 'true' && storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('Found stored auth data:', userData.email);
          setUser(userData);
          setIsLoading(false);
          
          // Show welcome message for newly authenticated users
          if (window.location.search.includes('from=auth')) {
            toast({
              title: 'Welcome!',
              description: `Successfully signed in as ${userData.displayName || userData.email}`,
            });
          }
          return;
        }
        
        // If no stored auth, check Firebase
        const { waitForAuthInit, getCurrentUser } = await import('@/lib/firebase-auth');
        
        // Wait for Firebase auth state to initialize (with timeout)
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 2000));
        const firebaseUser = await Promise.race([waitForAuthInit(), timeoutPromise]);
        
        if (firebaseUser) {
          const currentUser = getCurrentUser();
          console.log('User authenticated via Firebase:', currentUser?.email);
          setUser(currentUser);
          setIsLoading(false);
          return;
        }
        
        // User is not authenticated, redirect to auth page
        console.log('User not authenticated, redirecting to auth page...');
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoading(false);
        // On error, redirect to auth page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    };

    checkAuth();
  }, [toast]);

  // Remove checkAuth function as it's now handled in useEffect

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <NeoGlassLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <NeoGlassSection className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Industry Pulse</h1>
                <p className="text-gray-300">Welcome back, {user?.displayName || user?.email}</p>
              </div>
              <div className="flex items-center gap-4">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </NeoGlassSection>

          {/* Welcome Message */}
          <NeoGlassSection className="mb-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-white mb-4">
                🎉 Authentication Successful!
              </h2>
              <p className="text-gray-300 mb-6">
                You have successfully signed in with Google and reached the Industry Pulse page.
              </p>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 font-medium">
                  ✅ Google Authentication is now working properly
                </p>
                <p className="text-green-400 text-sm mt-2">
                  The authentication flow is complete and user data is properly stored.
                </p>
              </div>
            </div>
          </NeoGlassSection>

          {/* User Information */}
          <NeoGlassSection>
            <h3 className="text-xl font-semibold text-white mb-4">Your Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">{user?.displayName || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-sm">{user?.uid}</span>
              </div>
            </div>
          </NeoGlassSection>
        </div>
      </NeoGlassLayout>
    </div>
  );
}