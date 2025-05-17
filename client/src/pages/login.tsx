import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { GoogleLoginButton } from '@/components/auth/login-buttons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import backgroundImageUrl from '@assets/interior-background-of-a-cozy-dark-living-room-ai-generated-photo.jpg';

export default function LoginPage() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // If user is already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <Card className="w-full max-w-md border border-primary/10 bg-black/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Brandentifier</CardTitle>
          <CardDescription>Sign in to access your professional network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <GoogleLoginButton />
            
            <div className="flex items-center gap-2 my-2">
              <Separator className="flex-grow bg-gray-700" />
              <span className="text-sm text-muted-foreground px-2">or</span>
              <Separator className="flex-grow bg-gray-700" />
            </div>
            
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => navigate('/register')}
            >
              Create an account
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}