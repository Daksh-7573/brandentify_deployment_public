import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, Download, Zap } from 'lucide-react';
import { UserData } from '@/types/user';

interface SimpleShadowResumeProps {
  userId: number;
}

export default function SimpleShadowResume({ userId }: SimpleShadowResumeProps) {
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Direct fetch from API
  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      console.log(`Fetching resume for user ${userId}...`);
      
      fetch(`/api/users/${userId}/shadow-resume`)
        .then(res => res.json())
        .then(data => {
          console.log('Resume data received:', data);
          setResumeData(data.resume);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching resume:', err);
          setIsLoading(false);
          toast({
            title: 'Error',
            description: 'Failed to load resume data',
            variant: 'destructive',
          });
        });
    }
  }, [userId, toast]);

  // Check if fileData exists and is valid
  const hasValidFileData = (data: any) => {
    try {
      if (!data) return false;
      if (!data.fileData) return false;
      if (data.fileData.length < 10) return false; // Empty or trivial data
      return true;
    } catch (error) {
      console.error('Invalid fileData:', error);
      return false;
    }
  };

  // Handle view PDF
  const handleViewPDF = () => {
    if (hasValidFileData(resumeData)) {
      try {
        const dataUrl = `data:application/pdf;base64,${resumeData.fileData}`;
        window.open(dataUrl, '_blank');
      } catch (error) {
        console.error('Error viewing PDF:', error);
        toast({
          title: 'View Failed',
          description: 'There was a problem opening the PDF.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No PDF Available',
        description: 'There is no PDF content to view.',
        variant: 'destructive',
      });
    }
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (hasValidFileData(resumeData)) {
      try {
        // Convert base64 to blob
        const byteCharacters = atob(resumeData.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = resumeData.fileName || 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast({
          title: 'Download Failed',
          description: 'There was a problem downloading the PDF.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'No PDF Available',
        description: 'There is no PDF content to download.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Shadow Resume</CardTitle>
          <CardDescription>Loading your resume...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!resumeData) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>Shadow Resume</CardTitle>
          <CardDescription>No resume found</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-muted-foreground/20 rounded-md">
          <Zap className="h-10 w-10 text-primary/60 mb-3" />
          <h3 className="text-lg font-medium">Your Shadow Resume</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            We couldn't find your shadow resume. Please create one.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Shadow Resume</CardTitle>
        <CardDescription>Your automatically generated resume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-[3/4] bg-card border rounded-lg flex flex-col items-center justify-center p-6 overflow-hidden">
          <p className="text-muted-foreground text-sm mb-3">Resume Preview</p>
          <Zap className="h-16 w-16 text-primary mb-4" />
          <p className="font-bold text-lg mb-1">Shadow Resume Ready</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Your resume has been automatically generated based on your professional profile
          </p>
          <div className="w-3/4 h-48 bg-primary/10 rounded-md flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Click View button to see full PDF</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleViewPDF}
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1"
          onClick={handleDownloadPDF}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </CardFooter>
    </Card>
  );
}