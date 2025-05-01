import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName = 'resume.pdf' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if the PDF is accessible by making a HEAD request
    const checkPdfAccess = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (!response.ok) {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error checking PDF access:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkPdfAccess();
  }, [fileUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-center">Loading PDF...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <FileText className="h-16 w-16 text-primary mx-auto" />
        <h3 className="text-lg font-medium mt-4">Your Resume is Ready</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
          The PDF cannot be displayed directly in the browser, but you can view or download it.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-primary text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Resume</span>
          </a>
          <a 
            href={fileUrl} 
            download={fileName}
            className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Using an iframe for direct PDF display with fallback */}
      <iframe
        src={fileUrl}
        className="w-full h-full border-0"
        title="Resume PDF"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
      
      {/* Floating action buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
          title="Open in new tab"
        >
          <Eye className="h-4 w-4" />
        </a>
        <a 
          href={fileUrl} 
          download={fileName}
          className="bg-white border border-gray-200 text-gray-800 p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="Download PDF"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;