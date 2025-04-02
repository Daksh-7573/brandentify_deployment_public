import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface ProfileUploadProps {
  currentPhotoURL?: string | null;
  onImageSelected: (base64Image: string) => void;
  onCancel: () => void;
}

export function ProfileUpload({
  currentPhotoURL,
  onImageSelected,
  onCancel
}: ProfileUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default placeholder image when no image is selected
  const placeholderImage = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  
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

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }
        
        // Convert to base64
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error("Error processing image:", error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Save the selected image
  const handleSave = () => {
    if (selectedImage) {
      onImageSelected(selectedImage);
    }
  };

  // Remove the selected image
  const handleRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
        <img 
          src={selectedImage || currentPhotoURL || placeholderImage} 
          alt="Profile Preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        {selectedImage && (
          <button 
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          onClick={handleButtonClick}
          className="flex items-center gap-2"
        >
          <Camera size={16} />
          {selectedImage ? 'Change Photo' : 'Select Photo'}
        </Button>
        
        {selectedImage && (
          <Button 
            type="button" 
            variant="default"
            onClick={handleSave}
          >
            Save
          </Button>
        )}
        
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}