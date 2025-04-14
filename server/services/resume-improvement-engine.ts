/**
 * Resume Improvement Engine
 * 
 * A multi-layered system that provides intelligent resume improvement suggestions based on
 * bullet-level intelligence, section-level recommendations, role/industry customization,
 * formatting suggestions, and more.
 */

/**
 * Generate prompt for bullet-level improvements
 * @returns Prompt for improving resume bullet points
 */
export function generateBulletLevelPrompt(): string {
  return `
  As a bullet-level resume improvement expert, analyze each bullet point for:

  1. Weak phrasing: Replace passive phrases like "Responsible for managing..." with active statements like "Led a team of 5 to execute 3+ marketing campaigns with 24% average ROI"
  
  2. Missing metrics: Add quantifiable results to vague statements. Turn "Worked on improving customer satisfaction" into "Improved customer satisfaction by 27% through implementing a new feedback system"
  
  3. Fluff or filler: Eliminate vague phrases like "Various tasks including..." and replace with specific accomplishments
  
  4. Passive language: Replace "Tasked with..." or "Involved in..." with active verbs like "Initiated", "Led", "Achieved", "Developed"
  
  5. Structure issues: Ensure each bullet follows the formula: Action Verb + Specific Task + Method + Result/Impact

  Always suggest a better, more impactful version for each weak bullet point you identify.
  `;
}

/**
 * Generate prompt for section-level improvements
 * @returns Prompt for improving resume sections
 */
export function generateSectionLevelPrompt(): string {
  return `
  As a section-level resume improvement expert, analyze and provide specific recommendations for these key sections:

  1. Summary/Profile:
     - Check if it captures expertise, unique value proposition, and future intent
     - Suggest rewriting for clarity, confidence, and industry focus
     - Recommend including years of experience, specialization, and key achievements

  2. Experience:
     - Verify it's in reverse chronological order with high-impact, easy-to-skim content
     - Suggest trimming older roles if they're less relevant
     - Recommend bullet formatting improvements and adding key projects
     - Check for proper date formatting and position titles

  3. Skills:
     - Look for missing keywords relevant to the target industry
     - Suggest reordering by relevance to the target role
     - Identify gaps in technical skills versus job market demands
     - Recommend adding in-demand tools and technologies

  4. Education:
     - Check if key achievements are highlighted (Dean's list, GPA, relevant coursework)
     - Suggest formatting improvements for clarity
     - Recommend adding relevant projects or academic achievements

  5. Certifications/Additional Sections:
     - Identify if certifications are relevant or outdated
     - Suggest hiding expired certifications or adding new ones
     - Recommend additional sections that could strengthen the resume (Projects, Volunteering, etc.)

  For each section, provide specific, actionable suggestions for improvement based on current resume content.
  `;
}

/**
 * Generate prompt for role and industry-based customization
 * @param targetRole The target role (if available)
 * @param targetIndustry The target industry (if available)
 * @returns Prompt for role/industry-specific resume customization
 */
export function generateRoleIndustryCustomizationPrompt(targetRole?: string, targetIndustry?: string): string {
  let roleIndustryPrompt = `
  As a role and industry customization expert, provide targeted recommendations to optimize this resume for`;
  
  if (targetRole && targetIndustry) {
    roleIndustryPrompt += ` a ${targetRole} position in the ${targetIndustry} industry.`;
  } else if (targetRole) {
    roleIndustryPrompt += ` a ${targetRole} position.`;
  } else if (targetIndustry) {
    roleIndustryPrompt += ` the ${targetIndustry} industry.`;
  } else {
    roleIndustryPrompt += ` the candidate's most likely target roles based on their experience.`;
  }

  roleIndustryPrompt += `
  
  Consider these role-specific adjustments:

  1. For Product Manager roles: Focus on collaboration, roadmap development, agile methodologies, and business outcomes
  2. For Data Analyst roles: Emphasize SQL proficiency, insights generation, data visualization skills, and measurable results
  3. For Designer roles: Showcase projects, design process, tools expertise, and visual impact
  4. For Consultant roles: Highlight impact language, stakeholder management, strategic thinking, and client outcomes
  5. For Developer roles: Feature clean formatting, technology stack details, GitHub links, and technical achievements

  Provide specific suggestions for:
  1. Key skills to emphasize or add for the target role/industry
  2. Experience highlights to promote based on role relevance
  3. Industry-specific terminology to incorporate
  4. Achievements that would resonate with hiring managers in this field
  5. Sections to expand or condense based on industry expectations
  `;

  return roleIndustryPrompt;
}

