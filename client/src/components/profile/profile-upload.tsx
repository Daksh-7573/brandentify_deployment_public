import { useState, useRef, ChangeEvent, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileUploadProps {
  currentPhotoURL?: string | null;
  onImageSelected: (base64Image: string) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

// Constants for image upload requirements
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TARGET_SIZE = 400; // 400x400px
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ProfileUpload({
  currentPhotoURL,
  onImageSelected,
  onCancel,
  isUploading = false
}: ProfileUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Default placeholder image when no image is selected
  const placeholderImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  
  // Reset the editing state when a new image is selected
  useEffect(() => {
    if (selectedImage) {
      setZoomLevel(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [selectedImage]);

  // Function to convert File to base64 string
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Function to validate image file
  const validateImage = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type. Please upload a JPG, PNG, or WebP image.`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit. Please upload a smaller image.`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file
        const error = validateImage(file);
        if (error) {
          setErrorMessage(error);
          setShowAlert(true);
          return;
        }
        
        // Convert to base64
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error("Error processing image:", error);
        setErrorMessage("Error processing image. Please try again.");
        setShowAlert(true);
      }
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Save the selected image with applied transformations
  const handleSave = () => {
    if (selectedImage && imageRef.current) {
      // Create a canvas to apply transformations and crop
      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the image with transformations
        ctx.save();
        ctx.translate(TARGET_SIZE / 2, TARGET_SIZE / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(-TARGET_SIZE / 2 + offsetX, -TARGET_SIZE / 2 + offsetY);
        
        const img = new Image();
        img.src = selectedImage;
        
        // Draw the image and ensure it's center-cropped
        const size = Math.min(img.width, img.height);
        const offsetSrcX = (img.width - size) / 2;
        const offsetSrcY = (img.height - size) / 2;
        
        ctx.drawImage(
          img, 
          offsetSrcX, offsetSrcY, size, size, 
          0, 0, TARGET_SIZE, TARGET_SIZE
        );
        
        ctx.restore();
        
        // Get the final image as base64
        const processedImage = canvas.toDataURL('image/jpeg', 0.9);
        onImageSelected(processedImage);
      }
    }
  };

  // Remove the selected image
  const handleRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mouse/touch event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({x: e.clientX, y: e.clientY});
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({x: e.touches[0].clientX, y: e.touches[0].clientY});
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoomLevel;
      const dy = (e.clientY - dragStart.y) / zoomLevel;
      setOffsetX(prev => prev + dx);
      setOffsetY(prev => prev + dy);
      setDragStart({x: e.clientX, y: e.clientY});
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches.length === 1) {
      const dx = (e.touches[0].clientX - dragStart.x) / zoomLevel;
      const dy = (e.touches[0].clientY - dragStart.y) / zoomLevel;
      setOffsetX(prev => prev + dx);
      setOffsetY(prev => prev + dy);
      setDragStart({x: e.touches[0].clientX, y: e.touches[0].clientY});
    }
  }, [isDragging, dragStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom and rotation handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleRotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  const handleRotateCounterClockwise = () => setRotation(prev => (prev - 90 + 360) % 360);

  return (
    <>
      <div className="w-full flex flex-col items-center gap-4">
        {/* Image Preview with editable area */}
        <div 
          ref={imageContainerRef}
          className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: selectedImage ? 'move' : 'default' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {selectedImage ? (
              <img 
                ref={imageRef}
                src={selectedImage} 
                alt="Profile Preview"
                className="max-w-none"
                style={{ 
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
                  transformOrigin: 'center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                draggable={false}
              />
            ) : (
              <img 
                src={currentPhotoURL || placeholderImage} 
                alt="Current Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderImage;
                }}
              />
            )}
          </div>
          
          {/* Image Controls Overlay */}
          {selectedImage && (
            <>
              <button 
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X size={18} />
              </button>
              
              <div className="absolute left-1/2 top-2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                Drag to reposition
              </div>
            </>
          )}
        </div>
        
        {/* Image editing controls */}
        {selectedImage && (
          <div className="w-full max-w-md space-y-2 bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Zoom</span>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="h-7 w-7"
                >
                  <ZoomOut size={14} />
                </Button>
                <Slider
                  value={[zoomLevel * 100]}
                  min={50}
                  max={200}
                  step={5}
                  className="w-32"
                  onValueChange={(values) => setZoomLevel(values[0] / 100)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2}
                  className="h-7 w-7"
                >
                  <ZoomIn size={14} />
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Rotate</span>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRotateCounterClockwise}
                  className="h-7 w-7"
                >
                  <RotateCcw size={14} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRotateClockwise}
                  className="h-7 w-7"
                >
                  <RotateCw size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
        />
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleButtonClick}
            className="flex items-center gap-2"
            disabled={isUploading}
          >
            <Camera size={16} />
            {selectedImage ? 'Change Photo' : 'Select Photo'}
          </Button>
          
          {selectedImage && (
            <Button 
              type="button" 
              variant="default"
              onClick={handleSave}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </Button>
          )}
          
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center max-w-sm">
          <p>Recommended: professional photo with clear background and good lighting.</p>
          <p className="mt-1">Square crop (1:1), max 5MB, formats: JPG, PNG, WebP.</p>
        </div>
      </div>
      
      {/* Error Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Image Upload Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}