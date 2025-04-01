import { WorkExperience, Education, Skill, InsertWorkExperience, InsertEducation, InsertSkill } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with the API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Parse structured resume text (output from GPT-based processing)
 */
function parseStructuredResumeText(text: string): {
  experiences: InsertWorkExperience[];
  educations: InsertEducation[];
  skills: InsertSkill[];
  title?: string;
  location?: string;
  error?: string;
} {
  console.log("Parsing structured resume text");
  
  try {
    // Extract work experience section
    const workExpSection = text.match(/WORK EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE[\s\S]*?(?=EDUCATION|SKILLS|BASIC INFO|$)/i)?.[0] || '';
    
    // Extract education section
    const educationSection = text.match(/EDUCATION[\s\S]*?(?=WORK EXPERIENCE|EMPLOYMENT HISTORY|SKILLS|BASIC INFO|$)/i)?.[0] || '';
    
    // Extract skills section
    const skillsSection = text.match(/SKILLS[\s\S]*?(?=WORK EXPERIENCE|EMPLOYMENT HISTORY|EDUCATION|BASIC INFO|$)/i)?.[0] || '';
    
    // Extract basic info section
    const basicInfoSection = text.match(/BASIC INFO[\s\S]*?(?=WORK EXPERIENCE|EMPLOYMENT HISTORY|EDUCATION|SKILLS|$)/i)?.[0] || '';
    
    console.log(`Found sections: 
      - Work Experience: ${workExpSection.length > 0 ? 'Yes' : 'No'}
      - Education: ${educationSection.length > 0 ? 'Yes' : 'No'}
      - Skills: ${skillsSection.length > 0 ? 'Yes' : 'No'}
      - Basic Info: ${basicInfoSection.length > 0 ? 'Yes' : 'No'}`);
    
    // Parse Work Experience
    const experiences: InsertWorkExperience[] = [];
    const expBlocks = workExpSection.split(/\n(?=[A-Z])/g).filter(block => 
      block.trim().length > 10 && !block.trim().startsWith('WORK EXPERIENCE') && 
      !block.trim().startsWith('EMPLOYMENT HISTORY'));
    
    for (const block of expBlocks) {
      const lines = block.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 2) continue;
      
      // First line often contains title and company
      const titleCompanyLine = lines[0];
      const titleMatch = titleCompanyLine.match(/(.*?)(?:at|@|\s-\s|\sat\s)(.*)/i);
      
      let title = titleCompanyLine;
      let company = '';
      
      if (titleMatch) {
        title = titleMatch[1].trim();
        company = titleMatch[2].trim();
      } else if (lines.length > 1) {
        // Try second line for company if not in first
        company = lines[1].trim();
      }
      
      // Look for dates
      const dateMatch = block.match(/(\w+ \d{4})\s*(?:-|–|to)\s*(\w+ \d{4}|Present|Current)/i) || 
                        block.match(/(\d{4})\s*(?:-|–|to)\s*(\d{4}|Present|Current)/i);
      
      const startDate = dateMatch ? dateMatch[1] : 'Unknown';
      const endDate = dateMatch ? dateMatch[2] : null;
      
      // Look for location
      const locationMatch = block.match(/(?:^|\n)([A-Za-z]+,\s*[A-Za-z]+|\w+\s+\w+,\s*[A-Z]{2})/);
      const location = locationMatch ? locationMatch[1] : null;
      
      // Description is everything else
      let description = lines.slice(2).join('\n').trim();
      if (description.length === 0) description = null;
      
      if (title && company) {
        experiences.push({
          userId: 0,
          title,
          company,
          startDate,
          endDate,
          location,
          description
        });
      }
    }
    
    // Parse Education
    const educations: InsertEducation[] = [];
    const eduBlocks = educationSection.split(/\n(?=[A-Z])/g).filter(block => 
      block.trim().length > 10 && !block.trim().startsWith('EDUCATION'));
    
    for (const block of eduBlocks) {
      const lines = block.trim().split('\n').filter(line => line.trim().length > 0);
      if (lines.length < 1) continue;
      
      // First line often contains degree or institution
      let degree = '';
      let institution = '';
      
      const firstLine = lines[0].trim();
      
      if (firstLine.match(/Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|Associate/i)) {
        degree = firstLine;
        institution = lines.length > 1 ? lines[1].trim() : '';
      } else {
        institution = firstLine;
        // Look for degree in subsequent lines
        const degreeMatch = block.match(/Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|Associate/i);
        if (degreeMatch && lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].match(degreeMatch[0])) {
              degree = lines[i].trim();
              break;
            }
          }
        }
      }
      
      // Look for dates
      const dateMatch = block.match(/(\w+ \d{4})\s*(?:-|–|to)\s*(\w+ \d{4}|Present|Current)/i) || 
                        block.match(/(\d{4})\s*(?:-|–|to)\s*(\d{4}|Present|Current)/i);
      
      const startDate = dateMatch ? dateMatch[1] : 'Unknown';
      const endDate = dateMatch ? dateMatch[2] : null;
      
      // Look for location
      const locationMatch = block.match(/(?:^|\n)([A-Za-z]+,\s*[A-Za-z]+|\w+\s+\w+,\s*[A-Z]{2})/);
      const location = locationMatch ? locationMatch[1] : null;
      
      if (degree && institution) {
        educations.push({
          userId: 0,
          degree,
          institution,
          startDate,
          endDate,
          location
        });
      }
    }
    
    // Parse Skills
    const skills: InsertSkill[] = [];
    const skillMatches = skillsSection.replace(/^SKILLS:?\s*/i, '').match(/[^,\n]+/g) || [];
    
    for (const skill of skillMatches) {
      const trimmedSkill = skill.trim();
      if (trimmedSkill.length > 0 && !trimmedSkill.match(/^SKILLS$/i)) {
        skills.push({
          userId: 0,
          name: trimmedSkill,
          level: "Intermediate",
          proficiency: 60
        });
      }
    }
    
    // Parse Basic Info
    let title: string | undefined = undefined;
    let location: string | undefined = undefined;
    
    const titleMatch = basicInfoSection.match(/Title:?\s*([^\n]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    const locationMatch = basicInfoSection.match(/Location:?\s*([^\n]+)/i);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }
    
    console.log(`Structured parsing complete:
      - Work Experiences: ${experiences.length}
      - Educations: ${educations.length}
      - Skills: ${skills.length}
      - Title: ${title || 'None'}
      - Location: ${location || 'None'}`);
    
    if (experiences.length === 0 && educations.length === 0 && skills.length === 0) {
      return {
        experiences: [],
        educations: [],
        skills: [],
        error: "No information could be extracted from the structured resume data"
      };
    }
    
    return {
      experiences,
      educations,
      skills,
      title,
      location
    };
    
  } catch (error: any) {
    console.error("Error parsing structured resume data:", error);
    return {
      experiences: [],
      educations: [],
      skills: [],
      error: `Failed to parse structured resume data: ${error.message}`
    };
  }
}

