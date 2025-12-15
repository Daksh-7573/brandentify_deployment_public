import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Share2, Users, Award } from "lucide-react";
import { useReferralLink, useReferralStats, useReferralStatus } from "@/hooks/use-referral";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const { data: referralLink, refetch: refetchLink, isLoading: isLoadingLink } = useReferralLink();
  const stats = useReferralStats();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // Refetch referral status and link when modal opens
  useEffect(() => {
    if (open) {
      console.log('[ShareModal] Modal opened, refetching data...');
      // Refetch both queries to get fresh data
      queryClient.refetchQueries({ queryKey: ['/api/referral/status'] });
      queryClient.refetchQueries({ queryKey: ['/api/referral/generate-link'] });
      refetchLink();
    }
  }, [open, queryClient, refetchLink]);

  // Track loading state from both sources
  const isLoadingStats = stats.isLoading;

  const handleCopy = async () => {
    if (!referralLink?.link) return;

    try {
      await navigator.clipboard.writeText(referralLink.link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with friends to unlock rewards",
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
    if (!referralLink?.link) return;

    const text = encodeURIComponent(
      "Join me on Brandentifier - the AI-powered career platform! Use my referral link to unlock exclusive features."
    );
    const url = encodeURIComponent(referralLink.link);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=550,height=450");
    }
  };

  const referralsNeeded = 6 - stats.totalReferrals;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 border-white/10 backdrop-blur-xl text-white overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            Share & Unlock Rewards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          {/* Progress Section */}
          <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Your Progress</span>
              </div>
              {isLoadingStats ? (
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-2xl font-bold text-purple-300">
                  {stats.totalReferrals}/6
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
                style={{
                  width: isLoadingStats ? '0%' : `${Math.min((stats.totalReferrals / 6) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-400" />
                <span className={`${isLoadingStats ? 'text-white/40' : 'text-white/80'}`}>
                  {stats.unlockedCards}/{stats.totalCards} Cards Unlocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-pink-400" />
                <span className={`${isLoadingStats ? 'text-white/40' : 'text-white/80'}`}>
                  {stats.unlockedPortfolios}/{stats.totalPortfolios} Portfolios
                  Unlocked
                </span>
              </div>
            </div>

            {referralsNeeded > 0 && (
              <p className={`mt-4 text-sm text-center ${isLoadingStats ? 'text-white/40' : 'text-white/70'}`}>
                {referralsNeeded === 1
                  ? "Just 1 more referral to unlock everything!"
                  : `${referralsNeeded} more referrals to unlock all rewards`}
              </p>
            )}
          </div>

          {/* Referral Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Referral Link
            </label>
            <div className="flex gap-2">
              {isLoadingLink ? (
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="h-5 bg-white/10 rounded animate-pulse" />
                </div>
              ) : (
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-sm truncate text-white/80">
                  {referralLink?.link ? referralLink.link : 'Unable to load link'}
                </div>
              )}
              <Button
                onClick={handleCopy}
                disabled={!referralLink?.link || isLoadingLink}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                data-testid="button-copy-referral-link"
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
                data-testid="button-share-twitter"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="bg-[#0077B5]/10 border-[#0077B5]/30 hover:bg-[#0077B5]/20 text-white"
                onClick={() => shareOnSocial("linkedin")}
                data-testid="button-share-linkedin"
              >
                <Share2 className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="bg-[#25D366]/10 border-[#25D366]/30 hover:bg-[#25D366]/20 text-white"
                onClick={() => shareOnSocial("whatsapp")}
                data-testid="button-share-whatsapp"
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="bg-[#0088cc]/10 border-[#0088cc]/30 hover:bg-[#0088cc]/20 text-white"
                onClick={() => shareOnSocial("telegram")}
                data-testid="button-share-telegram"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Telegram
              </Button>
            </div>
          </div>

          {/* Rewards Info */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">How It Works</h4>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Each friend who joins unlocks 1 Quantum Card + 2 Portfolio Layouts</li>
                  <li>• No duplicates - you always get something new!</li>
                  <li>• 6 referrals = unlock all 12 cards & 23 portfolios</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            data-testid="button-close-share-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
