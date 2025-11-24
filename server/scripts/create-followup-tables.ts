/**
 * Manually create followup tables using raw SQL
 * Run with: npx tsx server/scripts/create-followup-tables.ts
 */

import { pool } from '../db';

async function createTables() {
  try {
    console.log('Creating followup_templates table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS followup_templates (
        id SERIAL PRIMARY KEY,
        industry TEXT NOT NULL,
        type TEXT NOT NULL,
        text TEXT NOT NULL,
        why TEXT,
        action_hint TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ followup_templates table created');

    console.log('Creating followup_feedback table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS followup_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        followup_text TEXT NOT NULL,
        followup_type TEXT,
        helpful BOOLEAN,
        template_id INTEGER REFERENCES followup_templates(id),
        context JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ followup_feedback table created');

    // Now seed the templates
    console.log('Seeding templates...');
    await seedTemplates();

    console.log('✅ All tables created and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

async function seedTemplates() {
  const templates = [
    ('Technology', 'action', 'Shall I draft a LinkedIn post summarizing your latest tech innovation?', 'Showcases innovation and builds authority', 'generate_post'),
    ('Technology', 'probe', 'Are you focused on B2B software or consumer tech solutions?', 'Clarifies audience', null),
    ('Technology', 'resource', 'Would you like a presentation template for your upcoming pitch?', 'Helps prepare professional decks', 'share_template'),
    ('Technology', 'clarify', 'Do you want to highlight product features or use cases first?', 'Content strategy decision', null),
    ('Technology', 'action', 'Should I generate a short demo video script for your product?', 'Supports visual content creation', 'generate_script'),
    ('Finance', 'action', 'Shall I draft a carousel explaining your financial strategy?', 'Highlights expertise', 'generate_post'),
    ('Finance', 'probe', 'Do you focus on personal finance, investment, or fintech?', 'Clarifies niche', null),
    ('Finance', 'resource', 'Would you like financial planning templates for clients?', 'Adds value to your brand', 'share_template'),
    ('Finance', 'clarify', 'Should your content be educational or advisory?', 'Defines tone and goal', null),
    ('Finance', 'action', 'Want a one-minute explainer video outline for your service?', 'Engaging content creation', 'generate_script'),
    ('Healthcare', 'action', 'Would you like to post a health awareness infographic?', 'Educates and builds trust', 'generate_post'),
    ('Healthcare', 'probe', 'Which healthcare topic aligns most with your practice?', 'Personalizes outreach', null),
    ('Healthcare', 'resource', 'Want ready-to-edit wellness post templates?', 'Simplifies creation', 'share_template'),
    ('Healthcare', 'clarify', 'Is your audience patients or other professionals?', 'Sets tone and content type', null),
    ('Healthcare', 'action', 'Shall I create a LinkedIn article about your recent case study?', 'Builds authority', 'generate_post'),
    ('Marketing', 'probe', 'Which channel drives most of your leads — LinkedIn, Instagram, or Ads?', 'Channel focus', null),
    ('Marketing', 'action', 'Shall I draft a 5-step campaign brief you can use this month?', 'Operational deliverable', 'generate_post'),
    ('Marketing', 'resource', 'Want a social calendar template for the next 30 days?', 'Planning asset', 'share_template'),
    ('Marketing', 'clarify', 'Are you focused on brand awareness or direct response?', 'Campaign objective', null),
    ('Marketing', 'action', 'Should I generate copy + CTAs for a paid ad set (3 variants)?', 'Ad creative generation', 'generate_post'),
    ('Design', 'action', 'Shall I draft a 5-slide Instagram carousel showing your design process?', 'Fast actionable deliverable', 'generate_post'),
    ('Design', 'probe', 'Which clients do you want to attract — startups or agencies?', 'Narrows target audience', null),
    ('Design', 'resource', 'Want a portfolio case-study template for UI projects?', 'Gives ready-to-use asset', 'share_template'),
    ('Design', 'clarify', 'Do you prefer carousels or single-image posts for case studies?', 'Clarifies format', null),
    ('Design', 'action', 'Shall I create a project entry with visuals for your latest UI case?', 'Quick portfolio add', 'create_portfolio_item'),
    ('Education', 'action', 'Shall I help you post about your teaching philosophy?', 'Positions you as a thought leader', 'generate_post'),
    ('Education', 'probe', 'Do you teach online, offline, or hybrid?', 'Helps tailor platform strategy', null),
    ('Education', 'resource', 'Would you like a content template for course promotions?', 'Saves time', 'share_template'),
    ('Education', 'clarify', 'Is your audience students or fellow educators?', 'Clarifies communication style', null),
    ('Education', 'action', 'Should I create a visual post summarizing your student achievements?', 'Boosts credibility', 'generate_post'),
    ('Sales', 'action', 'Shall I draft a prospecting email template for your target accounts?', 'Accelerates lead generation', 'generate_post'),
    ('Sales', 'probe', 'What is your average deal size and sales cycle?', 'Tailors strategy to your business', null),
    ('Sales', 'resource', 'Want a CRM best practices checklist?', 'Improves pipeline management', 'share_template'),
    ('Sales', 'clarify', 'Are you selling B2B or B2C?', 'Determines sales approach', null),
    ('Sales', 'action', 'Should I create a LinkedIn outreach sequence for cold prospects?', 'Drives qualified meetings', 'generate_post'),
  ];

  for (const [industry, type, text, why, actionHint] of templates) {
    await pool.query(
      `INSERT INTO followup_templates (industry, type, text, why, action_hint)
       VALUES ($1, $2, $3, $4, $5)`,
      [industry, type, text, why, actionHint]
    );
  }

  console.log(`✅ Seeded ${templates.length} templates`);
}

createTables();
