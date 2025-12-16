import { pool } from "../db";
import { createId } from '@paralleldrive/cuid2';

/**
 * Referral System Service
 * Handles share-to-unlock mechanics for Quantum Cards and Portfolio Templates
 */

// Available Quantum Card designs (12 total)
const QUANTUM_CARDS = [
  'professional',
  'quantum',
  '3d-animated',
  'holographic',
  'neoglow',
  'creative',
  'artistic',
  'fashion-quantum',
  'graphic-quantum',
  'photography',
  'fitness-quantum',
  'ceo-quantum'
];

// Available Portfolio Layouts (23 total)
const PORTFOLIO_LAYOUTS = [
  '3d-portfolio',
  'animated',
  'artistic-portfolio',
  'ceo-executive',
  'corporate-executive',
  'creative-bold',
  'creative-quantum',
  'designer-portfolio',
  'dynamic-innovator',
  'fashion-is-art',
  'fashion-quantum',
  'fashion-runway',
  'fitness-portfolio',
  'freelancer-hub',
  'holographic-neo',
  'light-designer',
  'nature-creative',
  'pastel-dreamscape',
  'photographer-portfolio',
  'photography-cinematic',
  'scholar',
  'timeline-storyteller-2',
  'yoga-fitness-model'
];

// Initial free access
const INITIAL_QUANTUM_CARDS = ['professional', 'quantum'];
const INITIAL_PORTFOLIOS = ['corporate-executive', 'scholar'];

