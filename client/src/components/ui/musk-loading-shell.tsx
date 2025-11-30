import { useState, useEffect } from "react";

interface MuskLoadingShellProps {
  className?: string;
}

const LightweightSpinner = ({ size = "w-12 h-12" }: { size?: string }) => (
  <div className={`${size} relative`}>
    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
  </div>
);

export function MuskLoadingShell({ className = "" }: MuskLoadingShellProps) {
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGif(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 ${className}`}>
      <div className="flex flex-col items-center">
        {showGif ? (
          <img 
            src="/Banner AI Blockchain_1764369150391.gif"
            alt="" 
            className="w-48 h-48 object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <LightweightSpinner size="w-24 h-24" />
        )}
      </div>
    </div>
  );
}

export function MuskLoadingCompact() {
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGif(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {showGif ? (
        <img 
          src="/Banner AI Blockchain_1764369150391.gif"
          alt="" 
          className="w-24 h-24 object-contain"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <LightweightSpinner size="w-12 h-12" />
      )}
    </div>
  );
}

export default MuskLoadingShell;