/**
 * Generate prompt for formatting and visual improvements
 * @returns Prompt for resume formatting recommendations
 */
export function generateFormattingPrompt(): string {
  return `
  As a resume formatting and visual improvement expert, analyze the structure and readability of this resume and provide specific recommendations for:

  1. Text density and readability:
     - Identify if the resume has overly dense text blocks
     - Suggest line spacing, bullet grouping, or white space improvements
     - Recommend ways to improve skimmability for busy recruiters

  2. Layout and structure:
     - Check for consistent formatting across sections
     - Identify font issues or readability problems
     - Suggest overall template improvements for the specific role
     - Recommend one-page versus two-page format based on experience level

  3. ATS compatibility:
     - Flag potentially problematic elements like tables, graphics, or unusual formatting
     - Suggest text-based alternatives for non-ATS-friendly elements
     - Recommend header/footer adjustments if needed

  4. Section organization:
     - Identify missing key resume sections (Projects, Summary, Certifications, etc.)
     - Suggest optimal section ordering for maximum impact
     - Recommend section headers and subheaders for clarity

  5. Visual hierarchy:
     - Check for consistent use of bold, italics, and capitalization
     - Suggest improvements for distinguishing job titles, companies, dates
     - Recommend bullet point style and indentation for readability

  Provide clear, specific formatting suggestions that will make the resume more appealing, readable, and effective for both human reviewers and ATS systems.
  `;
}

/**
 * Generate prompt for suggesting missing elements
 * @returns Prompt for identifying and suggesting missing resume elements
 */
export function generateSmartAdditionsPrompt(): string {
  return `
  As a resume completion expert, identify key elements missing from this resume and provide specific recommendations to add them:

  1. Look for these common omissions:
     - Lack of quantifiable metrics or results in experience descriptions
     - Missing soft skills demonstrations or examples
     - Absent or weak projects section
     - No certifications or professional development
     - Missing keywords for target roles
     - Incomplete or nonexistent LinkedIn profile link
     - Absence of a professional summary or objective
     - No indication of technical proficiency levels

  2. For each missing element, provide:
     - A clear explanation of why this element matters
     - A specific suggestion for adding it (with an example)
     - Where exactly it should be placed in the resume

  3. Specifically identify:
     - If there are no metrics, suggest 2-3 ways to quantify achievements
     - If soft skills aren't demonstrated, provide examples tied to experience
     - If projects are missing, suggest adding 2-3 relevant ones
     - If certifications are absent, recommend relevant ones for their field
     - If keywords are missing, list 5-7 specific ones to incorporate

  Be actionable in your suggestions, providing specific examples of what to add and how to phrase it based on the existing resume content.
  `;
}

/**
 * Generate prompt for complete resume rewriting
 * @param targetRole Optional target role for customization
 * @returns Prompt for comprehensive resume rewriting
 */
export function generateRewriteEnginePrompt(targetRole?: string): string {
  let rewritePrompt = `
  As an expert resume rewriter, transform key sections of this resume to make them more result-oriented, confident, and quantifiable`;
  
  if (targetRole) {
    rewritePrompt += `, targeting a ${targetRole} role.`;
  } else {
    rewritePrompt += `.`;
  }

  rewritePrompt += `
  
  Focus on these rewriting priorities:

  1. Professional summary transformation:
     - Rewrite to follow the structure: expertise + experience + key achievement + unique value
     - Convert passive language to active, confident statements
     - Add missing metrics and specific expertise areas
     - Incorporate relevant keywords for ATS optimization

  2. Work experience bullet transformation:
     - Rewrite weak bullets using this formula: Action Verb + Specific Task + Method + Result/Impact
     - Convert passive statements to active ones
     - Add missing metrics where possible (percentages, dollar amounts, time saved)
     - Eliminate filler words and vague language
     - Match language to target job description keywords

  3. Skills section enhancement:
     - Reorganize skills into logical groupings (technical, soft, domain-specific)
     - Add proficiency levels where appropriate
     - Replace generic skills with specific, in-demand ones
     - Ensure alignment with the experience described in work history

  4. Additional sections improvement:
     - Rewrite project descriptions to highlight outcomes and technologies
     - Enhance education section with relevant achievements
     - Improve certification descriptions to highlight relevance

  For each rewrite, maintain the candidate's true experience while enhancing the presentation to maximize impact and ATS compatibility.
  `;

  return rewritePrompt;
}

/**
 * Generate prompt for resume scoring and feedback
 * @returns Prompt for scoring and providing feedback on resume elements
 */
