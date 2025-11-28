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
    whatImGoodAt?: string;
    whatIOffer?: string;
    missionStatement?: string;
    coreValues?: string[];
    lookingFor?: string;
    primaryAudience?: string[];
    secondaryAudience?: string[];
    primaryCta?: { label: string; onClick?: () => void };
    secondaryCta?: { label: string; onClick?: () => void };
  };
  enableTilt?: boolean;
  onCardAction?: (action: 'copy' | 'download' | 'contact' | 'mentor') => void;
  isPreview?: boolean;
  cardWidth?: number;
  cardHeight?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  heroCopy,
  enableTilt = true,
  onCardAction,
  isPreview = false,
  cardWidth: propCardWidth,
  cardHeight: propCardHeight
}) => {
  const cardWidth = propCardWidth || (isPreview ? 280 : 420);
  const cardHeight = propCardHeight || (isPreview ? 380 : 400);

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
              <div className="mb-2">
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
            <div className="flex justify-center w-full mt-8 lg:mt-12">
              <ThreeDCard
                profile={profile}
                width={cardWidth}
                height={cardHeight}
                enableTilt={false}
                maxRotation={0}
                onAction={onCardAction}
              />
            </div>
            {heroCopy.coreValues && heroCopy.coreValues.length > 0 && !isPreview && (
              <div className="space-y-3 mt-8 w-full">
                <p className="text-sm font-semibold uppercase tracking-wider text-center" style={{ color: COLORS.silverGray }}>
                  Core Values
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {heroCopy.coreValues.map((value, i) => (
                    <span
                      key={`core-${i}`}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${COLORS.electricBlue}20`,
                        border: `1px solid ${COLORS.electricBlue}40`,
                        color: COLORS.electricBlue
                      }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {heroCopy.lookingFor && !isPreview && (
              <div className="space-y-2 mt-8 w-full text-center">
                <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.silverGray }}>
                  Looking For
                </p>
                <p
                  className="text-base leading-relaxed max-w-xs mx-auto"
                  style={{ color: COLORS.coolGray }}
                >
                  {heroCopy.lookingFor}
                </p>
              </div>
            )}
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

              {heroCopy.whatImGoodAt && !isPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.silverGray }}>
                    What I'm Good At
                  </p>
                  <p
                    className="text-base leading-relaxed max-w-xl"
                    style={{ color: COLORS.coolGray }}
                  >
                    {heroCopy.whatImGoodAt}
                  </p>
                </div>
              )}

              {heroCopy.whatIOffer && !isPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.silverGray }}>
                    What I Offer
                  </p>
                  <p
                    className="text-base leading-relaxed max-w-xl"
                    style={{ color: COLORS.coolGray }}
                  >
                    {heroCopy.whatIOffer}
                  </p>
                </div>
              )}

              {heroCopy.missionStatement && !isPreview && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.silverGray }}>
                    Mission
                  </p>
                  <p
                    className="text-base leading-relaxed max-w-xl"
                    style={{ color: COLORS.coolGray }}
                  >
                    {heroCopy.missionStatement}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
