import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Auth Success Page - handles successful Google authentication
 */
export default function AuthSuccessPage() {
  const [, navigate] = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthSuccess = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        
        if (userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          signIn(user);
          
          const isNewUser = !user.profileCompleted || user.profileCompleted < 20;
          const hasBasicProfile = user.profileCompleted >= 40;
          
          toast({
            title: isNewUser ? 'Welcome to Brandentifier!' : 'Welcome back!',
            description: `Signed in as ${user.name}`
          });

          console.log(`User ${isNewUser ? 'account created' : 'signed in'} successfully`);

          // Navigate based on user state
          const returnUrl = sessionStorage.getItem('auth_return_url');
          sessionStorage.removeItem('auth_return_url');
          
          if (returnUrl) {
            // If there's a return URL, go there
            navigate(returnUrl);
          } else if (isNewUser) {
            // New users go to onboarding
            navigate('/onboarding');
          } else {
            // Existing users go to Brand Quests (hero feature)
            navigate('/brand-quests');
          }
        } else {
          throw new Error('No user data found');
        }
      } catch (error: any) {
        console.error('Auth success error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to complete authentication',
          variant: 'destructive'
        });
        navigate('/auth');
      }
    };

    handleAuthSuccess();
  }, [signIn, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}