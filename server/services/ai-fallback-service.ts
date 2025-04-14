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
    return `# Industry Transition Map for ${userName}

After conducting a comprehensive analysis of your professional profile, I've identified several promising industries where your skills and experience would transfer effectively. Here's a detailed breakdown of your transition opportunities:

## Your Current Role: Product Manager in Technology

## Viable Industry Switch Options

### FinTech - 🟢 High Match
- Example Entry-Level Role: Product Manager, Payment Solutions
- Why It Fits You: Your technical background and product experience translate directly
- Roles to Explore: Product Manager, Business Analyst, Implementation Specialist, Product Owner
- Difficulty Level: Easy - minimal domain knowledge required beyond financial regulations
- Skill Transferability: Product development, user experience design, stakeholder management
- Suggested First Steps: Take a fintech fundamentals course and connect with 3 professionals in the space

### HealthTech - 🟡 Medium Match
- Example Entry-Level Role: Digital Health Product Manager
- Why It Fits You: Growing sector with high demand for product expertise
- Roles to Explore: Healthcare Solutions Manager, Patient Experience Designer, Clinical Systems Analyst
- Difficulty Level: Medium - requires learning healthcare regulations and workflows
- Skill Transferability: Project management, data analysis, user interface optimization
- Suggested First Steps: Research healthcare compliance requirements (HIPAA, etc.) and volunteer for a healthcare-related project

### EdTech - 🟢 High Match
- Example Entry-Level Role: Learning Platform Product Manager
- Why It Fits You: Education technology shares many UX principles with consumer technology
- Roles to Explore: LMS Product Specialist, Curriculum Developer, Educational Content Strategist
- Difficulty Level: Easy - familiar technology components with specialized use cases
- Skill Transferability: User experience design, feature prioritization, analytics interpretation
- Suggested First Steps: Test and review popular EdTech platforms to understand the market

### Green Technology - 🟠 Low Match
- Example Entry-Level Role: Sustainability Solutions Consultant
- Why It Fits You: Growing field where technology expertise meets environmental impact
- Roles to Explore: Green IT Manager, Sustainability Program Coordinator, Smart Grid Specialist
- Difficulty Level: Challenging - requires specialized domain knowledge
- Skill Transferability: Project management, system optimization, data analysis
- Suggested First Steps: Pursue a certification in sustainability management or green technology

## Practical Transition Strategy

- Resume Rewrite Focus: Emphasize transferable skills like requirement gathering, stakeholder management, and product lifecycle management
- Learning Priority: Industry-specific regulations and terminology for your top choice
- Networking Strategy: Using Brandentifier's Smart Connect to find professionals who made similar transitions

## Success Stories

Meet Sarah, a former e-commerce product manager who successfully transitioned to HealthTech. She started by taking online courses in healthcare IT and volunteering for a healthcare nonprofit's digital transformation project. Within 9 months, she secured a role as a Product Manager for a telehealth platform, leveraging her UX expertise.

## Why This Path Might Surprise You

Many professionals underestimate how valuable their cross-functional communication skills are in regulated industries like FinTech and HealthTech. Your ability to translate between technical and business stakeholders is actually more valuable in these complex environments than in consumer technology.

Musk, Your Career Partner`;
  } 
  
  // Check for build_skills
  else if (adviceType === 'build_skills') {
    return `# Your Future Role Readiness Plan by Musk

I've analyzed your professional profile to identify the core skills you should build for future career advancement. Here's a comprehensive plan based on your background and industry trends.

## 🔎 Current Strength Mapping

- **Hard Skills**: Marketing automation, content strategy, basic data analysis, project management
- **Soft Skills**: Communication, stakeholder management, creative problem-solving, team coordination
- **Industry Tags**: MarTech, Digital Media, SaaS, Consumer Technology
- **Career Stage**: Mid-level with emerging leadership responsibilities

## 🌟 Potential Future Roles

Role | Match % | Why You're a Fit
-----|---------|----------------
AI Product Strategist | 87% | Your cross-functional experience and market insights position you well
Head of Marketing Operations | 76% | You already use MarTech tools and lead teams effectively
Growth Lead – SaaS | 79% | Your analytical mindset and campaign delivery record show aptitude
UX Research Director | 82% | Your user-centered approach aligns with this leadership path

## 🧠 Core Skills to Build Now

- **Prompt Engineering** | ⭐️ Must-have | Essential for future-facing marketing and AI content roles
- **Product Analytics (Mixpanel, GA4)** | ⭐️ Must-have | Required for Product and Strategy positions
- **AI Ethics & Policy** | 🔸 Optional | Valuable if entering regulated industries
- **Funnel Optimization** | 🔹 Medium | Needed in Growth/PM roles
- **Leadership Communication** | 🔹 Medium | Key for moving up into team/strategy roles

## 📚 Suggested Learning Tracks

- **AI for Product Thinkers** | LinkedIn Learning | 6 hrs
- **SQL & Funnel Data Analysis** | Mode Analytics Academy | 4 hrs
- **UX for Strategic Growth** | Coursera (Google UX) | 8 hrs
- **Prompt Engineering Mastery** | Udemy | 3 hrs
- **Leadership Communication** | Harvard Business School Online | 6 weeks

## 🔁 Ongoing Practice Suggestions

- Write one long-form AI-assisted blog each week on topics related to your target industry
- Shadow product sprints to learn Jira/Figma workflows as a side contributor
- Set up Notion-based growth dashboards for side projects or current work initiatives
- Join a cross-functional project outside your core expertise to build collaboration skills
- Create a weekly learning routine with Brandentifier's portfolio updates to document your skill growth

Remember that consistent, deliberate practice of these skills is more important than trying to learn everything at once. Focus on one skill from each category (technical, strategic, and communication) for balanced growth.

Musk, Your Career Partner`;
  }

  // Check for get_certifications
  else if (adviceType === 'get_certifications') {
    return `# Musk's Certification Growth Plan for ${userName}

I've analyzed your professional profile to identify the most valuable certifications that will accelerate your career growth and open new opportunities.

## 🔍 Step 1: Profile Analysis
I've identified these key areas from your experience:

Area | Extracted Insight
-----|----------------
Current Job Roles | Marketing Specialist with digital campaign management 
Industry/Domain | MarTech, Digital Media, SaaS
Tools & Skills | Content strategy, social media, analytics, project coordination
Career Level | Mid-level professional with 3-5 years experience
Project Types | Campaign launches, content creation, basic data analysis
Existing Certifications | Google Analytics (basic), HubSpot Marketing

## 🚀 Primary Growth Directions
Based on your experience and potential next steps:

Growth Path | Why it fits you
------------|---------------
🧠 AI-Powered Marketing | Your content creation skills position you well for AI-augmented marketing roles
📊 Data-Led Marketing Strategy | You have analytics experience that could be formalized with proper certifications
📈 Marketing Leadership | Your project coordination background shows readiness for management roles

## 🥇 Top Recommended Certifications

Certification Name | Platform | Level | Why it's Relevant
------------------|----------|-------|------------------
📘 Google Advanced Analytics | Google | Intermediate | Builds on your existing analytics knowledge
📊 Marketing Analytics Professional | Meta Blueprint | Advanced | Perfect for bridging marketing and data skills
💼 HubSpot Marketing Software | HubSpot Academy | Intermediate | Complements your existing certification
🧠 Prompt Engineering for Marketing | DeepLearning.ai | Beginner | Essential for future AI-marketing integration
🧪 Agile Marketing Leadership | Coursera | Intermediate | Ideal for moving toward team leadership

## 📚 Learning Path Timeline

Month 1-2:
- Complete Google Advanced Analytics (40 hours)
- Start building an analytics portfolio with real campaign data
- Use Brandentifier's Portfolio Builder to create a dedicated Certifications section

Month 3-4:
- Pursue HubSpot Marketing Software certification
- Apply new analytics skills to optimize current campaigns
- Update your Brandentifier Digital Visiting Card with new credentials

Month 5-6:
- Begin Prompt Engineering for Marketing
- Experiment with AI tools in your current role
- Connect with AI marketing specialists through Brandentifier's Smart Radar feature

## 💡 Career Impact

These certifications will position you for roles like:
- Marketing Analytics Manager ($85k-110k)
- Digital Strategy Director ($95k-130k)
- AI Marketing Specialist ($90k-115k)

## 📱 How Brandentifier Can Help Your Certification Journey

- **Portfolio Showcase**: Create a dedicated "Certifications & Skills" section in your Brandentifier portfolio to highlight your new credentials
- **Digital Visiting Card**: Update your card with each new certification to make networking more effective
- **Learning Verification**: Use Pulse updates to document your learning milestones and get feedback from other professionals
- **Smart Radar**: Connect with others who have completed these certifications to get study tips and career advice

Be strategic about certifications - focus on those that verify skills you're already developing through practical experience. The combination of formal certification and demonstrated application is far more powerful than certifications alone.

Musk, Your Career Partner`;
  }
  
  // Check for prepare_interviews
  else if (adviceType === 'prepare_interviews') {
    return `# Interview Excellence Strategy for ${userName}

I've analyzed your professional background and prepared a comprehensive interview preparation plan tailored to your experience level and target roles.

## 🎯 Interview Readiness Assessment

Component | Current Status
----------|---------------
Resume & Portfolio | Strong experience presentation but lacks achievement quantification
Technical Skills | Solid core competencies with some gaps in emerging technologies
Behavioral Preparation | Limited structured preparation for situation-based questions
Industry Knowledge | Good understanding of current trends but needs competitive landscape insights
Interview Confidence | Room for improvement in articulation and executive presence

## 💼 Core Interview Components to Master

### 1. Tell Your Professional Story
Your career narrative should emphasize:
- Clear progression showing intentional growth
- Key achievements that demonstrate your unique value
- Smooth explanation of career transitions
- Alignment between your experience and the target role

### 2. Technical/Domain Expertise Questions
Prepare for these assessment areas:
- Marketing campaign development and optimization
- Analytics tools and performance measurement
- Content strategy and audience segmentation
- Collaborative workflow and stakeholder management

### 3. Behavioral Question Framework (STAR Method)
Situation | Task | Action | Result
----------|------|--------|-------
**Describe the context** | **Explain your responsibility** | **Detail your specific actions** | **Share measurable outcomes**
Keep concise (20%) | Be clear about your role (10%) | Focus on YOUR contributions (40%) | Emphasize impact (30%)

## 🛠️ Interview Preparation Action Plan

Week 1-2:
- Research common interview questions for your target roles
- Prepare and practice your "Tell me about yourself" response (limit to 2 minutes)
- Update your Brandentifier portfolio with quantifiable achievements
- Create your Digital Visiting Card with interview-optimized content

Week 3-4:
- Conduct 2-3 mock interviews with peers or mentors
- Record yourself answering questions to improve delivery
- Prepare 5-7 compelling stories using the STAR method
- Use Brandentifier's Pulse feature to share industry insights that demonstrate expertise

## 📱 How Brandentifier Enhances Your Interview Success

- **Portfolio Showcase**: Update your portfolio to highlight projects most relevant to target positions
- **Digital Visiting Card**: Create a card specifically optimized for recruiters and hiring managers
- **Project Gallery**: Feature visual demonstrations of your work to reference during interviews
- **Industry Pulse**: Demonstrate thought leadership by sharing insights relevant to your target roles

## 🔍 Post-Interview Strategy

- Send a personalized thank-you note within 24 hours
- Connect with interviewers on Brandentifier to continue the professional relationship
- Conduct a self-assessment using the rubric above after each interview
- Iterate and improve your approach based on feedback and experience

Remember that interview excellence comes from thorough preparation, authentic delivery, and strategic follow-up. Your Brandentifier profile serves as both preparation tool and post-interview reinforcement of your professional brand.

Musk, Your Career Partner`;
  }
  
  // Check for launch_startup
  else if (adviceType === 'launch_startup') {
    return `# Startup Launch Blueprint for ${userName}

I've analyzed your professional background and developed a strategic roadmap to help you successfully launch your startup venture. This plan leverages your strengths while addressing critical success factors for new businesses.

## 🧠 Founder Readiness Assessment

Dimension | Your Profile
----------|------------
Domain Expertise | Strong industry knowledge with 5+ years experience
Market Understanding | Solid grasp of customer pain points
Technical Capabilities | Core competencies with some skill gaps
Network Strength | Moderate industry connections, needs strategic expansion
Financial Readiness | Basic planning skills, requires funding strategy refinement

## 🚀 Startup Launch Roadmap

### Phase 1: Validation (1-3 Months)
- Refine your value proposition with clear problem-solution fit
- Conduct 30+ customer discovery interviews to validate assumptions
- Build minimum viable product (MVP) focused on core functionality
- Identify and engage with 3-5 potential early adopters
- Create a Brandentifier portfolio showcasing your startup vision and progress

### Phase 2: Foundation Building (3-6 Months)
- Formalize business structure and legal foundations
- Develop go-to-market strategy with defined customer acquisition channels
- Build core team with complementary skills (technical, business, design)
- Secure initial funding through appropriate channels (bootstrapping, friends/family, angel)
- Use Brandentifier's Digital Visiting Card to represent your startup at networking events

### Phase 3: Launch & Initial Growth (6-12 Months)
- Execute official product launch with targeted marketing campaign
- Implement customer feedback loops for rapid iteration
- Establish key metrics and performance tracking systems
- Develop partnerships with strategic allies in your ecosystem
- Leverage Brandentifier's Services feature to showcase your startup's offerings

## 💰 Funding Strategy Options

Approach | Fit for You | Key Requirements
---------|-------------|------------------
**Bootstrapping** | **Good** | Lean operations, paying customers early
**Angel Investment** | **Excellent** | Compelling pitch deck, clear market opportunity
**Venture Capital** | **Moderate** | Scalable model, significant traction metrics
**Grants/Competitions** | **Good** | Innovative solution, social impact potential
**Strategic Partnerships** | **Excellent** | Complementary business alignments

## 🧩 Essential Startup Resources

- **Business Model Tools**: Lean Canvas, Business Model Canvas
- **Development Resources**: Low-code platforms, MVP development agencies
- **Legal Essentials**: Incorporation, IP protection, founder agreements
- **Marketing Foundation**: Brand identity, website, social presence
- **Network Development**: Industry events, startup communities, mentor relationships

## 📱 How Brandentifier Powers Your Startup Journey

- **Founder Portfolio**: Create a compelling startup founder profile that attracts investors and partners
- **Digital Visiting Card**: Design a custom card that professionally represents your venture
- **Services Showcase**: Feature your startup's offerings to generate early customer interest
- **Smart Radar**: Connect with potential co-founders, investors and customers in your area
- **Industry Pulse**: Establish thought leadership to build credibility in your space

## ⚡ Startup Success Accelerators

1. Focus relentlessly on solving a real customer problem
2. Embrace rapid iteration based on user feedback
3. Build a diverse team with complementary strengths
4. Maintain financial discipline with clear runway visibility
5. Cultivate an authentic founder story that resonates with stakeholders

Your entrepreneurial journey will be challenging but rewarding. With strategic planning, the right resources, and a resilient mindset, you have the foundation to build a successful venture.

Musk, Your Career Partner`;
  }
  
  // Check for international
  else if (adviceType === 'international') {
    return `# Global Career Strategy for ${userName}

I've analyzed your professional background and created a comprehensive guide to help you successfully pursue international career opportunities.

## 🌎 International Readiness Assessment

Factor | Your Current Status
-------|-------------------
Skills Transferability | Strong portable skillset in digital marketing
Global Experience | Limited international exposure, needs development
Language Proficiency | English (fluent), additional languages would be beneficial
Cultural Adaptability | Some international collaboration experience
Qualification Recognition | Core credentials recognized in major markets

## 🧭 Top International Markets for Your Profile

Country | Match Level | Opportunity Overview
--------|-------------|---------------------
🇨🇦 Canada | **High (85%)** | Strong tech sector, favorable immigration policies for skilled professionals
🇩🇪 Germany | **High (82%)** | Digital marketing talent shortage, English-friendly work environments
🇸🇬 Singapore | **Medium (76%)** | Regional hub for global companies, western-friendly business culture
🇦🇺 Australia | **Medium (75%)** | Growing digital economy, points-based immigration system
🇳🇱 Netherlands | **High (80%)** | Strong international business presence, English widely spoken

## 📝 International Career Preparation Roadmap

### Immediate Steps (1-3 Months)
- Restructure your resume in international format (focus on achievements vs. responsibilities)
- Update your Brandentifier portfolio with globally relevant projects and metrics
- Research visa requirements and qualification recognition for top target countries
- Create a country-specific Digital Visiting Card for each primary target market

### Short-Term Actions (3-6 Months)
- Build connections with professionals in target countries through Brandentifier's Smart Radar
- Begin language learning if required (focus on business vocabulary)
- Research cost of living and salary expectations in target locations
- Identify target companies with global mobility programs

### Medium-Term Strategy (6-12 Months)
- Apply for positions or internal transfers with international scope
- Prepare documentation for work visa applications
- Build savings fund for relocation expenses (typically 3-6 months of living expenses)
- Create country-specific versions of your application materials

## 🗓️ Visa & Immigration Overview

Country | Main Visa Path | Processing Time | Key Requirements
--------|---------------|-----------------|------------------
**Canada** | Express Entry | 6-12 months | Points system (age, education, experience, language)
**Germany** | EU Blue Card | 1-3 months | Job offer above salary threshold, degree recognition
**Singapore** | Employment Pass | 3-8 weeks | Salary threshold, qualifications, job offer
**Australia** | Skilled Migration | 8-14 months | Points system, occupation on skills list
**Netherlands** | Highly Skilled Migrant | 2-4 weeks | Salary threshold, recognized sponsor

## 📱 How Brandentifier Supports Your Global Career

- **International Portfolio**: Create country-specific portfolio versions highlighting relevant achievements
- **Digital Visiting Card**: Design cards tailored to each target market's business culture
- **Smart Radar**: Connect with professionals in your target countries for insider advice
- **Industry Pulse**: Share insights that showcase your global perspective and cross-cultural awareness
- **Services Showcase**: Feature your skills with international business relevance highlighted

## 🌟 Success Stories: Your Potential Path

Consider Sarah's journey: A marketing manager who relocated from Chicago to Berlin by:
1. Creating a German-optimized resume and Brandentifier portfolio
2. Building a network with German professionals through virtual coffee chats
3. Focusing on companies with English-speaking work environments
4. Securing a position with a Berlin startup needing her exact expertise
5. Successfully navigating the Blue Card application process

## 🛠️ Additional Global Career Resources

- Relocation services specialized in your target countries
- Expatriate communities in potential destinations
- Cost comparison tools for financial planning
- International job boards focused on your field
- Qualification equivalency assessment services

Remember that international career moves require careful planning, cultural openness, and strategic networking. By leveraging your Brandentifier presence and following this roadmap, you'll be well-positioned to pursue exciting global opportunities.

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