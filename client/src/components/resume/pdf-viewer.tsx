import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName = 'resume.pdf' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  // Load the PDF data directly
  useEffect(() => {
    console.log("PDFViewer mounted with fileUrl:", fileUrl);
    
    if (!fileUrl) {
      console.error("No fileUrl provided to PDFViewer");
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Directly fetch the PDF data
    fetch(fileUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Create an object URL from the blob
      const url = URL.createObjectURL(blob);
      setPdfData(url);
      setIsLoading(false);
      setHasError(false);
    })
    .catch(error => {
      console.error("Error fetching PDF:", error);
      setHasError(true);
      setIsLoading(false);
    });
    
    // Clean up function
    return () => {
      console.log("PDFViewer unmounting");
      // Revoke object URL if it exists to prevent memory leaks
      if (pdfData) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [fileUrl]);
  
  // Function to force reload the PDF
  const reloadPdf = () => {
    setIsLoading(true);
    
    // If we have an existing PDF URL, revoke it
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
      setPdfData(null);
    }
    
    // Fetch the PDF again with a cache-busting parameter
    const cacheBreaker = `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
    
    fetch(cacheBreaker, { 
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Create a new object URL from the blob
      const url = URL.createObjectURL(blob);
      setPdfData(url);
      setIsLoading(false);
      setHasError(false);
    })
    .catch(error => {
      console.error("Error reloading PDF:", error);
      setHasError(true);
      setIsLoading(false);
    });
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

  // Show error state
  if (hasError || !pdfData) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-red-50/50">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-medium">Unable to display PDF directly</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4 text-center max-w-sm">
          We're having trouble displaying your resume in the browser. Please download it to view.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <a 
            href={fileUrl} 
            download={fileName}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Resume</span>
          </a>
          <button
            onClick={reloadPdf}
            className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Display the PDF using an object tag (more compatible) with direct blob URL
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* The main PDF viewer */}
      <div className="flex-1 relative">
        <object
          data={pdfData}
          type="application/pdf"
          className="w-full h-full"
          title="Resume PDF"
        >
          <iframe 
            src={pdfData}
            className="w-full h-full border-0"
            style={{ backgroundColor: '#f8f9fa' }}
            title="Resume PDF Viewer (Fallback)"
          />
        </object>
      </div>
      
      {/* Controls bar */}
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
            href={pdfData} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-700 hover:text-primary flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            <span>Open</span>
          </a>
          
          <a 
            href={pdfData} 
            download={fileName}
            className="text-gray-700 hover:text-primary flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;