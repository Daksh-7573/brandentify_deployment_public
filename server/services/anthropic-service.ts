import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to try decoding base64 for Anthropic processing
function tryDecodeBase64(base64String: string): string {
  try {
    // Try to decode as a UTF-8 string 
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
    
    // If it decoded successfully and isn't binary gibberish, return it
    // Check if it at least looks like text and not binary data
    const isProbablyText = /^[\x00-\x7F\xC0-\xFF]*$/.test(decoded.substring(0, 1000));
    if (isProbablyText && decoded.length > 100) {
      console.log("Successfully decoded base64 to text:", decoded.substring(0, 100) + "...");
      return decoded;
    }
    return base64String;
  } catch (e) {
    console.log("Could not decode base64 to text, using as is");
    return base64String;
  }
}

export async function analyzeResumeWithClaude(fileData: string): Promise<string> {
  if (!fileData) {
    throw new Error("No file data provided");
  }

  try {
    console.log(`Preparing PDF data for Claude analysis - length: ${fileData.length} chars`);
    
    // Try to decode the base64 data if possible
    const decodedOrOriginal = tryDecodeBase64(fileData);
    const textToAnalyze = decodedOrOriginal.substring(0, 100000); // Limit for API
    
    // Create messages with only text content
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      system: `You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices across many industries. 
      
Your analysis must be EXTREMELY PERSONALIZED based on the resume content provided, directly referencing the specific experiences, skills, education, and background from the resume. Avoid generic advice at all costs - everything must be tailored to this specific individual's situation as detailed in their resume. 

Provide detailed, constructive feedback with highly actionable insights. When suggesting improvements, always mention how Brandentifier's features can help, including the Portfolio Builder for showcasing projects, Smart Connect for networking, and Services showcase for freelancers and consultants.

Your analysis should be detailed and helpful with the same level of personalization and specificity that ChatGPT would provide.`,
      messages: [{
        role: "user",
        content: `I need an EXTREMELY detailed and personalized professional analysis of the resume I'm sending. This must be a comprehensive, specific analysis that directly references the actual content in the resume, not generic advice. Make your response feel like it was written specifically for this individual after carefully studying their resume.

First, analyze the resume to identify the person's name, experience details, education background, skills, and other key information. Then, provide a comprehensive, personalized analysis that mentions the person by their EXACT name and references their SPECIFIC experiences, skills, and background throughout your entire response.

Here is the resume content extracted from a PDF file:

${textToAnalyze}

Try your best to interpret this content as a resume, even if parts are difficult to parse. Focus on extracting key information like name, job titles, experiences, education, etc.

Provide a HIGHLY personalized and comprehensive resume analysis with specific improvement suggestions using this structure:

# Resume Analysis & Improvement Suggestions for [Name]
            
## Career Overview & Industry Context
🔍 Identify the person's industry and career stage
📈 Briefly describe how their experience aligns with current trends in their industry
🎯 Note any career trajectory patterns visible in their work history
            
## Key Strengths:
✅ List 6-7 key strengths from the resume (be specific to their actual achievements)
✅ Include exact metrics/quantifiable results they've mentioned (and suggest where more could be added)
✅ Highlight their specific technical proficiency and skill level
✅ Note their industry exposure with company names and actual positions held
            
## Areas for Improvement & Detailed Recommendations:
            
### 1️⃣ Profile Summary Enhancement
Analyze their existing summary section (or note its absence):
            
❌ Current summary (quoted EXACTLY from the resume) with specific weaknesses identified
✅ Suggested revision (completely rewritten to be more impactful) that:
   - Highlights their SPECIFIC years of experience in their ACTUAL field
   - Incorporates their MOST impressive achievements with real metrics
   - Positions them for their apparent career goals based on resume content
   - Mentions how they could showcase this summary in their Brandentifier Portfolio
            
### 2️⃣ Achievement Optimization
Identify 3-4 weak achievement descriptions from their ACTUAL resume:
            
❌ Original statement: "[exact quote from resume]"
✅ Improved version: "[rewritten with specific metrics and outcomes]"
            
❌ Original statement: "[exact quote from resume]"
✅ Improved version: "[rewritten with specific metrics and outcomes]"
            
[Include 1-2 more examples as needed]
            
### 3️⃣ Detailed Resume Structure Analysis
Analyze the actual organization of their resume:
- Comment on the specific section order they've used
- Note any missing critical sections they should add
- Suggest formatting improvements tailored to their industry/role
- Recommend how they could present this improved structure using Brandentifier's Portfolio Builder
            
### 4️⃣ Comprehensive Skills Assessment
Based on their stated role and industry:
- List the skills they ACTUALLY mention that are valuable
- Identify 5-7 SPECIFIC missing skills that employers in their field currently value
- Suggest how to present skills by category/proficiency level
- Recommend using Brandentifier's Skills showcase to better visualize their expertise
            
### 5️⃣ Expanded Projects/Portfolio Strategy
Based on their actual work history:
- Analyze any projects they've mentioned
- Suggest 3-4 SPECIFIC additional projects they should highlight based on their experience
- Provide a detailed format for presenting each project
- Explain how Brandentifier's Portfolio Builder can help them create an impressive project showcase
            
### 6️⃣ Personalized ATS Optimization Recommendations
Provide detailed, specific ATS optimization advice:
- List 5-7 actual keywords from their industry that should be included
- Identify any ATS-problematic formatting in their current resume
- Suggest specific filename conventions for their field
- Explain how to handle any unusual elements in their resume (gaps, career changes)
            
### 7️⃣ Networking Strategy Based on Resume Content
Using the resume details:
- Suggest 4-5 specific types of professionals they should connect with
- Recommend how to leverage their unique experience when networking
- Explain how Brandentifier's Smart Connect feature can help them build their professional network
            
### 8️⃣ Service Offering Opportunities
Based on their expertise:
- Suggest 3-4 specific services they could offer as a consultant/freelancer
- Outline how to package and present each service
- Explain how Brandentifier's Services showcase can help them market these offerings
            
Format with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone, and make all advice extremely detailed, practical, and tailored specifically to their experience and industry.`
      }]
    });

    console.log("Successfully received analysis from Claude");
    
    // Check for expected response format and extract the text
    if (response.content && response.content.length > 0) {
      const contentBlock = response.content[0];
      if ('text' in contentBlock) {
        return contentBlock.text;
      }
    }
    
    throw new Error("Unexpected response format from Claude API");
  } catch (error: any) {
    console.error("Error calling Anthropic API:", error.message);
    if (error.status === 401) {
      throw new Error("Invalid Anthropic API key. Please check your credentials.");
    }
    throw new Error(`Failed to process resume with Claude: ${error.message}`);
  }
}