/**
 * Rule-based resume parser following algorithm from requirements
 * This implementation focuses on extracting only data that's clearly present
 * and providing empty fields when data cannot be confidently extracted
 */
export async function parseResumeText(resumeText: string): Promise<{
  experiences: InsertWorkExperience[];
  educations: InsertEducation[];
  skills: InsertSkill[];
  title?: string;
  location?: string;
  error?: string;
}> {
  try {
    console.log("Starting resume parsing with text length:", resumeText.length);
    console.log("First 200 characters of text:", resumeText.substring(0, 200));
    
    // Safeguard against empty or very short text
    if (!resumeText || resumeText.length < 50) {
      console.error("Resume text too short or empty:", resumeText);
      return {
        experiences: [],
        educations: [],
        skills: [],
        error: "Resume text is too short or empty to analyze"
      };
    }
    
    // Check if this is structured output from the GPT parser
    // GPT parsers typically include section headers like WORK EXPERIENCE, EDUCATION, SKILLS, etc.
    const hasStructuredSections = 
      resumeText.includes("WORK EXPERIENCE") || 
      resumeText.includes("EMPLOYMENT HISTORY") ||
      resumeText.includes("EDUCATION") || 
      resumeText.includes("SKILLS") ||
      resumeText.includes("BASIC INFO");
    
    console.log(`Resume format check: ${hasStructuredSections ? 'Structured' : 'Unstructured'} format detected`);
    
    if (hasStructuredSections) {
      console.log("Using structured section parser for GPT-formatted resume data");
      return parseStructuredResumeText(resumeText);
    }
    
    // Skip using OpenAI to avoid 500 errors - use rule-based parsing only
    console.log("Skipping OpenAI processing and using direct rule-based parsing");
    
    // Instead, add some fake structure if needed to help with rule-based parsing
    if (!resumeText.includes("WORK EXPERIENCE") && 
        !resumeText.includes("EDUCATION") && 
        !resumeText.includes("SKILLS")) {
      
      console.log("Adding section headers to improve rule-based parsing");
      const sections = resumeText.split(/\n\s*\n/);
      let structuredText = "";
      
      // Try to guess what sections might be work experience, education, skills
      const possibleExpKeywords = ["work", "experience", "employment", "career", "job", "position"];
      const possibleEduKeywords = ["education", "university", "college", "degree", "school"];
      const possibleSkillKeywords = ["skill", "proficiency", "competency", "ability"];
      
      // Go through each section and try to label it
      for (const section of sections) {
        if (section.trim().length < 20) continue; // Skip very short sections
        
        const lowerSection = section.toLowerCase();
        
        // Check if this looks like work experience
        if (possibleExpKeywords.some(keyword => lowerSection.includes(keyword))) {
          structuredText += "\n\nWORK EXPERIENCE\n" + section + "\n";
        }
        // Check if this looks like education
        else if (possibleEduKeywords.some(keyword => lowerSection.includes(keyword))) {
          structuredText += "\n\nEDUCATION\n" + section + "\n";
        }
        // Check if this looks like skills
        else if (possibleSkillKeywords.some(keyword => lowerSection.includes(keyword)) ||
                 section.split(/[,•·⋅‣⁃⚬⦁◦▸►⟩▹▻∙]/g).length > 3) {
          structuredText += "\n\nSKILLS\n" + section + "\n";
        }
        // Otherwise just add the section
        else {
          structuredText += "\n\n" + section + "\n";
        }
      }
      
      // If we've added some structure, use it
      if (structuredText.includes("WORK EXPERIENCE") || 
          structuredText.includes("EDUCATION") || 
          structuredText.includes("SKILLS")) {
        resumeText = structuredText;
        console.log("Added structure to text for better parsing");
      }
    }
    
    // Fallback: Parse the resume using structured extraction
    console.log("Using rule-based parsing as fallback");
    const experienceBlocks = extractExperienceBlocks(resumeText);
    const educationBlocks = extractEducationBlocks(resumeText);
    const skillsList = extractSkills(resumeText);
    const basicInfo = extractBasicInfo(resumeText);
    
    // Convert extracted blocks to our schema format (must match schema.ts exactly)
    // We filter out any entries that don't have the required fields
    const experiences: InsertWorkExperience[] = experienceBlocks
      .filter(block => block.title && block.company && block.startDate) 
      .map(block => ({
        userId: 0, // This will be filled in by the caller
        title: block.title!,
        company: block.company!,
        startDate: block.startDate!, 
        location: block.location || null,
        endDate: block.endDate || null,
        description: block.description || null
      }));

    const educations: InsertEducation[] = educationBlocks
      .filter(block => block.degree && block.institution && block.startDate)
      .map(block => ({
        userId: 0,
        degree: block.degree!,
        institution: block.institution!,
        startDate: block.startDate!,
        location: block.location || null,
        endDate: block.endDate || null
      }));

    const skills: InsertSkill[] = skillsList.map(skill => ({
      userId: 0,
      name: skill,
      level: "Intermediate", // Default to Intermediate when level not specified
      proficiency: 60 // Default value
    }));

    console.log("Resume parsing complete with rule-based method", {
      experienceCount: experiences.length,
      educationCount: educations.length,
      skillsCount: skills.length
    });

    // Only return successful response if we have at least some data
    if (experiences.length > 0 || educations.length > 0 || skills.length > 0) {
      return {
        experiences,
        educations,
        skills,
        title: basicInfo.title,
        location: basicInfo.location
      };
    } else {
      console.error("No data extracted from resume");
      return {
        experiences: [],
        educations: [],
        skills: [],
        error: "Could not extract any valid data from the resume"
      };
    }
  } catch (error: any) {
    console.error("Error in rule-based resume parsing:", error);
    return {
      experiences: [],
      educations: [],
      skills: [],
      error: error.message || "Unknown error parsing resume"
    };
  }
}

