import React, { useState } from 'react';
import ResumeEditor from '@/pages/resume-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function SafeResumeEditor() {
  const [hasError, setHasError] = useState(false);

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

  try {
    return <ResumeEditor />;
  } catch (error) {
    console.error("Error rendering ResumeEditor:", error);
    setHasError(true);
    return null;
  }
}