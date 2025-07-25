import { Loader2 } from "lucide-react";

interface StandardLoadingScreenProps {
  message?: string;
  className?: string;
}

export function StandardLoadingScreen({ 
  message = "Loading...", 
  className = "" 
}: StandardLoadingScreenProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
        <span className="text-lg font-medium text-white mt-4 block">{message}</span>
      </div>
    </div>
  );
}