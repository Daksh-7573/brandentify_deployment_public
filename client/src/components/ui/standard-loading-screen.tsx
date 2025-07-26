import robotGif from "@assets/Contact Candour_1753488336182.gif";

interface StandardLoadingScreenProps {
  message?: string;
  className?: string;
}

export function StandardLoadingScreen({ 
  message = "Welcome to Brandentifier", 
  className = "" 
}: StandardLoadingScreenProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-6 p-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
        {/* Cute robot animation */}
        <img 
          src={robotGif} 
          alt="Loading robot" 
          className="w-30 h-30 object-contain"
        />
        {/* Loading message */}
        <span className="text-xl font-semibold text-white text-center">{message}</span>
      </div>
    </div>
  );
}