import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnifiedMediaUploadProps {
  mediaUrls: string[];
  onMediaUpload: (urls: string[]) => void;
  onRemoveMedia: (index: number) => void;
  maxMediaCount?: number;
  imageMaxSize?: number;
  videoMaxSize?: number;
}

export function UnifiedMediaUpload({
  mediaUrls,
  onMediaUpload,
  onRemoveMedia,
  maxMediaCount = 10,
  imageMaxSize = 20 * 1024 * 1024,
  videoMaxSize = 25 * 1024 * 1024,
}: UnifiedMediaUploadProps) {
  const { toast } = useToast();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Check total file count limit
    if (filesArray.length + mediaUrls.length > maxMediaCount) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${maxMediaCount} files total.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = filesArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      // Check if file is image or video
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid File Type",
          description: `"${file.name}" is not an image or video file.`,
          variant: "destructive",
        });
        return false;
      }

      // Check file size based on type
      if (isImage && file.size > imageMaxSize) {
        toast({
          title: "Image Too Large",
          description: `"${file.name}" exceeds the ${imageMaxSize / (1024 * 1024)}MB limit.`,
          variant: "destructive",
        });
        return false;
      }

      if (isVideo && file.size > videoMaxSize) {
        toast({
          title: "Video Too Large",
          description: `"${file.name}" exceeds the ${videoMaxSize / (1024 * 1024)}MB limit. Keep videos under 2 minutes.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const formData = new FormData();
      
      // Get user ID from session storage
      const userIdStr = sessionStorage.getItem("userId");
      if (!userIdStr) {
        throw new Error("User not logged in");
      }

      formData.append("userId", userIdStr);
      validFiles.forEach((file) => {
        formData.append("media", file);
      });

      toast({
        title: "Uploading",
        description: "Uploading media files...",
      });

      const response = await fetch("/api/pulses/upload-media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Media upload successful:", data);

      if (data.mediaUrls && data.mediaUrls.length > 0) {
        onMediaUpload([...mediaUrls, ...data.mediaUrls]);

        toast({
          title: "Upload Complete",
          description: "Files uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading media:", error);

      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }

      let errorMessage = "Failed to upload media";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String(error.message);
      }

      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    // Reset input
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-1 sm:space-y-2">
        <Label htmlFor="unified-media" className="text-spotify-white text-sm sm:text-base">
          Upload Media (Images or Videos)
        </Label>
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <Input
            ref={mediaInputRef}
            id="unified-media"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-spotify-white border border-spotify-glass-border rounded-lg text-sm sm:text-base"
            style={{
              lineHeight: "1.5",
            }}
            data-testid="input-unified-media-upload"
          />
          <p className="text-xs sm:text-sm text-spotify-light-gray">
            Upload images (up to {imageMaxSize / (1024 * 1024)}MB each) or videos (up to {videoMaxSize / (1024 * 1024)}MB each)
          </p>
        </div>
      </div>

      {mediaUrls.length > 0 && (
        <div className="space-y-2 sm:space-y-3 mt-4">
          <h4 className="text-sm font-medium text-spotify-white">
            Uploaded Files ({mediaUrls.length}/{maxMediaCount})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {mediaUrls.map((url, index) => {
              const isVideo = url.toLowerCase().match(/\.(mp4|webm|mov|mkv)$/i);
              return (
                <div key={index} className="relative group">
                  {isVideo ? (
                    <div className="aspect-video bg-spotify-glass-bg rounded-lg border border-spotify-glass-border flex items-center justify-center">
                      <span className="text-spotify-light-gray text-xs">Video</span>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-spotify-glass-border"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMedia(index)}
                    className="absolute top-1 right-1 h-7 w-7 bg-red-500/80 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-remove-media-${index}`}
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
