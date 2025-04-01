import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for parsed resume data
type ParsedExperience = {
  title: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
};

type ParsedEducation = {
  degree: string;
  institution: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
};

type ParsedSkill = {
  name: string;
  level: string;
  proficiency: number | null;
};

type ParsedResumeData = {
  title?: string;
  location?: string;
  experiences: ParsedExperience[];
  educations: ParsedEducation[];
  skills: ParsedSkill[];
  counts: {
    experiences: number;
    educations: number;
    skills: number;
  };
  status: string;
  message: string;
};

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractProfileData, setExtractProfileData] = useState(true);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
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
            // Call the parse-resume endpoint to get extracted data
            const response = await apiRequest('POST', '/api/parse-resume', {
              userId,
              fileData: base64Data
            });
            
            // Get the extracted data
            const extractedData = await response.json();
            
            // If no data was extracted, show error
            if (!extractedData || 
                (!extractedData.experiences?.length && 
                 !extractedData.educations?.length && 
                 !extractedData.skills?.length)) {
              throw new Error("No profile data could be extracted from your resume.");
            }
            
            // Store the parsed data
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>Confirm Resume Data</DialogTitle>
          <DialogDescription>
            Please review the information extracted from your resume. This data will replace your current profile information.
          </DialogDescription>

          {parsedData && (
            <div className="mt-4">
              {/* Title and Location */}
              {(parsedData.title || parsedData.location) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                  {parsedData.title && (
                    <p className="text-sm"><span className="font-medium">Position:</span> {parsedData.title}</p>
                  )}
                  {parsedData.location && (
                    <p className="text-sm"><span className="font-medium">Location:</span> {parsedData.location}</p>
                  )}
                </div>
              )}

              <Tabs defaultValue="experience" className="mt-4">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="experience">
                    Work Experience {parsedData.counts.experiences > 0 && <Badge variant="secondary" className="ml-2">{parsedData.counts.experiences}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="education">
                    Education {parsedData.counts.educations > 0 && <Badge variant="secondary" className="ml-2">{parsedData.counts.educations}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="skills">
                    Skills {parsedData.counts.skills > 0 && <Badge variant="secondary" className="ml-2">{parsedData.counts.skills}</Badge>}
                  </TabsTrigger>
                </TabsList>
                
                {/* Experience Tab */}
                <TabsContent value="experience">
                  {parsedData.experiences.length === 0 ? (
                    <Alert>
                      <AlertDescription>No work experience could be extracted from your resume.</AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.experiences.map((exp, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{exp.title}</TableCell>
                            <TableCell>{exp.company}</TableCell>
                            <TableCell>{exp.location || 'N/A'}</TableCell>
                            <TableCell>
                              {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                {/* Education Tab */}
                <TabsContent value="education">
                  {parsedData.educations.length === 0 ? (
                    <Alert>
                      <AlertDescription>No education details could be extracted from your resume.</AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Degree</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.educations.map((edu, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{edu.degree}</TableCell>
                            <TableCell>{edu.institution}</TableCell>
                            <TableCell>{edu.location || 'N/A'}</TableCell>
                            <TableCell>
                              {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : '- Present'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                {/* Skills Tab */}
                <TabsContent value="skills">
                  {parsedData.skills.length === 0 ? (
                    <Alert>
                      <AlertDescription>No skills could be extracted from your resume.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {parsedData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="p-2 justify-between">
                          <span>{skill.name}</span>
                          {skill.level && <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-1 rounded">{skill.level}</span>}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={cancelConfirmation} disabled={isConfirming}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={confirmAndSaveData} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save to Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
