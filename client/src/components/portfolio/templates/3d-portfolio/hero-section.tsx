import { ThreeDCardProfile, COLORS } from "./types";
import ThreeDCard from "./3d-card";

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
        {!isPreview && profile.photoUrl && (
          <div className="flex justify-center mb-8 lg:mb-12">
            <div className="relative w-40 h-40 lg:w-48 lg:h-48">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, ${COLORS.electricBlue}, ${COLORS.neonPurple}, ${COLORS.mintGreen}, ${COLORS.electricBlue})`,
                  filter: "blur(8px)",
                  opacity: 0.6,
                  animation: "spin 8s linear infinite"
                }}
              />
              <div
                className="absolute inset-0 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  boxShadow: `0 0 30px ${COLORS.electricBlue}40`
                }}
              >
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile.name}&background=1e293b&color=38bdf8&size=200`;
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%)",
                    animation: "reflectionSweep 5s infinite ease-in-out"
                  }}
                />
              </div>
            </div>
          </div>
        )}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
