import MinimalistPro from "@/components/portfolio/templates/minimalist-pro";
import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import TimelineStoryteller2 from "@/components/portfolio/templates/timeline-storyteller-2";
import VisualExpert from "@/components/portfolio/templates/visual-expert";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";
import Animated from "@/components/portfolio/templates/animated";
import AnimatedOdyssey from "@/components/portfolio/templates/animated-odyssey";
import Scholar from "@/components/portfolio/templates/scholar";
import DesignerShowcase from "@/components/portfolio/templates/designer-showcase";
import PhotographerPortfolio from "@/components/portfolio/templates/photographer-portfolio";

export type PortfolioLayoutKey = 
  | "professional"
  | "creative"
  | "minimal"
  | "technical"
  | "executive"
  | "minimalist_pro"
  | "minimalist-pro"
  | "timeline-storyteller-2"
  | "visual-expert"
  | "corporate-executive"
  | "dynamic-innovator"
  | "freelancer-hub"
  | "animated"
  | "animated-odyssey"
  | "animated_odyssey"
  | "scholar"
  | "designer-portfolio"
  | "photographer-portfolio";

export interface PortfolioTemplateProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    email: string | null;
    photoURL: string | null;
    aboutMe: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    jobLevel: string | null;
    tagline: string | null;
    visionStatement: string | null;
    missionStatement: string | null;
    coreValues: string[];
    uniqueValueProposition: string | null;
    brandName: string | null;
    primaryAudience: string[];
    secondaryAudience: string[];
  };
  userSkills?: Array<{ id: number; skillName: string; proficiencyLevel?: string | null }>;
  userExperiences?: Array<{
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    location?: string | null;
    employmentType?: string | null;
  }>;
  userProjects?: Array<{
    id: number;
    title: string;
    description: string;
    link?: string | null;
    technologies?: string[];
    imageUrl?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  userEducations?: Array<{
    id: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string | null;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  }>;
  userServices?: Array<{
    id: number;
    title: string;
    description: string;
    icon?: string | null;
  }>;
  currentUserId?: number;
}

const layoutAliasMap: Record<string, PortfolioLayoutKey> = {
  // Snake case to kebab case mappings
  "minimalist_pro": "minimalist-pro",
  "animated_odyssey": "animated-odyssey",
  "corporate_executive": "corporate-executive",
  "dynamic_innovator": "dynamic-innovator",
  "freelancer_hub": "freelancer-hub",
  "designer_portfolio": "designer-portfolio",
  "photographer_portfolio": "photographer-portfolio",
  "visual_expert": "visual-expert",
  
  // Legacy aliases from brand-profile and random-profile switch statements
  "minimalist": "minimalist-pro",
  "timeline": "timeline-storyteller-2",
  "visual": "visual-expert",
  "freelancer": "freelancer-hub",
  "dynamic": "dynamic-innovator",
  "corporate": "corporate-executive",
  "executive": "corporate-executive"
};

export function normalizeLayoutKey(layout: string | null | undefined): PortfolioLayoutKey {
  if (!layout) return "corporate-executive";
  
  const normalized = layoutAliasMap[layout] || layout;
  return normalized as PortfolioLayoutKey;
}

type TemplateComponent = React.ComponentType<any>;

const AnimatedWrapper: React.FC<PortfolioTemplateProps> = (props) => {
  return (
    <Animated
      name={props.userInfo.name}
      title={props.userInfo.title || ''}
      industry={props.userInfo.industry || ''}
      domain={props.userInfo.domain || ''}
      location={props.userInfo.location || ''}
      email={props.userInfo.email || ''}
      services={props.userServices as any || []}
      skills={props.userSkills as any || []}
      experiences={props.userExperiences as any || []}
      projects={props.userProjects as any || []}
      educations={props.userEducations as any || []}
    />
  );
};

const AnimatedOdysseyWrapper: React.FC<PortfolioTemplateProps> = (props) => {
  return (
    <AnimatedOdyssey
      id={props.userInfo.id}
      name={props.userInfo.name}
      title={props.userInfo.title || ''}
      industry={props.userInfo.industry || ''}
      domain={props.userInfo.domain || ''}
      location={props.userInfo.location || ''}
      tagline={props.userInfo.tagline || ''}
      lookingFor={props.userInfo.lookingFor || ''}
      whatIOffer={props.userInfo.whatIOffer || ''}
      email={props.userInfo.email || ''}
      photoURL={props.userInfo.photoURL || ''}
      aboutMe={props.userInfo.aboutMe || ''}
      visionStatement={props.userInfo.visionStatement || ''}
      missionStatement={props.userInfo.missionStatement || ''}
      coreValues={props.userInfo.coreValues || []}
      uniqueValueProposition={props.userInfo.uniqueValueProposition || ''}
      services={props.userServices as any || []}
      skills={props.userSkills as any || []}
      experiences={props.userExperiences as any || []}
      projects={props.userProjects as any || []}
      educations={props.userEducations as any || []}
      primaryAudience={props.userInfo.primaryAudience || []}
      secondaryAudience={props.userInfo.secondaryAudience || []}
      currentUserId={props.currentUserId}
    />
  );
};

const templateRegistry: Record<string, TemplateComponent> = {
  "professional": CorporateExecutive as any,
  "creative": VisualExpert as any,
  "minimal": MinimalistPro as any,
  "technical": MinimalistPro as any,
  "executive": CorporateExecutive as any,
  "minimalist-pro": MinimalistPro as any,
  "timeline-storyteller-2": TimelineStoryteller2 as any,
  "visual-expert": VisualExpert as any,
  "corporate-executive": CorporateExecutive as any,
  "dynamic-innovator": DynamicInnovator as any,
  "freelancer-hub": FreelancerHub as any,
  "animated": AnimatedWrapper,
  "animated-odyssey": AnimatedOdysseyWrapper,
  "scholar": Scholar as any,
  "designer-portfolio": DesignerShowcase as any,
  "photographer-portfolio": PhotographerPortfolio as any
};

export function getPortfolioTemplate(layout: string | null | undefined): TemplateComponent {
  const normalizedLayout = normalizeLayoutKey(layout);
  return templateRegistry[normalizedLayout] || CorporateExecutive;
}

export function buildPortfolioTemplateProps(
  userData: any,
  collections: {
    skills?: any[];
    experiences?: any[];
    projects?: any[];
    educations?: any[];
    services?: any[];
  },
  overrides?: Partial<PortfolioTemplateProps>
): PortfolioTemplateProps {
  return {
    userInfo: {
      id: userData?.id,
      name: userData?.name || '',
      title: userData?.title || null,
      email: userData?.email || null,
      photoURL: userData?.photoURL || null,
      aboutMe: userData?.aboutMe || null,
      location: userData?.location || null,
      industry: userData?.industry || null,
      domain: userData?.domain || null,
      lookingFor: userData?.lookingFor || null,
      whatIOffer: userData?.whatIOffer || null,
      jobLevel: userData?.jobLevel || null,
      tagline: userData?.tagline || null,
      visionStatement: userData?.visionStatement || null,
      missionStatement: userData?.missionStatement || null,
      coreValues: userData?.coreValues || [],
      uniqueValueProposition: userData?.uniqueValueProposition || null,
      brandName: userData?.brandName || null,
      primaryAudience: userData?.primaryAudience || [],
      secondaryAudience: userData?.secondaryAudience || []
    },
    userSkills: collections.skills || [],
    userExperiences: collections.experiences || [],
    userProjects: collections.projects || [],
    userEducations: collections.educations || [],
    userServices: collections.services || [],
    ...overrides
  };
}
