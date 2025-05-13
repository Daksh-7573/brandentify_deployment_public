import { useState, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { ResumeDrop } from '@/components/resume-parser/ResumeDrop';
import { ResumeMapping } from '@/components/resume-parser/ResumeMapping';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';
import { useRouter } from 'wouter';

export default function ResumeParserPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [, setLocation] = useRouter();
  
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle when resume is processed
  const handleResumeProcessed = (data: any) => {
    setExtractedData(data);
  };
  
  // Handle when mapping is approved
  const handleApproveMapping = async (mappedData: any) => {
    setIsLoading(true);
    
    try {
      // Save the mapped data to the user's profile
      const response = await fetch('/api/profile/update-from-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          mappedData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Success
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile has been updated with information from your resume',
        variant: 'default'
      });
      
      // Redirect to profile page
      setTimeout(() => {
        setLocation('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    setExtractedData(null);
  };
  
  // If user is not logged in, show message
  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 pt-24 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Drop & Define</h1>
            <p className="text-muted-foreground mb-6">
              Please log in to upload your resume and build your profile
            </p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {extractedData ? 'Review Your Profile' : 'Drop & Define'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {extractedData 
              ? 'Review the information extracted from your resume and decide what to include in your profile'
              : 'Upload your resume and let Musk automatically build your professional profile'}
          </p>
        </div>
        
        {extractedData ? (
          <ResumeMapping 
            extractedData={extractedData}
            onApproveMapping={handleApproveMapping}
            onCancel={handleCancel}
          />
        ) : (
          <ResumeDrop 
            onResumeProcessed={handleResumeProcessed}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
}