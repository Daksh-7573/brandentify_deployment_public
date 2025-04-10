import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";
import VisitingCardPreview from "./visiting-card-preview";
import { UserData } from "@/types/user";

// The different card types available
export const CARD_TYPES = [
  {
    id: "3d-animated",
    name: "3D Animated",
    description: "A 3D card that rotates with smooth animations and depth effects.",
    features: ["3D rotation effects", "Depth & motion blur", "Neon glowing edges"]
  },
  {
    id: "holographic",
    name: "Holographic Glass",
    description: "Glassmorphism effect with blurry, semi-transparent glass look.",
    features: ["Glass translucency", "Soft neon accents", "Floating UI elements"]
  },
  {
    id: "flip-card",
    name: "Interactive Flip",
    description: "Front and back sides with profile info that flips on interaction.",
    features: ["Smooth flip animation", "Dual-sided design", "Tap to flip"]
  },
  {
    id: "minimalist",
    name: "Professional Minimalist",
    description: "Clean, simple design with premium feel for business professionals.",
    features: ["Clean typography", "Subtle shadows", "Premium color scheme"]
  },
  {
    id: "creative",
    name: "Creative & Modern",
    description: "Vibrant gradient background with asymmetrical layout.",
    features: ["Vibrant gradients", "Geometric elements", "Animated icons"]
  },
  {
    id: "artistic",
    name: "Artistic & Unique",
    description: "Watercolor effects with organic shapes and elegant typography.",
    features: ["Watercolor effects", "Organic flowing shapes", "Elegant typography"]
  }
];

interface VisitingCardBuilderProps {
  userData: UserData;
  selectedCardType?: string;
  onCardTypeSelect?: (cardType: string) => void;
}

const VisitingCardBuilder: React.FC<VisitingCardBuilderProps> = ({ 
  userData, 
  selectedCardType = "",
  onCardTypeSelect = () => {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("select");
  const [tempSelectedCard, setTempSelectedCard] = useState(selectedCardType);
  
  const handleSelectCard = (cardType: string) => {
    setTempSelectedCard(cardType);
  };

  const handleConfirm = () => {
    onCardTypeSelect(tempSelectedCard);
    setIsOpen(false);
    setActiveTab("select");
  };

  return (
    <>
      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-lg font-semibold">Digital Visiting Card</h3>
          <p className="text-sm text-muted-foreground">
            Create your personalized digital visiting card
          </p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Vibrant ID
        </Button>
      </div>

      {selectedCardType && (
        <div className="mt-4 bg-muted/40 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <Badge variant="outline" className="mb-1">
                {CARD_TYPES.find(c => c.id === selectedCardType)?.name || "Custom"} Card
              </Badge>
              <h4 className="text-sm font-medium">Your Digital Visiting Card</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(true)}
            >
              Change
            </Button>
          </div>
          <div className="max-w-[300px] mx-auto">
            <VisitingCardPreview 
              userData={userData} 
              cardType={selectedCardType}
            />
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Your Digital Visiting Card</DialogTitle>
            <DialogDescription>
              Choose a style for your digital visiting card. Preview how it will look with your profile data.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="select">Select Style</TabsTrigger>
              <TabsTrigger value="preview" disabled={!tempSelectedCard}>Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CARD_TYPES.map((cardType) => (
                  <Card 
                    key={cardType.id}
                    className={`cursor-pointer hover:border-primary/50 transition-colors ${
                      tempSelectedCard === cardType.id ? 'border-2 border-primary' : ''
                    }`}
                    onClick={() => handleSelectCard(cardType.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex justify-between items-center">
                        {cardType.name}
                        {tempSelectedCard === cardType.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {cardType.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-xs space-y-1">
                        {cardType.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => tempSelectedCard ? setActiveTab("preview") : null}
                  disabled={!tempSelectedCard}
                >
                  Continue to Preview
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="mb-4">
                <h3 className="text-base font-medium mb-1">
                  {CARD_TYPES.find(c => c.id === tempSelectedCard)?.name} Card Preview
                </h3>
                <p className="text-sm text-muted-foreground">
                  This is how your digital visiting card will appear to others.
                </p>
                <Separator className="my-4" />
                <div className="max-w-[300px] mx-auto">
                  <VisitingCardPreview 
                    userData={userData} 
                    cardType={tempSelectedCard || ""}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!tempSelectedCard}
            >
              Create Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisitingCardBuilder;