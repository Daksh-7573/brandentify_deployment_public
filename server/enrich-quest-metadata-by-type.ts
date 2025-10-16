import { db } from './db';
import { questDefinitions } from '@shared/schema';
import { eq, like, or, and } from 'drizzle-orm';

async function enrichQuestMetadataByType() {
  try {
    console.log('Starting: Enriching quest definitions by type and action');

    // Update LinkedIn social quests
    const linkedInResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_linkedin_post'),
          like(questDefinitions.title, '%LinkedIn%')
        )
      );
    console.log('✅ Updated LinkedIn quests');

    // Update Instagram carousel quests
    const instagramCarouselResult = await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Instagram Carousel (5-10 slides, vertical or square)',
        quantityValue: 7,
        quantityType: 'slides',
        platformConstraints: '1080x1920px (9:16) or 1080x1080px (1:1) format',
        guidanceSnippet: 'Use Canva to create carousel, export as individual images, upload in sequence',
        bestTimeToPost: '06:00 - 08:00 AM or 05:00 - 07:00 PM (Your Local Time)',
        bestTimeUtc: '17:00-19:00 UTC',
        timeConfidence: 80
      })
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_instagram_carousel'),
          and(
            like(questDefinitions.title, '%Carousel%'),
            like(questDefinitions.title, '%Instagram%')
          )
        )
      );
    console.log('✅ Updated Instagram Carousel quests');

    // Update Instagram story/post quests
    const instagramPostResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_instagram_post'),
          eq(questDefinitions.targetAction, 'create_instagram_story'),
          and(
            like(questDefinitions.title, '%Instagram%'),
            like(questDefinitions.title, '%Story%')
          )
        )
      );
    console.log('✅ Updated Instagram Post/Story quests');

    // Update Twitter/X thread quests
    const twitterThreadResult = await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Twitter Thread (3-5 tweets)',
        quantityValue: 280,
        quantityType: 'characters per tweet',
        platformConstraints: '280 chars/tweet, use thread for longer insights',
        guidanceSnippet: 'Break insights into tweet-sized chunks, use relevant hashtags (3-5 max)',
        bestTimeToPost: '12:00 - 01:00 PM or 05:00 - 06:00 PM (Your Local Time)',
        bestTimeUtc: '12:00-13:00 UTC',
        timeConfidence: 82
      })
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_twitter_thread'),
          like(questDefinitions.title, '%Twitter Thread%'),
          like(questDefinitions.title, '%X Thread%')
        )
      );
    console.log('✅ Updated Twitter Thread quests');

    // Update Twitter/X single tweet quests
    const twitterPostResult = await db.update(questDefinitions)
      .set({
        deliverableFormat: 'Twitter/X Single Tweet',
        quantityValue: 280,
        quantityType: 'characters',
        platformConstraints: '280 character limit, 1-4 images optional',
        guidanceSnippet: 'Keep it concise, use 2-3 hashtags, engage with replies quickly',
        bestTimeToPost: '12:00 - 01:00 PM or 05:00 - 06:00 PM (Your Local Time)',
        bestTimeUtc: '12:00-13:00 UTC',
        timeConfidence: 82
      })
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_twitter_post'),
          and(
            like(questDefinitions.title, '%Twitter%'),
            like(questDefinitions.title, '%post%')
          )
        )
      );
    console.log('✅ Updated Twitter/X Post quests');

    // Update YouTube video quests
    const youtubeResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_youtube_video'),
          like(questDefinitions.title, '%YouTube%')
        )
      );
    console.log('✅ Updated YouTube quests');

    // Update TikTok video quests
    const tiktokResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_tiktok_video'),
          like(questDefinitions.title, '%TikTok%')
        )
      );
    console.log('✅ Updated TikTok quests');

    // Update Facebook post quests
    const facebookResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.targetAction, 'create_facebook_post'),
          like(questDefinitions.title, '%Facebook%')
        )
      );
    console.log('✅ Updated Facebook quests');

    // Update pulse creation quests (Brandentifier internal)
    const pulseResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.type, 'pulse_creation'),
          eq(questDefinitions.targetAction, 'create_pulse')
        )
      );
    console.log('✅ Updated Pulse Creation quests');

    // Update profile completion quests
    const profileResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.type, 'profile_update'),
          like(questDefinitions.title, '%Profile%')
        )
      );
    console.log('✅ Updated Profile quests');

    // Update project/portfolio quests
    const portfolioResult = await db.update(questDefinitions)
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
      .where(
        or(
          eq(questDefinitions.type, 'portfolio'),
          like(questDefinitions.title, '%Portfolio%'),
          like(questDefinitions.title, '%Project%')
        )
      );
    console.log('✅ Updated Portfolio/Project quests');

    // Update networking quests
    const networkingResult = await db.update(questDefinitions)
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
      .where(eq(questDefinitions.type, 'networking'));
    console.log('✅ Updated Networking quests');

    // Update hashtag-related quests
    const hashtagResult = await db.update(questDefinitions)
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
      .where(like(questDefinitions.title, '%Hashtag%'));
    console.log('✅ Updated Hashtag quests');

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
enrichQuestMetadataByType()
  .then(result => {
    console.log('\nResult:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