export class ReferralService {
  /**
   * Generate unique referral link for a user
   * @param userId - The user ID
   * @param baseUrl - The base URL (e.g., https://brandentifier.replit.app)
   */
  async generateReferralLink(userId: number, baseUrl?: string): Promise<{ code: string; link: string }> {
    const client = await pool.connect();
    
    try {
      // Determine the base URL for the link
      const appBaseUrl = baseUrl || process.env.REPLIT_DEV_DOMAIN || process.env.APP_BASE_URL || 'https://brandentifier.com';
      // Ensure no trailing slash
      const cleanBaseUrl = appBaseUrl.replace(/\/$/, '');
      
      // Check if user already has a referral link
      const existing = await client.query(
        `SELECT unique_code FROM referral_links 
         WHERE referrer_user_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      if (existing.rows.length > 0) {
        const code = existing.rows[0].unique_code;
        return {
          code,
          link: `${cleanBaseUrl}/join/${code}`
        };
      }
      
      // Generate new unique code
      const code = this.generateUniqueCode();
      
      // Store in database
      await client.query(
        `INSERT INTO referral_links (referrer_user_id, unique_code) 
         VALUES ($1, $2)`,
        [userId, code]
      );
      
      return {
        code,
        link: `${cleanBaseUrl}/join/${code}`
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Generate a unique referral code (e.g., SARAH-X7K2)
   */
  private generateUniqueCode(): string {
    const randomPart = createId().substring(0, 4).toUpperCase();
    return `REF-${randomPart}`;
  }
  
  /**
   * Process referral conversion when new user signs up
   */
  async processReferralSignup(referralCode: string, newUserId: number): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Find referral link
      const linkResult = await client.query(
        `SELECT id, referrer_user_id FROM referral_links 
         WHERE unique_code = $1`,
        [referralCode]
      );
      
      if (linkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      
      const link = linkResult.rows[0];
      const referrerId = link.referrer_user_id;
      
      // Prevent self-referrals
      if (referrerId === newUserId) {
        await client.query('ROLLBACK');
        return false;
      }
      
      // Check if this user already referred this new user
      const existingConversion = await client.query(
        `SELECT id FROM referral_conversions 
         WHERE referrer_user_id = $1 AND referee_user_id = $2`,
        [referrerId, newUserId]
      );
      
      if (existingConversion.rows.length > 0) {
        await client.query('ROLLBACK');
        return false; // Already credited
      }
      
      // Create conversion record
      const conversionResult = await client.query(
        `INSERT INTO referral_conversions 
         (referrer_user_id, referee_user_id, referral_link_id, reward_granted) 
         VALUES ($1, $2, $3, false) 
         RETURNING id`,
        [referrerId, newUserId, link.id]
      );
      
      const conversionId = conversionResult.rows[0].id;
      
      // Grant unlock rewards to referrer
      await this.grantUnlockRewards(referrerId, conversionId, client);
      
      // Mark reward as granted
      await client.query(
        `UPDATE referral_conversions SET reward_granted = true WHERE id = $1`,
        [conversionId]
      );
      
      await client.query('COMMIT');
      
      console.log(`[Referral] User ${referrerId} referred user ${newUserId} - rewards granted`);
      
      // Create notification for the referrer
      try {
        const { createNotification } = await import('./notification-service');
        const newUserData = await pool.query('SELECT name FROM users WHERE id = $1', [newUserId]);
        const newUserName = newUserData.rows[0]?.name || 'Someone';
        
        await createNotification({
          userId: referrerId,
          type: 'success' as const,
          category: 'referral_signup' as const,
          title: 'Referral Reward Unlocked!',
          message: `${newUserName} signed up using your link and you've earned 1 Quantum Card + 2 Premium Portfolios!`
        });
      } catch (notificationError) {
        console.error('[Referral] Error creating notification:', notificationError);
        // Don't fail the referral if notification fails
      }
      
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Referral] Error processing referral signup:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Grant unlock rewards: 1 random Quantum Card + 2 random Portfolios
   * With re-roll logic for duplicates
   */
  private async grantUnlockRewards(userId: number, conversionId: number, client: any): Promise<void> {
    // Get currently unlocked items
    const unlockedResult = await client.query(
      `SELECT unlock_type, unlock_id FROM user_unlocks WHERE user_id = $1`,
      [userId]
    );
    
    const unlocked = unlockedResult.rows;
    const unlockedCards = unlocked
      .filter((u: any) => u.unlock_type === 'quantum_card')
      .map((u: any) => u.unlock_id);
    const unlockedPortfolios = unlocked
      .filter((u: any) => u.unlock_type === 'portfolio')
      .map((u: any) => u.unlock_id);
    
    // Get locked items
    const lockedCards = QUANTUM_CARDS.filter(c => !unlockedCards.includes(c));
    const lockedPortfolios = PORTFOLIO_LAYOUTS.filter(p => !unlockedPortfolios.includes(p));
    
    console.log(`[Referral] User ${userId} - Locked cards: ${lockedCards.length}, Locked portfolios: ${lockedPortfolios.length}`);
    
    // Grant 1 random Quantum Card (if any available)
    if (lockedCards.length > 0) {
      const randomCard = lockedCards[Math.floor(Math.random() * lockedCards.length)];
      await client.query(
        `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source, referral_conversion_id) 
         VALUES ($1, 'quantum_card', $2, 'referral', $3)`,
        [userId, randomCard, conversionId]
      );
      console.log(`[Referral] Unlocked Quantum Card: ${randomCard}`);
    } else {
      console.log(`[Referral] All Quantum Cards already unlocked for user ${userId}`);
    }
    
    // Grant 2 random Portfolios (if available)
    const portfoliosToGrant = Math.min(2, lockedPortfolios.length);
    
    for (let i = 0; i < portfoliosToGrant; i++) {
      // Re-calculate locked portfolios after each unlock to avoid duplicates
      const currentUnlocked = await client.query(
        `SELECT unlock_id FROM user_unlocks 
         WHERE user_id = $1 AND unlock_type = 'portfolio'`,
        [userId]
      );
      
      const currentUnlockedIds = currentUnlocked.rows.map((u: any) => u.unlock_id);
      const remainingLocked = PORTFOLIO_LAYOUTS.filter(p => !currentUnlockedIds.includes(p));
      
      if (remainingLocked.length > 0) {
        const randomPortfolio = remainingLocked[Math.floor(Math.random() * remainingLocked.length)];
        await client.query(
          `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source, referral_conversion_id) 
           VALUES ($1, 'portfolio', $2, 'referral', $3)`,
          [userId, randomPortfolio, conversionId]
        );
        console.log(`[Referral] Unlocked Portfolio: ${randomPortfolio}`);
      }
    }
  }
  
  /**
   * Initialize default unlocks for new users
   */
  async initializeDefaultUnlocks(userId: number): Promise<void> {
    const client = await pool.connect();
    
    try {
      // Check if user already has initial unlocks
      const existing = await client.query(
        `SELECT COUNT(*) as count FROM user_unlocks WHERE user_id = $1`,
        [userId]
      );
      
      if (parseInt(existing.rows[0].count) > 0) {
        return; // Already initialized
      }
      
      // Grant initial Quantum Cards
      for (const card of INITIAL_QUANTUM_CARDS) {
        await client.query(
          `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source) 
           VALUES ($1, 'quantum_card', $2, 'initial')`,
          [userId, card]
        );
      }
      
      // Grant initial Portfolios
      for (const portfolio of INITIAL_PORTFOLIOS) {
        await client.query(
          `INSERT INTO user_unlocks (user_id, unlock_type, unlock_id, unlock_source) 
           VALUES ($1, 'portfolio', $2, 'initial')`,
          [userId, portfolio]
        );
      }
      
      console.log(`[Referral] Initialized default unlocks for user ${userId}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Validate if a referral code exists and is valid
   */
  async validateReferralCode(code: string): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id FROM referral_links WHERE unique_code = $1`,
        [code]
      );
      
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get user's unlocked items (both from referrals AND created by user)
   */
  async getUserUnlocks(userId: number): Promise<{
    quantumCards: string[];
    portfolios: string[];
    totalReferrals: number;
  }> {
    const client = await pool.connect();
    
    try {
      // Get unlocks from user_unlocks table
      const unlocksResult = await client.query(
        `SELECT unlock_type, unlock_id FROM user_unlocks WHERE user_id = $1`,
        [userId]
      );
      
      const quantumCards = unlocksResult.rows
        .filter((u: any) => u.unlock_type === 'quantum_card')
        .map((u: any) => u.unlock_id);
      
      const portfolios = unlocksResult.rows
        .filter((u: any) => u.unlock_type === 'portfolio')
        .map((u: any) => u.unlock_id);
      
      // Also add the card the user has created/selected
      const userResult = await client.query(
        `SELECT visiting_card_type, selected_portfolio_layout FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (user.visiting_card_type && !quantumCards.includes(user.visiting_card_type)) {
          quantumCards.push(user.visiting_card_type);
        }
        if (user.selected_portfolio_layout && !portfolios.includes(user.selected_portfolio_layout)) {
          portfolios.push(user.selected_portfolio_layout);
        }
      }
      
      // Also add portfolios created by user
      const portfoliosResult = await client.query(
        `SELECT DISTINCT layout FROM portfolios WHERE user_id = $1 AND layout IS NOT NULL`,
        [userId]
      );
      
      for (const row of portfoliosResult.rows) {
        if (row.layout && !portfolios.includes(row.layout)) {
          portfolios.push(row.layout);
        }
      }
      
      // Get total referrals
      const referralsResult = await client.query(
        `SELECT COUNT(*) as count FROM referral_conversions 
         WHERE referrer_user_id = $1`,
        [userId]
      );
      
      const totalReferrals = parseInt(referralsResult.rows[0].count);
      
      return {
        quantumCards,
        portfolios,
        totalReferrals
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Get all available and locked items for a user
   * @param userId - The user ID
   * @param subscriptionTier - The user's subscription tier ('free' or 'premium')
   */
  async getAvailabilityStatus(userId: number, subscriptionTier: string = 'free'): Promise<{
    quantumCards: { id: string; name: string; locked: boolean }[];
    portfolios: { id: string; name: string; locked: boolean }[];
    progress: {
      totalReferrals: number;
      unlockedCards: number;
      totalCards: number;
      unlockedPortfolios: number;
      totalPortfolios: number;
    };
  }> {
    const unlocks = await this.getUserUnlocks(userId);
    const isPremium = subscriptionTier === 'premium';
    
    console.log(`[DEBUG] getAvailabilityStatus - userId: ${userId}, subscriptionTier: ${subscriptionTier}, isPremium: ${isPremium}, totalReferrals: ${unlocks.totalReferrals}`);
    
    // Calculate unlocked items using referral formula: floor(totalReferrals * (total / 6))
    // This ensures scalability: as items are added, the unlock rate scales proportionally
    // Examples: 
    // - 12 cards / 6 = 2 cards per referral (1 ref = 2, 2 refs = 4, 6 refs = 12)
    // - 23 portfolios / 6 = 3.83 per referral (1 ref = 3, 2 refs = 7, 6 refs = 23)
    const cardsPerReferral = QUANTUM_CARDS.length / 6;
    const portfoliosPerReferral = PORTFOLIO_LAYOUTS.length / 6;
    
    const unlockedCardsCount = isPremium 
      ? QUANTUM_CARDS.length 
      : Math.floor(unlocks.totalReferrals * cardsPerReferral);
    
    const unlockedPortfoliosCount = isPremium 
      ? PORTFOLIO_LAYOUTS.length 
      : Math.floor(unlocks.totalReferrals * portfoliosPerReferral);
    
    console.log(`[DEBUG] Calculations - cardsPerReferral: ${cardsPerReferral}, portfoliosPerReferral: ${portfoliosPerReferral}, unlockedCardsCount: ${unlockedCardsCount}, unlockedPortfoliosCount: ${unlockedPortfoliosCount}`);
    
    // Map IDs to display names
    const cardNames: Record<string, string> = {
      'professional': 'Professional',
      'quantum': 'Quantum Tech',
      '3d-animated': '3D Animated',
      'holographic': 'Holographic Glass',
      'neoglow': 'NeoGlow',
      'creative': 'Creative',
      'artistic': 'Artistic'
    };
    
    const portfolioNames: Record<string, string> = {
      'corporate-executive': 'Corporate Executive',
      'scholar': 'Scholar',
      'timeline-storyteller-2': 'Timeline Storyteller',
      'visual-expert': 'Visual Expert',
      'dynamic-innovator': 'Dynamic Innovator',
      'freelancer-hub': 'Freelancer Hub',
      'animated': 'Animated',
      'designer-portfolio': 'Designer Showcase',
      'photographer-portfolio': 'Photographer Portfolio',
      'pastel-dreamscape': 'Pastel Dreamscape',
      'nature-creative': 'Nature Creative',
      'fashion-runway': 'Fashion Runway',
      'yoga-fitness-model': 'Yoga & Fitness Model'
    };
    
    // For premium users: all items are unlocked (not locked)
    // For free users: determine lock status based on calculated unlock threshold
    const quantumCards = QUANTUM_CARDS.map((id, index) => ({
      id,
      name: cardNames[id] || id,
      locked: isPremium ? false : index >= unlockedCardsCount
    }));
    
    const portfolios = PORTFOLIO_LAYOUTS.map((id, index) => ({
      id,
      name: portfolioNames[id] || id,
      locked: isPremium ? false : index >= unlockedPortfoliosCount
    }));
    
    return {
      quantumCards,
      portfolios,
      progress: {
        totalReferrals: unlocks.totalReferrals,
        unlockedCards: unlockedCardsCount,
        totalCards: QUANTUM_CARDS.length,
        unlockedPortfolios: unlockedPortfoliosCount,
        totalPortfolios: PORTFOLIO_LAYOUTS.length
      }
    };
  }
}

export const referralService = new ReferralService();