/**
 * Extract sections related to work experience
 */
function extractExperienceBlocks(text: string): Array<{
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}> {
  // Find experience section (common headers)
  const experienceSection = extractSection(text, [
    "EXPERIENCE", 
    "WORK EXPERIENCE", 
    "PROFESSIONAL EXPERIENCE",
    "EMPLOYMENT HISTORY",
    "WORK HISTORY"
  ]);
  
  if (!experienceSection) {
    console.log("No experience section found in resume");
    return [];
  }
  
  // Split into blocks based on date patterns or company names
  const experienceBlocks = [];
  const lines = experienceSection.split('\n').filter(line => line.trim());
  
  let currentBlock: any = {};
  let blockStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for pattern indicating new job (title at company)
    const titleCompanyMatch = line.match(/^(.*?)\s+(?:at|@|,)\s+(.*?)(?:,|\s+|\(|$)/i);
    const dateRangeMatch = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*(?:-|–|to)\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present|Current|Now)\b/i);
    
    if (titleCompanyMatch || dateRangeMatch || 
        (line.match(/^[A-Z]/) && line.length > 10 && i > blockStartIndex + 3)) {
      // Save previous block if it exists
      if (currentBlock.company || currentBlock.title) {
        experienceBlocks.push(currentBlock);
      }
      
      // Start a new block
      currentBlock = {};
      blockStartIndex = i;
      
      // Try to extract title and company
      if (titleCompanyMatch) {
        currentBlock.title = titleCompanyMatch[1].trim();
        currentBlock.company = titleCompanyMatch[2].trim();
      } else {
        currentBlock.title = line.split(',')[0].trim();
      }
      
      // Look for dates on this line or next line
      if (dateRangeMatch) {
        const dateText = dateRangeMatch[0];
        const dates = dateText.split(/\s*(?:-|–|to)\s*/);
        currentBlock.startDate = dates[0].trim();
        currentBlock.endDate = dates[1]?.trim() || 'Present';
      } else if (i + 1 < lines.length && lines[i + 1].match(/\b\d{4}\b.*\b(?:\d{4}|Present|Current|Now)\b/i)) {
        // Date in next line
        const nextLine = lines[i + 1].trim();
        const dates = nextLine.split(/\s*(?:-|–|to)\s*/);
        currentBlock.startDate = dates[0].trim();
        currentBlock.endDate = dates[1]?.trim() || 'Present';
      }
      
      // Look for location
      const locationMatch = line.match(/\b([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-z]+)?)\b/);
      if (locationMatch) {
        currentBlock.location = locationMatch[1];
      }
    } else if (currentBlock.title || currentBlock.company) {
      // Add to description of current block
      if (!currentBlock.description) {
        currentBlock.description = line;
      } else {
        currentBlock.description += '\n' + line;
      }
    }
  }
  
  // Add the last block
  if (currentBlock.company || currentBlock.title) {
    experienceBlocks.push(currentBlock);
  }
  
  console.log(`Extracted ${experienceBlocks.length} experience blocks`);
  return experienceBlocks;
}

