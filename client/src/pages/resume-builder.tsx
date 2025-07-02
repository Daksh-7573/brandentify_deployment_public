import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { NeoGlassLayout, NeoGlassSection } from '@/components/layout/neo-glass-layout';
import Header from '@/components/layout/header';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Database, ArrowRight, Eye, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch shadow resume for the user (if it exists)
  const { 
    data: shadowResumeData, 
    isLoading: isResumeLoading, 
    error: resumeError 
  } = useQuery<{resume: any}>({
    queryKey: ['/api/users', user?.uid, 'shadow-resume'],
    enabled: !!user?.uid,
  });

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Get file extension and make more flexible checks
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      console.log(`File selected: ${file.name}, type: ${file.type}`);
      
      // Accept any file that has a PDF or Word document extension or MIME type
      if (
        // Check extensions
        fileName.endsWith('.pdf') || 
        fileName.endsWith('.doc') || 
        fileName.endsWith('.docx') ||
        // Check MIME types
        fileType.includes('pdf') || 
        fileType.includes('word') || 
        fileType.includes('document') ||
        fileType.includes('application/octet-stream') // Sometimes browsers use this generic type
      ) {
        console.log('File accepted!');
        setSelectedFile(file);
        setUploadError(null);
      } else {
        console.log('File rejected: Invalid type');
        setSelectedFile(null);
        setUploadError(`Invalid file type. Please upload a PDF (.pdf), DOC (.doc), or DOCX (.docx) file.`);
      }
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Get file extension and make more flexible checks
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      console.log(`File dropped: ${file.name}, type: ${file.type}`);
      
      // Accept any file that has a PDF or Word document extension or MIME type
      if (
        // Check extensions
        fileName.endsWith('.pdf') || 
        fileName.endsWith('.doc') || 
        fileName.endsWith('.docx') ||
        // Check MIME types
        fileType.includes('pdf') || 
        fileType.includes('word') || 
        fileType.includes('document') ||
        fileType.includes('application/octet-stream') // Sometimes browsers use this generic type
      ) {
        console.log('File accepted!');
        setSelectedFile(file);
      } else {
        console.log('File rejected: Invalid type');
        setSelectedFile(null);
        setUploadError(`Invalid file type. Please upload a PDF (.pdf), DOC (.doc), or DOCX (.docx) file.`);
      }
    }
  };

  // Upload and process the resume
  const handleUploadResume = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    // Create an interval to simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 80 ? 80 : newProgress;
      });
    }, 300);
    
    try {
      // Prepare file for upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user?.uid || '');
      
      console.log('Uploading resume file:', selectedFile.name);
      console.log('User ID for upload:', user?.uid);
      
      // Upload the resume file with better error handling
      console.log('Sending resume for parsing with content type automatically set by FormData');
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header as FormData automatically sets it with boundary
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Parse the response
      const parsedData = await response.json();
      console.log('Parsed resume data:', parsedData);
      
      // Set upload to complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Store the parsed data in localStorage to pass to the editor
      localStorage.setItem('parsedResumeData', JSON.stringify(parsedData));
      
      // Navigate to the resume editor with parsed data
      setTimeout(() => {
        navigate('/resume-editor');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadError(error.message || 'Failed to upload resume. Please try again.');
      setIsLoading(false);
    }
  };

  // Start fresh with editor
  const handleCreateFromScratch = () => {
    navigate('/resume-editor');
  };

  // Extract data from profile
  const handleCreateFromProfile = () => {
    navigate('/resume-editor');
  };

  // View shadow resume
  const handleViewShadowResume = () => {
    navigate('/resume');
  };

  // Edit shadow resume
  const handleEditShadowResume = () => {
    navigate('/resume-editor');
  };

  // Check if user has an existing shadow resume
  const hasExistingResume = shadowResumeData?.resume;

  return (
    <div 
      className="flex h-screen flex-col responsive-background"
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      {/* Glass UI overlay to maintain design consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16 relative z-10">
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-3 sm:mx-4 md:mx-6">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Resume Builder</h1>
                  <p className="text-white/80 mt-1 text-sm sm:text-base">
                    Create a professional resume by uploading your existing resume or starting from scratch
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full md:w-auto"
                  >
                    Back to Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing Resume Section (if available) */}
            {isResumeLoading ? (
              <NeoGlassSection className="mb-6 flex items-center justify-center p-6 sm:p-8">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white/70" />
                <span className="ml-2 text-white/70 text-sm sm:text-base">Checking for existing resumes...</span>
              </NeoGlassSection>
            ) : resumeError ? (
              <NeoGlassSection className="mb-6 p-4 sm:p-6">
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <h3 className="font-medium text-sm sm:text-base">Error checking for existing resumes</h3>
                </div>
                <p className="mt-2 text-white/70 text-sm sm:text-base">We encountered an error while checking for your existing resumes. You can still create a new one.</p>
              </NeoGlassSection>
            ) : hasExistingResume ? (
              <NeoGlassSection className="mb-6 p-4 sm:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Your Shadow Resume</h2>
                    <p className="text-white/70 text-sm sm:text-base">You already have a resume that you can view, edit, or replace.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                    <Button
                      onClick={handleViewShadowResume}
                      variant="outline"
                      className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto justify-center"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                    <Button
                      onClick={handleEditShadowResume}
                      className="flex items-center bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black hover:shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Resume
                    </Button>
                  </div>
                </div>
              </NeoGlassSection>
            ) : null}

            {/* Main Content */}
            <NeoGlassSection className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 sm:mb-6 dark-tabs-list grid w-full grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0">
                  <TabsTrigger value="upload" className="dark-tabs-trigger text-xs sm:text-sm">
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Upload Resume</span>
                    <span className="sm:hidden">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="scratch" className="dark-tabs-trigger text-xs sm:text-sm">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create From Scratch</span>
                    <span className="sm:hidden">Create</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="dark-tabs-trigger text-xs sm:text-sm">
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Use Profile Data</span>
                    <span className="sm:hidden">Profile</span>
                  </TabsTrigger>
                </TabsList>

                {/* Upload Resume Tab */}
                <TabsContent value="upload" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Upload Your Resume</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Upload your existing resume document and Musk AI will automatically extract and organize your information.
                    </p>

                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-white/60 bg-white/10' 
                          : selectedFile 
                            ? 'border-white/30 bg-white/5' 
                            : uploadError 
                              ? 'border-red-400/40 bg-red-950/20' 
                              : 'border-white/20 bg-black/40 hover:bg-black/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('resume-file-input')?.click()}
                    >
                      <input 
                        type="file" 
                        id="resume-file-input"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      <div className="flex flex-col items-center justify-center gap-2">
                        {uploadError ? (
                          <>
                            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-red-400" />
                            <p className="font-medium text-red-400 mt-2 text-sm sm:text-base px-2">{uploadError}</p>
                            <p className="text-xs sm:text-sm text-white/60">Click or drag to try again</p>
                          </>
                        ) : selectedFile ? (
                          <>
                            <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/60" />
                            <p className="font-medium text-white mt-2 text-sm sm:text-base px-2">Selected: {selectedFile.name}</p>
                            <p className="text-xs sm:text-sm text-white/60">Click or drag to change selection</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/60" />
                            <p className="font-medium text-white mt-2 text-sm sm:text-base">Drag & drop or click to upload</p>
                            <p className="text-xs sm:text-sm text-white/60">Supported formats: PDF, DOC, DOCX</p>
                          </>
                        )}
                      </div>
                    </div>

                    {isLoading && (
                      <div className="space-y-2">
                        <div className="h-2 bg-white/10 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-white/60 text-center">
                          {uploadProgress < 100 ? 'Processing your resume...' : 'Complete! Redirecting...'}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
                      <Button
                        onClick={handleUploadResume}
                        disabled={!selectedFile || isLoading || !!uploadError}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Create From Scratch Tab */}
                <TabsContent value="scratch" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Create A New Resume</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Start with a blank canvas and build your resume step-by-step with our intuitive editor.
                    </p>

                    <div className="bg-black/40 rounded-lg p-4 sm:p-6 mt-4">
                      <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Resume Outline</h4>
                      <ul className="space-y-2 sm:space-y-3 text-white/80 text-sm sm:text-base">
                        <li className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">1</div>
                          Personal Information
                        </li>
                        <li className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">2</div>
                          Work Experience
                        </li>
                        <li className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">3</div>
                          Education
                        </li>
                        <li className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">4</div>
                          Skills
                        </li>
                        <li className="flex items-center">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm">5</div>
                          Projects & Achievements
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
                      <Button
                        onClick={handleCreateFromScratch}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                      >
                        Create Fresh Resume <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Use Profile Data Tab */}
                <TabsContent value="profile" className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Use Your Profile Data</h3>
                    <p className="text-white/70 text-sm sm:text-base">
                      Import data from your Brandentifier profile to quickly populate your resume.
                    </p>

                    <div className="bg-black/40 rounded-lg p-4 sm:p-6 mt-4">
                      <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4">Data That Will Be Imported</h4>
                      <ul className="space-y-2 sm:space-y-3 text-white/80 text-sm sm:text-base">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Personal Information (Name, Title, Contact Details)
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Professional Summary
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Work Experience
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Education History
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Skills & Expertise
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-2 sm:mr-3"></div>
                          Projects & Portfolio Items
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
                      <Button
                        onClick={handleCreateFromProfile}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105 w-full sm:w-auto"
                      >
                        Use Profile Data <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </NeoGlassSection>
          </NeoGlassLayout>
        </div>
      </div>
    </div>
  );
}