import { useMemo } from 'react';
import { ProfileDataExtractor } from './ProfileDataExtractor';
import { TemplateDataMapper, mapToTemplateProps } from './TemplateDataMapper';
import { ProfileCompletionAnalyzer, getProfileCompletionSummary } from './ProfileCompletionAnalyzer';
import type { ExtractedProfileData } from './types';
import { getPortfolioTemplate, normalizeLayoutKey } from '@/components/portfolio/templateRegistry';

interface DynamicPortfolioRendererProps {
  templateId: string;
  userData: any;
  collections: {
    skills?: any[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    services?: any[];
  };
  currentUserId?: number;
  showCompletionBanner?: boolean;
}

export function useDynamicPortfolio(
  templateId: string,
  userData: any,
  collections: {
    skills?: any[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    services?: any[];
  },
  currentUserId?: number
) {
  const extractedData = useMemo(() => {
    const extractor = new ProfileDataExtractor(userData, collections, currentUserId);
    return extractor.extract();
  }, [userData, collections, currentUserId]);

  const templateProps = useMemo(() => {
    const mapper = new TemplateDataMapper(extractedData, templateId);
    return mapper.getTemplateProps();
  }, [extractedData, templateId]);

  const completionAnalysis = useMemo(() => {
    const analyzer = new ProfileCompletionAnalyzer(extractedData);
    return {
      result: analyzer.analyze(),
      summary: analyzer.getSummary(),
      suggestions: analyzer.getSuggestions(),
    };
  }, [extractedData]);

  const TemplateComponent = useMemo(() => {
    return getPortfolioTemplate(templateId);
  }, [templateId]);

  return {
    extractedData,
    templateProps,
    completionAnalysis,
    TemplateComponent,
    normalizedTemplateId: normalizeLayoutKey(templateId),
  };
}

export function DynamicPortfolioRenderer({
  templateId,
  userData,
  collections,
  currentUserId,
  showCompletionBanner = false,
}: DynamicPortfolioRendererProps) {
  const {
    templateProps,
    completionAnalysis,
    TemplateComponent,
  } = useDynamicPortfolio(templateId, userData, collections, currentUserId);

  return (
    <div className="dynamic-portfolio-container">
      {showCompletionBanner && completionAnalysis.summary.score < 100 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-amber-800 text-sm">
            <span className="font-semibold">Profile Completion: {completionAnalysis.summary.score}%</span>
            {' - '}
            {completionAnalysis.summary.message}
          </p>
        </div>
      )}
      <TemplateComponent
        userInfo={templateProps.userInfo}
        userSkills={templateProps.userSkills}
        userExperiences={templateProps.userExperiences}
        userProjects={templateProps.userProjects}
        userEducations={templateProps.userEducations}
        userServices={templateProps.userServices}
        currentUserId={templateProps.currentUserId}
      />
    </div>
  );
}

export function renderPortfolio(
  templateId: string,
  extractedData: ExtractedProfileData
): JSX.Element {
  const templateProps = mapToTemplateProps(extractedData);
  const TemplateComponent = getPortfolioTemplate(templateId);

  return (
    <TemplateComponent
      userInfo={templateProps.userInfo}
      userSkills={templateProps.userSkills}
      userExperiences={templateProps.userExperiences}
      userProjects={templateProps.userProjects}
      userEducations={templateProps.userEducations}
      userServices={templateProps.userServices}
      currentUserId={templateProps.currentUserId}
    />
  );
}

export function extractAndRenderPortfolio(
  templateId: string,
  userData: any,
  collections: {
    skills?: any[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    services?: any[];
  },
  currentUserId?: number
): {
  element: JSX.Element;
  completionScore: number;
  suggestions: string[];
} {
  const extractor = new ProfileDataExtractor(userData, collections, currentUserId);
  const extractedData = extractor.extract();
  
  const analyzer = new ProfileCompletionAnalyzer(extractedData);
  const summary = analyzer.getSummary();
  const suggestions = analyzer.getSuggestions();

  const element = renderPortfolio(templateId, extractedData);

  return {
    element,
    completionScore: summary.score,
    suggestions,
  };
}
