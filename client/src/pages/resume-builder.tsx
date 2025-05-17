import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { NeoGlassLayout, NeoGlassSection } from '@/components/layout/neo-glass-layout';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Database, ArrowRight } from 'lucide-react';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Upload and process the resume
  const handleUploadResume = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    
    // Create an interval to simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 300);
    
    try {
      // Prepare file for upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Upload the resume file
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Navigate to the resume editor with parsed data
      setTimeout(() => {
        navigate('/resume-editor');
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      clearInterval(progressInterval);
      setUploadProgress(0);
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

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        <div className="flex-1 overflow-auto">
          <NeoGlassLayout className="mt-3 mx-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Resume Builder</h1>
                  <p className="text-white/80 mt-1">
                    Create a professional resume by uploading your existing resume or starting from scratch
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Back to Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <NeoGlassSection className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 dark-tabs-list">
                  <TabsTrigger value="upload" className="dark-tabs-trigger">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Resume
                  </TabsTrigger>
                  <TabsTrigger value="scratch" className="dark-tabs-trigger">
                    <FileText className="w-4 h-4 mr-2" />
                    Create From Scratch
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="dark-tabs-trigger">
                    <Database className="w-4 h-4 mr-2" />
                    Use Profile Data
                  </TabsTrigger>
                </TabsList>

                {/* Upload Resume Tab */}
                <TabsContent value="upload" className="space-y-6 p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Upload Your Resume</h3>
                    <p className="text-white/70">
                      Upload your existing resume document and Musk AI will automatically extract and organize your information.
                    </p>

                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-white/60 bg-white/10' 
                          : selectedFile 
                            ? 'border-white/30 bg-white/5' 
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
                        <Upload className="h-12 w-12 text-white/60" />
                        {selectedFile ? (
                          <>
                            <p className="font-medium text-white mt-2">Selected: {selectedFile.name}</p>
                            <p className="text-sm text-white/60">Click or drag to change selection</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-white mt-2">Drag & drop or click to upload</p>
                            <p className="text-sm text-white/60">Supported formats: PDF, DOC, DOCX</p>
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

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleUploadResume}
                        disabled={!selectedFile || isLoading}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105"
                      >
                        {isLoading ? (
                          <>Processing...</>
                        ) : (
                          <>
                            Continue <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Create From Scratch Tab */}
                <TabsContent value="scratch" className="space-y-6 p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Create A New Resume</h3>
                    <p className="text-white/70">
                      Start with a blank canvas and build your resume step-by-step with our intuitive editor.
                    </p>

                    <div className="bg-black/40 rounded-lg p-6 mt-4">
                      <h4 className="text-lg font-medium text-white mb-4">Resume Outline</h4>
                      <ul className="space-y-3 text-white/80">
                        <li className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">1</div>
                          Personal Information
                        </li>
                        <li className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">2</div>
                          Work Experience
                        </li>
                        <li className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">3</div>
                          Education
                        </li>
                        <li className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">4</div>
                          Skills
                        </li>
                        <li className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">5</div>
                          Projects & Achievements
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleCreateFromScratch}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105"
                      >
                        Create Fresh Resume <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Use Profile Data Tab */}
                <TabsContent value="profile" className="space-y-6 p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Use Your Profile Data</h3>
                    <p className="text-white/70">
                      Import data from your Brandentifier profile to quickly populate your resume.
                    </p>

                    <div className="bg-black/40 rounded-lg p-6 mt-4">
                      <h4 className="text-lg font-medium text-white mb-4">Data That Will Be Imported</h4>
                      <ul className="space-y-3 text-white/80">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Personal Information (Name, Title, Contact Details)
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Professional Summary
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Work Experience
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Education History
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Skills & Expertise
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-white/60 mr-3"></div>
                          Projects & Portfolio Items
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleCreateFromProfile}
                        className="bg-gradient-to-r from-[#e0e0e0] to-[#ffffff] text-black font-medium hover:shadow-lg hover:scale-105"
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