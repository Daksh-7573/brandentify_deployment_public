import React, { useState, useEffect } from 'react';
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, Info, BadgeCheck, Loader2 } from "lucide-react";
import QuantumCard from "@/components/profile/cards/quantum-card";
import NeoGlassLayout from "@/components/ui/neo-glass-layout";
import NeoGlassSection from "@/components/ui/neo-glass-section";
import { UserData } from '@/types/user';
import { Link } from "wouter";

// Card type options
const CARD_TYPES = [
  {
    id: 'quantum',
    name: 'Quantum',
    description: 'A modern, professional digital card with vibrant accents and clean design.'
  },
  {
    id: 'neoglow',
    name: 'NeoGlow',
    description: 'Tech-inspired design with neon accents and futuristic elements.'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold, colorful design for creative professionals and artists.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, simple design focusing on essential information.'
  }
];

export default function QuantumCardPage() {
  const { userData } = useUser();
  const { toast } = useToast();
  const [selectedCardType, setSelectedCardType] = useState<string>('quantum');
  const [loading, setLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    // Set initial card type from user preferences if available
    if (userData && userData.visitingCardType) {
      setSelectedCardType(userData.visitingCardType);
    }
    
    // Generate share URL
    if (userData && userData.id) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/profile/card/${userData.username || userData.id}`);
    }
  }, [userData]);

  const handleCardTypeSelect = (cardType: string) => {
    setSelectedCardType(cardType);
    // In a real implementation, this would save the preference to the database
    toast({
      title: "Card style updated",
      description: "Your quantum card style has been updated."
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // This would typically be implemented to generate and download the card
      toast({
        title: "Download started",
        description: "Your quantum card is being prepared for download."
      });
      
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Download complete",
        description: "Your quantum card has been downloaded."
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your quantum card.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Sharing failed",
        description: "There was an error copying the link.",
        variant: "destructive"
      });
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NeoGlassLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Quantum Card</h1>
          <p className="text-gray-400">Your digital professional business card</p>
        </div>

        <NeoGlassSection className="mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-white">Your Quantum Card</h2>
                <div className="ml-2 bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full flex items-center border border-blue-700/50">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  <span>Premium</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="neo-glass-button flex items-center gap-1"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span>{loading ? "Preparing..." : "Download"}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="neo-glass-button flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-start text-sm mb-2">
                <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Your Quantum Card is automatically created based on your profile information. 
                  Keep your profile updated for the best representation.
                </span>
              </div>
              
              {shareUrl && (
                <div className="text-sm p-2 bg-white/5 rounded border border-white/10 flex items-center">
                  <span className="text-gray-400 mr-2">Share URL:</span>
                  <code className="text-blue-300 flex-1 overflow-hidden text-ellipsis">{shareUrl}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleShare}
                    className="ml-2 h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                  >
                    Copy
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Card Preview */}
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="w-[240px] shadow-xl">
                  {userData && <QuantumCard userData={userData as UserData} />}
                </div>
              </div>
              
              {/* Card Style Options */}
              <div className="w-full lg:w-2/3">
                <h3 className="text-lg font-medium text-white mb-4">Card Styles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CARD_TYPES.map((cardType) => (
                    <div 
                      key={cardType.id}
                      className={`rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                        selectedCardType === cardType.id 
                          ? 'bg-primary/20 border-primary/50' 
                          : 'bg-gray-900/30 border-gray-700/50 hover:bg-gray-800/30'
                      }`}
                      onClick={() => handleCardTypeSelect(cardType.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          selectedCardType === cardType.id 
                            ? 'bg-primary' 
                            : 'bg-gray-700'
                        }`}>
                          {selectedCardType === cardType.id && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                        <h4 className="text-white font-medium">{cardType.name}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{cardType.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </NeoGlassSection>

        <NeoGlassSection className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Card Information</h2>
            <p className="text-gray-400 mb-4">
              Your Quantum Card is built using information from your profile. 
              Keep your profile complete and up-to-date for the best presentation.
            </p>
            
            <div className="flex items-center mt-4">
              <Button asChild variant="outline" className="neo-glass-button">
                <Link href="/profile">
                  Update Profile
                </Link>
              </Button>
            </div>
          </div>
        </NeoGlassSection>
      </NeoGlassLayout>
    </div>
  );
}