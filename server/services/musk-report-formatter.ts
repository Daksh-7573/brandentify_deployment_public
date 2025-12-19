/**
 * Musk Report Formatter
 * Structures Musk's analysis responses into professional, well-formatted reports
 */

export type ReportType = 'resume' | 'pitch-deck' | 'career-guidance' | 'general';

export interface FormattedReport {
  type: ReportType;
  title: string;
  timestamp: string;
  content: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  icon: string;
  content: string;
}

/**
 * Format a raw Musk analysis response into a professional structured report
 */
export function formatMuskReport(
  rawContent: string,
  reportType: ReportType = 'general',
  title?: string
): string {
  // Parse and structure the content
  const structured = structureContent(rawContent, reportType);
  
  // Build the formatted report with proper markdown structure
  return buildFormattedReport(structured, reportType, title);
}

/**
 * Structure content by identifying key sections
 */
function structureContent(content: string, reportType: ReportType) {
  const sections: ReportSection[] = [];
  
  // Define section patterns based on report type
  const sectionPatterns = getSectionPatterns(reportType);
  
  // Extract sections using patterns
  let currentContent = content;
  
  for (const pattern of sectionPatterns) {
    const regex = new RegExp(pattern.regex, 'gmi');
    const match = regex.exec(currentContent);
    
    if (match) {
      sections.push({
        title: pattern.title,
        icon: pattern.icon,
        content: match[1] || match[0]
      });
    }
  }
  
  // If no sections found, treat entire content as one section
  if (sections.length === 0) {
    sections.push({
      title: 'Analysis',
      icon: '📊',
      content: content
    });
  }
  
  return sections;
}

/**
 * Get section patterns based on report type
 */
function getSectionPatterns(reportType: ReportType) {
  const commonPatterns = [
    {
      title: 'Executive Summary',
      icon: '📋',
      regex: '(?:executive\\s+summary|summary|overview)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    },
    {
      title: 'Key Findings',
      icon: '🔍',
      regex: '(?:key\\s+findings|findings|analysis)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    },
    {
      title: 'Strengths',
      icon: '✅',
      regex: '(?:strengths|what\'s\\s+working|positive)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    },
    {
      title: 'Areas for Improvement',
      icon: '⚠️',
      regex: '(?:areas?\\s+for\\s+improvement|weaknesses|improvements?|challenges)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    },
    {
      title: 'Recommendations',
      icon: '💡',
      regex: '(?:recommendations?|next\\s+steps?|action\\s+items?)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    },
    {
      title: 'Score & Rating',
      icon: '⭐',
      regex: '(?:score|rating|overall)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
    }
  ];
  
  // Add report-type specific patterns
  if (reportType === 'resume') {
    return [
      {
        title: 'Resume Score',
        icon: '📊',
        regex: '(?:resume\\s+score|overall\\s+score)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
      },
      ...commonPatterns
    ];
  }
  
  if (reportType === 'pitch-deck') {
    return [
      {
        title: 'Pitch Score',
        icon: '📈',
        regex: '(?:pitch\\s+score|investor\\s+readiness)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
      },
      {
        title: 'Problem & Solution',
        icon: '🎯',
        regex: '(?:problem|solution)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
      },
      {
        title: 'Market Opportunity',
        icon: '🌍',
        regex: '(?:market|opportunity)[:\\n]+(.*?)(?=\\n##|\\n###|$)'
      },
      ...commonPatterns
    ];
  }
  
  return commonPatterns;
}

/**
 * Build a professionally formatted report with markdown
 */
function buildFormattedReport(
  sections: ReportSection[],
  reportType: ReportType,
  title?: string
): string {
  let report = '';
  
  // Add title/header
  const reportTitle = title || getDefaultTitle(reportType);
  report += `# ${reportTitle}\n\n`;
  
  // Add metadata bar
  report += `> 📅 Generated: ${new Date().toLocaleDateString()} | 🤖 Analyzed by Musk AI\n\n`;
  
  // Add sections with proper formatting
  for (const section of sections) {
    report += `## ${section.icon} ${section.title}\n\n`;
    
    // Format the content - ensure proper markdown
    const formattedContent = formatSectionContent(section.content, section.title);
    report += formattedContent;
    report += '\n\n';
  }
  
  // Add footer
  report += `---\n\n`;
  report += `**💭 Note:** This analysis is based on AI-powered evaluation. For career decisions, consider this alongside human feedback and professional advice.\n`;
  
  return report;
}

/**
 * Format section content to ensure proper markdown
 */
function formatSectionContent(content: string, sectionTitle: string): string {
  // Clean up content
  let formatted = content.trim();
  
  // If content contains bullet points without proper markdown, fix it
  if (!formatted.startsWith('-') && !formatted.startsWith('*')) {
    // Convert numbered lists if present
    formatted = formatted.replace(/^\d+\.\s+/gm, '- ');
  }
  
  // Ensure proper spacing between bullets
  formatted = formatted.replace(/\n(?!-|\*|\n)/gm, '\n');
  
  // Add emphasis to key phrases based on section
  if (sectionTitle.includes('Strength')) {
    formatted = formatted.replace(/(\w+\s+\w+)/g, (match) => {
      if (isKeyPhrase(match)) {
        return `**${match}**`;
      }
      return match;
    });
  }
  
  return formatted;
}

/**
 * Check if a phrase is a key phrase worth emphasizing
 */
function isKeyPhrase(phrase: string): boolean {
  const keyWords = ['strong', 'excellent', 'great', 'outstanding', 'impressive', 'clear', 'well-written'];
  return keyWords.some(word => phrase.toLowerCase().includes(word));
}

/**
 * Get default title based on report type
 */
function getDefaultTitle(reportType: ReportType): string {
  const titles = {
    'resume': '📄 Resume Analysis Report',
    'pitch-deck': '🚀 Pitch Deck Analysis Report',
    'career-guidance': '🎯 Career Guidance Report',
    'general': '📊 Musk Analysis Report'
  };
  
  return titles[reportType] || titles['general'];
}

/**
 * Format Musk's analysis response with professional styling
 * This adds visual structure while maintaining the original content
 */
export function wrapAnalysisAsReport(
  analysis: string,
  type: ReportType,
  userData?: { name?: string; title?: string }
): string {
  const formattedReport = formatMuskReport(analysis, type);
  
  // Add user context if available
  let result = formattedReport;
  
  if (userData?.name) {
    result = `**For:** ${userData.name}${userData.title ? ` (${userData.title})` : ''}\n\n${result}`;
  }
  
  return result;
}

/**
 * Quick report formatter - for simpler formatting without full structure
 */
export function formatAsSection(
  title: string,
  content: string,
  icon: string = '📝'
): string {
  return `## ${icon} ${title}\n\n${content}\n`;
}

/**
 * Create a comparison report (before/after style)
 */
export function createComparisonReport(
  beforeScore: number,
  afterScore: number,
  improvementAreas: string[],
  nextSteps: string[]
): string {
  let report = `## 📈 Improvement Potential\n\n`;
  
  report += `| Metric | Score | Potential |\n`;
  report += `|--------|-------|----------|\n`;
  report += `| Current | ${beforeScore}/100 | ${afterScore}/100 |\n`;
  report += `| Growth | - | +${afterScore - beforeScore} points |\n\n`;
  
  report += `## ✨ Areas to Focus On\n\n`;
  for (const area of improvementAreas) {
    report += `- ${area}\n`;
  }
  
  report += `\n## 🎯 Next Steps\n\n`;
  for (const step of nextSteps) {
    report += `- ${step}\n`;
  }
  
  return report;
}
