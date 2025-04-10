import React from "react";
import { UserData } from "@/types/user";

// Import card components
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

const VisitingCardPreview: React.FC<VisitingCardPreviewProps> = ({
  userData,
  cardType,
}) => {
  // Render the appropriate card based on type
  const renderCard = () => {
    switch (cardType) {
      case "3d-animated":
        return <ThreeDAnimatedCard userData={userData} />;
      case "holographic":
        return <HolographicCard userData={userData} />;
      case "flip":
        return <FlipCard userData={userData} />;
      case "creative":
        return <CreativeCard userData={userData} />;
      case "artistic":
        return <ArtisticCard userData={userData} />;
      case "minimalist":
      default:
        return <MinimalistCard userData={userData} />;
    }
  };

  return (
    <div className="visiting-card-preview">
      {renderCard()}
    </div>
  );
};

export default VisitingCardPreview;