export function generateScoringPrompt(): string {
  return `
  As a resume evaluation expert, provide a detailed scorecard with constructive feedback:

  1. For each major resume component, assign a score out of 10 and provide specific improvement feedback:
  
     - Professional Summary: Score based on clarity, impact, and relevance to target roles
     - Experience Bullets: Evaluate for action-oriented language, quantifiable results, and compelling achievements
     - Skills Section: Score for relevance, organization, and alignment with job market demands
     - Education & Certifications: Evaluate for presentation and highlighting of relevant achievements
     - Overall Format & Layout: Score for readability, professional appearance, and ATS compatibility
     - Keyword Optimization: Evaluate for presence of industry-relevant terms and strategic placement
     - Overall Impact: Assess the resume's ability to showcase the candidate's unique value proposition

  2. For each component, provide:
     - Specific reasons for the score
     - 1-2 clear recommendations for improvement
     - Examples of how to implement the recommendations

  3. Identify the strongest sections and the areas most in need of improvement, with prioritized suggestions for enhancement.

  Be honest but constructive in your assessment, focusing on actionable improvements rather than just identifying flaws.
  `;
}

/**
 * Generate prompt for handling special cases
 * @returns Prompt for addressing special resume situations
 */
export function generateEdgeCasesPrompt(): string {
  return `
  As a resume specialist for complex situations, identify if this resume falls into any of these special categories and provide tailored recommendations:

  1. For freelancers with mixed roles:
     - Suggest grouping by skill category (e.g., "Design Projects," "Content Strategy")
     - Recommend highlighting consistent skills across varied experiences
     - Advise on showcasing diverse client work effectively

  2. For career gaps:
     - Provide tactful formatting suggestions to minimize gap emphasis
     - Recommend how to address gaps honestly yet positively
     - Suggest relevant activities during gaps (education, freelance, volunteering)

  3. For career switchers:
     - Identify and highlight transferable skills relevant to the target industry
     - Suggest reorganizing experience to emphasize relevant capabilities
     - Recommend additional sections to build credibility in the new field

  4. For overloaded resumes:
     - Suggest specific content to trim for better focus
     - Recommend consolidation strategies for lengthy experience
     - Provide guidance on what to prioritize based on target roles

  5. For non-technical people applying to tech roles:
     - Suggest project additions to demonstrate relevant capabilities
     - Recommend basic upskilling opportunities to mention
     - Advise how to reframe existing experience in tech-relevant ways

  If the resume fits any of these scenarios, provide detailed, specific recommendations tailored to that situation. If not, indicate that no special case handling is needed.
  `;
}

/**
 * Generate a comprehensive resume improvement prompt combining all layers
 * @param targetRole Optional target role for customization
 * @param targetIndustry Optional target industry for customization
 * @returns Complete, multi-layered resume improvement prompt
 */
export function generateCompleteResumeImprovementPrompt(targetRole?: string, targetIndustry?: string): string {
  return `
  # MULTI-LAYERED RESUME IMPROVEMENT ANALYSIS
  
  Analyze this resume through multiple expert lenses to provide comprehensive improvement recommendations:
  
  ${generateBulletLevelPrompt()}
  
  ${generateSectionLevelPrompt()}
  
  ${generateRoleIndustryCustomizationPrompt(targetRole, targetIndustry)}
  
  ${generateFormattingPrompt()}
  
  ${generateSmartAdditionsPrompt()}
  
  ${generateRewriteEnginePrompt(targetRole)}
  
  ${generateScoringPrompt()}
  
  ${generateEdgeCasesPrompt()}
  
  # OUTPUT STRUCTURE
  
  Organize your analysis in this exact structure:
  
  1. Begin with an encouraging opening tailored to the resume quality, choosing one of these based on your analysis:
     - For resumes with weak/no quantifiable achievements: "Let's give your CV a power-up!"
     - For resumes with passive wording: "You've done more than your resume shows. Let me fix that."
     - For resumes with solid experience but poor formatting: "Your experience is solid, but the design might be hurting you."
     - For resumes showing high impact but suggesting low compensation: "You might be undercharging based on your results."
  
  2. Present your findings and recommendations in these sections:
     - Resume Scorecard (scores with brief explanations)
     - Top 3 Strengths (with examples from the resume)
     - Priority Improvements (ranked by impact)
     - Bullet Point Transformations (before/after examples)
     - Section-by-Section Recommendations
     - Format & Visual Enhancements
     - Missing Elements to Add
     - Keywords & ATS Optimization
     - Special Considerations (if applicable)
  
  3. Conclude with a "One-Week Transformation Plan" with specific day-by-day actions
  
  Make all recommendations extremely specific, actionable, and tailored to this exact resume's content.
  `;
}