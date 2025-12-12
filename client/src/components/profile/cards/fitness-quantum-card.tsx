import React, { useState, useEffect, useRef } from "react";
import { UserData } from "@/types/user";
import { MapPin, Mail, Globe, Calendar, Dumbbell, Heart, Wind, Target, Instagram, Youtube, Phone } from "lucide-react";

interface FitnessQuantumCardProps {
  userData: UserData;
  isLoading?: boolean;
}

const FitnessQuantumCard: React.FC<FitnessQuantumCardProps> = ({ userData, isLoading = false }) => {
  const [contactOpen, setContactOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const colors = {
    energeticLime: '#A3E635',
    vibrantOrange: '#FB923C',
    deepEmerald: '#065F46',
    skyBlue: '#38BDF8',
    offWhiteMist: '#F8F9FA',
    coolGrey: '#E5E7EB',
    deepCharcoal: '#1F2937',
  };

  const metrics = {
    flexibility: 92,
    strength: 88,
    breath: 95,
    trainingLevel: 'Advanced'
  };

  const profileLink = userData.randomProfileLink 
    ? `brandentifier.com/r/${userData.randomProfileLink}` 
    : `brandentifier.com/@${userData.brandName || userData.username}`;

  useEffect(() => {
    const gauges = cardRef.current?.querySelectorAll('.gauge-fg');
    if (gauges) {
      gauges.forEach((g) => {
        const el = g as SVGCircleElement;
        const val = el.getAttribute('data-val');
        const pct = Math.max(0, Math.min(100, Number(val) || 0));
        const circumference = 2 * Math.PI * 34;
        const offset = circumference - (pct / 100) * circumference;
        el.style.strokeDasharray = `${circumference} ${circumference}`;
        el.style.strokeDashoffset = `${circumference}`;
        setTimeout(() => { 
          el.style.strokeDashoffset = `${offset}`; 
        }, 100);
      });
    }
  }, []);

  const MetricGauge = ({ label, value, icon: Icon, gradientId, colorStart, colorEnd, delay, reducedMotion }: {
    label: string;
    value: number;
    icon: React.ElementType;
    gradientId: string;
    colorStart: string;
    colorEnd: string;
    delay: number;
    reducedMotion?: boolean;
  }) => (
    <div className="gauge relative flex flex-col items-center" title={`${label}: ${value}%`}>
      <svg width="72" height="72" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="#f0f7f2"
          strokeWidth="8"
          className="gauge-bg"
        />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          className="gauge-fg"
          data-val={value}
          style={{
            transition: reducedMotion ? 'none' : `stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'translateY(-2px)' }}>
        <Icon className="h-4 w-4 mb-1" style={{ color: colorStart }} />
        <span className="text-xs font-bold" style={{ color: colors.deepCharcoal }}>{value}</span>
      </div>
      <span className="text-[10px] mt-1 font-medium" style={{ color: colors.deepCharcoal }}>{label}</span>
    </div>
  );

  return (
    <article 
      ref={cardRef}
      className="fitness-quantum-card w-full min-h-[620px] relative rounded-3xl overflow-hidden"
      role="region" 
      aria-labelledby="fitness-card-title"
      style={{
        background: `linear-gradient(180deg, ${colors.offWhiteMist} 0%, #FAFEFB 100%)`,
        boxShadow: `0 12px 40px rgba(6,95,70,0.08)`,
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
      }}
    >
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.energeticLime}, ${colors.vibrantOrange}, ${colors.skyBlue})`,
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(163,230,53,0.08) 50%, rgba(251,146,60,0) 100%)`,
          mixBlendMode: 'screen',
          opacity: 0.85,
          animation: prefersReducedMotion ? 'none' : 'lightSweep 9s ease-in-out infinite'
        }}
        aria-hidden="true"
      />

      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${colors.energeticLime}40 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, ${colors.skyBlue}30 0%, transparent 40%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
        
        <header className="flex items-start gap-5 mb-6">
          <div 
            className="fcard-aura relative flex-shrink-0"
            style={{ width: '130px', height: '130px' }}
          >
            <div 
              className="absolute -inset-3 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${colors.energeticLime}, ${colors.vibrantOrange}, ${colors.skyBlue}, ${colors.energeticLime})`,
                opacity: 0.15,
                filter: 'blur(10px)',
                animation: prefersReducedMotion ? 'none' : 'breathFlow 6s ease-in-out infinite'
              }}
              aria-hidden="true"
            />
            
            <div 
              className="absolute inset-2 rounded-full"
              style={{
                border: `5px solid rgba(6,95,70,0.08)`,
                boxShadow: `0 6px 18px rgba(6,95,70,0.06) inset`,
                animation: prefersReducedMotion ? 'none' : 'trackerRotate 8s linear infinite'
              }}
              aria-hidden="true"
            />
            
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 20%, rgba(163,230,53,0.08), transparent 50%)`,
              }}
              aria-hidden="true"
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              {isLoading ? (
                <div 
                  className="w-24 h-24 rounded-full animate-pulse"
                  style={{ background: `linear-gradient(135deg, ${colors.coolGrey}, ${colors.offWhiteMist})` }}
                />
              ) : (
                <img
                  src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=065F46&color=A3E635`}
                  alt={`${userData.name} — profile`}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{
                    border: '4px solid white',
                    boxShadow: `0 10px 30px rgba(6,95,70,0.1)`
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || 'User'}&background=065F46&color=A3E635`;
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <h1 
              id="fitness-card-title" 
              className="text-xl sm:text-2xl font-bold leading-tight mb-2"
              style={{ color: colors.deepCharcoal }}
            >
              {isLoading ? (
                <span className="inline-block w-40 h-7 rounded animate-pulse" style={{ background: colors.coolGrey }} />
              ) : (
                userData.name || "Your Name"
              )}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.vibrantOrange}, #FFD08A)`,
                  boxShadow: `0 8px 24px rgba(251,146,60,0.15)`
                }}
              >
                <Dumbbell className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-semibold text-white">
                  {isLoading ? (
                    <span className="inline-block w-24 h-3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.4)' }} />
                  ) : (
                    userData.title || "Fitness Coach"
                  )}
                </span>
              </div>

              {(userData as any).yearsOfExperience && (
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                  style={{
                    background: 'white',
                    border: `1px solid rgba(6,95,70,0.08)`,
                    color: colors.deepCharcoal
                  }}
                >
                  <Target className="h-3 w-3" style={{ color: colors.deepEmerald }} />
                  <span>{(userData as any).yearsOfExperience} yrs</span>
                </div>
              )}
            </div>

            <p 
              className="text-sm leading-relaxed mb-3"
              style={{ color: `${colors.deepCharcoal}cc` }}
            >
              {isLoading ? (
                <span className="inline-block w-48 h-4 rounded animate-pulse" style={{ background: colors.coolGrey }} />
              ) : (
                userData.tagline || "Strengthen the body. Calm the mind."
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {userData.location && (
                <div 
                  className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                  style={{
                    background: 'white',
                    border: `1px solid rgba(6,95,70,0.06)`,
                    color: `${colors.deepCharcoal}cc`
                  }}
                  title="Location"
                >
                  <MapPin className="h-3 w-3" style={{ color: colors.deepEmerald }} />
                  <span>{userData.location}</span>
                </div>
              )}

              {userData.industry && (
                <div 
                  className="fchip inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                  style={{
                    background: 'white',
                    border: `1px solid rgba(6,95,70,0.06)`,
                    color: `${colors.deepCharcoal}cc`
                  }}
                  title="Specialty"
                >
                  <Heart className="h-3 w-3" style={{ color: colors.vibrantOrange }} />
                  <span>{userData.industry}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <section 
          className="metrics-strip flex justify-center gap-4 py-4 px-3 mb-5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, rgba(163,230,53,0.06), rgba(56,189,248,0.04))`,
            border: `1px solid rgba(6,95,70,0.06)`
          }}
          aria-labelledby="metrics-heading"
        >
          <h2 id="metrics-heading" className="sr-only">Fitness Metrics</h2>
          
          <MetricGauge 
            label="Flexibility" 
            value={metrics.flexibility} 
            icon={Wind}
            gradientId="g1" 
            colorStart={colors.energeticLime} 
            colorEnd={colors.vibrantOrange}
            delay={0}
            reducedMotion={prefersReducedMotion}
          />
          <MetricGauge 
            label="Strength" 
            value={metrics.strength} 
            icon={Dumbbell}
            gradientId="g2" 
            colorStart={colors.vibrantOrange} 
            colorEnd={colors.skyBlue}
            delay={0.1}
            reducedMotion={prefersReducedMotion}
          />
          <MetricGauge 
            label="Breath" 
            value={metrics.breath} 
            icon={Wind}
            gradientId="g3" 
            colorStart={colors.skyBlue} 
            colorEnd={colors.energeticLime}
            delay={0.2}
            reducedMotion={prefersReducedMotion}
          />
          
          <div className="flex flex-col items-center justify-center px-3">
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-bold mb-1"
              style={{
                background: `linear-gradient(90deg, ${colors.deepEmerald}, ${colors.energeticLime})`,
                color: 'white'
              }}
            >
              {metrics.trainingLevel}
            </div>
            <span className="text-[10px] font-medium" style={{ color: colors.deepCharcoal }}>Level</span>
          </div>
        </section>

        <div className="flex-1" />

        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setContactOpen(!contactOpen)}
            className="fcta inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm cursor-pointer transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, ${colors.energeticLime}, ${colors.vibrantOrange})`,
              color: 'white',
              boxShadow: `0 12px 32px rgba(163,230,53,0.2)`,
              border: 'none'
            }}
            data-testid="button-connect-fitness"
          >
            <Calendar className="h-4 w-4" />
            <span>Connect</span>
          </button>

          <button
            className="fcta inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm cursor-pointer transition-all"
            style={{
              background: 'white',
              color: colors.deepCharcoal,
              border: `1px solid rgba(6,95,70,0.1)`
            }}
            data-testid="button-portfolio-fitness"
          >
            <Globe className="h-4 w-4" />
            <span>Portfolio</span>
          </button>
        </div>

        <div 
          className="contact-panel rounded-xl p-4 transition-all duration-500"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,255,250,0.98))`,
            boxShadow: contactOpen ? `0 -10px 40px rgba(6,95,70,0.1)` : 'none',
            transform: contactOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: contactOpen ? 1 : 0,
            pointerEvents: contactOpen ? 'auto' : 'none',
            border: `1px solid rgba(6,95,70,0.08)`
          }}
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {userData.email && (
              <a 
                href={`mailto:${userData.email}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Mail className="h-3.5 w-3.5" style={{ color: colors.deepEmerald }} />
                <span>{userData.email}</span>
              </a>
            )}

            {(userData as any).phone && (
              <a 
                href={`tel:${(userData as any).phone}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Phone className="h-3.5 w-3.5" style={{ color: colors.vibrantOrange }} />
                <span>{(userData as any).phone}</span>
              </a>
            )}

            {(userData as any).websiteUrl && (
              <a 
                href={(userData as any).websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(163,230,53,0.1), rgba(56,189,248,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Globe className="h-3.5 w-3.5" style={{ color: colors.skyBlue }} />
                <span>Website</span>
              </a>
            )}

            {(userData as any).instagramUrl && (
              <a 
                href={(userData as any).instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(251,146,60,0.1), rgba(163,230,53,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Instagram className="h-3.5 w-3.5" style={{ color: '#E4405F' }} />
                <span>Instagram</span>
              </a>
            )}

            {(userData as any).youtubeUrl && (
              <a 
                href={(userData as any).youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, rgba(251,146,60,0.1), rgba(163,230,53,0.05))`,
                  color: colors.deepCharcoal,
                  border: `1px solid rgba(6,95,70,0.08)`
                }}
              >
                <Youtube className="h-3.5 w-3.5" style={{ color: '#FF0000' }} />
                <span>YouTube</span>
              </a>
            )}
          </div>

          <div className="text-center mt-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(90deg, ${colors.deepEmerald}, ${colors.energeticLime})`,
                color: 'white',
                boxShadow: `0 8px 24px rgba(6,95,70,0.15)`
              }}
              data-testid="button-book-session"
            >
              <Calendar className="h-3.5 w-3.5 animate-pulse" />
              <span>Book a Session</span>
            </button>
          </div>
        </div>

        <p 
          className="text-center text-[10px] mt-3"
          style={{ color: `${colors.deepCharcoal}66` }}
        >
          {profileLink}
        </p>
      </div>

      <style>{`
        @keyframes breathFlow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes trackerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes lightSweep {
          0% { transform: translateX(-120%); opacity: 0; }
          50% { transform: translateX(10%); opacity: 0.5; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        
        @keyframes chakraPulse {
          0% { box-shadow: 0 0 0 rgba(163,230,53,0.2); }
          50% { box-shadow: 0 0 20px rgba(251,146,60,0.3); }
          100% { box-shadow: 0 0 0 rgba(56,189,248,0.2); }
        }
        
        .fitness-quantum-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(163,230,53,0.12), 0 0 30px rgba(251,146,60,0.08);
        }
        
        .fitness-quantum-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .fitness-quantum-card,
          .fitness-quantum-card * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </article>
  );
};

export default FitnessQuantumCard;
