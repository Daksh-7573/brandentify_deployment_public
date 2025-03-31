import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function LinkedInImport() {
  const [isParsing, setIsParsing] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      const userId = user?.uid ? parseInt(user.uid) : 1; // Use uid or default to 1 for demo mode
      
      const response = await apiRequest('POST', '/api/parse-linkedin', {
        userId,
        profileUrl
      });
      
      const profileData = await response.json();
      
      // Process the extracted data - add work experiences
      if (profileData.experiences && profileData.experiences.length > 0) {
        for (const exp of profileData.experiences) {
          await apiRequest('POST', '/api/experiences', exp);
        }
      }
      
      // Process educations
      if (profileData.educations && profileData.educations.length > 0) {
        for (const edu of profileData.educations) {
          await apiRequest('POST', '/api/educations', edu);
        }
      }
      
      // Process skills
      if (profileData.skills && profileData.skills.length > 0) {
        for (const skill of profileData.skills) {
          await apiRequest('POST', '/api/skills', skill);
        }
      }
      
      // Update user profile with job title and location if available
      if (profileData.title || profileData.location) {
        const updateData: any = {};
        if (profileData.title) updateData.title = profileData.title;
        if (profileData.location) updateData.location = profileData.location;
        
        await apiRequest('PUT', `/api/users/${userId}`, updateData);
      }
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/experiences`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/educations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      
      toast({
        title: "Profile data imported",
        description: "Your profile has been updated with data from your LinkedIn profile.",
      });
      
      setProfileUrl('');
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

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Import from LinkedIn</h2>
        
        <Alert className="mb-4">
          <AlertTitle>LinkedIn Profile Data Import</AlertTitle>
          <AlertDescription>
            Enter your LinkedIn profile URL to import your professional experience, education, and skills.
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
  );
}