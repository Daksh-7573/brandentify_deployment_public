import React, { useState, useEffect } from 'react';
import ResumeEditor from '@/pages/resume-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export function SafeResumeEditor() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryMessage, setShowRetryMessage] = useState(false);
  
  // Set a timeout to stop showing loading message and try rendering component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If we've had an error and are retrying, set up another attempt
  useEffect(() => {
    if (retryCount > 0 && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        setIsLoading(false);
        setShowRetryMessage(false);
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [retryCount]);

  // Error UI
  if (hasError) {
    return (
      <Card className="w-full p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Resume Editor</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We encountered a problem loading the Resume Editor. Please try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Page
          </Button>
        </div>
      </Card>
    );
  }
  
  // Loading UI
  if (isLoading || showRetryMessage) {
    return (
      <Card className="w-full p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">
            {showRetryMessage ? "Retrying..." : "Loading Resume Editor"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {showRetryMessage 
              ? "We're trying again to load your resume editor..." 
              : "Please wait while we load your resume editor..."}
          </p>
        </div>
      </Card>
    );
  }

  // Try to render the actual component
  try {
    return <ResumeEditor />;
  } catch (error) {
    console.error("Error rendering ResumeEditor:", error);
    
    // If we haven't reached max retries, try again
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setShowRetryMessage(true);
      setIsLoading(true);
      return null;
    }
    
    // If we've retried too many times, show error
    setHasError(true);
    return null;
  }
}