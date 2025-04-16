import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  storedImages?: string[];
  height?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images = [], 
  storedImages = [],
  height = "400px" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Combine remote and locally stored images
  const allImages = [...images, ...storedImages];
  
  // Safety check - don't render if no images
  if (!allImages.length) return null;
  
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const openLightbox = () => {
    setShowLightbox(true);
  };
  
  const closeLightbox = () => {
    setShowLightbox(false);
  };

  return (
    <div className="relative group">
      {/* Main carousel display */}
      <div 
        className="overflow-hidden rounded-lg relative"
        style={{ height }}
      >
        <div 
          className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden"
          onClick={openLightbox}
        >
          <img 
            src={allImages[currentIndex]} 
            alt={`Image ${currentIndex + 1}`}
            className="object-contain w-full h-full cursor-pointer hover:scale-[1.01] transition-transform"
          />
          
          {/* Expand button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 rounded-full bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={openLightbox}
          >
            <Maximize2 size={20} />
          </Button>
        </div>
        
        {/* Navigation controls */}
        {allImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft size={24} />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight size={24} />
            </Button>
            
            {/* Indicator dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentIndex === index 
                      ? 'bg-white w-4' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={closeLightbox}>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 border-none bg-transparent shadow-none">
          <div className="relative h-full flex items-center justify-center">
            <img 
              src={allImages[currentIndex]} 
              alt={`Image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Close button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 rounded-full bg-black/20 text-white hover:bg-black/40"
              onClick={closeLightbox}
            >
              <X size={24} />
            </Button>
            
            {/* Navigation in lightbox */}
            {allImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
                  onClick={handlePrevious}
                >
                  <ChevronLeft size={30} />
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white hover:bg-black/40"
                  onClick={handleNext}
                >
                  <ChevronRight size={30} />
                </Button>
                
                {/* Indicator dots in lightbox */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        currentIndex === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageCarousel;