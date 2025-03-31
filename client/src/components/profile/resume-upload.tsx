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
            
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/experiences`] });
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/educations`] });
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
            
            // Also invalidate the user query to refresh the profile
            queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
            
            // For demo mode, refresh the user context data without a full page reload
            // This will keep us on the profile page but refresh the profile data
            if (isDemoMode) {
              // First refresh the profile data in auth context
              try {
                // Get the refreshUserData function from auth context
                // Use the refreshUserData from the hook directly
                await refreshUserData();
                
                toast({
                  title: "Profile Updated",
                  description: "Your profile has been refreshed with information from your resume.",
                });
              } catch (error) {
                console.error("Error refreshing user data:", error);
              }
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
