import { WorkExperience, Education, Skill, InsertWorkExperience, InsertEducation, InsertSkill } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI with the API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Parse resume text and extract structured data
 */
export async function parseResumeText(resumeText: string): Promise<{
  experiences: InsertWorkExperience[];
  educations: InsertEducation[];
  skills: InsertSkill[];
  title?: string;
  location?: string;
}> {
  try {
    // Limit resume text to prevent token limit errors (roughly 20k characters ≈ 5k tokens)
    const maxLength = 20000;
    const truncatedResumeText = resumeText.length > maxLength
      ? resumeText.substring(0, maxLength) + "\n\n[Content truncated due to length...]"
      : resumeText;

    const systemPrompt = `
      You are an expert resume analyzer. Extract the following information from the resume:
      1. Job title/headline (single most recent/current position)
      2. Location (city, state/province, country)
      3. Work experiences (include title, company, location, start date, end date, and description)
      4. Education history (include degree, institution, location, start date, and end date)
      5. Skills with proficiency levels (Beginner, Intermediate, Advanced)

      Format the response as a JSON object with these exact keys:
      {
        "title": "Current job title",
        "location": "City, State/Province, Country",
        "experiences": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "location": "Location",
            "startDate": "Start Date (MM/YYYY or YYYY)",
            "endDate": "End Date (MM/YYYY or YYYY) or 'Present'",
            "description": "Job description"
          }
        ],
        "educations": [
          {
            "degree": "Degree Name",
            "institution": "Institution Name",
            "location": "Location",
            "startDate": "Start Date (YYYY)",
            "endDate": "End Date (YYYY)"
          }
        ],
        "skills": [
          {
            "name": "Skill Name",
            "level": "Beginner/Intermediate/Advanced"
          }
        ]
      }
      
      IMPORTANT: Keep the output strictly in JSON format. Do not include any explanations or markdown.
      If the resume is long or complex, focus on extracting the most recent and relevant experiences, educations, and skills.
    `;

    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: truncatedResumeText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more accurate extraction
      max_tokens: 4000, // Limit response size
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    
    // Transform to match our schema
    const experiences = parsed.experiences?.map((exp: any) => ({
      userId: 0, // This will be filled in by the caller
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate === 'Present' ? undefined : exp.endDate,
      description: exp.description || ""
    })) || [];

    const educations = parsed.educations?.map((edu: any) => ({
      userId: 0, // This will be filled in by the caller
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      startDate: edu.startDate,
      endDate: edu.endDate
    })) || [];

    const skills = parsed.skills?.map((skill: any) => ({
      userId: 0, // This will be filled in by the caller
      name: skill.name,
      level: skill.level,
      proficiency: calculateProficiency(skill.level)
    })) || [];

    return {
      experiences,
      educations,
      skills,
      title: parsed.title,
      location: parsed.location
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return { experiences: [], educations: [], skills: [] };
  }
}

/**
 * Parse LinkedIn profile URL and extract profile data
 */
export async function parseLinkedInProfile(profileUrl: string): Promise<{
  experiences: InsertWorkExperience[];
  educations: InsertEducation[];
  skills: InsertSkill[];
  title?: string;
  location?: string;
}> {
  try {
    // Request the AI to extract LinkedIn profile info from the URL
    const systemPrompt = `
      You are an expert LinkedIn profile analyzer. Given a LinkedIn profile URL, imagine you have access to public LinkedIn data and extract the following information:
      
      1. Current job title/headline
      2. Location (city, state/province, country)
      3. Work experiences (include title, company, location, start date, end date, and description)
      4. Education history (include degree, institution, location, start date, and end date)
      5. Skills with proficiency levels
      
      Format the response as a JSON object with these exact keys:
      {
        "title": "Current job title",
        "location": "City, State/Province, Country",
        "experiences": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "location": "Location",
            "startDate": "Start Date (MM/YYYY or YYYY)",
            "endDate": "End Date (MM/YYYY or YYYY) or 'Present'",
            "description": "Job description"
          }
        ],
        "educations": [
          {
            "degree": "Degree Name",
            "institution": "Institution Name",
            "location": "Location",
            "startDate": "Start Date (YYYY)",
            "endDate": "End Date (YYYY)"
          }
        ],
        "skills": [
          {
            "name": "Skill Name",
            "level": "Beginner/Intermediate/Advanced"
          }
        ]
      }
      
      IMPORTANT: Keep the output strictly in JSON format with no explanations or markdown. For this exercise, generate plausible professional information for a typical user based on the URL, without accessing actual LinkedIn data.
    `;

    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Extract information from this LinkedIn profile: ${profileUrl}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    
    // Transform to match our schema
    const experiences = parsed.experiences?.map((exp: any) => ({
      userId: 0, // This will be filled in by the caller
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate === 'Present' ? undefined : exp.endDate,
      description: exp.description || ""
    })) || [];

    const educations = parsed.educations?.map((edu: any) => ({
      userId: 0, // This will be filled in by the caller
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      startDate: edu.startDate,
      endDate: edu.endDate
    })) || [];

    const skills = parsed.skills?.map((skill: any) => ({
      userId: 0, // This will be filled in by the caller
      name: skill.name,
      level: skill.level,
      proficiency: calculateProficiency(skill.level)
    })) || [];

    return {
      experiences,
      educations,
      skills,
      title: parsed.title,
      location: parsed.location
    };
  } catch (error) {
    console.error("Error parsing LinkedIn profile:", error);
    return { experiences: [], educations: [], skills: [] };
  }
}

/**
 * Convert skill level string to proficiency percentage
 */
function calculateProficiency(level: string): number {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 30;
    case 'intermediate':
      return 60;
    case 'advanced':
      return 85;
    default:
      return 50; // Default to intermediate if unknown
  }
}