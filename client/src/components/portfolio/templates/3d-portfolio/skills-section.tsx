import { Skill, Tool, COLORS } from "./types";
import { 
  Code, Palette, Database, Cloud, Smartphone, Globe,
  FileCode, Terminal, Layers, Cpu, Zap
} from "lucide-react";

interface SkillsSectionProps {
  skills: Skill[];
  tools?: Tool[];
  className?: string;
  isPreview?: boolean;
}

const PROFICIENCY_COLORS: Record<string, string> = {
  Beginner: COLORS.coolGray,
  Intermediate: COLORS.mintGreen,
  Advanced: COLORS.electricBlue,
  Expert: COLORS.neonPurple
};

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  design: Palette,
  database: Database,
  cloud: Cloud,
  mobile: Smartphone,
  web: Globe,
  file: FileCode,
  terminal: Terminal,
  layers: Layers,
  cpu: Cpu,
  default: Zap
};

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  tools = [],
  className = "",
  isPreview = false
}) => {
  if (skills.length === 0) return null;

  const displaySkills = isPreview ? skills.slice(0, 4) : skills;
  const displayTools = isPreview ? tools.slice(0, 6) : tools;

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
              Skills & Expertise
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.coolGray }}>
              Technical proficiencies and tools I work with
            </p>
          </div>
        )}

        <div className={`grid ${isPreview ? 'gap-3' : 'lg:grid-cols-2 gap-12'}`}>
          <div className="space-y-4">
            {!isPreview && (
              <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.offWhite }}>
                Core Skills
              </h3>
            )}
            <div className={`space-y-${isPreview ? '2' : '4'}`}>
              {displaySkills.map((skill, i) => {
                const proficiency = skill.proficiency || 
                  (skill.level === 'Expert' ? 95 : 
                   skill.level === 'Advanced' ? 80 : 
                   skill.level === 'Intermediate' ? 60 : 40);
                const color = PROFICIENCY_COLORS[skill.level || 'Intermediate'] || COLORS.electricBlue;

                return (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium ${isPreview ? 'text-xs' : 'text-sm'}`}
                        style={{ color: COLORS.offWhite }}
                      >
                        {skill.name}
                      </span>
                      {!isPreview && skill.level && (
                        <span className="text-xs font-medium" style={{ color }}>
                          {skill.level}
                        </span>
                      )}
                    </div>
                    <div
                      className={`${isPreview ? 'h-1.5' : 'h-2'} rounded-full overflow-hidden`}
                      style={{ background: `${COLORS.charcoalBlack}` }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${proficiency}%`,
                          background: `linear-gradient(90deg, ${color}, ${COLORS.electricBlue})`,
                          boxShadow: `0 0 10px ${color}50`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {displayTools.length > 0 && (
            <div>
              {!isPreview && (
                <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.offWhite }}>
                  Tools & Technologies
                </h3>
              )}
              <div className={`grid ${isPreview ? 'grid-cols-3 gap-2' : 'grid-cols-3 sm:grid-cols-4 gap-4'}`}>
                {displayTools.map((tool, i) => {
                  const IconComponent = TOOL_ICONS[tool.iconId || 'default'] || TOOL_ICONS.default;
                  const accentColor = [COLORS.electricBlue, COLORS.neonPurple, COLORS.mintGreen][i % 3];

                  return (
                    <div
                      key={tool.id}
                      className={`group ${isPreview ? 'p-2' : 'p-4'} rounded-lg text-center transition-all duration-200 hover:scale-105`}
                      style={{
                        background: `${COLORS.charcoalBlack}80`,
                        border: `1px solid ${accentColor}20`
                      }}
                    >
                      <div
                        className={`mx-auto ${isPreview ? 'w-6 h-6' : 'w-10 h-10'} rounded-lg flex items-center justify-center mb-2 transition-all duration-200`}
                        style={{
                          background: `${accentColor}20`,
                          boxShadow: `0 0 0 ${accentColor}00`
                        }}
                      >
                        <span style={{ color: accentColor }}>
                          <IconComponent className={`${isPreview ? 'h-3 w-3' : 'h-5 w-5'}`} />
                        </span>
                      </div>
                      <span
                        className={`font-medium ${isPreview ? 'text-[10px]' : 'text-xs'}`}
                        style={{ color: COLORS.silverGray }}
                      >
                        {tool.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
