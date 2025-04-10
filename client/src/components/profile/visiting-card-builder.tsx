import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Info, Download, Share2 } from "lucide-react";
import { UserData } from "@/types/user";
import VisitingCardPreview from "./visiting-card-preview";

// Card type options
const CARD_TYPES = [
  { id: "professional", name: "Professional", description: "Sleek digital business card with modern UI" },
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
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onCardTypeSelect(value);
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
        <h3 className="text-lg font-semibold">Digital Visiting Card</h3>
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
            Your digital visiting card is automatically created based on your profile information. Select a style that best represents you.
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
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="3d-animated">3D</TabsTrigger>
                <TabsTrigger value="holographic">Holographic</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="clay-paper">Clay & Paper</TabsTrigger>
                <TabsTrigger value="creative">Creative</TabsTrigger>
                <TabsTrigger value="artistic">Artistic</TabsTrigger>
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