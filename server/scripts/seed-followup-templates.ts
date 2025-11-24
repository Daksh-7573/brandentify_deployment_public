/**
 * Seed script for follow-up templates
 * Run with: npx tsx server/scripts/seed-followup-templates.ts
 */

import { pool } from '../db';

const FOLLOWUP_TEMPLATES = [
  // TECHNOLOGY
  {
    industry: 'Technology',
    type: 'action',
    text: 'Shall I draft a LinkedIn post summarizing your latest tech innovation?',
    why: 'Showcases innovation and builds authority',
    actionHint: 'generate_post'
  },
  {
    industry: 'Technology',
    type: 'probe',
    text: 'Are you focused on B2B software or consumer tech solutions?',
    why: 'Clarifies audience',
    actionHint: null
  },
  {
    industry: 'Technology',
    type: 'resource',
    text: 'Would you like a presentation template for your upcoming pitch?',
    why: 'Helps prepare professional decks',
    actionHint: 'share_template'
  },
  {
    industry: 'Technology',
    type: 'clarify',
    text: 'Do you want to highlight product features or use cases first?',
    why: 'Content strategy decision',
    actionHint: null
  },
  {
    industry: 'Technology',
    type: 'action',
    text: 'Should I generate a short demo video script for your product?',
    why: 'Supports visual content creation',
    actionHint: 'generate_script'
  },

  // FINANCE
  {
    industry: 'Finance',
    type: 'action',
    text: 'Shall I draft a carousel explaining your financial strategy?',
    why: 'Highlights expertise',
    actionHint: 'generate_post'
  },
  {
    industry: 'Finance',
    type: 'probe',
    text: 'Do you focus on personal finance, investment, or fintech?',
    why: 'Clarifies niche',
    actionHint: null
  },
  {
    industry: 'Finance',
    type: 'resource',
    text: 'Would you like financial planning templates for clients?',
    why: 'Adds value to your brand',
    actionHint: 'share_template'
  },
  {
    industry: 'Finance',
    type: 'clarify',
    text: 'Should your content be educational or advisory?',
    why: 'Defines tone and goal',
    actionHint: null
  },
  {
    industry: 'Finance',
    type: 'action',
    text: 'Want a one-minute explainer video outline for your service?',
    why: 'Engaging content creation',
    actionHint: 'generate_script'
  },

  // HEALTHCARE
  {
    industry: 'Healthcare',
    type: 'action',
    text: 'Would you like to post a health awareness infographic?',
    why: 'Educates and builds trust',
    actionHint: 'generate_post'
  },
  {
    industry: 'Healthcare',
    type: 'probe',
    text: 'Which healthcare topic aligns most with your practice?',
    why: 'Personalizes outreach',
    actionHint: null
  },
  {
    industry: 'Healthcare',
    type: 'resource',
    text: 'Want ready-to-edit wellness post templates?',
    why: 'Simplifies creation',
    actionHint: 'share_template'
  },
  {
    industry: 'Healthcare',
    type: 'clarify',
    text: 'Is your audience patients or other professionals?',
    why: 'Sets tone and content type',
    actionHint: null
  },
  {
    industry: 'Healthcare',
    type: 'action',
    text: 'Shall I create a LinkedIn article about your recent case study?',
    why: 'Builds authority',
    actionHint: 'generate_post'
  },

  // MARKETING
  {
    industry: 'Marketing',
    type: 'probe',
    text: 'Which channel drives most of your leads — LinkedIn, Instagram, or Ads?',
    why: 'Channel focus',
    actionHint: null
  },
  {
    industry: 'Marketing',
    type: 'action',
    text: 'Shall I draft a 5-step campaign brief you can use this month?',
    why: 'Operational deliverable',
    actionHint: 'generate_post'
  },
  {
    industry: 'Marketing',
    type: 'resource',
    text: 'Want a social calendar template for the next 30 days?',
    why: 'Planning asset',
    actionHint: 'share_template'
  },
  {
    industry: 'Marketing',
    type: 'clarify',
    text: 'Are you focused on brand awareness or direct response?',
    why: 'Campaign objective',
    actionHint: null
  },
  {
    industry: 'Marketing',
    type: 'action',
    text: 'Should I generate copy + CTAs for a paid ad set (3 variants)?',
    why: 'Ad creative generation',
    actionHint: 'generate_post'
  },

  // DESIGN
  {
    industry: 'Design',
    type: 'action',
    text: 'Shall I draft a 5-slide Instagram carousel showing your design process?',
    why: 'Fast actionable deliverable',
    actionHint: 'generate_post'
  },
  {
    industry: 'Design',
    type: 'probe',
    text: 'Which clients do you want to attract — startups or agencies?',
    why: 'Narrows target audience',
    actionHint: null
  },
  {
    industry: 'Design',
    type: 'resource',
    text: 'Want a portfolio case-study template for UI projects?',
    why: 'Gives ready-to-use asset',
    actionHint: 'share_template'
  },
  {
    industry: 'Design',
    type: 'clarify',
    text: 'Do you prefer carousels or single-image posts for case studies?',
    why: 'Clarifies format',
    actionHint: null
  },
  {
    industry: 'Design',
    type: 'action',
    text: 'Shall I create a project entry with visuals for your latest UI case?',
    why: 'Quick portfolio add',
    actionHint: 'create_portfolio_item'
  },

  // EDUCATION
  {
    industry: 'Education',
    type: 'action',
    text: 'Shall I help you post about your teaching philosophy?',
    why: 'Positions you as a thought leader',
    actionHint: 'generate_post'
  },
  {
    industry: 'Education',
    type: 'probe',
    text: 'Do you teach online, offline, or hybrid?',
    why: 'Helps tailor platform strategy',
    actionHint: null
  },
  {
    industry: 'Education',
    type: 'resource',
    text: 'Would you like a content template for course promotions?',
    why: 'Saves time',
    actionHint: 'share_template'
  },
  {
    industry: 'Education',
    type: 'clarify',
    text: 'Is your audience students or fellow educators?',
    why: 'Clarifies communication style',
    actionHint: null
  },
  {
    industry: 'Education',
    type: 'action',
    text: 'Should I create a visual post summarizing your student achievements?',
    why: 'Boosts credibility',
    actionHint: 'generate_post'
  },

  // SALES
  {
    industry: 'Sales',
    type: 'action',
    text: 'Shall I draft a prospecting email template for your target accounts?',
    why: 'Accelerates lead generation',
    actionHint: 'generate_post'
  },
  {
    industry: 'Sales',
    type: 'probe',
    text: 'What is your average deal size and sales cycle?',
    why: 'Tailors strategy to your business',
    actionHint: null
  },
  {
    industry: 'Sales',
    type: 'resource',
    text: 'Want a CRM best practices checklist?',
    why: 'Improves pipeline management',
    actionHint: 'share_template'
  },
  {
    industry: 'Sales',
    type: 'clarify',
    text: 'Are you selling B2B or B2C?',
    why: 'Determines sales approach',
    actionHint: null
  },
  {
    industry: 'Sales',
    type: 'action',
    text: 'Should I create a LinkedIn outreach sequence for cold prospects?',
    why: 'Drives qualified meetings',
    actionHint: 'generate_post'
  }
];

async function seedTemplates() {
  try {
    console.log('Starting followup templates seed...');

    // Clear existing templates
    await pool.query('TRUNCATE TABLE followup_templates');
    console.log('Cleared existing templates');

    // Insert new templates
    for (const template of FOLLOWUP_TEMPLATES) {
      await pool.query(
        `INSERT INTO followup_templates (industry, type, text, why, action_hint)
         VALUES ($1, $2, $3, $4, $5)`,
        [template.industry, template.type, template.text, template.why, template.actionHint]
      );
    }

    console.log(`✅ Successfully seeded ${FOLLOWUP_TEMPLATES.length} followup templates`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
