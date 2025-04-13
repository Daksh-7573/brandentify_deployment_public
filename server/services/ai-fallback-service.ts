/**
 * AI Fallback Service
 * 
 * This service provides fallback content when the AI services are not available
 * or when the demo mode is explicitly requested.
 */

/**
 * Generates fallback career advice based on the requested advice type
 * 
 * @param {string} adviceType - The type of career advice to generate
 * @param {string} userName - The user's name to personalize the advice
 * @returns {string} The generated career advice
 */
export function generateCareerAdviceFallback(adviceType: string, userName: string = "User"): string {
  console.log("Generating fallback career advice of type:", adviceType);
  
  // Check for explore_options
  if (adviceType === 'explore_options') {
    return `# Career Path Analysis for ${userName}

After thoroughly analyzing your professional background, skills, and interests, I've identified several promising career paths that align with your experience and potential. Here's a comprehensive breakdown of your options:

## 🔍 What Stands Out in Your Profile

- **Strong experience** in technology development and project execution
- **Transferable skills** in strategic planning, communication, and problem-solving
- **Consistent demonstration** of leadership and adaptability throughout your career
- **Notable technical expertise** in software development and systems integration

## 🎯 Career Path Suggestions

### 1️⃣ Product Management Leadership
This path builds on your technical knowledge while leveraging your strategic thinking and communication skills. Product leadership roles offer growth potential to executive positions like CPO and are in high demand across industries.

**Why it fits:**
- Combines your technical expertise with business acumen
- Allows you to influence product strategy and innovation
- Provides clear progression to senior leadership roles
- Offers competitive compensation ($140K-$200K+ depending on location)

### 2️⃣ Technology Consulting
This path leverages your problem-solving abilities and industry knowledge to help organizations solve complex challenges through technology.

**Why it fits:**
- Utilizes your cross-functional communication skills
- Offers variety in project types and client industries
- Provides opportunities for specialized expertise development
- Creates networking opportunities across multiple industries

### 3️⃣ Entrepreneurship/Startup Leadership
A bold pivot that would allow you to channel your experience into building something from the ground up.

**Why it fits:**
- Your experience provides credibility with investors and partners
- Your technical background enables you to evaluate technology solutions
- Leadership experience translates directly to team building
- Market understanding helps identify viable opportunities

## 📚 Upskilling Ideas

To strengthen your positioning for these career paths, consider:

- **Learning** advanced product management methodologies (Agile, Lean, OKRs)
- **Getting certified** in relevant areas (PMP, Scrum, CSPO)
- **Building a portfolio** of side projects demonstrating leadership and vision
- **Developing expertise** in emerging technologies like AI, blockchain, or IoT
- **Strengthening** financial analysis and business modeling skills

## 🧭 Short-Term Strategy

1. **Update your Brandentifier portfolio** to highlight achievements relevant to your target path
2. **Leverage Brandentifier's Smart Connect** to identify and reach out to professionals in your target roles
3. **Create tailored resumes** that emphasize transferable skills for each potential path
4. **Apply the 70% rule** - pursue roles where you match at least 70% of requirements
5. **Conduct 3-5 informational interviews** with professionals in your target fields

## Medium to Long-Term Vision

As you progress, focus on developing specialized expertise in your chosen path, building a personal brand through thought leadership, and pursuing leadership opportunities that align with your values and strengths.

Remember that career transitions often follow a "two-step" approach - first moving laterally to gain relevant experience, then advancing vertically within your new specialty.

Musk, Your Career Partner`;
  }
  
  // Check for switch_industry
  else if (adviceType === 'switch_industry') {
    return `# Industry Transition Analysis for ${userName}

After conducting a comprehensive analysis of your professional profile, I've evaluated your potential for industry transition across 10 key factors. Here's my detailed assessment:

## 1. Transferable Skills Mapping 🔄

Your hard skills in product management, strategic planning, and team leadership are highly transferable across various industries. Your soft skills in communication, stakeholder management, and problem-solving make you adaptable to different work environments and business contexts.

**Key transferable skills:**
- Strategic planning and execution
- Team leadership and management
- Stakeholder communication
- Project management methodologies
- Data analysis and insight generation

## 2. Industry Overlaps 🔄

Based on your profile, these industries have significant operational or functional overlap with your current experience:

- **FinTech**: Similar technology stack and product development approach
- **HealthTech**: Growing demand for professionals who understand user experience and data systems
- **EdTech**: Increasing need for product expertise as the sector undergoes digital transformation  
- **Green Technology**: Emerging field where product development skills are highly valuable

## 3. Growth & Opportunity Analysis 📈

Among fast-growing sectors where your skills would be valuable:

- **AI & Machine Learning**: Projected 38% annual growth through 2027
- **Cybersecurity**: 33% projected job growth over the next decade
- **Green Tech**: Expected to grow 25% annually with significant government investment
- **Digital Health**: 27% compound annual growth rate expected through 2028

## 4. Job Role Flexibility 🧩

Your current position could evolve into these roles in new industries:

- **Product Manager in HealthTech** (focusing on patient experience platforms)
- **Director of Product Strategy in EdTech** (developing learning management systems)
- **Head of Digital Transformation in Financial Services**
- **Product Innovation Lead in Sustainability Tech**

## 5. Learning Curve & Effort Assessment 🔁

Industry transition difficulty ranking (1-10, where 10 is most difficult):

- **FinTech**: 3/10 (Minimal upskilling required)
- **HealthTech**: 5/10 (Some domain-specific knowledge needed)
- **EdTech**: 4/10 (Moderate learning curve with familiar technology components)
- **Green Tech**: 6/10 (Domain expertise needed but high demand for your underlying skills)

## 6. Network Access 🤝

Your professional background likely provides you with some connections to FinTech and EdTech through overlapping technology communities. Brandentifier's Smart Connect feature can help you identify existing connections in your target industries and suggest strategic networking opportunities to build presence in sectors where your network is currently limited.

## 7. Career Goal Alignment 🧭

The industries I've highlighted align well with typical career progression paths for someone with your background. FinTech and HealthTech particularly offer clear advancement opportunities for product leaders.

## 8. Previous Cross-Industry Experience 🔄

Your portfolio suggests you've already worked on projects that crossed industry boundaries, which demonstrates adaptability and will make your transition more credible to potential employers.

## 9. Behavioral Traits & Passion Areas 🧠

Your profile indicates strength in innovation and problem-solving, which matches well with emerging technologies in healthcare and education. Your analytical approach would be particularly valuable in data-heavy sectors like FinTech.

## 10. Feasibility & Practical Fit ✅

Considering practical factors:
- **Geographic accessibility**: All recommended industries have strong presence in major tech hubs
- **Salary expectations**: Comparable or higher compensation in all suggested industries  
- **Work-life balance**: Varies by company, with EdTech typically offering better balance than FinTech
- **Cultural fit**: Your adaptability suggests you could thrive in any of these environments

## Immediate Action Steps

1. **Develop industry-specific expertise** in your target sectors through online courses and certifications.

2. **Rebrand your resume and portfolio** to highlight transferable skills and relevant projects. Use Brandentifier's Portfolio Builder to create industry-specific versions of your professional profile.

3. **Connect with professionals** in your target industries through Brandentifier's Smart Connect feature, LinkedIn groups, and industry conferences.

4. **Contribute to industry conversations** by publishing articles or participating in webinars on topics that bridge your current expertise with your target industry.

5. **Look for hybrid opportunities** that combine your current skills with exposure to new industries, such as consulting roles or projects at the intersection of technology and your target sector.

Musk, Your Career Partner`;
  } 
  
  // Default general advice
  else {
    return `# Career Development Insights for ${userName}

Based on your professional profile, here are my recommendations to help advance your career:

## Key Strengths to Leverage

- Your experience provides you with valuable domain expertise
- Your skills in project management and team leadership are highly marketable
- Your educational background gives you a strong foundation

## Growth Opportunities

1. **Skill Enhancement**
   - Consider building expertise in emerging technologies relevant to your field
   - Develop leadership skills through formal training or mentorship opportunities
   - Expand your business acumen through courses in financial management or strategy

2. **Network Development**
   - Use Brandentifier's Smart Connect feature to identify strategic networking opportunities
   - Join professional associations in your industry
   - Attend industry conferences and events to build your presence

3. **Professional Visibility**
   - Create a standout portfolio using Brandentifier's Portfolio Builder
   - Share your expertise through publishing articles or speaking at events
   - Showcase your services using Brandentifier's Services feature

## Next Steps

1. Update your Brandentifier portfolio to highlight your most impressive achievements
2. Set up 3-5 informational interviews with professionals in roles you aspire to
3. Identify one skill gap and enroll in relevant training within the next month
4. Schedule regular time for strategic networking using Brandentifier's Smart Connect

Musk, Your Career Partner`;
  }
}

