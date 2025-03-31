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
      
      // Process the extracted data - add work experiences
      if (profileData.experiences && profileData.experiences.length > 0) {
        for (const exp of profileData.experiences) {
          // Ensure userId is set and is a number
          exp.userId = userId;
          await apiRequest('POST', '/api/experiences', exp);
        }
      }
      
      // Process educations
      if (profileData.educations && profileData.educations.length > 0) {
        for (const edu of profileData.educations) {
          // Ensure userId is set and is a number
          edu.userId = userId;
          await apiRequest('POST', '/api/educations', edu);
        }
      }
      
      // Process skills
      if (profileData.skills && profileData.skills.length > 0) {
        for (const skill of profileData.skills) {
          // Ensure userId is set and is a number
          skill.userId = userId;
          await apiRequest('POST', '/api/skills', skill);
        }
      }
      
      // Update user profile with job title and location if available
      if (profileData.title || profileData.location) {
        try {
          // First check if the user exists
          const response = await apiRequest('GET', `/api/users/${userId}`);
          
          if (response.ok) {
            // User exists, update it
            const updateData: any = {};
            if (profileData.title) updateData.title = profileData.title;
            if (profileData.location) updateData.location = profileData.location;
            
            await apiRequest('PUT', `/api/users/${userId}`, updateData);
          } else {
            // User doesn't exist, create a demo user
            const newUser: any = {
              email: `demo${userId}@example.com`,
              name: "Demo User",
              photoURL: null
            };
            if (profileData.title) newUser.title = profileData.title;
            if (profileData.location) newUser.location = profileData.location;
            
            // Create the user
            await apiRequest('POST', '/api/users', newUser);
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
          // Continue anyway so at least the experiences, education and skills are saved
        }
      }
      
      // Force a complete data refresh
      console.log("LinkedIn import successful - forcing complete data refresh");
      
      // First, explicitly verify the data was saved
      try {
        console.log("Verifying data was saved to database...");
        const expResponse = await apiRequest('GET', `/api/users/${userId}/experiences`);
        const savedExperiences = await expResponse.json();
        console.log("Current experiences in database:", savedExperiences.length);
        
        const eduResponse = await apiRequest('GET', `/api/users/${userId}/educations`);
        const savedEducations = await eduResponse.json();
        console.log("Current educations in database:", savedEducations.length);
        
        const skillsResponse = await apiRequest('GET', `/api/users/${userId}/skills`);
        const savedSkills = await skillsResponse.json();
        console.log("Current skills in database:", savedSkills.length);
        
        // If we didn't get any saved data, we need to try again
        if (!savedExperiences.length && !savedEducations.length && !savedSkills.length) {
          console.warn("No data found in database, attempting to save explicitly");
          
          // This is an unusual case - try to resave the profile data directly
          if (profileData.experiences && profileData.experiences.length > 0) {
            // Save experiences
            for (const exp of profileData.experiences) {
              // Ensure userId is set
              exp.userId = userId;
              await apiRequest('POST', '/api/experiences', exp);
            }
          }
          
          if (profileData.educations && profileData.educations.length > 0) {
            // Save educations
            for (const edu of profileData.educations) {
              // Ensure userId is set
              edu.userId = userId;
              await apiRequest('POST', '/api/educations', edu);
            }
          }
          
          if (profileData.skills && profileData.skills.length > 0) {
            // Save skills
            for (const skill of profileData.skills) {
              // Ensure userId is set
              skill.userId = userId;
              await apiRequest('POST', '/api/skills', skill);
            }
          }
        }
      } catch (error) {
        console.error("Error verifying saved data:", error);
      }
      
      // Reset the entire cache
      console.log("Completely resetting query cache for LinkedIn import");
      queryClient.clear();
      
      // Then force immediate refetching with cache bypass
      console.log("Forcibly refetching all LinkedIn import data from server with cache bypass");
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
      
      // For all modes, use the enhanced refreshUserData function to update profile data
      try {
        console.log("Calling refreshUserData to ensure complete data refresh");
        await refreshUserData();
        
        // Wait for a brief moment to let all components update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been refreshed with information from your LinkedIn profile.",
        });
      } catch (error) {
        console.error("Error during data refresh after LinkedIn import:", error);
      }
      
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