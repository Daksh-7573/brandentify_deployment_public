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
**Resume & Portfolio** | Strong experience presentation but lacks achievement quantification
**Technical Skills** | Solid core competencies with some gaps in emerging technologies
**Behavioral Preparation** | Limited structured preparation for situation-based questions
**Industry Knowledge** | Good understanding of current trends but needs competitive landscape insights
**Interview Confidence** | Room for improvement in articulation and executive presence

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
**Domain Expertise** | Strong industry knowledge with 5+ years experience
**Market Understanding** | Solid grasp of customer pain points
**Technical Capabilities** | Core competencies with some skill gaps
**Network Strength** | Moderate industry connections, needs strategic expansion
**Financial Readiness** | Basic planning skills, requires funding strategy refinement

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
  
  // Check for get_certifications
  else if (adviceType === 'get_certifications') {
    return `# Certification Growth Strategy for ${userName}

## 📊 Profile Analysis

**Current Position**: Senior Marketing Manager
**Industry**: Technology/SaaS
**Experience Level**: 6-8 years
**Technical Toolkit**: Analytics platforms, CRM systems, content management
**Domain Expertise**: Digital marketing, campaign management, audience segmentation

## 🏆 Primary Growth Directions

Based on your profile and industry trends, these certification paths offer the strongest career advancement opportunities:

Growth Path | Strategic Value | Career Impact
------------|-----------------|---------------
**Marketing Analytics Mastery** | **High** | Positions you as data-driven decision maker
**Marketing Technology Expertise** | **High** | Bridges marketing and technical implementation
**Strategic Leadership Development** | **Medium** | Prepares for senior leadership roles
**Industry-Specific Credentials** | **Medium** | Differentiates you in specialized verticals

## 🎓 Top Recommended Certifications

### Marketing Analytics Track

Certification | Platform | Level | Relevance
--------------|----------|-------|----------
**Google Analytics 4 Certification** | Google | Intermediate | **★★★★★**
**Marketing Analytics Certification** | Meta | Intermediate | **★★★★☆**
**Professional Certificate in Data-Driven Marketing** | Cornell | Advanced | **★★★★★**

Why this matters: Analytics expertise has become the #1 differentiator for senior marketing roles, with 78% of marketing leaders prioritizing these skills in hiring decisions. These certifications validate your ability to extract actionable insights and measure ROI effectively.

### Marketing Technology Track

Certification | Platform | Level | Relevance
--------------|----------|-------|----------
**Salesforce Marketing Cloud Certification** | Salesforce | Intermediate | **★★★★★**
**HubSpot Marketing Software Certification** | HubSpot | Intermediate | **★★★★☆**
**Marketo Certified Expert** | Adobe | Advanced | **★★★★★**

Why this matters: Marketing technology skills bridge the gap between strategy and execution. These certifications demonstrate your ability to implement sophisticated marketing automation, personalization, and integration solutions—increasingly critical for senior roles.

### Strategic Leadership Track

Certification | Platform | Level | Relevance
--------------|----------|-------|----------
**Digital Marketing Leadership** | Northwestern | Advanced | **★★★★☆**
**Strategic Marketing Management** | Harvard Business School | Advanced | **★★★★★**
**Project Management Professional (PMP)** | PMI | Intermediate | **★★★☆☆**

Why this matters: These credentials signal your readiness for strategic leadership roles by validating your ability to align marketing initiatives with broader business objectives and lead cross-functional teams effectively.

## 📈 Learning Path Timeline

Month | Focus | Certifications | Application
------|-------|----------------|------------
**1-2** | **Marketing Analytics** | Google Analytics 4 | Apply analytics to current campaigns
**3-4** | **Technical Foundation** | HubSpot Marketing Software | Implement automation workflows
**5-6** | **Advanced Analytics** | Cornell Data-Driven Marketing | Develop predictive models for campaigns
**7-8** | **Marketing Technology** | Salesforce Marketing Cloud | Build integrated customer journeys
**9-12** | **Strategic Leadership** | Harvard Marketing Management | Lead cross-functional initiative

## 💼 Career Impact Analysis

The certification portfolio outlined above positions you for:

Role | Salary Range | Certification Impact
-----|--------------|---------------------
**Marketing Director** | **$125,000-$165,000** | Gives competitive edge over 60% of applicants
**Head of Marketing Operations** | **$115,000-$150,000** | Critical qualification for technical marketing leadership
**Chief Marketing Officer** | **$180,000-$250,000** | Builds credibility for executive consideration
**Marketing Analytics Director** | **$130,000-$175,000** | Essential qualification for specialized leadership

## 📱 How Brandentifier Showcases Your Growth

- **Certification Showcase**: Display your credentials in a dedicated section of your portfolio
- **Digital Visiting Card**: Feature your most impressive certifications on your professional card
- **Skills Verification**: Brandentifier validates your certified skills to increase credibility
- **Progress Tracking**: Document and share your learning journey through Brandentifier's Industry Pulse
- **Expert Matching**: Connect with professionals who hold your target certifications through Smart Radar

## 🔥 Differentiation Strategy

While certifications are valuable, combine them with practical application to truly stand out:

1. **Apply new skills in current role** (document results in your Brandentifier portfolio)
2. **Lead a pilot project** leveraging your certification knowledge
3. **Mentor colleagues** on newly acquired technical skills
4. **Share industry insights** through Brandentifier's Industry Pulse feature
5. **Develop case studies** demonstrating certification application to real challenges

Remember that certifications are most valuable when integrated into a comprehensive career development strategy that combines credentials, experience, and strategic networking.

Musk, Your Career Partner`;
  }
  
  // Check for build_skills
  else if (adviceType === 'build_skills') {
    return `# Core Skills Analysis for ${userName}

## 🔍 Current Strength Mapping

Skill Category | Proficiency Level | Career Impact
---------------|------------------|---------------
**Technical Skills** | Advanced (Data Analysis, SQL, Tableau) | Strong foundation for data-driven decisions
**Domain Knowledge** | Strong (Marketing, E-commerce) | Enables industry-specific strategic insights
**Soft Skills** | Advanced (Communication, Team Leadership) | Facilitates effective collaboration and influence
**Management** | Intermediate (Project Management, Resource Allocation) | Supports delivery of complex initiatives
**Business Acumen** | Developing (Financial Analysis, Market Research) | Growing ability to align work with business goals

## ⚡ Potential Future Roles

Role | Match % | Why It Fits
-----|---------|------------
**Senior Marketing Analyst** | **85%** | Strong data skills + marketing domain knowledge align perfectly
**Product Marketing Manager** | **78%** | Combines analytical abilities with strategic communication skills
**Growth Strategist** | **75%** | Your data-driven approach suits emerging growth optimization functions
**Customer Insights Lead** | **73%** | Leverages analytical capabilities with user-centered thinking
**Marketing Operations Manager** | **70%** | Technical capabilities + organizational skills create strong fit

## 🚀 Core Skills to Develop

### Technical Track (3-6 Months)
Skill | Why It Matters | Learning Resources
------|----------------|-------------------
**Python for Data Analysis** | Enables deeper data manipulation and predictive models | DataCamp Python Data Science track, Google Data Analytics Certificate
**Marketing Automation** | Critical for scaling operations and personalization | HubSpot Academy, Marketo Certified Expert
**A/B Testing Frameworks** | Provides rigorous approach to optimization | Optimize by Google, Experimentation & Testing courses

### Strategic Track (6-12 Months) 
Skill | Why It Matters | Learning Resources
------|----------------|-------------------
**Strategic Planning** | Shifts from tactical to strategic contributor | Harvard Business Essentials, PMI Strategic Planning Professional
**Cross-functional Leadership** | Builds influence without direct authority | LinkedIn Learning Leadership courses, INSEAD Executive Education
**Financial Modeling** | Connects marketing activities to business outcomes | Financial Modeling for Marketing Decisions, Wall Street Prep

## 📈 Learning Path Structure

1. **Foundation Phase (1-3 months)**
   - Complete Python fundamentals course with marketing-specific applications
   - Obtain basic marketing automation certification (HubSpot/Marketo)
   - Update your Brandentifier portfolio to showcase these new skills

2. **Application Phase (3-6 months)**
   - Implement 2-3 Python-based analyses on real marketing datasets
   - Develop automated workflows for key marketing processes
   - Create a Brandentifier Service offering that highlights your new automation expertise

3. **Integration Phase (6-12 months)**
   - Combine technical and strategic skills in cross-functional projects
   - Implement financial impact models for marketing initiatives
   - Showcase your strategic case studies through Brandentifier's Industry Pulse

## 📱 How Brandentifier Enhances Your Skill Development

- **Portfolio Updates**: Add new skill certifications and project examples as you progress
- **Digital Visiting Card**: Update to highlight your emerging technical + strategic skillset
- **Services Showcase**: Offer specialized services utilizing your developing expertise
- **Smart Radar**: Connect with professionals who have mastered your target skills
- **Industry Pulse**: Share insights that demonstrate your growing expertise to potential employers

## 💡 Applying Your Skills: Mini-Project Ideas

1. **Marketing Channel Optimization Model**:
   - Build a Python-based attribution model
   - Visualize results in interactive dashboard
   - Document the process on your Brandentifier portfolio

2. **Automated Customer Journey Analysis**:
   - Implement a marketing automation workflow
   - Track key conversion points and optimize
   - Create a case study highlighting results

3. **Revenue Impact Forecast**:
   - Develop a financial model connecting marketing KPIs to revenue
   - Present findings in executive-friendly format
   - Share insights through a Brandentifier Pulse

By systematically developing these complementary skills, you'll create a unique professional profile that combines technical depth, domain expertise, and strategic thinking—positioning you for accelerated career advancement.

Musk, Your Career Partner`;
  }
  
  else if (adviceType === 'international') {
    return `# Global Career Strategy for ${userName}

I've analyzed your professional background and created a comprehensive guide to help you successfully pursue international career opportunities.

## 🌎 International Readiness Assessment

Factor | Your Current Status
-------|-------------------
**Skills Transferability** | Strong portable skillset in digital marketing
**Global Experience** | Limited international exposure, needs development
**Language Proficiency** | English (fluent), additional languages would be beneficial
**Cultural Adaptability** | Some international collaboration experience
**Qualification Recognition** | Core credentials recognized in major markets

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
  
  // Check for switch_industry
  else if (adviceType === 'switch_industry') {
    return `# Industry Switch Navigator for ${userName}

I've analyzed your professional background and identified strategic industry transition opportunities that leverage your existing skills while opening new career paths.

## 🚀 Current Position Analysis

**Current Role**: Senior Marketing Manager
**Industry**: Technology/SaaS
**Core Transferable Skills**: Strategic planning, campaign management, team leadership, data analysis, cross-functional collaboration
**Industry-Specific Knowledge**: B2B marketing, product messaging, technical audience targeting

## 🧭 Industry Switch Options

### 🟢 Healthcare Technology - **High Match (82%)**

The healthcare technology sector offers a compelling transition path that values your technical marketing background while opening opportunities in a growing, mission-driven field.

**Why It Fits You**: 
- Your experience marketing complex products translates well to healthcare tech solutions
- Technical audience expertise applies to physician and administrator demographics
- Data-driven approach matches healthcare's evidence-based culture
- SaaS marketing skills transfer directly to subscription-based healthcare platforms

**Roles to Explore**:
- Healthcare Marketing Director
- Patient Engagement Solutions Manager
- Healthcare Product Marketing Leader
- Digital Health Strategy Director

**Next Steps**:
1. Research leading healthcare tech companies and their marketing approaches
2. Connect with 5-7 marketing professionals in the healthcare tech space through Brandentifier
3. Update your Brandentifier portfolio with relevant healthcare-adjacent case studies
4. Identify 2-3 healthcare industry certifications to supplement your expertise

**Brandentifier Strategy**: Create a specialized Digital Visiting Card highlighting transferable skills for healthcare technology recruiters

### 🟡 Financial Services - **Medium Match (76%)**

Financial services offers stability and premium compensation with growing demand for digital marketing expertise as the industry modernizes.

**Why It Fits You**:
- Data-driven approach aligns with financial industry analytics focus
- Compliance experience in tech transfers to regulated financial environment
- Your technical product marketing skills apply to complex financial products
- Customer journey expertise valuable for financial onboarding and retention

**Roles to Explore**:
- Financial Products Marketing Manager
- Wealth Management Marketing Director
- FinTech Customer Acquisition Lead
- Banking Digital Experience Manager

**Next Steps**:
1. Develop foundational knowledge of financial products and regulations
2. Emphasize compliance and security aspects of your previous work
3. Connect with 3-5 marketing professionals in financial services via Brandentifier
4. Update your digital portfolio with case studies highlighting regulatory compliance

**Brandentifier Strategy**: Update your Industry Pulse posts with insights that demonstrate understanding of financial markets and customer challenges

### 🟢 Education Technology - **High Match (85%)**

EdTech represents an excellent transition opportunity with strong demand for marketing professionals who understand both technology and user engagement.

**Why It Fits You**:
- SaaS marketing experience directly applies to subscription learning platforms
- Your content marketing skills transfer to curriculum and course marketing
- Product positioning expertise relevant for differentiated learning solutions
- Data analysis background valuable for learning outcomes measurement

**Roles to Explore**:
- EdTech Marketing Director
- Higher Education Solutions Marketing
- K-12 Platform Adoption Specialist
- Learning Experience Marketing Manager

**Next Steps**:
1. Research leading EdTech platforms and their marketing approaches
2. Take a short course on learning science fundamentals
3. Connect with educators to understand educational institution decision processes
4. Create a specialized Brandentifier portfolio section highlighting relevant experience

**Brandentifier Strategy**: Use Smart Radar to connect with EdTech professionals in your area for informational interviews

### 🟠 Sustainability/Green Tech - **Moderate Match (68%)**

While requiring some additional knowledge acquisition, the sustainability sector offers purpose-driven work with growing demand and funding.

**Why It Fits You**:
- Technology marketing experience applies to green tech innovations
- Storytelling skills essential for communicating sustainability value propositions
- Strategic planning transfers to developing long-term sustainability initiatives
- Change management experience valuable in shifting organizational practices

**Roles to Explore**:
- Sustainability Communications Director
- Green Technology Marketing Manager
- Corporate Social Responsibility Lead
- Environmental Solutions Strategist

**Next Steps**:
1. Develop foundational knowledge of key sustainability frameworks and metrics
2. Highlight any environmental or social impact aspects of previous work
3. Consider sustainability certification (e.g., LEED Green Associate)
4. Connect with professionals in sustainability marketing via Brandentifier

**Brandentifier Strategy**: Share industry insights about sustainability trends to demonstrate genuine interest and knowledge building

## 📊 Transition Planning Timeline

### Immediate Actions (1-3 Months)
- Conduct in-depth research on your top 2 industry choices
- Update your Brandentifier portfolio with relevant case studies and projects
- Begin industry-specific networking through Brandentifier's Smart Radar
- Identify skill gaps and begin targeted learning

### Mid-Term Steps (3-6 Months)
- Obtain 1-2 relevant certifications in your target industry
- Create industry-specific Digital Visiting Cards for each prime target
- Develop thought leadership content in your target industry
- Secure informational interviews with 5+ professionals in target roles

### Long-Term Strategy (6-12 Months)
- Pursue transitional roles that bridge your current and target industries
- Join industry associations and attend key conferences
- Consider freelance projects in your target industry for portfolio building
- Leverage your Brandentifier network for internal referrals

## 📱 How Brandentifier Supports Your Industry Transition

- **Industry-Specific Portfolio**: Create versions of your portfolio tailored to each target industry
- **Digital Visiting Card**: Develop cards that emphasize transferable skills for each target sector
- **Smart Radar**: Connect with professionals in your target industries who made similar transitions
- **Industry Pulse**: Share insights demonstrating your understanding of target industry challenges
- **Services Showcase**: Offer specialized consulting aligned with your destination industry

Remember that successful industry transitions build on your existing strengths while strategically addressing knowledge gaps. By leveraging your Brandentifier presence and following this roadmap, you'll be well-positioned to make a successful career pivot.

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