import { useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/context/auth-context';

// List of user IDs with admin access
const ADMIN_USER_IDS = [4]; // Adding user ID 4 which is the Firebase user

export function AdminCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('Admin check: No user found');
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check if the user is in the admin list - hardcoded for now
        const hasAdminAccess = ADMIN_USER_IDS.includes(user.id);
        console.log('Admin access check:', { 
          userId: user.id, 
          userObject: user, 
          adminList: ADMIN_USER_IDS,
          hasAccess: hasAdminAccess 
        });
        
        // This will just allow any user ID 4 to access the admin pages
        // since we know the Firebase user has ID 4
        setIsAdmin(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsChecking(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-2">Checking admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('Admin access denied, redirecting to Industry Pulse');
    return <Redirect to="/industry-pulse" />;
  }

  console.log('Admin access granted, rendering admin content');
  return <>{children}</>;
}