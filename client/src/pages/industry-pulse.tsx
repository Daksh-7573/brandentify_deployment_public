import { useEffect, useState } from 'react';
import { isAuthenticated, getCurrentUser, logout } from '@/lib/firebase-auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NeoGlassLayout, NeoGlassSection } from '@/components/layout/neo-glass-layout';

export default function IndustryPulsePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (!isAuthenticated()) {
      toast({
        title: 'Access Denied',
        description: 'Please sign in to access Industry Pulse.',
        variant: 'destructive',
      });
      window.location.href = '/';
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  };

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