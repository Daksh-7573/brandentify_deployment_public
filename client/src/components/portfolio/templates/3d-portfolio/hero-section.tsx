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
  const cardWidth = isPreview ? 280 : 420;
  const cardHeight = isPreview ? 380 : 560;

  return (
    <section 
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'}`}
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)` 
      }}
    >
      <div className={`max-w-7xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'}`}>
        <div className={`grid ${isPreview ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'} items-center`}>
          <div className={`flex justify-center ${isPreview ? '' : 'lg:sticky lg:top-24'}`}>
            <ThreeDCard
              profile={profile}
              width={cardWidth}
              height={cardHeight}
              enableTilt={enableTilt && !isPreview}
              maxRotation={isPreview ? 0 : 10}
              onAction={onCardAction}
            />
          </div>

          <div className={`${isPreview ? 'text-center' : 'space-y-8'}`}>
            <div className={isPreview ? 'space-y-2' : 'space-y-6'}>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Sparkles className={`${isPreview ? 'h-4 w-4' : 'h-5 w-5'}`} style={{ color: COLORS.electricBlue }} />
                <span 
                  className={`${isPreview ? 'text-xs' : 'text-sm'} font-medium uppercase tracking-wider`}
                  style={{ color: COLORS.electricBlue }}
                >
                  Premium Portfolio
                </span>
              </div>

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
            </div>

            {services.length > 0 && !isPreview && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: COLORS.silverGray }}>
                  What I Do
                </h3>
                <div className="flex flex-wrap gap-3">
                  {services.slice(0, 4).map((service, i) => (
                    <div
                      key={service.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: `${COLORS.charcoalBlack}90`,
                        border: `1px solid ${[COLORS.electricBlue, COLORS.neonPurple, COLORS.mintGreen][i % 3]}40`,
                        color: [COLORS.electricBlue, COLORS.neonPurple, COLORS.mintGreen][i % 3]
                      }}
                    >
                      {service.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isPreview && (
              <div className="flex flex-wrap gap-4">
                {heroCopy.primaryCta && (
                  <button
                    onClick={heroCopy.primaryCta.onClick}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.electricBlue}, ${COLORS.neonPurple})`,
                      color: COLORS.offWhite,
                      boxShadow: `0 4px 20px ${COLORS.electricBlue}40`
                    }}
                    data-testid="hero-primary-cta"
                  >
                    {heroCopy.primaryCta.label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {heroCopy.secondaryCta && (
                  <button
                    onClick={heroCopy.secondaryCta.onClick}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    style={{
                      background: "transparent",
                      border: `1px solid ${COLORS.electricBlue}50`,
                      color: COLORS.electricBlue
                    }}
                    data-testid="hero-secondary-cta"
                  >
                    {heroCopy.secondaryCta.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