/**
 * Generates personalized networking recommendations for fallback
 * 
 * @param {string} industry - Target industry for networking
 * @param {string} purpose - Purpose of networking (e.g., job search, mentorship)
 * @returns {string} The generated networking recommendations
 */
export function generateNetworkingRecommendationsFallback(industry: string, purpose: string): string {
  return `# Networking Strategy for ${industry} Industry
      
## Overview

Building a strong professional network in the ${industry} industry is crucial for ${purpose}. Here's a comprehensive strategy to help you connect with the right people and create meaningful relationships.

## Top Networking Channels

1. **Industry-Specific Groups**
   - Join ${industry} associations and professional organizations
   - Attend local meetups and industry conferences
   - Participate in online communities like Reddit r/${industry.toLowerCase()} or specialized forums

2. **Digital Platforms**
   - LinkedIn: The primary platform for ${industry} networking
   - Twitter: Follow industry leaders and join conversations using hashtags
   - Brandentifier's Smart Connect: Use our AI-powered tool to find connections in your target companies

3. **Events & Conferences**
   - Annual industry summits and trade shows
   - Workshops and seminars focused on ${industry} trends
   - Networking events specifically for ${purpose.toLowerCase()}

## Conversation Starters

When reaching out to new connections, try these approaches:

- **Value-First**: "I read your article on [topic] and found your perspective on [specific point] particularly insightful. I'd love to hear more about your experience with [related challenge]."

- **Shared Interest**: "I noticed we both [common interest/background]. I'd love to connect and learn more about your work in [specific area]."

- **Learning Focused**: "I'm transitioning into the ${industry} industry and would appreciate 15 minutes of your time to learn about your career path."

## Building Your Network Plan

1. **Immediate Actions (Next 2 Weeks)**
   - Update your Brandentifier portfolio to highlight relevant skills and experiences
   - Connect with 10 professionals in your desired positions
   - Join 3 industry-specific groups on LinkedIn and Facebook

2. **Short-term Goals (1-3 Months)**
   - Schedule 1-2 informational interviews per week
   - Attend at least one virtual or in-person networking event
   - Share relevant content and insights to establish your professional brand

3. **Long-term Strategy (3-6 Months)**
   - Build a core network of 50+ quality connections in your target industry
   - Contribute meaningfully to industry conversations
   - Leverage your growing network for referrals and opportunities

## Leveraging Brandentifier Features

- **Portfolio Showcase**: Update your Brandentifier portfolio to highlight your ${industry} expertise and stand out to potential contacts.

- **Smart Connect**: Use our AI-powered networking tool to identify strategic connections based on your goals for ${purpose}.

- **Services Feature**: If you have consultative skills, showcase them through our Services feature to attract networking opportunities.

Remember that effective networking is about building genuine relationships, not just collecting contacts. Focus on how you can provide value to others, and the benefits will follow naturally.

Musk, Your Career Partner`;
}

