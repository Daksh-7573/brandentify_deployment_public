import { db } from './db';
import { questDefinitions } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

async function enrichQuestMetadata() {
  try {
    console.log('Starting: Enriching quest definitions with detailed metadata');

    // LinkedIn Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'LinkedIn Text Post (with 1-2 images optional)',
        quantityValue: 300,
        quantityType: 'words',
        platformConstraints: 'Use LinkedIn post composer, 3000 character limit',
        guidanceSnippet: 'Write directly in LinkedIn post composer, add relevant image if available',
        bestTimeToPost: '08:00 - 10:00 AM (Your Local Time)',
        bestTimeUtc: '08:00-10:00 UTC',
        timeConfidence: 85
      })
      .where(eq(questDefinitions.title, 'LinkedIn Thought Leadership'));
    console.log('✅ Updated LinkedIn Thought Leadership quest');

    // Instagram Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Instagram Post or Story (vertical format)',
        quantityValue: 1,
        quantityType: 'post with image',
        platformConstraints: '1080x1920px vertical format, or 1:1 square post',
        guidanceSnippet: 'Use Canva for graphics, capture authentic workspace moments, add 5-10 hashtags',
        bestTimeToPost: '06:00 - 08:00 AM or 05:00 - 07:00 PM (Your Local Time)',
        bestTimeUtc: '17:00-19:00 UTC',
        timeConfidence: 80
      })
      .where(eq(questDefinitions.title, 'Instagram Professional Story'));
    console.log('✅ Updated Instagram Professional Story quest');

    // Twitter Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Twitter Thread (3-5 tweets) or Single Tweet',
        quantityValue: 280,
        quantityType: 'characters per tweet',
        platformConstraints: '280 chars/tweet, use thread for longer insights',
        guidanceSnippet: 'Break insights into tweet-sized chunks, use relevant hashtags (3-5 max)',
        bestTimeToPost: '12:00 - 01:00 PM or 05:00 - 06:00 PM (Your Local Time)',
        bestTimeUtc: '12:00-13:00 UTC',
        timeConfidence: 82
      })
      .where(eq(questDefinitions.title, 'Twitter Industry Insights'));
    console.log('✅ Updated Twitter Industry Insights quest');

    // YouTube Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'YouTube Short (60-90 seconds) or Standard Video (3-5 minutes)',
        quantityValue: 90,
        quantityType: 'seconds for Short',
        platformConstraints: 'Vertical 9:16 for Shorts, 16:9 for regular videos',
        guidanceSnippet: 'Record on phone or use screen recording, add captions, create eye-catching thumbnail',
        bestTimeToPost: '02:00 - 04:00 PM or 06:00 - 08:00 PM (Your Local Time)',
        bestTimeUtc: '14:00-16:00 UTC',
        timeConfidence: 75
      })
      .where(eq(questDefinitions.title, 'YouTube Knowledge Share'));
    console.log('✅ Updated YouTube Knowledge Share quest');

    // Facebook Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Facebook Text Post with Photo/Video',
        quantityValue: 250,
        quantityType: 'words',
        platformConstraints: 'Best with visual content, 63,206 character limit',
        guidanceSnippet: 'Share personal career stories, use 1-2 images, engage with comments',
        bestTimeToPost: '01:00 - 03:00 PM (Your Local Time)',
        bestTimeUtc: '13:00-15:00 UTC',
        timeConfidence: 78
      })
      .where(eq(questDefinitions.title, 'Facebook Professional Network'));
    console.log('✅ Updated Facebook Professional Network quest');

    // TikTok Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'TikTok Video (15-60 seconds, vertical)',
        quantityValue: 30,
        quantityType: 'seconds',
        platformConstraints: 'Vertical 9:16 format, max 60 seconds',
        guidanceSnippet: 'Use trending sounds, add text overlays, hook viewers in first 3 seconds',
        bestTimeToPost: '06:00 - 09:00 AM or 07:00 - 11:00 PM (Your Local Time)',
        bestTimeUtc: '19:00-23:00 UTC',
        timeConfidence: 83
      })
      .where(eq(questDefinitions.title, 'TikTok Career Tips'));
    console.log('✅ Updated TikTok Career Tips quest');

    // Multi-Platform Quest Enrichment
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Cross-platform content (2+ platforms)',
        quantityValue: 2,
        quantityType: 'platforms',
        platformConstraints: 'Adapt core message for each platform\'s audience',
        guidanceSnippet: 'Create base content, then customize for LinkedIn (professional), Instagram (visual), Twitter (concise)',
        bestTimeToPost: '09:00 - 11:00 AM (Your Local Time)',
        bestTimeUtc: '09:00-11:00 UTC',
        timeConfidence: 80
      })
      .where(eq(questDefinitions.title, 'Multi-Platform Content Creator'));
    console.log('✅ Updated Multi-Platform Content Creator quest');

    // Hashtag Optimization Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Social media post with strategic hashtags',
        quantityValue: 5,
        quantityType: 'hashtags',
        platformConstraints: '3-5 specific hashtags (avoid generic ones)',
        guidanceSnippet: 'Mix popular industry tags with niche domain hashtags, research trending tags',
        bestTimeToPost: '10:00 AM - 12:00 PM (Your Local Time)',
        bestTimeUtc: '10:00-12:00 UTC',
        timeConfidence: 75
      })
      .where(eq(questDefinitions.title, 'Industry Hashtag Master'));
    console.log('✅ Updated Industry Hashtag Master quest');

    // Visual Content Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Infographic, Chart, or Professional Photo Post',
        quantityValue: 1,
        quantityType: 'visual asset',
        platformConstraints: 'High-resolution (1080px+), branded colors preferred',
        guidanceSnippet: 'Use Canva or Figma for infographics, export as PNG/JPG, cite data sources',
        bestTimeToPost: '11:00 AM - 01:00 PM (Your Local Time)',
        bestTimeUtc: '11:00-13:00 UTC',
        timeConfidence: 77
      })
      .where(eq(questDefinitions.title, 'Visual Content Creator'));
    console.log('✅ Updated Visual Content Creator quest');

    // Engagement Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Discussion-starter post with open-ended question',
        quantityValue: 200,
        quantityType: 'words',
        platformConstraints: 'End with question or poll to encourage comments',
        guidanceSnippet: 'Share controversial (but professional) take, ask for opinions, respond to comments within 1 hour',
        bestTimeToPost: '08:00 - 10:00 AM or 04:00 - 06:00 PM (Your Local Time)',
        bestTimeUtc: '08:00-10:00 UTC',
        timeConfidence: 81
      })
      .where(eq(questDefinitions.title, 'Engagement Catalyst'));
    console.log('✅ Updated Engagement Catalyst quest');

    // Pulse Creation Quest (Brandentifier platform)
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Brandentifier Pulse (professional insight post)',
        quantityValue: 250,
        quantityType: 'words',
        platformConstraints: 'Use Brandentifier pulse composer, add relevant tags',
        guidanceSnippet: 'Share industry insights, career tips, or professional experiences on your Brandentifier feed',
        bestTimeToPost: '09:00 - 11:00 AM (Your Local Time)',
        bestTimeUtc: '09:00-11:00 UTC',
        timeConfidence: 85
      })
      .where(eq(questDefinitions.title, 'Content Creator'));
    console.log('✅ Updated Content Creator (Pulse) quest');

    // Profile Update Quests
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Complete profile with all required fields',
        quantityValue: 100,
        quantityType: 'percent completion',
        platformConstraints: 'Fill all sections: About, Skills, Experience, Projects',
        guidanceSnippet: 'Go to Profile → Edit → Complete all sections marked incomplete',
        bestTimeToPost: 'Anytime',
        bestTimeUtc: '00:00-23:59 UTC',
        timeConfidence: 100
      })
      .where(eq(questDefinitions.title, 'Profile Completion Master'));
    console.log('✅ Updated Profile Completion Master quest');

    // Professional Headshot Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Professional headshot photo',
        quantityValue: 1,
        quantityType: 'high-quality photo',
        platformConstraints: 'Clear face, professional attire, good lighting, 400x400px minimum',
        guidanceSnippet: 'Use good lighting, plain background, or use AI headshot tools',
        bestTimeToPost: 'Anytime',
        bestTimeUtc: '00:00-23:59 UTC',
        timeConfidence: 100
      })
      .where(eq(questDefinitions.title, 'Professional Headshot'));
    console.log('✅ Updated Professional Headshot quest');

    // Skills Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Add professional skills with proficiency levels',
        quantityValue: 5,
        quantityType: 'skills',
        platformConstraints: 'Industry-relevant skills with honest proficiency ratings',
        guidanceSnippet: 'Go to Profile → Skills → Add relevant technical and soft skills',
        bestTimeToPost: 'Anytime',
        bestTimeUtc: '00:00-23:59 UTC',
        timeConfidence: 100
      })
      .where(eq(questDefinitions.title, 'Skill Showcase'));
    console.log('✅ Updated Skill Showcase quest');

    // Portfolio Quest
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Portfolio project with description and visuals',
        quantityValue: 1,
        quantityType: 'project',
        platformConstraints: 'Include title, description (200+ words), images, and links',
        guidanceSnippet: 'Go to Projects → Add Project → Upload images and write detailed description',
        bestTimeToPost: 'Anytime',
        bestTimeUtc: '00:00-23:59 UTC',
        timeConfidence: 100
      })
      .where(eq(questDefinitions.title, 'Portfolio Builder'));
    console.log('✅ Updated Portfolio Builder quest');

    // Networking Quests
    await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Connect with professionals in your field',
        quantityValue: 3,
        quantityType: 'connections',
        platformConstraints: 'Personalize connection requests, focus on quality over quantity',
        guidanceSnippet: 'Search Industry Pulse → Connect with relevant professionals → Send personalized message',
        bestTimeToPost: 'Business hours (9 AM - 6 PM)',
        bestTimeUtc: '09:00-18:00 UTC',
        timeConfidence: 85
      })
      .where(eq(questDefinitions.title, 'Connection Builder'));
    console.log('✅ Updated Connection Builder quest');

    console.log('\n🎉 Successfully enriched all quest definitions with detailed metadata!');
    return {
      success: true,
      message: 'All quest definitions updated with deliverable specs, requirements, and posting times'
    };
  } catch (error) {
    console.error('Error enriching quest metadata:', error);
    return {
      success: false,
      message: 'Error enriching quest metadata',
      error: String(error)
    };
  }
}

// Run the enrichment script
enrichQuestMetadata()
  .then(result => {
    console.log('\nResult:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
