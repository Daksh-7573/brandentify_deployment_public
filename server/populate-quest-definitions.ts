import { db } from './db';
import { sql, count } from 'drizzle-orm';
import { questDefinitions } from '@shared/schema';

async function populateQuestDefinitions() {
  try {
    console.log('Starting: Populating quest definitions');

    // Check if quest_definitions table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'quest_definitions'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('quest_definitions table does not exist, please run db-migration-career-quests.ts first');
      return {
        success: false,
        message: 'quest_definitions table does not exist'
      };
    }

    // Check if we already have quest definitions
    const existingQuests = await db.select({ count: count() }).from(questDefinitions);
    const questCount = existingQuests[0].count;
    if (questCount > 0) {
      console.log(`${questCount} quest definitions already exist, skipping population`);
      return {
        success: true,
        message: `${questCount} quest definitions already exist`
      };
    }

    // Profile Enhancement Quests
    const profileQuests = [
      {
        title: "Profile Completion Master",
        description: "Complete all sections of your profile to boost your visibility",
        type: "profile_update",
        target_count: 1,
        target_action: "complete_profile",
        xp_reward: 100,
        badge_reward: "visibility_boosted",
        required_profile_completion: 0,
        musk_tip: "A complete profile gets 30x more views! Make sure to include a professional photo and detailed skills section."
      },
      {
        title: "Professional Headshot",
        description: "Add a high-quality professional photo to your profile",
        type: "profile_update",
        target_count: 1,
        target_action: "upload_photo",
        xp_reward: 50,
        badge_reward: null,
        required_profile_completion: 0,
        musk_tip: "Professional photos increase profile views by 14x compared to profiles without photos."
      },
      {
        title: "Skill Showcase",
        description: "Add at least 5 professional skills with proficiency levels",
        type: "profile_update",
        target_count: 5,
        target_action: "add_skill",
        xp_reward: 75,
        badge_reward: null,
        required_profile_completion: 20,
        musk_tip: "Focus on industry-relevant skills and be honest about your proficiency levels."
      }
    ];

    // Professional Development Quests
    const developmentQuests = [
      {
        title: "Learn New Skill",
        description: "Add a new skill you've learned recently",
        type: "learning",
        target_count: 1,
        target_action: "add_new_skill",
        xp_reward: 60,
        badge_reward: "musk_learner",
        required_profile_completion: 40,
        musk_tip: "Focus on in-demand skills in your industry that can set you apart from competitors."
      },
      {
        title: "Certification Chase",
        description: "Add a professional certification you're pursuing",
        type: "learning",
        target_count: 1,
        target_action: "add_certification",
        xp_reward: 85,
        badge_reward: null,
        required_profile_completion: 50,
        musk_tip: "Industry certifications can increase your earning potential by 15-20% on average."
      }
    ];

    // Networking Quests
    const networkingQuests = [
      {
        title: "Connection Builder",
        description: "Expand your network by connecting with professionals in your field",
        type: "networking",
        target_count: 3,
        target_action: "add_connection",
        xp_reward: 70,
        badge_reward: null,
        required_profile_completion: 60,
        musk_tip: "Quality connections are more valuable than quantity. Focus on meaningful engagement."
      },
      {
        title: "Mentor Finder",
        description: "Identify and connect with a potential mentor in your industry",
        type: "networking",
        target_count: 1,
        target_action: "find_mentor",
        xp_reward: 90,
        badge_reward: null,
        required_profile_completion: 70,
        musk_tip: "Professionals with mentors are 5x more likely to get promoted than those without mentors."
      }
    ];

    // Career Advancement Quests
    const careerQuests = [
      {
        title: "Resume Enhancement",
        description: "Update your resume with your latest achievements and skills",
        type: "resume",
        target_count: 1,
        target_action: "update_resume",
        xp_reward: 80,
        badge_reward: null,
        required_profile_completion: 80,
        musk_tip: "Quantify your achievements with specific metrics to make your resume stand out."
      },
      {
        title: "Portfolio Builder",
        description: "Add at least one project to your portfolio",
        type: "portfolio",
        target_count: 1,
        target_action: "add_project",
        xp_reward: 75,
        badge_reward: "portfolio_star",
        required_profile_completion: 50,
        musk_tip: "Include detailed descriptions and visual elements to showcase your best work."
      }
    ];

    // Personal Branding Quests
    const brandingQuests = [
      {
        title: "Digital Presence Boost",
        description: "Enhance your online professional presence",
        type: "visibility",
        target_count: 1,
        target_action: "improve_digital_presence",
        xp_reward: 65,
        badge_reward: null,
        required_profile_completion: 70,
        musk_tip: "Consistent branding across platforms helps recruiters find and remember you."
      },
      {
        title: "Content Creator",
        description: "Share professional insights or create industry-related content",
        type: "pulse_creation",
        target_count: 1,
        target_action: "create_content",
        xp_reward: 70,
        badge_reward: "thought_leader",
        required_profile_completion: 75,
        musk_tip: "Content creators receive 3x more job opportunities than passive professionals."
      }
    ];

    // Combine all quests
    const allQuests = [
      ...profileQuests,
      ...developmentQuests,
      ...networkingQuests,
      ...careerQuests,
      ...brandingQuests
    ];

    // Insert quests into the database
    for (const quest of allQuests) {
      await db.insert(questDefinitions).values({
        title: quest.title,
        description: quest.description,
        type: quest.type as any,
        targetCount: quest.target_count,
        targetAction: quest.target_action,
        xpReward: quest.xp_reward,
        badgeReward: quest.badge_reward as any,
        muskTip: quest.musk_tip
      });
      console.log(`Added quest definition: ${quest.title}`);
    }

    console.log(`Successfully added ${allQuests.length} quest definitions`);
    return {
      success: true,
      message: `Successfully added ${allQuests.length} quest definitions`
    };
  } catch (error) {
    console.error('Error while populating quest definitions:', error);
    return {
      success: false,
      message: 'Error while populating quest definitions',
      error: String(error)
    };
  }
}

// Run the population script
populateQuestDefinitions()
  .then(result => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });