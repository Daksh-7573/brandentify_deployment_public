import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageCarouselProps {
  images: string[];
  storedImages?: string[];
  height?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  storedImages = [], 
  height = "400px" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeMediaUrls, setActiveMediaUrls] = useState<string[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  useEffect(() => {
    // Determine which set of images to use - remote URLs or localStorage keys
    if (images && images.length > 0) {
      console.log("Using mediaUrls for carousel:", images);
      setActiveMediaUrls(images);
    } else if (storedImages && storedImages.length > 0) {
      console.log("Using localStorage keys for carousel:", storedImages);
      // Convert localStorage keys to data URLs
      const dataUrls = storedImages.map(key => {
        const imageData = localStorage.getItem(key);
        return imageData || "";
      }).filter(url => url !== "");
      setActiveMediaUrls(dataUrls);
    } else {
      setActiveMediaUrls([]);
    }
  }, [images, storedImages]);
  
  // Return early if no images to display
  if (activeMediaUrls.length === 0) {
    return null;
  }
  
  // For single image, just display it without carousel controls
  if (activeMediaUrls.length === 1) {
    return (
      <div className="relative rounded-md overflow-hidden" style={{ height }}>
        <img
          src={activeMediaUrls[0]}
          alt="Media content"
          className="w-full h-full object-contain bg-black/5"
          onClick={() => {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/20 text-white hover:bg-black/30"
          onClick={() => {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }}
        >
          <Maximize size={18} />
        </Button>
      </div>
    );
  }
  
  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === activeMediaUrls.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? activeMediaUrls.length - 1 : prevIndex - 1
    );
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    
    if (difference > 50) {
      // Swipe left, show next image
      nextImage();
    } else if (difference < -50) {
      // Swipe right, show previous image
      prevImage();
    }
  };
  
  // Open lightbox with current index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  return (
    <>
      <div 
        className="relative rounded-md overflow-hidden"
        style={{ height }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={activeMediaUrls[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-contain bg-black/5"
          onClick={() => openLightbox(currentIndex)}
        />
        
        {/* Navigation buttons */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/20 text-white hover:bg-black/30"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft size={24} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/20 text-white hover:bg-black/30"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight size={24} />
          </Button>
        </div>
        
        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/20 text-white hover:bg-black/30"
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(currentIndex);
          }}
        >
          <Maximize size={18} />
        </Button>
        
        {/* Image indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {activeMediaUrls.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-4" : "bg-white/50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <div className="relative h-[80vh] w-full">
            <img
              src={activeMediaUrls[lightboxIndex]}
              alt={`Lightbox image ${lightboxIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {/* Lightbox navigation */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/20 text-white hover:bg-black/30"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => 
                    prev === 0 ? activeMediaUrls.length - 1 : prev - 1
                  );
                }}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/20 text-white hover:bg-black/30"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => 
                    prev === activeMediaUrls.length - 1 ? 0 : prev + 1
                  );
                }}
              >
                <ChevronRight size={24} />
              </Button>
            </div>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/20 text-white hover:bg-black/30"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={18} />
            </Button>
            
            {/* Image indicators in lightbox */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {activeMediaUrls.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === lightboxIndex ? "bg-primary w-4" : "bg-white/50"
                  }`}
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCarousel;