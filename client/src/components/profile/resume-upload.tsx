import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractProfileData, setExtractProfileData] = useState(true);
  const { toast } = useToast();
  const { user, isDemoMode, refreshUserData } = useAuth();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      
      fileReader.onload = async () => {
        const base64Data = fileReader.result?.toString().split(',')[1];
        
        if (!base64Data) {
          throw new Error("Failed to convert file to base64");
        }
        
        // Save the resume
        // In demo mode, use user ID 1, otherwise try to parse the user's UID as a number
        const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
        
        await apiRequest('POST', '/api/resumes', {
          userId,
          fileName: file.name,
          fileData: base64Data
        });
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded."
        });
        
        // If user wants to extract profile data
        if (extractProfileData) {
          setIsParsing(true);
          try {
            const response = await apiRequest('POST', '/api/parse-resume', {
              userId,
              fileData: base64Data
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
            console.log("Resume parsing successful - forcing complete data refresh");
            
            // First, explicitly verify the data was saved
            try {
              console.log("Verifying resume data was saved to database...");
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
                console.warn("No resume data found in database, attempting to save explicitly");
                
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
              console.error("Error verifying saved resume data:", error);
            }
            
            // Reset the entire cache
            console.log("Completely resetting query cache");
            queryClient.clear();
            
            // Then force immediate refetching with cache bypass
            console.log("Forcibly refetching all data from server with cache bypass");
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
            
            // Use the enhanced refreshUserData function to update profile data for all users
            try {
              console.log("Calling refreshUserData to ensure complete data refresh after resume parsing");
              await refreshUserData();
              
              // Wait for a brief moment to let all components update
              await new Promise(resolve => setTimeout(resolve, 500));
              
              toast({
                title: "Profile Updated",
                description: "Your profile has been refreshed with information from your resume.",
              });
            } catch (error) {
              console.error("Error during data refresh after resume parsing:", error);
            }
            
            toast({
              title: "Profile data extracted",
              description: "Your profile has been updated with data from your resume.",
            });
          } catch (error) {
            console.error('Error parsing resume:', error);
            toast({
              title: "Extraction failed",
              description: "Failed to extract profile data from resume. Please update your profile manually.",
              variant: "destructive"
            });
          } finally {
            setIsParsing(false);
          }
        }
        
        setFile(null);
        setIsUploading(false);
      };
      
      fileReader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Resume</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <div className="flex flex-col items-center">
            <i className="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
            <p className="text-sm text-gray-500 mb-2">
              {file ? `Selected file: ${file.name}` : "Drag and drop your resume here or click to browse"}
            </p>
            <p className="text-xs text-gray-400">Supported formats: PDF, DOCX (Max 5MB)</p>
            
            <div className="mt-4 w-full">
              <div className="flex items-center mb-4 justify-center">
                <Switch 
                  id="extract-data" 
                  checked={extractProfileData} 
                  onCheckedChange={setExtractProfileData}
                  disabled={isUploading || isParsing}
                />
                <Label htmlFor="extract-data" className="ml-2">
                  Extract profile data from resume
                </Label>
              </div>
              
              {extractProfileData && (
                <Alert className="mb-4 text-left">
                  <AlertTitle>AI-powered profile completion</AlertTitle>
                  <AlertDescription>
                    We'll use AI to extract your work experience, education, and skills from your resume to automatically complete your profile.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-4 justify-center">
                <div>
                  <input 
                    id="resume-file-input"
                    type="file" 
                    accept=".pdf,.docx" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isUploading || isParsing}
                  />
                  <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    disabled={isUploading || isParsing}
                    onClick={() => {
                      document.getElementById('resume-file-input')?.click();
                    }}
                  >
                    Browse Files
                  </Button>
                </div>
                {file && (
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading || isParsing}
                  >
                    {isUploading ? "Uploading..." : isParsing ? "Processing..." : "Upload Resume"}
                    {(isUploading || isParsing) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </Button>
                )}
              </div>
              
              {isParsing && (
                <div className="mt-4 text-sm text-gray-500">
                  <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                  Extracting profile data from your resume...
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
