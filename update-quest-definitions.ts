import { pool } from './server/db';

async function executeQuery(query: string, params: any[] = []) {
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

async function updateQuestDefinitions() {
  try {
    console.log('Starting: Updating quest definitions to be more specific and actionable');

    // Check if quest_definitions table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'quest_definitions'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('quest_definitions table does not exist, please run db-migration-career-quests.ts first');
      return {
        success: false,
        message: 'quest_definitions table does not exist'
      };
    }

    // First, check if the photo upload quest exists and update its status to inactive
    await executeQuery(`
      UPDATE quest_definitions 
      SET is_active = false 
      WHERE title = 'Professional Headshot' AND target_action = 'upload_photo'
    `);
    console.log('Updated Professional Headshot quest to inactive status');

    // Now update the Skill Showcase quest to be more specific and actionable
    const updatedSkillQuest = {
      title: "Industry Skill Mastery",
      description: "Add at least 3 skills specific to your selected industry with appropriate proficiency levels",
      type: "profile_update",
      target_count: 3,
      target_action: "add_skill",
      xp_reward: 75,
      badge_reward: null,
      required_profile_completion: 20,
      musk_tip: "Add skills that are specific to your industry and accurately rate your proficiency. For Healthcare/Biotechnology, consider skills like 'Clinical Research', 'Medical Device Development', or 'Regulatory Compliance'."
    };

    // Check if the quest already exists
    const skillQuestCheck = await executeQuery(`
      SELECT id FROM quest_definitions 
      WHERE title = $1 AND target_action = $2
    `, [updatedSkillQuest.title, updatedSkillQuest.target_action]);

    if (skillQuestCheck.rows.length > 0) {
      // Update existing quest
      await executeQuery(`
        UPDATE quest_definitions 
        SET description = $1, 
            target_count = $2, 
            xp_reward = $3, 
            musk_tip = $4,
            is_active = true
        WHERE id = $5
      `, [
        updatedSkillQuest.description, 
        updatedSkillQuest.target_count, 
        updatedSkillQuest.xp_reward, 
        updatedSkillQuest.musk_tip,
        skillQuestCheck.rows[0].id
      ]);
      console.log(`Updated existing skill quest: ${updatedSkillQuest.title}`);
    } else {
      // Create new quest
      await executeQuery(`
        INSERT INTO quest_definitions (
          title, description, type, target_count, target_action, 
          xp_reward, badge_reward, required_profile_completion, musk_tip
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        updatedSkillQuest.title,
        updatedSkillQuest.description,
        updatedSkillQuest.type,
        updatedSkillQuest.target_count,
        updatedSkillQuest.target_action,
        updatedSkillQuest.xp_reward,
        updatedSkillQuest.badge_reward,
        updatedSkillQuest.required_profile_completion,
        updatedSkillQuest.musk_tip
      ]);
      console.log(`Added new skill quest: ${updatedSkillQuest.title}`);
    }

    // Also update the generic Skill Showcase quest to be more specific
    await executeQuery(`
      UPDATE quest_definitions 
      SET description = 'Categorize your skills by technical and soft skills, with at least 3 of each',
          musk_tip = 'Balanced professionals showcase both technical and soft skills. Technical skills show what you can do, soft skills show how you work with others.'
      WHERE title = 'Skill Showcase' AND target_action = 'add_skill'
    `);
    console.log('Updated Skill Showcase quest to be more specific');

    // Add a new specific skill quest for Resume section
    const resumeSkillQuest = {
      title: "Resume Skills Alignment",
      description: "Ensure your resume skills section includes at least 5 skills from your profile",
      type: "resume",
      target_count: 5,
      target_action: "update_resume_skills",
      xp_reward: 60,
      badge_reward: null,
      required_profile_completion: 40,
      musk_tip: "Your resume skills should align with your profile but be tailored to specific job targets. Include keywords from job descriptions in your industry."
    };

    // Check if the quest already exists
    const resumeQuestCheck = await executeQuery(`
      SELECT id FROM quest_definitions 
      WHERE title = $1 AND target_action = $2
    `, [resumeSkillQuest.title, resumeSkillQuest.target_action]);

    if (resumeQuestCheck.rows.length > 0) {
      // Update existing quest
      await executeQuery(`
        UPDATE quest_definitions 
        SET description = $1, 
            target_count = $2, 
            xp_reward = $3, 
            musk_tip = $4,
            is_active = true
        WHERE id = $5
      `, [
        resumeSkillQuest.description, 
        resumeSkillQuest.target_count, 
        resumeSkillQuest.xp_reward, 
        resumeSkillQuest.musk_tip,
        resumeQuestCheck.rows[0].id
      ]);
      console.log(`Updated existing resume quest: ${resumeSkillQuest.title}`);
    } else {
      // Create new quest
      await executeQuery(`
        INSERT INTO quest_definitions (
          title, description, type, target_count, target_action, 
          xp_reward, badge_reward, required_profile_completion, musk_tip
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        resumeSkillQuest.title,
        resumeSkillQuest.description,
        resumeSkillQuest.type,
        resumeSkillQuest.target_count,
        resumeSkillQuest.target_action,
        resumeSkillQuest.xp_reward,
        resumeSkillQuest.badge_reward,
        resumeSkillQuest.required_profile_completion,
        resumeSkillQuest.musk_tip
      ]);
      console.log(`Added new resume quest: ${resumeSkillQuest.title}`);
    }

    // Update or add a new specific quest for Project portfolio section
    const projectSkillQuest = {
      title: "Project Skills Showcase",
      description: "Add technologies/skills used in at least one of your portfolio projects",
      type: "portfolio",
      target_count: 1,
      target_action: "add_project_technologies",
      xp_reward: 65,
      badge_reward: null,
      required_profile_completion: 50,
      musk_tip: "Listing specific technologies used in projects validates your skill claims and helps recruiters find you through skill-based searches."
    };

    // Check if the quest already exists
    const projectQuestCheck = await executeQuery(`
      SELECT id FROM quest_definitions 
      WHERE title = $1 AND target_action = $2
    `, [projectSkillQuest.title, projectSkillQuest.target_action]);

    if (projectQuestCheck.rows.length > 0) {
      // Update existing quest
      await executeQuery(`
        UPDATE quest_definitions 
        SET description = $1, 
            target_count = $2, 
            xp_reward = $3, 
            musk_tip = $4,
            is_active = true
        WHERE id = $5
      `, [
        projectSkillQuest.description, 
        projectSkillQuest.target_count, 
        projectSkillQuest.xp_reward, 
        projectSkillQuest.musk_tip,
        projectQuestCheck.rows[0].id
      ]);
      console.log(`Updated existing project quest: ${projectSkillQuest.title}`);
    } else {
      // Create new quest
      await executeQuery(`
        INSERT INTO quest_definitions (
          title, description, type, target_count, target_action, 
          xp_reward, badge_reward, required_profile_completion, musk_tip
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        projectSkillQuest.title,
        projectSkillQuest.description,
        projectSkillQuest.type,
        projectSkillQuest.target_count,
        projectSkillQuest.target_action,
        projectSkillQuest.xp_reward,
        projectSkillQuest.badge_reward,
        projectSkillQuest.required_profile_completion,
        projectSkillQuest.musk_tip
      ]);
      console.log(`Added new project quest: ${projectSkillQuest.title}`);
    }

    console.log('Successfully updated quest definitions');
    return {
      success: true,
      message: 'Successfully updated quest definitions to be more specific and actionable'
    };
  } catch (error) {
    console.error('Error while updating quest definitions:', error);
    return {
      success: false,
      message: 'Error while updating quest definitions',
      error: String(error)
    };
  }
}

// Run the update script
updateQuestDefinitions()
  .then(result => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });