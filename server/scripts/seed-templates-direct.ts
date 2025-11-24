import { pool } from '../db';

const templates = [
  ['Technology', 'action', 'Shall I draft a LinkedIn post summarizing your latest tech innovation?', 'Showcases innovation and builds authority', 'generate_post'],
  ['Technology', 'probe', 'Are you focused on B2B software or consumer tech solutions?', 'Clarifies audience', null],
  ['Technology', 'resource', 'Would you like a presentation template for your upcoming pitch?', 'Helps prepare professional decks', 'share_template'],
  ['Technology', 'clarify', 'Do you want to highlight product features or use cases first?', 'Content strategy decision', null],
  ['Finance', 'action', 'Shall I draft a carousel explaining your financial strategy?', 'Highlights expertise', 'generate_post'],
  ['Finance', 'probe', 'Do you focus on personal finance, investment, or fintech?', 'Clarifies niche', null],
  ['Finance', 'resource', 'Would you like financial planning templates for clients?', 'Adds value to your brand', 'share_template'],
  ['Healthcare', 'action', 'Would you like to post a health awareness infographic?', 'Educates and builds trust', 'generate_post'],
  ['Healthcare', 'probe', 'Which healthcare topic aligns most with your practice?', 'Personalizes outreach', null],
  ['Healthcare', 'clarify', 'Is your audience patients or other professionals?', 'Sets tone and content type', null],
  ['Marketing', 'probe', 'Which channel drives most of your leads — LinkedIn, Instagram, or Ads?', 'Channel focus', null],
  ['Marketing', 'action', 'Shall I draft a 5-step campaign brief you can use this month?', 'Operational deliverable', 'generate_post'],
  ['Marketing', 'clarify', 'Are you focused on brand awareness or direct response?', 'Campaign objective', null],
  ['Design', 'action', 'Shall I draft a 5-slide Instagram carousel showing your design process?', 'Fast actionable deliverable', 'generate_post'],
  ['Design', 'probe', 'Which clients do you want to attract — startups or agencies?', 'Narrows target audience', null],
  ['Design', 'clarify', 'Do you prefer carousels or single-image posts for case studies?', 'Clarifies format', null],
  ['Education', 'action', 'Shall I help you post about your teaching philosophy?', 'Positions you as a thought leader', 'generate_post'],
  ['Education', 'probe', 'Do you teach online, offline, or hybrid?', 'Helps tailor platform strategy', null],
  ['Education', 'clarify', 'Is your audience students or fellow educators?', 'Clarifies communication style', null],
  ['Sales', 'action', 'Shall I draft a prospecting email template for your target accounts?', 'Accelerates lead generation', 'generate_post'],
  ['Sales', 'probe', 'What is your average deal size and sales cycle?', 'Tailors strategy to your business', null],
  ['Sales', 'clarify', 'Are you selling B2B or B2C?', 'Determines sales approach', null],
];

async function seed() {
  try {
    console.log('Seeding templates...');
    for (const [industry, type, text, why, actionHint] of templates) {
      await pool.query(
        `INSERT INTO followup_templates (industry, type, text, why, action_hint)
         VALUES ($1, $2, $3, $4, $5)`,
        [industry, type, text, why, actionHint]
      );
    }
    console.log(`✅ Seeded ${templates.length} templates!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
