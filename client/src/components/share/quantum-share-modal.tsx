import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface QuantumShareModalProps {
  open: boolean;
  onClose: () => void;
  randomProfileLink: string;
}

export function QuantumShareModal({ open, onClose, randomProfileLink }: QuantumShareModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate share link with ref parameter
  const baseUrl = window.location.origin;
  const shareLink = user?.id 
    ? `${baseUrl}/r/${randomProfileLink}?ref=${user.id}`
    : `${baseUrl}/r/${randomProfileLink}`;

  const handleCopy = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share your Quantum Card to unlock premium templates",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!shareLink) return;

    const text = encodeURIComponent(
      `Check out my Quantum Card on Brandentify! 🚀`
    );
    const url = encodeURIComponent(shareLink);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-cyan-400" />
            Share Quantum Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info banner */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
            <p className="text-sm text-white/90">
              💎 <strong>Share to unlock!</strong> Each person who views your card unlocks a new premium Quantum Card template for you.
            </p>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Share Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs truncate text-white/80 overflow-x-auto">
                {shareLink}
              </div>
              <Button
                onClick={handleCopy}
                className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="bg-[#1DA1F2]/10 border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 text-white"
                onClick={() => shareOnSocial("twitter")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="bg-[#0077B5]/10 border-[#0077B5]/30 hover:bg-[#0077B5]/20 text-white"
                onClick={() => shareOnSocial("linkedin")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-white"
                onClick={() => shareOnSocial("whatsapp")}
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="bg-[#1877F2]/10 border-[#1877F2]/30 hover:bg-[#1877F2]/20 text-white"
                onClick={() => shareOnSocial("facebook")}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium mb-2 text-cyan-400">How it works:</h4>
            <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
              <li>Share your link with friends, colleagues, or on social media</li>
              <li>When someone opens your link, you unlock a premium template</li>
              <li>Continue sharing to unlock all 10 premium Quantum Card designs!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

