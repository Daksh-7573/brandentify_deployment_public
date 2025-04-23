import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Presentation, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface PortfolioCreateHelperProps {
  userNumericId: number | null;
  className?: string;
}

export default function PortfolioCreateHelper({ userNumericId, className }: PortfolioCreateHelperProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Query to check if a portfolio exists
  const { data: portfolio, isLoading } = useQuery({
    queryKey: [`/api/users/${userNumericId}/portfolio`],
    enabled: !!userNumericId && !!user,
    retry: false, // Don't retry the 404 response
  });

  const handleNavigate = () => {
    navigate('/portfolio-builder');
  };

  if (isLoading) {
    return (
      <Card className={`w-full max-w-3xl mx-auto mt-8 ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl">Checking portfolio status...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (portfolio) {
    // If portfolio exists, we don't need to show this component
    return null;
  }

  // If no portfolio found (404 error), show the create helper
  return (
    <Card className={`w-full max-w-3xl mx-auto mt-8 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-xl">Portfolio Not Created Yet</CardTitle>
        </div>
        <CardDescription>
          You need to create a portfolio first to see your profile information displayed in the different layouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            The portfolio builder will use your existing profile information (skills, experiences, projects, etc.) 
            and display them in the layout of your choice. 
          </p>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
            <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-2 mb-2">
                <Presentation className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Choose a Layout</h3>
              <p className="text-xs text-gray-500 mt-1">Select from 7+ professional portfolio layouts</p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Automatic Content</h3>
              <p className="text-xs text-gray-500 mt-1">Your profile data will be automatically included</p>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Publish When Ready</h3>
              <p className="text-xs text-gray-500 mt-1">Choose when to make your portfolio public</p>
            </div>
          </div>
          
          <Button 
            className="w-full mt-6" 
            onClick={handleNavigate}
          >
            Create My Portfolio <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}