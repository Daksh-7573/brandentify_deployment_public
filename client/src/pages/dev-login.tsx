import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { FastGoogleAuth } from '@/components/auth/FastGoogleAuth';
import { useAuth } from '@/hooks/use-auth';

const DevLoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      toast({
        title: "Authentication Successful",
        description: `Welcome back, ${user.name}!`,
      });
      setTimeout(() => navigate('/industry-pulse'), 1000);
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  // Collect debug info
  useEffect(() => {
    setDebugInfo({
      domain: window.location.host,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isAuthenticated: isAuthenticated,
      currentUser: user ? {
        displayName: user.name,
        email: user.email,
        uid: user.id
      } : null
    });
  }, [isAuthenticated, user]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black bg-opacity-90 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Development Login</h1>
          <p className="text-gray-400 mb-8">Special authentication for development environment</p>
        </div>
        
        <Card className="w-full backdrop-blur-lg bg-black bg-opacity-40 border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Development Authentication</CardTitle>
            <CardDescription className="text-gray-400">
              Development access using production OAuth system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isAuthenticated ? (
              <div className="py-4 text-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-md mb-4">
                  ✓ Authentication Successful
                </div>
                <p className="text-gray-300">
                  You are logged in as <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            ) : (
              <div className="py-4">
                <FastGoogleAuth />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            
            <div className="w-full mt-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full text-gray-400 hover:text-gray-200"
              >
                Back to Home
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>Domain: {debugInfo.domain}</p>
              <p>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
              {debugInfo.currentUser && (
                <p>User: {debugInfo.currentUser.displayName} ({debugInfo.currentUser.email})</p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DevLoginPage;