/**
 * Service to provide job title suggestions using OpenAI API
 */
import OpenAI from "openai";

/**
 * Get job title suggestions based on user input
 * @param input The partial job title entered by the user
 * @returns An array of suggested job titles
 */
export async function getJobTitleSuggestions(input: string): Promise<string[]> {
  if (!input || input.trim().length < 2) {
    return [];
  }
  
  try {
    // Standard common job titles as fallback if OpenAI fails
    const commonJobTitles = [
      // Executive titles
      "Chief Executive Officer",
      "Chief Operating Officer",
      "Chief Financial Officer", 
      "Chief Technology Officer",
      "Chief Marketing Officer",
      // Regular professional titles
      "Software Engineer",
      "Product Manager",
      "Data Scientist",
      "Marketing Manager",
      "UX Designer",
      "Financial Analyst",
      "Project Manager",
      "Sales Representative",
      "Business Analyst",
      "Operations Manager",
      "Graphic Designer",
      "Account Manager",
      "Executive Assistant",
      "HR Manager",
      "Content Writer",
      "Customer Success Manager",
      "System Administrator",
      "Mechanical Engineer",
      "Nurse Practitioner",
      "Research Scientist"
    ];
    
    // Filter common titles by input
    const lowerInput = input.toLowerCase();
    const filteredCommonTitles = commonJobTitles.filter(title => 
      title.toLowerCase().includes(lowerInput)
    );

    // If we have OpenAI API key, use AI to generate more relevant suggestions
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OpenAI API key found, using common job title suggestions");
      return filteredCommonTitles.length > 0 ? filteredCommonTitles : commonJobTitles.slice(0, 5);
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Make API request to get AI-generated suggestions
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a job title suggestion engine. Provide the most relevant professional job titles that match the user's partial input. Return a JSON array of strings. Be concise and accurate."
        },
        {
          role: "user",
          content: `Suggest 5-10 professional job titles that match this partial input: "${input}". Provide only the most common and professionally recognized titles. Ensure titles are properly capitalized. For example, "Software Engineer" not "software engineer".`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Extract and parse the suggestions
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent.suggestions)) {
      // If suggestions property exists and is an array, return it
      return parsedContent.suggestions;
    } else if (Array.isArray(parsedContent.titles)) {
      // Alternative property name
      return parsedContent.titles;
    } else if (Array.isArray(parsedContent.jobTitles)) {
      // Another alternative property name
      return parsedContent.jobTitles;
    } else if (Array.isArray(parsedContent)) {
      // If the response is a direct array
      return parsedContent;
    } else {
      // Fallback to common titles if we can't parse the response properly
      console.warn("Couldn't parse OpenAI response, using fallback titles");
      return filteredCommonTitles.length > 0 ? filteredCommonTitles : commonJobTitles.slice(0, 5);
    }
  } catch (error) {
    console.error("Error generating job title suggestions:", error);
    
    // Return filtered common titles as fallback
    const lowerInput = input.toLowerCase();
    const commonJobTitles = [
      // C-Suite Executive Titles
      "Chief Executive Officer",
      "Chief Operating Officer",
      "Chief Financial Officer",
      "Chief Technology Officer",
      "Chief Marketing Officer",
      // Common Professional Titles
      "Software Engineer",
      "Product Manager",
      "Data Scientist",
      "Marketing Manager",
      "UX Designer",
      "Financial Analyst",
      "Project Manager",
      "Sales Representative"
    ];
    
    return commonJobTitles.filter(title => 
      title.toLowerCase().includes(lowerInput)
    );
  }
}