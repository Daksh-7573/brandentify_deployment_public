import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Loader2, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName = 'resume.pdf' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const timestamp = Date.now(); // Cache busting
  
  // Add debugging info
  useEffect(() => {
    console.log("PDFViewer mounted with fileUrl:", fileUrl);
    
    if (!fileUrl) {
      console.error("No fileUrl provided to PDFViewer");
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Create a timestamp-based URL to prevent caching issues
    const url = `${fileUrl}?t=${timestamp}`;
    setEmbedUrl(url);
    
    // Use direct iframe technique for better PDF rendering
    setIsLoading(false);
    
    // Clean up function
    return () => {
      console.log("PDFViewer unmounting");
    };
  }, [fileUrl, timestamp]);
  
  // Function to force reload the PDF
  const reloadPdf = () => {
    setIsLoading(true);
    const newTimestamp = Date.now();
    setEmbedUrl(`${fileUrl}?t=${newTimestamp}`);
    setTimeout(() => setIsLoading(false), 500);
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

  // A simpler approach using a direct embedded iframe
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* The main PDF viewer */}
      <div className="flex-1 relative">
        <iframe 
          src={embedUrl}
          className="w-full h-full border-0"
          style={{ backgroundColor: '#f8f9fa' }}
          title="Resume PDF Viewer"
        />
      </div>
      
      {/* Better controls at the bottom */}
      <div className="flex items-center justify-between bg-white border-t p-2">
        <div className="text-sm text-muted-foreground">
          {fileName}
        </div>
        <div className="flex gap-2">
          <button
            onClick={reloadPdf}
            className="text-gray-700 hover:text-primary flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload</span>
          </button>
          
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-700 hover:text-primary flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            <span>Open</span>
          </a>
          
          <a 
            href={fileUrl} 
            download={fileName}
            className="text-gray-700 hover:text-primary flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>
      
      {/* Fallback message if iframe doesn't load properly */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm pointer-events-auto">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-center">Having trouble viewing?</h3>
          <p className="text-sm text-muted-foreground my-3 text-center">
            If the PDF isn't displaying correctly, you can:
          </p>
          <div className="flex flex-col gap-2">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-primary text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View in New Tab</span>
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
      </div>
    </div>
  );
};

export default PDFViewer;