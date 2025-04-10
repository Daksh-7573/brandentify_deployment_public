import React from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";
import ThreeDAnimatedCard from "./cards/3d-animated-card";
import HolographicCard from "./cards/holographic-card";
import FlipCard from "./cards/flip-card";
import MinimalistCard from "./cards/minimalist-card";
import CreativeCard from "./cards/creative-card";
import ArtisticCard from "./cards/artistic-card";

interface VisitingCardPreviewProps {
  userData: UserData;
  cardType: string;
}

const VisitingCardPreview: React.FC<VisitingCardPreviewProps> = ({ userData, cardType }) => {
  // Determine which card component to render based on the selected type
  const renderCard = () => {
    switch (cardType) {
      case "3d-animated":
        return <ThreeDAnimatedCard userData={userData} />;
      case "holographic":
        return <HolographicCard userData={userData} />;
      case "flip-card":
        return <FlipCard userData={userData} />;
      case "minimalist":
        return <MinimalistCard userData={userData} />;
      case "creative":
        return <CreativeCard userData={userData} />;
      case "artistic":
        return <ArtisticCard userData={userData} />;
      default:
        // Fallback to minimalist card if no valid type is provided
        return <MinimalistCard userData={userData} />;
    }
  };

  return <div className="w-full">{renderCard()}</div>;
};

export default VisitingCardPreview;