/**
 * Extract sections related to education
 */
function extractEducationBlocks(text: string): Array<{
  degree?: string;
  institution?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}> {
  // Find education section
  const educationSection = extractSection(text, [
    "EDUCATION",
    "ACADEMIC BACKGROUND",
    "ACADEMIC HISTORY",
    "EDUCATIONAL BACKGROUND"
  ]);
  
  if (!educationSection) {
    console.log("No education section found in resume");
    return [];
  }
  
  // Split into blocks
  const educationBlocks = [];
  const lines = educationSection.split('\n').filter(line => line.trim());
  
  let currentBlock: any = {};
  let blockStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for patterns indicating a new education entry
    const institutionMatch = line.match(/^(.*University|.*College|.*School|.*Institute)(?:,|\s+|$)/i);
    const degreeMatch = line.match(/\b(Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|Associate)\b.*(?:in|of)\s+(.*?)(?:,|\.|\s|$)/i);
    const yearMatch = line.match(/\b(19|20)\d{2}\b.*\b(?:(19|20)\d{2}|Present|Current|Now)\b/i);
    
    if (institutionMatch || degreeMatch || yearMatch || 
        (line.match(/^[A-Z]/) && line.length > 10 && i > blockStartIndex + 2)) {
      // Save previous block if it exists
      if (currentBlock.institution || currentBlock.degree) {
        educationBlocks.push(currentBlock);
      }
      
      // Start a new block
      currentBlock = {};
      blockStartIndex = i;
      
      // Extract institution
      if (institutionMatch) {
        currentBlock.institution = institutionMatch[1].trim();
      }
      
      // Extract degree
      if (degreeMatch) {
        currentBlock.degree = `${degreeMatch[1]} in ${degreeMatch[2]}`.trim();
      }
      
      // Extract years
      if (yearMatch) {
        const yearText = yearMatch[0];
        const years = yearText.match(/\b(19|20)\d{2}\b/g);
        if (years && years.length >= 1) {
          currentBlock.startDate = years[0];
          currentBlock.endDate = years[1] || 'Present';
        }
      }
      
      // Look for location
      const locationMatch = line.match(/\b([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-z]+)?)\b/);
      if (locationMatch && !currentBlock.location) {
        currentBlock.location = locationMatch[1];
      }
    } else if (currentBlock.institution || currentBlock.degree) {
      // Try to fill in missing information in current block
      if (!currentBlock.institution && line.match(/University|College|School|Institute/i)) {
        currentBlock.institution = line.trim();
      } else if (!currentBlock.degree && line.match(/Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|Associate/i)) {
        currentBlock.degree = line.trim();
      } else if (!currentBlock.startDate && line.match(/\b(19|20)\d{2}\b/)) {
        const years = line.match(/\b(19|20)\d{2}\b/g);
        if (years && years.length >= 1) {
          currentBlock.startDate = years[0];
          currentBlock.endDate = years[1] || 'Present';
        }
      }
    }
  }
  
  // Add the last block
  if (currentBlock.institution || currentBlock.degree) {
    educationBlocks.push(currentBlock);
  }
  
  console.log(`Extracted ${educationBlocks.length} education blocks`);
  return educationBlocks;
}

