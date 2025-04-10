import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Info, Download, Share2, Check, Loader2 } from "lucide-react";
import { UserData } from "@/types/user";
import VisitingCardPreview from "./visiting-card-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Card type options
const CARD_TYPES = [
  { id: "professional", name: "Professional", description: "Sleek digital business card with modern UI" },
  { id: "3d-card", name: "Quantum 3D", description: "Premium futuristic 3D card with holographic effects" },
  { id: "3d-animated", name: "3D Animated", description: "Interactive 3D hover effects" },
  { id: "holographic", name: "Holographic Glass", description: "Modern transparent design" },
  { id: "clay-paper", name: "Clay & Paper", description: "Playful 3D claymation & paper-cut style" },
  { id: "creative", name: "Creative", description: "Colorful artistic layout" },
  { id: "artistic", name: "Artistic", description: "Hand-drawn watercolor style" },
];

interface VisitingCardBuilderProps {
  userData: UserData;
  selectedCardType: string;
  onCardTypeSelect: (cardType: string) => void;
}

const VisitingCardBuilder: React.FC<VisitingCardBuilderProps> = ({
  userData,
  selectedCardType,
  onCardTypeSelect,
}) => {
  // Set default card type if none selected
  const [activeTab, setActiveTab] = useState(selectedCardType || "professional");
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(selectedCardType === userData.visitingCardType);
  const { toast } = useToast();
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsFinalized(value === userData.visitingCardType);
    onCardTypeSelect(value);
  };

  // Handle finalizing the selected card
  const handleFinalizeCard = async () => {
    setIsSaving(true);
    try {
      // Save the selected card type to the user profile
      await apiRequest({
        url: `/users/${userData.id}`,
        method: 'PUT',
        data: { visitingCardType: activeTab }
      });
      
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

  // Handle card sharing (placeholder functionality)
  const handleShare = () => {
    alert("Sharing functionality will be implemented in the next update!");
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
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <div className="text-sm mb-4 flex items-start">
          <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
          <span className="text-gray-600 dark:text-gray-400">
            Your Quantum Card is automatically created based on your profile information. Select a style that best represents you.
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Card Preview */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-[280px]">
              <VisitingCardPreview
                userData={userData}
                cardType={activeTab}
              />
            </div>
          </div>
          
          {/* Card Type Selection */}
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-3">Select Card Style</h4>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="3d-card">Quantum 3D</TabsTrigger>
                <TabsTrigger value="3d-animated">3D Animated</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="holographic">Holographic</TabsTrigger>
                <TabsTrigger value="clay-paper">Clay & Paper</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="artistic">Artistic</TabsTrigger>
                <TabsTrigger value="" disabled className="opacity-0"></TabsTrigger>
                <TabsTrigger value="" disabled className="opacity-0"></TabsTrigger>
              </TabsList>
              
              {/* Individual tab contents for more details on each style */}
              {CARD_TYPES.map((type) => (
                <TabsContent key={type.id} value={type.id}>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h5 className="font-medium mb-2">{type.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                      
                      <ul className="mt-4 space-y-2 text-sm">
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
                          Optimized for mobile devices
                        </li>
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
                          Shareable via link or QR code
                        </li>
                        <li className="flex items-center text-gray-600 dark:text-gray-400">
                          <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />
                          Auto-updates with your profile
                        </li>
                      </ul>
                      
                      {/* Finalize card button */}
                      {type.id === activeTab && (
                        <div className="mt-6">
                          {isFinalized ? (
                            <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                              <div className="flex items-center mb-1 text-green-600 dark:text-green-400">
                                <Check className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Quantum Card Finalized</span>
                              </div>
                              <p className="text-xs text-green-600/80 dark:text-green-400/80 text-center">
                                This card style is set as your public Quantum Card
                              </p>
                            </div>
                          ) : (
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
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
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitingCardBuilder;