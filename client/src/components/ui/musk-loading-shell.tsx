import bannerAnimationPath from "@assets/Banner AI Blockchain_1764369150391.gif";

interface MuskLoadingShellProps {
  className?: string;
}

export function MuskLoadingShell({ className = "" }: MuskLoadingShellProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 ${className}`}>
      <div className="flex flex-col items-center">
        <img 
          src={bannerAnimationPath} 
          alt="" 
          className="w-48 h-48 object-contain"
        />
      </div>
    </div>
  );
}

export function MuskLoadingCompact() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <img 
        src={bannerAnimationPath} 
        alt="" 
        className="w-24 h-24 object-contain"
      />
    </div>
  );
}

export default MuskLoadingShell;
