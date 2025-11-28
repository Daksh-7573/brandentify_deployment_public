import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Mail, Phone, Globe, MapPin, Copy, Hash, Building2, 
  Sparkles, Download, MessageSquare, Users
} from "lucide-react";
import { ThreeDCardProps, COLORS, DEPTH_MAP } from "./types";

const ThreeDCard: React.FC<ThreeDCardProps> = ({
  profile,
  width = 420,
  height = 560,
  perspective = 1200,
  maxRotation = 10,
  particles = { count: 15, color: COLORS.electricBlue },
  showRings = true,
  enableTilt = true,
  onAction,
  className = ""
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [contactExpanded, setContactExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const industryTags = profile.industryTags?.slice(0, 3) || [];
  const profileLink = `brandentifier.com/@${(profile.name || 'user').toLowerCase().replace(/\s+/g, '-')}`;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Tilt effects disabled as per user request
    return;
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Tilt effects disabled as per user request
    return;
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(`${type} copied!`);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const handleAction = (action: 'copy' | 'download' | 'contact' | 'mentor') => {
    onAction?.(action);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setRotateX(0);
      setRotateY(0);
    }
    return () => cancelAnimationFrame(rafRef.current!);
  }, []);

  return (
    <div 
      className={`relative ${className}`} 
      style={{ perspective: `${perspective}px`, width, height }}
    >
      <div
        ref={cardRef}
        className="w-full h-full rounded-2xl overflow-hidden relative"
        style={{
          transformStyle: "preserve-3d",
          transform: "none",
          transition: "none",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
        }}
        data-testid="3d-card-container"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)`,
            overflow: "hidden"
          }}
        >
          {Array.from({ length: particles.count || 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `${particles.color}${Math.floor(Math.random() * 40 + 10)}`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `floatParticle ${Math.random() * 10 + 15}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, ${COLORS.subtleGrid} 1px, transparent 1px),
                linear-gradient(0deg, ${COLORS.subtleGrid} 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              opacity: 0.04
            }}
          />
        </div>

        <div className="absolute inset-0 p-6 pb-20 flex flex-col z-10">

          <div className="text-center mb-4" data-layer={DEPTH_MAP.layer4}>
            <h2
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                color: COLORS.offWhite,
                letterSpacing: "0.02em",
                textShadow: `0 0 10px ${COLORS.electricBlue}40, 0 0 20px ${COLORS.electricBlue}30`
              }}
            >
              {profile.name}
            </h2>
            {profile.title && (
              <div
                className="inline-block px-4 py-1 rounded-md"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.charcoalBlack}90, ${COLORS.charcoalBlack}70)`,
                  border: `1px solid ${COLORS.electricBlue}30`,
                  boxShadow: `0 2px 10px ${COLORS.electricBlue}20`,
                  animation: enableTilt ? "float 4s infinite ease-in-out" : "none",
                  animationDelay: "1s"
                }}
              >
                <p className="text-sm font-medium" style={{ color: COLORS.silverGray }}>
                  {profile.title}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-3" data-layer={DEPTH_MAP.layer3}>
            {industryTags.map((tag, i) => (
              <div
                key={`tag-${i}`}
                className="flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.charcoalBlack}90, ${COLORS.charcoalBlack}70)`,
                  border: `1px solid ${[COLORS.electricBlue, COLORS.mintGreen, COLORS.neonPurple][i % 3]}50`,
                  color: [COLORS.electricBlue, COLORS.mintGreen, COLORS.neonPurple][i % 3],
                  boxShadow: `0 0 10px ${[COLORS.electricBlue, COLORS.mintGreen, COLORS.neonPurple][i % 3]}20`,
                  animation: enableTilt ? `float ${4 + i * 0.5}s infinite ease-in-out` : "none",
                  animationDelay: `${i * 0.5}s`
                }}
              >
                <Hash className="h-3 w-3 mr-1 opacity-80" />
                {tag}
              </div>
            ))}
          </div>

          {profile.company && (
            <div className="mx-auto mb-4 px-4 py-3 rounded-md" data-layer={DEPTH_MAP.layer2} style={{ width: "85%" }}>
              <div
                className="flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.charcoalBlack}80, ${COLORS.charcoalBlack}50)`,
                  backdropFilter: "blur(5px)",
                  border: `1px solid ${COLORS.silverGray}20`,
                  borderRadius: "8px",
                  padding: "12px"
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.charcoalBlack}, ${COLORS.charcoalBlack}90)`,
                    border: `1px solid ${COLORS.silverGray}30`
                  }}
                >
                  <Building2 className="h-5 w-5" style={{ color: COLORS.silverGray }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: COLORS.coolGray }}>Company</p>
                  <p className="text-sm font-medium" style={{ color: COLORS.offWhite }}>{profile.company}</p>
                </div>
              </div>
            </div>
          )}

          {profile.location && (
            <div className="flex justify-center mb-4" data-layer={DEPTH_MAP.layer2}>
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.charcoalBlack}80, ${COLORS.charcoalBlack}50)`,
                  border: `1px solid ${COLORS.neonPurple}30`,
                  boxShadow: `0 0 10px ${COLORS.neonPurple}10`
                }}
              >
                <MapPin className="h-3 w-3" style={{ color: COLORS.coolGray }} />
                <span className="text-xs" style={{ color: COLORS.coolGray }}>{profile.location}</span>
              </div>
            </div>
          )}

          <div className="flex-grow" />

        </div>

        {copySuccess && (
          <div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full z-50 text-xs"
            style={{
              background: COLORS.electricBlue,
              color: COLORS.offWhite,
              boxShadow: `0 0 10px ${COLORS.electricBlue}50`,
              animation: "fadeInOut 2s forwards"
            }}
          >
            {copySuccess}
          </div>
        )}

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30"
          style={{
            boxShadow: `inset 0 0 0 1px ${COLORS.electricBlue}18`,
            transition: "none"
          }}
        />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) scale(1.15); } to { transform: rotate(360deg) scale(1.15); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes floatParticle { 0% { transform: translate(0, 0); } 25% { transform: translate(10px, 10px); } 50% { transform: translate(5px, -10px); } 75% { transform: translate(-10px, 5px); } 100% { transform: translate(0, 0); } }
        @keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -10px); } 10% { opacity: 1; transform: translate(-50%, 0); } 90% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -10px); } }
        @keyframes reflectionSweep { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
};

export default ThreeDCard;
