import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Info, Download, Share2, Check, Loader2, Lock, Gift } from "lucide-react";
import { UserData } from "@/types/user";
import VisitingCardPreview from "./visiting-card-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useReferralStatus } from "@/hooks/use-referral";
import { ShareModal } from "@/components/referral/share-modal";

// Card type options
const CARD_TYPES = [
  { id: "professional", name: "Professional", description: "Clean and professional business card design" },
  { id: "quantum", name: "Quantum Tech", description: "Futuristic tech-inspired holographic design for tech professionals" },
  { id: "3d-animated", name: "3D Animated", description: "Interactive 3D hover effects" },
  { id: "holographic", name: "Holographic Glass", description: "Modern transparent design" },
  { id: "neoglow", name: "NeoGlow", description: "Dark mode design with electric neon elements" },
  { id: "creative", name: "Creative", description: "Colorful artistic layout" },
  { id: "artistic", name: "Artistic", description: "Hand-drawn watercolor style" },
];

interface VisitingCardBuilderProps {
  userData: UserData;
  selectedCardType: string;
  onCardTypeSelect: (cardType: string) => void;
  isPremium?: boolean;
  canAccessCard?: (cardType: string) => boolean;
  canAccessVisitingCard?: (cardType: string) => any;
}

const VisitingCardBuilder: React.FC<VisitingCardBuilderProps> = ({
  userData,
  selectedCardType,
  onCardTypeSelect,
  isPremium = true,
  canAccessCard = () => true,
  canAccessVisitingCard,
}) => {
  // Set default card type if none selected
  const [activeTab, setActiveTab] = useState(selectedCardType || "professional");
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(selectedCardType === userData.visitingCardType);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();
  const { data: referralStatus, isLoading: isLoadingReferral } = useReferralStatus();
  
  // Set up a loading effect when first mounting the component
  useEffect(() => {
    // Start with loading state
    setIsLoading(true);
    
    // Simulate progressive loading with a staged timeout
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds delay to simulate loading of profile details
    
    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Check if a card is locked
  const isCardLocked = (cardId: string): boolean => {
    if (!referralStatus) return false;
    const card = referralStatus.quantumCards.find((c) => c.id === cardId);
    return card?.locked ?? false;
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (!canAccessCard(value)) {
      toast({
        title: "Premium Feature",
        description: "This card design is only available for Premium members. Upgrade to unlock all card designs!",
        variant: "default",
      });
      return;
    }
    if (isCardLocked(value)) {
      setShowShareModal(true);
      toast({
        title: "Card Locked",
        description: "Share Brandentifier with friends to unlock this design!",
        variant: "default",
      });
      return;
    }
    setActiveTab(value);
    setIsFinalized(value === userData.visitingCardType);
    onCardTypeSelect(value);
  };

  // Handle finalizing the selected card
  const handleFinalizeCard = async () => {
    setIsSaving(true);
    try {
      // Save the selected card type to the user profile
      await apiRequest('PUT', `/api/users/${userData.id}`, { visitingCardType: activeTab });
      
      setIsFinalized(true);
      toast({
        title: "Quantum Card style saved!",
        description: "Your Quantum Card style has been set and will be visible to your connections.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving card type:", error);
      toast({
        title: "Error saving Quantum Card style",
        description: "Unable to save your Quantum Card style. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle card download (placeholder functionality)
  const handleDownload = () => {
    alert("Download functionality will be implemented in the next update!");
  };

  // Handle card sharing
  const handleShare = async () => {
    try {
      // Extract user ID with validation
      let userId: string | number = '';
      
      if (userData.id === undefined || userData.id === null) {
        throw new Error("User ID is missing");
      }
      
      // Always prefer the numeric ID for sharing
      if (typeof userData.id === 'number') {
        userId = userData.id;
        console.log("Using numeric ID for share card:", userId);
      } else if (typeof userData.id === 'string') {
        // Try to parse as number if it looks numeric
        if (/^\d+$/.test(userData.id)) {
          userId = parseInt(userData.id, 10);
          console.log("Parsed numeric ID from string:", userId);
        } else {
          // Use as is if it's a Firebase UID
          userId = userData.id;
          console.log("Using Firebase UID for share card:", userId);
        }
      } else {
        throw new Error("Invalid user ID format");
      }
      
      // Verify the ID is valid (can be a number or a string)
      if (!userId && userId !== 0) {
        throw new Error("Could not determine valid user ID for sharing");
      }
      
      // Generate sharable link - use the native ID format detected above
      const shareUrl = `${window.location.origin}/profile/card/${userId}`;
      console.log("Sharable link:", shareUrl);
      
      // Display alert with the URL
      const alertUser = (success: boolean) => {
        if (success) {
          // Show the link was copied successfully
          toast({
            title: "Link copied to clipboard!",
            description: (
              <div className="mt-2">
                <p className="mb-2">Share this link to show others your Quantum Card:</p>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                  {shareUrl}
                </div>
              </div>
            ),
            variant: "default",
            duration: 5000,
          });
        } else {
          // Show fallback with the URL so they can copy it manually
          toast({
            title: "Couldn't copy automatically",
            description: (
              <div className="mt-2">
                <p className="mb-2">Copy this link manually to share your Quantum Card:</p>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                  {shareUrl}
                </div>
              </div>
            ),
            variant: "destructive", 
            duration: 5000,
          });
        }
      };
      
      // Check if the browser supports the Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          alertUser(true);
        } catch (err) {
          console.error("Failed to copy link:", err);
          alertUser(false);
        }
      } else {
        // Fallback for browsers that don't support the Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const success = document.execCommand('copy');
          alertUser(success);
        } catch (err) {
          console.error("Fallback: Failed to copy link:", err);
          alertUser(false);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error generating share link",
        description: "There was a problem generating your share link. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <h3 className="text-lg font-semibold">Quantum Card</h3>
        <div className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full flex items-center">
          <BadgeCheck className="h-3 w-3 mr-1" />
          <span>Premium</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="neo-glass-button text-white hover:bg-white/10 flex items-center gap-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="neo-glass-button text-white hover:bg-white/10 flex items-center gap-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      <div className="neo-glass-card border border-white/10 rounded-lg p-6">
        <div className="text-sm mb-4 flex items-start">
          <Info className="h-4 w-4 text-white/70 mr-2 mt-0.5" />
          <span className="text-white/70">
            Your Quantum Card is automatically created based on your profile information. Select a style that best represents you.
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Card Preview */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-[350px]">
              <VisitingCardPreview
                userData={userData}
                cardType={activeTab}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Card Type Selection */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Select Card Style</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
                data-testid="button-share-to-unlock"
              >
                <Gift className="h-4 w-4 mr-1" />
                Share to Unlock
              </Button>
            </div>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6 dark-tabs-list">
                <TabsTrigger 
                  value="professional" 
                  className={`dark-tabs-trigger relative ${isCardLocked("professional") ? "opacity-60" : ""}`}
                  data-testid="tab-professional"
                >
                  {isCardLocked("professional") && <Lock className="h-3 w-3 mr-1 inline" />}
                  Professional
                </TabsTrigger>
                <TabsTrigger 
                  value="3d-animated" 
                  className={`dark-tabs-trigger relative ${isCardLocked("3d-animated") ? "opacity-60" : ""}`}
                  data-testid="tab-3d-animated"
                >
                  {isCardLocked("3d-animated") && <Lock className="h-3 w-3 mr-1 inline" />}
                  3D
                </TabsTrigger>
                <TabsTrigger 
                  value="holographic" 
                  className={`dark-tabs-trigger relative ${isCardLocked("holographic") ? "opacity-60" : ""}`}
                  data-testid="tab-holographic"
                >
                  {isCardLocked("holographic") && <Lock className="h-3 w-3 mr-1 inline" />}
                  Holographic
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3 mb-6 dark-tabs-list">
                <TabsTrigger 
                  value="neoglow" 
                  className={`dark-tabs-trigger relative ${isCardLocked("neoglow") ? "opacity-60" : ""}`}
                  data-testid="tab-neoglow"
                >
                  {isCardLocked("neoglow") && <Lock className="h-3 w-3 mr-1 inline" />}
                  NeoGlow
                </TabsTrigger>
                <TabsTrigger 
                  value="creative" 
                  className={`dark-tabs-trigger relative ${isCardLocked("creative") ? "opacity-60" : ""}`}
                  data-testid="tab-creative"
                >
                  {isCardLocked("creative") && <Lock className="h-3 w-3 mr-1 inline" />}
                  Creative
                </TabsTrigger>
                <TabsTrigger 
                  value="artistic" 
                  className={`dark-tabs-trigger relative ${isCardLocked("artistic") ? "opacity-60" : ""}`}
                  data-testid="tab-artistic"
                >
                  {isCardLocked("artistic") && <Lock className="h-3 w-3 mr-1 inline" />}
                  Artistic
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-1 mb-6 dark-tabs-list">
                <TabsTrigger 
                  value="quantum" 
                  className={`dark-tabs-trigger relative ${isCardLocked("quantum") ? "opacity-60" : ""}`}
                  data-testid="tab-quantum"
                >
                  {isCardLocked("quantum") && <Lock className="h-3 w-3 mr-1 inline" />}
                  Quantum Tech
                </TabsTrigger>
              </TabsList>
              
              {/* Finalize card button section */}
              <div className="mt-6 neo-glass-card border border-white/10 p-6 rounded-lg">
                {isFinalized ? (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center mb-1 text-green-400">
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Quantum Card Finalized</span>
                      </div>
                      <p className="text-xs text-green-400/80 text-center">
                        This card style is set as your public Quantum Card
                      </p>
                    </div>
                    
                    {/* Prominent share button for finalized cards */}
                    <Button 
                      className="w-full neo-glass-button text-white hover:bg-white/10 flex items-center justify-center"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share this Quantum Card
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full neo-glass-button text-white hover:bg-white/10"
                    onClick={handleFinalizeCard}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Make This My Quantum Card
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Share Modal for Referral System */}
      <ShareModal open={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};

export default VisitingCardBuilder;