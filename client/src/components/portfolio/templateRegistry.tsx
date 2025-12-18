import FreelancerHub from "@/components/portfolio/templates/freelancer-hub";
import TimelineStoryteller2 from "@/components/portfolio/templates/timeline-storyteller-2";
import CreativeBold from "@/components/portfolio/templates/creative-bold";
import CorporateExecutive from "@/components/portfolio/templates/corporate-executive";
import { DynamicInnovator } from "@/components/portfolio/templates/dynamic-innovator";
import Animated from "@/components/portfolio/templates/animated";
import Scholar from "@/components/portfolio/templates/scholar";
import DesignerShowcase from "@/components/portfolio/templates/designer-showcase";
import PhotographerPortfolio from "@/components/portfolio/templates/photographer-portfolio";
import PastelDreamscape from "@/components/portfolio/templates/pastel-dreamscape";
import NatureCreative from "@/components/portfolio/templates/nature-creative";
import FashionRunway from "@/components/portfolio/templates/fashion-runway";
import FashionIsArt from "@/components/portfolio/templates/fashion-is-art";
import YogaFitnessModel from "@/components/portfolio/templates/yoga-fitness-model";
import ThreeDPortfolio from "@/components/portfolio/templates/3d-portfolio";
import HolographicNeo from "@/components/portfolio/templates/holographic-neo";
import CreativeQuantum from "@/components/portfolio/templates/creative-quantum";
import ArtisticPortfolio from "@/components/portfolio/templates/artistic-portfolio";
import FashionQuantum from "@/components/portfolio/templates/fashion-quantum";
import DesignerPortfolio from "@/components/portfolio/templates/designer-portfolio";
import PhotographyCinematic from "@/components/portfolio/templates/photography-cinematic";
import FitnessPortfolio from "@/components/portfolio/templates/fitness-portfolio";
import CEOExecutivePortfolio from "@/components/portfolio/templates/ceo-executive-portfolio";

export type PortfolioLayoutKey = 
  | "professional"
  | "minimal"
  | "technical"
  | "executive"
  | "timeline-storyteller-2"
  | "creative-bold"
  | "corporate-executive"
  | "dynamic-innovator"
  | "freelancer-hub"
  | "animated"
  | "scholar"
  | "designer-portfolio"
  | "photographer-portfolio"
  | "pastel-dreamscape"
  | "nature-creative"
  | "fashion-runway"
  | "fashion-is-art"
  | "yoga-fitness-model"
  | "3d-portfolio"
  | "holographic-neo"
  | "creative-quantum"
  | "artistic-portfolio"
  | "fashion-quantum"
  | "light-designer"
  | "photography-cinematic"
  | "fitness-portfolio"
  | "ceo-executive";

