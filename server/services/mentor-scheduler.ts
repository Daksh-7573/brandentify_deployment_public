/**
 * Mentor Scheduler - Handles mentorship expiry reminders and auto-deactivation
 * 
 * Schedule:
 * - Runs every hour to check for:
 *   1. Mentorships expiring in 5 days (send reminder notification)
 *   2. Expired mentorships (deactivate and trigger review prompt)
 */
import cron from 'node-cron';
import { pool } from '../db';
import * as mentorService from './mentor-service';
import { createNotification } from './notification-service';

const SCHEDULER_INTERVAL = '0 * * * *'; // Every hour

/**
 * Process expiry reminders (5 days before expiry)
 */
async function processExpiryReminders(): Promise<number> {
  try {
    const mentorshipsExpiringSoon = await mentorService.getMentorshipsExpiringSoon();
    let remindersCreated = 0;

    for (const mentorship of mentorshipsExpiringSoon) {
      try {
        // Calculate days remaining
        const expiresAt = new Date(mentorship.expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Create notification for the follower (mentee)
        await createNotification({
          userId: mentorship.follower_id,
          type: 'warning',
          title: 'Mentorship Ending Soon',
          message: `Your mentorship with ${mentorship.mentor_name || mentorship.mentor_username} expires in ${daysRemaining} days.`,
          category: 'mentorship_expiring',
          isRead: false,
          metadata: {
            mentorId: mentorship.followee_id,
            followId: mentorship.id,
            expiresAt: mentorship.expires_at,
            daysRemaining
          }
        });

        // Mark reminder as sent
        await mentorService.markReminderSent(mentorship.id);
        remindersCreated++;

        console.log(`[Mentor Scheduler] Sent expiry reminder to user ${mentorship.follower_id} for mentorship ${mentorship.id}`);
      } catch (error) {
        console.error(`[Mentor Scheduler] Error sending reminder for mentorship ${mentorship.id}:`, error);
      }
    }

    return remindersCreated;
  } catch (error) {
    console.error('[Mentor Scheduler] Error processing expiry reminders:', error);
    return 0;
  }
}

/**
 * Process expired mentorships (deactivate and prompt review)
 */
async function processExpiredMentorships(): Promise<number> {
  try {
    // Get expired mentorships that need review notifications
    const expiredMentorships = await mentorService.getExpiredMentorshipsNeedingReview();
    let reviewPromptsCreated = 0;

    for (const mentorship of expiredMentorships) {
      try {
        // Create review prompt notification for the follower
        await createNotification({
          userId: mentorship.follower_id,
          type: 'info',
          title: 'Rate Your Mentorship Experience',
          message: `Your mentorship with ${mentorship.mentor_name || mentorship.mentor_username} has ended. Share your experience!`,
          category: 'mentorship_review',
          isRead: false,
          metadata: {
            mentorId: mentorship.followee_id,
            followId: mentorship.id,
            mentorName: mentorship.mentor_name || mentorship.mentor_username,
            requiresReview: true
          }
        });

        reviewPromptsCreated++;
        console.log(`[Mentor Scheduler] Sent review prompt to user ${mentorship.follower_id} for mentorship ${mentorship.id}`);
      } catch (error) {
        console.error(`[Mentor Scheduler] Error creating review prompt for mentorship ${mentorship.id}:`, error);
      }
    }

    // Deactivate all expired mentorships
    const deactivatedCount = await mentorService.deactivateExpiredMentorships();
    
    if (deactivatedCount > 0) {
      console.log(`[Mentor Scheduler] Deactivated ${deactivatedCount} expired mentorships`);
    }

    return reviewPromptsCreated;
  } catch (error) {
    console.error('[Mentor Scheduler] Error processing expired mentorships:', error);
    return 0;
  }
}

/**
 * Main scheduler job
 */
async function runScheduler(): Promise<void> {
  const startTime = Date.now();
  console.log('[Mentor Scheduler] Running mentor scheduler job...');

  try {
    // Process expiry reminders (5 days before)
    const remindersCreated = await processExpiryReminders();

    // Process expired mentorships (deactivate + review prompts)
    const reviewPromptsCreated = await processExpiredMentorships();

    const duration = Date.now() - startTime;
    console.log(`[Mentor Scheduler] Job completed in ${duration}ms. Reminders: ${remindersCreated}, Review prompts: ${reviewPromptsCreated}`);
  } catch (error) {
    console.error('[Mentor Scheduler] Error running scheduler:', error);
  }
}

/**
 * Initialize the mentor scheduler
 */
export function initMentorScheduler(): void {
  console.log('[Mentor Scheduler] Initializing mentor scheduler...');
  
  // Schedule the job to run every hour
  cron.schedule(SCHEDULER_INTERVAL, () => {
    runScheduler();
  });

  // Run immediately on startup to catch any missed expirations
  setTimeout(() => {
    console.log('[Mentor Scheduler] Running initial check...');
    runScheduler();
  }, 5000);

  console.log(`[Mentor Scheduler] Scheduler initialized. Running at: ${SCHEDULER_INTERVAL}`);
}

/**
 * Manual trigger for testing
 */
export async function runMentorSchedulerManually(): Promise<{ reminders: number; reviews: number }> {
  console.log('[Mentor Scheduler] Manual run triggered');
  const reminders = await processExpiryReminders();
  const reviews = await processExpiredMentorships();
  return { reminders, reviews };
}