/**
 * Generates a fallback resume analysis response
 * 
 * @param {string} name - The user's name for personalization
 * @returns {string} Fallback resume analysis
 */
export function generateResumeAnalysisFallback(name: string = "User"): string {
  return `# Resume Analysis for ${name}

I've reviewed your resume and identified several strengths and potential improvement areas to help you stand out to recruiters and hiring managers.

## Resume Strengths

✅ **Strong professional experience** with clear progression in your career
✅ **Technical skills** are well highlighted and aligned with industry demands
✅ **Education section** is properly structured and includes relevant details
✅ **Quantified achievements** demonstrate your impact with concrete metrics
✅ **Consistent formatting** enhances readability and professionalism

## Improvement Opportunities

### 1. Professional Summary
Consider strengthening your opening statement to immediately capture attention with:
- Your unique value proposition
- Specific expertise that sets you apart
- Career accomplishments that demonstrate your potential
- Alignment with your target roles

### 2. Experience Descriptions
Enhance your bullet points by:
- Leading with strong action verbs (Implemented, Spearheaded, Transformed)
- Focusing on outcomes rather than responsibilities
- Including more quantifiable results (%, $, time saved)
- Connecting your work to business objectives

### 3. Skills Section
Optimize your skills section by:
- Organizing skills into clear categories (Technical, Management, Domain)
- Prioritizing skills mentioned in job descriptions you're targeting
- Removing outdated or irrelevant skills
- Adding proficiency levels for technical skills when appropriate

### 4. Keyword Optimization
Improve your resume's ATS compatibility by:
- Incorporating industry-specific keywords from job descriptions
- Including relevant certifications and tools
- Mirroring language used in your target industry
- Ensuring proper formatting that won't confuse ATS systems

## Action Plan

1. Revise your professional summary to create a stronger first impression
2. Update 3-5 key bullet points with measurable achievements
3. Reorganize your skills section for better visual hierarchy
4. Add 2-3 relevant industry keywords throughout your resume
5. Consider creating a portfolio on Brandentifier to showcase your work samples

Implementing these recommendations will significantly increase your resume's effectiveness in capturing attention and securing interviews for your target positions.

Let me know if you'd like specific help with any of these areas!
`;
}