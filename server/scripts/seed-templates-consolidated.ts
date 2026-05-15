/**
 * Enhanced Seed script for follow-up templates
 * Consolidated from 10+ industries with 100+ templates
 * Run with: npx tsx server/scripts/seed-templates-consolidated.ts
 */

import { pool } from '../db';

const TEMPLATES = [
    // --- DESIGN (15 templates) ---
    { industry: 'Design', type: 'action', text: 'Shall I draft a 5-slide Instagram carousel showing your design process?', why: 'Fast actionable deliverable', actionHint: 'generate_post' },
    { industry: 'Design', type: 'probe', text: 'Which clients do you want to attract — startups or agencies?', why: 'Narrows target audience', actionHint: null },
    { industry: 'Design', type: 'resource', text: 'Want a portfolio case-study template for UI projects?', why: 'Gives ready-to-use asset', actionHint: 'share_template' },
    { industry: 'Design', type: 'clarify', text: 'Do you prefer carousels or single-image posts for case studies?', why: 'Clarifies format', actionHint: null },
    { industry: 'Design', type: 'action', text: 'Shall I create a project entry with visuals for your latest UI case?', why: 'Quick portfolio add', actionHint: 'create_portfolio_item' },
    { industry: 'Design', type: 'probe', text: 'What metric did your redesign improve — CTR, retention, or conversion?', why: 'Pulls a measurable result', actionHint: null },
    { industry: 'Design', type: 'resource', text: 'Would you like 3 caption variants we can test for this case study?', why: 'Text A/B options', actionHint: 'share_template' },
    { industry: 'Design', type: 'action', text: 'Want me to generate hashtags and keywords for design leaders?', why: 'Increases discoverability', actionHint: 'share_hashtag_pack' },
    { industry: 'Design', type: 'clarify', text: 'Is this work client-owned or can we post the UI assets publicly?', why: 'Checks permissions', actionHint: null },
    { industry: 'Design', type: 'probe', text: 'Who was the primary decision-maker on this project?', why: 'Gathers stakeholder info', actionHint: null },
    { industry: 'Design', type: 'action', text: 'Should I draft a LinkedIn thought post emphasizing your design methodology?', why: 'Builds authority', actionHint: 'generate_post' },
    { industry: 'Design', type: 'resource', text: 'Need a 1-page PDF portfolio to send to prospects?', why: 'Sales asset', actionHint: 'generate_pdf_portfolio' },
    { industry: 'Design', type: 'probe', text: 'How often can you commit to posting case studies — weekly or monthly?', why: 'Sets cadence', actionHint: null },
    { industry: 'Design', type: 'alternative', text: 'Would you rather showcase micro case studies or deep-dives?', why: 'Gives strategy alternative', actionHint: null },
    { industry: 'Design', type: 'confirm', text: 'Shall I proceed to create the carousel draft now?', why: 'Confirms next step', actionHint: 'generate_post' },

    // --- SAAS (15 templates) ---
    { industry: 'SaaS', type: 'probe', text: 'Are you targeting SMBs or enterprise customers?', why: 'Clarifies target market', actionHint: null },
    { industry: 'SaaS', type: 'action', text: 'Shall I draft a founder story post showing your product-market fit?', why: 'Builds founder authority', actionHint: 'generate_post' },
    { industry: 'SaaS', type: 'resource', text: 'Want a launch-email template for beta signups?', why: 'Conversion asset', actionHint: 'share_template' },
    { industry: 'SaaS', type: 'clarify', text: 'Are you selling B2B or B2C?', why: 'Important product angle', actionHint: null },
    { industry: 'SaaS', type: 'action', text: 'Should I create a one-page case study showing ARR uplift?', why: 'Revenue-focused asset', actionHint: 'create_portfolio_item' },
    { industry: 'SaaS', type: 'probe', text: 'Which KPI matters most for you — MRR, CAC, churn?', why: 'Tailors messaging', actionHint: null },
    { industry: 'SaaS', type: 'resource', text: 'Want a list of SaaS pitch hooks for investors?', why: 'Funding readiness', actionHint: 'share_template' },
    { industry: 'SaaS', type: 'action', text: 'Shall I schedule a 15-min intro call with a potential mentor in growth?', why: 'Connects to mentor', actionHint: 'schedule_call' },
    { industry: 'SaaS', type: 'clarify', text: 'Is the product in private beta or public beta?', why: 'Product state', actionHint: null },
    { industry: 'SaaS', type: 'probe', text: 'Who are 3 competitors we should differentiate from?', why: 'Competitive angle', actionHint: null },
    { industry: 'SaaS', type: 'resource', text: 'I can generate a concise deck slide for your GTM — need it?', why: 'Quick deck help', actionHint: 'generate_slide_deck' },
    { industry: 'SaaS', type: 'action', text: 'Shall I draft a tweet thread explaining your technical advantage?', why: 'Technical authority', actionHint: 'generate_post' },
    { industry: 'SaaS', type: 'alternative', text: 'Prefer a case study or an explainer demo video to show traction?', why: 'Content format choice', actionHint: null },
    { industry: 'SaaS', type: 'resource', text: 'Would a customer testimonial template help capture proof?', why: 'Endorsements collection', actionHint: 'share_template' },
    { industry: 'SaaS', type: 'confirm', text: 'Ready to publish the case study to your Brandentify portfolio?', why: 'Confirm publishing', actionHint: 'create_portfolio_item' },

    // --- MARKETING (12 templates) ---
    { industry: 'Marketing', type: 'probe', text: 'Which channel drives most of your leads — LinkedIn, Instagram, or Ads?', why: 'Channel focus', actionHint: null },
    { industry: 'Marketing', type: 'action', text: 'Shall I draft a 5-step campaign brief you can use this month?', why: 'Operational deliverable', actionHint: 'generate_post' },
    { industry: 'Marketing', type: 'resource', text: 'Want a social calendar template for the next 30 days?', why: 'Planning asset', actionHint: 'share_template' },
    { industry: 'Marketing', type: 'clarify', text: 'Are you focused on brand awareness or direct response?', why: 'Campaign objective', actionHint: null },
    { industry: 'Marketing', type: 'action', text: 'Should I generate copy + CTAs for a paid ad set (3 variants)?', why: 'Ad creative generation', actionHint: 'generate_post' },
    { industry: 'Marketing', type: 'probe', text: 'What conversion metric matters — leads, signups, or purchases?', why: 'KPI clarity', actionHint: null },
    { industry: 'Marketing', type: 'resource', text: 'Would a swipe file of high-performing captions help?', why: 'Content inspiration', actionHint: 'share_template' },
    { industry: 'Marketing', type: 'action', text: 'Should I create an analytics dashboard template for weekly reviews?', why: 'Measurement tool', actionHint: 'generate_report_template' },
    { industry: 'Marketing', type: 'clarify', text: 'Do you already have tracking (UTM + pixels) in place?', why: 'Readiness check', actionHint: null },
    { industry: 'Marketing', type: 'probe', text: 'Who’s your ideal customer persona in two sentences?', why: 'Narrows messaging', actionHint: null },
    { industry: 'Marketing', type: 'resource', text: 'Want a checklist for converting followers into customers?', why: 'Conversion checklist', actionHint: 'share_template' },
    { industry: 'Marketing', type: 'confirm', text: 'Shall I run a quick audit of your social channels and send key fixes?', why: 'Propose audit', actionHint: 'generate_audit_report' },

    // --- PHOTOGRAPHY (12 templates) ---
    { industry: 'Photography', type: 'action', text: 'Shall I draft a portfolio case post for your best wedding shoot?', why: 'Portfolio content', actionHint: 'generate_post' },
    { industry: 'Photography', type: 'probe', text: 'Do you want to attract local clients or destination weddings?', why: 'Market focus', actionHint: null },
    { industry: 'Photography', type: 'resource', text: 'Would you like a caption + hashtag pack for wedding photography?', why: 'Discovery help', actionHint: 'share_hashtag_pack' },
    { industry: 'Photography', type: 'clarify', text: 'Are you comfortable sharing client photos publicly?', why: 'Legal/consent check', actionHint: null },
    { industry: 'Photography', type: 'action', text: 'Want a 1-page downloadable portfolio PDF for client pitches?', why: 'Sales asset', actionHint: 'generate_pdf_portfolio' },
    { industry: 'Photography', type: 'probe', text: 'Which service makes up most of your revenue — events, commercial, or portraits?', why: 'Revenue focus', actionHint: null },
    { industry: 'Photography', type: 'resource', text: 'I can auto-generate a pricing page template — need one?', why: 'Commercial asset', actionHint: 'share_template' },
    { industry: 'Photography', type: 'action', text: 'Shall I create an Instagram story series showcasing your top 3 shoots?', why: 'Engagement content', actionHint: 'generate_post' },
    { industry: 'Photography', type: 'alternative', text: 'Prefer highlight reels or still-image carousels for Instagram?', why: 'Format decision', actionHint: null },
    { industry: 'Photography', type: 'probe', text: 'Which camera/lens do you use for the signature style?', why: 'Craft detail', actionHint: null },
    { industry: 'Photography', type: 'resource', text: 'Would you like an email script to request client testimonials?', why: 'Reputation building', actionHint: 'share_template' },
    { industry: 'Photography', type: 'confirm', text: 'Ready to publish this project to your portfolio and share externally?', why: 'Push-live confirm', actionHint: 'create_portfolio_item' },

    // --- TECHNOLOGY (From JSON) ---
    { industry: 'Technology', type: 'action', text: 'Shall I draft a LinkedIn post summarizing your latest tech innovation?', why: 'Showcases innovation and builds authority', actionHint: 'generate_post' },
    { industry: 'Technology', type: 'probe', text: 'Are you focused on B2B software or consumer tech solutions?', why: 'Clarifies audience', actionHint: null },
    { industry: 'Technology', type: 'resource', text: 'Would you like a presentation template for your upcoming pitch?', why: 'Helps prepare professional decks', actionHint: 'share_template' },
    { industry: 'Technology', type: 'clarify', text: 'Do you want to highlight product features or use cases first?', why: 'Content strategy decision', actionHint: null },
    { industry: 'Technology', type: 'action', text: 'Should I generate a short demo video script for your product?', why: 'Supports visual content creation', actionHint: 'generate_script' },
    { industry: 'Technology', type: 'probe', text: 'Which technology stack defines your expertise best?', why: 'Helps shape your brand identity', actionHint: null },
    { industry: 'Technology', type: 'resource', text: 'Want a checklist to optimize your tech portfolio?', why: 'Improves presentation quality', actionHint: 'share_template' },
    { industry: 'Technology', type: 'action', text: 'Would you like to share your tech blog post to Medium automatically?', why: 'Increases reach', actionHint: 'schedule_post' },
    { industry: 'Technology', type: 'probe', text: 'What kind of users benefit most from your product?', why: 'Enhances target precision', actionHint: null },
    { industry: 'Technology', type: 'confirm', text: 'Shall I go ahead and create your innovation showcase post?', why: 'Confirms next action', actionHint: 'generate_post' },

    // --- FINANCE (From JSON) ---
    { industry: 'Finance', type: 'action', text: 'Shall I draft a carousel explaining your financial strategy?', why: 'Highlights expertise', actionHint: 'generate_post' },
    { industry: 'Finance', type: 'probe', text: 'Do you focus on personal finance, investment, or fintech?', why: 'Clarifies niche', actionHint: null },
    { industry: 'Finance', type: 'resource', text: 'Would you like financial planning templates for clients?', why: 'Adds value to your brand', actionHint: 'share_template' },
    { industry: 'Finance', type: 'clarify', text: 'Should your content be educational or advisory?', why: 'Defines tone and goal', actionHint: null },
    { industry: 'Finance', type: 'action', text: 'Want a one-minute explainer video outline for your service?', why: 'Engaging content creation', actionHint: 'generate_script' },
    { industry: 'Finance', type: 'probe', text: 'What key pain point do your clients face?', why: 'Improves storytelling', actionHint: null },
    { industry: 'Finance', type: 'resource', text: 'Would a client case study template help showcase success?', why: 'Builds credibility', actionHint: 'share_template' },
    { industry: 'Finance', type: 'action', text: 'Shall I prepare your year-end financial insights post?', why: 'Seasonal engagement', actionHint: 'generate_post' },
    { industry: 'Finance', type: 'alternative', text: 'Would you prefer to post about investment tips or case results?', why: 'Content theme selection', actionHint: null },
    { industry: 'Finance', type: 'confirm', text: 'Ready to share your portfolio results summary?', why: 'Final confirmation', actionHint: 'generate_post' },

    // --- HEALTHCARE (From JSON) ---
    { industry: 'Healthcare', type: 'action', text: 'Would you like to post a health awareness infographic?', why: 'Educates and builds trust', actionHint: 'generate_post' },
    { industry: 'Healthcare', type: 'probe', text: 'Which healthcare topic aligns most with your practice?', why: 'Personalizes outreach', actionHint: null },
    { industry: 'Healthcare', type: 'resource', text: 'Want ready-to-edit wellness post templates?', why: 'Simplifies creation', actionHint: 'share_template' },
    { industry: 'Healthcare', type: 'clarify', text: 'Is your audience patients or other professionals?', why: 'Sets tone and content type', actionHint: null },
    { industry: 'Healthcare', type: 'action', text: 'Shall I create a LinkedIn article about your recent case study?', why: 'Builds authority', actionHint: 'generate_post' },
    { industry: 'Healthcare', type: 'probe', text: 'What health challenge are you most passionate about solving?', why: 'Personal connection', actionHint: null },
    { industry: 'Healthcare', type: 'resource', text: 'Would you like a caption pack for awareness campaigns?', why: 'Boosts engagement', actionHint: 'share_template' },
    { industry: 'Healthcare', type: 'action', text: 'Want to showcase a patient success story?', why: 'Inspires trust', actionHint: 'create_portfolio_item' },
    { industry: 'Healthcare', type: 'alternative', text: 'Prefer written blogs or video content for your awareness posts?', why: 'Defines content strategy', actionHint: null },
    { industry: 'Healthcare', type: 'confirm', text: 'Shall I post your awareness campaign now?', why: 'Final go-ahead', actionHint: 'generate_post' },

    // --- EDUCATION (From JSON) ---
    { industry: 'Education', type: 'action', text: 'Shall I help you post about your teaching philosophy?', why: 'Positions you as a thought leader', actionHint: 'generate_post' },
    { industry: 'Education', type: 'probe', text: 'Do you teach online, offline, or hybrid?', why: 'Helps tailor platform strategy', actionHint: null },
    { industry: 'Education', type: 'resource', text: 'Would you like a content template for course promotions?', why: 'Saves time', actionHint: 'share_template' },
    { industry: 'Education', type: 'clarify', text: 'Is your audience students or fellow educators?', why: 'Clarifies communication style', actionHint: null },
    { industry: 'Education', type: 'action', text: 'Should I create a visual post summarizing your student achievements?', why: 'Boosts credibility', actionHint: 'generate_post' },
    { industry: 'Education', type: 'probe', text: 'What’s the core outcome students achieve from your course?', why: 'Improves marketing messaging', actionHint: null },
    { industry: 'Education', type: 'resource', text: 'Want a checklist for better online course branding?', why: 'Supports marketing', actionHint: 'share_template' },
    { industry: 'Education', type: 'action', text: 'Would you like to promote your webinar next week?', why: 'Timely promotion', actionHint: 'schedule_post' },
    { industry: 'Education', type: 'alternative', text: 'Would you prefer a carousel or a story-based format?', why: 'Format decision', actionHint: null },
    { industry: 'Education', type: 'confirm', text: 'Proceed to post your educational insights now?', why: 'Confirm posting', actionHint: 'generate_post' },

    // --- REAL ESTATE (From JSON) ---
    { industry: 'Real Estate', type: 'action', text: 'Shall I draft your property highlight carousel?', why: 'Drives leads', actionHint: 'generate_post' },
    { industry: 'Real Estate', type: 'probe', text: 'Are you targeting buyers, investors, or tenants?', why: 'Clarifies target segment', actionHint: null },
    { industry: 'Real Estate', type: 'resource', text: 'Want real estate caption templates to increase engagement?', why: 'Quick content boost', actionHint: 'share_template' },
    { industry: 'Real Estate', type: 'clarify', text: 'Do you prefer to feature new or resale properties first?', why: 'Prioritization', actionHint: null },
    { industry: 'Real Estate', type: 'action', text: 'Shall I generate a 15-second reel script showcasing your top listing?', why: 'Increases visual appeal', actionHint: 'generate_script' },
    { industry: 'Real Estate', type: 'probe', text: 'Which city are your listings located in?', why: 'Enhances local SEO', actionHint: null },
    { industry: 'Real Estate', type: 'resource', text: 'Would a pricing sheet template help with leads?', why: 'Improves conversions', actionHint: 'share_template' },
    { industry: 'Real Estate', type: 'action', text: 'Should I schedule posts for weekend property showcases?', why: 'Engagement timing', actionHint: 'schedule_post' },
    { industry: 'Real Estate', type: 'alternative', text: 'Want to focus on virtual tours or testimonials next?', why: 'Content planning', actionHint: null },
    { industry: 'Real Estate', type: 'confirm', text: 'Ready to publish your featured property post?', why: 'Confirmation', actionHint: 'generate_post' }
];

async function seedConsolidatedTemplates() {
    try {
        console.log('--- Starting Consolidated Follow-up Templates Seed ---');
        console.log(`Total templates to process: ${TEMPLATES.length}`);

        // Clear existing templates
        await pool.query('TRUNCATE TABLE followup_templates RESTART IDENTITY CASCADE');
        console.log('✅ Cleared existing templates and reset IDs');

        // Insert new templates
        let successCount = 0;
        for (const template of TEMPLATES) {
            await pool.query(
                `INSERT INTO followup_templates (industry, type, text, why, action_hint)
         VALUES ($1, $2, $3, $4, $5)`,
                [template.industry, template.type, template.text, template.why, template.actionHint]
            );
            successCount++;
        }

        console.log(`✅ Successfully seeded ${successCount} consolidated templates across ${new Set(TEMPLATES.map(t => t.industry)).size} industries`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding consolidated templates:', error);
        process.exit(1);
    }
}

seedConsolidatedTemplates();

