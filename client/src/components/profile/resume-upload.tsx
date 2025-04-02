import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileReviewDialog, ParsedProfileData } from "./profile-review-dialog";

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractProfileData, setExtractProfileData] = useState(true);
  const [parsedData, setParsedData] = useState<ParsedProfileData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
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
            console.log("Starting resume parsing...");
            
            // Call the parse-resume endpoint to get extracted data
            const response = await apiRequest('POST', '/api/parse-resume', {
              userId,
              fileData: base64Data
            });
            
            console.log("Resume parsing response received, status:", response.status);
            
            // Get the extracted data
            const extractedData = await response.json();
            
            console.log("Extracted data:", JSON.stringify(extractedData, null, 2));
            
            // Check for API error
            if (extractedData.error) {
              throw new Error(extractedData.message || extractedData.error || "Error processing resume");
            }
            
            // If no data was extracted, show error
            if (!extractedData || 
                (!extractedData.experiences?.length && 
                 !extractedData.educations?.length && 
                 !extractedData.skills?.length)) {
              throw new Error("No profile data could be extracted from your resume. The file may be in an unsupported format or not contain recognizable text.");
            }
            
            // Store the parsed data
            console.log("Setting parsed data and showing confirmation dialog");
            setParsedData(extractedData);
            
            // Show the confirmation dialog
            setShowConfirmDialog(true);
            
            toast({
              title: "Data extracted",
              description: "Please review the extracted information before saving it to your profile.",
            });
          } catch (error) {
            console.error('Error parsing resume:', error);
            toast({
              title: "Extraction failed",
              description: error instanceof Error ? error.message : "Failed to extract profile data from resume. Please update your profile manually.",
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

  const confirmAndSaveData = async () => {
    if (!parsedData) return;
    
    setIsConfirming(true);
    
    try {
      // In demo mode, use user ID 1, otherwise try to parse the user's UID as a number
      const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
      
      // Call the confirm-resume-data endpoint to save the data
      const response = await apiRequest('POST', '/api/confirm-resume-data', {
        userId,
        experiences: parsedData.experiences,
        educations: parsedData.educations,
        skills: parsedData.skills,
        title: parsedData.title,
        location: parsedData.location,
        overwriteExisting: true
      });
      
      if (!response.ok) {
        throw new Error("Failed to save profile data.");
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
        description: "Your profile has been updated with data from your resume.",
      });
      
      // Close the dialog
      setShowConfirmDialog(false);
      setParsedData(null);
    } catch (error) {
      console.error('Error confirming resume data:', error);
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resume</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-gray-400 mb-4" />
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
                      You'll be able to review the extracted data before it's saved.
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

      {/* Use the ProfileReviewDialog component */}
      <ProfileReviewDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        parsedData={parsedData}
        onConfirm={confirmAndSaveData}
        onCancel={cancelConfirmation}
        isConfirming={isConfirming}
        source="resume"
      />
    </>
  );
}