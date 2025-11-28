import { ThreeDCardProfile, COLORS } from "./types";
import ThreeDCard from "./3d-card";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  profile: ThreeDCardProfile;
  heroCopy: {
    heading?: string;
    subheading?: string;
    jobLevel?: string;
    company?: string;
    visionStatement?: string;
    paragraph?: string;
    whatIOffer?: string;
    missionStatement?: string;
    primaryCta?: { label: string; onClick?: () => void };
    secondaryCta?: { label: string; onClick?: () => void };
  };
  services?: { id: string | number; title: string; description?: string }[];
  enableTilt?: boolean;
  onCardAction?: (action: 'copy' | 'download' | 'contact' | 'mentor') => void;
  isPreview?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  heroCopy,
  services = [],
  enableTilt = true,
  onCardAction,
  isPreview = false
}) => {
  const cardWidth = isPreview ? 280 : 340;
  const cardHeight = isPreview ? 380 : 480;

  return (
    <section 
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'}`}
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)` 
      }}
    >
      <div className={`max-w-7xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'}`}>
        <div className={`grid ${isPreview ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'} items-start`}>
          <div className={`flex flex-col items-center ${isPreview ? '' : 'lg:sticky lg:top-24'}`}>
            {!isPreview && profile.photoUrl && (
              <div className="mb-3">
                <div className="relative w-64 h-64">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${COLORS.electricBlue}, ${COLORS.neonPurple}, ${COLORS.mintGreen}, ${COLORS.electricBlue})`,
                      filter: "blur(12px)",
                      opacity: 0.6,
                      animation: "spin 8s linear infinite"
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 25px ${COLORS.electricBlue}60`,
                      animation: "pulse 3s infinite alternate ease-in-out"
                    }}
                  />
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="absolute inset-0 w-full h-full rounded-full object-cover border-4"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      boxShadow: `0 0 30px ${COLORS.electricBlue}40`
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-center w-full">
              <ThreeDCard
                profile={profile}
                width={cardWidth}
                height={cardHeight}
                enableTilt={false}
                maxRotation={0}
                onAction={onCardAction}
              />
            </div>
          </div>

          <div className={`${isPreview ? 'text-center' : 'space-y-8'}`}>
            <div className={isPreview ? 'space-y-2' : 'space-y-6'}>
              <h1
                className={`font-bold ${isPreview ? 'text-lg' : 'text-4xl lg:text-5xl xl:text-6xl'} leading-tight`}
                style={{ 
                  fontFamily: "'Sora', 'Inter', sans-serif",
                  color: COLORS.offWhite 
                }}
              >
                {heroCopy.heading || `Hi, I'm ${profile.name}`}
              </h1>

              {(heroCopy.subheading || heroCopy.jobLevel || heroCopy.company) && !isPreview && (
                <div className="space-y-2">
                  {heroCopy.subheading && (
                    <p
                      className="text-xl lg:text-2xl font-medium"
                      style={{ color: COLORS.electricBlue }}
                    >
                      {heroCopy.subheading}
                    </p>
                  )}
                  {(heroCopy.jobLevel || heroCopy.company) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {heroCopy.jobLevel && (
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: `${COLORS.neonPurple}20`,
                            border: `1px solid ${COLORS.neonPurple}40`,
                            color: COLORS.neonPurple
                          }}
                        >
                          {heroCopy.jobLevel}
                        </span>
                      )}
                      {heroCopy.company && (
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            background: `${COLORS.mintGreen}20`,
                            border: `1px solid ${COLORS.mintGreen}40`,
                            color: COLORS.mintGreen
                          }}
                        >
                          {heroCopy.company}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {heroCopy.visionStatement && !isPreview && (
                <p
                  className="text-lg leading-relaxed max-w-xl italic"
                  style={{ color: COLORS.coolGray }}
                >
                  "{heroCopy.visionStatement}"
                </p>
              )}

              {heroCopy.paragraph && !isPreview && (
                <p
                  className="text-lg leading-relaxed max-w-xl"
                  style={{ color: COLORS.coolGray }}
                >
                  {heroCopy.paragraph}
                </p>
              )}
            </div>

          </div>
        </div>

        {heroCopy.whatIOffer && !isPreview && (
          <div className="mt-16 lg:mt-24 pt-16 lg:pt-24 border-t" style={{ borderColor: `${COLORS.electricBlue}20` }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div></div>
              <div className="space-y-4">
                <h2 
                  className="text-3xl lg:text-4xl font-bold"
                  style={{ 
                    fontFamily: "'Sora', 'Inter', sans-serif",
                    color: COLORS.offWhite 
                  }}
                >
                  What I Do
                </h2>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: COLORS.coolGray }}
                >
                  {heroCopy.whatIOffer}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
