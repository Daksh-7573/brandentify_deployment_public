import { useState } from "react";
import { ProjectItem, COLORS } from "./types";
import { ExternalLink, Eye, X, ChevronLeft, ChevronRight, Tag } from "lucide-react";

interface ProjectsGridProps {
  projects: ProjectItem[];
  columns?: 2 | 3 | 4;
  masonry?: boolean;
  onOpenProject?: (projectId: string | number) => void;
  className?: string;
  isPreview?: boolean;
}

interface ProjectModalProps {
  project: ProjectItem | null;
  open: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, open, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!open || !project) return null;

  const images = project.thumbnails?.length ? project.thumbnails : [project.coverUrl];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${COLORS.charcoalBlack}, ${COLORS.deepCharcoal})`,
          border: `1px solid ${COLORS.electricBlue}30`
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: `${COLORS.charcoalBlack}90`,
            border: `1px solid ${COLORS.silverGray}30`
          }}
          data-testid="modal-close"
        >
          <X className="h-5 w-5" style={{ color: COLORS.offWhite }} />
        </button>

        <div className="relative aspect-video">
          <img
            src={images[currentImageIndex]}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${COLORS.charcoalBlack}80` }}
              >
                <ChevronLeft className="h-5 w-5" style={{ color: COLORS.offWhite }} />
              </button>
              <button
                onClick={() => setCurrentImageIndex(i => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${COLORS.charcoalBlack}80` }}
              >
                <ChevronRight className="h-5 w-5" style={{ color: COLORS.offWhite }} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      background: i === currentImageIndex ? COLORS.electricBlue : `${COLORS.silverGray}50`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: COLORS.offWhite }}>
                {project.title}
              </h3>
              {project.year && (
                <span className="text-sm" style={{ color: COLORS.coolGray }}>{project.year}</span>
              )}
            </div>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: `${COLORS.electricBlue}20`,
                  color: COLORS.electricBlue
                }}
              >
                <ExternalLink className="h-4 w-4" />
                View Project
              </a>
            )}
          </div>

          {project.description && (
            <p className="text-base leading-relaxed" style={{ color: COLORS.silverGray }}>
              {project.description}
            </p>
          )}

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `${COLORS.neonPurple}20`,
                    color: COLORS.neonPurple
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {project.outcomes && project.outcomes.length > 0 && (
            <div className="pt-4 border-t" style={{ borderColor: `${COLORS.silverGray}20` }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.offWhite }}>
                Key Outcomes
              </h4>
              <ul className="space-y-2">
                {project.outcomes.map((outcome, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: COLORS.silverGray }}
                  >
                    <span style={{ color: COLORS.mintGreen }}>✓</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  columns = 3,
  masonry = false,
  onOpenProject,
  className = "",
  isPreview = false
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  if (projects.length === 0) return null;

  const displayProjects = isPreview ? projects.slice(0, 3) : projects;

  const handleOpenProject = (project: ProjectItem) => {
    setSelectedProject(project);
    onOpenProject?.(project.id);
  };

  return (
    <section
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)`
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
              Featured Projects
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.coolGray }}>
              A showcase of my best work and accomplishments
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
          {displayProjects.map((project, i) => (
            <div
              key={project.id}
              className={`group relative ${isPreview ? '' : 'aspect-[4/3]'} rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]`}
              style={{
                boxShadow: `0 4px 20px ${COLORS.charcoalBlack}50`
              }}
              onClick={() => !isPreview && handleOpenProject(project)}
              data-testid={`project-card-${project.id}`}
            >
              <img
                src={project.coverUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(project.title)}`}
                alt={project.title}
                className={`w-full ${isPreview ? 'h-24' : 'h-full'} object-cover transition-transform duration-500 group-hover:scale-110`}
              />

              <div
                className={`absolute inset-0 flex flex-col justify-end ${isPreview ? 'p-2' : 'p-6'} transition-opacity duration-300`}
                style={{
                  background: `linear-gradient(to top, ${COLORS.deepCharcoal}95, transparent 60%)`,
                  opacity: isPreview ? 1 : 0
                }}
              >
                <h3
                  className={`font-semibold ${isPreview ? 'text-xs' : 'text-lg'} mb-1`}
                  style={{ color: COLORS.offWhite }}
                >
                  {project.title}
                </h3>
                {!isPreview && project.tags && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: `${COLORS.electricBlue}30`,
                          color: COLORS.electricBlue
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!isPreview && (
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `${COLORS.deepCharcoal}80` }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: `${COLORS.electricBlue}30`,
                      border: `2px solid ${COLORS.electricBlue}`
                    }}
                  >
                    <Eye className="h-6 w-6" style={{ color: COLORS.electricBlue }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export default ProjectsGrid;
