import muskAnimationPath from "@assets/Contact Candour (1)_1764368703420.gif";

interface MuskLoadingShellProps {
  message?: string;
  className?: string;
}

export function MuskLoadingShell({ message = "Loading...", className = "" }: MuskLoadingShellProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 ${className}`}>
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <img 
            src={muskAnimationPath} 
            alt="Loading..." 
            className="w-32 h-32 object-contain rounded-full"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 animate-pulse" />
        </div>
        <p className="text-white/70 text-sm font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function MuskLoadingCompact({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <img 
        src={muskAnimationPath} 
        alt="Loading..." 
        className="w-20 h-20 object-contain rounded-full"
      />
      {message && <p className="text-white/60 text-xs">{message}</p>}
    </div>
  );
}

export default MuskLoadingShell;
