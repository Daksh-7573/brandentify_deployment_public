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
  error?: string; // Added to allow error property in return value
}> {
  try {
    console.log("Starting resume text parsing");
    
    // Check if the OpenAI API key is valid
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY - cannot parse resume");
      throw new Error("OpenAI API key is missing");
    }
    
    // Limit resume text to prevent token limit errors (roughly 20k characters ≈ 5k tokens)
    const maxLength = 20000;
    const truncatedResumeText = resumeText.length > maxLength
      ? resumeText.substring(0, maxLength) + "\n\n[Content truncated due to length...]"
      : resumeText;

    const systemPrompt = `
      You are an expert resume analyzer. Your task is to precisely extract ONLY information that is EXPLICITLY PRESENT in the resume. DO NOT invent, synthesize, or guess any information.

      Extract the following information from the resume:
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
      
      STRICT EXTRACTION RULES:
      1. ONLY include information that is EXPLICITLY stated in the resume.
      2. If any field cannot be found in the resume, set its value to null (e.g., "location": null).
      3. If a field exists but you're uncertain about its value, set its value to null rather than guessing.
      4. Never hallucinate, invent, or generate data that isn't in the original resume.
      5. For skills where the level is not specified, set level to null.
      6. It is better to return incomplete but accurate data than complete but potentially incorrect data.
      
      IMPORTANT: Keep the output strictly in JSON format. Do not include any explanations or markdown.
    `;

    console.log("Sending request to OpenAI API for resume analysis");
    
    try {
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
      
      console.log("Received response from OpenAI API for resume analysis");
      
      if (!response.choices[0].message.content) {
        throw new Error("Empty response from OpenAI API");
      }
      
      const jsonContent = response.choices[0].message.content;
      console.log("JSON content received from resume analysis:", jsonContent.substring(0, 200) + "...");
      
      const parsed = JSON.parse(jsonContent);
      console.log("Resume parsing successful");
      
      // Helper function to check if a field possibly contains synthesized data
      function isSuspectedGeneration(value: string | null | undefined): boolean {
        // Skip null checks
        if (value === null || value === undefined) return false;
        
        // Common generic company names that might suggest generation
        const suspiciousCompanyPatterns = [
          /tech innovation/i,
          /web solution/i,
          /innovative tech/i,
          /software solution/i,
          /global tech/i,
          /digital solution/i,
          /tech corp/i,
          /acme/i,
          /software inc/i
        ];
        
        // Check for suspicious patterns in company names
        const isGenericCompanyName = suspiciousCompanyPatterns.some(pattern => 
          pattern.test(value)
        );
        
        return isGenericCompanyName;
      }
      
      // Filter out potentially synthetic experiences
      const validExperiences = (parsed.experiences || []).filter((exp: any) => {
        // If all fields are null, it's not synthetic (just empty)
        const allFieldsNull = !exp.title && !exp.company && !exp.location && !exp.startDate;
        if (allFieldsNull) return true;
        
        // If the company name looks suspicious, filter it out
        if (isSuspectedGeneration(exp.company)) {
          console.log(`Filtering out suspected generated experience: ${exp.title} at ${exp.company}`);
          return false;
        }
        
        return true;
      });
      
      // Transform to match our schema
      const experiences = validExperiences.map((exp: any) => ({
        userId: 0, // This will be filled in by the caller
        title: exp.title || null,
        company: exp.company || null,
        location: exp.location || null,
        startDate: exp.startDate || null,
        endDate: exp.endDate === 'Present' ? undefined : (exp.endDate || null),
        description: exp.description || ""
      }));

      // Filter out potentially synthetic educations
      const validEducations = (parsed.educations || []).filter((edu: any) => {
        // If the institution contains generic university names, filter it out
        const suspiciousInstitutions = [
          /university of california/i,
          /stanford/i,
          /harvard/i,
          /mit/i,
          /carnegie mellon/i
        ];
        
        const isSuspiciousInstitution = suspiciousInstitutions.some(pattern => 
          edu.institution && pattern.test(edu.institution)
        );
        
        if (isSuspiciousInstitution) {
          console.log(`Filtering out suspected generated education: ${edu.degree} at ${edu.institution}`);
          return false;
        }
        
        return true;
      });
      
      const educations = validEducations.map((edu: any) => ({
        userId: 0, // This will be filled in by the caller
        degree: edu.degree || null,
        institution: edu.institution || null,
        location: edu.location || null,
        startDate: edu.startDate || null,
        endDate: edu.endDate || null
      }));

      // Filter skills: only accept skills with valid levels or null levels
      const validSkills = (parsed.skills || []).filter((skill: any) => {
        return skill.name && typeof skill.name === 'string';
      });
      
      const skills = validSkills.map((skill: any) => ({
        userId: 0, // This will be filled in by the caller
        name: skill.name,
        level: skill.level || 'Intermediate',  // Default to Intermediate if null
        proficiency: skill.level ? calculateProficiency(skill.level) : 50
      }));

      const result = {
        experiences,
        educations,
        skills,
        title: parsed.title,
        location: parsed.location
      };
      
      console.log("Resume parsing complete. Experiences:", experiences.length, 
                  "Educations:", educations.length, 
                  "Skills:", skills.length);
      
      return result;
    } catch (apiError: any) {
      console.error("Error calling OpenAI API for resume parsing:", apiError);
      throw new Error(`OpenAI API error: ${apiError.message || "Unknown API error"}`);
    }
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    
    // Return empty arrays but provide a detailed error message
    return { 
      experiences: [],
      educations: [],
      skills: [],
      error: error.message || "Unknown error parsing resume"
    };
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
  error?: string; // Added to allow error property in return value
}> {
  try {
    console.log(`Starting LinkedIn profile parsing for URL: ${profileUrl}`);
    
    // Check if the OpenAI API key is valid
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY - cannot parse LinkedIn profile");
      throw new Error("OpenAI API key is missing");
    }
    
    // Request the AI to extract LinkedIn profile info from the URL
    const systemPrompt = `
      You are an expert LinkedIn profile analyzer. Given a LinkedIn profile URL, IMPORTANT: Note that you do NOT have access to actual LinkedIn data, and you SHOULD NOT pretend to have extracted real data.

      Instead, explicitly respond that LinkedIn data cannot be directly accessed through this API, and provide the following message:
      
      Format the response as a JSON object with these exact keys:
      {
        "title": null,
        "location": null,
        "experiences": [],
        "educations": [],
        "skills": [],
        "message": "LinkedIn data extraction requires OAuth authentication. Please upload a resume or manually enter your professional information."
      }
      
      IMPORTANT: Always return the empty response structure above. Do not invent or generate any profile data.
    `;

    console.log("Sending request to OpenAI API for LinkedIn profile analysis");
    
    try {
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
      
      console.log("Received response from OpenAI API");
      
      if (!response.choices[0].message.content) {
        throw new Error("Empty response from OpenAI API");
      }
      
      const jsonContent = response.choices[0].message.content;
      console.log("JSON content received:", jsonContent);
      
      const parsed = JSON.parse(jsonContent);
      console.log("Parsed LinkedIn profile data:", JSON.stringify(parsed, null, 2));
      
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

      const result = {
        experiences,
        educations,
        skills,
        title: parsed.title,
        location: parsed.location
      };
      
      console.log("LinkedIn profile parsing complete. Experiences:", experiences.length, 
                  "Educations:", educations.length, 
                  "Skills:", skills.length);
      
      return result;
    } catch (apiError: any) {
      console.error("Error calling OpenAI API:", apiError);
      throw new Error(`OpenAI API error: ${apiError.message || "Unknown API error"}`);
    }
  } catch (error: any) {
    console.error("Error parsing LinkedIn profile:", error);
    
    // Return empty arrays but provide a detailed error message
    // The calling code should check for this case and handle it appropriately
    return { 
      experiences: [],
      educations: [],
      skills: [],
      error: error.message || "Unknown error parsing LinkedIn profile"
    };
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