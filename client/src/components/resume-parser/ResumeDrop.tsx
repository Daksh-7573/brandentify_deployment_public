import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

interface ResumeDropProps {
  onResumeProcessed: (resumeData: any) => void;
  isLoading?: boolean;
}

export function ResumeDrop({ onResumeProcessed, isLoading = false }: ResumeDropProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const validateFile = (file: File) => {
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
        variant: "destructive"
      });
      return false;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const processResume = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error');
      return;
    }
    
    setUploadStatus('uploading');
    
    // Create FormData
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      // Upload progress simulation
      const uploadTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload to server
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(uploadTimer);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process resume');
      }
      
      setUploadProgress(100);
      setUploadStatus('processing');
      
      // Get the processed data
      const resumeData = await response.json();
      
      // Success
      setUploadStatus('success');
      onResumeProcessed(resumeData);
      
      toast({
        title: "Resume processed successfully",
        description: `Found ${Object.keys(resumeData).length} profile sections to review`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing resume:', error);
      setUploadStatus('error');
      setUploadProgress(0);
      
      toast({
        title: "Failed to process resume",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processResume(file);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processResume(file);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Drop & Define</CardTitle>
        <CardDescription>
          Upload your resume and let Musk define your professional profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          } transition-colors duration-200 cursor-pointer`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          aria-disabled={uploadStatus === 'uploading' || uploadStatus === 'processing' || isLoading}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing' || isLoading}
          />
          
          {uploadStatus === 'idle' && (
            <div className="py-4">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Drag & drop your resume here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to select a file (PDF, DOC, DOCX)
              </p>
              <Button variant="outline" className="mt-2">
                Select File
              </Button>
            </div>
          )}
          
          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <div className="py-6">
              <File className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-lg font-medium mb-2">
                {uploadStatus === 'uploading' ? 'Uploading resume...' : 'Processing resume...'}
              </p>
              <div className="w-full mt-4 mb-2">
                <Progress value={uploadProgress} className="h-2 w-full" />
              </div>
              <p className="text-sm text-muted-foreground">
                {uploadStatus === 'uploading' 
                  ? 'Please wait while we upload your file' 
                  : 'Musk is analyzing your resume'}
              </p>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="py-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium mb-2 text-green-500">
                Resume processed successfully
              </p>
              <p className="text-sm text-muted-foreground">
                Review the extracted information below
              </p>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="py-6">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-lg font-medium mb-2 text-destructive">
                Failed to process resume
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please try again with a different file
              </p>
              <Button variant="outline" className="mt-2">
                Select Another File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 text-sm text-muted-foreground">
        <div>Supported formats: PDF, DOC, DOCX</div>
        <div>Max file size: 10MB</div>
      </CardFooter>
    </Card>
  );
}