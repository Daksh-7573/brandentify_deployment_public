import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

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
        
        // Send to server
        const userId = 1; // This would ideally come from authenticated user
        await apiRequest('POST', '/api/resumes', {
          userId,
          fileName: file.name,
          fileData: base64Data
        });
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been successfully uploaded."
        });
        
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
            <div className="mt-4 flex gap-4">
              <label>
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  disabled={isUploading}
                >
                  Browse Files
                </Button>
              </label>
              {file && (
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Resume"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
