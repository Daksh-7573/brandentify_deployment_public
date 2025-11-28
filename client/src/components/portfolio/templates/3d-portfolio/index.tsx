import { useMemo } from "react";
import { PortfolioTemplateProps } from "../../templateRegistry";
import { ThreeDCardProfile, ProjectItem, TimelineEntry, COLORS } from "./types";
import HeroSection from "./hero-section";
import ProjectsGrid from "./projects-grid";
import TimelineSection from "./timeline-section";
import ContactSection from "./contact-section";
import { Sparkles } from "lucide-react";

interface ThreeDPortfolioProps extends PortfolioTemplateProps {
  isPreview?: boolean;
}

const ThreeDPortfolio: React.FC<ThreeDPortfolioProps> = ({
  userInfo,
  userSkills = [],
  userExperiences = [],
  userProjects = [],
  userEducations = [],
  userServices = [],
  currentUserId,
  isPreview = false
}) => {
  const cardProfile: ThreeDCardProfile = useMemo(() => ({
    id: userInfo.id || 0,
    name: userInfo.name || 'Your Name',
    title: userInfo.title || undefined,
    photoUrl: userInfo.photoURL || undefined,
    location: userInfo.location || undefined,
    company: userInfo.industry || userInfo.domain || undefined,
    industryTags: [
      userInfo.industry,
      userInfo.domain,
      ...(userInfo.coreValues || []).slice(0, 1)
    ].filter(Boolean) as string[],
    contact: {
      email: userInfo.email || undefined,
      profileUrl: userInfo.brandName 
        ? `brandentifier.com/@${userInfo.brandName.toLowerCase().replace(/\s+/g, '-')}`
        : undefined
    }
  }), [userInfo]);

  const cardDimensions = useMemo(() => ({
    width: isPreview ? 280 : 420,
    height: isPreview ? 380 : 400
  }), [isPreview]);


  const projects: ProjectItem[] = useMemo(() =>
    userProjects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || undefined,
      coverUrl: p.imageUrl || `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.title)}`,
      tags: p.technologies || [],
      link: p.link || undefined,
      year: p.endDate ? new Date(p.endDate).getFullYear() : undefined
    }))
  , [userProjects]);


  const timeline: TimelineEntry[] = useMemo(() => {
    const entries: TimelineEntry[] = [];
    
    userExperiences.forEach(exp => {
      entries.push({
        id: `exp-${exp.id}`,
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        location: exp.location || undefined,
        shortDesc: exp.description || undefined,
        type: 'experience'
      });
    });
    
    userEducations.forEach(edu => {
      entries.push({
        id: `edu-${edu.id}`,
        title: edu.degree,
        institution: edu.institution,
        startDate: edu.startDate,
        endDate: edu.endDate,
        location: (edu as any).location || undefined,
        shortDesc: edu.fieldOfStudy || undefined,
        type: 'education'
      });
    });
    
    return entries;
  }, [userExperiences, userEducations]);

  const goodAtSummary = useMemo(() => {
    if (userSkills.length > 0) {
      const topSkills = userSkills.slice(0, 6).map(s => s.skillName).join(', ');
      return topSkills || undefined;
    }
    return undefined;
  }, [userSkills]);

  const heroCopy = useMemo(() => ({
    heading: userInfo.tagline || `Hi, I'm ${userInfo.name}`,
    subheading: userInfo.title || undefined,
    jobLevel: userInfo.jobLevel || undefined,
    company: userInfo.industryTags?.[0] || undefined,
    visionStatement: userInfo.visionStatement || undefined,
    paragraph: userInfo.aboutMe || userInfo.uniqueValueProposition || undefined,
    whatIOffer: userInfo.whatIOffer || undefined,
    goodAt: goodAtSummary,
    missionStatement: userInfo.missionStatement || undefined,
    coreValues: userInfo.coreValues || undefined,
    lookingFor: userInfo.lookingFor || undefined,
    primaryAudience: userInfo.primaryAudience || undefined,
    secondaryAudience: userInfo.secondaryAudience || undefined,
    primaryCta: { label: "Let's Talk", onClick: () => {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
    }},
    secondaryCta: { label: "View Projects", onClick: () => {
      document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
    }}
  }), [userInfo, goodAtSummary]);

  const contact = useMemo(() => ({
    email: userInfo.email || undefined,
    phone: (userInfo as any).phoneNumber || undefined,
    location: userInfo.location || undefined,
    profileUrl: userInfo.brandName 
      ? `brandentifier.com/@${userInfo.brandName.toLowerCase().replace(/\s+/g, '-')}`
      : undefined
  }), [userInfo]);

  if (isPreview) {
    return (
      <div 
        className="w-full h-full overflow-hidden rounded-lg"
        style={{ 
          background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)` 
        }}
      >
        <HeroSection
          profile={cardProfile}
          heroCopy={heroCopy}
          enableTilt={false}
          isPreview={true}
          cardWidth={cardDimensions.width}
          cardHeight={cardDimensions.height}
        />
        {projects.length > 0 && <ProjectsGrid projects={projects} isPreview={true} />}
        {timeline.length > 0 && <TimelineSection entries={timeline} isPreview={true} />}
        <ContactSection contact={contact} isPreview={true} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)` 
      }}
    >
      <nav 
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ 
          background: `rgba(15, 23, 36, 0.85)`,
          borderBottom: `1px solid ${COLORS.electricBlue}20`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: COLORS.electricBlue }} />
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['About', 'Expertise', 'Projects', 'Experience', 'Contact'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}-section`}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: COLORS.coolGray }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main>
        <div id="about-section">
          <HeroSection
            profile={cardProfile}
            heroCopy={heroCopy}
            cardWidth={cardDimensions.width}
            cardHeight={cardDimensions.height}
            onCardAction={(action) => {
              if (action === 'contact') {
                document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </div>

        {(heroCopy.goodAt || heroCopy.whatIOffer) && (
          <div id="expertise-section" className="py-16 lg:py-24" style={{ background: `linear-gradient(135deg, ${COLORS.charcoalBlack} 0%, ${COLORS.deepCharcoal} 100%)` }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {heroCopy.goodAt && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl font-bold mb-2" style={{ color: COLORS.offWhite, fontFamily: "'Sora', 'Inter', sans-serif" }}>
                        What I'm Good At
                      </h3>
                      <div className="h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${COLORS.electricBlue}, ${COLORS.neonPurple})` }} />
                    </div>
                    <p className="text-lg leading-relaxed" style={{ color: COLORS.coolGray }}>
                      {heroCopy.goodAt}
                    </p>
                  </div>
                )}
                {heroCopy.whatIOffer && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl font-bold mb-2" style={{ color: COLORS.offWhite, fontFamily: "'Sora', 'Inter', sans-serif" }}>
                        What I Offer
                      </h3>
                      <div className="h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${COLORS.mintGreen}, ${COLORS.electricBlue})` }} />
                    </div>
                    <p className="text-lg leading-relaxed" style={{ color: COLORS.coolGray }}>
                      {heroCopy.whatIOffer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div id="projects-section">
            <ProjectsGrid projects={projects} columns={3} />
          </div>
        )}

        {timeline.length > 0 && (
          <div id="experience-section">
            <TimelineSection entries={timeline} />
          </div>
        )}

        <div id="contact-section">
          <ContactSection 
            contact={contact}
            onSubmit={async (values) => {
              console.log('Contact form submitted:', values);
            }}
          />
        </div>
      </main>

      <footer
        className="py-8 text-center"
        style={{
          background: COLORS.deepCharcoal,
          borderTop: `1px solid ${COLORS.electricBlue}20`
        }}
      >
        <p className="text-sm" style={{ color: COLORS.coolGray }}>
          Built with <span style={{ color: COLORS.electricBlue }}>Brandentifier</span> &middot; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default ThreeDPortfolio;
