import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface UnifiedMediaUploadProps {
  mediaUrls: string[];
  onMediaUpload: (urls: string[]) => void;
  onRemoveMedia: (index: number) => void;
  userId?: number;
  maxMediaCount?: number;
  maxImageCount?: number;
  maxVideoCount?: number;
  imageMaxSize?: number;
  videoMaxSize?: number;
}

export function UnifiedMediaUpload({
  mediaUrls,
  onMediaUpload,
  onRemoveMedia,
  userId: propUserId,
  maxMediaCount = 10,
  maxImageCount = 5,
  maxVideoCount = 1,
  imageMaxSize = 20 * 1024 * 1024,
  videoMaxSize = 25 * 1024 * 1024,
}: UnifiedMediaUploadProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
  // Use prop userId if provided, otherwise get from auth context
  const userId = propUserId ?? user?.id;

  const isVideoUrl = (url: string): boolean => {
    return url.toLowerCase().match(/\.(mp4|webm|mov|mkv|avi)$/i) !== null ||
           url.includes('video');
  };

  const countExistingMedia = () => {
    let imageCount = 0;
    let videoCount = 0;
    mediaUrls.forEach(url => {
      if (isVideoUrl(url)) {
        videoCount++;
      } else {
        imageCount++;
      }
    });
    return { imageCount, videoCount };
  };

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

    // Count existing media by type
    const { imageCount: existingImages, videoCount: existingVideos } = countExistingMedia();

    // Separate files by type and count them
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    
    filesArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        imageFiles.push(file);
      } else if (file.type.startsWith("video/")) {
        videoFiles.push(file);
      }
    });

    // Block mixing images and videos - must be one or the other
    const hasNewImages = imageFiles.length > 0;
    const hasNewVideos = videoFiles.length > 0;
    
    if (hasNewImages && hasNewVideos) {
      toast({
        title: "Cannot Mix Media Types",
        description: "Please upload either images OR a video, not both at once.",
        variant: "destructive",
      });
      return;
    }

    // If there are existing images, don't allow adding videos and vice versa
    if (hasNewVideos && existingImages > 0) {
      toast({
        title: "Cannot Mix Media Types",
        description: "You already have images. Remove them first to upload a video.",
        variant: "destructive",
      });
      return;
    }

    if (hasNewImages && existingVideos > 0) {
      toast({
        title: "Cannot Mix Media Types",
        description: "You already have a video. Remove it first to upload images.",
        variant: "destructive",
      });
      return;
    }

    // Check image count limit
    if (imageFiles.length + existingImages > maxImageCount) {
      toast({
        title: "Too Many Images",
        description: `You can only upload up to ${maxImageCount} images. You already have ${existingImages}.`,
        variant: "destructive",
      });
      return;
    }

    // Check video count limit
    if (videoFiles.length + existingVideos > maxVideoCount) {
      toast({
        title: "Too Many Videos",
        description: `You can only upload ${maxVideoCount} video${maxVideoCount > 1 ? 's' : ''}. You already have ${existingVideos}.`,
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

    // Get user ID from prop - no sessionStorage fallback for security
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload media.",
        variant: "destructive",
      });
      return;
    }
    const userIdStr = userId.toString();

    try {
      const formData = new FormData();
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
        <Label htmlFor="unified-media" className="text-white text-sm sm:text-base">
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
            className="w-full min-h-[48px] sm:min-h-[56px] px-3 sm:px-4 py-2 sm:py-3 bg-[rgba(18,18,18,0.95)] text-white border border-white/20 rounded-lg text-sm sm:text-base"
            style={{
              lineHeight: "1.5",
              display: "flex",
              alignItems: "center",
            }}
            data-testid="input-unified-media-upload"
          />
          <p className="text-xs text-gray-400">
            Upload {maxImageCount} images (max {imageMaxSize / (1024 * 1024)}MB each) <strong>or</strong> {maxVideoCount} video (max {videoMaxSize / (1024 * 1024)}MB) - not both
          </p>
        </div>
      </div>

      {mediaUrls.length > 0 && (
        <div className="space-y-2 sm:space-y-3 mt-4">
          <h4 className="text-sm font-medium text-white">
            Uploaded Files ({mediaUrls.length}/{maxMediaCount})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {mediaUrls.map((url, index) => {
              const isVideo = isVideoUrl(url);
              return (
                <div key={index} className="relative group">
                  {isVideo ? (
                    <div className="relative border border-white/20 rounded-md overflow-hidden">
                      <video
                        src={url}
                        controls
                        className="w-full aspect-video object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveMedia(index)}
                        className="absolute top-2 right-2 h-6 w-6 bg-black/60 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-media-${index}`}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full aspect-video object-cover rounded-md border border-white/20"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 h-6 w-6 neo-glass-button neo-glass-icon-button opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => onRemoveMedia(index)}
                        data-testid={`button-remove-media-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
