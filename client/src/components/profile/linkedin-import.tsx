import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Linkedin } from "lucide-react";
import { ProfileReviewDialog, ParsedProfileData } from "./profile-review-dialog";

export default function LinkedInImport() {
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [parsedData, setParsedData] = useState<ParsedProfileData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { toast } = useToast();
  const { user, isDemoMode, refreshUserData } = useAuth();
  
  const handleImport = async () => {
    if (!profileUrl || !profileUrl.includes('linkedin.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn profile URL.",
        variant: "destructive"
      });
      return;
    }
    
    setIsParsing(true);
    
    try {
      // In demo mode, use user ID 1, otherwise try to parse the user's UID as a number
      const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
      
      const response = await apiRequest('POST', '/api/parse-linkedin', {
        userId,
        profileUrl
      });
      
      const profileData = await response.json();
      
      // Check if the response contains an error message
      if (profileData.error) {
        console.log("LinkedIn import error:", profileData.error);
        toast({
          title: "LinkedIn Import Unavailable",
          description: profileData.message || profileData.error,
          variant: "destructive"
        });
        return;
      }
      
      // Store the parsed data and show the confirmation dialog
      if (profileData) {
        // Calculate counts for the badge display
        const counts = {
          experiences: profileData.experiences?.length || 0,
          educations: profileData.educations?.length || 0,
          skills: profileData.skills?.length || 0
        };
        
        // Create the complete parsed data object
        const parsedProfileData: ParsedProfileData = {
          ...profileData,
          counts,
          experiences: profileData.experiences || [],
          educations: profileData.educations || [],
          skills: profileData.skills || []
        };
        
        setParsedData(parsedProfileData);
        setShowConfirmDialog(true);
        
        toast({
          title: "Data extracted",
          description: "Please review the extracted information before saving it to your profile.",
        });
      } else {
        throw new Error("No profile data could be extracted.");
      }
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      toast({
        title: "Import failed",
        description: "Failed to import LinkedIn profile data. Please update your profile manually.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };
  
  const confirmAndSaveData = async () => {
    if (!parsedData) return;
    
    setIsConfirming(true);
    
    try {
      // In demo mode, use user ID 1, otherwise try to parse the user's UID as a number
      const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
      
      // Process the extracted data - add work experiences
      if (parsedData.experiences && parsedData.experiences.length > 0) {
        for (const exp of parsedData.experiences) {
          // Ensure userId is set and is a number
          const experience = { ...exp, userId };
          await apiRequest('POST', '/api/experiences', experience);
        }
      }
      
      // Process educations
      if (parsedData.educations && parsedData.educations.length > 0) {
        for (const edu of parsedData.educations) {
          // Ensure userId is set and is a number
          const education = { ...edu, userId };
          await apiRequest('POST', '/api/educations', education);
        }
      }
      
      // Process skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        for (const skill of parsedData.skills) {
          // Ensure userId is set and is a number
          const skillData = { ...skill, userId };
          await apiRequest('POST', '/api/skills', skillData);
        }
      }
      
      // Update user profile with job title and location if available
      if (parsedData.title || parsedData.location) {
        try {
          // First check if the user exists
          const response = await apiRequest('GET', `/api/users/${userId}`);
          
          if (response.ok) {
            // User exists, update it
            const updateData: any = {};
            if (parsedData.title) updateData.title = parsedData.title;
            if (parsedData.location) updateData.location = parsedData.location;
            
            await apiRequest('PUT', `/api/users/${userId}`, updateData);
          } else {
            // User doesn't exist, create a demo user
            const newUser: any = {
              email: `demo${userId}@example.com`,
              name: "Demo User",
              photoURL: null
            };
            if (parsedData.title) newUser.title = parsedData.title;
            if (parsedData.location) newUser.location = parsedData.location;
            
            // Create the user
            await apiRequest('POST', '/api/users', newUser);
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
          // Continue anyway so at least the experiences, education and skills are saved
        }
      }
      
      // Reset the query cache to ensure fresh data
      queryClient.clear();
      
      // Fetch fresh data
      await Promise.all([
        queryClient.fetchQuery({ 
          queryKey: [`/api/users/${userId}/experiences`],
          staleTime: 0,
          gcTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: [`/api/users/${userId}/educations`],
          staleTime: 0,
          gcTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: [`/api/users/${userId}/skills`],
          staleTime: 0,
          gcTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: [`/api/users/${userId}`],
          staleTime: 0,
          gcTime: 0
        })
      ]);
      
      // Refresh user data
      await refreshUserData();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated with data from your LinkedIn profile.",
      });
      
      // Close the dialog and reset
      setShowConfirmDialog(false);
      setParsedData(null);
      setProfileUrl('');
    } catch (error) {
      console.error('Error saving LinkedIn profile data:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save profile data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };
  
  const cancelConfirmation = () => {
    setShowConfirmDialog(false);
    setParsedData(null);
    
    toast({
      title: "Update cancelled",
      description: "No changes were made to your profile.",
    });
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Import from LinkedIn</h2>
          
          <Alert className="mb-4">
            <AlertTitle>LinkedIn Profile Data Import</AlertTitle>
            <AlertDescription>
              <p>Connect your LinkedIn profile to automatically populate your professional information.</p>
              <p className="mt-2">Enter your LinkedIn profile URL below and we'll extract your work history, education, and skills.</p>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="https://www.linkedin.com/in/your-profile-url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                disabled={isParsing}
                className="flex-1"
              />
              <Button 
                onClick={handleImport}
                disabled={isParsing || !profileUrl}
              >
                {isParsing ? "Importing..." : "Import Profile"}
                {isParsing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
            
            {isParsing && (
              <div className="text-sm text-gray-500 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing your LinkedIn profile...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Use the ProfileReviewDialog component */}
      <ProfileReviewDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        parsedData={parsedData}
        onConfirm={confirmAndSaveData}
        onCancel={cancelConfirmation}
        isConfirming={isConfirming}
        source="linkedin"
      />
    </>
  );
}