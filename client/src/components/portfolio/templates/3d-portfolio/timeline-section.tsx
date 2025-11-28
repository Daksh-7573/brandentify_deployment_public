import { TimelineEntry, COLORS } from "./types";
import { Briefcase, GraduationCap, MapPin, Calendar } from "lucide-react";

interface TimelineSectionProps {
  entries: TimelineEntry[];
  compact?: boolean;
  className?: string;
  isPreview?: boolean;
}

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "Present";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const TimelineSection: React.FC<TimelineSectionProps> = ({
  entries,
  compact = false,
  className = "",
  isPreview = false
}) => {
  if (entries.length === 0) return null;

  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  const displayEntries = isPreview ? sortedEntries.slice(0, 3) : sortedEntries;

  return (
    <section
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)`
      }}
    >
      <div className={`max-w-4xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'}`}>
        {!isPreview && (
          <div className="text-center mb-12">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                color: COLORS.offWhite
              }}
            >
              Experience & Education
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.coolGray }}>
              My professional journey and academic background
            </p>
          </div>
        )}

        <div className="relative">
          <div
            className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5"
            style={{
              background: `linear-gradient(to bottom, ${COLORS.electricBlue}, ${COLORS.neonPurple}, ${COLORS.mintGreen})`,
              transform: isPreview ? 'none' : 'translateX(-50%)'
            }}
          />

          <div className={`space-y-${isPreview ? '3' : '8'}`}>
            {displayEntries.map((entry, i) => {
              const isExperience = entry.type === 'experience';
              const IconComponent = isExperience ? Briefcase : GraduationCap;
              const accentColor = isExperience ? COLORS.electricBlue : COLORS.neonPurple;
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={entry.id}
                  className={`relative ${isPreview ? 'pl-10' : `lg:flex ${isLeft ? 'lg:flex-row-reverse' : ''}`}`}
                >
                  <div
                    className={`absolute ${isPreview ? 'left-0' : 'left-0 lg:left-1/2'} w-8 h-8 rounded-full flex items-center justify-center z-10`}
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, ${COLORS.neonPurple})`,
                      boxShadow: `0 0 20px ${accentColor}50`,
                      transform: isPreview ? 'none' : 'translateX(-50%)'
                    }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: COLORS.offWhite }} />
                  </div>

                  <div
                    className={`${isPreview ? 'ml-0' : `lg:w-[calc(50%-2rem)] ${isLeft ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'}`}`}
                  >
                    <div
                      className={`${isPreview ? 'p-3' : 'p-6'} rounded-xl transition-all duration-300 hover:-translate-y-1`}
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.charcoalBlack}90, ${COLORS.charcoalBlack}70)`,
                        border: `1px solid ${accentColor}30`,
                        boxShadow: `0 4px 20px ${COLORS.charcoalBlack}50`
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className={`font-semibold ${isPreview ? 'text-sm' : 'text-lg'}`}
                            style={{ color: COLORS.offWhite }}
                          >
                            {entry.title}
                          </h3>
                          <p
                            className={`font-medium ${isPreview ? 'text-xs' : 'text-sm'}`}
                            style={{ color: accentColor }}
                          >
                            {entry.company || entry.institution}
                          </p>
                        </div>
                        {!isPreview && (
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background: `${accentColor}20`,
                              color: accentColor
                            }}
                          >
                            {isExperience ? 'Work' : 'Education'}
                          </span>
                        )}
                      </div>

                      <div className={`flex flex-wrap gap-${isPreview ? '2' : '4'} ${isPreview ? 'text-[10px]' : 'text-xs'} mb-2`} style={{ color: COLORS.coolGray }}>
                        <span className="flex items-center gap-1">
                          <Calendar className={`${isPreview ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                          {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                        </span>
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className={`${isPreview ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                            {entry.location}
                          </span>
                        )}
                      </div>

                      {entry.shortDesc && !isPreview && (
                        <p
                          className="text-sm mb-3 line-clamp-2"
                          style={{ color: COLORS.silverGray }}
                        >
                          {entry.shortDesc}
                        </p>
                      )}

                      {entry.highlights && entry.highlights.length > 0 && !isPreview && (
                        <ul className="space-y-1">
                          {entry.highlights.slice(0, 3).map((highlight, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-xs"
                              style={{ color: COLORS.silverGray }}
                            >
                              <span style={{ color: COLORS.mintGreen }}>•</span>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
