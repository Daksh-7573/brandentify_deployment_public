import { ServiceItem, COLORS } from "./types";
import { 
  Lightbulb, Code, Palette, Megaphone, PenTool, GraduationCap, 
  Users, Briefcase, ArrowRight 
} from "lucide-react";

interface ServicesGridProps {
  services: ServiceItem[];
  columns?: 2 | 3;
  onBook?: (serviceId: string | number) => void;
  className?: string;
  isPreview?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  consulting: Lightbulb,
  development: Code,
  design: Palette,
  marketing: Megaphone,
  writing: PenTool,
  coaching: GraduationCap,
  teaching: GraduationCap,
  advisory: Users,
  other: Briefcase
};

const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  columns = 3,
  onBook,
  className = "",
  isPreview = false
}) => {
  if (services.length === 0) return null;

  const displayServices = isPreview ? services.slice(0, 3) : services;

  return (
    <section
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${COLORS.deepCharcoal} 0%, ${COLORS.charcoalBlack} 100%)`
      }}
    >
      <div className={`max-w-7xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'}`}>
        {!isPreview && (
          <div className="text-center mb-12">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                color: COLORS.offWhite
              }}
            >
              Services I Offer
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.coolGray }}>
              Professional services tailored to your needs
            </p>
          </div>
        )}

        <div
          className={`grid gap-${isPreview ? '2' : '6'}`}
          style={{
            gridTemplateColumns: isPreview 
              ? 'repeat(1, 1fr)' 
              : `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {displayServices.map((service, i) => {
            const IconComponent = CATEGORY_ICONS[service.category || 'other'] || Briefcase;
            const accentColor = [COLORS.electricBlue, COLORS.neonPurple, COLORS.mintGreen][i % 3];

            return (
              <div
                key={service.id}
                className={`group relative ${isPreview ? 'p-3' : 'p-6'} rounded-xl transition-all duration-300 hover:-translate-y-1`}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.charcoalBlack}90, ${COLORS.charcoalBlack}70)`,
                  border: `1px solid ${accentColor}30`,
                  boxShadow: `0 4px 20px ${COLORS.charcoalBlack}50`
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
                />

                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 ${isPreview ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
                    style={{
                      background: `${accentColor}20`,
                      border: `1px solid ${accentColor}40`
                    }}
                  >
                    <span style={{ color: accentColor }}>
                      <IconComponent className={`${isPreview ? 'h-4 w-4' : 'h-6 w-6'}`} />
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${isPreview ? 'text-sm' : 'text-lg'} mb-1`}
                      style={{ color: COLORS.offWhite }}
                    >
                      {service.title}
                    </h3>
                    
                    {service.description && !isPreview && (
                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: COLORS.coolGray }}
                      >
                        {service.description}
                      </p>
                    )}

                    {service.deliverables && service.deliverables.length > 0 && !isPreview && (
                      <ul className="space-y-1 mb-4">
                        {service.deliverables.slice(0, 3).map((item, j) => (
                          <li
                            key={j}
                            className="text-xs flex items-center gap-2"
                            style={{ color: COLORS.silverGray }}
                          >
                            <span style={{ color: accentColor }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {!isPreview && (
                      <div className="flex items-center justify-between">
                        {service.priceRange && (
                          <span className="text-xs font-medium" style={{ color: COLORS.coolGray }}>
                            {service.priceRange}
                          </span>
                        )}
                        <button
                          onClick={() => onBook?.(service.id)}
                          className="flex items-center gap-1 text-sm font-medium transition-colors"
                          style={{ color: accentColor }}
                          data-testid={`service-book-${service.id}`}
                        >
                          Book
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
