import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, FileText } from "lucide-react";
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
  const [isDragActive, setIsDragActive] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { user, isDemoMode, refreshUserData } = useAuth();
  
  const validateFile = (selectedFile: File): boolean => {
    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Some browsers may use these MIME types for PDFs
      'binary/octet-stream',
      'application/x-pdf',
      'application/acrobat',
    ];
    
    // Handle cases where MIME type isn't correctly detected
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const isPdf = fileExtension === 'pdf';
    const isDocx = fileExtension === 'docx';
    
    const isValidType = validTypes.includes(selectedFile.type) || isPdf || isDocx;
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        console.log("File selected:", selectedFile.name, "Type:", selectedFile.type);
      }
    }
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        console.log("File dropped:", droppedFile.name, "Type:", droppedFile.type);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      console.log("Starting file upload - Converting to base64");
      
      // Convert file to base64
      const fileReader = new FileReader();
      
      // Set up promise to handle file reading
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => {
          const result = fileReader.result?.toString() || '';
          const base64Data = result.split(',')[1] || result;
          if (base64Data) {
            resolve(base64Data);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        
        fileReader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
      });
      
      // Start reading the file
      fileReader.readAsDataURL(file);
      
      // Wait for file reading to complete
      const base64Data = await fileReadPromise;
      console.log("File successfully converted to base64, length:", base64Data.length);
      
      // In demo mode, use user ID 1, otherwise try to parse the user's UID as a number
      const userId = isDemoMode ? 1 : (user?.uid ? parseInt(user.uid) : 1);
      
      // Save the resume
      console.log("Sending resume to server");
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
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume. Please try again.",
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

  // Handle clear action to reset everything
  const handleClear = () => {
    // Reset file and states
    setFile(null);
    setParsedData(null);
    setShowConfirmDialog(false);
    setIsParsing(false);
    setIsUploading(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Resume cleared",
      description: "You can now upload a new resume for analysis.",
    });
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Resume</h2>
            
            {/* Clear button to reset everything */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              disabled={isUploading || isParsing}
              className="text-gray-500 hover:text-primary"
            >
              Clear
            </Button>
          </div>
          
          {/* Drop zone with drag and drop event handlers */}
          <div 
            ref={dropZoneRef}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              {file ? (
                <FileText className="h-12 w-12 text-primary mb-4" />
              ) : isUploading || isParsing ? (
                <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
              )}
              
              <p className="text-sm text-gray-500 mb-2 font-medium">
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
                  <input 
                    ref={fileInputRef}
                    id="resume-file-input"
                    type="file" 
                    accept=".pdf,.docx" 
                    className="hidden" 
                    onChange={handleFileChange}
                    disabled={isUploading || isParsing}
                  />
                  
                  {!file ? (
                    <Button 
                      variant="outline" 
                      className="cursor-pointer"
                      disabled={isUploading || isParsing}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the dropzone click
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isUploading || isParsing}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the dropzone click
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove File
                      </Button>
                      
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the dropzone click
                          handleUpload();
                        }}
                        disabled={isUploading || isParsing}
                      >
                        {isUploading ? "Uploading..." : isParsing ? "Processing..." : "Upload Resume"}
                        {(isUploading || isParsing) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      </Button>
                    </>
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