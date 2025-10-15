import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { SiInstagram, SiFacebook, SiLinkedin } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  pulseId: number;
  pulseContent: string;
  pulseAuthor?: string;
}

export function SocialShareButtons({ pulseId, pulseContent, pulseAuthor }: SocialShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate shareable URL for the pulse
  const pulseUrl = `${window.location.origin}/pulse/${pulseId}`;
  
  // Create share text
  const shareText = pulseAuthor 
    ? `Check out this pulse from ${pulseAuthor} on Brandentifier` 
    : "Check out this pulse on Brandentifier";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pulseUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Pulse link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct web sharing, so we copy the link
    navigator.clipboard.writeText(pulseUrl);
    toast({
      title: "Link copied for Instagram!",
      description: "Paste the link in your Instagram story or bio",
    });
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pulseUrl)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pulseUrl)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
  };

  return (
    <div className="space-y-3">
      <div className="border-t border-gray-700/50 pt-4">
        <p className="text-gray-400 text-sm mb-3">Share on social media</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <SiInstagram className="h-5 w-5" />
            <span>Instagram</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <SiFacebook className="h-5 w-5" />
            <span>Facebook</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedInShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#095196] text-white font-medium transition-all duration-200 hover:scale-105"
          >
            <SiLinkedin className="h-5 w-5" />
            <span>LinkedIn</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-white font-medium transition-all duration-200 hover:scale-105"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-5 w-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
