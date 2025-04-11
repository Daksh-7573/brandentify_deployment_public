import { useState, useRef, ChangeEvent, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  AlertDialog,
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
  // State for the image editing
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Default placeholder image 
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
  
  // Function to convert File to base64
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

  // Validate the image file
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

  // Open file picker
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process and save the selected image
  const handleSave = () => {
    if (!selectedImage || isUploading) return;
    
    try {
      const img = new Image();
      
      img.onload = () => {
        // Create a canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Could not create image processing context");
        }
        
        // Set up canvas dimensions for target size
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        
        // Calculate dimensions for square crop
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        // Draw the image to the canvas - simply crop and resize
        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,
          0, 0, TARGET_SIZE, TARGET_SIZE
        );
        
        // Convert to JPEG with high quality
        const processedImage = canvas.toDataURL('image/jpeg', 0.95);
        
        // Send to parent for saving
        onImageSelected(processedImage);
      };
      
      img.onerror = () => {
        setErrorMessage("Error loading image. Please try a different image.");
        setShowAlert(true);
      };
      
      img.src = selectedImage;
    } catch (error) {
      console.error("Error processing image:", error);
      setErrorMessage("Error processing image. Please try again.");
      setShowAlert(true);
    }
  };
  
  // Remove selected image
  const handleRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="w-full flex flex-col items-center gap-4">
        {/* Image Preview */}
        <div 
          className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {selectedImage ? (
              <img 
                ref={imageRef}
                src={selectedImage} 
                alt="Profile Preview"
                className="h-full w-full object-cover"
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
          
          {/* Remove button */}
          {selectedImage && (
            <button 
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
              aria-label="Remove image"
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
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