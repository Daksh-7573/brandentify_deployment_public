import { GoogleSignIn } from '@/components/auth/google-sign-in';

/**
 * Simple Google Authentication component
 */
export function GoogleAuth() {
  return (
    <div className="w-full">
      <GoogleSignIn />
    </div>
  );
}