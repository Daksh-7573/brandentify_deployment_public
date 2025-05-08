import { useEffect, useState } from 'react';

/**
 * Hook to detect if the device might support Vision Pro-like features
 * 
 * This is a best-effort detection since browser APIs for Vision Pro
 * are still evolving. It detects capabilities that suggest the
 * device might support spatial computing features.
 */
export function useVisionProCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasVisionProFeatures: false,
    hasPrecisePointer: false,
    hasHighPixelDensity: false,
    hasWideColorGamut: false,
    isPotentialVisionPro: false
  });
  
  useEffect(() => {
    const checkCapabilities = () => {
      // Detect high-precision pointer device (required for eye tracking)
      const hasPrecisePointer = window.matchMedia('(pointer: fine)').matches;
      
      // Detect high pixel density display (Vision Pro has extremely high-res displays)
      const hasHighPixelDensity = window.devicePixelRatio >= 2;
      
      // Wide color gamut support (Vision Pro supports P3 color space)
      const hasWideColorGamut = window.matchMedia('(color-gamut: p3)').matches;
      
      // Check if it might be macOS (Vision Pro runs on a macOS-based system)
      const isMacOS = /Mac/.test(navigator.platform);
      
      // This is a very simple heuristic - a more accurate detection would
      // involve checking for Vision Pro specific APIs as they become available
      const isPotentialVisionPro = 
        hasPrecisePointer && 
        hasHighPixelDensity && 
        (hasWideColorGamut || isMacOS);
        
      // Set all capability flags
      setCapabilities({
        hasVisionProFeatures: isPotentialVisionPro,
        hasPrecisePointer,
        hasHighPixelDensity,
        hasWideColorGamut,
        isPotentialVisionPro
      });
    };
    
    checkCapabilities();
    
    // Recheck if window is resized (might indicate view change)
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);
  
  return capabilities;
}

/**
 * Component to provide Vision Pro detection capabilities to children
 */
interface VisionProDetectorProps {
  children: (capabilities: ReturnType<typeof useVisionProCapabilities>) => React.ReactNode;
}

export function VisionProDetector({ children }: VisionProDetectorProps) {
  const capabilities = useVisionProCapabilities();
  return <>{children(capabilities)}</>;
}

export default VisionProDetector;