export interface PortfolioTemplateProps {
  userInfo: {
    id?: number;
    name: string;
    title: string | null;
    company: string | null;
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
    coreValues: string[] | null;
    uniqueValueProposition: string | null;
    brandName: string | null;
    primaryAudience: string[] | null;
    secondaryAudience: string[] | null;
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
  "corporate_executive": "corporate-executive",
  "dynamic_innovator": "dynamic-innovator",
  "freelancer_hub": "freelancer-hub",
  "designer_portfolio": "designer-portfolio",
  "photographer_portfolio": "photographer-portfolio",
  "creative_bold": "creative-bold",
  
  // Legacy aliases from brand-profile and random-profile switch statements
  "minimalist": "scholar",
  "timeline": "timeline-storyteller-2",
  "creative": "creative-bold",
  "freelancer": "freelancer-hub",
  "dynamic": "dynamic-innovator",
  "corporate": "corporate-executive",
  "executive": "corporate-executive",
  "holographic_neo": "holographic-neo",
  "creative_quantum": "creative-quantum",
  "artistic_portfolio": "artistic-portfolio",
  "artistic": "artistic-portfolio",
  "fashion_quantum": "fashion-quantum",
  "fashion-editorial": "fashion-quantum",
  "light_designer": "light-designer",
  "designer_light": "light-designer",
  "photography_cinematic": "photography-cinematic",
  "cinematic_photography": "photography-cinematic"
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

const templateRegistry: Record<string, TemplateComponent> = {
  "professional": CorporateExecutive as any,
  "minimal": Scholar as any,
  "technical": Scholar as any,
  "executive": CorporateExecutive as any,
  "timeline-storyteller-2": TimelineStoryteller2 as any,
  "creative-bold": CreativeBold as any,
  "corporate-executive": CorporateExecutive as any,
  "dynamic-innovator": DynamicInnovator as any,
  "freelancer-hub": FreelancerHub as any,
  "animated": AnimatedWrapper,
  "scholar": Scholar as any,
  "designer-portfolio": DesignerShowcase as any,
  "photographer-portfolio": PhotographerPortfolio as any,
  "pastel-dreamscape": PastelDreamscape as any,
  "nature-creative": NatureCreative as any,
  "fashion-runway": FashionRunway as any,
  "fashion-is-art": FashionIsArt as any,
  "yoga-fitness-model": YogaFitnessModel as any,
  "3d-portfolio": ThreeDPortfolio as any,
  "holographic-neo": HolographicNeo as any,
  "creative-quantum": CreativeQuantum as any,
  "artistic-portfolio": ArtisticPortfolio as any,
  "fashion-quantum": FashionQuantum as any,
  "light-designer": DesignerPortfolio as any,
  "photography-cinematic": PhotographyCinematic as any,
  "fitness-portfolio": FitnessPortfolio as any,
  "ceo-executive": CEOExecutivePortfolio as any
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
  // Helper to parse JSON arrays from database (handles multiple formats)
  const parseArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // Handle PostgreSQL array format: {item1,item2,item3}
      if (value.startsWith('{') && value.endsWith('}')) {
        const content = value.slice(1, -1);
        if (!content) return [];
        // Split by comma and trim, handling quoted items
        return content
          .split(',')
          .map(item => {
            let cleaned = item.trim();
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              cleaned = cleaned.slice(1, -1);
            }
            return cleaned;
          })
          .filter(item => item.length > 0);
      }
      // Handle JSON format: ["item1","item2"]
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // DEBUG: Log what userData contains for branding fields
  console.log("[buildPortfolioTemplateProps] Raw userData branding fields:", {
    tagline: userData?.tagline,
    visionStatement: userData?.visionStatement,
    missionStatement: userData?.missionStatement,
    coreValues: userData?.coreValues,
    uniqueValueProposition: userData?.uniqueValueProposition,
    primaryAudience: userData?.primaryAudience,
    secondaryAudience: userData?.secondaryAudience,
    company: userData?.company
  });

  const parsedCoreValues = parseArray(userData?.coreValues);
  const parsedPrimaryAudience = parseArray(userData?.primaryAudience);
  const parsedSecondaryAudience = parseArray(userData?.secondaryAudience);

  console.log("[buildPortfolioTemplateProps] Parsed arrays:", {
    coreValues: parsedCoreValues,
    primaryAudience: parsedPrimaryAudience,
    secondaryAudience: parsedSecondaryAudience
  });

  return {
    userInfo: {
      id: userData?.id,
      name: userData?.name || '',
      title: userData?.title || null,
      company: userData?.company || null,
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
      coreValues: parsedCoreValues,
      uniqueValueProposition: userData?.uniqueValueProposition || null,
      brandName: userData?.brandName || null,
      primaryAudience: parsedPrimaryAudience,
      secondaryAudience: parsedSecondaryAudience
    },
    userSkills: collections.skills || [],
    userExperiences: collections.experiences || [],
    userProjects: collections.projects || [],
    userEducations: collections.educations || [],
    userServices: collections.services || [],
    ...overrides
  };
}
