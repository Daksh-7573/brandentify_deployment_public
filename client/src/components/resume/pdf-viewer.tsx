import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Loader2 } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName = 'resume.pdf' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showObjectElement, setShowObjectElement] = useState(false);

  // Add console logs to track component lifecycle and props
  useEffect(() => {
    console.log("PDFViewer mounted with fileUrl:", fileUrl);
    
    if (!fileUrl) {
      console.error("No fileUrl provided to PDFViewer");
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Check if the PDF is accessible
    const checkPdfAccess = async () => {
      try {
        console.log("Checking PDF access for:", fileUrl);
        setIsLoading(true);
        
        // Try with simple fetch first
        const response = await fetch(fileUrl, { 
          method: 'HEAD',
          // Add cache busting query param
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
          console.error("PDF access check failed with status:", response.status);
          setHasError(true);
        } else {
          console.log("PDF access check successful");
          // Try with object element first as it's more compatible
          setShowObjectElement(true);
        }
      } catch (error) {
        console.error("Error checking PDF access:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkPdfAccess();
    
    // Clean up function
    return () => {
      console.log("PDFViewer unmounting");
    };
  }, [fileUrl]);

  const handleLoad = () => {
    console.log("PDF loaded successfully");
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLObjectElement | HTMLIFrameElement>) => {
    console.error("Error loading PDF in viewer:", e);
    setHasError(true);
    setIsLoading(false);
  };

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-center font-medium">Loading your resume...</p>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          This may take a moment
        </p>
      </div>
    );
  }

  // Show error state with fallback options
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <FileText className="h-16 w-16 text-primary mx-auto" />
        <h3 className="text-lg font-medium mt-4">Your Resume is Ready</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2 text-center">
          To view your resume, please use one of the options below:
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

  // Show PDF using object tag (better browser compatibility)
  if (showObjectElement) {
    return (
      <div className="relative h-full w-full">
        <object
          data={`${fileUrl}?t=${Date.now()}`} // Add timestamp to prevent caching
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleLoad}
          onError={handleError as any}
        >
          <p className="text-center p-4">
            Your browser can't display PDFs directly. 
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary underline ml-1"
            >
              View the PDF here
            </a>
          </p>
        </object>
        
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
  }

  // Fallback to iframe if object tag doesn't work
  return (
    <div className="relative h-full w-full">
      <iframe
        src={`${fileUrl}?t=${Date.now()}`} // Add timestamp to prevent caching
        className="w-full h-full border-0"
        title="Resume PDF"
        onLoad={handleLoad}
        onError={handleError as any}
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