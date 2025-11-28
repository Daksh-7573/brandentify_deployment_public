import { useEffect, useState, useRef } from "react";
import { COLORS } from "./types";
import { TrendingUp, Users, Briefcase, Award, Star, Target } from "lucide-react";

interface StatItem {
  id: string | number;
  label: string;
  value: string;
  icon?: string;
}

interface StatsStripProps {
  stats: StatItem[];
  className?: string;
  isPreview?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trending: TrendingUp,
  users: Users,
  briefcase: Briefcase,
  award: Award,
  star: Star,
  target: Target
};

const AnimatedCounter: React.FC<{ value: string; animate: boolean }> = ({ value, animate }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const numericMatch = value.match(/^(\d+)/);
  const numericPart = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = value.replace(/^\d+/, '');

  useEffect(() => {
    if (!animate || !numericPart) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * numericPart);
      setDisplayValue(`${current}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    requestAnimationFrame(animateValue);
  }, [animate, numericPart, suffix, value]);

  return <span>{displayValue}</span>;
};

const StatsStrip: React.FC<StatsStripProps> = ({ stats, className = "", isPreview = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPreview) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (stripRef.current) {
      observer.observe(stripRef.current);
    }

    return () => observer.disconnect();
  }, [isPreview]);

  if (stats.length === 0) return null;

  return (
    <section
      ref={stripRef}
      className={`relative ${isPreview ? 'py-3' : 'py-12'} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${COLORS.deepCharcoal} 0%, ${COLORS.charcoalBlack} 100%)`
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, ${COLORS.subtleGrid} 1px, transparent 1px),
            linear-gradient(0deg, ${COLORS.subtleGrid} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.06
        }}
      />

      <div className={`max-w-7xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'} relative z-10`}>
        <div className={`grid ${isPreview ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
          {stats.slice(0, 4).map((stat, i) => {
            const IconComponent = ICON_MAP[stat.icon || 'star'] || Star;
            return (
              <div
                key={stat.id}
                className={`text-center ${isPreview ? 'p-2' : 'p-6'} rounded-xl transition-all duration-500`}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.charcoalBlack}80, ${COLORS.charcoalBlack}50)`,
                  border: `1px solid ${COLORS.electricBlue}20`,
                  boxShadow: isVisible ? `0 0 20px ${COLORS.electricBlue}10` : 'none',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 100}ms`
                }}
              >
                <div className="flex justify-center mb-2" style={{ color: COLORS.electricBlue }}>
                  <IconComponent className={`${isPreview ? 'h-4 w-4' : 'h-6 w-6'}`} />
                </div>
                <div
                  className={`font-bold ${isPreview ? 'text-lg' : 'text-3xl lg:text-4xl'} mb-1`}
                  style={{
                    fontFamily: "'Sora', 'Inter', sans-serif",
                    color: COLORS.offWhite
                  }}
                >
                  <AnimatedCounter value={stat.value} animate={isVisible} />
                </div>
                <div
                  className={`${isPreview ? 'text-xs' : 'text-sm'} font-medium uppercase tracking-wider`}
                  style={{ color: COLORS.coolGray }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
