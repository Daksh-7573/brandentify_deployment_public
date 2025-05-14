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
    if (!user) {
      setIsAdmin(false);
      setIsChecking(false);
      return;
    }

    // Check if the user is in the admin list
    const hasAdminAccess = ADMIN_USER_IDS.includes(user.id);
    console.log('Admin access check:', { userId: user.id, hasAccess: hasAdminAccess });
    setIsAdmin(hasAdminAccess);
    setIsChecking(false);
  }, [user]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Redirect to="/industry-pulse" />;
  }

  return <>{children}</>;
}