/**
 * Extract skills from resume text
 */
function extractSkills(text: string): string[] {
  // Find skills section
  const skillsSection = extractSection(text, [
    "SKILLS",
    "TECHNICAL SKILLS",
    "CORE COMPETENCIES",
    "COMPETENCIES",
    "PROFICIENCIES",
    "KEY SKILLS"
  ]);
  
  if (!skillsSection) {
    console.log("No skills section found in resume");
    return [];
  }
  
  // Common skills to look for (limited set - will be expanded by specific skills found)
  const commonSkills = [
    "javascript", "python", "java", "c++", "c#", "ruby", "go", "swift", "kotlin",
    "react", "angular", "vue", "node", "express", "django", "flask", "spring",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "sql", "mongodb", "postgresql", "mysql", "oracle", "redis", "graphql",
    "git", "agile", "scrum", "jira", "rest", "graphql", "machine learning"
  ];
  
  // Extract skills using pattern matching
  const extractedSkills = new Set<string>();
  
  // Look for bullet point lists of skills
  const bulletListMatch = skillsSection.match(/(?:•|\*|\-|\d+\.)\s*([^•\*\-\d\n]+)/g);
  if (bulletListMatch) {
    bulletListMatch.forEach(bullet => {
      const skillText = bullet.replace(/^(?:•|\*|\-|\d+\.)\s*/, '').trim();
      if (skillText && skillText.length < 50) { // Simple length check to filter out sentences
        extractedSkills.add(skillText);
      }
    });
  }
  
  // Look for comma-separated lists
  const lines = skillsSection.split('\n');
  lines.forEach(line => {
    const commaItems = line.split(/,|;/).map(item => item.trim());
    commaItems.forEach(item => {
      if (item && item.length > 2 && item.length < 30) {
        extractedSkills.add(item);
      }
    });
  });
  
  // Look for common skills
  commonSkills.forEach(skill => {
    const pattern = new RegExp(`\\b${skill}\\b`, 'i');
    if (pattern.test(text)) {
      extractedSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });
  
  console.log(`Extracted ${extractedSkills.size} skills`);
  return Array.from(extractedSkills);
}

/**
 * Extract basic info (title, location) from resume
 */
function extractBasicInfo(text: string): { title?: string; location?: string } {
  const info: { title?: string; location?: string } = {};
  
  // Get the first few lines as they typically contain basic info
  const headerLines = text.split('\n').slice(0, 15).map(line => line.trim()).filter(Boolean);
  
  // Try to find job title - typically after the name
  if (headerLines.length >= 2) {
    // Name is typically the most prominent in the first line
    // Job title often follows in the next lines
    for (let i = 1; i < Math.min(5, headerLines.length); i++) {
      const line = headerLines[i];
      
      // Skip email, phone, address lines
      if (line.match(/[@]|[\d-]{10}|street|road|avenue|ave\.|st\./i)) continue;
      
      // Look for job title patterns
      if (line.match(/engineer|developer|manager|director|specialist|analyst|designer|architect|consultant/i)) {
        info.title = line;
        break;
      }
    }
  }
  
  // Try to find location
  const locationPattern = /\b([A-Z][a-z]+(?:,\s*[A-Z]{2})?(?:,\s*[A-Z][a-z]+)?)\b/;
  for (const line of headerLines) {
    const match = line.match(locationPattern);
    if (match) {
      info.location = match[1];
      break;
    }
  }
  
  return info;
}

/**
 * Extract a section from the resume text
 */
function extractSection(text: string, sectionHeaders: string[]): string | null {
  // Normalize the text: convert to uppercase and remove special formatting
  const normalizedText = text.toUpperCase();
  
  // Find the start of the section
  let sectionStart = -1;
  let matchedHeader = '';
  
  for (const header of sectionHeaders) {
    const normalizedHeader = header.toUpperCase();
    const headerIndex = normalizedText.indexOf(normalizedHeader);
    if (headerIndex !== -1 && (sectionStart === -1 || headerIndex < sectionStart)) {
      sectionStart = headerIndex;
      matchedHeader = normalizedHeader;
    }
  }
  
  if (sectionStart === -1) {
    return null; // Section not found
  }
  
  // Find the end of the section (start of the next section or end of document)
  let sectionEnd = text.length;
  
  // Common section headers to detect the next section
  const commonSectionHeaders = [
    "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS", "CERTIFICATIONS", 
    "AWARDS", "PUBLICATIONS", "LANGUAGES", "INTERESTS", "REFERENCES"
  ];
  
  // Find the next section header after our current section
  for (const header of commonSectionHeaders) {
    if (header.toUpperCase() === matchedHeader) continue; // Skip our own header
    
    const normalizedHeader = header.toUpperCase();
    const headerIndex = normalizedText.indexOf(normalizedHeader, sectionStart + matchedHeader.length);
    
    if (headerIndex !== -1 && headerIndex < sectionEnd) {
      sectionEnd = headerIndex;
    }
  }
  
  // Extract the section content
  const sectionLines = text.substring(sectionStart, sectionEnd).split('\n');
  
  // Remove the header line itself
  const contentLines = sectionLines.slice(1);
  
  return contentLines.join('\n');
}

/**
 * Parse LinkedIn profile URL and extract profile data
 * Note: This simply returns an empty result with an error message
 * since we can't actually access LinkedIn data without OAuth
 */
export async function parseLinkedInProfile(profileUrl: string): Promise<{
  experiences: InsertWorkExperience[];
  educations: InsertEducation[];
  skills: InsertSkill[];
  title?: string;
  location?: string;
  error?: string;
}> {
  console.log(`LinkedIn profile parsing requested for URL: ${profileUrl}`);
  
  return {
    experiences: [],
    educations: [],
    skills: [],
    error: "LinkedIn data extraction requires OAuth authentication. Please upload a resume or manually enter your professional information."
  };
}

/**
 * Convert skill level string to proficiency percentage
 */
function calculateProficiency(level: string): number {
  switch (level?.toLowerCase()) {
    case 'beginner':
      return 30;
    case 'intermediate':
      return 60;
    case 'advanced':
    case 'expert':
      return 85;
    default:
      return 50; // Default to intermediate if unknown
  }
}